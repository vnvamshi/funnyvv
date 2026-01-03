import React from 'react';
import ModalCloseButton from '../../components/ModalCloseButton';

export interface ClubhouseModalProps {
  isOpen: boolean;
  onClose: () => void;
  name: string;
  image?: string;
  details?: string;
  amenities?: string[];
}

const ClubhouseModal: React.FC<ClubhouseModalProps> = ({
  isOpen,
  onClose,
  name,
  image,
  details,
  amenities,
}) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const [shouldRender, setShouldRender] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
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
      onClose();
    }
  };

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 z-[2000] flex items-center justify-center transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ background: 'rgba(0, 66, 54, 0.8)' }}
      onClick={handleBackdropClick}
    >
      <div
        className={`bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 h-[80vh] max-h-[95vh] overflow-hidden transform transition-all duration-300 relative ${
          isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
        }`}
      >
        <ModalCloseButton
          onClick={onClose}
          ariaLabel="Close clubhouse details"
          className="absolute top-4 right-4 z-50"
        />

        <div className="flex flex-col md:flex-row h-full">
          {/* Left - Image */}
          <div className="md:w-1/2 p-6 flex items-center justify-center bg-gray-50 h-full">
            <div className="w-full max-w-md h-full rounded-xl overflow-hidden bg-gray-200">
              {image ? (
                <img
                  src={image}
                  alt={name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">
                  No image available
                </div>
              )}
            </div>
          </div>

          {/* Right - Text content */}
          <div className="md:w-1/2 p-6 flex flex-col gap-4 h-full overflow-y-auto">
            <div>
              <h2 className="text-2xl font-bold text-[#004236] mb-2" style={{ fontFamily: 'Inria Serif, serif' }}>
                {name}
              </h2>
              {details ? (
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                  {details}
                </p>
              ) : (
                <p className="text-sm text-gray-600 leading-relaxed">
                  This clubhouse offers premium amenities designed for comfort, wellness and community experiences.
                </p>
              )}
            </div>

            {amenities && amenities.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-800 mb-2">Key amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {amenities.map((a) => (
                    <span
                      key={a}
                      className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-100"
                    >
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-auto pt-2 text-xs text-gray-400">
              Click outside the modal or use the close button to return to the building view.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClubhouseModal;

