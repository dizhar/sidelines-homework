/**
 * API Data Validation Test
 *
 * Brief Explanation of Approach:
 *
 * 1. **Define API Endpoints**:
 *    - Use an array (`apiEndpoints`) to define the API endpoints being tested, including their names and URLs.
 *
 * 2. **Fetch Data**:
 *    - Use the `fetchApiData` helper function to fetch data from the API.
 *    - Validate the HTTP response status and attach errors to the Playwright test report if any issues are found.
 *
 * 3. **Validate Data**:
 *    - Ensure each post meets the following criteria:
 *      - Non-empty `title` and `body`.
 *      - `userId` is a valid number.
 *    - Use the `validateApiData` helper function to identify invalid entries.
 *
 * 4. **Log Invalid Entries**:
 *    - Save invalid entries to a JSON log file in the `reports/` directory.
 *    - Attach the log file to the test report for easy debugging and auditing.
 *
 * 5. **Assertions**:
 *    - Fail the test if any invalid entries are found, providing detailed information in the logs.
 *
 * 6. **Modular Design**:
 *    - Reusable logic is abstracted into helper functions (`helpers.js`), including:
 *      - `ensureDirectoryExists`: Ensures the `reports` directory exists.
 *      - `fetchApiData`: Handles API requests and response validation.
 *      - `validateApiData`: Performs data validation.
 *      - `saveAndAttachLog`: Saves invalid entries to a file and attaches them to the test report.
 */

import { test, expect } from "@playwright/test";
import path from "path";
import {
  ensureDirectoryExists,
  fetchApiData,
  validateApiData,
  saveAndAttachLog,
} from "../config/helpers.js";

// Define the test data
const apiEndpoints = [
  { name: "Posts", url: "https://jsonplaceholder.typicode.com/posts" },
];

apiEndpoints.forEach(({ name, url }) => {
  test(`Validate data from ${name} API`, async ({}, testInfo) => {
    const reportsDir = path.resolve("./reports");
    ensureDirectoryExists(reportsDir);

    const logFilePath = path.join(
      reportsDir,
      `validation-log-${name.toLowerCase()}.json`
    );

    const data = await fetchApiData(url, testInfo, name);

    const invalidEntries = validateApiData(data, name);

    saveAndAttachLog(
      logFilePath,
      invalidEntries,
      testInfo,
      `Validation Log for ${name}`
    );

    expect(invalidEntries).toHaveLength(
      0,
      `Validation failed for ${invalidEntries.length} entries in the ${name} API. Check the attached log for details.`
    );
  });
});
