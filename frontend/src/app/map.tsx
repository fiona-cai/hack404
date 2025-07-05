'use client';

import * as React from 'react';
import Map, {Source} from 'react-map-gl/maplibre';
import {DeckGL} from '@deck.gl/react';
import {ScenegraphLayer} from '@deck.gl/mesh-layers';
import type {PickingInfo} from '@deck.gl/core';
import 'maplibre-gl/dist/maplibre-gl.css';

type Coordinates = [longitude: number, latitude: number];

export default function MapComponent() {
  const [viewState, setViewState] = React.useState({
    longitude: -122.4, // Default fallback coordinates (San Francisco)
    latitude: 37.8,
    zoom: 17,
    bearing: -60,
    pitch: 60
  });
  const [loading, setLoading] = React.useState(true);
  const [userLocation, setUserLocation] = React.useState<Coordinates | null>(null);
  const [isWalking, setIsWalking] = React.useState(false);

  // Create the 3D model layer
  const layers = React.useMemo(() => {
    if (!userLocation) return [];
    
    return [
      new ScenegraphLayer<Coordinates>({
        id: 'person-3d-model',
        data: [userLocation],
        getPosition: (d: Coordinates) => d,
        getOrientation: () => [0, 180, 90], // Keep model upright
        scenegraph: '/models/timmy.glb',
        sizeScale: 0.05, // Smaller scale for map overlay
        _animations: {
          [isWalking ? 'Walking' : 'BreathingIdle']: {speed: 1}
        },
        _lighting: 'pbr',
        pickable: false,
      })
    ];
  }, [userLocation, isWalking]);

  React.useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: Coordinates = [position.coords.longitude, position.coords.latitude];
          setViewState(prev => ({
            ...prev,
            longitude: position.coords.longitude,
            latitude: position.coords.latitude
          }));
          setUserLocation(coords);
          setLoading(false);
        },
        (error) => {
          console.error('Error getting location:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser');
    }
  }, []);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100vw',
        height: '100vh',
        backgroundColor: '#f0f0f0'
      }}>
        <div>Loading your location...</div>
      </div>
    );
  }

  return (
    <div style={{position: 'relative', width: '100vw', height: '100vh'}}>
      <DeckGL
        initialViewState={viewState}
        controller={true}
        layers={layers}
        style={{width: '100vw', height: '100vh'}}
        getTooltip={({object}: PickingInfo<Coordinates>) => 
          object ? {text: "Your location - 3D model marker"} : null
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
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '16px',
          fontWeight: 'bold',
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
          zIndex: 1000,
          transition: 'all 0.3s ease'
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
    </div>
  );
}