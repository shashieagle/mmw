import { useEffect, useRef } from "react";
import { Link } from "wouter";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useListVideos, useGetVideoStats } from "@workspace/api-client-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { VideoCard } from "@/components/VideoCard";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

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


export default function Home() {
  const HOME_VIDEO_TITLES = [
    "Dubai in 30 seconds",
    "Neeve - Dance musical video",
    "Pizza 4P’s — Visual Film",
    "Trelleborg Sealing Solutions — Corporate Film",
  ];
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.4], ["0%", "25%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.35], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 1.06]);

  const { data: recentVideos } = useListVideos();
  const { data: stats } = useGetVideoStats();
  const { data: caseStudies = [] } = useQuery<{ id: number; tag: string; client: string; headline: string; result: string; stats: { value: string; label: string }[] }[]>({
    queryKey: ["case-studies-home"],
    queryFn: async () => { const r = await fetch("/api/case-studies"); if (!r.ok) throw new Error(); return r.json(); },
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const galleryVideos = HOME_VIDEO_TITLES
    .map((title) => recentVideos?.find((video) => video.title === title))
    .filter((video): video is NonNullable<typeof video> => Boolean(video));

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-x-hidden">
      <Navbar />
      {/* HERO — full screen cinematic */}
      <section className="relative min-h-screen w-full overflow-hidden bg-black flex items-end pt-28 pb-20 md:pt-36 md:pb-32">
        <motion.div className="absolute inset-0 z-0" style={{ y: heroY, scale: heroScale }}>
          <div className="w-full h-full bg-gradient-to-br from-zinc-900 via-black to-zinc-950" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/20" />
        </motion.div>

        {/* Text — left side */}
        <motion.div
          className="relative z-20 container mx-auto px-6 md:px-12 max-w-2xl"
          style={{ opacity: heroOpacity }}
        >
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-xs uppercase tracking-[0.6em] text-gray-500 font-bold mb-6"
          >Business Architecture · Narrative Design ·</motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter text-white leading-none font-display mb-6"
          >
            We help you<br />
            <span className="text-gray-500">scale</span><br />
            faster.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.0 }}
            className="text-gray-400 text-lg font-light max-w-md leading-relaxed mb-8"
          >Business Strategy & Visual Communication  — we build what works.</motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.3 }}
            className="flex flex-col sm:flex-row gap-4"
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
      <Ticker text="Business Architecture — Narrative Design — Powered by AI — We build what's next" />
      {/* WHO WE ARE */}
      <section className="py-32 md:py-48 bg-black border-t border-white/5">
        <div className="container mx-auto px-6 md:px-12">
          <RevealText className="max-w-5xl">
            <p className="text-xs uppercase tracking-[0.5em] font-bold mb-8" style={{ color: "#E8572A" }}>About</p>
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter text-white leading-[1.05] mb-10">
              We build the strategy,<br />the systems,<br />
              <span className="text-gray-500">and Communication.</span>
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
              <p className="text-xs uppercase tracking-[0.3em] font-bold mb-4" style={{ color: "#E8572A" }}>Studio Output</p>
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
      {/* FEATURED CASE STUDY */}
      {caseStudies.length > 0 && (() => {
        const s = caseStudies[0];
        return (
          <section className="py-24 md:py-32 bg-zinc-950 border-t border-white/5">
            <div className="container mx-auto px-6 md:px-12 mb-16 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
              <RevealText>
                <p className="text-xs uppercase tracking-[0.3em] font-bold mb-4" style={{ color: "#E8572A" }}>Business Architects</p>
                <h2 className="text-4xl md:text-6xl font-bold tracking-tighter text-white font-display">Featured Case Study</h2>
              </RevealText>
              <Link href="/architects" className="border-b border-white pb-1 text-sm uppercase tracking-[0.2em] font-bold hover:text-gray-300 transition-colors">
                View All
              </Link>
            </div>
            <div className="container mx-auto px-6 md:px-12">
              <RevealText>
                <Link href="/architects#case-studies">
                  <div className="group relative border border-white/10 bg-gradient-to-br from-zinc-900/40 via-zinc-950 to-black hover:border-white/20 transition-all duration-500 cursor-pointer">
                    <div className="p-8 md:p-12">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-10">
                        <div className="flex-1">
                          <span className="inline-block text-[10px] uppercase tracking-[0.4em] font-bold text-gray-500 border border-white/10 px-3 py-1 mb-4">{s.tag}</span>
                          <p className="text-gray-500 text-sm mb-2">{s.client}</p>
                          <h3 className="text-2xl md:text-4xl font-bold tracking-tighter text-white leading-tight">{s.headline}</h3>
                        </div>
                        {s.stats.length > 0 && (
                          <div className="flex gap-8 shrink-0">
                            {s.stats.slice(0, 3).map((st, si) => (
                              <div key={si} className="text-center">
                                <p className="text-2xl md:text-3xl font-bold text-white font-mono">{st.value}</p>
                                <p className="text-[10px] uppercase tracking-widest text-gray-600 mt-1 max-w-[80px]">{st.label}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="border-l-2 border-white/15 pl-6">
                        <p className="text-white text-sm font-mono leading-relaxed">{s.result}</p>
                      </div>
                      <div className="mt-8 flex items-center gap-3 text-white text-xs uppercase tracking-widest font-bold group-hover:gap-5 transition-all duration-300">
                        View Case Study <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform duration-300" />
                      </div>
                    </div>
                  </div>
                </Link>
              </RevealText>
            </div>
          </section>
        );
      })()}
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
          <p className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter text-white font-display leading-[0.9] mb-16">
            If none of that stopped you —<br />
            <span className="text-transparent" style={{ WebkitTextStroke: "1px rgba(255,255,255,0.25)" }}>
              you're exactly who we build for.
            </span>
          </p>
          <div className="mt-2">
            <Link href="/contact">
              <Button className="bg-white text-black hover:bg-gray-200 rounded-none px-10 py-6 uppercase tracking-[0.2em] text-xs font-bold">
                Start the Conversation →
              </Button>
            </Link>
          </div>
        </RevealText>
      </section>
      <Footer />
    </div>
  );
}
