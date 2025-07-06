import { NextRequest, NextResponse } from 'next/server';
import { completeGotchaEvent } from '@/lib/gotcha-events';

export async function POST(req: NextRequest) {
  try {
    const { eventId, notes } = await req.json();

    if (!eventId) {
      return NextResponse.json({ 
        error: 'Missing event ID' 
      }, { status: 400 });
    }

    const result = await completeGotchaEvent(eventId, notes);

    if (!result) {
      return NextResponse.json({ 
        error: 'Failed to complete event' 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      event: result
    });

  } catch (error) {
    console.error('Complete event error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
