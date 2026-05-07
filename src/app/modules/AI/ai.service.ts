import httpStatus from "http-status";
import ApiError from "../../Error/apiError";
import { prisma } from "../../shared/prisma";
import { openai } from "../../helper/open-router";


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

  const completion = await openai.chat.completions.create({
    model: "z-ai/glm-4.5-air:free",
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

  return completion.choices[0].message.content || "";
};