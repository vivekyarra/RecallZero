import { NextResponse } from "next/server";
import { getXr8801Recall } from "@/lib/server/cpsc";

export const dynamic = "force-dynamic";

export async function GET() {
  const result = await getXr8801Recall();
  return NextResponse.json(result, {
    headers: {
      "Cache-Control": "no-store",
      "X-RecallZero-Source": result.recall.sourceMode,
    },
  });
}

