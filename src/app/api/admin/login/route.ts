import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const accessCode = body?.accessCode as string | undefined;
    const expected = process.env.ADMIN_ACCESS_CODE;

    if (!expected) {
      return NextResponse.json(
        { error: 'ADMIN_ACCESS_CODE is not configured on the server' },
        { status: 500 }
      );
    }

    if (!accessCode || accessCode !== expected) {
      return NextResponse.json({ error: 'Invalid access code' }, { status: 401 });
    }

    const res = NextResponse.json({ ok: true });
    res.cookies.set('cafein_admin', '1', {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 1 day
    });
    return res;
  } catch {
    return NextResponse.json({ error: 'Unexpected server error' }, { status: 500 });
  }
}
