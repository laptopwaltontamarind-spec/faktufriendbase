import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useApp } from '../context/AppContext.tsx';
import type { AppPage } from '../context/AppContext.tsx';
import { 
  Sparkles, 
  Crown, 
  User as UserIcon, 
  LogOut, 
  Menu, 
  X, 
  ShieldAlert, 
  LayoutDashboard, 
  BookOpen, 
  Zap, 
  Bell 
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAdmin, isPremium, logout } = useAuth();
  const { currentPage, setCurrentPage, settings, notifications } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  const unreadNotifs = notifications.filter(n => !n.isRead).length;

  const navigateTo = (page: AppPage) => {
    setCurrentPage(page);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const brandName = settings?.websiteName || 'Method Tricks';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#080b11]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        
        {/* Zone 1: Brand Wordmark (Single Element) */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => navigateTo('home')}
            className="flex items-center gap-2.5 text-left text-lg sm:text-xl font-bold tracking-tight text-white whitespace-nowrap cursor-pointer hover:opacity-90 transition-opacity"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 via-indigo-600 to-purple-500 flex items-center justify-center text-white shadow-md shadow-purple-600/30">
              <Zap className="w-4 h-4 fill-white" />
            </div>
            <span className="bg-gradient-to-r from-white via-slate-100 to-purple-200 bg-clip-text text-transparent">
              {brandName}
            </span>
          </button>
        </div>

        {/* Zone 2: Navigation Links (4-5 clean single-line links) */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
          <button
            onClick={() => navigateTo('home')}
            className={`whitespace-nowrap transition-colors hover:text-white cursor-pointer ${
              currentPage === 'home' ? 'text-purple-400 font-semibold' : ''
            }`}
          >
            Home
          </button>

          <button
            onClick={() => navigateTo('methods')}
            className={`whitespace-nowrap transition-colors hover:text-white cursor-pointer ${
              currentPage === 'methods' || currentPage === 'simple-methods' || currentPage === 'premium-methods'
                ? 'text-purple-400 font-semibold'
                : ''
            }`}
          >
            Methods & Tricks
          </button>

          <button
            onClick={() => navigateTo('courses')}
            className={`whitespace-nowrap transition-colors hover:text-white cursor-pointer ${
              currentPage === 'courses' || currentPage === 'simple-courses' || currentPage === 'premium-courses'
                ? 'text-purple-400 font-semibold'
                : ''
            }`}
          >
            Courses
          </button>

          <button
            onClick={() => navigateTo('packages')}
            className={`whitespace-nowrap transition-colors hover:text-white flex items-center gap-1.5 cursor-pointer ${
              currentPage === 'packages' ? 'text-purple-400 font-semibold' : ''
            }`}
          >
            <Crown className="w-3.5 h-3.5 text-purple-400" />
            <span>Premium VIP</span>
          </button>

          <button
            onClick={() => navigateTo('payment-verify')}
            className={`whitespace-nowrap transition-colors hover:text-white cursor-pointer ${
              currentPage === 'payment-verify' ? 'text-purple-400 font-semibold' : ''
            }`}
          >
            Payment Verify
          </button>
        </nav>

        {/* Zone 3: Primary Action / User Profile / Admin Switch */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          {/* Notifications Button */}
          {user && (
            <div className="relative">
              <button
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadNotifs > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-purple-500" />
                )}
              </button>

              {notifDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-[#0f1422] border border-slate-800 rounded-xl shadow-2xl p-3 z-50 animate-fade-in text-xs">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 font-semibold text-slate-200">
                    <span>Notifications</span>
                    <span className="text-slate-500">{notifications.length} total</span>
                  </div>
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {notifications.length === 0 ? (
                      <p className="text-slate-500 py-3 text-center">No notifications yet.</p>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/60">
                          <p className="font-semibold text-slate-200">{n.title}</p>
                          <p className="text-slate-400 mt-0.5">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {user ? (
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => navigateTo('dashboard')}
                className={`px-3 py-2 text-xs font-medium rounded-lg flex items-center gap-2 border transition-all cursor-pointer ${
                  currentPage === 'dashboard'
                    ? 'bg-purple-950/80 border-purple-500/50 text-purple-300'
                    : 'bg-slate-900 border-slate-800 text-slate-200 hover:border-slate-700'
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-purple-600/30 flex items-center justify-center text-purple-300">
                  <UserIcon className="w-3 h-3" />
                </div>
                <span className="max-w-[100px] truncate">{user.name}</span>
                {isPremium && !isAdmin && (
                  <span className="px-1.5 py-0.5 bg-purple-600/40 text-purple-300 text-[10px] rounded font-semibold">
                    VIP
                  </span>
                )}
              </button>

              {isAdmin && (
                <button
                  onClick={() => navigateTo('admin-dashboard')}
                  className="px-3 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg flex items-center gap-1.5 shadow-sm shadow-indigo-600/30 transition-colors cursor-pointer"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Admin Panel</span>
                </button>
              )}

              <button
                onClick={logout}
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800/60 rounded-lg transition-colors cursor-pointer"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigateTo('login')}
                className="px-3 py-2 text-xs font-medium text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                Sign In
              </button>

              <button
                onClick={() => navigateTo('register')}
                className="px-4 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 rounded-lg shadow-sm shadow-purple-600/30 transition-all cursor-pointer whitespace-nowrap"
              >
                Register Free
              </button>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex md:hidden items-center gap-2">
          {user && (
            <button
              onClick={() => navigateTo('dashboard')}
              className="p-2 text-purple-400 hover:bg-slate-800 rounded-lg"
            >
              <UserIcon className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-[#0a0d14] px-4 pt-3 pb-6 space-y-2 animate-fade-in">
          <button
            onClick={() => navigateTo('home')}
            className="w-full text-left px-3 py-2.5 rounded-lg text-sm text-slate-200 hover:bg-slate-800"
          >
            Home
          </button>
          <button
            onClick={() => navigateTo('methods')}
            className="w-full text-left px-3 py-2.5 rounded-lg text-sm text-slate-200 hover:bg-slate-800"
          >
            All Methods & Tricks
          </button>
          <button
            onClick={() => navigateTo('simple-methods')}
            className="w-full text-left px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:bg-slate-800 pl-6"
          >
            Simple Methods (Free)
          </button>
          <button
            onClick={() => navigateTo('premium-methods')}
            className="w-full text-left px-3 py-2.5 rounded-lg text-sm text-purple-400 hover:bg-slate-800 pl-6 flex items-center gap-2"
          >
            <Crown className="w-3.5 h-3.5" />
            <span>Premium Methods (VIP)</span>
          </button>

          <button
            onClick={() => navigateTo('courses')}
            className="w-full text-left px-3 py-2.5 rounded-lg text-sm text-slate-200 hover:bg-slate-800"
          >
            Courses Masterclasses
          </button>
          <button
            onClick={() => navigateTo('simple-courses')}
            className="w-full text-left px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:bg-slate-800 pl-6"
          >
            Simple Courses (Free)
          </button>
          <button
            onClick={() => navigateTo('premium-courses')}
            className="w-full text-left px-3 py-2.5 rounded-lg text-sm text-purple-400 hover:bg-slate-800 pl-6 flex items-center gap-2"
          >
            <Crown className="w-3.5 h-3.5" />
            <span>Premium Courses (VIP)</span>
          </button>

          <button
            onClick={() => navigateTo('packages')}
            className="w-full text-left px-3 py-2.5 rounded-lg text-sm text-purple-300 font-semibold hover:bg-slate-800 flex items-center gap-2"
          >
            <Crown className="w-4 h-4 text-purple-400" />
            <span>Membership Packages</span>
          </button>

          <button
            onClick={() => navigateTo('payment-verify')}
            className="w-full text-left px-3 py-2.5 rounded-lg text-sm text-slate-200 hover:bg-slate-800"
          >
            Payment Verification (bKash/Nagad)
          </button>

          <div className="pt-4 border-t border-slate-800/80 space-y-2">
            {user ? (
              <>
                <button
                  onClick={() => navigateTo('dashboard')}
                  className="w-full text-left px-3 py-2.5 rounded-lg text-sm text-slate-200 bg-slate-900 border border-slate-800 flex items-center gap-2"
                >
                  <LayoutDashboard className="w-4 h-4 text-purple-400" />
                  <span>User Dashboard</span>
                </button>
                {isAdmin && (
                  <button
                    onClick={() => navigateTo('admin-dashboard')}
                    className="w-full text-left px-3 py-2.5 rounded-lg text-sm text-white bg-indigo-600 font-semibold flex items-center gap-2"
                  >
                    <ShieldAlert className="w-4 h-4" />
                    <span>Admin Dashboard</span>
                  </button>
                )}
                <button
                  onClick={logout}
                  className="w-full text-left px-3 py-2.5 rounded-lg text-sm text-rose-400 hover:bg-rose-950/30 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => navigateTo('login')}
                  className="w-full py-2.5 text-center text-sm font-medium bg-slate-800 rounded-lg text-slate-200"
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigateTo('register')}
                  className="w-full py-2.5 text-center text-sm font-semibold bg-purple-600 rounded-lg text-white"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
