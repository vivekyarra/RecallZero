import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test("completes the governed recall demo", async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });

  await expect(page.getByText("0", { exact: true }).first()).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("01-home.png"), fullPage: true });

  await page.getByRole("button", { name: /Import demo receipt/i }).click();
  await expect(page.getByText("XR-8801", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: /Run live recall check/i }).click();
  await expect(page.locator(".alertHead").getByText("RECALL CONFIRMED", { exact: true })).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText("MATCH", { exact: true })).toHaveCount(4);
  await page.screenshot({ path: testInfo.outputPath("02-recall-confirmed.png"), fullPage: true });

  await page.getByRole("button", { name: /Let RecallZero handle it/i }).click();
  await expect(page.getByText("One physical action.")).toBeVisible();
  await page.getByRole("button", { name: /Use prepared synthetic proof/i }).click();
  await page.getByRole("button", { name: /Submit to manufacturer sandbox/i }).click();
  await expect(page.getByText("Request received.")).toBeVisible();
  await page.getByRole("button", { name: /Fast-forward sandbox outcome/i }).click();
  await page.getByRole("button", { name: /Verify contract completion/i }).click();
  await expect(page.getByText("The recalled product is resolved.")).toBeVisible();
  await expect(page.getByText("Exactly where it should be")).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("03-resolved.png"), fullPage: true });
  expect(errors).toEqual([]);
});

test("explains the authority hierarchy", async ({ page }, testInfo) => {
  const howItWorks = page.getByRole("button", { name: "How it works" });
  await expect(howItWorks).toBeVisible();
  await howItWorks.click();
  await expect(page.getByText("The model can plan.")).toBeVisible();
  await expect(page.getByText("It cannot rewrite truth.")).toBeVisible();
  await expect(page.getByText("THE AGENT CANNOT")).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("architecture.png"), fullPage: true });
});
