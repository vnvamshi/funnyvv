import React from 'react';
import iconVTour from '../../assets/images/v3.2/vtour.png';
import { VR_TOUR_URL } from '../../utils/vrTourUrl';
import iconPlayVideo from '../../assets/images/v3.2/play-video.png';
import iconFloorplan from '../../assets/images/v3.2/floorplan.png';
import pdGridCenter from '../../assets/images/v3.2/pd-grid-center.png';
import seeAllIcon from '../../assets/images/v3.2/see-all.png';
import ModalCloseButton from '../../components/ModalCloseButton';

interface RoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomName: string;
  roomImage: string;
  onRoomSelect: (roomName: string) => void;
  onSeeAllClick: () => void;
  rooms: { key: string; label: string; image: string }[];
}

const RoomModal: React.FC<RoomModalProps> = ({ 
  isOpen, 
  onClose, 
  roomName, 
  roomImage, 
  onRoomSelect,
  onSeeAllClick,
  rooms
}) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const [shouldRender, setShouldRender] = React.useState(false);
  const [activeView, setActiveView] = React.useState<'vtour' | 'video' | 'floorplan'>('vtour');

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
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ background: 'rgba(0, 66, 54, 0.8)' }}
      onClick={handleBackdropClick}
    >
      <div
        className={`bg-white rounded-2xl shadow-2xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden transform transition-all duration-300 relative ${
          isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
        }`}
      >
        <ModalCloseButton
          onClick={onClose}
          ariaLabel="Close room"
          className="absolute top-4 right-4 z-50"
        />
        <div className="flex flex-col lg:flex-row">
          {/* Left Side - Room Image */}
          <div className="flex-1 lg:w-2/3 p-6">
            <div className="relative h-96 lg:h-[500px] rounded-2xl overflow-hidden">
              <img
                src={roomImage}
                alt={roomName}
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* Right Side - Content and Navigation */}
          <div className="flex-1 lg:w-1/3 p-6 bg-white">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[#004236]" style={{ fontFamily: 'Inria Serif, serif' }}>{roomName}</h2>
            </div>

            {/* Description */}
            <div className="mb-6">
              <p className="text-gray-700 leading-relaxed">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor 
                incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud 
                exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
              </p>
            </div>

            {/* View Mode Buttons */}
            <div className="mb-6">
              <div className="flex space-x-2">
                <button
                  onClick={() => window.open(VR_TOUR_URL, '_blank', 'noopener,noreferrer')}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeView === 'vtour'
                      ? 'text-white'
                      : 'text-gray-700 hover:opacity-80'
                  }`}
                  style={activeView === 'vtour' ? {
                    background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)',
                    boxShadow: '3px 3px 5px 0px rgba(245, 236, 155, 0.2) inset, -3px -3px 5px 0px rgba(0, 0, 0, 0.25) inset, 21.14px 21.14px 21.14px 0px rgba(12, 101, 110, 0.1)'
                  } : {
                    background: 'rgba(245, 236, 155, 0.2)',
                    boxShadow: '3px 3px 3px 0px rgba(144, 94, 38, 0.2) inset, -3px -3px 3px 0px rgba(239, 234, 197, 1) inset'
                  }}
                >
                  <img src={iconVTour} alt="V Tour" className="w-4 h-4 mr-2" />
                  V Tour
                </button>
                <button
                  onClick={() => setActiveView('video')}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeView === 'video'
                      ? 'text-white'
                      : 'text-gray-700 hover:opacity-80'
                  }`}
                  style={activeView === 'video' ? {
                    background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)',
                    boxShadow: '3px 3px 5px 0px rgba(245, 236, 155, 0.2) inset, -3px -3px 5px 0px rgba(0, 0, 0, 0.25) inset, 21.14px 21.14px 21.14px 0px rgba(12, 101, 110, 0.1)'
                  } : {
                    background: 'rgba(245, 236, 155, 0.2)',
                    boxShadow: '3px 3px 3px 0px rgba(144, 94, 38, 0.2) inset, -3px -3px 3px 0px rgba(239, 234, 197, 1) inset'
                  }}
                >
                  <img src={iconPlayVideo} alt="Video" className="w-4 h-4 mr-2" />
                  Video
                </button>
                <button
                  onClick={() => setActiveView('floorplan')}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeView === 'floorplan'
                      ? 'text-white'
                      : 'text-gray-700 hover:opacity-80'
                  }`}
                  style={activeView === 'floorplan' ? {
                    background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)',
                    boxShadow: '3px 3px 5px 0px rgba(245, 236, 155, 0.2) inset, -3px -3px 5px 0px rgba(0, 0, 0, 0.25) inset, 21.14px 21.14px 21.14px 0px rgba(12, 101, 110, 0.1)'
                  } : {
                    background: 'rgba(245, 236, 155, 0.2)',
                    boxShadow: '3px 3px 3px 0px rgba(144, 94, 38, 0.2) inset, -3px -3px 3px 0px rgba(239, 234, 197, 1) inset'
                  }}
                >
                  <img src={iconFloorplan} alt="Floor plan" className="w-4 h-4 mr-2" />
                  Floor plan
                </button>
              </div>
            </div>

            {/* Room Tiles Grid - Single Row */}
            <div className="mt-8">
              <div className="grid grid-cols-4 gap-3">
                {rooms
                  .filter(room => room.label !== roomName) // Filter out the currently selected room
                  .slice(0, 3) // Show only first 3 rooms
                  .map((room) => (
                    <div
                      key={`grid-${room.key}`}
                      onClick={() => onRoomSelect(room.label)}
                      className="cursor-pointer group"
                    >
                      <div className="relative rounded-lg overflow-hidden h-24 bg-gray-100 border border-gray-200 group-hover:shadow-md transition-shadow duration-200">
                        <img
                          src={room.image}
                          alt={room.label}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                        {/* Center icon */}
                        <img src={pdGridCenter} alt="center icon" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 select-none pointer-events-none" />
                        <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-10 transition-all duration-200"></div>
                      </div>
                      <p className="text-xs font-medium text-gray-700 mt-1 text-center">{room.label}</p>
                    </div>
                  ))}
                {/* See All Rooms Button */}
                <div 
                  className="cursor-pointer group"
                  onClick={onSeeAllClick}
                >
                  <div className="relative rounded-lg overflow-hidden h-24 bg-gray-100 border border-gray-200 group-hover:shadow-md transition-shadow duration-200">
                    <img src={seeAllIcon} alt="See all" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
                    <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-10 transition-all duration-200"></div>
                  </div>
                  <p className="text-xs font-medium text-gray-700 mt-1 text-center">See all</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomModal;
