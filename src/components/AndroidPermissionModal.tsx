import React from 'react';
import { Mic, Camera, Image as ImageIcon, ShieldAlert } from 'lucide-react';

interface AndroidPermissionModalProps {
  permission: 'RECORD_AUDIO' | 'CAMERA' | 'READ_MEDIA';
  isOpen: boolean;
  onGrant: (choice: 'while_using' | 'only_once') => void;
  onDeny: () => void;
}

export const AndroidPermissionModal: React.FC<AndroidPermissionModalProps> = ({
  permission,
  isOpen,
  onGrant,
  onDeny,
}) => {
  if (!isOpen) return null;

  const getDetails = () => {
    switch (permission) {
      case 'RECORD_AUDIO':
        return {
          icon: <Mic className="w-8 h-8 text-purple-400" />,
          title: 'Allow STANCE CREW SA to record audio?',
          desc: 'Required to record and preview high-fidelity voice notes in Family Chat.',
        };
      case 'CAMERA':
        return {
          icon: <Camera className="w-8 h-8 text-purple-400" />,
          title: 'Allow STANCE CREW SA to take pictures and record video?',
          desc: 'Required to snap photos of your Grand Mobile RP car stance directly.',
        };
      case 'READ_MEDIA':
      default:
        return {
          icon: <ImageIcon className="w-8 h-8 text-purple-400" />,
          title: 'Allow STANCE CREW SA to access photos and videos on this device?',
          desc: 'Required to upload car screenshots to the Gallery & AI Video Studio.',
        };
    }
  };

  const details = getDetails();

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 bg-black/85 backdrop-blur-sm animate-fadeIn">
      {/* Android Material 3 Permission Dialog */}
      <div className="w-full max-w-sm bg-[#1a1924] border border-purple-500/20 rounded-3xl p-6 shadow-2xl text-center flex flex-col items-center">
        <div className="w-14 h-14 rounded-full bg-purple-950/80 border border-purple-500/40 flex items-center justify-center mb-4 shadow-inner">
          {details.icon}
        </div>

        <h3 className="text-base font-bold text-white font-display mb-2">{details.title}</h3>
        <p className="text-xs text-slate-300 leading-relaxed mb-6">{details.desc}</p>

        <div className="w-full flex flex-col gap-2">
          <button
            onClick={() => onGrant('while_using')}
            className="w-full py-3 px-4 rounded-full bg-purple-600 hover:bg-purple-500 active:scale-[0.98] text-white text-xs font-semibold tracking-wide transition-all cursor-pointer shadow-lg shadow-purple-950/40"
          >
            While using the app
          </button>
          <button
            onClick={() => onGrant('only_once')}
            className="w-full py-2.5 px-4 rounded-full bg-slate-800/90 hover:bg-slate-700 active:scale-[0.98] text-slate-200 text-xs font-medium transition-all cursor-pointer"
          >
            Only this time
          </button>
          <button
            onClick={onDeny}
            className="w-full py-2 px-4 rounded-full text-slate-400 hover:text-white text-xs transition-colors cursor-pointer"
          >
            Don't allow
          </button>
        </div>

        <div className="mt-4 flex items-center gap-1.5 text-[10px] text-slate-400">
          <ShieldAlert className="w-3 h-3 text-purple-400" />
          <span>Android 15 Permission Manager · com.stancecrewsa.app</span>
        </div>
      </div>
    </div>
  );
};
