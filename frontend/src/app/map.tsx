'use client';

import * as React from 'react';
import Map, {Source, Layer} from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import type {FeatureCollection} from 'geojson';

const geojson: FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [-122.4, 37.8]
      },
      properties: {title: '915 Front Street, San Francisco, California'}
    }
  ]
};


export default function MapComponent() {
    
  return (
    <Map
      initialViewState={{
        longitude: -122.4,
        latitude: 37.8,
        zoom: 17,
        bearing: -60,
        pitch: 60
      }}
      style={{width: "100vw", height: "100vh"}}
      mapStyle={`https://api.maptiler.com/maps/0197dc5c-bcb0-7836-a7d1-dff45b08d6a1/style.json?key=${process.env.NEXT_PUBLIC_MAPLIBRE_KEY}`}
    >
        <Source id="my-data" type="geojson" data={geojson}>
        </Source>
    </Map>
  );
}