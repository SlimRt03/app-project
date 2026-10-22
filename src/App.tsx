/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AndroidFrame, CREW_WALLPAPERS } from './components/AndroidFrame';
import { BottomNav, TabType } from './components/BottomNav';
import { HomeDashboard } from './components/HomeDashboard';
import { GalleryArchive } from './components/GalleryArchive';
import { AiStudio } from './components/AiStudio';
import { FamilyChat } from './components/FamilyChat';
import { FounderDashboard } from './components/FounderDashboard';
import { DeveloperWorkspace } from './components/DeveloperWorkspace';
import { AuthModal } from './components/AuthModal';
import { UserProfileModal } from './components/UserProfileModal';
import { WallpaperSelector } from './components/WallpaperSelector';
import { AndroidPermissionModal } from './components/AndroidPermissionModal';
import { UsernameSetupModal } from './components/UsernameSetupModal';
import { SplashScreen } from './components/SplashScreen';
import { ToastProvider } from './components/Toast';
import { User, GalleryItem, AppStats } from './types';
import { api } from './services/api';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  // Authenticated user (defaults to Founder SlimRt03)
  const [currentUser, setCurrentUser] = useState<User>({
    id: 'usr_founder_slimrt03',
    username: 'SlimRt03',
    role: 'founder',
    avatarUrl: '/assets/aistudio/8d43fe2c475b879ccb0535114bdaba1f_14b4f0f6.webp',
    bio: 'Founder & Lead Director — STANCE CREW SA. Built on the same road.',
    rpLevel: 50,
    crewTag: 'STANCE CREW S.A',
    status: 'active',
    hasSetUsername: true,
  });

  // Active Screen
  const [currentTab, setCurrentTab] = useState<TabType>('home');

  // Active Wallpaper (from uploaded images)
  const [activeWallpaper, setActiveWallpaper] = useState<string>(CREW_WALLPAPERS[0].url);

  // Modals
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isWallpaperSelectorOpen, setIsWallpaperSelectorOpen] = useState(false);

  // Media pass-through to AI Studio
  const [targetStudioItem, setTargetStudioItem] = useState<GalleryItem | null>(null);

  // Android Permission simulation state
  const [permissionState, setPermissionState] = useState<{
    isOpen: boolean;
    type: 'RECORD_AUDIO' | 'CAMERA' | 'READ_MEDIA';
    onGranted?: () => void;
  }>({
    isOpen: false,
    type: 'RECORD_AUDIO',
  });

  // App Stats
  const [stats, setStats] = useState<AppStats | undefined>(undefined);

  useEffect(() => {
    const initAuth = async () => {
      const res = await api.getMe();
      if (res?.user) {
        setCurrentUser(res.user);
      }
      try {
        const s = await api.getStats();
        setStats(s);
      } catch (e) {
        console.warn('Stats fetch:', e);
      }
    };
    initAuth();
  }, []);

  // Request Android Permission helper
  const handleRequestPermission = (
    permission: 'RECORD_AUDIO' | 'CAMERA' | 'READ_MEDIA',
    onGranted: () => void
  ) => {
    const key = `android_perm_${permission}`;
    if (localStorage.getItem(key) === 'granted') {
      onGranted();
      return;
    }

    setPermissionState({
      isOpen: true,
      type: permission,
      onGranted,
    });
  };

  const handleGrantPermission = () => {
    localStorage.setItem(`android_perm_${permissionState.type}`, 'granted');
    const callback = permissionState.onGranted;
    setPermissionState({ isOpen: false, type: 'RECORD_AUDIO' });
    if (callback) callback();
  };

  const handleDenyPermission = () => {
    setPermissionState({ isOpen: false, type: 'RECORD_AUDIO' });
  };

  // Switch to AI Studio with preselected gallery image
  const handleSendToAiStudio = (item: GalleryItem) => {
    setTargetStudioItem(item);
    setCurrentTab('aiStudio');
  };

  return (
    <ToastProvider>
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}

      <AndroidFrame
        activeWallpaper={activeWallpaper}
        onOpenWallpaperSelector={() => setIsWallpaperSelectorOpen(true)}
      >
        {/* Render Tab Screens */}
        {currentTab === 'home' && (
          <HomeDashboard
            user={currentUser}
            onNavigate={(tab) => setCurrentTab(tab)}
            onOpenProfile={() => setIsProfileOpen(true)}
            onOpenWallpaperSelector={() => setIsWallpaperSelectorOpen(true)}
            stats={stats}
          />
        )}

        {currentTab === 'gallery' && (
          <GalleryArchive
            user={currentUser}
            onSendToAiStudio={handleSendToAiStudio}
            onRequestPermission={(perm, onGranted) =>
              handleRequestPermission(perm, onGranted)
            }
          />
        )}

        {(currentTab === 'aiStudio' || currentTab === 'promptLab') && (
          <AiStudio
            user={currentUser}
            initialImage={targetStudioItem}
            onSavedToGallery={() => setCurrentTab('gallery')}
          />
        )}

        {currentTab === 'chat' && (
          <FamilyChat
            user={currentUser}
            onRequestPermission={(perm, onGranted) =>
              handleRequestPermission(perm, onGranted)
            }
          />
        )}

        {currentTab === 'founder' && (
          <FounderDashboard
            founderUser={currentUser}
            onFounderAuthenticated={(founder) => setCurrentUser(founder)}
          />
        )}

        {currentTab === 'developer' && (
          <DeveloperWorkspace developerUser={currentUser} />
        )}

        {/* Bottom Navigation */}
        <BottomNav
          currentTab={currentTab}
          onSelectTab={(tab) => setCurrentTab(tab)}
          userRole={currentUser.role}
        />
      </AndroidFrame>

      {/* Mandatory Username Setup Modal (if user logs in and hasn't verified their username yet) */}
      <UsernameSetupModal
        isOpen={currentUser.hasSetUsername === false}
        currentUser={currentUser}
        onUsernameVerified={(updated) => setCurrentUser(updated)}
      />

      {/* Wallpaper & Theme Selector */}
      <WallpaperSelector
        isOpen={isWallpaperSelectorOpen}
        onClose={() => setIsWallpaperSelectorOpen(false)}
        activeWallpaper={activeWallpaper}
        onSelectWallpaper={(url) => {
          setActiveWallpaper(url);
          setIsWallpaperSelectorOpen(false);
        }}
        onSetAsProfilePhoto={async (url) => {
          try {
            const res = await api.updateProfile({ avatarUrl: url });
            setCurrentUser(res.user);
            setIsWallpaperSelectorOpen(false);
          } catch (e) {
            console.error(e);
          }
        }}
      />

      {/* User Dossier & Profile Modal */}
      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={currentUser}
        onUpdateUser={(updated) => setCurrentUser(updated)}
        onLogout={() => {
          api.clearToken();
          setIsAuthOpen(true);
        }}
      />

      {/* Authentication & Account Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={(user) => {
          setCurrentUser(user);
          setIsAuthOpen(false);
        }}
      />

      {/* Simulated Android Permission Sheet */}
      <AndroidPermissionModal
        isOpen={permissionState.isOpen}
        permission={permissionState.type}
        onGrant={handleGrantPermission}
        onDeny={handleDenyPermission}
      />
    </ToastProvider>
  );
}
