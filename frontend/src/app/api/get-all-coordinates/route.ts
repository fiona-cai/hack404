import supabase from '@/lib/database';
import { NextResponse } from 'next/server';

export async function GET() {
    const { data, error } = await supabase
      .from('coordinates')
      .select('*');
    console.log('Fetched coordinates:', data, 'Error:', error);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ coordinates: data || [] }, { status: 200 });
}
