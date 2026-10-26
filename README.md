# 🚀 n8n AI & Advanced Automation Portfolio

A curated collection of production-ready, enterprise-grade **n8n workflows** specializing in **Retrieval-Augmented Generation (RAG)**, **Headless Web Scraping & ETL**, **AI-Powered Multi-Source Automations**, and scalable backend integrations.

---

## 📂 Featured Projects

| Directory | Project Name | Core Technologies & Architecture |
| :--- | :--- | :--- |
| **[01-sut-rag-assistant](./01-sut-rag-assistant)** | **SUT Academic RAG Assistant** | n8n, LangChain, Google Gemini, Qdrant Cloud, PostgreSQL, Recursive Chunking |
| **[02-khanoumi-price-tracker](./02-khanoumi-price-tracker)** | **E-Commerce Price Intelligence** | n8n, Browserless.io, Headless Chrome, JavaScript (ES6+), Google Sheets API |
| **[03-football-news-bot](./03-football-news-bot)** | **Sports Media & News Summarizer** | n8n, REST APIs, RSS/XML, OpenRouter (GPT-4o-mini), Telegram Bot API |
| *Coming Soon* | *Future AI/Automation Project* | *Scalable Webhooks, Multi-Tool Agents, CRM Integrations* |

---

## 🛠️ Core Engineering Highlights & Expertise
* **Self-Hosted Infrastructure:** Developed and tested locally via Docker & Docker-Compose with strict environment variable isolation.
* **Resilience & Error Handling:** Implemented robust retry mechanisms (`Retry On Fail`), stateful deduplication, and fallback logic across external APIs and web scrapers.
* **Optimized Token Economy & Processing:** Pre-processing payloads using inline JavaScript transformations to minimize LLM inference costs and handle complex data structures.
* **Stateful Architectures:** Managing dynamic session states and persistent databases (PostgreSQL, Vector DBs) within automation workflows.

---

## 📬 Connect & Contact
If you'd like to discuss these architectures, review custom automation requirements, or explore potential collaborations, feel free to reach out!

---

## 🐳 Self-Hosted Infrastructure (Docker Setup)
All workflows in this repository are developed and tested on a self-hosted **n8n** instance backed by **PostgreSQL** using Docker. 

To spin up the local environment, use the provided `docker-compose.yml` file:

```bash
# Start containers in detached mode
docker compose up -d

# Access n8n locally
http://localhost:5678