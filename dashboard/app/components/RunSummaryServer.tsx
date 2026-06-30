import { getRecentRunSummaries } from "../lib/queries";
import { RunSummaryPanel } from "./RunSummaryPanel";

export async function RunSummaryServer() {
  const runs = await getRecentRunSummaries(5);
  return <RunSummaryPanel runs={runs as any[]} />;
}
