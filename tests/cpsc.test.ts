import { describe, expect, it } from "vitest";
import { cpscEndpoint } from "@/lib/server/cpsc";

describe("CPSC query window", () => {
  it("uses the current UTC date rather than a hard-coded deadline-era date", () => {
    const endpoint = cpscEndpoint(new Date("2026-09-15T23:59:59Z"));
    expect(endpoint).toContain("RecallDateStart=2026-09-01");
    expect(endpoint).toContain("RecallDateEnd=2026-09-15");
    expect(endpoint).not.toContain("RecallDateEnd=2026-09-11");
  });
});
