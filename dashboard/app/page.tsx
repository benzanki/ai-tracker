import { Suspense } from "react";
import { EntityTable } from "./components/EntityTable";
import { PortfolioView } from "./components/PortfolioView";
import { GapAnalysis } from "./components/GapAnalysis";
import { TypeShareView } from "./components/TypeShareView";
import { PageCitationsView } from "./components/PageCitationsView";
import { TrendCharts } from "./components/TrendCharts";
import { FiltersBar } from "./components/FiltersBar";
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
        <h2 className="section-title">Entity metrics</h2>
        <Suspense fallback={<p className="empty">Loading…</p>}>
          <EntityTable filters={filters} />
        </Suspense>
      </div>

      <div className="section">
        <h2 className="section-title">Portfolio coverage &amp; cannibalisation</h2>
        <Suspense fallback={<p className="empty">Loading…</p>}>
          <PortfolioView filters={filters} />
        </Suspense>
      </div>

      <div className="section">
        <h2 className="section-title">Gap analysis — competitor wins without owned representation</h2>
        <Suspense fallback={<p className="empty">Loading…</p>}>
          <GapAnalysis filters={filters} />
        </Suspense>
      </div>

      <div className="section">
        <h2 className="section-title">Page-level citation rates (owned sites)</h2>
        <Suspense fallback={<p className="empty">Loading…</p>}>
          <PageCitationsView filters={filters} />
        </Suspense>
      </div>

      <div className="section">
        <h2 className="section-title">Lender vs aggregator citation share over time</h2>
        <Suspense fallback={<p className="empty">Loading…</p>}>
          <TypeShareView filters={filters} />
        </Suspense>
      </div>
    </>
  );
}
