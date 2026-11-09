import React from 'react';
import { useApp } from '../context/AppContext.tsx';
import type { AppPage } from '../context/AppContext.tsx';
import { ShieldCheck, Zap, Lock, Mail, Phone, MapPin, Send } from 'lucide-react';

export const Footer: React.FC = () => {
  const { setCurrentPage, settings } = useApp();

  const navigateTo = (page: AppPage) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const brandName = settings?.websiteName || 'Method Tricks';

  return (
    <footer className="w-full bg-[#07090e] border-t border-slate-800/80 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Col 1: Brand & Bio */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white">
                <Zap className="w-4 h-4 fill-white" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                {brandName}
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {settings?.description || 'Your premier destination for tested digital methods, master tricks, and full-length career courses in digital marketing, tech automation, and design.'}
            </p>
            <div className="pt-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300">
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                <span>Admin Verified Payments</span>
              </div>
            </div>
          </div>

          {/* Col 2: Methods & Tricks */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Methods & Tricks
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button 
                  onClick={() => navigateTo('simple-methods')}
                  className="hover:text-purple-400 transition-colors cursor-pointer text-left"
                >
                  Simple Methods (Free Access)
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigateTo('premium-methods')}
                  className="hover:text-purple-400 transition-colors cursor-pointer text-left text-purple-300 font-medium"
                >
                  Premium Methods (VIP Unlock)
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigateTo('simple-courses')}
                  className="hover:text-purple-400 transition-colors cursor-pointer text-left"
                >
                  Simple Courses (Free Bootcamp)
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigateTo('premium-courses')}
                  className="hover:text-purple-400 transition-colors cursor-pointer text-left text-purple-300 font-medium"
                >
                  Premium Masterclasses
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Support & Payment */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Payment & Support
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button 
                  onClick={() => navigateTo('packages')}
                  className="hover:text-purple-400 transition-colors cursor-pointer text-left"
                >
                  Membership Packages (৳ BDT)
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigateTo('payment-verify')}
                  className="hover:text-purple-400 transition-colors cursor-pointer text-left"
                >
                  bKash & Nagad Verification Form
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigateTo('about')}
                  className="hover:text-purple-400 transition-colors cursor-pointer text-left"
                >
                  About Method Tricks
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigateTo('contact')}
                  className="hover:text-purple-400 transition-colors cursor-pointer text-left"
                >
                  Contact Support Team
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Legal & Admin */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Policies & Portal
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button 
                  onClick={() => navigateTo('terms')}
                  className="hover:text-purple-400 transition-colors cursor-pointer text-left"
                >
                  Terms & Conditions
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigateTo('privacy')}
                  className="hover:text-purple-400 transition-colors cursor-pointer text-left"
                >
                  Privacy Policy
                </button>
              </li>
              <li className="pt-2 border-t border-slate-800/80">
                <button 
                  onClick={() => navigateTo('admin-login')}
                  className="flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer font-medium"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Admin Portal</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} {brandName}. All rights reserved.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Supported: bKash Personal · Nagad Personal</span>
            <span>·</span>
            <span>Secure 256-bit Authorization</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
