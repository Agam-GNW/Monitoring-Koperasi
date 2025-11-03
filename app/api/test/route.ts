import { NextResponse } from 'next/server';

export async function GET() {
  console.log('[/api/test] Test endpoint called');
  return NextResponse.json({ message: 'Test API is working!' });
}
