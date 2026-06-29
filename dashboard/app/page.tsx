import { Suspense } from "react";
import { EntityTableServer } from "./components/EntityTableServer";
import { PortfolioView } from "./components/PortfolioView";
import { GapAnalysis } from "./components/GapAnalysis";
import { PageCitationsView } from "./components/PageCitationsView";
import { TrendCharts } from "./components/TrendCharts";
import { FiltersBar } from "./components/FiltersBar";
import { InfoTooltip } from "./components/InfoTooltip";
import { UntrackedCitations } from "./components/UntrackedCitations";
import { ProviderShareServer } from "./components/ProviderShareServer";
import { Sidebar } from "./components/Sidebar";
import { getProviders, getVerticals, getEntities, getTags } from "./lib/queries";

interface SearchParams {
  provider?: string;
  vertical?: string;
  tag?: string;
  ownership?: string;
  type?: string;
  entityId?: string;
  dateFrom?: string;
  dateTo?: string;
  [key: string]: string | undefined;
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const [providers, verticals, entities, tags] = await Promise.all([
    getProviders(),
    getVerticals(),
    getEntities(),
    getTags(),
  ]);

  const filters = {
    provider: params.provider,
    vertical: params.vertical,
    tag: params.tag,
    ownership: params.ownership as "owned" | "competitor" | undefined,
    type: params.type as "lender" | "aggregator" | "other" | undefined,
    entityId: params.entityId,
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
  };

  return (
    <>
      <Suspense fallback={null}>
        <FiltersBar
          providers={providers as string[]}
          verticals={verticals as string[]}
          tags={tags as string[]}
          entities={entities as Array<{ id: string; label: string; ownership: string }>}
          current={params}
        />
      </Suspense>

      <div style={{ display: "flex", gap: "2rem", alignItems: "flex-start" }}>
        <Sidebar />

        <div style={{ flex: 1, minWidth: 0 }}>
          <Suspense fallback={<p className="empty">Loading charts…</p>}>
            <TrendCharts filters={filters} />
          </Suspense>

          <div className="section" id="provider-share">
            <h2 className="section-title">
              Citation share by LLM provider
              <InfoTooltip text="Of all citations for the selected entities or ownership group, what share came from each LLM provider on a given day. Switch between 'By ownership' to compare groups and 'By entity' to drill into specific sites." />
            </h2>
            <Suspense fallback={<p className="empty">Loading…</p>}>
              <ProviderShareServer filters={filters} />
            </Suspense>
          </div>

          <div className="section" id="entity-metrics">
            <h2 className="section-title">
              Entity metrics
            </h2>
            <Suspense fallback={<p className="empty">Loading…</p>}>
              <EntityTableServer filters={filters} />
            </Suspense>
          </div>

          <div className="section" id="portfolio">
            <h2 className="section-title">
              Portfolio coverage &amp; cannibalisation
              <InfoTooltip text="Coverage = % of prompts where at least one owned site appeared, either as a citation or named in the answer content. Cannibalisation = prompts where more than one owned site appeared, with the preferred site being whichever was cited at the lowest position." />
            </h2>
            <Suspense fallback={<p className="empty">Loading…</p>}>
              <PortfolioView filters={filters} />
            </Suspense>
          </div>

          <div className="section" id="gap-analysis">
            <h2 className="section-title">
              Gap analysis
              <InfoTooltip text="Prompts where a competitor was cited but no owned site appeared — neither as a citation nor in the answer content. Ranked by how frequently the gap occurs across runs." />
            </h2>
            <Suspense fallback={<p className="empty">Loading…</p>}>
              <GapAnalysis filters={filters} />
            </Suspense>
          </div>

          <div className="section" id="page-citations">
            <h2 className="section-title">
              Page-level citation rates
              <InfoTooltip text="Which specific URLs on owned sites are being cited, and how often. Citation rate = % of prompts where that URL was linked as a source." />
            </h2>
            <Suspense fallback={<p className="empty">Loading…</p>}>
              <PageCitationsView filters={filters} />
            </Suspense>
          </div>

          <div className="section" id="untracked-domains">
            <h2 className="section-title">
              Untracked domains
              <InfoTooltip text="Domains Claude cited that are not in your entity watchlist. Use this to spot competitors or authoritative sources you may want to add for monitoring." />
            </h2>
            <Suspense fallback={<p className="empty">Loading…</p>}>
              <UntrackedCitations filters={filters} />
            </Suspense>
          </div>
        </div>
      </div>
    </>
  );
}
