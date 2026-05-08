import { useEffect } from "react";
import { Link } from "wouter";
import { motion, useScroll, useTransform } from "framer-motion";
import { useListVideos, useGetVideoStats } from "@workspace/api-client-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { VideoCard } from "@/components/VideoCard";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const studioCategories = [
  { label: "AI Film", icon: "◈", desc: "Cinematic shorts, showreels, and visual stories crafted frame-by-frame with generative AI." },
  { label: "Real Estate", icon: "◉", desc: "Before & after interior staging. Empty rooms transformed into aspirational living spaces — instantly." },
  { label: "Restaurant & Menus", icon: "◎", desc: "Food photography and menu design reimagined. Consistent, delicious-looking imagery without a single shoot." },
  { label: "Fashion & Catalogues", icon: "◇", desc: "AI model generation, garment rendering, look-books. Full catalogues without models, studios, or logistics." },
];

export default function Home() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const { data: featuredVideos } = useListVideos({ featured: true });
  const { data: recentVideos } = useListVideos();
  const { data: stats } = useGetVideoStats();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const heroVideo = featuredVideos?.[0] || recentVideos?.[0];
  const galleryVideos = (featuredVideos || [])
    .slice(1)
    .concat((recentVideos || []).filter((v) => v.id !== heroVideo?.id))
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      {/* 1. Hero */}
      <section className="relative h-screen w-full overflow-hidden bg-black flex items-center justify-center">
        <motion.div className="absolute inset-0 z-0" style={{ y, opacity }}>
          {heroVideo ? (
            <img
              src={
                heroVideo.thumbnailPath?.startsWith("/objects/")
                  ? `/api/storage${heroVideo.thumbnailPath}`
                  : heroVideo.thumbnailPath || "/images/hero-bg.png"
              }
              alt="Hero background"
              className="w-full h-full object-cover opacity-40"
            />
          ) : (
            <img src="/images/hero-bg.png" alt="Hero background" className="w-full h-full object-cover opacity-40" />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/60 to-background" />
        </motion.div>

        <div className="relative z-10 container mx-auto px-6 md:px-12 text-center flex flex-col items-center mt-16 md:mt-0">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.2, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="mb-8"
          >
            <h2 className="text-xs md:text-sm text-gray-400 uppercase tracking-[0.5em] mb-6 font-bold">
              AI Creative & Business Intelligence
            </h2>
            <h1 className="text-6xl md:text-8xl lg:text-[10rem] font-bold tracking-tighter text-white leading-[0.85] font-display">
              MONK
              <br />
              MONKEY
              <br />
              WORKS.
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="flex flex-col items-center gap-6"
          >
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto font-light leading-relaxed">
              We create with AI. We build with AI. We architect businesses around AI.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <Link href="/studio">
                <Button
                  size="lg"
                  className="bg-white text-black hover:bg-gray-200 rounded-none px-10 py-7 uppercase tracking-[0.2em] text-xs font-bold"
                >
                  Explore Studio
                </Button>
              </Link>
              <Link href="/architects">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 rounded-none px-10 py-7 uppercase tracking-[0.2em] text-xs font-bold bg-transparent"
                >
                  AI Architects
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>

        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
        >
          <span className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold">Scroll</span>
          <div className="w-[1px] h-16 bg-gradient-to-b from-gray-400 to-transparent" />
        </motion.div>
      </section>

      {/* 2. Two Arms Introduction */}
      <section className="py-0 relative z-20 bg-background border-t border-white/5">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Studio Arm */}
          <Link href="/studio">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="group relative overflow-hidden border-b md:border-b-0 md:border-r border-white/10 p-12 md:p-16 lg:p-24 flex flex-col justify-between min-h-[420px] hover:bg-white/[0.02] transition-colors duration-500 cursor-pointer"
            >
              <div>
                <p className="text-[10px] uppercase tracking-[0.5em] text-gray-600 font-bold mb-6">
                  Creative Division
                </p>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter text-white mb-6 font-display leading-[0.9]">
                  The
                  <br />
                  Studio
                </h2>
                <p className="text-gray-500 text-base leading-relaxed max-w-sm">
                  AI-generated films, real estate transformations, food photography, fashion catalogues.
                  Whatever the brief — we make it with intelligence.
                </p>
              </div>
              <div className="mt-10 flex items-center gap-3 text-white text-sm uppercase tracking-widest font-bold group-hover:gap-5 transition-all duration-300">
                View Work <ArrowRight size={16} />
              </div>
              <div className="absolute inset-0 border border-white/0 group-hover:border-white/10 transition-all duration-500 pointer-events-none" />
            </motion.div>
          </Link>

          {/* Architects Arm */}
          <Link href="/architects">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="group relative overflow-hidden p-12 md:p-16 lg:p-24 flex flex-col justify-between min-h-[420px] bg-zinc-950 hover:bg-zinc-900 transition-colors duration-500 cursor-pointer"
            >
              <div>
                <p className="text-[10px] uppercase tracking-[0.5em] text-gray-600 font-bold mb-6">
                  Business Division
                </p>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter text-white mb-6 font-display leading-[0.9]">
                  AI
                  <br />
                  Architects
                </h2>
                <p className="text-gray-500 text-base leading-relaxed max-w-sm">
                  Strategy, implementation, and automation consulting for businesses ready to build
                  their competitive advantage on AI infrastructure.
                </p>
              </div>
              <div className="mt-10 flex items-center gap-3 text-white text-sm uppercase tracking-widest font-bold group-hover:gap-5 transition-all duration-300">
                See Case Studies <ArrowRight size={16} />
              </div>
            </motion.div>
          </Link>
        </div>
      </section>

      {/* 3. What We Do — Studio capabilities */}
      <section className="py-24 md:py-32 bg-black border-t border-white/5">
        <div className="container mx-auto px-6 md:px-12">
          <div className="mb-16 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-gray-500 font-bold mb-4">Studio Capabilities</p>
              <h2 className="text-4xl md:text-6xl font-bold tracking-tighter text-white font-display">
                We Create<br />Everything.
              </h2>
            </div>
            <Link href="/studio" className="border-b border-white pb-1 text-sm uppercase tracking-[0.2em] font-bold hover:text-gray-300 hover:border-gray-300 transition-colors">
              View All Work
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/5">
            {studioCategories.map((cat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-black p-8 md:p-10 hover:bg-zinc-950 transition-colors duration-300 group"
              >
                <span className="text-3xl text-white/20 group-hover:text-white/40 transition-colors duration-300 mb-6 block">
                  {cat.icon}
                </span>
                <h3 className="text-base font-bold text-white mb-3 uppercase tracking-widest">{cat.label}</h3>
                <p className="text-gray-600 text-sm leading-relaxed group-hover:text-gray-500 transition-colors">
                  {cat.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Featured Work preview */}
      {galleryVideos.length > 0 && (
        <section className="py-24 md:py-32 bg-background border-t border-white/5">
          <div className="container mx-auto px-6 md:px-12 mb-16 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-gray-500 font-bold mb-4">Selected Works</p>
              <h2 className="text-4xl md:text-6xl font-bold tracking-tighter text-white font-display">
                Recent Output
              </h2>
            </div>
            <Link
              href="/studio"
              className="hidden md:inline-block border-b border-white pb-2 text-sm uppercase tracking-[0.2em] font-bold hover:text-gray-300 transition-colors"
            >
              View All
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 px-4 md:px-8 max-w-[2000px] mx-auto">
            {galleryVideos.map((video, idx) => (
              <VideoCard key={video.id} video={video} index={idx} featured={idx === 0 || idx === 3} />
            ))}
          </div>

          <div className="mt-16 text-center md:hidden">
            <Link
              href="/studio"
              className="inline-block border-b border-white pb-2 text-xs uppercase tracking-[0.2em] font-bold"
            >
              View All Work
            </Link>
          </div>
        </section>
      )}

      {/* 5. Architects teaser */}
      <section className="py-24 md:py-32 bg-zinc-950 border-t border-white/5">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <p className="text-xs uppercase tracking-[0.4em] text-gray-500 font-bold mb-4">AI Architects</p>
              <h2 className="text-4xl md:text-6xl font-bold tracking-tighter text-white mb-8 font-display leading-[1]">
                We don't just<br />make things.<br />
                <span className="text-gray-500">We transform<br />businesses.</span>
              </h2>
              <p className="text-gray-400 text-lg leading-relaxed mb-10">
                From replacing costly photoshoots with AI pipelines to building fully automated
                content operations — we've done it. Real estate, restaurants, fashion, and more.
              </p>
              <Link href="/architects">
                <Button
                  size="lg"
                  className="bg-white text-black hover:bg-gray-200 rounded-none px-10 py-6 uppercase tracking-[0.2em] text-xs font-bold inline-flex items-center gap-3"
                >
                  View Case Studies <ArrowRight size={14} />
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="grid grid-cols-1 gap-4"
            >
              {[
                { tag: "Real Estate", headline: "80% reduction in staging costs", sub: "Premium Property Group" },
                { tag: "F&B", headline: "Zero food stylists. All locations covered.", sub: "Multi-Chain Restaurant Group" },
                { tag: "Fashion", headline: "200 SKUs. Zero models. 34% conversion lift.", sub: "D2C Clothing Brand" },
              ].map((item, i) => (
                <div
                  key={i}
                  className="border border-white/10 p-6 hover:border-white/30 transition-colors group"
                >
                  <span className="text-[10px] text-gray-600 uppercase tracking-widest font-bold">{item.tag}</span>
                  <p className="text-white font-bold mt-2 mb-1 group-hover:text-gray-200 transition-colors">
                    {item.headline}
                  </p>
                  <p className="text-gray-600 text-xs">{item.sub}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* 6. Stats */}
      <section className="py-24 md:py-32 bg-black border-y border-white/10 relative z-20 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")',
          }}
        />
        <div className="container mx-auto px-6 md:px-12 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {[
              { label: "Works Created", value: stats?.totalVideos || 0 },
              { label: "Featured Projects", value: stats?.featuredCount || 0 },
              { label: "Creative Categories", value: stats?.totalCategories || 0 },
              { label: "System Status", value: "Active" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="text-center md:text-left border-l border-white/10 pl-6"
              >
                <p className="text-4xl md:text-6xl font-bold text-white mb-3 font-display tracking-tighter">
                  {stat.value}
                </p>
                <p className="text-xs text-gray-500 uppercase tracking-[0.2em] font-bold">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. CTA */}
      <section className="py-32 md:py-48 bg-background relative z-20">
        <div className="container mx-auto px-6 md:px-12 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl md:text-8xl font-bold tracking-tighter text-white mb-10 font-display">
              BUILD WITH US.
            </h2>
            <p className="text-gray-500 text-lg mb-10 max-w-xl mx-auto">
              Whether you need a film, a catalogue, or an AI strategy that changes how your business
              operates — we're the call to make.
            </p>
            <a href="mailto:hello@monkmonkeyworks.com">
              <Button
                size="lg"
                className="bg-white text-black hover:bg-gray-200 rounded-none px-12 py-8 uppercase tracking-[0.2em] text-sm font-bold transition-transform hover:scale-105"
              >
                Get in Touch
              </Button>
            </a>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
