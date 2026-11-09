import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useApp } from '../context/AppContext.tsx';
import type { 
  MethodItem, 
  CourseItem, 
  User, 
  PaymentSubmission, 
  Advertisement, 
  WebsiteSettings,
  Lesson,
  MembershipPackage 
} from '../types/index.ts';
import { 
  LayoutDashboard, 
  FileVideo, 
  Crown, 
  GraduationCap, 
  Users, 
  CreditCard, 
  Settings, 
  Megaphone, 
  Sliders, 
  Bell, 
  BarChart3, 
  Plus, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  Search, 
  ExternalLink, 
  Eye, 
  Upload, 
  Clock, 
  ShieldCheck, 
  ShieldAlert, 
  DollarSign, 
  TrendingUp, 
  LogOut, 
  Home, 
  Database,
  ArrowUpRight,
  Info,
  Tag,
  Coins,
  DownloadCloud,
  UploadCloud,
  Sparkles
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user, isAdmin, token, logout } = useAuth();
  const { setCurrentPage, showToast, refreshSettings } = useApp();

  type AdminTab = 
    | 'overview' 
    | 'packages'
    | 'simple-methods' 
    | 'premium-methods' 
    | 'simple-courses' 
    | 'premium-courses' 
    | 'users' 
    | 'payment-requests' 
    | 'payment-settings' 
    | 'ads' 
    | 'website-settings' 
    | 'notifications' 
    | 'analytics';

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  // Server data states
  const [analytics, setAnalytics] = useState<any>(null);
  const [methods, setMethods] = useState<MethodItem[]>([]);
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [packagesList, setPackagesList] = useState<MembershipPackage[]>([]);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [paymentsList, setPaymentsList] = useState<PaymentSubmission[]>([]);
  const [adsList, setAdsList] = useState<Advertisement[]>([]);
  const [adminSettings, setAdminSettings] = useState<WebsiteSettings | null>(null);

  // Modals
  const [packageModalOpen, setPackageModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Partial<MembershipPackage> | null>(null);
  const [newBenefitText, setNewBenefitText] = useState('');

  const [methodModalOpen, setMethodModalOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<Partial<MethodItem> | null>(null);
  
  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Partial<CourseItem> | null>(null);
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonDuration, setNewLessonDuration] = useState('25 mins');
  const [newLessonVideoUrl, setNewLessonVideoUrl] = useState('');

  const [adModalOpen, setAdModalOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<Partial<Advertisement> | null>(null);

  const [screenshotModalImg, setScreenshotModalImg] = useState<string | null>(null);
  const [rejectionModalPayment, setRejectionModalPayment] = useState<PaymentSubmission | null>(null);
  const [rejectionReason, setRejectionReason] = useState('Transaction ID not found in mobile banking statement.');

  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastType, setBroadcastType] = useState<'info' | 'success' | 'warning'>('info');

  const [userSearch, setUserSearch] = useState('');
  const [firebaseGuideOpen, setFirebaseGuideOpen] = useState(false);
  const restoreFileRef = useRef<HTMLInputElement | null>(null);

  // Fetch all admin data
  const loadAdminData = async () => {
    if (!token) return;
    try {
      const headers = { Authorization: `Bearer ${token}` };
      
      const [anRes, mRes, cRes, uRes, pRes, adRes, sRes, pkgRes] = await Promise.all([
        fetch('/api/admin/analytics', { headers }),
        fetch('/api/methods', { headers }),
        fetch('/api/courses', { headers }),
        fetch('/api/admin/users', { headers }),
        fetch('/api/payments', { headers }),
        fetch('/api/admin/ads', { headers }),
        fetch('/api/settings'),
        fetch('/api/packages')
      ]);

      if (anRes.ok) setAnalytics(await anRes.json());
      if (mRes.ok) setMethods(await mRes.json());
      if (cRes.ok) setCourses(await cRes.json());
      if (uRes.ok) setUsersList(await uRes.json());
      if (pRes.ok) setPaymentsList(await pRes.json());
      if (adRes.ok) setAdsList(await adRes.json());
      if (sRes.ok) setAdminSettings(await sRes.json());
      if (pkgRes.ok) setPackagesList(await pkgRes.json());
    } catch (err) {
      console.error('Failed to load admin dataset', err);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, [token]);

  if (!isAdmin) {
    return (
      <div className="w-full min-h-[70vh] flex flex-col items-center justify-center text-center p-4">
        <ShieldAlert className="w-12 h-12 text-rose-500 mb-3" />
        <h2 className="text-xl font-bold text-white mb-2">Restricted Access</h2>
        <p className="text-slate-400 text-xs mb-4">You must be logged in as an administrator to view this console.</p>
        <button
          onClick={() => setCurrentPage('admin-login')}
          className="px-5 py-2.5 bg-indigo-600 text-white text-xs font-semibold rounded-xl"
        >
          Go to Admin Sign In
        </button>
      </div>
    );
  }

  // --- PACKAGE & PRICING HANDLERS ---
  const handleSavePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPackage?.name || !editingPackage?.priceBDT || !editingPackage?.durationDays) {
      showToast('Name, price in BDT (৳), and duration in days are required!', 'error');
      return;
    }
    try {
      const isEdit = Boolean(editingPackage.id);
      const url = isEdit ? `/api/packages/${editingPackage.id}` : '/api/packages';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...editingPackage,
          priceBDT: Number(editingPackage.priceBDT),
          durationDays: Number(editingPackage.durationDays),
          benefits: editingPackage.benefits && editingPackage.benefits.length > 0 
            ? editingPackage.benefits 
            : ['All Premium Methods Unlocked', 'Zero Ads Guaranteed', 'Direct High-Speed Downloads']
        })
      });

      if (res.ok) {
        showToast(isEdit ? 'Package updated successfully!' : 'New Package created!', 'success');
        setPackageModalOpen(false);
        setEditingPackage(null);
        setNewBenefitText('');
        loadAdminData();
      } else {
        const errData = await res.json();
        showToast(errData.error || 'Failed to save package', 'error');
      }
    } catch {
      showToast('Network error saving package', 'error');
    }
  };

  const handleDeletePackage = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this package?')) return;
    try {
      const res = await fetch(`/api/packages/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        showToast('Package removed successfully.', 'info');
        loadAdminData();
      } else {
        showToast('Failed to delete package', 'error');
      }
    } catch {
      showToast('Network error deleting package', 'error');
    }
  };

  const handleGenerateDefaultPackageTiers = async () => {
    const defaultTiers = [
      {
        name: '7 Days Trial Pass',
        durationDays: 7,
        priceBDT: 300,
        description: 'Quick trial access to unlock all premium methods & courses.',
        benefits: ['Access All VIP Methods', 'Access All Premium Courses', 'Fast Direct File Downloads', 'Zero Advertisements'],
        isActive: true,
        isPopular: false
      },
      {
        name: '30 Days Monthly Pass',
        durationDays: 30,
        priceBDT: 850,
        description: 'Our most popular monthly VIP plan for active learners.',
        benefits: ['Access All VIP Methods', 'Access All Premium Courses', 'Unlimited Direct Downloads', 'Zero Advertisements', 'Weekly New Content Updates'],
        isActive: true,
        isPopular: true
      },
      {
        name: '90 Days Quarterly Pass',
        durationDays: 90,
        priceBDT: 2200,
        description: '3 months full access with high discount.',
        benefits: ['Access All VIP Methods', 'Access All Premium Courses', 'Unlimited Direct Downloads', 'Zero Advertisements', 'Priority Member Support'],
        isActive: true,
        isPopular: false
      },
      {
        name: '365 Days Annual VIP Pass',
        durationDays: 365,
        priceBDT: 5000,
        description: '1 full year unlimited mastery pass with greatest value.',
        benefits: ['Access All VIP Methods for 1 Year', 'All Present & Future Premium Courses', 'Fastest High-Speed Mirrors', 'Ad-Free VIP Experience', 'Direct Admin WhatsApp Support'],
        isActive: true,
        isPopular: false
      }
    ];

    try {
      for (const tier of defaultTiers) {
        await fetch('/api/packages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(tier)
        });
      }
      showToast('Created 7, 30, 90, 365 Days slots! You can now adjust their prices anytime.', 'success');
      loadAdminData();
    } catch {
      showToast('Failed to generate template packages', 'error');
    }
  };

  // --- DATABASE BACKUP & RESTORE ---
  const handleDownloadBackup = async () => {
    try {
      const res = await fetch('/api/admin/backup', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Backup failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `methodtricks_database_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      showToast('Full Database Backup JSON downloaded safely!', 'success');
    } catch {
      showToast('Failed to download backup', 'error');
    }
  };

  const handleRestoreBackupFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm('Warning: Restoring will overwrite the current database with this backup file. Proceed?')) {
      e.target.value = '';
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        try {
          const jsonContent = JSON.parse(evt.target?.result as string);
          const res = await fetch('/api/admin/restore', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(jsonContent)
          });
          if (res.ok) {
            showToast('Database restored successfully from backup!', 'success');
            loadAdminData();
          } else {
            showToast('Failed to restore database from backup file', 'error');
          }
        } catch {
          showToast('Invalid backup JSON file format', 'error');
        }
      };
      reader.readAsText(file);
    } catch {
      showToast('Error reading backup file', 'error');
    } finally {
      e.target.value = '';
    }
  };

  // --- METHOD HANDLERS ---
  const handleSaveMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMethod?.title) return;
    try {
      const isEdit = Boolean(editingMethod.id);
      const url = isEdit ? `/api/methods/${editingMethod.id}` : '/api/methods';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(editingMethod)
      });

      if (res.ok) {
        showToast(isEdit ? 'Method updated successfully!' : 'New Method uploaded!', 'success');
        setMethodModalOpen(false);
        setEditingMethod(null);
        loadAdminData();
      } else {
        showToast('Failed to save method', 'error');
      }
    } catch {
      showToast('Network error saving method', 'error');
    }
  };

  const handleDeleteMethod = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this method?')) return;
    try {
      const res = await fetch(`/api/methods/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        showToast('Method deleted.', 'info');
        loadAdminData();
      }
    } catch {
      showToast('Failed to delete method', 'error');
    }
  };

  // --- COURSE HANDLERS ---
  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse?.title) return;
    try {
      const isEdit = Boolean(editingCourse.id);
      const url = isEdit ? `/api/courses/${editingCourse.id}` : '/api/courses';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(editingCourse)
      });

      if (res.ok) {
        showToast(isEdit ? 'Course updated successfully!' : 'New Course created!', 'success');
        setCourseModalOpen(false);
        setEditingCourse(null);
        loadAdminData();
      } else {
        showToast('Failed to save course', 'error');
      }
    } catch {
      showToast('Network error saving course', 'error');
    }
  };

  const handleDeleteCourse = async (id: string) => {
    if (!confirm('Are you sure you want to delete this course and all its lessons?')) return;
    try {
      const res = await fetch(`/api/courses/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        showToast('Course deleted.', 'info');
        loadAdminData();
      }
    } catch {
      showToast('Failed to delete course', 'error');
    }
  };

  const handleAddLessonToEditingCourse = () => {
    if (!newLessonTitle.trim()) return;
    const newLesson: Lesson = {
      id: 'l_' + Date.now(),
      title: newLessonTitle.trim(),
      duration: newLessonDuration.trim(),
      videoUrl: newLessonVideoUrl.trim() || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      description: 'Module lesson content',
      order: (editingCourse?.lessons?.length || 0) + 1
    };
    setEditingCourse(prev => ({
      ...prev,
      lessons: [...(prev?.lessons || []), newLesson]
    }));
    setNewLessonTitle('');
    setNewLessonVideoUrl('');
  };

  const handleRemoveLesson = (lessonId: string) => {
    setEditingCourse(prev => ({
      ...prev,
      lessons: (prev?.lessons || []).filter(l => l.id !== lessonId)
    }));
  };

  // --- PAYMENT APPROVE / REJECT HANDLERS ---
  const handleReviewPayment = async (id: string, status: 'approved' | 'rejected', reason?: string) => {
    try {
      const res = await fetch(`/api/payments/${id}/review`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status, rejectionReason: reason })
      });

      if (res.ok) {
        showToast(status === 'approved' ? 'Payment Approved! Premium VIP Activated for user.' : 'Payment Rejected.', status === 'approved' ? 'success' : 'info');
        setRejectionModalPayment(null);
        loadAdminData();
      } else {
        showToast('Failed to update payment status', 'error');
      }
    } catch {
      showToast('Network error reviewing payment', 'error');
    }
  };

  // --- USER ROLE & STATUS HANDLERS ---
  const handleUpdateUser = async (userId: string, data: Partial<User>) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        showToast('User record updated!', 'success');
        loadAdminData();
      }
    } catch {
      showToast('Failed to update user', 'error');
    }
  };

  // --- ADVERTISEMENT HANDLERS ---
  const handleSaveAd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAd?.title) return;
    try {
      const isEdit = Boolean(editingAd.id);
      const url = isEdit ? `/api/admin/ads/${editingAd.id}` : '/api/admin/ads';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(editingAd)
      });

      if (res.ok) {
        showToast('Advertisement saved!', 'success');
        setAdModalOpen(false);
        setEditingAd(null);
        loadAdminData();
      }
    } catch {
      showToast('Failed to save advertisement', 'error');
    }
  };

  const handleDeleteAd = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/ads/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        showToast('Ad deleted', 'info');
        loadAdminData();
      }
    } catch {
      showToast('Failed to delete ad', 'error');
    }
  };

  // --- SETTINGS SAVE ---
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminSettings) return;
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(adminSettings)
      });
      if (res.ok) {
        showToast('Website Settings saved! Public site updated immediately.', 'success');
        refreshSettings();
        loadAdminData();
      }
    } catch {
      showToast('Failed to update settings', 'error');
    }
  };

  // --- BROADCAST NOTIFICATION ---
  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastMessage) return;
    try {
      const res = await fetch('/api/admin/notifications/broadcast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: broadcastTitle,
          message: broadcastMessage,
          type: broadcastType
        })
      });
      if (res.ok) {
        showToast('Broadcast notification dispatched to all users!', 'success');
        setBroadcastTitle('');
        setBroadcastMessage('');
      }
    } catch {
      showToast('Failed to dispatch broadcast', 'error');
    }
  };

  // Filtered Simple / Premium lists
  const simpleMethodsList = methods.filter(m => m.type === 'simple');
  const premiumMethodsList = methods.filter(m => m.type === 'premium');
  const simpleCoursesList = courses.filter(c => c.type === 'simple');
  const premiumCoursesList = courses.filter(c => c.type === 'premium');

  return (
    <div className="w-full min-h-screen bg-[#06080e] text-slate-100 flex flex-col md:flex-row">
      
      {/* SIDEBAR NAVIGATION (260px) */}
      <aside className="w-full md:w-64 bg-[#0a0d18] border-r border-slate-800/80 p-4 shrink-0 flex flex-col justify-between">
        <div>
          {/* Admin Header */}
          <div className="flex items-center gap-2.5 px-3 py-3 mb-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white tracking-tight">Admin Console</div>
              <div className="text-[10px] text-indigo-300 font-mono">Method Tricks v2.6</div>
            </div>
          </div>

          {/* 13 Admin Tabs */}
          <nav className="space-y-1 text-xs font-medium">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'overview' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>1. Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('packages')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'packages' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold shadow-md shadow-purple-600/30' : 'text-purple-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Tag className="w-4 h-4 text-purple-400" />
                <span>2. Packages & Pricing</span>
              </div>
              <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-purple-950 text-purple-300 border border-purple-500/30 font-bold">
                {packagesList.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('simple-methods')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'simple-methods' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileVideo className="w-4 h-4" />
                <span>3. Simple Methods</span>
              </div>
              <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                {simpleMethodsList.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('premium-methods')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'premium-methods' ? 'bg-indigo-600 text-white font-semibold' : 'text-purple-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Crown className="w-4 h-4 text-purple-400" />
                <span>4. Premium Methods</span>
              </div>
              <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-purple-950 text-purple-300 border border-purple-500/30">
                {premiumMethodsList.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('simple-courses')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'simple-courses' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <GraduationCap className="w-4 h-4" />
                <span>5. Simple Courses</span>
              </div>
              <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                {simpleCoursesList.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('premium-courses')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'premium-courses' ? 'bg-indigo-600 text-white font-semibold' : 'text-purple-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Crown className="w-4 h-4 text-purple-400" />
                <span>6. Premium Courses</span>
              </div>
              <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-purple-950 text-purple-300 border border-purple-500/30">
                {premiumCoursesList.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'users' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4" />
                <span>7. Manage Users</span>
              </div>
              <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                {usersList.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('payment-requests')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'payment-requests' ? 'bg-indigo-600 text-white font-semibold' : 'text-emerald-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                <span>8. Payment Requests</span>
              </div>
              {paymentsList.filter(p => p.status === 'pending').length > 0 && (
                <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-amber-500 text-black font-bold animate-pulse">
                  {paymentsList.filter(p => p.status === 'pending').length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('payment-settings')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'payment-settings' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>9. Payment Settings</span>
            </button>

            <button
              onClick={() => setActiveTab('ads')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'ads' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Megaphone className="w-4 h-4" />
              <span>10. Advertisement Mgr</span>
            </button>

            <button
              onClick={() => setActiveTab('website-settings')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'website-settings' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>11. Website Settings</span>
            </button>

            <button
              onClick={() => setActiveTab('notifications')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'notifications' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>12. Notifications</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'analytics' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>13. Analytics Reports</span>
            </button>
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="pt-4 border-t border-slate-800/80 space-y-2 text-xs">
          {/* Hidden JSON file input for DB restore */}
          <input
            type="file"
            ref={restoreFileRef}
            onChange={handleRestoreBackupFile}
            accept=".json"
            className="hidden"
          />

          <button
            onClick={handleDownloadBackup}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-950/50 border border-emerald-500/30 hover:bg-emerald-900/60 text-emerald-300 font-semibold transition-colors cursor-pointer"
            title="Download complete database JSON backup"
          >
            <DownloadCloud className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Download DB Backup</span>
          </button>

          <button
            onClick={() => restoreFileRef.current?.click()}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 font-medium transition-colors cursor-pointer"
            title="Restore database state from JSON backup file"
          >
            <UploadCloud className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>Restore DB from JSON</span>
          </button>

          <button
            onClick={() => setFirebaseGuideOpen(true)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900/60 hover:bg-slate-800 text-amber-300 font-medium transition-colors cursor-pointer"
          >
            <Database className="w-4 h-4" />
            <span>Firebase & Sync Guide</span>
          </button>

          <button
            onClick={() => {
              window.location.hash = '';
              setCurrentPage('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>View Public Website</span>
          </button>

          <button
            onClick={() => {
              window.location.hash = '';
              logout();
              setCurrentPage('home');
            }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-rose-400 hover:bg-rose-950/30 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Admin Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN VIEWPORT */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        
        {/* TOP BAR / BREADCRUMB */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 mb-6 border-b border-slate-800/80 gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white capitalize">
              {activeTab.replace('-', ' ')}
            </h1>
            <p className="text-xs text-slate-400">
              Live database state synced with real-time public frontend.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded bg-indigo-950 text-indigo-300 border border-indigo-500/30 text-xs font-mono">
              Admin: {user?.email}
            </span>
            <button
              onClick={loadAdminData}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
            >
              Refresh Data
            </button>
          </div>
        </div>

        {/* 1. OVERVIEW */}
        {activeTab === 'overview' && analytics && (
          <div className="space-y-8">
            {/* KPI Metrics Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-[#0b0e18] border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                  <span>Total Users</span>
                  <Users className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="text-2xl font-bold font-mono text-white tabular-nums">
                  {analytics.totalUsers}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  {analytics.simpleUsers} Simple · {analytics.premiumUsers} VIP
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#0b0e18] border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                  <span>Total Revenue</span>
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
                  ৳{analytics.totalRevenueBDT.toLocaleString()} BDT
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  {analytics.approvedPayments} approved orders
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#0b0e18] border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                  <span>Pending Verifications</span>
                  <CreditCard className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-bold font-mono text-amber-400 tabular-nums">
                  {analytics.pendingPayments}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Awaiting TrxID check</p>
              </div>

              <div className="p-5 rounded-2xl bg-[#0b0e18] border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                  <span>Content Library</span>
                  <FileVideo className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-2xl font-bold font-mono text-purple-400 tabular-nums">
                  {analytics.totalMethods} Methods · {analytics.totalCourses} Courses
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  {analytics.totalMethodViews.toLocaleString()} total views
                </p>
              </div>
            </div>

            {/* Quick Actions & Recent Verifications */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 bg-[#0b0e18] border border-slate-800 rounded-2xl p-6">
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-emerald-400" />
                    <span>Recent bKash & Nagad Payments</span>
                  </h3>
                  <button
                    onClick={() => setActiveTab('payment-requests')}
                    className="text-xs text-indigo-400 hover:underline"
                  >
                    View All
                  </button>
                </div>

                <div className="space-y-3">
                  {paymentsList.slice(0, 4).map(p => (
                    <div key={p.id} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-semibold text-white">{p.userName} · <span className="font-mono text-emerald-400">৳{p.amountBDT}</span></div>
                        <div className="text-slate-400 text-[11px] mt-0.5">
                          {p.method} · Sender: <span className="font-mono">{p.senderNumber}</span> · Trx: <span className="font-mono font-bold text-white">{p.transactionId}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          p.status === 'approved' ? 'bg-emerald-950 text-emerald-400' : p.status === 'rejected' ? 'bg-rose-950 text-rose-400' : 'bg-amber-950 text-amber-400'
                        }`}>
                          {p.status}
                        </span>
                        {p.status === 'pending' && (
                          <button
                            onClick={() => handleReviewPayment(p.id, 'approved')}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-semibold"
                          >
                            Approve
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions Panel */}
              <div className="lg:col-span-4 bg-[#0b0e18] border border-slate-800 rounded-2xl p-6 space-y-4">
                <h3 className="text-sm font-bold text-white">Quick Shortcuts</h3>
                
                <button
                  onClick={() => {
                    setEditingMethod({
                      title: '',
                      type: 'simple',
                      category: 'Digital Marketing',
                      description: '',
                      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
                      thumbnailUrl: '/src/assets/images/hero_method_tricks_tech_1794218786220.jpg',
                      downloadAllowed: true,
                      fileName: 'resource-pack.zip',
                      fileSize: '15.0 MB'
                    });
                    setMethodModalOpen(true);
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-200 flex items-center justify-between cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Plus className="w-4 h-4 text-emerald-400" />
                    <span>Upload Simple Method</span>
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-slate-500" />
                </button>

                <button
                  onClick={() => {
                    setEditingMethod({
                      title: '',
                      type: 'premium',
                      category: 'VIP Exploits & Blueprints',
                      description: '',
                      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                      thumbnailUrl: '/src/assets/images/premium_vip_banner_1794218787697.jpg',
                      downloadAllowed: true,
                      fileName: 'vip-bundle-2026.zip',
                      fileSize: '45.0 MB'
                    });
                    setMethodModalOpen(true);
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-purple-950/50 hover:bg-purple-900/60 border border-purple-500/30 text-xs font-semibold text-purple-200 flex items-center justify-between cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-purple-400" />
                    <span>Upload Premium VIP Method</span>
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-slate-500" />
                </button>

                <button
                  onClick={() => {
                    setEditingCourse({
                      title: '',
                      type: 'premium',
                      category: 'Masterclasses',
                      description: '',
                      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
                      thumbnailUrl: '/src/assets/images/course_mastery_preview_1794218786269.jpg',
                      downloadAllowed: true,
                      fileName: 'masterclass-starter.zip',
                      totalDuration: '4 Hours',
                      instructor: 'Lead Specialist',
                      lessons: []
                    });
                    setCourseModalOpen(true);
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-indigo-950/50 hover:bg-indigo-900/60 border border-indigo-500/30 text-xs font-semibold text-indigo-200 flex items-center justify-between cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-indigo-400" />
                    <span>Create Full Masterclass Course</span>
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-slate-500" />
                </button>

                <button
                  onClick={() => setActiveTab('packages')}
                  className="w-full py-2.5 px-3 rounded-xl bg-purple-950/60 hover:bg-purple-900/70 border border-purple-500/40 text-xs font-semibold text-purple-200 flex items-center justify-between cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-purple-400" />
                    <span>Manage Packages & Set Pricing (৳)</span>
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-slate-500" />
                </button>

                <button
                  onClick={() => setActiveTab('payment-settings')}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-200 flex items-center justify-between cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-amber-400" />
                    <span>Change bKash / Nagad Number</span>
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-slate-500" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 2. MANAGE PACKAGES & PRICING (৳ BDT) */}
        {activeTab === 'packages' && (
          <div className="space-y-6">
            {/* Header with Title and Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0b0e18] border border-slate-800 p-6 rounded-2xl">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Tag className="w-5 h-5 text-purple-400" />
                  <h3 className="text-lg font-bold text-white">
                    Premium Packages & Pricing (৳ BDT)
                  </h3>
                </div>
                <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
                  Here you can set and control all VIP membership packages. Configure 7 Days, 30 Days, 90 Days, 365 Days or any custom duration with your own price in Taka (৳). Users will see these exact packages and submit bKash/Nagad payments based on these prices.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {packagesList.length === 0 && (
                  <button
                    onClick={handleGenerateDefaultPackageTiers}
                    className="px-4 py-2.5 rounded-xl bg-purple-950/70 border border-purple-500/40 hover:bg-purple-900/70 text-purple-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span>Generate 7, 30, 90, 365 Days Template</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setEditingPackage({
                      name: '',
                      durationDays: 30,
                      priceBDT: 500,
                      description: '',
                      benefits: [
                        'Full Access to All VIP Methods',
                        'Stream All Masterclasses in 1080p',
                        'Direct Fast High-Speed Downloads',
                        'Zero Advertisements Guaranteed',
                        'Priority Admin WhatsApp / Telegram Support'
                      ],
                      isActive: true,
                      isPopular: false
                    });
                    setNewBenefitText('');
                    setPackageModalOpen(true);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Create New Package</span>
                </button>
              </div>
            </div>

            {/* Packages Grid / List */}
            {packagesList.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-[#0b0e18] border border-slate-800">
                <Tag className="w-12 h-12 text-purple-400/50 mx-auto mb-3" />
                <h4 className="text-base font-bold text-white mb-1">No Packages Configured Yet</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto mb-6">
                  Demo prices have been removed. Click "+ Create New Package" to set your first membership tier with your custom duration and price in Taka (৳), or click "Generate Template" to start with standard 7, 30, 90, 365 days slots.
                </p>
                <div className="flex justify-center gap-3 flex-wrap">
                  <button
                    onClick={handleGenerateDefaultPackageTiers}
                    className="px-5 py-2.5 rounded-xl bg-purple-950 border border-purple-500/40 hover:bg-purple-900 text-purple-300 text-xs font-semibold flex items-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span>Quick Load 7, 30, 90, 365 Days Slots</span>
                  </button>
                  <button
                    onClick={() => {
                      setEditingPackage({
                        name: '',
                        durationDays: 7,
                        priceBDT: 250,
                        description: '',
                        benefits: ['Full Access to All VIP Methods', 'Zero Ads Guaranteed', 'Direct Downloads'],
                        isActive: true,
                        isPopular: false
                      });
                      setNewBenefitText('');
                      setPackageModalOpen(true);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Custom Package</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {packagesList.map(pkg => (
                  <div
                    key={pkg.id}
                    className={`relative rounded-2xl p-6 bg-[#0b0e18] border flex flex-col justify-between transition-all ${
                      pkg.isPopular ? 'border-purple-500 shadow-xl shadow-purple-950/40' : 'border-slate-800'
                    }`}
                  >
                    {pkg.isPopular && (
                      <span className="absolute -top-3 left-4 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider shadow">
                        Most Popular
                      </span>
                    )}

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          pkg.isActive ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' : 'bg-rose-950 text-rose-400 border border-rose-500/30'
                        }`}>
                          {pkg.isActive ? 'Active on Public Site' : 'Hidden / Inactive'}
                        </span>
                        <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                          {pkg.durationDays} Days
                        </span>
                      </div>

                      <h4 className="text-lg font-bold text-white mb-1">{pkg.name}</h4>
                      <p className="text-xs text-slate-400 mb-4 min-h-[32px] line-clamp-2">{pkg.description || 'No description provided.'}</p>

                      {/* Price BDT Badge */}
                      <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 mb-4">
                        <div className="text-[10px] uppercase font-semibold text-slate-400">Price in BDT</div>
                        <div className="text-2xl font-black font-mono text-purple-400 tabular-nums">
                          ৳{pkg.priceBDT} <span className="text-xs font-normal text-slate-400">BDT</span>
                        </div>
                      </div>

                      {/* Benefits preview */}
                      <div className="space-y-1.5 mb-6 text-xs text-slate-300">
                        <div className="text-[11px] font-semibold text-slate-400 mb-1 flex items-center justify-between">
                          <span>Included Features:</span>
                          <span className="text-[10px] text-purple-400 font-mono">{pkg.benefits.length} items</span>
                        </div>
                        {pkg.benefits.slice(0, 4).map((b, idx) => (
                          <div key={idx} className="flex items-start gap-1.5 text-[11px] text-slate-300">
                            <Check className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                            <span className="truncate">{b}</span>
                          </div>
                        ))}
                        {pkg.benefits.length > 4 && (
                          <div className="text-[10px] text-slate-500 italic pl-5">
                            +{pkg.benefits.length - 4} more benefits...
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="pt-4 border-t border-slate-800/80 flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingPackage({ ...pkg });
                          setNewBenefitText('');
                          setPackageModalOpen(true);
                        }}
                        className="flex-1 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Edit Price & Info</span>
                      </button>

                      <button
                        onClick={() => handleDeletePackage(pkg.id)}
                        className="p-2 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 text-rose-300 transition-colors cursor-pointer"
                        title="Delete Package"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Database Persistence & Backup Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-[#0c1020] to-[#070a14] border border-indigo-500/20 shadow-xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Database className="w-5 h-5 text-indigo-400" />
                    <h4 className="text-sm font-bold text-white">
                      Permanent Data Persistence & 1-Click Backups
                    </h4>
                  </div>
                  <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
                    All created methods, courses, registered members, packages, and payment records are automatically written to <code className="text-purple-300 font-mono">server_db/data.json</code> on disk. You can download an offline JSON backup anytime or restore it to guarantee 100% data safety.
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0 flex-wrap">
                  <button
                    onClick={handleDownloadBackup}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
                  >
                    <DownloadCloud className="w-4 h-4" />
                    <span>Download JSON Backup</span>
                  </button>

                  <button
                    onClick={() => restoreFileRef.current?.click()}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <UploadCloud className="w-4 h-4 text-indigo-400" />
                    <span>Restore from JSON</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3 & 4. MANAGE SIMPLE / PREMIUM METHODS */}
        {(activeTab === 'simple-methods' || activeTab === 'premium-methods') && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">
                  {activeTab === 'simple-methods' ? 'Simple Methods (Free Access)' : 'Premium Methods (VIP Unlock)'}
                </h3>
                <p className="text-xs text-slate-400">
                  {activeTab === 'simple-methods' ? 'Free for all registered users · Displays ads' : 'Locked for Simple users · Zero ads for Premium'}
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingMethod({
                    title: '',
                    type: activeTab === 'simple-methods' ? 'simple' : 'premium',
                    category: 'General',
                    description: '',
                    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
                    thumbnailUrl: activeTab === 'simple-methods' 
                      ? '/src/assets/images/hero_method_tricks_tech_1794218786220.jpg' 
                      : '/src/assets/images/premium_vip_banner_1794218787697.jpg',
                    downloadAllowed: true,
                    fileName: 'asset-pack.zip',
                    fileSize: '18.5 MB'
                  });
                  setMethodModalOpen(true);
                }}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Upload New {activeTab === 'simple-methods' ? 'Simple' : 'VIP'} Method</span>
              </button>
            </div>

            {/* Methods Table */}
            <div className="bg-[#0b0e18] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900 border-b border-slate-800 text-[11px] text-slate-400 uppercase font-mono">
                    <tr>
                      <th className="p-3.5">Method</th>
                      <th className="p-3.5">Category</th>
                      <th className="p-3.5">Views</th>
                      <th className="p-3.5">Downloadable</th>
                      <th className="p-3.5">Uploaded</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {(activeTab === 'simple-methods' ? simpleMethodsList : premiumMethodsList).map(m => (
                      <tr key={m.id} className="hover:bg-slate-900/50">
                        <td className="p-3.5 flex items-center gap-3">
                          <img src={m.thumbnailUrl} alt={m.title} className="w-14 h-9 object-cover rounded shrink-0" />
                          <div className="min-w-0 max-w-sm">
                            <p className="font-bold text-white truncate">{m.title}</p>
                            <p className="text-slate-500 text-[11px] line-clamp-1">{m.description}</p>
                          </div>
                        </td>
                        <td className="p-3.5 text-slate-300">{m.category}</td>
                        <td className="p-3.5 font-mono tabular-nums">{m.views}</td>
                        <td className="p-3.5">
                          {m.downloadAllowed ? (
                            <span className="text-emerald-400 font-semibold text-[11px]">Yes ({m.fileSize || 'File'})</span>
                          ) : (
                            <span className="text-slate-500 text-[11px]">Disabled</span>
                          )}
                        </td>
                        <td className="p-3.5 font-mono text-slate-400">{m.uploadDate}</td>
                        <td className="p-3.5 text-right space-x-2">
                          <button
                            onClick={() => {
                              setEditingMethod(m);
                              setMethodModalOpen(true);
                            }}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 hover:text-white"
                            title="Edit"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteMethod(m.id)}
                            className="p-1.5 bg-rose-950/60 hover:bg-rose-900 border border-rose-500/30 rounded text-rose-300"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 4 & 5. MANAGE SIMPLE / PREMIUM COURSES */}
        {(activeTab === 'simple-courses' || activeTab === 'premium-courses') && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">
                  {activeTab === 'simple-courses' ? 'Simple Courses (Free Curriculum)' : 'Premium Courses (VIP Masterclass)'}
                </h3>
                <p className="text-xs text-slate-400">Organize multi-lesson courses with downloadable exercises.</p>
              </div>

              <button
                onClick={() => {
                  setEditingCourse({
                    title: '',
                    type: activeTab === 'simple-courses' ? 'simple' : 'premium',
                    category: 'Development',
                    description: '',
                    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
                    thumbnailUrl: '/src/assets/images/course_mastery_preview_1794218786269.jpg',
                    downloadAllowed: true,
                    fileName: 'course-exercises.zip',
                    totalDuration: '3 Hours',
                    instructor: 'Senior Instructor',
                    lessons: [
                      {
                        id: 'l_1',
                        title: 'Lesson 1: Introduction & Environment Setup',
                        duration: '20 mins',
                        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
                        description: 'Foundation overview',
                        order: 1
                      }
                    ]
                  });
                  setCourseModalOpen(true);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create New {activeTab === 'simple-courses' ? 'Simple' : 'VIP'} Course</span>
              </button>
            </div>

            {/* Courses Table */}
            <div className="bg-[#0b0e18] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900 border-b border-slate-800 text-[11px] text-slate-400 uppercase font-mono">
                    <tr>
                      <th className="p-3.5">Course</th>
                      <th className="p-3.5">Category</th>
                      <th className="p-3.5">Lessons</th>
                      <th className="p-3.5">Duration</th>
                      <th className="p-3.5">Instructor</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {(activeTab === 'simple-courses' ? simpleCoursesList : premiumCoursesList).map(c => (
                      <tr key={c.id} className="hover:bg-slate-900/50">
                        <td className="p-3.5 flex items-center gap-3">
                          <img src={c.thumbnailUrl} alt={c.title} className="w-14 h-9 object-cover rounded shrink-0" />
                          <div className="min-w-0 max-w-sm">
                            <p className="font-bold text-white truncate">{c.title}</p>
                            <p className="text-slate-500 text-[11px] line-clamp-1">{c.description}</p>
                          </div>
                        </td>
                        <td className="p-3.5 text-slate-300">{c.category}</td>
                        <td className="p-3.5 font-mono text-purple-400 font-bold">{c.lessons.length} Modules</td>
                        <td className="p-3.5 font-mono">{c.totalDuration}</td>
                        <td className="p-3.5 text-slate-400">{c.instructor}</td>
                        <td className="p-3.5 text-right space-x-2">
                          <button
                            onClick={() => {
                              setEditingCourse(c);
                              setCourseModalOpen(true);
                            }}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 hover:text-white"
                            title="Edit & Manage Lessons"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteCourse(c.id)}
                            className="p-1.5 bg-rose-950/60 hover:bg-rose-900 border border-rose-500/30 rounded text-rose-300"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 6. MANAGE USERS */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white">Registered Users Management</h3>
                <p className="text-xs text-slate-400">View roles, upgrade to Premium, modify expiry dates, or suspend accounts.</p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search user name/phone/email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>
            </div>

            <div className="bg-[#0b0e18] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900 border-b border-slate-800 text-[11px] text-slate-400 uppercase font-mono">
                    <tr>
                      <th className="p-3.5">User</th>
                      <th className="p-3.5">Phone</th>
                      <th className="p-3.5">Role</th>
                      <th className="p-3.5">VIP Expiry</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Admin Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {usersList
                      .filter(u => {
                        if (!userSearch) return true;
                        const s = userSearch.toLowerCase();
                        return u.name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s) || u.phone.includes(s);
                      })
                      .map(u => (
                        <tr key={u.id} className="hover:bg-slate-900/50">
                          <td className="p-3.5">
                            <p className="font-bold text-white">{u.name}</p>
                            <p className="text-slate-500 text-[11px] font-mono">{u.email}</p>
                          </td>
                          <td className="p-3.5 font-mono text-slate-400">{u.phone}</td>
                          <td className="p-3.5">
                            <select
                              value={u.role}
                              onChange={(e) => handleUpdateUser(u.id, { role: e.target.value as any })}
                              className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-xs font-semibold text-white focus:outline-none"
                            >
                              <option value="simple">Simple User</option>
                              <option value="premium">Premium User</option>
                              <option value="admin">Admin</option>
                            </select>
                          </td>
                          <td className="p-3.5 font-mono text-[11px] text-slate-400">
                            {u.premiumExpiresAt ? new Date(u.premiumExpiresAt).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="p-3.5">
                            <button
                              onClick={() => handleUpdateUser(u.id, { status: u.status === 'active' ? 'suspended' : 'active' })}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                u.status === 'active' ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'
                              }`}
                            >
                              {u.status}
                            </button>
                          </td>
                          <td className="p-3.5 text-right space-x-2">
                            {u.role !== 'premium' ? (
                              <button
                                onClick={() => {
                                  const thirtyDays = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
                                  handleUpdateUser(u.id, { role: 'premium', premiumExpiresAt: thirtyDays });
                                }}
                                className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded text-[11px] font-semibold"
                              >
                                Upgrade VIP
                              </button>
                            ) : (
                              <button
                                onClick={() => handleUpdateUser(u.id, { role: 'simple', premiumExpiresAt: null })}
                                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px]"
                              >
                                Remove VIP
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 7. PREMIUM MEMBERSHIP REQUESTS (BKASH & NAGAD) */}
        {activeTab === 'payment-requests' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-white">bKash & Nagad Payment Requests</h3>
              <p className="text-xs text-slate-400">
                Verify sender phone number and TrxID against your mobile statement. Approving automatically unlocks Premium access for the user.
              </p>
            </div>

            <div className="bg-[#0b0e18] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900 border-b border-slate-800 text-[11px] text-slate-400 uppercase font-mono">
                    <tr>
                      <th className="p-3.5">User</th>
                      <th className="p-3.5">Package</th>
                      <th className="p-3.5">Method</th>
                      <th className="p-3.5">Sender Number</th>
                      <th className="p-3.5">Transaction ID</th>
                      <th className="p-3.5">Amount</th>
                      <th className="p-3.5">Proof</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Verification Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {paymentsList.map(p => (
                      <tr key={p.id} className="hover:bg-slate-900/50">
                        <td className="p-3.5">
                          <p className="font-bold text-white">{p.userName}</p>
                          <p className="text-slate-500 text-[11px] font-mono">{p.userEmail}</p>
                        </td>
                        <td className="p-3.5 text-white font-medium">{p.packageName} ({p.packageDays}d)</td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded font-semibold text-[10px] ${
                            p.method === 'bKash' ? 'bg-[#e2136e]/20 text-[#e2136e]' : 'bg-[#f7941d]/20 text-[#f7941d]'
                          }`}>
                            {p.method}
                          </span>
                        </td>
                        <td className="p-3.5 font-mono font-bold text-white">{p.senderNumber}</td>
                        <td className="p-3.5 font-mono font-extrabold text-amber-300 text-sm tracking-wider">
                          {p.transactionId}
                        </td>
                        <td className="p-3.5 font-mono font-bold text-emerald-400 tabular-nums">
                          ৳{p.amountBDT}
                        </td>
                        <td className="p-3.5">
                          {p.screenshotUrl ? (
                            <button
                              onClick={() => setScreenshotModalImg(p.screenshotUrl)}
                              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-purple-300 text-[11px] flex items-center gap-1"
                            >
                              <Eye className="w-3 h-3" />
                              <span>View Slip</span>
                            </button>
                          ) : (
                            <span className="text-slate-500 text-[11px]">No image</span>
                          )}
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            p.status === 'approved' ? 'bg-emerald-950 text-emerald-400' : p.status === 'rejected' ? 'bg-rose-950 text-rose-400' : 'bg-amber-950 text-amber-400'
                          }`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-right space-x-2">
                          {p.status === 'pending' ? (
                            <>
                              <button
                                onClick={() => handleReviewPayment(p.id, 'approved')}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded text-xs shadow cursor-pointer"
                              >
                                Approve VIP
                              </button>
                              <button
                                onClick={() => setRejectionModalPayment(p)}
                                className="px-2.5 py-1.5 bg-rose-950 border border-rose-500/30 hover:bg-rose-900 text-rose-300 rounded text-xs cursor-pointer"
                              >
                                Reject
                              </button>
                            </>
                          ) : (
                            <span className="text-[11px] text-slate-500">Processed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 8. PAYMENT SETTINGS */}
        {activeTab === 'payment-settings' && adminSettings && (
          <div className="max-w-2xl bg-[#0b0e18] border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-base font-bold text-white mb-1">bKash & Nagad Accounts Configuration</h3>
              <p className="text-xs text-slate-400">These numbers and instructions are displayed immediately to users upon checkout.</p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-6">
              {/* bKash Section */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#e2136e]">bKash Configuration</h4>
                  <span className="text-[10px] text-emerald-400 font-semibold">Enabled</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">bKash Phone Number</label>
                    <input
                      type="text"
                      required
                      value={adminSettings.bKashNumber}
                      onChange={(e) => setAdminSettings({ ...adminSettings, bKashNumber: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Account Type</label>
                    <select
                      value={adminSettings.bKashType}
                      onChange={(e) => setAdminSettings({ ...adminSettings, bKashType: e.target.value as any })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                    >
                      <option value="Personal">Personal (Send Money)</option>
                      <option value="Merchant">Merchant (Payment)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1">bKash Instructions</label>
                  <textarea
                    rows={2}
                    value={adminSettings.bKashInstructions}
                    onChange={(e) => setAdminSettings({ ...adminSettings, bKashInstructions: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                  />
                </div>
              </div>

              {/* Nagad Section */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#f7941d]">Nagad Configuration</h4>
                  <span className="text-[10px] text-emerald-400 font-semibold">Enabled</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Nagad Phone Number</label>
                    <input
                      type="text"
                      required
                      value={adminSettings.nagadNumber}
                      onChange={(e) => setAdminSettings({ ...adminSettings, nagadNumber: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Account Type</label>
                    <select
                      value={adminSettings.nagadType}
                      onChange={(e) => setAdminSettings({ ...adminSettings, nagadType: e.target.value as any })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                    >
                      <option value="Personal">Personal (Send Money)</option>
                      <option value="Merchant">Merchant (Payment)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1">Nagad Instructions</label>
                  <textarea
                    rows={2}
                    value={adminSettings.nagadInstructions}
                    onChange={(e) => setAdminSettings({ ...adminSettings, nagadInstructions: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg transition-all"
              >
                Save Payment Settings
              </button>
            </form>
          </div>
        )}

        {/* 9. ADVERTISEMENT MANAGEMENT */}
        {activeTab === 'ads' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Advertisement Management</h3>
                <p className="text-xs text-slate-400">Strict rule enforced: Visible to Simple users only; Premium members see 0 ads.</p>
              </div>

              <button
                onClick={() => {
                  setEditingAd({
                    title: 'New Sponsored Promotion',
                    imageUrl: '/src/assets/images/hero_method_tricks_tech_1794218786220.jpg',
                    targetUrl: 'https://example.com',
                    placement: 'home_top',
                    isEnabled: true,
                    displayOrder: adsList.length + 1
                  });
                  setAdModalOpen(true);
                }}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Advertisement</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {adsList.map(ad => (
                <div key={ad.id} className="bg-[#0b0e18] border border-slate-800 rounded-xl overflow-hidden p-4 space-y-3">
                  <div className="relative aspect-[21/9] bg-slate-900 rounded-lg overflow-hidden">
                    <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-cover" />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/80 text-[10px] text-slate-300 font-mono">
                      {ad.placement}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-white truncate">{ad.title}</h4>
                    <p className="text-[11px] text-slate-500 truncate">{ad.targetUrl}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      ad.isEnabled ? 'bg-emerald-950 text-emerald-400' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {ad.isEnabled ? 'Active' : 'Disabled'}
                    </span>
                    <div className="space-x-1.5">
                      <button
                        onClick={() => {
                          setEditingAd(ad);
                          setAdModalOpen(true);
                        }}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteAd(ad.id)}
                        className="p-1.5 bg-rose-950 hover:bg-rose-900 rounded text-rose-300"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 10. WEBSITE SETTINGS */}
        {activeTab === 'website-settings' && adminSettings && (
          <div className="max-w-3xl bg-[#0b0e18] border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-base font-bold text-white mb-1">Global Website Configuration</h3>
              <p className="text-xs text-slate-400">Modify branding, headlines, social links, and legal policies without altering code.</p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Website Name</label>
                  <input
                    type="text"
                    required
                    value={adminSettings.websiteName}
                    onChange={(e) => setAdminSettings({ ...adminSettings, websiteName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Contact Email</label>
                  <input
                    type="email"
                    required
                    value={adminSettings.contactEmail}
                    onChange={(e) => setAdminSettings({ ...adminSettings, contactEmail: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Hero Headline</label>
                <input
                  type="text"
                  required
                  value={adminSettings.heroHeadline}
                  onChange={(e) => setAdminSettings({ ...adminSettings, heroHeadline: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Hero Subheadline</label>
                <textarea
                  rows={2}
                  required
                  value={adminSettings.heroSubheadline}
                  onChange={(e) => setAdminSettings({ ...adminSettings, heroSubheadline: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={adminSettings.contactPhone}
                    onChange={(e) => setAdminSettings({ ...adminSettings, contactPhone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Telegram Channel</label>
                  <input
                    type="text"
                    value={adminSettings.telegramChannel}
                    onChange={(e) => setAdminSettings({ ...adminSettings, telegramChannel: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Facebook Page</label>
                  <input
                    type="text"
                    value={adminSettings.facebookPage}
                    onChange={(e) => setAdminSettings({ ...adminSettings, facebookPage: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Terms & Conditions Prose</label>
                <textarea
                  rows={3}
                  value={adminSettings.termsAndConditions}
                  onChange={(e) => setAdminSettings({ ...adminSettings, termsAndConditions: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Privacy Policy Prose</label>
                <textarea
                  rows={3}
                  value={adminSettings.privacyPolicy}
                  onChange={(e) => setAdminSettings({ ...adminSettings, privacyPolicy: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg transition-all"
              >
                Save Global Website Settings
              </button>
            </form>
          </div>
        )}

        {/* 11. NOTIFICATION MANAGEMENT */}
        {activeTab === 'notifications' && (
          <div className="max-w-xl bg-[#0b0e18] border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-base font-bold text-white mb-1">Send Broadcast Notification</h3>
              <p className="text-xs text-slate-400">Dispatches an instant announcement to all registered users on the platform.</p>
            </div>

            <form onSubmit={handleSendBroadcast} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Notification Title</label>
                <input
                  type="text"
                  required
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  placeholder="e.g. Fresh VIP Exploit Method Released!"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Type</label>
                <select
                  value={broadcastType}
                  onChange={(e) => setBroadcastType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white"
                >
                  <option value="info">General Info</option>
                  <option value="success">Success / VIP Announcement</option>
                  <option value="warning">System Notice</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Message Content</label>
                <textarea
                  rows={4}
                  required
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  placeholder="Type message body..."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl shadow-lg transition-all"
              >
                Broadcast to All Users
              </button>
            </form>
          </div>
        )}

        {/* 12. REPORTS AND ANALYTICS */}
        {activeTab === 'analytics' && analytics && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-[#0b0e18] border border-slate-800">
                <div className="text-xs text-slate-400 uppercase font-semibold mb-1">Conversion Rate</div>
                <div className="text-3xl font-bold font-mono text-white tabular-nums">
                  {analytics.conversionRate}%
                </div>
                <p className="text-xs text-slate-500 mt-2">Percentage of registered users upgraded to Premium</p>
              </div>

              <div className="p-6 rounded-2xl bg-[#0b0e18] border border-slate-800">
                <div className="text-xs text-slate-400 uppercase font-semibold mb-1">Total Revenue Collected</div>
                <div className="text-3xl font-bold font-mono text-emerald-400 tabular-nums">
                  ৳{analytics.totalRevenueBDT.toLocaleString()} BDT
                </div>
                <p className="text-xs text-slate-500 mt-2">Verified via bKash & Nagad manually</p>
              </div>

              <div className="p-6 rounded-2xl bg-[#0b0e18] border border-slate-800">
                <div className="text-xs text-slate-400 uppercase font-semibold mb-1">Total Method Views</div>
                <div className="text-3xl font-bold font-mono text-purple-400 tabular-nums">
                  {analytics.totalMethodViews.toLocaleString()}
                </div>
                <p className="text-xs text-slate-500 mt-2">Across free and VIP methods</p>
              </div>
            </div>

            {/* Content Breakdown Matrix */}
            <div className="bg-[#0b0e18] border border-slate-800 rounded-2xl p-6">
              <h3 className="text-sm font-bold text-white mb-4">Content Tier Distribution</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-400">Simple Methods</span>
                  <div className="text-xl font-bold text-white font-mono mt-1">{analytics.simpleMethods}</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-purple-300">Premium Methods</span>
                  <div className="text-xl font-bold text-purple-400 font-mono mt-1">{analytics.premiumMethods}</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-400">Simple Courses</span>
                  <div className="text-xl font-bold text-white font-mono mt-1">{analytics.simpleCourses}</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-purple-300">Premium Courses</span>
                  <div className="text-xl font-bold text-purple-400 font-mono mt-1">{analytics.premiumCourses}</div>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* MODAL: METHOD ADD / EDIT */}
      {methodModalOpen && editingMethod && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0f1422] border border-slate-800 rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-white mb-4">
              {editingMethod.id ? 'Edit Method' : 'Upload New Method'}
            </h3>
            <form onSubmit={handleSaveMethod} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={editingMethod.title || ''}
                  onChange={(e) => setEditingMethod({ ...editingMethod, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Tier Category</label>
                  <select
                    value={editingMethod.type || 'simple'}
                    onChange={(e) => setEditingMethod({ ...editingMethod, type: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white"
                  >
                    <option value="simple">Simple Method (Free)</option>
                    <option value="premium">Premium Method (VIP)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Topic Category</label>
                  <input
                    type="text"
                    required
                    value={editingMethod.category || ''}
                    onChange={(e) => setEditingMethod({ ...editingMethod, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Video Source URL (Direct MP4 or Host)</label>
                <input
                  type="text"
                  required
                  value={editingMethod.videoUrl || ''}
                  onChange={(e) => setEditingMethod({ ...editingMethod, videoUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Thumbnail Image URL</label>
                <input
                  type="text"
                  value={editingMethod.thumbnailUrl || ''}
                  onChange={(e) => setEditingMethod({ ...editingMethod, thumbnailUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Description (Unlimited Length)</label>
                <textarea
                  rows={4}
                  required
                  value={editingMethod.description || ''}
                  onChange={(e) => setEditingMethod({ ...editingMethod, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white"
                />
              </div>

              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="downloadAllowed"
                    checked={editingMethod.downloadAllowed || false}
                    onChange={(e) => setEditingMethod({ ...editingMethod, downloadAllowed: e.target.checked })}
                    className="rounded"
                  />
                  <label htmlFor="downloadAllowed" className="text-slate-300 font-semibold">Enable File Download Button</label>
                </div>

                {editingMethod.downloadAllowed && (
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-0.5">File Name</label>
                      <input
                        type="text"
                        value={editingMethod.fileName || ''}
                        onChange={(e) => setEditingMethod({ ...editingMethod, fileName: e.target.value })}
                        placeholder="exploit-pack.zip"
                        className="w-full px-2.5 py-1.5 bg-black/60 border border-slate-800 rounded text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-0.5">File Size</label>
                      <input
                        type="text"
                        value={editingMethod.fileSize || ''}
                        onChange={(e) => setEditingMethod({ ...editingMethod, fileSize: e.target.value })}
                        placeholder="24.5 MB"
                        className="w-full px-2.5 py-1.5 bg-black/60 border border-slate-800 rounded text-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setMethodModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 text-white font-semibold rounded-lg"
                >
                  Save Method
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: COURSE ADD / EDIT */}
      {courseModalOpen && editingCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0f1422] border border-slate-800 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-white mb-4">
              {editingCourse.id ? 'Edit Course & Lessons' : 'Create New Course'}
            </h3>
            <form onSubmit={handleSaveCourse} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Course Title</label>
                  <input
                    type="text"
                    required
                    value={editingCourse.title || ''}
                    onChange={(e) => setEditingCourse({ ...editingCourse, title: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Course Type</label>
                  <select
                    value={editingCourse.type || 'simple'}
                    onChange={(e) => setEditingCourse({ ...editingCourse, type: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white"
                  >
                    <option value="simple">Simple Course (Free)</option>
                    <option value="premium">Premium Course (VIP)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Category</label>
                  <input
                    type="text"
                    required
                    value={editingCourse.category || ''}
                    onChange={(e) => setEditingCourse({ ...editingCourse, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Duration</label>
                  <input
                    type="text"
                    value={editingCourse.totalDuration || '3 Hours'}
                    onChange={(e) => setEditingCourse({ ...editingCourse, totalDuration: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Instructor</label>
                  <input
                    type="text"
                    value={editingCourse.instructor || ''}
                    onChange={(e) => setEditingCourse({ ...editingCourse, instructor: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  value={editingCourse.description || ''}
                  onChange={(e) => setEditingCourse({ ...editingCourse, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white"
                />
              </div>

              {/* Multi-Lesson Builder */}
              <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 space-y-3">
                <h4 className="font-bold text-white uppercase text-[11px] tracking-wider">
                  Course Lessons ({editingCourse.lessons?.length || 0})
                </h4>

                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {(editingCourse.lessons || []).map((lesson, idx) => (
                    <div key={lesson.id} className="p-2.5 rounded-lg bg-black/60 border border-slate-800 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-white">{idx + 1}. {lesson.title}</p>
                        <p className="text-[10px] text-slate-500 font-mono">{lesson.duration}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveLesson(lesson.id)}
                        className="text-rose-400 hover:text-rose-300"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Lesson Sub-form */}
                <div className="pt-2 border-t border-slate-800 flex gap-2">
                  <input
                    type="text"
                    placeholder="New lesson title"
                    value={newLessonTitle}
                    onChange={(e) => setNewLessonTitle(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-black/60 border border-slate-800 rounded text-xs text-white"
                  />
                  <input
                    type="text"
                    placeholder="Duration"
                    value={newLessonDuration}
                    onChange={(e) => setNewLessonDuration(e.target.value)}
                    className="w-24 px-3 py-1.5 bg-black/60 border border-slate-800 rounded text-xs text-white font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleAddLessonToEditingCourse}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-semibold text-xs"
                  >
                    Add Lesson
                  </button>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setCourseModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 text-white font-semibold rounded-lg"
                >
                  Save Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADVERTISEMENT ADD / EDIT */}
      {adModalOpen && editingAd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0f1422] border border-slate-800 rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-base font-bold text-white mb-4">Manage Advertisement</h3>
            <form onSubmit={handleSaveAd} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Ad Title</label>
                <input
                  type="text"
                  required
                  value={editingAd.title || ''}
                  onChange={(e) => setEditingAd({ ...editingAd, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Banner Image URL</label>
                <input
                  type="text"
                  required
                  value={editingAd.imageUrl || ''}
                  onChange={(e) => setEditingAd({ ...editingAd, imageUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Click Destination URL</label>
                <input
                  type="text"
                  required
                  value={editingAd.targetUrl || ''}
                  onChange={(e) => setEditingAd({ ...editingAd, targetUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Placement</label>
                  <select
                    value={editingAd.placement || 'home_top'}
                    onChange={(e) => setEditingAd({ ...editingAd, placement: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white"
                  >
                    <option value="home_top">Home Top Banner</option>
                    <option value="home_sidebar">Home Sidebar</option>
                    <option value="video_banner">Video Page Banner</option>
                    <option value="download_page">Download Page Banner</option>
                    <option value="course_bottom">Course Bottom Banner</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="adEnabled"
                    checked={editingAd.isEnabled || false}
                    onChange={(e) => setEditingAd({ ...editingAd, isEnabled: e.target.checked })}
                    className="rounded"
                  />
                  <label htmlFor="adEnabled" className="text-slate-300 font-semibold">Active & Enabled</label>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setAdModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 text-white font-semibold rounded-lg"
                >
                  Save Advertisement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VIEW PAYMENT SCREENSHOT */}
      {screenshotModalImg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
          <div className="relative max-w-lg w-full bg-[#0a0d18] border border-slate-800 rounded-2xl p-4 text-center">
            <button
              onClick={() => setScreenshotModalImg(null)}
              className="absolute top-3 right-3 p-1.5 bg-slate-800 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h4 className="text-sm font-bold text-white mb-3">bKash / Nagad Payment Slip</h4>
            <div className="max-h-[70vh] overflow-y-auto rounded-lg bg-black">
              <img
                src={screenshotModalImg}
                alt="Payment proof screenshot"
                className="w-full h-auto object-contain mx-auto"
              />
            </div>
          </div>
        </div>
      )}

      {/* MODAL: PAYMENT REJECTION REASON */}
      {rejectionModalPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0f1422] border border-rose-500/30 rounded-2xl p-6 max-w-md w-full">
            <h4 className="text-base font-bold text-white mb-2">Reject Payment Verification</h4>
            <p className="text-xs text-slate-400 mb-4">
              Enter the reason for rejection. This will be sent as a notification to <strong className="text-white">{rejectionModalPayment.userName}</strong>.
            </p>
            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white mb-4"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setRejectionModalPayment(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReviewPayment(rejectionModalPayment.id, 'rejected', rejectionReason)}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: FIREBASE & STORAGE DEPLOYMENT GUIDE */}
      {firebaseGuideOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
          <div className="relative max-w-2xl w-full bg-[#0d1222] border border-indigo-500/30 rounded-2xl p-6 sm:p-8 max-h-[85vh] overflow-y-auto text-xs text-slate-300 space-y-4">
            <button
              onClick={() => setFirebaseGuideOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800">
              <Database className="w-5 h-5 text-indigo-400" />
              <h3 className="text-base font-bold text-white">Firebase & Production Deployment Guide</h3>
            </div>

            <p className="leading-relaxed">
              Method Tricks is architected with a full-stack Node.js & Express REST layer that saves all state persistently in <code className="text-purple-300">server_db/data.json</code>. You can deploy this applet directly or connect it to Firebase Authentication and Cloud Firestore!
            </p>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <h4 className="font-bold text-white uppercase text-[11px]">Recommended Firestore Collections Schema</h4>
              <ul className="list-disc pl-4 space-y-1 text-slate-400">
                <li><code className="text-white">users</code>: user profile, role (simple | premium | admin), premiumExpiresAt, status</li>
                <li><code className="text-white">methods</code>: title, type (simple | premium), category, videoUrl, downloadAllowed</li>
                <li><code className="text-white">courses</code>: title, type, category, lessons array with order, instructor</li>
                <li><code className="text-white">payments</code>: userId, transactionId, method (bKash/Nagad), screenshotUrl, status</li>
                <li><code className="text-white">settings</code>: website metadata, bKash/Nagad phone numbers and instructions</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <h4 className="font-bold text-white uppercase text-[11px]">Security Rules Rule-set:</h4>
              <pre className="p-3 bg-black/80 rounded font-mono text-[11px] text-slate-400 overflow-x-auto">
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId || request.auth.token.role == 'admin';
    }
    match /methods/{id} {
      allow read: if resource.data.type == 'simple' || request.auth.token.role in ['premium', 'admin'];
      allow write: if request.auth.token.role == 'admin';
    }
    match /payments/{paymentId} {
      allow create: if request.auth != null;
      allow read, write: if request.auth.token.role == 'admin';
    }
  }
}`}
              </pre>
            </div>

            <button
              onClick={() => setFirebaseGuideOpen(false)}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl"
            >
              Done Reading
            </button>
          </div>
        </div>
      )}

      {/* MODAL: CREATE / EDIT MEMBERSHIP PACKAGE */}
      {packageModalOpen && editingPackage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative max-w-lg w-full bg-[#0f1422] border border-slate-800 rounded-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setPackageModalOpen(false);
                setEditingPackage(null);
                setNewBenefitText('');
              }}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <Tag className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-bold text-white">
                {editingPackage.id ? 'Edit Membership Package' : 'Create New Membership Package'}
              </h3>
            </div>
            <p className="text-xs text-slate-400 mb-6">
              Set package title, membership duration, and price in BDT (৳).
            </p>

            <form onSubmit={handleSavePackage} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Package Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 7 Days Trial Pass, 30 Days Monthly Pass, 365 Days VIP Pass"
                  value={editingPackage.name || ''}
                  onChange={(e) => setEditingPackage({ ...editingPackage, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Duration (in Days) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={3650}
                    placeholder="e.g. 7, 30, 90, 365"
                    value={editingPackage.durationDays || ''}
                    onChange={(e) => setEditingPackage({ ...editingPackage, durationDays: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs font-mono focus:outline-none focus:border-purple-500"
                  />
                  <div className="text-[10px] text-slate-500 mt-1">E.g. 7, 30, 90, 365</div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Price in BDT (৳ Taka) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs font-bold text-purple-400">৳</span>
                    <input
                      type="number"
                      required
                      min={0}
                      placeholder="e.g. 300, 850, 2200"
                      value={editingPackage.priceBDT || ''}
                      onChange={(e) => setEditingPackage({ ...editingPackage, priceBDT: Number(e.target.value) })}
                      className="w-full pl-7 pr-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs font-mono font-bold focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">Amount user pays via bKash/Nagad</div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Short summary of this membership pass..."
                  value={editingPackage.description || ''}
                  onChange={(e) => setEditingPackage({ ...editingPackage, description: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs placeholder-slate-500 focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>

              {/* Benefits list builder */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Package Benefits & Perks (shown with checkmarks)
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="e.g. Full Access to All VIP Methods"
                    value={newBenefitText}
                    onChange={(e) => setNewBenefitText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (newBenefitText.trim()) {
                          const current = editingPackage.benefits || [];
                          setEditingPackage({
                            ...editingPackage,
                            benefits: [...current, newBenefitText.trim()]
                          });
                          setNewBenefitText('');
                        }
                      }
                    }}
                    className="flex-1 px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newBenefitText.trim()) {
                        const current = editingPackage.benefits || [];
                        setEditingPackage({
                          ...editingPackage,
                          benefits: [...current, newBenefitText.trim()]
                        });
                        setNewBenefitText('');
                      }
                    }}
                    className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold cursor-pointer"
                  >
                    + Add
                  </button>
                </div>

                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {(editingPackage.benefits || []).map((b, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-900/90 border border-slate-800 text-xs text-slate-200"
                    >
                      <span className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                        <span className="text-[11px]">{b}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = (editingPackage.benefits || []).filter((_, i) => i !== idx);
                          setEditingPackage({ ...editingPackage, benefits: updated });
                        }}
                        className="text-slate-500 hover:text-rose-400 p-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="pt-2 grid grid-cols-2 gap-4 border-t border-slate-800">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingPackage.isActive !== false}
                    onChange={(e) => setEditingPackage({ ...editingPackage, isActive: e.target.checked })}
                    className="rounded border-slate-700 text-purple-600 focus:ring-0 w-4 h-4"
                  />
                  <span>Active & Visible to Public</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-purple-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(editingPackage.isPopular)}
                    onChange={(e) => setEditingPackage({ ...editingPackage, isPopular: e.target.checked })}
                    className="rounded border-slate-700 text-purple-600 focus:ring-0 w-4 h-4"
                  />
                  <span>Highlight as "Most Popular"</span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setPackageModalOpen(false);
                    setEditingPackage(null);
                    setNewBenefitText('');
                  }}
                  className="px-4 py-2.5 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-lg shadow-purple-600/30 cursor-pointer"
                >
                  {editingPackage.id ? 'Save Changes' : 'Publish Package'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
