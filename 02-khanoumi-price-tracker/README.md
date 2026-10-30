# 🛍️ Automated E-Commerce Price Intelligence & Discount Tracker

An end-to-end automated ETL & data aggregation pipeline built in **n8n** that continuously monitors e-commerce flash sales, cleanses multi-currency/bilingual pricing data, and syncs updates to Google Sheets in near real-time.

![Workflow Architecture](./assets/workflow-preview.png)

---

### ⚙️ Architecture & Technical Highlights
* **Headless Browser Orchestration (Browserless.io / Chromium):** Bypasses client-side rendering (CSR/SSR) bottlenecks and dynamic DOM injection (React/Next.js) by orchestrating a remote headless Chrome instance with selector-wait conditions.
* **DOM Parsing & Regex Transformation:** Extracts unstructured HTML fragments, parses multi-tier pricing, handles Persian/Arabic numeral normalization to numeric formats, and filters exclusive badge attributes (`جدید`).
* **Stateful Deduplication & Composite Keys:** Leverages custom JavaScript logic to generate unique state hashes (`URL + Price After`), ensuring efficient API usage while instantly triggering updates when prices drop.
* **Idempotent Data Sync (Google Sheets):** Executes an upsert workflow matching primary keys (`URL`) to prevent row fragmentation and maintain historical price accuracy.

---

### 🛠️ Tech Stack & Tools
* **Workflow Engine:** `n8n` (Self-Hosted via Docker)
* **Web Scraping:** Browserless / Headless Chrome
* **Data Processing:** JavaScript (ES6+, Regex, DOM Selectors)
* **Storage / Sink:** Google Sheets API (Upsert Operations)

---

## 🚀 Setup

1. Import `Khanoumi Website Extractor.json` into n8n.
2. Create a **Query Auth** credential for the Browserless node: name `token`, value = your Browserless API token.
3. Create a Google Sheet with this exact header row: `Product Name | Percentage Off | Price Before | Price After | URL`.
4. In the "Upsert to Google Sheets" node, connect your Google Sheets OAuth2 credential and replace `YOUR_GOOGLE_SHEET_ID` with the ID from the sheet URL (`.../spreadsheets/d/<ID>/edit`).
5. Execute once manually, then activate (runs every 30 minutes).

## ⚠️ Known limitations

- The target site (khanoumi.com) may be unreachable from outside Iran.
- CSS selectors (`a.relative`) depend on the site's current markup and may need updating.
