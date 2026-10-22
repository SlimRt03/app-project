export type UserRole = 'founder' | 'developer' | 'moderator' | 'member';

export interface User {
  id: string;
  username: string;
  email?: string;
  role: UserRole;
  avatarUrl: string;
  bio: string;
  rpLevel: number;
  crewTag: string;
  status: 'active' | 'suspended';
  hasSetUsername?: boolean;
  createdAt?: string;
  lastLoginAt?: string;
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
  role: UserRole;
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

export interface AppStats {
  totalUsers: number;
  activeMembers: number;
  totalGalleryItems: number;
  totalChatMessages: number;
  totalAuditLogs: number;
  communityRules: string[];
}
