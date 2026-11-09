import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import type { 
  User, 
  MethodItem, 
  CourseItem, 
  MembershipPackage, 
  PaymentSubmission, 
  Advertisement, 
  NotificationItem, 
  WebsiteSettings 
} from './src/types/index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Body parsing with 50mb limit for screenshots/thumbnails
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Database directory & persistent file
const DB_DIR = path.join(__dirname, 'server_db');
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}
const DB_FILE = path.join(DB_DIR, 'data.json');

interface AppData {
  users: (User & { passwordHash: string })[];
  methods: MethodItem[];
  courses: CourseItem[];
  packages: MembershipPackage[];
  payments: PaymentSubmission[];
  advertisements: Advertisement[];
  notifications: NotificationItem[];
  settings: WebsiteSettings;
}

// Initial default seed state
const initialData: AppData = {
  settings: {
    websiteName: 'Method Tricks',
    logoText: 'MethodTricks',
    logoSubtitle: 'Learning Platform',
    faviconUrl: '',
    description: 'Master practical digital skills, exclusive modern methods, tricks, and comprehensive courses with tiered access.',
    heroHeadline: 'Unlock Modern Methods & Master Real-World Digital Skills',
    heroSubheadline: 'Explore tested digital strategies, step-by-step methods, and hands-on courses curated for creators, tech enthusiasts, and digital entrepreneurs.',
    bannerImageUrl: '/src/assets/images/hero_method_tricks_tech_1794218786220.jpg',
    contactEmail: 'support@methodtricks.com',
    contactPhone: '+880 1711-000000',
    contactAddress: 'Dhaka, Bangladesh',
    telegramChannel: 'https://t.me/methodtricks_bd',
    facebookPage: 'https://facebook.com/methodtricksofficial',
    youtubeChannel: 'https://youtube.com/@methodtricks',
    bKashNumber: '01711-223344',
    bKashType: 'Personal',
    bKashInstructions: 'Go to your bKash app -> Send Money to our Personal Number -> Copy the Transaction ID (TrxID) and take a clear screenshot of the confirmation message.',
    nagadNumber: '01811-556677',
    nagadType: 'Personal',
    nagadInstructions: 'Go to your Nagad app -> Send Money to our Personal Number -> Copy the Transaction ID (TrxID) and take a screenshot of the successful transaction.',
    termsAndConditions: 'Welcome to Method Tricks. All content is for educational purposes. Premium accounts may not be shared or resold. Violations result in instant suspension without refund.',
    privacyPolicy: 'We respect your privacy. User phone numbers and payment records are kept strictly confidential and used solely for membership verification.',
    aboutText: 'Method Tricks is an educational platform dedicated to delivering practical digital methods, technology tricks, and masterclass courses for learners of all levels.'
  },
  users: [
    {
      id: 'usr_admin',
      name: 'Shykot Admin',
      email: 'adminSHYKOT@gmail.com',
      phone: '01700-000000',
      role: 'admin',
      createdAt: '2026-01-01T00:00:00.000Z',
      status: 'active',
      passwordHash: hashPassword('adminSHYKOT')
    }
  ],
  packages: [],
  methods: [],
  courses: [],
  payments: [],
  advertisements: [],
  notifications: []
};

// Utility functions for Database
function readDB(): AppData {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      parsed.packages = Array.isArray(parsed.packages) ? parsed.packages : [];
      parsed.methods = Array.isArray(parsed.methods) ? parsed.methods : [];
      parsed.courses = Array.isArray(parsed.courses) ? parsed.courses : [];
      parsed.payments = Array.isArray(parsed.payments) ? parsed.payments : [];
      parsed.advertisements = Array.isArray(parsed.advertisements) ? parsed.advertisements : [];
      parsed.notifications = Array.isArray(parsed.notifications) ? parsed.notifications : [];
      parsed.users = Array.isArray(parsed.users) ? parsed.users : [];

      const admin = parsed.users.find((u: any) => u.role === 'admin' || u.email.toLowerCase() === 'adminshykot@gmail.com');
      if (admin) {
        admin.email = 'adminSHYKOT@gmail.com';
        admin.name = 'Shykot Admin';
        admin.role = 'admin';
        admin.status = 'active';
        admin.passwordHash = hashPassword('adminSHYKOT');
      } else {
        parsed.users.unshift({
          id: 'usr_admin',
          name: 'Shykot Admin',
          email: 'adminSHYKOT@gmail.com',
          phone: '01700-000000',
          role: 'admin',
          createdAt: new Date().toISOString(),
          status: 'active',
          passwordHash: hashPassword('adminSHYKOT')
        });
      }
      return parsed;
    }
  } catch (err) {
    console.error('Error reading DB, using initial data', err);
  }
  // Initialize with seed
  writeDB(initialData);
  return initialData;
}

