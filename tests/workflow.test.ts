import { describe, expect, it } from "vitest";
import { DEMO_ASSET, INITIAL_DEMO_STATE, XR8801_RECALL_SNAPSHOT } from "@/lib/domain/fixtures";
import { matchAssetToRecall } from "@/lib/domain/match";
import { createRemedyContract, stableIdempotencyKey, workflowReducer } from "@/lib/domain/workflow";

describe("governed remedy workflow", () => {
  const exact = matchAssetToRecall(DEMO_ASSET, XR8801_RECALL_SNAPSHOT);

  it("blocks contract creation for a non-exact match", () => {
    expect(() => createRemedyContract(DEMO_ASSET, XR8801_RECALL_SNAPSHOT, { ...exact, status: "POSSIBLE_MATCH" })).toThrow(/Safety gate/);
  });

  it("cannot self-declare completion", () => {
    expect(() => workflowReducer(INITIAL_DEMO_STATE, { type: "VERIFY_COMPLETION" })).toThrow(/requires both/);
  });

  it("finishes only after evidence and provider confirmation", () => {
    let state = workflowReducer(INITIAL_DEMO_STATE, { type: "IMPORT_ASSET", asset: DEMO_ASSET });
    state = workflowReducer(state, { type: "CONFIRM_RECALL", recall: XR8801_RECALL_SNAPSHOT, match: exact });
    state = workflowReducer(state, { type: "START_REMEDY" });
    expect(state.status).toBe("NEEDS_HUMAN");
    state = workflowReducer(state, { type: "RECORD_EVIDENCE", filename: "synthetic-cut-cord.jpg" });
    state = workflowReducer(state, { type: "SUBMIT_SANDBOX" });
    expect(state.status).toBe("AWAITING_PROVIDER");
    state = workflowReducer(state, { type: "CONFIRM_PROVIDER", confirmation: "SANDBOX-APPROVED-26754" });
    state = workflowReducer(state, { type: "VERIFY_COMPLETION" });
    expect(state.status).toBe("REMEDIATED");
    expect(state.timeline.at(-1)?.title).toBe("Recall remediated");
  });

  it("generates stable idempotency keys", () => {
    expect(stableIdempotencyKey("contract", "submit")).toBe(stableIdempotencyKey("contract", "submit"));
    expect(stableIdempotencyKey("contract", "submit")).not.toBe(stableIdempotencyKey("contract", "check"));
  });
});

