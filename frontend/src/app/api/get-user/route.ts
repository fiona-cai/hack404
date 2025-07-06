import supabase from '@/lib/database';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    // Get userId from query params
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }
    const userIdNum = Number(userId);
    if (isNaN(userIdNum)) {
      return NextResponse.json({ error: 'Invalid userId' }, { status: 400 });
    }
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userIdNum)
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ user: data || [] }, { status: 200 });
}
