'use client';

import { useEffect, useState, useCallback } from 'react';

// import { Database } from '@/lib/database.types';
import { createBrowserClient } from '@supabase/ssr';
// type Coordinates = Database['public']['Tables']['coordinates']['Row'];

interface CoordinatesComponentProps {
  render: (props: {
    coordinates: Record<number, object>;
    getUserCount: () => number;
    getAllUserIds: () => number[];
    isConnected: boolean;
  }) => unknown;
}

function subscribeToCoordinates({
  onUpdate,
  onInsert,
  onDelete,
}: {
    onUpdate: (payload: { old, new }) => void;
    onInsert: (payload: { new }) => void;
    onDelete: (payload: { old }) => void;
}) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  );
  const coordinateChanges = supabase
    .channel('schema-db-changes')
    .on(
      'postgres_changes',
      {
        schema: 'public',
        event: 'INSERT',
        table: 'coordinates'
      },
      (payload) => onInsert({ new: payload.new })
    )
    .on(
      'postgres_changes',
      {
        schema: 'public',
        event: 'UPDATE',
        table: 'coordinates'
      },
      (payload) => onUpdate({ old: payload.old, new: payload.new })
    )
    .on(
      'postgres_changes',
      {
        schema: 'public',
        event: 'DELETE',
        table: 'coordinates'
      },
      (payload) => onDelete({ old: payload.old })
    )
    .subscribe();

  return coordinateChanges;
}

export default function CoordinatesComponent({ render }: CoordinatesComponentProps) {
  const [coordinates, setCoordinates] = useState<Record<number, object>>({});
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    let unsubscribeFn: () => void;

    const init = async () => {
      const response = await fetch('/api/get-all-coordinates');
      if (!response.ok) {
        console.error('Failed to fetch coordinates');
        return;
      }
      const allCoords = await response.json();
      console.log(allCoords['coordinates'])
      setCoordinates(
        allCoords['coordinates'].reduce((acc, coord) => {
          acc[coord.user_id] = coord;
          return acc;
        }, {} as Record<number, object>)
      );

      const channel = subscribeToCoordinates({
        onInsert: (payload) => {
          setCoordinates((prev) => ({
            ...prev,
            [payload.new.user_id]: payload.new
          }));
        },
        onUpdate: (payload) => {
          setCoordinates((prev) => ({
            ...prev,
            [payload.new.user_id]: payload.new
          }));
        },
        onDelete: (payload) => {
          setCoordinates((prev) => {
            const newCoords = { ...prev };
            delete newCoords[payload.old.user_id];
            return newCoords;
          });
        }
      });

      setIsConnected(true);
      unsubscribeFn = () => {
        channel.unsubscribe();
        setIsConnected(false);
      };
    };

    init();

    return () => {
      if (unsubscribeFn) unsubscribeFn();
    };
  }, []);

  const getUserCount = useCallback(() => {
    return Object.keys(coordinates).length;
  }, [coordinates]);

  const getAllUserIds = useCallback(() => {
    return Object.keys(coordinates).map(Number);
  }, [coordinates]);

  render({
    coordinates,
    getUserCount,
    getAllUserIds,
    isConnected
  });

  return <></>; // This component does not render anything directly
}
