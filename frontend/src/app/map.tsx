'use client';

import Map from 'react-map-gl/maplibre';
import { DeckGL } from '@deck.gl/react';
import { ScenegraphLayer } from '@deck.gl/mesh-layers';
import type { PickingInfo } from '@deck.gl/core';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useEffect, useMemo, useState } from 'react';
import { useOrientation } from "@uidotdev/usehooks";
import { useGeolocated } from 'react-geolocated';
import GotchaCardDisplay from './components/GotchaCardDisplay';
import CatchAnimation from './components/CatchAnimation';
import { GotchaCard, User as GotchaUser } from '@/lib/gotcha-types';

type User = {
  user_id: number;
  latitude: number;
  longitude: number;
  avatar: string;
  users: {
    avatar: string;
    name: string;
  };
}

export default function MapComponent({ avatar, myUserId }: { avatar: string, myUserId: number }) {
  const [isWalking, setIsWalking] = useState(false);
  const [nearbyUsers, setNearbyUsers] = useState<User[]>([]);
  const [catching, setCatching] = useState<number | null>(null);
  const [catchSuccess, setCatchSuccess] = useState<string | null>(null);
  const [deviceHeading, setDeviceHeading] = useState<number>(0);
  const [showCard, setShowCard] = useState<{
    card: GotchaCard;
    userA: GotchaUser;
    userB: GotchaUser;
    eventId: string;
  } | null>(null);
  const [showCatchAnimation, setShowCatchAnimation] = useState<{
    targetUser: { name: string; avatar: string };
  } | null>(null);

  const orientation = useOrientation();
  const { coords, isGeolocationAvailable, isGeolocationEnabled } =
    useGeolocated({
      positionOptions: {
        enableHighAccuracy: false,
      },
      userDecisionTimeout: 5000,
    });

  // Create the 3D model layer
  const layers = useMemo(() => {
    if (!coords) return [];

    // Helper to choose model based on avatar
    const getModelForAvatar = (avatar: string) => {
      console.log('Avatar:', avatar);
      if (avatar?.toLowerCase().includes('michelle')) return '/models/michelle.glb';
      return '/models/timmy.glb';
    };
    console.log(avatar, 'Using avatar model:', getModelForAvatar(avatar));

    // Current user layer
    const userLayer = new ScenegraphLayer<GeolocationCoordinates>({
      id: 'person-self',
      data: [coords],
      getPosition: (d: GeolocationCoordinates) => [d.longitude, d.latitude],
      getOrientation: () => [0, 0, 90],
      scenegraph: getModelForAvatar(avatar),
      sizeScale: 0.05,
      _animations: {
        '*': { playing: true, speed: 1 }
      },
      _lighting: 'flat',
      pickable: true,
    });

    // Nearby users layer
    const nearbyLayers = nearbyUsers.map(user =>
      new ScenegraphLayer<User>({
        id: `person-${user.user_id}`,
        data: [user],
        getPosition: (u: User) => [u.longitude, u.latitude],
        getOrientation: () => [0, 0, 90],
        scenegraph: getModelForAvatar(user.avatar),
        sizeScale: 0.05,
        _animations: {
          '*': { playing: true, speed: 1 }
        },
        _lighting: 'flat',
        pickable: true,
      })
    );

    return [userLayer, ...nearbyLayers];
  }, [coords, nearbyUsers, avatar]);

  // const layers = useMemo(() => {
  //   if (!coords) return [];

  //   console.log('Creating ScenegraphLayer with GLB:', '/models/timmy.glb');

  //   return [
  //     new ScenegraphLayer<GeolocationCoordinates>({
  //       id: 'person',
  //       data: [coords],
  //       getPosition: (d: GeolocationCoordinates) => [d.longitude, d.latitude], // Use longitude and latitude for position
  //       getOrientation: () => [0, 0, 90], // Keep model upright
  //       scenegraph: '/models/timmy.glb',
  //       sizeScale: 0.05, // Smaller scale for map overlay
  //       _animations: {
  //         '*': { playing: true, speed: 1 }
  //       },
  //       _lighting: 'flat',
  //       pickable: true,
  //     })
  //   ];
  // }, [coords, isWalking]);

  useEffect(() => {
    if (!coords) return;
    // Fetch nearby users (excluding self)
    fetch(`/api/set-coordinates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: myUserId,
        latitude: coords.latitude,
        longitude: coords.longitude
      })
    })

    fetch(`/api/get-nearby?userId=${myUserId}`)
      .then(res => res.ok ? res.json() : [])
      .then(data => setNearbyUsers(data || []));
  }, [coords, myUserId]);

  useEffect(() => {
    setInterval(() => {
      fetch(`/api/get-nearby?userId=${myUserId}`)
        .then(res => res.ok ? res.json() : [])
        .then(data => setNearbyUsers(data || []));
    }, 10000); // Update every 10 seconds
  }, [myUserId]);

  useEffect(() => {
    console.log('Current orientation:', orientation);
    console.log('Device heading:', deviceHeading);
  }, [orientation, deviceHeading]);

  // Early return after all hooks are called
  if (!coords || !isGeolocationAvailable || !isGeolocationEnabled) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100vw',
        height: '100vh',
        backgroundColor: '#f0f0f0',
        color: '#000000',
      }}>
        <div>Loading your location...</div>
      </div>
    );
  }

  function getDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
    console.log('Calculating distance between:', { lat1, lon1 }, { lat2, lon2 });
    const R = 6371000; // meters
    const toRad = (deg: number) => deg * Math.PI / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <DeckGL
        initialViewState={{
          longitude: coords.longitude,
          latitude: coords.latitude,
          zoom: 20,
          bearing: deviceHeading || coords.heading || 0, // Use device compass heading
          pitch: 60
        }}
        // viewState={{
        //   longitude: coords.longitude,
        //   latitude: coords.latitude,
        //   zoom: 20,
        //   bearing: deviceHeading || coords.heading || 0, // Live update bearing with device compass
        //   pitch: 60
        // }}
        controller={true}
        layers={layers}
        style={{ width: '100vw', height: '100vh' }}
        getTooltip={({ object }: PickingInfo<GeolocationCoordinates>) =>
          object ? { text: "You" } : null
        }
      >
        <Map
          mapStyle={`https://api.maptiler.com/maps/0197dc5c-bcb0-7836-a7d1-dff45b08d6a1/style.json?key=${process.env.NEXT_PUBLIC_MAPLIBRE_KEY}`}
        />
      </DeckGL>

      {/* Debug Panel */}
      <div style={{ position: 'absolute', bottom: 20, left: 20, zIndex: 1000, background: 'rgba(0,0,0,0.8)', borderRadius: 12, padding: 16, color: '#fff', fontFamily: 'monospace', fontSize: 12 }}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>Debug Info</div>
        <div>Device Heading: {deviceHeading?.toFixed(1)}°</div>
        <div>GPS Heading: {coords.heading?.toFixed(1) || 'N/A'}°</div>
        <div>Current Bearing: {(deviceHeading || coords.heading || 0).toFixed(1)}°</div>
        <div>Orientation Alpha: {orientation?.angle?.toFixed(1) || 'N/A'}°</div>
      </div>

      {/* Animation Toggle Button */}
      <button
        onClick={() => setIsWalking(!isWalking)}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          padding: '12px 24px',
          backgroundColor: isWalking ? '#4CAF50' : '#2196F3',
          color: 'white',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        {isWalking ? '🚶 Walking' : '🧘 Idle'}
      </button>

      {/* Overlay: Show nearby users and Catch button if within 10m */}
      <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 1000, background: 'rgba(0,0,0,0.7)', borderRadius: 16, padding: 16, color: '#fff', minWidth: 220 }}>
        <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 8 }}>Nearby People</div>
        {nearbyUsers.length === 0 && <div>No one nearby</div>}
        {nearbyUsers.map(user => {
          if (!coords) return null;
          const dist = getDistanceMeters(
            coords.latitude, coords.longitude,
            user.latitude, user.longitude
          );
          console.log(`Distance to user ${user.user_id}: ${dist.toFixed(2)}m`);
          return (
            <div key={user.user_id} style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
              <img src={`images/${user.users.avatar}.png`} alt="avatar" style={{ width: 36, height: 36, borderRadius: '50%', border: '2px solid #fff' }} />
              <span style={{ flex: 1 }}>{user.users.name || `User ${user.user_id}`}</span>
              {dist <= 10 ? (
                <button
                  style={{
                    background: '#4e54c8',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 12,
                    padding: '6px 14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 4px 0 #373b7c, 0 2px 8px rgba(0,0,0,0.15)',
                    transition: 'transform 0.1s, box-shadow 0.1s',
                  }}
                  disabled={catching === user.user_id}
                  onClick={async () => {
                    setCatching(user.user_id);
                    setCatchSuccess(null);
                    
                    // Show catch animation
                    setShowCatchAnimation({
                      targetUser: {
                        name: user.users.name || `User ${user.user_id}`,
                        avatar: `images/${user.users.avatar}.png`
                      }
                    });
                    
                    try {
                      // Generate card and log event
                      const cardRes = await fetch('/api/generate-card', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                          userAId: myUserId, 
                          userBId: user.user_id,
                          location: coords ? { lat: coords.latitude, lng: coords.longitude } : null,
                          preferStatic: false // Force dynamic card generation
                        })
                      });
                      
                      if (cardRes.ok) {
                        const cardData = await cardRes.json();
                        
                        // Hide animation and show card
                        setTimeout(() => {
                          setShowCatchAnimation(null);
                          setShowCard({
                            card: cardData.card,
                            userA: cardData.users.userA,
                            userB: cardData.users.userB,
                            eventId: cardData.event.id
                          });
                        }, 4000);
                        
                        setCatchSuccess(user.users.name || `User ${user.user_id}`);
                      } else {
                        // Fallback: just send SMS
                        setShowCatchAnimation(null);
                        const res = await fetch('/api/catch', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ initiatorId: myUserId, targetId: user.user_id })
                        });
                        const data = await res.json();
                        if (data.success) setCatchSuccess(user.users.name || `User ${user.user_id}`);
                      }
                    } catch (error) {
                      console.error('Catch failed:', error);
                      setShowCatchAnimation(null);
                    }
                    
                    setCatching(null);
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-3px) scale(1.07)';
                    e.currentTarget.style.boxShadow = '0 8px 0 #373b7c, 0 4px 16px rgba(0,0,0,0.18)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = '0 4px 0 #373b7c, 0 2px 8px rgba(0,0,0,0.15)';
                  }}
                >{catching === user.user_id ? 'Catching...' : 'Catch'}</button>
              ) : (
                <span style={{ fontSize: 12, color: '#aaa' }}>{dist < 1000 ? `${dist.toFixed(1)}m` : `${(dist / 1000).toFixed(2)}km`}</span>
              )}
            </div>
          );
        })}
        {catchSuccess && <div style={{ marginTop: 10, color: '#4eec8c' }}>Catch sent to {catchSuccess}!</div>}
      </div>

      {/* Catch Animation */}
      {showCatchAnimation && (
        <CatchAnimation
          targetUser={showCatchAnimation.targetUser}
          onComplete={() => setShowCatchAnimation(null)}
        />
      )}

      {/* Gotcha Card Display */}
      {showCard && (
        <GotchaCardDisplay
          card={showCard.card}
          userA={showCard.userA}
          userB={showCard.userB}
          onComplete={async () => {
            // Mark the event as completed
            try {
              await fetch('/api/complete-event', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                  eventId: showCard.eventId,
                  notes: 'Completed via map interface'
                })
              });
            } catch (error) {
              console.error('Failed to complete event:', error);
            }
            setShowCard(null);
          }}
          onClose={() => setShowCard(null)}
        />
      )}
    </div>
  );
}