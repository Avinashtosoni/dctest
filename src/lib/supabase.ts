
import { createClient } from '@supabase/supabase-js';

// Use environment variables for Supabase configuration
// Fallbacks are for development convenience only - set proper env vars in production!
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://dcd.digitalcomrade.in';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc2NTY5NzQ2MCwiZXhwIjo0OTIxMzcxMDYwLCJyb2xlIjoiYW5vbiJ9.b-QNORcjRqxl2zAUofbe9K1WHPzx1JcbaS4zxF3fQbY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        storageKey: 'digitalcomrade-auth-token',
    },
});

