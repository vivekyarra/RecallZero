import { NextResponse } from "next/server";
import { z } from "zod";

const officialCpscUrl = z.string().url().refine(
  (value) => value.startsWith("https://www.cpsc.gov/"),
  "Recall URL must be an official HTTPS CPSC URL",
);

const contractSchema = z.object({
  id: z.string().min(1),
  assetId: z.string().min(1),
  authority: z.literal("US CPSC"),
  recallNumber: z.string().min(1),
  recallUrl: officialCpscUrl,
  hazard: z.string().min(1),
  officialAction: z.string().min(1),
  remedy: z.literal("FULL_REFUND"),
  provider: z.literal("Guang Zhou"),
  requiredEvidence: z.array(z.string().min(1)).min(1),
  completionCondition: z.string().min(1),
  agentAuthority: z.literal("SANDBOX_ROUTINE_REMEDY_ONLY"),
  matchStatus: z.literal("EXACT_MATCH"),
  createdAt: z.string().min(1),
}).strict().superRefine((contract, ctx) => {
  const expectedId = `rc-${contract.recallNumber}-${contract.assetId}`;
  if (contract.id !== expectedId) {
    ctx.addIssue({
      code: "custom",
      path: ["id"],
      message: "Contract ID is not bound to its recall and asset",
    });
  }
});

const bodySchema = z.object({ contract: contractSchema }).strict();

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Malformed JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
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
    runtime: "LOCAL_PROTOCOL_MIRROR",
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
