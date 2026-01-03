import React from 'react';

const skeletons = Array.from({ length: 6 });

const PropertyListSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 max-[1024px]:grid-cols-1 min-[1025px]:grid-cols-2 gap-4 md:gap-6">
    {skeletons.map((_, idx) => (
      <div
        key={idx}
        className="bg-gray-200 rounded-2xl shadow-md border border-gray-200 relative flex flex-col overflow-hidden p-0 animate-pulse"
        style={{ minHeight: 340 }}
      >
        <div className="absolute top-2 left-2 bg-gray-300 rounded px-6 py-2 w-32 h-6 z-20" />
        <div className="w-full h-56 bg-gray-300" />
        <div className="flex-1 flex flex-col justify-between p-4">
          <div>
            <div className="h-6 w-2/3 bg-gray-300 rounded mb-2" />
            <div className="h-3 w-1/3 bg-gray-300 rounded mb-2" />
            <div className="flex items-center gap-2 mb-1">
              <div className="h-3 w-10 bg-gray-300 rounded" />
              <div className="h-3 w-10 bg-gray-300 rounded" />
              <div className="h-3 w-16 bg-gray-300 rounded" />
            </div>
          </div>
          <div className="h-6 w-1/4 bg-gray-300 rounded mt-4" />
        </div>
      </div>
    ))}
  </div>
);

export default PropertyListSkeleton;

// New: SavedHomeListSkeleton for desktop
export const SavedHomeListSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-x-1 gap-y-6" style={{ paddingBottom: 30 }}>
    {Array.from({ length: 8 }).map((_, idx) => (
      <div
        key={idx}
        className="bg-white rounded-[10px] shadow-md relative flex flex-col border border-gray-200 animate-pulse"
        style={{ width: 303, height: 315, minWidth: 303, maxWidth: 303 }}
      >
        <div className="relative">
          <div className="w-full h-[160px] bg-gray-200 rounded-t-[10px] rounded-b-none" />
          <div className="absolute top-3 right-3 flex gap-2 z-10">
            <div className="bg-white rounded-full p-1 shadow border border-gray-200 w-8 h-8 flex items-center justify-center">
              <div className="w-6 h-6 bg-gray-300 rounded-full" />
            </div>
          </div>
        </div>
        <div className="flex flex-col flex-1 px-3 pt-2 pb-2">
          <div className="h-[40px] w-3/4 bg-gray-200 rounded mb-1" />
          <div className="h-3 w-1/2 bg-gray-200 rounded mb-1" />
          <div className="h-3 w-2/3 bg-gray-200 rounded mb-2" />
          <div className="h-6 w-1/2 bg-gray-200 rounded mt-auto" />
        </div>
      </div>
    ))}
  </div>
);

// New: SavedHomeListSkeletonMobile for mobile
export const SavedHomeListSkeletonMobile: React.FC = () => (
  <div className="w-full">
    {Array.from({ length: 4 }).map((_, idx) => (
      <div
        key={idx}
        className="bg-white rounded-[10px] shadow mb-4 relative flex flex-col border border-gray-100 w-full animate-pulse"
      >
        <div className="relative">
          <div className="w-full h-[160px] bg-gray-200 rounded-t-[10px] rounded-b-none" />
          <div className="absolute top-3 right-3 bg-white rounded-full p-1 shadow border border-gray-200 z-10 w-8 h-8 flex items-center justify-center">
            <div className="w-6 h-6 bg-gray-300 rounded-full" />
          </div>
        </div>
        <div className="flex flex-col flex-1 px-3 pt-2 pb-2">
          <div className="h-[40px] w-3/4 bg-gray-200 rounded mb-1" />
          <div className="h-3 w-1/2 bg-gray-200 rounded mb-1" />
          <div className="h-3 w-2/3 bg-gray-200 rounded mb-2" />
          <div className="h-6 w-1/2 bg-gray-200 rounded mt-auto" />
        </div>
      </div>
    ))}
  </div>
);

// New: SavedHomeListSkeletonRow for next page loading (one row of 4 skeletons)
export const SavedHomeListSkeletonRow: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-x-1 gap-y-6" style={{ paddingBottom: 30 }}>
    {Array.from({ length: 4 }).map((_, idx) => (
      <div
        key={idx}
        className="bg-white rounded-[10px] shadow-md relative flex flex-col border border-gray-200 animate-pulse"
        style={{ width: 303, height: 315, minWidth: 303, maxWidth: 303 }}
      >
        <div className="relative">
          <div className="w-full h-[160px] bg-gray-200 rounded-t-[10px] rounded-b-none" />
          <div className="absolute top-3 right-3 flex gap-2 z-10">
            <div className="bg-white rounded-full p-1 shadow border border-gray-200 w-8 h-8 flex items-center justify-center">
              <div className="w-6 h-6 bg-gray-300 rounded-full" />
            </div>
          </div>
        </div>
        <div className="flex flex-col flex-1 px-3 pt-2 pb-2">
          <div className="h-[40px] w-3/4 bg-gray-200 rounded mb-1" />
          <div className="h-3 w-1/2 bg-gray-200 rounded mb-1" />
          <div className="h-3 w-2/3 bg-gray-200 rounded mb-2" />
          <div className="h-6 w-1/2 bg-gray-200 rounded mt-auto" />
        </div>
      </div>
    ))}
  </div>
); 