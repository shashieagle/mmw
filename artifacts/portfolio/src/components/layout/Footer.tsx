import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="bg-black border-t border-white/5 pt-16 pb-8 md:pt-24 md:pb-12" data-testid="footer">
      <div className="container mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-start gap-16 md:gap-12">
        <div className="max-w-sm">
          <Link href="/" className="inline-block mb-6 group" data-testid="link-footer-home">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold tracking-tighter text-white">MONKMONKEYWORKS</span>
              <div className="h-1.5 w-1.5 rounded-full bg-primary group-hover:scale-[2] transition-transform duration-300" />
            </div>
          </Link>
          <p className="text-gray-400 text-sm leading-relaxed mb-8">
            The world's first Business Architecture studio driven by narrative design powered by AI. We build what works.
          </p>
          <div className="flex gap-4">
            {/* Social placeholder links */}
            <a href="#" className="w-10 h-10 border border-white/10 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:border-primary transition-colors">
              <span className="sr-only">Instagram</span>
              In
            </a>
            <a href="#" className="w-10 h-10 border border-white/10 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:border-primary transition-colors">
              <span className="sr-only">Twitter / X</span>
              X
            </a>
          </div>
        </div>

        <div className="flex flex-wrap md:flex-nowrap gap-12 md:gap-24">
          <div>
            <h4 className="text-white text-xs uppercase tracking-[0.3em] font-bold mb-8">Studio</h4>
            <ul className="flex flex-col gap-5">
              <li>
                <Link href="/" className="text-gray-400 hover:text-primary transition-colors text-sm font-medium">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/studio" className="text-gray-400 hover:text-primary transition-colors text-sm font-medium">
                  Creative Work
                </Link>
              </li>
              <li>
                <Link href="/founders" className="text-gray-400 hover:text-primary transition-colors text-sm font-medium">
                  Leadership
                </Link>
              </li>
              <li>
                <Link href="/upload" className="text-gray-600 hover:text-white transition-colors text-sm font-medium">
                  Upload (Admin)
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white text-xs uppercase tracking-[0.3em] font-bold mb-8">Architects</h4>
            <ul className="flex flex-col gap-5">
              <li>
                <Link href="/architects" className="text-gray-400 hover:text-primary transition-colors text-sm font-medium">
                  Overview
                </Link>
              </li>
              <li>
                <Link href="/architects#case-studies" className="text-gray-400 hover:text-primary transition-colors text-sm font-medium">
                  Case Studies
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white text-xs uppercase tracking-[0.3em] font-bold mb-8">Connect</h4>
            <ul className="flex flex-col gap-5">
              <li>
                <a href="mailto:hello@monkmonkeyworks.com" className="text-gray-400 hover:text-primary transition-colors text-sm font-medium inline-flex items-center gap-2">
                  hello@monkmonkeyworks.com
                </a>
              </li>
              <li>
                <p className="text-gray-500 text-sm font-medium">
                  Bengaluru, India
                </p>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-6 md:px-12 mt-16 md:mt-24 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold">
        <p>&copy; {new Date().getFullYear()} MONKMONKEYWORKS. All rights reserved.</p>
        <p>Business Architecture · Narrative Design · AI</p>
      </div>
    </footer>
  );
}
