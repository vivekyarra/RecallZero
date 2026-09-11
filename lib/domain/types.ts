export type MatchStatus = "NO_MATCH" | "POSSIBLE_MATCH" | "EXACT_MATCH";
export type WorkflowStatus =
  | "PROTECTED"
  | "RECALL_CONFIRMED"
  | "REMEDIATING"
  | "NEEDS_HUMAN"
  | "AWAITING_PROVIDER"
  | "REMEDIATED";

export type SourceMode = "LIVE_CPSC" | "OFFICIAL_SNAPSHOT";

export interface AssetPassport {
  id: string;
  productName: string;
  brand: string;
  model: string;
  retailer: string;
  purchasedAt: string;
  evidence: { kind: "SYNTHETIC_RECEIPT" | "MANUAL"; label: string };
  status: WorkflowStatus;
}

export interface RecallRecord {
  recallId: number;
  recallNumber: string;
  recallDate: string;
  title: string;
  description: string;
  url: string;
  productNames: string[];
  models: string[];
  retailers: string[];
  hazards: string[];
  remedies: string[];
  consumerContact: string;
  sourceMode: SourceMode;
  fetchedAt: string;
}

export interface MatchEvidence {
  field: "product" | "model" | "retailer" | "purchase_window";
  label: string;
  required: boolean;
  matched: boolean;
  assetValue: string;
  recallValue: string;
}

export interface MatchDecision {
  status: MatchStatus;
  confidence: number;
  evidence: MatchEvidence[];
  policyVersion: "recallzero-match-v1";
  explanation: string;
}

export interface RemedyContract {
  id: string;
  assetId: string;
  authority: "US CPSC";
  recallNumber: string;
  recallUrl: string;
  hazard: string;
  officialAction: string;
  remedy: "FULL_REFUND";
  provider: "Guang Zhou";
  requiredEvidence: string[];
  completionCondition: string;
  agentAuthority: "SANDBOX_ROUTINE_REMEDY_ONLY";
  matchStatus: "EXACT_MATCH";
  createdAt: string;
}

export interface TimelineEvent {
  id: string;
  at: string;
  status: WorkflowStatus;
  title: string;
  detail: string;
  actor: "SYSTEM" | "STRANDS_AGENT" | "HUMAN" | "SANDBOX_PROVIDER";
  receipt?: string;
}

export interface AgentAction {
  id: string;
  tool:
    | "inspect_remedy_contract"
    | "prepare_sandbox_claim"
    | "request_physical_evidence"
    | "submit_sandbox_claim"
    | "check_sandbox_outcome";
  title: string;
  detail: string;
  status: "COMPLETE" | "BLOCKED" | "READY";
  boundary: "DETERMINISTIC" | "STRANDS" | "HUMAN" | "SANDBOX";
}

export interface DemoState {
  asset: AssetPassport | null;
  recall: RecallRecord | null;
  match: MatchDecision | null;
  contract: RemedyContract | null;
  status: WorkflowStatus;
  timeline: TimelineEvent[];
  actions: AgentAction[];
  evidenceFile: string | null;
  providerConfirmation: string | null;
}

