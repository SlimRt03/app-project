import { User, GalleryItem, ChatMessage, AuditLog, DeveloperAccess, AppStats } from '../types';

const TOKEN_KEY = 'stance_crew_auth_token';

export const api = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clearToken: () => localStorage.removeItem(TOKEN_KEY),

  async fetchHeaders(): Promise<HeadersInit> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  },

  // Auth
  async getMe(): Promise<{ user: User } | null> {
    try {
      const res = await fetch('/api/auth/me', {
        headers: await this.fetchHeaders(),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async login(identifier: string, password: string): Promise<{ token: string; user: User }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    this.setToken(data.token);
    return data;
  },

  async register(payload: {
    email: string;
    password: string;
    username?: string;
  }): Promise<{ token: string; user: User }> {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    this.setToken(data.token);
    return data;
  },

  async signInWithGoogle(payload: {
    email: string;
    name?: string;
    avatarUrl?: string;
  }): Promise<{ token: string; user: User }> {
    const res = await fetch('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Google Sign-In failed');
    this.setToken(data.token);
    return data;
  },

  async setUsername(username: string): Promise<{ user: User }> {
    const res = await fetch('/api/auth/set-username', {
      method: 'POST',
      headers: await this.fetchHeaders(),
      body: JSON.stringify({ username }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to verify username');
    return data;
  },

  async updateProfile(payload: { bio?: string; avatarUrl?: string; rpLevel?: number }): Promise<{ user: User }> {
    const res = await fetch('/api/auth/profile', {
      method: 'PUT',
      headers: await this.fetchHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update profile');
    return data;
  },

  async resetPassword(emailOrUsername: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailOrUsername, newPassword }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to reset password');
    return data;
  },

  // Founder Master Access (SBZ 12345)
  async verifyFounderKey(password: string): Promise<{ token: string; user: User }> {
    const res = await fetch('/api/admin/verify-founder-key', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Invalid Founder Key');
    this.setToken(data.token);
    return data;
  },

  // Gallery
  async getGallery(collection?: string): Promise<{ items: GalleryItem[] }> {
    const url = collection && collection !== 'All' 
      ? `/api/gallery?collection=${encodeURIComponent(collection)}` 
      : '/api/gallery';
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to load gallery');
    return await res.json();
  },

  async uploadGalleryItem(item: Partial<GalleryItem>): Promise<{ item: GalleryItem }> {
    const res = await fetch('/api/gallery', {
      method: 'POST',
      headers: await this.fetchHeaders(),
      body: JSON.stringify(item),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to upload item');
    return data;
  },

  async toggleLikeGalleryItem(id: string): Promise<{ likesCount: number; isSaved: boolean }> {
    const res = await fetch(`/api/gallery/${id}/like`, {
      method: 'POST',
      headers: await this.fetchHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Action failed');
    return data;
  },

  async deleteGalleryItem(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/gallery/${id}`, {
      method: 'DELETE',
      headers: await this.fetchHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete');
    return data;
  },

  async enhancePrompt(
    prompt: string,
    context?: string,
    cameraMotion?: string,
    frameRate?: string
  ): Promise<{ enhancedPrompt: string }> {
    const res = await fetch('/api/ai/enhance-prompt', {
      method: 'POST',
      headers: await this.fetchHeaders(),
      body: JSON.stringify({ prompt, context, cameraMotion, frameRate }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to enhance prompt');
    return data;
  },

  async requestVideoGeneration(payload: { imageUrl: string; prompt: string; cameraMotion: string; duration?: number }) {
    const res = await fetch('/api/ai/generate-video', {
      method: 'POST',
      headers: await this.fetchHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to request video');
    return data;
  },

  // Family Chat
  async getMessages(): Promise<{ messages: ChatMessage[] }> {
    const res = await fetch('/api/chat');
    if (!res.ok) throw new Error('Failed to fetch messages');
    return await res.json();
  },

  async sendMessage(payload: {
    text?: string;
    mediaUrl?: string;
    mediaType?: 'image' | 'video' | 'audio';
    audioDuration?: number;
  }): Promise<{ message: ChatMessage }> {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: await this.fetchHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to send message');
    return data;
  },

  async deleteMessage(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/chat/${id}`, {
      method: 'DELETE',
      headers: await this.fetchHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete message');
    return data;
  },

  async reportMessage(id: string, reason: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`/api/chat/${id}/report`, {
      method: 'POST',
      headers: await this.fetchHeaders(),
      body: JSON.stringify({ reason }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to report message');
    return data;
  },

  // Founder Dashboard (Founder only)
  async getAdminUsers(): Promise<{ users: User[] }> {
    const res = await fetch('/api/admin/users', {
      headers: await this.fetchHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Unauthorized');
    return data;
  },

  async blockUser(id: string): Promise<{ success: boolean; status: string; user: User }> {
    const res = await fetch(`/api/admin/users/${id}/block`, {
      method: 'PUT',
      headers: await this.fetchHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to block/unblock user');
    return data;
  },

  async deleteUserCompletely(id: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`/api/admin/users/${id}`, {
      method: 'DELETE',
      headers: await this.fetchHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete user');
    return data;
  },

  async updateAdminUser(id: string, payload: Partial<User>): Promise<{ user: User }> {
    const res = await fetch(`/api/admin/users/${id}`, {
      method: 'PUT',
      headers: await this.fetchHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update user');
    return data;
  },

  async getAuditLogs(): Promise<{ auditLogs: AuditLog[] }> {
    const res = await fetch('/api/admin/audit-logs', {
      headers: await this.fetchHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Unauthorized');
    return data;
  },

  async getDeveloperAccess(): Promise<{ developerAccess: DeveloperAccess[] }> {
    const res = await fetch('/api/admin/developers', {
      headers: await this.fetchHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Unauthorized');
    return data;
  },

  async updateDeveloperAccess(developerUsername: string, permissions: string[]): Promise<{ developerAccess: DeveloperAccess }> {
    const res = await fetch('/api/admin/developers', {
      method: 'POST',
      headers: await this.fetchHeaders(),
      body: JSON.stringify({ developerUsername, permissions }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update developer permissions');
    return data;
  },

  async getReportedMessages(): Promise<{ reported: ChatMessage[] }> {
    const res = await fetch('/api/admin/reports', {
      headers: await this.fetchHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Unauthorized');
    return data;
  },

  async resolveReport(id: string, action: 'dismiss' | 'delete'): Promise<{ success: boolean }> {
    const res = await fetch(`/api/admin/reports/${id}/resolve`, {
      method: 'POST',
      headers: await this.fetchHeaders(),
      body: JSON.stringify({ action }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to resolve report');
    return data;
  },

  async getStats(): Promise<AppStats> {
    const res = await fetch('/api/admin/stats');
    if (!res.ok) throw new Error('Failed to load stats');
    return await res.json();
  },
};
