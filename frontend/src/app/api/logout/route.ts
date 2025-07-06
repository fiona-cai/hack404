import { NextResponse } from 'next/server';

export async function POST() {
    try {
        // Create response
        const response = NextResponse.json({ 
            message: 'Logged out successfully' 
        }, { status: 200 });
        
        // Clear the userId cookie
        response.cookies.set('userId', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            expires: new Date(0), // Set to past date to delete
            path: '/'
        });

        return response;
    } catch (error) {
        return NextResponse.json({ 
            error: `Failed to logout: ${(error as Error).message}` 
        }, { status: 500 });
    }
}
