import Anthropic from "@anthropic-ai/sdk";
import type { Provider, ProviderResult, RawCitation } from "../types";

export class ClaudeProvider implements Provider {
  readonly name = "claude";
  readonly model = "claude-opus-4-8";

  private client: Anthropic;

  constructor() {
    this.client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }

  async run(prompt: string): Promise<ProviderResult> {
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
      tools: [{ type: "web_search_20250305" as const, name: "web_search" }],
    });

    let answer_text = "";
    const citationMap = new Map<string, RawCitation>();

    for (const block of response.content) {
      if (block.type === "text") {
        answer_text += block.text;

        // Extract citations from text blocks
        const textBlock = block as {
          type: "text";
          text: string;
          citations?: Array<{
            type: string;
            url?: string;
            title?: string;
          }>;
        };
        if (textBlock.citations) {
          for (const c of textBlock.citations) {
            if (c.url && !citationMap.has(c.url)) {
              citationMap.set(c.url, { url: c.url, title: c.title });
            }
          }
        }
      }
    }

    // Also pull URLs from web_search_tool_result blocks for completeness
    for (const block of response.content) {
      if (block.type === "web_search_tool_result") {
        const resultBlock = block as {
          type: "web_search_tool_result";
          content: Array<{ type: string; url?: string; title?: string }>;
        };
        if (Array.isArray(resultBlock.content)) {
          for (const r of resultBlock.content) {
            if (r.url && !citationMap.has(r.url)) {
              citationMap.set(r.url, { url: r.url, title: r.title });
            }
          }
        }
      }
    }

    return {
      answer_text: answer_text.trim(),
      model: response.model,
      citations: Array.from(citationMap.values()),
    };
  }
}
