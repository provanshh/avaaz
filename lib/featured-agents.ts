import { enhanceFaqs } from "@/lib/agents/faqs";
import { agentLogoUrl } from "@/lib/logo";
import { emptyKnowledge } from "@/lib/utils";
import type { AgentRecord } from "@/types";

function featuredAgent(
  slug: string,
  fields: Partial<AgentRecord> & { name: string; website: string; description: string; knowledge: string },
): AgentRecord {
  const now = new Date().toISOString();
  const base = {
    ...emptyKnowledge("business"),
    id: slug,
    slug,
    category: "business",
    voice: "professional" as const,
    followers_count: 0,
    created_at: now,
    updated_at: now,
    ...fields,
  };
  const logo = fields.logo || agentLogoUrl({ website: fields.website, name: fields.name });
  const faqs = enhanceFaqs({ ...base, faqs: fields.faqs || [] });
  return { ...base, logo, faqs };
}

export const DODO_PAYMENTS = featuredAgent("dodo-payments", {
  name: "Dodo Payments",
  website: "https://dodopayments.com",
  description:
    "Billing and payments platform for AI-first and SaaS companies. Merchant of Record for global tax, usage billing, and checkout.",
  location: "Global",
  email: "",
  products: ["Payments", "Billing", "Distribution", "Sentra"],
  services: [
    "Merchant of Record",
    "Credit-based billing",
    "Usage metering",
    "Subscriptions",
    "Global checkout",
  ],
  pricing: ["Standard: 4% + 40c per domestic US transaction", "Enterprise: custom"],
  faqs: [
    {
      question: "What is Dodo Payments?",
      answer:
        "Dodo Payments is the billing and payments platform for AI-first companies. It handles credits, usage metering, subscriptions, and global payments as your Merchant of Record.",
    },
    {
      question: "How much does it cost?",
      answer: "The Standard plan is 4% + 40c per transaction with no monthly fees. Enterprise is custom.",
    },
    {
      question: "Which countries are supported?",
      answer: "Payments in 220+ countries and regions, 80+ currencies, and 40+ local payment methods.",
    },
  ],
  knowledge: `Dodo Payments (dodopayments.com) is the billing and payments platform for AI-first companies.
Dashboard: https://app.dodopayments.com Docs: https://docs.dodopayments.com
Merchant of Record: handles VAT, GST, sales tax, chargebacks, and compliance.
Products: Payments, Billing (credits, usage, subscriptions, one-time), Distribution (storefronts, license keys), Sentra (IDE billing agent for VS Code, Cursor, Windsurf).
Stats: 40+ payment methods, 80+ currencies, 220+ countries, 14+ checkout languages, 99.99% uptime, PCI DSS Level 1, 50,000+ builders.
Pricing: Standard 4% + 40c per domestic US transaction, no fixed costs. Enterprise custom.
SDKs: TypeScript, Python, PHP, Go, Ruby, Java, Kotlin, C#, Rust. MCP server available.
Backed by Antler, a16z, Lightspeed, Visa, Goldman Sachs, Razorpay, AWS, and others.`,
});

export const POST_BRIDGE = featuredAgent("post-bridge", {
  name: "Post Bridge",
  website: "https://post-bridge.com",
  description:
    "Simple social media scheduling. Post to all your accounts from one dashboard, fairly priced, with human support from Jack.",
  email: "support@post-bridge.com",
  products: ["Cross-posting", "Scheduling", "Content studio", "API"],
  services: [
    "Publish to X, Instagram, LinkedIn, Facebook, TikTok, YouTube, Bluesky, Threads, Pinterest, Google Business",
    "Schedule and queue posts",
    "Video templates",
  ],
  pricing: [
    "Free: 5 posts",
    "Creator $29/month: 15 accounts, unlimited posts",
    "Growth $49/month: 50 accounts",
    "Pro $99/month: unlimited accounts",
    "API add-on $5/month or $50/year",
  ],
  faqs: [
    {
      question: "What platforms does Post Bridge support?",
      answer:
        "X/Twitter, Instagram, LinkedIn, Facebook, TikTok, YouTube, Bluesky, Threads, Pinterest, and Google Business.",
    },
    {
      question: "How much does it cost?",
      answer:
        "Creator is $29/month, Growth $49, Pro $99. Paying users get unlimited posts. There is a 7-day free trial.",
    },
    {
      question: "Who made Post Bridge?",
      answer: "Jack built Post Bridge as a simple, affordable alternative to Buffer and Hootsuite.",
    },
  ],
  knowledge: `Post Bridge (post-bridge.com) is social media scheduling for everyone. Made by Jack.
Post to all platforms in about 30 seconds. 1,405+ customers. Human support from the founder.
Platforms: Twitter/X, Instagram, LinkedIn, Facebook, TikTok, YouTube, Bluesky, Threads, Pinterest, Google Business.
Features: instant cross-posting, scheduling, content management, content studio for videos, MCP agent connect, developer API.
Pricing: Creator $29/mo (15 accounts), Growth $49/mo (50 accounts + team), Pro $99/mo (unlimited). Unlimited posts for paying users. Free users: 5 posts. Cancel anytime. Refunds within 7 days.
Support: support@post-bridge.com
Does not reduce reach vs posting manually. Uses official OAuth, never stores social passwords.`,
});

