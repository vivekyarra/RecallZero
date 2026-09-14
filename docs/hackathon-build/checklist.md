# Build Checklist

## Build Preferences

- **Build mode:** Autonomous
- **Comprehension checks:** N/A
- **Git:** Initialize immediately; commit at verified product milestones
- **Verification:** Yes, automated and browser-driven without participant pauses
- **Check-in cadence:** Speed-run with concise progress updates
- **Wow moment:** Live CPSC exact match -> governed Strands sandbox execution -> one physical handoff -> verified `0 UNRESOLVED RECALLS`

## Checklist

- [x] **1. Initialize the fresh licensed monorepo**
  Spec ref: `spec.md > Stack`
  Delivered: Git repository, Next.js/TypeScript foundation, Python agent package, environment examples, MIT license, and repeatable quality scripts.
  Verified: dependency installation, secret-pattern scan, and clean release CI.

- [x] **2. Build the deterministic safety kernel**
  Spec ref: `spec.md > Deterministic safety kernel`
  Delivered: Typed asset/recall/contract/workflow models, deterministic exact-match policy, state transitions, idempotency, official fixture, and adversarial tests.
  Verified: exact/possible/no-match paths, forged exact-match rejection, persisted-state validation, and completion invariants.

- [x] **3. Integrate the official CPSC recall source**
  Spec ref: `spec.md > Components And Responsibilities > CPSC client`
  Delivered: Validated live API client, bounded timeout, relevant-record selection, provenance, and explicitly labeled official snapshot fallback.
  Verified: live/snapshot behavior does not misrepresent fallback data as live.

- [x] **4. Implement the Strands and AgentCore-compatible runtime**
  Spec ref: `spec.md > Strands remedy runtime`
  Delivered: Genuine Strands `Agent`, `BedrockModel`, native governed tools, structured `ToolResult` JSON, runtime entrypoint, common action schema, and safety tests.
  Verified: CI constructs the real Strands Agent without cloud credentials, checks the exact allowlist, and executes a registered governed tool through the SDK boundary.
  Later proof: the actual agent was temporarily deployed to AgentCore and invoked through Bedrock; see `docs/evidence/agentcore-runtime-verification.md`. The runtime was deleted after verification.

- [x] **5. Build the manufacturer remedy sandbox**
  Spec ref: `spec.md > Manufacturer remedy sandbox`
  Delivered: Controlled action simulation, stable contract-bound completion proof, physical evidence gate, outcome advancement, and sandbox labeling.
  Verified: arbitrary/forged provider confirmations, cross-contract confirmations, duplicate calls, and illegal completion attempts are rejected.

- [x] **6. Build the calm product dashboard**
  Spec ref: `spec.md > Web experience`
  Delivered: Responsive home, Asset Passport, protected counts, unresolved/remediating/resolved states, provenance/source badges, and navigation.
  Verified: production build and browser review at desktop and mobile sizes.

- [x] **7. Build the end-to-end judge demo workflow**
  Spec ref: `spec.md > Demo And Submission Flow`
  Delivered: Receipt import, recall check, evidence table, Remedy Contract, agent trace, physical handoff evidence, sandbox approval, remediation, persistence, and reset.
  Verified: Playwright judge flow repeated three times on Desktop Chrome and Pixel 7 in CI.

- [x] **8. Add architecture, observability, and evidence surfaces**
  Spec ref: `spec.md > Architecture`
  Delivered: In-app architecture/safety views, structured run events, committed architecture source, and submission-ready PNG/PDF exports.
  Verified: architecture render/preflight and browser inspection distinguish authoritative, deterministic, agentic, sandbox, and human responsibilities.

- [x] **9. Harden and verify the full repository**
  Spec ref: `spec.md > Risks And Verification`
  Delivered: responsive polish, error handling, lint/type/test/build scripts, security checks, truthful mode reporting, and adversarial stress coverage.
  Verified: final `main` CI passes lint, typecheck, JS tests, secret scanning, high-severity production dependency audit, production build, Python tests, real Strands boundary test, and repeated browser E2E.

- [x] **10. Deploy and prove public/runtime behavior**
  Spec ref: `spec.md > Stack`
  Delivered: Production Vercel deployment live at `https://recallzero.vercel.app`.
  Verified: Full anonymous end-to-end judge flow tested and verified against the live production deployment.
  Separate cloud proof: the temporary AgentCore run is documented in `docs/evidence/agentcore-runtime-verification.md`; it is not the public browser backend.

- [x] **11. Prepare Devpost handoff**
  Spec ref: `prd.md > Submission Proof Points`
  Delivered: judge-grade README, architecture asset/source, exact five-minute video script, screenshot evidence, Builder.aws draft, testing instructions, and polished Devpost project write-up.
  Verified: current hackathon requirements and judging criteria were re-checked on 2026-09-11.
  Note: final submission remains intentionally pending until the required owner-provided fields, architecture upload, and public video URL are present.

## Final external owner actions

These are not engineering blockers and must not be fabricated by the project or agent:

- [x] Add GitHub About description/topics and enable suitable `main` branch protection/status checks.
- [x] Ensure the MIT license is visible in GitHub repository metadata/About.
- [x] Authorize GitHub import in Vercel, deploy RecallZero, and verify the public URL anonymously.
- [x] Optional but score-positive: temporarily deploy the Strands runtime to Amazon Bedrock AgentCore and retain ARN/log/invocation evidence; remove the runtime after verification.
- [ ] Record and publish the prepared demo as a public YouTube/Vimeo video, maximum 5 minutes.
- [ ] Upload the architecture diagram to the Devpost required architecture field.
- [ ] Provide Devpost Submitter Type, Country of Residence, AWS Builder ID, and select **Everyday Agents**.
- [ ] Add the public GitHub repo URL and, if available, the Vercel live-demo URL to Devpost.
- [x] Optional bonus: publish the Builder.aws article with **Agents for Humans** in the title. Public URL: https://builder.aws.com/content/3AccSg72uPF7h1TswVWutUMZXq1/agents-for-humans-building-recallzero-an-agent-that-finishes-product-recalls
- [ ] Submit the project to the hackathon only after all required fields and deliverables above are present.
