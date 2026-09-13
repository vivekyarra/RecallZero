import { chromium } from "playwright";
import { execFileSync } from "node:child_process";
import { copyFile, mkdir, writeFile } from "node:fs/promises";

const outputDir = "out/demo-video";
const names = ["hook", "receipt", "cpsc", "contract", "human", "sandbox", "outcome", "architecture", "safety"];
const files = ["01-hook", "02-receipt", "03-cpsc", "04-contract", "05-human", "06-sandbox", "07-outcome", "08-architecture", "09-safety"];
const audioSeconds = files.map((name) => Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1", `${outputDir}/${name}.mp3`], { encoding: "utf8" }).trim().split("=")[1]));
const gapSeconds = 0.55;
await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({ channel: "chrome" });
const context = await browser.newContext({
  viewport: { width: 1600, height: 900 },
  deviceScaleFactor: 1,
  recordVideo: { dir: outputDir, size: { width: 1600, height: 900 } },
});
await context.addInitScript(() => {
  document.addEventListener("DOMContentLoaded", () => {
    const pointer = document.createElement("div");
    pointer.setAttribute("aria-hidden", "true");
    pointer.style.cssText = "position:fixed;left:1460px;top:810px;width:28px;height:34px;z-index:2147483647;pointer-events:none;filter:drop-shadow(0 2px 2px rgba(0,0,0,.3));";
    pointer.innerHTML = '<svg viewBox="0 0 28 34" width="28" height="34" xmlns="http://www.w3.org/2000/svg"><path d="M2 2v25l6.7-6.4 4.9 10 4.5-2.2-5-9.8H24Z" fill="#fff" stroke="#151a16" stroke-width="2" stroke-linejoin="round"/></svg>';
    document.documentElement.append(pointer);
    document.addEventListener("mousemove", (event) => {
      pointer.style.left = `${event.clientX}px`;
      pointer.style.top = `${event.clientY}px`;
    }, { passive: true });
    document.addEventListener("mousedown", () => {
      pointer.style.transform = "scale(.88)";
      pointer.style.filter = "drop-shadow(0 0 5px #166534)";
    });
    document.addEventListener("mouseup", () => {
      pointer.style.transform = "scale(1)";
      pointer.style.filter = "drop-shadow(0 2px 2px rgba(0,0,0,.3))";
    });
  });
});

const page = await context.newPage();
const video = page.video();
const videoStartMs = Date.now();
let cursor = { x: 1460, y: 810 };
let activeStartMs = 0;
const timing = [];
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function at(seconds) {
  await sleep(Math.max(0, activeStartMs + seconds * 1000 - Date.now()));
}
async function moveTo(locator) {
  await locator.scrollIntoViewIfNeeded();
  const box = await locator.boundingBox();
  if (!box) throw new Error("Target is not visible for cursor movement");
  const target = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
  const start = { ...cursor };
  for (let step = 1; step <= 19; step++) {
    const t = step / 19;
    const ease = t * t * (3 - 2 * t);
    await page.mouse.move(start.x + (target.x - start.x) * ease, start.y + (target.y - start.y) * ease);
    await sleep(14);
  }
  cursor = target;
}
async function click(locator) {
  await moveTo(locator);
  await sleep(100);
  await page.mouse.down();
  await sleep(95);
  await page.mouse.up();
}
async function scene(index, action) {
  activeStartMs = Date.now();
  const targetMs = (audioSeconds[index] + (index < 8 ? gapSeconds : 0)) * 1000;
  console.log(`${index + 1}. ${names[index]} — ${audioSeconds[index].toFixed(2)}s audio`);
  await action();
  const elapsedMs = Date.now() - activeStartMs;
  if (elapsedMs > targetMs + 250) throw new Error(`${names[index]} overran its audio by ${Math.round(elapsedMs - targetMs)}ms`);
  await sleep(Math.max(0, targetMs - elapsedMs));
  timing.push({ beat: names[index], targetSeconds: targetMs / 1000, actualSeconds: (Date.now() - activeStartMs) / 1000, actionSeconds: elapsedMs / 1000 });
}

try {
  await page.goto("https://recallzero.vercel.app", { waitUntil: "networkidle" });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: "networkidle" });
  const trimStartSeconds = (Date.now() - videoStartMs) / 1000;

  await scene(0, async () => {
    await at(2); await moveTo(page.locator(".hero h1"));
    await at(7); await moveTo(page.locator(".zeroCard"));
    await at(11); await moveTo(page.getByRole("button", { name: /Import demo receipt/i }));
  });
  await scene(1, async () => {
    await at(3); await click(page.getByRole("button", { name: /Import demo receipt/i }));
    await page.getByText("XR-8801", { exact: true }).waitFor();
    await at(7); await moveTo(page.locator(".assetFacts dd").nth(1));
    await at(10); await moveTo(page.locator(".assetFacts dd").nth(3));
    await at(12); await moveTo(page.locator(".verified"));
  });
  await scene(2, async () => {
    await at(1); await click(page.getByRole("button", { name: /Run live recall check/i }));
    await page.locator(".alertHead").getByText("RECALL CONFIRMED", { exact: true }).waitFor({ timeout: 15000 });
    await at(7); await moveTo(page.locator(".alertHead span"));
    await at(11); await moveTo(page.locator(".evidenceTable"));
    await at(15); await moveTo(page.getByRole("link", { name: /Open official record/i }));
  });
  await scene(3, async () => {
    await at(2); await click(page.getByRole("button", { name: /Let RecallZero handle it/i }));
    await page.getByText("One physical action.").waitFor();
    await at(7); await moveTo(page.locator(".humanGate h2"));
    await at(12); await moveTo(page.locator(".contractMini"));
    await at(16); await moveTo(page.getByRole("button", { name: /Use prepared synthetic proof/i }));
  });
  await scene(4, async () => {
    await at(4); await moveTo(page.locator(".safetyBox"));
    await at(10); await click(page.getByRole("button", { name: /Use prepared synthetic proof/i }));
    await at(12); await moveTo(page.getByRole("button", { name: /Submit to manufacturer sandbox/i }));
  });
  await scene(5, async () => {
    await at(1); await click(page.getByRole("button", { name: /Submit to manufacturer sandbox/i }));
    await page.getByText("Request received.").waitFor();
    await at(6); await moveTo(page.locator(".workflowPanel code").first());
    await at(10); await moveTo(page.getByRole("button", { name: /Fast-forward sandbox outcome/i }));
  });
  await scene(6, async () => {
    await at(1); await click(page.getByRole("button", { name: /Fast-forward sandbox outcome/i }));
    await at(7); await click(page.getByRole("button", { name: /Verify contract completion/i }));
    await page.getByText("The recalled product is resolved.").waitFor();
    await at(12); await moveTo(page.locator(".resolved h2"));
    await at(15); await moveTo(page.locator(".zeroCard"));
  });
  await scene(7, async () => {
    await at(2); await click(page.getByRole("button", { name: "How it works" }));
    await page.getByText("The model can plan.").waitFor();
    await at(7); await moveTo(page.getByText("Authority", { exact: true }));
    await at(11); await moveTo(page.getByText("Identity gate", { exact: true }));
    await at(15); await moveTo(page.getByText("Remedy runtime", { exact: true }));
  });
  await scene(8, async () => {
    await at(2); await click(page.getByRole("button", { name: "Simulate Attack" }));
    await page.getByText(/Actual match policy result:/).waitFor();
    await at(7); await click(page.getByRole("button", { name: "Test Bypass" }));
    await at(11); await click(page.getByRole("button", { name: "Test Forgery" }));
    await at(15); await click(page.getByRole("button", { name: "Inspect Strands SDK Trace" }));
    await page.getByRole("heading", { name: "Local SDK tool trace" }).waitFor();
    await at(19); await moveTo(page.getByRole("heading", { name: "Local SDK tool trace" }));
  });

  await writeFile(`${outputDir}/timing.json`, JSON.stringify({ trimStartSeconds, audioSeconds, gapSeconds, beats: timing }, null, 2));
  console.log(`Video starts after ${trimStartSeconds.toFixed(3)}s pre-roll; all ${timing.length} beats aligned`);
} finally {
  await context.close();
  await browser.close();
  if (video) await copyFile(await video.path(), `${outputDir}/recallzero-paced.webm`);
}
