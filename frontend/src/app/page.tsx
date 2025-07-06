'use client';

import { useEffect, useState } from 'react';
import CoordinatesComponent from './components/CoordinatesComponent';
import LoginPage from './login';
import MapComponent from './map';

export type User = {
  avatar: string;
  birthday: string;
  interests: string[];
  name: string;
  phoneNumber: string;
};

export default function ClientHome() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null); // null = loading
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [user, setUser] = useState<User>({
    avatar: '',
    birthday: '',
    interests: [] as string[],
    name: '',
    phoneNumber: '',
  });

  // Check authentication status on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/check-auth');
        const authData = await response.json();
        
        setIsLoggedIn(authData.isLoggedIn);
        setCurrentUserId(authData.userId);
        
        console.log('Auth check:', authData);
        console.log('User is logged in:', authData.isLoggedIn);
        console.log('Current user ID:', authData.userId);
      } catch (error) {
        console.error('Failed to check auth:', error);
        setIsLoggedIn(false);
        setCurrentUserId(null);
      }
    };

    checkAuth();
  }, []);

  // Show loading while checking auth
  if (isLoggedIn === null) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Loading...</h2>
        <p>Checking authentication status...</p>
      </div>
    );
  }

  // Show login page if not logged in
  if (!isLoggedIn) {
    const handleSetLoggedIn = (value: boolean | ((prevState: boolean) => boolean)) => {
      if (typeof value === 'function') {
        setIsLoggedIn(prev => value(prev === true));
      } else {
        setIsLoggedIn(value);
      }
    };
    
    return <LoginPage 
      user={user} 
      setUser={setUser} 
      setLoggedIn={handleSetLoggedIn} 
    />;
  }

  // Show main app if logged in
  return (
    <>
      {/* Display current user info */}
      <div style={{ padding: '10px', backgroundColor: '#e8f5e8', marginBottom: '10px' }}>
        <h3>Welcome! You are logged in</h3>
        <p>Your User ID: {currentUserId}</p>
        <button 
          onClick={async () => {
            try {
              // Call logout API to clear server-side cookie
              await fetch('/api/logout', { method: 'POST' });
              // Clear client-side state
              setIsLoggedIn(false);
              setCurrentUserId(null);
              console.log('Logged out successfully');
            } catch (error) {
              console.error('Logout failed:', error);
              // Fallback: clear client-side cookie manually
              document.cookie = 'userId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
              setIsLoggedIn(false);
              setCurrentUserId(null);
            }
          }}
          style={{ padding: '5px 10px', backgroundColor: '#ff6b6b', color: 'white', border: 'none', borderRadius: '4px' }}
        >
          Logout
        </button>
      </div>

      <CoordinatesComponent
        render={({ coordinates, isConnected, getUserCount }) => {
          console.log('Coordinates:', coordinates);
          console.log('Is connected:', isConnected);
          console.log('User count:', getUserCount());
          return null; // Just for logging, actual rendering below
        }}
      />
      <MapComponent />
    </>
  );
}
