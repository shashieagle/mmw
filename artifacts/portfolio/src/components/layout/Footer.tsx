import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="bg-background border-t border-white/5 py-12 md:py-24">
      <div className="container mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-start gap-12">
        <div className="max-w-sm">
          <Link href="/" className="inline-block mb-6">
            <span className="text-2xl font-bold tracking-tighter text-white">MONKMONKEYWORKS</span>
          </Link>
          <p className="text-gray-500 text-sm leading-relaxed">The world's first Business Architecture studio driven by narrative design powered by AI.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-12 md:gap-24">
          <div>
            <h4 className="text-white text-sm uppercase tracking-widest font-bold mb-6">Studio</h4>
            <ul className="flex flex-col gap-4">
              <li>
                <Link href="/" className="text-gray-500 hover:text-white transition-colors text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/studio" className="text-gray-500 hover:text-white transition-colors text-sm">
                  Creative Work
                </Link>
              </li>
              <li>
                <Link href="/upload" className="text-gray-500 hover:text-white transition-colors text-sm">
                  Upload (Admin)
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white text-sm uppercase tracking-widest font-bold mb-6">Architects</h4>
            <ul className="flex flex-col gap-4">
              <li>
                <Link href="/architects" className="text-gray-500 hover:text-white transition-colors text-sm">
                  Overview
                </Link>
              </li>
              <li>
                <Link href="/architects#case-studies" className="text-gray-500 hover:text-white transition-colors text-sm">
                  Case Studies
                </Link>
              </li>
              <li>
                <a href="mailto:hello@monkmonkeyworks.com" className="text-gray-500 hover:text-white transition-colors text-sm">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white text-sm uppercase tracking-widest font-bold mb-6">Connect</h4>
            <ul className="flex flex-col gap-4">
              <li>
                <a href="#" className="text-gray-500 hover:text-white transition-colors text-sm">
                  Instagram
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-500 hover:text-white transition-colors text-sm">
                  Twitter / X
                </a>
              </li>
              <li>
                <a href="mailto:hello@monkmonkeyworks.com" className="text-gray-500 hover:text-white transition-colors text-sm">
                  hello@monkmonkeyworks.com
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-6 md:px-12 mt-12 md:mt-24 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-600 uppercase tracking-widest">
        <p>&copy; {new Date().getFullYear()} MONKMONKEYWORKS. All rights reserved.</p>
        <p>Business Architecture · Narrative Design · AI</p>
      </div>
    </footer>
  );
}
