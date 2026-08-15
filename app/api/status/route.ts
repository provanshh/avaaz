import { NextResponse } from "next/server";
import { hasOpenRouter, hasSupabase } from "@/lib/env";

export async function GET() {
  return NextResponse.json({
    openrouter: hasOpenRouter(),
    supabase: hasSupabase(),
  });
}
