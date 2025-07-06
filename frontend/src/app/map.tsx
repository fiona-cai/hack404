'use client';

import Map from 'react-map-gl/maplibre';
import {DeckGL} from '@deck.gl/react';
import {ScenegraphLayer} from '@deck.gl/mesh-layers';
import type {PickingInfo} from '@deck.gl/core';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useEffect, useMemo, useState } from 'react';
import { useOrientation } from "@uidotdev/usehooks";
import {useGeolocated} from 'react-geolocated';

export default function MapComponent() {
  const [isWalking, setIsWalking] = useState(false);
  const [nearbyUsers, setNearbyUsers] = useState<any[]>([]);
  const [catching, setCatching] = useState<string | null>(null);
  const [catchSuccess, setCatchSuccess] = useState<string | null>(null);
  const myUserId = 1; // TODO: Replace with real user id from auth

  const orientation = useOrientation();
  const {coords, isGeolocationAvailable, isGeolocationEnabled } =
    useGeolocated({
        positionOptions: {
        enableHighAccuracy: false,
    },
    userDecisionTimeout: 5000,
  });

  // Create the 3D model layer
  const layers = useMemo(() => {
    if (!coords) return [];
    
    console.log('Creating ScenegraphLayer with GLB:', '/models/timmy.glb');
    
    return [
      new ScenegraphLayer<GeolocationCoordinates>({
        id: 'person-3d-model',
        data: [coords],
        getPosition: (d: GeolocationCoordinates ) => [d.longitude, d.latitude], // Use longitude and latitude for position
        getOrientation: () => [0, 0, 90], // Keep model upright
        scenegraph: '/models/timmy.glb',
        sizeScale: 0.05, // Smaller scale for map overlay
        _animations: {
            '*': {playing: true, speed: 1}
        },
        _lighting: 'flat',
        pickable: true,
      })
    ];
  }, [coords, isWalking]);

  useEffect(() => {
    if (!coords) return;
    // Fetch nearby users (excluding self)
    fetch(`/api/get-nearby?userId=${myUserId}`)
      .then(res => res.ok ? res.json() : [])
      .then(data => setNearbyUsers(data || []));
  }, [coords]);

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
    <div style={{position: 'relative', width: '100vw', height: '100vh'}}>
      <DeckGL
        initialViewState={{
            longitude: coords.longitude,
            latitude: coords.latitude,
            zoom: 20,
            bearing: coords.heading || 0, // Use device orientation or GPS heading
            pitch: 60
        }}
        
        controller={true}
        layers={layers}
        style={{width: '100vw', height: '100vh'}}
        getTooltip={({object}: PickingInfo<GeolocationCoordinates>) => 
          object ? {text: "You"} : null
        }
      >
        <Map
          mapStyle={`https://api.maptiler.com/maps/0197dc5c-bcb0-7836-a7d1-dff45b08d6a1/style.json?key=${process.env.NEXT_PUBLIC_MAPLIBRE_KEY}`}
        />
      </DeckGL>
      
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
      <div style={{position: 'absolute', top: 20, left: 20, zIndex: 1000, background: 'rgba(0,0,0,0.7)', borderRadius: 16, padding: 16, color: '#fff', minWidth: 220}}>
        <div style={{fontWeight: 600, fontSize: 18, marginBottom: 8}}>Nearby People</div>
        {nearbyUsers.length === 0 && <div>No one nearby</div>}
        {nearbyUsers.map(user => {
          if (!coords) return null;
          const dist = getDistanceMeters(
            coords.longitude, coords.latitude,
            user.latitude, user.longitude
          );
          return (
            <div key={user.user_id} style={{marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10}}>
              <img src={user.avatar_url || '/images/icon.png'} alt="avatar" style={{width: 36, height: 36, borderRadius: '50%', border: '2px solid #fff'}} />
              <span style={{flex: 1}}>{user.display_name || `User ${user.user_id}`}</span>
              {dist <= 10 ? (
                <button
                  style={{background: '#4e54c8', color: '#fff', border: 'none', borderRadius: 12, padding: '6px 14px', fontWeight: 600, cursor: 'pointer'}}
                  disabled={catching === user.user_id}
                  onClick={async () => {
                    setCatching(user.user_id);
                    setCatchSuccess(null);
                    const res = await fetch('/api/catch', {
                      method: 'POST',
                      headers: {'Content-Type': 'application/json'},
                      body: JSON.stringify({initiatorId: myUserId, targetId: user.user_id})
                    });
                    const data = await res.json();
                    if (data.success) setCatchSuccess(user.display_name || `User ${user.user_id}`);
                    setCatching(null);
                  }}
                >{catching === user.user_id ? 'Catching...' : 'Catch'}</button>
              ) : (
                <span style={{fontSize: 12, color: '#aaa'}}>{dist < 1000 ? `${dist.toFixed(1)}m` : `${(dist/1000).toFixed(2)}km`}</span>
              )}
            </div>
          );
        })}
        {catchSuccess && <div style={{marginTop: 10, color: '#4eec8c'}}>Catch sent to {catchSuccess}!</div>}
      </div>
    </div>
  );
}