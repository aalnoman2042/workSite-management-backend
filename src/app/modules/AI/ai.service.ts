import httpStatus from "http-status";
import ApiError from "../../Error/apiError";
import { prisma } from "../../shared/prisma";
import { extractJsonFromMessage } from "../../middlewares/extractJSONfromMessage";
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

Your job:
- Understand the user's query about workers, engineers, admins, sites, or attendance.
- Match the query with the provided database records.
- Respond ONLY based on the actual database information.
- If no match found, return { "noMatch": true }.
- If matches found, return one of: { "workers": [...] }, { "siteEngineers": [...] }, { "chiefEngineers": [...] }, { "admins": [...] }, { "sites": [...] }, or a combination of these keys.
- Use STRICT matching. Do NOT guess or hallucinate.

Matching rules:
1. Match by name, email, id, nidNumber, contactNumber, position, companyName, or any field present on the records.
2. If the query is about a worker by name or id, return the matching worker(s).
3. If the query is about an engineer (site engineer or chief engineer), search both lists and return matches.
4. If the query is about a site, return that site (and optionally workers connected via attendance).
5. Always return pure JSON. No explanation text. No markdown.

Here is database data:

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

  const result = await extractJsonFromMessage(
    completion.choices[0].message
  );

  return result;
};