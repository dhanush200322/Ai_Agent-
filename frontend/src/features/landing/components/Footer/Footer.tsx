import Link from "next/link";
import { Github, Twitter, Linkedin } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="border-t border-white/[0.05] bg-[#04070D] pt-20 pb-10">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-16">
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-3 group mb-6">
              <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-[#4F8CFF] to-[#6366F1] flex items-center justify-center overflow-hidden shadow-[0_0_20px_rgba(79,140,255,0.3)]">
                <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full transition-transform duration-500 ease-out -skew-x-12 -translate-x-full" />
                <div className="w-4 h-4 bg-[#04070D] rounded-sm z-10" />
              </div>
              <span className="font-bold text-xl tracking-tight text-white">AgentOS</span>
            </Link>
            <p className="text-white/50 mb-8 max-w-sm font-light leading-relaxed">
              The operating system for Enterprise AI. Build, deploy, and scale autonomous agents with zero infrastructure overhead.
            </p>
            <div className="flex gap-5">
              <Link href="#" className="text-white/40 hover:text-white transition-colors hover:-translate-y-1 transform duration-200"><Twitter className="w-5 h-5" /></Link>
              <Link href="#" className="text-white/40 hover:text-white transition-colors hover:-translate-y-1 transform duration-200"><Github className="w-5 h-5" /></Link>
              <Link href="#" className="text-white/40 hover:text-white transition-colors hover:-translate-y-1 transform duration-200"><Linkedin className="w-5 h-5" /></Link>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold text-white mb-6 tracking-wide">Product</h4>
            <ul className="space-y-4 text-white/50 text-sm font-light">
              <li><Link href="#" className="hover:text-[#4F8CFF] transition-colors">Agent Builder</Link></li>
              <li><Link href="#" className="hover:text-[#4F8CFF] transition-colors">Knowledge Hub</Link></li>
              <li><Link href="#" className="hover:text-[#4F8CFF] transition-colors">Memory Engine</Link></li>
              <li><Link href="#" className="hover:text-[#4F8CFF] transition-colors">Integrations</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-6 tracking-wide">Resources</h4>
            <ul className="space-y-4 text-white/50 text-sm font-light">
              <li><Link href="#" className="hover:text-[#4F8CFF] transition-colors">Documentation</Link></li>
              <li><Link href="#" className="hover:text-[#4F8CFF] transition-colors">API Reference</Link></li>
              <li><Link href="#" className="hover:text-[#4F8CFF] transition-colors">Case Studies</Link></li>
              <li><Link href="#" className="hover:text-[#4F8CFF] transition-colors">Blog</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-6 tracking-wide">Company</h4>
            <ul className="space-y-4 text-white/50 text-sm font-light">
              <li><Link href="#" className="hover:text-[#4F8CFF] transition-colors">About</Link></li>
              <li><Link href="#" className="hover:text-[#4F8CFF] transition-colors">Careers</Link></li>
              <li><Link href="#" className="hover:text-[#4F8CFF] transition-colors">Security</Link></li>
              <li><Link href="#" className="hover:text-[#4F8CFF] transition-colors">Contact</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/[0.05] flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/40 font-light">
          <p>© {new Date().getFullYear()} AgentOS Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
