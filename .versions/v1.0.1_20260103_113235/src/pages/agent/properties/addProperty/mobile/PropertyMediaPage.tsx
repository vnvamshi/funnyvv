import React, { useRef, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ImagePlaceholderIcon, VideoPlaceholderIcon, FloorPlanPlaceholderIcon, ARVRPlaceholderIcon } from '../../../../../assets/icons/MediaMainIcons';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  rectSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import BottomSelectField from '../components/BottomSelectField';
import { MobilePropertyWizardProvider, useMobilePropertyWizard, useMobilePropertyWizardStorage } from './MobilePropertyWizardContext';
import api from '../../../../../utils/api';
import { showGlobalToast } from '../../../../../utils/toast';
import MobileAddPropertyTabs from './MobileAddPropertyTabs';
import successImg from '../../../../../assets/images/success-img.svg';

interface MediaFile {
  id: string;
  url: string;
  type: 'photo' | 'video' | 'floorplan';
  isMain?: boolean;
  name?: string;
  size?: number;
  sort_order? : number
}

interface DeleteTarget {
  section: 'photo' | 'video' | 'floorplan';
  id: string;
}

interface ARVRPhoto {
  id: string;
  url: string;
  type: 'photo';
  name?: string;
  size?: number;
}

const ARVR_PHOTO_SLOTS = [
  { key: 'front', label: 'Front view' },
  { key: 'back', label: 'Back view' },
  { key: 'left', label: 'Left Side view' },
  { key: 'right', label: 'Right Side view' },
  { key: 'backcorner', label: 'Back corner' },
  { key: 'frontcorner', label: 'Front corner' },
];

