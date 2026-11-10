import React, { createContext, useContext, useState, useEffect } from 'react';
import type { 
  WebsiteSettings, 
  Advertisement, 
  NotificationItem, 
  MembershipPackage,
  MethodItem,
  CourseItem
} from '../types/index.ts';
import { useAuth } from './AuthContext.tsx';
import { 
  firebaseGetPackages, 
  firebaseGetMethods, 
  firebaseGetCourses 
} from '../lib/firebaseService.ts';

export type AppPage = 
  | 'home' 
  | 'methods' 
  | 'simple-methods' 
  | 'premium-methods' 
  | 'courses' 
  | 'simple-courses' 
  | 'premium-courses' 
  | 'packages' 
  | 'payment-verify' 
  | 'login' 
  | 'register' 
  | 'dashboard' 
  | 'about' 
  | 'contact' 
  | 'privacy' 
  | 'terms' 
  | 'admin-login' 
  | 'admin-dashboard' 
  | 'method-detail' 
  | 'course-detail';

interface AppContextType {
  currentPage: AppPage;
  setCurrentPage: (page: AppPage) => void;
  selectedItemId: string | null;
  openMethodDetail: (id: string) => void;
  openCourseDetail: (id: string) => void;
  selectedPackageForPayment: MembershipPackage | null;
  setSelectedPackageForPayment: (pkg: MembershipPackage | null) => void;
  settings: WebsiteSettings | null;
  refreshSettings: () => Promise<void>;
  ads: Advertisement[];
  notifications: NotificationItem[];
  refreshNotifications: () => Promise<void>;
  packages: MembershipPackage[];
  refreshPackages: () => Promise<void>;
  methods: MethodItem[];
  courses: CourseItem[];
  refreshContent: () => Promise<void>;
  // Premium Gate Modal
  premiumModalOpen: boolean;
  premiumModalContent: {
    title: string;
    message: string;
    itemType: 'method' | 'course';
  };
  triggerPremiumGate: (itemType: 'method' | 'course') => void;
  closePremiumGate: () => void;
  // Toast notifications
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, isPremium, isAdmin } = useAuth();
  
  // Initialize from hash if #admin
  const [currentPage, setCurrentPageState] = useState<AppPage>(() => {
    if (typeof window !== 'undefined' && window.location.hash === '#admin') {
      return 'admin-login';
    }
    return 'home';
  });

  const setCurrentPage = (page: AppPage) => {
    if (typeof window !== 'undefined') {
      if (page === 'admin-dashboard' || page === 'admin-login') {
        if (window.location.hash !== '#admin') {
          window.location.hash = 'admin';
        }
      } else {
        if (window.location.hash === '#admin') {
          window.history.pushState(null, '', window.location.pathname);
        }
      }
    }
    setCurrentPageState(page);
  };

  // Listen to #admin hash changes from URL bar
  useEffect(() => {
    const handleHashCheck = () => {
      if (window.location.hash === '#admin') {
        if (isAdmin) {
          setCurrentPageState('admin-dashboard');
        } else {
          setCurrentPageState('admin-login');
        }
      } else if (!window.location.hash && (currentPage === 'admin-login' || currentPage === 'admin-dashboard')) {
        setCurrentPageState('home');
      }
    };

    handleHashCheck();
    window.addEventListener('hashchange', handleHashCheck);
    return () => window.removeEventListener('hashchange', handleHashCheck);
  }, [isAdmin, currentPage]);

  // When admin logs in while on #admin, automatically promote to admin-dashboard
  useEffect(() => {
    if (isAdmin && (currentPage === 'admin-login' || window.location.hash === '#admin')) {
      setCurrentPageState('admin-dashboard');
    }
  }, [isAdmin]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedPackageForPayment, setSelectedPackageForPayment] = useState<MembershipPackage | null>(null);
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [packages, setPackages] = useState<MembershipPackage[]>([]);
  const [methods, setMethods] = useState<MethodItem[]>([]);
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const [premiumModalOpen, setPremiumModalOpen] = useState(false);
  const [premiumModalContent, setPremiumModalContent] = useState<{
    title: string;
    message: string;
    itemType: 'method' | 'course';
  }>({
    title: 'Premium Membership Required!',
    message: 'Purchase a Premium Package to unlock this method.',
    itemType: 'method'
  });

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const triggerPremiumGate = (itemType: 'method' | 'course') => {
    if (itemType === 'method') {
      setPremiumModalContent({
        title: 'Premium Membership Required!',
        message: 'Purchase a Premium Package to unlock this method.',
        itemType: 'method'
      });
    } else {
      setPremiumModalContent({
        title: 'Premium Membership Required!',
        message: 'This is a Premium Course. Buy a Premium Package to access this course.',
        itemType: 'course'
      });
    }
    setPremiumModalOpen(true);
  };

  const closePremiumGate = () => {
    setPremiumModalOpen(false);
  };

  const openMethodDetail = (id: string) => {
    setSelectedItemId(id);
    setCurrentPage('method-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openCourseDetail = (id: string) => {
    setSelectedItemId(id);
    setCurrentPage('course-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const refreshSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (err) {
      console.error('Error fetching settings', err);
    }
  };

  const refreshAds = async () => {
    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch('/api/ads', { headers });
      if (res.ok) {
        const data = await res.json();
        setAds(data);
      }
    } catch (err) {
      console.error('Error fetching ads', err);
    }
  };

  const refreshNotifications = async () => {
    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch('/api/notifications', { headers });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error('Error fetching notifications', err);
    }
  };

  const refreshPackages = async () => {
    try {
      const res = await fetch('/api/packages');
      if (res.ok) {
        const data = await res.json();
        setPackages(data.filter((p: MembershipPackage) => p.isActive));
        return;
      }
    } catch {
      // Fallback to Firebase directly on Static Site
    }
    try {
      const fbPackages = await firebaseGetPackages();
      setPackages(fbPackages.filter((p: MembershipPackage) => p.isActive));
    } catch (err) {
      console.error('Error fetching packages from Firebase', err);
    }
  };

  const refreshContent = async () => {
    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      
      const [methodsRes, coursesRes] = await Promise.all([
        fetch('/api/methods', { headers }),
        fetch('/api/courses', { headers })
      ]);
      
      if (methodsRes.ok && coursesRes.ok) {
        const mData = await methodsRes.json();
        const cData = await coursesRes.json();
        setMethods(mData);
        setCourses(cData);
        return;
      }
    } catch {
      // Fallback to Firebase directly on Static Site
    }
    try {
      const [fbMethods, fbCourses] = await Promise.all([
        firebaseGetMethods(),
        firebaseGetCourses()
      ]);
      setMethods(fbMethods);
      setCourses(fbCourses);
    } catch (err) {
      console.error('Error fetching content from Firebase', err);
    }
  };

  useEffect(() => {
    refreshSettings();
    refreshPackages();
    refreshContent();
  }, [token]);

  useEffect(() => {
    refreshAds();
    refreshNotifications();
  }, [token, isPremium]);

  return (
    <AppContext.Provider
      value={{
        currentPage,
        setCurrentPage,
        selectedItemId,
        openMethodDetail,
        openCourseDetail,
        selectedPackageForPayment,
        setSelectedPackageForPayment,
        settings,
        refreshSettings,
        ads,
        notifications,
        refreshNotifications,
        packages,
        refreshPackages,
        methods,
        courses,
        refreshContent,
        premiumModalOpen,
        premiumModalContent,
        triggerPremiumGate,
        closePremiumGate,
        toast,
        showToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
