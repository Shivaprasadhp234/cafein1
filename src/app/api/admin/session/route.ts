import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const cookie = req.cookies.get('cafein_admin');
  const ok = cookie?.value === '1';
  return NextResponse.json({ ok });
}
