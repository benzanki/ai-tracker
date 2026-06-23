import { createClient } from "@supabase/supabase-js";
import { ClaudeProvider } from "./providers/claude";
import { normalise } from "./normaliser";
import type { DbPrompt, DbEntity } from "./types";

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;

async function main() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  const provider = new ClaudeProvider();

  // Load all entities for normalisation
  const { data: entities, error: entitiesError } = await supabase
    .from("entities")
    .select("*");
  if (entitiesError) throw new Error(`Failed to load entities: ${entitiesError.message}`);

  // Load active prompts
  const { data: prompts, error: promptsError } = await supabase
    .from("prompts")
    .select("id, text, vertical, tags")
    .eq("active", true);
  if (promptsError) throw new Error(`Failed to load prompts: ${promptsError.message}`);

  if (!prompts || prompts.length === 0) {
    console.log("No active prompts found. Exiting.");
    return;
  }

  console.log(`Running ${prompts.length} prompts through ${provider.name}...`);

  // Create a run record
  const { data: run, error: runError } = await supabase
    .from("runs")
    .insert({ provider: provider.name, status: "running" })
    .select("id")
    .single();
  if (runError) throw new Error(`Failed to create run: ${runError.message}`);

  const runId = run.id;
  let failedCount = 0;

  for (const prompt of prompts as DbPrompt[]) {
    console.log(`  → [${prompt.vertical}] ${prompt.text.slice(0, 60)}...`);

    try {
      const result = await provider.run(prompt.text);
      const normalised = normalise(result, entities as DbEntity[]);

      // Write response
      const { data: response, error: responseError } = await supabase
        .from("responses")
        .insert({
          run_id: runId,
          prompt_id: prompt.id,
          provider: provider.name,
          model: result.model,
          answer_text: result.answer_text,
        })
        .select("id")
        .single();
      if (responseError) throw new Error(`Failed to write response: ${responseError.message}`);

      const responseId = response.id;

      // Write citations
      if (normalised.citations.length > 0) {
        const { error: citError } = await supabase.from("citations").insert(
          normalised.citations.map((c) => ({ ...c, response_id: responseId }))
        );
        if (citError) throw new Error(`Failed to write citations: ${citError.message}`);
      }

      // Write entity mentions
      if (normalised.mentions.length > 0) {
        const { error: mentionError } = await supabase
          .from("entity_mentions")
          .insert(
            normalised.mentions.map((m) => ({ ...m, response_id: responseId }))
          );
        if (mentionError) throw new Error(`Failed to write mentions: ${mentionError.message}`);
      }

      console.log(
        `     ✓ ${normalised.citations.length} citations, ${normalised.mentions.length} mentions`
      );
    } catch (err) {
      // Per-prompt errors must not kill the whole run
      failedCount++;
      console.error(`     ✗ Failed: ${(err as Error).message}`);
    }
  }

  const finalStatus = failedCount === prompts.length ? "failed" : "complete";
  await supabase
    .from("runs")
    .update({ status: finalStatus, finished_at: new Date().toISOString() })
    .eq("id", runId);

  console.log(
    `\nRun ${runId} ${finalStatus}. ${prompts.length - failedCount}/${prompts.length} prompts succeeded.`
  );
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
