import React from 'react';
import { useApp } from '../context/AppContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { Crown, Sparkles, CheckCircle2, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import type { MembershipPackage } from '../types/index.ts';

export const PackagesPage: React.FC = () => {
  const { packages, setSelectedPackageForPayment, setCurrentPage } = useApp();
  const { isPremium, user } = useAuth();

  const handleSelectPackage = (pkg: MembershipPackage) => {
    setSelectedPackageForPayment(pkg);
    setCurrentPage('payment-verify');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="w-full min-h-screen py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-14">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-500/30 text-xs font-semibold text-purple-300 mb-3">
          <Crown className="w-3.5 h-3.5 text-purple-400" />
          <span>OFFICIAL MEMBERSHIP TIERS</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Invest in Your Digital Mastery
        </h1>
        <p className="text-slate-400 text-sm sm:text-base mt-3 leading-relaxed">
          Unlock all secret methods, comprehensive masterclasses, fast direct download mirrors, and a completely 100% ad-free experience.
        </p>

        {isPremium && (
          <div className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-xs text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>
              You currently have an active Premium Membership! Valid until{' '}
              {user?.premiumExpiresAt ? new Date(user.premiumExpiresAt).toLocaleDateString() : 'Active'}.
            </span>
          </div>
        )}
      </div>

      {/* Packages Grid */}
      {packages.length === 0 ? (
        <div className="bg-[#0f1422] border border-slate-800 rounded-2xl p-12 text-center max-w-xl mx-auto my-8">
          <Crown className="w-12 h-12 text-purple-400/50 mx-auto mb-3" />
          <h3 className="text-xl font-bold text-white mb-2">Packages Updating Soon</h3>
          <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-6">
            Our membership packages and pricing are currently being updated by the administration.
            Please visit again soon or contact support for VIP access inquiries.
          </p>
          <button
            onClick={() => setCurrentPage('home')}
            className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold cursor-pointer"
          >
            Return to Home
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {packages.map(pkg => (
            <div
              key={pkg.id}
              className={`relative bg-[#0f1422] rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-2 ${
                pkg.isPopular
                  ? 'border-2 border-purple-500 shadow-2xl shadow-purple-950/60'
                  : 'border border-slate-800 hover:border-slate-700'
              }`}
            >
              {pkg.isPopular && (
                <div className="absolute -top-3.5 inset-x-0 mx-auto w-fit px-3 py-0.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[11px] font-bold rounded-full uppercase tracking-wider shadow">
                  Most Popular
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-white">{pkg.name}</h3>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                    {pkg.durationDays} Days
                  </span>
                </div>
                
                <p className="text-xs text-slate-400 mb-6">{pkg.description}</p>
                
                {/* Price in BDT */}
                <div className="flex items-baseline gap-1 text-white mb-6 pb-6 border-b border-slate-800/80">
                  <span className="text-3xl sm:text-4xl font-extrabold font-mono tabular-nums">৳{pkg.priceBDT}</span>
                  <span className="text-xs text-slate-400 font-medium">BDT / {pkg.durationDays} Days</span>
                </div>

                {/* Benefits list */}
                <div className="space-y-3 text-xs text-slate-300 mb-8">
                  {pkg.benefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => handleSelectPackage(pkg)}
                className={`w-full py-3.5 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  pkg.isPopular
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-600/30'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
              >
                <span>Upgrade with {pkg.name}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Assurance Card */}
      <div className="bg-[#0b0e18] border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-300">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white mb-1">
              Manual Verification Guarantee
            </h4>
            <p className="text-slate-400 leading-relaxed max-w-xl">
              Every bKash and Nagad payment is reviewed directly by our administration against statement logs. Your account activates within 15–30 minutes of submission.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setCurrentPage('payment-verify');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold shrink-0 cursor-pointer border border-slate-700"
        >
          Already Paid? Submit TrxID
        </button>
      </div>
    </div>
  );
};
