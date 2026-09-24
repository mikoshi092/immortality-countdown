import type {
  Article,
  ArticleCopy,
  ContentType,
  CountdownImpact,
  LocalizedFacts,
} from "../../data/articles";
import type { EvidenceLevel } from "../../data/news";
import type { FieldId } from "../../lib/fields";

export type EditorialProviderName = "openai" | "mock";

export type EditorialPromptInput = {
  title: string;
  abstract?: string;
  sourceUrl: string;
  doi?: string;
  fieldId: FieldId;
  evidence: EvidenceLevel;
  studySubjects: string[];
  publishedAt: string;
  journal?: string;
  studyType?: string;
  phases?: string[];
  overallStatus?: string;
  hasResults?: boolean;
  studyFirstPostDate?: string;
  lastUpdatePostDate?: string;
  contentType: ContentType;
};

export type GeneratedCopy = {
  localizedFacts: LocalizedFacts;
  en: ArticleCopy;
  ja: ArticleCopy;
  countdownImpact: CountdownImpact;
};

export type EditorialDraft = Omit<Article, "featured"> & {
  candidateRecordId: string;
  relevanceScore?: number;
  significanceScore?: number;
};

export type RejectedDraft = {
  recordId: string;
  title: string;
  sourceUrl?: string;
  fieldId?: FieldId;
  evidence?: EvidenceLevel;
  reasons: string[];
  status: "rejected" | "held";
};

export type EditorialReport = {
  generatedAt: string;
  provider: EditorialProviderName;
  model?: string;
  inputPath: string;
  counts: {
    candidates: number;
    drafts: number;
    rejected: number;
    held: number;
  };
  drafts: EditorialDraft[];
  rejectedDrafts: RejectedDraft[];
};

export interface EditorialProvider {
  readonly name: EditorialProviderName;
  readonly model?: string;
  generate(input: EditorialPromptInput): Promise<GeneratedCopy>;
}