export const SUPABASE = featuredAgent("supabase", {
  name: "Supabase",
  website: "https://supabase.com",
  description:
    "Open-source Postgres platform: database, auth, storage, realtime, and edge functions. The Firebase alternative built on PostgreSQL.",
  products: ["Postgres database", "Auth", "Storage", "Realtime", "Edge Functions", "Vectors"],
  services: ["Hosted Postgres", "Row Level Security", "Auto APIs", "Dashboard"],
  pricing: ["Free tier", "Pro", "Team", "Enterprise"],
  faqs: [
    {
      question: "What is Supabase?",
      answer:
        "Supabase is an open-source backend platform built on PostgreSQL, with auth, storage, realtime, and edge functions.",
    },
    {
      question: "Is there a free plan?",
      answer: "Yes. Supabase has a free tier for projects, plus Pro, Team, and Enterprise plans.",
    },
    {
      question: "How do I get started?",
      answer: "Create a project at supabase.com, then use the JS or other client libraries with your project URL and anon key.",
    },
  ],
  knowledge: `Supabase (supabase.com) is an open-source Firebase alternative built on PostgreSQL.
Core: hosted Postgres, Auth (email, OAuth including Google), Storage, Realtime subscriptions, Edge Functions, Vector embeddings.
Row Level Security, auto-generated APIs, dashboard SQL editor.
Docs: https://supabase.com/docs Dashboard: https://supabase.com/dashboard
Clients: JavaScript, Flutter, Python, Swift, Kotlin, and more.
Pricing includes a free tier for getting started.`,
});

export const GLOBAL_CAMPUS_X = featuredAgent("globalcampusx", {
  name: "GlobalCampusX",
  website: "https://globalcampusx.com",
  description:
    "Global student social network and AI-matching platform. Find peers, mentors, scholarships, hackathons, and your university path.",
  products: ["UniClash", "Hackathons", "Mentors", "BagChase", "Visa Copilot", "Arena"],
  services: [
    "AI peer matching",
    "University comparison",
    "Scholarship matching",
    "Study abroad",
    "Student feed",
  ],
  pricing: ["Free for students"],
  faqs: [
    {
      question: "What is GlobalCampusX?",
      answer:
        "GlobalCampusX is the student social network where AI matches you with peers, mentors, scholarships, hackathons, and universities.",
    },
    {
      question: "Is it free?",
      answer: "Yes. GlobalCampusX is free for students. Join at globalcampusx.com/signup.",
    },
    {
      question: "What can I do there?",
      answer:
        "Compare universities with UniClash, join hackathons, book mentors, match scholarships with BagChase, track visas, and post wins on the live feed.",
    },
  ],
  knowledge: `GlobalCampusX (globalcampusx.com) is the global student social network and AI-matching platform.
Tagline: Where ambitious students find their people. Find your people. Find your path.
Products: UniClash (compare 4 universities), Hackathons, Mentors, BagChase scholarships, Visa Copilot (8 countries), Arena recruiter challenges.
AI matching swipe by swipe. Live student feed of admits, offers, hackathon wins.
Explore, Discover, Study Abroad, Graduate Abroad.
Join free: https://globalcampusx.com/signup Login: https://globalcampusx.com/login`,
});

export const FEATURED_AGENTS: AgentRecord[] = [DODO_PAYMENTS, POST_BRIDGE, SUPABASE, GLOBAL_CAMPUS_X];

export function getFeaturedAgent(slug: string) {
  return FEATURED_AGENTS.find((agent) => agent.slug === slug) || null;
}
