import React from 'react';

const skeletons = Array.from({ length: 4 });

const AgentPropertyListSkeleton: React.FC = () => (
  <div>
    {skeletons.map((_, idx) => (
      <div
        key={idx}
        className="flex bg-white mb-6 items-center border border-[#E5E7EB] relative w-full animate-pulse"
        style={{ minHeight: 200, borderRadius: 10, boxSizing: 'border-box', padding: 0, overflow: 'hidden' }}
      >
        <div
          style={{
            width: 233,
            height: 230,
            borderRadius: 10,
            background: '#F0F0F0',
            marginLeft: 4,
            marginRight: 36,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        />
        <div className="flex-1 flex flex-col justify-center h-full py-4" style={{ minWidth: 0 }}>
          <div style={{ width: '100%' }}>
            <div className="h-7 w-1/2 bg-gray-200 rounded mb-2" />
            <div className="h-4 w-1/3 bg-gray-200 rounded mb-2" />
            <div className="flex items-center gap-4 mb-2">
              <div className="h-4 w-16 bg-gray-200 rounded" />
              <div className="h-4 w-24 bg-gray-200 rounded" />
              <div className="h-4 w-24 bg-gray-200 rounded" />
            </div>
            <div className="h-7 w-1/4 bg-gray-200 rounded mb-2" />
            <div className="flex items-center gap-2 mt-2">
              <div className="h-5 w-28 bg-gray-200 rounded" />
              <div className="h-5 w-24 bg-gray-200 rounded" />
              <div className="h-5 w-20 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-4 min-w-[120px] items-center h-full justify-center pr-10">
          <div className="h-8 w-24 bg-gray-200 rounded-full mb-2" />
          <div className="h-8 w-24 bg-gray-200 rounded-lg mb-2" />
          <div className="h-8 w-24 bg-gray-200 rounded-lg" />
        </div>
      </div>
    ))}
  </div>
);

export default AgentPropertyListSkeleton; 