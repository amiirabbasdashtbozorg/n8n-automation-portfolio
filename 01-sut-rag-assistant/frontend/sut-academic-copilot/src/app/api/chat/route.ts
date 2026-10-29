import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // ارسال سوال کاربر به همراه شناسه یکتای گفتگو به سمت n8n
    const n8nResponse = await fetch("http://127.0.0.1:5678/webhook-test/sharif-copilot", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        question: body.message,
        sessionId: body.sessionId // این خط شناسه را به بک‌اند پاس می‌دهد
      }),
    });

    if (!n8nResponse.ok) {
      throw new Error(`خطای ارتباط با n8n: ${n8nResponse.status}`);
    }

    const data = await n8nResponse.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "ارتباط با دستیار شریف قطع شده است." },
      { status: 500 }
    );
  }
}