function writeDB(data: AppData) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing DB', err);
  }
}

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + '_salt_mt_2026').digest('hex');
}

function generateToken(user: User): string {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000
  };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

function parseToken(token?: string): { id: string; email: string; role: string; expires: number } | null {
  if (!token) return null;
  try {
    const raw = Buffer.from(token.replace('Bearer ', ''), 'base64').toString('utf-8');
    const parsed = JSON.parse(raw);
    if (parsed.expires < Date.now()) return null;
    return parsed;
  } catch {
    return null;
  }
}

// Ensure database file exists on startup
readDB();

// ==========================================
// REST API ENDPOINTS
// ==========================================

// --- AUTHENTICATION ---

// Register
app.post('/api/auth/register', (req, res) => {
  const { name, email, phone, password } = req.body;
  if (!name || !email || !phone || !password) {
    return res.status(400).json({ error: 'All fields (name, email, phone, password) are required.' });
  }

  const db = readDB();
  const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: 'An account with this email already exists.' });
  }

  const newUser: User & { passwordHash: string } = {
    id: 'usr_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
    name: name.trim(),
    email: email.trim().toLowerCase(),
    phone: phone.trim(),
    role: 'simple', // New registered users automatically become Simple Users
    createdAt: new Date().toISOString(),
    status: 'active',
    passwordHash: hashPassword(password),
    downloadHistory: []
  };

  db.users.push(newUser);
  
  // Add welcome notification
  db.notifications.push({
    id: 'notif_' + Date.now(),
    userId: newUser.id,
    title: 'Account Created Successfully!',
    message: 'Welcome to Method Tricks. You are currently a Simple User. Upgrade to Premium anytime to unlock all VIP methods.',
    type: 'success',
    createdAt: new Date().toISOString(),
    isRead: false
  });

  writeDB(db);

  const { passwordHash: _, ...safeUser } = newUser;
  const token = generateToken(safeUser);
  return res.json({ user: safeUser, token });
});

// Login (User)
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const db = readDB();
  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  if (user.passwordHash !== hashPassword(password)) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  if (user.status === 'suspended') {
    return res.status(403).json({ error: 'Your account has been suspended by administration. Please contact support.' });
  }

  // Check if premium status expired
  if (user.role === 'premium' && user.premiumExpiresAt) {
    if (new Date(user.premiumExpiresAt).getTime() < Date.now()) {
      user.role = 'simple';
      writeDB(db);
    }
  }

  const { passwordHash: _, ...safeUser } = user;
  const token = generateToken(safeUser);
  return res.json({ user: safeUser, token });
});

// Admin Login
app.post('/api/auth/admin-login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Admin email and password are required.' });
  }

  const db = readDB();
  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user || user.passwordHash !== hashPassword(password)) {
    return res.status(401).json({ error: 'Invalid admin credentials.' });
  }

  if (user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied: Admin privileges required.' });
  }

  const { passwordHash: _, ...safeUser } = user;
  const token = generateToken(safeUser);
  return res.json({ user: safeUser, token });
});

// Current User Profile (/api/auth/me)
app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  const decoded = parseToken(authHeader);
  if (!decoded) {
    return res.status(401).json({ error: 'Unauthorized or token expired.' });
  }

  const db = readDB();
  const user = db.users.find(u => u.id === decoded.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  // Check expiration
  if (user.role === 'premium' && user.premiumExpiresAt) {
    if (new Date(user.premiumExpiresAt).getTime() < Date.now()) {
      user.role = 'simple';
      writeDB(db);
    }
  }

  const { passwordHash: _, ...safeUser } = user;
  return res.json({ user: safeUser });
});

// Update Profile
app.put('/api/auth/profile', (req, res) => {
  const authHeader = req.headers.authorization;
  const decoded = parseToken(authHeader);
  if (!decoded) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }

  const { name, phone, currentPassword, newPassword } = req.body;
  const db = readDB();
  const userIndex = db.users.findIndex(u => u.id === decoded.id);
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found.' });
  }

  const user = db.users[userIndex];
  if (name) user.name = name.trim();
  if (phone) user.phone = phone.trim();

  if (newPassword) {
    if (!currentPassword || hashPassword(currentPassword) !== user.passwordHash) {
      return res.status(400).json({ error: 'Current password does not match.' });
    }
    user.passwordHash = hashPassword(newPassword);
  }

  db.users[userIndex] = user;
  writeDB(db);

  const { passwordHash: _, ...safeUser } = user;
  return res.json({ success: true, user: safeUser });
});

