import supabase from '@/lib/database';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { name, phoneNumber, birthday, interests, avatar } = body;

        if (!name || !phoneNumber || !birthday || !interests || !avatar) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        await supabase.from('users').insert({ name, phoneNumber, birthday, interests, avatar });

        return NextResponse.json({ message: 'User created successfully' }, { status: 201 });
    } catch (error: unknown) {
        return NextResponse.json({ error: `Internal server error: ${(error as Error).message}` }, { status: 500 });
    }
}
