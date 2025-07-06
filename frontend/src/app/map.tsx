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
    
    return [
      new ScenegraphLayer<GeolocationCoordinates>({
        id: 'person-3d-model',
        data: [coords],
        getPosition: (d: GeolocationCoordinates ) => [d.longitude, d.latitude], // Use longitude and latitude for position
        getOrientation: () => [0, 0, 90], // Keep model upright
        scenegraph: '/models/timmy.glb',
        sizeScale: 0.05, // Smaller scale for map overlay
        _animations: {
          [isWalking ? 'Walking' : 'BreathingIdle']: {speed: 1}
        },
        _lighting: 'flat',
        pickable: false,
      })
    ];
  }, [coords, isWalking]);

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

  return (
    <div style={{position: 'relative', width: '100vw', height: '100vh'}}>
      <DeckGL
        initialViewState={{
            longitude: coords.longitude,
            latitude: coords.latitude,
            zoom: 17,
            bearing: coords.heading || 0, // Use heading if available
            pitch: 60
        }}
        controller={true}
        layers={layers}
        style={{width: '100vw', height: '100vh'}}
        getTooltip={({object}: PickingInfo<GeolocationCoordinates>) => 
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