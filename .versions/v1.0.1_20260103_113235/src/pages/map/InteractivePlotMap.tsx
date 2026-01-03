import React, { useState, useRef, useEffect } from 'react';
import plotCoordinates from './plotCoordinates.json';

// Map image source - update this path to your actual map image
// You can place the image in the public folder and use: "/map-image.jpg"
// Or in src/assets/images and import it
const MAP_IMAGE_SRC = '/plot-map.jpg'; // Update this path to your image

// Type definitions for plot coordinates
type PlotCoordinate = {
  id: number;
  type: 'rectangle' | 'polygon';
  coordinates: {
    x: number;
    y: number;
    width?: number;
    height?: number;
    points?: Array<{ x: number; y: number }>;
  };
  center: {
    x: number;
    y: number;
  };
};

type PlotCoordinatesData = {
  imageWidth: number;
  imageHeight: number;
  plots: PlotCoordinate[];
};

// Mock plot data - you can replace this with real data from an API
const PLOT_DATA: Record<number, {
  id: number;
  area: string;
  status: 'available' | 'sold' | 'reserved';
  price?: number;
  owner?: string;
  type: 'residential' | 'commercial';
  features: string[];
}> = {
  1: { id: 1, area: '450 sqm', status: 'available', price: 250000, type: 'residential', features: ['Corner plot', 'Road facing'] },
  2: { id: 2, area: '380 sqm', status: 'sold', owner: 'John Doe', type: 'residential', features: ['Near park'] },
  5: { id: 5, area: '520 sqm', status: 'available', price: 320000, type: 'residential', features: ['Large plot', 'Corner location'] },
  6: { id: 6, area: '400 sqm', status: 'reserved', type: 'residential', features: ['Road facing'] },
  9: { id: 9, area: '480 sqm', status: 'available', price: 280000, type: 'residential', features: ['Corner plot'] },
  10: { id: 10, area: '350 sqm', status: 'sold', owner: 'Jane Smith', type: 'residential', features: ['Near entrance'] },
  11: { id: 11, area: '420 sqm', status: 'available', price: 295000, type: 'residential', features: ['Road facing'] },
  12: { id: 12, area: '390 sqm', status: 'available', price: 270000, type: 'residential', features: [] },
  14: { id: 14, area: '460 sqm', status: 'sold', owner: 'Robert Johnson', type: 'residential', features: ['Corner plot'] },
  15: { id: 15, area: '410 sqm', status: 'available', price: 285000, type: 'residential', features: ['Road facing'] },
  16: { id: 16, area: '440 sqm', status: 'reserved', type: 'residential', features: ['Near park'] },
  17: { id: 17, area: '370 sqm', status: 'available', price: 260000, type: 'residential', features: [] },
  18: { id: 18, area: '500 sqm', status: 'sold', owner: 'Emily Davis', type: 'residential', features: ['Large plot', 'Corner location'] },
  19: { id: 19, area: '430 sqm', status: 'available', price: 300000, type: 'residential', features: ['Road facing'] },
  20: { id: 20, area: '360 sqm', status: 'available', price: 255000, type: 'residential', features: [] },
  21: { id: 21, area: '490 sqm', status: 'sold', owner: 'Michael Brown', type: 'residential', features: ['Corner plot'] },
  23: { id: 23, area: '400 sqm', status: 'available', price: 275000, type: 'residential', features: ['Road facing'] },
  24: { id: 24, area: '450 sqm', status: 'reserved', type: 'residential', features: ['Near entrance'] },
  25: { id: 25, area: '420 sqm', status: 'available', price: 290000, type: 'residential', features: ['Corner plot'] },
  26: { id: 26, area: '380 sqm', status: 'sold', owner: 'Sarah Wilson', type: 'residential', features: ['Road facing'] },
  27: { id: 27, area: '470 sqm', status: 'available', price: 310000, type: 'residential', features: ['Large plot'] },
  28: { id: 28, area: '410 sqm', status: 'available', price: 280000, type: 'residential', features: [] },
  29: { id: 29, area: '440 sqm', status: 'sold', owner: 'David Miller', type: 'residential', features: ['Corner location'] },
  36: { id: 36, area: '390 sqm', status: 'available', price: 265000, type: 'residential', features: ['Road facing'] },
  37: { id: 37, area: '460 sqm', status: 'reserved', type: 'residential', features: ['Near park'] },
  38: { id: 38, area: '430 sqm', status: 'available', price: 295000, type: 'residential', features: ['Corner plot'] },
  39: { id: 39, area: '400 sqm', status: 'sold', owner: 'Lisa Anderson', type: 'residential', features: ['Road facing'] },
  40: { id: 40, area: '480 sqm', status: 'available', price: 315000, type: 'residential', features: ['Large plot', 'Corner location'] },
  42: { id: 42, area: '420 sqm', status: 'available', price: 288000, type: 'residential', features: [] },
  43: { id: 43, area: '450 sqm', status: 'sold', owner: 'James Taylor', type: 'residential', features: ['Corner plot'] },
  45: { id: 45, area: '410 sqm', status: 'available', price: 275000, type: 'residential', features: ['Road facing'] },
  48: { id: 48, area: '490 sqm', status: 'reserved', type: 'residential', features: ['Large plot'] },
  49: { id: 49, area: '440 sqm', status: 'available', price: 300000, type: 'residential', features: ['Corner location'] },
};

