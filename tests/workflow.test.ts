import { describe, expect, it } from "vitest";
import { DEMO_ASSET, INITIAL_DEMO_STATE, XR8801_RECALL_SNAPSHOT } from "@/lib/domain/fixtures";
import { matchAssetToRecall } from "@/lib/domain/match";
import {
  createRemedyContract,
  expectedSandboxProviderConfirmation,
  stableIdempotencyKey,
  workflowReducer,
} from "@/lib/domain/workflow";

describe("governed remedy workflow", () => {
  const exact = matchAssetToRecall(DEMO_ASSET, XR8801_RECALL_SNAPSHOT);

  const awaitingProviderState = () => {
    let state = workflowReducer(INITIAL_DEMO_STATE, { type: "IMPORT_ASSET", asset: DEMO_ASSET });
    state = workflowReducer(state, { type: "CONFIRM_RECALL", recall: XR8801_RECALL_SNAPSHOT, match: exact });
    state = workflowReducer(state, { type: "START_REMEDY" });
    state = workflowReducer(state, { type: "RECORD_EVIDENCE", filename: "synthetic-cut-cord.jpg" });
    return workflowReducer(state, { type: "SUBMIT_SANDBOX" });
  };

  it("blocks contract creation for a non-exact match", () => {
    expect(() => createRemedyContract(DEMO_ASSET, XR8801_RECALL_SNAPSHOT, { ...exact, status: "POSSIBLE_MATCH" })).toThrow(/Safety gate/);
  });

  it("cannot self-declare completion", () => {
    expect(() => workflowReducer(INITIAL_DEMO_STATE, { type: "VERIFY_COMPLETION" })).toThrow(/requires physical evidence/);
  });

  it("finishes only after evidence and the contract-bound provider confirmation", () => {
    let state = awaitingProviderState();
    expect(state.status).toBe("AWAITING_PROVIDER");
    const confirmation = expectedSandboxProviderConfirmation(state.contract!);
    state = workflowReducer(state, { type: "CONFIRM_PROVIDER", confirmation });
    state = workflowReducer(state, { type: "VERIFY_COMPLETION" });
    expect(state.status).toBe("REMEDIATED");
    expect(state.timeline.at(-1)?.title).toBe("Recall remediated");
  });

  it("rejects forged provider approval", () => {
    const state = awaitingProviderState();
    expect(() => workflowReducer(state, { type: "CONFIRM_PROVIDER", confirmation: "APPROVED" })).toThrow(/contract-bound/);
    expect(() => workflowReducer(state, { type: "CONFIRM_PROVIDER", confirmation: "SANDBOX-APPROVED-99999" })).toThrow(/contract-bound/);
  });

  it("refuses tampered persisted completion state", () => {
    const state = awaitingProviderState();
    const tampered = {
      ...state,
      status: "REMEDIATED" as const,
      providerConfirmation: "FORGED",
    };
    expect(workflowReducer(INITIAL_DEMO_STATE, { type: "HYDRATE", state: tampered })).toEqual(INITIAL_DEMO_STATE);
  });

  it("hydrates a legitimately completed state", () => {
    let state = awaitingProviderState();
    state = workflowReducer(state, {
      type: "CONFIRM_PROVIDER",
      confirmation: expectedSandboxProviderConfirmation(state.contract!),
    });
    state = workflowReducer(state, { type: "VERIFY_COMPLETION" });
    expect(workflowReducer(INITIAL_DEMO_STATE, { type: "HYDRATE", state })).toEqual(state);
  });

  it("generates stable idempotency keys", () => {
    expect(stableIdempotencyKey("contract", "submit")).toBe(stableIdempotencyKey("contract", "submit"));
    expect(stableIdempotencyKey("contract", "submit")).not.toBe(stableIdempotencyKey("contract", "check"));
  });
});
