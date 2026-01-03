import React from 'react';
import gridIcon from '../../assets/images/v3.2/grid.png';
import fullviewIcon from '../../assets/images/v3.2/fullview.png';
import ModalCloseButton from '../../components/ModalCloseButton';

interface PhotosModalProps {
  isOpen: boolean;
  onClose: () => void;
  photos: string[];
  currentPhotoIndex: number;
  onPhotoSelect: (index: number) => void;
}

const PhotosModal: React.FC<PhotosModalProps> = ({
  isOpen,
  onClose,
  photos,
  currentPhotoIndex,
  onPhotoSelect
}) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const [shouldRender, setShouldRender] = React.useState(false);
  const [viewMode, setViewMode] = React.useState<'full' | 'grid'>('full');
  const openGuardRef = React.useRef(false);

  React.useEffect(() => {
    if (isOpen) {
      // Guard against immediate backdrop clicks caused by previous navigation click
      openGuardRef.current = true;
      setTimeout(() => { openGuardRef.current = false; }, 250);
      setShouldRender(true);
      setTimeout(() => {
        setIsVisible(true);
      }, 10);
    } else {
      setIsVisible(false);
      setTimeout(() => setShouldRender(false), 300);
    }
  }, [isOpen]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      if (openGuardRef.current) return; // ignore stray initial click immediately after opening
      onClose();
    }
  };

  const handlePrevious = () => {
    const newIndex = currentPhotoIndex > 0 ? currentPhotoIndex - 1 : photos.length - 1;
    onPhotoSelect(newIndex);
  };

  const handleNext = () => {
    const newIndex = currentPhotoIndex < photos.length - 1 ? currentPhotoIndex + 1 : 0;
    onPhotoSelect(newIndex);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') handlePrevious();
    if (e.key === 'ArrowRight') handleNext();
    if (e.key === 'Escape') onClose();
  };

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 z-[2000] flex items-center justify-center transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      style={{ background: 'rgba(0, 66, 54, 0.8)' }}
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >

      <div
        className={`bg-white rounded-2xl shadow-2xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden transform transition-all duration-300 relative ${isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
          }`}
      >
        
        {/* Top Right Controls */}
        <div className="absolute top-4 right-20 z-40 flex flex-col items-center gap-2 pointer-events-auto">
        <button
          onClick={onClose}
          className={`absolute top-4 right-20 p-2 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-lg transition-all duration-200 shadow-sm ${viewMode === 'grid' ? 'ring-2 ring-[#004236]' : ''
            }`}
          title="Grid View"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="#000000"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.8}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>

        </button>
          {/* Grid View Icon */}
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-lg transition-all duration-200 shadow-sm ${viewMode === 'grid' ? 'ring-2 ring-[#004236]' : ''
              }`}
            title="Grid View"
          >
            <img src={gridIcon} alt="Grid View" className="w-5 h-5" />
          </button>

          {/* Full View Icon */}
          <button
            onClick={() => setViewMode('full')}
            className={`p-2 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-lg transition-all duration-200 shadow-sm ${viewMode === 'full' ? 'ring-2 ring-[#004236]' : ''
              }`}
            title="Full View"
          >
            <img src={fullviewIcon} alt="Full View" className="w-5 h-5" />
          </button>

          {/* Photo Counter - only show in full view */}
          {viewMode === 'full' && (
            <div className="px-3 py-1 bg-white bg-opacity-90 rounded-lg text-sm text-gray-600 shadow-sm">
              {currentPhotoIndex + 1} of {photos.length}
            </div>
          )}
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-3rem)]">
          {viewMode === 'full' ? (
            /* Full View */
            <div className="relative flex justify-center">
              <div className="relative h-96 lg:h-[500px] w-3/4 max-w-4xl rounded-lg overflow-hidden">
                <img
                  src={photos[currentPhotoIndex]}
                  alt={`Photo ${currentPhotoIndex + 1}`}
                  className="w-full h-full object-cover"
                />

                {/* Navigation Arrows */}
                <button
                  onClick={handlePrevious}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black bg-opacity-60 hover:bg-opacity-80 rounded-full flex items-center justify-center transition-all duration-200 border border-[#F5EC9B]/70"
                >
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="#F5EC9B">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <button
                  onClick={handleNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black bg-opacity-60 hover:bg-opacity-80 rounded-full flex items-center justify-center transition-all duration-200 border border-[#F5EC9B]/70"
                >
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="#F5EC9B">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          ) : (
            /* Grid View - Layout similar to the image */
            <div className="space-y-6 max-w-4xl mx-auto">
              {/* Top Section - Two larger images side by side */}
              <div className="grid grid-cols-2 gap-4">
                {photos.slice(0, 2).map((photo, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      onPhotoSelect(index);
                      setViewMode('full');
                    }}
                    className="cursor-pointer group rounded-lg overflow-hidden transition-all duration-200 hover:shadow-lg"
                  >
                    <div className="relative aspect-[4/3]">
                      <img
                        src={photo}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Section - Horizontal grid of smaller images */}
              {photos.length > 2 && (
                <div className="grid grid-cols-3 gap-4 pr-20">
                  {photos.slice(2).map((photo, index) => (
                    <div
                      key={index + 2}
                      onClick={() => {
                        onPhotoSelect(index + 2);
                        setViewMode('full');
                      }}
                      className="cursor-pointer group rounded-lg overflow-hidden transition-all duration-200 hover:shadow-lg"
                    >
                      <div className="relative aspect-square">
                        <img
                          src={photo}
                          alt={`Photo ${index + 3}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PhotosModal;
