const { test, chromium, expect } = require("@playwright/test");
const fs = require("fs");
const path = require("path");

test.describe("Lighthouse Analysis", () => {
  test("should analyze performance, SEO, accessibility, and best practices", async ({}, testInfo) => {
    const url = "https://www.cbssports.com/betting";

    // Dynamically import Lighthouse (ES Module)
    const lighthouse = await import("lighthouse");

    // Launch a separate Chromium instance with remote debugging enabled
    const chromiumArgs = [
      "--remote-debugging-port=9222",
      "--disable-background-networking",
      "--disable-default-apps",
      "--disable-extensions",
      "--disable-gpu",
      "--headless",
      "--no-first-run",
      "--no-sandbox",
      "--no-zygote",
      "--disable-dev-shm-usage",
      "--single-process",
    ];
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
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir);
      }

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
        const reportPath = path.join(reportsDir, "lighthouse-report.json");
        fs.writeFileSync(
          reportPath,
          JSON.stringify(lighthouseResult.lhr, null, 2)
        );

        testInfo.attach("Lighthouse Report", {
          body: JSON.stringify(lighthouseResult.lhr, null, 2),
          contentType: "application/json",
        });

        // Attach summary scores
        const scores = {
          Performance: lighthouseResult.lhr.categories.performance.score * 100,
          SEO: lighthouseResult.lhr.categories.seo.score * 100,
          Accessibility:
            lighthouseResult.lhr.categories.accessibility.score * 100,
          "Best Practices":
            lighthouseResult.lhr.categories["best-practices"].score * 100,
        };

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
        await browserContext.close();
      }
    });
  });

  test("Resource Validation: Check linked resources for errors", async ({
    page,
  }, testInfo) => {
    const url = "https://www.cbssports.com/betting";

    await test.step(`Validating resources on: ${url}`, async () => {
      const brokenResources = [];

      try {
        await page.goto(url);

        // Collect all linked resources (CSS, JS, images)
        const resources = await page.evaluate(() =>
          Array.from(
            document.querySelectorAll(
              "link[rel='stylesheet'], script[src], img[src]"
            ),
            (el) => el.src || el.href
          ).filter((url) => url)
        );

        testInfo.attach("Linked Resources", {
          body: JSON.stringify(resources, null, 2),
          contentType: "application/json",
        });

        // Validate each resource
        for (const resource of resources) {
          try {
            const response = await page.goto(resource);
            // Log any broken links or resources returning HTTP status codes other than 200.
            if (response.status() !== 200) {
              brokenResources.push({
                resource,
                status: response ? response.status() : "No Response",
              });
            }
          } catch (err) {
            brokenResources.push({ resource, status: "Error" });
          }
        }

        // Attach broken resources to the test report
        if (brokenResources.length > 0) {
          testInfo.attach("Broken Resources", {
            body: JSON.stringify(brokenResources, null, 2),
            contentType: "application/json",
          });
        }

        // Add an expect to fail the test if there are broken resources
        expect(brokenResources).toHaveLength(
          0,
          `Found ${brokenResources.length} broken resources: ${brokenResources
            .map(({ resource, status }) => `${resource} [Status: ${status}]`)
            .join(", ")}`
        );
      } catch (error) {
        testInfo.attach("Validation Error", {
          body: error.message,
          contentType: "text/plain",
        });
        throw error;
      }
    });
  });
});
