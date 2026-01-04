import React from 'react';

const skeletons = Array.from({ length: 4 });

const AgentPropertyListSkeletonMobile: React.FC = () => (
  <div>
    {skeletons.map((_, idx) => (
      <div
        key={idx}
        className="flex bg-white mb-4 rounded-lg shadow-sm p-3 items-center animate-pulse"
      >
        <div className="w-20 h-20 rounded-lg mr-3 bg-gray-200" />
        <div className="flex-1 min-w-0">
          <div className="h-5 w-1/2 bg-gray-200 rounded mb-1" />
          <div className="h-3 w-1/3 bg-gray-200 rounded mb-1" />
          <div className="flex gap-2 mb-1">
            <div className="h-3 w-10 bg-gray-200 rounded" />
            <div className="h-3 w-10 bg-gray-200 rounded" />
            <div className="h-3 w-16 bg-gray-200 rounded" />
          </div>
          <div className="h-5 w-1/4 bg-gray-200 rounded mb-1" />
          <div className="flex items-center gap-1 mt-1">
            <div className="h-4 w-20 bg-gray-200 rounded" />
            <div className="h-4 w-16 bg-gray-200 rounded" />
            <div className="h-4 w-14 bg-gray-200 rounded" />
          </div>
        </div>
        <div className="flex flex-col items-end ml-2 min-w-[60px]">
          <div className="h-6 w-14 bg-gray-200 rounded-full mb-2" />
          <div className="h-6 w-14 bg-gray-200 rounded-lg mb-2" />
          <div className="h-6 w-14 bg-gray-200 rounded-lg" />
        </div>
      </div>
    ))}
  </div>
);

export default AgentPropertyListSkeletonMobile; 