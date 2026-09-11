# Build Checklist

## Build Preferences

- **Build mode:** Autonomous
- **Comprehension checks:** N/A
- **Git:** Initialize immediately; commit at verified product milestones
- **Verification:** Yes, automated and browser-driven without participant pauses
- **Check-in cadence:** Speed-run with concise progress updates
- **Wow moment:** Live CPSC exact match -> governed Strands sandbox execution -> one physical handoff -> verified `0 UNRESOLVED RECALLS`

## Checklist

- [ ] **1. Initialize the fresh licensed monorepo**
  Spec ref: `spec.md > Stack`
  What to build: Git repository, Next.js/TypeScript foundation, Python agent package, environment examples, MIT license, and quality scripts.
  Acceptance: The project is demonstrably new, installs cleanly, exposes no secrets, and has repeatable commands.
  Verify: `git status`, dependency installation, and secret-pattern scan.

- [ ] **2. Build the deterministic safety kernel**
  Spec ref: `spec.md > Deterministic safety kernel`
  What to build: Typed asset/recall/contract/workflow models, exact-match policy, state transitions, idempotency, official fixture, and unit tests.
  Acceptance: Exact, possible, and no-match paths plus completion invariants are proven.
  Verify: `npm test` focused domain suite.

- [ ] **3. Integrate the official CPSC recall source**
  Spec ref: `spec.md > Components And Responsibilities > CPSC client`
  What to build: Validated live API client, bounded timeout, relevant-record selection, provenance, and snapshot fallback.
  Acceptance: Current official data is retrieved when available; failure never masquerades as live.
  Verify: Integration test plus a live read command.

- [ ] **4. Implement the Strands and AgentCore runtime**
  Spec ref: `spec.md > Strands remedy runtime`
  What to build: Governed tools, system policy, runtime entrypoint, local API, common action schema, and safety tests.
  Acceptance: Genuine Strands imports/tools execute locally; unverified contracts and illegal transitions are rejected.
  Verify: Python install, `pytest`, import/runtime smoke test, and AgentCore packaging check.

- [ ] **5. Build the manufacturer remedy sandbox**
  Spec ref: `spec.md > Manufacturer remedy sandbox`
  What to build: Controlled form/action simulation, stable receipts, physical evidence gate, outcome advancement, and sandbox labeling.
  Acceptance: No external manufacturer request exists; duplicate calls are idempotent.
  Verify: API/unit tests and hostname scan.

- [ ] **6. Build the calm product dashboard**
  Spec ref: `spec.md > Web experience`
  What to build: Responsive home, Asset Passport, protected counts, unresolved/remediating/resolved cards, source badges, and navigation.
  Acceptance: First load communicates the promise in under ten seconds and avoids dashboard clutter/chat UI.
  Verify: Production build and browser render at desktop/mobile sizes.

- [ ] **7. Build the end-to-end judge demo workflow**
  Spec ref: `spec.md > Demo And Submission Flow`
  What to build: Receipt import, recall check, evidence table, Remedy Contract, agent trace, physical handoff upload, approval, remediation, persistence, and reset.
  Acceptance: The complete scripted path reaches remediated only with required evidence and confirmation.
  Verify: Playwright/browser automation of every click and state assertion.

- [ ] **8. Add architecture, observability, and evidence surfaces**
  Spec ref: `spec.md > Architecture`
  What to build: In-app architecture/safety views, structured run events, Mermaid source, and required PNG/PDF architecture export.
  Acceptance: Judges can distinguish authoritative, deterministic, agentic, sandbox, and human responsibilities.
  Verify: Diagram render, link check, and browser inspection.

- [ ] **9. Harden and verify the full repository**
  Spec ref: `spec.md > Risks And Verification`
  What to build: Accessibility, responsive polish, error boundaries, lint/type/test/build scripts, security checks, and truthful mode reporting.
  Acceptance: One command verifies JS, Python, build, and critical boundary scans.
  Verify: `npm run verify` plus browser console/network inspection.

- [ ] **10. Deploy and prove public/runtime behavior**
  Spec ref: `spec.md > Stack`
  What to build: Public web deployment and, if AWS credentials can be established, AgentCore Runtime deployment with invocation evidence.
  Acceptance: Anonymous/incognito web flow works; AgentCore claims are made only with ARN/log/invocation proof.
  Verify: Public URL readback, browser E2E, and AgentCore invocation output when available.

- [ ] **11. Prepare Devpost handoff**
  Spec ref: `prd.md > Submission Proof Points`
  What to build: Judge-grade README, architecture asset, exact five-minute video script, screenshot shot list, builder.aws draft, testing instructions, and Devpost draft.
  Acceptance: All required fields have honest copy or clearly named human/external TODOs; no submission is sent.
  Verify: Requirements matrix review and confirm the next command is `$prepare-submission`.

