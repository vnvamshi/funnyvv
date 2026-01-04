import React, { useCallback } from 'react';
import useAgentPropertyDetails from './logic/useAgentPropertyDetails';
import AgentPropertyDetailsDesktop from './AgentPropertyDetailsDesktop';
import AgentPropertyDetailsMobile from './AgentPropertyDetailsMobile';
import useIsMobile from '../../../hooks/useIsMobile';
import api from '../../../utils/api';
import AgentPropertyDetailsSkeleton from './AgentPropertyDetailsSkeleton';

const AgentPropertyDetails: React.FC = () => {
  const isMobile = useIsMobile();
  const { property, loading, error, activeTab, setActiveTab, refreshProperty } = useAgentPropertyDetails();
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
    setLocalProperty({ ...localProperty, is_saved: intendedIsSaved });
    intendedIsSavedRef.current = intendedIsSaved;
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(async () => {
      try {
        const res = await api.post('/agent/properties/save/', {
          user_id: userId,
          property_id: localProperty.property_id,
          is_saved: intendedIsSaved,
        });
        if (res?.data?.is_saved !== undefined) {
          setLocalProperty((prev) => prev ? { ...prev, is_saved: !!res.data.is_saved } : prev);
        }
      } catch (e) {
        setLocalProperty((prev) => prev ? { ...prev, is_saved: !intendedIsSavedRef.current } : prev);
      }
    }, 500);
  }, [localProperty]);

  if (loading) return isMobile ? <AgentPropertyDetailsSkeleton mobile /> : <AgentPropertyDetailsSkeleton />;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!property) return <div>No property found.</div>;

  if (isMobile) {
    return <AgentPropertyDetailsMobile property={localProperty || property} activeTab={activeTab} setActiveTab={setActiveTab} onToggleSave={handleToggleSave} refreshProperty={refreshProperty} />;
  }
  return <AgentPropertyDetailsDesktop property={localProperty || property} activeTab={activeTab} setActiveTab={setActiveTab} onToggleSave={handleToggleSave} refreshProperty={refreshProperty} />;
};

export default AgentPropertyDetails; 