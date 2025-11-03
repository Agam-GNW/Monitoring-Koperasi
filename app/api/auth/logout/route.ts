import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({
    message: 'Logout berhasil',
    success: true
  });

  // Clear the auth cookie with proper options
  response.cookies.set('auth-token', '', {
    expires: new Date(0),
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  });

  return response;
}
