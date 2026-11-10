import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  deleteDoc, 
  updateDoc 
} from 'firebase/firestore';
import { db } from './firebase.ts';
import type { 
  User, 
  MethodItem, 
  CourseItem, 
  MembershipPackage, 
  PaymentSubmission, 
  WebsiteSettings 
} from '../types/index.ts';

// Simple deterministic hash for password check in client
export async function hashPasswordClient(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// --- USER & AUTH ---

export async function firebaseRegisterUser(
  name: string, 
  email: string, 
  phone: string, 
  pass: string
): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const cleanEmail = email.trim().toLowerCase();
    const userDocRef = doc(db, 'users', cleanEmail.replace(/[^a-z0-9]/g, '_'));
    const existing = await getDoc(userDocRef);
    if (existing.exists()) {
      return { success: false, error: 'An account with this email already exists.' };
    }

    const passwordHash = await hashPasswordClient(pass);
    const userId = 'usr_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
    
    const newUserRecord: User & { passwordHash: string } = {
      id: userId,
      name: name.trim(),
      email: cleanEmail,
      phone: phone.trim(),
      role: 'simple',
      createdAt: new Date().toISOString(),
      status: 'active',
      passwordHash,
      downloadHistory: [],
      enrolledCourses: []
    };

    await setDoc(userDocRef, newUserRecord);
    
    const { passwordHash: _, ...safeUser } = newUserRecord;
    return { success: true, user: safeUser };
  } catch (err: any) {
    console.error('Firebase registration error', err);
    return { success: false, error: err.message || 'Registration failed' };
  }
}

export async function firebaseLoginUser(
  email: string, 
  pass: string
): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const cleanEmail = email.trim().toLowerCase();
    
    // Check hardcoded admin credentials
    if (cleanEmail === 'adminshykot@gmail.com' && pass === 'adminSHYKOT') {
      const adminUser: User = {
        id: 'usr_admin',
        name: 'Shykot Admin',
        email: 'adminSHYKOT@gmail.com',
        phone: '01700-000000',
        role: 'admin',
        createdAt: '2026-01-01T00:00:00.000Z',
        status: 'active'
      };
      return { success: true, user: adminUser };
    }

    const userDocRef = doc(db, 'users', cleanEmail.replace(/[^a-z0-9]/g, '_'));
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      return { success: false, error: 'No account found with this email.' };
    }

    const userData = userDoc.data() as User & { passwordHash: string };
    const inputHash = await hashPasswordClient(pass);

    if (userData.passwordHash !== inputHash) {
      return { success: false, error: 'Incorrect password. Please try again.' };
    }

    if (userData.status === 'suspended') {
      return { success: false, error: 'Your account has been suspended by administration.' };
    }

    const { passwordHash: _, ...safeUser } = userData;
    return { success: true, user: safeUser };
  } catch (err: any) {
    console.error('Firebase login error', err);
    return { success: false, error: err.message || 'Login failed' };
  }
}

export async function firebaseAdminLogin(
  email: string, 
  pass: string
): Promise<{ success: boolean; user?: User; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  if (cleanEmail === 'adminshykot@gmail.com' && pass === 'adminSHYKOT') {
    const adminUser: User = {
      id: 'usr_admin',
      name: 'Shykot Admin',
      email: 'adminSHYKOT@gmail.com',
      phone: '01700-000000',
      role: 'admin',
      createdAt: '2026-01-01T00:00:00.000Z',
      status: 'active'
    };
    return { success: true, user: adminUser };
  }
  return { success: false, error: 'Invalid admin credentials.' };
}

// --- PACKAGES ---

export async function firebaseGetPackages(): Promise<MembershipPackage[]> {
  try {
    const snap = await getDocs(collection(db, 'packages'));
    const list: MembershipPackage[] = [];
    snap.forEach(d => list.push(d.data() as MembershipPackage));
    return list;
  } catch (err) {
    console.error('Firebase get packages error', err);
    return [];
  }
}

export async function firebaseSavePackage(pkg: Partial<MembershipPackage>): Promise<MembershipPackage> {
  const id = pkg.id || 'pkg_' + Date.now().toString(36);
  const fullPkg: MembershipPackage = {
    id,
    name: pkg.name || 'VIP Pass',
    priceBDT: Number(pkg.priceBDT || 500),
    durationDays: Number(pkg.durationDays || 30),
    description: pkg.description || '',
    benefits: pkg.benefits || ['All VIP Methods', 'Fast Downloads', 'No Ads'],
    isActive: pkg.isActive !== false,
    isPopular: Boolean(pkg.isPopular)
  };
  await setDoc(doc(db, 'packages', id), fullPkg);
  return fullPkg;
}

export async function firebaseDeletePackage(id: string): Promise<void> {
  await deleteDoc(doc(db, 'packages', id));
}

// --- METHODS ---

export async function firebaseGetMethods(): Promise<MethodItem[]> {
  try {
    const snap = await getDocs(collection(db, 'methods'));
    const list: MethodItem[] = [];
    snap.forEach(d => list.push(d.data() as MethodItem));
    return list;
  } catch (err) {
    console.error('Firebase get methods error', err);
    return [];
  }
}

