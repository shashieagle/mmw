import { useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ArrowRight, Brain, BarChart3, Layers, Zap, Users, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

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
      "Product shots, lifestyle imagery, menu cards, real estate staging, catalogue renders — we replace costly traditional shoots with AI pipelines that move at business speed.",
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
    tag: "Real Estate",
    client: "Premium Property Group",
    headline: "Before & After: AI Interior Staging at Scale",
    result: "Reduced staging costs by 80%. Cut time-to-listing from 2 weeks to 48 hours.",
    detail:
      "We replaced physical staging with an AI pipeline that takes raw empty-room photos and generates photorealistic furnished interiors in multiple styles — modern, Scandinavian, luxury. The client listed 3× more properties per month with no additional team.",
    gradient: "from-amber-900/30 to-black",
  },
  {
    tag: "F&B",
    client: "Multi-Chain Restaurant Group",
    headline: "Menu Magic: AI-Generated Food Photography",
    result: "90% cost reduction on food photography. 6-week rollout across 12 locations.",
    detail:
      "Shot one set of hero dishes, then generated style variants, seasonal specials, and localized menu imagery for every branch using AI. No reshoots. No food stylists flying across cities. Just consistent, mouth-watering imagery on demand.",
    gradient: "from-orange-900/30 to-black",
  },
  {
    tag: "Fashion",
    client: "Emerging D2C Clothing Brand",
    headline: "AI Catalogue: 200 SKUs, Zero Models",
    result: "Launched full catalogue in 3 weeks. Conversion rate up 34% vs prior season.",
    detail:
      "Using AI model generation and garment-draping pipelines, we produced a full-season clothing catalogue — diverse models, multiple colourways, lifestyle and clean-background shots — entirely synthetically. The brand launched on time and on budget for the first time.",
    gradient: "from-purple-900/30 to-black",
  },
];

export default function Architects() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-black flex flex-col text-white">
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] via-black to-black" />
          {/* Grid lines */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
              backgroundSize: "80px 80px",
            }}
          />
        </div>

        <div className="relative z-10 container mx-auto px-6 md:px-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.21, 0.47, 0.32, 0.98] }}
          >
            <p className="text-xs uppercase tracking-[0.5em] text-gray-500 font-bold mb-6">
              Monkmonkeyworks — Business Division
            </p>
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter leading-[0.85] mb-10">
              AI
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-300 to-gray-600">
                ARCHITECTS
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 font-light max-w-3xl mx-auto leading-relaxed mb-12">
              We help businesses implement AI that actually works. Strategy, integration,
              content automation — from concept to live deployment.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="mailto:hello@monkmonkeyworks.com">
                <Button
                  size="lg"
                  className="bg-white text-black hover:bg-gray-200 rounded-none px-10 py-7 uppercase tracking-[0.2em] text-xs font-bold"
                >
                  Start a Project
                </Button>
              </a>
              <a href="#case-studies">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10 rounded-none px-10 py-7 uppercase tracking-[0.2em] text-xs font-bold bg-transparent"
                >
                  See Case Studies
                </Button>
              </a>
            </div>
          </motion.div>
        </div>

        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <span className="text-[10px] uppercase tracking-[0.2em] text-gray-600 font-bold">Scroll</span>
          <div className="w-[1px] h-16 bg-gradient-to-b from-gray-500 to-transparent" />
        </motion.div>
      </section>

      {/* Divider statement */}
      <section className="py-24 md:py-32 border-t border-white/5 bg-zinc-950">
        <div className="container mx-auto px-6 md:px-12 max-w-5xl">
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-3xl md:text-5xl font-bold tracking-tighter leading-tight text-white"
          >
            AI isn't coming. It's already here — and your competitors are already using it.
            <span className="text-gray-500">
              {" "}We make sure you're not just keeping up, but pulling ahead.
            </span>
          </motion.p>
        </div>
      </section>

      {/* Services */}
      <section className="py-24 md:py-32 bg-background border-t border-white/5">
        <div className="container mx-auto px-6 md:px-12">
          <div className="mb-16 md:mb-24">
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
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="bg-background p-8 md:p-10 group hover:bg-zinc-900 transition-colors duration-300"
              >
                <service.icon className="w-8 h-8 text-white/30 mb-6 group-hover:text-white transition-colors duration-300" />
                <h3 className="text-lg font-bold text-white mb-3 tracking-tight">{service.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed group-hover:text-gray-400 transition-colors">
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
            <p className="text-gray-500 max-w-xs text-sm leading-relaxed">
              Real projects. Real results. No vanity metrics — just business impact.
            </p>
          </div>

          <div className="space-y-6">
            {caseStudies.map((study, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: i * 0.1 }}
                className={`relative overflow-hidden border border-white/10 bg-gradient-to-r ${study.gradient} p-8 md:p-12 group hover:border-white/30 transition-all duration-500`}
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
                  <div className="lg:col-span-4">
                    <span className="inline-block text-[10px] uppercase tracking-[0.3em] font-bold text-gray-500 border border-white/10 px-3 py-1 mb-4">
                      {study.tag}
                    </span>
                    <p className="text-gray-500 text-sm mb-2">{study.client}</p>
                    <h3 className="text-2xl md:text-3xl font-bold tracking-tighter text-white leading-tight mb-6">
                      {study.headline}
                    </h3>
                    <div className="border-l-2 border-white pl-4">
                      <p className="text-white text-sm font-mono leading-relaxed">{study.result}</p>
                    </div>
                  </div>
                  <div className="lg:col-span-8 lg:border-l border-white/10 lg:pl-16">
                    <p className="text-gray-400 text-base leading-relaxed">{study.detail}</p>
                  </div>
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
              { num: "01", title: "Discovery", desc: "We audit your current operations, understand your market, and identify where AI creates the most leverage." },
              { num: "02", title: "Blueprint", desc: "We design a precise implementation plan — tools, timelines, costs, and expected ROI. No ambiguity." },
              { num: "03", title: "Build", desc: "We build and integrate. Working prototypes fast, full deployment with your team trained and ready." },
              { num: "04", title: "Scale", desc: "We stay on to optimize, iterate, and expand as your AI capability grows and new opportunities emerge." },
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
                <h3 className="text-lg font-bold text-white mb-3 uppercase tracking-widest">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 md:py-48 bg-background border-t border-white/5">
        <div className="container mx-auto px-6 md:px-12 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl md:text-8xl font-bold tracking-tighter text-white mb-6 font-display leading-[0.9]">
              READY TO
              <br />
              ARCHITECT?
            </h2>
            <p className="text-gray-500 text-lg mb-12 max-w-xl mx-auto">
              Tell us what you're building — or what's broken. We'll be straight with you about what AI can do for it.
            </p>
            <a href="mailto:hello@monkmonkeyworks.com">
              <Button
                size="lg"
                className="bg-white text-black hover:bg-gray-200 rounded-none px-12 py-8 uppercase tracking-[0.2em] text-sm font-bold transition-transform hover:scale-105 inline-flex items-center gap-3"
              >
                Get in Touch <ArrowRight size={16} />
              </Button>
            </a>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
