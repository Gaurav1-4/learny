import { NextResponse } from 'next/server';

export async function GET() {
  const googleConfigured = Boolean(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
  );
  
  return NextResponse.json({ googleConfigured });
}
