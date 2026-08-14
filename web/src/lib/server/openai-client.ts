import "server-only";
import OpenAI from "openai";

export function getOpenAiClient(apiKey?: string): OpenAI {
  const key = apiKey?.trim() || process.env.OPENAI_API_KEY;
  if (!key) {
    throw new Error(
      "OpenAI API key is not configured — set OPENAI_API_KEY on the server or add a key in Settings"
    );
  }
  return new OpenAI({ apiKey: key });
}
