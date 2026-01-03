import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ImagePlaceholderIcon, VideoPlaceholderIcon, FloorPlanPlaceholderIcon, ARVRPlaceholderIcon } from '../../../../assets/icons/MediaMainIcons';
import App from '../../../../App';
import api from '../../../../utils/api';
import { showGlobalToast } from '../../../../utils/toast';
import { useContext } from 'react';
import { ToastContext } from '../../../../App';
import successImg from '../../../../assets/images/success-img.svg';

interface MediaFile {
  id: string;
  url: string;
  type: 'photo' | 'video' | 'floorplan';
  isMain?: boolean;
  name?: string;
  size?: number;
  sort_order?: number
}

interface PropertyMediaProps {
  initialValues: any;
  step: number;
  onBack: (photos: any, videos: any, floorplans: any, arvrRequestId: any, arvrPhotos: any) => void;
  onSaveDraft: (photos: any, videos: any, floorplans: any, arvrRequestId: any, arvrPhotos: any) => void;
  onNext: (photos: any, videos: any, floorplans: any, arvrRequestId: any, arvrPhotos: any) => void;
  isPlanUpgraded?: boolean;
  isARVRRequested?: boolean;
  hideHeader?: boolean; // <-- Add this line
  hideNextButton?: boolean; // <-- Add this line
  onSaveSuccess?: () => void; // Callback after successful save
}

const getFileUrl = (file: File) => URL.createObjectURL(file);

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

