import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendSMS } from "@/lib/sms";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

// TODO: STORE CATCHES AND LIST THEM OUT

export async function POST(req: NextRequest) {
  const { initiatorId, targetId } = await req.json();
  if (!initiatorId || !targetId) {
    return NextResponse.json({ error: 'Missing user IDs' }, { status: 400 });
  }

  // Fetch target user phone number and initiator profile
  const { data: targetUser, error: targetError } = await supabase
    .from('users')
    .select('phone_number')
    .eq('id', targetId)
    .single();
  if (targetError || !targetUser) {
    return NextResponse.json({ error: 'Target user not found' }, { status: 404 });
  }

  // Generate a unique link (could use a JWT or random token)
  const token = Math.random().toString(36).substring(2, 10);
  console.log(process.env.NEXT_PUBLIC_BASE_URL);
  const link = `${process.env.NEXT_PUBLIC_BASE_URL}/profile/${initiatorId}?token=${token}`;

  // Send SMS (real implementation)
  await sendSMS(targetUser.phone_number, `👋 Someone nearby wants to connect with you! Tap here to view their profile: ${link}`);

  return NextResponse.json({ success: true, link });
}
