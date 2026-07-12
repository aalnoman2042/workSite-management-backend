import httpStatus from "http-status";
import config from "../../../config";
import ApiError from "../../Error/apiError";
import { prisma } from "../../shared/prisma";
import { openai } from "../../helper/open-router";

// Tried in order. The assistant previously pinned a single free model (z-ai/glm-4.5-air:free)
// and went down silently when OpenRouter delisted it — free models also get rate-limited (429)
// regularly, so we fall through to the next one on any failure.
// Override without a redeploy by setting AI_MODELS to a comma-separated list.
const DEFAULT_AI_MODELS = [
  "openai/gpt-oss-20b:free", // fast, OpenAI open-weight, 131k context
  "openai/gpt-oss-120b:free", // same family, stronger but slower
  "nvidia/nemotron-3-super-120b-a12b:free", // different provider, 1M context
  "openrouter/free", // router over whatever free models exist — last resort
];

const getAIModels = (): string[] => {
  const configured = config.aiModels
    ?.split(",")
    .map((model) => model.trim())
    .filter(Boolean);

  return configured?.length ? configured : DEFAULT_AI_MODELS;
};

export const getAISuggestions = async (payload: { query: string }) => {
  if (!payload || !payload.query) {
    throw new ApiError(httpStatus.BAD_REQUEST, "query is required");
  }

  const workers = await prisma.worker.findMany({
    where: { isDeleted: false },
  });

  const siteEngineers = await prisma.sITE_Engineer.findMany({
    where: { isDeleted: false },
  });

  const chiefEngineers = await prisma.cHIEF_ENGINEER.findMany({
    where: { isDeleted: false },
  });

  const admins = await prisma.admin.findMany({
    where: { isDeleted: false },
  });

  const sites = await prisma.site.findMany();

  const attendance = await prisma.attendance.findMany({
    include: {
      worker: true,
      site: true,
    },
  });

  const prompt = `
You are an AI Assistant for a WorkSite Management System.

Answer the user's question conversationally based on the database data below.
- When listing workers, engineers, admins, or sites, be specific: include name, role/position, contact, status, etc.
- Use bullet points for lists.
- Use STRICT matching. Do NOT guess or hallucinate. Only use what is in the data.
- If nothing matches the question, say so politely.
- Reply in plain text. Do NOT wrap your answer in JSON or markdown code blocks.

Here is the database data:

WORKERS:
${JSON.stringify(workers, null, 2)}

SITE ENGINEERS:
${JSON.stringify(siteEngineers, null, 2)}

CHIEF ENGINEERS:
${JSON.stringify(chiefEngineers, null, 2)}

ADMINS:
${JSON.stringify(admins, null, 2)}

SITES:
${JSON.stringify(sites, null, 2)}

ATTENDANCE:
${JSON.stringify(attendance, null, 2)}

USER QUERY:
${payload.query}
`;

  const models = getAIModels();
  let lastError: unknown;

  for (const model of models) {
    try {
      const completion = await openai.chat.completions.create({
        model,
        messages: [
          {
            role: "system",
            content: "You are a helpful WorkSite AI assistant.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      const answer = completion.choices[0]?.message?.content;

      // A delisted model can still answer with an empty body rather than erroring,
      // which would surface as a blank reply — treat that as a failure and move on.
      if (answer) {
        return answer;
      }

      lastError = new Error(`${model} returned an empty response`);
    } catch (error) {
      lastError = error;
      console.error(`AI model ${model} failed, trying the next one:`, (error as Error).message);
    }
  }

  console.error("All AI models failed. Last error:", lastError);

  throw new ApiError(
    httpStatus.SERVICE_UNAVAILABLE,
    "The AI assistant is temporarily unavailable. Please try again shortly."
  );
};