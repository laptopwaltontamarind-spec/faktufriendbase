import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { 
  CheckCircle2, 
  Copy, 
  Smartphone, 
  Upload, 
  AlertCircle, 
  Crown, 
  ArrowRight,
  ShieldCheck,
  FileCheck
} from 'lucide-react';
import { firebaseSubmitPayment } from '../lib/firebaseService.ts';

export const PaymentVerificationPage: React.FC = () => {
  const { 
    packages, 
    settings, 
    selectedPackageForPayment, 
    setSelectedPackageForPayment, 
    setCurrentPage, 
    showToast 
  } = useApp();
  
  const { user, token } = useAuth();

  const [selectedPkgId, setSelectedPkgId] = useState<string>(
    selectedPackageForPayment?.id || packages[1]?.id || packages[0]?.id || ''
  );
  
  const [paymentMethod, setPaymentMethod] = useState<'bKash' | 'Nagad'>('bKash');
  const [senderNumber, setSenderNumber] = useState<string>(user?.phone || '');
  const [transactionId, setTransactionId] = useState<string>('');
  const [fullName, setFullName] = useState<string>(user?.name || '');
  const [screenshotBase64, setScreenshotBase64] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccessfully, setSubmittedSuccessfully] = useState(false);
  const [copiedNumber, setCopiedNumber] = useState(false);

  useEffect(() => {
    if (selectedPackageForPayment) {
      setSelectedPkgId(selectedPackageForPayment.id);
    } else if (packages.length > 0 && !selectedPkgId) {
      setSelectedPkgId(packages[1]?.id || packages[0]?.id);
    }
  }, [selectedPackageForPayment, packages]);

  useEffect(() => {
    if (user) {
      if (!fullName) setFullName(user.name);
      if (!senderNumber) setSenderNumber(user.phone);
    }
  }, [user]);

  const activePackage = packages.find(p => p.id === selectedPkgId) || packages[0];

  const targetNumber = paymentMethod === 'bKash' 
    ? (settings?.bKashNumber || '01711-223344') 
    : (settings?.nagadNumber || '01811-556677');
    
  const numberType = paymentMethod === 'bKash'
    ? (settings?.bKashType || 'Personal')
    : (settings?.nagadType || 'Personal');

  const instructions = paymentMethod === 'bKash'
    ? (settings?.bKashInstructions || 'Open bKash App -> Send Money -> Enter Number -> Amount -> Enter PIN -> Copy TrxID')
    : (settings?.nagadInstructions || 'Open Nagad App -> Send Money -> Enter Number -> Amount -> Enter PIN -> Copy TrxID');

  const handleCopyNumber = () => {
    navigator.clipboard?.writeText(targetNumber.replace(/[^0-9]/g, ''));
    setCopiedNumber(true);
    showToast(`${paymentMethod} number copied!`, 'success');
    setTimeout(() => setCopiedNumber(false), 3000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      showToast('Image size must be under 15MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setScreenshotBase64(reader.result as string);
      showToast('Screenshot loaded successfully!', 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !token) {
      showToast('Please sign in or register before submitting payment', 'error');
      setCurrentPage('login');
      return;
    }

    if (!senderNumber.trim() || !transactionId.trim()) {
      showToast('Please fill in sender number and Transaction ID', 'error');
      return;
    }

    if (!activePackage) {
      showToast('Please select a membership package', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/payments/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          packageId: activePackage.id,
          method: paymentMethod,
          senderNumber: senderNumber.trim(),
          transactionId: transactionId.trim().toUpperCase(),
          screenshotUrl: screenshotBase64 || '',
          amountBDT: activePackage.priceBDT
        })
      });

      if (res.ok) {
        setSubmittedSuccessfully(true);
        showToast('Payment submitted! Awaiting Admin verification.', 'success');
        return;
      }
    } catch {
      // Fallback to Firebase directly on Static Site
    }

    try {
      await firebaseSubmitPayment({
        userId: user.id,
        userName: fullName || user.name,
        userEmail: user.email,
        userPhone: senderNumber.trim(),
        packageId: activePackage.id,
        packageName: activePackage.name,
        packageDays: activePackage.durationDays,
        amountBDT: activePackage.priceBDT,
        method: paymentMethod,
        senderNumber: senderNumber.trim(),
        transactionId: transactionId.trim().toUpperCase(),
        screenshotUrl: screenshotBase64 || ''
      });
      setSubmittedSuccessfully(true);
      showToast('Payment submitted to Firebase Cloud! Awaiting Admin verification.', 'success');
    } catch (fbErr) {
      console.error('Firebase payment submission error', fbErr);
      showToast('Failed to connect to verification server', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (submittedSuccessfully) {
    return (
      <div className="w-full min-h-screen py-16 max-w-3xl mx-auto px-4 text-center">
        <div className="bg-[#0f1422] border border-purple-500/30 rounded-2xl p-8 sm:p-12 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
            Verification Form Submitted!
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed max-w-lg mx-auto mb-6">
            Thank you! Your payment verification for <span className="text-purple-300 font-bold">{activePackage?.name}</span> (TrxID: <span className="font-mono font-bold text-white">{transactionId.toUpperCase()}</span>) is currently in queue for Admin review.
          </p>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 text-left text-xs text-slate-300 max-w-md mx-auto space-y-2 mb-8">
            <div className="flex justify-between">
              <span className="text-slate-500">Method:</span>
              <span className="font-semibold text-white">{paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Sender Number:</span>
              <span className="font-mono text-white">{senderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Amount Sent:</span>
              <span className="font-mono text-emerald-400 font-bold">৳{activePackage?.priceBDT} BDT</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Review Status:</span>
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                Pending Admin Verification
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => setCurrentPage('dashboard')}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
            >
              Go to User Dashboard
            </button>
            <button
              onClick={() => {
                setSubmittedSuccessfully(false);
                setTransactionId('');
                setScreenshotBase64('');
              }}
              className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl cursor-pointer"
            >
              Submit Another Payment
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen py-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-500/30 text-xs font-semibold text-purple-300 mb-3">
          <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
          <span>OFFICIAL PAYMENT GATEWAY</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          bKash & Nagad Payment Verification
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-2">
          Step-by-step verified checkout. Send money to our account, then submit your transaction details below.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Step 1 & 2: Payment Instructions Box (5 cols) */}
        <div className="md:col-span-5 space-y-6">
          <div className="bg-[#0f1422] border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-purple-600 text-white text-[11px] font-bold flex items-center justify-center">1</span>
              <span>Select Payment Method</span>
            </h3>

            {/* Toggle bKash / Nagad */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                type="button"
                onClick={() => setPaymentMethod('bKash')}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  paymentMethod === 'bKash'
                    ? 'bg-[#e2136e]/15 border-[#e2136e] text-white shadow-md shadow-[#e2136e]/20'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="font-bold text-sm">bKash</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Personal Send Money</div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('Nagad')}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  paymentMethod === 'Nagad'
                    ? 'bg-[#f7941d]/15 border-[#f7941d] text-white shadow-md shadow-[#f7941d]/20'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="font-bold text-sm">Nagad</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Personal Send Money</div>
              </button>
            </div>

            {/* Target Number Card */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{paymentMethod} {numberType} Number:</span>
                <span className="text-[11px] text-emerald-400 font-semibold">Active & Verified</span>
              </div>

              <div className="flex items-center justify-between bg-black/60 p-3 rounded-lg border border-slate-800">
                <span className="text-lg font-mono font-bold text-white tracking-wider">
                  {targetNumber}
                </span>
                <button
                  type="button"
                  onClick={handleCopyNumber}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedNumber ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>

              <div className="text-[11px] text-slate-400 leading-relaxed pt-1">
                <strong className="text-slate-300">Instructions:</strong> {instructions}
              </div>
            </div>

            {/* Summary of Selected Package */}
            <div className="mt-6 pt-5 border-t border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span>Selected Package:</span>
                <span className="font-bold text-white">{activePackage?.name || 'No package selected'}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-4">
                <span>Payable Amount:</span>
                <span className="text-xl font-extrabold font-mono text-purple-400 tabular-nums">
                  ৳{activePackage?.priceBDT ?? 0} BDT
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                {activePackage 
                  ? `Please make sure to send the exact amount of ৳${activePackage.priceBDT} to avoid verification delays.`
                  : 'Packages are currently being configured by administration.'}
              </p>
            </div>
          </div>
        </div>

        {/* Step 3 & 4: User Verification Submission Form (7 cols) */}
        <div className="md:col-span-7">
          <form onSubmit={handleSubmit} className="bg-[#0f1422] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-5">
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-purple-600 text-white text-[11px] font-bold flex items-center justify-center">2</span>
              <span>Submit Transaction Details</span>
            </h3>

            {!user && (
              <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-500/30 text-xs text-purple-300 flex items-center justify-between">
                <span>Please sign in or register so we can link your membership.</span>
                <button
                  type="button"
                  onClick={() => setCurrentPage('login')}
                  className="font-bold underline ml-2"
                >
                  Sign In
                </button>
              </div>
            )}

            {/* Package Picker */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Chosen Membership Package
              </label>
              <select
                value={selectedPkgId}
                onChange={(e) => setSelectedPkgId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-purple-500 cursor-pointer"
              >
                {packages.length === 0 ? (
                  <option value="">No packages configured yet</option>
                ) : (
                  packages.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} — ৳{p.priceBDT} ({p.durationDays} Days)
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 text-xs placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Sender Number */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Sender Phone Number (from which you sent money)
              </label>
              <input
                type="text"
                required
                value={senderNumber}
                onChange={(e) => setSenderNumber(e.target.value)}
                placeholder="e.g. 01700-112233"
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 text-xs placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono"
              />
            </div>

            {/* Transaction ID */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                <span>Transaction ID (TrxID)</span>
                <span className="text-[11px] text-slate-500">From SMS / App</span>
              </label>
              <input
                type="text"
                required
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value.toUpperCase())}
                placeholder="e.g. BK9A77X992"
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono font-bold tracking-wider uppercase"
              />
            </div>

            {/* Screenshot Upload */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Payment Screenshot (Optional but recommended)
              </label>
              
              <div className="border-2 border-dashed border-slate-800 hover:border-purple-500/50 rounded-xl p-4 text-center transition-colors">
                {screenshotBase64 ? (
                  <div className="relative group">
                    <img
                      src={screenshotBase64}
                      alt="Payment proof"
                      className="max-h-40 mx-auto rounded-lg object-contain"
                    />
                    <button
                      type="button"
                      onClick={() => setScreenshotBase64('')}
                      className="mt-2 text-xs text-rose-400 hover:underline"
                    >
                      Remove screenshot
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center cursor-pointer">
                    <Upload className="w-6 h-6 text-slate-500 mb-1.5" />
                    <span className="text-xs text-slate-300 font-medium">Click to upload screenshot</span>
                    <span className="text-[10px] text-slate-500 mt-0.5">JPG, PNG, WebP up to 15MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Warning Note */}
            <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-xl text-[11px] text-slate-400 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong>Strict Verification Policy:</strong> Accounts are NOT activated immediately upon form submission. Our administration verifies each TrxID against bank statements to ensure fraud prevention.
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Submitting to Admin Queue...</span>
                </>
              ) : (
                <>
                  <span>Submit Payment Verification (৳{activePackage?.priceBDT})</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
