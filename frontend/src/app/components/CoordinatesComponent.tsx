'use client';

import { useEffect, useState, useCallback } from 'react';

import { Database } from '@/lib/database.types';
import { createBrowserClient } from '@supabase/ssr';
type Coordinate = Database['public']['Tables']['coordinates']['Row'];

interface CoordinatesComponentProps {
  render: (props: {
    coordinates: Record<number, Coordinate>;
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
    onUpdate: (payload: { old: Coordinate, new: Coordinate }) => void;
    onInsert: (payload: { new: Coordinate }) => void;
    onDelete: (payload: { old: Coordinate }) => void;
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
      (payload) => onInsert({ new: payload.new as Coordinate })
    )
    .on(
      'postgres_changes',
      {
        schema: 'public',
        event: 'UPDATE',
        table: 'coordinates'
      },
      (payload) => onUpdate({ old: payload.old as Coordinate, new: payload.new as Coordinate })
    )
    .on(
      'postgres_changes',
      {
        schema: 'public',
        event: 'DELETE',
        table: 'coordinates'
      },
      (payload) => onDelete({ old: payload.old as Coordinate })
    )
    .subscribe();

  return coordinateChanges;
}

export default function CoordinatesComponent({ render }: CoordinatesComponentProps) {
  const [coordinates, setCoordinates] = useState<Record<number, Coordinate>>({});
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
        allCoords['coordinates'].reduce(
          (acc: Record<number, Coordinate>, coord: Coordinate) => {
        acc[coord.user_id] = coord;
        return acc;
          },
          {} as Record<number, Coordinate>
        )
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
