# RecallZero

> A Strands agent that finishes the work after a product recall—verifying the exact item, handling the claim, pausing for proof, and keeping the case open until it is actually resolved.

## Inspiration

Getting told what to do is not the same as getting it done.

A government recall notice can tell you that a product is dangerous, but the notice does not finish the job for you. The owner is still left to check whether their exact model is affected, prove when and where it was bought, understand the official remedy, collect the right evidence, submit the claim, and keep following up until the case is actually resolved.

That is the part I wanted to remove.

RecallZero started from a broader frustration I have with official processes: the rules and instructions may already exist, but the person is still left doing all of the repetitive follow-through. Product recalls are a good example because the work is tedious, easy to put off, and a wrong match actually matters.

I wanted to build an agent that handles that boring middle without giving the model permission to decide the safety facts for itself.

That became RecallZero.

## What it does

RecallZero takes a product recall from “is mine affected?” to “is the remedy actually complete?”

For the demo, I use a clearly labeled synthetic receipt for a Wantefully XR-8801 hair dryer.

The flow is straightforward:

1. RecallZero turns the receipt into an Asset Passport.
2. It checks the official US CPSC recall source.
3. Code verifies the product family, exact model, retailer, and purchase window.
4. Only an exact match creates a Remedy Contract.
5. The Strands agent handles the routine digital steps from that contract.
6. If the official remedy requires something physical, the agent stops and asks the human for proof.
7. The case stays open until the provider outcome is tied back to that same contract.

The result is deliberately simple: the dashboard starts with an unresolved recalled product and ends at zero only after the remedy has really been verified.

A similar product is not enough. A confident model answer is not enough. A submitted claim is not enough.

RecallZero only closes the case when the exact product matched, the required human evidence exists, and the provider has confirmed the outcome for that same case.

The public demo uses prepared synthetic evidence and a controlled manufacturer sandbox. No real product is damaged and no real manufacturer is contacted.

## Why I built the matching this way

The tempting version of this project was to hand a receipt and a recall page to an LLM and ask, “Does this match?”

I did not want to trust that answer.

For a product recall, “looks similar” can be the difference between bothering the wrong person and missing a real safety issue.

So exact matching lives in normal TypeScript code, not in the model.

RecallZero checks four required pieces of evidence: product family, model, retailer, and purchase window. All four have to pass before the workflow can move forward. If only some of them match, the product stays a possible match and the remedy is blocked.

The model does the repetitive work after the facts are settled. It does not get to rewrite the facts that authorize the work.

## How I built it

The web product is built with Next.js, React, and TypeScript. The Strands agent is a separate Python service.

### Official recall lookup

`lib/server/cpsc.ts` talks to the US CPSC recall service.

For the demo, it first tries a direct lookup for the recall. If that is unavailable or slow, it tries a date-window query. If the government service still does not respond in time, the app uses a bundled snapshot of the same official recall and labels that clearly in the UI.

I added the fallback because I did not want judging to depend on whether a public government endpoint happened to be fast that minute. The matching rules stay exactly the same either way.

### Exact-match gate

`lib/domain/match.ts` performs the four checks.

All four passing gives `EXACT_MATCH`. A partial match can only become `POSSIBLE_MATCH`, which cannot create a Remedy Contract.

Before a contract is created, the code recomputes the match instead of trusting a value passed in from the UI. That also means a prompt-injection-style string in the product data cannot simply tell the system to mark itself as remediated.

### Remedy workflow

`lib/domain/workflow.ts` controls the allowed state changes.

It blocks submission when evidence is missing. It rejects the wrong provider confirmation. It prevents the same submission from being sent twice. It also refuses to restore an impossible saved state when the browser reloads.

I treated “done” as a state that has to be proven, not a sentence the agent can say.

### The Strands agent

The actual agent code is in `services/agent/`.

It uses `strands.Agent`, `strands.models.BedrockModel`, `BedrockAgentCoreApp`, and Pydantic validation.

The agent gets only five tools:

1. `inspect_remedy_contract`
2. `prepare_sandbox_claim`
3. `request_physical_evidence`
4. `submit_sandbox_claim`
5. `check_sandbox_outcome`

That small tool set is intentional.

The agent receives a Remedy Contract that has already passed the exact-match checks. From there it can prepare the request, stop for the required human action, submit only to the sandbox, and check the sandbox outcome.

