"use client";

import {
  ArrowRight,
  Check,
  CheckCircle,
  Clock,
  FileArrowUp,
  Fingerprint,
  House,
  Info,
  Lightning,
  LinkSimple,
  LockKey,
  ShieldCheck,
  Sparkle,
  Warning,
  X,
} from "@phosphor-icons/react";
import { useEffect, useMemo, useReducer, useState } from "react";
import { DEMO_ASSET, INITIAL_DEMO_STATE } from "@/lib/domain/fixtures";
import { matchAssetToRecall } from "@/lib/domain/match";
import type { DemoState, RecallRecord } from "@/lib/domain/types";
import { workflowReducer } from "@/lib/domain/workflow";

const STORAGE_KEY = "recallzero-demo-v1";

function sourceLabel(recall: RecallRecord | null) {
  return recall?.sourceMode === "LIVE_CPSC" ? "LIVE CPSC" : "OFFICIAL SNAPSHOT";
}

function displayStatus(status: DemoState["status"]) {
  return status.replaceAll("_", " ");
}

export function RecallZeroApp() {
  const [state, dispatch] = useReducer(workflowReducer, INITIAL_DEMO_STATE);
  const [hydrated, setHydrated] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [view, setView] = useState<"home" | "architecture">("home");
  const [agentMode, setAgentMode] = useState("Not run");

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as DemoState;
        dispatch({ type: "HYDRATE", state: parsed });
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [hydrated, state]);

  const counts = useMemo(() => {
    const protectedCount = state.asset ? 18 : 17;
    const unresolved = ["RECALL_CONFIRMED", "REMEDIATING", "NEEDS_HUMAN", "AWAITING_PROVIDER"].includes(state.status) ? 1 : 0;
    const remediating = unresolved;
    return { protectedCount, safe: protectedCount - unresolved, unresolved, remediating };
  }, [state.asset, state.status]);

  async function runRecallCheck() {
    if (!state.asset) return;
    setBusy(true);
    setNotice(null);
    try {
      const response = await fetch("/api/recalls/check", { cache: "no-store" });
      if (!response.ok) throw new Error(`Recall check failed (${response.status})`);
      const payload = (await response.json()) as { recall: RecallRecord; warning: string | null };
      const match = matchAssetToRecall(state.asset, payload.recall);
      dispatch({ type: "CONFIRM_RECALL", recall: payload.recall, match });
      setNotice(payload.warning);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Recall check failed");
    } finally {
      setBusy(false);
    }
  }

  async function startRemedy() {
    if (!state.contract) return;
    setBusy(true);
    try {
      const response = await fetch("/api/agent/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contract: state.contract }),
      });
      if (!response.ok) throw new Error("Agent safety gate rejected the workflow");
      const result = (await response.json()) as { mode: string };
      setAgentMode(result.mode);
      dispatch({ type: "START_REMEDY" });
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Agent failed to start");
    } finally {
      setBusy(false);
    }
  }

  function resetDemo() {
    dispatch({ type: "RESET" });
    setNotice(null);
    setAgentMode("Not run");
    window.localStorage.removeItem(STORAGE_KEY);
  }

  if (view === "architecture") {
    return <ArchitectureView onClose={() => setView("home")} />;
  }

  return (
    <main className="shell">
      <header className="topbar">
        <button className="wordmark" onClick={() => setView("home")} aria-label="RecallZero home">
          <span className="mark"><ShieldCheck weight="fill" /></span>
          RECALL<span>ZERO</span>
        </button>
        <nav aria-label="Primary navigation">
          <button className="navLink active">Household</button>
          <button className="navLink" onClick={() => setView("architecture")}>How it works</button>
        </nav>
        <div className="livePill"><span /> Protection active</div>
      </header>

      <section className="hero">
        <div>
          <p className="eyebrow"><Sparkle weight="fill" /> Your household safety autopilot</p>
          <h1>A recall shouldn&apos;t<br />become <em>another task.</em></h1>
          <p className="heroCopy">When something you own becomes unsafe, RecallZero verifies it, handles the remedy, and stays on it until it&apos;s resolved.</p>
        </div>
        <div className={`zeroCard ${counts.unresolved ? "alert" : ""}`} aria-live="polite">
          <span className="zeroNumber">{counts.unresolved}</span>
          <div><strong>UNRESOLVED RECALLS</strong><small>{counts.unresolved ? "RecallZero is handling it" : "Exactly where it should be"}</small></div>
          {counts.unresolved ? <Clock weight="duotone" /> : <CheckCircle weight="fill" />}
        </div>
      </section>

      <section className="stats" aria-label="Household protection summary">
        <div><span>{counts.protectedCount}</span><p>Products protected</p></div>
        <div><span>{counts.safe}</span><p>Safe</p></div>
        <div className={counts.remediating ? "hot" : ""}><span>{counts.remediating}</span><p>Remediating</p></div>
        <div><span>24/7</span><p>Official monitoring</p></div>
      </section>

      {!state.asset && (
        <section className="demoLaunch panel">
          <div className="demoBadge">JUDGE DEMO · 90 SECONDS</div>
          <div className="launchCopy">
            <div className="receiptIcon"><FileArrowUp weight="duotone" /></div>
            <div>
              <h2>Watch a recall get finished.</h2>
              <p>Import a synthetic purchase receipt. The recall record is real; the manufacturer environment is safely sandboxed.</p>
            </div>
          </div>
          <button className="primary" onClick={() => dispatch({ type: "IMPORT_ASSET", asset: DEMO_ASSET })}>
            Import demo receipt <ArrowRight weight="bold" />
          </button>
          <div className="boundary"><Info weight="fill" /> No claim will be sent to a real manufacturer.</div>
        </section>
      )}

      {state.asset && (
        <div className="contentGrid">
          <section className="panel assetPanel">
            <div className="sectionHead">
              <div><p className="kicker">ASSET PASSPORT</p><h2>{state.asset.productName}</h2></div>
              <StatusPill status={state.status} />
            </div>
            <div className="productVisual" aria-hidden="true">
              <div className="dryer"><span /><span /><span /></div>
              <div className="modelTag">XR<br /><b>8801</b></div>
            </div>
            <dl className="assetFacts">
              <div><dt>Brand</dt><dd>{state.asset.brand}</dd></div>
              <div><dt>Model</dt><dd>{state.asset.model}</dd></div>
              <div><dt>Purchased</dt><dd>Mar 14, 2026</dd></div>
              <div><dt>Retailer</dt><dd>{state.asset.retailer}</dd></div>
            </dl>
            <div className="verified"><Check weight="bold" /> Receipt verified <span>SYNTHETIC DEMO</span></div>
          </section>

          <section className="panel workflowPanel">
            {!state.recall && (
              <WorkflowIntro busy={busy} onRun={runRecallCheck} />
            )}
            {state.recall && state.match && state.status === "RECALL_CONFIRMED" && (
              <RecallConfirmed state={state} busy={busy} onStart={startRemedy} />
            )}
            {state.status === "NEEDS_HUMAN" && (
              <HumanGate state={state} onEvidence={() => dispatch({ type: "RECORD_EVIDENCE", filename: "synthetic-xr8801-disabled.jpg" })} />
            )}
            {state.status === "REMEDIATING" && state.evidenceFile && (
              <SandboxSubmit state={state} onSubmit={() => dispatch({ type: "SUBMIT_SANDBOX" })} />
            )}
            {state.status === "AWAITING_PROVIDER" && !state.providerConfirmation && (
              <ProviderWait state={state} onAdvance={() => dispatch({ type: "CONFIRM_PROVIDER", confirmation: "SANDBOX-APPROVED-26754" })} />
            )}
            {state.status === "AWAITING_PROVIDER" && state.providerConfirmation && (
              <CompletionCheck onVerify={() => dispatch({ type: "VERIFY_COMPLETION" })} />
            )}
            {state.status === "REMEDIATED" && <Resolved state={state} />}
          </section>
        </div>
      )}

      {state.actions.length > 0 && (
        <section className="panel tracePanel">
          <div className="sectionHead">
            <div><p className="kicker">GOVERNED ACTION TRACE</p><h2>Everything around the physical step.</h2></div>
            <span className="modeBadge"><Lightning weight="fill" /> {agentMode.replaceAll("_", " ")}</span>
          </div>
          <div className="traceGrid">
            {state.actions.map((action) => (
              <article key={action.id} className={`traceItem ${action.status.toLowerCase()}`}>
                <div className="traceIcon">{action.status === "COMPLETE" ? <Check weight="bold" /> : <Clock weight="bold" />}</div>
                <div><small>{action.boundary}</small><strong>{action.title}</strong><p>{action.detail}</p></div>
              </article>
            ))}
          </div>
        </section>
      )}

      {state.timeline.length > 0 && (
        <section className="timelineSection">
          <div className="sectionHead"><div><p className="kicker">PROOF, NOT PROMISES</p><h2>Resolution timeline</h2></div><button className="textButton" onClick={resetDemo}>Reset demo</button></div>
          <div className="timeline">
            {state.timeline.map((item, index) => (
              <article key={item.id}>
                <div className="timelineRail"><span>{index + 1}</span>{index < state.timeline.length - 1 && <i />}</div>
                <div><small>{item.actor.replaceAll("_", " ")} · {new Date(item.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</small><strong>{item.title}</strong><p>{item.detail}</p>{item.receipt && <code>{item.receipt}</code>}</div>
              </article>
            ))}
          </div>
        </section>
      )}

      {notice && <div className="notice"><Info weight="fill" /> {notice}<button onClick={() => setNotice(null)} aria-label="Dismiss"><X /></button></div>}

      <footer>
        <span>RecallZero · Agents for Humans 2026</span>
        <span><LockKey weight="fill" /> Official facts stay authoritative. Actions stay governed.</span>
      </footer>
    </main>
  );
}

function StatusPill({ status }: { status: DemoState["status"] }) {
  const safe = status === "PROTECTED" || status === "REMEDIATED";
  return <span className={`statusPill ${safe ? "safe" : "danger"}`}>{safe ? <CheckCircle weight="fill" /> : <Warning weight="fill" />}{displayStatus(status)}</span>;
}

function WorkflowIntro({ busy, onRun }: { busy: boolean; onRun: () => void }) {
  return <div className="workflowIntro"><div className="radar"><span /><span /><ShieldCheck weight="duotone" /></div><p className="kicker">MONITORING</p><h2>Safety status last checked just now.</h2><p>Run the official check to compare this Asset Passport against current CPSC records.</p><button className="primary dangerButton" onClick={onRun} disabled={busy}>{busy ? "Checking official source…" : "Run live recall check"}<ArrowRight weight="bold" /></button><small className="sourceNote"><LinkSimple /> Official CPSC REST API · deterministic match policy</small></div>;
}

function RecallConfirmed({ state, busy, onStart }: { state: DemoState; busy: boolean; onStart: () => void }) {
  return <div className="recallConfirmed"><div className="alertHead"><div className="hazardIcon"><Warning weight="fill" /></div><div><p>RECALL CONFIRMED</p><h2>ELECTROCUTION · SHOCK · BURN</h2></div><span>{sourceLabel(state.recall)}</span></div><p className="stopUsing">STOP USING AND UNPLUG IMMEDIATELY</p><div className="evidenceTable">{state.match?.evidence.map((item) => <div key={item.field}><span>{item.label}</span><b>{item.assetValue}</b><strong><Check weight="bold" /> MATCH</strong></div>)}</div><div className="official"><p><b>CPSC #{state.recall?.recallNumber}</b> · Full refund</p><a href={state.recall?.url} target="_blank" rel="noreferrer">Open official record <LinkSimple /></a></div><button className="primary dangerButton" onClick={onStart} disabled={busy}>{busy ? "Opening governed workflow…" : "Let RecallZero handle it"}<ArrowRight weight="bold" /></button></div>;
}

function HumanGate({ state, onEvidence }: { state: DemoState; onEvidence: () => void }) {
  return <div className="humanGate"><div className="stepNumber">1</div><p className="kicker">RECALLZERO NEEDS YOU</p><h2>One physical action.</h2><p>With the product <b>unplugged</b>, the official remedy requires the power cord to be cut and a photo of the disabled product.</p><div className="safetyBox"><ShieldCheck weight="fill" /><div><strong>Safety first</strong><span>Never handle the product while connected to power. This demo accepts prepared synthetic evidence—do not damage a real product.</span></div></div><button className="primary" onClick={onEvidence}><FileArrowUp weight="bold" /> Use prepared synthetic proof</button><small>Everything after this is handled.</small><div className="contractMini"><Fingerprint /><span>Contract {state.contract?.id}</span><b>SANDBOX ONLY</b></div></div>;
}

function SandboxSubmit({ state, onSubmit }: { state: DemoState; onSubmit: () => void }) {
  return <div className="workflowIntro"><div className="radar ready"><span /><span /><CheckCircle weight="duotone" /></div><p className="kicker">EVIDENCE ACCEPTED</p><h2>The agent can continue.</h2><p><b>{state.evidenceFile}</b> is attached to the governed request. No email or claim has left the sandbox.</p><button className="primary" onClick={onSubmit}>Submit to manufacturer sandbox <ArrowRight weight="bold" /></button><small className="sourceNote"><LockKey /> Stable idempotency key · duplicate-safe</small></div>;
}

function ProviderWait({ state, onAdvance }: { state: DemoState; onAdvance: () => void }) {
  const receipt = state.timeline.find((item) => item.receipt)?.receipt;
  return <div className="workflowIntro"><div className="radar waiting"><span /><span /><Clock weight="duotone" /></div><p className="kicker">REMEDIATING</p><h2>Request received.</h2><p>Sandbox receipt <code>{receipt}</code>. Submission is not resolution, so RecallZero keeps monitoring.</p><button className="secondary" onClick={onAdvance}>Fast-forward sandbox outcome <ArrowRight weight="bold" /></button><small className="sourceNote"><Clock /> You don&apos;t need to do anything.</small></div>;
}

function CompletionCheck({ onVerify }: { onVerify: () => void }) {
  return <div className="workflowIntro"><div className="radar ready"><span /><span /><ShieldCheck weight="duotone" /></div><p className="kicker">OUTCOME VERIFY</p><h2>Refund approved.</h2><p>The provider confirmation and physical evidence now satisfy both completion predicates.</p><button className="primary" onClick={onVerify}>Verify contract completion <ArrowRight weight="bold" /></button></div>;
}

function Resolved({ state }: { state: DemoState }) {
  return <div className="resolved"><div className="resolvedMark"><Check weight="bold" /></div><p className="kicker">REMEDIATED</p><h2>The recalled product is resolved.</h2><p>Physical evidence recorded. Refund approved. Contract closed with confirmation <code>{state.providerConfirmation}</code>.</p><div className="resolvedMetrics"><div><span>$29.99</span><small>Value recovered</small></div><div><span>0</span><small>Open actions</small></div></div></div>;
}

function ArchitectureView({ onClose }: { onClose: () => void }) {
  const layers = [
    { icon: <House />, title: "Ownership", body: "Receipts become evidence-backed Asset Passports.", tag: "STRANDS TOOL" },
    { icon: <LinkSimple />, title: "Authority", body: "Current recall facts come from the official CPSC REST API.", tag: "LIVE DATA" },
    { icon: <Fingerprint />, title: "Identity gate", body: "Code—not an LLM—proves model, retailer, and purchase window.", tag: "DETERMINISTIC" },
    { icon: <Lightning />, title: "Remedy agent", body: "Strands plans and calls narrow tools from an immutable contract.", tag: "AGENTCORE READY" },
    { icon: <ShieldCheck />, title: "Outcome verify", body: "Evidence plus provider confirmation are required to close.", tag: "NON-BYPASSABLE" },
  ];
  return <main className="shell architecturePage"><header className="topbar"><button className="wordmark" onClick={onClose}><span className="mark"><ShieldCheck weight="fill" /></span>RECALL<span>ZERO</span></button><button className="secondary small" onClick={onClose}>Back to household</button></header><section className="architectureHero"><p className="eyebrow"><LockKey weight="fill" /> Authority before autonomy</p><h1>The model can plan.<br /><em>It cannot rewrite truth.</em></h1><p>RecallZero separates official facts, deterministic identity, agentic execution, human physical work, and verified outcomes.</p></section><section className="architectureFlow">{layers.map((layer, index) => <article key={layer.title}><div className="layerNumber">0{index + 1}</div><div className="layerIcon">{layer.icon}</div><div><small>{layer.tag}</small><h2>{layer.title}</h2><p>{layer.body}</p></div>{index < layers.length - 1 && <ArrowRight className="flowArrow" />}</article>)}</section><section className="permissionGrid"><div className="can"><h2>THE AGENT CAN</h2><ul><li><Check /> Interpret a verified remedy</li><li><Check /> Choose allowlisted tools</li><li><Check /> Prepare sandbox forms</li><li><Check /> Follow up on outcomes</li></ul></div><div className="cannot"><h2>THE AGENT CANNOT</h2><ul><li><X /> Invent or confirm a recall</li><li><X /> Override official instructions</li><li><X /> Contact real manufacturers in demo</li><li><X /> Mark itself remediated</li></ul></div></section><footer><span>Strands Agents SDK · Amazon Bedrock AgentCore-ready runtime</span><span><LockKey weight="fill" /> Safety is architecture, not a prompt.</span></footer></main>;
}
