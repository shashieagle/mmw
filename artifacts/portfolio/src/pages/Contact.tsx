import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function Contact() {
  return (
    <div className="min-h-screen bg-black flex flex-col text-white">
      <Navbar />

      <section className="flex-1 flex items-center justify-center py-32">
        <div className="container mx-auto px-6 md:px-12 text-center max-w-2xl">
          <p className="text-[10px] uppercase tracking-[0.6em] text-gray-600 font-bold mb-8">Contact</p>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-white font-display leading-[0.9] mb-8">
            LET'S<br />
            <span className="text-transparent" style={{ WebkitTextStroke: "1px rgba(255,255,255,0.25)" }}>TALK.</span>
          </h1>
          <p className="text-gray-600 text-sm uppercase tracking-[0.3em]">Contact form coming soon.</p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
