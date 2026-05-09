import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ArrowRight, Brain, BarChart3, Layers, Zap, Users, Globe, Upload, Trash2, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ObjectUploader } from "@workspace/object-storage-web";
import { useRequestUploadUrl } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { useAdminMode } from "@/hooks/use-admin-mode";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const services = [
  {
    icon: Brain,
    title: "AI Strategy & Roadmapping",
    description:
      "We audit your existing workflows and define a pragmatic AI adoption roadmap — from quick wins to long-term transformation. No buzzwords, just a clear path.",
  },
  {
    icon: Layers,
    title: "Custom AI Integration",
    description:
      "We build and embed AI tools directly into your business operations — whether that's automating customer service, generating marketing content, or processing data at scale.",
  },
  {
    icon: BarChart3,
    title: "Visual Content Automation",
    description:
      "Product shots, lifestyle imagery, menu cards, catalogue renders — we replace costly traditional shoots with AI pipelines that move at business speed.",
  },
  {
    icon: Zap,
    title: "Rapid Prototyping",
    description:
      "We move fast. From concept to working prototype in days, not months. Test ideas, validate with your audience, and iterate without burning budget.",
  },
  {
    icon: Users,
    title: "Team Training & Workshops",
    description:
      "We upskill your internal teams on AI tools relevant to their roles — designers, marketers, operators. Practical, hands-on, zero fluff.",
  },
  {
    icon: Globe,
    title: "Brand & Campaign Generation",
    description:
      "Full campaign assets generated at scale — social content, ad creatives, video spots, look-books. Consistent brand voice, zero production bottlenecks.",
  },
];

const caseStudies = [
  {
    slug: "genesis",
    tag: "Photography & Packaging",
    client: "Genesis Photo Albums",
    headline: "Premium Product Shoots with AI Styling",
    result: "Delivered a full product catalogue with luxury-grade imagery — without a studio setup or traditional photoshoot.",
    detail:
      "Genesis came to us needing product photography that matched the premium positioning of their handcrafted photo albums. We built an AI styling pipeline that took their physical products and placed them into curated environments — warm natural light, premium surfaces, lifestyle context. Every image was styled to communicate quality: the weight of the covers, the texture of the pages. The result was a full catalogue of aspirational imagery that repositioned Genesis as a luxury product — without a single studio booking.",
    gradient: "from-amber-950/40 via-zinc-950 to-black",
    stats: [
      { value: "100%", label: "Studio-free production" },
      { value: "3×", label: "Faster turnaround" },
      { value: "Full", label: "Catalogue delivered" },
    ],
  },
  {
    slug: "premium-property",
    tag: "Real Estate",
    client: "Premium Property Group",
    headline: "Before & After: AI Interior Staging at Scale",
    result: "Reduced staging costs by 80%. Cut time-to-listing from 2 weeks to 48 hours.",
    detail:
      "We replaced physical staging with an AI pipeline that takes raw empty-room photos and generates photorealistic furnished interiors in multiple styles — modern, Scandinavian, luxury. The client listed 3× more properties per month with no additional team. Every listing went live with aspirational imagery, regardless of the property's actual condition at the time of photography.",
    gradient: "from-stone-900/40 via-zinc-950 to-black",
    stats: [
      { value: "80%", label: "Cost reduction" },
      { value: "48h", label: "Time-to-listing" },
      { value: "3×", label: "More listings/month" },
    ],
  },
  {
    slug: "restaurant-group",
    tag: "Food & Beverage",
    client: "Multi-Chain Restaurant Group",
    headline: "Menu Magic: AI-Generated Food Photography",
    result: "90% cost reduction on food photography. 6-week rollout across 12 locations.",
    detail:
      "Shot one set of hero dishes, then generated style variants, seasonal specials, and localized menu imagery for every branch using AI. No reshoots. No food stylists flying across cities. Just consistent, mouth-watering imagery on demand — updated seasonally at a fraction of traditional costs. The group now runs an always-fresh visual menu that would have been impossible to maintain without AI.",
    gradient: "from-orange-950/40 via-zinc-950 to-black",
    stats: [
      { value: "90%", label: "Photography cost cut" },
      { value: "12", label: "Locations covered" },
      { value: "6wk", label: "Full rollout" },
    ],
  },
  {
    slug: "d2c-fashion",
    tag: "Fashion & Retail",
    client: "Emerging D2C Clothing Brand",
    headline: "AI Catalogue: 200 SKUs, Zero Models",
    result: "Launched full catalogue in 3 weeks. Conversion rate up 34% vs prior season.",
    detail:
      "Using AI model generation and garment-draping pipelines, we produced a full-season clothing catalogue — diverse models, multiple colourways, lifestyle and clean-background shots — entirely synthetically. The brand launched on time and on budget for the first time ever. With AI, they now update lookbooks seasonally without the logistics, model fees, or studio bills that had previously delayed every collection.",
    gradient: "from-purple-950/40 via-zinc-950 to-black",
    stats: [
      { value: "200", label: "SKUs delivered" },
      { value: "34%", label: "Conversion lift" },
      { value: "3wk", label: "Catalogue launch" },
    ],
  },
];