// Forgot Password
app.post('/api/auth/forgot-password', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required.' });

  const db = readDB();
  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    // Return standard success to avoid email enumeration
    return res.json({ success: true, message: 'If an account exists, a reset link has been dispatched.' });
  }

  // Reset to default temporary password or simulate
  const tempPass = 'reset' + Math.floor(100000 + Math.random() * 900000);
  user.passwordHash = hashPassword(tempPass);
  writeDB(db);

  return res.json({ 
    success: true, 
    message: `Password reset instructions sent. Demo temporary password: ${tempPass}` 
  });
});

// --- METHODS API ---

// GET /api/methods (with optional type filtering & access control)
app.get('/api/methods', (req, res) => {
  const { type, category, search } = req.query;
  const authHeader = req.headers.authorization;
  const decoded = parseToken(authHeader);
  const db = readDB();

  let list = db.methods;

  // Filter unpublished if not admin
  if (!decoded || decoded.role !== 'admin') {
    list = list.filter(m => m.isPublished);
  }

  if (type === 'simple' || type === 'premium') {
    list = list.filter(m => m.type === type);
  }

  if (category && category !== 'All') {
    list = list.filter(m => m.category === category);
  }

  if (search && typeof search === 'string') {
    const s = search.toLowerCase();
    list = list.filter(m => m.title.toLowerCase().includes(s) || m.description.toLowerCase().includes(s));
  }

  // SECURITY: Protect video and download URLs for premium methods from simple/unauthenticated users!
  const isPremiumOrAdmin = decoded && (decoded.role === 'premium' || decoded.role === 'admin');

  const sanitizedList = list.map(m => {
    if (m.type === 'premium' && !isPremiumOrAdmin) {
      return {
        ...m,
        videoUrl: '', // Hide real stream URL
        downloadUrl: '', // Hide download link
        isLocked: true
      };
    }
    return {
      ...m,
      isLocked: false
    };
  });

  return res.json(sanitizedList);
});

// GET /api/methods/:id
app.get('/api/methods/:id', (req, res) => {
  const authHeader = req.headers.authorization;
  const decoded = parseToken(authHeader);
  const db = readDB();

  const method = db.methods.find(m => m.id === req.params.id);
  if (!method) return res.status(404).json({ error: 'Method not found.' });

  // Increment views
  method.views += 1;
  writeDB(db);

  const isPremiumOrAdmin = decoded && (decoded.role === 'premium' || decoded.role === 'admin');
  if (method.type === 'premium' && !isPremiumOrAdmin) {
    return res.json({
      ...method,
      videoUrl: '',
      downloadUrl: '',
      isLocked: true
    });
  }

  return res.json({
    ...method,
    isLocked: false
  });
});

// Admin Method CRUD
app.post('/api/methods', (req, res) => {
  const decoded = parseToken(req.headers.authorization);
  if (!decoded || decoded.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required.' });
  }

  const { title, type, category, description, thumbnailUrl, videoUrl, videoSourceType, downloadAllowed, downloadUrl, fileName, fileSize } = req.body;
  if (!title || !description) {
    return res.status(400).json({ error: 'Title and description are required.' });
  }

  const db = readDB();
  const newMethod: MethodItem = {
    id: 'm_' + (type === 'premium' ? 'prem_' : 'simp_') + Date.now().toString(36),
    title: title.trim(),
    type: type === 'premium' ? 'premium' : 'simple',
    category: category || 'General',
    description: description.trim(),
    thumbnailUrl: thumbnailUrl || '/src/assets/images/hero_method_tricks_tech_1794218786220.jpg',
    videoUrl: videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    videoSourceType: videoSourceType || 'direct',
    downloadAllowed: Boolean(downloadAllowed),
    downloadUrl: downloadUrl || '',
    fileName: fileName || '',
    fileSize: fileSize || '',
    views: 0,
    likes: 0,
    isPublished: true,
    uploadDate: new Date().toISOString().split('T')[0]
  };

  db.methods.unshift(newMethod);
  writeDB(db);
  return res.json({ success: true, method: newMethod });
});

