## 📸 Preview

### 🎨 Frontend Interface
<p align="center">
  <img src="assets/user-interface.png" alt="Frontend Preview" width="85%"/>
</p>

### ⚙️ n8n Automation Workflow
<p align="center">
  <img src="assets/workflow.png" alt="Workflow Preview" width="85%"/>
</p>


# 🎓 SUT Academic Regulations Enterprise RAG Assistant

A production-ready, full-stack conversational Retrieval-Augmented Generation (RAG) system built for Sharif University students, featuring a modern Next.js frontend and an n8n-powered backend.

---

### 🏛️ Architecture & Technical Highlights
* **Full-Stack Decoupled Architecture:** Separates a high-performance Next.js (App Router) frontend interface from an advanced n8n RAG workflow via secure server-side API routes.
* **Advanced Conversational UI:** Implements a feature-rich SPA chat interface with persistent local storage, dynamic multi-session management, auto-titling, and interactive chat deletion/renaming.
* **Document Ingestion Pipeline:** Decoupled one-time sub-flow handling PDF parsing, recursive chunking, Google Gemini embeddings, and Qdrant Cloud vector indexing.
* **Advanced Query Transformation (CoT):** System prompt forces the LLM to analyze colloquial student terms (e.g., "مشروطی") and translate them into formal regulatory bylaws *before* vector search.
* **Persistent Session State:** Integrates PostgreSQL (`Postgres Chat Memory`) for dynamic multi-turn conversation tracking mapped directly to frontend session IDs.
* **Low-Latency Inference:** Powered by Google Gemini Flash Lite and Qdrant Cloud vector search as a callable tool (`search_sharif_rules`).

---

### 🛠️ Tech Stack & Tools
* **Frontend:** Next.js (App Router), TypeScript, Tailwind/Custom CSS, Lucide Icons
* **Workflow Engine & Backend:** `n8n` (Self-Hosted), Webhooks, REST APIs
* **Orchestration:** LangChain-powered AI Agents
* **LLM & Embeddings:** Google Gemini (`gemini-3.1-flash-lite`, `gemini-embedding-001`)
* **Vector Store:** Qdrant Cloud
* **Memory & Database:** PostgreSQL