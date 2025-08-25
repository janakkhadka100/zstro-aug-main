// app/(chat)/api/astrology/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import { auth } from '@/app/(auth)/auth';
import prokeralaService from '@/lib/prokerala/service';
import { generateAstroPrompt } from '@/lib/prokerala/prompts';

// Force this API to run dynamically (no static export issues)
export const dynamic = 'force-dynamic';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type UserQuery = {
  question: string;
  birthDate: string;
  birthTime: string;
  birthPlace: string;
};

// This is a *loose* shape to accept whatever your prompt builder returns.
type AstroPromptTemplate =
  | string
  | {
      prompt?: string;
      user?: string;
      system?: string;
      messages?: { role: 'system' | 'user'; content: string }[];
    };

function badRequest(msg: string) {
  return NextResponse.json({ ok: false, error: msg }, { status: 400 });
}

function serverError(msg: string) {
  return NextResponse.json({ ok: false, error: msg }, { status: 500 });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // 0) Auth (optional — keep if you want to gate the API)
    const session = await auth().catch(() => null);
    if (!session?.user) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    // 1) Parse & validate input
    const body = (await req.json()) as Partial<UserQuery>;
    const question = (body.question ?? '').toString().trim();
    const birthDate = (body.birthDate ?? '').toString().trim();
    const birthTime = (body.birthTime ?? '').toString().trim();
    const birthPlace = (body.birthPlace ?? '').toString().trim();

    if (!question) return badRequest('Question is required');
    if (!birthDate || !birthTime || !birthPlace) {
      return badRequest('Birth details are required (birthDate, birthTime, birthPlace)');
    }

    const userQuery: UserQuery = { question, birthDate, birthTime, birthPlace };

    // 2) Fetch astrology data from your service
    let astrologyData: any;
    try {
      astrologyData = await prokeralaService.getAstrologyData(userQuery);
    } catch (err: any) {
      const detail = err?.response?.data || err?.message || 'Unknown error';
      return serverError(`Failed to fetch astrological data: ${detail}`);
    }

    // 3) Build prompt: accept multiple possible return shapes from generateAstroPrompt()
    const tpl = (await generateAstroPrompt(userQuery, astrologyData)) as AstroPromptTemplate;

    let systemText =
      'You are an astrology assistant. Give clear, friendly guidance. Keep it concise and practical.';
    let userText = '';
    let messagesForOpenAI: { role: 'system' | 'user'; content: string }[] | null = null;

    if (typeof tpl === 'string') {
      userText = tpl;
    } else if (tpl?.messages && Array.isArray(tpl.messages)) {
      messagesForOpenAI = tpl.messages;
    } else if (tpl && (tpl.user || tpl.system || tpl.prompt)) {
      if (tpl.system) systemText = tpl.system;
      userText = tpl.user ?? tpl.prompt ?? '';
    } else {
      // Fallback – never let it be empty so the call types always match
      userText = JSON.stringify({ question, birthDate, birthTime, birthPlace, astrologyData });
    }

    // 4) OpenAI call (non-streaming to keep the type `Promise<Response>` friendly)
    if (!process.env.OPENAI_API_KEY) {
      return serverError('Missing OPENAI_API_KEY in environment variables.');
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.7,
      messages:
        messagesForOpenAI ??
        ([
          { role: 'system', content: systemText },
          { role: 'user', content: userText },
        ] as const),
    });

    const answer =
      completion.choices?.[0]?.message?.content?.toString().trim() ||
      'क्षमाप्रार्थी छु, अहिले उत्तर निकाल्न सकिँएन।';

    // 5) Return JSON
    return NextResponse.json({
      ok: true,
      answer,
      astrologyData,
    });
  } catch (err: any) {
    const msg = err?.message || 'Internal Server Error';
    return serverError(msg);
  }
}
