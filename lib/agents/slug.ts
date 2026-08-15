import { slugify } from "@/lib/utils";

export function makeSlug(name: string, extra?: string) {
  const base = slugify(name || extra || "agent");
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base}-${suffix}`;
}

export function preferredSlug(name: string) {
  return slugify(name);
}
