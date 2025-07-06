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

export async function POST(request: NextRequest) {
    try {
        const { phoneNumber } = await request.json();
        
        if (!phoneNumber) {
            return NextResponse.json({ error: 'Missing phone number' }, { status: 400 });
        }

        // Look up user by phone number
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('phone_number', phoneNumber)
            .single();

        if (error) {
            // User not found - return null (not an error)
            if (error.code === 'PGRST116') {
                return NextResponse.json(null, { status: 200 });
            }
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error('Error getting user by phone:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}