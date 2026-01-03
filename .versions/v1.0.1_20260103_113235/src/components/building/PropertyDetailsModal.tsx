import React from 'react';

type UnitStatusTone = 'green' | 'red' | 'yellow';
type UnitStatus = { label: string; tone: UnitStatusTone };
type PropertyData = {
  id: string;
  status?: UnitStatus;
  beds?: string;
  interior?: string;
  facing?: string;
  price?: number;
  residenceType?: string;
  amenities?: string[];
  image?: string;
  propertyType?: string;
  notProperty?: boolean;
  details?: string;
};

type PropertyDetailsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  property: PropertyData | null;
  floorNumber?: number;
  propertyImages: Record<string, string>;
  homeIcon: string;
};

const PropertyDetailsModal: React.FC<PropertyDetailsModalProps> = ({
  isOpen,
  onClose,
  property,
  floorNumber,
  propertyImages,
  homeIcon,
}) => {
  if (!isOpen || !property) return null;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button style={styles.closeButton} onClick={onClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <div style={styles.modalContent}>
          {/* Header Section */}
          <div style={styles.header}>
            <div style={styles.propertyMainTitle}>
              <span style={styles.propertyId}>{property.id}</span>
            </div>
            {floorNumber && (
              <div style={styles.floorBadge}>Floor {floorNumber}</div>
            )}
          </div>

          {/* Image Section */}
          <div style={styles.imageSection}>
            <img
              src={property.image && propertyImages[property.image] ? propertyImages[property.image] : homeIcon}
              alt={property.id}
              style={styles.mainImage}
            />
          </div>

          {/* Details Section */}
          <div style={styles.detailsSection}>
            {!property.notProperty ? (
              <>
                {/* Status and Facing */}
                <div style={styles.topRow}>
                  {property.facing && (
                    <div style={styles.facingBadge}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M12 21s-7-5.4-7-11a7 7 0 1 1 14 0c0 5.6-7 11-7 11Z" />
                        <circle cx="12" cy="10" r="2.5" />
                      </svg>
                      <span>{property.facing} Facing</span>
                    </div>
                  )}
                  {property.status && (
                    <span
                      style={{
                        ...styles.statusBadge,
                        backgroundColor:
                          property.status.tone === 'green'
                            ? '#22c55e'
                            : property.status.tone === 'yellow'
                              ? '#f59e0b'
                              : '#ef4444',
                      }}
                    >
                      {property.status.label}
                    </span>
                  )}
                </div>

                {/* Property Specifications */}
                <div style={styles.specsGrid}>
                  {property.beds && (
                    <div style={styles.specItem}>
                      <div style={styles.specLabel}>Bedrooms</div>
                      <div style={styles.specValue}>{property.beds}</div>
                    </div>
                  )}
                  <div style={styles.specItem}>
                    <div style={styles.specLabel}>Bathrooms</div>
                    <div style={styles.specValue}>5</div>
                  </div>
                  {property.interior && (
                    <div style={styles.specItem}>
                      <div style={styles.specLabel}>Interior</div>
                      <div style={styles.specValue}>{property.interior}</div>
                    </div>
                  )}
                  {property.propertyType && (
                    <div style={styles.specItem}>
                      <div style={styles.specLabel}>Property Type</div>
                      <div style={styles.specValue}>{property.propertyType}</div>
                    </div>
                  )}
                </div>

                {/* Amenities */}
                {property.amenities && property.amenities.length > 0 && (
                  <div style={styles.amenitiesSection}>
                    <div style={styles.amenitiesLabel}>Amenities</div>
                    <div style={styles.amenitiesGrid}>
                      {property.amenities.map((amenity) => (
                        <div key={amenity} style={styles.amenityChip}>
                          {amenity}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Price */}
                {property.price !== undefined && (
                  <div style={styles.priceSection}>
                    <div style={styles.priceLabel}>Price</div>
                    <div style={styles.priceValue}>Rs. {property.price} Cr</div>
                  </div>
                )}
              </>
            ) : (
              // For non-property items (clubhouse, etc.)
              <>
                {property.propertyType && (
                  <div style={styles.propertyTypeBadge}>{property.propertyType}</div>
                )}
                {property.details && (
                  <div style={styles.description}>{property.details}</div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailsModal;

const styles: { [key: string]: React.CSSProperties } = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.75)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    backdropFilter: 'blur(4px)',
  },
  modal: {
    position: 'relative',
    width: '90vw',
    maxWidth: '600px',
    maxHeight: '90vh',
    background: 'linear-gradient(180deg, rgba(0, 67, 54, 0.98) 0%, rgba(0, 66, 54, 0.95) 100%)',
    borderRadius: 16,
    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
    overflow: 'hidden',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: '50%',
    border: '1px solid rgba(255,255,255,0.2)',
    background: 'rgba(0, 0, 0, 0.4)',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    zIndex: 10,
    transition: 'all 0.2s ease',
  },
  modalContent: {
    padding: '24px',
    overflowY: 'auto',
    maxHeight: '90vh',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  propertyMainTitle: {
    fontSize: 32,
    fontWeight: 800,
  },
  propertyId: {
    background: 'linear-gradient(90deg, #905E26 0%, #F5EC9B 25.82%, #905E26 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  floorBadge: {
    padding: '8px 16px',
    borderRadius: 8,
    background: 'rgba(0, 126, 103, 0.3)',
    color: 'rgba(245, 236, 155, 1)',
    fontSize: 14,
    fontWeight: 600,
    border: '1px solid rgba(255,255,255,0.15)',
  },
  imageSection: {
    width: '100%',
    marginBottom: 24,
  },
  mainImage: {
    width: '100%',
    height: 320,
    objectFit: 'cover',
    borderRadius: 12,
    border: '1px solid rgba(255,255,255,0.1)',
  },
  detailsSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  },
  topRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  facingBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 13,
    color: 'rgba(245, 236, 155, 1)',
    fontWeight: 500,
    background: 'rgba(0, 126, 103, 0.2)',
    padding: '6px 12px',
    borderRadius: 8,
  },
  statusBadge: {
    padding: '6px 14px',
    borderRadius: 8,
    color: '#ffffff',
    fontWeight: 700,
    fontSize: 13,
    lineHeight: 1.2,
  },
  specsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 16,
  },
  specItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  specLabel: {
    fontSize: 12,
    fontWeight: 700,
    color: 'rgba(245, 236, 155, 1)',
    letterSpacing: '0.02em',
  },
  specValue: {
    fontSize: 18,
    fontWeight: 700,
    color: '#ffffff',
  },
  amenitiesSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  amenitiesLabel: {
    fontSize: 14,
    fontWeight: 700,
    color: 'rgba(245, 236, 155, 1)',
    letterSpacing: '0.02em',
  },
  amenitiesGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
  },
  amenityChip: {
    padding: '6px 12px',
    borderRadius: 8,
    background: 'rgba(0, 126, 103, 0.3)',
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 600,
    border: '1px solid rgba(255,255,255,0.15)',
  },
  priceSection: {
    padding: '16px',
    background: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 12,
    border: '1px solid rgba(255,255,255,0.1)',
  },
  priceLabel: {
    fontSize: 14,
    fontWeight: 700,
    color: 'rgba(245, 236, 155, 1)',
    marginBottom: 6,
  },
  priceValue: {
    fontSize: 28,
    fontWeight: 800,
    color: '#ffffff',
    letterSpacing: '0.01em',
  },
  propertyTypeBadge: {
    padding: '8px 16px',
    borderRadius: 8,
    background: 'rgba(0, 126, 103, 0.3)',
    color: 'rgba(245, 236, 155, 1)',
    fontSize: 14,
    fontWeight: 600,
    border: '1px solid rgba(255,255,255,0.15)',
    display: 'inline-block',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#cbd5e1',
    lineHeight: 1.6,
    fontWeight: 400,
  },
};

