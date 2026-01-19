import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
        'Supabase environment variables are missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.'
    );
}

// Create Supabase client
export const supabase = createClient(
    supabaseUrl || '',
    supabaseAnonKey || ''
);

// Database types for waitlist
export interface WaitlistEntry {
    id?: string;
    name: string;
    email: string;
    mobile: string;
    user_type: 'buyer' | 'farmer' | 'both';
    created_at?: string;
}
