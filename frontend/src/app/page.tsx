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
        console.log('Auth response:', authData);
        
        setIsLoggedIn(authData.isLoggedIn);
        setCurrentUserId(authData.userId);

        if (!authData.isLoggedIn) {
          console.log('User is not logged in');
          return;
        }
        try {
          const dbresponse = await fetch(`/api/get-user?userId=${authData.userId}`);
          const userData = await dbresponse.json();
          console.log('User data:', userData);
          setUser(userData.user[0] || {
            avatar: '',
            birthday: '',
            interests: [],
            name: '',
            phoneNumber: '',
          });
        } catch (error) {
          console.error('Failed to fetch user data:', error);
        }

        // console.log('Auth check:', authData);
        // console.log('User is logged in:', authData.isLoggedIn);
        // console.log('Current user ID:', authData.userId);
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
      <div style={{
        padding: '16px',
        background: 'linear-gradient(90deg, #f0f4ff 0%, #e3ffe8 100%)',
        borderRadius: '10px',
        marginBottom: '18px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px'
      }}>
        <div>
          <h3 style={{ margin: 0, fontWeight: 600, color: '#2d3a4a' }}>Welcome! You are logged in</h3>
          <p style={{ margin: '4px 0 0 0', color: '#4a5a6a', fontSize: '15px' }}>
        {/* Your User ID: <span style={{ fontWeight: 500 }}>{currentUserId}</span> */}
          </p>
        </div>
        <button
          onClick={async () => {
        try {
          await fetch('/api/logout', { method: 'POST' });
          setIsLoggedIn(false);
          setCurrentUserId(null);
          console.log('Logged out successfully');
        } catch (error) {
          console.error('Logout failed:', error);
          document.cookie = 'userId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
          setIsLoggedIn(false);
          setCurrentUserId(null);
        }
          }}
          style={{
        padding: '8px 20px',
        background: 'linear-gradient(90deg, #ff6b6b 0%, #ffb36b 100%)',
        color: '#fff',
        border: 'none',
        borderRadius: '6px',
        fontWeight: 500,
        fontSize: '15px',
        cursor: 'pointer',
        boxShadow: '0 1px 4px rgba(255,107,107,0.10)',
        transition: 'background 0.2s'
          }}
        >
          Logout
        </button>
      </div>

      <CoordinatesComponent
        render={({ coordinates, isConnected, getUserCount }) => {
          // console.log('Coordinates:', coordinates);
          // console.log('Is connected:', isConnected);
          // console.log('User count:', getUserCount());
          return null; // Just for logging, actual rendering below
        }}
      />
      {/* <p>{currentUserId} {user.avatar}</p> */}
      {currentUserId && user?.avatar ? <MapComponent avatar={user.avatar} myUserId={currentUserId} /> : <p>Loading...</p>}
    </>
  );
}
