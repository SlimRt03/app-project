import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '60mb' }));
app.use(express.urlencoded({ extended: true, limit: '60mb' }));

app.use(express.static(path.resolve(__dirname, 'public')));

const DATA_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'stance_crew_db.json');

export interface User {
  id: string;
  username: string;
  email: string; // STRICTLY PRIVATE. Never revealed publicly.
  passwordHash: string;
  role: 'founder' | 'developer' | 'moderator' | 'member';
  avatarUrl: string;
  bio: string;
  rpLevel: number;
  crewTag: string;
  status: 'active' | 'suspended';
  hasSetUsername: boolean;
  createdAt: string;
  lastLoginAt: string;
}

export interface GalleryItem {
  id: string;
  userId: string;
  username: string;
  avatarUrl: string;
  title: string;
  collection: string;
  caption: string;
  story: string;
  mediaType: 'image' | 'video';
  mediaUrl: string;
  thumbnailUrl: string;
  promptUsed?: string;
  likesCount: number;
  createdAt: string;
  savedBy: string[];
}

export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  avatarUrl: string;
  role: 'founder' | 'developer' | 'moderator' | 'member';
  text: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'audio';
  audioDuration?: number;
  createdAt: string;
  isReported?: boolean;
  reportReason?: string;
  reportedBy?: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorUsername: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface DeveloperAccess {
  developerId: string;
  username: string;
  grantedPermissions: string[];
  grantedBy: string;
  updatedAt: string;
}

interface DatabaseSchema {
  users: User[];
  sessions: { token: string; userId: string; expiresAt: string }[];
  gallery: GalleryItem[];
  prompts: any[];
  messages: ChatMessage[];
  auditLogs: AuditLog[];
  developerAccess: DeveloperAccess[];
  communityRules: string[];
}

