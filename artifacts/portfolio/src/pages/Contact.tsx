import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";

type Inquiry = "Creative Studio" | "Business Architects" | "General";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", inquiry: "" as Inquiry | "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.inquiry) return;
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  const inputClass =
    "w-full bg-transparent border-b border-white/15 focus:border-white/60 outline-none py-4 text-white placeholder:text-gray-700 text-sm tracking-wide transition-colors duration-300";

  return (
    <div className="min-h-screen bg-black flex flex-col text-white">
      <Navbar />

      <section className="flex-1 py-32 md:py-48">
        <div className="container mx-auto px-6 md:px-12 max-w-3xl">

          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-20"
          >
            <p className="text-[10px] uppercase tracking-[0.6em] text-gray-600 font-bold mb-8">Contact</p>
            <h1 className="text-5xl md:text-8xl font-bold tracking-tighter text-white font-display leading-[0.88]">
              LET'S<br />
              <span className="text-transparent" style={{ WebkitTextStroke: "1px rgba(255,255,255,0.25)" }}>TALK.</span>
            </h1>
          </motion.div>

          {/* Success state */}
          {status === "success" ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-white/10 p-12 text-center"
            >
              <p className="text-[10px] uppercase tracking-[0.5em] font-bold mb-4" style={{ color: "#E8572A" }}>Received</p>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tighter text-white mb-4">We'll be in touch.</h2>
              <p className="text-gray-500 text-sm">Expect a response within 1–2 business days.</p>
            </motion.div>
          ) : (
            <motion.form
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-10"
            >
              {/* Name + Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div>
                  <label className="text-[9px] uppercase tracking-[0.4em] text-gray-600 font-bold block mb-2">Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Your name"
                    className={inputClass}
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-[9px] uppercase tracking-[0.4em] text-gray-600 font-bold block mb-2">Email</label>
                  <input
                    type="email"
                    required
                    placeholder="your@email.com"
                    className={inputClass}
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  />
                </div>
              </div>

              {/* Inquiry type */}
              <div>
                <label className="text-[9px] uppercase tracking-[0.4em] text-gray-600 font-bold block mb-4">I'm interested in</label>
                <div className="flex flex-wrap gap-3">
                  {(["Creative Studio", "Business Architects", "General"] as Inquiry[]).map(opt => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, inquiry: opt }))}
                      className={`px-5 py-2.5 text-[10px] uppercase tracking-[0.3em] font-bold border transition-all duration-300 ${
                        form.inquiry === opt
                          ? "bg-white text-black border-white"
                          : "border-white/15 text-gray-500 hover:border-white/40 hover:text-white"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="text-[9px] uppercase tracking-[0.4em] text-gray-600 font-bold block mb-2">Message</label>
                <textarea
                  required
                  rows={5}
                  placeholder="Tell us what you're working on..."
                  className={`${inputClass} resize-none`}
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                />
              </div>

              {/* Submit */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pt-4 border-t border-white/5">
                {status === "error" && (
                  <p className="text-red-500 text-xs uppercase tracking-widest">Something went wrong — try again.</p>
                )}
                <button
                  type="submit"
                  disabled={status === "sending" || !form.inquiry}
                  className="ml-auto inline-flex items-center gap-3 bg-white text-black px-10 py-5 text-xs uppercase tracking-[0.25em] font-bold hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {status === "sending" ? (
                    <><Loader2 size={14} className="animate-spin" /> Sending...</>
                  ) : (
                    <>Send Message <ArrowRight size={14} /></>
                  )}
                </button>
              </div>
            </motion.form>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
