import type {
  AgentAction,
  AssetPassport,
  DemoState,
  MatchDecision,
  RecallRecord,
  RemedyContract,
  TimelineEvent,
  WorkflowStatus,
} from "./types";

export type WorkflowCommand =
  | { type: "HYDRATE"; state: DemoState }
  | { type: "IMPORT_ASSET"; asset: AssetPassport }
  | { type: "CONFIRM_RECALL"; recall: RecallRecord; match: MatchDecision }
  | { type: "START_REMEDY" }
  | { type: "RECORD_EVIDENCE"; filename: string }
  | { type: "SUBMIT_SANDBOX" }
  | { type: "CONFIRM_PROVIDER"; confirmation: string }
  | { type: "VERIFY_COMPLETION" }
  | { type: "RESET" };

const now = () => new Date().toISOString();
const event = (
  status: WorkflowStatus,
  title: string,
  detail: string,
  actor: TimelineEvent["actor"],
  receipt?: string,
): TimelineEvent => ({
  id: `${status}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  at: now(),
  status,
  title,
  detail,
  actor,
  receipt,
});

export const stableIdempotencyKey = (contractId: string, action: string) => {
  const input = `${contractId}:${action}:v1`;
  let a = 2166136261;
  let b = 2246822519;
  for (let index = 0; index < input.length; index += 1) {
    const code = input.charCodeAt(index);
    a = Math.imul(a ^ code, 16777619);
    b = Math.imul(b ^ code, 3266489917);
  }
  return `${(a >>> 0).toString(16).padStart(8, "0")}${(b >>> 0).toString(16).padStart(8, "0")}${input.length.toString(16).padStart(8, "0")}`;
};

export function createRemedyContract(
  asset: AssetPassport,
  recall: RecallRecord,
  match: MatchDecision,
): RemedyContract {
  if (match.status !== "EXACT_MATCH") {
    throw new Error("Safety gate: only an EXACT_MATCH may create a remedy contract.");
  }
  return {
    id: `rc-${recall.recallNumber}-${asset.id}`,
    assetId: asset.id,
    authority: "US CPSC",
    recallNumber: recall.recallNumber,
    recallUrl: recall.url,
    hazard: recall.hazards[0] ?? "See official recall record",
    officialAction: recall.remedies[0] ?? "See official recall record",
    remedy: "FULL_REFUND",
    provider: "Guang Zhou",
    requiredEvidence: ["Exact product identity", "Contact details", "Photo of disabled product"],
    completionCondition: "Provider refund approval received and physical-action evidence recorded",
    agentAuthority: "SANDBOX_ROUTINE_REMEDY_ONLY",
    matchStatus: "EXACT_MATCH",
    createdAt: now(),
  };
}

export function workflowReducer(state: DemoState, command: WorkflowCommand): DemoState {
  switch (command.type) {
    case "HYDRATE":
      return command.state;
    case "RESET":
      return {
        asset: null,
        recall: null,
        match: null,
        contract: null,
        status: "PROTECTED",
        timeline: [],
        actions: [],
        evidenceFile: null,
        providerConfirmation: null,
      };
    case "IMPORT_ASSET":
      if (state.asset) return state;
      return {
        ...state,
        asset: command.asset,
        timeline: [
          ...state.timeline,
          event("PROTECTED", "New product protected", "Asset Passport created from a synthetic receipt.", "SYSTEM"),
        ],
      };
    case "CONFIRM_RECALL": {
      if (!state.asset) throw new Error("Import an asset before checking recalls.");
      if (command.match.status !== "EXACT_MATCH") {
        return {
          ...state,
          recall: command.recall,
          match: command.match,
          status: "PROTECTED",
          timeline: [
            ...state.timeline,
            event("PROTECTED", "Remedy blocked", command.match.explanation, "SYSTEM"),
          ],
        };
      }
      const contract = createRemedyContract(state.asset, command.recall, command.match);
      return {
        ...state,
        recall: command.recall,
        match: command.match,
        contract,
        status: "RECALL_CONFIRMED",
        timeline: [
          ...state.timeline,
          event("RECALL_CONFIRMED", "Recall confirmed", `CPSC #${command.recall.recallNumber}; all deterministic predicates passed.`, "SYSTEM"),
        ],
      };
    }
    case "START_REMEDY": {
      if (state.status !== "RECALL_CONFIRMED" || !state.contract) {
        throw new Error("Safety gate: a confirmed Remedy Contract is required.");
      }
      const actions: AgentAction[] = [
        { id: "inspect", tool: "inspect_remedy_contract", title: "Contract inspected", detail: "Authority, exact match, remedy, and allowed action verified.", status: "COMPLETE", boundary: "DETERMINISTIC" },
        { id: "prepare", tool: "prepare_sandbox_claim", title: "Refund request prepared", detail: "Contact and product fields assembled for the controlled provider sandbox.", status: "COMPLETE", boundary: "STRANDS" },
        { id: "human", tool: "request_physical_evidence", title: "Physical evidence required", detail: "A human must safely disable the unplugged product and provide a photo.", status: "BLOCKED", boundary: "HUMAN" },
      ];
      return {
        ...state,
        status: "NEEDS_HUMAN",
        actions,
        timeline: [
          ...state.timeline,
          event("REMEDIATING", "Remedy agent started", "Strands received an immutable verified contract and prepared the sandbox workflow.", "STRANDS_AGENT"),
          event("NEEDS_HUMAN", "One physical action required", "Upload synthetic demonstration evidence after the physical safety step.", "STRANDS_AGENT"),
        ],
      };
    }
    case "RECORD_EVIDENCE":
      if (state.status !== "NEEDS_HUMAN" || !command.filename.trim()) {
        throw new Error("Evidence is accepted only at the physical-action gate.");
      }
      return {
        ...state,
        evidenceFile: command.filename,
        status: "REMEDIATING",
        actions: state.actions.map((action) =>
          action.id === "human" ? { ...action, status: "COMPLETE", detail: `Synthetic evidence recorded: ${command.filename}` } : action,
        ),
        timeline: [
          ...state.timeline,
          event("REMEDIATING", "Physical evidence recorded", `Synthetic demo file ${command.filename} passed local validation.`, "HUMAN"),
        ],
      };
    case "SUBMIT_SANDBOX": {
      if (state.status !== "REMEDIATING" || !state.contract || !state.evidenceFile) {
        throw new Error("Sandbox submission requires a contract and physical evidence.");
      }
      const receipt = `RZ-${stableIdempotencyKey(state.contract.id, "submit").slice(0, 10).toUpperCase()}`;
      const existing = state.timeline.find((item) => item.receipt === receipt);
      if (existing) return state;
      return {
        ...state,
        status: "AWAITING_PROVIDER",
        actions: [
          ...state.actions,
          { id: "submit", tool: "submit_sandbox_claim", title: "Sandbox request submitted", detail: `Controlled environment receipt ${receipt}. No real manufacturer contacted.`, status: "COMPLETE", boundary: "SANDBOX" },
        ],
        timeline: [
          ...state.timeline,
          event("AWAITING_PROVIDER", "Refund request submitted", "Controlled manufacturer sandbox accepted the idempotent request.", "SANDBOX_PROVIDER", receipt),
        ],
      };
    }
    case "CONFIRM_PROVIDER":
      if (state.status !== "AWAITING_PROVIDER" || !command.confirmation.trim()) {
        throw new Error("A provider outcome may only follow a sandbox submission.");
      }
      return {
        ...state,
        providerConfirmation: command.confirmation,
        actions: [
          ...state.actions,
          { id: "outcome", tool: "check_sandbox_outcome", title: "Refund approved", detail: `Sandbox confirmation ${command.confirmation}.`, status: "COMPLETE", boundary: "SANDBOX" },
        ],
        timeline: [
          ...state.timeline,
          event("AWAITING_PROVIDER", "Provider approved refund", "Approval is recorded; completion verifier is running.", "SANDBOX_PROVIDER", command.confirmation),
        ],
      };
    case "VERIFY_COMPLETION":
      if (state.status !== "AWAITING_PROVIDER" || !state.providerConfirmation || !state.evidenceFile) {
        throw new Error("Completion requires both physical evidence and provider confirmation.");
      }
      return {
        ...state,
        status: "REMEDIATED",
        timeline: [
          ...state.timeline,
          event("REMEDIATED", "Recall remediated", "Evidence and provider approval satisfy the Remedy Contract.", "SYSTEM"),
        ],
      };
  }
}
