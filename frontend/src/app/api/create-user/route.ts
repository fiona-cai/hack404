import supabase from '@/lib/database';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { name, phoneNumber, birthday, interests, avatar } = body;

        if (!name || !phoneNumber  || interests === null || interests === undefined || !avatar) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        const { data, error } = await supabase.from('users').insert({ 
            name, 
            phone_number: phoneNumber, 
            birthday, 
            interests, 
            avatar 
        }).select().single();

        if (error) {
            return NextResponse.json({ error: `Failed to create user: ${(error as Error).message}` }, { status: 500 });
        }

        // Create response with user data
        const response = NextResponse.json({ data, userId: data.id }, { status: 201 });
        
        const cookieStore = await cookies();
        // Set userId cookie that expires in 30 days
        cookieStore.set('userId', data.id.toString(), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
            path: '/'
        });

        return response;
    } catch (error: unknown) {
        return NextResponse.json({ error: `Internal server error: ${(error as Error).message}` }, { status: 500 });
    }
}
