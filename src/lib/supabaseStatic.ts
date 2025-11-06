import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

let anonClient: ReturnType<typeof createClient<Database>> | null = null;

export function getStaticClient() {
  if (!anonClient) {
    anonClient = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      }
    );
  }

  return anonClient;
}
