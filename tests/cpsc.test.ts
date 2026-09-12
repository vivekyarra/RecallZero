import { describe, expect, it } from "vitest";
import { cpscDirectEndpoint, cpscEndpoint, normalizeCpscRecall } from "@/lib/server/cpsc";

describe("CPSC query window", () => {
  it("uses the current UTC date rather than a hard-coded deadline-era date", () => {
    const endpoint = cpscEndpoint(new Date("2026-09-15T23:59:59Z"));
    expect(endpoint).toContain("RecallDateStart=2026-09-01");
    expect(endpoint).toContain("RecallDateEnd=2026-09-15");
    expect(endpoint).not.toContain("RecallDateEnd=2026-09-11");
  });

  it("constructs an authoritative direct indexed endpoint for RecallNumber 26754", () => {
    const endpoint = cpscDirectEndpoint();
    expect(endpoint).toBe("https://www.saferproducts.gov/RestWebServices/Recall?format=json&RecallNumber=26754");
  });

  it("normalizes official raw CPSC payload accurately", () => {
    const rawFixture = {
      RecallID: 10970,
      RecallNumber: "26754",
      RecallDate: "2026-09-10T00:00:00",
      Title: "Guang Zhou Recalls Wantefully Hair Dryer Brushes",
      Description: "Model number XR-8801. Sold on Amazon.com from February 2026 through March 2026.",
      URL: "https://www.cpsc.gov/Recalls/2026/test",
      ConsumerContact: "wantefully@163.com",
      Products: [{ Name: "Wantefully Hair Dryer Brushes" }],
      Retailers: [{ Name: "Amazon.com" }],
      Hazards: [{ Name: "Electrocution and shock hazard" }],
      Remedies: [{ Name: "Full refund upon cord cut photo" }],
      RemedyOptions: [{ Option: "Refund" }],
    };

    const normalized = normalizeCpscRecall(rawFixture, "2026-09-12T00:00:00.000Z");
    expect(normalized.recallId).toBe(10970);
    expect(normalized.recallNumber).toBe("26754");
    expect(normalized.models).toContain("XR-8801");
    expect(normalized.productNames).toContain("Wantefully Hair Dryer Brushes");
    expect(normalized.retailers).toContain("Amazon.com");
    expect(normalized.sourceMode).toBe("LIVE_CPSC");
    expect(normalized.remedies).toContain("Full refund upon cord cut photo");
  });
});
