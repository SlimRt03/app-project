import React, { useState, useEffect } from 'react';
import {
  Plus,
  Heart,
  Video,
  Image as ImageIcon,
  Trash2,
  Share2,
  Sparkles,
  X,
  Filter,
  Check,
  Calendar,
  User as UserIcon,
  Play,
  Upload,
} from 'lucide-react';
import { GalleryItem, User } from '../types';
import { api } from '../services/api';
import { useToast } from './Toast';

interface GalleryArchiveProps {
  user: User;
  onSendToAiStudio: (item: GalleryItem) => void;
  onRequestPermission: (permission: 'CAMERA' | 'READ_MEDIA', onGranted: () => void) => void;
}

const COLLECTIONS = [
  'All',
  'Official Crew Lineups',
  'Midnight Street Runs',
  'Roleplay Operations',
  'Championship Meets',
  'AI Video Creations',
];

export const GalleryArchive: React.FC<GalleryArchiveProps> = ({
  user,
  onSendToAiStudio,
  onRequestPermission,
}) => {
  const { showToast } = useToast();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [activeCollection, setActiveCollection] = useState('All');
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<GalleryItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Upload Form states
  const [title, setTitle] = useState('');
  const [collection, setCollection] = useState('Official Crew Lineups');
  const [caption, setCaption] = useState('');
  const [story, setStory] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    loadGallery();
  }, [activeCollection]);

  const loadGallery = async () => {
    try {
      setLoading(true);
      const res = await api.getGallery(activeCollection);
      setItems(res.items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleLike = async (item: GalleryItem, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await api.toggleLikeGalleryItem(item.id);
      setItems((prev) =>
        prev.map((i) => {
          if (i.id === item.id) {
            const savedBy = res.isSaved
              ? [...i.savedBy, user.id]
              : i.savedBy.filter((id) => id !== user.id);
            return { ...i, likesCount: res.likesCount, savedBy };
          }
          return i;
        })
      );
      if (selectedItem?.id === item.id) {
        setSelectedItem((prev) =>
          prev ? { ...prev, likesCount: res.likesCount, savedBy: res.isSaved ? [...prev.savedBy, user.id] : prev.savedBy.filter((id) => id !== user.id) } : null
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const promptDelete = (item: GalleryItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setItemToDelete(item);
  };

  const confirmDeleteItem = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      await api.deleteGalleryItem(itemToDelete.id);
      setItems((prev) => prev.filter((i) => i.id !== itemToDelete.id));
      if (selectedItem?.id === itemToDelete.id) setSelectedItem(null);
      showToast(`Deleted "${itemToDelete.title}" from archive`, 'info');
      setItemToDelete(null);
    } catch (err: any) {
      showToast(err.message || 'Failed to delete creation', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit: 45MB
    if (file.size > 45 * 1024 * 1024) {
      showToast('File size exceeds the 45MB limit for uploads', 'warning');
      return;
    }

    const isVideo = file.type.startsWith('video/');
    setMediaType(isVideo ? 'video' : 'image');

    setIsUploading(true);
    setUploadProgress(15);

    const timer = setInterval(() => {
      setUploadProgress((prev) => {
        if (!prev || prev >= 90) {
          clearInterval(timer);
          return 90;
        }
        return prev + 25;
      });
    }, 150);

    const reader = new FileReader();
    reader.onload = () => {
      clearInterval(timer);
      setUploadProgress(100);
      if (typeof reader.result === 'string') {
        setMediaUrl(reader.result);
      }
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(null);
      }, 300);
    };
    reader.readAsDataURL(file);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !mediaUrl) return;

    try {
      const res = await api.uploadGalleryItem({
        title,
        collection,
        caption,
        story,
        mediaType,
        mediaUrl,
        thumbnailUrl: mediaUrl,
      });
      setItems((prev) => [res.item, ...prev]);
      setIsUploadOpen(false);
      setTitle('');
      setCaption('');
      setStory('');
      setMediaUrl('');
      showToast(`"${res.item.title}" saved to archive!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Upload failed', 'error');
    }
  };

  return (
    <div className="flex-1 flex flex-col p-4 pb-24 space-y-4 animate-fadeIn">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-white font-display">Gallery & Archive</h2>
          <p className="text-[11px] text-purple-300/80 font-mono">
            STANCE CREW SA · Grand Mobile RP Creations
          </p>
        </div>

        <button
          onClick={() => {
            onRequestPermission('READ_MEDIA', () => setIsUploadOpen(true));
          }}
          className="py-2 px-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 active:scale-95 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-purple-950/50 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Upload</span>
        </button>
      </div>

      {/* Collection Filter Buttons (Single-line horizontal scroll) */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {COLLECTIONS.map((col) => (
          <button
            key={col}
            onClick={() => setActiveCollection(col)}
            className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              activeCollection === col
                ? 'bg-purple-600 text-white shadow-md shadow-purple-950/40'
                : 'bg-black/40 hover:bg-black/60 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {col}
          </button>
        ))}
      </div>

      {/* Grid of Creations */}
      {loading ? (
        <div className="py-20 text-center text-slate-500 text-xs">
          Loading Stance Crew archive...
        </div>
      ) : items.length === 0 ? (
        <div className="py-16 text-center text-slate-400 glass-panel rounded-2xl border border-slate-800 p-6">
          <ImageIcon className="w-10 h-10 text-purple-400 mx-auto mb-2 opacity-60" />
          <p className="text-sm font-bold text-white">No creations in this collection</p>
          <p className="text-xs text-slate-400 mt-1">Be the first to upload car stance photography</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {items.map((item) => {
            const isLiked = item.savedBy.includes(user.id);
            return (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="group relative rounded-2xl overflow-hidden bg-[#13121f] border border-slate-800/80 hover:border-purple-500/50 shadow-md cursor-pointer transition-all flex flex-col"
              >
                {/* Media frame */}
                <div className="relative aspect-[4/3] bg-black overflow-hidden">
                  {item.mediaType === 'video' ? (
                    <video
                      src={item.mediaUrl}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      muted
                      playsInline
                    />
                  ) : (
                    <img
                      src={item.thumbnailUrl || item.mediaUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                  {/* Top badges */}
                  <div className="absolute top-2 left-2 right-2 flex items-center justify-between">
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-md text-purple-300 border border-purple-500/20 font-mono">
                      {item.collection.split(' ')[0]}
                    </span>

                    {item.mediaType === 'video' && (
                      <span className="w-5 h-5 rounded-full bg-purple-600/90 text-white flex items-center justify-center shadow">
                        <Play className="w-2.5 h-2.5 fill-white" />
                      </span>
                    )}
                  </div>

                  {/* Likes counter bottom-right of image */}
                  <button
                    onClick={(e) => handleToggleLike(item, e)}
                    className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md border border-white/10 flex items-center gap-1 text-[10px] text-white hover:text-red-400 transition-colors cursor-pointer"
                  >
                    <Heart className={`w-3 h-3 ${isLiked ? 'text-red-500 fill-red-500' : 'text-slate-300'}`} />
                    <span className="font-mono">{item.likesCount}</span>
                  </button>
                </div>

                {/* Card description */}
                <div className="p-2.5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-white font-display truncate group-hover:text-purple-300 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                      {item.caption || item.story || 'Stance Crew archive'}
                    </p>
                  </div>

                  <div className="mt-2 pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span className="truncate">@{item.username}</span>
                    <span>{new Date(item.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Item Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg bg-[#0e0d16] border border-purple-500/30 rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto">
            {/* Modal header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <img
                  src={selectedItem.avatarUrl}
                  alt={selectedItem.username}
                  className="w-8 h-8 rounded-full object-cover border border-purple-400"
                />
                <div>
                  <h3 className="text-sm font-bold text-white font-display truncate">
                    {selectedItem.title}
                  </h3>
                  <p className="text-[10px] text-purple-300 font-mono">
                    Posted by @{selectedItem.username} · {selectedItem.collection}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedItem(null)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Media Presentation */}
            <div className="my-4 rounded-xl overflow-hidden bg-black border border-slate-800 relative">
              {selectedItem.mediaType === 'video' ? (
                <video
                  src={selectedItem.mediaUrl}
                  controls
                  autoPlay
                  className="w-full max-h-[50vh] object-contain"
                />
              ) : (
                <img
                  src={selectedItem.mediaUrl}
                  alt={selectedItem.title}
                  className="w-full max-h-[50vh] object-contain"
                />
              )}
            </div>

            {/* Details & Personal Story */}
            <div className="space-y-3">
              {selectedItem.caption && (
                <p className="text-xs text-white font-medium leading-relaxed">
                  "{selectedItem.caption}"
                </p>
              )}

              {selectedItem.story && (
                <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-900/30">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 block mb-1">
                    Grand Mobile RP Driver Story
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed italic">
                    {selectedItem.story}
                  </p>
                </div>
              )}

              {/* Action Buttons: AI Studio Send, Favorite, Delete */}
              <div className="pt-2 flex flex-wrap gap-2">
                {selectedItem.mediaType === 'image' && (
                  <button
                    onClick={() => {
                      onSendToAiStudio(selectedItem);
                      setSelectedItem(null);
                    }}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 active:scale-95 text-white text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-purple-950/50"
                  >
                    <Video className="w-4 h-4 text-purple-200" />
                    <span>Send to AI Video Studio</span>
                  </button>
                )}

                <button
                  onClick={(e) => handleToggleLike(selectedItem, e)}
                  className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Heart
                    className={`w-4 h-4 ${
                      selectedItem.savedBy.includes(user.id)
                        ? 'text-red-500 fill-red-500'
                        : 'text-slate-400'
                    }`}
                  />
                  <span>{selectedItem.likesCount}</span>
                </button>

                {(selectedItem.userId === user.id ||
                  user.role === 'founder' ||
                  user.role === 'moderator') && (
                  <button
                    onClick={(e) => promptDelete(selectedItem, e)}
                    className="py-2.5 px-3 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-300 text-xs font-medium transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Creation Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg bg-[#0e0d16] border border-purple-500/30 rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white font-display">
                Upload to Stance Crew Archive
              </h3>
              <button
                onClick={() => setIsUploadOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-3">
              {/* File selector */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Select Screenshot or Video (Phone Upload)
                </label>
                <div className="border-2 border-dashed border-slate-700 hover:border-purple-500 rounded-2xl p-4 text-center bg-[#141320] transition-colors relative">
                  {mediaUrl ? (
                    <div className="relative">
                      {mediaType === 'video' ? (
                        <video src={mediaUrl} className="max-h-44 mx-auto rounded-lg" controls />
                      ) : (
                        <img src={mediaUrl} alt="Preview" className="max-h-44 mx-auto rounded-lg object-contain" />
                      )}
                      <button
                        type="button"
                        onClick={() => setMediaUrl('')}
                        className="absolute top-1 right-1 p-1 bg-black/80 rounded-full text-white hover:text-red-400"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center cursor-pointer py-4">
                      <Upload className="w-8 h-8 text-purple-400 mb-2" />
                      <span className="text-xs font-semibold text-white">Tap to browse media files</span>
                      <span className="text-[10px] text-slate-400 mt-1">PNG, JPG, WEBP, MP4 (Up to 45MB)</span>
                      <input
                        type="file"
                        accept="image/*,video/*"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                    </label>
                  )}
                </div>

                {uploadProgress !== null && (
                  <div className="mt-2">
                    <div className="flex justify-between text-[10px] text-purple-300 font-mono mb-1">
                      <span>Encrypting & Storing Media</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500 transition-all duration-200"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Title */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Creation Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Midnight Highway Convoy"
                  className="w-full px-3 py-2 bg-[#141320] border border-slate-700 focus:border-purple-500 rounded-xl text-xs text-white outline-none"
                />
              </div>

              {/* Collection */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Collection
                </label>
                <select
                  value={collection}
                  onChange={(e) => setCollection(e.target.value)}
                  className="w-full px-3 py-2 bg-[#141320] border border-slate-700 focus:border-purple-500 rounded-xl text-xs text-white outline-none cursor-pointer"
                >
                  {COLLECTIONS.filter((c) => c !== 'All').map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Caption */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Brief Caption
                </label>
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Short summary for the squad feed"
                  className="w-full px-3 py-2 bg-[#141320] border border-slate-700 focus:border-purple-500 rounded-xl text-xs text-white outline-none"
                />
              </div>

              {/* Personal Story */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Personal Grand Mobile RP Story
                </label>
                <textarea
                  rows={3}
                  value={story}
                  onChange={(e) => setStory(e.target.value)}
                  placeholder="Share what happened during this race, meet, or setup..."
                  className="w-full px-3 py-2 bg-[#141320] border border-slate-700 focus:border-purple-500 rounded-xl text-xs text-white outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={!title || !mediaUrl || isUploading}
                className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-all shadow-lg shadow-purple-900/40 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Save to Permanent Archive</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* In-App Deletion Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm bg-[#161424] border border-red-500/40 rounded-2xl p-5 shadow-2xl space-y-3">
            <div className="flex items-center gap-2.5 text-red-400">
              <Trash2 className="w-5 h-5 shrink-0" />
              <h3 className="text-sm font-bold text-white font-display">Delete Creation?</h3>
            </div>
            <p className="text-xs text-slate-300">
              Are you sure you want to permanently remove <strong className="text-white">"{itemToDelete.title}"</strong> from the STANCE CREW SA Archive?
            </p>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteItem}
                disabled={isDeleting}
                className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
