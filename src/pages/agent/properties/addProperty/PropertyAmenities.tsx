import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../../../utils/api';
import { useMasterData } from './hooks/useMasterDataContext';
import Skeleton from '@mui/material/Skeleton'; // or your own skeleton loader


interface MasterDataItem {
  id: string | number;
  value: string;
}


const PropertyAmenities: React.FC<{
  initialValues: any;
  onBack: (values: any) => void;
  onSaveDraft: (values: any) => void;
  onNext: (values: any) => void;
}> = ({ initialValues, onBack, onSaveDraft, onNext }) => {
  const { id } = useParams<{ id: string }>();
  const [selectedAppliances, setSelectedAppliances] = useState<(string|number)[]>([]);
  const [selectedIndoorFeatures, setSelectedIndoorFeatures] = useState<(string|number)[]>([]);
  const [selectedOutdoorAmenities, setSelectedOutdoorAmenities] = useState<(string|number)[]>([]);
  const [selectedView, setSelectedView] = useState<(string|number)[]>([]);
  const [selectedCommunity, setSelectedCommunity] = useState<(string|number)[]>([]);
  const [stories, setStories] = useState('');
  const [otherFeature, setOtherFeature] = useState('');
  const [otherFeatures, setOtherFeatures] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const { masterData, loading: masterDataLoading, fetchMasterData } = useMasterData();

  useEffect(() => {
    fetchMasterData(['appliancetype', 'indoorfeature', 'outdooramenity', 'viewtype', 'communitytype']);
  }, [fetchMasterData]);

  useEffect(() => {
    if(initialValues){
      setSelectedAppliances(
        Array.isArray(initialValues.appliances)
          ? initialValues.appliances.map((item: any) => typeof item === 'object' ? item.id : item)
          : []
      );
      setSelectedIndoorFeatures(
        Array.isArray(initialValues.indoorFeatures)
          ? initialValues.indoorFeatures.map((item: any) => typeof item === 'object' ? item.id : item)
          : []
      );
      setSelectedOutdoorAmenities(
        Array.isArray(initialValues.outdoorAmenities)
          ? initialValues.outdoorAmenities.map((item: any) => typeof item === 'object' ? item.id : item)
          : []
      );
      setSelectedView(
        Array.isArray(initialValues.view)
          ? initialValues.view.map((item: any) => typeof item === 'object' ? item.id : item)
          : []
      );
      setSelectedCommunity(
        Array.isArray(initialValues.community)
          ? initialValues.community.map((item: any) => typeof item === 'object' ? item.id : item)
          : []
      );
      setStories(initialValues.stories || '');
      setOtherFeatures(initialValues.other_features || initialValues.otherFeatures || []);
    }
  }, [initialValues]);

  // Function to remove an other feature by index
  const removeOtherFeature = (index: number) => {
    setOtherFeatures(prev => prev.filter((_, i) => i !== index));
  };

  // Utility to update checked state based on key-value map
  const updateChecked = (items: MasterDataItem[], checkedMap: Record<string, boolean>) =>
    items.map((item: MasterDataItem) => ({
      ...item,
      checked: checkedMap[item.id] ?? false,
    }));

  // Usage: setAppliances(prev => updateChecked(prev, checkedValues));
  // setIndoorFeatures(prev => updateChecked(prev, checkedValues));
  // setOutdoorAmenities(prev => updateChecked(prev, checkedValues));
  // setView(prev => updateChecked(prev, checkedValues));
  // setCommunity(prev => updateChecked(prev, checkedValues));

  const handleNext = () => {
    const finalAmenities = {
      appliances: Array.from(new Set(selectedAppliances)),
      indoorFeatures: Array.from(new Set(selectedIndoorFeatures)),
      outdoorAmenities: Array.from(new Set(selectedOutdoorAmenities)),
      view: Array.from(new Set(selectedView)),
      community: Array.from(new Set(selectedCommunity)),
      stories,
      otherFeatures,
    };
    onNext(finalAmenities);
  };

  const handleSaveDraft = async () => {
    setLoading(true);
    const finalAmenities = {
      appliances: Array.from(new Set(selectedAppliances)),
      indoorFeatures: Array.from(new Set(selectedIndoorFeatures)),
      outdoorAmenities: Array.from(new Set(selectedOutdoorAmenities)),
      view: Array.from(new Set(selectedView)),
      community: Array.from(new Set(selectedCommunity)),
      stories,
      otherFeatures,
    };
    await onSaveDraft(finalAmenities);
    setLoading(false);
  };

  return (
    <div className="w-full py-8 px-8 relative">
      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="w-16 h-16 border-4 border-green-200 border-t-green-700 rounded-full animate-spin" />
        </div>
      )}
      <div className="text-2xl font-semibold mb-1 mt-2">Add your property amenities</div>
      <div className="text-base text-[#222] mb-0">{initialValues?.address}, {initialValues?.city_detail?.name}, {initialValues?.state_detail?.name}, {initialValues?.country_detail?.name}, {initialValues?.postalCode}</div>
      <div className="text-base text-[#222] mb-4">Property type : <span className="font-bold">{initialValues?.propertyType?.name}</span></div>
      <div className="text-xl font-bold mb-2 mt-6">Amenities</div>
      <div className="text-sm text-[#444] mb-4">Share which amenities are available at your property</div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div>
            <div className="mb-2 text-sm uppercase text-left text-gray-600">Appliances</div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              {masterDataLoading ? <Skeleton variant="rectangular" width={210} height={60} /> : (masterData.appliancetype || []).map((item: any) => (
                <label key={item.id} className="flex items-center mb-1 text-sm">
                  <input
                    type="checkbox"
                    className="mr-2 accent-[#007E67]"
                    checked={selectedAppliances.includes(item.id)}
                    onChange={() => {
                      setSelectedAppliances(prev =>
                        prev.includes(item.id)
                          ? prev.filter(id => id !== item.id)
                          : [...prev, item.id]
                      );
                    }}
                  />
                  {item.value}
                </label>
              ))}
            </div>
        </div>
        <div>
            <div className="mb-2 text-sm uppercase text-left text-gray-600">Indoor Features</div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              {masterDataLoading ? <Skeleton variant="rectangular" width={210} height={60} /> : (masterData.indoorfeature || []).map((item: any) => (
                <label key={item.id} className="flex items-center mb-1 text-sm">
                  <input
                    type="checkbox"
                    className="mr-2 accent-[#007E67]"
                    checked={selectedIndoorFeatures.includes(item.id)}
                    onChange={() =>  { 
                      setSelectedIndoorFeatures(prev =>
                        prev.includes(item.id)
                          ? prev.filter(id => id !== item.id)
                          : [...prev, item.id]
                      );
                    }}      
                  />
                  {item.value}
                </label>
              ))}
            </div>
        </div>
        <div>
            <div className="mb-2 text-sm uppercase text-left text-gray-600">Outdoor Amenities</div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              {masterDataLoading ? <Skeleton variant="rectangular" width={210} height={60} /> : (masterData.outdooramenity || []).map((item: any) => (
                <label key={item.id} className="flex items-center mb-1 text-sm">
                  <input
                    type="checkbox"
                    className="mr-2 accent-[#007E67]"
                    checked={selectedOutdoorAmenities.includes(item.id)}
                    onChange={() => {
                      setSelectedOutdoorAmenities(prev =>
                        prev.includes(item.id)
                          ? prev.filter(id => id !== item.id)
                          : [...prev, item.id]
                      );
                    }}
                  />
                  {item.value}
                </label>
              ))}
            </div>
        </div>
        <div>
        <div className="mb-2 text-sm uppercase text-left text-gray-600 mt-0"># of stories</div>
        <input type="text" className="border border-[#B0B0B0] rounded px-3 py-2 w-42" value={stories} onChange={e => setStories(e.target.value)} />
        </div>
      </div>
      {/* Change grid to 3 columns for View/Community/Empty */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
        <div>
          <div className="mb-2 text-sm uppercase text-left text-gray-600">View</div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            {masterDataLoading ? <Skeleton variant="rectangular" width={210} height={60} /> : (masterData.viewtype || []).map((item: any) => (
              <label key={item.id} className="flex items-center mb-1 text-sm font-normal text-gray-800">
                <input
                  type="checkbox"
                  className="mr-2 accent-[#007E67]"
                  checked={selectedView.includes(item.id)}
                  onChange={() => {
                    setSelectedView(prev =>
                      prev.includes(item.id)
                        ? prev.filter(id => id !== item.id)
                        : [...prev, item.id]
                    );
                  }}
                />
                {item.value}
              </label>
            ))}
          </div>
        </div>
        <div>
          <div className="mb-2 text-sm uppercase text-left text-gray-600">Community</div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            {masterDataLoading ? <Skeleton variant="rectangular" width={210} height={60} /> : (masterData.communitytype || []).map((item: any) => (
              <label key={item.id} className="flex items-center mb-1 text-sm font-normal text-gray-800">
                <input
                  type="checkbox"
                  className="mr-2 accent-[#007E67]"
                  checked={selectedCommunity.includes(item.id)}
                  onChange={() => {
                    setSelectedCommunity(prev =>
                      prev.includes(item.id)
                        ? prev.filter(id => id !== item.id)
                        : [...prev, item.id]
                    );
                  }}
                />
                {item.value}
              </label>
            ))}
          </div>
        </div>
        {/* Third column intentionally left empty */}
        <div></div>
      </div>
      <div className="mb-2 text-sm font-semibold text-left text-gray-800">Other feature</div>
      <div className="flex gap-4 mb-2 max-w-xl">
        <input type="text" className="border border-[#B0B0B0] rounded px-3 py-2 flex-1" value={otherFeature} onChange={e => setOtherFeature(e.target.value)} />
        <button type="button" className="w-32 py-2 rounded text-white font-semibold bg-gradient-to-r from-[#004236] to-[#007E67] shadow" onClick={() => {
          if (otherFeature.trim()) {
            setOtherFeatures(prev => [...prev, otherFeature.trim()]);
            setOtherFeature('');
          }
        }}>Add</button>
      </div>
      {otherFeatures && otherFeatures.length > 0 && (
        <div className="flex flex-wrap gap-2 max-w-4xl">
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
                type="button"
                onClick={() => removeOtherFeature(i)}
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
      <div className="flex justify-end gap-4 mt-8 mb-8">
        {!id && (
          <button
            onClick={handleSaveDraft}
            className="px-6 py-2 border border-[#007E67] rounded text-[#007E67] font-semibold bg-white hover:bg-[#F3F3F3] disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save as draft'}
          </button>
        )}
        <button onClick={handleNext} className="px-6 py-2 rounded text-white font-semibold bg-gradient-to-r from-[#004236] to-[#007E67] shadow hover:opacity-90">Next</button>
      </div>
    </div>
  );
};

export default PropertyAmenities; 