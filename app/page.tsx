import { ArrowRight } from "lucide-react";
import { CreateCta } from "@/components/create-cta";
import { Navbar } from "@/components/navbar";
import { AgentsGallery } from "@/components/agent/agents-gallery";
import { HowItWorks } from "@/components/how-it-works";
import { HeroWave } from "@/components/voice/waveform";
import { AudienceDriftWall } from "@/components/audience-drift-wall";

const examples = ["Business", "Personal", "Other", "Creator", "Teacher", "Restaurant", "Freelancer"];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      <section className="mx-auto max-w-5xl px-6 pb-2 pt-1 text-center sm:pt-1">
        <p className="animate-fade-up mt-22 text-[11px] font-medium uppercase tracking-[0.22em] text-muted">
          Your knowledge, powered by voice
        </p>
        <h1 className="animate-fade-up font-serif mt-6 text-[2.7rem] leading-[1.05] tracking-tight text-foreground sm:text-6xl md:text-[4.4rem]">
          Give your business a voice.
        </h1>
        
        {/* <p className="animate-fade-up mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted sm:text-lg"> */}
          {/* For a business, paste your website. Avaaz reads it, then you only talk about what&apos;s left. */}
        {/* </p> */}
        <div className="animate-fade-up mt-15 flex flex-col items-center gap-4">
          <CreateCta size="lg">
            Create my agent <ArrowRight className="size-4" />
          </CreateCta>
          <p className="text-sm text-muted">Sign in with Google to create. Paste a site, then talk if anything is missing.</p>
        </div>
        <HeroWave />
      </section>

      <HowItWorks />

      <AgentsGallery />

      <section id="examples" className="pb-28 pt-8 text-center">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="font-serif text-4xl sm:text-5xl">One platform. Infinite agents.</h2>
          <div className="mt-10 flex flex-wrap justify-center gap-2">
            {examples.map((ex) => (
              <span
                key={ex}
                className="rounded-full border border-border bg-white px-4 py-2 text-sm text-muted transition-colors hover:border-black/15 hover:text-foreground"
              >
                {ex}
              </span>
            ))}
          </div>
          <p className="mt-16 text-sm text-muted">Create your AI voice agent by simply talking.</p>
          <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.2em] text-muted">
            For businesses and everyone
          </p>
        </div>
        <AudienceDriftWall />
      </section>
    </div>
  );
}
