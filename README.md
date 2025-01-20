# Sidelines Homework

This project contains automated tests using [Playwright](https://playwright.dev/) for website analysis and API validation tasks. The tests validate performance, SEO, accessibility, best practices, and resource integrity, as well as API data consistency.

---

## **Setup Instructions**

### **Prerequisites**

1. Install [Node.js](https://nodejs.org/) (LTS version recommended).
2. Clone this repository to your local machine:
   ```bash
   git clone git@github.com:dizhar/sidelines-homework.git
   cd sidelines-homework
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

---

## **Scripts**

### **Run All Tests**

To execute all Playwright tests in the project, run:

```bash
npm run test
```

This will:

- Execute all test files in the `tests` directory.
- Generate a detailed Playwright report.

### **View Playwright Report**

After running the tests, view the detailed Playwright HTML report:

```bash
npm run show-report
```

The report provides insights into test results, logs, and any errors encountered.

---

## **Folder Structure**

```plaintext
project-root/
├── config/                     # Helper functions and configuration files
│   ├── helpers.js              # Reusable helper functions
│   ├── chromium-config.js      # Chromium browser configurations
├── reports/                    # Generated test reports
│   ├── lighthouse-report.json  # Lighthouse performance report
│   ├── validation-log-posts.json # API validation logs
├── tests/                      # Playwright test files
│   ├── api-validation.spec.js  # API validation tests
│   ├── lighthouse-analysis.spec.js # Website analysis tests
├── playwright-report/          # Generated Playwright HTML report
│   ├── index.html              # Main report file
├── package.json                # Project metadata and dependencies
├── README.md                   # Instructions for running the project
└── node_modules/               # Installed npm packages
```

---

## **Key Features**

### **1. Website Analysis**

- Tests analyze performance, SEO, accessibility, and best practices using Lighthouse.
- Results are stored in `lighthouse-report.json` and attached to the Playwright report.

### **2. Resource Validation**

- Checks all linked resources (CSS, JS, images) on a webpage.
- Logs broken or missing resources in the Playwright report.

### **3. API Data Validation**

- Validates API responses from free public APIs like JSONPlaceholder.
- Ensures posts have:
  - Non-empty `title` and `body`.
  - Valid numeric `userId`.
- Logs invalid entries in `reports/validation-log-posts.json`.

---

## **Customizing Tests**

### Add More APIs for Validation

1. Open `tests/api-validation.spec.js`.
2. Add more API endpoints to the `apiEndpoints` array:
   ```javascript
   const apiEndpoints = [
     { name: "Posts", url: "https://jsonplaceholder.typicode.com/posts" },
     { name: "Comments", url: "https://jsonplaceholder.typicode.com/comments" },
   ];
   ```
3. Save and run the tests:
   ```bash
   npm run test
   ```

---

## **Troubleshooting**

### Tests Fail with Missing Dependencies

- Ensure all dependencies are installed:
  ```bash
  npm install
  ```

### HTML Report Not Opening

- Check if the Playwright report exists in `playwright-report/`.
- Regenerate the report:
  ```bash
  npm run test
  npm run show-report
  ```

---

For additional help or questions, feel free to reach out! 🚀
