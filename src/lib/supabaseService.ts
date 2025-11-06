import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

let serviceClient: ReturnType<typeof createClient<Database>> | null = null;

export function getServiceClient() {
  if (!serviceClient) {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for server actions.');
    }

    serviceClient = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );
  }

  return serviceClient;
}
