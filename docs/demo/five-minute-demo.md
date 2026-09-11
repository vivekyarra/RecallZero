# RecallZero — exact five-minute demo

## 0:00–0:20 — The broken last mile

**Say:** “A recall is not successful when it is published. It is successful when the dangerous product is no longer dangerous. CPSC reported a 44.55% FY2025 recall response rate. RecallZero closes the other half of that loop.”

**Show:** Hero and `0 UNRESOLVED RECALLS`. Keep the cursor still.

## 0:20–0:45 — Ownership without inventory work

**Click:** `Import demo receipt`.

**Say:** “A synthetic Amazon receipt becomes an Asset Passport automatically. The demo evidence is synthetic and labeled; the recall source will be real.”

**Show:** Model XR-8801, retailer, date, verified synthetic receipt.

## 0:45–1:20 — Exact match, not vibes

**Click:** `Run live recall check`.

**Say:** “This calls CPSC's official REST API for a recall published September 10 while this project was being built. An LLM is not allowed to declare a recall. Four deterministic predicates must pass.”

**Show:** Live/snapshot badge, CPSC number, product/model/retailer/purchase-window matches, official link.

## 1:20–2:05 — Governed agent work

**Click:** `Let RecallZero handle it`.

**Say:** “The exact match becomes an immutable Remedy Contract. Strands receives only that contract and can choose only narrow tools. It prepares the refund workflow in our controlled manufacturer sandbox.”

**Show:** Action trace boundaries: deterministic, Strands, human, sandbox.

## 2:05–2:40 — The physical gap

**Say:** “AI cannot safely cut a cord, and it should never pretend it did. RecallZero does everything around that physical step and asks once, precisely when needed.”

**Click:** `Use prepared synthetic proof`.

**Say:** “We use prepared synthetic evidence—no real product is damaged for this demo.”

## 2:40–3:35 — Submission is not resolution

**Click:** `Submit to manufacturer sandbox`, then `Fast-forward sandbox outcome`.

**Say:** “The idempotent request returns a sandbox receipt. But submitted does not mean resolved, so RecallZero keeps monitoring until provider confirmation arrives.”

**Click:** `Verify contract completion`.

## 3:35–4:15 — The outcome

**Show:** Remediated state and dashboard returning to zero unresolved.

**Say:** “Evidence plus provider approval satisfy the completion contract. Our north-star metric is recalled products remediated—not alerts sent.”

## 4:15–4:50 — Architecture and safety

**Click:** `How it works`.

**Say:** “Official CPSC facts feed a deterministic identity gate. Only an exact match reaches the Strands agent. The agent runs on an AgentCore-compatible runtime, but code owns truth, permissions, idempotency, and completion.”

**Show:** Agent can/cannot columns.

## 4:50–5:00 — Close

**Say:** “Other products tell you what was recalled. RecallZero gets it out of your life.”

