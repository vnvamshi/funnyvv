import React, { useState, useEffect } from 'react';
import BottomModal from '../../../../../components/BottomModal';
import { useNavigate, useParams } from 'react-router-dom';
import { MobilePropertyWizardProvider, useMobilePropertyWizard } from './MobilePropertyWizardContext';
import { useMasterData } from '../hooks/useMasterDataContext';
import Skeleton from '@mui/material/Skeleton';
import MobileAddPropertyTabs from './MobileAddPropertyTabs';

interface MasterDataItem {
  id: string | number;
  value: string;
}

const PropertyAmenitiesPageInner: React.FC = () => {
  const { handlePropertyAmenitiesBack, handlePropertyAmenitiesSaveDraft, handlePropertyAmenitiesNext, propertyInfoData, setPropertyInfoData, isSaving } = useMobilePropertyWizard();
  const { masterData, loading: masterDataLoading, fetchMasterData } = useMasterData();
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [modalKey, setModalKey] = useState<string | null>(null);

  // Fetch master data when component mounts
  useEffect(() => {
    fetchMasterData(['appliancetype', 'indoorfeature', 'outdooramenity', 'viewtype', 'communitytype']);
  }, [fetchMasterData]);

  // State for each section
  const [selectedAppliances, setSelectedAppliances] = useState<(string|number)[]>([]);
  const [selectedIndoorFeatures, setSelectedIndoorFeatures] = useState<(string|number)[]>([]);
  const [selectedOutdoorAmenities, setSelectedOutdoorAmenities] = useState<(string|number)[]>([]);
  const [selectedView, setSelectedView] = useState<(string|number)[]>([]);
  const [selectedCommunity, setSelectedCommunity] = useState<(string|number)[]>([]);
  const [stories, setStories] = useState('');
  const [otherFeature, setOtherFeature] = useState('');
  const [otherFeatures, setOtherFeatures] = useState<string[]>([]);

  // Load data from context when it changes
  useEffect(() => {
    if (propertyInfoData) {
      console.log('PropertyAmenitiesPage: propertyInfoData changed:', propertyInfoData);
      console.log('PropertyAmenitiesPage: stories from propertyInfoData:', propertyInfoData.stories);
      console.log('PropertyAmenitiesPage: otherFeatures from propertyInfoData:', propertyInfoData.otherFeatures);
      
      // Handle both object format (with id/value) and ID-only format
      const normalizeAmenityData = (data: any) => {
        if (!data || !Array.isArray(data)) return [];
        if (data.length === 0) return [];
        
        // If first item is an object with id property, extract ids
        if (typeof data[0] === 'object' && data[0] !== null && 'id' in data[0]) {
          return data.map((item: any) => item.id);
        }
        
        // If array contains only IDs, return them directly
        return data;
      };

      const appliances = normalizeAmenityData(propertyInfoData.appliances);
      const indoorFeatures = normalizeAmenityData(propertyInfoData.indoorFeatures);
      const outdoorAmenities = normalizeAmenityData(propertyInfoData.outdoorAmenities);
      const view = normalizeAmenityData(propertyInfoData.view);
      const community = normalizeAmenityData(propertyInfoData.community);

      console.log('PropertyAmenitiesPage: normalized data:', {
        appliances,
        indoorFeatures,
        outdoorAmenities,
        view,
        community
      });

      setSelectedAppliances(appliances);
      setSelectedIndoorFeatures(indoorFeatures);
      setSelectedOutdoorAmenities(outdoorAmenities);
      setSelectedView(view);
      setSelectedCommunity(community);
      
      // Set stories and otherFeatures with debug logging
      const storiesValue = propertyInfoData.stories || '';
      const otherFeaturesValue = propertyInfoData.otherFeatures || [];
      console.log('PropertyAmenitiesPage: Setting stories to:', storiesValue);
      console.log('PropertyAmenitiesPage: Setting otherFeatures to:', otherFeaturesValue);
      setStories(storiesValue);
      setOtherFeatures(otherFeaturesValue);
    }
  }, [propertyInfoData]);

  // Debug selected state changes
  useEffect(() => {
    console.log('PropertyAmenitiesPage: selected state updated:', {
      selectedAppliances,
      selectedIndoorFeatures,
      selectedOutdoorAmenities,
      selectedView,
      selectedCommunity,
      stories,
      otherFeatures,
    });
  }, [selectedAppliances, selectedIndoorFeatures, selectedOutdoorAmenities, selectedView, selectedCommunity, stories, otherFeatures]);

  // Reset local loading state when context isSaving changes
  useEffect(() => {
    if (!isSaving && loading) {
      setLoading(false);
    }
  }, [isSaving, loading]);

  // Debug: Log when save draft is called
  const handleSaveDraft = async () => {
    console.log('PropertyAmenitiesPage: Save draft clicked');
    console.log('PropertyAmenitiesPage: Current propertyInfoData:', propertyInfoData);
    console.log('PropertyAmenitiesPage: Selected amenities:', {
      appliances: selectedAppliances,
      indoorFeatures: selectedIndoorFeatures,
      outdoorAmenities: selectedOutdoorAmenities,
      view: selectedView,
      community: selectedCommunity,
      stories,
      otherFeatures,
    });
    
    setLoading(true);
    const values = {
      appliances: getSelectedIds(selectedAppliances),
      indoorFeatures: getSelectedIds(selectedIndoorFeatures),
      outdoorAmenities: getSelectedIds(selectedOutdoorAmenities),
      view: getSelectedIds(selectedView),
      community: getSelectedIds(selectedCommunity),
      stories: stories,
      otherFeatures: otherFeatures,
      id: propertyInfoData?.id // Ensure id is present if editing
    };
    const merged = { ...propertyInfoData, ...values };
    console.log('PropertyAmenitiesPage: Merged data to save:', merged);
    setPropertyInfoData(merged);
    await handlePropertyAmenitiesSaveDraft(merged);
    // Don't set loading to false here - let the context handle it
  };

  const handleAddOther = () => {
    if (otherFeature.trim()) {
      setOtherFeatures(prev => [...prev, otherFeature.trim()]);
      setOtherFeature('');
    }
  };

  const handleRemoveOther = (index: number) => {
    setOtherFeatures(prev => prev.filter((_, i) => i !== index));
  };

  // Utility to get unique IDs from selected amenities
  const getSelectedIds = (arr: any[]) => {
    // If array is empty, return empty array
    if (!arr || arr.length === 0) return [];
    
    // If first item is an object with id property, extract ids
    if (typeof arr[0] === 'object' && arr[0] !== null && 'id' in arr[0]) {
      return Array.from(new Set(arr.map(item => item.id)));
    }
    
    // If array contains only IDs, return them directly (remove duplicates)
    return Array.from(new Set(arr));
  };

  const handleBack = () => {
    const values = {
      appliances: getSelectedIds(selectedAppliances),
      indoorFeatures: getSelectedIds(selectedIndoorFeatures),
      outdoorAmenities: getSelectedIds(selectedOutdoorAmenities),
      view: getSelectedIds(selectedView),
      community: getSelectedIds(selectedCommunity),
      stories: stories,
      otherFeatures: otherFeatures,
    };
    setPropertyInfoData((prev: any) => ({ ...prev, ...values }));
    handlePropertyAmenitiesBack(values);
  };



  const handleNext = () => {
    const values = {
      appliances: getSelectedIds(selectedAppliances),
      indoorFeatures: getSelectedIds(selectedIndoorFeatures),
      outdoorAmenities: getSelectedIds(selectedOutdoorAmenities),
      view: getSelectedIds(selectedView),
      community: getSelectedIds(selectedCommunity),
      stories: stories,
      otherFeatures: otherFeatures,
    };
    setPropertyInfoData((prev: any) => ({ ...prev, ...values }));
    handlePropertyAmenitiesNext(values);
  };

  // Helper functions for checkbox handling (same as PropertyInfoPage)
  const handleCheckbox = (sectionKey: string, value: {id: string | number, value: string}) => {
    console.log(`PropertyAmenitiesPage: handleCheckbox called for ${sectionKey} with value:`, value);
    const setSelected = SECTIONS.find(s => s.key === sectionKey)?.setSelected;
    if (setSelected) {
      setSelected((prev: (string|number)[]) => {
        const newSelected = prev.includes(value.id)
          ? prev.filter(id => id !== value.id)
          : [...prev, value.id];
        console.log(`PropertyAmenitiesPage: ${sectionKey} updated from`, prev, 'to', newSelected);
        return newSelected;
      });
    }
  };

  const isChecked = (sectionKey: string, id: string | number) => {
    const selected = SECTIONS.find(s => s.key === sectionKey)?.selected;
    return selected ? selected.includes(id) : false;
  };

  const SECTIONS = [
    { key: 'appliances', label: 'APPLIANCES', options: masterData.appliancetype || [], selected: selectedAppliances, setSelected: setSelectedAppliances },
    { key: 'indoorFeatures', label: 'INDOOR FEATURES', options: masterData.indoorfeature || [], selected: selectedIndoorFeatures, setSelected: setSelectedIndoorFeatures },
    { key: 'outdoorAmenities', label: 'OUTDOOR AMENITIES', options: masterData.outdooramenity || [], selected: selectedOutdoorAmenities, setSelected: setSelectedOutdoorAmenities },
    { key: 'view', label: 'VIEW', options: masterData.viewtype || [], selected: selectedView, setSelected: setSelectedView },
    { key: 'community', label: 'COMMUNITY', options: masterData.communitytype || [], selected: selectedCommunity, setSelected: setSelectedCommunity },
  ];

  if (masterDataLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <div className="flex items-center px-4 pt-6 pb-2 bg-white shadow-none">
          <button className="mr-2 p-2 -ml-2" onClick={handleBack} aria-label="Back">
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path d="M15 18l-6-6 6-6" stroke="#004D40" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <span className="text-green-900 text-2xl font-bold">{propertyInfoData?.id ? 'Update Property' : 'Add Property'}</span>
        </div>
        <MobileAddPropertyTabs currentStep={3} />
        <div className="flex flex-col px-6 pt-6 pb-8">
          <Skeleton variant="text" width="80%" height={40} />
          <Skeleton variant="text" width="60%" height={24} />
          <Skeleton variant="text" width="40%" height={24} />
        </div>
      </div>
    );
  }

  console.log('PropertyAmenitiesPage: Rendering with otherFeatures:', otherFeatures, 'length:', otherFeatures.length);
  console.log('PropertyAmenitiesPage: otherFeatures array:', otherFeatures, 'type:', typeof otherFeatures, 'isArray:', Array.isArray(otherFeatures));

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Spinner overlay */}
      {(isSaving || loading) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="w-16 h-16 border-4 border-green-200 border-t-green-700 rounded-full animate-spin" />
        </div>
      )}
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 w-full z-30 bg-white flex flex-col shadow-md">
        <div className="flex items-center px-4 pt-6 pb-2">
          <button className="mr-2 p-2 -ml-2" onClick={handleBack} aria-label="Back">
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path d="M15 18l-6-6 6-6" stroke="#004D40" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <span className="text-green-900 text-2xl font-bold">{propertyInfoData?.id ? 'Update Property' : 'Add Property'}</span>
        </div>
        <MobileAddPropertyTabs currentStep={3} />
      </div>
      
      {/* Main Content with padding for header and footer */}
      <div className="flex flex-col px-6 pt-32 pb-32">
        <div className="text-3xl font-bold text-[#222] mb-2">Add your property amenities</div>
        <div className="text-base text-[#222] mb-6">{propertyInfoData?.address}, {propertyInfoData?.city_detail?.name}, {propertyInfoData?.state_detail?.name}, {propertyInfoData?.country_detail?.name}, {propertyInfoData?.postalCode}</div>
        <div className="text-base text-[#222] mb-4">Property type : <span className="font-bold">{propertyInfoData?.propertyType?.name}</span></div>
        <div className="text-xl font-bold mb-2 mt-6">Amenities</div>
        <div className="text-sm text-[#444] mb-4">Share which amenities are available at your property</div>
        
        {/* Accordion Sections */}
        <div className="flex flex-col gap-2 mb-6">
          {SECTIONS.map(section => (
            <div key={section.key} className="flex items-center justify-between border rounded-lg px-4 py-4 bg-white cursor-pointer" onClick={() => setModalKey(section.key)}>
              <div className="flex items-center gap-2">
                {/* Chosen count badge (gradient, count only) */}
                <span className="px-3 py-1 rounded-full text-white text-base font-normal" style={{ background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)' }}>
                  {(() => {
                    const count = section.selected.length;
                    console.log(`PropertyAmenitiesPage: ${section.key} count:`, count, 'data:', section.selected);
                    return count;
                  })()}
                </span>
                <span className="font-semibold">{section.label}</span>
              </div>
              <span className="text-green-900 text-xl">→</span>
            </div>
          ))}
        </div>
        
        {/* # of stories */}
        <div className="mb-4">
          <label className="block mb-2 font-semibold flex items-center"># of stories
            <span className="ml-1 text-xs text-[#007E67] cursor-pointer" title="Total number of stories.">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="#007E67" strokeWidth="2"/><text x="12" y="16" textAnchor="middle" fontSize="12" fill="#007E67">?</text></svg>
            </span>
          </label>
          <input
            className="w-full p-4 border rounded-lg text-lg bg-white"
            placeholder="# of stories"
            value={stories}
            onChange={e => setStories(e.target.value)}
          />
        </div>
        
        {/* Other features */}
        <div className="mb-4">
          <label className="block mb-2 font-semibold">Other features</label>
          <div className="flex gap-2 mb-2 items-center">
            <input
              className="p-4 border rounded-lg text-lg bg-white max-w-[160px]"
              style={{ width: '100%', maxWidth: 160 }}
              placeholder="Other feature"
              value={otherFeature}
              onChange={e => setOtherFeature(e.target.value)}
            />
            <button type="button" className="w-10 h-10 rounded-full bg-green-900 text-white text-2xl flex items-center justify-center" style={{ minWidth: 40, minHeight: 40 }} onClick={handleAddOther}>+</button>
          </div>
          {otherFeatures.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {otherFeatures.map((f, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 px-4 py-1 rounded-full"
                  style={{
                    background: '#85C6BA',
                    color: 'var(--Primary-Green, #004236)',
                    fontWeight: 400,
                    fontSize: '0.95rem',
                    lineHeight: 1.2,
                  }}
                >
                  <span>{f}</span>
                  <button
                    onClick={() => handleRemoveOther(i)}
                    className="ml-1"
                    style={{
                      color: 'var(--Primary-Green, #004236)',
                      fontSize: '1.5em',
                      fontWeight: 400,
                      lineHeight: 1,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      background: 'none',
                      border: 'none',
                      padding: 0,
                    }}
                    aria-label={`Remove ${f}`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Fixed Bottom Footer */}
      <div className="fixed bottom-0 left-0 w-full z-30 bg-white border-t flex gap-4 px-6 py-4">
        <button 
          className="flex-1 py-3 rounded-lg font-bold text-lg border-2 border-green-900 text-green-900 bg-white"
          onClick={handleSaveDraft}
          disabled={isSaving || loading}
        >
          {(isSaving || loading) ? 'Saving...' : 'Save as draft'}
        </button>
        <button 
          className="gradient-btn-equal flex-1 py-3 rounded-lg font-bold text-lg shadow-lg"
          onClick={handleNext}
        >
          Next
        </button>
      </div>
      
      {/* BottomModal for section multi-select */}
      {modalKey && (
        <BottomModal
          open={!!modalKey}
          title={SECTIONS.find(s => s.key === modalKey)?.label}
          onCancel={() => setModalKey(null)}
          onSubmit={() => setModalKey(null)}
          submitLabel="Select"
        >
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            {SECTIONS.find(s => s.key === modalKey)?.options.map(opt => (
              <label key={modalKey + '-' + opt.id} className="flex items-center gap-2 py-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isChecked(modalKey, opt.id)}
                  onChange={() => handleCheckbox(modalKey, opt)}
                  className="sr-only peer"
                  id={`custom-checkbox-${modalKey}-${opt.id}`}
                />
                <span
                  className="w-5 h-5 rounded border border-[#007E67] flex items-center justify-center peer-checked:bg-[linear-gradient(111.83deg,_#004236_11.73%,_#007E67_96.61%)] bg-white transition-colors duration-200"
                  style={{
                    background: isChecked(modalKey, opt.id)
                      ? 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)'
                      : '#fff',
                    borderColor: '#007E67',
                  }}
                  tabIndex={0}
                  aria-checked={isChecked(modalKey, opt.id)}
                  role="checkbox"
                >
                  {isChecked(modalKey, opt.id) && (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 7L6 10L11 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
                <span className="text-base font-normal">{opt.value}</span>
              </label>
            ))}
          </div>
        </BottomModal>
      )}
    </div>
  );
};

const PropertyAmenitiesPage: React.FC = () => (
  <MobilePropertyWizardProvider>
    <PropertyAmenitiesPageInner />
  </MobilePropertyWizardProvider>
);

export default PropertyAmenitiesPage; 