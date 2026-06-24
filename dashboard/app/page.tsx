import { Suspense } from "react";
import { EntityTableServer } from "./components/EntityTableServer";
import { PortfolioView } from "./components/PortfolioView";
import { GapAnalysis } from "./components/GapAnalysis";
import { TypeShareView } from "./components/TypeShareView";
import { PageCitationsView } from "./components/PageCitationsView";
import { TrendCharts } from "./components/TrendCharts";
import { FiltersBar } from "./components/FiltersBar";
import { InfoTooltip } from "./components/InfoTooltip";
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
      <FiltersBar
        providers={providers as string[]}
        verticals={verticals as string[]}
        tags={tags as string[]}
        entities={entities as Array<{ id: string; label: string; ownership: string }>}
        current={params}
      />

      <Suspense fallback={<p className="empty">Loading charts…</p>}>
        <TrendCharts filters={filters} />
      </Suspense>

      <div className="section">
        <h2 className="section-title">
          Entity metrics
          <InfoTooltip text="Per-entity performance across all filtered responses. Citation rate = % of prompts where the entity was linked as a source. Mention rate = % where it was named in prose. Mentioned & cited = both (the strongest outcome). Share = entity's citations as a % of all tracked or all citations." />
        </h2>
        <Suspense fallback={<p className="empty">Loading…</p>}>
          <EntityTableServer filters={filters} />
        </Suspense>
      </div>

      <div className="section">
        <h2 className="section-title">
          Portfolio coverage &amp; cannibalisation
          <InfoTooltip text="Coverage = % of prompts where at least one owned site appeared (cited or mentioned). Cannibalisation = prompts where more than one owned site appeared at the same time, with the preferred site being the one cited at the lowest position number." />
        </h2>
        <Suspense fallback={<p className="empty">Loading…</p>}>
          <PortfolioView filters={filters} />
        </Suspense>
      </div>

      <div className="section">
        <h2 className="section-title">
          Gap analysis
          <InfoTooltip text="Prompts where a competitor was cited but no owned site appeared at all — either cited or mentioned. These are the highest-priority content and authority gaps. Ranked by how frequently the gap occurs across runs." />
        </h2>
        <Suspense fallback={<p className="empty">Loading…</p>}>
          <GapAnalysis filters={filters} />
        </Suspense>
      </div>

      <div className="section">
        <h2 className="section-title">
          Page-level citation rates
          <InfoTooltip text="Which specific URLs on owned sites are being cited, and how often. A high citation rate on a page means Claude consistently treats it as an authoritative source for the matching prompts. Low-cited pages may need content improvement or better internal linking." />
        </h2>
        <Suspense fallback={<p className="empty">Loading…</p>}>
          <PageCitationsView filters={filters} />
        </Suspense>
      </div>

      <div className="section">
        <h2 className="section-title">
          Lender vs aggregator citation share
          <InfoTooltip text="Of all citations Claude gives to tracked entities, what share goes to lenders vs aggregators vs other? A rising aggregator share means comparison sites are increasingly winning answer real-estate over direct lenders." />
        </h2>
        <Suspense fallback={<p className="empty">Loading…</p>}>
          <TypeShareView filters={filters} />
        </Suspense>
      </div>
    </>
  );
}
