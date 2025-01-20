const fs = require("fs");

// Helper functions
export async function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath);
  }
}

export function saveReport(filePath, data, testInfo, label) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  testInfo.attach(label, {
    body: JSON.stringify(data, null, 2),
    contentType: "application/json",
  });
}

export async function closeBrowserContextSafely(browserContext) {
  try {
    await browserContext.close();
  } catch (error) {
    console.error("Error closing browser context:", error);
  }
}

export function extractLighthouseScores(lhr) {
  return {
    Performance: lhr.categories.performance.score * 100,
    SEO: lhr.categories.seo.score * 100,
    Accessibility: lhr.categories.accessibility.score * 100,
    "Best Practices": lhr.categories["best-practices"].score * 100,
  };
}

export async function collectResources(page) {
  return await page.evaluate(() =>
    Array.from(
      document.querySelectorAll(
        "link[rel='stylesheet'], script[src], img[src]"
      ),
      (el) => el.src || el.href
    ).filter((url) => url)
  );
}

export async function validateResources(page, resources) {
  const brokenResources = [];
  for (const resource of resources) {
    try {
      const response = await page.goto(resource);
      if (!response || response.status() !== 200) {
        brokenResources.push({
          resource,
          status: response ? response.status() : "No Response",
        });
      }
    } catch (err) {
      brokenResources.push({ resource, status: "Error" });
    }
  }
  return brokenResources;
}

export function attachToTestReport(
  testInfo,
  label,
  data,
  contentType = "application/json"
) {
  testInfo.attach(label, {
    body: typeof data === "string" ? data : JSON.stringify(data, null, 2),
    contentType,
  });
}

export async function fetchApiData(url, testInfo, label) {
  const response = await fetch(url);

  if (!response.ok) {
    const errorMsg = `Failed to fetch data from ${label}. Status: ${response.status}`;
    testInfo.attach("Fetch Error", {
      body: errorMsg,
      contentType: "text/plain",
    });
    throw new Error(errorMsg);
  }

  const data = await response.json();
  testInfo.attach(`Fetched Data from ${label}`, {
    body: JSON.stringify(data, null, 2),
    contentType: "application/json",
  });

  return data;
}

export function validateApiData(data, name) {
  const invalidEntries = [];
  data.forEach((item, index) => {
    const { userId, title, body, name: userName } = item;

    if (name === "Posts") {
      if (typeof userId !== "number" || !title?.trim() || !body?.trim()) {
        invalidEntries.push({
          index,
          userId,
          title,
          body,
          reason: [
            typeof userId !== "number" && "userId is not a number",
            !title?.trim() && "title is empty",
            !body?.trim() && "body is empty",
          ].filter(Boolean),
        });
      }
    }

    if (name === "Users") {
      if (!userName?.trim()) {
        invalidEntries.push({
          index,
          userName,
          reason: ["name is empty"],
        });
      }
    }
  });

  return invalidEntries;
}

export function saveAndAttachLog(filePath, data, testInfo, label) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  testInfo.attach(label, {
    path: filePath,
    contentType: "application/json",
  });
}
