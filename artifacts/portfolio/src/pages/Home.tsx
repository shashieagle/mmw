import { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "wouter";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { useListVideos, useGetVideoStats } from "@workspace/api-client-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { VideoCard } from "@/components/VideoCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, Pencil, Check, X } from "lucide-react";
import { useAdminMode } from "@/hooks/use-admin-mode";

function Ticker({ text }: { text: string }) {
  const repeated = Array(12).fill(text).join(" · ");
  return (
    <div className="overflow-hidden border-y border-white/10 py-4 bg-black select-none">
      <div className="flex whitespace-nowrap animate-ticker">
        <span className="text-xs uppercase tracking-[0.3em] text-gray-600 font-bold pr-8">{repeated}</span>
        <span className="text-xs uppercase tracking-[0.3em] text-gray-600 font-bold pr-8">{repeated}</span>
      </div>
    </div>
  );
}

function RevealText({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.9, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function JamSection() {
  const { isAdmin } = useAdminMode();
  const [active, setActive] = useState<"business" | "creator">("business");
  const [forms, setForms] = useState({ business: "", creator: "" });
  const [editing, setEditing] = useState<"business" | "creator" | null>(null);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data: Record<string, string>) => {
        setForms({
          business: data["jam_form_business"] ?? "",
          creator: data["jam_form_creator"] ?? "",
        });
      })
      .catch(() => {});
  }, []);

  const startEdit = useCallback((key: "business" | "creator") => {
    setEditing(key);
    setDraft(forms[key]);
  }, [forms]);

  const cancelEdit = useCallback(() => { setEditing(null); setDraft(""); }, []);

  const saveEdit = useCallback(async () => {
    if (!editing) return;
    setSaving(true);
    try {
      await fetch(`/api/settings/jam_form_${editing}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: draft }),
      });
      setForms((f) => ({ ...f, [editing]: draft }));
      setEditing(null);
    } finally {
      setSaving(false);
    }
  }, [editing, draft]);

  const content = {
    business: {
      tag: "For Business Owners",
      headline: "Strategy.\nSystems.\nResults.",
      body: "Tell us what's holding your business back. We'll build what gets you past it.",
      cta: "Start the Conversation",
    },
    creator: {
      tag: "For Creators",
      headline: "Your idea.\nOur craft.\nSomething new.",
      body: "Bring us the spark. We'll build the fire.",
      cta: "Tell Us Your Vision",
    },
  };

  const c = content[active];
  const formUrl = forms[active];

  return (
    <section className="py-24 md:py-40 bg-zinc-950 border-t border-white/5 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.75%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E")' }}
      />

      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <RevealText className="mb-14 md:mb-20">
          <p className="text-[10px] uppercase tracking-[0.6em] text-gray-600 font-bold mb-6">Let's Work Together</p>
          <h2 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter text-white font-display leading-[0.88] mb-6">
            LET'S<br />
            <span className="text-transparent" style={{ WebkitTextStroke: "1px rgba(255,255,255,0.3)" }}>GO.</span>
          </h2>
          <p className="text-gray-500 text-lg max-w-md">Tell us who you are and what you need. We'll take it from there.</p>
        </RevealText>

        {/* Toggle */}
        <RevealText delay={0.1}>
          <div className="inline-flex border border-white/10 p-1 mb-14 md:mb-20">
            {(["business", "creator"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActive(tab)}
                className={`px-8 py-3 text-xs uppercase tracking-[0.25em] font-bold transition-all duration-300 ${
                  active === tab ? "bg-white text-black" : "text-gray-500 hover:text-white"
                }`}
              >
                {tab === "business" ? "Business Owner" : "Creator"}
              </button>
            ))}
          </div>
        </RevealText>

        {/* Content */}
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 items-end"
        >
          <div>
            <p className="text-[10px] uppercase tracking-[0.5em] text-gray-600 font-bold mb-6">{c.tag}</p>
            <h3 className="text-4xl md:text-5xl font-bold tracking-tighter text-white font-display leading-[1.0] mb-8 whitespace-pre-line">
              {c.headline}
            </h3>
            <p className="text-gray-400 text-base leading-relaxed max-w-sm">{c.body}</p>
          </div>

          <div className="flex flex-col gap-6 md:items-end">
            <div className="grid grid-cols-1 gap-px bg-white/5 w-full md:max-w-xs">
              {(active === "business"
                ? ["Your industry & scale", "Current content setup", "Goals & timeline", "Budget range"]
                : ["Your creative focus", "Platform & audience", "The project idea", "Collaboration style"]
              ).map((q, i) => (
                <div key={i} className="bg-zinc-950 px-5 py-4 flex items-center gap-4">
                  <span className="text-white/15 font-mono text-xs font-bold">0{i + 1}</span>
                  <span className="text-gray-400 text-sm">{q}</span>
                </div>
              ))}
            </div>

            <p className="text-gray-600 text-xs uppercase tracking-widest">We ask these in the form ↓</p>

            {/* Admin: editable form URL */}
            {isAdmin && (
              <div className="w-full md:max-w-xs">
                {editing === active ? (
                  <div className="flex flex-col gap-2">
                    <input
                      className="w-full bg-black border border-white/20 text-white text-xs px-3 py-2 outline-none focus:border-white/50 placeholder:text-gray-600"
                      placeholder="Paste Google Form link…"
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
                    onClick={() => startEdit(active)}
                    className="flex items-center gap-2 text-xs text-gray-600 hover:text-white transition-colors border border-white/10 px-3 py-2 w-full"
                  >
                    <Pencil size={11} />
                    {formUrl ? (
                      <span className="truncate">{formUrl}</span>
                    ) : (
                      <span className="text-gray-600">Set {active === "business" ? "Business Owner" : "Creator"} form link…</span>
                    )}
                  </button>
                )}
              </div>
            )}

            {/* CTA button */}
            {formUrl ? (
              <a href={formUrl} target="_blank" rel="noopener noreferrer" className="w-full md:w-auto">
                <Button className="bg-white text-black hover:bg-gray-100 rounded-none px-10 py-6 uppercase tracking-[0.2em] text-xs font-bold w-full md:w-auto">
                  {c.cta} →
                </Button>
              </a>
            ) : (
              <Button disabled className="bg-white/10 text-gray-600 rounded-none px-10 py-6 uppercase tracking-[0.2em] text-xs font-bold w-full md:w-auto cursor-not-allowed">
                {isAdmin ? "Add form link above to activate" : c.cta + " →"}
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default function Home() {
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.4], ["0%", "25%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.35], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 1.06]);

  const { data: featuredVideos } = useListVideos({ featured: true });
  const { data: recentVideos } = useListVideos();
  const { data: stats } = useGetVideoStats();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const galleryVideos = (featuredVideos || [])
    .concat((recentVideos || []).filter((v) => !featuredVideos?.find((f) => f.id === v.id)))
    .sort((a, b) => {
      if (a.orientation === b.orientation) return 0;
      return a.orientation === "landscape" ? -1 : 1;
    })
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-x-hidden">
      <Navbar />

      {/* HERO — full screen cinematic */}
      <section className="relative h-screen w-full overflow-hidden bg-black flex items-end pb-20 md:pb-32">
        <motion.div className="absolute inset-0 z-0" style={{ y: heroY, scale: heroScale }}>
          <div className="w-full h-full bg-gradient-to-br from-zinc-900 via-black to-zinc-950" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/20" />
        </motion.div>

        <motion.div
          className="relative z-10 container mx-auto px-6 md:px-12"
          style={{ opacity: heroOpacity }}
        >
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-xs uppercase tracking-[0.6em] text-gray-500 font-bold mb-6"
          >
            AI Creative & Business Intelligence
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="text-7xl md:text-[10rem] lg:text-[13rem] font-bold tracking-tighter text-white leading-[0.82] font-display"
          >
            MONK
            <br />
            <span className="text-transparent" style={{ WebkitTextStroke: "1px rgba(255,255,255,0.35)" }}>
              MONKEY
            </span>
            <br />
            WORKS.
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.4 }}
            className="mt-10 flex flex-col sm:flex-row gap-4"
          >
            <Link href="/architects">
              <Button className="bg-white text-black hover:bg-gray-200 rounded-none px-10 py-6 uppercase tracking-[0.2em] text-xs font-bold">
                Business Architects
              </Button>
            </Link>
            <Link href="/studio">
              <Button
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 rounded-none px-10 py-6 uppercase tracking-[0.2em] text-xs font-bold bg-transparent"
              >
                Explore Studio
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          className="absolute bottom-10 right-12 z-20 flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2 }}
        >
          <div className="w-[1px] h-16 bg-gradient-to-b from-transparent via-gray-500 to-transparent animate-pulse" />
        </motion.div>
      </section>

      {/* TICKER */}
      <Ticker text="Creative Studio — Business Intelligence Architects — We build what's next" />

      {/* TWO ARMS — full-bleed split */}
      <section className="relative z-20 bg-background">
        <div className="grid grid-cols-1 md:grid-cols-2 min-h-[70vh]">
          <Link href="/studio">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="group relative overflow-hidden border-b md:border-b-0 md:border-r border-white/10 p-12 md:p-16 lg:p-24 flex flex-col justify-between min-h-[420px] hover:bg-white/[0.03] transition-all duration-700 cursor-pointer"
            >
              <div>
                <p className="text-[10px] uppercase tracking-[0.6em] text-gray-600 font-bold mb-8">01 — Creative Division</p>
                <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter text-white mb-6 font-display leading-[0.88]">
                  The
                  <br />
                  Studio
                </h2>
                <p className="text-gray-500 text-base leading-relaxed max-w-xs">
                  Visuals, films, and branded content crafted entirely through AI. We make what
                  couldn't be made before.
                </p>
              </div>
              <div className="mt-10 flex items-center gap-3 text-white text-sm uppercase tracking-widest font-bold group-hover:gap-6 transition-all duration-500">
                View Work <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
              </div>

              {/* Corner accent */}
              <div className="absolute bottom-0 right-0 w-24 h-24 border-r border-b border-white/5 group-hover:border-white/20 transition-colors duration-700" />
            </motion.div>
          </Link>

          <Link href="/architects">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="group relative overflow-hidden p-12 md:p-16 lg:p-24 flex flex-col justify-between min-h-[420px] bg-zinc-950 hover:bg-zinc-900 transition-all duration-700 cursor-pointer"
            >
              <div>
                <p className="text-[10px] uppercase tracking-[0.6em] text-gray-600 font-bold mb-8">02 — Business Division</p>
                <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter text-white mb-6 font-display leading-[0.88]">
                  Business
                  <br />
                  Architects
                </h2>
                <p className="text-gray-500 text-base leading-relaxed max-w-xs">
                  Strategy, implementation, and automation for businesses ready to scale with AI at
                  the core.
                </p>
              </div>
              <div className="mt-10 flex items-center gap-3 text-white text-sm uppercase tracking-widest font-bold group-hover:gap-6 transition-all duration-500">
                Case Studies <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
              </div>

              <div className="absolute bottom-0 right-0 w-24 h-24 border-r border-b border-white/5 group-hover:border-white/20 transition-colors duration-700" />
            </motion.div>
          </Link>
        </div>
      </section>

      {/* WHO WE ARE */}
      <section className="py-32 md:py-48 bg-black border-t border-white/5">
        <div className="container mx-auto px-6 md:px-12">
          <RevealText className="max-w-5xl">
            <p className="text-xs uppercase tracking-[0.5em] text-gray-600 font-bold mb-8">About</p>
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter text-white leading-[1.05] mb-10">
              A Creative Studio<br />and Business Intelligence<br />
              <span className="text-gray-500">practice built on AI.</span>
            </h2>
            <p className="text-gray-400 text-xl font-light leading-relaxed max-w-2xl">
              One team. Both sides of the intelligence revolution.
            </p>
          </RevealText>
        </div>
      </section>

      {/* TICKER 2 */}
      <Ticker text="Film · Product Photography · Catalogues · Brand Campaigns · AI Strategy · Implementation · Scale" />

      {/* FEATURED WORK */}
      {galleryVideos.length > 0 && (
        <section className="py-24 md:py-32 bg-background border-t border-white/5">
          <div className="container mx-auto px-6 md:px-12 mb-16 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
            <RevealText>
              <p className="text-xs uppercase tracking-[0.3em] text-gray-500 font-bold mb-4">Studio Output</p>
              <h2 className="text-4xl md:text-6xl font-bold tracking-tighter text-white font-display">Selected Works</h2>
            </RevealText>
            <Link href="/studio" className="border-b border-white pb-1 text-sm uppercase tracking-[0.2em] font-bold hover:text-gray-300 transition-colors">
              View All
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 px-4 md:px-8 max-w-[2000px] mx-auto">
            {galleryVideos.map((video, idx) => (
              <VideoCard key={video.id} video={video} index={idx} featured={idx === 0 || idx === 3} />
            ))}
          </div>
        </section>
      )}

      {/* ARCHITECTS TEASER */}
      <section className="py-24 md:py-32 bg-zinc-950 border-t border-white/5">
        <div className="container mx-auto px-6 md:px-12">
          <RevealText className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.4em] text-gray-500 font-bold mb-6">Business Architects</p>
            <h2 className="text-4xl md:text-6xl font-bold tracking-tighter text-white mb-8 font-display leading-[1]">
              We don't just<br />create.
              <br />
              <span className="text-gray-500">We help companies<br />scale using it.</span>
            </h2>
            <p className="text-gray-400 text-lg leading-relaxed mb-10">
              We architect the systems that let businesses move faster, look better, and spend smarter.
            </p>
            <Link href="/architects">
              <Button className="bg-white text-black hover:bg-gray-200 rounded-none px-10 py-6 uppercase tracking-[0.2em] text-xs font-bold inline-flex items-center gap-3">
                View Case Studies <ArrowRight size={14} />
              </Button>
            </Link>
          </RevealText>
        </div>
      </section>

      {/* STATS */}
      <section className="py-24 bg-black border-y border-white/10 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")',
          }}
        />
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: "Works Created", value: stats?.totalVideos ?? "—" },
              { label: "Featured Projects", value: stats?.featuredCount ?? "—" },
              { label: "Creative Categories", value: stats?.totalCategories ?? "—" },
              { label: "Status", value: "Live" },
            ].map((stat, i) => (
              <RevealText key={i} delay={i * 0.1} className="border-l border-white/10 pl-6">
                <p className="text-4xl md:text-6xl font-bold text-white mb-3 font-display tracking-tighter">{stat.value}</p>
                <p className="text-xs text-gray-600 uppercase tracking-[0.2em] font-bold">{stat.label}</p>
              </RevealText>
            ))}
          </div>
        </div>
      </section>

      {/* CATALYST CTA — hidden from public; set showCatalyst to true to re-enable */}
      {false && <section className="py-24 md:py-36 bg-black border-t border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-950/10 via-transparent to-transparent" />
        </div>
        <div className="container mx-auto px-6 md:px-12 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <RevealText>
              <p className="text-[10px] uppercase tracking-[0.6em] text-orange-600/70 font-bold mb-6">Core Team · 50 Seats Only</p>
              <h2 className="text-5xl md:text-7xl font-bold tracking-tighter text-white leading-[0.88] font-display mb-8">
                BUILD<br />
                <span className="text-transparent" style={{ WebkitTextStroke: "1px rgba(255,255,255,0.3)" }}>WITH US.</span>
              </h2>
              <p className="text-gray-400 text-lg leading-relaxed max-w-md mb-10">
                We're assembling a 50-person core team — creatives and business minds who want to be on the inside of what AI makes possible. Not employees. Partners.
              </p>
              <Link href="/catalyst">
                <Button className="bg-white text-black hover:bg-orange-50 rounded-none px-10 py-6 uppercase tracking-[0.2em] text-xs font-bold inline-flex items-center gap-3 group">
                  See the Catalyst Program <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              </Link>
            </RevealText>

            <RevealText delay={0.15}>
              <div className="grid grid-cols-2 gap-px bg-white/5">
                {[
                  { num: "50", label: "Total Seats" },
                  { num: "2", label: "Disciplines" },
                  { num: "AI", label: "First Execution" },
                  { num: "∞", label: "Output Potential" },
                ].map((stat, i) => (
                  <div key={i} className="bg-black p-8 flex flex-col justify-between min-h-[130px]">
                    <p className="text-4xl md:text-5xl font-bold text-white font-display tracking-tighter">{stat.num}</p>
                    <p className="text-xs text-gray-600 uppercase tracking-[0.25em] font-bold">{stat.label}</p>
                  </div>
                ))}
              </div>
            </RevealText>
          </div>
        </div>
      </section>}

      {/* NOT FOR EVERYONE */}
      <section className="py-32 md:py-48 bg-zinc-950 border-t border-white/5 relative overflow-hidden">
        <div className="container mx-auto px-6 md:px-12 relative z-10">
          <RevealText>
            <p className="text-[10px] uppercase tracking-[0.6em] text-gray-600 font-bold mb-8">Not For Everyone</p>
            <h2 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter text-white font-display leading-[0.88] mb-16">
              DON'T<br />
              <span className="text-transparent" style={{ WebkitTextStroke: "1px rgba(255,255,255,0.25)" }}>HIRE US.</span>
            </h2>
          </RevealText>

          <div className="flex flex-col divide-y divide-white/5 border-t border-white/5">
            {[
              "You treat creative as a cost, not an investment",
              "You just need someone to execute your brief",
              "Your assumptions aren't up for discussion",
              "You see process as overhead, not an advantage",
              "You track activity, not business impact",
            ].map((line, i) => (
              <RevealText key={i} delay={i * 0.08}>
                <div className="flex items-center gap-5 py-5">
                  <span className="text-white/15 text-xs font-bold tracking-widest shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="text-gray-500 text-base md:text-lg leading-snug line-through decoration-white/10">
                    {line}
                  </p>
                </div>
              </RevealText>
            ))}
          </div>
        </div>
      </section>

      {/* BRIDGE */}
      <section className="py-24 md:py-32 bg-zinc-950 border-t border-white/5">
        <RevealText className="container mx-auto px-6 md:px-12">
          <p className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter text-white font-display leading-[0.9]">
            Still here?<br />
            <span className="text-transparent" style={{ WebkitTextStroke: "1px rgba(255,255,255,0.25)" }}>
              That means something.
            </span>
          </p>
        </RevealText>
      </section>

      {/* JAM WITH US */}
      <JamSection />

      <Footer />
    </div>
  );
}
