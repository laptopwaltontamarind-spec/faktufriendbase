import React from 'react';
import { useApp } from '../context/AppContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { AdBanner } from '../components/AdBanner.tsx';
import { 
  Crown, 
  Sparkles, 
  Play, 
  Lock, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  BookOpen, 
  Users, 
  Smartphone, 
  Download,
  Eye,
  Clock
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { 
    setCurrentPage, 
    methods, 
    courses, 
    packages, 
    openMethodDetail, 
    openCourseDetail, 
    triggerPremiumGate, 
    setSelectedPackageForPayment,
    settings 
  } = useApp();
  const { isPremium } = useAuth();

  const simpleMethods = methods.filter(m => m.type === 'simple').slice(0, 3);
  const premiumMethods = methods.filter(m => m.type === 'premium').slice(0, 3);
  const featuredCourses = courses.slice(0, 4);

  const handleSelectPackage = (pkg: any) => {
    setSelectedPackageForPayment(pkg);
    setCurrentPage('payment-verify');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="w-full min-h-screen">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Headlines & CTA */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-950/80 border border-purple-500/30 text-xs font-semibold text-purple-300">
                <Crown className="w-3.5 h-3.5 text-purple-400" />
                <span>BANGLADESH'S PREMIER DIGITAL SKILL PLATFORM</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15]" style={{ textWrap: 'balance' }}>
                {settings?.heroHeadline || 'Master Secret Digital Methods & Advance Your Career'}
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
                {settings?.heroSubheadline || 'Explore tested step-by-step methods, digital marketing secrets, cloud architectures, and full-length masterclasses with tiered free and VIP access.'}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => {
                    setCurrentPage('methods');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-6 py-3.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-purple-600/30 flex items-center gap-2 transition-all transform hover:-translate-y-0.5 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Explore Methods</span>
                </button>

                <button
                  onClick={() => {
                    setCurrentPage('packages');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-purple-300 border border-purple-500/30 font-semibold text-sm rounded-xl flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Crown className="w-4 h-4 text-purple-400" />
                  <span>Get Premium VIP</span>
                </button>
              </div>

              {/* Key Highlights */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-800/80 text-xs text-slate-400">
                <div>
                  <div className="text-white font-bold text-lg sm:text-xl font-mono tabular-nums">100% Tested</div>
                  <p className="text-slate-400">Practical methods</p>
                </div>
                <div>
                  <div className="text-white font-bold text-lg sm:text-xl font-mono tabular-nums">bKash & Nagad</div>
                  <p className="text-slate-400">Manual instant verify</p>
                </div>
                <div>
                  <div className="text-white font-bold text-lg sm:text-xl font-mono tabular-nums">0 Ads for VIP</div>
                  <p className="text-slate-400">Uninterrupted learning</p>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden border border-purple-500/30 shadow-2xl shadow-purple-900/30 group">
                <img
                  src={settings?.bannerImageUrl || "/src/assets/images/hero_method_tricks_tech_1794218786220.jpg"}
                  alt="Method Tricks Digital Academy"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#080b11] via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-800 text-xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-white">Live Method Spotlight</span>
                    <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px] font-bold">
                      VERIFIED 2026
                    </span>
                  </div>
                  <p className="text-slate-300 line-clamp-1">Facebook Credit & Bypass Geo-Proxies Blueprint</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ADVERTISEMENT BANNER (FOR SIMPLE USERS ONLY) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AdBanner placement="home_top" />
      </div>

      {/* 2. SIMPLE METHODS (FREE) SECTION */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-slate-800/80">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-block text-xs font-bold uppercase tracking-wider text-purple-400 mb-1">
              Category A · Free Learning
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Simple Methods & Tricks
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Watch selected free method videos and download allowed assets. Supported by light sponsor ads.
            </p>
          </div>
          <button
            onClick={() => {
              setCurrentPage('simple-methods');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <span>View All Simple Methods</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {simpleMethods.map(m => (
            <div
              key={m.id}
              onClick={() => openMethodDetail(m.id)}
              className="bg-[#0f1422] border border-slate-800 hover:border-slate-700 rounded-xl overflow-hidden transition-all hover:-translate-y-1 cursor-pointer flex flex-col group shadow-lg"
            >
              <div className="relative aspect-video w-full bg-slate-900 overflow-hidden">
                <img
                  src={m.thumbnailUrl}
                  alt={m.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/30 text-[11px] font-semibold text-emerald-300">
                  FREE METHOD
                </div>
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-lg">
                    <Play className="w-5 h-5 ml-0.5 fill-white" />
                  </div>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-xs text-slate-500 mb-1.5">
                    <span>{m.category}</span>
                    <span className="mx-1.5">·</span>
                    <span>{m.uploadDate}</span>
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-2 mb-2">
                    {m.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {m.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" />
                    <span>{m.views} views</span>
                  </span>
                  <span className="text-[11px] text-slate-500">Watermark: Simple Video</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. PREMIUM METHODS (VIP) SECTION */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-slate-800/80">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-purple-400 mb-1">
              <Crown className="w-3.5 h-3.5" />
              <span>Category B · Exclusive VIP Tricks</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Premium Methods & Blueprints
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              High-value techniques and scripts. Thumbnails and descriptions are visible to everyone; videos & downloads require Premium membership.
            </p>
          </div>
          <button
            onClick={() => {
              setCurrentPage('premium-methods');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <span>View All Premium Methods</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {premiumMethods.map(m => (
            <div
              key={m.id}
              onClick={() => {
                if (!isPremium) {
                  triggerPremiumGate('method');
                } else {
                  openMethodDetail(m.id);
                }
              }}
              className="bg-[#0f1422] border border-purple-500/20 hover:border-purple-500/50 rounded-xl overflow-hidden transition-all hover:-translate-y-1 cursor-pointer flex flex-col group shadow-xl relative"
            >
              <div className="relative aspect-video w-full bg-slate-900 overflow-hidden">
                <img
                  src={m.thumbnailUrl}
                  alt={m.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-purple-950/90 border border-purple-500/40 text-[11px] font-semibold text-purple-300 flex items-center gap-1">
                  <Crown className="w-3 h-3 text-purple-400" />
                  <span>PREMIUM VIP</span>
                </div>

                {!isPremium && (
                  <div className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-purple-300 backdrop-blur-sm border border-purple-500/30">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                )}

                <div className="absolute inset-0 bg-purple-950/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-lg">
                    {isPremium ? <Play className="w-5 h-5 ml-0.5 fill-white" /> : <Lock className="w-5 h-5" />}
                  </div>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-xs text-slate-500 mb-1.5">
                    <span>{m.category}</span>
                    <span className="mx-1.5">·</span>
                    <span>{m.uploadDate}</span>
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-2 mb-2">
                    {m.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {m.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span className="text-[11px] text-purple-300 font-medium">
                    {isPremium ? 'Unlocked · Full Video & Files' : 'Locked · Buy Premium to watch'}
                  </span>
                  <span className="text-[11px] text-slate-500">Watermark: Premium Video</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. COURSES MASTERCLASSES PREVIEW */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-slate-800/80">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-1">
              Curated Bootcamps & Deep Dives
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Simple & Premium Courses
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Multi-lesson curricula taught by industry specialists with downloadable project files.
            </p>
          </div>
          <button
            onClick={() => {
              setCurrentPage('courses');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <span>Browse All Courses</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {featuredCourses.map(c => {
            const isCourseLocked = c.type === 'premium' && !isPremium;
            return (
              <div
                key={c.id}
                onClick={() => {
                  if (isCourseLocked) {
                    triggerPremiumGate('course');
                  } else {
                    openCourseDetail(c.id);
                  }
                }}
                className={`bg-[#0f1422] border rounded-xl overflow-hidden transition-all hover:-translate-y-1 cursor-pointer flex flex-col sm:flex-row group ${
                  c.type === 'premium' ? 'border-purple-500/20 hover:border-purple-500/50' : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="sm:w-5/12 relative aspect-video sm:aspect-auto bg-slate-900 overflow-hidden">
                  <img
                    src={c.thumbnailUrl}
                    alt={c.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    c.type === 'premium' ? 'bg-purple-950/90 text-purple-300 border border-purple-500/30' : 'bg-slate-900/90 text-slate-300 border border-slate-700'
                  }">
                    {c.type === 'premium' ? 'VIP COURSE' : 'FREE COURSE'}
                  </div>
                  {isCourseLocked && (
                    <div className="absolute bottom-2 right-2 p-1.5 bg-black/80 rounded-md text-purple-400">
                      <Lock className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>

                <div className="sm:w-7/12 p-5 flex flex-col justify-between">
                  <div>
                    <div className="text-xs text-slate-500 mb-1 flex items-center gap-2">
                      <span>{c.category}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1 font-mono tabular-nums">
                        <Clock className="w-3 h-3" />
                        {c.totalDuration}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-2 mb-2">
                      {c.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {c.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                    <span className="text-slate-300 font-medium">
                      {c.lessons.length} structured lessons
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {c.type === 'premium' ? 'Watermark: Premium Course' : 'Watermark: Simple Course'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. MEMBERSHIP PACKAGES SECTION (BDT ৳) */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-slate-800/80">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-500/30 text-xs font-semibold text-purple-300 mb-3">
            <Crown className="w-3.5 h-3.5 text-purple-400" />
            <span>TRANSPARENT BD PRICING</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Unlock Unlimited Premium Access
          </h2>
          <p className="text-slate-400 text-sm mt-3">
            Pay safely via bKash or Nagad. Verified manually by administration for 100% security.
          </p>
        </div>

        {packages.length === 0 ? (
          <div className="bg-[#0f1422] border border-slate-800 rounded-2xl p-10 text-center max-w-lg mx-auto">
            <Crown className="w-10 h-10 text-purple-400/50 mx-auto mb-3" />
            <h4 className="text-base font-bold text-white mb-1.5">VIP Packages Updating</h4>
            <p className="text-slate-400 text-xs leading-relaxed mb-4">
              Membership pricing will be announced shortly by the administrator. Contact our support channels for instant VIP pass inquiries.
            </p>
            <button
              onClick={() => setCurrentPage('contact')}
              className="px-5 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/30 text-purple-300 text-xs font-semibold cursor-pointer"
            >
              Contact Support
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {packages.map(pkg => (
              <div
                key={pkg.id}
                className={`relative bg-[#0f1422] rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 ${
                  pkg.isPopular
                    ? 'border-2 border-purple-500 shadow-2xl shadow-purple-950/50'
                    : 'border border-slate-800 hover:border-slate-700'
                }`}
              >
                {pkg.isPopular && (
                  <div className="absolute -top-3.5 inset-x-0 mx-auto w-fit px-3 py-0.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[11px] font-bold rounded-full uppercase tracking-wider shadow">
                    Most Popular
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-bold text-white mb-1">{pkg.name}</h3>
                  <p className="text-xs text-slate-400 mb-4">{pkg.description}</p>
                  <div className="flex items-baseline gap-1 text-white mb-6">
                    <span className="text-3xl sm:text-4xl font-extrabold font-mono tabular-nums">৳{pkg.priceBDT}</span>
                    <span className="text-xs text-slate-400">/ {pkg.durationDays} Days</span>
                  </div>

                  <div className="space-y-2.5 text-xs text-slate-300 mb-6">
                    {pkg.benefits.map((b, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handleSelectPackage(pkg)}
                  className={`w-full py-3 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    pkg.isPopular
                      ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/30'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                  }`}
                >
                  <span>Select Package</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 6. BKASH & NAGAD PAYMENT PROCESS STEPS */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-[#0e1322] via-[#0b0f1a] to-[#07090f] border border-slate-800 rounded-2xl p-8 lg:p-12">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Simple 4-Step bKash & Nagad Payment
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-2">
              Our manual admin verification guarantees total security and authentic membership activation.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
              <div className="w-8 h-8 rounded-lg bg-purple-600/20 text-purple-400 font-bold font-mono flex items-center justify-center mb-3">
                01
              </div>
              <h4 className="font-bold text-white mb-1.5">Pick Package</h4>
              <p className="text-slate-400 leading-relaxed">
                Choose between 7, 30, 90 or 365 Days VIP passes based on your learning speed.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
              <div className="w-8 h-8 rounded-lg bg-purple-600/20 text-purple-400 font-bold font-mono flex items-center justify-center mb-3">
                02
              </div>
              <h4 className="font-bold text-white mb-1.5">Send Money</h4>
              <p className="text-slate-400 leading-relaxed">
                Send the exact package price to our official bKash or Nagad Personal numbers.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
              <div className="w-8 h-8 rounded-lg bg-purple-600/20 text-purple-400 font-bold font-mono flex items-center justify-center mb-3">
                03
              </div>
              <h4 className="font-bold text-white mb-1.5">Submit Form</h4>
              <p className="text-slate-400 leading-relaxed">
                Provide your sender phone, Transaction ID (TrxID), and upload payment screenshot.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
              <div className="w-8 h-8 rounded-lg bg-purple-600/20 text-purple-400 font-bold font-mono flex items-center justify-center mb-3">
                04
              </div>
              <h4 className="font-bold text-white mb-1.5">Admin Activates</h4>
              <p className="text-slate-400 leading-relaxed">
                Admin verifies your statement. Your account upgrades to Premium with zero ads.
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
