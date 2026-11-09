export type UserRole = 'simple' | 'premium' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  createdAt: string;
  premiumExpiresAt?: string | null;
  status: 'active' | 'suspended';
  downloadHistory?: string[];
  enrolledCourses?: string[];
}

export type MethodType = 'simple' | 'premium';
export type CourseType = 'simple' | 'premium';

export interface MethodItem {
  id: string;
  title: string;
  type: MethodType; // 'simple' or 'premium'
  category: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
  videoSourceType: 'direct' | 'youtube' | 'drive';
  downloadAllowed: boolean;
  downloadUrl?: string;
  fileName?: string;
  fileSize?: string;
  views: number;
  likes: number;
  isPublished: boolean;
  uploadDate: string;
}

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  videoUrl: string;
  description: string;
  downloadUrl?: string;
  fileName?: string;
  order: number;
}

export interface CourseItem {
  id: string;
  title: string;
  type: CourseType; // 'simple' or 'premium'
  category: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
  downloadAllowed: boolean;
  downloadUrl?: string;
  fileName?: string;
  isPublished: boolean;
  uploadDate: string;
  order: number;
  totalDuration: string;
  lessons: Lesson[];
  instructor: string;
}

export interface MembershipPackage {
  id: string;
  name: string;
  priceBDT: number;
  durationDays: number;
  description: string;
  benefits: string[];
  isActive: boolean;
  isPopular?: boolean;
}

export interface PaymentSubmission {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  packageId: string;
  packageName: string;
  packageDays: number;
  amountBDT: number;
  method: 'bKash' | 'Nagad';
  senderNumber: string;
  transactionId: string;
  screenshotUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface Advertisement {
  id: string;
  title: string;
  imageUrl: string;
  targetUrl: string;
  placement: 'home_top' | 'home_sidebar' | 'video_banner' | 'download_page' | 'course_bottom';
  isEnabled: boolean;
  displayOrder: number;
  clicks: number;
}

export interface NotificationItem {
  id: string;
  userId?: string; // empty means broadcast to all
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'payment';
  createdAt: string;
  isRead: boolean;
}

export interface WebsiteSettings {
  websiteName: string;
  logoText: string;
  logoSubtitle: string;
  faviconUrl: string;
  description: string;
  heroHeadline: string;
  heroSubheadline: string;
  bannerImageUrl: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  telegramChannel: string;
  facebookPage: string;
  youtubeChannel: string;
  bKashNumber: string;
  bKashType: 'Personal' | 'Merchant';
  bKashInstructions: string;
  nagadNumber: string;
  nagadType: 'Personal' | 'Merchant';
  nagadInstructions: string;
  termsAndConditions: string;
  privacyPolicy: string;
  aboutText: string;
}
