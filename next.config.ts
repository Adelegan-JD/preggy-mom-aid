import type { NextConfig } from "next";

// The Supabase project URL is public configuration, not a secret. Keep a
// project-specific fallback so production builds remain connected if Vercel
// omits NEXT_PUBLIC_SUPABASE_URL from the build environment. A valid Vercel
// value still takes precedence. The publishable key remains environment-only.
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
  "https://seggjguspycgdwtgaraq.supabase.co";

const nextConfig: NextConfig = {
  // Next.js replaces these values at build time, including in client bundles.
  // This avoids relying on a runtime-only Vercel variable for browser config.
  env: {
    NEXT_PUBLIC_SUPABASE_URL: supabaseUrl,
  },
};

export default nextConfig;