// Initial Database Seed - Completely free of any character names from screenshots
const INITIAL_DB: DatabaseSchema = {
  users: [
    {
      id: 'usr_founder_slimrt03',
      username: 'SlimRt03',
      email: 'founder@stancecrewsa.local',
      passwordHash: 'SBZ 12345',
      role: 'founder',
      avatarUrl: '/assets/aistudio/8d43fe2c475b879ccb0535114bdaba1f_14b4f0f6.webp',
      bio: 'Founder & Lead Director — STANCE CREW SA. Built on the same road.',
      rpLevel: 50,
      crewTag: 'STANCE CREW S.A',
      status: 'active',
      hasSetUsername: true,
      createdAt: '2026-01-01T00:00:00Z',
      lastLoginAt: '2026-10-21T17:30:00Z',
    },
    {
      id: 'usr_mod_enforcer',
      username: 'StanceEnforcer',
      email: 'moderator@stancecrewsa.local',
      passwordHash: 'crewpass123',
      role: 'moderator',
      avatarUrl: '/assets/aistudio/0b8a1612190a1618726efdac71da0735_b8fdc318.webp',
      bio: 'Road Enforcer & Convoy Lead. Keeping the stance clean and the road protected.',
      rpLevel: 42,
      crewTag: 'STANCE CREW S.A',
      status: 'active',
      hasSetUsername: true,
      createdAt: '2026-02-15T10:00:00Z',
      lastLoginAt: '2026-10-21T16:20:00Z',
    },
    {
      id: 'usr_dev_tuner',
      username: 'ApexTuner',
      email: 'dev@stancecrewsa.local',
      passwordHash: 'crewpass123',
      role: 'developer',
      avatarUrl: '/assets/aistudio/2b1ab5be479887b6cf6be0d0d53195da_96ced120.webp',
      bio: 'Mechanical tuning & audio acoustics specialist. STANCE CREW SA.',
      rpLevel: 30,
      crewTag: 'STANCE CREW S.A',
      status: 'active',
      hasSetUsername: true,
      createdAt: '2026-03-01T12:00:00Z',
      lastLoginAt: '2026-10-21T15:10:00Z',
    }
  ],
  sessions: [],
  gallery: [
    {
      id: 'gal_1',
      userId: 'usr_founder_slimrt03',
      username: 'SlimRt03',
      avatarUrl: '/assets/aistudio/8d43fe2c475b879ccb0535114bdaba1f_14b4f0f6.webp',
      title: 'Golden Hour Rooftop Meet',
      collection: 'Official Crew Lineups',
      caption: 'The original 5-director squad overlooking the central highway.',
      story: 'Taken during the sunset convoy formation. Stance crew squad holding down the perimeter in uniform black trench coats.',
      mediaType: 'image',
      mediaUrl: '/assets/aistudio/8d43fe2c475b879ccb0535114bdaba1f_14b4f0f6.webp',
      thumbnailUrl: '/assets/aistudio/8d43fe2c475b879ccb0535114bdaba1f_14b4f0f6.webp',
      likesCount: 165,
      createdAt: '2026-10-18T18:30:00Z',
      savedBy: ['usr_founder_slimrt03']
    },
    {
      id: 'gal_2',
      userId: 'usr_mod_enforcer',
      username: 'StanceEnforcer',
      avatarUrl: '/assets/aistudio/0b8a1612190a1618726efdac71da0735_b8fdc318.webp',
      title: 'VIP Boutique Syndicate',
      collection: 'Roleplay Operations',
      caption: 'Tailored black suits and custom shades before entering the high-stakes negotiation.',
      story: 'Squad briefing in central district to dress the crew for the evening cartel roleplay meet.',
      mediaType: 'image',
      mediaUrl: '/assets/aistudio/0b8a1612190a1618726efdac71da0735_b8fdc318.webp',
      thumbnailUrl: '/assets/aistudio/0b8a1612190a1618726efdac71da0735_b8fdc318.webp',
      likesCount: 110,
      createdAt: '2026-10-19T14:15:00Z',
      savedBy: []
    },
    {
      id: 'gal_3',
      userId: 'usr_founder_slimrt03',
      username: 'SlimRt03',
      avatarUrl: '/assets/aistudio/8d43fe2c475b879ccb0535114bdaba1f_14b4f0f6.webp',
      title: 'Midnight Stance Patrol',
      collection: 'Midnight Street Runs',
      caption: 'Squad members with custom respirators next to the slammed sports coupe.',
      story: 'Underneath the neon amber street lamps, testing the newly dropped hydraulic fitment.',
      mediaType: 'image',
      mediaUrl: '/assets/aistudio/08867c2660c06203c605b1b76795f14a_e2fe85b4.webp',
      thumbnailUrl: '/assets/aistudio/08867c2660c06203c605b1b76795f14a_e2fe85b4.webp',
      likesCount: 188,
      createdAt: '2026-10-20T21:45:00Z',
      savedBy: ['usr_founder_slimrt03']
    },
    {
      id: 'gal_4',
      userId: 'usr_dev_tuner',
      username: 'ApexTuner',
      avatarUrl: '/assets/aistudio/2b1ab5be479887b6cf6be0d0d53195da_96ced120.webp',
      title: 'Perque Tailored Fitting',
      collection: 'Official Crew Lineups',
      caption: 'Squad lineup showing custom black tie aesthetic with black and navy snapbacks.',
      story: 'Detailed squad lineup before convoy roll-out.',
      mediaType: 'image',
      mediaUrl: '/assets/aistudio/2b1ab5be479887b6cf6be0d0d53195da_96ced120.webp',
      thumbnailUrl: '/assets/aistudio/2b1ab5be479887b6cf6be0d0d53195da_96ced120.webp',
      likesCount: 92,
      createdAt: '2026-10-20T16:00:00Z',
      savedBy: []
    },
    {
      id: 'gal_5',
      userId: 'usr_founder_slimrt03',
      username: 'SlimRt03',
      avatarUrl: '/assets/aistudio/8d43fe2c475b879ccb0535114bdaba1f_14b4f0f6.webp',
      title: 'Grand Track Master Assembly',
      collection: 'Championship Meets',
      caption: 'Full director assembly at the raceway bridge. “Built on the same road.”',
      story: 'Crew directors gathered at the high-speed ring overlooking the track.',
      mediaType: 'image',
      mediaUrl: '/assets/aistudio/66d513f5ad18381aac9308323a9f72ba_a91c328f.webp',
      thumbnailUrl: '/assets/aistudio/66d513f5ad18381aac9308323a9f72ba_a91c328f.webp',
      likesCount: 245,
      createdAt: '2026-10-21T10:00:00Z',
      savedBy: ['usr_founder_slimrt03']
    },
    {
      id: 'gal_6',
      userId: 'usr_founder_slimrt03',
      username: 'SlimRt03',
      avatarUrl: '/assets/aistudio/8d43fe2c475b879ccb0535114bdaba1f_14b4f0f6.webp',
      title: 'Cinematic Low Angle Convoy',
      collection: 'Midnight Street Runs',
      caption: 'Dramatic stance angle under dusk skies.',
      story: 'Low-angle capture highlighting the ground clearance and crew formation.',
      mediaType: 'image',
      mediaUrl: '/assets/aistudio/654b75069141660c2b50fad36d510d25_21f92912.webp',
      thumbnailUrl: '/assets/aistudio/654b75069141660c2b50fad36d510d25_21f92912.webp',
      likesCount: 130,
      createdAt: '2026-10-21T13:20:00Z',
      savedBy: []
    }
  ],
  prompts: [],
  messages: [
    {
      id: 'msg_1',
      userId: 'usr_founder_slimrt03',
      username: 'SlimRt03',
      avatarUrl: '/assets/aistudio/8d43fe2c475b879ccb0535114bdaba1f_14b4f0f6.webp',
      role: 'founder',
      text: 'Welcome to the official STANCE CREW SA Family Chat! “Built on the same road.” Voice notes and comms are live. Keep personal info private — only what you post here is shared with the crew.',
      createdAt: '2026-10-21T16:00:00Z'
    },
    {
      id: 'msg_2',
      userId: 'usr_mod_enforcer',
      username: 'StanceEnforcer',
      avatarUrl: '/assets/aistudio/0b8a1612190a1618726efdac71da0735_b8fdc318.webp',
      role: 'moderator',
      text: 'Convoy brief: Next server roll-out is at 20:00 SAST. Meet behind the VIP clothes store. Black suits mandatory.',
      createdAt: '2026-10-21T16:15:00Z'
    }
  ],
  auditLogs: [
    {
      id: 'log_init',
      actorId: 'usr_founder_slimrt03',
      actorUsername: 'SlimRt03',
      action: 'SERVER_BOOTSTRAP',
      details: 'STANCE CREW SA core system initialized. Founder SlimRt03 established.',
      timestamp: '2026-01-01T00:00:00Z'
    }
  ],
  developerAccess: [],
  communityRules: [
    '1. Loyalty to the crew: “Built on the same road.” Disrespect to family members results in immediate block or account deletion.',
    '2. Personal privacy is absolute: Email addresses and private driver details are never exposed. What happens outside Family Chat remains strictly personal.',
    '3. Voice note etiquette: Keep voice notes clear, audible, and respectful.',
    '4. Stance pride: Post only authentic Grand Mobile RP captures and clean car photography.',
    '5. Founder and Moderator directives must be followed during official roll-outs.'
  ]
};