app.put('/api/methods/:id', (req, res) => {
  const decoded = parseToken(req.headers.authorization);
  if (!decoded || decoded.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required.' });
  }

  const db = readDB();
  const idx = db.methods.findIndex(m => m.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Method not found.' });

  db.methods[idx] = {
    ...db.methods[idx],
    ...req.body,
    id: db.methods[idx].id // keep immutable ID
  };
  writeDB(db);
  return res.json({ success: true, method: db.methods[idx] });
});

app.delete('/api/methods/:id', (req, res) => {
  const decoded = parseToken(req.headers.authorization);
  if (!decoded || decoded.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required.' });
  }

  const db = readDB();
  db.methods = db.methods.filter(m => m.id !== req.params.id);
  writeDB(db);
  return res.json({ success: true });
});

// --- COURSES API ---

// GET /api/courses
app.get('/api/courses', (req, res) => {
  const { type, category, search } = req.query;
  const authHeader = req.headers.authorization;
  const decoded = parseToken(authHeader);
  const db = readDB();

  let list = db.courses;

  if (!decoded || decoded.role !== 'admin') {
    list = list.filter(c => c.isPublished);
  }

  if (type === 'simple' || type === 'premium') {
    list = list.filter(c => c.type === type);
  }

  if (category && category !== 'All') {
    list = list.filter(c => c.category === category);
  }

  if (search && typeof search === 'string') {
    const s = search.toLowerCase();
    list = list.filter(c => c.title.toLowerCase().includes(s) || c.description.toLowerCase().includes(s));
  }

  const isPremiumOrAdmin = decoded && (decoded.role === 'premium' || decoded.role === 'admin');

  const sanitizedList = list.map(c => {
    if (c.type === 'premium' && !isPremiumOrAdmin) {
      return {
        ...c,
        videoUrl: '',
        downloadUrl: '',
        lessons: c.lessons.map(l => ({
          ...l,
          videoUrl: '',
          downloadUrl: ''
        })),
        isLocked: true
      };
    }
    return {
      ...c,
      isLocked: false
    };
  });

  return res.json(sanitizedList);
});

// GET /api/courses/:id
app.get('/api/courses/:id', (req, res) => {
  const authHeader = req.headers.authorization;
  const decoded = parseToken(authHeader);
  const db = readDB();

  const course = db.courses.find(c => c.id === req.params.id);
  if (!course) return res.status(404).json({ error: 'Course not found.' });

  const isPremiumOrAdmin = decoded && (decoded.role === 'premium' || decoded.role === 'admin');
  if (course.type === 'premium' && !isPremiumOrAdmin) {
    return res.json({
      ...course,
      videoUrl: '',
      downloadUrl: '',
      lessons: course.lessons.map(l => ({
        ...l,
        videoUrl: '',
        downloadUrl: ''
      })),
      isLocked: true
    });
  }

  return res.json({
    ...course,
    isLocked: false
  });
});

// Admin Course CRUD
app.post('/api/courses', (req, res) => {
  const decoded = parseToken(req.headers.authorization);
  if (!decoded || decoded.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required.' });
  }

  const { title, type, category, description, thumbnailUrl, videoUrl, downloadAllowed, downloadUrl, fileName, lessons, instructor, totalDuration } = req.body;
  if (!title || !description) {
    return res.status(400).json({ error: 'Title and description are required.' });
  }

  const db = readDB();
  const newCourse: CourseItem = {
    id: 'c_' + (type === 'premium' ? 'prem_' : 'simp_') + Date.now().toString(36),
    title: title.trim(),
    type: type === 'premium' ? 'premium' : 'simple',
    category: category || 'General',
    description: description.trim(),
    thumbnailUrl: thumbnailUrl || '/src/assets/images/course_mastery_preview_1794218786269.jpg',
    videoUrl: videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    downloadAllowed: Boolean(downloadAllowed),
    downloadUrl: downloadUrl || '',
    fileName: fileName || '',
    isPublished: true,
    uploadDate: new Date().toISOString().split('T')[0],
    order: db.courses.length + 1,
    totalDuration: totalDuration || '2 Hours',
    instructor: instructor || 'Lead Specialist',
    lessons: Array.isArray(lessons) ? lessons : [
      {
        id: 'l_' + Date.now(),
        title: 'Lesson 1: Introduction & Foundations',
        duration: '25 mins',
        videoUrl: videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        description: 'First module overview and step-by-step setup.',
        order: 1
      }
    ]
  };

  db.courses.unshift(newCourse);
  writeDB(db);
  return res.json({ success: true, course: newCourse });
});

app.put('/api/courses/:id', (req, res) => {
  const decoded = parseToken(req.headers.authorization);
  if (!decoded || decoded.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required.' });
  }

  const db = readDB();
  const idx = db.courses.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Course not found.' });

  db.courses[idx] = {
    ...db.courses[idx],
    ...req.body,
    id: db.courses[idx].id
  };
  writeDB(db);
  return res.json({ success: true, course: db.courses[idx] });
});

app.delete('/api/courses/:id', (req, res) => {
  const decoded = parseToken(req.headers.authorization);
  if (!decoded || decoded.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required.' });
  }

  const db = readDB();
  db.courses = db.courses.filter(c => c.id !== req.params.id);
  writeDB(db);
  return res.json({ success: true });
});

// --- MEMBERSHIP PACKAGES API ---

app.get('/api/packages', (req, res) => {
  const db = readDB();
  return res.json(db.packages);
});

app.post('/api/packages', (req, res) => {
  const decoded = parseToken(req.headers.authorization);
  if (!decoded || decoded.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required.' });
  }

  const { name, priceBDT, durationDays, description, benefits, isActive, isPopular } = req.body;
  if (!name || !priceBDT || !durationDays) {
    return res.status(400).json({ error: 'Name, price, and duration are required.' });
  }

  const db = readDB();
  const newPkg: MembershipPackage = {
    id: 'pkg_' + Date.now().toString(36),
    name: name.trim(),
    priceBDT: Number(priceBDT),
    durationDays: Number(durationDays),
    description: description || '',
    benefits: Array.isArray(benefits) ? benefits : ['All Premium Content Unlocked', 'Zero Ads', 'Fast Direct Downloads'],
    isActive: isActive !== false,
    isPopular: Boolean(isPopular)
  };

  db.packages.push(newPkg);
  writeDB(db);
  return res.json({ success: true, package: newPkg });
});

app.put('/api/packages/:id', (req, res) => {
  const decoded = parseToken(req.headers.authorization);
  if (!decoded || decoded.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required.' });
  }

  const db = readDB();
  const idx = db.packages.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Package not found.' });

  db.packages[idx] = {
    ...db.packages[idx],
    ...req.body,
    priceBDT: req.body.priceBDT ? Number(req.body.priceBDT) : db.packages[idx].priceBDT,
    durationDays: req.body.durationDays ? Number(req.body.durationDays) : db.packages[idx].durationDays
  };
  writeDB(db);
  return res.json({ success: true, package: db.packages[idx] });
});

app.delete('/api/packages/:id', (req, res) => {
  const decoded = parseToken(req.headers.authorization);
  if (!decoded || decoded.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required.' });
  }

  const db = readDB();
  db.packages = db.packages.filter(p => p.id !== req.params.id);
  writeDB(db);
  return res.json({ success: true });
});

// --- PAYMENTS & BKASH / NAGAD VERIFICATION ---

// User submit payment verification
app.post('/api/payments/submit', (req, res) => {
  const authHeader = req.headers.authorization;
  const decoded = parseToken(authHeader);
  if (!decoded) {
    return res.status(401).json({ error: 'Please login to submit payment verification.' });
  }

  const { packageId, method, senderNumber, transactionId, screenshotUrl, amountBDT } = req.body;
  if (!packageId || !method || !senderNumber || !transactionId) {
    return res.status(400).json({ error: 'Package, payment method, sender phone number, and Transaction ID are required.' });
  }

  const db = readDB();
  const user = db.users.find(u => u.id === decoded.id);
  if (!user) return res.status(404).json({ error: 'User not found.' });

  const pkg = db.packages.find(p => p.id === packageId);
  if (!pkg) return res.status(404).json({ error: 'Selected package does not exist.' });

  // Check duplicate TRX ID
  const existingTrx = db.payments.find(p => p.transactionId.trim().toUpperCase() === transactionId.trim().toUpperCase());
  if (existingTrx && existingTrx.status === 'approved') {
    return res.status(400).json({ error: 'This Transaction ID has already been verified and used.' });
  }

  const submission: PaymentSubmission = {
    id: 'pay_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
    userId: user.id,
    userName: user.name,
    userEmail: user.email,
    userPhone: user.phone,
    packageId: pkg.id,
    packageName: pkg.name,
    packageDays: pkg.durationDays,
    amountBDT: amountBDT ? Number(amountBDT) : pkg.priceBDT,
    method: method === 'Nagad' ? 'Nagad' : 'bKash',
    senderNumber: senderNumber.trim(),
    transactionId: transactionId.trim().toUpperCase(),
    screenshotUrl: screenshotUrl || '',
    status: 'pending',
    submittedAt: new Date().toISOString()
  };

  db.payments.unshift(submission);

  // Notify user that submission was received
  db.notifications.push({
    id: 'notif_' + Date.now(),
    userId: user.id,
    title: 'Payment Verification Submitted',
    message: `Your payment of ৳${submission.amountBDT} for ${pkg.name} via ${method} (TrxID: ${submission.transactionId}) is awaiting Admin verification.`,
    type: 'payment',
    createdAt: new Date().toISOString(),
    isRead: false
  });

  writeDB(db);
  return res.json({ success: true, payment: submission });
});

// Admin list all payments
app.get('/api/payments', (req, res) => {
  const decoded = parseToken(req.headers.authorization);
  if (!decoded || decoded.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required.' });
  }

  const db = readDB();
  return res.json(db.payments);
});

// User payment history
app.get('/api/payments/my', (req, res) => {
  const decoded = parseToken(req.headers.authorization);
  if (!decoded) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }

  const db = readDB();
  const list = db.payments.filter(p => p.userId === decoded.id);
  return res.json(list);
});

