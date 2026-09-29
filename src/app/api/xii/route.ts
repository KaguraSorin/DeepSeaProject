import { NextResponse } from 'next/server';
import type { XiiRequest } from '@/types/chat';
import { generateXiiResponse } from '@/lib/ai';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** POST /api/xii — 汐对话 / 计划生成 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as XiiRequest;
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'invalid body' }, { status: 400 });
    }
    const result = await generateXiiResponse({
      input: body.input || {},
      messages: Array.isArray(body.messages) ? body.messages : [],
    });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: 'xii failed', detail: err instanceof Error ? err.message : 'unknown' },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, agent: '汐', endpoint: 'POST /api/xii' });
}