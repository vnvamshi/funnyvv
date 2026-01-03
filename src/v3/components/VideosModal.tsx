import React from 'react';
import ModalCloseButton from '../../components/ModalCloseButton';

interface VideosModalProps {
  isOpen: boolean;
  onClose: () => void;
  videos: { title?: string; url: string }[];
}

const VideosModal: React.FC<VideosModalProps> = ({ isOpen, onClose, videos }) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const [shouldRender, setShouldRender] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  React.useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
      setTimeout(() => setShouldRender(false), 300);
    }
  }, [isOpen]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ background: 'rgba(0, 66, 54, 0.8)' }}
      onClick={handleBackdropClick}
    >
      <div className={`bg-white rounded-2xl shadow-2xl w-full max-w-6xl mx-4 max-h-[90vh] overflow-hidden transform transition-all duration-300 relative ${
        isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-2'
      }`}>
        <ModalCloseButton
          onClick={onClose}
          ariaLabel="Close videos"
          className="absolute top-4 right-4 z-50"
        />
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-emerald-900">Property Videos</h3>
        </div>
        <div className="p-4 overflow-hidden" style={{ maxHeight: '80vh' }}>
          <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4 h-full">
            {/* Left: Selected video player */}
            <div className="w-full h-full">
              <div className="w-full aspect-video bg-black rounded-lg overflow-hidden">
                {(() => {
                  const v = videos[selectedIndex] || videos[0];
                  const isMp4 = v ? /\.mp4(\?.*)?$/i.test(v.url) : false;
                  if (!v) return null;
                  return isMp4 ? (
                    <video src={v.url} className="w-full h-full" controls preload="metadata" />
                  ) : (
                    <iframe
                      src={v.url}
                      title={v.title || `Video ${selectedIndex + 1}`}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  );
                })()}
              </div>
              {/* Title below player */}
              {videos[selectedIndex]?.title ? (
                <div className="mt-2 px-1.5 py-1 text-sm text-gray-800">{videos[selectedIndex]?.title}</div>
              ) : null}
            </div>

            {/* Right: Details and list */}
            <aside className="w-full h-full overflow-y-auto border-l border-gray-200 pl-3">
              <div className="mb-3">
                <div className="text-base font-semibold text-emerald-900">Video Details</div>
                <div className="mt-1 text-sm text-gray-600">
                  {videos[selectedIndex]?.title || 'Selected Video'}
                </div>
                {(() => {
                  const v = videos[selectedIndex];
                  if (!v) return null;
                  const isMp4 = /\.mp4(\?.*)?$/i.test(v.url);
                  return (
                    <div className="mt-2 text-xs text-gray-500">Source: {isMp4 ? 'Local file' : 'Embedded'}</div>
                  );
                })()}
              </div>

              {/* Video list */}
              <div>
                <div className="text-sm font-medium text-gray-800 mb-2">All Videos</div>
                <div className="space-y-2">
                  {videos.map((v, idx) => (
                    <button
                      key={`${v.url}-${idx}`}
                      type="button"
                      onClick={() => setSelectedIndex(idx)}
                      className={`w-full text-left px-3 py-2 rounded-lg border transition-colors ${
                        idx === selectedIndex
                          ? 'border-emerald-300 bg-emerald-50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-gray-200 flex items-center justify-center text-xs text-gray-600">
                          {idx + 1}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-gray-900 truncate">{v.title || `Video ${idx + 1}`}</div>
                          <div className="text-xs text-gray-600 truncate">{/\.mp4(\?.*)?$/i.test(v.url) ? 'Local MP4' : 'Embedded'}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideosModal;


