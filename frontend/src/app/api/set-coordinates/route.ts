import supabase from '@/lib/database';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { userId, latitude, longitude } = body;

        if (!userId || !latitude || !longitude) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        await supabase.from('coordinates').insert({ user_id: userId, latitude, longitude });

        return NextResponse.json({ message: 'Coordinates added successfully' }, { status: 201 });
    } catch (error: unknown) {
        return NextResponse.json({ error: `Internal server error: ${(error as Error).message}` }, { status: 500 });
    }
}
