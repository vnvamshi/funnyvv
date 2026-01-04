import React from 'react';
import IcMobileFilter from '../../../assets/images/mobile/ic_mobile_filter.svg';

interface MobileHeaderProps {
  showHamburger?: boolean;
  showSearch?: boolean;
  showFilter?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onFilterClick?: () => void;
  onHamburgerClick?: () => void;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({
  showHamburger = true,
  showSearch = true,
  showFilter = true,
  searchValue = '',
  onSearchChange,
  onFilterClick,
  onHamburgerClick,
}) => {
  return (
    <div className="flex items-center px-3 py-2 bg-[#007E67] w-full" style={{height: 56}}>
      {showHamburger && (
        <button onClick={onHamburgerClick} className="mr-3">
          {/* TODO: Replace with actual hamburger icon */}
          <span className="block w-6 h-0.5 bg-white mb-1"></span>
          <span className="block w-6 h-0.5 bg-white mb-1"></span>
          <span className="block w-6 h-0.5 bg-white"></span>
        </button>
      )}
      {showSearch && (
        <input
          className="flex-1 rounded bg-white px-3 py-2 text-sm outline-none"
          placeholder="Search..."
          value={searchValue}
          onChange={e => onSearchChange && onSearchChange(e.target.value)}
        />
      )}
      {showFilter && (
        <button onClick={onFilterClick} className="ml-3">
          <img src={IcMobileFilter} alt="Filter" className="w-6 h-6" />
        </button>
      )}
    </div>
  );
};

export default MobileHeader; 