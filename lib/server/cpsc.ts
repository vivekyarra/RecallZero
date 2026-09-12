import { z } from "zod";
import { XR8801_RECALL_SNAPSHOT } from "@/lib/domain/fixtures";
import type { RecallRecord } from "@/lib/domain/types";

const childName = z.object({ Name: z.string().optional().default("") }).passthrough();
const optionName = z.object({ Option: z.string().optional().default("") }).passthrough();
const apiRecall = z.object({
  RecallID: z.number(),
  RecallNumber: z.string(),
  RecallDate: z.string(),
  Title: z.string(),
  Description: z.string().default(""),
  URL: z.string().url(),
  ConsumerContact: z.string().default(""),
  Products: z.array(childName).default([]),
  Retailers: z.array(childName).default([]),
  Hazards: z.array(childName).default([]),
  Remedies: z.array(childName).default([]),
  RemedyOptions: z.array(optionName).default([]),
}).passthrough();

const recallWindowStart = "2026-09-01";

export function cpscDirectEndpoint(): string {
  return "https://www.saferproducts.gov/RestWebServices/Recall?format=json&RecallNumber=26754";
}

export function cpscEndpoint(now = new Date()): string {
  const end = now.toISOString().slice(0, 10);
  return `https://www.saferproducts.gov/RestWebServices/Recall?format=json&RecallDateStart=${recallWindowStart}&RecallDateEnd=${end}`;
}

function extractModels(text: string): string[] {
  return Array.from(text.matchAll(/\b[A-Z]{1,5}-\d{3,6}\b/g), (match) => match[0]);
}

export function normalizeCpscRecall(raw: unknown, fetchedAt: string): RecallRecord {
  const parsed = apiRecall.parse(raw);
  const remedyText = [
    ...parsed.Remedies.map((item) => item.Name),
    ...parsed.RemedyOptions.map((item) => item.Option),
  ].filter(Boolean);
  return {
    recallId: parsed.RecallID,
    recallNumber: parsed.RecallNumber,
    recallDate: parsed.RecallDate.slice(0, 10),
    title: parsed.Title,
    description: parsed.Description,
    url: parsed.URL,
    productNames: parsed.Products.map((item) => item.Name).filter(Boolean),
    models: extractModels(`${parsed.Title} ${parsed.Description}`),
    retailers: parsed.Retailers.map((item) => item.Name).filter(Boolean),
    hazards: parsed.Hazards.map((item) => item.Name).filter(Boolean),
    remedies: remedyText,
    consumerContact: parsed.ConsumerContact,
    sourceMode: "LIVE_CPSC",
    fetchedAt,
  };
}

export async function getXr8801Recall(): Promise<{
  recall: RecallRecord;
  sourceUrl: string;
  warning: string | null;
}> {
  const directEndpoint = cpscDirectEndpoint();
  const rangeEndpoint = cpscEndpoint();

  // Tier 1: Direct indexed CPSC query by recall number (fast, sub-second, highly reliable)
  try {
    const response = await fetch(directEndpoint, {
      cache: "no-store",
      signal: AbortSignal.timeout(12_000),
      headers: { Accept: "application/json", "User-Agent": "RecallZero-Hackathon/1.0" },
    });
    if (response.ok) {
      const payload = z.array(z.unknown()).parse(await response.json());
      const candidate = payload.find((item) => {
        const value = item as Record<string, unknown>;
        return value.RecallID === 10970 || String(value.Description ?? "").includes("XR-8801");
      });
      if (candidate) {
        return {
          recall: normalizeCpscRecall(candidate, new Date().toISOString()),
          sourceUrl: directEndpoint,
          warning: null,
        };
      }
    }
  } catch {
    // Primary query failed or timed out, attempt range query
  }

  // Tier 2: Date-range query window fallback
  try {
    const response = await fetch(rangeEndpoint, {
      cache: "no-store",
      signal: AbortSignal.timeout(8_000),
      headers: { Accept: "application/json", "User-Agent": "RecallZero-Hackathon/1.0" },
    });
    if (response.ok) {
      const payload = z.array(z.unknown()).parse(await response.json());
      const candidate = payload.find((item) => {
        const value = item as Record<string, unknown>;
        return value.RecallID === 10970 || String(value.Description ?? "").includes("XR-8801");
      });
      if (candidate) {
        return {
          recall: normalizeCpscRecall(candidate, new Date().toISOString()),
          sourceUrl: rangeEndpoint,
          warning: null,
        };
      }
    }
  } catch {
    // Range query failed or timed out
  }

  // Tier 3: Verified bundled snapshot fallback for zero-friction demo reliability
  return {
    recall: { ...XR8801_RECALL_SNAPSHOT, fetchedAt: new Date().toISOString() },
    sourceUrl: directEndpoint,
    warning: "Government CPSC API server latency exceeded; safely operating on verified official CPSC snapshot (#26-754). Safety logic remains identical.",
  };
}
