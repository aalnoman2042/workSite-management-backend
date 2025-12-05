import httpStatus from "http-status";
import ApiError from "../../Error/apiError";
import { prisma } from "../../shared/prisma";
import { extractJsonFromMessage } from "../../middlewares/extractJSONfromMessage";
import { openai } from "../../helper/open-router";
import { SiteStatus } from "@prisma/client";


export const getAISuggestions = async (payload: { query: string }) => {
  if (!payload || !payload.query) {
    throw new ApiError(httpStatus.BAD_REQUEST, "query is required");
  }

  // Fetch workers + sites + skills etc.
  const workers = await prisma.worker.findMany({
    where: { isDeleted: false },
    include: {
    //   skills: true,
    //   site: true,
    },
  });

const sites = await prisma.site.findMany({
  where: {
    status: { in: [SiteStatus.ACTIVE, SiteStatus.UNDER_MAINTENANCE , SiteStatus.INACTIVE] },
  },
});
  const attendance = await prisma.attendance.findMany({
    include: {
      worker: true,
      site: true,
    },
  });

  // AI prompt
  const prompt = `
You are an AI Assistant for a WorkSite Management System.

Your job:
- Understand the user's query about workers, sites, attendance, or skills.
- Match the query with the provided worker & site data.
- Respond ONLY based on the actual database information.
- If no match found → return { "noMatch": true }
- If relevant → return workers or sites list.
- Use STRICT matching (do NOT guess or hallucinate).

Important:
1. Use worker.skills.name, worker.role, worker.site.name to match.
2. If query is about a skill (e.g. "plumber"), show worker who has that skill.
3. If query is about a site, show workers assigned to that site.
4. Always return pure JSON response (no explanation text).

Here is database data:

WORKERS:
${JSON.stringify(workers, null, 2)}

SITES:
${JSON.stringify(sites, null, 2)}
ATTENDANCE:
${JSON.stringify(attendance, null, 2)}

USER QUERY:
${payload.query}
`;

  console.log("\nAI analyzing your query...\n");

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

  const result = await extractJsonFromMessage(
    completion.choices[0].message
  );

  return result;
};


