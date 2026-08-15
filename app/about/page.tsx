import { Navbar } from "@/components/navbar";
import { CreateCta } from "@/components/create-cta";
import { ArrowRight } from "lucide-react";

const sections = [
  { href: "#overview", label: "Overview" },
  { href: "#products", label: "Products & services" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#why-avaaz", label: "Why only Avaaz" },
  { href: "#different", label: "Are we different?" },
];

const products = [
  {
    t: "Website agent",
    d: "Paste a business site. Avaaz reads it, drafts knowledge, then only asks — by voice — about what’s still missing.",
  },
  {
    t: "Personal agent",
    d: "Talk through who you are. Notes, FAQs, and a public voice that can introduce you without a form.",
  },
  {
    t: "Public talk page",
    d: "One shareable link. Visitors speak, get answers out loud, follow the agent, and copy a snippet to embed.",
  },
  {
    t: "Knowledge + search",
    d: "Answers come from what you taught the agent first. If that’s not enough, it looks the web up instead of saying it doesn’t know.",
  },
];

const steps = [
  {
    n: "01",
    t: "Sign in",
    d: "Google is enough. Creating an agent is gated so your knowledge stays tied to you.",
  },
  {
    n: "02",
    t: "Choose a type",
    d: "Business, personal, or other. Businesses start with a website. Everyone else starts by talking.",
  },
  {
    n: "03",
    t: "Fill the gaps",
    d: "Avaaz already has what it crawled. You only speak about hours, products, FAQs, or anything the page didn’t cover.",
  },
  {
    n: "04",
    t: "Pick a voice & share",
    d: "Choose a female or male voice, then publish. Anyone with the link can talk — no install.",
  },
];

const reasons = [
  {
    t: "You talk. We don’t make you type a wiki.",
    d: "Setup is a conversation, not a dashboard of empty fields. The agent is born from speech and a site, not a CMS.",
  },
  {
    t: "Voice first, not chatbot-with-a-mic.",
    d: "The public page is built to listen and answer out loud. Text is there as a fallback — it isn’t the product.",
  },
  {
    t: "One screen to share.",
    d: "Logo, name, FAQs, follow, and the live voice sit together. People don’t hunt through a help center.",
  },
  {
    t: "For shops and for people.",
    d: "The same flow works for a payments company, a campus, a creator, or you. Not a vertical locked to “support bots.”",
  },
];

const contrasts = [
  { them: "Chat widgets that dump paragraphs", us: "A voice that answers, then keeps listening" },
  { them: "You fill 40 fields before anything works", us: "Paste a site. Speak only what’s missing" },
  { them: "Generic “AI assistant” with no memory of you", us: "Knowledge from your pages, notes, and FAQs" },
  { them: "Hidden behind an app or a login wall", us: "A public link anyone can talk to" },
];

export default function AboutPage() {
  return (
    <div className="min-h-0 flex-1">
      <Navbar />
      <main className="mx-auto max-w-3xl px-6 pb-24 pt-16">
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted">About us</p>
        <h1 className="mt-4 font-serif text-5xl leading-[1.1]">Knowledge should be easy to talk to.</h1>
        <p className="mt-6 text-base leading-relaxed text-muted">
          Avaaz turns a website, a conversation, or a few notes into a voice agent anyone can call. No code. Light,
          calm, and ready to share.
        </p>

        <nav className="mt-10 flex flex-wrap gap-2" aria-label="On this page">
          {sections.map((section) => (
            <a
              key={section.href}
              href={section.href}
              className="rounded-full border border-border bg-white px-3 py-1.5 text-xs text-muted transition-colors hover:border-black/15 hover:text-foreground"
            >
              {section.label}
            </a>
          ))}
        </nav>

        <section id="overview" className="scroll-mt-28 mt-16">
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted">Overview</p>
          <h2 className="mt-3 font-serif text-3xl">Give your knowledge a voice.</h2>
          <p className="mt-4 text-base leading-relaxed text-muted">
            Most knowledge is stuck on a site, a PDF, or in someone&apos;s head. Avaaz listens to that, then speaks
            it back. Businesses paste their website. People talk through what&apos;s left. Visitors get answers out
            loud — not another chatbot wall of text.
          </p>
          <p className="mt-4 text-base leading-relaxed text-muted">
            We built it for shops, creators, campuses, and anyone who wants a public voice that actually knows them.
            Sign in with Google, create an agent, and share one link.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              { t: "Listen", d: "Paste a site or speak. Avaaz drafts the agent." },
              { t: "Talk", d: "A live voice answers from your knowledge — and the web when needed." },
              { t: "Share", d: "One link. Followers. A page that fits on a single screen." },
            ].map((item) => (
              <div key={item.t} className="rounded-2xl border border-border bg-white p-4">
                <h3 className="font-serif text-2xl">{item.t}</h3>
                <p className="mt-2 text-sm text-muted">{item.d}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="products" className="scroll-mt-28 mt-20">
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted">Products & services</p>
          <h2 className="mt-3 font-serif text-3xl">What you get with Avaaz.</h2>
          <p className="mt-4 text-base leading-relaxed text-muted">
            One product: a voice agent that belongs to you. These are the pieces that make it usable on day one.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {products.map((item) => (
              <article key={item.t} className="rounded-2xl border border-border bg-white p-5">
                <h3 className="font-medium">{item.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{item.d}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="how-it-works" className="scroll-mt-28 mt-20">
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted">How it works</p>
          <h2 className="mt-3 font-serif text-3xl">Website. Talk. Share.</h2>
          <p className="mt-4 text-base leading-relaxed text-muted">
            For a business, the site does most of the work. Avaaz reads it, then you only talk about gaps. For
            everyone else, you skip the URL and start speaking.
          </p>
          <ol className="mt-8 space-y-4">
            {steps.map((step) => (
              <li key={step.n} className="flex gap-4 rounded-2xl border border-border bg-white p-5">
                <span className="text-xs tracking-[0.18em] text-muted">{step.n}</span>
                <div>
                  <h3 className="font-medium">{step.t}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{step.d}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section id="why-avaaz" className="scroll-mt-28 mt-20">
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted">Why only Avaaz</p>
          <h2 className="mt-3 font-serif text-3xl">Because talking is faster than configuring.</h2>
          <p className="mt-4 text-base leading-relaxed text-muted">
            You could stitch a crawler, a chatbot, and a TTS demo yourself. Avaaz is the whole path — from a URL to
            a voice people can actually call — without a stack of tools.
          </p>
          <div className="mt-8 space-y-4">
            {reasons.map((item) => (
              <div key={item.t} className="border-t border-border pt-4 first:border-t-0 first:pt-0">
                <h3 className="font-medium">{item.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{item.d}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="different" className="scroll-mt-28 mt-20">
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted">Are we different?</p>
          <h2 className="mt-3 font-serif text-3xl">Yes — we start where others stop.</h2>
          <p className="mt-4 text-base leading-relaxed text-muted">
            Most “AI agents” are chat boxes with a personality slider. Avaaz is a public voice that already knows
            your business or your story, because you taught it by talking.
          </p>
          <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-white">
            <div className="grid grid-cols-2 border-b border-border bg-[#fafaf8] px-5 py-3 text-[11px] uppercase tracking-[0.16em] text-muted">
              <span>Typical tools</span>
              <span>Avaaz</span>
            </div>
            {contrasts.map((row) => (
              <div key={row.us} className="grid grid-cols-2 gap-4 border-b border-border px-5 py-4 last:border-b-0">
                <p className="text-sm text-muted">{row.them}</p>
                <p className="text-sm">{row.us}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-16 rounded-3xl border border-border bg-white px-6 py-10 text-center">
          <h2 className="font-serif text-3xl">Ready when you are.</h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted">
            Sign in with Google. Paste a site or start talking. Your agent can be live in one sitting.
          </p>
          <CreateCta size="lg" className="mt-6">
            Create my agent <ArrowRight className="size-4" />
          </CreateCta>
        </div>
      </main>
    </div>
  );
}
