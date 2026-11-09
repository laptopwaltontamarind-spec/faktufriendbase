/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { AppProvider, useApp } from './context/AppContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { Footer } from './components/Footer.tsx';
import { PremiumModal } from './components/PremiumModal.tsx';
import { HomePage } from './pages/HomePage.tsx';
import { MethodsPage } from './pages/MethodsPage.tsx';
import { MethodDetailPage } from './pages/MethodDetailPage.tsx';
import { CoursesPage } from './pages/CoursesPage.tsx';
import { CourseDetailPage } from './pages/CourseDetailPage.tsx';
import { PackagesPage } from './pages/PackagesPage.tsx';
import { PaymentVerificationPage } from './pages/PaymentVerificationPage.tsx';
import { LoginPage, RegisterPage } from './pages/LoginPage.tsx';
import { UserDashboardPage } from './pages/UserDashboardPage.tsx';
import { AboutPage, ContactPage, PrivacyPage, TermsPage } from './pages/StaticPages.tsx';
import { AdminLogin } from './admin/AdminLogin.tsx';
import { AdminDashboard } from './admin/AdminDashboard.tsx';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const AppContent: React.FC = () => {
  const { currentPage, toast } = useApp();

  // If in dedicated admin views, render them without standard public header/footer
  if (currentPage === 'admin-login') {
    return (
      <div className="min-h-screen bg-[#07090f] text-slate-100 flex flex-col justify-between">
        <ToastNotification toast={toast} />
        <AdminLogin />
        <PremiumModal />
      </div>
    );
  }

  if (currentPage === 'admin-dashboard') {
    return (
      <div className="min-h-screen bg-[#06080e] text-slate-100">
        <ToastNotification toast={toast} />
        <AdminDashboard />
        <PremiumModal />
      </div>
    );
  }

  // Public Layout
  return (
    <div className="min-h-screen bg-[#080b11] text-slate-100 flex flex-col justify-between selection:bg-purple-600 selection:text-white">
      <ToastNotification toast={toast} />
      
      {/* Top Navbar */}
      <Navbar />

      {/* Main Routed Page Content */}
      <main className="flex-1">
        {currentPage === 'home' && <HomePage />}
        {currentPage === 'methods' && <MethodsPage initialFilter="all" />}
        {currentPage === 'simple-methods' && <MethodsPage initialFilter="simple" />}
        {currentPage === 'premium-methods' && <MethodsPage initialFilter="premium" />}
        {currentPage === 'courses' && <CoursesPage initialFilter="all" />}
        {currentPage === 'simple-courses' && <CoursesPage initialFilter="simple" />}
        {currentPage === 'premium-courses' && <CoursesPage initialFilter="premium" />}
        {currentPage === 'method-detail' && <MethodDetailPage />}
        {currentPage === 'course-detail' && <CourseDetailPage />}
        {currentPage === 'packages' && <PackagesPage />}
        {currentPage === 'payment-verify' && <PaymentVerificationPage />}
        {currentPage === 'login' && <LoginPage />}
        {currentPage === 'register' && <RegisterPage />}
        {currentPage === 'dashboard' && <UserDashboardPage />}
        {currentPage === 'about' && <AboutPage />}
        {currentPage === 'contact' && <ContactPage />}
        {currentPage === 'privacy' && <PrivacyPage />}
        {currentPage === 'terms' && <TermsPage />}
      </main>

      {/* Footer */}
      <Footer />

      {/* Universal Premium Lock Gate Modal */}
      <PremiumModal />
    </div>
  );
};

// Global Toast Banner
const ToastNotification: React.FC<{ toast: { message: string; type: 'success' | 'error' | 'info' } | null }> = ({ toast }) => {
  if (!toast) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-bounce-short">
      <div className={`px-4 py-3 rounded-xl border shadow-2xl flex items-center gap-2.5 text-xs font-semibold backdrop-blur-md ${
        toast.type === 'success' 
          ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-300' 
          : toast.type === 'error' 
            ? 'bg-rose-950/90 border-rose-500/40 text-rose-300' 
            : 'bg-slate-900/90 border-slate-700 text-slate-200'
      }`}>
        {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
        {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
        {toast.type === 'info' && <Info className="w-4 h-4 text-purple-400 shrink-0" />}
        <span>{toast.message}</span>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </AuthProvider>
  );
}
