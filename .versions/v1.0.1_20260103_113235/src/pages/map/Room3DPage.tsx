import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Viewer from './3DRooms';
import virtualTourIcon from '../../assets/images/v3/green-virtual-tour.png';
import propertyVisitIcon from '../../assets/images/v3/green-property-visit.png';
import floorPlanIcon from '../../assets/images/v3/green-floor-plan.png';
import roomsIcon from '../../assets/images/v3/rooms-icon.png';
import BHVariant1 from '../../assets/BH_variant_1.glb';
import BHVariant2 from '../../assets/BH_variant_2.glb';
import BHVariant3 from '../../assets/BH_variant_3.glb';
import BHVariant4 from '../../assets/BH_variant_4.glb';
import BHVariant5 from '../../assets/BH_variant_5.glb';
import BlueHorizon from '../../assets/BlueHorizon.glb';
import livingHallIcon from '../../assets/images/v3/living-hall.png';
import bedRoomIcon from '../../assets/images/v3/bed-room.png';
import garageIcon from '../../assets/images/v3/garage.png';
import kitchenIcon from '../../assets/images/v3/kitchen.png';
import ImageGalleryModal from '../../components/ImageGalleryModal';
import api from '../../utils/api';

interface Property {
  property_id: string;
  name: string;
  mainphoto_url: string;
  selling_price: string | number;
  bedrooms: number;
  bathrooms: number;
  sqft: string | number | null;
  address: string;
  // Add any other property fields you need
}

interface NavItemProps {
    icon: string;
    label: string;
    onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, onClick }) => (
    <button 
        onClick={onClick}
        className="flex flex-col items-center justify-center px-2"
    >
        <img src={icon} alt={label} className="w-8 h-8 mb-1 rounded-lg" />
        <span className="text-xs text-white">{label}</span>
    </button>
);

const variants = {
    0: BlueHorizon,
    1: BHVariant1,
    2: BHVariant2,
    3: BHVariant3,
    4: BHVariant4,
    5: BHVariant5,
};

