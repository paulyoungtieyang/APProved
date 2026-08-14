import { NextResponse } from "next/server";
import { getClaudeClient } from "@/lib/server/claude-client";
import { MATERIAL_TYPES } from "@/lib/mock-data/msl-materials";

export const runtime = "nodejs";

interface GenerateMaterialRequest {
  materialId: string;
  tone: string;
  audience: string;
  brandVoice: string;
}

export async function POST(request: Request) {
  let body: GenerateMaterialRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { materialId, tone, audience, brandVoice } = body;
  const material = MATERIAL_TYPES.find((m) => m.id === materialId);
  if (!material || !tone || !audience || !brandVoice) {
    return NextResponse.json({ error: "Missing or invalid required fields" }, { status: 400 });
  }

  let client;
  try {
    client = getClaudeClient();
  } catch {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY is not configured on the server" },
      { status: 503 }
    );
  }

  const userPrompt = `Draft a "${material.label}" (${material.description}) for a Medical Science Liaison to use in the field, about a medical device product.

- Tone: ${tone}
- Audience: ${audience}
- Brand voice: ${brandVoice}

Write realistic, plausible draft content in markdown appropriate for this material type — use section headings, and bullet points or Q&A pairs where that fits the format. Keep it focused and field-usable, not a full slide deck script — aim for the equivalent of one page of content. Do not include any content outside the material itself (no preamble, no closing remarks).`;

  try {
    const response = await client.messages.create({
      model: "claude-opus-5",
      max_tokens: 6000,
      output_config: { effort: "medium" },
      system:
        "You are a medical affairs content specialist drafting field materials for Medical Science Liaisons. Output valid markdown only, no preamble or closing remarks.",
      messages: [{ role: "user", content: userPrompt }],
    });

    const text = response.content.find((b) => b.type === "text")?.text ?? "";
    return NextResponse.json({ markdown: text });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
