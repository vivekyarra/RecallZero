import { NextResponse } from "next/server";
import { z } from "zod";

const bodySchema = z.object({
  contract: z.object({
    id: z.string().min(1),
    matchStatus: z.literal("EXACT_MATCH"),
    agentAuthority: z.literal("SANDBOX_ROUTINE_REMEDY_ONLY"),
    recallNumber: z.string().min(1),
  }),
});

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Safety gate rejected the contract", details: parsed.error.flatten() },
      { status: 422 },
    );
  }

  // The public judge demo uses a deterministic adapter so it never needs a secret
  // or sends a real claim. The same contract is accepted by services/agent/main.py,
  // where Strands performs the tool loop locally or on AgentCore.
  return NextResponse.json({
    mode: "DETERMINISTIC_PUBLIC_DEMO",
    runtime: process.env.AGENTCORE_RUNTIME_URL ? "AGENTCORE_CONFIGURED" : "LOCAL_PROTOCOL_MIRROR",
    boundary: "MANUFACTURER_SANDBOX",
    contractId: parsed.data.contract.id,
    plan: [
      "inspect_remedy_contract",
      "prepare_sandbox_claim",
      "request_physical_evidence",
    ],
    disclosure:
      "No request is sent to a real manufacturer. Genuine Strands runtime code and tests are included in services/agent.",
  });
}

