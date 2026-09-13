# Agents for Humans: Building RecallZero, an agent that finishes product recalls instead of creating another task

Published article: https://builder.aws.com/content/3AccSg72uPF7h1TswVWutUMZXq1/agents-for-humans-building-recallzero-an-agent-that-finishes-product-recalls

The published version clarifies that the public web journey is a deterministic mirror, local Strands SDK tools were invoked, and Bedrock/AgentCore invocation remains unverified.

Product recalls are a good example of work that is important, repetitive, and surprisingly easy to leave unfinished. A consumer may learn that something they own is unsafe, but that is only the start: they still have to determine whether the exact model is affected, read the official instructions, gather evidence, contact the provider, follow up, and confirm the remedy actually happened.

For the Agents for Humans Hackathon I built **RecallZero**, a governed autonomous product-safety agent designed around one outcome: unresolved recalled products should return to zero.

## The design question

The obvious implementation would be to give an LLM a recall feed and let it decide what to do. I intentionally did not do that. Product identity is a safety boundary. Similar product names are not enough, and a confident model answer is not proof that an exact unit is covered by a recall.

RecallZero therefore separates the system into layers:

1. Purchase evidence becomes an Asset Passport.
2. Recall facts come from the official US CPSC REST API, with a clearly labeled official snapshot fallback for demo reliability.
3. Deterministic code evaluates required identity predicates such as model, retailer, and purchase window.
4. Only an `EXACT_MATCH` can create an immutable Remedy Contract.
5. A Strands Agent receives that verified contract and can call only narrow, allowlisted tools.
6. Unavoidable physical actions stop the agent and require human evidence.
7. Sandbox submission is not treated as completion.
8. A deterministic verifier requires both evidence and provider confirmation before transitioning to `REMEDIATED`.

The result is an agent that is useful precisely because its authority is bounded.

## Why Strands Agents

The Strands Agents SDK is used for the part of the workflow where model reasoning is valuable: interpreting an already verified remedy contract, choosing among narrow tools, and progressing routine digital work. The Python runtime exposes tools for contract inspection, sandbox claim preparation, physical-evidence requests, idempotent sandbox submission, and outcome checks.

The runtime is also shaped for Amazon Bedrock AgentCore. The entrypoint uses `BedrockAgentCoreApp`, and the model adapter uses Amazon Bedrock. When AWS credentials are not available, the public judge flow stays honest: it uses a labeled deterministic protocol mirror rather than pretending a cloud runtime was invoked.

## A concrete judge path

The demo uses a synthetic purchase for a Wantefully XR-8801 hair dryer and an official CPSC recall. The purchase is intentionally synthetic; the recall record is real. RecallZero checks the official source, proves the required identity predicates, creates the Remedy Contract, and opens the Strands-governed workflow.

The one thing the agent cannot do is the physical safety step. It stops and asks for prepared synthetic evidence in the judge demo. The manufacturer side is also a RecallZero-controlled sandbox, so no test claim reaches a real company. Finally, provider confirmation and the recorded evidence must both exist before the case can close.

## What I learned

The biggest lesson was that agentic does not have to mean unconstrained. In fact, the more consequential the workflow, the more valuable it is to separate:

- authoritative facts from model interpretation;
- deterministic gates from semantic reasoning;
- digital actions from physical actions;
- submission from verified completion.

That separation made the system easier to test as well. The repository includes TypeScript workflow and matching tests, Python policy tests, browser end-to-end tests on desktop and mobile, and CI that performs lint, type checking, production builds, safety tests, and repeated browser journeys.

## Where AWS fits

RecallZero uses the Strands Agents SDK and is built around an Amazon Bedrock model integration. Its runtime entrypoint is compatible with Amazon Bedrock AgentCore, which is the natural production target for a long-running background agent that monitors owned products and surfaces only when a real decision is required.

The next production step is to deploy that runtime to AgentCore under an AWS account with credentials, add durable background scheduling and observability, and connect opt-in purchase sources while preserving the same deterministic safety envelope.

## Closing thought

The product goal is intentionally boring: a person should not need to become a recall case manager because a product they bought became unsafe. The agent should quietly do the repetitive work, ask for help only where the physical world requires a person, and prove that the outcome was actually completed.

That is the kind of autonomy I want more software to have: useful, quiet, and governed.

---

Project: RecallZero
Hackathon: Agents for Humans Hackathon
Repository: https://github.com/vivekyarra/RecallZero

Live demo: https://recallzero.vercel.app
