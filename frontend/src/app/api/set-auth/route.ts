import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();
    
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    // Set the authentication cookie
    const cookieStore = await cookies();
    cookieStore.set('userId', userId.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
      path: '/'
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error setting auth cookie:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
