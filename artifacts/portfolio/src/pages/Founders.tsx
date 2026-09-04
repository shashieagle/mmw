import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProjectFormCta, useProjectFormUrl } from "@/components/ProjectFormCta";

function RevealText({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.9, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function Founders() {
  const projectFormUrl = useProjectFormUrl();
  const { scrollYProgress } = useScroll();
  const y1 = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);
  const y2 = useTransform(scrollYProgress, [0, 1], ["0%", "-15%"]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col text-white">
      <Navbar />
      
      <main className="flex-1">
        {/* HERO */}
        <section className="relative min-h-[90vh] flex items-center pt-32 pb-24 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-black to-transparent z-10" />
            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black to-transparent z-10" />
            <div 
              className="absolute inset-0 opacity-[0.03] z-0" 
              style={{
                backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")',
              }}
            />
          </div>
          
          <div className="container mx-auto px-6 md:px-12 relative z-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-7">
                <RevealText>
                  <p className="text-xs uppercase tracking-[0.4em] font-bold mb-8 text-primary" data-testid="text-founders-label">Leadership</p>
                  <h1 className="text-5xl md:text-7xl lg:text-[7.5rem] font-bold tracking-tighter leading-[0.9] mb-10 font-display" data-testid="text-founders-heading">
                    One team.<br/>
                    <span className="text-gray-600">Both sides.</span>
                  </h1>
                  <p className="text-xl md:text-2xl text-gray-400 font-light max-w-xl leading-relaxed mb-12" data-testid="text-founders-subheading">
                    Business Architecture and Narrative Strategy operating as a single intelligence system.
                  </p>
                </RevealText>
              </div>
              <div className="lg:col-span-5 hidden lg:block">
                {/* Decorative element */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1.5, ease: [0.21, 0.47, 0.32, 0.98] }}
                  className="relative w-full aspect-square border border-white/5 rounded-full flex items-center justify-center"
                >
                  <div className="w-[80%] h-[80%] border border-white/10 rounded-full flex items-center justify-center">
                    <div className="w-[60%] h-[60%] border border-primary/20 rounded-full" />
                  </div>
                  <div className="absolute w-[1px] h-full bg-gradient-to-b from-transparent via-primary/30 to-transparent" />
                  <div className="absolute h-[1px] w-full bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* PORTRAITS SECTION */}
        <section className="py-24 md:py-32 bg-zinc-950 border-t border-white/5 relative">
          <div className="container mx-auto px-6 md:px-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-8 lg:gap-24">
              
              {/* Founder One */}
              <div className="flex flex-col">
                <RevealText>
                  <motion.div style={{ y: y1 }} className="relative overflow-hidden mb-10 group aspect-[4/5] bg-zinc-900 border border-white/5">
                    <img 
                      src="/founders/founder-one.png" 
                      alt="Studio Leadership"
                      className="w-full h-full object-cover grayscale opacity-90 transition-all duration-700 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105"
                      data-testid="img-founder-one"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />
                  </motion.div>
                </RevealText>
                
                <RevealText delay={0.1}>
                  <div className="border-l-2 border-primary/50 pl-6">
                    <h3 className="text-3xl md:text-4xl font-display font-bold tracking-tight mb-2" data-testid="text-founder-one-name">
                      Shashikanth
                    </h3>
                    <p className="text-xs uppercase tracking-[0.25em] font-bold text-primary mb-5" data-testid="text-founder-one-role">
                      Co-founder &amp; Creative Director
                    </p>
                    <p className="text-gray-400 leading-relaxed text-lg" data-testid="text-founder-one-desc">
                      Shashikanth leads creative direction across conceptualisation, storytelling, films, and AI-assisted workflows. He brings ideas into focus, shaping them into purposeful visual narratives while building the operational systems needed to execute consistently. His approach connects creative ambition with structured production—ensuring every project is distinctive, intentional, and built to communicate clearly.
                    </p>
                  </div>
                </RevealText>
              </div>

              {/* Founder Two */}
              <div className="flex flex-col md:mt-32">
                <RevealText delay={0.1}>
                  <motion.div style={{ y: y2 }} className="relative overflow-hidden mb-10 group aspect-[4/5] bg-zinc-900 border border-white/5">
                    <img 
                      src="/founders/founder-two.png" 
                      alt="Studio Leadership"
                      className="w-full h-full object-cover grayscale opacity-90 transition-all duration-700 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105"
                      data-testid="img-founder-two"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />
                  </motion.div>
                </RevealText>

                <RevealText delay={0.2}>
                  <div className="border-l-2 border-white/20 pl-6">
                    <h3 className="text-3xl md:text-4xl font-display font-bold tracking-tight mb-2 text-gray-300" data-testid="text-founder-two-name">
                      Deepika Channaiah
                    </h3>
                    <p className="text-xs uppercase tracking-[0.25em] font-bold text-primary mb-5" data-testid="text-founder-two-role">
                      Founder &amp; Business Architect
                    </p>
                    <p className="text-gray-400 leading-relaxed text-lg" data-testid="text-founder-two-desc">
                      Deepika helps businesses understand where they stand and define where they need to go next. Through detailed audits, analysis, positioning, growth strategy, and systems design, she identifies what is working, what is holding the business back, and what must change—turning complex challenges into clear, practical structures for sustainable growth.
                    </p>
                  </div>
                </RevealText>
              </div>

            </div>
          </div>
        </section>

        {/* PHILOSOPHY / CTA */}
        <section className="py-32 md:py-48 bg-black border-t border-white/5 relative overflow-hidden">
          <div className="container mx-auto px-6 md:px-12 text-center relative z-10">
            <RevealText className="max-w-4xl mx-auto">
              <p className="text-sm uppercase tracking-[0.3em] font-bold text-gray-500 mb-8" data-testid="text-founders-cta-label">The Studio</p>
              <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter leading-tight mb-12 font-display" data-testid="text-founders-cta-heading">
                Creative work or business strategy — we're the call to make when you want things to actually change.
              </h2>
              <div className="flex justify-center" data-testid="container-founders-cta">
                <ProjectFormCta formUrl={projectFormUrl} />
              </div>
            </RevealText>
          </div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        </section>
      </main>

      <Footer />
    </div>
  );
}
