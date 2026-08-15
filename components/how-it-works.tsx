"use client";

const steps = [
  {
    n: "01",
    title: "Website",
    body: "For businesses, paste your site. Avaaz reads it and drafts the agent for you.",
    src: "/how-it-works/website.png",
    motion: "how-icon-orbit",
  },
  {
    n: "02",
    title: "Talk",
    body: "We only ask by voice about what's still missing.",
    src: "/how-it-works/talk.png",
    motion: "how-icon-pulse",
  },
  {
    n: "03",
    title: "Share",
    body: "Your AI voice agent is ready to talk to anyone.",
    src: "/how-it-works/share.png",
    motion: "how-icon-float",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="mx-auto max-w-5xl px-6 py-25">
      <div className="grid gap-10 md:grid-cols-3 md:gap-8">
        {steps.map((step) => (
          <div key={step.n} className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs tracking-[0.2em] text-muted">{step.n}</p>
              <h2 className="mt-3 font-serif text-3xl">{step.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted">{step.body}</p>
            </div>
            <img
              src={step.src}
              alt=""
              className={`mt-1 size-16 shrink-0 object-contain sm:size-20 ${step.motion}`}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
