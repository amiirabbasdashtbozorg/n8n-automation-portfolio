# 🚀 n8n AI & Advanced Automation Portfolio

A curated collection of production-ready, enterprise-grade **n8n workflows** specializing in **Retrieval-Augmented Generation (RAG)**, **Headless Web Scraping & ETL**, **AI-Powered Multi-Source Automations**, and scalable backend integrations.

---

## 📂 Featured Projects

| Directory | Project Name | Core Technologies & Architecture |
| :--- | :--- | :--- |
| **[01-sut-rag-assistant](./01-sut-rag-assistant)** | **SUT Academic RAG Assistant** | n8n, LangChain, Google Gemini, Qdrant Cloud, PostgreSQL, Recursive Chunking, Next.JS, TypeScript, Rest APIs |
| **[02-khanoumi-price-tracker](./02-khanoumi-price-tracker)** | **E-Commerce Price Intelligence** | n8n, Browserless.io, Headless Chrome, JavaScript (ES6+), Google Sheets API |
| **[03-football-news-bot](./03-football-news-bot)** | **Sports Media & News Summarizer** | n8n, REST APIs, RSS/XML, OpenRouter (GPT-4o-mini), Telegram Bot API |
| **[04-game-master-x-n8n](./04-game-master-x-n8n)** | AI Board Game Recommender & Game Master | n8n, OpenRouter (LLMs), Webhooks, REST APIs, JavaScript (SPA) |

---

## 🛠️ Core Engineering Highlights & Expertise
* **Self-Hosted Infrastructure:** Developed and tested locally via Docker & Docker-Compose with strict environment variable isolation.
* **Resilience & Error Handling:** Implemented robust retry mechanisms (`Retry On Fail`), stateful deduplication, and fallback logic across external APIs and web scrapers.
* **Optimized Token Economy & Processing:** Pre-processing payloads using inline JavaScript transformations to minimize LLM inference costs and handle complex data structures.
* **Stateful Architectures:** Managing dynamic session states and persistent databases (PostgreSQL, Vector DBs) within automation workflows.

---

## 📬 Connect & Contact
If you'd like to discuss these architectures, review custom automation requirements, or explore potential collaborations, feel free to reach out!

- Email: amirabbasbzrg79@yahoo.com
- LinkedIn: https://www.linkedin.com/in/amirabbas-dashtbozorg-353a65387/

---

## 🐳 Quick Start (Docker)

Requirements: Docker with Compose v2.

```bash
cp .env.example .env
# edit .env: set POSTGRES_PASSWORD, N8N_ENCRYPTION_KEY (openssl rand -hex 32), N8N_VERSION, TZ
docker compose up -d
docker compose logs -f n8n   # wait for "Editor is now accessible"
```

Open http://localhost:5678, create the owner account, then for each project:

1. **Workflows → Import from file** and choose the project's `.json`.
2. Create the credentials listed below and attach them to the nodes.
3. Replace placeholders (`YOUR_TELEGRAM_CHAT_ID`, `YOUR_GOOGLE_SHEET_ID`) where noted.
4. **Activate** the workflow (production webhooks work only when Active).

| Project | Credentials / placeholders needed |
|:--|:--|
| 01 RAG assistant | Google Gemini (PaLM) API key, Qdrant (URL + API key), Postgres (host `postgres`, values from `.env`). Enable the disabled "PDF Upload Webhook" and "Qdrant Vector Indexer" nodes once, upload the PDFs in `01-sut-rag-assistant/data/`, then disable them again. Frontend: see its README. |
| 02 Price tracker | Browserless API token (Query Auth, parameter `token`), Google Sheets OAuth2, a sheet with headers `Product Name, Percentage Off, Price Before, Price After, URL` |
| 03 News bot | OpenRouter API key, football-data.org API token (Header Auth `X-Auth-Token`), Telegram bot token, your `chatId` |
| 04 Game Master | OpenRouter API key. Frontend: open `frontend/index.html` in a browser (webhook URL is set at the top of `renderResult`). |