const Room3DPage: React.FC = () => {
    const { propertyId } = useParams();
    const navigate = useNavigate();
    const [currentVariant, setCurrentVariant] = useState<string>(BlueHorizon);
    const [showGalleryModal, setShowGalleryModal] = useState(false);
    const [galleryImages, setGalleryImages] = useState<{ url: string; caption?: string }[]>([]);
    const [galleryLoading, setGalleryLoading] = useState(false);
    const [galleryError, setGalleryError] = useState<string | null>(null);
    const [currentMediaType, setCurrentMediaType] = useState<'photos' | 'videos' | 'floorplans' | 'vtour'>('floorplans');
    const mediaCache = useRef<{ [key: string]: { url: string; caption?: string }[] }>({});

    const fetchMedia = async (mediaType: 'photos' | 'videos' | 'floorplans' | 'vtour') => {
        if (!propertyId) return;
        setGalleryLoading(true);
        setGalleryError(null);
        setCurrentMediaType(mediaType);
        
        // Use cache if available
        if (mediaCache.current[mediaType]) {
            setGalleryImages(mediaCache.current[mediaType]);
            setGalleryLoading(false);
            return;
        }

        try {
            const res = await api.post('/buyer/property/media/', {
                property_id: propertyId,
                media_type: mediaType,
            });
            const results = res.data?.results || [];
            const mapped = results.map((item: any) => ({ url: item.url, caption: item.caption }));
            mediaCache.current[mediaType] = mapped;
            setGalleryImages(mapped);
            setGalleryLoading(false);
        } catch (e: any) {
            setGalleryError(e?.response?.data?.message || 'Failed to load media');
            setGalleryLoading(false);
        }
    };

    const handleFloorPlanClick = () => {
        setShowGalleryModal(true);
        fetchMedia('floorplans');
    };

    const handleRequestMediaType = (mediaType: 'photos' | 'videos' | 'floorplans' | 'vtour') => {
        fetchMedia(mediaType);
    };

    const handleVariantChange = (variantNumber: number) => {
        setCurrentVariant(variants[variantNumber as keyof typeof variants]);
    };

    const [property, setProperty] = useState<Property | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPropertyDetails = async () => {
            try {
                if (!propertyId) {
                    throw new Error('Property ID is required');
                }

                const response = await api.get(`/buyer/properties/${propertyId}/`);
                const propertyData = response.data?.data || response.data;
                setProperty({
                    property_id: propertyData.id || propertyData.property_id,
                    name: propertyData.name,
                    mainphoto_url: propertyData.mainphoto_url || (propertyData.photos?.results?.[0]?.url || ''),
                    selling_price: propertyData.selling_price,
                    bedrooms: propertyData.bedrooms,
                    bathrooms: propertyData.full_bathrooms + (propertyData.half_bathrooms || 0),
                    sqft: propertyData.total_sqft,
                    address: propertyData.address
                });
            } catch (err) {
                console.error('Error fetching property details:', err);
                setError(err instanceof Error ? err.message : 'Failed to fetch property details');
            } finally {
                setLoading(false);
            }
        };

        fetchPropertyDetails();
    }, [propertyId]);

    const handlePropertyDetails = () => {
        if (propertyId) {
            navigate(`/property/${propertyId}`);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#004236]">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#F5EC9B]"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#004236] text-[#F5EC9B] p-8">
                <h2 className="text-2xl mb-4">Error</h2>
                <p className="mb-8">{error}</p>
                <button
                    onClick={() => navigate(-1)}
                    className="px-6 py-3 rounded-lg bg-[#F5EC9B] text-[#004236] hover:opacity-90 transition-opacity"
                >
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="relative h-screen">
            {/* Property Name Header */}
            <div className="absolute top-0 left-0 right-0 z-10 bg-[#004236]/80 p-4">
                <h1 className="text-xl font-semibold text-center font-['DM Serif Display'] bg-gradient-to-r from-[#905E26] via-[#F5EC9B] to-[#905E26] bg-clip-text text-transparent">
                    {property?.name}
                </h1>
            </div>

            <div className="h-full">
                <Viewer modelPath={currentVariant} />
            </div>
            
            {/* Bottom Navigation */}
            <div className="fixed bottom-0 left-0 right-0 bg-transparent z-50">
                <div 
                    className="flex justify-center items-center overflow-x-auto py-3 px-4 gap-2"
                    style={{
                        boxShadow: '10px -10px 50px 0px #0000000D',
                        background: '#00423633',
                        backdropFilter: 'blur(8px)',
                        WebkitBackdropFilter: 'blur(8px)'
                    }}
                >
                    <NavItem icon={virtualTourIcon} label="Virtual Tour" />
                    <NavItem 
                        icon={propertyVisitIcon} 
                        label="Property Details" 
                        onClick={handlePropertyDetails}
                    />
                    <NavItem 
                        icon={floorPlanIcon} 
                        label="Floor Plan" 
                        onClick={handleFloorPlanClick}
                    />
                    <NavItem 
                        icon={roomsIcon} 
                        label="Default" 
                        onClick={() => handleVariantChange(0)}
                    />
                    <NavItem 
                        icon={roomsIcon} 
                        label="Variant 1" 
                        onClick={() => handleVariantChange(1)}
                    />
                    <NavItem 
                        icon={roomsIcon} 
                        label="Variant 2" 
                        onClick={() => handleVariantChange(2)}
                    />
                    <NavItem 
                        icon={roomsIcon} 
                        label="Variant 3" 
                        onClick={() => handleVariantChange(3)}
                    />
                    <NavItem 
                        icon={roomsIcon} 
                        label="Variant 4" 
                        onClick={() => handleVariantChange(4)}
                    />
                    <NavItem 
                        icon={roomsIcon} 
                        label="Variant 5" 
                        onClick={() => handleVariantChange(5)}
                    />
                </div>
            </div>

            {/* Image Gallery Modal */}
            <ImageGalleryModal
                images={galleryImages}
                open={showGalleryModal}
                onClose={() => setShowGalleryModal(false)}
                initialIndex={0}
                onRequestMediaType={handleRequestMediaType}
                currentMediaType={currentMediaType}
                loading={galleryLoading}
            >
                {galleryLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
                        <div className="text-white text-lg">Loading media...</div>
                    </div>
                )}
                {galleryError && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
                        <div className="text-red-400 text-lg">{galleryError}</div>
                    </div>
                )}
                {!galleryLoading && !galleryError && galleryImages.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white z-50">
                        <div className="text-gray-400 text-lg font-semibold">
                            No floor plans available
                        </div>
                    </div>
                )}
            </ImageGalleryModal>
        </div>
    );
};

export default Room3DPage; 