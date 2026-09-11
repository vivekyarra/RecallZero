# Product Requirements Document

## Product Summary

RecallZero is a quiet household safety autopilot. It turns purchase evidence into monitored Asset Passports, matches those assets to official CPSC recalls using deterministic identity rules, and executes the authorized remedy around any unavoidable human physical step. Its success state is not “notified” or “submitted”; it is “remediated with evidence.”

## Target User

A busy adult responsible for a household who expects software to reduce work, is willing to provide one physical proof when required, and needs high confidence before being told a product is unsafe.

## Core User Journey

On first load, the user sees a calm protected-household summary and a prominent judge-demo action. They import a clearly synthetic receipt. RecallZero creates an Asset Passport, checks the live CPSC source, and displays field-level evidence. An exact match opens a Remedy Contract. The agent performs all safe digital steps in a sandbox and requests one photo only when the official workflow requires a physical act. Once evidence and sandbox outcome receipts are present, the product becomes remediated and the unresolved count returns to zero.

## Epics And User Stories

### Epic 1: Ownership without inventory work

- As a household member, I want purchase evidence converted into a product identity so that I do not maintain a spreadsheet.

Acceptance criteria:

- A synthetic receipt can be imported in one action.
- The resulting Asset Passport shows product, model, retailer, purchase date, evidence provenance, and monitoring status.
- Demo data is visibly labeled synthetic.

### Epic 2: Authoritative monitoring and safe matching

- As a household member, I want RecallZero to use official recall data and verify my exact unit so that a similar-looking product is never called recalled.

Acceptance criteria:

- The UI identifies CPSC as the authority and links to the official recall.
- A recall check shows whether data was fetched live or served from a bundled official snapshot.
- Manufacturer/product, model, retailer, and purchase-window evidence is shown individually.
- Only all required deterministic checks produce `EXACT_MATCH`; incomplete evidence produces `POSSIBLE_MATCH` and cannot start a remedy.

### Epic 3: Governed autonomous remedy

- As a household member, I want the agent to perform routine remedy work without repeatedly asking me what to do.

Acceptance criteria:

- An exact match creates a Remedy Contract containing authority, recall number, hazard, prescribed action, remedy, evidence, completion condition, and agent authority.
- The action trace identifies real Strands tool decisions and separates policy decisions from LLM interpretation.
- The agent cannot contact a real manufacturer; all execution surfaces state `SANDBOX`.
- Repeating an action is idempotent and does not create duplicate submissions.

### Epic 4: Human only for the physical gap

- As a household member, I want one precise request when the agent cannot perform a physical task so that I know exactly what is still mine to do.

Acceptance criteria:

- The workflow stops at `NEEDS_HUMAN` for required destruction evidence.
- The request quotes or faithfully paraphrases the official action, warns against unsafe handling, and accepts a demo image.
- Uploading evidence records its filename, timestamp, and synthetic-demo status before work resumes.

### Epic 5: Verified resolution

- As a household member, I want the system to keep monitoring after submission so that “request sent” is never confused with “resolved.”

Acceptance criteria:

- The timeline distinguishes detected, verified, requested, awaiting evidence, approved, and remediated events.
- `REMEDIATED` is impossible until both remedy-provider confirmation and the workflow-specific completion evidence exist.
- Reset returns the demo to the original safe household state.

### Epic 6: Judge-legible proof

- As a judge, I want to understand the product, safety architecture, AWS usage, and live boundary within minutes.

Acceptance criteria:

- The primary flow works without instructions or login.
- Architecture and safety-gate views are available in the app.
- Every external surface is labeled `LIVE CPSC`, `OFFICIAL SNAPSHOT`, or `SANDBOX`.
- The repository contains a license, setup instructions, tests, architecture diagram, and demo script.

## Edge Cases

- CPSC is slow or unavailable: use a timestamped bundled snapshot and clearly disclose it; never claim live data.
- Product text resembles a recall but model evidence is missing: classify possible, request evidence, and block remedy execution.
- The agent repeats a request: stable idempotency keys return the existing receipt.
- A user uploads the wrong file type or an empty file: reject it without changing workflow state.
- A sandbox remedy is submitted but no approval is received: remain remediating.
- Browser refresh: recover the demo state from durable browser storage.
- Official instructions change: show snapshot timestamp and re-check before any new consequential action.

## What We Are Building

The six epics above for one CPSC workflow and one polished judge journey.

## What We Would Add With More Time

Real consented email receipt connectors, retailer integrations, serial-range rule packs, secure multi-household accounts, real manufacturer partnerships/APIs, AgentCore Memory, local disposal-facility verification, carrier tracking, insurer distribution, and additional US regulators.

## Submission Proof Points

- Official CPSC API request and source link.
- Field-by-field deterministic match with a negative/uncertain test.
- Genuine Strands SDK agent and allowlisted tools.
- AgentCore-compatible runtime artifact.
- Controlled sandbox execution with idempotency.
- Human physical-action handoff.
- Completion invariant tests.
- Responsive no-login live demo and exact five-minute video plan.

