/**
 * Website Analysis and Validation Task
 *
 * Brief Explanation of Approach:
 *
 * 1. **Performance, SEO, Accessibility, and Best Practices Analysis**:
 *    - The script uses Lighthouse to evaluate a given website's performance, SEO, accessibility, and adherence to best practices.
 *    - Scores for each category are extracted and saved in a report for further analysis.
 *    - Reports are stored as JSON files and attached to Playwright test results for easy access.
 *
 * 2. **Resource Validation**:
 *    - The script validates all linked resources (CSS, JS, images) on the webpage to ensure no broken links or missing assets.
 *    - Any broken resources are logged and attached to the test report.
 *    - If any broken resources are found, the test fails with a detailed log.
 *
 * 3. **Reusable and Modular Design**:
 *    - Key functionalities like resource collection, Lighthouse score extraction, and error logging are abstracted into helper functions.
 *    - This ensures code maintainability and reusability across other tests.
 *
 * How This Script Can Help Monitor Websites Over Time:
 *
 * - **Consistent Monitoring**:
 *   - By running this script periodically, teams can monitor the website's performance, SEO, accessibility, and best practices.
 *   - It helps identify regressions or areas for improvement over time.
 *
 * - **Broken Resource Detection**:
 *   - Detects and logs any broken resources or missing assets, ensuring the website remains functional and user-friendly.
 *
 * - **Historical Data**:
 *   - Saved reports serve as historical records to track progress and improvements.
 *
 * - **Automated Alerts**:
 *   - Test failures act as automated alerts, prompting immediate action to resolve issues before they affect users.
 */

const { test, chromium, expect } = require("@playwright/test");
const path = require("path");
import { chromiumArgs } from "../config/chromium-config.js";
import {
  ensureDirectoryExists,
  extractLighthouseScores,
  closeBrowserContextSafely,
  saveReport,
  collectResources,
  validateResources,
  attachToTestReport,
} from "../config/helpers.js";

test.describe("Website Analysis and Validation Task –", () => {
  test("should analyze performance, SEO, accessibility, and best practices", async ({}, testInfo) => {
    // Set test-level timeout to 3 minutes (60,000 ms)
    const url = "https://www.cbssports.com/betting";
    const reportsDir = path.resolve("./reports");
    const reportPath = path.join(reportsDir, "lighthouse-report.json");

    // Dynamically import Lighthouse (ES Module)
    const lighthouse = await import("lighthouse");

    const browserContext = await chromium.launchPersistentContext(
      "./user-data-dir",
      {
        args: chromiumArgs,
        headless: true,
      }
    );

    await test.step(`Running Lighthouse on: ${url}`, async () => {
      // Save reports in the root folder
      const reportsDir = path.resolve("./reports");

      // Ensure reports directory exists
      await ensureDirectoryExists(reportsDir);

      try {
        // Run Lighthouse
        const lighthouseResult = await lighthouse.default(url, {
          port: 9222,
          output: "json",
          logLevel: "info",
          onlyCategories: [
            "performance",
            "seo",
            "accessibility",
            "best-practices",
          ],
        });

        // Save the Lighthouse JSON report
        saveReport(
          reportPath,
          lighthouseResult.lhr,
          testInfo,
          "Lighthouse Report"
        );

        testInfo.attach("Lighthouse Report", {
          body: JSON.stringify(lighthouseResult.lhr, null, 2),
          contentType: "application/json",
        });

        // Attach summary scores
        const scores = extractLighthouseScores(lighthouseResult.lhr);

        testInfo.attach("Lighthouse Scores", {
          body: JSON.stringify(scores, null, 2),
          contentType: "application/json",
        });
      } catch (error) {
        testInfo.attach("Lighthouse Error", {
          body: error.message,
          contentType: "text/plain",
        });
        throw error;
      } finally {
        await closeBrowserContextSafely(browserContext);
      }
    });
  });

  test("Resource Validation: Check linked resources for errors", async ({
    page,
  }, testInfo) => {
    const url = "https://www.cbssports.com/betting";

    await test.step(`Validating resources on: ${url}`, async () => {
      try {
        await page.goto(url);

        // Collect all linked resources (CSS, JS, images)
        const resources = await collectResources(page);
        attachToTestReport(testInfo, "Linked Resources", resources);

        // Validate resources
        const brokenResources = await validateResources(page, resources);
        if (brokenResources.length > 0) {
          attachToTestReport(testInfo, "Broken Resources", brokenResources);
        }

        // If broken attach resources to the test report
        if (brokenResources.length > 0) {
          attachToTestReport(testInfo, "Broken Resources", brokenResources);
        }

        // Add an expect to fail the test if there are broken resources
        expect(brokenResources).toHaveLength(
          0,
          `Found ${brokenResources.length} broken resources: ${brokenResources
            .map(({ resource, status }) => `${resource} [Status: ${status}]`)
            .join(", ")}`
        );
      } catch (error) {
        attachToTestReport(
          testInfo,
          "Validation Error",
          error.message,
          "text/plain"
        );
        throw error;
      }
    });
  });
});