It cannot create its own recall, turn a fuzzy match into an exact one, skip missing evidence, or mark its own work complete.

## Running the real Strands agent on AgentCore

I wanted to make sure the Strands integration was more than code that looked deployable.

I temporarily deployed the actual `services/agent/` runtime to Amazon Bedrock AgentCore and invoked it with a synthetic exact-match Remedy Contract.

The invocation returned HTTP 200. Bedrock selected `prepare_sandbox_claim`, and that tool call appeared in CloudWatch. The exact request, response, and sanitized log are committed in the repository under `docs/evidence/agentcore-runtime-verification.md`.

After I captured the proof, I deleted the temporary runtime and the related temporary AWS resources.

The public browser demo is not connected to that deleted runtime. It mirrors the same workflow locally so the judge path stays fast and deterministic. I have kept that distinction visible instead of pretending the demo is doing something it is not.

## Testing

A product-safety workflow is mostly interesting when something goes wrong, so I spent a lot of time testing the blocked paths as well as the happy path.

The repository has Vitest, Pytest, Playwright, and GitHub Actions checks for things like:

- exact, possible, and no-match separation
- missing evidence
- forged provider confirmations
- illegal workflow transitions
- contract binding
- idempotent sandbox submission
- browser reload/state validation
- desktop and mobile flows
- browser console errors

There is also a stress test that tries 1,000 wrong model variants and makes sure none of them are upgraded to an exact match.

## Challenges I ran into

### Where should the agent stop?

This was the main design problem.

Every time I gave the model more freedom, I had to ask whether that freedom was actually useful or just made the demo look more “AI.”

I ended up keeping four things outside the model: the official recall facts, exact product identity, proof that a physical action happened, and the final completion decision.

That made the agent less magical on paper, but much easier to trust.

### Making the CPSC lookup reliable

The CPSC data is the right source, but a live public API can be unpredictable during a demo.

I did not want to silently swap in fake data, so the UI shows whether the result came from the live API or from the bundled official snapshot. That way the demo stays usable without hiding where the data came from.

### Getting the real cloud path working

The AgentCore deployment took more work than the local flow because I wanted to deploy the actual agent files, invoke the real Bedrock-backed path, capture the tool call, and then clean everything up afterward.

That proof ended up being useful because it shows exactly where the model participated and which tool it chose.

### Deciding what “complete” means

My first instinct was to treat “claim submitted” as success.

That felt wrong. A person does not care that software filled a form; they care that the recall was dealt with.

So RecallZero keeps the case open after submission. It only moves to `REMEDIATED` when the evidence and provider confirmation both check out for the same contract.

## Accomplishments that I'm proud of

I am most proud that a wrong product cannot talk its way through the system.

The demo can show a complete path from a receipt to a verified remedy, but the exact-match decision is still deterministic and testable.

I also got the real Strands agent running on Bedrock AgentCore, captured the Bedrock-driven tool call, and kept the proof in the repository instead of asking judges to take that part on faith.

And I like the fact that the end of the demo is not a flashy AI response. It is just one number changing to zero: no unresolved recalled products left in the case.

## What I learned

The biggest thing I learned is that “end to end” does not have to mean “the agent does everything.”

A useful agent can handle most of the boring middle while still knowing when the next step belongs to a person or another system.

I also came away with a much clearer line between reasoning and authority. The model can decide which allowed step to take next. It should not decide whether the underlying safety fact is true just because that would be convenient.

That idea is bigger than recalls. A lot of official and administrative processes already have rules, required documents, and approval steps. The frustrating part is often the repeated checking, form filling, evidence gathering, submission, and follow-up in between. The same split could work for warranties, returns, insurance claims, government applications, compliance paperwork, and similar jobs where the agent can handle the repetition while the important facts and approvals stay independently verifiable.

## What's next

Right now the demo proves the workflow on one product. The next step is making product ownership automatic and opt-in.

I would add receipt and purchase-history imports, then expand the exact-match rules to more CPSC product categories. After that, I would replace the simulated provider result with signed provider callbacks and run the recall checks in the background.

The long-term version is a household safety inbox: you register the products you care about once, RecallZero keeps watching, and it only interrupts you when something you actually own needs a real action.