interface MediaItem {
  id: number;
  caseStudySlug: string;
  mediaPath: string;
  mediaType: string;
  caption: string | null;
  createdAt: string;
}

function getMediaDisplayUrl(path: string) {
  if (!path) return "";
  return path.startsWith("/objects/") ? `/api/storage${path}` : path;
}

function CaseStudyGallery({ slug, isAdmin }: { slug: string; isAdmin: boolean }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const requestUrl = useRequestUploadUrl();
  const [isUploading, setIsUploading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [lightbox, setLightbox] = useState<MediaItem | null>(null);

  const { data: media = [], isLoading } = useQuery<MediaItem[]>({
    queryKey: ["case-study-media", slug],
    queryFn: async () => {
      const res = await fetch(`/api/case-studies/${slug}/media`);
      if (!res.ok) throw new Error("Failed to load media");
      return res.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/case-studies/${slug}/media/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["case-study-media", slug] }),
    onError: () => toast({ title: "Error", description: "Failed to delete media.", variant: "destructive" }),
  });

  const handleGetUploadParams = async (file: any) => {
    const { uploadURL } = await requestUrl.mutateAsync({
      data: {
        name: file.name,
        size: file.size,
        contentType: file.type || "application/octet-stream",
      },
    });
    return {
      method: "PUT",
      url: uploadURL,
      headers: { "Content-Type": file.type || "application/octet-stream" },
    };
  };

  const handleUploadComplete = async (result: any) => {
    if (!result?.objectPath) return;
    setIsUploading(true);
    try {
      const isVideo = result.objectPath.match(/\.(mp4|mov|webm|avi|mkv)$/i);
      const res = await fetch(`/api/case-studies/${slug}/media`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mediaPath: result.objectPath,
          mediaType: isVideo ? "video" : "image",
        }),
      });
      if (!res.ok) throw new Error("Save failed");
      qc.invalidateQueries({ queryKey: ["case-study-media", slug] });
      setShowUpload(false);
      toast({ title: "Added", description: "Media added to gallery." });
    } catch {
      toast({ title: "Error", description: "Upload failed to save.", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  if (!isLoading && media.length === 0 && !isAdmin) return null;

  return (
    <div className="mt-10 border-t border-white/10 pt-8">
      <div className="flex items-center justify-between mb-6">
        <h4 className="text-xs uppercase tracking-[0.4em] text-gray-500 font-bold">
          Gallery {media.length > 0 && <span className="text-gray-700 ml-2">({media.length})</span>}
        </h4>
        {isAdmin && (
          <button
            onClick={() => setShowUpload(!showUpload)}
            className="flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-gray-500 hover:text-white transition-colors border border-white/10 hover:border-white/30 px-4 py-2"
          >
            {showUpload ? <><X size={11} /> Cancel</> : <><Plus size={11} /> Add Media</>}
          </button>
        )}
      </div>

      {isAdmin && showUpload && (
        <div className="mb-6 border border-white/10 bg-black/50 p-6">
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-4 font-bold">Upload Photo or Video</p>
          <div className="uppy-dark-theme min-h-[120px]">
            <ObjectUploader onGetUploadParameters={handleGetUploadParams} onComplete={handleUploadComplete}>
              {isUploading ? "Saving..." : "Select File"}
            </ObjectUploader>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => <div key={i} className="aspect-square bg-white/5 animate-pulse" />)}
        </div>
      ) : media.length === 0 ? (
        <div className="border border-dashed border-white/10 py-10 text-center">
          <Upload className="mx-auto mb-3 text-gray-700" size={20} />
          <p className="text-gray-700 text-xs uppercase tracking-widest">No media yet — use Add Media above</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {media.map((item) => (
            <div
              key={item.id}
              className="relative group aspect-square overflow-hidden bg-zinc-900 cursor-pointer"
              onClick={() => !isAdmin && setLightbox(item)}
            >
              {item.mediaType === "video" ? (
                <video
                  src={getMediaDisplayUrl(item.mediaPath)}
                  className="w-full h-full object-cover"
                  muted
                  playsInline
                  onMouseOver={(e) => (e.currentTarget as HTMLVideoElement).play()}
                  onMouseOut={(e) => {
                    (e.currentTarget as HTMLVideoElement).pause();
                    (e.currentTarget as HTMLVideoElement).currentTime = 0;
                  }}
                />
              ) : (
                <img
                  src={getMediaDisplayUrl(item.mediaPath)}
                  alt={item.caption || "Gallery"}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              )}

              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300 flex items-center justify-center gap-2">
                {isAdmin ? (
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(item.id); }}
                    disabled={deleteMutation.isPending}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300 bg-black/80 p-2"
                  >
                    <Trash2 size={15} />
                  </button>
                ) : (
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 border border-white flex items-center justify-center">
                    <span className="text-white text-[10px]">↗</span>
                  </div>
                )}
              </div>

              {item.mediaType === "video" && (
                <div className="absolute top-2 left-2 bg-black/70 text-white text-[9px] uppercase tracking-widest px-2 py-1 font-bold">
                  Video
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Lightbox for viewers */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-6 right-6 text-white/60 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
          <div className="max-w-4xl max-h-[90vh] w-full" onClick={(e) => e.stopPropagation()}>
            {lightbox.mediaType === "video" ? (
              <video src={getMediaDisplayUrl(lightbox.mediaPath)} className="w-full max-h-[85vh] object-contain" controls autoPlay />
            ) : (
              <img src={getMediaDisplayUrl(lightbox.mediaPath)} alt="" className="w-full max-h-[85vh] object-contain" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Architects() {
  const { isAdmin } = useAdminMode();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-black flex flex-col text-white">
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-screen flex items-end pb-24 overflow-hidden pt-24">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] via-black to-black" />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
              backgroundSize: "80px 80px",
            }}
          />
        </div>

        <div className="relative z-10 container mx-auto px-6 md:px-12">
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, ease: [0.21, 0.47, 0.32, 0.98] }}
          >
            <p className="text-xs uppercase tracking-[0.6em] text-gray-600 font-bold mb-8">
              Monkmonkeyworks — Business Division
            </p>
            <h1 className="text-7xl md:text-[9rem] lg:text-[12rem] font-bold tracking-tighter leading-[0.83] mb-10">
              Business
              <br />
              <span className="text-transparent" style={{ WebkitTextStroke: "1px rgba(255,255,255,0.25)" }}>
                Architects
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 font-light max-w-2xl leading-relaxed mb-12">
              We help businesses implement technology that actually works — and scales.
              Strategy, integration, and content automation from concept to deployment.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="mailto:hello@monkmonkeyworks.com">
                <Button className="bg-white text-black hover:bg-gray-200 rounded-none px-10 py-7 uppercase tracking-[0.2em] text-xs font-bold">
                  Start a Project
                </Button>
              </a>
              <a href="#case-studies">
                <Button
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10 rounded-none px-10 py-7 uppercase tracking-[0.2em] text-xs font-bold bg-transparent"
                >
                  See Case Studies
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Statement */}
      <section className="py-24 md:py-32 border-t border-white/5 bg-zinc-950">
        <div className="container mx-auto px-6 md:px-12 max-w-5xl">
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-3xl md:text-5xl font-bold tracking-tighter leading-tight text-white"
          >
            AI isn't coming. It's already here — and your competitors are already using it.{" "}
            <span className="text-gray-500">
              We make sure you're not just keeping up, but pulling ahead.
            </span>
          </motion.p>
        </div>
      </section>

      {/* Services */}
      <section className="py-24 md:py-32 bg-background border-t border-white/5">
        <div className="container mx-auto px-6 md:px-12">
          <div className="mb-16">
            <p className="text-xs uppercase tracking-[0.4em] text-gray-500 font-bold mb-4">What We Do</p>
            <h2 className="text-4xl md:text-6xl font-bold tracking-tighter text-white font-display">Services</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/5">
            {services.map((service, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.07 }}
                className="bg-background p-8 md:p-10 group hover:bg-zinc-900 transition-colors duration-300"
              >
                <service.icon className="w-7 h-7 text-white/20 mb-6 group-hover:text-white/50 transition-colors duration-300" />
                <h3 className="text-base font-bold text-white mb-3 tracking-tight">{service.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed group-hover:text-gray-400 transition-colors">
                  {service.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Case Studies */}
      <section id="case-studies" className="py-24 md:py-32 bg-black border-t border-white/5">
        <div className="container mx-auto px-6 md:px-12">
          <div className="mb-16 md:mb-24 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-gray-500 font-bold mb-4">Proof of Work</p>
              <h2 className="text-4xl md:text-6xl font-bold tracking-tighter text-white font-display">Case Studies</h2>
            </div>
            <p className="text-gray-600 max-w-xs text-sm leading-relaxed">
              Real projects. Real results. No vanity metrics — just business impact.
            </p>
          </div>

          <div className="space-y-6">
            {caseStudies.map((study, i) => (
              <motion.div
                key={study.slug}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: i * 0.05 }}
                className={`relative overflow-hidden border border-white/10 bg-gradient-to-br ${study.gradient} hover:border-white/20 transition-all duration-500`}
              >
                <div className="p-8 md:p-12">
                  {/* Header */}
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-10">
                    <div className="flex-1">
                      <span className="inline-block text-[10px] uppercase tracking-[0.4em] font-bold text-gray-500 border border-white/10 px-3 py-1 mb-4">
                        {study.tag}
                      </span>
                      <p className="text-gray-500 text-sm mb-2">{study.client}</p>
                      <h3 className="text-2xl md:text-4xl font-bold tracking-tighter text-white leading-tight">
                        {study.headline}
                      </h3>
                    </div>
                    <div className="flex gap-8 shrink-0">
                      {study.stats.map((s, si) => (
                        <div key={si} className="text-center">
                          <p className="text-2xl md:text-3xl font-bold text-white font-mono">{s.value}</p>
                          <p className="text-[10px] uppercase tracking-widest text-gray-600 mt-1 max-w-[80px]">{s.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Detail */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-4 border-l-2 border-white/15 pl-6">
                      <p className="text-white text-sm font-mono leading-relaxed">{study.result}</p>
                    </div>
                    <div className="lg:col-span-8 lg:border-l border-white/10 lg:pl-10">
                      <p className="text-gray-400 text-base leading-relaxed">{study.detail}</p>
                    </div>
                  </div>

                  {/* Gallery */}
                  <CaseStudyGallery slug={study.slug} isAdmin={isAdmin} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-24 md:py-32 bg-zinc-950 border-t border-white/5">
        <div className="container mx-auto px-6 md:px-12">
          <div className="mb-16">
            <p className="text-xs uppercase tracking-[0.4em] text-gray-500 font-bold mb-4">How It Works</p>
            <h2 className="text-4xl md:text-6xl font-bold tracking-tighter text-white font-display">Our Process</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-px bg-white/5">
            {[
              { num: "01", title: "Discovery", desc: "We audit your current operations, understand your market, and identify where technology creates the most leverage." },
              { num: "02", title: "Blueprint", desc: "We design a precise implementation plan — tools, timelines, costs, and expected ROI. No ambiguity." },
              { num: "03", title: "Build", desc: "We build and integrate. Working solutions fast, full deployment with your team trained and ready." },
              { num: "04", title: "Scale", desc: "We stay on to optimize, iterate, and expand as your capability grows and new opportunities emerge." },
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-zinc-950 p-8 md:p-10"
              >
                <p className="text-6xl font-bold text-white/5 font-mono mb-6">{step.num}</p>
                <h3 className="text-base font-bold text-white mb-3 uppercase tracking-widest">{step.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 md:py-48 bg-background border-t border-white/5">
        <div className="container mx-auto px-6 md:px-12 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl md:text-8xl font-bold tracking-tighter text-white mb-6 font-display leading-[0.88]">
              READY TO
              <br />
              BUILD?
            </h2>
            <p className="text-gray-500 text-lg mb-12 max-w-xl mx-auto">
              Tell us what you're building — or what's not working. We'll be straight with you about how technology can fix it.
            </p>
            <a href="mailto:hello@monkmonkeyworks.com">
              <Button className="bg-white text-black hover:bg-gray-200 rounded-none px-12 py-8 uppercase tracking-[0.2em] text-sm font-bold hover:scale-105 transition-transform inline-flex items-center gap-3">
                Get in Touch <ArrowRight size={16} />
              </Button>
            </a>
          </motion.div>
        </div>
      </section>

      <Footer />

      <style>{`
        .uppy-dark-theme .uppy-Dashboard-inner {
          background-color: transparent !important;
          border: 1px dashed rgba(255,255,255,0.12) !important;
        }
        .uppy-dark-theme .uppy-Dashboard-innerWrap {
          background-color: transparent !important;
        }
        .uppy-dark-theme .uppy-DashboardTab-btn,
        .uppy-dark-theme .uppy-Dashboard-dropFilesTitle {
          color: white !important;
        }
      `}</style>
    </div>
  );
}
