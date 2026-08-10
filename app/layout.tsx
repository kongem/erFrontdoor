import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';
import { Phone, HeartPulse, AlertTriangle, HelpCircle, MessageSquare, Shield, Clock } from 'lucide-react';
import { TriageProvider } from '@/lib/triageContext';

export const metadata: Metadata = {
  title: 'Pediatric Emergency Room Digital Front Door | REVAMP Health',
  description: 'Smart pediatric ER triage tool, real-time care guidance, and emergency resources for parents and caregivers.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col font-sans bg-slate-50 text-slate-800 antialiased">
        <TriageProvider>
          {/* Persistent Emergency Top Banner */}
          <aside aria-label="Emergency warning" className="bg-gradient-to-r from-emergency-700 via-emergency-600 to-rose-700 text-white py-2.5 px-4 sticky top-0 z-50 shadow-md">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs sm:text-sm font-medium">
              <div className="flex items-center gap-2 text-center sm:text-left">
                <span className="flex h-2.5 w-2.5 relative flex-shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
                </span>
                <AlertTriangle className="w-4 h-4 text-amber-300 flex-shrink-0" />
                <span>
                  <strong>ALERT:</strong> If your child is experiencing a life-threatening emergency, call <strong>911</strong> immediately.
                </span>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <a
                  href="tel:911"
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-bold px-3 py-1 rounded-full text-xs transition flex items-center gap-1.5 border border-white/30"
                >
                  <Phone className="w-3.5 h-3.5 fill-current text-white" />
                  Call 911 Now
                </a>
                <a
                  href="tel:18447647669"
                  className="hidden md:flex items-center gap-1 text-xs text-rose-100 hover:text-white underline underline-offset-2"
                >
                  Poison Control: 1-844-764-7669
                </a>
              </div>
            </div>
          </aside>

          {/* Global Navigation Header */}
          <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-[41px] z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
              {/* Brand / Logo */}
              <Link href="/" className="flex items-center gap-2.5 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform duration-200">
                  <HeartPulse className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-lg font-bold bg-gradient-to-r from-teal-700 via-teal-900 to-slate-900 bg-clip-text text-transparent block leading-tight">
                    REVAMP<span className="text-teal-600 font-extrabold"></span>
                  </span>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">
                    Pediatric Digital ER
                  </span>
                </div>
              </Link>

              <nav className="hidden md:flex items-center gap-1">
                <Link
                  href="/staff"
                  className="px-3 py-2 text-sm font-medium text-slate-700 hover:text-teal-700 hover:bg-teal-50/60 rounded-lg transition"
                >
                  Provider Portal
                </Link>
                <Link
                  href="/feedback"
                  className="px-3 py-2 text-sm font-medium text-slate-700 hover:text-teal-700 hover:bg-teal-50/60 rounded-lg transition"
                >
                  Patient Feedback
                </Link>
                <Link
                  href="/#faq"
                  className="px-3 py-2 text-sm font-medium text-slate-700 hover:text-teal-700 hover:bg-teal-50/60 rounded-lg transition"
                >
                  FAQ
                </Link>
                <Link
                  href="/support"
                  className="p-2 text-slate-700 hover:text-teal-700 hover:bg-teal-50/60 rounded-lg transition flex items-center justify-center"
                  title="Support"
                >
                  <HelpCircle className="w-5 h-5 text-teal-600" />
                </Link>
              </nav>


            </div>
          </header>

          {/* Main Content Area */}
          <main className="flex-grow">
            {children}
          </main>
        </TriageProvider>
      </body>
    </html>
  );
}
