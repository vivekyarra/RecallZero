# RecallZero - Devpost submission copy

## Tagline
A governed Strands agent that finds exact product recalls and carries the remedy to verified resolution, surfacing only unavoidable human physical steps.

## Track
Everyday Agents

## Inspiration
Product recalls create a strange last-mile problem: the safety information may be public, yet the consumer still has to notice it, determine whether the exact unit is affected, interpret the remedy, collect evidence, submit the claim, remember to follow up, and verify the outcome. RecallZero removes that repetitive burden without giving an LLM authority over safety truth.

## What it does
RecallZero maintains an Asset Passport for owned products, checks authoritative CPSC recall data, deterministically classifies exact / possible / no-match cases, and only after an exact match creates an immutable Remedy Contract. A Strands Remedy Agent receives that contract and can use only narrow tools to prepare and advance the remedy workflow. The agent stops at unavoidable physical actions, resumes when evidence is supplied, and refuses to mark the recall remediated until both evidence and provider confirmation exist.

## How we built it
- Next.js + React + TypeScript product surface.
- Official CPSC REST API with an explicitly labeled official snapshot fallback.
- Deterministic product identity and workflow safety kernel.
- Python Strands Agents SDK runtime with Amazon Bedrock model integration.
- Amazon Bedrock AgentCore-compatible entrypoint.
- Controlled manufacturer sandbox with stable idempotency keys.
- Vitest, Pytest, and Playwright verification on desktop and mobile.

## Safety boundary
The LLM never decides whether a recall is true, never upgrades a possible match to exact, never overrides official instructions, never bypasses physical evidence, never contacts a real manufacturer in the public demo, and never self-declares completion.

## Challenges
The central design challenge was separating useful autonomy from authority. A pure agentic design would be easy to demo but unsafe: semantic similarity is not enough for product identity, and a submitted claim is not the same thing as a completed remedy. RecallZero therefore treats deterministic gates and completion predicates as architecture, not prompt suggestions.

## Accomplishments
The project includes a complete governed workflow from synthetic purchase evidence through exact CPSC matching, Remedy Contract creation, Strands tool planning, the human physical gate, idempotent sandbox submission, provider outcome, and deterministic completion verification. It also includes production build verification, Python and TypeScript safety tests, browser E2E coverage, an architecture diagram, and a judge-ready five-minute demo script.

## What we learned
The strongest agent systems do not maximize model authority. They make the model powerful inside a narrow verified envelope, keep authoritative facts outside the model, and make important state transitions independently verifiable.

## What's next
Connect real opt-in receipt sources, broaden deterministic matching across more CPSC product categories, add secure provider adapters, deploy the Strands runtime to AgentCore when AWS credentials are available, and add long-running background monitoring with notifications only when a real decision is required.

## Links
- Source: https://github.com/vivekyarra/RecallZero
- Live demo: add after Vercel production deployment is verified
- Demo video: add public YouTube/Vimeo URL before final submission
- Builder.aws bonus post: publish the prepared article before the deadline

## Required Devpost answers still supplied outside the repository
- Submitter type
- Country of residence
- AWS Builder ID
- Public demo video URL
- Architecture file upload (PNG or PDF)
