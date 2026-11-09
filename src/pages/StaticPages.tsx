import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { ShieldCheck, Mail, Phone, MapPin, Send, Zap, BookOpen, Crown } from 'lucide-react';

export const AboutPage: React.FC = () => {
  const { settings, setCurrentPage } = useApp();
  const brandName = settings?.websiteName || 'Method Tricks';

  return (
    <div className="w-full min-h-screen py-14 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-500/30 text-xs font-semibold text-purple-300 mb-3">
          <Zap className="w-3.5 h-3.5 text-purple-400" />
          <span>ABOUT METHOD TRICKS</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Empowering Practical Digital Knowledge
        </h1>
        <p className="text-slate-400 text-sm mt-3 leading-relaxed">
          The ultimate knowledge hub built for freelancers, developers, media buyers, and tech enthusiasts.
        </p>
      </div>

      <div className="bg-[#0f1422] border border-slate-800 rounded-2xl p-8 sm:p-12 shadow-2xl space-y-8 text-slate-300 text-sm leading-relaxed">
        <div>
          <h2 className="text-xl font-bold text-white mb-3">Our Mission</h2>
          <p>
            {settings?.aboutText || 'Method Tricks was established to bridge the gap between academic theory and real-world execution. We curate battle-tested methods, productivity hacks, and modern technical courses that allow digital creators to earn, build, and optimize with confidence.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-800">
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
            <div className="w-10 h-10 rounded-lg bg-purple-600/20 text-purple-400 flex items-center justify-center font-bold mb-3">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white mb-1">Simple (Free) Methods</h3>
            <p className="text-xs text-slate-400">
              High-value beginner guides and open resources available to everyone at zero cost.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
            <div className="w-10 h-10 rounded-lg bg-purple-600/20 text-purple-400 flex items-center justify-center font-bold mb-3">
              <Crown className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white mb-1">Premium VIP Blueprints</h3>
            <p className="text-xs text-slate-400">
              Uncut agency workflows, private scripts, and full masterclasses reserved for verified members.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
            <div className="w-10 h-10 rounded-lg bg-purple-600/20 text-purple-400 flex items-center justify-center font-bold mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white mb-1">Verified Security</h3>
            <p className="text-xs text-slate-400">
              Direct bKash and Nagad payments with manual administrative verification.
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-white">Ready to elevate your skill set?</h4>
            <p className="text-xs text-slate-400">Join thousands of learners on Method Tricks today.</p>
          </div>
          <button
            onClick={() => {
              setCurrentPage('packages');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs rounded-xl shadow-lg"
          >
            Explore VIP Packages
          </button>
        </div>
      </div>
    </div>
  );
};

export const ContactPage: React.FC = () => {
  const { settings, showToast } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    showToast('Your message has been sent to support!', 'success');
  };

  return (
    <div className="w-full min-h-screen py-14 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-500/30 text-xs font-semibold text-purple-300 mb-3">
          <Mail className="w-3.5 h-3.5 text-purple-400" />
          <span>DIRECT SUPPORT</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Get in Touch with Us
        </h1>
        <p className="text-slate-400 text-sm mt-3 leading-relaxed">
          Questions regarding payment verification, course access, or enterprise partnerships?
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-5 space-y-6">
          <div className="bg-[#0f1422] border border-slate-800 rounded-2xl p-6 space-y-6 text-xs text-slate-300 shadow-xl">
            <h3 className="text-sm font-bold text-white">Contact Information</h3>

            <div className="flex items-start gap-3">
              <Mail className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-white">Official Email</p>
                <p className="text-slate-400">{settings?.contactEmail || 'support@methodtricks.com'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-white">Helpline Phone</p>
                <p className="text-slate-400 font-mono">{settings?.contactPhone || '+880 1711-000000'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-white">Location</p>
                <p className="text-slate-400">{settings?.contactAddress || 'Dhaka, Bangladesh'}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <p className="font-semibold text-white mb-1">Telegram Community</p>
              <a
                href={settings?.telegramChannel || '#'}
                target="_blank"
                rel="noreferrer"
                className="text-purple-400 hover:underline"
              >
                {settings?.telegramChannel || 'https://t.me/methodtricks_bd'}
              </a>
            </div>
          </div>
        </div>

        <div className="md:col-span-7">
          <div className="bg-[#0f1422] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
            {sent ? (
              <div className="text-center py-10 space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <Send className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">Message Received!</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Our admin team will review your inquiry and reply via email within 24 hours.
                </p>
                <button
                  onClick={() => setSent(false)}
                  className="mt-4 px-4 py-2 bg-slate-800 text-xs text-slate-300 rounded-lg hover:bg-slate-700"
                >
                  Send another inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="text-sm font-bold text-white mb-2">Send an Inquiry</h3>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Your Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Subject</label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Payment Verification Assistance"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Message</label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write your detailed query..."
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs rounded-xl shadow-lg transition-all"
                >
                  Submit Inquiry
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const PrivacyPage: React.FC = () => {
  const { settings } = useApp();
  const brandName = settings?.websiteName || 'Method Tricks';

  return (
    <div className="w-full min-h-screen py-14 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold text-white mb-2">Privacy Policy</h1>
      <p className="text-xs text-slate-400 mb-8 font-mono">Last updated: February 2026</p>

      <div className="bg-[#0f1422] border border-slate-800 rounded-2xl p-8 space-y-6 text-slate-300 text-xs sm:text-sm leading-relaxed">
        <p>{settings?.privacyPolicy}</p>

        <h3 className="text-base font-bold text-white mt-4">1. Information We Collect</h3>
        <p>
          When you register on {brandName}, we collect your full name, email address, and contact phone number. When you submit payment verifications for bKash or Nagad, we collect transaction IDs, sender numbers, and payment screenshots solely to verify authorization.
        </p>

        <h3 className="text-base font-bold text-white mt-4">2. Zero Unauthorized Sharing</h3>
        <p>
          We never sell, rent, or trade your personal information, phone numbers, or payment proof to third-party marketing entities.
        </p>

        <h3 className="text-base font-bold text-white mt-4">3. Premium Ad-Free Privacy</h3>
        <p>
          For our Premium Members, third-party advertising scripts and banner trackers are completely disabled across all devices and pages.
        </p>
      </div>
    </div>
  );
};

export const TermsPage: React.FC = () => {
  const { settings } = useApp();
  const brandName = settings?.websiteName || 'Method Tricks';

  return (
    <div className="w-full min-h-screen py-14 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold text-white mb-2">Terms & Conditions</h1>
      <p className="text-xs text-slate-400 mb-8 font-mono">Last updated: February 2026</p>

      <div className="bg-[#0f1422] border border-slate-800 rounded-2xl p-8 space-y-6 text-slate-300 text-xs sm:text-sm leading-relaxed">
        <p>{settings?.termsAndConditions}</p>

        <h3 className="text-base font-bold text-white mt-4">1. Educational Scope</h3>
        <p>
          All methods, tricks, automation scripts, and courses published on {brandName} are intended exclusively for educational, technical, and digital marketing skill enhancement. Users agree to utilize this knowledge within compliance of applicable laws.
        </p>

        <h3 className="text-base font-bold text-white mt-4">2. Account Sharing Prohibition</h3>
        <p>
          Premium VIP memberships are licensed strictly to a single individual. Reselling, bulk redistributing, or sharing account credentials will result in instantaneous permanent termination without refund.
        </p>

        <h3 className="text-base font-bold text-white mt-4">3. Payment Verification Clause</h3>
        <p>
          Submitting false or fabricated Transaction IDs (TrxIDs) or altered payment screenshots is strictly prohibited and leads to immediate account blacklisting.
        </p>
      </div>
    </div>
  );
};
