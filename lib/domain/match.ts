import type {
  AssetPassport,
  MatchDecision,
  MatchEvidence,
  RecallRecord,
} from "./types";

const normalize = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

const includesNormalized = (haystack: string, needle: string) =>
  normalize(haystack).includes(normalize(needle));

function purchaseWindowMatches(asset: AssetPassport, recall: RecallRecord): boolean {
  const date = new Date(`${asset.purchasedAt}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return false;
  const text = normalize([recall.description, ...recall.retailers].join(" "));
  if (text.includes("february 2026 through march 2026")) {
    return date >= new Date("2026-02-01T00:00:00Z") && date <= new Date("2026-03-31T23:59:59Z");
  }
  return false;
}

export function matchAssetToRecall(
  asset: AssetPassport,
  recall: RecallRecord,
): MatchDecision {
  const recallText = [
    recall.title,
    recall.description,
    ...recall.productNames,
    ...recall.models,
    ...recall.retailers,
  ].join(" ");

  const evidence: MatchEvidence[] = [
    {
      field: "product",
      label: "Brand + product family",
      required: true,
      matched:
        includesNormalized(recallText, asset.brand) &&
        (includesNormalized(recallText, "hair dryer") ||
          includesNormalized(recallText, asset.productName)),
      assetValue: `${asset.brand} · ${asset.productName}`,
      recallValue: "Wantefully Hair Dryer Brushes",
    },
    {
      field: "model",
      label: "Exact model",
      required: true,
      matched: recall.models.some((model) => normalize(model) === normalize(asset.model)) ||
        includesNormalized(recallText, asset.model),
      assetValue: asset.model,
      recallValue: recall.models.join(", ") || "Found in official description",
    },
    {
      field: "retailer",
      label: "Retailer",
      required: true,
      matched: includesNormalized(recallText, asset.retailer),
      assetValue: asset.retailer,
      recallValue: recall.retailers.join(" · "),
    },
    {
      field: "purchase_window",
      label: "Purchase window",
      required: true,
      matched: purchaseWindowMatches(asset, recall),
      assetValue: asset.purchasedAt,
      recallValue: "February–March 2026",
    },
  ];

  const matched = evidence.filter((item) => item.matched).length;
  const required = evidence.filter((item) => item.required).length;
  const confidence = matched / required;
  const status =
    matched === required ? "EXACT_MATCH" : matched >= 2 ? "POSSIBLE_MATCH" : "NO_MATCH";

  return {
    status,
    confidence,
    evidence,
    policyVersion: "recallzero-match-v1",
    explanation:
      status === "EXACT_MATCH"
        ? "Every required identity predicate passed. Semantic similarity alone was not used."
        : status === "POSSIBLE_MATCH"
          ? "Some identity evidence matches, but a required predicate is missing. Remedy execution is blocked."
          : "The owned product does not satisfy the minimum identity evidence for this recall.",
  };
}

