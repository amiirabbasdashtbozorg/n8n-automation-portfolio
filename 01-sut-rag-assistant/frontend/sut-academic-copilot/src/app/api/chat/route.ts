import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const webhookUrl = process.env.N8N_CHAT_WEBHOOK_URL?.trim();

  if (!webhookUrl) {
    console.error("[chat] N8N_CHAT_WEBHOOK_URL is not set. Create .env.local (see .env.example) and restart the dev server.");
    return NextResponse.json({ error: "Server is not configured." }, { status: 500 });
  }

  let body: { message?: string; sessionId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body.message || typeof body.message !== "string") {
    return NextResponse.json({ error: "Message is required." }, { status: 400 });
  }

  try {
    const n8nResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify({
        question: body.message,
        sessionId: body.sessionId ?? "default",
      }),
      signal: AbortSignal.timeout(90_000),
      cache: "no-store",
    });

    const raw = await n8nResponse.text();

    if (!n8nResponse.ok) {
      console.error(`[chat] n8n returned ${n8nResponse.status} for ${webhookUrl}\n${raw.slice(0, 500)}`);
      return NextResponse.json({ error: `n8n returned ${n8nResponse.status}` }, { status: 502 });
    }

    try {
      return NextResponse.json(JSON.parse(raw));
    } catch {
      console.error(`[chat] n8n returned non-JSON response:\n${raw.slice(0, 500)}`);
      return NextResponse.json({ error: "n8n returned an invalid response." }, { status: 502 });
    }
  } catch (error) {
    console.error(`[chat] could not reach ${webhookUrl}:`, error);
    return NextResponse.json({ error: "Could not reach n8n." }, { status: 502 });
  }
}