const InteractivePlotMap: React.FC = () => {
  const [rotation, setRotation] = useState(0);
  const [hoveredPlot, setHoveredPlot] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const imageRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  
  const coordinatesData = plotCoordinates as PlotCoordinatesData;

  // Handle mouse wheel for rotation
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (containerRef.current?.contains(e.target as Node)) {
        e.preventDefault();
        setRotation((prev) => prev + e.deltaY * 0.1);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      return () => container.removeEventListener('wheel', handleWheel);
    }
  }, []);

  // Handle drag rotation
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const deltaX = e.clientX - dragStart.x;
      setRotation((prev) => prev + deltaX * 0.5);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Get image dimensions when loaded
  useEffect(() => {
    const img = imgRef.current;
    if (img) {
      const updateDimensions = () => {
        setImageDimensions({
          width: img.naturalWidth || img.clientWidth,
          height: img.naturalHeight || img.clientHeight,
        });
      };
      if (img.complete) {
        updateDimensions();
      } else {
        img.addEventListener('load', updateDimensions);
        return () => img.removeEventListener('load', updateDimensions);
      }
    }
  }, []);

  // Check if point is inside a rectangle (accounting for rotation)
  const isPointInRectangle = (
    pointX: number,
    pointY: number,
    rectX: number,
    rectY: number,
    rectWidth: number,
    rectHeight: number,
    imageWidth: number,
    imageHeight: number,
    scaleX: number,
    scaleY: number
  ): boolean => {
    // Convert coordinates to image space
    const imgX = (pointX / scaleX) * (coordinatesData.imageWidth / imageWidth);
    const imgY = (pointY / scaleY) * (coordinatesData.imageHeight / imageHeight);
    
    return (
      imgX >= rectX &&
      imgX <= rectX + rectWidth &&
      imgY >= rectY &&
      imgY <= rectY + rectHeight
    );
  };

  // Handle plot hover detection using coordinates
  const handleImageHover = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current || !imgRef.current) return;
    
    const containerRect = imageRef.current.getBoundingClientRect();
    const imgRect = imgRef.current.getBoundingClientRect();
    
    // Get mouse position relative to the image container
    const mouseX = e.clientX - containerRect.left;
    const mouseY = e.clientY - containerRect.top;
    
    // Calculate scale factors
    const scaleX = imgRect.width / (imageDimensions.width || coordinatesData.imageWidth);
    const scaleY = imgRect.height / (imageDimensions.height || coordinatesData.imageHeight);
    
    // Account for rotation - convert mouse coordinates back to image space
    // For simplicity, we'll use the center of the image as rotation point
    const centerX = containerRect.width / 2;
    const centerY = containerRect.height / 2;
    
    // Rotate point back to original orientation
    const rad = (-rotation * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const dx = mouseX - centerX;
    const dy = mouseY - centerY;
    const rotatedX = dx * cos - dy * sin + centerX;
    const rotatedY = dx * sin + dy * cos + centerY;
    
    // Convert to image coordinates
    const imageX = ((rotatedX - (containerRect.width - imgRect.width) / 2) / scaleX) * 
                   (coordinatesData.imageWidth / (imageDimensions.width || coordinatesData.imageWidth));
    const imageY = ((rotatedY - (containerRect.height - imgRect.height) / 2) / scaleY) * 
                   (coordinatesData.imageHeight / (imageDimensions.height || coordinatesData.imageHeight));
    
    // Check which plot contains this point
    let foundPlot: number | null = null;
    
    for (const plot of coordinatesData.plots) {
      if (plot.type === 'rectangle' && plot.coordinates.width && plot.coordinates.height) {
        if (
          imageX >= plot.coordinates.x &&
          imageX <= plot.coordinates.x + plot.coordinates.width &&
          imageY >= plot.coordinates.y &&
          imageY <= plot.coordinates.y + plot.coordinates.height
        ) {
          foundPlot = plot.id;
          break;
        }
      }
    }
    
    setHoveredPlot(foundPlot);
  };

  const handleImageLeave = () => {
    setHoveredPlot(null);
  };

  const selectedPlot = hoveredPlot ? PLOT_DATA[hoveredPlot] : null;

  return (
    <div style={styles.container}>
      {/* Left Panel - Rotatable Map */}
      <div
        ref={containerRef}
        style={styles.leftPanel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          ref={imageRef}
          style={{
            ...styles.imageContainer,
            transform: `rotate(${rotation}deg)`,
            cursor: isDragging ? 'grabbing' : 'grab',
            transition: isDragging ? 'none' : 'transform 0.1s ease-out',
          }}
          onMouseMove={handleImageHover}
          onMouseLeave={handleImageLeave}
        >
          <div style={styles.mapWrapper}>
            <div style={styles.mapLabel}>Map</div>
            <img
              ref={imgRef}
              src={MAP_IMAGE_SRC}
              alt="Plot Map"
              style={styles.mapImage}
              draggable={false}
              onError={(e) => {
                // Fallback to placeholder if image not found
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const placeholder = target.nextElementSibling as HTMLElement;
                if (placeholder) placeholder.style.display = 'flex';
              }}
            />
            
            {/* Plot Overlays */}
            {imgRef.current && imageDimensions.width > 0 && (
              <svg
                style={styles.plotOverlay}
                viewBox={`0 0 ${coordinatesData.imageWidth} ${coordinatesData.imageHeight}`}
                preserveAspectRatio="none"
              >
                {coordinatesData.plots.map((plot) => {
                  if (plot.type === 'rectangle' && plot.coordinates.width && plot.coordinates.height) {
                    const isHovered = hoveredPlot === plot.id;
                    const plotData = PLOT_DATA[plot.id];
                    const statusColor = plotData
                      ? plotData.status === 'available'
                        ? '#10b981'
                        : plotData.status === 'sold'
                        ? '#ef4444'
                        : '#f59e0b'
                      : '#6b7280';
                    
                    return (
                      <g key={plot.id}>
                        {/* Plot rectangle */}
                        <rect
                          x={plot.coordinates.x}
                          y={plot.coordinates.y}
                          width={plot.coordinates.width}
                          height={plot.coordinates.height}
                          fill={isHovered ? statusColor : 'transparent'}
                          fillOpacity={isHovered ? 0.3 : 0}
                          stroke={statusColor}
                          strokeWidth={isHovered ? 3 : 2}
                          strokeOpacity={isHovered ? 1 : 0.6}
                          style={{
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            pointerEvents: 'all',
                          }}
                        />
                        {/* Plot number label */}
                        <text
                          x={plot.center.x}
                          y={plot.center.y}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fill={isHovered ? '#ffffff' : '#1f2937'}
                          fontSize="14"
                          fontWeight="700"
                          style={{
                            pointerEvents: 'none',
                            textShadow: isHovered
                              ? '0 0 4px rgba(0,0,0,0.8)'
                              : '0 0 2px rgba(255,255,255,0.8)',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          {plot.id}
                        </text>
                      </g>
                    );
                  }
                  return null;
                })}
              </svg>
            )}
            
            <div style={{ ...styles.mapPlaceholder, display: 'none' }}>
              <div style={styles.placeholderContent}>
                <p style={styles.placeholderText}>Plot Map</p>
                <p style={styles.placeholderSubtext}>
                  Please add your map image at: {MAP_IMAGE_SRC}
                </p>
                <p style={styles.placeholderSubtext}>
                  Or update MAP_IMAGE_SRC in the component
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Rotation Controls */}
        <div style={styles.controls}>
          <button
            onClick={() => setRotation((prev) => prev - 15)}
            style={styles.controlButton}
            title="Rotate Left"
          >
            ↺
          </button>
          <button
            onClick={() => setRotation(0)}
            style={styles.controlButton}
            title="Reset Rotation"
          >
            ⟲
          </button>
          <button
            onClick={() => setRotation((prev) => prev + 15)}
            style={styles.controlButton}
            title="Rotate Right"
          >
            ↻
          </button>
          <div style={styles.rotationDisplay}>
            {Math.round(rotation)}°
          </div>
        </div>
      </div>

      {/* Right Panel - Plot Details */}
      <div style={styles.rightPanel}>
        <h2 style={styles.title}>Plot Details</h2>
        {selectedPlot ? (
          <div style={styles.detailsCard}>
            <div style={styles.plotHeader}>
              <h3 style={styles.plotNumber}>Plot {selectedPlot.id}</h3>
              <span
                style={{
                  ...styles.statusBadge,
                  ...(selectedPlot.status === 'available'
                    ? styles.statusAvailable
                    : selectedPlot.status === 'sold'
                    ? styles.statusSold
                    : styles.statusReserved),
                }}
              >
                {selectedPlot.status.toUpperCase()}
              </span>
            </div>

            <div style={styles.detailsSection}>
              <div style={styles.detailRow}>
                <strong>Area:</strong> {selectedPlot.area}
              </div>
              <div style={styles.detailRow}>
                <strong>Type:</strong> {selectedPlot.type}
              </div>
              {selectedPlot.price && (
                <div style={styles.detailRow}>
                  <strong>Price:</strong> ${selectedPlot.price.toLocaleString()}
                </div>
              )}
              {selectedPlot.owner && (
                <div style={styles.detailRow}>
                  <strong>Owner:</strong> {selectedPlot.owner}
                </div>
              )}
            </div>

            {selectedPlot.features.length > 0 && (
              <div style={styles.featuresSection}>
                <strong>Features:</strong>
                <ul style={styles.featuresList}>
                  {selectedPlot.features.map((feature, idx) => (
                    <li key={idx}>{feature}</li>
                  ))}
                </ul>
              </div>
            )}

            <div style={styles.actionButtons}>
              <button style={styles.actionButton}>View Details</button>
              {selectedPlot.status === 'available' && (
                <button style={{ ...styles.actionButton, ...styles.primaryButton }}>
                  Inquire
                </button>
              )}
            </div>
          </div>
        ) : (
          <div style={styles.emptyState}>
            <p style={styles.emptyText}>
              Hover over a plot on the map to see its details
            </p>
            <div style={styles.instructions}>
              <h4 style={styles.instructionsTitle}>Instructions:</h4>
              <ul style={styles.instructionsList}>
                <li>Hover your cursor over any plot on the map</li>
                <li>Drag the map or use mouse wheel to rotate</li>
                <li>Use rotation buttons for precise control</li>
              </ul>
            </div>
          </div>
        )}

        {/* Plot Statistics */}
        <div style={styles.statsCard}>
          <h4 style={styles.statsTitle}>Plot Statistics</h4>
          <div style={styles.statsGrid}>
            <div style={styles.statItem}>
              <div style={styles.statValue}>
                {Object.values(PLOT_DATA).filter((p) => p.status === 'available').length}
              </div>
              <div style={styles.statLabel}>Available</div>
            </div>
            <div style={styles.statItem}>
              <div style={styles.statValue}>
                {Object.values(PLOT_DATA).filter((p) => p.status === 'sold').length}
              </div>
              <div style={styles.statLabel}>Sold</div>
            </div>
            <div style={styles.statItem}>
              <div style={styles.statValue}>
                {Object.values(PLOT_DATA).filter((p) => p.status === 'reserved').length}
              </div>
              <div style={styles.statLabel}>Reserved</div>
            </div>
            <div style={styles.statItem}>
              <div style={styles.statValue}>{Object.keys(PLOT_DATA).length}</div>
              <div style={styles.statLabel}>Total Plots</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractivePlotMap;

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    height: '100vh',
    width: '100vw',
    fontFamily:
      "Inter, Roboto, system-ui, -apple-system, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
    background: '#f5f5f5',
  },
  leftPanel: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#ffffff',
    position: 'relative',
    overflow: 'hidden',
    padding: '20px',
  },
  imageContainer: {
    width: '90%',
    maxWidth: '800px',
    height: '80%',
    maxHeight: '700px',
    position: 'relative',
    transformOrigin: 'center center',
  },
  mapWrapper: {
    width: '100%',
    height: '100%',
    position: 'relative',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
    background: '#f3f4f6',
  },
  mapLabel: {
    position: 'absolute',
    top: '16px',
    left: '16px',
    background: 'rgba(255,255,255,0.95)',
    padding: '8px 16px',
    borderRadius: '8px',
    fontWeight: 700,
    fontSize: '14px',
    color: '#1f2937',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    zIndex: 10,
    pointerEvents: 'none',
  },
  mapPlaceholder: {
    width: '100%',
    height: '100%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '12px',
    position: 'absolute',
    top: 0,
    left: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  placeholderContent: {
    textAlign: 'center',
    color: '#ffffff',
  },
  placeholderText: {
    fontSize: '32px',
    fontWeight: 700,
    marginBottom: '8px',
  },
  placeholderSubtext: {
    fontSize: '16px',
    opacity: 0.9,
    margin: '4px 0',
  },
  mapImage: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    userSelect: 'none',
    pointerEvents: 'auto',
    display: 'block',
  },
  plotOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    zIndex: 5,
  },
  controls: {
    position: 'absolute',
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    background: 'rgba(255,255,255,0.95)',
    padding: '12px 16px',
    borderRadius: '12px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
  },
  controlButton: {
    background: '#3b82f6',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    width: '40px',
    height: '40px',
    fontSize: '20px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.2s',
  },
  rotationDisplay: {
    marginLeft: '12px',
    padding: '0 12px',
    fontSize: '14px',
    fontWeight: 600,
    color: '#1f2937',
  },
  rightPanel: {
    width: '400px',
    background: '#ffffff',
    borderLeft: '1px solid #e5e7eb',
    padding: '24px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  title: {
    margin: 0,
    fontSize: '24px',
    fontWeight: 700,
    color: '#1f2937',
  },
  detailsCard: {
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '20px',
  },
  plotHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  plotNumber: {
    margin: 0,
    fontSize: '20px',
    fontWeight: 700,
    color: '#1f2937',
  },
  statusBadge: {
    padding: '4px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 600,
  },
  statusAvailable: {
    background: '#d1fae5',
    color: '#065f46',
  },
  statusSold: {
    background: '#fee2e2',
    color: '#991b1b',
  },
  statusReserved: {
    background: '#fef3c7',
    color: '#92400e',
  },
  detailsSection: {
    marginBottom: '16px',
  },
  detailRow: {
    marginBottom: '12px',
    fontSize: '14px',
    color: '#4b5563',
  },
  featuresSection: {
    marginBottom: '16px',
  },
  featuresList: {
    marginTop: '8px',
    paddingLeft: '20px',
    fontSize: '14px',
    color: '#4b5563',
  },
  actionButtons: {
    display: 'flex',
    gap: '8px',
  },
  actionButton: {
    flex: 1,
    padding: '10px 16px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    background: '#ffffff',
    color: '#1f2937',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  primaryButton: {
    background: '#3b82f6',
    color: '#ffffff',
    border: 'none',
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px 20px',
  },
  emptyText: {
    fontSize: '16px',
    color: '#6b7280',
    marginBottom: '24px',
  },
  instructions: {
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '20px',
    textAlign: 'left',
  },
  instructionsTitle: {
    margin: '0 0 12px 0',
    fontSize: '16px',
    fontWeight: 600,
    color: '#1f2937',
  },
  instructionsList: {
    margin: 0,
    paddingLeft: '20px',
    fontSize: '14px',
    color: '#4b5563',
    lineHeight: '1.8',
  },
  statsCard: {
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '20px',
  },
  statsTitle: {
    margin: '0 0 16px 0',
    fontSize: '18px',
    fontWeight: 600,
    color: '#1f2937',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
  },
  statItem: {
    textAlign: 'center',
    padding: '12px',
    background: '#ffffff',
    borderRadius: '8px',
  },
  statValue: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#3b82f6',
    marginBottom: '4px',
  },
  statLabel: {
    fontSize: '12px',
    color: '#6b7280',
    fontWeight: 500,
  },
};

