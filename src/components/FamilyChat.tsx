import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Mic,
  Square,
  Play,
  Pause,
  Trash2,
  Flag,
  Image as ImageIcon,
  Paperclip,
  X,
  Volume2,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Clock,
  Sparkles,
} from 'lucide-react';
import { ChatMessage, User } from '../types';
import { api } from '../services/api';
import { useToast } from './Toast';
import { createSimulatedRadioCommsBlob } from '../utils/audio';

interface FamilyChatProps {
  user: User;
  onRequestPermission: (permission: 'RECORD_AUDIO' | 'READ_MEDIA', onGranted: () => void) => void;
}

export const FamilyChat: React.FC<FamilyChatProps> = ({
  user,
  onRequestPermission,
}) => {
  const { showToast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [msgIdToDelete, setMsgIdToDelete] = useState<string | null>(null);

  // Voice note recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioBlobUrl, setAudioBlobUrl] = useState<string | null>(null);
  const [audioDuration, setAudioDuration] = useState<number>(0);

  // Audio playback state
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);

  // Attached media states
  const [attachedMediaUrl, setAttachedMediaUrl] = useState<string | null>(null);
  const [attachedMediaType, setAttachedMediaType] = useState<'image' | 'video'>('image');
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  // Reporting modal
  const [reportingMessage, setReportingMessage] = useState<ChatMessage | null>(null);
  const [reportReason, setReportReason] = useState('Offensive or rule-breaking roleplay speech');
  const [reportSent, setReportSent] = useState(false);

  // MediaRecorder refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    loadChat();
    const interval = setInterval(loadChat, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadChat = async () => {
    try {
      const res = await api.getMessages();
      setMessages(res.messages);
    } catch (err) {
      console.error(err);
    }
  };

  // Start real voice recording with simulated RP radio fallback
  const startRecording = async () => {
    onRequestPermission('RECORD_AUDIO', async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error('Microphone device access restricted');
        }
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const url = URL.createObjectURL(blob);
          setAudioBlobUrl(url);
          // Stop mic tracks
          stream.getTracks().forEach((track) => track.stop());
        };

        mediaRecorder.start();
        setIsRecording(true);
        setRecordingSeconds(0);

        recordingTimerRef.current = setInterval(() => {
          setRecordingSeconds((prev) => prev + 1);
        }, 1000);
      } catch (err) {
        console.warn('Audio capture fallback to radio synthesizer:', err);
        try {
          const simBlob = await createSimulatedRadioCommsBlob();
          const url = URL.createObjectURL(simBlob);
          setAudioBlobUrl(url);
          setAudioDuration(3);
          showToast('Mic unavailable in iframe. Created simulated RP radio voice note!', 'info');
        } catch {
          showToast('Microphone access unavailable', 'error');
        }
      }
    });
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(recordingTimerRef.current);
      setAudioDuration(recordingSeconds || 1);
    }
  };

  // Cancel recording
  const discardRecording = () => {
    stopRecording();
    setAudioBlobUrl(null);
    setAudioDuration(0);
    setRecordingSeconds(0);
  };

  // Handle media file upload
  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 30 * 1024 * 1024) {
      showToast('File exceeds 30MB limit for chat attachments', 'warning');
      return;
    }

    const isVideo = file.type.startsWith('video/');
    setAttachedMediaType(isVideo ? 'video' : 'image');
    setUploadProgress(20);

    const timer = setInterval(() => {
      setUploadProgress((prev) => {
        if (!prev || prev >= 90) {
          clearInterval(timer);
          return 90;
        }
        return prev + 30;
      });
    }, 120);

    const reader = new FileReader();
    reader.onload = () => {
      clearInterval(timer);
      setUploadProgress(100);
      if (typeof reader.result === 'string') {
        setAttachedMediaUrl(reader.result);
      }
      setTimeout(() => setUploadProgress(null), 300);
    };
    reader.readAsDataURL(file);
  };

  // Send message
  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() && !attachedMediaUrl && !audioBlobUrl) return;

    setIsSending(true);

    try {
      let finalMediaUrl = attachedMediaUrl || undefined;
      let finalMediaType: 'image' | 'video' | 'audio' | undefined = attachedMediaType;
      let finalDuration: number | undefined = undefined;

      // If voice note exists, convert to base64 for persistent storage
      if (audioBlobUrl) {
        const audioResponse = await fetch(audioBlobUrl);
        const audioBlob = await audioResponse.blob();
        finalMediaUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(audioBlob);
        });
        finalMediaType = 'audio';
        finalDuration = audioDuration;
      }

      const res = await api.sendMessage({
        text: inputText.trim(),
        mediaUrl: finalMediaUrl,
        mediaType: finalMediaType,
        audioDuration: finalDuration,
      });

      setMessages((prev) => [...prev, res.message]);
      setInputText('');
      setAttachedMediaUrl(null);
      setAudioBlobUrl(null);
      setAudioDuration(0);
      showToast('Transmission sent to Family Chat', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to send message', 'error');
    } finally {
      setIsSending(false);
    }
  };

  // Audio message playback
  const togglePlayAudio = (messageId: string, audioUrl: string) => {
    if (playingMessageId === messageId) {
      activeAudioRef.current?.pause();
      setPlayingMessageId(null);
    } else {
      activeAudioRef.current?.pause();
      const audio = new Audio(audioUrl);
      activeAudioRef.current = audio;
      setPlayingMessageId(messageId);

      audio.onended = () => {
        setPlayingMessageId(null);
      };
      audio.onerror = () => {
        setPlayingMessageId(null);
        showToast('Could not play audio note', 'error');
      };
      audio.play().catch(() => setPlayingMessageId(null));
    }
  };

  // Delete message
  const promptDeleteMessage = (msgId: string) => {
    setMsgIdToDelete(msgId);
  };

  const confirmDeleteMessage = async () => {
    if (!msgIdToDelete) return;
    try {
      await api.deleteMessage(msgIdToDelete);
      setMessages((prev) => prev.filter((m) => m.id !== msgIdToDelete));
      showToast('Message removed from Family Chat', 'info');
      setMsgIdToDelete(null);
    } catch (err: any) {
      showToast(err.message || 'Failed to delete message', 'error');
    }
  };

  // Submit message report
  const submitReport = async () => {
    if (!reportingMessage) return;
    try {
      await api.reportMessage(reportingMessage.id, reportReason);
      setReportSent(true);
      showToast('Report submitted to moderation', 'success');
      setTimeout(() => {
        setReportingMessage(null);
        setReportSent(false);
      }, 1500);
    } catch (err: any) {
      showToast(err.message || 'Report failed', 'error');
    }
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0b0a13] text-slate-100">
      {/* Chat Room Header */}
      <div className="px-4 py-3 bg-[#11101b] border-b border-slate-800/80 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-purple-900/60 border border-purple-500/30 flex items-center justify-center text-purple-300">
              <Radio className="w-4 h-4" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-black" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-bold text-white font-display">STANCE CREW SA Comms</h2>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-950 text-purple-300 border border-purple-500/20 font-mono">
                ENCRYPTED
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">
              Voice notes · Media share · Moderated
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-purple-400 font-mono font-bold block">
            {messages.length} Messages
          </span>
          <span className="text-[9px] text-slate-400">“Built on the same road.”</span>
        </div>
      </div>

      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin">
        {messages.map((msg) => {
          const isMe = msg.userId === user.id;
          const isVoice = msg.mediaType === 'audio' && msg.mediaUrl;
          const isPlaying = playingMessageId === msg.id;

          return (
            <div
              key={msg.id}
              className={`flex gap-2.5 group ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <img
                src={msg.avatarUrl}
                alt={msg.username}
                className="w-8 h-8 rounded-xl object-cover shrink-0 border border-purple-500/30 shadow-sm"
              />

              {/* Message Content */}
              <div className={`max-w-[80%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                {/* Author Info */}
                <div className="flex items-center gap-1.5 mb-1 text-[11px] font-mono">
                  <span className="font-bold text-slate-200">@{msg.username}</span>
                  <span className={`text-[8px] font-extrabold px-1 rounded uppercase ${
                    msg.role === 'founder'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : msg.role === 'moderator'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      : msg.role === 'developer'
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      : 'text-slate-400'
                  }`}>
                    {msg.role}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* Bubble Container */}
                <div
                  className={`p-3 rounded-2xl relative shadow-md ${
                    isMe
                      ? 'bg-gradient-to-br from-purple-700 to-purple-900 text-white rounded-tr-none border border-purple-400/30'
                      : 'bg-[#181726] text-slate-100 rounded-tl-none border border-slate-800'
                  }`}
                >
                  {/* Voice Note Player */}
                  {isVoice && (
                    <div className="flex items-center gap-3 py-1 min-w-[210px]">
                      <button
                        onClick={() => togglePlayAudio(msg.id, msg.mediaUrl!)}
                        className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-md ${
                          isPlaying
                            ? 'bg-white text-purple-900 animate-pulse'
                            : 'bg-purple-500/30 text-white hover:bg-purple-500/50'
                        }`}
                      >
                        {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                      </button>

                      {/* Visual Waveform Bar simulation */}
                      <div className="flex-1 flex items-center gap-0.5 h-6">
                        {[40, 70, 30, 90, 60, 100, 45, 80, 50, 75, 35, 85, 55, 65, 40].map((h, idx) => (
                          <div
                            key={idx}
                            className={`w-1 rounded-full transition-all duration-300 ${
                              isPlaying
                                ? 'bg-purple-300'
                                : isMe
                                ? 'bg-purple-200/60'
                                : 'bg-purple-400/60'
                            }`}
                            style={{ height: isPlaying ? `${Math.max(20, (h * (idx % 2 + 0.8)) % 100)}%` : `${h * 0.25}px` }}
                          />
                        ))}
                      </div>

                      <span className="text-[10px] font-mono shrink-0 opacity-80">
                        {formatSeconds(msg.audioDuration || 4)}
                      </span>
                    </div>
                  )}

                  {/* Image attachment */}
                  {msg.mediaType === 'image' && msg.mediaUrl && (
                    <div className="mb-2 rounded-xl overflow-hidden max-h-56 bg-black border border-white/10">
                      <img src={msg.mediaUrl} alt="Attachment" className="w-full h-full object-cover" />
                    </div>
                  )}

                  {/* Video attachment */}
                  {msg.mediaType === 'video' && msg.mediaUrl && (
                    <div className="mb-2 rounded-xl overflow-hidden max-h-56 bg-black border border-white/10">
                      <video src={msg.mediaUrl} controls className="w-full max-h-56" />
                    </div>
                  )}

                  {/* Text Message */}
                  {msg.text && (
                    <p className="text-xs leading-relaxed break-words whitespace-pre-wrap">
                      {msg.text}
                    </p>
                  )}
                </div>

                {/* Message Context Actions (Report or Delete) */}
                <div className="flex items-center gap-2 mt-1 px-1 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-slate-400">
                  <button
                    onClick={() => setReportingMessage(msg)}
                    className="hover:text-amber-400 transition-colors flex items-center gap-0.5 cursor-pointer"
                    title="Report message"
                  >
                    <Flag className="w-3 h-3" />
                    <span>Report</span>
                  </button>

                  {(isMe || user.role === 'founder' || user.role === 'moderator') && (
                    <button
                      onClick={() => promptDeleteMessage(msg.id)}
                      className="hover:text-red-400 transition-colors flex items-center gap-0.5 cursor-pointer"
                      title="Delete message"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Voice Note Recording Preview Bar */}
      {audioBlobUrl && (
        <div className="mx-4 mb-2 p-3 bg-purple-950/80 border border-purple-500/40 rounded-2xl flex items-center justify-between text-xs animate-fadeIn shadow-lg">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-purple-300 animate-pulse" />
            <div>
              <p className="font-semibold text-white">Voice Note Ready ({audioDuration}s)</p>
              <audio src={audioBlobUrl} controls className="h-6 w-44 mt-1" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={discardRecording}
              className="p-1.5 rounded-lg bg-red-950 text-red-300 hover:bg-red-900 transition-colors cursor-pointer"
              title="Discard"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleSend()}
              className="py-1.5 px-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold transition-colors cursor-pointer flex items-center gap-1 shadow"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </div>
        </div>
      )}

      {/* Media Attachment Preview Bar */}
      {attachedMediaUrl && (
        <div className="mx-4 mb-2 p-2 bg-[#181628] border border-purple-500/30 rounded-2xl flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2 overflow-hidden">
            <img src={attachedMediaUrl} alt="Attached" className="w-10 h-10 rounded-lg object-cover border border-purple-400/40" />
            <div className="overflow-hidden">
              <span className="text-xs text-white font-semibold block truncate">Media attached</span>
              <span className="text-[10px] text-purple-300 uppercase font-mono">{attachedMediaType}</span>
            </div>
          </div>
          <button
            onClick={() => setAttachedMediaUrl(null)}
            className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Upload Progress Indicator */}
      {uploadProgress !== null && (
        <div className="mx-4 mb-1">
          <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-purple-500 transition-all duration-150" style={{ width: `${uploadProgress}%` }} />
          </div>
        </div>
      )}

      {/* Bottom Comms Input Bar */}
      <div className="p-3 bg-[#11101b] border-t border-slate-800/80 shrink-0">
        {isRecording ? (
          /* Live Recording HUD */
          <div className="flex items-center justify-between bg-red-950/40 border border-red-500/40 rounded-2xl px-4 py-2.5 animate-pulse">
            <div className="flex items-center gap-2 text-red-400 text-xs font-bold font-mono">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              <span>Recording Voice Note... {formatSeconds(recordingSeconds)}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={discardRecording}
                className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs hover:bg-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={stopRecording}
                className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-1 cursor-pointer shadow"
              >
                <Square className="w-3.5 h-3.5 fill-white" />
                <span>Done</span>
              </button>
            </div>
          </div>
        ) : (
          /* Standard Input Form */
          <form onSubmit={handleSend} className="flex items-center gap-2">
            {/* Attachment Button */}
            <label className="w-10 h-10 rounded-xl bg-[#191728] hover:bg-[#232038] border border-slate-800 flex items-center justify-center text-slate-400 hover:text-purple-300 transition-colors cursor-pointer shrink-0">
              <Paperclip className="w-4 h-4" />
              <input type="file" accept="image/*,video/*" className="hidden" onChange={handleMediaUpload} />
            </label>

            {/* Voice Note Button */}
            <button
              type="button"
              onClick={startRecording}
              className="w-10 h-10 rounded-xl bg-[#191728] hover:bg-purple-950/80 border border-slate-800 hover:border-purple-500/40 flex items-center justify-center text-purple-400 transition-colors cursor-pointer shrink-0"
              title="Record Voice Note"
            >
              <Mic className="w-4 h-4" />
            </button>

            {/* Text Input */}
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Send convoy dispatch or radio update..."
              className="flex-1 px-3.5 py-2.5 bg-[#191728] border border-slate-800 focus:border-purple-500 rounded-xl text-xs text-white placeholder-slate-500 outline-none transition-colors"
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={isSending || (!inputText.trim() && !attachedMediaUrl && !audioBlobUrl)}
              className="w-10 h-10 rounded-xl bg-purple-600 hover:bg-purple-500 active:scale-95 text-white flex items-center justify-center transition-all cursor-pointer shadow-md shadow-purple-950/40 disabled:opacity-40 shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>

      {/* Moderation Report Modal */}
      {reportingMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm bg-[#161424] border border-amber-500/30 rounded-2xl p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2 text-amber-400">
                <AlertTriangle className="w-4 h-4" />
                <h3 className="text-xs font-bold uppercase tracking-wider font-display">
                  Report Community Message
                </h3>
              </div>
              <button
                onClick={() => setReportingMessage(null)}
                className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Reporting message by <span className="font-bold text-white">@{reportingMessage.username}</span>:
            </p>
            <div className="p-2.5 bg-black/40 rounded-xl border border-slate-800 text-xs text-slate-400 italic">
              "{reportingMessage.text || '[Media content]'}"
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Select Reason
              </label>
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="w-full px-2.5 py-2 bg-[#100f1a] border border-slate-700 rounded-xl text-xs text-white outline-none cursor-pointer"
              >
                <option value="Offensive or rule-breaking roleplay speech">Offensive roleplay speech</option>
                <option value="Doxxing or personal private info leak">Personal private info leak</option>
                <option value="Harassment of crew member">Harassment of crew member</option>
                <option value="Spam or off-topic flood">Spam or off-topic flood</option>
              </select>
            </div>

            {reportSent ? (
              <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Report submitted to Founder & Moderators</span>
              </div>
            ) : (
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => setReportingMessage(null)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={submitReport}
                  className="flex-1 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow cursor-pointer"
                >
                  Confirm Report
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* In-App Message Delete Confirmation Modal */}
      {msgIdToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm bg-[#161424] border border-red-500/40 rounded-2xl p-5 shadow-2xl space-y-3">
            <div className="flex items-center gap-2.5 text-red-400">
              <Trash2 className="w-5 h-5 shrink-0" />
              <h3 className="text-sm font-bold text-white font-display">Delete Message?</h3>
            </div>
            <p className="text-xs text-slate-300">
              Are you sure you want to remove this message from the Family Chat stream?
            </p>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setMsgIdToDelete(null)}
                className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteMessage}
                className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold cursor-pointer"
              >
                Delete Message
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
