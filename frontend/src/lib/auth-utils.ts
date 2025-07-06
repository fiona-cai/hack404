import { cookies } from 'next/headers';

/**
 * Get userId from cookies (server-side)
 */
export async function getUserIdFromCookies(): Promise<number | null> {
  try {
    const cookieStore = await cookies();
    const userIdCookie = cookieStore.get('userId');
    
    if (userIdCookie && userIdCookie.value) {
      const userId = parseInt(userIdCookie.value);
      return isNaN(userId) ? null : userId;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting userId from cookies:', error);
    return null;
  }
}

/**
 * Get userId from cookies (client-side)
 */
export function getUserIdFromCookiesClient(): number | null {
  try {
    if (typeof document === 'undefined') {
      return null; // Not in browser
    }
    
    const cookies = document.cookie.split(';');
    const userIdCookie = cookies.find(cookie => 
      cookie.trim().startsWith('userId=')
    );
    
    if (userIdCookie) {
      const userId = parseInt(userIdCookie.split('=')[1]);
      return isNaN(userId) ? null : userId;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting userId from cookies (client):', error);
    return null;
  }
}

/**
 * Clear userId cookie (client-side)
 */
export function clearUserIdCookie(): void {
  if (typeof document !== 'undefined') {
    document.cookie = 'userId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  }
}

/**
 * Check if user is logged in based on cookie
 */
export function isUserLoggedIn(): boolean {
  return getUserIdFromCookiesClient() !== null;
}
