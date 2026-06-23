import type {
  DbEntity,
  NormalisedCitation,
  NormalisedMention,
  NormalisedResponse,
  ProviderResult,
} from "./types";

function extractRootDomain(rawUrl: string): string {
  try {
    const url = new URL(rawUrl);
    const parts = url.hostname.replace(/^www\./, "").split(".");
    // Keep last two segments (handles .com.au, .net.au, etc. via simple slice)
    // For Australian ccTLDs like .com.au we want the last 3 parts: domain.com.au
    if (parts.length >= 3 && parts[parts.length - 2].length <= 3) {
      return parts.slice(-3).join(".");
    }
    return parts.slice(-2).join(".");
  } catch {
    return rawUrl;
  }
}

function resolveEntity(
  domain: string,
  entities: DbEntity[]
): DbEntity | undefined {
  return entities.find((e) => e.domain === domain);
}

function buildWordBoundaryRegex(variant: string): RegExp {
  // Escape regex special chars, then wrap in word boundaries
  const escaped = variant.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?<![\\w.-])${escaped}(?![\\w.-])`, "gi");
}

function isMentionLinked(text: string, mention: string, domain: string): boolean {
  // Check if the mention appears inside a markdown link pointing to the entity's domain
  // Pattern: [text containing mention](url containing domain)
  const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
  let match;
  while ((match = linkPattern.exec(text)) !== null) {
    const linkText = match[1];
    const linkUrl = match[2];
    if (
      linkText.toLowerCase().includes(mention.toLowerCase()) &&
      linkUrl.includes(domain)
    ) {
      return true;
    }
  }
  return false;
}

export function normalise(
  result: ProviderResult,
  entities: DbEntity[]
): NormalisedResponse {
  // --- Citations ---
  const normalisedCitations: NormalisedCitation[] = result.citations.map(
    (raw, index) => {
      const domain = extractRootDomain(raw.url);
      const entity = resolveEntity(domain, entities);
      return {
        entity_id: entity?.id ?? null,
        url: raw.url,
        domain,
        position: index + 1,
        in_body: false, // set below after we know cited domains
      };
    }
  );

  const citedDomains = new Set(normalisedCitations.map((c) => c.domain));
  const citedEntityIds = new Set(
    normalisedCitations
      .filter((c) => c.entity_id !== null)
      .map((c) => c.entity_id as string)
  );

  // Set in_body: true when the cited domain also appears in the prose
  for (const citation of normalisedCitations) {
    // Check if the domain appears as text or as part of a URL in the answer prose
    citation.in_body =
      result.answer_text.toLowerCase().includes(citation.domain.toLowerCase());
  }

  // --- Entity mentions (prose detection) ---
  const normalisedMentions: NormalisedMention[] = [];

  for (const entity of entities) {
    let found = false;
    let linked = false;
    let matchedVariant = "";

    for (const variant of entity.brand_variants) {
      const regex = buildWordBoundaryRegex(variant);
      if (regex.test(result.answer_text)) {
        found = true;
        matchedVariant = variant;

        if (!linked) {
          linked = isMentionLinked(result.answer_text, variant, entity.domain);
        }
      }
    }

    if (found) {
      normalisedMentions.push({
        entity_id: entity.id,
        linked,
        cited_separately: citedEntityIds.has(entity.id),
      });
    }
  }

  return { citations: normalisedCitations, mentions: normalisedMentions };
}
