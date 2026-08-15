"use client";

import DriftWall from "@/components/drift-wall/DriftWall";
import { agentLogoUrl } from "@/lib/logo";

const brands = [
  { domain: "stripe.com", title: "Stripe" },
  { domain: "notion.so", title: "Notion" },
  { domain: "figma.com", title: "Figma" },
  { domain: "slack.com", title: "Slack" },
  { domain: "linear.app", title: "Linear" },
  { domain: "vercel.com", title: "Vercel" },
  { domain: "openai.com", title: "OpenAI" },
  { domain: "shopify.com", title: "Shopify" },
  { domain: "supabase.com", title: "Supabase" },
  { domain: "github.com", title: "GitHub" },
  { domain: "google.com", title: "Google" },
  { domain: "apple.com", title: "Apple" },
  { domain: "amazon.com", title: "Amazon" },
  { domain: "airbnb.com", title: "Airbnb" },
  { domain: "netflix.com", title: "Netflix" },
];

const items = brands.map((brand) => ({
  image: agentLogoUrl({ website: `https://${brand.domain}`, name: brand.title }) || `https://www.google.com/s2/favicons?domain=${brand.domain}&sz=128`,
  title: brand.title,
  href: `https://${brand.domain}`,
}));

export function AudienceDriftWall() {
  return (
    <div className="relative mx-auto mt-10 w-full max-w-6xl overflow-hidden" style={{ height: 560 }}>
      <div className="h-full w-full origin-center" style={{ transform: "translateX(-5%)" }}>
        <DriftWall
          items={items}
          columns={5}
          tileWidth={200}
          tileHeight={132}
          gap={18}
          tilt={12}
          turn={-8}
          perspective={1200}
          depth={120}
          speed={42}
          direction="up"
          variance={0.45}
          parallax={0.6}
          lift={64}
          fade={0.55}
          dim={0.7}
          className="drift-wall--logos"
          overlayColor="#f4f4f1"
        />
      </div>
    </div>
  );
}
