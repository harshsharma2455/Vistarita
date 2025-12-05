import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Missing Supabase credentials. Auth and Persistence will not work.');
}

const isValidUrl = (url: string) => {
    try {
        return new URL(url).protocol.startsWith('http');
    } catch (e) {
        return false;
    }
};

export const supabase = (isValidUrl(supabaseUrl || '') && supabaseAnonKey)
    ? createClient(supabaseUrl!, supabaseAnonKey!)
    : null as any; // Cast to any to avoid TS errors in other files for now, we'll handle null checks in App.tsx
