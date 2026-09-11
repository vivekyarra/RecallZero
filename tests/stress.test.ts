import { describe, expect, it } from "vitest";
import { DEMO_ASSET, INITIAL_DEMO_STATE, XR8801_RECALL_SNAPSHOT } from "@/lib/domain/fixtures";
import { matchAssetToRecall } from "@/lib/domain/match";
import { stableIdempotencyKey, workflowReducer } from "@/lib/domain/workflow";

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
});