// Admin verify / approve / reject payment
app.put('/api/payments/:id/review', (req, res) => {
  const decoded = parseToken(req.headers.authorization);
  if (!decoded || decoded.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required.' });
  }

  const { status, rejectionReason } = req.body;
  if (!status || (status !== 'approved' && status !== 'rejected')) {
    return res.status(400).json({ error: 'Status must be approved or rejected.' });
  }

  const db = readDB();
  const payIdx = db.payments.findIndex(p => p.id === req.params.id);
  if (payIdx === -1) return res.status(404).json({ error: 'Payment record not found.' });

  const payment = db.payments[payIdx];
  payment.status = status;
  payment.reviewedAt = new Date().toISOString();
  payment.reviewedBy = decoded.id;
  if (status === 'rejected') {
    payment.rejectionReason = rejectionReason || 'Transaction ID not found in mobile statement.';
  }

  // If approved, automatically upgrade user to Premium for the package duration
  if (status === 'approved') {
    const user = db.users.find(u => u.id === payment.userId);
    if (user) {
      user.role = 'premium';
      // Calculate expiration: if currently active premium, extend from existing expiry, else from now
      let baseTime = Date.now();
      if (user.premiumExpiresAt && new Date(user.premiumExpiresAt).getTime() > Date.now()) {
        baseTime = new Date(user.premiumExpiresAt).getTime();
      }
      const newExpiry = new Date(baseTime + payment.packageDays * 24 * 60 * 60 * 1000).toISOString();
      user.premiumExpiresAt = newExpiry;

      // Create notification
      db.notifications.push({
        id: 'notif_' + Date.now(),
        userId: user.id,
        title: '🎉 Premium Membership Activated!',
        message: `Congratulations! Your payment for ${payment.packageName} has been approved. Your VIP access is valid until ${new Date(newExpiry).toLocaleDateString()}.`,
        type: 'success',
        createdAt: new Date().toISOString(),
        isRead: false
      });
    }
  } else if (status === 'rejected') {
    db.notifications.push({
      id: 'notif_' + Date.now(),
      userId: payment.userId,
      title: 'Payment Verification Declined',
      message: `Your payment verification for ${payment.packageName} (TrxID: ${payment.transactionId}) was rejected. Reason: ${payment.rejectionReason}`,
      type: 'warning',
      createdAt: new Date().toISOString(),
      isRead: false
    });
  }

  db.payments[payIdx] = payment;
  writeDB(db);

  return res.json({ success: true, payment });
});

