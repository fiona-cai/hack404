import { getUserIdFromCookies } from '@/lib/auth-utils';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const userId = await getUserIdFromCookies();
        
        if (userId) {
            return NextResponse.json({ 
                isLoggedIn: true, 
                userId 
            }, { status: 200 });
        } else {
            return NextResponse.json({ 
                isLoggedIn: false, 
                userId: null 
            }, { status: 200 });
        }
    } catch (error) {
        return NextResponse.json({ 
            error: `Failed to check auth: ${(error as Error).message}`,
            isLoggedIn: false,
            userId: null
        }, { status: 500 });
    }
}
