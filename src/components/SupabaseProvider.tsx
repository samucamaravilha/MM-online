'use client';

import { createBrowserClient } from '@supabase/auth-helpers-nextjs';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { useMemo, useState } from 'react';
import type { Database } from '@/types/database';

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [supabaseClient] = useState(() =>
    createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  );

  const memoized = useMemo(() => supabaseClient, [supabaseClient]);

  return <SessionContextProvider supabaseClient={memoized}>{children}</SessionContextProvider>;
}
