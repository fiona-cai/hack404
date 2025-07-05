import supabase from './database';
import { Database } from './database.types';

export type Coordinates = Database['public']['Tables']['coordinates']['Row'];
export type CoordinatesInsert = Database['public']['Tables']['coordinates']['Insert'];
export type CoordinatesUpdate = Database['public']['Tables']['coordinates']['Update'];
