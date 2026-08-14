import { NextResponse } from "next/server";
import { getClaudeClient } from "@/lib/server/claude-client";
import { getOpenAiClient } from "@/lib/server/openai-client";
import { MATERIAL_TYPES } from "@/lib/mock-data/msl-materials";

export const runtime = "nodejs";

interface GenerateMaterialRequest {
  materialId: string;
  tone: string;
  audience: string;
  brandVoice: string;
  provider?: "claude" | "openai";
  apiKey?: string;
  promptRules?: string;
}

export async function POST(request: Request) {
  let body: GenerateMaterialRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { materialId, tone, audience, brandVoice, provider = "claude", apiKey, promptRules } = body;
  const material = MATERIAL_TYPES.find((m) => m.id === materialId);
  if (!material || !tone || !audience || !brandVoice) {
    return NextResponse.json({ error: "Missing or invalid required fields" }, { status: 400 });
  }

  const systemPrompt =
    "You are a medical affairs content specialist drafting field materials for Medical Science Liaisons. Output valid markdown only, no preamble or closing remarks." +
    (promptRules?.trim()
      ? `\n\nAdditional rules from the medical affairs / compliance team — follow these strictly:\n${promptRules.trim()}`
      : "");

  const userPrompt = `Draft a "${material.label}" (${material.description}) for a Medical Science Liaison to use in the field, about a medical device product.

- Tone: ${tone}
- Audience: ${audience}
- Brand voice: ${brandVoice}

Write realistic, plausible draft content in markdown appropriate for this material type — use section headings, and bullet points or Q&A pairs where that fits the format. Keep it focused and field-usable, not a full slide deck script — aim for the equivalent of one page of content. Do not include any content outside the material itself (no preamble, no closing remarks).`;

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
    max_tokens: 6000,
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
    max_tokens: 3000,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  });
  return response.choices[0]?.message?.content ?? "";
}