export async function firebaseSaveMethod(method: Partial<MethodItem>): Promise<MethodItem> {
  const id = method.id || 'm_' + Date.now().toString(36);
  const fullMethod: MethodItem = {
    id,
    title: method.title || 'Untitled Method',
    type: method.type || 'simple',
    category: method.category || 'General',
    description: method.description || '',
    thumbnailUrl: method.thumbnailUrl || '/src/assets/images/hero_method_tricks_tech_1794218786220.jpg',
    videoUrl: method.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    videoSourceType: method.videoSourceType || 'direct',
    downloadAllowed: method.downloadAllowed !== false,
    downloadUrl: method.downloadUrl || '',
    fileName: method.fileName || 'bundle.zip',
    fileSize: method.fileSize || '15.0 MB',
    views: method.views || 0,
    likes: method.likes || 0,
    isPublished: method.isPublished !== false,
    uploadDate: method.uploadDate || new Date().toISOString()
  };
  await setDoc(doc(db, 'methods', id), fullMethod);
  return fullMethod;
}

export async function firebaseDeleteMethod(id: string): Promise<void> {
  await deleteDoc(doc(db, 'methods', id));
}

// --- COURSES ---

export async function firebaseGetCourses(): Promise<CourseItem[]> {
  try {
    const snap = await getDocs(collection(db, 'courses'));
    const list: CourseItem[] = [];
    snap.forEach(d => list.push(d.data() as CourseItem));
    return list;
  } catch (err) {
    console.error('Firebase get courses error', err);
    return [];
  }
}

export async function firebaseSaveCourse(course: Partial<CourseItem>): Promise<CourseItem> {
  const id = course.id || 'c_' + Date.now().toString(36);
  const fullCourse: CourseItem = {
    id,
    title: course.title || 'Masterclass Course',
    type: course.type || 'simple',
    category: course.category || 'Digital Skills',
    description: course.description || '',
    thumbnailUrl: course.thumbnailUrl || '/src/assets/images/course_mastery_preview_1794218786269.jpg',
    videoUrl: course.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    downloadAllowed: course.downloadAllowed !== false,
    downloadUrl: course.downloadUrl || '',
    fileName: course.fileName || 'starter.zip',
    isPublished: course.isPublished !== false,
    uploadDate: course.uploadDate || new Date().toISOString(),
    order: course.order || 1,
    totalDuration: course.totalDuration || '3 Hours',
    lessons: course.lessons || [],
    instructor: course.instructor || 'Lead Specialist'
  };
  await setDoc(doc(db, 'courses', id), fullCourse);
  return fullCourse;
}

export async function firebaseDeleteCourse(id: string): Promise<void> {
  await deleteDoc(doc(db, 'courses', id));
}

// --- PAYMENTS ---

export async function firebaseSubmitPayment(payment: {
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
}): Promise<PaymentSubmission> {
  const id = 'pay_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
  const submission: PaymentSubmission = {
    id,
    ...payment,
    status: 'pending',
    submittedAt: new Date().toISOString()
  };
  await setDoc(doc(db, 'payments', id), submission);
  return submission;
}

export async function firebaseGetPayments(): Promise<PaymentSubmission[]> {
  try {
    const snap = await getDocs(collection(db, 'payments'));
    const list: PaymentSubmission[] = [];
    snap.forEach(d => list.push(d.data() as PaymentSubmission));
    return list;
  } catch (err) {
    console.error('Firebase get payments error', err);
    return [];
  }
}

export async function firebaseUpdatePaymentStatus(
  id: string, 
  status: 'approved' | 'rejected', 
  rejectionReason?: string
): Promise<void> {
  const payRef = doc(db, 'payments', id);
  await updateDoc(payRef, {
    status,
    rejectionReason: rejectionReason || '',
    reviewedAt: new Date().toISOString(),
    reviewedBy: 'Shykot Admin'
  });

  // If approved, upgrade user to premium in Firestore
  if (status === 'approved') {
    const payDoc = await getDoc(payRef);
    if (payDoc.exists()) {
      const data = payDoc.data() as PaymentSubmission;
      if (data.userEmail) {
        const userRef = doc(db, 'users', data.userEmail.replace(/[^a-z0-9]/g, '_'));
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + (data.packageDays || 30));
          await updateDoc(userRef, {
            role: 'premium',
            premiumExpiresAt: expiresAt.toISOString()
          });
        }
      }
    }
  }
}

// --- USERS LIST (ADMIN) ---

export async function firebaseGetUsers(): Promise<User[]> {
  try {
    const snap = await getDocs(collection(db, 'users'));
    const list: User[] = [];
    snap.forEach(d => {
      const data = d.data() as User & { passwordHash?: string };
      const { passwordHash: _, ...safeUser } = data;
      list.push(safeUser);
    });
    return list;
  } catch (err) {
    console.error('Firebase get users error', err);
    return [];
  }
}