// --- ADVERTISEMENT MANAGEMENT ---

// GET /api/ads (Active ads for Simple Users, empty for Premium)
app.get('/api/ads', (req, res) => {
  const authHeader = req.headers.authorization;
  const decoded = parseToken(authHeader);
  const db = readDB();

  // Premium users NEVER see advertisements
  if (decoded && decoded.role === 'premium') {
    return res.json([]);
  }

  // Return enabled ads sorted by displayOrder
  const activeAds = db.advertisements
    .filter(a => a.isEnabled)
    .sort((a, b) => a.displayOrder - b.displayOrder);
  return res.json(activeAds);
});

// Admin ads CRUD
app.get('/api/admin/ads', (req, res) => {
  const decoded = parseToken(req.headers.authorization);
  if (!decoded || decoded.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required.' });
  }

  const db = readDB();
  return res.json(db.advertisements);
});

app.post('/api/admin/ads', (req, res) => {
  const decoded = parseToken(req.headers.authorization);
  if (!decoded || decoded.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required.' });
  }

  const { title, imageUrl, targetUrl, placement, isEnabled, displayOrder } = req.body;
  const db = readDB();
  const newAd: Advertisement = {
    id: 'ad_' + Date.now().toString(36),
    title: title || 'Sponsored Promotion',
    imageUrl: imageUrl || '/src/assets/images/hero_method_tricks_tech_1794218786220.jpg',
    targetUrl: targetUrl || 'https://example.com',
    placement: placement || 'home_top',
    isEnabled: isEnabled !== false,
    displayOrder: displayOrder ? Number(displayOrder) : db.advertisements.length + 1,
    clicks: 0
  };

  db.advertisements.push(newAd);
  writeDB(db);
  return res.json({ success: true, ad: newAd });
});

