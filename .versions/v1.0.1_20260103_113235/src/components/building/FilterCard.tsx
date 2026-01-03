import React, { useState } from 'react';

export type FilterOptions = {
  status: string[];
  priceRange: [number, number];
  residenceType: string[];
  amenities: string[];
};

type FilterCardProps = {
  onFilterChange: (filters: FilterOptions) => void;
  onReset: () => void;
};

const FilterCard: React.FC<FilterCardProps> = ({ onFilterChange, onReset }) => {
  // Default to hidden/collapsed on initial GLB viewer load
  const [collapsed, setCollapsed] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([3, 10]);
  const [selectedResidenceTypes, setSelectedResidenceTypes] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  const statusOptions = ['Available', 'Reserved', 'Sold'];
  const residenceTypeOptions = ['1NE', '2WO', '3HREE', '4OUR', 'Duplex'];
  const amenitiesOptions = ['Clubhouses', 'Rooftop', 'Helipad'];

  const handleStatusToggle = (status: string) => {
    const updated = selectedStatus.includes(status)
      ? selectedStatus.filter((s) => s !== status)
      : [...selectedStatus, status];
    setSelectedStatus(updated);
    applyFilters(updated, priceRange, selectedResidenceTypes, selectedAmenities);
  };

  const handleResidenceTypeToggle = (type: string) => {
    const updated = selectedResidenceTypes.includes(type)
      ? selectedResidenceTypes.filter((t) => t !== type)
      : [...selectedResidenceTypes, type];
    setSelectedResidenceTypes(updated);
    applyFilters(selectedStatus, priceRange, updated, selectedAmenities);
  };

  const handleAmenityToggle = (amenity: string) => {
    const updated = selectedAmenities.includes(amenity)
      ? selectedAmenities.filter((a) => a !== amenity)
      : [...selectedAmenities, amenity];
    setSelectedAmenities(updated);
    applyFilters(selectedStatus, priceRange, selectedResidenceTypes, updated);
  };

  const handlePriceChange = (min: number, max: number) => {
    const updated: [number, number] = [min, max];
    setPriceRange(updated);
    applyFilters(selectedStatus, updated, selectedResidenceTypes, selectedAmenities);
  };

  const applyFilters = (
    status: string[],
    price: [number, number],
    residence: string[],
    amenities: string[],
  ) => {
    onFilterChange({
      status,
      priceRange: price,
      residenceType: residence,
      amenities,
    });
  };

  const handleReset = () => {
    setSelectedStatus([]);
    setPriceRange([3, 10]);
    setSelectedResidenceTypes([]);
    setSelectedAmenities([]);
    onReset();
  };

  const hasActiveFilters =
    selectedStatus.length > 0 ||
    selectedResidenceTypes.length > 0 ||
    selectedAmenities.length > 0 ||
    priceRange[0] !== 3 ||
    priceRange[1] !== 10;

  return (
    <div
      style={{
        ...styles.filterCard,
        transform: collapsed ? 'translateY(calc(-100% + 44px))' : 'translateY(0)',
      }}
    >
      <div 
        style={styles.cardHeader}
        onClick={() => setCollapsed((v) => !v)}
      >
        <div style={styles.cardHeading}>FILTERS</div>
        <div style={styles.headerRight}>
          {!collapsed && hasActiveFilters && (
      <button
              style={styles.resetButton} 
              onClick={(e) => {
                e.stopPropagation();
                handleReset();
              }}
            >
            Reset
          </button>
        )}
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="#F5EC9B" 
            strokeWidth="3"
            style={{
              ...styles.toggleIcon,
              transform: collapsed ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          >
            <path d="M18 15l-6 6-6-6" />
          </svg>
        </div>
      </div>

      {!collapsed && (
      <div style={styles.filterContent}>
        {/* Status Filter */}
        <div style={styles.filterSection}>
          <div style={styles.filterLabel}>Status</div>
          <div style={styles.chipContainer}>
            {statusOptions.map((status) => (
              <button
                key={status}
                style={{
                  ...styles.chip,
                  ...(selectedStatus.includes(status) ? styles.chipActive : {}),
                }}
                onClick={() => handleStatusToggle(status)}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Price Range Filter */}
        <div style={styles.filterSection}>
          <div style={styles.filterLabel}>Price Range (Crores)</div>
          <div style={styles.priceContainer}>
            <input
              type="number"
              value={priceRange[0]}
              min={3}
              max={10}
              step={0.5}
              onChange={(e) => handlePriceChange(parseFloat(e.target.value) || 3, priceRange[1])}
              style={styles.priceInput}
            />
            <span style={styles.priceSeparator}>to</span>
            <input
              type="number"
              value={priceRange[1]}
              min={3}
              max={10}
              step={0.5}
              onChange={(e) => handlePriceChange(priceRange[0], parseFloat(e.target.value) || 10)}
              style={styles.priceInput}
            />
          </div>
          <input
            type="range"
            min={3}
            max={10}
            step={0.1}
            value={priceRange[1]}
            onChange={(e) => handlePriceChange(priceRange[0], parseFloat(e.target.value))}
            style={styles.rangeSlider}
          />
        </div>

        {/* Residence Type Filter */}
        <div style={styles.filterSection}>
          <div style={styles.filterLabel}>Residence Type</div>
          <div style={styles.chipContainer}>
            {residenceTypeOptions.map((type) => (
              <button
                key={type}
                style={{
                  ...styles.chip,
                  ...(selectedResidenceTypes.includes(type) ? styles.chipActive : {}),
                }}
                onClick={() => handleResidenceTypeToggle(type)}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Amenities Filter */}
        <div style={styles.filterSection}>
          <div style={styles.filterLabel}>Amenities</div>
          <div style={styles.chipContainer}>
            {amenitiesOptions.map((amenity) => (
              <button
                key={amenity}
                style={{
                  ...styles.chip,
                  ...(selectedAmenities.includes(amenity) ? styles.chipActive : {}),
                }}
                onClick={() => handleAmenityToggle(amenity)}
              >
                {amenity}
              </button>
            ))}
          </div>
        </div>
      </div>
      )}
    </div>
  );
};

export default FilterCard;

const styles: { [key: string]: React.CSSProperties } = {
  filterCard: {
    position: 'absolute',
    left: 16,
    top: 24,
    background: 'rgba(0, 66, 54, 0.92)',
    borderRadius: 12,
    padding: '12px 16px',
    color: '#e2e8f0',
    width: 300,
    maxHeight: 'calc(100vh - 48px)',
    boxShadow: '0 10px 24px rgba(0,0,0,0.24)',
    backdropFilter: 'blur(2px)',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    transition: 'transform 0.3s ease',
    overflow: 'visible',
    border: '1px solid rgba(255,255,255,0.06)',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
    userSelect: 'none',
    padding: '6px 0',
    minHeight: 32,
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  cardHeading: {
    fontWeight: 800,
    fontSize: 16,
    background: 'linear-gradient(90deg, #905E26 0%, #F5EC9B 25.82%, #905E26 100%)',
    WebkitBackgroundClip: 'text',
    color: 'transparent',
    letterSpacing: '0.01em',
  },
  resetButton: {
    fontSize: 12,
    fontWeight: 700,
    color: '#0EA5E9',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '4px 8px',
    borderRadius: 6,
    transition: 'background 0.2s ease',
  },
  toggleIcon: {
    transition: 'transform 0.3s ease',
    flexShrink: 0,
  },
  filterContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
    maxHeight: 'calc(100vh - 140px)',
    overflowY: 'auto',
    paddingRight: 4,
  },
  filterSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: 800,
    background: 'linear-gradient(90deg, #905E26 0%, #F5EC9B 25.82%, #905E26 100%)',
    WebkitBackgroundClip: 'text',
    color: 'transparent',
    letterSpacing: '0.02em',
  },
  chipContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    padding: '6px 12px',
    borderRadius: 8,
    border: '1px solid rgba(255,255,255,0.2)',
    background: 'rgba(255,255,255,0.05)',
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  chipActive: {
    background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)',
    border: '1px solid #0EA5E9',
    color: '#f8fafc',
  },
  priceContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  priceInput: {
    flex: 1,
    padding: '6px 10px',
    borderRadius: 8,
    border: '1px solid rgba(255,255,255,0.2)',
    background: 'rgba(255,255,255,0.05)',
    color: '#f8fafc',
    fontSize: 13,
    fontWeight: 600,
    outline: 'none',
  },
  priceSeparator: {
    fontSize: 12,
    color: '#cbd5e1',
  },
  rangeSlider: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    outline: 'none',
    opacity: 0.8,
    transition: 'opacity 0.2s',
    cursor: 'pointer',
  },
};
