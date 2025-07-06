'use client';

import Map from 'react-map-gl/maplibre';
import { DeckGL } from '@deck.gl/react';
import { ScenegraphLayer } from '@deck.gl/mesh-layers';
import type { PickingInfo } from '@deck.gl/core';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useEffect, useMemo, useState, useRef } from 'react';
import { useOrientation } from "@uidotdev/usehooks";
import { useGeolocated } from 'react-geolocated';
import Image from 'next/image';
import GotchaCardDisplay from './components/GotchaCardDisplay';
import CatchAnimation from './components/CatchAnimation';
import CatchUserModal from './components/CatchUserModal';
import { GotchaCard, User as GotchaUser } from '@/lib/gotcha-types';
import {
  subscribeToGotchaEvents,
  unsubscribeFromGotchaEvents,
  subscribeToCatchAnimations,
  broadcastCatchAnimation,
  RealTimeGotchaEvent,
  CatchAnimationPayload
} from '@/lib/realtime-gotcha';

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

// Custom hook to test 3D model compatibility
const use3DModelSupport = () => {
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const test3DSupport = async () => {
      try {
        // Check for WebGL support first
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

        if (!gl) {
          console.log('❌ WebGL not supported');
          setIsSupported(false);
          setIsLoading(false);
          return;
        }

        // Check user agent for known problematic combinations
        const userAgent = navigator.userAgent;
        const isIOS = /iPad|iPhone|iPod/.test(userAgent);
        const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);
        const isFirefox = /Firefox/.test(userAgent);
        const isOldChrome = /Chrome\/[1-9][0-9]\./.test(userAgent); // Chrome < 100

        // For now, be conservative with 3D model support
        if (isIOS || isSafari || isFirefox || isOldChrome) {
          console.log('🔍 Potentially incompatible browser detected:', {
            isIOS,
            isSafari,
            isFirefox,
            isOldChrome,
            userAgent
          });
          setIsSupported(false);
        } else {
          console.log('✅ Browser appears to support 3D models');
          setIsSupported(true);
        }
      } catch (error) {
        console.error('❌ Error testing 3D support:', error);
        setIsSupported(false);
      } finally {
        setIsLoading(false);
      }
    };

    test3DSupport();
  }, []);

  return { isSupported, isLoading };
};

