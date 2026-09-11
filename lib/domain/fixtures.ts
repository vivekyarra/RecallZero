import type { AssetPassport, RecallRecord } from "./types";

export const DEMO_ASSET: AssetPassport = {
  id: "asset-xr8801-demo",
  productName: "Wantefully 2 in 1 Hair Dryer & Styler",
  brand: "Wantefully",
  model: "XR-8801",
  retailer: "Amazon.com",
  purchasedAt: "2026-03-14",
  evidence: {
    kind: "SYNTHETIC_RECEIPT",
    label: "Synthetic Amazon receipt — safe for demonstration",
  },
  status: "PROTECTED",
};

// Snapshot of CPSC recall 26-754 fetched on 2026-09-11. Used only when the
// official API cannot be reached, and always labeled OFFICIAL_SNAPSHOT.
export const XR8801_RECALL_SNAPSHOT: RecallRecord = {
  recallId: 10970,
  recallNumber: "26754",
  recallDate: "2026-09-10",
  title:
    "Guang Zhou Recalls Wantefully Hair Dryer Brushes Due to Risk of Serious Injury or Death from Electrocution, Shock and Burn Hazards; Violate Federal Regulations",
  description:
    "This recall involves Wantefully 2 in 1 Hair Dryer & Styler, One Step Hair Dryer Brush Straightner, and the Negative Ion Electric Hot Air Blow Dryer Comb, model number XR-8801. The products were sold on Amazon.com from February 2026 through March 2026.",
  url: "https://www.cpsc.gov/Recalls/2026/Guang-Zhou-Recalls-Wantefully-Hair-Dryer-Brushes-Due-to-Risk-of-Serious-Injury-or-Death-from-Electrocution-Shock-and-Burn-Hazards-Violate-Federal-Regulations",
  productNames: ["Wantefully Hair Dryer Brushes"],
  models: ["XR-8801"],
  retailers: ["Amazon.com", "February 2026 through March 2026"],
  hazards: [
    "The recalled hair dryer brushes can present a risk of death or serious injury from electrocution or shock and can overheat, posing a burn hazard.",
  ],
  remedies: [
    "Consumers should unplug and stop using the recalled hair dryers immediately and contact Guang Zhou to receive a full refund. Consumers will be asked to cut the power cord and provide a photo of the destroyed product.",
  ],
  consumerContact: "Guang Zhou at wantefully@163.com.",
  sourceMode: "OFFICIAL_SNAPSHOT",
  fetchedAt: "2026-09-11T00:00:00.000Z",
};

export const INITIAL_DEMO_STATE = {
  asset: null,
  recall: null,
  match: null,
  contract: null,
  status: "PROTECTED" as const,
  timeline: [],
  actions: [],
  evidenceFile: null,
  providerConfirmation: null,
};

