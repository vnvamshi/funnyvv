import React from 'react';

const AgentPropertyDetailsSkeleton: React.FC<{ mobile?: boolean }> = ({ mobile }) => {
  if (mobile) {
    return (
      <div className="w-full min-h-screen bg-[#F8FAF9] flex flex-col animate-pulse">
        <div className="px-4 pt-6 pb-2">
          <div className="h-6 w-2/3 bg-gray-200 rounded mb-2" /> {/* Title */}
          <div className="h-3 w-1/2 bg-gray-200 rounded mb-2" /> {/* Address */}
          <div className="flex gap-2 items-center mb-2">
            <div className="h-4 w-24 bg-gray-200 rounded" />
            <div className="h-4 w-20 bg-gray-200 rounded" />
          </div>
          <div className="flex gap-2 items-center">
            <div className="h-3 w-20 bg-gray-200 rounded" />
            <div className="h-3 w-16 bg-gray-200 rounded" />
            <div className="h-5 w-14 bg-gray-200 rounded-full" />
          </div>
        </div>
        <div className="flex-1 px-4 py-4">
          <div className="w-full h-48 bg-gray-200 rounded-lg mb-4" /> {/* Main image/content */}
          <div className="h-4 w-3/4 bg-gray-200 rounded mb-2" />
          <div className="h-4 w-1/2 bg-gray-200 rounded mb-2" />
          <div className="h-4 w-2/3 bg-gray-200 rounded mb-2" />
          <div className="h-4 w-1/3 bg-gray-200 rounded mb-2" />
        </div>
      </div>
    );
  }
  // Desktop
  return (
    <div className="w-full flex flex-col items-center bg-[#F8FAF9] min-h-screen animate-pulse">
      <div className="w-full px-8 mt-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="h-8 w-1/3 bg-gray-200 rounded mb-2" /> {/* Title */}
            <div className="h-4 w-1/2 bg-gray-200 rounded mb-2" /> {/* Address */}
            <div className="flex gap-4 items-center mb-2">
              <div className="h-4 w-24 bg-gray-200 rounded" />
              <div className="h-4 w-20 bg-gray-200 rounded" />
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex gap-2 items-center">
              <div className="h-3 w-24 bg-gray-200 rounded" />
              <div className="h-3 w-16 bg-gray-200 rounded" />
              <div className="h-5 w-20 bg-gray-200 rounded-full" />
            </div>
            <div className="flex gap-2 mt-2">
              <div className="h-8 w-20 bg-gray-200 rounded-lg" />
              <div className="h-8 w-20 bg-gray-200 rounded-lg" />
            </div>
          </div>
        </div>
        <div className="w-full">
          <div className="w-full h-80 bg-gray-200 rounded-xl mb-6" /> {/* Main image/content */}
          <div className="h-5 w-1/2 bg-gray-200 rounded mb-2" />
          <div className="h-4 w-1/3 bg-gray-200 rounded mb-2" />
          <div className="h-4 w-2/3 bg-gray-200 rounded mb-2" />
          <div className="h-4 w-1/4 bg-gray-200 rounded mb-2" />
        </div>
      </div>
    </div>
  );
};

export default AgentPropertyDetailsSkeleton; 