import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { fetchPropertyVRImages } from '../../../utils/api';
import useIsMobile from '../../../hooks/useIsMobile';
import { useParams, useNavigate } from 'react-router-dom';
import { ARVRPlaceholderIcon, ImagePlaceholderIcon } from '../../../assets/icons/MediaMainIcons';
import ButtonLoader from '../../../components/ButtonLoader';
import AgentPropertyDetailsSkeleton from '../../agent/properties/AgentPropertyDetailsSkeleton';
import { ArrowLeft } from 'lucide-react';

// VR Home details type
type VRImage = {
  image_url: string;
  view_type: string;
};
type VRRequest = {
  vr_request_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  property_name: string;
  property_address: string;
  images: VRImage[];
};

const ARVR_PHOTO_SLOTS = [
  { key: 'front', label: 'Front view' },
  { key: 'back', label: 'Back view' },
  { key: 'left', label: 'Left Side view' },
  { key: 'right', label: 'Right Side view' },
  { key: 'backcorner', label: 'Back corner' },
  { key: 'frontcorner', label: 'Front corner' },
];

const DesktopEditView: React.FC<{ propertyId: string }> = ({ propertyId }) => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [vrData, setVrData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showVRModal, setShowVRModal] = useState(false);
  // For image loading states
  const [frontImgLoading, setFrontImgLoading] = useState(true);
  const [modalImgLoading, setModalImgLoading] = useState<{ [key: string]: boolean }>({});
  const [agentImgLoading, setAgentImgLoading] = useState(true);

  useEffect(() => {
    fetchPropertyVRImages(propertyId).then(res => {
      setVrData(res.data || null);
      setLoading(false);
    });
  }, [propertyId]);

  if (loading) return <AgentPropertyDetailsSkeleton mobile={isMobile} />;

  // Use the latest vr_request for modal and grid
  const vrRequests = vrData?.vr_requests || [];
  const latestVR = vrRequests.length > 0 ? vrRequests[vrRequests.length - 1] : null;
  const agent = vrData?.agent;
  const propertyDetails = vrData?.property_details;
  const propertyType = propertyDetails?.property_type_details?.name || 'Property Type';

  // For main view, show property name/address from propertyDetails
  return (
    <div style={{ minHeight: '70vh', background: '#fff', padding: '32px 0' }}>
      {/* Header with Back Button - removed for desktop, only show on mobile */}
      {isMobile && (
        <div className="w-full bg-[#007E67] text-white py-4 px-8 shadow-md">
          <div className="max-w-7xl mx-auto flex items-center">
            <button 
              onClick={() => navigate('/agent/homes3d')}
              className="flex items-center justify-center w-10 h-10 mr-4 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft size={24} className="text-white" />
            </button>
            <h1 className="text-2xl font-semibold">My 3D Homes</h1>
          </div>
        </div>
      )}
      
      <div className="w-full px-4 md:px-12" style={{ paddingTop: 40 }}>
        <div style={{ fontWeight: 700, fontSize: 22, color: '#222', marginBottom: 4, marginTop: 32 }}>{propertyDetails?.property_name || ''}</div>
        <div style={{ color: '#7C7C7C', fontSize: 15, marginBottom: 4 }}>{propertyDetails?.property_address || ''}</div>
        {/* Virtual Tour Section - Using exact same design as PropertyMedia */}
        <div className="mb-8 w-full">
          <div className="text-lg font-bold mb-1">Virtual Tour</div>
          <div className="text-sm text-[#444] mb-2">You can add AR/VR Model to this property or edit existing tours by going to My AR/VR Homes.</div>
          {latestVR ? (
            <div className="flex flex-col md:flex-row items-start gap-4 mb-2 w-full">
              {/* Left side - Request area (same as PropertyMedia) */}
              <div className="border border-dashed border-[#B0B0B0] rounded-xl bg-white flex flex-col items-center justify-center py-12 px-6 min-w-[320px] max-w-[400px] w-full md:w-1/2">
                <div className="mb-4"><ARVRPlaceholderIcon /></div>
                <div className="text-center text-[#222] mt-2">
                  Our Vistaview team is working on your property in 3D Model<br/>
                  <span className="text-[#007E67] text-sm">Please be patient, once done you will be get notified</span>
                </div>
              </div>
              {/* Right side - VR card as grid item (show front view image) */}
              <div className="flex-1 flex items-start w-full md:w-1/2">
                <div className="border border-[#E5E7EB] rounded-xl bg-white p-2 w-full">
                  <div className="flex flex-col gap-2 mt-0">
                    <div className="flex flex-row gap-2">
                      <div
                        className="relative group border border-[#E5E7EB] rounded-xl bg-white cursor-pointer"
                        style={{ width: 260, height: 180, boxShadow: 'none' }}
                        onClick={() => setShowVRModal(true)}
                      >
                        {/* Submitted Badge */}
                        <div className="absolute top-2 right-2 bg-[#007E67]/90 text-white text-xs px-2 py-1 rounded-full z-10 shadow-sm">
                          Submitted
                        </div>
                        {/* Show front view image if available, else placeholder, with lazy loader */}
                        {(() => {
                          const frontImg = latestVR?.images?.find((img: any) => img.view_type === 'front_view');
                          if (frontImg) {
                            return <>
                              {frontImgLoading && (
                                <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-10"><ButtonLoader /></div>
                              )}
                              <img
                                src={frontImg.image_url}
                                alt="Front View"
                                className="absolute inset-0 w-full h-full object-cover rounded-xl"
                                style={frontImgLoading ? { visibility: 'hidden' } : {}}
                                onLoad={() => setFrontImgLoading(false)}
                                onError={() => setFrontImgLoading(false)}
                              />
                            </>;
                          } else {
                            return <div className="absolute inset-0 flex items-center justify-center"><ARVRPlaceholderIcon /></div>;
                          }
                        })()}
                        <div className="absolute bottom-0 left-0 w-full text-[10px] text-white text-center bg-black/50 py-1 rounded-b-xl">
                          VR Request
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full mb-2">
              <div className="border border-dashed border-[#B0B0B0] rounded-xl bg-white flex flex-col items-center justify-center py-12 px-6 w-full">
                <div className="mb-4"><ARVRPlaceholderIcon /></div>
                <div className="text-[#007E67] font-semibold mb-4 text-center">Please request a Vistaview team to create your property 3D model for buyer virtual tour</div>
                {/* Request button can be added here if needed */}
              </div>
            </div>
          )}
        </div>
        {/* VR Images Modal - Using exact same design as PropertyMedia */}
        {showVRModal && latestVR && ReactDOM.createPortal(
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 md:px-8 w-full max-w-sm relative overflow-y-auto max-h-[95vh]">
              <button className="absolute top-2 right-2 text-xl text-[#888] hover:text-[#222]" onClick={() => setShowVRModal(false)}>&times;</button>
              <form onSubmit={(e) => { e.preventDefault(); setShowVRModal(false); }}>
                <div className="text-lg font-bold mb-1">
                  VR Request Details
                </div>
                <div className="text-xs mb-2">
                  View your submitted VR request details
                </div>
                <div className="mb-2">
                  <label className="block text-xs font-semibold mb-1">Property Type</label>
                  <select 
                    className="w-full border border-[#E5E7EB] rounded px-2 py-1 text-xs" 
                    value={propertyType}
                    disabled
                  >
                    <option>{propertyType}</option>
                  </select>
                </div>
                <div className="mb-3">
                  <div className="mb-1 font-medium text-xs">
                    Submitted property photos for 3D model creation
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {ARVR_PHOTO_SLOTS.map(slot => {
                      // Map slot keys to API view_type values
                      const viewTypeMap: { [key: string]: string } = {
                        'front': 'front_view',
                        'back': 'back_view',
                        'left': 'left_side_view',
                        'right': 'right_side_view',
                        'backcorner': 'back_corner',
                        'frontcorner': 'front_corner'
                      };
                      const matchingImage = latestVR.images.find((img: any) => img.view_type === viewTypeMap[slot.key]);
                      return (
                        <div
                          key={slot.key}
                          className="relative border border-dashed border-[#B0B0B0] rounded-lg bg-[#FAFAFA] h-32 w-full transition overflow-hidden"
                        >
                          {matchingImage ? (
                            <>
                              {modalImgLoading[slot.key] && (
                                <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-10"><ButtonLoader /></div>
                              )}
                              <img
                                src={matchingImage.image_url}
                                alt={slot.label}
                                className="absolute inset-0 w-full h-full object-cover rounded-lg"
                                style={modalImgLoading[slot.key] ? { visibility: 'hidden' } : {}}
                                onLoad={() => setModalImgLoading(l => ({ ...l, [slot.key]: false }))}
                                onError={() => setModalImgLoading(l => ({ ...l, [slot.key]: false }))}
                                onLoadStart={() => setModalImgLoading(l => ({ ...l, [slot.key]: true }))}
                              />
                            </>
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center w-full h-full"><ImagePlaceholderIcon /></div>
                          )}
                          <div className="absolute bottom-0 left-0 w-full text-[11px] text-white text-center bg-black/50 py-1 rounded-b-lg">{slot.label}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="my-4">
                  <div className="font-semibold mb-2 text-xs">Confirm your contact details</div>
                  <div className="flex items-center gap-2">
                    {agent?.profile_photo_url ? (
                      <div className="relative w-8 h-8">
                        {agentImgLoading && (
                          <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-10"><ButtonLoader /></div>
                        )}
                        <img
                          src={agent.profile_photo_url}
                          alt={agent.username}
                          className="w-8 h-8 rounded-full object-cover"
                          style={agentImgLoading ? { visibility: 'hidden' } : {}}
                          onLoad={() => setAgentImgLoading(false)}
                          onError={() => setAgentImgLoading(false)}
                        />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[#F3F4F6] flex items-center justify-center text-lg font-bold text-[#007E67]">
                        {agent?.first_name?.[0] || agent?.username?.[0] || 'A'}
                      </div>
                    )}
                    <div>
                      <div className="font-semibold text-xs mb-0.5">{agent?.first_name} {agent?.last_name}</div>
                      <div className="flex items-center text-[10px] text-[#007E67] gap-1 mb-0.5">
                        <svg width="12" height="12" fill="none" viewBox="0 0 24 24">
                          <path d="M21 10.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h7" stroke="#007E67" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M21 10.5l-9 9-3-3" stroke="#007E67" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg> {agent?.email}
                      </div>
                      <div className="flex items-center text-[10px] text-[#007E67] gap-1">
                        <svg width="12" height="12" fill="none" viewBox="0 0 24 24">
                          <path d="M22 16.92V19a2 2 0 0 1-2 2A19.72 19.72 0 0 1 3 5a2 2 0 0 1 2-2h2.09a2 2 0 0 1 2 1.72c.13.81.35 1.6.67 2.36a2 2 0 0 1-.45 2.11l-.27.27a16 16 0 0 0 6.29 6.29l.27-.27a2 2 0 0 1 2.11-.45c.76.32 1.55.54 2.36.67A2 2 0 0 1 22 16.92z" stroke="#007E67" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg> {agent?.mobile_number}
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  className="w-full px-4 py-2 rounded text-white font-semibold bg-gray-400 shadow text-sm cursor-not-allowed"
                  disabled
                >
                  Already Submitted
                </button>
              </form>
            </div>
          </div>,
          document.body
        )}
      </div>
    </div>
  );
};

const MobileEditView: React.FC<{ propertyId: string }> = ({ propertyId }) => {
  const navigate = useNavigate();
  const [vrData, setVrData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showVRModal, setShowVRModal] = useState(false);
  // For image loading states
  const [frontImgLoading, setFrontImgLoading] = useState(true);
  const [modalImgLoading, setModalImgLoading] = useState<{ [key: string]: boolean }>({});
  const [agentImgLoading, setAgentImgLoading] = useState(true);

  useEffect(() => {
    fetchPropertyVRImages(propertyId).then(res => {
      setVrData(res.data || null);
      setLoading(false);
    });
  }, [propertyId]);

  if (loading) return <AgentPropertyDetailsSkeleton mobile={true} />;

  // Use the latest vr_request for modal and grid
  const vrRequests = vrData?.vr_requests || [];
  const latestVR = vrRequests.length > 0 ? vrRequests[vrRequests.length - 1] : null;
  const agent = vrData?.agent;
  const propertyDetails = vrData?.property_details;
  const propertyType = propertyDetails?.property_type_details?.name || 'Property Type';

  return (
    <div style={{ minHeight: '100vh', background: '#fff' }}>
      {/* Mobile Header */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-[#007E67] text-white" style={{ height: 56 }}>
        <div className="flex items-center h-full px-4">
          <button 
            onClick={() => navigate('/agent/homes3d')}
            className="flex items-center justify-center w-10 h-10 mr-4"
          >
            <ArrowLeft size={24} className="text-white" />
          </button>
          <h1 className="text-lg font-semibold">My 3D Homes</h1>
        </div>
      </div>
      
      <div style={{ paddingTop: 100, padding: '40px 8px' }}>
        <div style={{ fontWeight: 700, fontSize: 18, color: '#222', marginBottom: 4, marginTop: 24 }}>{propertyDetails?.property_name || ''}</div>
        <div style={{ color: '#7C7C7C', fontSize: 14, marginBottom: 16 }}>{propertyDetails?.property_address || ''}</div>
        
        {/* Virtual Tour Section */}
        <div className="mb-6 w-full">
          <div className="text-base font-bold mb-1">Virtual Tour</div>
          <div className="text-xs text-[#444] mb-3">You can add AR/VR Model to this property or edit existing tours by going to My AR/VR Homes.</div>
          {latestVR ? (
            <div className="flex flex-col gap-4 mb-2 w-full">
              {/* Request area */}
              <div className="border border-dashed border-[#B0B0B0] rounded-xl bg-white flex flex-col items-center justify-center py-8 px-4">
                <div className="mb-3"><ARVRPlaceholderIcon /></div>
                <div className="text-center text-[#222] mt-2 text-sm">
                  Our Vistaview team is working on your property in 3D Model<br/>
                  <span className="text-[#007E67] text-xs">Please be patient, once done you will be get notified</span>
                </div>
              </div>
              {/* VR card */}
              <div className="w-full">
                <div className="border border-[#E5E7EB] rounded-xl bg-white p-2 w-full">
                  <div
                    className="relative group border border-[#E5E7EB] rounded-xl bg-white cursor-pointer"
                    style={{ width: '100%', height: 200 }}
                    onClick={() => setShowVRModal(true)}
                  >
                    {/* Submitted Badge */}
                    <div className="absolute top-2 right-2 bg-[#007E67]/90 text-white text-xs px-2 py-1 rounded-full z-10 shadow-sm">
                      Submitted
                    </div>
                    {/* Show front view image if available, else placeholder */}
                    {(() => {
                      const frontImg = latestVR?.images?.find((img: any) => img.view_type === 'front_view');
                      if (frontImg) {
                        return <>
                          {frontImgLoading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-10"><ButtonLoader /></div>
                          )}
                          <img
                            src={frontImg.image_url}
                            alt="Front View"
                            className="absolute inset-0 w-full h-full object-cover rounded-xl"
                            style={frontImgLoading ? { visibility: 'hidden' } : {}}
                            onLoad={() => setFrontImgLoading(false)}
                            onError={() => setFrontImgLoading(false)}
                          />
                        </>;
                      } else {
                        return <div className="absolute inset-0 flex items-center justify-center"><ARVRPlaceholderIcon /></div>;
                      }
                    })()}
                    <div className="absolute bottom-0 left-0 w-full text-[10px] text-white text-center bg-black/50 py-1 rounded-b-xl">
                      VR Request
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full mb-2">
              <div className="border border-dashed border-[#B0B0B0] rounded-xl bg-white flex flex-col items-center justify-center py-8 px-4">
                <div className="mb-3"><ARVRPlaceholderIcon /></div>
                <div className="text-[#007E67] font-semibold mb-3 text-center text-sm">Please request a Vistaview team to create your property 3D model for buyer virtual tour</div>
              </div>
            </div>
          )}
        </div>
        
        {/* VR Images Modal - Same as desktop but mobile optimized */}
        {showVRModal && latestVR && ReactDOM.createPortal(
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl p-4 w-full max-w-sm relative overflow-y-auto max-h-[90vh]">
              <button className="absolute top-2 right-2 text-xl text-[#888] hover:text-[#222]" onClick={() => setShowVRModal(false)}>&times;</button>
              <form onSubmit={(e) => { e.preventDefault(); setShowVRModal(false); }}>
                <div className="text-base font-bold mb-1">
                  VR Request Details
                </div>
                <div className="text-xs mb-3">
                  View your submitted VR request details
                </div>
                <div className="mb-3">
                  <label className="block text-xs font-semibold mb-1">Property Type</label>
                  <select 
                    className="w-full border border-[#E5E7EB] rounded px-2 py-1 text-xs" 
                    value={propertyType}
                    disabled
                  >
                    <option>{propertyType}</option>
                  </select>
                </div>
                <div className="mb-3">
                  <div className="mb-1 font-medium text-xs">
                    Submitted property photos for 3D model creation
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {ARVR_PHOTO_SLOTS.map(slot => {
                      const viewTypeMap: { [key: string]: string } = {
                        'front': 'front_view',
                        'back': 'back_view',
                        'left': 'left_side_view',
                        'right': 'right_side_view',
                        'backcorner': 'back_corner',
                        'frontcorner': 'front_corner'
                      };
                      const matchingImage = latestVR.images.find((img: any) => img.view_type === viewTypeMap[slot.key]);
                      return (
                        <div
                          key={slot.key}
                          className="relative border border-dashed border-[#B0B0B0] rounded-lg bg-[#FAFAFA] h-24 w-full transition overflow-hidden"
                        >
                          {matchingImage ? (
                            <>
                              {modalImgLoading[slot.key] && (
                                <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-10"><ButtonLoader /></div>
                              )}
                              <img
                                src={matchingImage.image_url}
                                alt={slot.label}
                                className="absolute inset-0 w-full h-full object-cover rounded-lg"
                                style={modalImgLoading[slot.key] ? { visibility: 'hidden' } : {}}
                                onLoad={() => setModalImgLoading(l => ({ ...l, [slot.key]: false }))}
                                onError={() => setModalImgLoading(l => ({ ...l, [slot.key]: false }))}
                                onLoadStart={() => setModalImgLoading(l => ({ ...l, [slot.key]: true }))}
                              />
                            </>
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center w-full h-full"><ImagePlaceholderIcon /></div>
                          )}
                          <div className="absolute bottom-0 left-0 w-full text-[10px] text-white text-center bg-black/50 py-1 rounded-b-lg">{slot.label}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="my-4">
                  <div className="font-semibold mb-2 text-xs">Confirm your contact details</div>
                  <div className="flex items-center gap-2">
                    {agent?.profile_photo_url ? (
                      <div className="relative w-8 h-8">
                        {agentImgLoading && (
                          <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-10"><ButtonLoader /></div>
                        )}
                        <img
                          src={agent.profile_photo_url}
                          alt={agent.username}
                          className="w-8 h-8 rounded-full object-cover"
                          style={agentImgLoading ? { visibility: 'hidden' } : {}}
                          onLoad={() => setAgentImgLoading(false)}
                          onError={() => setAgentImgLoading(false)}
                        />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[#F3F4F6] flex items-center justify-center text-lg font-bold text-[#007E67]">
                        {agent?.first_name?.[0] || agent?.username?.[0] || 'A'}
                      </div>
                    )}
                    <div>
                      <div className="font-semibold text-xs mb-0.5">{agent?.first_name} {agent?.last_name}</div>
                      <div className="flex items-center text-[10px] text-[#007E67] gap-1 mb-0.5">
                        <svg width="12" height="12" fill="none" viewBox="0 0 24 24">
                          <path d="M21 10.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h7" stroke="#007E67" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M21 10.5l-9 9-3-3" stroke="#007E67" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg> {agent?.email}
                      </div>
                      <div className="flex items-center text-[10px] text-[#007E67] gap-1">
                        <svg width="12" height="12" fill="none" viewBox="0 0 24 24">
                          <path d="M22 16.92V19a2 2 0 0 1-2 2A19.72 19.72 0 0 1 3 5a2 2 0 0 1 2-2h2.09a2 2 0 0 1 2 1.72c.13.81.35 1.6.67 2.36a2 2 0 0 1-.45 2.11l-.27.27a16 16 0 0 0 6.29 6.29l.27-.27a2 2 0 0 1 2.11-.45c.76.32 1.55.54 2.36.67A2 2 0 0 1 22 16.92z" stroke="#007E67" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg> {agent?.mobile_number}
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  className="w-full px-4 py-2 rounded text-white font-semibold bg-gray-400 shadow text-sm cursor-not-allowed"
                  disabled
                >
                  Already Submitted
                </button>
              </form>
            </div>
          </div>,
          document.body
        )}
      </div>
    </div>
  );
};

const Agent3DHomeEdit: React.FC = () => {
  const isMobile = useIsMobile();
  const { id } = useParams();
  return isMobile ? <MobileEditView propertyId={id as string} /> : <DesktopEditView propertyId={id as string} />;
};

export default Agent3DHomeEdit; 