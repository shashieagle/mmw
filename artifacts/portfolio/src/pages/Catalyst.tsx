import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, Pencil, Check, X } from "lucide-react";
import { useAdminMode } from "@/hooks/use-admin-mode";

function RevealText({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSfLJEOXoKRif28t9JfuTrvFbj5q8DHiEeOUFuzmjK2EE-IapA/viewform?usp=publish-editor";

const PILLARS = [
  { num: "01", title: "AI-First Execution", body: "Every member of the core team thinks in systems and builds with AI. We don't use it as a shortcut — we use it as an amplifier." },
  { num: "02", title: "Small by Design", body: "50 seats. That's the ceiling. We keep the team tight so every voice matters and every project gets real attention." },
  { num: "03", title: "Two Disciplines, One Team", body: "Creative studio and business architecture under one roof. The crossover is where the real work happens." },
  { num: "04", title: "Ownership Mindset", body: "Core members don't just take briefs — they take initiative. You'll have skin in the outcomes, not just the process." },
];

export default function Catalyst() {
  const { isAdmin } = useAdminMode();
  const [gammaUrl, setGammaUrl] = useState("");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data: Record<string, string>) => {
        setGammaUrl(data["catalyst_presentation"] ?? "");
      })
      .catch(() => {});
  }, []);

  const startEdit = () => { setEditing(true); setDraft(gammaUrl); };
  const cancelEdit = () => { setEditing(false); setDraft(""); };
  const saveEdit = async () => {
    setSaving(true);
    try {
      await fetch("/api/settings/catalyst_presentation", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: draft }),
      });
      setGammaUrl(draft);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      {/* Hero */}
      <section className="min-h-screen flex flex-col justify-end pb-24 md:pb-32 px-6 md:px-12 pt-32 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-black to-zinc-950" />
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.75%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E")' }}
        />

        {/* 50 watermark */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 text-[28vw] font-bold text-white/[0.025] select-none leading-none tracking-tighter pointer-events-none pr-4">
          50
        </div>

        <div className="relative z-10 container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 48 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.21, 0.47, 0.32, 0.98] }}
          >
            <p className="text-[10px] uppercase tracking-[0.7em] text-gray-600 font-bold mb-8">
              Core Team · 50 Seats Only
            </p>
            <h1 className="text-[15vw] md:text-[12vw] lg:text-[10vw] font-bold tracking-tighter leading-[0.85] mb-10 font-display">
              CATALYST.
            </h1>
            <p className="text-gray-400 text-xl md:text-2xl max-w-xl leading-relaxed">
              A private creative and strategic force. 50 people who think differently, build differently, and move faster than the market.
            </p>
          </motion.div>
        </div>
      </section>

      {/* What is the core team */}
      <section className="py-24 md:py-40 border-t border-white/5">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-32 items-start">
            <RevealText>
              <p className="text-[10px] uppercase tracking-[0.6em] text-gray-600 font-bold mb-6">What This Is</p>
              <h2 className="text-5xl md:text-6xl font-bold tracking-tighter font-display leading-[0.9] text-white">
                NOT A<br />
                <span className="text-transparent" style={{ WebkitTextStroke: "1px rgba(255,255,255,0.25)" }}>COMMUNITY.</span><br />
                A CREW.
              </h2>
            </RevealText>
            <RevealText delay={0.15}>
              <p className="text-gray-400 text-lg leading-relaxed mb-6">
                The Catalyst core team is not a Discord server, not a newsletter list, not a mastermind group with 500 people.
              </p>
              <p className="text-gray-400 text-lg leading-relaxed mb-6">
                It's 50 seats at the table inside monkmonkeyworks — reserved for collaborators, strategists, and creatives who want to be in the room where the actual work happens.
              </p>
              <p className="text-gray-500 text-base leading-relaxed">
                You'll have access to active projects, internal tools, and direct line to the founding team. In return, we expect you to show up and bring something real.
              </p>
            </RevealText>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="py-24 md:py-32 border-t border-white/5 bg-zinc-950">
        <div className="container mx-auto px-6 md:px-12">
          <RevealText className="mb-16 md:mb-20">
            <p className="text-[10px] uppercase tracking-[0.6em] text-gray-600 font-bold mb-4">How We Operate</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter font-display text-white">The Four Pillars</h2>
          </RevealText>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/5">
            {PILLARS.map((p, i) => (
              <RevealText key={p.num} delay={i * 0.08}>
                <div className="bg-zinc-950 p-10 md:p-12 h-full">
                  <span className="text-white/15 font-mono text-xs font-bold block mb-6">{p.num}</span>
                  <h3 className="text-xl font-bold tracking-tight text-white mb-4">{p.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{p.body}</p>
                </div>
              </RevealText>
            ))}
          </div>
        </div>
      </section>

      {/* Seats counter */}
      <section className="py-24 md:py-32 border-t border-white/5">
        <div className="container mx-auto px-6 md:px-12 text-center">
          <RevealText>
            <p className="text-[10px] uppercase tracking-[0.6em] text-gray-600 font-bold mb-6">Availability</p>
            <div className="text-[20vw] md:text-[14vw] font-bold tracking-tighter font-display leading-none text-white mb-4">50</div>
            <p className="text-gray-500 text-lg uppercase tracking-[0.3em]">Total Seats · Ever</p>
          </RevealText>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 md:py-40 border-t border-white/5 bg-zinc-950">
        <div className="container mx-auto px-6 md:px-12">
          <RevealText className="mb-16">
            <p className="text-[10px] uppercase tracking-[0.6em] text-gray-600 font-bold mb-6">Ready?</p>
            <h2 className="text-5xl md:text-7xl font-bold tracking-tighter font-display leading-[0.88] text-white mb-6">
              SEE WHAT<br />
              <span className="text-transparent" style={{ WebkitTextStroke: "1px rgba(255,255,255,0.25)" }}>YOU'RE</span><br />
              JOINING.
            </h2>
            <p className="text-gray-500 text-lg max-w-md leading-relaxed">
              Start with the full picture — then apply. We review every submission personally.
            </p>
          </RevealText>

          <RevealText delay={0.1}>
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              {/* Presentation button */}
              {gammaUrl ? (
                <a href={gammaUrl} target="_blank" rel="noopener noreferrer">
                  <Button className="bg-white text-black hover:bg-gray-100 rounded-none px-12 py-8 uppercase tracking-[0.2em] text-sm font-bold inline-flex items-center gap-3">
                    View the Deck <ArrowRight size={16} />
                  </Button>
                </a>
              ) : (
                <Button disabled={!isAdmin} className="bg-white/10 text-gray-600 rounded-none px-12 py-8 uppercase tracking-[0.2em] text-sm font-bold cursor-not-allowed">
                  {isAdmin ? "Add deck link below ↓" : "Deck coming soon"}
                </Button>
              )}

              {/* Apply button */}
              <a href={FORM_URL} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="border-white/20 text-white hover:bg-white hover:text-black rounded-none px-12 py-8 uppercase tracking-[0.2em] text-sm font-bold transition-colors inline-flex items-center gap-3">
                  Apply Now <ArrowRight size={16} />
                </Button>
              </a>
            </div>

            {/* Admin: set Gamma link */}
            {isAdmin && (
              <div className="mt-6 max-w-md">
                {editing ? (
                  <div className="flex flex-col gap-2">
                    <input
                      className="w-full bg-black border border-white/20 text-white text-xs px-3 py-2 outline-none focus:border-white/50 placeholder:text-gray-600"
                      placeholder="Paste Gamma / Google Slides link…"
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={saveEdit}
                        disabled={saving}
                        className="flex items-center gap-1 px-3 py-1.5 bg-white text-black text-xs font-bold uppercase tracking-wider hover:bg-gray-200 transition-colors disabled:opacity-50"
                      >
                        <Check size={11} /> Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="flex items-center gap-1 px-3 py-1.5 border border-white/20 text-gray-400 text-xs hover:text-white transition-colors"
                      >
                        <X size={11} /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={startEdit}
                    className="flex items-center gap-2 text-xs text-gray-600 hover:text-white transition-colors border border-white/10 px-3 py-2 w-full"
                  >
                    <Pencil size={11} />
                    {gammaUrl ? (
                      <span className="truncate">{gammaUrl}</span>
                    ) : (
                      <span>Set presentation link (Gamma, Slides, etc.)…</span>
                    )}
                  </button>
                )}
              </div>
            )}
          </RevealText>
        </div>
      </section>

      <Footer />
    </div>
  );
}
