import { getRecentRunSummaries } from "../lib/queries";
import { RunSummaryPanel } from "./RunSummaryPanel";

export async function RunSummaryServer() {
  const days = await getRecentRunSummaries(5);
  return <RunSummaryPanel days={days as any[]} />;
}
