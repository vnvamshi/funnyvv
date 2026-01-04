import React, { useCallback } from 'react';
import usePropertyDetails from './logic/usePropertyDetails';
import DesktopPropertyDetailsUI, { PropertyDetailsSkeleton as DesktopSkeleton } from './DesktopPropertyDetailsUI';
import MobilePropertyDetailsUI, { PropertyDetailsSkeleton as MobileSkeleton } from './MobilePropertyDetailsUI';
import useIsMobile from '../../hooks/useIsMobile';
import api from '../../utils/api';

const PropertyDetails: React.FC = () => {
  const isMobile = useIsMobile(); // Now uses 1024px breakpoint
  const { property, loading, error, activeTab, setActiveTab } = usePropertyDetails();
  const [localProperty, setLocalProperty] = React.useState(property);

  // Debounce timer ref
  const debounceRef = React.useRef<number | null>(null);
  // Track the latest intended is_saved state
  const intendedIsSavedRef = React.useRef<boolean | undefined>(undefined);

  React.useEffect(() => {
    setLocalProperty(property);
  }, [property]);

  const handleToggleSave = useCallback((userId: string, intendedIsSaved: boolean) => {
    if (!localProperty) return;
    // Optimistically set is_saved
    setLocalProperty({ ...localProperty, is_saved: intendedIsSaved });
    intendedIsSavedRef.current = intendedIsSaved;
    // Debounce API call
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(async () => {
      try {
        const res = await api.post('/buyer/saved-homes/toggle/', {
          user_id: userId,
          property_id: localProperty.property_id,
          is_saved: intendedIsSaved,
        });
        if (res?.data?.is_saved !== undefined) {
          setLocalProperty((prev) => prev ? { ...prev, is_saved: !!res.data.is_saved } : prev);
        }
      } catch (e) {
        // Optionally revert UI on error
        setLocalProperty((prev) => prev ? { ...prev, is_saved: !intendedIsSavedRef.current } : prev);
      }
    }, 500);
  }, [localProperty]);

  if (loading) return isMobile ? <MobileSkeleton /> : <DesktopSkeleton />;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!property) return <div>No property found.</div>;

  if (isMobile) {
    return <MobilePropertyDetailsUI property={localProperty || property} activeTab={activeTab} setActiveTab={setActiveTab} onToggleSave={handleToggleSave} />;
  }
  return <DesktopPropertyDetailsUI property={localProperty || property} preview='' activeTab={activeTab} setActiveTab={setActiveTab} onToggleSave={handleToggleSave} />;
};

export default PropertyDetails; 