app.put('/api/admin/ads/:id', (req, res) => {
  const decoded = parseToken(req.headers.authorization);
  if (!decoded || decoded.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required.' });
  }

  const db = readDB();
  const idx = db.advertisements.findIndex(a => a.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Ad not found.' });

  db.advertisements[idx] = {
    ...db.advertisements[idx],
    ...req.body
  };
  writeDB(db);
  return res.json({ success: true, ad: db.advertisements[idx] });
});

app.delete('/api/admin/ads/:id', (req, res) => {
  const decoded = parseToken(req.headers.authorization);
  if (!decoded || decoded.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required.' });
  }

  const db = readDB();
  db.advertisements = db.advertisements.filter(a => a.id !== req.params.id);
  writeDB(db);
  return res.json({ success: true });
});

// --- USER MANAGEMENT (ADMIN) ---

app.get('/api/admin/users', (req, res) => {
  const decoded = parseToken(req.headers.authorization);
  if (!decoded || decoded.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required.' });
  }

  const db = readDB();
  const safeUsers = db.users.map(({ passwordHash: _, ...u }) => u);
  return res.json(safeUsers);
});

app.put('/api/admin/users/:id', (req, res) => {
  const decoded = parseToken(req.headers.authorization);
  if (!decoded || decoded.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required.' });
  }

  const { role, status, premiumExpiresAt } = req.body;
  const db = readDB();
  const idx = db.users.findIndex(u => u.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'User not found.' });

  const target = db.users[idx];
  if (role) target.role = role;
  if (status) target.status = status;
  if (premiumExpiresAt !== undefined) target.premiumExpiresAt = premiumExpiresAt;

  // Add audit notification to user
  if (role === 'premium') {
    db.notifications.push({
      id: 'notif_' + Date.now(),
      userId: target.id,
      title: 'Membership Upgraded to Premium',
      message: 'An administrator has upgraded your account to Premium VIP status. Enjoy all exclusive methods and courses!',
      type: 'success',
      createdAt: new Date().toISOString(),
      isRead: false
    });
  }

  db.users[idx] = target;
  writeDB(db);

  const { passwordHash: _, ...safeUser } = target;
  return res.json({ success: true, user: safeUser });
});

// --- WEBSITE SETTINGS ---

app.get('/api/settings', (req, res) => {
  const db = readDB();
  return res.json(db.settings);
});

app.put('/api/admin/settings', (req, res) => {
  const decoded = parseToken(req.headers.authorization);
  if (!decoded || decoded.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required.' });
  }

  const db = readDB();
  db.settings = {
    ...db.settings,
    ...req.body
  };
  writeDB(db);
  return res.json({ success: true, settings: db.settings });
});

// --- NOTIFICATIONS ---

