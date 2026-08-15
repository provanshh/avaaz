import { Navbar } from "@/components/navbar";
import { CreateCta } from "@/components/create-cta";

const plans = [
  {
    name: "Starter",
    price: "Free",
    body: "Create agents, talk by voice, and share a public link.",
    points: ["3 agents", "Website + voice setup", "Public talk page"],
  },
  {
    name: "Studio",
    price: "$12",
    body: "For teams that want more agents and a sharper presence.",
    points: ["Unlimited agents", "Custom logo & FAQs", "Follower insights"],
    featured: true,
  },
  {
    name: "House",
    price: "Talk",
    body: "For brands that need volume, support, and a dedicated voice.",
    points: ["Priority crawl", "Team seats", "Guided setup"],
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-0 flex-1">
      <Navbar />
      <main className="mx-auto max-w-5xl px-6 pb-20 pt-16">
        <p className="text-center text-[11px] uppercase tracking-[0.2em] text-muted">Pricing</p>
        <h1 className="mt-4 text-center font-serif text-5xl">Simple plans. Real voice.</h1>
        <p className="mx-auto mt-4 max-w-lg text-center text-muted">
          Start free. Upgrade when you need more agents. No payment is required to try Avaaz.
        </p>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={`rounded-3xl border bg-white p-6 ${
                plan.featured ? "border-black ring-2 ring-accent/25" : "border-border"
              }`}
            >
              <p className="text-sm text-muted">{plan.name}</p>
              <p className="mt-3 font-serif text-4xl">{plan.price}</p>
              <p className="mt-3 text-sm text-muted">{plan.body}</p>
              <ul className="mt-6 space-y-2 text-sm">
                {plan.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
              <CreateCta className="mt-8 w-full" variant={plan.featured ? "default" : "outline"}>
                Create an agent
              </CreateCta>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
