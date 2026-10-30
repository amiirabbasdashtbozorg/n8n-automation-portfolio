# SUT Academic Copilot

A Persian-first, RTL chat interface for the SUT Academic Regulations RAG workflow built with Next.js, React, TypeScript, and n8n.

## Current scope

- Responsive RTL chat UI (desktop and mobile)
- New conversations and local browser conversation history
- Loading, error, retry, and copy-answer states
- Next.js server-side proxy to n8n
- No fabricated citations: source panel explains when structured source data is not available

## Requirements

- Node.js 20.9+ recommended
- npm
- The imported "SUT Academic RAG Assistant" workflow, set to Active (POST Webhook at   /webhook/sharif-copilot)
## Run locally

```bash
npm install
cp .env.example .env.local
```

Edit `.env.local` and set `N8N_CHAT_WEBHOOK_URL` to the production webhook URL of the imported workflow (default: http://localhost:5678/webhook/sharif-copilot). Do not expose this URL via a `NEXT_PUBLIC_` variable.

```bash
npm run dev
```

Open http://localhost:3000.

## Important: verify the n8n payload

The proxy currently sends:

```json
{
  "action": "sendMessage",
  "sessionId": "browser-conversation-id",
  "chatInput": "student question"
}
```

This is a common Chat Trigger payload shape, but verify it against the exact n8n version, Chat Trigger configuration, and a successful request in your environment. If your workflow expects different field names, update `src/app/api/chat/route.ts`.

The UI currently recognizes text output under `output`, `text`, `response`, `answer`, or `message` (including an array containing an object with one of these keys). Adjust `getAnswerText` in `src/components/chat-app.tsx` if your actual response shape differs.

## Session behavior

Conversation IDs are stored in the browser and used as n8n `sessionId` values. The conversation list and messages are local to the current browser; they are not a server-backed, cross-device history. Confirm that the n8n Chat Trigger and Postgres Chat Memory use the same session key before relying on persistent model memory.

## Security notes

- `N8N_CHAT_WEBHOOK_URL` is server-only.
- The route validates input and has a 90-second upstream timeout.
- Add rate limiting and suitable authentication before exposing a public production deployment.
- Do not commit `.env.local`.
- The chat endpoint is not authenticated in this starter.

## Sources panel

The source panel is intentionally honest about the current limitation. The existing workflow's vector search tool does not automatically guarantee that citations and metadata are returned to the UI. Extend the n8n workflow to return structured source records before displaying source cards.

## Next steps

1. Verify actual request/response shapes against n8n.
2. Add tests for the API route and session behavior.
3. Extend the workflow to return grounded citations and source metadata.
4. Add server-backed conversation history only if needed.
5. Deploy the frontend and configure HTTPS, rate limiting, and access controls.
