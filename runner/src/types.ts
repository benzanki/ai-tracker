export interface RawCitation {
  url: string;
  title?: string;
}

export interface ProviderResult {
  answer_text: string;
  model: string;
  citations: RawCitation[];
}

export interface Provider {
  name: string;
  model: string;
  run(prompt: string): Promise<ProviderResult>;
}

// DB row shapes (minimal — only what the runner writes)
export interface DbPrompt {
  id: string;
  text: string;
  vertical: string;
  tags: string[];
}

export interface DbEntity {
  id: string;
  domain: string;
  brand_variants: string[];
  ownership: string;
  type: string;
  label: string;
}

export interface NormalisedCitation {
  entity_id: string | null;
  url: string;
  domain: string;
  position: number;
  in_body: boolean;
}

export interface NormalisedMention {
  entity_id: string;
  linked: boolean;
  cited_separately: boolean;
}

export interface NormalisedResponse {
  citations: NormalisedCitation[];
  mentions: NormalisedMention[];
}
