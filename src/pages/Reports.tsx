import React from 'react';

const Reports: React.FC = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-white">
    <div className="mb-6">
      <svg width="80" height="80" fill="none" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="4" fill="#EAF3F0"/><path d="M8 12h8M8 16h4" stroke="#007E67" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><rect x="4" y="4" width="16" height="16" rx="4" stroke="#007E67" strokeWidth="2"/></svg>
    </div>
    <h1 className="text-2xl font-bold text-[#007E67] mb-2">Reports Coming Soon</h1>
    <p className="text-gray-500 text-center max-w-xs">We're working on insightful reports for you. Please check back soon for updates!</p>
  </div>
);

export default Reports; 