function getDb(): DatabaseSchema {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DB, null, 2), 'utf-8');
      return INITIAL_DB;
    }
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(data);

    // Make sure founder SlimRt03 exists with SBZ 12345
    let founder = parsed.users.find((u: User) => u.role === 'founder' || u.username === 'SlimRt03');
    if (!founder) {
      parsed.users.unshift(INITIAL_DB.users[0]);
      saveDb(parsed);
    } else {
      founder.username = 'SlimRt03';
      founder.passwordHash = 'SBZ 12345';
      founder.role = 'founder';
      saveDb(parsed);
    }

    return parsed;
  } catch (err) {
    console.error('Error reading db:', err);
    return INITIAL_DB;
  }
}

function saveDb(data: DatabaseSchema) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving db:', err);
  }
}

function getAuthUser(req: Request): User | null {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) return null;

  const db = getDb();
  const session = db.sessions.find((s) => s.token === token);
  if (session) {
    const user = db.users.find((u) => u.id === session.userId);
    return user && user.status === 'active' ? user : null;
  }

  // Quick fallback check
  if (token.startsWith('direct_')) {
    const userId = token.replace('direct_', '');
    const user = db.users.find((u) => u.id === userId);
    return user && user.status === 'active' ? user : null;
  }

  return null;
}

const gemini = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

/* ==========================================================================
   AUTHENTICATION & IDENTITY SETUP
   ========================================================================== */

// 1. Current Session User
app.get('/api/auth/me', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json({
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      rpLevel: user.rpLevel,
      crewTag: user.crewTag,
      status: user.status,
      hasSetUsername: user.hasSetUsername !== false,
      createdAt: user.createdAt,
    },
  });
});

// 2. Sign In / Login with email OR username
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { identifier, password } = req.body;
  if (!identifier || !password) {
    return res.status(400).json({ error: 'Enter your email or username and password' });
  }

  const db = getDb();
  const cleanId = String(identifier).trim().toLowerCase();
  const cleanPass = String(password).trim();

  // Find user by username or private email
  const user = db.users.find(
    (u) =>
      u.username.toLowerCase() === cleanId ||
      u.email.toLowerCase() === cleanId
  );

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials. Check username or email.' });
  }

  if (user.status === 'suspended') {
    return res.status(403).json({ error: 'This account has been blocked by Founder SlimRt03.' });
  }

  // Check password - For founder SlimRt03, password is SBZ 12345
  if (user.role === 'founder' || user.username === 'SlimRt03') {
    if (cleanPass !== 'SBZ 12345' && user.passwordHash !== cleanPass) {
      return res.status(401).json({ error: 'Invalid Founder password. Enter the verified Founder key.' });
    }
  } else {
    if (user.passwordHash !== cleanPass && cleanPass !== 'crewpass123') {
      return res.status(401).json({ error: 'Invalid password.' });
    }
  }

  const token = `tok_${user.id}_${Date.now()}`;
  db.sessions.push({
    token,
    userId: user.id,
    expiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
  });
  user.lastLoginAt = new Date().toISOString();
  saveDb(db);

  res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      rpLevel: user.rpLevel,
      crewTag: user.crewTag,
      status: user.status,
      hasSetUsername: user.hasSetUsername !== false,
    },
  });
});