export default function MapComponent({ avatar, myUserId }: { avatar: string, myUserId: number }) {
  const [isWalking, setIsWalking] = useState(false);
  const [nearbyUsers, setNearbyUsers] = useState<User[]>([]);
  const [catching, setCatching] = useState<number | null>(null);
  const [catchSuccess, setCatchSuccess] = useState<string | null>(null);
  const [deviceHeading] = useState<number>(0);
  const [showCard, setShowCard] = useState<{
    card: GotchaCard;
    userA: GotchaUser;
    userB: GotchaUser;
    eventId: string;
  } | null>(null);
  const [showCatchAnimation, setShowCatchAnimation] = useState<{
    targetUser: { name: string; avatar: string };
  } | null>(null);
  const [showGestureCatch, setShowGestureCatch] = useState<{
    targetUser: {
      id: number;
      name: string;
      avatar: string;
      distance: number;
    };
  } | null>(null);

  // Real-time subscription references
  const gotchaChannelRef = useRef<ReturnType<typeof subscribeToGotchaEvents> | null>(null);
  const catchAnimationChannelRef = useRef<ReturnType<typeof subscribeToCatchAnimations> | null>(null);

  // Test 3D model support
  const { isSupported: is3DSupported, isLoading: is3DLoading } = use3DModelSupport();

  const orientation = useOrientation();
  // const [coords, setCoords] = useState<GeolocationCoordinates | null>(null);
  const { coords, isGeolocationAvailable, isGeolocationEnabled } =
    useGeolocated({
      positionOptions: {
        enableHighAccuracy: true, // Use high accuracy for better location
        timeout: 15000, // Increased for iOS
        maximumAge: 5000 // Reduced for more frequent updates on iOS
      },
      userDecisionTimeout: 15000,
      watchPosition: true,
      suppressLocationOnMount: false,
      isOptimisticGeolocationEnabled: false, // Disable optimistic for iOS accuracy,
      onSuccess: (position) => {
        fetch(`/api/set-coordinates`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: myUserId,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }),
        });
      }
    });

  // iOS-specific geolocation improvements
  useEffect(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

    if (isIOS && !coords && isGeolocationAvailable && isGeolocationEnabled) {
      console.log('🍎 iOS detected - attempting manual geolocation fallback');

      // iOS sometimes needs a manual push
      if (navigator.geolocation) {
        const watchId = navigator.geolocation.watchPosition(
          (position) => {

            fetch('/api/set-coordinates', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: myUserId,
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
              })
            });
            fetch(`/api/set-coordinates`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                userId: myUserId,
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              }),
            });
          },
          (error) => {
            console.error('🍎 iOS manual geolocation error:', error);
            // Try again with reduced accuracy
            navigator.geolocation.getCurrentPosition(
              (position) => {
                console.log('🍎 iOS fallback geolocation success:', position);
              },
              (fallbackError) => {
                console.error('🍎 iOS fallback geolocation error:', fallbackError);
              },
              {
                enableHighAccuracy: false,
                timeout: 30000,
                maximumAge: 60000
              }
            );
          },
          {
            enableHighAccuracy: true,
            timeout: 20000,
            maximumAge: 5000
          }
        );

        return () => {
          if (watchId) {
            navigator.geolocation.clearWatch(watchId);
          }
        };
      }
    }
  }, [coords, isGeolocationAvailable, isGeolocationEnabled]);

  // Real-time subscriptions effect
  useEffect(() => {
    console.log('🔔 Setting up real-time subscriptions for user:', myUserId);

    // Subscribe to gotcha events
    gotchaChannelRef.current = subscribeToGotchaEvents(
      myUserId,
      (event: RealTimeGotchaEvent) => {
        console.log('📡 Received real-time gotcha event:', event);

        // Determine if this user is the initiator or target
        const isInitiator = event.user_a_id === myUserId;
        const isTarget = event.user_b_id === myUserId;

        if (!isInitiator && !isTarget) return;

        // Show the gotcha card to both users
        if (event.card && event.user_a && event.user_b) {
          setShowCard({
            card: {
              id: event.card.id,
              title: event.card.title,
              description: event.card.description,
              type: event.card.type as GotchaCard['type'],
              rarity: event.card.rarity as GotchaCard['rarity'],
              icon_emoji: event.card.icon_emoji,
              background_color: event.card.background_color,
              text_color: event.card.text_color,
              is_dynamic: true,
              tags: event.card.tags,
              weight: 100,
              created_at: event.created_at,
              updated_at: event.created_at
            },
            userA: {
              id: event.user_a.id,
              name: event.user_a.name,
              avatar: event.user_a.avatar,
              phone_number: '',
              interests: [],
              created_at: event.created_at
            },
            userB: {
              id: event.user_b.id,
              name: event.user_b.name,
              avatar: event.user_b.avatar,
              phone_number: '',
              interests: [],
              created_at: event.created_at
            },
            eventId: event.id
          });

          // Show catch animation for the target user
          if (isTarget) {
            setShowCatchAnimation({
              targetUser: {
                name: event.user_a?.name || 'Unknown',
                avatar: `/images/${event.user_a?.avatar}.png` || ''
              }
            });

            // Hide animation after a few seconds
            setTimeout(() => setShowCatchAnimation(null), 4000);
          }
        }
      }
    );

    // Subscribe to catch animations (for immediate visual feedback)
    catchAnimationChannelRef.current = subscribeToCatchAnimations(
      myUserId,
      (data: CatchAnimationPayload) => {
        console.log('🎯 Received catch animation trigger:', data);

        // Show animation if this user is the target
        if (data.targetId === myUserId) {
          setShowCatchAnimation({
            targetUser: data.targetUser
          });
        }
      }
    );

    // Cleanup function
    return () => {
      console.log('🔕 Cleaning up real-time subscriptions');
      if (gotchaChannelRef.current) {
        unsubscribeFromGotchaEvents(gotchaChannelRef.current);
        gotchaChannelRef.current = null;
      }
      if (catchAnimationChannelRef.current) {
        unsubscribeFromGotchaEvents(catchAnimationChannelRef.current);
        catchAnimationChannelRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!('geolocation' in navigator)) {
      alert('❌ Geolocation not available');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        // setCoords(position.coords)
        console.log(position.timestamp)
      },
      (error) => {
        console.error('🛑 Initial geolocation error:', error);
        alert('❌ Failed to get initial location. Please enable location services.');
      },
      {
        enableHighAccuracy: true,
        timeout: 15000, // Increased for iOS
        maximumAge: 10000 // Reduced for more frequent updates on iOS
      }
    );

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;

        console.log(`📍 New position: ${latitude}, ${longitude} (accuracy: ${accuracy}m)`);

        // Save coords to state
        // setCoords(position.coords);

        // Skip sending to backend if coords are way off
        if (accuracy > 100) {
          console.warn('⚠️ Location accuracy too low (>100m), skipping update');
          return;
        }

        // Send updated coordinates to backend
        fetch('/api/set-coordinates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: myUserId,
            latitude,
            longitude
          })
        }).catch(err => {
          console.error('📡 Failed to send coords:', err);
        });
        
        fetch('/api/get-nearby?userId=' + myUserId).then(
          response => response.json()
        ).then(data => {
          setNearbyUsers(data);
          console.log('📡 Nearby users updated:', data);
        }).catch(err => {
          console.error('📡 Failed to get nearby users:', err);
        });
      },
      (error) => {
        console.error('🛑 Geolocation error:', error);
      },
      {
        enableHighAccuracy: true, // ⬅️ THIS is critical
        timeout: 10000,
        maximumAge: 5000,

      }
    );

    return () => {
      console.log('🧹 Cleaning up geolocation watcher');
      navigator.geolocation.clearWatch(watchId);
    };
  }, [myUserId]);

  // Create the 3D model layer with better error handling
  const layers = useMemo(() => {
    if (!coords) return [];

    // Helper to choose model based on avatar with better mobile compatibility
    const getModelForAvatar = (avatar: string) => {
      console.log('Avatar:', avatar);

      // Use the 3D support detection
      if (!is3DSupported) {
        console.log('3D models not supported on this device/browser');
        return null;
      }

      if (avatar?.toLowerCase().includes('michelle')) return '/models/michelle.glb';
      return '/models/timmy.glb';
    };

    console.log(avatar, 'Using avatar model:', getModelForAvatar(avatar));

    const layers = [];

    try {
      // Current user layer - only add if model is available
      const userModelPath = getModelForAvatar(avatar);

      // const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      if (userModelPath) {
        const userLayer = new ScenegraphLayer<GeolocationCoordinates>({
          id: 'person-self',
          data: [coords],
          getPosition: (d: GeolocationCoordinates) => [d.longitude, d.latitude],
          getOrientation: () => [0, 0, 90],
          scenegraph: userModelPath,
          sizeScale: 0.05,
          _animations: {
            '*': { playing: true, speed: 1 }
          },
          _lighting: 'flat',
          pickable: true,
          onError: (error: Error) => {
            console.error('Error loading user model:', error);
          }
        });
        layers.push(userLayer);
      }

      // Nearby users layers - only add if models are available
      const nearbyLayers = nearbyUsers.map(user => {
        const modelPath = getModelForAvatar(user.users.avatar);
        if (!modelPath) return null;

        return new ScenegraphLayer<User>({
          id: `person-${user.user_id}`,
          data: [user],
          getPosition: (u: User) => [u.longitude, u.latitude],
          getOrientation: () => [0, 0, 90],
          scenegraph: modelPath,
          sizeScale: 0.05,
          _animations: {
            '*': { playing: true, speed: 1 }
          },
          _lighting: 'flat',
          pickable: true,
          onError: (error: Error) => {
            console.error(`Error loading model for user ${user.user_id}:`, error);
          }
        });
      }).filter(Boolean);

      layers.push(...nearbyLayers);
    } catch (error) {
      console.error('Error creating 3D layers:', error);
    }

    return layers;
  }, [coords, nearbyUsers, avatar, is3DSupported]);

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
    console.log('Current orientation:', orientation);
    console.log('Device heading:', deviceHeading);
  }, [orientation, deviceHeading]);

  // Early return after all hooks are called
  if (!coords || !isGeolocationAvailable || !isGeolocationEnabled) {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100vw',
        height: '100vh',
        backgroundColor: '#f0f0f0',
        color: '#000000',
        padding: '20px',
        textAlign: 'center',
      }}>
        <div style={{ marginBottom: '20px', fontSize: '18px' }}>
          {!isGeolocationAvailable && '📍 Geolocation is not available'}
          {isGeolocationAvailable && !isGeolocationEnabled && '📍 Please enable location access'}
          {isGeolocationAvailable && isGeolocationEnabled && !coords && '📍 Getting your location...'}
        </div>
        {isIOS && (
          <div style={{
            fontSize: '14px',
            color: '#666',
            maxWidth: '300px',
            lineHeight: '1.4'
          }}>
            <p>📱 <strong>iOS Users:</strong></p>
            <p>• Make sure Location Services is enabled in Settings</p>
            <p>• Allow location access when prompted</p>
            <p>• Try refreshing if location isn&apos;t detected</p>
          </div>
        )}
      </div>
    );
  }

  function getDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371000; // Earth's radius in meters
    const toRad = (deg: number) => deg * Math.PI / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  const handleShowGestureCatch = (user: User) => {
    if (!coords) return;

    const dist = getDistanceMeters(
      coords.latitude, coords.longitude,
      user.latitude, user.longitude
    );

    setShowGestureCatch({
      targetUser: {
        id: user.user_id,
        name: user.users.name || `User ${user.user_id}`,
        avatar: `/images/${user.users.avatar}.png`,
        distance: Math.round(dist)
      }
    });
  };

  const handleGestureCatch = async (userId: number) => {
    if (!coords) return;

    setCatching(userId);
    setCatchSuccess(null);

    try {
      // Broadcast catch animation to target user for immediate feedback
      await broadcastCatchAnimation(
        myUserId,
        userId,
        {
          name: showGestureCatch?.targetUser.name || 'Unknown',
          avatar: showGestureCatch?.targetUser.avatar || ''
        }
      );

      // Generate card and log event
      const cardRes = await fetch('/api/generate-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userAId: myUserId,
          userBId: userId,
          location: { lat: coords.latitude, lng: coords.longitude },
          preferStatic: false
        })
      });

      if (cardRes.ok) {
        const cardData = await cardRes.json();
        setCatchSuccess(showGestureCatch?.targetUser.name || 'Unknown');

        // The real-time system will handle showing the card
        setTimeout(() => {
          setShowCard({
            card: cardData.card,
            userA: cardData.users.userA,
            userB: cardData.users.userB,
            eventId: cardData.event.id
          });
        }, 2000);
      }
    } catch (error) {
      console.error('Gesture catch failed:', error);
    }

    setCatching(null);
    setShowGestureCatch(null);
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      {/* Debug Panel for iOS troubleshooting */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{
          position: 'absolute',
          top: 10,
          left: 10,
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '8px 12px',
          borderRadius: 8,
          fontSize: 11,
          zIndex: 1000,
          maxWidth: 300,
          lineHeight: 1.2
        }}>
          <div><strong>📍 Location Debug</strong></div>
          <div>Lat: {coords?.latitude?.toFixed(6) || 'N/A'}</div>
          <div>Lng: {coords?.longitude?.toFixed(6) || 'N/A'}</div>
          <div>Accuracy: ±{coords?.accuracy?.toFixed(0) || 'N/A'}m</div>
          <div>Available: {isGeolocationAvailable ? '✅' : '❌'}</div>
          <div>Enabled: {isGeolocationEnabled ? '✅' : '❌'}</div>
          <div>iOS: {/iPad|iPhone|iPod/.test(navigator.userAgent) ? '✅' : '❌'}</div>
          <div>3D Support: {is3DSupported ? '✅' : '❌'}</div>
          <div>Nearby Users: {nearbyUsers.length}</div>
        </div>
      )}

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

      {/* Animation Toggle Button
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
      </button> */}

      {/* Overlay: Show nearby users and Catch button if within 10m */}
      <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 1000, background: 'rgba(0,0,0,0.7)', borderRadius: 16, padding: 16, color: '#fff', minWidth: 220 }}>
        <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 8 }}>Nearby People</div>
        {nearbyUsers.length === 0 && <div>No one nearby</div>}
        {nearbyUsers.map(user => {
          if (!coords) return null;
          // alert(`${coords.latitude}, ${coords.longitude} - ${user.latitude}, ${user.longitude}`);
          const dist = getDistanceMeters(
            coords.latitude, coords.longitude,
            user.latitude, user.longitude
          );
          console.log('my id is', myUserId);
          console.log(`Distance to user ${user.user_id}: ${dist.toFixed(2)}m`);
          return (
            <div key={user.user_id} style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
              <Image src={`/images/${user.users.avatar}.png`} alt="avatar" width={36} height={36} style={{ width: 36, height: 36, borderRadius: '50%', border: '2px solid #fff' }} />
              <span style={{ flex: 1 }}>{user.users.name || `User ${user.user_id}`}</span>
              {dist <= 10 ? (
                <div style={{ display: 'flex', gap: 4, flexDirection: 'column' }}>
                  {/* Gesture Catch Button */}
                  <button
                    style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 12,
                      padding: '6px 12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                      transition: 'all 0.2s ease',
                      fontSize: 11
                    }}
                    disabled={catching === user.user_id}
                    onClick={() => handleShowGestureCatch(user)}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
                    }}
                  >
                    {catching === user.user_id ? '🎯 Catching...' : '🎮 Gesture Catch'}
                  </button>

                  {/* Regular Catch Button */}
                  <button
                    style={{
                      background: '#4e54c8',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 12,
                      padding: '4px 10px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      boxShadow: '0 2px 0 #373b7c, 0 2px 8px rgba(0,0,0,0.15)',
                      transition: 'transform 0.1s, box-shadow 0.1s',
                      fontSize: 10
                    }}
                    disabled={catching === user.user_id}
                    onClick={async () => {
                      setCatching(user.user_id);
                      setCatchSuccess(null);

                      // Broadcast catch animation to target user for immediate feedback
                      try {
                        await broadcastCatchAnimation(
                          myUserId,
                          user.user_id,
                          {
                            name: user.users.name || `User ${user.user_id}`,
                            avatar: `/images/${user.users.avatar}.png`
                          }
                        );
                      } catch (error) {
                        console.error('Failed to broadcast catch animation:', error);
                      }

                      // Show catch animation for initiator
                      setShowCatchAnimation({
                        targetUser: {
                          name: user.users.name || `User ${user.user_id}`,
                          avatar: `/images/${user.users.avatar}.png`
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
                      e.currentTarget.style.transform = 'translateY(-1px) scale(1.02)';
                      e.currentTarget.style.boxShadow = '0 4px 0 #373b7c, 0 4px 16px rgba(0,0,0,0.18)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.boxShadow = '0 2px 0 #373b7c, 0 2px 8px rgba(0,0,0,0.15)';
                    }}
                  >{catching === user.user_id ? 'Catching...' : 'Quick Catch'}</button>
                </div>
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

      {/* Gesture Catch Modal */}
      {showGestureCatch && (
        <CatchUserModal
          targetUser={showGestureCatch.targetUser}
          onCatch={handleGestureCatch}
          onClose={() => setShowGestureCatch(null)}
        />
      )}
    </div>
  );
}