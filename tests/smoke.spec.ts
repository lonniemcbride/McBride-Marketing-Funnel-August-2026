import { test, expect, type Page } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import path from "node:path";

/**
 * Full submission smoke test, one run per track, each exercising a
 * different branching path so the two runs together cover CL3-required
 * (R1), and both the Entry and Principal add-on branches (R2-R4) — plus a
 * real resume upload through the signed-URL flow both times.
 *
 * Runs against the same Supabase project the app actually uses (no
 * separate test project) — see the CI workflow / README for why. Every
 * row this file creates is named "CI Smoke Test — <run marker>" so it can
 * be found and deleted, both in this file's own cleanup and in the
 * self-healing sweep at the top in case a previous run's cleanup never
 * completed.
 */

const RESUME_PATH = path.join(__dirname, "fixtures", "resume.pdf");
const RUN_MARKER = `${Date.now()}`;
const NAME_PREFIX = "CI Smoke Test";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

async function deleteMatchingRows(table: string, bucket: string) {
  const { data: rows } = await supabaseAdmin
    .from(table)
    .select("id, resume_path")
    .like("c1_full_name", `${NAME_PREFIX}%`);

  for (const row of rows ?? []) {
    if (row.resume_path) {
      await supabaseAdmin.storage.from(bucket).remove([row.resume_path]);
    }
    await supabaseAdmin.from(table).delete().eq("id", row.id);
  }
}

test.beforeAll(async () => {
  // Self-healing: clean up anything a previous run left behind (e.g. a
  // crash before its own cleanup ran) before adding this run's rows.
  await deleteMatchingRows("nato_survey_responses", "resumes-nato");
  await deleteMatchingRows("air_force_survey_responses", "resumes-air-force");
});

test.afterAll(async () => {
  await deleteMatchingRows("nato_survey_responses", "resumes-nato");
  await deleteMatchingRows("air_force_survey_responses", "resumes-air-force");
});

async function fillContactAndResume(page: Page, email: string) {
  await page.fill('input[name="C1"]', `${NAME_PREFIX} — ${RUN_MARKER}`);
  await page.fill('input[name="C2"]', email);
  await page.fill('input[name="C3"]', "555-000-0000");
  await page.fill('input[name="C4"]', "Test City, USA");
  await page.setInputFiles('input[type="file"]', RESUME_PATH);
  await page.click('button:has-text("Continue")');
}

async function finishMotivationAndLogistics(page: Page) {
  await page.fill('textarea[name="M1"]', "Smoke test submission.");
  await page.click('input[type="checkbox"][value="Mission impact"]');
  await page.selectOption('select[name="M3"]', "Actively searching");
  await page.click('button:has-text("Continue")');

  await page.selectOption('select[name="W1"]', "Hybrid");
  await page.selectOption('select[name="W2"]', "Yes");
  await page.selectOption('select[name="W3"]', "Yes");
  await page.selectOption('select[name="W4"]', "2 weeks");
  await page.click('button:has-text("Continue")');
}

async function submitAndAwaitThankYou(page: Page) {
  await page.click('input[type="checkbox"][name="CN1"]');
  await page.selectOption('select[name="CN2"]', "Email");
  // Turnstile (test site key) needs a moment to render and auto-resolve.
  await expect(page.locator('button:has-text("Submit My Profile")')).toBeEnabled({
    timeout: 15_000,
  });
  await page.click('button:has-text("Submit My Profile")');
  await page.waitForURL(/thank-you/, { timeout: 15_000 });
}

test.describe("NATO", () => {
  test("full submission: active clearance requires CL3, Entry add-on, resume upload", async ({
    page,
  }) => {
    await page.goto("/nato/survey", { waitUntil: "networkidle" });
    await fillContactAndResume(page, `nato-smoke-${RUN_MARKER}@example.com`);

    await page.selectOption('select[name="CL1"]', "U.S. Citizen");
    await page.selectOption('select[name="CL2"]', "Active");

    // Regression guard for the fixed "clearance cross-field check silently
    // skipped mid-wizard" bug: continuing without CL3 must be blocked.
    await page.click('button:has-text("Continue")');
    await expect(page.locator('select[name="CL2"]')).toBeVisible();
    await expect(page.locator("text=Clearance level is required")).toBeVisible();

    await page.selectOption('select[name="CL3"]', "Secret");
    await page.click('button:has-text("Continue")');

    await page.selectOption('select[name="P1"]', "Cybersecurity");
    await page.selectOption('select[name="P2"]', "0–2");
    await page.selectOption('select[name="P3"]', "Entry");
    await page.click('button:has-text("Continue")');

    await finishMotivationAndLogistics(page);

    await expect(page.locator("h2")).toContainText("Entry-Level Add-On");
    await page.click('button:has-text("Continue")');

    await submitAndAwaitThankYou(page);
  });
});

test.describe("Air Force", () => {
  test("full submission: Principal add-on, resume upload", async ({ page }) => {
    await page.goto("/air-force/survey", { waitUntil: "networkidle" });
    await fillContactAndResume(page, `af-smoke-${RUN_MARKER}@example.com`);

    await page.selectOption('select[name="CL1"]', "U.S. Citizen");
    await page.selectOption('select[name="CL2"]', "Active");
    await page.selectOption('select[name="CL3"]', "Top Secret");
    await page.click('button:has-text("Continue")');

    await page.selectOption('select[name="P1"]', "Program & Project Management");
    await page.selectOption('select[name="P2"]', "16+");
    await page.selectOption('select[name="P3"]', "Principal");
    await page.click('button:has-text("Continue")');

    await finishMotivationAndLogistics(page);

    await expect(page.locator("h2")).toContainText("Principal-Level Add-On");
    await page.click('button:has-text("Continue")');

    await submitAndAwaitThankYou(page);
  });
});
