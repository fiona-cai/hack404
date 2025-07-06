'use client';

import { useState } from 'react';
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
  // const isLoggedIn = true; // replace with real auth logic
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User>({
    avatar: '',
    birthday: '',
    interests: [] as string[],
    name: '',
    phoneNumber: '',
  });

  if (!isLoggedIn) {
    return <LoginPage user={user} setUser={setUser} setLoggedIn={setIsLoggedIn} />;
  }

  return (
    <>
    <CoordinatesComponent
      render={({ coordinates, isConnected, getUserCount }) => {
        console.log('Coordinates:', coordinates);
        console.log('Is connected:', isConnected);
        console.log('User count:', getUserCount());
        // return <MapComponent />;
      }}
    />
    <MapComponent />;
    {/* <>hi</> */}
    </>
  );
}
