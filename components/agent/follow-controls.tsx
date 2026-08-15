"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { displayUserName, useAuth } from "@/lib/auth";

export function FollowControls({
  slug,
  name,
  initialCount = 0,
  children,
}: {
  slug: string;
  name: string;
  initialCount?: number;
  children?: ReactNode;
}) {
  const { user, signInGoogle } = useAuth();
  const [count, setCount] = useState(initialCount);
  const [following, setFollowing] = useState(false);
  const [people, setPeople] = useState<{ name: string }[]>([]);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const key = user?.id || "";

  useEffect(() => {
    fetch(`/api/agents/follow?slug=${encodeURIComponent(slug)}&key=${encodeURIComponent(key)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;
        setCount(data.count ?? initialCount);
        setFollowing(Boolean(data.following));
        setPeople(data.people || []);
      })
      .catch(() => {});
  }, [initialCount, key, slug]);

  async function toggle() {
    if (!user) {
      void signInGoogle(typeof window !== "undefined" ? `${window.location.pathname}${window.location.search}` : "/");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/agents/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          action: following ? "unfollow" : "follow",
          userId: user.id,
          displayName: displayUserName(user) || "Guest",
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setFollowing(Boolean(data.following));
        setCount(data.count ?? count);
        setPeople(data.people || []);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="flex flex-nowrap items-center gap-2 overflow-x-auto">
        <Button size="sm" variant={following ? "outline" : "default"} disabled={busy} onClick={() => void toggle()}>
          {user ? (following ? "Following" : "Follow") : "Sign in to follow"}
        </Button>
        <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
          <Users className="size-3.5" />
          {count} {count === 1 ? "follower" : "followers"}
        </Button>
        {children}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogTitle>Followers</DialogTitle>
          <DialogDescription>
            {count} {count === 1 ? "person follows" : "people follow"} {name}.
          </DialogDescription>
          <ul className="mt-4 max-h-64 space-y-2 overflow-y-auto">
            {people.length === 0 && <li className="text-sm text-muted">No followers yet. Be the first.</li>}
            {people.map((person, i) => (
              <li key={`${person.name}-${i}`} className="rounded-xl border border-border px-3 py-2 text-sm">
                {person.name}
              </li>
            ))}
          </ul>
        </DialogContent>
      </Dialog>
    </>
  );
}
