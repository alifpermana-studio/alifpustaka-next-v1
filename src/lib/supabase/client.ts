// this function is used to create a supabase client for the browser,
// it is used in the _app.tsx file (or any file started with "use client") to provide the client to the entire application.
// this provide faster access to the supabase client and avoid creating a new client on every request.

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