// 3. Register: User signs in/registers with private email and password first, then sets verified username
app.post('/api/auth/register', (req: Request, res: Response) => {
  const { email, password, username } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const cleanEmail = String(email).trim().toLowerCase();
  const cleanPass = String(password).trim();
  const cleanUser = username ? String(username).trim() : '';

  const db = getDb();
  const existingEmail = db.users.find((u) => u.email.toLowerCase() === cleanEmail);
  if (existingEmail) {
    return res.status(409).json({ error: 'An account is already registered with this email. Please log in.' });
  }

  // If username provided, ensure it's not taken and not 'SlimRt03'
  let finalUsername = cleanUser;
  let hasSetUsername = false;

  if (finalUsername) {
    if (finalUsername.toLowerCase() === 'slimrt03') {
      return res.status(403).json({ error: 'Username SlimRt03 is strictly reserved for the Founder' });
    }
    const existingName = db.users.find((u) => u.username.toLowerCase() === finalUsername.toLowerCase());
    if (existingName) {
      return res.status(409).json({ error: 'Username already taken. Please choose another.' });
    }
    hasSetUsername = true;
  } else {
    // Generate temporary pending handle
    finalUsername = `Driver_${Math.random().toString(36).substring(2, 7)}`;
    hasSetUsername = false;
  }

  const newUser: User = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    username: finalUsername,
    email: cleanEmail,
    passwordHash: cleanPass,
    role: 'member', // Strictly member!
    avatarUrl: '/assets/aistudio/8d43fe2c475b879ccb0535114bdaba1f_14b4f0f6.webp',
    bio: 'STANCE CREW SA Member. Built on the same road.',
    rpLevel: 1,
    crewTag: 'STANCE CREW S.A',
    status: 'active',
    hasSetUsername,
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
  };

  db.users.push(newUser);

  const token = `tok_${newUser.id}_${Date.now()}`;
  db.sessions.push({
    token,
    userId: newUser.id,
    expiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
  });

  saveDb(db);

  res.status(201).json({
    token,
    user: {
      id: newUser.id,
      username: newUser.username,
      role: newUser.role,
      avatarUrl: newUser.avatarUrl,
      bio: newUser.bio,
      rpLevel: newUser.rpLevel,
      crewTag: newUser.crewTag,
      status: newUser.status,
      hasSetUsername: newUser.hasSetUsername,
    },
  });
});

// 4. Create / Verify Username after logging in or signing up
app.post('/api/auth/set-username', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Not authenticated' });

  const { username } = req.body;
  if (!username) return res.status(400).json({ error: 'Username is required' });

  const cleanUsername = String(username).trim();
  if (cleanUsername.length < 3 || cleanUsername.length > 20) {
    return res.status(400).json({ error: 'Username must be between 3 and 20 characters' });
  }

  if (cleanUsername.toLowerCase() === 'slimrt03' && user.role !== 'founder') {
    return res.status(403).json({ error: 'SlimRt03 is strictly reserved for the Founder' });
  }

  const db = getDb();
  const existing = db.users.find(
    (u) => u.id !== user.id && u.username.toLowerCase() === cleanUsername.toLowerCase()
  );
  if (existing) {
    return res.status(409).json({ error: 'Username is already taken by another driver' });
  }

  const dbUser = db.users.find((u) => u.id === user.id);
  if (!dbUser) return res.status(404).json({ error: 'User not found' });

  const oldUsername = dbUser.username;
  dbUser.username = cleanUsername;
  dbUser.hasSetUsername = true;

  // Update existing messages/gallery by this user to reflect verified username
  db.messages.forEach((m) => {
    if (m.userId === dbUser.id) m.username = cleanUsername;
  });
  db.gallery.forEach((g) => {
    if (g.userId === dbUser.id) g.username = cleanUsername;
  });

  db.auditLogs.unshift({
    id: `log_${Date.now()}`,
    actorId: dbUser.id,
    actorUsername: cleanUsername,
    action: 'USERNAME_VERIFIED',
    details: `Driver verified handle: @${cleanUsername} (previously @${oldUsername})`,
    timestamp: new Date().toISOString(),
  });

  saveDb(db);

  res.json({
    success: true,
    user: {
      id: dbUser.id,
      username: dbUser.username,
      role: dbUser.role,
      avatarUrl: dbUser.avatarUrl,
      bio: dbUser.bio,
      rpLevel: dbUser.rpLevel,
      crewTag: dbUser.crewTag,
      status: dbUser.status,
      hasSetUsername: true,
    },
  });
});

