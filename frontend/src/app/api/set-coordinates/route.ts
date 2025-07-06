import supabase from '@/lib/database';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { userId, latitude, longitude } = body;

        if (!userId || latitude === undefined || longitude === undefined) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        // Round latitude and longitude to 6 decimal places
        const roundedLatitude = Number(latitude).toFixed(6);
        const roundedLongitude = Number(longitude).toFixed(6);

        await supabase
            .from('coordinates')
            .upsert({ user_id: userId, latitude: parseFloat(roundedLatitude), longitude: parseFloat(roundedLongitude) });
        console.log(`Coordinates added for user ${userId}: (${latitude}, ${longitude})`);
        return NextResponse.json({ message: 'Coordinates added successfully' }, { status: 201 });
    } catch (error: unknown) {
        return NextResponse.json({ error: `Internal server error: ${(error as Error).message}` }, { status: 500 });
    }
}
