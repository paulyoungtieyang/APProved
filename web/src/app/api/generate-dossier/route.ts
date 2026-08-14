import { NextResponse } from "next/server";
import { getClaudeClient } from "@/lib/server/claude-client";
import { getOpenAiClient } from "@/lib/server/openai-client";
import { DOSSIER_SECTIONS } from "@/lib/mock-data/dossier-options";

export const runtime = "nodejs";

interface GenerateDossierRequest {
  therapeuticArea: string;
  market: string;
  language: string;
  tenderType: string;
  sectionIds: string[];
  provider?: "claude" | "openai";
  apiKey?: string;
  promptRules?: string;
}

export async function POST(request: Request) {
  let body: GenerateDossierRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const {
    therapeuticArea,
    market,
    language,
    tenderType,
    sectionIds,
    provider = "claude",
    apiKey,
    promptRules,
  } = body;
  if (!therapeuticArea || !market || !language || !tenderType || !sectionIds?.length) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const sections = DOSSIER_SECTIONS.filter((s) => sectionIds.includes(s.id));
  if (sections.length === 0) {
    return NextResponse.json({ error: "No valid sections selected" }, { status: 400 });
  }

  const sectionList = sections.map((s) => `- ${s.label}: ${s.description}`).join("\n");

  const systemPrompt =
    "You are a market access and value-communications specialist drafting an early-stage Global Value Dossier. Output valid markdown only, no preamble or closing remarks." +
    (promptRules?.trim()
      ? `\n\nAdditional rules from the regulatory/medical affairs team — follow these strictly:\n${promptRules.trim()}`
      : "");

  const userPrompt = `Draft a Global Value Dossier for a medical device / pharmaceutical product with the following configuration:

- Therapeutic area: ${therapeuticArea}
- Target market: ${market}
- Language: ${language}
- Tender type: ${tenderType}

Include exactly these sections, in this order, each as a markdown "## " heading:
${sectionList}

Write realistic, plausible draft content for each section — the kind of narrative and data a market access team would expect in an early draft, using representative (clearly illustrative, not fabricated as if real) figures and claims. Keep each section to 2-4 short paragraphs or a mix of paragraphs and bullet points. Do not include any content outside the requested sections.`;

  try {
    const markdown =
      provider === "openai"
        ? await generateWithOpenAi(systemPrompt, userPrompt, apiKey)
        : await generateWithClaude(systemPrompt, userPrompt, apiKey);
    return NextResponse.json({ markdown });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Generation failed";
    const status = message.includes("not configured") ? 503 : 502;
    return NextResponse.json({ error: message }, { status });
  }
}

async function generateWithClaude(system: string, user: string, apiKey?: string) {
  const client = getClaudeClient(apiKey);
  const response = await client.messages.create({
    model: "claude-opus-5",
    max_tokens: 8000,
    output_config: { effort: "medium" },
    system,
    messages: [{ role: "user", content: user }],
  });
  return response.content.find((b) => b.type === "text")?.text ?? "";
}

async function generateWithOpenAi(system: string, user: string, apiKey?: string) {
  const client = getOpenAiClient(apiKey);
  const response = await client.chat.completions.create({
    model: "gpt-4o",
    max_tokens: 4000,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  });
  return response.choices[0]?.message?.content ?? "";
}
