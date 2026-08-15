"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CreateCta } from "@/components/create-cta";
import { GoogleMark } from "@/components/google-mark";
import { WaveIcon } from "@/components/wave-icon";
import { displayUserName, useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

const links = [
  { href: "/about", label: "About us" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#examples", label: "Examples" },
  { href: "/pricing", label: "Pricing" },
];

export function Navbar({ transparent = false }: { transparent?: boolean }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const hideCta = pathname.startsWith("/talk/");
  const { user, signInGoogle, signOut } = useAuth();

  return (
    <header className={cn("sticky top-0 z-40 shrink-0 px-4 pt-4", transparent && "absolute inset-x-0 top-0")}>
      <nav className="mx-auto flex max-w-5xl items-center justify-between rounded-full border border-black/8 bg-white/90 px-3 py-2 shadow-[0_8px_30px_rgba(0,0,0,0.04)] backdrop-blur-md">
        <Link href="/" className="flex items-center gap-2 px-2 py-1">
          <WaveIcon className="size-5 text-accent" />
          <span className="text-[15px] font-medium tracking-tight">Avaaz</span>
        </Link>

        <div className="hidden items-center gap-7 text-sm text-muted md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="transition-colors hover:text-foreground">
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <button
              type="button"
              onClick={() => void signOut()}
              className="hidden max-w-[140px] truncate rounded-full border border-border px-3 py-1.5 text-xs text-muted hover:text-foreground sm:inline"
              title="Sign out"
            >
              {displayUserName(user)}
            </button>
          ) : (
            <Button size="sm" variant="outline" className="hidden sm:inline-flex" onClick={() => void signInGoogle()}>
              <GoogleMark /> Google
            </Button>
          )}
          {!hideCta && <CreateCta className="hidden sm:inline-flex" />}
          <button
            type="button"
            className="rounded-full p-2 md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="mx-auto mt-2 max-w-5xl rounded-2xl border border-border bg-white p-4 shadow-sm md:hidden">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="block py-2 text-sm text-muted"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          {user ? (
            <button type="button" className="mt-2 block text-sm text-muted" onClick={() => void signOut()}>
              Sign out
            </button>
          ) : (
            <Button variant="outline" className="mt-2 w-full" onClick={() => void signInGoogle()}>
              <GoogleMark /> Continue with Google
            </Button>
          )}
          {!hideCta && <CreateCta className="mt-2 w-full" />}
        </div>
      )}
    </header>
  );
}