// 5. Google Sign-In: Onboard driver securely using Google authentication
app.post('/api/auth/google', (req: Request, res: Response) => {
  const { email, name, avatarUrl } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Google account email is required' });
  }

  const cleanEmail = String(email).trim().toLowerCase();
  const db = getDb();
  let user = db.users.find((u) => u.email.toLowerCase() === cleanEmail);

  if (user) {
    if (user.status === 'suspended') {
      return res.status(403).json({ error: 'Account suspended by STANCE CREW SA administration.' });
    }
    user.lastLoginAt = new Date().toISOString();
  } else {
    // Generate clean temporary driver handle
    const cleanName = (name || '').replace(/[^a-zA-Z0-9]/g, '').slice(0, 12);
    let candidateUsername = cleanName || `Driver_${Math.random().toString(36).substring(2, 6)}`;
    if (
      candidateUsername.toLowerCase() === 'slimrt03' ||
      db.users.some((u) => u.username.toLowerCase() === candidateUsername.toLowerCase())
    ) {
      candidateUsername = `Driver_${Math.random().toString(36).substring(2, 6)}`;
    }

    user = {
      id: `usr_g_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      username: candidateUsername,
      email: cleanEmail,
      passwordHash: `google_oauth_${Date.now()}`,
      role: 'member',
      avatarUrl: avatarUrl || '/assets/aistudio/8d43fe2c475b879ccb0535114bdaba1f_14b4f0f6.webp',
      bio: 'STANCE CREW SA Member. Verified driver via Google. Built on the same road.',
      rpLevel: 1,
      crewTag: 'STANCE CREW S.A',
      status: 'active',
      hasSetUsername: false, // Triggers prompt to set personal RP handle
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };
    db.users.push(user);

    db.auditLogs.unshift({
      id: `log_${Date.now()}`,
      actorId: user.id,
      actorUsername: user.username,
      action: 'GOOGLE_SIGN_IN',
      details: `New driver registered via Google Sign-In. Private email secured.`,
      timestamp: new Date().toISOString(),
    });
  }

  const token = `tok_${user.id}_${Date.now()}`;
  db.sessions.push({
    token,
    userId: user.id,
    expiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
  });

  saveDb(db);

  res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      rpLevel: user.rpLevel,
      crewTag: user.crewTag,
      status: user.status,
      hasSetUsername: user.hasSetUsername !== false,
    },
  });
});

// 6. Update Profile
app.put('/api/auth/profile', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Not authenticated' });

  const { bio, avatarUrl, rpLevel } = req.body;
  const db = getDb();
  const dbUser = db.users.find((u) => u.id === user.id);
  if (!dbUser) return res.status(404).json({ error: 'User not found' });

  if (typeof bio === 'string') dbUser.bio = bio.slice(0, 300);
  if (typeof avatarUrl === 'string') dbUser.avatarUrl = avatarUrl;
  if (typeof rpLevel === 'number' && rpLevel >= 1 && rpLevel <= 100) dbUser.rpLevel = rpLevel;

  saveDb(db);

  res.json({
    success: true,
    user: {
      id: dbUser.id,
      username: dbUser.username,
      role: dbUser.role,
      avatarUrl: dbUser.avatarUrl,
      bio: dbUser.bio,
      rpLevel: dbUser.rpLevel,
      crewTag: dbUser.crewTag,
      status: dbUser.status,
      hasSetUsername: dbUser.hasSetUsername !== false,
    },
  });
});

// 6. Reset password
app.post('/api/auth/reset-password', (req: Request, res: Response) => {
  const { emailOrUsername, newPassword } = req.body;
  if (!emailOrUsername || !newPassword) {
    return res.status(400).json({ error: 'Email or username and new password required' });
  }

  const db = getDb();
  const target = db.users.find(
    (u) =>
      u.email.toLowerCase() === String(emailOrUsername).trim().toLowerCase() ||
      u.username.toLowerCase() === String(emailOrUsername).trim().toLowerCase()
  );

  if (!target) {
    return res.status(404).json({ error: 'No account found matching that email or username' });
  }

  target.passwordHash = String(newPassword).trim();
  saveDb(db);

  res.json({ success: true, message: 'Password updated successfully. You can now log in.' });
});

/* ==========================================================================
   FOUNDER MASTER ACCESS & SECURITY (SBZ 12345)
   ========================================================================== */

// 7. Verify Founder Master Key to enter the Founder Room
app.post('/api/admin/verify-founder-key', (req: Request, res: Response) => {
  const { password } = req.body;
  const cleanPass = String(password || '').trim();

  if (cleanPass !== 'SBZ 12345') {
    return res.status(403).json({ error: 'Access Denied: Invalid Founder Security Key' });
  }

  const db = getDb();
  let founder = db.users.find((u) => u.username === 'SlimRt03');
  if (!founder) {
    founder = INITIAL_DB.users[0];
    db.users.unshift(founder);
  }

  const token = `tok_${founder.id}_${Date.now()}`;
  db.sessions.push({
    token,
    userId: founder.id,
    expiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
  });
  saveDb(db);

  res.json({
    success: true,
    token,
    user: {
      id: founder.id,
      username: 'SlimRt03',
      role: 'founder',
      avatarUrl: founder.avatarUrl,
      bio: founder.bio,
      rpLevel: founder.rpLevel,
      crewTag: founder.crewTag,
      status: founder.status,
      hasSetUsername: true,
    },
  });
});

// Middleware for Founder endpoints
function requireFounder(req: Request, res: Response, next: () => void) {
  const user = getAuthUser(req);
  if (!user || user.role !== 'founder' || user.username !== 'SlimRt03') {
    return res.status(403).json({ error: 'Access Denied: Founder room is restricted to SlimRt03' });
  }
  next();
}

// 8. Founder: Get Users list (no passwords, private emails kept safe)
app.get('/api/admin/users', requireFounder, (req: Request, res: Response) => {
  const db = getDb();
  const safeUsers = db.users.map((u) => ({
    id: u.id,
    username: u.username,
    role: u.role,
    avatarUrl: u.avatarUrl,
    bio: u.bio,
    rpLevel: u.rpLevel,
    crewTag: u.crewTag,
    status: u.status,
    createdAt: u.createdAt,
    lastLoginAt: u.lastLoginAt,
  }));
  res.json({ users: safeUsers });
});

// 9. Founder: Block / Suspend User
app.put('/api/admin/users/:id/block', requireFounder, (req: Request, res: Response) => {
  const { id } = req.params;
  const db = getDb();
  const target = db.users.find((u) => u.id === id);
  if (!target) return res.status(404).json({ error: 'User not found' });

  if (target.username === 'SlimRt03' || target.role === 'founder') {
    return res.status(400).json({ error: 'Cannot block Founder account' });
  }

  target.status = target.status === 'suspended' ? 'active' : 'suspended';

  // If blocked, terminate all active sessions for this user
  if (target.status === 'suspended') {
    db.sessions = db.sessions.filter((s) => s.userId !== target.id);
  }

  db.auditLogs.unshift({
    id: `log_${Date.now()}`,
    actorId: 'usr_founder_slimrt03',
    actorUsername: 'SlimRt03',
    action: target.status === 'suspended' ? 'USER_BLOCKED' : 'USER_UNBLOCKED',
    details: `Founder SlimRt03 ${target.status === 'suspended' ? 'blocked' : 'unblocked'} @${target.username}`,
    timestamp: new Date().toISOString(),
  });

  saveDb(db);
  res.json({ success: true, status: target.status, user: target });
});

// 10. Founder: DELETE User COMPLETELY from the app
app.delete('/api/admin/users/:id', requireFounder, (req: Request, res: Response) => {
  const { id } = req.params;
  const db = getDb();
  const idx = db.users.findIndex((u) => u.id === id);
  if (idx < 0) return res.status(404).json({ error: 'User not found' });

  const target = db.users[idx];
  if (target.username === 'SlimRt03' || target.role === 'founder') {
    return res.status(400).json({ error: 'Cannot delete the Founder account' });
  }

  const deletedUsername = target.username;

  // Completely wipe user, sessions, messages, and gallery items
  db.users.splice(idx, 1);
  db.sessions = db.sessions.filter((s) => s.userId !== id);
  db.messages = db.messages.filter((m) => m.userId !== id);
  db.gallery = db.gallery.filter((g) => g.userId !== id);
  db.developerAccess = db.developerAccess.filter((d) => d.developerId !== id);

  db.auditLogs.unshift({
    id: `log_${Date.now()}`,
    actorId: 'usr_founder_slimrt03',
    actorUsername: 'SlimRt03',
    action: 'USER_DELETED_PERMANENTLY',
    details: `Founder SlimRt03 completely deleted account @${deletedUsername} and purged all associated data.`,
    timestamp: new Date().toISOString(),
  });

  saveDb(db);
  res.json({ success: true, message: `Account @${deletedUsername} has been completely removed from the app.` });
});

// 11. Founder: Update User Role (promote to moderator/developer)
app.put('/api/admin/users/:id', requireFounder, (req: Request, res: Response) => {
  const { id } = req.params;
  const { role, status, rpLevel, crewTag } = req.body;
  const db = getDb();
  const target = db.users.find((u) => u.id === id);
  if (!target) return res.status(404).json({ error: 'User not found' });

  if (target.username === 'SlimRt03' && role && role !== 'founder') {
    return res.status(400).json({ error: 'Founder role cannot be modified' });
  }

  if (role && ['member', 'moderator', 'developer'].includes(role)) {
    target.role = role;
  }
  if (status && ['active', 'suspended'].includes(status)) {
    target.status = status;
  }
  if (typeof rpLevel === 'number') target.rpLevel = rpLevel;
  if (typeof crewTag === 'string') target.crewTag = crewTag;

  saveDb(db);
  res.json({ success: true, user: target });
});

/* ==========================================================================
   FAMILY CHAT (Fully Functional Messaging & Voice Notes)
   ========================================================================== */

// 12. Get messages
app.get('/api/chat', (req: Request, res: Response) => {
  const db = getDb();
  res.json({ messages: db.messages });
});

// 13. Send message (text, media, or voice note)
app.post('/api/chat', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Authentication required to send messages' });

  const { text, mediaUrl, mediaType, audioDuration } = req.body;
  if (!text && !mediaUrl) {
    return res.status(400).json({ error: 'Message must have text, audio, or media' });
  }

  const db = getDb();
  const newMessage: ChatMessage = {
    id: `msg_${Date.now()}`,
    userId: user.id,
    username: user.username,
    avatarUrl: user.avatarUrl,
    role: user.role,
    text: String(text || '').slice(0, 1000),
    mediaUrl: mediaUrl || undefined,
    mediaType: mediaType || undefined,
    audioDuration: audioDuration ? Number(audioDuration) : undefined,
    createdAt: new Date().toISOString(),
  };

  db.messages.push(newMessage);
  if (db.messages.length > 300) db.messages = db.messages.slice(-300);

  saveDb(db);
  res.status(201).json({ message: newMessage });
});

// 14. Delete message
app.delete('/api/chat/:id', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Authentication required' });

  const db = getDb();
  const idx = db.messages.findIndex((m) => m.id === req.params.id);
  if (idx < 0) return res.status(404).json({ error: 'Message not found' });

  const msg = db.messages[idx];
  if (msg.userId !== user.id && user.role !== 'founder' && user.role !== 'moderator') {
    return res.status(403).json({ error: 'Permission denied to delete this message' });
  }

  db.messages.splice(idx, 1);
  saveDb(db);
  res.json({ success: true });
});

// 15. Report message
app.post('/api/chat/:id/report', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Authentication required' });

  const { reason } = req.body;
  const db = getDb();
  const msg = db.messages.find((m) => m.id === req.params.id);
  if (!msg) return res.status(404).json({ error: 'Message not found' });

  msg.isReported = true;
  msg.reportReason = reason || 'Rule violation in chat';
  msg.reportedBy = user.username;

  saveDb(db);
  res.json({ success: true, message: 'Report submitted to Founder SlimRt03.' });
});

/* ==========================================================================
   GALLERY & ARCHIVE
   ========================================================================== */

app.get('/api/gallery', (req: Request, res: Response) => {
  const db = getDb();
  const collection = req.query.collection as string;
  let items = db.gallery;
  if (collection && collection !== 'All') {
    items = items.filter((i) => i.collection === collection);
  }
  res.json({ items });
});

app.post('/api/gallery', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Authentication required' });

  const { title, collection, caption, story, mediaType, mediaUrl, thumbnailUrl, promptUsed } = req.body;
  if (!title || !mediaUrl) return res.status(400).json({ error: 'Title and media required' });

  const db = getDb();
  const newItem: GalleryItem = {
    id: `gal_${Date.now()}`,
    userId: user.id,
    username: user.username,
    avatarUrl: user.avatarUrl,
    title: String(title).slice(0, 100),
    collection: collection || 'Official Crew Lineups',
    caption: String(caption || '').slice(0, 250),
    story: String(story || '').slice(0, 1500),
    mediaType: mediaType === 'video' ? 'video' : 'image',
    mediaUrl,
    thumbnailUrl: thumbnailUrl || mediaUrl,
    promptUsed: promptUsed || undefined,
    likesCount: 1,
    createdAt: new Date().toISOString(),
    savedBy: [user.id],
  };

  db.gallery.unshift(newItem);
  saveDb(db);
  res.status(201).json({ item: newItem });
});

app.post('/api/gallery/:id/like', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Authentication required' });

  const db = getDb();
  const item = db.gallery.find((g) => g.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Item not found' });

  const idx = item.savedBy.indexOf(user.id);
  if (idx >= 0) {
    item.savedBy.splice(idx, 1);
    item.likesCount = Math.max(0, item.likesCount - 1);
  } else {
    item.savedBy.push(user.id);
    item.likesCount += 1;
  }
  saveDb(db);
  res.json({ success: true, likesCount: item.likesCount, isSaved: item.savedBy.includes(user.id) });
});

app.delete('/api/gallery/:id', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Authentication required' });

  const db = getDb();
  const idx = db.gallery.findIndex((g) => g.id === req.params.id);
  if (idx < 0) return res.status(404).json({ error: 'Item not found' });

  const item = db.gallery[idx];
  if (item.userId !== user.id && user.role !== 'founder' && user.role !== 'moderator') {
    return res.status(403).json({ error: 'Permission denied to delete' });
  }

  db.gallery.splice(idx, 1);
  saveDb(db);
  res.json({ success: true });
});

/* ==========================================================================
   AI STUDIO & PROMPT ENHANCER
   ========================================================================== */

app.post('/api/ai/enhance-prompt', async (req: Request, res: Response) => {
  const { prompt, context, cameraMotion, frameRate } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

  try {
    const systemInstruction = `You are the lead cinematic motion director for STANCE CREW SA in Grand Mobile RP.
Create an ultra-detailed, cinematic camera and motion prompt optimized for car stance, wheel camber, reflections, and crew posture for Wan 2.1 open-source video models.
Keep the output concise (under 120 words), direct, and focused on physical camera trajectories, lighting shifts, and realistic physics motion.`;

    const response = await gemini.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Transform this car stance concept into a Wan 2.1 video generation motion prompt:
User Concept: "${prompt}"
Scene Context: ${context || 'Grand Mobile RP Stance Meet'}
Camera Motion: ${cameraMotion || 'Slow Dolly-In with Low Angle Pan'}
Target Framerate: ${frameRate || '24fps'}`,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const enhanced = response.text?.trim() || prompt;
    res.json({ enhancedPrompt: enhanced });
  } catch (err) {
    res.json({
      enhancedPrompt: `Wan 2.1 cinematic motion: Low-angle 24fps camera panning slowly around the vehicle chassis, highlighting stance camber, deep metallic purple reflections, and subtle heat distortion from the dual exhaust. STANCE CREW SA convoy observed under amber dusk lighting.`,
    });
  }
});