// Utility function to upload a file to the API
const uploadFileToAPI = async (file: File): Promise<string | null> => {
  const formData = new FormData();
  formData.append('files', file);
  try {
    const response = await api.post('/common/file/upload/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    console.log(response.data.data);
    if (response.data.status_code == 200){
      return response.data?.data?.files[0]?.url;
    }
  } catch (error) {
    // do nothing, fall through to return null
  }
  return null;
};

// Sortable item component for grid
function SortableGridItem({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.7 : 1,
  };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
}

function mapVRSubmittedToARVRPhotos(vrData: any, prev: { [key: string]: ARVRPhoto | null }): { [key: string]: ARVRPhoto | null } {
  // If vrData is an array (new API format), use the first item (or merge if needed)
  let images: any = {};
  if (Array.isArray(vrData) && vrData.length > 0) {
    images = vrData[0]?.images || {};
  } else if (vrData && typeof vrData === 'object' && !Array.isArray(vrData)) {
    images = vrData;
  }
  return {
    front: images.front_view ? { id: 'vr-front', url: images.front_view, type: 'photo' } : prev['front'],
    back: images.back_view ? { id: 'vr-back', url: images.back_view, type: 'photo' } : prev['back'],
    left: images.left_side_view ? { id: 'vr-left', url: images.left_side_view, type: 'photo' } : prev['left'],
    right: images.right_side_view ? { id: 'vr-right', url: images.right_side_view, type: 'photo' } : prev['right'],
    backcorner: images.back_corner ? { id: 'vr-backcorner', url: images.back_corner, type: 'photo' } : prev['backcorner'],
    frontcorner: images.front_corner ? { id: 'vr-frontcorner', url: images.front_corner, type: 'photo' } : prev['frontcorner'],
  };
}

interface PropertyMediaPageProps {
  hideDetailsAboveAccordion?: boolean;
  hideHeader?: boolean;
  hideFooter?: boolean;
  isAgentPropertyDetails?: boolean; // New prop to detect agent property details context
  refreshProperty?: () => void; // Function to refresh parent component's property data
}

const PropertyMediaPageInner: React.FC<PropertyMediaPageProps> = ({ hideDetailsAboveAccordion = false, hideHeader = false, hideFooter = false, isAgentPropertyDetails = false, refreshProperty }) => {
  const { handlePropertyMediaBack, handlePropertyMediaSaveDraft, handlePropertyMediaNext, propertyInfoData: contextPropertyInfoData, setPropertyInfoData, isSaving, isLoadingProperty } = useMobilePropertyWizard();
  const { getPropertyInfoData } = useMobilePropertyWizardStorage();
  const navigate = useNavigate();
  const { id } = useParams();
  
  // Load data from localStorage or use context data
  const [propertyInfoData, setLocalPropertyInfoData] = useState(() => {
    const storedData = getPropertyInfoData();
    return storedData && Object.keys(storedData).length > 0 ? storedData : contextPropertyInfoData;
  });
  
  // State for each section
  const [photos, setPhotos] = useState<MediaFile[]>(propertyInfoData?.property_photos || []);
  const [videos, setVideos] = useState<MediaFile[]>(propertyInfoData?.property_videos || []);
  const [floorplans, setFloorplans] = useState<MediaFile[]>(propertyInfoData?.property_floorplans || []);
  
  // Helper function to convert isMain to main_photo for API
  const convertPhotosForAPI = (photos: MediaFile[]) => {
    return photos.map(photo => {
      const { isMain, ...photoWithoutIsMain } = photo;
      return {
        ...photoWithoutIsMain,
        main_photo: isMain || false,
      };
    });
  };
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [showARVRModal, setShowARVRModal] = useState(false);
  const [showARVRSuccess, setShowARVRSuccess] = useState(false);
  const [arvrPhotos, setARVRPhotos] = useState<{ [key: string]: ARVRPhoto | null }>({});
  const [arvrType, setARVRType] = useState('Villa');
  const [loading, setLoading] = useState(false);

  // Upload progress state
  const [uploadProgress, setUploadProgress] = useState<{ [section: string]: number }>({});
  const [uploadingSections, setUploadingSections] = useState<{ [section: string]: boolean }>({
    photo: false,
    video: false,
    floorplan: false
  });
  // ARVR photo upload progress
  const [arvrUploadProgress, setARVRUploadProgress] = useState<number>(0);
  const [arvrUploading, setARVRUploading] = useState<boolean>(false);
  // ARVR submit loading state
  const [arvrSubmitLoading, setARVRSubmitLoading] = useState(false);
  const [savingSection, setSavingSection] = useState<'photo' | 'video' | 'floorplan' | null>(null);

  // File input refs
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);
  const floorplanInputRef = useRef<HTMLInputElement | null>(null);
  const arvrPhotoInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  
  // AR/VR request id state
  const [arvrRequestId, setARVRRequestId] = useState<string | null>(null);
  // Add state for VR dummy item
  const [showVRDummy, setShowVRDummy] = useState(false);
  const [isVRModalReadOnly, setIsVRModalReadOnly] = useState(false);

  // Accordion state: 'photos', 'videos', 'floorplans', 'virtualTour'
  const [openAccordions, setOpenAccordions] = useState<Set<'photos' | 'videos' | 'floorplans' | 'virtualTour'>>(new Set(['photos', 'videos', 'floorplans', 'virtualTour']));
  const handleAccordion = (section: 'photos' | 'videos' | 'floorplans' | 'virtualTour') => {
    setOpenAccordions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  // Sync with context data when it changes
  useEffect(() => {
    if (contextPropertyInfoData && Object.keys(contextPropertyInfoData).length > 0) {
      console.log('Context propertyInfoData updated:', contextPropertyInfoData);
      setLocalPropertyInfoData(contextPropertyInfoData);
    }
  }, [contextPropertyInfoData]);

  // Update local state when propertyInfoData changes
  useEffect(() => {
    console.log('Local propertyInfoData updated:', propertyInfoData);
    setPhotos(propertyInfoData?.property_photos || []);
    setVideos(propertyInfoData?.property_videos || []);
    setFloorplans(propertyInfoData?.property_floorplans || []);
    setARVRRequestId(
      Array.isArray(propertyInfoData?.property_virtual_tours) && propertyInfoData.property_virtual_tours.length > 0
        ? propertyInfoData.property_virtual_tours[0]
        : null
    );
    // Initialize showVRDummy based on existing VR request or vr_submitted data
    setShowVRDummy(
      (Array.isArray(propertyInfoData?.property_virtual_tours) && propertyInfoData.property_virtual_tours.length > 0) ||
      (propertyInfoData?.vr_submitted && (
        (Array.isArray(propertyInfoData.vr_submitted) && propertyInfoData.vr_submitted.length > 0) ||
        (typeof propertyInfoData.vr_submitted === 'object' && Object.keys(propertyInfoData.vr_submitted).length > 0)
      ))
    );
    // Always prefill arvrPhotos for all slots if available
    if (propertyInfoData?.vr_submitted && ((Array.isArray(propertyInfoData.vr_submitted) && propertyInfoData.vr_submitted.length > 0) || (typeof propertyInfoData.vr_submitted === 'object' && Object.keys(propertyInfoData.vr_submitted).length > 0))) {
      setARVRPhotos(prev => mapVRSubmittedToARVRPhotos(propertyInfoData.vr_submitted, prev));
    } else if (propertyInfoData?.arvr_photos) {
      setARVRPhotos(prev => ({ ...propertyInfoData.arvr_photos, ...prev }));
    }
  }, [propertyInfoData]);

  // Helper to check for duplicate files
  const isDuplicate = (file: File, section: 'photo' | 'video' | 'floorplan') => {
    const list = section === 'photo' ? photos : section === 'video' ? videos : floorplans;
    return list.some(f => f.url.endsWith(file.name) || (f.name && f.name === file.name && f.size === file.size));
  };

  // Handle file uploads
  const handleAddFiles = async (e: React.ChangeEvent<HTMLInputElement>, section: 'photo' | 'video' | 'floorplan') => {
    const files = e.target.files;
    if (!files) return;
    let added = false;
    const arr: MediaFile[] = [];
    setUploadingSections(prev => ({ ...prev, [section]: true }));
    setUploadProgress(prev => ({ ...prev, [section]: 0 }));
    const total = files.length;
    let uploaded = 0;
    for (const file of Array.from(files)) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        showGlobalToast(`File "${file.name}" is too large. Max size is 5MB.`);
        continue;
      }
      if (isDuplicate(file, section)) {
        showGlobalToast('File already exists.');
        continue;
      }
      // Upload to API
      const uploadedUrl = await uploadFileToAPI(file);
      console.log('uploadedUrl', uploadedUrl);
      if (!uploadedUrl) {
        showGlobalToast(`Failed to upload file: ${file.name}`);
        continue;
      }
      added = true;

      arr.push({
        id: `${section}-${Date.now()}-${Math.random()}`,
        url: uploadedUrl,
        type: section,
        isMain: false,
        name: file.name,
        size: file.size,
        sort_order : arr.length + 1
      });
      console.log('arr', arr);
      uploaded++;
      setUploadProgress(prev => ({ ...prev, [section]: Math.round((uploaded / total) * 100) }));
    }
    setUploadingSections(prev => ({ ...prev, [section]: false }));
    if (!added) return;
    if (section === 'photo') {
      setPhotos(prev => prev.length === 0 ? [{ ...arr[0], isMain: true }, ...arr.slice(1)] : [...prev, ...arr]);
    } else if (section === 'video') {
      setVideos(prev => [...prev, ...arr]);
    } else if (section === 'floorplan') {
      setFloorplans(prev => [...prev, ...arr]);
    }
    e.target.value = '';
  };
  const handleDelete = (section: 'photo' | 'video' | 'floorplan', id: string) => setDeleteTarget({ section, id });
  const confirmDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.section === 'photo') {
      setPhotos(prev => {
        const filtered = prev.filter(p => p.id !== deleteTarget.id);
        if (filtered.length && !filtered.some(p => p.isMain)) filtered[0].isMain = true;
        return filtered;
      });
    } else if (deleteTarget.section === 'video') {
      setVideos(prev => prev.filter(v => v.id !== deleteTarget.id));
    } else if (deleteTarget.section === 'floorplan') {
      setFloorplans(prev => prev.filter(f => f.id !== deleteTarget.id));
    }
    setDeleteTarget(null);
  };
  const cancelDelete = () => setDeleteTarget(null);
  const setMainPhoto = (id: string) => setPhotos(prev => prev.map(p => ({ ...p, isMain: p.id === id })));
  // Drag-and-drop reordering for mobile
  const onDragStart = (e: React.DragEvent<HTMLDivElement>, idx: number, section: 'photo' | 'video') => {
    e.dataTransfer.setData('drag-idx', idx.toString());
    e.dataTransfer.setData('drag-section', section);
  };
  const onDropGrid = (e: React.DragEvent<HTMLDivElement>, idx: number, section: 'photo' | 'video') => {
    const dragIdx = Number(e.dataTransfer.getData('drag-idx'));
    const dragSection = e.dataTransfer.getData('drag-section');
    if (dragSection !== section) return;
    if (section === 'photo') {
      setPhotos(prev => {
        const arr = [...prev];
        const [removed] = arr.splice(dragIdx, 1);
        arr.splice(idx, 0, removed);
        // Recalculate sort_order: main photo always sort_order=1, others 2,3,...
        let mainIndex = arr.findIndex(p => p.isMain);
        arr.forEach((photo, i) => {
          if (photo.isMain) {
            photo.sort_order = 1;
          } else {
            // If main photo is before this, offset by 1
            photo.sort_order = (i < mainIndex ? i + 2 : i + 1);
          }
        });
        // Log the new order
        console.log('Photo order after drag:', arr.map(p => ({ id: p.id, isMain: p.isMain, sort_order: p.sort_order })));
        return arr;
      });
    } else if (section === 'video') {
      setVideos(prev => {
        const arr = [...prev];
        const [removed] = arr.splice(dragIdx, 1);
        arr.splice(idx, 0, removed);
        return arr;
      });
    }
  };
  // AR/VR photo handling
  const handleARVRPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>, slotKey: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showGlobalToast(`File "${file.name}" is too large. Max size is 5MB.`);
      return;
    }

    setARVRUploading(true);
    setARVRUploadProgress(0);

    const uploadedUrl = await uploadFileToAPI(file);
    if (uploadedUrl) {
      setARVRPhotos(prev => ({
        ...prev,
        [slotKey]: {
          id: `arvr-${slotKey}-${Date.now()}`,
          url: uploadedUrl,
          type: 'photo',
          name: file.name,
          size: file.size,
        }
      }));
    } else {
      showGlobalToast(`Failed to upload photo: ${file.name}`);
    }

    setARVRUploading(false);
    setARVRUploadProgress(100);
    e.target.value = '';
  };

  const handleARVRModalClose = () => {
    setShowARVRModal(false);
    setIsVRModalReadOnly(false);
  };
  const handleARVRModalOpen = () => {
    // Always prefill arvrPhotos from vr_submitted if available when opening the modal
    if (propertyInfoData?.vr_submitted && ((Array.isArray(propertyInfoData.vr_submitted) && propertyInfoData.vr_submitted.length > 0) || (typeof propertyInfoData.vr_submitted === 'object' && Object.keys(propertyInfoData.vr_submitted).length > 0))) {
      setARVRPhotos(prev => mapVRSubmittedToARVRPhotos(propertyInfoData.vr_submitted, prev));
    } else if (propertyInfoData?.arvr_photos) {
      setARVRPhotos(prev => ({ ...propertyInfoData.arvr_photos, ...prev }));
    }
    setShowARVRModal(true);
  };
  
  // New handler for opening VR modal in read-only mode
  const handleVRDummyClick = () => {
    setIsVRModalReadOnly(true);
    // Always prefill arvrPhotos from vr_submitted if available when opening the modal
    if (propertyInfoData?.vr_submitted && ((Array.isArray(propertyInfoData.vr_submitted) && propertyInfoData.vr_submitted.length > 0) || (typeof propertyInfoData.vr_submitted === 'object' && Object.keys(propertyInfoData.vr_submitted).length > 0))) {
      setARVRPhotos(prev => mapVRSubmittedToARVRPhotos(propertyInfoData.vr_submitted, prev));
    } else if (propertyInfoData?.arvr_photos) {
      setARVRPhotos(prev => ({ ...propertyInfoData.arvr_photos, ...prev }));
    }
    setShowARVRModal(true);
  };

  const handleARVRSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const requiredSlots = ['front', 'back', 'left', 'right'];
    const missingSlots = requiredSlots.filter(slot => !arvrPhotos[slot]);

    if (missingSlots.length > 0) {
      showGlobalToast(`Please upload photos for: ${missingSlots.join(', ')}`);
      return;
    }

    setARVRSubmitLoading(true);
    try {
      const payload = {
        front_view: arvrPhotos['front']?.url,
        back_view: arvrPhotos['back']?.url,
        left_side_view: arvrPhotos['left']?.url,
        right_side_view: arvrPhotos['right']?.url,
        back_corner: arvrPhotos['backcorner']?.url,
        front_corner: arvrPhotos['frontcorner']?.url,
        status: 'requested',
      };
      const response = await api.post('/agent/virtual-tour-request/', payload);

      // Accept as success if response.data contains a VR request ID, or status_code === 200
      const vrRequestId = response.data?.data?.id || response.data?.data?.vr_id || response.data?.data?.request_id;
      if (vrRequestId || response.data?.status_code === 200) {
        setARVRRequestId(vrRequestId);
        setShowARVRSuccess(true);
        setShowARVRModal(false);
        setShowVRDummy(true);
      } else {
        showGlobalToast('Failed to submit AR/VR request');
      }
    } catch (error) {
      console.error('Error submitting AR/VR request:', error);
      showGlobalToast('Failed to submit AR/VR request');
    }
    setARVRSubmitLoading(false);
  };

  const handleARVRSuccessClose = () => setShowARVRSuccess(false);

  const handleBack = () => {
    const convertedPhotos = convertPhotosForAPI(photos);
    const values = {
      property_photos: convertedPhotos,
      property_videos: videos,
      property_floorplans: floorplans,
      property_virtual_tours: arvrRequestId ? [arvrRequestId] : [],
      arvr_photos: arvrPhotos,
    };
    console.log('Setting propertyInfoData in handleBack:', values);
    setPropertyInfoData((prev: any) => ({ ...prev, ...values }));
    handlePropertyMediaBack(convertedPhotos, videos, floorplans, arvrRequestId);
  };

  const handleSaveDraft = async () => {
    setLoading(true);
    const convertedPhotos = convertPhotosForAPI(photos);
    const merged = {
      ...propertyInfoData,
      property_photos: convertedPhotos,
      property_videos: videos,
      property_floorplans: floorplans,
      property_virtual_tours: arvrRequestId ? [arvrRequestId] : [],
      arvr_photos: arvrPhotos,
      id: propertyInfoData?.id // Ensure id is present if editing
    };
    setPropertyInfoData(merged);
    await handlePropertyMediaSaveDraft(convertedPhotos, videos, floorplans, arvrRequestId);
    // Don't set loading to false here - let the context handle it
  };

  const handleNext = () => {
    const convertedPhotos = convertPhotosForAPI(photos);
    const values = {
      property_photos: convertedPhotos,
      property_videos: videos,
      property_floorplans: floorplans,
      property_virtual_tours: arvrRequestId ? [arvrRequestId] : [],
      arvr_photos: arvrPhotos,
    };
    console.log('Setting propertyInfoData in handleNext:', values);
    setPropertyInfoData((prev: any) => ({ ...prev, ...values }));
    handlePropertyMediaNext(convertedPhotos, videos, floorplans, arvrRequestId);
  };

  // Sensors for dnd-kit
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 200, // ms to hold before drag starts
        tolerance: 5, // px movement allowed before drag cancels
      }
    })
  );

  // Add a helper to check if vr_submitted is a non-empty object
  const hasVRSubmitted = propertyInfoData?.vr_submitted && typeof propertyInfoData.vr_submitted === 'object' && Object.keys(propertyInfoData.vr_submitted).length > 0;
  
  // Debug logging for VR card visibility
  console.log('PropertyMediaPage Debug:');
  console.log('  propertyInfoData.vr_submitted:', propertyInfoData?.vr_submitted);
  console.log('  hasVRSubmitted:', hasVRSubmitted);
  console.log('  showVRDummy:', showVRDummy);
  console.log('  condition result (hasVRSubmitted || showVRDummy):', hasVRSubmitted || showVRDummy);
  console.log('  Object.keys(propertyInfoData.vr_submitted):', propertyInfoData?.vr_submitted ? Object.keys(propertyInfoData.vr_submitted) : 'no vr_submitted');
  
  // Compare helpers
  const isPhotosChanged = JSON.stringify(photos) !== JSON.stringify(propertyInfoData?.property_photos || []);
  const isVideosChanged = JSON.stringify(videos) !== JSON.stringify(propertyInfoData?.property_videos || []);
  const isFloorplansChanged = JSON.stringify(floorplans) !== JSON.stringify(propertyInfoData?.property_floorplans || []);

  // PATCH handler
  const handleSectionSave = async (section: 'photo' | 'video' | 'floorplan') => {
    if (!propertyInfoData?.id) return;
    setSavingSection(section);
    let patchData: any = {};
    if (section === 'photo') patchData.property_photos = convertPhotosForAPI(photos);
    if (section === 'video') patchData.property_videos = videos;
    if (section === 'floorplan') patchData.property_floorplans = floorplans;
    try {
      await api.patch(`/agent/properties/${propertyInfoData.id}/`, patchData);
      // Update local propertyInfoData
      setLocalPropertyInfoData((prev: any) => ({ ...prev, ...patchData }));
      showGlobalToast('Saved successfully!');
      // Refresh parent component's property data
      if (refreshProperty) {
        refreshProperty();
      }
    } catch (e) {
      showGlobalToast('Failed to save.');
    }
    setSavingSection(null);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* If property data is still loading from API, show spinner */}
      {isLoadingProperty && isAgentPropertyDetails && (
        <div className="fixed inset-0 bg-white bg-opacity-80 z-50">
          <div className="w-full h-full flex flex-col items-center justify-center">
            <div className="w-16 h-16 border-4 border-green-200 border-t-green-700 rounded-full animate-spin mb-4" />
            <p className="text-gray-600">Loading media...</p>
          </div>
        </div>
      )}
      
      {/* Spinner overlay */}
      {isSaving && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="w-16 h-16 border-4 border-green-200 border-t-green-700 rounded-full animate-spin" />
        </div>
      )}
      {/* Fixed Header */}
      {!hideHeader && (
        <div className="fixed top-0 left-0 w-full z-30 bg-white flex flex-col shadow-md">
          <div className="flex items-center px-4 pt-6 pb-2 bg-white shadow-none">
            <button
              className="mr-2 p-2 -ml-2"
              onClick={handleBack}
              aria-label="Back"
            >
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path d="M15 18l-6-6 6-6" stroke="#004D40" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <span className="text-green-900 text-2xl font-bold">{propertyInfoData?.id ? 'Update Property' : 'Add Property'}</span>
          </div>
          <MobileAddPropertyTabs currentStep={2} />
        </div>
      )}
      {/* Main Content with padding for header and footer */}
      <div className={`flex flex-col px-6 pb-32 ${hideDetailsAboveAccordion ? '' : 'pt-32'}`}>
        {!hideDetailsAboveAccordion && (
          <>
            <div className="text-2xl font-bold text-[#222] mb-2">Add your property photos, videos and others</div>
            <div className="text-base text-[#222] mb-6">{propertyInfoData.address}, {propertyInfoData.city_detail?.name}, {propertyInfoData.state_detail?.name}, {propertyInfoData.country_detail?.name}, {propertyInfoData.postalCode}</div>
            <div className="text-base text-[#222] mb-4">Property type : <span className="font-bold">{propertyInfoData.propertyType?.name}</span></div>
          </>
        )}
        
        {/* Photos Accordion */}
        <div className="mb-4">
          <button 
            className={`w-full flex items-center justify-between py-3 px-4 rounded-lg transition-all duration-300 ${
              openAccordions.has('photos') 
                ? 'bg-gradient-to-r from-[#004236] to-[#007E67] text-white shadow-md' 
                : 'bg-white border border-[#E5E7EB] hover:bg-gray-50'
            }`} 
            onClick={() => handleAccordion('photos')}
          >
            <span className="text-lg font-bold">Photos</span>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
              openAccordions.has('photos') 
                ? 'bg-white/20' 
                : 'bg-gradient-to-r from-[#004236] to-[#007E67]'
            }`}>
              {openAccordions.has('photos') ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white">
                  <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white">
                  <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
          </button>
          {openAccordions.has('photos') && (
            <div className="pt-4 pb-2 relative">
              <div className="text-sm text-[#444] mb-2">Drag and drop to reorder. Click on a photo to add a caption or delete a photo.</div>
              {/* Upload Progress Bar for Photos */}
              {uploadingSections.photo && (
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-[#666] mb-1">
                    <span>Uploading photos...</span>
                    <span>{uploadProgress.photo || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-[#004236] to-[#007E67] h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress.photo || 0}%` }}
                    ></div>
                  </div>
                </div>
              )}
              <div className="w-full mb-2">
                {photos.length === 0 ? (
                  <div className="border border-dashed border-[#B0B0B0] rounded-xl bg-white flex flex-col items-center justify-center h-32 w-full cursor-pointer" onClick={() => photoInputRef.current?.click()}>
                    <ImagePlaceholderIcon />
                    <div className="text-xs text-[#888] mt-1">Add photo</div>
                    <input
                      ref={photoInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={e => handleAddFiles(e, 'photo')}
                    />
                  </div>
                ) : (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={(event: DragEndEvent) => {
                      const { active, over } = event;
                      if (active.id !== over?.id) {
                        const oldIndex = photos.findIndex(f => f.id === active.id);
                        const newIndex = photos.findIndex(f => f.id === over?.id);
                        setPhotos(arrayMove(photos, oldIndex, newIndex));
                      }
                    }}
                  >
                    <SortableContext items={photos.map(f => f.id)} strategy={rectSortingStrategy}>
                      <div className="grid grid-cols-3 gap-2" style={{ touchAction: 'none' }}>
                        {/* Add photo button as first grid cell (not draggable) */}
                        <div className="border border-dashed border-[#B0B0B0] rounded-xl bg-white flex flex-col items-center justify-center h-32 w-full cursor-pointer" onClick={() => photoInputRef.current?.click()}>
                          <ImagePlaceholderIcon />
                          <div className="text-xs text-[#888] mt-1">Add photo</div>
                          <input
                            ref={photoInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={e => handleAddFiles(e, 'photo')}
                          />
                        </div>
                        {/* Render photo files as sortable items */}
                        {photos.map((file) => (
                          <SortableGridItem key={file.id} id={file.id}>
                            <div className="relative group border border-[#E5E7EB] rounded-xl bg-white h-32 w-full flex items-center justify-center">
                              <img src={file.url} alt="media" className="object-cover w-full h-full rounded-xl" />
                              {file.isMain && (
                                <div className="absolute top-1 left-1 px-2 py-1 bg-[#007E67]/80 text-white text-xs rounded z-10">Main photo</div>
                              )}
                              {!file.isMain && (
                                <button
                                  className="absolute top-1 left-1 bg-white/90 text-[#007E67] text-xs px-2 py-1 rounded border border-[#007E67] z-10 hover:bg-[#F3F3F3]"
                                  onClick={() => setMainPhoto(file.id)}
                                  type="button"
                                >Set as main</button>
                              )}
                              <button
                                className="absolute top-1 right-1 bg-white/90 text-[#222] rounded-full w-6 h-6 flex items-center justify-center z-10 shadow-sm hover:bg-white hover:text-red-600 hover:shadow-md transition"
                                style={{ opacity: 0.85, border: '1px solid #E5E7EB' }}
                                onClick={() => handleDelete('photo', file.id)}
                                type="button"
                              >×</button>
                            </div>
                          </SortableGridItem>
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                )}
              </div>
              {/* Save button for photos */}
              {isAgentPropertyDetails && isPhotosChanged && (
                <button
                  className="mt-4 w-full bg-gradient-to-r from-[#004236] to-[#007E67] text-white px-4 py-2 rounded-lg font-semibold shadow"
                  onClick={() => handleSectionSave('photo')}
                  disabled={savingSection === 'photo'}
                >
                  {savingSection === 'photo' ? (
                    <svg className="animate-spin h-5 w-5 inline-block align-middle" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                  ) : (
                    'Save'
                  )}
                </button>
              )}
            </div>
          )}
        </div>
        {/* Videos Accordion */}
        <div className="mb-4">
          <button 
            className={`w-full flex items-center justify-between py-3 px-4 rounded-lg transition-all duration-300 ${
              openAccordions.has('videos') 
                ? 'bg-gradient-to-r from-[#004236] to-[#007E67] text-white shadow-md' 
                : 'bg-white border border-[#E5E7EB] hover:bg-gray-50'
            }`} 
            onClick={() => handleAccordion('videos')}
          >
            <span className="text-lg font-bold">Videos</span>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
              openAccordions.has('videos') 
                ? 'bg-white/20' 
                : 'bg-gradient-to-r from-[#004236] to-[#007E67]'
            }`}>
              {openAccordions.has('videos') ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white">
                  <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white">
                  <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
          </button>
          {openAccordions.has('videos') && (
            <div className="pt-4 pb-2 relative">
              <div className="text-sm text-[#444] mb-2">Drag and drop to reorder. Click on a video to add a caption or delete a video.</div>
              {/* Upload Progress Bar for Videos */}
              {uploadingSections.video && (
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-[#666] mb-1">
                    <span>Uploading videos...</span>
                    <span>{uploadProgress.video || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-[#004236] to-[#007E67] h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress.video || 0}%` }}
                    ></div>
                  </div>
                </div>
              )}
              <div className="w-full mb-2">
                {videos.length === 0 ? (
                  <div className="border border-dashed border-[#B0B0B0] rounded-xl bg-white flex flex-col items-center justify-center py-8 px-4 w-full">
                    <div className="mb-2"><VideoPlaceholderIcon /></div>
                    <div className="text-[#888] mb-4">Tap to upload videos</div>
                    <button
                      className="px-6 py-2 rounded text-white font-semibold bg-gradient-to-r from-[#004236] to-[#007E67] shadow mb-2"
                      onClick={() => videoInputRef.current?.click()}
                      type="button"
                    >Add video</button>
                    <input
                      ref={videoInputRef}
                      type="file"
                      accept="video/*"
                      multiple
                      className="hidden"
                      onChange={e => handleAddFiles(e, 'video')}
                    />
                  </div>
                ) : (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={(event: DragEndEvent) => {
                      const { active, over } = event;
                      if (active.id !== over?.id) {
                        const oldIndex = videos.findIndex(f => f.id === active.id);
                        const newIndex = videos.findIndex(f => f.id === over?.id);
                        setVideos(arrayMove(videos, oldIndex, newIndex));
                      }
                    }}
                  >
                    <SortableContext items={videos.map(f => f.id)} strategy={rectSortingStrategy}>
                      <div className="grid grid-cols-3 gap-2" style={{ touchAction: 'none' }}>
                        {/* Add video button as first grid cell (not draggable) */}
                        <div className="border border-dashed border-[#B0B0B0] rounded-xl bg-white flex flex-col items-center justify-center h-32 w-full cursor-pointer" onClick={() => videoInputRef.current?.click()}>
                          <VideoPlaceholderIcon />
                          <div className="text-xs text-[#888] mt-1">Add video</div>
                          <input
                            ref={videoInputRef}
                            type="file"
                            accept="video/*"
                            multiple
                            className="hidden"
                            onChange={e => handleAddFiles(e, 'video')}
                          />
                        </div>
                        {/* Render video files as sortable items */}
                        {videos.map((file) => (
                          <SortableGridItem key={file.id} id={file.id}>
                            <div className="relative group border border-[#E5E7EB] rounded-xl bg-white h-32 w-full flex items-center justify-center">
                              <video src={file.url} className="object-cover w-full h-full rounded-xl" controls />
                              <button
                                className="absolute top-1 right-1 bg-white/90 text-[#222] rounded-full w-6 h-6 flex items-center justify-center z-10 shadow-sm hover:bg-white hover:text-red-600 hover:shadow-md transition"
                                style={{ opacity: 0.85, border: '1px solid #E5E7EB' }}
                                onClick={() => handleDelete('video', file.id)}
                                type="button"
                              >×</button>
                            </div>
                          </SortableGridItem>
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                )}
              </div>
              {/* Save button for videos */}
              {isAgentPropertyDetails && isVideosChanged && (
                <button
                  className="mt-4 w-full bg-gradient-to-r from-[#004236] to-[#007E67] text-white px-4 py-2 rounded-lg font-semibold shadow"
                  onClick={() => handleSectionSave('video')}
                  disabled={savingSection === 'video'}
                >
                  {savingSection === 'video' ? (
                    <svg className="animate-spin h-5 w-5 inline-block align-middle" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                  ) : (
                    'Save'
                  )}
                </button>
              )}
            </div>
          )}
        </div>
        {/* Floorplan Accordion */}
        <div className="mb-4">
          <button 
            className={`w-full flex items-center justify-between py-3 px-4 rounded-lg transition-all duration-300 ${
              openAccordions.has('floorplans') 
                ? 'bg-gradient-to-r from-[#004236] to-[#007E67] text-white shadow-md' 
                : 'bg-white border border-[#E5E7EB] hover:bg-gray-50'
            }`} 
            onClick={() => handleAccordion('floorplans')}
          >
            <span className="text-lg font-bold">Floorplan</span>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
              openAccordions.has('floorplans') 
                ? 'bg-white/20' 
                : 'bg-gradient-to-r from-[#004236] to-[#007E67]'
            }`}>
              {openAccordions.has('floorplans') ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white">
                  <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white">
                  <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
          </button>
          {openAccordions.has('floorplans') && (
            <div className="pt-4 pb-2 relative">
              <div className="text-sm text-[#444] mb-2">Upload your floor plan as png or 3d model</div>
              {/* Upload Progress Bar for Floorplans */}
              {uploadingSections.floorplan && (
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-[#666] mb-1">
                    <span>Uploading floorplans...</span>
                    <span>{uploadProgress.floorplan || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-[#004236] to-[#007E67] h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress.floorplan || 0}%` }}
                    ></div>
                  </div>
                </div>
              )}
              <div className="w-full mb-2">
                {floorplans.length === 0 ? (
                  <div className="border border-dashed border-[#B0B0B0] rounded-xl bg-white flex flex-col items-center justify-center h-32 w-full cursor-pointer" onClick={() => floorplanInputRef.current?.click()}>
                    <FloorPlanPlaceholderIcon />
                    <div className="text-xs text-[#888] mt-1">Add Floorplan</div>
                    <input
                      ref={floorplanInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={e => handleAddFiles(e, 'floorplan')}
                    />
                  </div>
                ) : (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={(event: DragEndEvent) => {
                      const { active, over } = event;
                      if (active.id !== over?.id) {
                        const oldIndex = floorplans.findIndex(f => f.id === active.id);
                        const newIndex = floorplans.findIndex(f => f.id === over?.id);
                        setFloorplans(arrayMove(floorplans, oldIndex, newIndex));
                      }
                    }}
                  >
                    <SortableContext items={floorplans.map(f => f.id)} strategy={rectSortingStrategy}>
                      <div className="grid grid-cols-3 gap-2" style={{ touchAction: 'none' }}>
                        {/* Add floorplan button as first grid cell (not draggable) */}
                        <div className="border border-dashed border-[#B0B0B0] rounded-xl bg-white flex flex-col items-center justify-center h-32 w-full cursor-pointer" onClick={() => floorplanInputRef.current?.click()}>
                          <FloorPlanPlaceholderIcon />
                          <div className="text-xs text-[#888] mt-1">Add Floorplan</div>
                          <input
                            ref={floorplanInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={e => handleAddFiles(e, 'floorplan')}
                          />
                        </div>
                        {/* Render floorplan files as sortable items */}
                        {floorplans.map((file) => (
                          <SortableGridItem key={file.id} id={file.id}>
                            <div className="relative group border border-[#E5E7EB] rounded-xl bg-white h-32 w-full flex items-center justify-center">
                              <img src={file.url} alt="floorplan" className="object-cover w-full h-full rounded-xl" />
                              <button
                                className="absolute top-1 right-1 bg-white/90 text-[#222] rounded-full w-6 h-6 flex items-center justify-center z-10 shadow-sm hover:bg-white hover:text-red-600 hover:shadow-md transition"
                                style={{ opacity: 0.85, border: '1px solid #E5E7EB' }}
                                onClick={() => handleDelete('floorplan', file.id)}
                                type="button"
                              >×</button>
                            </div>
                          </SortableGridItem>
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                )}
              </div>
              {/* Save button for floorplans */}
              {isAgentPropertyDetails && isFloorplansChanged && (
                <button
                  className="mt-4 w-full bg-gradient-to-r from-[#004236] to-[#007E67] text-white px-4 py-2 rounded-lg font-semibold shadow"
                  onClick={() => handleSectionSave('floorplan')}
                  disabled={savingSection === 'floorplan'}
                >
                  {savingSection === 'floorplan' ? (
                    <svg className="animate-spin h-5 w-5 inline-block align-middle" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                  ) : (
                    'Save'
                  )}
                </button>
              )}
            </div>
          )}
        </div>
        {/* Virtual Tour Accordion */}
        <div className="mb-4">
          <button 
            className={`w-full flex items-center justify-between py-3 px-4 rounded-lg transition-all duration-300 ${
              openAccordions.has('virtualTour') 
                ? 'bg-gradient-to-r from-[#004236] to-[#007E67] text-white shadow-md' 
                : 'bg-white border border-[#E5E7EB] hover:bg-gray-50'
            }`} 
            onClick={() => handleAccordion('virtualTour')}
          >
            <span className="text-lg font-bold">Virtual Tour</span>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
              openAccordions.has('virtualTour') 
                ? 'bg-white/20' 
                : 'bg-gradient-to-r from-[#004236] to-[#007E67]'
            }`}>
              {openAccordions.has('virtualTour') ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white">
                  <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white">
                  <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
          </button>
          {openAccordions.has('virtualTour') && (
            <div className="pt-4 pb-2">
              <div className="text-sm text-[#444] mb-2">You can add AR/VR model to this property or edit existing tours by going to My AR/VR Homes.</div>
              {(hasVRSubmitted || showVRDummy) ? (
                <>
                  {/* Card grid for submitted VR request */}
                  <div className="flex flex-row items-start gap-4 mb-2">
                    <div
                      className="relative border border-dashed border-[#B0B0B0] rounded-lg bg-white flex flex-col items-center justify-center min-w-[140px] max-w-[180px] w-full min-h-[120px] cursor-pointer overflow-hidden"
                      onClick={() => {
                        setIsVRModalReadOnly(true);
                        setShowARVRModal(true);
                        // Use vr_submitted data if available, otherwise use current arvrPhotos
                        const vrData = propertyInfoData?.vr_submitted || {};
                        setARVRPhotos(prev => mapVRSubmittedToARVRPhotos(vrData, prev));
                      }}
                    >
                      {/* Submitted Badge */}
                      <div className="absolute top-2 right-2 bg-[#007E67]/90 text-white text-xs px-2 py-1 rounded-full z-10 shadow-sm">
                        Submitted
                      </div>
                      {/* Front image or placeholder */}
                      {(() => {
                        const frontImg = arvrPhotos['front']?.url;
                        if (frontImg) {
                          return <img src={frontImg} alt="Front view" className="object-cover w-full h-full rounded-lg" style={{ minHeight: 100 }} />;
                        }
                        return <div className="flex flex-col items-center justify-center w-full h-full min-h-[100px]"><ImagePlaceholderIcon /></div>;
                      })()}
                      <div className="absolute bottom-0 left-0 w-full text-[10px] text-white text-center bg-black/50 py-1 rounded-b-lg">VR Request</div>
                    </div>
                  </div>
                </>
              ) : (
                // Full width layout when no VR is requested
                <div className="border border-dashed border-[#B0B0B0] rounded-lg bg-white flex flex-col items-center justify-center py-8 mb-2 min-h-[180px]">
                  <div className="flex flex-col items-center">
                    <div className="mb-4"><ARVRPlaceholderIcon /></div>
                    <button className="px-6 py-2 rounded text-white font-semibold bg-gradient-to-r from-[#004236] to-[#007E67] shadow mb-2" onClick={handleARVRModalOpen}>Request VR</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        {/* Delete confirmation popup */}
        {deleteTarget && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-8 min-w-[300px] flex flex-col items-center">
              <div className="text-lg font-semibold mb-4">Delete this file?</div>
              <div className="flex gap-4">
                <button onClick={confirmDelete} className="px-6 py-2 rounded text-white font-semibold bg-red-600 hover:bg-red-700">Delete</button>
                <button onClick={cancelDelete} className="px-6 py-2 rounded border border-[#007E67] text-[#007E67] font-semibold bg-white hover:bg-[#F3F3F3]">Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* AR/VR Modal */}
      {showARVRModal && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col w-full h-full max-w-full max-h-full overflow-y-auto">
          {/* Header */}
          <div className="flex items-center px-4 pt-6 pb-2 border-b border-gray-200 relative">
            <button className="absolute left-4 top-6 text-2xl text-[#888] hover:text-[#222]" onClick={handleARVRModalClose} aria-label="Close">&times;</button>
            <div className="flex-1 text-center">
              <div className="text-lg font-bold">Contact Vistaview for 3D Model</div>
              <div className="text-xs text-gray-500 mt-1">Create your property in AR/VR model with Vistaview</div>
            </div>
          </div>
          {/* Content */}
          <form onSubmit={handleARVRSubmit} className="flex-1 flex flex-col px-4 pt-4 pb-24 overflow-y-auto">
            <div className="mb-4">
              <label className="block text-xs font-semibold mb-1">Property Type</label>
              <select 
                className="w-full border border-[#E5E7EB] rounded px-2 py-2 text-sm bg-white" 
                value={arvrType} 
                onChange={e => setARVRType(e.target.value)}
                disabled={isVRModalReadOnly}
              >
                <option>{propertyInfoData?.propertyType?.name}</option>
              </select>
            </div>
            <div className="mb-4">
              <div className="mb-2 font-medium text-xs">Let's add your property photos for 3D model creations</div>
              <div className="grid grid-cols-2 gap-3">
                {ARVR_PHOTO_SLOTS.map(slot => (
                  <div
                    key={slot.key}
                    className={`relative border border-dashed border-[#B0B0B0] rounded-lg bg-[#FAFAFA] h-36 w-full transition overflow-hidden flex flex-col items-center justify-center ${!isVRModalReadOnly ? 'cursor-pointer hover:border-[#007E67]' : ''}`}
                    onClick={() => !isVRModalReadOnly && arvrPhotoInputRefs.current[slot.key]?.click()}
                  >
                    {arvrPhotos[slot.key] ? (
                      <img src={arvrPhotos[slot.key]!.url} alt={slot.label} className="absolute inset-0 w-full h-full object-cover rounded-lg" />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full w-full">
                        <ImagePlaceholderIcon />
                        <span className="text-xs text-gray-400 mt-1">{slot.label}</span>
                      </div>
                    )}
                    {!isVRModalReadOnly && (
                      <input
                        ref={el => { arvrPhotoInputRefs.current[slot.key] = el; }}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={e => handleARVRPhotoChange(e, slot.key)}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
            {arvrUploading && !isVRModalReadOnly && (
              <div className="w-full mb-2">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#004236] to-[#007E67] h-2 rounded-full transition-all duration-200"
                    style={{ width: `${arvrUploadProgress}%` }}
                  />
                </div>
                <div className="text-xs text-right mt-1 text-[#007E67]">{arvrUploadProgress}%</div>
              </div>
            )}
            <div className="my-4">
              <div className="font-semibold mb-2 text-xs">Confirm your contact details</div>
              <div className="flex items-center gap-3 bg-[#F3F4F6] rounded-lg p-3">
                <div className="w-10 h-10 rounded-full bg-[#D1FAE5] flex items-center justify-center text-lg font-bold text-[#007E67]">
                  {propertyInfoData?.agent?.username?.[0]?.toUpperCase() || 'U'}
                </div>
                <div>
                  <div className="font-semibold text-sm mb-0.5">{propertyInfoData?.agent?.username}</div>
                  <div className="flex items-center text-xs text-[#007E67] gap-1 mb-0.5"><svg width="12" height="12" fill="none" viewBox="0 0 24 24"><path d="M21 10.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h7" stroke="#007E67" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M21 10.5l-9 9-3-3" stroke="#007E67" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> {propertyInfoData?.agent?.email}</div>
                  <div className="flex items-center text-xs text-[#007E67] gap-1"><svg width="12" height="12" fill="none" viewBox="0 0 24 24"><path d="M22 16.92V19a2 2 0 0 1-2 2A19.72 19.72 0 0 1 3 5a2 2 0 0 1 2-2h2.09a2 2 0 0 1 2 1.72c.13.81.35 1.6.67 2.36a2 2 0 0 1-.45 2.11l-.27.27a16 16 0 0 0 6.29 6.29l.27-.27a2 2 0 0 1 2.11-.45c.76.32 1.55.54 2.36.67A2 2 0 0 1 22 16.92z" stroke="#007E67" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> {propertyInfoData?.agent?.mobile_number}</div>
                </div>
              </div>
            </div>
            <div className="flex-1"></div>
            {/* Sticky submit button at the bottom */}
            <div className="fixed bottom-0 left-0 w-full bg-white px-4 py-4 border-t z-50">
              {!isVRModalReadOnly ? (
                <button
                  type="submit"
                  className="w-full px-4 py-3 rounded-lg text-white font-semibold bg-gradient-to-r from-[#004236] to-[#007E67] shadow text-base"
                  disabled={arvrSubmitLoading}
                >
                  {arvrSubmitLoading ? 'Submitting...' : 'Submit request'}
                </button>
              ) : (
                <button
                  type="button"
                  className="w-full px-4 py-3 rounded-lg text-white font-semibold bg-gray-400 shadow text-base cursor-not-allowed"
                  disabled
                >
                  Already Submitted
                </button>
              )}
            </div>
          </form>
        </div>
      )}
      {/* AR/VR Success Modal */}
      {showARVRSuccess && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col w-full h-full max-w-full max-h-full">
          {/* Top bar with close and title */}
          <div className="flex items-center px-4 pt-6 pb-2 border-b border-gray-200 relative">
            <button className="absolute left-4 top-6 text-2xl text-[#888] hover:text-[#222]" onClick={handleARVRSuccessClose} aria-label="Close">&times;</button>
            <div className="flex-1 text-center text-base font-semibold">AR/VR Request</div>
          </div>
          {/* Content */}
          <div className="flex-1 flex flex-col items-center justify-center px-6">
            {/* Success SVG image */}
            <img src={successImg} alt="Success" className="w-32 h-32 mb-6 mt-8" />
            <div className="text-2xl font-bold mb-2 text-center">Thanks for the request!</div>
            <div className="text-base text-[#444] mb-8 text-center">You will be contacted for the confirmation and the site visit to confirm the 3D modelling option</div>
          </div>
          {/* Continue button at the bottom */}
          <div className="px-6 pb-8">
            <button onClick={handleARVRSuccessClose} className="w-full px-8 py-3 rounded-lg text-white font-semibold bg-gradient-to-r from-[#004236] to-[#007E67] shadow text-base">Continue</button>
          </div>
        </div>
      )}
      {/* Fixed Bottom Footer (hide in agent property details media tab or if hideFooter) */}
      {!hideDetailsAboveAccordion && !hideFooter && (
        <div className="fixed bottom-0 left-0 w-full z-30 bg-white border-t flex gap-4 px-6 py-4">
          <button 
            className="flex-1 py-3 rounded-lg font-bold text-lg border-2 border-green-900 text-green-900 bg-white"
            onClick={handleSaveDraft}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save as draft'}
          </button>
          <button 
            className="gradient-btn-equal flex-1 py-3 rounded-lg font-bold text-lg shadow-lg"
            onClick={handleNext}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

const PropertyMediaPage: React.FC<PropertyMediaPageProps> = (props) => (
  <MobilePropertyWizardProvider>
    <PropertyMediaPageInner {...props} />
    {/* @ts-ignore: PropertyMediaPageInner is not a component, so handlers must be lifted if needed */}
  </MobilePropertyWizardProvider>
);

export default PropertyMediaPage; 