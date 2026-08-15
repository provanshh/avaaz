"use client";

import type { ReactNode } from "react";
import { Navbar } from "@/components/navbar";
import { GoogleMark } from "@/components/google-mark";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

export default function CreateLayout({ children }: { children: ReactNode }) {
  const { user, ready, signInGoogle } = useAuth();

  if (!ready) {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <Navbar />
        <p className="pt-24 text-center text-sm text-muted">Checking your account...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <Navbar />
        <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-6 pb-16 text-center">
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted">Sign in required</p>
          <h1 className="mt-4 font-serif text-4xl">Create your agent after you sign in.</h1>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            Google keeps your agents tied to you so you can follow, share, and come back later.
          </p>
          <Button size="lg" className="mt-8" onClick={() => void signInGoogle("/create")}>
            <GoogleMark /> Continue with Google
          </Button>
        </main>
      </div>
    );
  }

  return children;
}