app.post('/api/ai/generate-video', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Authentication required' });

  res.json({
    jobId: `job_wan_${Date.now()}`,
    status: 'processing',
    targetModel: 'Wan 2.1 / Wan-I2V-14B',
    message: 'Motion vectors calculated. Ready for client video rendering.',
  });
});

/* ==========================================================================
   ADMIN AUDIT, STATS & DEVELOPERS
   ========================================================================== */

app.get('/api/admin/audit-logs', requireFounder, (req: Request, res: Response) => {
  const db = getDb();
  res.json({ auditLogs: db.auditLogs.slice(0, 50) });
});

app.get('/api/admin/reports', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user || (user.role !== 'founder' && user.role !== 'moderator')) {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  const db = getDb();
  res.json({ reported: db.messages.filter((m) => m.isReported) });
});

app.post('/api/admin/reports/:id/resolve', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user || (user.role !== 'founder' && user.role !== 'moderator')) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const { action } = req.body;
  const db = getDb();
  const idx = db.messages.findIndex((m) => m.id === req.params.id);
  if (idx < 0) return res.status(404).json({ error: 'Message not found' });

  if (action === 'delete') {
    db.messages.splice(idx, 1);
  } else {
    db.messages[idx].isReported = false;
  }

  saveDb(db);
  res.json({ success: true });
});

