import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useApp } from '../context/AppContext.tsx';
import { 
  User as UserIcon, 
  Crown, 
  Sparkles, 
  BookOpen, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  Bell, 
  Settings, 
  CreditCard, 
  ArrowRight,
  ShieldCheck,
  Play
} from 'lucide-react';
import type { PaymentSubmission } from '../types/index.ts';

export const UserDashboardPage: React.FC = () => {
  const { user, isPremium, updateProfile, token } = useAuth();
  const { setCurrentPage, methods, courses, openMethodDetail, openCourseDetail, notifications, showToast } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'courses' | 'methods' | 'payments' | 'downloads' | 'notifications' | 'settings'>('overview');
  const [payments, setPayments] = useState<PaymentSubmission[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);

  // Profile update form state
  const [editName, setEditName] = useState(user?.name || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  useEffect(() => {
    if (user) {
      setEditName(user.name);
      setEditPhone(user.phone);
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      fetchMyPayments();
    }
  }, [token]);

  const fetchMyPayments = async () => {
    setLoadingPayments(true);
    try {
      const res = await fetch('/api/payments/my', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPayments(data);
      }
    } catch (err) {
      console.error('Failed to load user payments', err);
    } finally {
      setLoadingPayments(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingProfile(true);
    const res = await updateProfile({
      name: editName,
      phone: editPhone,
      currentPassword: currentPass || undefined,
      newPassword: newPass || undefined
    });
    setUpdatingProfile(false);

    if (res.success) {
      showToast('Profile updated successfully!', 'success');
      setCurrentPass('');
      setNewPass('');
    } else {
      showToast(res.error || 'Failed to update profile', 'error');
    }
  };

  if (!user) {
    return (
      <div className="w-full min-h-[70vh] flex flex-col items-center justify-center text-center p-4">
        <h2 className="text-xl font-bold text-white mb-2">Please Sign In</h2>
        <p className="text-slate-400 text-xs mb-4">You need an active session to view your user dashboard.</p>
        <button
          onClick={() => setCurrentPage('login')}
          className="px-5 py-2.5 bg-purple-600 text-white text-xs font-semibold rounded-xl"
        >
          Sign In Now
        </button>
      </div>
    );
  }

  const membershipLabel = user.role === 'admin' 
    ? 'System Administrator' 
    : user.role === 'premium' 
      ? 'Premium VIP Member' 
      : 'Simple (Free) Member';

  const userNotifications = notifications.filter(n => !n.userId || n.userId === user.id);

  return (
    <div className="w-full min-h-screen py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Top Welcome Header */}
      <div className="bg-gradient-to-r from-[#12112b] via-[#0f1424] to-[#0a0d18] border border-purple-500/20 rounded-2xl p-6 sm:p-8 mb-8 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-purple-600/30">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Welcome back, {user.name}!
                </h1>
                <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  isPremium 
                    ? 'bg-purple-950/90 border border-purple-500/40 text-purple-300' 
                    : 'bg-slate-800 text-slate-300'
                }`}>
                  {membershipLabel}
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-2">
                <span>Member since: {new Date(user.createdAt).toLocaleDateString()}</span>
                <span>·</span>
                <span className="font-mono text-slate-300">{user.email}</span>
              </p>
            </div>
          </div>

          {/* Quick Upgrade / Expiry status */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {isPremium && user.premiumExpiresAt ? (
              <div className="p-3 bg-purple-950/40 border border-purple-500/30 rounded-xl text-left">
                <div className="text-[10px] text-purple-400 uppercase font-semibold">VIP Expiration Date</div>
                <div className="text-sm font-bold text-white font-mono tabular-nums">
                  {new Date(user.premiumExpiresAt).toLocaleDateString()}
                </div>
              </div>
            ) : !isPremium ? (
              <button
                onClick={() => {
                  setCurrentPage('packages');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-purple-600/30 flex items-center gap-2 transition-all cursor-pointer"
              >
                <Crown className="w-4 h-4" />
                <span>Upgrade to Premium</span>
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Dashboard Sub-navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3 mb-8 overflow-x-auto text-xs font-semibold text-slate-400">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3 py-2 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'overview' ? 'bg-purple-600 text-white' : 'hover:text-white hover:bg-slate-900'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('courses')}
          className={`px-3 py-2 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'courses' ? 'bg-purple-600 text-white' : 'hover:text-white hover:bg-slate-900'
          }`}
        >
          My Courses ({courses.length})
        </button>
        <button
          onClick={() => setActiveTab('methods')}
          className={`px-3 py-2 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'methods' ? 'bg-purple-600 text-white' : 'hover:text-white hover:bg-slate-900'
          }`}
        >
          Methods Library ({methods.length})
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`px-3 py-2 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'payments' ? 'bg-purple-600 text-white' : 'hover:text-white hover:bg-slate-900'
          }`}
        >
          Payment History ({payments.length})
        </button>
        <button
          onClick={() => setActiveTab('downloads')}
          className={`px-3 py-2 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'downloads' ? 'bg-purple-600 text-white' : 'hover:text-white hover:bg-slate-900'
          }`}
        >
          Downloads ({user.downloadHistory?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-3 py-2 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'notifications' ? 'bg-purple-600 text-white' : 'hover:text-white hover:bg-slate-900'
          }`}
        >
          Notifications ({userNotifications.length})
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-3 py-2 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'settings' ? 'bg-purple-600 text-white' : 'hover:text-white hover:bg-slate-900'
          }`}
        >
          Account Settings
        </button>
      </div>

      {/* TAB CONTENT */}

      {/* 1. OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Quick Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-xl bg-[#0f1422] border border-slate-800">
              <div className="text-slate-400 text-xs mb-1">Membership Status</div>
              <div className="text-lg font-bold text-white flex items-center gap-1.5">
                {isPremium && <Crown className="w-4 h-4 text-purple-400" />}
                <span>{user.role.toUpperCase()}</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {isPremium ? 'Unlimited video & download access' : 'Free tier (ad-supported)'}
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[#0f1422] border border-slate-800">
              <div className="text-slate-400 text-xs mb-1">Available Methods</div>
              <div className="text-2xl font-bold font-mono text-white tabular-nums">
                {methods.length}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {methods.filter(m => m.type === 'simple').length} Free · {methods.filter(m => m.type === 'premium').length} VIP
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[#0f1422] border border-slate-800">
              <div className="text-slate-400 text-xs mb-1">Active Courses</div>
              <div className="text-2xl font-bold font-mono text-white tabular-nums">
                {courses.length}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Multi-lesson curriculums</p>
            </div>

            <div className="p-5 rounded-xl bg-[#0f1422] border border-slate-800">
              <div className="text-slate-400 text-xs mb-1">Payment Submissions</div>
              <div className="text-2xl font-bold font-mono text-white tabular-nums">
                {payments.length}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {payments.filter(p => p.status === 'approved').length} approved
              </p>
            </div>
          </div>

          {/* Recent Notifications & Upgrade Banner */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 bg-[#0f1422] border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Bell className="w-4 h-4 text-purple-400" />
                  <span>Recent Announcements & Alerts</span>
                </h3>
                <button
                  onClick={() => setActiveTab('notifications')}
                  className="text-xs text-purple-400 hover:underline"
                >
                  View All
                </button>
              </div>

              <div className="space-y-3">
                {userNotifications.slice(0, 3).map(n => (
                  <div key={n.id} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-xs text-slate-200">{n.title}</span>
                      <span className="text-[10px] text-slate-500">{new Date(n.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs text-slate-400">{n.message}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Account Quick Card */}
            <div className="lg:col-span-4 bg-[#0f1422] border border-slate-800 rounded-2xl p-6">
              <h3 className="text-sm font-bold text-white mb-4">Account Snapshot</h3>
              <div className="space-y-3 text-xs text-slate-300">
                <div className="flex justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-500">Full Name</span>
                  <span className="font-medium text-white">{user.name}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-500">Phone</span>
                  <span className="font-mono text-white">{user.phone}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-500">Role</span>
                  <span className="font-semibold text-purple-300">{membershipLabel}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-500">Account Status</span>
                  <span className="text-emerald-400 font-semibold uppercase">{user.status}</span>
                </div>
              </div>

              {!isPremium && (
                <button
                  onClick={() => {
                    setCurrentPage('packages');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="w-full mt-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Get VIP Membership
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. MY COURSES */}
      {activeTab === 'courses' && (
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-white">All Masterclass Courses</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {courses.map(c => (
              <div
                key={c.id}
                onClick={() => openCourseDetail(c.id)}
                className="bg-[#0f1422] border border-slate-800 hover:border-slate-700 rounded-xl p-4 flex gap-4 cursor-pointer group transition-all"
              >
                <div className="relative w-32 aspect-video bg-slate-900 rounded-lg overflow-hidden shrink-0">
                  <img src={c.thumbnailUrl} alt={c.title} className="w-full h-full object-cover" />
                  {c.type === 'premium' && (
                    <div className="absolute top-1 right-1 p-0.5 rounded bg-black/80 text-purple-400">
                      <Crown className="w-3 h-3" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] text-purple-400 font-semibold uppercase tracking-wider">{c.category}</span>
                  <h4 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-1 mt-0.5">
                    {c.title}
                  </h4>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1">{c.description}</p>
                  <div className="mt-2 text-[11px] text-slate-500 font-mono">
                    {c.lessons.length} lessons · {c.totalDuration}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. MY METHODS */}
      {activeTab === 'methods' && (
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-white">Available Methods & Tricks</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {methods.map(m => (
              <div
                key={m.id}
                onClick={() => openMethodDetail(m.id)}
                className="bg-[#0f1422] border border-slate-800 hover:border-slate-700 rounded-xl overflow-hidden cursor-pointer group transition-all"
              >
                <div className="relative aspect-video w-full bg-slate-900 overflow-hidden">
                  <img src={m.thumbnailUrl} alt={m.title} className="w-full h-full object-cover" />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    m.type === 'premium' ? 'bg-purple-950/80 text-purple-300' : 'bg-emerald-950/80 text-emerald-300'
                  }">
                    {m.type === 'premium' ? 'VIP' : 'FREE'}
                  </div>
                </div>
                <div className="p-4">
                  <div className="text-[10px] text-slate-500 mb-1">{m.category}</div>
                  <h4 className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-2">
                    {m.title}
                  </h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. PAYMENT HISTORY */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">My Payment History</h3>
            <button
              onClick={() => {
                setCurrentPage('payment-verify');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs rounded-xl"
            >
              Submit New Payment
            </button>
          </div>

          {loadingPayments ? (
            <div className="py-12 text-center text-slate-400">Loading payment records...</div>
          ) : payments.length === 0 ? (
            <div className="p-8 bg-[#0f1422] border border-slate-800 rounded-2xl text-center text-xs text-slate-400">
              <p>No payment submissions found.</p>
            </div>
          ) : (
            <div className="bg-[#0f1422] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900/80 border-b border-slate-800 text-[11px] text-slate-400 uppercase font-mono">
                    <tr>
                      <th className="p-3.5">Package</th>
                      <th className="p-3.5">Method</th>
                      <th className="p-3.5">Sender Number</th>
                      <th className="p-3.5">Transaction ID</th>
                      <th className="p-3.5">Amount (BDT)</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5">Submitted</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {payments.map(p => (
                      <tr key={p.id} className="hover:bg-slate-900/50">
                        <td className="p-3.5 font-bold text-white">{p.packageName}</td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded font-semibold text-[10px] ${
                            p.method === 'bKash' ? 'bg-[#e2136e]/20 text-[#e2136e]' : 'bg-[#f7941d]/20 text-[#f7941d]'
                          }`}>
                            {p.method}
                          </span>
                        </td>
                        <td className="p-3.5 font-mono text-slate-300">{p.senderNumber}</td>
                        <td className="p-3.5 font-mono font-bold text-white">{p.transactionId}</td>
                        <td className="p-3.5 font-mono font-bold text-emerald-400 tabular-nums">৳{p.amountBDT}</td>
                        <td className="p-3.5">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                            p.status === 'approved' 
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' 
                              : p.status === 'rejected' 
                                ? 'bg-rose-950 text-rose-400 border border-rose-500/30' 
                                : 'bg-amber-950 text-amber-400 border border-amber-500/30'
                          }`}>
                            {p.status}
                          </span>
                          {p.rejectionReason && (
                            <p className="text-[10px] text-rose-400 mt-1 max-w-xs">{p.rejectionReason}</p>
                          )}
                        </td>
                        <td className="p-3.5 text-slate-500 font-mono text-[11px]">
                          {new Date(p.submittedAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. DOWNLOADS */}
      {activeTab === 'downloads' && (
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-white">Downloaded Files & Assets</h3>
          {(!user.downloadHistory || user.downloadHistory.length === 0) ? (
            <div className="p-8 bg-[#0f1422] border border-slate-800 rounded-2xl text-center text-xs text-slate-400">
              <Download className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p>No downloads recorded yet. Start downloading resources from methods or courses!</p>
            </div>
          ) : (
            <div className="bg-[#0f1422] border border-slate-800 rounded-2xl p-6 space-y-3">
              {user.downloadHistory.map((itemKey, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                  <span className="font-mono text-purple-300">Resource Asset #{itemKey}</span>
                  <span className="text-slate-500">Authorized Download</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 6. NOTIFICATIONS */}
      {activeTab === 'notifications' && (
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-white">Notifications & Updates</h3>
          <div className="space-y-3">
            {userNotifications.map(n => (
              <div key={n.id} className="p-4 rounded-xl bg-[#0f1422] border border-slate-800">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-semibold text-sm text-white">{n.title}</h4>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(n.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{n.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. SETTINGS */}
      {activeTab === 'settings' && (
        <div className="max-w-xl bg-[#0f1422] border border-slate-800 rounded-2xl p-6 sm:p-8">
          <h3 className="text-base font-bold text-white mb-4">Edit Profile & Password</h3>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
              <input
                type="text"
                required
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Phone Number</label>
              <input
                type="tel"
                required
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white font-mono"
              />
            </div>

            <div className="pt-4 border-t border-slate-800">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                Change Password (Optional)
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Current Password</label>
                  <input
                    type="password"
                    value={currentPass}
                    onChange={(e) => setCurrentPass(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">New Password</label>
                  <input
                    type="password"
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={updatingProfile}
              className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs rounded-xl shadow-lg transition-all cursor-pointer"
            >
              {updatingProfile ? 'Saving Changes...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>
      )}

    </div>
  );
};
