# Project Scope

## Project Name Candidates

- RecallZero (confirmed)

## One-Line Summary

RecallZero knows what a household owns, watches official CPSC recalls, verifies exact affected units, and completes the prescribed remedy workflow until the unsafe product is demonstrably resolved.

## Target User

US households that buy ordinary consumer products and do not have the time, context, or persistence to monitor recalls and complete multi-step repair, refund, return, replacement, or disposal processes.

## Problem

Recall discovery is only the first half of the problem. Official remedies frequently require model verification, evidence collection, forms, emails, shipping labels, disposal research, physical actions, follow-up, and outcome confirmation. Consumers abandon these workflows, leaving recalled products unresolved.

## Core Workflow

1. Ingest a synthetic purchase receipt or manually entered product.
2. Create an Asset Passport with normalized identifiers and ownership evidence.
3. Fetch current records from the official CPSC REST API.
4. Run deterministic manufacturer/model/seller/date evidence checks.
5. Classify `NO_MATCH`, `POSSIBLE_MATCH`, or `EXACT_MATCH`; only the last may open a remedy.
6. Build a structured Remedy Contract from the authoritative record.
7. Let a Strands agent choose only allowlisted, state-valid tools.
8. Execute against an explicitly labeled manufacturer sandbox.
9. Pause only for a genuine physical action and evidence upload.
10. Verify confirmation and completion evidence before declaring `REMEDIATED`.

## What We Are Building

- Calm responsive household dashboard centered on `0 UNRESOLVED RECALLS`.
- Receipt/manual ingestion and Asset Passports.
- Live CPSC polling with visible source provenance and snapshot fallback for demo reliability.
- Deterministic match evidence and a non-bypassable safety gate.
- One complete current-recall workflow for model `XR-8801`, including the physical cord-cut/photo handoff.
- A controlled manufacturer sandbox that never contacts a real company.
- A three-agent conceptual architecture implemented as one governed Strands runtime with ownership, match, and remedy responsibilities—not agent sprawl.
- Outcome timeline, proof receipt, resettable judge demo, tests, architecture diagram, public deployment readiness, and submission materials.
- AgentCore-compatible entrypoint and deployment instructions.

## What We Are Not Building

- FDA, NHTSA, overseas regulators, or medical/legal advice: one authoritative domain is enough for the judging story.
- Gmail/Amazon OAuth, a consumer mobile app, multi-household authentication, payments, voice, blockchain, or generic home management.
- Real manufacturer submissions or hazardous-action automation.
- Probabilistic LLM recall confirmation, invented safety instructions, or completion based only on form submission.
- A production insurer/retailer distribution system.

## Inspiration And References

- CPSC official REST recall data and remedy guidance.
- Strands tool-use and AgentCore runtime patterns.
- Calm safety-product design: status first, evidence on demand, no chat-first surface.
- Existing recall trackers validate detection demand; RecallZero differentiates on verified remedy completion.

## Demo Path

The judge imports a synthetic Amazon receipt for a Wantefully XR-8801 hair dryer, runs a live recall check, sees an exact deterministic match to a September 10 CPSC recall, watches the Strands action trace prepare and submit a sandbox refund request, uploads synthetic destruction evidence, advances the sandbox outcome, and ends at `REMEDIATED` with zero unresolved recalls.

## Submission Story

Other products tell people what was recalled. RecallZero gets the unsafe product out of their life. The visible wow moment is the transition from an authoritative live recall through a governed browser-like remedy execution to a verified zero-unresolved state.

## Time Budget

- Deadline: September 14, 2026 at 5:00 PM Pacific Time.
- Scope ruler: ship and verify the single complete workflow first; cloud deployment, public presentation assets, and bonus posts follow only after the core proof is stable.