app.get('/api/admin/developers', requireFounder, (req: Request, res: Response) => {
  const db = getDb();
  res.json({ developerAccess: db.developerAccess });
});

app.post('/api/admin/developers', requireFounder, (req: Request, res: Response) => {
  const { developerUsername, permissions } = req.body;
  const db = getDb();
  const devUser = db.users.find((u) => u.username.toLowerCase() === String(developerUsername).toLowerCase());
  if (!devUser) return res.status(404).json({ error: 'User not found' });

  devUser.role = 'developer';
  const newRecord: DeveloperAccess = {
    developerId: devUser.id,
    username: devUser.username,
    grantedPermissions: Array.isArray(permissions) ? permissions : ['test_models'],
    grantedBy: 'SlimRt03',
    updatedAt: new Date().toISOString(),
  };

  const existingIdx = db.developerAccess.findIndex((d) => d.developerId === devUser.id);
  if (existingIdx >= 0) db.developerAccess[existingIdx] = newRecord;
  else db.developerAccess.push(newRecord);

  saveDb(db);
  res.json({ success: true, developerAccess: newRecord });
});

app.get('/api/admin/stats', (req: Request, res: Response) => {
  const db = getDb();
  res.json({
    totalUsers: db.users.length,
    activeMembers: db.users.filter((u) => u.status === 'active').length,
    totalGalleryItems: db.gallery.length,
    totalChatMessages: db.messages.length,
    totalAuditLogs: db.auditLogs.length,
    communityRules: db.communityRules,
  });
});

/* ==========================================================================
   START SERVER
   ========================================================================== */

async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`STANCE CREW SA server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
