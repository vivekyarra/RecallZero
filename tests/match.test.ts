import { describe, expect, it } from "vitest";
import { DEMO_ASSET, XR8801_RECALL_SNAPSHOT } from "@/lib/domain/fixtures";
import { matchAssetToRecall } from "@/lib/domain/match";

describe("deterministic recall matching", () => {
  it("confirms the exact XR-8801 demo asset", () => {
    const result = matchAssetToRecall(DEMO_ASSET, XR8801_RECALL_SNAPSHOT);
    expect(result.status).toBe("EXACT_MATCH");
    expect(result.confidence).toBe(1);
    expect(result.evidence.every((item) => item.matched)).toBe(true);
  });

  it("does not call a similar product an exact match without its model", () => {
    const result = matchAssetToRecall(
      { ...DEMO_ASSET, model: "XR-8802" },
      XR8801_RECALL_SNAPSHOT,
    );
    expect(result.status).toBe("POSSIBLE_MATCH");
    expect(result.evidence.find((item) => item.field === "model")?.matched).toBe(false);
  });

  it("rejects a purchase outside the recalled window", () => {
    const result = matchAssetToRecall(
      { ...DEMO_ASSET, purchasedAt: "2026-06-01" },
      XR8801_RECALL_SNAPSHOT,
    );
    expect(result.status).toBe("POSSIBLE_MATCH");
    expect(result.evidence.find((item) => item.field === "purchase_window")?.matched).toBe(false);
  });
});

