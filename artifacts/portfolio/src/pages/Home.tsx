import { useEffect, useRef } from "react";
import { Link } from "wouter";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useGetVideoStats } from "@workspace/api-client-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BrandLogoShowcase } from "@/components/BrandLogoShowcase";
import { ProjectFormCta, useProjectFormUrl } from "@/components/ProjectFormCta";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

function Ticker({ text }: { text: string }) {
  const repeated = Array(12).fill(text).join(" · ");
  return (
    <div className="overflow-hidden border-y border-white/5 py-4 bg-black select-none">
      <div className="flex whitespace-nowrap animate-ticker">
        <span className="text-[10px] uppercase tracking-[0.4em] text-gray-700 font-bold pr-8" data-testid="text-ticker">{repeated}</span>
        <span className="text-[10px] uppercase tracking-[0.4em] text-gray-700 font-bold pr-8">{repeated}</span>
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
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.9, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function Home() {
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.5], ["0%", "20%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);

  const { data: stats } = useGetVideoStats();
  const { data: caseStudies = [] } = useQuery<{ id: number; tag: string; client: string; headline: string; result: string; stats: { value: string; label: string }[] }[]>({
    queryKey: ["case-studies-home"],
    queryFn: async () => { const r = await fetch("/api/case-studies"); if (!r.ok) throw new Error(); return r.json(); },
  });
  const projectFormUrl = useProjectFormUrl();

  useEffect(() => {
    const sectionId = window.location.hash.slice(1);
    if (sectionId) {
      requestAnimationFrame(() => {
        document.getElementById(sectionId)?.scrollIntoView();
      });
    } else {
      window.scrollTo(0, 0);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-x-hidden">
      <Navbar />
      
      {/* HERO */}
      <section className="relative min-h-screen w-full overflow-hidden bg-black flex items-center pt-20">
        <motion.div className="absolute inset-0 z-0 pointer-events-none" style={{ y: heroY, opacity: heroOpacity }}>
          <div className="w-full h-full bg-gradient-to-br from-zinc-950 via-black to-zinc-950" />
          <div 
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")',
            }}
          />
        </motion.div>

        <div className="relative z-20 container mx-auto px-6 md:px-12">
          <div className="max-w-4xl">
            <motion.p
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}
              className="text-[10px] uppercase tracking-[0.5em] text-primary font-bold mb-8"
              data-testid="text-hero-label"
            >
              Creative Intelligence Studio
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, delay: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="text-6xl md:text-8xl lg:text-[7.5rem] font-bold tracking-tighter text-white leading-[0.85] font-display mb-8"
              data-testid="text-hero-heading"
            >
              We build<br />
              <span className="text-gray-600">what works.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.9 }}
              className="text-gray-400 text-lg md:text-xl font-light max-w-2xl leading-relaxed mb-12"
              data-testid="text-hero-subheading"
            >
              Business Architecture and Narrative Strategy operating as a single system. We help ambitious brands scale faster and look impossible to ignore.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 1.1 }}
              className="flex flex-col sm:flex-row items-center gap-6"
              data-testid="container-hero-ctas"
            >
              <Link href="/architects" data-testid="link-hero-architects">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-none px-12 py-7 uppercase tracking-[0.2em] text-xs font-bold w-full sm:w-auto transition-transform hover:scale-[1.02]">
                  Explore Architecture
                </Button>
              </Link>
              <Link href="/studio" data-testid="link-hero-studio" className="text-xs uppercase tracking-[0.2em] text-white hover:text-primary transition-colors font-bold border-b border-white/20 hover:border-primary pb-1">
                View Studio Work
              </Link>
            </motion.div>
          </div>
        </div>

        <motion.div
          className="absolute bottom-12 left-6 md:left-12 z-20 hidden md:block"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}
        >
          <div className="w-[1px] h-24 bg-gradient-to-b from-transparent via-gray-600 to-transparent animate-pulse" />
        </motion.div>
      </section>

      <Ticker text="Business Architecture — Narrative Design — Built for Scale — Emotional Communication" />

      {/* ABOUT */}
      <section className="py-32 md:py-48 bg-zinc-950 border-t border-white/5 relative">
        <div className="container mx-auto px-6 md:px-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            <div className="lg:col-span-5">
              <RevealText>
                <p className="text-xs uppercase tracking-[0.4em] font-bold text-primary mb-6" data-testid="text-about-label">The Studio</p>
                <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-white font-display leading-[0.95]" data-testid="text-about-heading">
                  One team.<br/>Both sides of the intelligence revolution.
                </h2>
              </RevealText>
            </div>
            <div className="lg:col-span-7">
              <RevealText delay={0.2} className="border-l border-white/10 pl-8 lg:pl-12">
                <p className="text-gray-400 text-lg md:text-xl font-light leading-relaxed mb-8" data-testid="text-about-desc">
                  Creative businesses often fail because great work isn't backed by solid systems. Commercial businesses stall because great systems lack a compelling narrative. We solve both. We build the strategy that makes you profitable, and the visual communication that makes you unforgettable.
                </p>
                <Link href="/founders" data-testid="link-about-founders" className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-white hover:text-primary transition-colors border-b border-white/20 hover:border-primary pb-1 group">
                  Meet the Leadership <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </RevealText>
            </div>
          </div>
        </div>
      </section>

      <BrandLogoShowcase />

      {/* FEATURED CASE STUDY */}
      {caseStudies.length > 0 && (() => {
        const s = caseStudies[0];
        return (
          <section className="py-24 md:py-40 bg-black border-t border-white/5" data-testid={`section-featured-case-${s.id}`}>
            <div className="container mx-auto px-6 md:px-12 mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
              <RevealText>
                <p className="text-xs uppercase tracking-[0.4em] font-bold text-primary mb-4">Proof of Work</p>
                <h2 className="text-4xl md:text-6xl font-bold tracking-tighter text-white font-display">Featured Case Study</h2>
              </RevealText>
              <Link href="/architects#case-studies" className="border-b border-white/30 hover:border-white pb-1 text-xs uppercase tracking-[0.2em] font-bold text-gray-400 hover:text-white transition-colors" data-testid="link-all-cases">
                View All Impact
              </Link>
            </div>
            
            <div className="container mx-auto px-6 md:px-12">
              <RevealText delay={0.1}>
                <Link href="/architects#case-studies">
                  <div className="group relative bg-zinc-950 border border-white/5 hover:border-primary/50 transition-colors duration-500 overflow-hidden cursor-pointer">
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary transform origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-500 ease-out" />
                    <div className="p-8 md:p-16">
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-12 mb-12">
                        <div className="flex-1">
                          <span className="inline-block text-[10px] uppercase tracking-[0.4em] font-bold text-primary border border-primary/20 bg-primary/5 px-3 py-1 mb-6">{s.tag}</span>
                          <p className="text-gray-500 text-sm uppercase tracking-widest font-bold mb-4">{s.client}</p>
                          <h3 className="text-3xl md:text-5xl font-bold tracking-tighter text-white leading-[0.95]">{s.headline}</h3>
                        </div>
                        {s.stats.length > 0 && (
                          <div className="flex gap-8 md:gap-12 shrink-0">
                            {s.stats.slice(0, 3).map((st, si) => (
                              <div key={si} className="text-left">
                                <p className="text-3xl md:text-5xl font-bold text-white font-mono mb-2">{st.value}</p>
                                <p className="text-[10px] uppercase tracking-widest text-gray-500 max-w-[100px] leading-tight">{st.label}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="border-l-2 border-white/10 pl-8 max-w-3xl">
                        <p className="text-gray-300 text-base md:text-lg font-mono leading-relaxed">{s.result}</p>
                      </div>
                      <div className="mt-12 flex items-center gap-3 text-white text-xs uppercase tracking-widest font-bold group-hover:text-primary transition-colors duration-300">
                        Read the Full Story <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform duration-300" />
                      </div>
                    </div>
                  </div>
                </Link>
              </RevealText>
            </div>
          </section>
        );
      })()}

      {/* STUDIO TEASER */}
      <section className="py-32 md:py-48 bg-zinc-950 border-t border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black to-zinc-950 pointer-events-none" />
        <div className="container mx-auto px-6 md:px-12 relative z-10">
          <RevealText className="max-w-4xl mx-auto text-center">
            <p className="text-xs uppercase tracking-[0.4em] font-bold text-primary mb-6" data-testid="text-studio-cta-label">Creative Division</p>
            <h2 className="text-5xl md:text-7xl font-bold tracking-tighter text-white font-display leading-[0.9] mb-8" data-testid="text-studio-cta-heading">
              Ideas, made<br />
              <span className="text-gray-600">visible.</span>
            </h2>
            <p className="text-gray-400 text-lg md:text-xl font-light leading-relaxed max-w-2xl mx-auto mb-12">
              Films, imagery, and visual worlds built to make your story impossible to ignore. Real-world production and AI-assisted creation working in sync.
            </p>
            <Link href="/studio">
              <Button
                variant="outline"
                className="border-white/20 text-white hover:bg-white hover:text-black rounded-none px-12 py-7 uppercase tracking-[0.2em] text-xs font-bold transition-colors"
                data-testid="button-explore-studio"
              >
                Explore The Studio
              </Button>
            </Link>
          </RevealText>
        </div>
      </section>

      {/* STATS */}
      <section className="py-24 bg-black border-y border-white/5 relative">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-8">
            {[
              { label: "Works Created", value: stats?.totalVideos ?? "—" },
              { label: "Featured Projects", value: stats?.featuredCount ?? "—" },
              { label: "Creative Categories", value: stats?.totalCategories ?? "—" },
              { label: "Studio Status", value: "Live" },
            ].map((stat, i) => (
              <RevealText key={i} delay={i * 0.1} className="border-l border-white/10 pl-6">
                <p className="text-4xl md:text-5xl font-bold text-white mb-3 font-mono tracking-tight">{stat.value}</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold">{stat.label}</p>
              </RevealText>
            ))}
          </div>
        </div>
      </section>

      {/* BRIDGE */}
      <section className="py-32 md:py-48 bg-zinc-950">
        <RevealText className="container mx-auto px-6 md:px-12 text-center">
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter text-white font-display leading-[0.9] mb-12" data-testid="text-bridge-heading">
            Have a project in mind?<br />
            <span className="text-gray-600">
              Let's bring it to life.
            </span>
          </h2>
          <div className="flex justify-center" data-testid="container-bridge-cta">
            <ProjectFormCta formUrl={projectFormUrl} />
          </div>
        </RevealText>
      </section>
      
      <Footer />
    </div>
  );
}