function mapVRSubmittedToARVRPhotos(vrData: any, prev: { [key: string]: MediaFile | null }): { [key: string]: MediaFile | null } {
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

const PropertyMedia: React.FC<PropertyMediaProps> = ({ initialValues, step, onBack, onSaveDraft, onNext, isPlanUpgraded = true, isARVRRequested = false, hideHeader = false, hideNextButton = false, onSaveSuccess }) => {
  const { id } = useParams<{ id: string }>();
  
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
  
  // State for each section
  const [photos, setPhotos] = useState<MediaFile[]>(initialValues?.property_photos || [] );
  const [videos, setVideos] = useState<MediaFile[]>(initialValues?.property_videos || []);
  const [floorplans, setFloorplans] = useState<MediaFile[]>(initialValues?.property_floorplans || []);
  // Track original values for unsaved detection
  const [originalPhotos, setOriginalPhotos] = useState<MediaFile[]>(initialValues?.property_photos || []);
  const [originalVideos, setOriginalVideos] = useState<MediaFile[]>(initialValues?.property_videos || []);
  const [originalFloorplans, setOriginalFloorplans] = useState<MediaFile[]>(initialValues?.property_floorplans || []);
  const [savingSection, setSavingSection] = useState<'photo' | 'video' | 'floorplan' | 'vr' | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ section: string; id: string } | null>(null);
  const [showARVRModal, setShowARVRModal] = useState(false);
  const [showARVRSuccess, setShowARVRSuccess] = useState(false);
  const [arvrPhotos, setARVRPhotos] = useState<{ [key: string]: MediaFile | null }>({});
  const [arvrType, setARVRType] = useState('Villa');
  const [loading, setLoading] = useState(false);
  // Add state for VR dummy item
  const [showVRDummy, setShowVRDummy] = useState(false);
  const [isVRModalReadOnly, setIsVRModalReadOnly] = useState(false);
  // Track if VR request needs to be saved
  const [vrRequestNeedsSave, setVrRequestNeedsSave] = useState(false);


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

  // File input refs
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const floorplanInputRef = useRef<HTMLInputElement>(null);
  const arvrPhotoInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const { showToast } = useContext(ToastContext); 
  // AR/VR request id state
  const [arvrRequestId, setARVRRequestId] = useState<string | null>(null);

  // Helper to check for duplicate files
  const isDuplicate = (file: File, section: 'photo' | 'video' | 'floorplan') => {
    const list = section === 'photo' ? photos : section === 'video' ? videos : floorplans;
    return list.some(f => f.url.endsWith(file.name) || (f.name && f.name === file.name && f.size === file.size));
  };

  // Fallback to global toast if context is not available
  const showToastMessage = (message: string, duration?: number) => {
    if (showToast && typeof showToast === 'function') {
      showToast(message, duration);
    } else {
      showGlobalToast(message, duration);
    }
  };

  useEffect(() => {
    setPhotos(initialValues?.property_photos || []);
    setVideos(initialValues?.property_videos || []);
    setFloorplans(initialValues?.property_floorplans || []);
    setARVRRequestId(
      Array.isArray(initialValues?.property_virtual_tours) && initialValues.property_virtual_tours.length > 0
        ? initialValues.property_virtual_tours[0]
        : null
    );
    // Initialize showVRDummy based on existing VR request or vr_submitted data
    setShowVRDummy(
      (Array.isArray(initialValues?.property_virtual_tours) && initialValues.property_virtual_tours.length > 0) ||
      (initialValues?.vr_submitted && (
        (Array.isArray(initialValues.vr_submitted) && initialValues.vr_submitted.length > 0) ||
        (typeof initialValues.vr_submitted === 'object' && Object.keys(initialValues.vr_submitted).length > 0)
      ))
    );
    // Restore VR photos if they exist in initialValues
    if (initialValues?.vr_submitted && ((Array.isArray(initialValues.vr_submitted) && initialValues.vr_submitted.length > 0) || (typeof initialValues.vr_submitted === 'object' && Object.keys(initialValues.vr_submitted).length > 0))) {
      setARVRPhotos(prev => mapVRSubmittedToARVRPhotos(initialValues.vr_submitted, prev));
    } else if (initialValues?.arvr_photos) {
      setARVRPhotos(initialValues.arvr_photos);
    }
  }, [initialValues]);

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
        alert(`File "${file.name}" is too large. Max size is 5MB.`);
        continue;
      }
      if (isDuplicate(file, section)) {
        alert('File already exists.');
        continue;
      }
      // Upload to API
      const uploadedUrl = await uploadFileToAPI(file);
      console.log('uploadedUrl', uploadedUrl);
      if (!uploadedUrl) {
        // alert(`Failed to upload file: ${file.name}`);
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

  // Handle delete
  const handleDelete = (section: string, id: string) => {
    setDeleteTarget({ section, id });
  };
  const confirmDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.section === 'photo') {
      setPhotos(prev => {
        const filtered = prev.filter(p => p.id !== deleteTarget.id);
        // If main photo was deleted, set first as main
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

  // Set main photo
  const setMainPhoto = (id: string) => {
    setPhotos(prev => prev.map(p => ({ ...p, isMain: p.id === id })));
  };

  // Drag-and-drop upload handlers
  const handleDrop = async (e: React.DragEvent, section: 'photo' | 'video' | 'floorplan') => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (!files.length) return;
    let acceptedFiles: File[] = [];
    if (section === 'photo' || section === 'floorplan') {
      acceptedFiles = files.filter(f => f.type.startsWith('image/'));
    } else if (section === 'video') {
      acceptedFiles = files.filter(f => f.type.startsWith('video/'));
    }
    if (!acceptedFiles.length) return;
    let added = false;
    const arr: MediaFile[] = [];
    setUploadingSections(prev => ({ ...prev, [section]: true }));
    setUploadProgress(prev => ({ ...prev, [section]: 0 }));
    const total = acceptedFiles.length;
    let uploaded = 0;
    for (const file of acceptedFiles) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert(`File "${file.name}" is too large. Max size is 5MB.`);
        continue;
      }
      if (isDuplicate(file, section)) {
        alert('File already exists.');
        continue;
      }
      // Upload to API
      const uploadedUrl = await uploadFileToAPI(file);
      if (!uploadedUrl) {
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
  };

  // Drag and drop reordering (grid only)
  const onDragStart = (e: React.DragEvent, idx: number, section: string) => {
    e.dataTransfer.setData('drag-idx', idx.toString());
    e.dataTransfer.setData('drag-section', section);
  };
  const onDropGrid = (e: React.DragEvent, idx: number, section: string) => {
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

  // Render file grid in rows of 4, pixel-perfect
  const renderFileGrid = (files: MediaFile[], section: 'photo' | 'video' | 'floorplan') => {
    const itemsPerRow = 4;
    const rows = [];
    for (let i = 0; i < files.length; i += itemsPerRow) {
      rows.push(files.slice(i, i + itemsPerRow));
    }
    return (
      <div className="flex flex-col gap-2 mt-0">
        {rows.map((row, rowIdx) => (
          <div key={rowIdx} className="flex flex-row gap-2">
            {row.map((file, idx) => (
              <div
                key={file.id}
                className="relative group border border-[#E5E7EB] rounded-xl bg-white"
                style={{ width: 260, height: 180, cursor: section !== 'floorplan' ? 'grab' : 'default', boxShadow: 'none' }}
                draggable={section !== 'floorplan'}
                onDragStart={e => section !== 'floorplan' && onDragStart(e, rowIdx * itemsPerRow + idx, section)}
                onDrop={e => section !== 'floorplan' && onDropGrid(e, rowIdx * itemsPerRow + idx, section)}
                onDragOver={e => section !== 'floorplan' && e.preventDefault()}
              >
                {section === 'photo' && file.isMain && (
                  <div className="absolute top-0 left-0 w-full px-2 py-1 bg-[#007E67]/80 text-white text-xs rounded-t-xl z-10" style={{borderTopLeftRadius: '12px', borderTopRightRadius: '12px'}}>Main photo</div>
                )}
                {section === 'photo' && !file.isMain && (
                  <button
                    className="absolute top-2 left-2 bg-white/90 text-[#007E67] text-xs px-2 py-1 rounded border border-[#007E67] z-10 hover:bg-[#F3F3F3]"
                    onClick={() => setMainPhoto(file.id)}
                    type="button"
                  >Set as main</button>
                )}
                <button
                  className="absolute top-2 right-2 bg-white/90 text-[#222] rounded-full w-6 h-6 flex items-center justify-center z-10 shadow-sm hover:bg-white hover:text-red-600 hover:shadow-md transition"
                  style={{ opacity: 0.85, border: '1px solid #E5E7EB' }}
                  onClick={() => handleDelete(section, file.id)}
                  type="button"
                >
                  ×
                </button>
                {section === 'photo' || section === 'floorplan' ? (
                  <img src={file.url} alt="media" className="object-cover w-full h-full rounded-xl" />
                ) : (
                  <video src={file.url} className="object-cover w-full h-full rounded-xl" controls />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  // AR/VR modal handlers
  const handleARVRPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>, slotKey: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert(`File "${file.name}" is too large. Max size is 5MB.`);
      return;
    }
    setARVRUploading(true);
    setARVRUploadProgress(0);
    // Simulate progress (since fetch doesn't support progress natively)
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += 10;
      setARVRUploadProgress(Math.min(progress, 90));
    }, 100);
    // Upload to API
    const uploadedUrl = await uploadFileToAPI(file);
    clearInterval(progressInterval);
    setARVRUploadProgress(100);
    setTimeout(() => {
      setARVRUploading(false);
      setARVRUploadProgress(0);
    }, 500);
    if (!uploadedUrl) {
      return;
    }
    setARVRPhotos(prev => ({ ...prev, [slotKey]: {
      id: `arvr-${slotKey}-${Date.now()}`,
      url: uploadedUrl,
      type: 'photo',
      name: file.name,
      size: file.size,
    }}));
    e.target.value = '';
  };
  const handleARVRModalClose = () => {
    setShowARVRModal(false);
    setIsVRModalReadOnly(false);
  };
  const handleARVRModalOpen = () => setShowARVRModal(true);
  
  // New handler for opening VR modal in read-only mode
  const handleVRDummyClick = () => {
    setIsVRModalReadOnly(true);
    setShowARVRModal(true);
  };
  
  const handleARVRSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validate all slots have an uploaded image
    const missing = ARVR_PHOTO_SLOTS.filter(slot => !arvrPhotos[slot.key]);
    if (missing.length > 0) {
      showToastMessage('Please upload all required AR/VR images.');
      return;
    }
    setARVRSubmitLoading(true);
    // Prepare request data
    const payload: any = {
      front_view: arvrPhotos['front']?.url,
      back_view: arvrPhotos['back']?.url,
      left_side_view: arvrPhotos['left']?.url,
      right_side_view: arvrPhotos['right']?.url,
      back_corner: arvrPhotos['backcorner']?.url,
      front_corner: arvrPhotos['frontcorner']?.url,
      status: 'requested',
    };
    try {
      const response = await api.post('/agent/virtual-tour-request/', payload);
      // Extract the VR request ID from the response
      const vrRequestId = response?.data?.data?.id || response?.data?.data?.vr_id || response?.data?.data?.request_id;
      if (vrRequestId) {
        setARVRRequestId(vrRequestId);
        setVrRequestNeedsSave(true); // Mark that VR request needs to be saved
        setShowARVRModal(false);
        setShowARVRSuccess(true);
        // Show VR dummy after successful request and hide the request button
        setShowVRDummy(true);
      }
    } catch (err) {
      showToastMessage('Failed to submit AR/VR request.');
      setARVRSubmitLoading(false);
    } finally {
      setARVRSubmitLoading(false);
    }
  };
  const handleARVRSuccessClose = () => setShowARVRSuccess(false);

  // Add a helper to check if vr_submitted is a non-empty object
  const hasVRSubmitted = initialValues?.vr_submitted && typeof initialValues.vr_submitted === 'object' && Object.keys(initialValues.vr_submitted).length > 0;
  
  // Debug logging for VR card visibility
  console.log('PropertyMedia Debug:');
  console.log('  initialValues.vr_submitted:', initialValues?.vr_submitted);
  console.log('  hasVRSubmitted:', hasVRSubmitted);
  console.log('  showVRDummy:', showVRDummy);
  console.log('  condition result (hasVRSubmitted || showVRDummy):', hasVRSubmitted || showVRDummy);
  console.log('  Object.keys(initialValues.vr_submitted):', initialValues?.vr_submitted ? Object.keys(initialValues.vr_submitted) : 'no vr_submitted');
  

  // Detect unsaved changes for each section
  const photosChanged = JSON.stringify(photos) !== JSON.stringify(originalPhotos);
  const videosChanged = JSON.stringify(videos) !== JSON.stringify(originalVideos);
  const floorplansChanged = JSON.stringify(floorplans) !== JSON.stringify(originalFloorplans);

  // Save handler for each section
  const handleSaveSection = async (section: 'photo' | 'video' | 'floorplan') => {
    setSavingSection(section);
    let updateKey = '';
    let updateValue: any = undefined;
    if (section === 'photo') {
      updateKey = 'property_photos';
      // Convert isMain back to main_photo for API
      updateValue = convertPhotosForAPI(photos);
    } else if (section === 'video') {
      updateKey = 'property_videos';
      updateValue = videos;
    } else if (section === 'floorplan') {
      updateKey = 'property_floorplans';
      updateValue = floorplans;
    }
    if (updateKey && initialValues?.property_id) {
      try {
        await api.patch(`/agent/properties/${initialValues.property_id}/`, {
          [updateKey]: updateValue,
        });
        // Update original state
        if (section === 'photo') setOriginalPhotos(photos);
        if (section === 'video') setOriginalVideos(videos);
        if (section === 'floorplan') setOriginalFloorplans(floorplans);
        // Notify parent component of successful save
        if (onSaveSuccess) {
          onSaveSuccess();
        }
        // Optionally, show a toast or feedback
      } catch (e) {
        // Optionally, show error feedback
      }
    }
    setSavingSection(null);
  };

  // Save handler for VR request
  const handleSaveVRRequest = async () => {
    if (!initialValues?.property_id || !arvrRequestId) return;
    setSavingSection('vr');
    try {
      await api.patch(`/agent/properties/${initialValues.property_id}/`, {
        vr_request_id: arvrRequestId,
      });
      setVrRequestNeedsSave(false);
      // Optionally, show a toast or feedback
    } catch (e) {
      // Optionally, show error feedback
    }
    setSavingSection(null);
  };

  return (
    <div className="w-full mx-auto px-2 md:px-4 xl:px-12 relative">
      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="w-16 h-16 border-4 border-green-200 border-t-green-700 rounded-full animate-spin" />
        </div>
      )}
      {!hideHeader && (
        <>
          <div className="text-2xl font-semibold mb-1 mt-2">Add your property photos, videos and others</div>
          <div className="text-base text-[#222] mb-0">{initialValues?.address}, {initialValues?.city_detail?.name}, {initialValues?.state_detail?.name}, {initialValues?.country_detail?.name}, {initialValues?.postalCode}</div>
          <div className="text-base text-[#222] mb-4">Property type : <span className="font-bold">{initialValues?.propertyType?.name}</span></div>
        </>
      )}
      {/* Photos Section */}
      <div className="mb-8">
        <div className="text-lg font-bold mb-1">Photos</div>
        <div className="text-sm text-[#444] mb-2">Drag and drop to reorder. Click on a photo to add a caption or delete a photo.</div>
        {uploadingSections['photo'] && (
          <div className="w-full mb-2">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#004236] to-[#007E67] h-2 rounded-full transition-all duration-200"
                style={{ width: `${uploadProgress['photo'] || 0}%` }}
              />
            </div>
            <div className="text-xs text-right mt-1 text-[#007E67]">{uploadProgress['photo'] || 0}%</div>
          </div>
        )}
        {photos.length === 0 ? (
          <div
            className="w-full mb-2"
          >
            <div
              className="border border-dashed border-[#B0B0B0] rounded-xl bg-white flex flex-col items-center justify-center py-12 px-6 w-full"
              onDragOver={e => { e.preventDefault(); }}
              onDrop={e => handleDrop(e, 'photo')}
            >
              <div className="mb-2"><ImagePlaceholderIcon /></div>
              <div className="text-[#888] mb-4">Drag and drop photos here to upload</div>
              <button
                className="px-6 py-2 rounded text-white font-semibold bg-gradient-to-r from-[#004236] to-[#007E67] shadow mb-2"
                onClick={() => photoInputRef.current?.click()}
                type="button"
              >Add New Photo</button>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={e => handleAddFiles(e, 'photo')}
              />
            </div>
            <div className="flex-1 flex items-start"><div className="border border-[#E5E7EB] rounded-xl bg-white p-2">{renderFileGrid(photos, 'photo')}</div></div>
          </div>
        ) : (
          <div
            className="flex flex-row items-start gap-4 mb-2"
          >
            <div
              className="border border-dashed border-[#B0B0B0] rounded-xl bg-white flex flex-col items-center justify-center py-12 px-6 min-w-[320px] max-w-[400px] w-full"
              onDragOver={e => { e.preventDefault(); }}
              onDrop={e => handleDrop(e, 'photo')}
            >
              <div className="mb-2"><ImagePlaceholderIcon /></div>
              <div className="text-[#888] mb-4">Drag and drop photos here to upload</div>
              <button
                className="px-6 py-2 rounded text-white font-semibold bg-gradient-to-r from-[#004236] to-[#007E67] shadow mb-2"
                onClick={() => photoInputRef.current?.click()}
                type="button"
              >Add New Photo</button>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={e => handleAddFiles(e, 'photo')}
              />
            </div>
            <div className="flex-1 flex items-start"><div className="border border-[#E5E7EB] rounded-xl bg-white p-2">{renderFileGrid(photos, 'photo')}</div></div>
          </div>
        )}
        {/* Save button for photos */}
        {hideHeader && hideNextButton && photosChanged && (
          <div className="flex justify-end mt-2">
            <button
              className="px-6 py-2 rounded text-white font-semibold bg-gradient-to-r from-[#004236] to-[#007E67] shadow hover:opacity-90"
              onClick={() => handleSaveSection('photo')}
              disabled={savingSection === 'photo'}
            >
              {savingSection === 'photo' ? 'Saving...' : 'Save'}
            </button>
          </div>
        )}
      </div>
      {/* Videos Section */}
      <div className="mb-8">
        <div className="text-lg font-bold mb-1">Videos</div>
        <div className="text-sm text-[#444] mb-2">Drag and drop to reorder. Click on a video to add a caption or delete a photo.</div>
        {uploadingSections['video'] && (
          <div className="w-full mb-2">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#004236] to-[#007E67] h-2 rounded-full transition-all duration-200"
                style={{ width: `${uploadProgress['video'] || 0}%` }}
              />
            </div>
            <div className="text-xs text-right mt-1 text-[#007E67]">{uploadProgress['video'] || 0}%</div>
          </div>
        )}
        {videos.length === 0 ? (
          <div
            className="w-full mb-2"
          >
            <div
              className="border border-dashed border-[#B0B0B0] rounded-xl bg-white flex flex-col items-center justify-center py-12 px-6 w-full"
              onDragOver={e => { e.preventDefault(); }}
              onDrop={e => handleDrop(e, 'video')}
            >
              <div className="mb-2"><VideoPlaceholderIcon /></div>
              <div className="text-[#888] mb-4">Drag and drop videos here to upload</div>
              <button
                className="px-6 py-2 rounded text-white font-semibold bg-gradient-to-r from-[#004236] to-[#007E67] shadow mb-2"
                onClick={() => videoInputRef.current?.click()}
                type="button"
              >Add New Video</button>
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                multiple
                className="hidden"
                onChange={e => handleAddFiles(e, 'video')}
              />
            </div>
            <div className="flex-1 flex items-start"><div className="border border-[#E5E7EB] rounded-xl bg-white p-2">{renderFileGrid(videos, 'video')}</div></div>
          </div>
        ) : (
          <div
            className="flex flex-row items-start gap-4 mb-2"
          >
            <div
              className="border border-dashed border-[#B0B0B0] rounded-xl bg-white flex flex-col items-center justify-center py-12 px-6 min-w-[320px] max-w-[400px] w-full"
              onDragOver={e => { e.preventDefault(); }}
              onDrop={e => handleDrop(e, 'video')}
            >
              <div className="mb-2"><VideoPlaceholderIcon /></div>
              <div className="text-[#888] mb-4">Drag and drop videos here to upload</div>
              <button
                className="px-6 py-2 rounded text-white font-semibold bg-gradient-to-r from-[#004236] to-[#007E67] shadow mb-2"
                onClick={() => videoInputRef.current?.click()}
                type="button"
              >Add New Video</button>
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                multiple
                className="hidden"
                onChange={e => handleAddFiles(e, 'video')}
              />
            </div>
            <div className="flex-1 flex items-start"><div className="border border-[#E5E7EB] rounded-xl bg-white p-2">{renderFileGrid(videos, 'video')}</div></div>
          </div>
        )}
        {/* Save button for videos */}
        {hideHeader && hideNextButton && videosChanged && (
          <div className="flex justify-end mt-2">
            <button
              className="px-6 py-2 rounded text-white font-semibold bg-gradient-to-r from-[#004236] to-[#007E67] shadow hover:opacity-90"
              onClick={() => handleSaveSection('video')}
              disabled={savingSection === 'video'}
            >
              {savingSection === 'video' ? 'Saving...' : 'Save'}
            </button>
          </div>
        )}
      </div>
      {/* Floorplan Section */}
      <div className="mb-8">
        <div className="text-lg font-bold mb-1">Floorplan</div>
        <div className="text-sm text-[#444] mb-2">Upload your floor plan as jpeg or png</div>
        {uploadingSections['floorplan'] && (
          <div className="w-full mb-2">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#004236] to-[#007E67] h-2 rounded-full transition-all duration-200"
                style={{ width: `${uploadProgress['floorplan'] || 0}%` }}
              />
            </div>
            <div className="text-xs text-right mt-1 text-[#007E67]">{uploadProgress['floorplan'] || 0}%</div>
          </div>
        )}
        {floorplans && floorplans.length === 0 ? (
          <div
            className="w-full mb-2"
          >
            <div
              className="border border-dashed border-[#B0B0B0] rounded-xl bg-white flex flex-col items-center justify-center py-12 px-6 w-full"
              onDragOver={e => { e.preventDefault(); }}
              onDrop={e => handleDrop(e, 'floorplan')}
            >
              <div className="mb-2"><FloorPlanPlaceholderIcon /></div>
              <div className="text-[#888] mb-4">Drag and drop floorplan here to upload</div>
              <button
                className="px-6 py-2 rounded text-white font-semibold bg-gradient-to-r from-[#004236] to-[#007E67] shadow mb-2"
                onClick={() => floorplanInputRef.current?.click()}
                type="button"
              >Add Floorplan</button>
              <input
                ref={floorplanInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={e => handleAddFiles(e, 'floorplan')}
              />
            </div>
            <div className="flex-1 flex items-start"><div className="border border-[#E5E7EB] rounded-xl bg-white p-2">{renderFileGrid(floorplans, 'floorplan')}</div></div>
          </div>
        ) : (
          <div
            className="flex flex-row items-start gap-4 mb-2"
          >
            <div
              className="border border-dashed border-[#B0B0B0] rounded-xl bg-white flex flex-col items-center justify-center py-12 px-6 min-w-[320px] max-w-[400px] w-full"
              onDragOver={e => { e.preventDefault(); }}
              onDrop={e => handleDrop(e, 'floorplan')}
            >
              <div className="mb-2"><FloorPlanPlaceholderIcon /></div>
              <div className="text-[#888] mb-4">Drag and drop floorplan here to upload</div>
              <button
                className="px-6 py-2 rounded text-white font-semibold bg-gradient-to-r from-[#004236] to-[#007E67] shadow mb-2"
                onClick={() => floorplanInputRef.current?.click()}
                type="button"
              >Add Floorplan</button>
              <input
                ref={floorplanInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={e => handleAddFiles(e, 'floorplan')}
              />
            </div>
            <div className="flex-1 flex items-start"><div className="border border-[#E5E7EB] rounded-xl bg-white p-2">{renderFileGrid(floorplans, 'floorplan')}</div></div>
          </div>
        )}
        {/* Save button for floorplans */}
        {hideHeader && hideNextButton && floorplansChanged && (
          <div className="flex justify-end mt-2">
            <button
              className="px-6 py-2 rounded text-white font-semibold bg-gradient-to-r from-[#004236] to-[#007E67] shadow hover:opacity-90"
              onClick={() => handleSaveSection('floorplan')}
              disabled={savingSection === 'floorplan'}
            >
              {savingSection === 'floorplan' ? 'Saving...' : 'Save'}
            </button>
          </div>
        )}
      </div>
            {/* Virtual Tour Section */}
      <div className="mb-8">
        <div className="text-lg font-bold mb-1">Virtual Tour</div>
        <div className="text-sm text-[#444] mb-2">You can add AR/VR Model to this property or edit existing tours by going to My AR/VR Homes.</div>
        {(hasVRSubmitted || showVRDummy) ? (
          <div className="flex flex-row items-start gap-4 mb-2">
            <div
              className="border border-dashed border-[#B0B0B0] rounded-xl bg-white flex flex-col items-center justify-center py-12 px-6 min-w-[320px] max-w-[400px] w-full"
            >
              <div className="mb-4"><ARVRPlaceholderIcon /></div>
              <div className="text-center text-[#222] mt-2">
                Our Vistaview team is working on your property in 3D Model<br/>
                <span className="text-[#007E67] text-sm">Please be patient, once done you will be get notified</span>
              </div>
            </div>
            <div className="flex-1 flex items-start">
              <div className="border border-[#E5E7EB] rounded-xl bg-white p-2 w-full">
                {/* Right side - VR card as grid item */}
                <div className="flex flex-col gap-2 mt-0">
                  <div className="flex flex-row gap-2">
                    <div
                      className="relative group border border-[#E5E7EB] rounded-xl bg-white cursor-pointer"
                      style={{ width: 260, height: 180, boxShadow: 'none' }}
                      onClick={() => {
                        setIsVRModalReadOnly(true);
                        setShowARVRModal(true);
                        // Use vr_submitted data if available, otherwise use current arvrPhotos
                        const vrData = initialValues?.vr_submitted || {};
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
                          return <img src={frontImg} alt="Front view" className="object-cover w-full h-full rounded-xl" style={{ minHeight: 100 }} />;
                        }
                        return <div className="absolute inset-0 flex items-center justify-center"><ARVRPlaceholderIcon /></div>;
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
            <div
              className="border border-dashed border-[#B0B0B0] rounded-xl bg-white flex flex-col items-center justify-center py-12 px-6 w-full"
            >
              <div className="mb-4"><ARVRPlaceholderIcon /></div>
              {isPlanUpgraded ? (
                <button className="px-6 py-2 rounded text-white font-semibold bg-gradient-to-r from-[#004236] to-[#007E67] shadow mb-2" onClick={handleARVRModalOpen}>Request</button>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="text-[#007E67] font-semibold mb-4 text-center">To avail this option you need to upgrade your plan to Premium</div>
                  <button className="px-6 py-2 rounded text-white font-semibold bg-gradient-to-r from-[#004236] to-[#007E67] shadow">Upgrade plan</button>
                </div>
              )}
            </div>
          </div>
        )}
        {/* Save button for VR request */}
        {hideHeader && hideNextButton && vrRequestNeedsSave && (
          <div className="flex justify-end mt-2">
            <button
              className="px-6 py-2 rounded text-white font-semibold bg-gradient-to-r from-[#004236] to-[#007E67] shadow hover:opacity-90"
              onClick={handleSaveVRRequest}
              disabled={savingSection === 'vr'}
            >
              {savingSection === 'vr' ? 'Saving...' : 'Save'}
            </button>
          </div>
        )}
      </div>
      {/* AR/VR Modal */}
      {showARVRModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 md:px-8 w-full max-w-sm relative overflow-y-auto max-h-[95vh]">
            <button className="absolute top-2 right-2 text-xl text-[#888] hover:text-[#222]" onClick={handleARVRModalClose}>&times;</button>
            <form onSubmit={handleARVRSubmit}>
              <div className="text-lg font-bold mb-1">
                {isVRModalReadOnly ? 'VR Request Details' : 'Contact Vistaview for AR/VR Model'}
              </div>
              <div className="text-xs mb-2">
                {isVRModalReadOnly ? 'View your submitted VR request details' : 'Create your property in AR/VR model with Vistaview'}
              </div>
              <div className="mb-2">
                <label className="block text-xs font-semibold mb-1">Property Type</label>
                <select 
                  className="w-full border border-[#E5E7EB] rounded px-2 py-1 text-xs" 
                  value={arvrType} 
                  onChange={e => setARVRType(e.target.value)}
                  disabled={isVRModalReadOnly}
                >
                  <option>{initialValues?.propertyType?.name}</option>
                </select>
              </div>
              <div className="mb-3">
                <div className="mb-1 font-medium text-xs">
                  {isVRModalReadOnly ? 'Submitted property photos for 3D model creation' : 'Let\'s add your property photos for 3D model creations'}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {ARVR_PHOTO_SLOTS.map(slot => (
                    <div
                      key={slot.key}
                      className={`relative border border-dashed border-[#B0B0B0] rounded-lg bg-[#FAFAFA] h-32 w-full transition overflow-hidden ${
                        !isVRModalReadOnly ? 'cursor-pointer hover:border-[#007E67]' : ''
                      }`}
                      onClick={() => !isVRModalReadOnly && arvrPhotoInputRefs.current[slot.key]?.click()}
                    >
                      {arvrPhotos[slot.key] ? (
                        <img src={arvrPhotos[slot.key]!.url} alt={slot.label} className="absolute inset-0 w-full h-full object-cover rounded-lg" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center w-full h-full"><ImagePlaceholderIcon /></div>
                      )}
                      <div className="absolute bottom-0 left-0 w-full text-[11px] text-white text-center bg-black/50 py-1 rounded-b-lg">{slot.label}</div>
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
                <div className="flex items-center gap-2">
                  <div>
                    {initialValues?.agent && (
                      <div className="mb-3 flex items-center gap-3">
                        {/* Agent profile photo or initial */}
                        {initialValues.agent.profile_photo_url ? (
                          <img
                            src={initialValues.agent.profile_photo_url}
                            alt="Agent Profile"
                            className="w-10 h-10 rounded-full object-cover border border-[#E5E7EB]"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-[#D1FAE5] flex items-center justify-center text-lg font-bold text-[#007E67]">
                            {initialValues.agent.username?.[0]?.toUpperCase() || 'U'}
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-xs mb-0.5">{initialValues.agent.username}</div>
                          <div className="flex items-center text-[10px] text-[#007E67] gap-1 mb-0.5"><svg width="12" height="12" fill="none" viewBox="0 0 24 24"><path d="M21 10.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h7" stroke="#007E67" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M21 10.5l-9 9-3-3" stroke="#007E67" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> {initialValues.agent.email || 'N/A'}</div>
                          <div className="flex items-center text-[10px] text-[#007E67] gap-1"><svg width="12" height="12" fill="none" viewBox="0 0 24 24"><path d="M22 16.92V19a2 2 0 0 1-2 2A19.72 19.72 0 0 1 3 5a2 2 0 0 1 2-2h2.09a2 2 0 0 1 2 1.72c.13.81.35 1.6.67 2.36a2 2 0 0 1-.45 2.11l-.27.27a16 16 0 0 0 6.29 6.29l.27-.27a2 2 0 0 1 2.11-.45c.76.32 1.55.54 2.36.67A2 2 0 0 1 22 16.92z" stroke="#007E67" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> {initialValues.agent.mobile_number || initialValues.agent.phone || 'N/A'}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {!isVRModalReadOnly && (
                <button
                  type="submit"
                  className="w-full px-4 py-2 rounded text-white font-semibold bg-gradient-to-r from-[#004236] to-[#007E67] shadow text-sm"
                  disabled={arvrSubmitLoading}
                >
                  {arvrSubmitLoading ? 'Submitting...' : 'Submit'}
                </button>
              )}
              {isVRModalReadOnly && (
                <button
                  type="button"
                  className="w-full px-4 py-2 rounded text-white font-semibold bg-gray-400 shadow text-sm cursor-not-allowed"
                  disabled
                >
                  Already Submitted
                </button>
              )}
            </form>
          </div>
        </div>
      )}
      {/* AR/VR Success Modal */}
      {showARVRSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 md:px-12 w-full max-w-md flex flex-col items-center">
            <img src={successImg} alt="Success" className="w-40 h-40 mb-4" />
            <div className="text-2xl font-bold mb-2 text-center">Thanks for the request!</div>
            <div className="text-base text-[#444] mb-8 text-center">You will be contacted for the confirmation and the site visit to confirm the AR/VR modelling option</div>
            <button onClick={handleARVRSuccessClose} className="w-full px-8 py-3 rounded text-white font-semibold bg-gradient-to-r from-[#004236] to-[#007E67] shadow text-base">Continue</button>
          </div>
        </div>
      )}
      {/* Footer Buttons */}
      <div className="flex justify-end gap-4 mt-8 mb-8">
        {!id && (
          <button
            onClick={async () => {
              setLoading(true);
              await onSaveDraft(convertPhotosForAPI(photos), videos, floorplans, arvrRequestId, arvrPhotos);
              setLoading(false);
            }}
            className="px-6 py-2 border border-[#007E67] rounded text-[#007E67] font-semibold bg-white hover:bg-[#F3F3F3] disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save as draft'}
          </button>
        )}
        {!hideNextButton && (
          <button
            onClick={() => onNext(convertPhotosForAPI(photos), videos, floorplans, arvrRequestId, arvrPhotos)}
            className="px-6 py-2 rounded text-white font-semibold bg-gradient-to-r from-[#004236] to-[#007E67] shadow hover:opacity-90"
          >
            Next
          </button>
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
  );
};

export default PropertyMedia; 