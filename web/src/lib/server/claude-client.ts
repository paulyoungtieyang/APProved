import "server-only";
import Anthropic from "@anthropic-ai/sdk";

export function getClaudeClient(apiKey?: string): Anthropic {
  const key = apiKey?.trim() || process.env.ANTHROPIC_API_KEY;
  if (!key) {
    throw new Error(
      "Claude API key is not configured — set ANTHROPIC_API_KEY on the server or add a key in Settings"
    );
  }
  return new Anthropic({ apiKey: key });
}
