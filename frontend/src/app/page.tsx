'use client';

import CoordinatesComponent from './components/CoordinatesComponent';
import LoginPage from './login';
import MapComponent from './map';

export default function ClientHome() {
  const isLoggedIn = true; // replace with real auth logic

  if (!isLoggedIn) {
    return <LoginPage />;
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
