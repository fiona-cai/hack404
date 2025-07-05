import supabase from './database';
import { Database } from './database.types';

export type Coordinates = Database['public']['Tables']['coordinates']['Row'];
export type CoordinatesInsert = Database['public']['Tables']['coordinates']['Insert'];
export type CoordinatesUpdate = Database['public']['Tables']['coordinates']['Update'];

export function subscribeToCoordinates({
  onUpdate,
  onInsert,
  onDelete,
}: {
    onUpdate: (payload: { old: Coordinates; new: Coordinates }) => void;
    onInsert: (payload: { new: Coordinates }) => void;
    onDelete: (payload: { old: Coordinates }) => void;
}) {
  const coordinateChanges = supabase
    .channel('schema-db-changes')
    .on(
      'postgres_changes',
      {
        schema: 'public',
        event: 'INSERT',
        table: 'coordinates'
      },
      (payload) => onInsert({ new: payload.new as Coordinates })
    )
    .on(
      'postgres_changes',
      {
        schema: 'public',
        event: 'UPDATE',
        table: 'coordinates'
      },
      (payload) => onUpdate({ old: payload.old as Coordinates, new: payload.new as Coordinates })
    )
    .on(
      'postgres_changes',
      {
        schema: 'public',
        event: 'DELETE',
        table: 'coordinates'
      },
      (payload) => onDelete({ old: payload.old as Coordinates })
    )
    .subscribe();

  return coordinateChanges;
}
