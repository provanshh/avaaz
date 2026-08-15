"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

export function CreateCta({
  children = "Create Agent",
  size = "sm",
  className,
  variant,
}: {
  children?: ReactNode;
  size?: "sm" | "lg" | "default";
  className?: string;
  variant?: "default" | "outline";
}) {
  const { user, ready, signInGoogle } = useAuth();
  const router = useRouter();

  return (
    <Button
      size={size}
      variant={variant}
      className={cn(className)}
      disabled={!ready}
      onClick={() => {
        if (!user) void signInGoogle("/create");
        else router.push("/create");
      }}
    >
      {children}
    </Button>
  );
}
