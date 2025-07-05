'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { subscribeToCoordinates, type Coordinates } from './queries';

/**
 * Hook for subscribing to real-time coordinate changes
 */
export function useCoordinateSubscription() {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const subscribe = useCallback((callbacks: {
    onUpdate?: (payload: { old: Coordinates; new: Coordinates }) => void;
    onInsert?: (payload: { new: Coordinates }) => void;
    onDelete?: (payload: { old: Coordinates }) => void;
  }) => {
    // Unsubscribe from previous channel if it exists
    if (channelRef.current) {
      channelRef.current.unsubscribe();
    }

    // Create new subscription
    channelRef.current = subscribeToCoordinates(callbacks);
    setIsConnected(true);

    return channelRef.current;
  }, []);

  const unsubscribe = useCallback(async () => {
    if (channelRef.current) {
      await channelRef.current.unsubscribe();
      channelRef.current = null;
      setIsConnected(false);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
      }
    };
  }, []);

  return {
    subscribe,
    unsubscribe,
    isConnected,
    channel: channelRef.current
  };
}

/**
 * Hook for managing coordinate state with real-time updates
 * Maps user ID to their latest coordinates
 */
export function useCoordinates() {
  const [coordinates, setCoordinates] = useState<Record<number, Coordinates>>({});
  const { subscribe, unsubscribe, isConnected } = useCoordinateSubscription();

  useEffect(() => {
    const channel = subscribe({
      onInsert: (payload) => {
        console.log('New coordinate inserted:', payload.new);
        setCoordinates(prev => ({
          ...prev,
          [payload.new.user_id]: payload.new
        }));
      },
      onUpdate: (payload) => {
        console.log('Coordinate updated:', payload.new);
        setCoordinates(prev => ({
          ...prev,
          [payload.new.user_id]: payload.new
        }));
      },
      onDelete: (payload) => {
        console.log('Coordinate deleted:', payload.old);
        setCoordinates(prev => {
          const newCoordinates = { ...prev };
          delete newCoordinates[payload.old.user_id];
          return newCoordinates;
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, [subscribe, unsubscribe]);

  const addCoordinate = useCallback((coordinate: Coordinates) => {
    setCoordinates(prev => ({
      ...prev,
      [coordinate.user_id]: coordinate
    }));
  }, []);

  const updateCoordinate = useCallback((updatedCoordinate: Coordinates) => {
    setCoordinates(prev => ({
      ...prev,
      [updatedCoordinate.user_id]: updatedCoordinate
    }));
  }, []);

  const removeCoordinate = useCallback((userId: number) => {
    setCoordinates(prev => {
      const newCoordinates = { ...prev };
      delete newCoordinates[userId];
      return newCoordinates;
    });
  }, []);

  // Helper functions to work with the object mapping
  const getCoordinateByUserId = useCallback((userId: number) => {
    return coordinates[userId];
  }, [coordinates]);

  const getAllUserIds = useCallback(() => {
    return Object.keys(coordinates).map(Number);
  }, [coordinates]);

  const getAllCoordinates = useCallback(() => {
    return Object.values(coordinates);
  }, [coordinates]);

  const getUserCount = useCallback(() => {
    return Object.keys(coordinates).length;
  }, [coordinates]);

  return {
    coordinates,
    setCoordinates,
    addCoordinate,
    updateCoordinate,
    removeCoordinate,
    getCoordinateByUserId,
    getAllUserIds,
    getAllCoordinates,
    getUserCount,
    isConnected
  };
}

/**
 * Hook for tracking a specific user's coordinates
 */
export function useUserCoordinates(userId: number) {
  const [userCoordinates, setUserCoordinates] = useState<Coordinates[]>([]);
  const { subscribe, unsubscribe, isConnected } = useCoordinateSubscription();

  useEffect(() => {
    const channel = subscribe({
      onInsert: (payload) => {
        if (payload.new.user_id === userId) {
          console.log(`New coordinate for user ${userId}:`, payload.new);
          setUserCoordinates(prev => [payload.new, ...prev]);
        }
      },
      onUpdate: (payload) => {
        if (payload.new.user_id === userId) {
          console.log(`Updated coordinate for user ${userId}:`, payload.new);
          setUserCoordinates(prev => 
            prev.map(coord => 
              coord.id === payload.new.id ? payload.new : coord
            )
          );
        }
      },
      onDelete: (payload) => {
        if (payload.old.user_id === userId) {
          console.log(`Deleted coordinate for user ${userId}:`, payload.old);
          setUserCoordinates(prev => 
            prev.filter(coord => coord.id !== payload.old.id)
          );
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [userId, subscribe, unsubscribe]);

  return {
    userCoordinates,
    setUserCoordinates,
    isConnected
  };
}

/**
 * Hook for coordinate mapping functionality
 */
export function useCoordinateMap() {
  const [coordinateMap, setCoordinateMap] = useState<Map<number, Coordinates>>(new Map());
  const { subscribe, unsubscribe, isConnected } = useCoordinateSubscription();

  useEffect(() => {
    const channel = subscribe({
      onInsert: (payload) => {
        console.log('Adding to map:', payload.new);
        setCoordinateMap(prev => {
          const newMap = new Map(prev);
          newMap.set(payload.new.user_id, payload.new);
          return newMap;
        });
      },
      onUpdate: (payload) => {
        console.log('Updating in map:', payload.new);
        setCoordinateMap(prev => {
          const newMap = new Map(prev);
          newMap.set(payload.new.user_id, payload.new);
          return newMap;
        });
      },
      onDelete: (payload) => {
        console.log('Removing from map:', payload.old);
        setCoordinateMap(prev => {
          const newMap = new Map(prev);
          newMap.delete(payload.old.user_id);
          return newMap;
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, [subscribe, unsubscribe]);

  const getCoordinateByUserId = useCallback((userId: number) => {
    return coordinateMap.get(userId);
  }, [coordinateMap]);

  const getAllUserIds = useCallback(() => {
    return Array.from(coordinateMap.keys());
  }, [coordinateMap]);

  const getAllCoordinates = useCallback(() => {
    return Array.from(coordinateMap.values());
  }, [coordinateMap]);

  return {
    coordinateMap,
    getCoordinateByUserId,
    getAllUserIds,
    getAllCoordinates,
    isConnected
  };
}
