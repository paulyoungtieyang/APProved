import { NextResponse } from "next/server";
import { getClaudeClient } from "@/lib/server/claude-client";
import { DOSSIER_SECTIONS } from "@/lib/mock-data/dossier-options";

export const runtime = "nodejs";

interface GenerateDossierRequest {
  therapeuticArea: string;
  market: string;
  language: string;
  tenderType: string;
  sectionIds: string[];
}

export async function POST(request: Request) {
  let body: GenerateDossierRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { therapeuticArea, market, language, tenderType, sectionIds } = body;
  if (!therapeuticArea || !market || !language || !tenderType || !sectionIds?.length) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const sections = DOSSIER_SECTIONS.filter((s) => sectionIds.includes(s.id));
  if (sections.length === 0) {
    return NextResponse.json({ error: "No valid sections selected" }, { status: 400 });
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

  const sectionList = sections.map((s) => `- ${s.label}: ${s.description}`).join("\n");

  const userPrompt = `Draft a Global Value Dossier for a medical device / pharmaceutical product with the following configuration:

- Therapeutic area: ${therapeuticArea}
- Target market: ${market}
- Language: ${language}
- Tender type: ${tenderType}

Include exactly these sections, in this order, each as a markdown "## " heading:
${sectionList}

Write realistic, plausible draft content for each section — the kind of narrative and data a market access team would expect in an early draft, using representative (clearly illustrative, not fabricated as if real) figures and claims. Keep each section to 2-4 short paragraphs or a mix of paragraphs and bullet points. Do not include any content outside the requested sections.`;

  try {
    const response = await client.messages.create({
      model: "claude-opus-5",
      max_tokens: 8000,
      output_config: { effort: "medium" },
      system:
        "You are a market access and value-communications specialist drafting an early-stage Global Value Dossier. Output valid markdown only, no preamble or closing remarks.",
      messages: [{ role: "user", content: userPrompt }],
    });

    const text = response.content.find((b) => b.type === "text")?.text ?? "";
    return NextResponse.json({ markdown: text });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
