"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    if (!supabase) {
      router.replace("/");
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const next = params.get("next") || "/";

    async function finish() {
      if (code) {
        await supabase!.auth.exchangeCodeForSession(code);
      }
      router.replace(next.startsWith("/") ? next : "/");
    }

    void finish();
  }, [router]);

  return (
    <main className="grid min-h-[50vh] place-items-center px-6">
      <p className="text-sm text-muted">Signing you in...</p>
    </main>
  );
}