app.get('/api/notifications', (req, res) => {
  const authHeader = req.headers.authorization;
  const decoded = parseToken(authHeader);
  const db = readDB();

  let userNotifs = db.notifications.filter(n => !n.userId || (decoded && n.userId === decoded.id));
  return res.json(userNotifs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
});

app.post('/api/admin/notifications/broadcast', (req, res) => {
  const decoded = parseToken(req.headers.authorization);
  if (!decoded || decoded.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required.' });
  }

  const { title, message, type, targetUserId } = req.body;
  if (!title || !message) {
    return res.status(400).json({ error: 'Title and message are required.' });
  }

  const db = readDB();
  const notif: NotificationItem = {
    id: 'notif_' + Date.now(),
    userId: targetUserId || undefined,
    title: title.trim(),
    message: message.trim(),
    type: type || 'info',
    createdAt: new Date().toISOString(),
    isRead: false
  };

  db.notifications.unshift(notif);
  writeDB(db);
  return res.json({ success: true, notification: notif });
});

// --- ANALYTICS (ADMIN) ---

app.get('/api/admin/analytics', (req, res) => {
  const decoded = parseToken(req.headers.authorization);
  if (!decoded || decoded.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required.' });
  }

  const db = readDB();
  const totalUsers = db.users.filter(u => u.role !== 'admin').length;
  const premiumUsers = db.users.filter(u => u.role === 'premium').length;
  const simpleUsers = db.users.filter(u => u.role === 'simple').length;

  const totalRevenueBDT = db.payments
    .filter(p => p.status === 'approved')
    .reduce((sum, p) => sum + p.amountBDT, 0);

  const pendingPayments = db.payments.filter(p => p.status === 'pending').length;
  const approvedPayments = db.payments.filter(p => p.status === 'approved').length;
  const rejectedPayments = db.payments.filter(p => p.status === 'rejected').length;

  const totalMethods = db.methods.length;
  const simpleMethods = db.methods.filter(m => m.type === 'simple').length;
  const premiumMethods = db.methods.filter(m => m.type === 'premium').length;
  const totalMethodViews = db.methods.reduce((sum, m) => sum + m.views, 0);

  const totalCourses = db.courses.length;
  const simpleCourses = db.courses.filter(c => c.type === 'simple').length;
  const premiumCourses = db.courses.filter(c => c.type === 'premium').length;

  return res.json({
    totalUsers,
    premiumUsers,
    simpleUsers,
    totalRevenueBDT,
    pendingPayments,
    approvedPayments,
    rejectedPayments,
    totalMethods,
    simpleMethods,
    premiumMethods,
    totalMethodViews,
    totalCourses,
    simpleCourses,
    premiumCourses,
    conversionRate: totalUsers > 0 ? ((premiumUsers / totalUsers) * 100).toFixed(1) : '0'
  });
});

// --- DATABASE BACKUP & RESTORE (ADMIN) ---
app.get('/api/admin/backup', (req, res) => {
  const decoded = parseToken(req.headers.authorization);
  if (!decoded || decoded.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required.' });
  }

  const db = readDB();
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="methodtricks_backup_${new Date().toISOString().split('T')[0]}.json"`);
  return res.send(JSON.stringify(db, null, 2));
});

app.post('/api/admin/restore', (req, res) => {
  const decoded = parseToken(req.headers.authorization);
  if (!decoded || decoded.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required.' });
  }

  const backupData = req.body;
  if (!backupData || typeof backupData !== 'object') {
    return res.status(400).json({ error: 'Invalid backup JSON data.' });
  }

  const currentDB = readDB();
  const restoredDB: AppData = {
    settings: backupData.settings || currentDB.settings,
    users: Array.isArray(backupData.users) ? backupData.users : currentDB.users,
    packages: Array.isArray(backupData.packages) ? backupData.packages : [],
    methods: Array.isArray(backupData.methods) ? backupData.methods : [],
    courses: Array.isArray(backupData.courses) ? backupData.courses : [],
    payments: Array.isArray(backupData.payments) ? backupData.payments : [],
    advertisements: Array.isArray(backupData.advertisements) ? backupData.advertisements : [],
    notifications: Array.isArray(backupData.notifications) ? backupData.notifications : []
  };

  const hasAdmin = restoredDB.users.some(u => u.email.toLowerCase() === 'adminshykot@gmail.com');
  if (!hasAdmin) {
    restoredDB.users.unshift({
      id: 'usr_admin',
      name: 'Shykot Admin',
      email: 'adminSHYKOT@gmail.com',
      phone: '01700-000000',
      role: 'admin',
      createdAt: new Date().toISOString(),
      status: 'active',
      passwordHash: hashPassword('adminSHYKOT')
    });
  }

  writeDB(restoredDB);
  return res.json({ success: true, message: 'Database successfully restored.' });
});

// --- PROTECTED MEDIA DOWNLOAD GATEWAY ---
app.get('/api/media/download/:type/:id', (req, res) => {
  const { type, id } = req.params;
  const authHeader = req.headers.authorization;
  const decoded = parseToken(authHeader);
  const db = readDB();

  let item: MethodItem | CourseItem | undefined;
  if (type === 'method') {
    item = db.methods.find(m => m.id === id);
  } else {
    item = db.courses.find(c => c.id === id);
  }

  if (!item) return res.status(404).json({ error: 'File not found.' });

  if (!item.downloadAllowed) {
    return res.status(400).json({ error: 'Downloads are disabled for this item.' });
  }

  // Premium item check
  if (item.type === 'premium') {
    if (!decoded || (decoded.role !== 'premium' && decoded.role !== 'admin')) {
      return res.status(403).json({
        error: 'Premium Membership Required! Purchase a Premium Package to unlock this download.'
      });
    }
  }

  // Simple or Authorized Premium: track download history if user exists
  if (decoded) {
    const user = db.users.find(u => u.id === decoded.id);
    if (user) {
      user.downloadHistory = user.downloadHistory || [];
      if (!user.downloadHistory.includes(id)) {
        user.downloadHistory.push(id);
        writeDB(db);
      }
    }
  }

  // Return download resource metadata
  return res.json({
    success: true,
    fileName: item.fileName || `${item.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-pack.zip`,
    downloadUrl: item.downloadUrl || '#demo-download-resource',
    size: (item as MethodItem).fileSize || '25.0 MB'
  });
});

// Setup dev server with Vite middlewares
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Method Tricks full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
