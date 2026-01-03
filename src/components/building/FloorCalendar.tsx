import React, { useState, useMemo } from 'react';

type FloorCalendarProps = {
  glbMeta: Record<string, { floor: number; property: any[] }>;
  onFloorSelect: (floorNumber: number, meshName: string) => void;
  selectedFloor: number | null;
  onExplore?: () => void;
};

const FloorCalendar: React.FC<FloorCalendarProps> = ({ glbMeta, onFloorSelect, selectedFloor, onExplore }) => {
  // Default to hidden/collapsed on initial GLB viewer load
  const [collapsed, setCollapsed] = useState(true);

  // Create a mapping of floor number to mesh name
  const floorToMeshMap = useMemo(() => {
    const map: Record<number, string> = {};
    Object.entries(glbMeta).forEach(([meshName, data]) => {
      if (data.floor) {
        map[data.floor] = meshName;
      }
    });
    return map;
  }, [glbMeta]);

  // Get all floor numbers sorted
  const floors = useMemo(() => {
    return Object.keys(floorToMeshMap)
      .map(Number)
      .sort((a, b) => b - a); // Descending order (top floor first)
  }, [floorToMeshMap]);

  const handleFloorClick = (floorNumber: number) => {
    const meshName = floorToMeshMap[floorNumber];
    if (meshName) {
      onFloorSelect(floorNumber, meshName);
    }
  };

  return (
    <div
      style={{
        ...styles.calendarCard,
        transform: collapsed ? 'translateY(calc(-100% + 44px))' : 'translateY(0)',
      }}
    >
      <div 
        style={styles.cardHeader}
        onClick={() => setCollapsed((v) => !v)}
      >
        <div style={styles.cardHeading}>FLOORS</div>
        <div style={styles.headerRight}>
          {!collapsed && (
            <>
              <div style={styles.totalFloors}>{floors.length} Floors</div>
              {onExplore && (
                <button 
                  style={styles.exploreButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    onExplore();
                  }}
                >
                  Explore
                </button>
              )}
            </>
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
        <div style={styles.floorGrid}>
          {floors.map((floor) => (
            <button
              key={floor}
              style={{
                ...styles.floorButton,
                ...(selectedFloor === floor ? styles.floorButtonActive : {}),
              }}
              onClick={() => handleFloorClick(floor)}
              title={`Floor ${floor}`}
            >
              {floor}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default FloorCalendar;

const styles: { [key: string]: React.CSSProperties } = {
  calendarCard: {
    position: 'absolute',
    left: 332,
    top: 24,
    background: 'rgba(0, 66, 54, 0.92)',
    borderRadius: 12,
    padding: '12px 16px',
    color: '#e2e8f0',
    width: 320,
    maxHeight: 'calc(100vh - 140px)',
    boxShadow: '0 10px 24px rgba(0,0,0,0.24)',
    backdropFilter: 'blur(2px)',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    transition: 'transform 0.3s ease',
    overflow: 'visible',
    border: '1px solid rgba(255,255,255,0.06)',
    zIndex: 100,
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
  totalFloors: {
    fontSize: 11,
    fontWeight: 600,
    color: '#cbd5e1',
  },
  exploreButton: {
    fontSize: 12,
    fontWeight: 700,
    color: '#ffffff',
    background: 'linear-gradient(90deg, #905E26 0%, #F5EC9B 25.82%, #905E26 100%)',
    border: 'none',
    cursor: 'pointer',
    padding: '4px 12px',
    borderRadius: 6,
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 6px rgba(144, 94, 38, 0.3)',
  },
  toggleIcon: {
    transition: 'transform 0.3s ease',
    flexShrink: 0,
  },
  floorGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(8, 1fr)',
    gap: 6,
    maxHeight: 'calc(100vh - 220px)',
    overflowY: 'auto',
    paddingRight: 4,
  },
  floorButton: {
    padding: '8px 4px',
    borderRadius: 6,
    border: '1px solid rgba(255,255,255,0.15)',
    background: 'rgba(255,255,255,0.05)',
    color: '#cbd5e1',
    fontSize: 11,
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textAlign: 'center',
  },
  floorButtonActive: {
    background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)',
    border: '1px solid #0EA5E9',
    color: '#f8fafc',
    boxShadow: '0 2px 8px rgba(14,165,233,0.3)',
  },
};

