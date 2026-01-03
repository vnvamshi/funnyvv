// This file should be named useShare.tsx to support JSX
import { useState, useCallback } from 'react';

interface UseShareOptions {
  title: string;
  text?: string;
  url?: string;
}

export function useShare({ title, text, url }: UseShareOptions) {
  const [shareModalOpen, setShareModalOpen] = useState(false);

  const handleShare = useCallback(() => {
    if (navigator.share) {
      navigator.share({
        title,
        text: text || title,
        url: url || window.location.href,
      });
    } else {
      setShareModalOpen(true);
    }
  }, [title, text, url]);

  // Modal JSX for fallback
  const ShareModal = shareModalOpen ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl p-6 w-11/12 max-w-sm shadow-lg relative">
        <button className="absolute top-2 right-2 text-gray-500 text-2xl" onClick={() => setShareModalOpen(false)}>&times;</button>
        <div className="font-bold text-lg mb-4">Share Not Supported</div>
        <div className="text-gray-700 mb-4">Your browser does not support the native share functionality.</div>
        <div className="flex flex-col gap-2">
          <input
            className="w-full border rounded px-2 py-1 text-sm mb-2 bg-gray-100"
            value={url || window.location.href}
            readOnly
            onFocus={e => (e.target as HTMLInputElement).select()}
          />
          <button
            className="bg-[#007E67] text-white rounded px-4 py-2 font-semibold"
            onClick={() => {
              navigator.clipboard.writeText(url || window.location.href);
            }}
          >
            Copy Link
          </button>
        </div>
      </div>
    </div>
  ) : null;

  return { handleShare, shareModalOpen, setShareModalOpen, ShareModal };
} 