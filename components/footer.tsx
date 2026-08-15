"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { WaveIcon } from "@/components/wave-icon";
import { cn } from "@/lib/utils";

const links = [
  { href: "/about", label: "About" },
  { href: "/pricing", label: "Pricing" },
  { href: "/#how-it-works", label: "How it works" },
];

export function Footer() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  if (searchParams.get("embed") === "1") return null;
  const compact = pathname.startsWith("/talk/");

  return (
    <footer className={cn("shrink-0 border-t border-border bg-white", compact ? "px-4 py-3" : "px-6 py-8")}>
      <div
        className={cn(
          "mx-auto flex max-w-5xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
          compact && "gap-2 sm:gap-4",
        )}
      >
        <div className="flex items-center gap-2">
          <WaveIcon className="size-4 text-accent" />
          <span className="text-sm font-medium tracking-tight">Avaaz</span>
          <span className="hidden text-xs text-muted sm:inline">· Voice agents for anyone</span>
        </div>
        {!compact && (
          <nav className="flex flex-wrap items-center gap-5 text-xs text-muted">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="transition-colors hover:text-foreground">
                {link.label}
              </Link>
            ))}
          </nav>
        )}
        <p className="text-xs text-muted">
          © {new Date().getFullYear()} · Made by{" "}
          <Link
            href="https://x.com/provanshh"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Vansh
          </Link>
        </p>
      </div>
    </footer>
  );
}
