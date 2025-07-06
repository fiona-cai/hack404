import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getRandomCard } from '@/lib/gotcha-cards';
import { logGotchaEvent } from '@/lib/gotcha-events';
import { Database } from '@/lib/database.types';

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { userAId, userBId, preferStatic, location } = await req.json();

    if (!userAId || !userBId) {
      return NextResponse.json({ 
        error: 'Missing required user IDs' 
      }, { status: 400 });
    }

    const { data: userAData, error: userAError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userAId)
      .single();

    const { data: userBData, error: userBError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userBId)
      .single();

    if (userAError || !userAData || userBError || !userBData) {
      return NextResponse.json({ 
        error: 'Could not fetch user data' 
      }, { status: 404 });
    }

    const userA = userAData;
    const userB = userBData;

    if (!userA || !userB) {
      return NextResponse.json({ 
        error: 'Invalid user IDs' 
      }, { status: 400 });
    }

    // Generate or select a card
    const card = await getRandomCard({
      userA: {
        id: userA.id,
        name: userA.name,
        interests: userA.interests
      },
      userB: {
        id: userB.id,
        name: userB.name,
        interests: userB.interests
      },
      location: location ? {
        lat: location.lat,
        lng: location.lng
      } : undefined
    }, preferStatic === false); // forceDynamic if preferStatic is false

    if (!card) {
      return NextResponse.json({ 
        error: 'Failed to generate card' 
      }, { status: 500 });
    }

    // Log the gotcha event
    const event = await logGotchaEvent(userAId, userBId, card.id, location);

    if (!event) {
      return NextResponse.json({ 
        error: 'Failed to log event' 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      card,
      event,
      users: { userA, userB }
    });

  } catch (error) {
    console.error('Generate card error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
