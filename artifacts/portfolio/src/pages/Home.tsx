import { useEffect } from "react";
import { Link } from "wouter";
import { motion, useScroll, useTransform } from "framer-motion";
import { useListVideos, useGetVideoStats } from "@workspace/api-client-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { VideoCard } from "@/components/VideoCard";
import { Button } from "@/components/ui/button";

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
  const galleryVideos = (featuredVideos || []).slice(1).concat((recentVideos || []).filter(v => v.id !== heroVideo?.id)).slice(0, 4);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      {/* 1. Hero Section */}
      <section className="relative h-screen w-full overflow-hidden bg-black flex items-center justify-center">
        <motion.div 
          className="absolute inset-0 z-0"
          style={{ y, opacity }}
        >
          {heroVideo ? (
            <img 
              src={heroVideo.thumbnailPath?.startsWith("/objects/") ? `/api/storage${heroVideo.thumbnailPath}` : (heroVideo.thumbnailPath || "/images/hero-bg.png")}
              alt="Hero background" 
              className="w-full h-full object-cover opacity-50"
            />
          ) : (
            <img 
              src="/images/hero-bg.png" 
              alt="Hero background" 
              className="w-full h-full object-cover opacity-50"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/50 to-background" />
        </motion.div>

        <div className="relative z-10 container mx-auto px-6 md:px-12 text-center flex flex-col items-center mt-16 md:mt-0">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.2, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="mb-8"
          >
            <h2 className="text-xs md:text-sm text-gray-400 uppercase tracking-[0.4em] mb-6 font-bold">
              AI Film Production House
            </h2>
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter text-white leading-[0.85] font-display">
              CINEMA<br/>COMPUTED.
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
          >
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto font-light leading-relaxed mb-10">
              We craft immersive, emotionally resonant films at the intersection of human intent and generative artificial intelligence.
            </p>
            
            {heroVideo ? (
              <Link href={`/film/${heroVideo.id}`}>
                <Button size="lg" className="bg-white text-black hover:bg-gray-200 rounded-none px-10 py-7 uppercase tracking-[0.2em] text-xs font-bold transition-all duration-300 hover:scale-105">
                  Watch Latest Showreel
                </Button>
              </Link>
            ) : (
              <Link href="/films">
                <Button size="lg" className="bg-white text-black hover:bg-gray-200 rounded-none px-10 py-7 uppercase tracking-[0.2em] text-xs font-bold transition-all duration-300 hover:scale-105">
                  Explore Archive
                </Button>
              </Link>
            )}
          </motion.div>
        </div>

        {/* Scroll indicator */}
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

      {/* 2. Manifesto / Statement */}
      <section className="py-32 md:py-48 relative z-20 bg-background border-t border-white/5">
        <div className="container mx-auto px-6 md:px-12">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="max-w-5xl mx-auto text-center"
          >
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter mb-10 text-white leading-[1.1] font-display">
              Every frame intentional.<br />Every pixel generated.
            </h2>
            <p className="text-xl md:text-3xl text-gray-400 font-light leading-relaxed max-w-4xl mx-auto">
              Monkmonkeyworks is redefining the language of cinema. We don't just use AI as a tool; we collaborate with it as a medium. Our works explore the liminal space between synthetic dreams and human emotion.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 3. Featured Work */}
      <section className="py-24 md:py-32 relative z-20 bg-black">
        <div className="container mx-auto px-6 md:px-12 mb-16 md:mb-24 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
          <div className="max-w-2xl">
            <h2 className="text-xs uppercase tracking-[0.3em] text-gray-500 font-bold mb-4">The Archive</h2>
            <h3 className="text-5xl md:text-7xl font-bold tracking-tighter text-white font-display">Selected Works</h3>
          </div>
          <Link href="/films" className="hidden md:inline-block border-b border-white pb-2 text-sm uppercase tracking-[0.2em] font-bold hover:text-gray-300 hover:border-gray-300 transition-colors">
            View All Films
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 px-4 md:px-8 max-w-[2000px] mx-auto">
          {galleryVideos.map((video, idx) => (
            <VideoCard 
              key={video.id} 
              video={video} 
              index={idx} 
              featured={idx === 0 || idx === 3} // Make some full width
            />
          ))}
        </div>
        
        <div className="mt-16 text-center md:hidden">
          <Link href="/films" className="inline-block border-b border-white pb-2 text-xs uppercase tracking-[0.2em] font-bold hover:text-gray-300 hover:border-gray-300 transition-colors">
            View All Films
          </Link>
        </div>
      </section>

      {/* 4. Capabilities / Process */}
      <section className="py-32 bg-zinc-950 relative z-20 border-t border-white/5">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-xs uppercase tracking-[0.3em] text-gray-500 font-bold mb-4">Methodology</h2>
              <h3 className="text-4xl md:text-6xl font-bold tracking-tighter text-white mb-8 font-display">The Synthesis<br/>of Art & Code</h3>
              <p className="text-gray-400 text-lg leading-relaxed mb-8">
                Our pipeline integrates state-of-the-art diffusion models, custom LoRAs, and procedural generation to craft narratives that push the boundaries of visual storytelling. We don't prompt—we direct.
              </p>
              
              <ul className="space-y-6">
                {[
                  "Pre-visualization & Worldbuilding",
                  "Latent Space Cinematography",
                  "Neural Sound Design & Scoring",
                  "Upscaling & Color Grading pipeline"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-4 text-white text-lg">
                    <div className="h-[1px] w-8 bg-white/30" />
                    <span className="font-light tracking-wide">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1 }}
              className="relative aspect-[4/5] w-full"
            >
              <img src="/images/thumb-cyberpunk.png" alt="Process" className="w-full h-full object-cover filter grayscale contrast-125" />
              <div className="absolute inset-0 bg-gradient-to-tr from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-8 left-8 right-8 border border-white/20 bg-black/40 backdrop-blur-md p-6">
                <p className="font-mono text-xs text-white/70 uppercase tracking-widest mb-2">System Status</p>
                <p className="text-white text-sm">Rendering Frame 24,051... Stable Latent Walk.</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 5. Director/Team */}
      <section className="py-32 bg-background relative z-20 border-t border-white/5">
        <div className="container mx-auto px-6 md:px-12 max-w-5xl text-center">
          <motion.div
             initial={{ opacity: 0, y: 40 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ duration: 0.8 }}
          >
            <h2 className="text-xs uppercase tracking-[0.3em] text-gray-500 font-bold mb-4">The Studio</h2>
            <h3 className="text-4xl md:text-5xl font-bold tracking-tighter text-white mb-8 font-display">A collective of filmmakers,<br/>engineers, and researchers.</h3>
            <p className="text-gray-400 text-xl font-light leading-relaxed mx-auto">
              Based in the digital ether, Monkmonkeyworks operates at the bleeding edge of media synthesis. We partner with forward-thinking brands, musicians, and studios to realize impossible visions.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 6. Stats / Impact */}
      <section className="py-24 md:py-32 bg-black border-y border-white/10 relative z-20 overflow-hidden">
        {/* Subtle noise texture */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />
        
        <div className="container mx-auto px-6 md:px-12 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {[
              { label: "Films Produced", value: stats?.totalVideos || 0 },
              { label: "Featured Works", value: stats?.featuredCount || 0 },
              { label: "Categories", value: stats?.totalCategories || 0 },
              { label: "System Status", value: "Active" }
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="text-center md:text-left border-l border-white/10 pl-6"
              >
                <p className="text-4xl md:text-6xl font-bold text-white mb-3 font-display tracking-tighter">{stat.value}</p>
                <p className="text-xs text-gray-500 uppercase tracking-[0.2em] font-bold">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. CTA / Contact */}
      <section className="py-32 md:py-48 bg-background relative z-20">
        <div className="container mx-auto px-6 md:px-12 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl md:text-8xl font-bold tracking-tighter text-white mb-10 font-display">
              COMMISSION<br/>THE IMPOSSIBLE.
            </h2>
            <Button size="lg" className="bg-white text-black hover:bg-gray-200 rounded-none px-12 py-8 uppercase tracking-[0.2em] text-sm font-bold transition-transform hover:scale-105">
              Contact Studio
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
