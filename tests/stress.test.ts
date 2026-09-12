import { describe, expect, it } from "vitest";
import { DEMO_ASSET, INITIAL_DEMO_STATE, XR8801_RECALL_SNAPSHOT } from "@/lib/domain/fixtures";
import { matchAssetToRecall } from "@/lib/domain/match";
import { isSafeHydratedState, stableIdempotencyKey, workflowReducer } from "@/lib/domain/workflow";

describe("deterministic safety stress", () => {
  it("never upgrades wrong models to exact matches across 1,000 variants", () => {
    for (let index = 0; index < 1_000; index += 1) {
      const wrongModel = `XR-${String(9000 + index)}`;
      const result = matchAssetToRecall(
        { ...DEMO_ASSET, model: wrongModel },
        XR8801_RECALL_SNAPSHOT,
      );
      expect(result.status).not.toBe("EXACT_MATCH");
    }
  });

  it("keeps idempotency keys stable and action-scoped", () => {
    const seen = new Set<string>();
    for (let index = 0; index < 2_000; index += 1) {
      const contract = `contract-${index}`;
      const submit = stableIdempotencyKey(contract, "submit");
      expect(submit).toBe(stableIdempotencyKey(contract, "submit"));
      expect(submit).not.toBe(stableIdempotencyKey(contract, "check"));
      expect(seen.has(submit)).toBe(false);
      seen.add(submit);
    }
  });

  it("rejects illegal completion repeatedly", () => {
    for (let index = 0; index < 250; index += 1) {
      expect(() => workflowReducer(INITIAL_DEMO_STATE, { type: "VERIFY_COMPLETION" })).toThrow();
    }
  });

  it("rejects 1,000 forged provider confirmations", () => {
    const exact = matchAssetToRecall(DEMO_ASSET, XR8801_RECALL_SNAPSHOT);
    let state = workflowReducer(INITIAL_DEMO_STATE, { type: "IMPORT_ASSET", asset: DEMO_ASSET });
    state = workflowReducer(state, { type: "CONFIRM_RECALL", recall: XR8801_RECALL_SNAPSHOT, match: exact });
    state = workflowReducer(state, { type: "START_REMEDY" });
    state = workflowReducer(state, { type: "RECORD_EVIDENCE", filename: "synthetic-cut-cord.jpg" });
    state = workflowReducer(state, { type: "SUBMIT_SANDBOX" });

    for (let index = 0; index < 1_000; index += 1) {
      expect(() => workflowReducer(state, {
        type: "CONFIRM_PROVIDER",
        confirmation: `FORGED-${index}`,
      })).toThrow(/contract-bound/);
    }
  });

  it("fuzzes 2,000 malformed receipt assets without false positive exact matches", () => {
    const maliciousStrings = [
      "",
      " ",
      "\0",
      "<script>alert(1)</script>",
      "../../etc/passwd",
      "XR-8801-FAKE",
      "NOT-XR-8801",
      "XR-8801\nDROP TABLE recalls;",
      "🎉🔥💥",
      "undefined",
      "null",
      "[object Object]",
    ];

    for (let i = 0; i < 2_000; i += 1) {
      const fuzzModel = maliciousStrings[i % maliciousStrings.length] + String(i);
      const fuzzBrand = i % 2 === 0 ? "FakeBrand" : maliciousStrings[(i + 1) % maliciousStrings.length];
      const fuzzDate = i % 3 === 0 ? "invalid-date" : "2025-01-01";
      const result = matchAssetToRecall(
        {
          ...DEMO_ASSET,
          brand: fuzzBrand,
          model: fuzzModel,
          purchasedAt: fuzzDate,
        },
        XR8801_RECALL_SNAPSHOT,
      );
      expect(result.status).not.toBe("EXACT_MATCH");
    }
  });

  it("verifies purchase window boundary predicates strictly on month edges", () => {
    // Exact valid window is Feb 1, 2026 to Mar 31, 2026
    const validDates = ["2026-02-01", "2026-02-15", "2026-03-01", "2026-03-31"];
    const invalidDates = ["2026-01-31", "2026-04-01", "2025-03-14", "2027-02-15", "not-a-date", "2026-02-30"];

    for (const valid of validDates) {
      const res = matchAssetToRecall({ ...DEMO_ASSET, purchasedAt: valid }, XR8801_RECALL_SNAPSHOT);
      expect(res.status).toBe("EXACT_MATCH");
    }

    for (const invalid of invalidDates) {
      const res = matchAssetToRecall({ ...DEMO_ASSET, purchasedAt: invalid }, XR8801_RECALL_SNAPSHOT);
      expect(res.status).not.toBe("EXACT_MATCH");
    }
  });

  it("prevents contract hijacking when assetId or recallNumber is swapped", () => {
    const exact = matchAssetToRecall(DEMO_ASSET, XR8801_RECALL_SNAPSHOT);
    let state = workflowReducer(INITIAL_DEMO_STATE, { type: "IMPORT_ASSET", asset: DEMO_ASSET });
    state = workflowReducer(state, { type: "CONFIRM_RECALL", recall: XR8801_RECALL_SNAPSHOT, match: exact });

    expect(state.contract).not.toBeNull();
    const originalContract = state.contract!;

    // Tampered contract with modified assetId but mismatched contract ID
    const tampered = {
      ...originalContract,
      assetId: "tampered-asset-id",
    };

    // State transition with forged contract must fail hydration validation
    const candidateState = { ...state, contract: tampered };
    expect(isSafeHydratedState(candidateState)).toBe(false);

    // workflowReducer must safely refuse to hydrate the corrupted/tampered contract
    const preservedState = workflowReducer(state, {
      type: "HYDRATE",
      state: candidateState,
    });
    expect(preservedState).toBe(state);
    expect(preservedState.contract?.assetId).toBe(originalContract.assetId);
  });
});
