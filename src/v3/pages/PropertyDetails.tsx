import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, User, CheckCircle } from 'phosphor-react';
import { useFloatingAskBar } from '../../contexts/FloatingAskBarContext';
import sampleImg from '../../assets/images/sample.png';
import pdGridCenter from '../../assets/images/v3.2/pd-grid-center.png';
import heroCenterIcon from '../../assets/images/v3.2/pp-hero-center.png';
import iconVrTour from '../../assets/images/v3.2/pp-vrtour.png';
import iconPhotos from '../../assets/images/v3.2/pp-photos.png';
import iconVideos from '../../assets/images/v3.2/pp-videos.png';
import iconFloorplan from '../../assets/images/v3.2/pp-floorplan.png';
import iconAIForecast from '../../assets/images/v3.2/pp-aiforecast.png';
import tabOverviewIcon from '../../assets/images/v3.2/pp-overview.png';
import tabLocationIcon from '../../assets/images/v3.2/pp-location.png';
import tabPropertyDetailsIcon from '../../assets/images/v3.2/pp-property-details.png';
import iconBeds from '../../assets/images/v3.2/pp-beds.png';
import iconInterior from '../../assets/images/v3.2/pp-c-interior.png';
import iconBath from '../../assets/images/v3.2/pp-bath.png';
import iconWarranties from '../../assets/images/v3.2/pp-warranties.png';
import iconInsurance from '../../assets/images/v3.2/pp-insurance.png';
import iconInteriorDesign from '../../assets/images/v3.2/pp-interiordesign.png';
import floorPlanImage from '../../assets/images/v3.2/property-images/floor-plan.png';
import LocationMap from '../components/LocationMap';
import AIForecastModal from '../components/AIForecastModal';
import RoomModal from '../components/RoomModal';
import FloorPlanModal, { FloorPlanGlbViewer } from '../components/FloorPlanModal';
import { VR_TOUR_URL } from '../../utils/vrTourUrl';
import PhotosModal from '../components/PhotosModal';
import VideosModal from '../components/VideosModal';
import ModalCloseButton from '../../components/ModalCloseButton';
import KitchenImg from '../../assets/images/v3.2/property-images/kitchen.png';
import api from '../../utils/api';
import { showGlobalToast } from '../../utils/toast';
import { persistSelectedPropertyId, readSelectedPropertyId, clearSelectedPropertyId } from '../../utils/propertyNavigation';
import oneImage from '../../assets/images/v3.2/glb/one.png';
import twoImage from '../../assets/images/v3.2/glb/two.png';
import threeImage from '../../assets/images/v3.2/glb/three.png';
import fourImage from '../../assets/images/v3.2/glb/four.png';
import oneDuplexImage from '../../assets/images/v3.2/glb/one_duplex.png';
import twoDuplexImage from '../../assets/images/v3.2/glb/two_duplex.png';
// Room images
import livingRoomImg from '../../assets/images/v3.2/property-images/living.png';
import bedroomImg from '../../assets/images/v3.2/property-images/bedroom.png';
import gymImg from '../../assets/images/v3.2/property-images/gym.png';
import theaterImg from '../../assets/images/v3.2/property-images/theater.png';
import poolImg from '../../assets/images/v3.2/property-images/pool.png';
import foyerImg from '../../assets/images/v3.2/property-images/foyer.png';
import garageImg from '../../assets/images/v3.2/property-images/garage.png';
import playareaImg from '../../assets/images/v3.2/property-images/playarea.png';
// Floor plan images for specific properties
import floorPlan1 from '../../assets/images/v3.2/glb/1floor.png';
import floorPlan2 from '../../assets/images/v3.2/glb/2floor.png';
import floorPlan3 from '../../assets/images/v3.2/glb/3floor.png';
import floorPlan4 from '../../assets/images/v3.2/glb/4floor.png';
import duplexLow from '../../assets/images/v3.2/glb/duplexlow.png';
import duplexUp from '../../assets/images/v3.2/glb/duplexup.png';
import { GLB_URLS } from '../../utils/glbUrls';

type PropertyVideo = { title?: string; url: string };

type NormalizedProperty = {
  id: string;
  title: string;
  location: string;
  lat: number;
  lng: number;
  price: number;
  cardPrice?: number; // Price in Crores for cardData properties
  isCardData?: boolean; // Flag to identify cardData properties
  type?: string;
  yearBuilt?: number;
  beds?: number;
  baths?: number;
  halfBaths?: number;
  sqft?: number;
  lotSqft?: number;
  propertyType?: string;
  propertyStatus?: string;
  builder?: string;
  image?: string | null;
  photos: string[];
  floorPlanImages: string[];
  videos: PropertyVideo[];
  listingTypes?: string[];
  agentContact?: {
    phone?: string;
    email?: string;
    officeAddress?: string;
  };
  agentListingsCount?: number;
  indoorFeatures?: string[];
  applianceTypes?: string[];
  outdoorAmenities?: string[];
  viewTypes?: string[];
  communityTypes?: string[];
  parkingTypes?: string[];
  architecturalStyles?: string[];
  lotSizeUom?: string;
  raw?: any;
};

const ROOMS: { key: string; label: string; image: string }[] = [
  { key: 'living', label: 'Living Room', image: livingRoomImg },
  { key: 'kitchen', label: 'Kitchen', image: KitchenImg },
  { key: 'bedroom', label: 'Bedroom', image: bedroomImg },
  { key: 'gym', label: 'Gym', image: gymImg },
  { key: 'theatre', label: 'Mini Theatre', image: theaterImg },
  { key: 'pool', label: 'Pool', image: poolImg },
  { key: 'foyer', label: 'Foyer', image: foyerImg },
  { key: 'spa', label: 'SPA', image: garageImg },
  { key: 'play', label: 'Play Area', image: playareaImg },
];

const DEFAULT_PROPERTY_PHOTOS: string[] = [
  '/assets/images/v3.2/property-images/living.png',
  KitchenImg,
  '/assets/images/v3.2/property-images/bedroom.png',
  '/assets/images/v3.2/property-images/gym.png',
  '/assets/images/v3.2/property-images/theater.png',
  '/assets/images/v3.2/property-images/pool.png',
  '/assets/images/v3.2/property-images/foyer.png',
  '/assets/images/v3.2/property-images/garage.png', // Using garage image for SPA
  '/assets/images/v3.2/property-images/playarea.png',
];

const DEFAULT_FLOOR_PLAN_IMAGES: string[] = [floorPlanImage];

const WALKTHROUGH_VIDEO_URL = 'https://vvcvdev.s3.ap-south-1.amazonaws.com/Walkthrough_Video+(1).mp4';

const getFloorPlanGlbUrl = (property: NormalizedProperty | null, rawProperty: any | null, cardData: any | null): string | null => {
  if (!property && !rawProperty && !cardData) return null;

  const idCandidate = String(
    cardData?.id ||
    cardData?.propertyId ||
    property?.id ||
    rawProperty?.id ||
    ''
  );

  const typeCandidate = String(
    property?.propertyType ||
    cardData?.propertyType ||
    cardData?.residenceType ||
    rawProperty?.property_type_detail?.name ||
    ''
  );

  const imageCandidate = String(cardData?.image || property?.image || '');
  const nameCandidate = String(rawProperty?.name || property?.title || '');

  const isDuplex =
    /sky\s*villas?/i.test(typeCandidate) ||
    /duplex/i.test(typeCandidate) ||
    /duplex/i.test(idCandidate) ||
    /duplex/i.test(nameCandidate) ||
    /duplex/i.test(imageCandidate);

  if (isDuplex) {
    return GLB_URLS.DUPLEX_FLOORPLAN;
  }

  const glbMap: Record<string, string> = {
    '1NE': GLB_URLS.ONE,
    '2WO': GLB_URLS.TWO,
    '3HREE': GLB_URLS.THREE,
    '4OUR': GLB_URLS.FOUR,
  };

  const upperId = idCandidate.toUpperCase();
  if (glbMap[upperId]) {
    return glbMap[upperId];
  }

  const upperName = nameCandidate.toUpperCase();
  const matchedKey = Object.keys(glbMap).find((key) => upperName.includes(key));
  if (matchedKey) {
    return glbMap[matchedKey];
  }

  return null;
};

type ContactFormState = {
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  message: string;
  agree: boolean;
};

type ContactFormErrors = {
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  message: string;
  agree: string;
  api: string;
};

type ContactFormField = keyof ContactFormState;

const CONTACT_FORM_INITIAL_STATE: ContactFormState = {
  firstName: '',
  lastName: '',
  email: '',
  mobile: '',
  message: '',
  agree: false,
};

const CONTACT_FORM_ERRORS_INITIAL_STATE: ContactFormErrors = {
  firstName: '',
  lastName: '',
  email: '',
  mobile: '',
  message: '',
  agree: '',
  api: '',
};

const Currency: React.FC<{ value: number; className?: string; style?: React.CSSProperties; isSkyven?: boolean }> = ({ value, className, style, isSkyven = false }) => (
  <span className={className} style={style}>{isSkyven ? `Rs. ${value.toLocaleString()}` : `$${value.toLocaleString()}`}</span>
);

const RoomTile: React.FC<{ title: string; img?: string; onClick?: () => void }> = ({ title, img, onClick }) => (
  <div 
    className="relative rounded-[18px] overflow-hidden h-36 md:h-44 bg-gray-100 border border-gray-200 cursor-pointer hover:shadow-lg transition-shadow duration-200"
    onClick={onClick}
  >
    <img src={img || sampleImg} alt={title} className="w-full h-full object-cover" />
    {/* Center icon */}
    <img src={pdGridCenter} alt="center icon" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 select-none pointer-events-none" />
    {/* Bottom gradient overlay */}
    <div className="absolute inset-x-0 bottom-0 h-1/3" style={{ background: 'linear-gradient(180deg, rgba(196, 196, 196, 0) 69.09%, #004236 100%)' }} />
    {/* Centered room name over gradient */}
    <div className="absolute inset-x-0 bottom-0 pb-2 text-center text-white font-semibold text-sm md:text-base">
      {title}
    </div>
  </div>
);

// Helper function to convert lot size to acres
const convertLotSizeToAcres = (lotSize: number | undefined, uom: string | undefined): string | null => {
  if (!lotSize || lotSize === 0) return null;
  
  const uomLower = (uom || '').toLowerCase();
  
  // If already in acres
  if (uomLower.includes('acre')) {
    return `${lotSize.toFixed(2)} Acre(s)`;
  }
  
  // Convert from square feet to acres (1 acre = 43,560 sqft)
  if (uomLower.includes('sqft') || uomLower.includes('sq ft') || uomLower.includes('square feet')) {
    const acres = lotSize / 43560;
    return `${acres.toFixed(2)} Acre(s)`;
  }
  
  // If unit is unknown, assume it's already in acres or return the value with original unit
  return `${lotSize.toFixed(2)} Acre(s)`;
};

const mapApiPropertyToViewModel = (data: any): NormalizedProperty => {
  const photosCollection: any[] = Array.isArray(data?.photos?.results)
    ? data.photos.results
    : Array.isArray(data?.photos?.photos)
      ? data.photos.photos
      : Array.isArray(data?.photos)
        ? data.photos
        : [];

  const latitude = Number(
    data?.latitude ??
    data?.lat ??
    data?.location?.lat
  ) || 0;

  const longitude = Number(
    data?.longitude ??
    data?.lng ??
    data?.location?.lng
  ) || 0;

  const photoUrls = photosCollection
    .map((item) => item?.url)
    .filter((url): url is string => Boolean(url));

  const floorPlanImages = Array.isArray(data?.floorplans)
    ? data.floorplans
        .map((plan: any) => plan?.url || plan?.image)
        .filter((url: string | undefined): url is string => Boolean(url))
    : [];

  // Duplex properties should always show the duplex floor plans on the property page
  const duplexTypeCandidate = String(
    data?.property_type_detail?.name ||
      data?.propertyType ||
      data?.home_type ||
      data?._cardData?.propertyType ||
      data?._cardData?.residenceType ||
      ''
  );
  const duplexIdCandidate = String(data?.id ?? '');
  const duplexNameCandidate = String(data?.name ?? '');
  const duplexImageCandidate = String(data?._cardData?.image ?? data?.image ?? '');
  const isDuplexProperty =
    /sky\s*villas?/i.test(duplexTypeCandidate) ||
    /duplex/i.test(duplexTypeCandidate) ||
    /duplex/i.test(duplexIdCandidate) ||
    /duplex/i.test(duplexNameCandidate) ||
    /duplex/i.test(duplexImageCandidate);

  const normalizedFloorPlanImages = isDuplexProperty ? [duplexLow, duplexUp] : floorPlanImages;

  const videos: PropertyVideo[] = Array.isArray(data?.videos)
    ? data.videos
        .map((video: any, index: number) => ({
          title: video?.title || video?.caption || `Video ${index + 1}`,
          url: video?.url,
        }))
        .filter((video: Partial<PropertyVideo>): video is PropertyVideo => Boolean(video.url))
    : [];

  const agent = data?.agent || data?.agent_detail;
  const agentName = [agent?.first_name, agent?.last_name].filter(Boolean).join(' ').trim();
  const fallbackAgentName = agentName || agent?.username || agent?.email || 'Listing Agent';
  const builderName = data?.builder_name || data?.builder || fallbackAgentName;

  const locationParts = [
    data?.address,
    data?.city_detail?.name || data?.city,
    data?.state_detail?.name || data?.state,
    data?.postal_code,
  ].filter(Boolean);

  const propertyStatus = Array.isArray(data?.property_statuses)
    ? data.property_statuses.map((status: any) => status?.name).filter(Boolean).join(', ')
    : data?.status;

  return {
    id: data?.id,
    title: data?.name || data?.address || 'Property',
    location: locationParts.join(', '),
    price: Number(data?.selling_price || data?.price || 0),
    // Store card price format if available
    cardPrice: data?._cardPrice,
    isCardData: data?._isCardData || false,
    lat: latitude,
    lng: longitude,
    type: data?.home_type || data?.property_type_detail?.name,
    yearBuilt: data?.year_built ? Number(data.year_built) : undefined,
    beds: data?.bedrooms ?? undefined,
    baths: data?.full_bathrooms ?? data?.bathrooms ?? undefined,
    halfBaths: data?.half_bathrooms ?? undefined,
    sqft: data?.total_sqft ? Number(data.total_sqft) : undefined,
    lotSqft: data?.lot_size ? Number(data.lot_size) : undefined,
    propertyType: data?.property_type_detail?.name,
    propertyStatus,
    builder: builderName,
    image: photosCollection.find((p: any) => p?.main_photo)?.url || photoUrls[0] || null,
    photos: photoUrls,
    floorPlanImages: normalizedFloorPlanImages,
    videos,
    listingTypes: Array.isArray(data?.listing_types)
      ? data.listing_types.map((lt: any) => lt?.name || lt?.title).filter(Boolean)
      : undefined,
    agentContact: {
      phone: agent?.mobile_number,
      email: agent?.email,
      officeAddress: agent?.office_address,
    },
    agentListingsCount: agent?.listings_count || agent?.properties_count || agent?.total_properties,
    indoorFeatures: Array.isArray(data?.indoor_features)
      ? data.indoor_features.map((feature: any) => feature?.name || feature).filter(Boolean)
      : undefined,
    applianceTypes: Array.isArray(data?.appliance_types)
      ? data.appliance_types.map((appliance: any) => appliance?.name || appliance).filter(Boolean)
      : undefined,
    outdoorAmenities: Array.isArray(data?.outdoor_amenities)
      ? data.outdoor_amenities.map((amenity: any) => amenity?.name || amenity).filter(Boolean)
      : undefined,
    viewTypes: Array.isArray(data?.view_types)
      ? data.view_types.map((view: any) => view?.name || view).filter(Boolean)
      : undefined,
    communityTypes: Array.isArray(data?.community_types)
      ? data.community_types.map((community: any) => community?.name || community).filter(Boolean)
      : undefined,
    parkingTypes: Array.isArray(data?.parking_types)
      ? data.parking_types.map((parking: any) => parking?.name || parking).filter(Boolean)
      : undefined,
    architecturalStyles: Array.isArray(data?.architectural_styles)
      ? data.architectural_styles.map((style: any) => style?.name || style).filter(Boolean)
      : undefined,
    lotSizeUom: data?.lot_size_uom || undefined,
    raw: data,
  };
};

const PropertyDetailsV3: React.FC = () => {
  const { id: legacyRouteId } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { show } = useFloatingAskBar();
  const routeState = location.state as { propertyId?: string; cardData?: any } | null;
  const statePropertyId = routeState?.propertyId || null;
  const cardData = routeState?.cardData || null;
  const [propertyId, setPropertyId] = React.useState<string | null>(() => readSelectedPropertyId());
  const [rawProperty, setRawProperty] = React.useState<any | null>(null);
  const [isPropertyLoading, setIsPropertyLoading] = React.useState<boolean>(false);
  const [propertyError, setPropertyError] = React.useState<string | null>(null);
  const [reloadToken, setReloadToken] = React.useState(0);

  const queryPropertyId = React.useMemo(() => {
    try {
      const params = new URLSearchParams(location.search);
      return params.get('pid');
    } catch {
      return null;
    }
  }, [location.search]);

  React.useEffect(() => { show(); }, [show]);

  React.useEffect(() => {
    if (statePropertyId && statePropertyId !== propertyId) {
      persistSelectedPropertyId(statePropertyId);
      setPropertyId(statePropertyId);
    }
  }, [statePropertyId, propertyId]);

  React.useEffect(() => {
    if (!statePropertyId && queryPropertyId && queryPropertyId !== propertyId) {
      persistSelectedPropertyId(queryPropertyId);
      setPropertyId(queryPropertyId);
    }
  }, [queryPropertyId, statePropertyId, propertyId]);

  React.useEffect(() => {
    if (!statePropertyId && !queryPropertyId && legacyRouteId && legacyRouteId !== propertyId) {
      persistSelectedPropertyId(legacyRouteId);
      setPropertyId(legacyRouteId);
      navigate(
        { pathname: '/v3/property', search: location.search },
        { replace: true, state: { propertyId: legacyRouteId } }
      );
    }
  }, [legacyRouteId, statePropertyId, queryPropertyId, propertyId, navigate, location.search]);

  // If we arrive with cardData (e.g., from Skyven cards) but still have a persisted propertyId,
  // clear the stored id so the page uses the provided card data instead of fetching an old property.
  React.useEffect(() => {
    if (cardData && !statePropertyId && !queryPropertyId && propertyId !== null) {
      clearSelectedPropertyId();
      setPropertyId(null);
    }
  }, [cardData, statePropertyId, queryPropertyId, propertyId]);

  // Image mapping for property images from JSON
  const propertyImageMap: Record<string, string> = {
    one: oneImage,
    two: twoImage,
    three: threeImage,
    four: fourImage,
    one_duplex: oneDuplexImage,
    two_duplex: twoDuplexImage,
  };

  // Floor plan mapping for specific property IDs
  const floorPlanMap: Record<string, string> = {
    '1NE': floorPlan1,
    '2WO': floorPlan2,
    '3HREE': floorPlan3,
    '4OUR': floorPlan4,
  };

  // Use cardData if available and no propertyId
  React.useEffect(() => {
    if (cardData && !propertyId) {
      const isChatbotProperty =
        cardData.__source === 'chatbot' ||
        (typeof cardData.title === 'string' &&
          typeof cardData.location === 'string' &&
          typeof cardData.lat === 'number' &&
          typeof cardData.lng === 'number');

      if (isChatbotProperty) {
        const defaultRooms = ROOMS.map((room) => ({
          id: room.key,
          key: room.key,
          name: room.label,
          value: room.label,
          image: room.image,
        }));

        const bedsNumber =
          typeof cardData.beds === 'number'
            ? cardData.beds
            : typeof cardData.beds === 'string'
              ? parseInt(cardData.beds.match(/(\d+)/)?.[1] || '', 10)
              : null;
        const bathsNumber =
          typeof cardData.baths === 'number'
            ? cardData.baths
            : typeof cardData.baths === 'string'
              ? parseInt(cardData.baths.match(/(\d+)/)?.[1] || '', 10)
              : null;
        const sqftNumber =
          typeof cardData.sqft === 'number'
            ? cardData.sqft
            : typeof cardData.sqft === 'string'
              ? parseInt(cardData.sqft.replace(/,/g, '').match(/(\d+)/)?.[1] || '', 10)
              : null;
        const imageUrl = cardData.image || cardData.imageUrl || null;
        const propertyStatus = cardData.propertyStatus || cardData.status;
        const listingType = cardData.listingType || cardData.listing_type;

        const rawRooms = cardData.room_types || cardData.rooms || cardData.building_rooms;
        const chatbotRooms = Array.isArray(rawRooms) && rawRooms.length > 0
          ? rawRooms.map((r: any, idx: number) => ({
              id: r.id || r.key || `room-${idx}`,
              key: r.key || r.id || `room-${idx}`,
              name: r.name || r.value || r.label || `Room ${idx + 1}`,
              value: r.value || r.name || r.label || `Room ${idx + 1}`,
              image: r.image || r.url,
            }))
          : defaultRooms;

        const transformedProperty = {
          id: cardData.id ?? cardData.title,
          name: cardData.title || cardData.name || 'Property',
          address: cardData.location || '',
          selling_price: typeof cardData.price === 'number' ? cardData.price : Number(cardData.price || 0),
          price: typeof cardData.price === 'number' ? cardData.price : Number(cardData.price || 0),
          property_type_detail: cardData.propertyType ? { name: cardData.propertyType } : null,
          bedrooms: bedsNumber ?? undefined,
          full_bathrooms: bathsNumber ?? undefined,
          total_sqft: sqftNumber ?? undefined,
          lot_size: cardData.lotSqft ?? cardData.lot_sqft ?? undefined,
          property_statuses: propertyStatus ? [{ name: propertyStatus }] : [],
          status: propertyStatus,
          listing_types: listingType ? [{ name: listingType }] : [],
          builder_name: cardData.builder,
          agent: cardData.agent || {
            first_name: cardData.builder || 'VistaView',
            last_name: 'Agent',
          },
          latitude: cardData.lat,
          longitude: cardData.lng,
          photos: imageUrl ? {
            results: [{
              url: imageUrl,
              main_photo: true,
              image: imageUrl
            }]
          } : [],
          room_types: chatbotRooms,
          building_rooms: chatbotRooms,
          indoor_features: cardData.amenities?.indoorfeature,
          appliance_types: cardData.amenities?.appliancetype,
          outdoor_amenities: cardData.amenities?.outdooramenity,
          community_types: cardData.amenities?.communitytype,
          view_types: Array.isArray(cardData.views) ? cardData.views.map((v: any) => typeof v === 'string' ? { name: v } : v) : [],
          parking_types: cardData.parkingSlots ? [{ name: `${cardData.parkingSlots} Parking` }] : [],
          _cardData: cardData,
          _isCardData: true,
        };
        setRawProperty(transformedProperty);
        setIsPropertyLoading(false);
        return;
      }

      // Extract beds number from "5 Beds" format
      const bedsValue = typeof cardData.beds === 'number' ? `${cardData.beds}` : (cardData.beds || '');
      const bedsMatch = bedsValue.match(/(\d+)/);
      const bedrooms = bedsMatch ? parseInt(bedsMatch[1]) : null;
      
      // Extract sqft from "5,896 Sq. Ft." format - remove commas and extract number
      const interiorValue = typeof cardData.interior === 'string' ? cardData.interior : '';
      const sqftMatch = interiorValue.replace(/,/g, '').match(/(\d+)/);
      const totalSqft = sqftMatch ? parseInt(sqftMatch[1]) : null;
      
      // Get image URL from mapping
      const imageKey = cardData.image;
      const imageUrl = imageKey && propertyImageMap[imageKey] ? propertyImageMap[imageKey] : (cardData.image || null);
      
      // Convert price from Cr to actual price (1 Cr = 10,000,000)
      const priceValue = typeof cardData.price === 'number' ? cardData.price : Number(cardData.price || 0);
      const sellingPrice = priceValue ? priceValue * 10000000 : null;
      
      // Build property name/title
      const propertyName = cardData.id || cardData.residenceType || 'Property';
      const propertyTitle = `${propertyName} - ${cardData.propertyType || 'Residence'}`;
      
      // Use the provided property description for cardData properties
      const propertyDescription = `At Skyven, luxury isn't just an amenity - it's a way of life. Every square foot of these ultra luxury apartments in Hyderabad is designed to reflect ambition, elegance, and elevation. Soaring 63 floors above the heart of Kokapet, this iconic tower blends architectural brilliance with timeless serenity. 
Here, innovation meets indulgence - intelligent systems, curated experiences, and elevated spaces come together to create a lifestyle that's seamless, secure, and serene. From rooftop infinity pools to private sky observatories, Skyven is more than a residence - it's a vertical sanctuary of uber luxury apartments in Kokapet, crafted for those who dare to live above it all. 
Crafted for families who dream in widescreen, with grand lounges, private theatres, and sky-kissed balconies.`;
      
      const details = cardData.details || propertyDescription;
      
      // Create room_types from default ROOMS for cardData properties
      // Map ROOMS to the format expected by roomTypes
      const defaultRooms = ROOMS.map((room, idx) => ({
        id: room.key,
        key: room.key,
        name: room.label,
        value: room.label,
        image: room.image,
      }));

      // Skyven builder/agent defaults for card-driven properties
      const skyvenAgent = {
        first_name: 'Skyven',
        last_name: 'Builder',
        username: 'Skyven Builder',
        name: 'Skyven Builder',
        email: cardData.agentEmail || '',
        mobile_number: cardData.agentPhone || '',
        office_address: 'SKYVEN Building, Kokapet',
        listings_count: cardData.agentListingsCount || cardData.listingsCount || 1,
        properties_count: cardData.agentListingsCount || cardData.listingsCount || 1,
        total_properties: cardData.agentListingsCount || cardData.listingsCount || 1,
        profile_photo_url: cardData.agentPhoto || null,
      };

      const isDuplexCardData =
        /sky\s*villas?/i.test(String(cardData.propertyType || cardData.residenceType || '')) ||
        String(cardData.image || '') === 'one_duplex' ||
        String(cardData.image || '') === 'two_duplex' ||
        /duplex/i.test(String(cardData.id || '')) ||
        /duplex/i.test(String(cardData.image || ''));

      // Transform cardData to match API property format
      const transformedProperty = {
        id: cardData.id,
        name: propertyTitle,
        bedrooms: bedrooms,
        full_bathrooms: 5, // Default from card specs (5 Bathrooms)
        half_bathrooms: 0,
        selling_price: sellingPrice,
        // Store original card price format for display
        _cardPrice: cardData.price, // Price in Crores
        _isCardData: true, // Flag to identify cardData properties
        property_type_detail: (cardData.propertyType || cardData.residenceType) ? {
          name: cardData.propertyType || cardData.residenceType
        } : null,
        total_sqft: totalSqft,
        interior_sqft: cardData.interior,
        facing: cardData.facing,
        status: cardData.status?.label || 'Available',
        property_statuses: cardData.status ? [{
          name: cardData.status.label,
          tone: cardData.status.tone
        }] : [],
        amenities: cardData.amenities || [],
        photos: imageUrl ? {
          results: [{
            url: imageUrl,
            main_photo: true,
            image: imageUrl
          }]
        } : [],
        // Floor plans based on property ID
        // Duplex properties should always show both duplexlow and duplexup on the property page.
        floorplans: isDuplexCardData
          ? [{ url: duplexLow, image: duplexLow }, { url: duplexUp, image: duplexUp }]
          : floorPlanMap[cardData.id]
            ? [{
                url: floorPlanMap[cardData.id],
                image: floorPlanMap[cardData.id]
              }] 
            : [],
        details: details,
        address: 'SKYVEN Building, Kokapet',
        city_detail: { name: 'Hyderabad' },
        state_detail: { name: 'Telangana' },
        country_detail: { name: 'India' },
        postal_code: '',
        latitude: 17.387665397462573,
        longitude: 78.34013442415682,
        builder_name: 'Skyven Builder',
        agent: skyvenAgent,
        agent_detail: skyvenAgent,
        // Room types for room grid display
        room_types: defaultRooms,
        building_rooms: defaultRooms,
        // Additional fields for display - Default features for cardData properties
        indoor_features: [
          { name: 'Clubhouses' },
          { name: 'Stars Observatory' },
          { name: 'Infinity Pool' },
          { name: 'Helipad' }
        ],
        appliance_types: [
          { name: 'Dishwasher' },
          { name: 'Garbage disposal' },
          { name: 'Microwave' },
          { name: 'Range / Oven' },
          { name: 'Refrigerator' }
        ],
        view_types: [
          { name: 'River view' },
          { name: 'Deep Water Mooring' }
        ],
        community_types: [
          { name: 'Country Club Community' },
          { name: 'Golf Community' }
        ],
        parking_types: [
          { name: '7 floor car parking' }
        ],
        outdoor_amenities: Array.isArray(cardData.amenities) ? cardData.amenities.map((a: any) => 
          typeof a === 'string' ? { name: a } : a
        ) : [],
        architectural_styles: [],
        listing_types: [{ name: 'For Sale' }],
        home_type: cardData.propertyType || cardData.residenceType || 'Residence',
        // Store original card data for reference
        _cardData: cardData,
      };
      setRawProperty(transformedProperty);
      setIsPropertyLoading(false);
      return;
    }
  }, [cardData, propertyId]);

  React.useEffect(() => {
    if (!propertyId) {
      // Only clear if we don't have cardData either
      if (!cardData) {
        setRawProperty(null);
        setIsPropertyLoading(false);
      }
      return;
    }
    let aborted = false;
    setIsPropertyLoading(true);
    setPropertyError(null);
    api.get(`/buyer/properties/${propertyId}/`)
      .then((res) => {
        if (aborted) return;
        const apiData = res.data?.data || res.data;
        setRawProperty(apiData);
      })
      .catch((error) => {
        if (aborted) return;
        setPropertyError(error?.response?.data?.message || 'Failed to fetch property details');
        setRawProperty(null);
      })
      .finally(() => {
        if (!aborted) {
          setIsPropertyLoading(false);
        }
      });
    return () => {
      aborted = true;
    };
  }, [propertyId, reloadToken, cardData]);

  // Open media modals or VR based on query param from chatbot (delayed by 3s)
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const media = params.get('media');
    let timer: number | undefined;
    if (media === 'photos') {
      timer = window.setTimeout(() => {
        handlePhotosClick();
      }, 500);
    } else if (media === 'videos') {
      timer = window.setTimeout(() => {
        setIsVideosModalOpen(true);
      }, 500);
    } else if (media === 'floorplans') {
      timer = window.setTimeout(() => {
        setIsFloorPlanModalOpen(true);
      }, 500);
    } else if (media === 'vtour') {
      timer = window.setTimeout(() => {
        window.open(VR_TOUR_URL, '_blank', 'noopener,noreferrer');
      }, 500);
    }
    return () => {
      if (timer) window.clearTimeout(timer);
    };
  }, []);

  const property = React.useMemo(() => (rawProperty ? mapApiPropertyToViewModel(rawProperty) : null), [rawProperty]);
  const builderCount = property?.agentListingsCount ?? 0;

  // Helper to check if property is Skyven
  const isSkyvenProperty: boolean = React.useMemo(() => {
    const builderMatch = property?.builder === 'Skyven Builder' || rawProperty?.builder_name === 'Skyven Builder';
    const titleMatch = property?.title ? property.title.toLowerCase().includes('skyven') : false;
    return builderMatch || titleMatch;
  }, [property, rawProperty]);

  // Extract room_types from API response
  const roomTypes = React.useMemo(() => {
    if (!rawProperty) return [];
    const rooms = rawProperty.room_types || rawProperty.building_rooms || [];
    return Array.isArray(rooms) ? rooms.filter((r: any) => r && (r.name || r.value)) : [];
  }, [rawProperty]);

  // Extract agent details from API response
  const agentDetails = React.useMemo(() => {
    if (!rawProperty) return null;
    const agent = rawProperty.agent || rawProperty.agent_detail;
    if (!agent) return null;
    
    const agentName = [agent.first_name, agent.last_name].filter(Boolean).join(' ').trim() || 
                     agent.username || 
                     agent.name || 
                     agent.email || 
                     'Listing Agent';
    
    return {
      name: agentName,
      phone: agent.mobile_number || property?.agentContact?.phone || '',
      email: agent.email || property?.agentContact?.email || '',
      profilePhoto: agent.profile_photo_url || agent.profile_photo || null,
      isVerified: agent.is_verified || agent.verified || agent.is_email_verified || false,
    };
  }, [rawProperty, property]);

  const agentEmail = React.useMemo(() => {
    const agent = rawProperty?.agent || rawProperty?.agent_detail;
    if (!agent) return property?.agentContact?.email || '';
    if (agent.email) return agent.email;
    if (typeof agent.id === 'object' && agent.id?.email) return agent.id.email;
    return property?.agentContact?.email || '';
  }, [rawProperty, property]);

  const agentOfficeInfo = React.useMemo(() => {
    const agent = rawProperty?.agent || rawProperty?.agent_detail;
    const company =
      agent?.company ||
      agent?.agency_name ||
      agent?.office_name ||
      agent?.office_company ||
      '';
    const officeAddress =
      agent?.office_address ||
      agent?.address ||
      property?.agentContact?.officeAddress ||
      property?.location ||
      '';
    return { company, officeAddress };
  }, [rawProperty, property]);

  // Media state
  const [isVideosModalOpen, setIsVideosModalOpen] = React.useState(false);
  const propertyPhotos = React.useMemo(
    () => (property?.photos?.length ? property.photos : DEFAULT_PROPERTY_PHOTOS),
    [property]
  );
  const photosForModal = React.useMemo(() => {
    if (!property?.isCardData) return propertyPhotos;

    const roomImages = roomTypes
      .map((room: any) => room?.image || room?.url)
      .filter((src: string | undefined): src is string => Boolean(src));

    if (!roomImages.length) return propertyPhotos;

    return Array.from(new Set([...propertyPhotos, ...roomImages]));
  }, [property?.isCardData, propertyPhotos, roomTypes]);
  const propertyFloorPlans = React.useMemo(
    () => (property?.floorPlanImages?.length ? property.floorPlanImages : DEFAULT_FLOOR_PLAN_IMAGES),
    [property]
  );
  const floorPlanGlbUrl = React.useMemo(
    () => getFloorPlanGlbUrl(property, rawProperty, cardData),
    [property, rawProperty, cardData]
  );
  const propertyVideos = React.useMemo<PropertyVideo[]>(
    () => {
      const fromApi: PropertyVideo[] = property?.videos?.length ? property.videos : [];
      const walkthrough: PropertyVideo = { title: 'Walkthrough Video', url: WALKTHROUGH_VIDEO_URL };
      const alreadyIncluded = fromApi.some((v) => v?.url === WALKTHROUGH_VIDEO_URL);
      const merged = alreadyIncluded ? fromApi : [walkthrough, ...fromApi];
      return merged.length ? merged : [walkthrough];
    },
    [property]
  );

  // Mortgage calculator state and derived values (right column)
  const [downPayment, setDownPayment] = React.useState<number>(100000);
  const [loanAmount, setLoanAmount] = React.useState<number>(0);
  const [interestPct, setInterestPct] = React.useState<number>(15);
  const [loanYears, setLoanYears] = React.useState<number>(5);
  const [loanUnit, setLoanUnit] = React.useState<'years' | 'months'>('years');
  const [activeTab, setActiveTab] = React.useState<'mortgage' | 'appreciation'>('mortgage');
  const [appRate, setAppRate] = React.useState<number>(5);
  const [appYears, setAppYears] = React.useState<number>(5);
  const [activeSection, setActiveSection] = React.useState<'overview' | 'location' | 'property-details'>('overview');
  const [isSticky, setIsSticky] = React.useState(false);
  const [isAIForecastModalOpen, setIsAIForecastModalOpen] = React.useState(false);
  const [isRoomModalOpen, setIsRoomModalOpen] = React.useState(false);
  const [isPhotosModalOpen, setIsPhotosModalOpen] = React.useState(false);
  const [isFloorPlanModalOpen, setIsFloorPlanModalOpen] = React.useState(false);
  const [currentFloorPlanIndex, setCurrentFloorPlanIndex] = React.useState(0);
  const [selectedRoom, setSelectedRoom] = React.useState<{ name: string; image: string } | null>(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = React.useState(0);
  const [isContactModalOpen, setIsContactModalOpen] = React.useState(false);
  const [contactForm, setContactForm] = React.useState<ContactFormState>(CONTACT_FORM_INITIAL_STATE);
  const [contactErrors, setContactErrors] = React.useState<ContactFormErrors>(CONTACT_FORM_ERRORS_INITIAL_STATE);
  const [contactLoading, setContactLoading] = React.useState(false);
  const tabsRef = React.useRef<HTMLDivElement>(null);
  const originalTabsPosition = React.useRef<number>(0);
  const resetContactForm = React.useCallback(() => {
    setContactForm(CONTACT_FORM_INITIAL_STATE);
    setContactErrors(CONTACT_FORM_ERRORS_INITIAL_STATE);
  }, []);

  const handleRetry = React.useCallback(() => setReloadToken(prev => prev + 1), []);

  const handleOpenContactModal = React.useCallback(() => {
    resetContactForm();
    setIsContactModalOpen(true);
  }, [resetContactForm]);

  const handleCloseContactModal = React.useCallback(() => {
    setIsContactModalOpen(false);
    resetContactForm();
  }, [resetContactForm]);

  const validateContactForm = React.useCallback(() => {
    let hasError = false;
    const nextErrors: ContactFormErrors = { ...CONTACT_FORM_ERRORS_INITIAL_STATE };

    if (!contactForm.firstName || contactForm.firstName.trim().length < 2) {
      nextErrors.firstName = 'First name is required (min 2 characters)';
      hasError = true;
    } else if (contactForm.firstName.length > 100) {
      nextErrors.firstName = 'First name cannot exceed 100 characters.';
      hasError = true;
    }

    if (!contactForm.lastName || contactForm.lastName.trim().length < 2) {
      nextErrors.lastName = 'Last name is required (min 2 characters)';
      hasError = true;
    } else if (contactForm.lastName.length > 100) {
      nextErrors.lastName = 'Last name cannot exceed 100 characters.';
      hasError = true;
    }

    if (!contactForm.email) {
      nextErrors.email = 'Email is required';
      hasError = true;
    } else if (!/^\S+@\S+\.\S+$/.test(contactForm.email)) {
      nextErrors.email = 'Invalid email address';
      hasError = true;
    } else if (contactForm.email.length > 100) {
      nextErrors.email = 'Email cannot exceed 100 characters.';
      hasError = true;
    }

    if (!contactForm.mobile) {
      nextErrors.mobile = 'Mobile number is required';
      hasError = true;
    } else if (!/^\d{10,15}$/.test(contactForm.mobile)) {
      nextErrors.mobile = 'Mobile number must be 10-15 digits';
      hasError = true;
    } else if (contactForm.mobile.length > 100) {
      nextErrors.mobile = 'Mobile number cannot exceed 100 characters.';
      hasError = true;
    }

    if (!contactForm.message || contactForm.message.trim().length < 10) {
      nextErrors.message = 'Message is required (min 10 characters)';
      hasError = true;
    } else if (contactForm.message.length > 1000) {
      nextErrors.message = 'Message cannot exceed 1000 characters.';
      hasError = true;
    }

    if (!contactForm.agree) {
      nextErrors.agree = 'You must agree to the terms';
      hasError = true;
    }

    setContactErrors(nextErrors);
    return !hasError;
  }, [contactForm]);

  const handleContactInputChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value, type } = event.target;
      const fieldName = name as ContactFormField;
      setContactForm(prev => ({
        ...prev,
        [fieldName]: type === 'checkbox' ? (event.target as HTMLInputElement).checked : value,
      }));
      setContactErrors(prev => ({ ...prev, [fieldName]: '', api: '' }));
    },
    []
  );

  const handleContactSubmit = React.useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      if (!validateContactForm()) return;
      setContactLoading(true);
      setContactErrors(prev => ({ ...prev, api: '' }));
      try {
        const response = await api.post('/common/contact/agent/', {
          first_name: contactForm.firstName,
          last_name: contactForm.lastName,
          email: contactForm.email,
          mobile: contactForm.mobile,
          message: contactForm.message,
          agent_email: agentEmail,
        });
        if (response.data?.success) {
          showGlobalToast(response.data?.message || 'Message sent successfully!', 4000);
          handleCloseContactModal();
        } else {
          const message = response.data?.message || 'Failed to send message';
          setContactErrors(prev => ({ ...prev, api: message }));
          showGlobalToast(message, 4000);
        }
      } catch (error: any) {
        const message = error?.response?.data?.message || 'Failed to send message';
        setContactErrors(prev => ({ ...prev, api: message }));
        showGlobalToast(message, 4000);
      } finally {
        setContactLoading(false);
      }
    },
    [agentEmail, contactForm, handleCloseContactModal, resetContactForm, validateContactForm]
  );

  React.useEffect(() => {
    setLoanAmount(Math.max(0, (property?.price || 0) - downPayment));
  }, [property, downPayment]);

  // Store original positions on mount
  React.useEffect(() => {
    if (tabsRef.current) {
      originalTabsPosition.current = tabsRef.current.offsetTop;
    }
  }, []);

  React.useEffect(() => {
    if (isContactModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isContactModalOpen]);

  // Scroll detection for sticky tabs, mortgage card, and active section
  React.useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollTop = window.scrollY;
          const tabsElement = tabsRef.current;
          
          // Handle tabs sticky behavior
          if (tabsElement && originalTabsPosition.current > 0) {
            const originalOffset = originalTabsPosition.current;
            
            // Use a fallback position for when to hide sticky tabs
            const fallbackBottom = originalOffset + 1000;
            
            // Show sticky tabs when:
            // 1. Scrolling down past the original tabs position (when tabs would be out of view)
            // 2. Scrolling up but still above the fallback position
            // Hide when scrolling back up to the original tabs area
            const isPastOriginalTabs = scrollTop > originalOffset - 80; // Show when tabs are about to go out of view
            const isBeforeFallback = scrollTop < fallbackBottom;
            const isAtOriginalTabs = scrollTop <= originalOffset + 10; // Hide when back at original tabs position
            
            const shouldBeSticky = isPastOriginalTabs && isBeforeFallback && !isAtOriginalTabs;
            
            setIsSticky(prev => prev !== shouldBeSticky ? shouldBeSticky : prev);
          }


          // Update active section based on scroll position
          const sections = ['overview', 'location', 'property-details'];
          const offset = 200; // Offset to account for sticky header

          for (let i = sections.length - 1; i >= 0; i--) {
            const element = document.getElementById(sections[i]);
            if (element && scrollTop >= element.offsetTop - offset) {
              setActiveSection(sections[i] as 'overview' | 'location' | 'property-details');
              break;
            }
          }
          
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Section navigation functions
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = isSticky ? 160 : 120; // Account for sticky header and tabs
      const elementPosition = element.offsetTop - offset;
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });
    }
  };

  const handleTabClick = (section: 'overview' | 'location' | 'property-details') => {
    setActiveSection(section);
    scrollToSection(section);
  };

  const handleRoomClick = (room: { key: string; label: string; image: string }) => {
    setSelectedRoom({ name: room.label, image: room.image });
    setIsRoomModalOpen(true);
  };

  const handleRoomSelect = (roomName: string) => {
    const room = ROOMS.find(r => r.label === roomName);
    if (room) {
      setSelectedRoom({ name: room.label, image: room.image });
    }
  };

  const handlePhotosClick = () => {
    setCurrentPhotoIndex(0);
    setIsPhotosModalOpen(true);
  };

  const handlePhotoSelect = (index: number) => {
    setCurrentPhotoIndex(index);
  };

  const handleFloorPlanSelect = (index: number) => {
    setCurrentFloorPlanIndex(index);
  };

  const mortgage = React.useMemo(() => {
    const principal = Math.max(0, loanAmount);
    const monthlyRate = (interestPct / 100) / 12;
    const n = loanUnit === 'years' ? loanYears * 12 : loanYears; // if months selected, treat input as months
    const monthly = n > 0 && monthlyRate > 0
      ? (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -n))
      : (n > 0 ? principal / n : 0);
    const totalPayment = monthly * n;
    const totalInterest = Math.max(0, totalPayment - principal);
    return { monthly, principal, totalInterest };
  }, [loanAmount, interestPct, loanYears, loanUnit]);

  const appreciation = React.useMemo(() => {
    const base = property?.price || 0;
    const rate = appRate / 100;
    const years = appYears;
    const future = base * Math.pow(1 + rate, Math.max(0, years));
    return { base, future };
  }, [property, appRate, appYears]);

  const DonutChart: React.FC<{ values: { label: string; value: number; color: string }[]; size?: number; center?: React.ReactNode; isActive?: boolean }>
    = ({ values, size = 180, center, isActive = false }) => {
      const [isVisible, setIsVisible] = React.useState(false);
      const total = values.reduce((s, v) => s + v.value, 0) || 1;
      let cumulative = 0;
      const radius = size / 2;
      const stroke = 22;
      const r = radius - stroke / 2;
      const circumference = 2 * Math.PI * r;

      React.useEffect(() => {
        if (isActive) {
          setIsVisible(false);
          const timer = setTimeout(() => setIsVisible(true), 200);
          return () => clearTimeout(timer);
        }
      }, [isActive]);

      return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="block">
          <defs>
            <linearGradient id="gradPrincipal" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#905E26" />
              <stop offset="26%" stopColor="#F5EC9B" />
              <stop offset="100%" stopColor="#905E26" />
            </linearGradient>
          </defs>
          
          {/* Background circle */}
          <circle 
            cx={radius} 
            cy={radius} 
            r={r} 
            stroke="#E5E7EB" 
            strokeWidth={stroke} 
            fill="none" 
            opacity="0.15" 
          />
          
          {values.map((seg, i) => {
            const start = (cumulative / total) * 2 * Math.PI; 
            cumulative += seg.value;
            const end = (cumulative / total) * 2 * Math.PI;
            const large = end - start > Math.PI ? 1 : 0;
            const x1 = radius + r * Math.cos(start), y1 = radius + r * Math.sin(start);
            const x2 = radius + r * Math.cos(end), y2 = radius + r * Math.sin(end);
            const d = `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
            const segmentLength = (end - start) * r;
            const dashArray = `${segmentLength} ${circumference}`;
            const dashOffset = isVisible ? 0 : segmentLength;
            
            return (
              <path 
                key={`${seg.label}-${i}`} 
                d={d} 
                stroke={seg.color} 
                strokeWidth={stroke} 
                fill="none" 
                strokeLinecap="butt"
                strokeDasharray={dashArray}
                strokeDashoffset={dashOffset}
                style={{ 
                  transition: `stroke-dashoffset 1.2s ease-out ${i * 0.2}s`,
                  opacity: isVisible ? 1 : 0
                }} 
              />
            );
          })}
          
          {center && (
            <foreignObject 
              x={radius - size / 2} 
              y={radius - size / 2} 
              width={size} 
              height={size} 
              pointerEvents="none"
              style={{
                opacity: isVisible ? 1 : 0,
                transition: `opacity 0.8s ease-out ${values.length * 0.2 + 0.3}s`
              }}
            >
              <div className="w-full h-full flex items-center justify-center">
                {center}
              </div>
            </foreignObject>
          )}
        </svg>
      );
    };

  const AppreciationMetrics: React.FC<{ 
    currentValue: number;
    appreciationRate: number;
    yearsToProject: number;
    isSkyven?: boolean;
  }> = ({ currentValue, appreciationRate, yearsToProject, isSkyven = false }) => {
    const [isVisible, setIsVisible] = React.useState(false);
    const landData = [21, 24, 30, 39, 50, 53, 56, 59];
    const localityData = [32, 35, 36, 41, 57, 54, 56, 58];
    const years = ['2025', '2027', '2029', '2031', '2033', '2035', '2037', '2039'];
    const maxValue = Math.max(...landData, ...localityData);
    const chartHeight = 200;
    const barWidth = 30;
    const spacing = 40;

    React.useEffect(() => {
      const timer = setTimeout(() => setIsVisible(true), 100);
      return () => clearTimeout(timer);
    }, []);

    const calculateAppreciation = (value: number, years: number) => {
      return value * Math.pow(1 + appreciationRate / 100, years);
    };

    const projectedValue = calculateAppreciation(currentValue, yearsToProject);
    const appreciationAmount = projectedValue - currentValue;
    const appreciationPercent = ((appreciationAmount / currentValue) * 100).toFixed(0);
    const landValue = currentValue * 0.87;
    const buildingValue = currentValue * 0.13;

    return (
      <div className="w-full">
        {/* Key Metrics - Label and value in separate lines */}
        <div className="flex justify-between items-center mb-6 px-4 py-3 rounded-lg" style={{ background: 'rgba(0, 66, 54, 0.3)' }}>
          {/* Appreciation */}
          <div className="flex items-center gap-2">
            <div className="text-center">
              <div className="text-white text-xs">
                <span className="text-green-400 font-semibold">{appreciationPercent}%</span> Appreciated in {yearsToProject + 2025}
              </div>
              <div className="text-white text-sm font-bold">{isSkyven ? `Rs. ${appreciationAmount.toLocaleString()}` : `$ ${appreciationAmount.toLocaleString()}`}</div>
            </div>
            <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>

          {/* Land Value */}
          <div className="flex items-center gap-2">
            <div className="text-center">
              <div className="text-white text-xs">Land Value</div>
              <div className="text-white text-sm font-bold">{isSkyven ? `Rs. ${landValue.toLocaleString()}` : `$ ${landValue.toLocaleString()}`}</div>
            </div>
            <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>

          {/* Building */}
          <div className="flex items-center gap-2">
            <div className="text-center">
              <div className="text-white text-xs">Building</div>
              <div className="text-white text-sm font-bold">{isSkyven ? `Rs. ${buildingValue.toLocaleString()}` : `$ ${buildingValue.toLocaleString()}`}</div>
            </div>
            <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>

        {/* Animated Bar Chart */}
        <div className="relative">
          <svg width="100%" height={chartHeight + 40} viewBox={`0 0 ${years.length * spacing + 60} ${chartHeight + 40}`}>
            <defs>
              <linearGradient id="landGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#D4AF37" />
                <stop offset="50%" stopColor="#F5EC9B" />
                <stop offset="100%" stopColor="#B8860B" />
              </linearGradient>
              <linearGradient id="localityGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#20B2AA" />
                <stop offset="100%" stopColor="#008B8B" />
              </linearGradient>
            </defs>
            
            {/* Grid lines */}
            {[0, 10, 20, 30, 40, 50, 60].map((value) => (
              <g key={value}>
                <line
                  x1="50"
                  y1={chartHeight - (value / maxValue) * chartHeight + 20}
                  x2={years.length * spacing + 50}
                  y2={chartHeight - (value / maxValue) * chartHeight + 20}
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="1"
                  strokeDasharray="2,2"
                />
                <text
                  x="45"
                  y={chartHeight - (value / maxValue) * chartHeight + 25}
                  fill="rgba(255,255,255,0.8)"
                  fontSize="10"
                  textAnchor="end"
                >
                  {value}
                </text>
              </g>
            ))}

            {/* Y-axis label */}
            <text
              x="15"
              y={chartHeight / 2 + 20}
              fill="rgba(255,255,255,0.8)"
              fontSize="12"
              textAnchor="middle"
              transform={`rotate(-90, 15, ${chartHeight / 2 + 20})`}
            >
              Title
            </text>

            {/* Bars and Line */}
            {years.map((year, index) => {
              const landHeight = (landData[index] / maxValue) * chartHeight;
              const localityHeight = (localityData[index] / maxValue) * chartHeight;
              const x = 50 + index * spacing;
              const barX = x - barWidth / 2;

              return (
                <g key={year}>
                  {/* Land Bar */}
                  <rect
                    x={barX}
                    y={chartHeight - landHeight + 20}
                    width={barWidth}
                    height={isVisible ? landHeight : 0}
                    fill="url(#landGradient)"
                    opacity="0.9"
                    style={{
                      transition: `height 0.8s ease-out ${index * 0.1}s`,
                    }}
                  />
                  
                  {/* Locality Line Point */}
                  <circle
                    cx={x}
                    cy={chartHeight - localityHeight + 20}
                    r="4"
                    fill="url(#localityGradient)"
                    opacity={isVisible ? 1 : 0}
                    style={{
                      transition: `opacity 0.5s ease-out ${index * 0.1 + 0.3}s`,
                    }}
                  />
                  
                  {/* Locality Line */}
                  {index > 0 && (
                    <line
                      x1={50 + (index - 1) * spacing}
                      y1={chartHeight - (localityData[index - 1] / maxValue) * chartHeight + 20}
                      x2={x}
                      y2={chartHeight - localityHeight + 20}
                      stroke="url(#localityGradient)"
                      strokeWidth="2"
                      opacity={isVisible ? 1 : 0}
                      style={{
                        transition: `opacity 0.5s ease-out ${index * 0.1 + 0.3}s`,
                      }}
                    />
                  )}

                  {/* Year labels */}
                  <text
                    x={x}
                    y={chartHeight + 35}
                    fill="rgba(255,255,255,0.8)"
                    fontSize="10"
                    textAnchor="middle"
                  >
                    {year}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Legend */}
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ background: 'linear-gradient(45deg, #D4AF37, #F5EC9B)' }}></div>
              <span className="text-white text-sm">LAND</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ background: '#20B2AA' }}></div>
              <span className="text-white text-sm">LOCALITY</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!propertyId && !cardData && !isPropertyLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F5ED] px-6 text-center">
        <p className="text-3xl font-semibold text-[#0E5B4C]">Select a property to continue</p>
        <p className="mt-3 text-gray-600 max-w-xl">
          Choose any property from the listings or map search to view its complete details and immersive media.
        </p>
        <button
          type="button"
          className="mt-6 px-6 py-3 rounded-full text-white font-semibold shadow-md"
          style={{ background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)' }}
          onClick={() => navigate('/v3/map-search')}
        >
          Browse properties
        </button>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F5ED] px-6 text-center">
        <p className="text-3xl font-semibold text-[#0E5B4C]">
          {propertyError ? 'We could not load this property' : 'Fetching property details'}
        </p>
        <p className="mt-3 text-gray-600 max-w-xl">
          {propertyError || 'Please hold on while we retrieve the latest listing data.'}
        </p>
        <div className="mt-6 flex flex-wrap gap-3 justify-center">
          {propertyError && (
            <button
              type="button"
              className="px-5 py-2.5 rounded-full border border-[#0E5B4C] text-[#0E5B4C] font-semibold hover:bg-white"
              onClick={handleRetry}
            >
              Try again
            </button>
          )}
          <button
            type="button"
            className="px-5 py-2.5 rounded-full text-white font-semibold shadow-md"
            style={{ background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)' }}
            onClick={() => navigate('/v3/map-search')}
          >
            Back to search
          </button>
        </div>
        {isPropertyLoading && (
          <div className="mt-8 w-10 h-10 border-2 border-[#0E5B4C]/20 border-t-[#0E5B4C] rounded-full animate-spin" />
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1600px] px-3 md:px-6 py-4 md:py-6">
      <div className="rounded-[22px]">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_540px] gap-4">
          {/* Left: Hero image with title + price banner */}
          <div className="relative rounded-[22px] overflow-hidden border border-gray-200">
            <div className="relative w-full h-full min-h-[480px] md:min-h-[600px]">
              <img src={property?.image || sampleImg} alt={property?.title} className="absolute inset-0 w-full h-full object-cover" />
              <img src={heroCenterIcon} alt="center icon" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 md:w-16 md:h-16 pointer-events-none select-none" />
              
              {/* Back button in top left corner */}
              <button
                onClick={() => navigate(-1)}
                className="absolute top-4 left-4 flex items-center text-gray-600 hover:text-gray-800 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg transition-colors shadow-sm hover:bg-white"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                <span>Back</span>
              </button>
            </div>
            <div className="absolute left-0 right-0 bottom-0">
              <div className="px-0 md:px-0 pb-0">
                <div className="w-full rounded-none md:rounded-none px-5 md:px-8 py-4 md:py-5 text-white" style={{ background: 'linear-gradient(111.83deg, rgba(0, 66, 54, 0.8) 11.73%, rgba(0, 126, 103, 0.8) 96.61%)' }}>
                  <div className="text-left" style={{ fontFamily: 'DM Serif Display, serif' }}>
                    <div className="text-lg md:text-2xl">
                      {property?.title || 'Property Title'}
                    </div>
                    <div className="mt-1 md:mt-2 text-2xl md:text-4xl">
                      {property?.isCardData && property?.cardPrice ? (
                        <span
                          style={{
                            background: 'linear-gradient(90deg, #A3733D 0%, #F5EC9B 76.92%)',
                            WebkitBackgroundClip: 'text',
                            backgroundClip: 'text',
                            color: 'transparent',
                            WebkitTextFillColor: 'transparent',
                            display: 'inline-block',
                          }}
                        >
                          Rs. {property.cardPrice} Cr
                        </span>
                      ) : (
                        <Currency
                          value={property?.price || 0}
                          style={{
                            background: 'linear-gradient(90deg, #A3733D 0%, #F5EC9B 76.92%)',
                            WebkitBackgroundClip: 'text',
                            backgroundClip: 'text',
                            color: 'transparent',
                            WebkitTextFillColor: 'transparent',
                            display: 'inline-block',
                          }}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions under hero, constrained to hero column width */}
          <div className="lg:col-start-1 lg:row-start-2 lg:col-span-1">
            <div className="flex flex-wrap items-start gap-3 md:gap-4">
              <div
                className="flex flex-col items-start w-[92px] md:w-[96px] cursor-pointer"
                onClick={() => window.open(VR_TOUR_URL, '_blank', 'noopener,noreferrer')}
              >
                <img src={iconVrTour} alt="VR Tour" className="w-16 h-16 md:w-20 md:h-20 rounded-[18px] object-cover shadow" />
                <div className="mt-2 text-[#0E5B4C] font-semibold text-sm md:text-base">VR Tour</div>
              </div>
              <div className="flex flex-col items-start w-[92px] md:w-[96px] cursor-pointer" onClick={handlePhotosClick}>
                <img src={iconPhotos} alt="Photos" className="w-16 h-16 md:w-20 md:h-20 rounded-[18px] object-cover shadow" />
                <div className="mt-2 text-[#0E5B4C] font-semibold text-sm md:text-base">Photos</div>
              </div>
              <div className="flex flex-col items-start w-[92px] md:w-[96px] cursor-pointer" onClick={() => setIsVideosModalOpen(true)}>
                <img src={iconVideos} alt="Videos" className="w-16 h-16 md:w-20 md:h-20 rounded-[18px] object-cover shadow" />
                <div className="mt-2 text-[#0E5B4C] font-semibold text-sm md:text-base">Videos</div>
              </div>
              <div className="flex flex-col items-start w-[92px] md:w-[96px] cursor-pointer" onClick={() => setIsFloorPlanModalOpen(true)}>
                <img src={iconFloorplan} alt="Floor plan" className="w-16 h-16 md:w-20 md:h-20 rounded-[18px] object-cover shadow" />
                <div className="mt-2 text-[#0E5B4C] font-semibold text-sm md:text-base">Floor plan</div>
              </div>
              <div className="flex flex-col items-start w-[92px] md:w-[96px] cursor-pointer" onClick={() => setIsAIForecastModalOpen(true)}>
                <img src={iconAIForecast} alt="AI Forecast" className="w-16 h-16 md:w-20 md:h-20 rounded-[18px] object-cover shadow" />
                <div className="mt-2 text-[#0E5B4C] font-semibold text-sm md:text-base">AI Forecast</div>
            </div>
          </div>

            {/* Info bar: address + price, then next line builder + agent + CTA. Directly after action buttons */}
            <div className="p-4 border-t border-b border-gray-200">
              {/* Line 1: title, address, MLS ID, price */}
              <div className="flex flex-col gap-1">
                <div className="text-[#0E5B4C] font-semibold text-xl" style={{ fontFamily: 'DM Serif Display, serif' }}>{property?.title}</div>
                <div className="text-sm text-gray-600">{property?.location}</div>
                {rawProperty?.property_mls_id && (
                  <div className="mt-2 mb-1">
                    <span className="inline-block px-3 py-1 rounded-md text-sm font-semibold" style={{ 
                      background: 'linear-gradient(111.83deg, rgba(0, 66, 54, 0.1) 11.73%, rgba(0, 126, 103, 0.1) 96.61%)',
                      color: '#004236',
                      border: '1px solid rgba(0, 66, 54, 0.2)'
                    }}>
                      MLS ID: {rawProperty.property_mls_id}
                    </span>
                  </div>
                )}
                <div className="mt-1 text-3xl font-extrabold text-[#0E5B4C]" style={{ fontFamily: 'DM Serif Display, serif' }}>
                  {property?.isCardData && property?.cardPrice ? (
                    `Rs. ${property.cardPrice} Cr`
                  ) : (
                    `$${property.price.toLocaleString()}`
                  )}
                </div>
              </div>

              {/* Line 2: builder + agent + CTA */}
              <div className="mt-4 flex items-center gap-16 flex-wrap">
                {/* Builder block */}
                {property?.builder && builderCount > 0 ? (
                  <div className="flex items-start gap-3">
                    <img src={sampleImg} alt="builder" className="w-12 h-12 rounded-[10px] object-cover" />
                    <div className="leading-tight">
                      <div className="text-[#0E5B4C] font-semibold text-lg">{property.builder}</div>
                      <div className="flex items-center gap-4">
                        <div className="text-sm text-gray-600">{builderCount} properties listed</div>
                        <button className="text-[#0E5B4C] underline text-sm">View all</button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-[10px] bg-gray-100 flex items-center justify-center">
                      <User className="w-6 h-6 text-gray-400" />
                    </div>
                    <div className="leading-tight">
                      <div className="text-sm text-gray-600">No builder details available</div>
                    </div>
                  </div>
                )}

                {/* Agent block */}
                <div className="flex items-center gap-3 min-w-0">
                  {agentDetails?.profilePhoto ? (
                    <img 
                      src={agentDetails.profilePhoto} 
                      alt="agent" 
                      className="w-12 h-12 rounded-[10px] object-cover" 
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-[10px] bg-gray-100 flex items-center justify-center">
                      <User className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                  <div className="text-sm leading-tight min-w-0">
                    <div className="font-semibold text-black text-base truncate flex items-center gap-2">
                      {agentDetails?.name || 'Listing Agent'}
                      <div 
                        className="flex-shrink-0 flex items-center justify-center"
                        style={{ 
                          width: '24px',
                          height: '24px',
                          filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2))'
                        }}
                      >
                        <svg 
                          width="24" 
                          height="24" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <defs>
                            <linearGradient id="goldBorder" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#905E26" />
                              <stop offset="50%" stopColor="#F5EC9B" />
                              <stop offset="100%" stopColor="#905E26" />
                            </linearGradient>
                            <linearGradient id="greenFill" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor="#004236" />
                              <stop offset="100%" stopColor="#003028" />
                            </linearGradient>
                          </defs>
                          {/* 12-pointed star/cog shape with gold gradient border */}
                          <polygon 
                            points="12,2 13.5,4.5 16.5,5 14.5,7 15,10 12,8.5 9,10 9.5,7 7.5,5 10.5,4.5" 
                            fill="url(#goldBorder)"
                            stroke="url(#goldBorder)"
                            strokeWidth="0.5"
                          />
                          <polygon 
                            points="12,2 13.5,4.5 16.5,5 14.5,7 15,10 12,8.5 9,10 9.5,7 7.5,5 10.5,4.5" 
                            fill="url(#goldBorder)"
                            stroke="url(#goldBorder)"
                            strokeWidth="0.5"
                            transform="rotate(30 12 12)"
                          />
                          <polygon 
                            points="12,2 13.5,4.5 16.5,5 14.5,7 15,10 12,8.5 9,10 9.5,7 7.5,5 10.5,4.5" 
                            fill="url(#goldBorder)"
                            stroke="url(#goldBorder)"
                            strokeWidth="0.5"
                            transform="rotate(60 12 12)"
                          />
                          <polygon 
                            points="12,2 13.5,4.5 16.5,5 14.5,7 15,10 12,8.5 9,10 9.5,7 7.5,5 10.5,4.5" 
                            fill="url(#goldBorder)"
                            stroke="url(#goldBorder)"
                            strokeWidth="0.5"
                            transform="rotate(90 12 12)"
                          />
                          <polygon 
                            points="12,2 13.5,4.5 16.5,5 14.5,7 15,10 12,8.5 9,10 9.5,7 7.5,5 10.5,4.5" 
                            fill="url(#goldBorder)"
                            stroke="url(#goldBorder)"
                            strokeWidth="0.5"
                            transform="rotate(120 12 12)"
                          />
                          <polygon 
                            points="12,2 13.5,4.5 16.5,5 14.5,7 15,10 12,8.5 9,10 9.5,7 7.5,5 10.5,4.5" 
                            fill="url(#goldBorder)"
                            stroke="url(#goldBorder)"
                            strokeWidth="0.5"
                            transform="rotate(150 12 12)"
                          />
                          <polygon 
                            points="12,2 13.5,4.5 16.5,5 14.5,7 15,10 12,8.5 9,10 9.5,7 7.5,5 10.5,4.5" 
                            fill="url(#goldBorder)"
                            stroke="url(#goldBorder)"
                            strokeWidth="0.5"
                            transform="rotate(180 12 12)"
                          />
                          <polygon 
                            points="12,2 13.5,4.5 16.5,5 14.5,7 15,10 12,8.5 9,10 9.5,7 7.5,5 10.5,4.5" 
                            fill="url(#goldBorder)"
                            stroke="url(#goldBorder)"
                            strokeWidth="0.5"
                            transform="rotate(210 12 12)"
                          />
                          <polygon 
                            points="12,2 13.5,4.5 16.5,5 14.5,7 15,10 12,8.5 9,10 9.5,7 7.5,5 10.5,4.5" 
                            fill="url(#goldBorder)"
                            stroke="url(#goldBorder)"
                            strokeWidth="0.5"
                            transform="rotate(240 12 12)"
                          />
                          <polygon 
                            points="12,2 13.5,4.5 16.5,5 14.5,7 15,10 12,8.5 9,10 9.5,7 7.5,5 10.5,4.5" 
                            fill="url(#goldBorder)"
                            stroke="url(#goldBorder)"
                            strokeWidth="0.5"
                            transform="rotate(270 12 12)"
                          />
                          <polygon 
                            points="12,2 13.5,4.5 16.5,5 14.5,7 15,10 12,8.5 9,10 9.5,7 7.5,5 10.5,4.5" 
                            fill="url(#goldBorder)"
                            stroke="url(#goldBorder)"
                            strokeWidth="0.5"
                            transform="rotate(300 12 12)"
                          />
                          <polygon 
                            points="12,2 13.5,4.5 16.5,5 14.5,7 15,10 12,8.5 9,10 9.5,7 7.5,5 10.5,4.5" 
                            fill="url(#goldBorder)"
                            stroke="url(#goldBorder)"
                            strokeWidth="0.5"
                            transform="rotate(330 12 12)"
                          />
                          {/* Inner dark green circle */}
                          <circle cx="12" cy="12" r="7.5" fill="url(#greenFill)" />
                          {/* White checkmark - smaller */}
                          <path 
                            d="M10 12.5L9 11.5L8 12.5L10 14.5L16 8.5L15 7.5L10 12.5Z" 
                            fill="white"
                            stroke="white"
                            strokeWidth="1"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    </div>
                    {agentDetails?.phone && (
                      <div className="text-xs text-gray-600 truncate">M : {agentDetails.phone}</div>
                    )}
                    {agentDetails?.email && (
                      <div className="text-xs text-gray-600 truncate">E : {agentDetails.email}</div>
                    )}
                  </div>
                </div>

                {/* Contact Agent button after agent details */}
                <button
                  className="px-5 py-2 rounded-[12px] font-semibold shadow-md"
                  style={{
                    background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)',
                    border: '1.5px solid #A3733D',
                  }}
                  onClick={handleOpenContactModal}
                >
                  <span style={{
                    background: 'linear-gradient(90deg, #A3733D 0%, #F5EC9B 76.92%)',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    color: 'transparent',
                    WebkitTextFillColor: 'transparent',
                    display: 'inline-block',
                  }}>
                    {property?.builder === 'Skyven Builder' || rawProperty?.builder_name === 'Skyven Builder' || (property?.title && property.title.toLowerCase().includes('skyven')) ? 'Contact Builder' : 'Contact Agent'}
                  </span>
                </button>
              </div>
            </div>

            {/* Property Details Section - New tabbed design */}
            <div className={`mt-4 transition-all duration-300 ${isSticky ? 'pt-16' : ''}`}>
              {/* Tabbed Navigation */}
              <div 
                ref={tabsRef}
                id="property-tabs"
                className={`flex items-start mb-8 transition-all duration-300 ${
                  isSticky 
                    ? 'fixed top-16 z-40 bg-white shadow-lg' 
                    : ''
                }`}
                style={isSticky ? {
                  paddingTop: '16px',
                  paddingBottom: '16px',
                  paddingLeft: '12px',
                  paddingRight: '24px',
                  left: '12px',
                  right: 'calc(540px + 16px + 24px)', // Right column width + gap + right padding
                  maxWidth: 'calc(1600px - 540px - 16px - 48px)', // Max width minus right column, gap, and paddings
                  width: 'auto'
                } : {}}
              >
                <div className="flex space-x-8">
                  {/* Overview Tab */}
                  <div 
                    className="flex flex-col items-center cursor-pointer"
                    onClick={() => handleTabClick('overview')}
                  >
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-2" style={{ 
                      background: activeSection === 'overview' 
                        ? 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)'
                        : 'rgba(245, 236, 155, 0.2)',
                      boxShadow: activeSection === 'overview'
                        ? '5px 5px 5px 0px rgba(255, 244, 146, 0.2) inset, -5px -5px 10px 0px rgba(255, 184, 103, 0.15) inset, 10px 10px 10px 0px rgba(12, 101, 110, 0.1)'
                        : '3px 3px 3px 0px rgba(144, 94, 38, 0.2) inset, -3px -3px 3px 0px rgba(239, 234, 197, 1) inset'
                    }}>
                      <img src={tabOverviewIcon} alt="Overview" className="w-6 h-6" />
                    </div>
                    <span className={`text-sm font-semibold ${activeSection === 'overview' ? 'text-[#004236]' : 'text-gray-600'}`}>Overview</span>
                    {activeSection === 'overview' && (
                      <div className="w-full h-0.5 mt-1" style={{ background: 'linear-gradient(90deg, #A3733D 0%, #F5EC9B 76.92%)' }}></div>
                    )}
                  </div>

                  {/* Location Tab */}
                  <div 
                    className="flex flex-col items-center cursor-pointer"
                    onClick={() => handleTabClick('location')}
                  >
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-2" style={{ 
                      background: activeSection === 'location' 
                        ? 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)'
                        : 'rgba(245, 236, 155, 0.2)',
                      boxShadow: activeSection === 'location'
                        ? '5px 5px 5px 0px rgba(255, 244, 146, 0.2) inset, -5px -5px 10px 0px rgba(255, 184, 103, 0.15) inset, 10px 10px 10px 0px rgba(12, 101, 110, 0.1)'
                        : '3px 3px 3px 0px rgba(144, 94, 38, 0.2) inset, -3px -3px 3px 0px rgba(239, 234, 197, 1) inset'
                    }}>
                      <img src={tabLocationIcon} alt="Location" className="w-6 h-6" />
                    </div>
                    <span className={`text-sm font-semibold ${activeSection === 'location' ? 'text-[#004236]' : 'text-gray-600'}`}>Location</span>
                    {activeSection === 'location' && (
                      <div className="w-full h-0.5 mt-1" style={{ background: 'linear-gradient(90deg, #A3733D 0%, #F5EC9B 76.92%)' }}></div>
                    )}
                  </div>

                  {/* Property Details Tab */}
                  <div 
                    className="flex flex-col items-center cursor-pointer"
                    onClick={() => handleTabClick('property-details')}
                  >
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-2" style={{ 
                      background: activeSection === 'property-details' 
                        ? 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)'
                        : 'rgba(245, 236, 155, 0.2)',
                      boxShadow: activeSection === 'property-details'
                        ? '5px 5px 5px 0px rgba(255, 244, 146, 0.2) inset, -5px -5px 10px 0px rgba(255, 184, 103, 0.15) inset, 10px 10px 10px 0px rgba(12, 101, 110, 0.1)'
                        : '3px 3px 3px 0px rgba(144, 94, 38, 0.2) inset, -3px -3px 3px 0px rgba(239, 234, 197, 1) inset'
                    }}>
                      <img src={tabPropertyDetailsIcon} alt="Property Details" className="w-6 h-6" />
                    </div>
                    <span className={`text-sm font-semibold ${activeSection === 'property-details' ? 'text-[#004236]' : 'text-gray-600'}`}>Property Details</span>
                    {activeSection === 'property-details' && (
                      <div className="w-full h-0.5 mt-1" style={{ background: 'linear-gradient(90deg, #A3733D 0%, #F5EC9B 76.92%)' }}></div>
                    )}
                  </div>

                </div>
              </div>

              {/* Overview Section */}
              <div id="overview">
                {/* Main Heading */}
                <h2 className="text-2xl font-bold text-[#004236] mb-6" style={{ fontFamily: 'DM Serif Display, serif' }}>
                  About - {rawProperty?.name || property?.title || property?.location || 'Property'}
                </h2>

                {/* Description Paragraphs */}
                <div className="space-y-4 text-gray-700 leading-relaxed mb-8">
                  {rawProperty?.details ? (
                    rawProperty.details.split('\n').filter((para: string) => para.trim()).map((paragraph: string, index: number) => (
                      <p key={index}>
                        {paragraph.trim()}
                      </p>
                    ))
                  ) : (
                    <>
                      <p>
                        This luxurious modern villa offers breathtaking views of the Caribbean Sea, Punta Espada golf course, and a majestic cliff. It features 5 master suite bedrooms, 7 bathrooms, and 3 kitchens across 2 levels within a 1,330 m² (14,316 ft²) architectural masterpiece.
                      </p>
                      
                      <p>
                        The design maximizes natural light and views with a grand double-height entrance hall. The open, bright layout incorporates materials like coral and marble and seamlessly integrates indoor and outdoor spaces.
                      </p>
                      
                      <p>
                        The first floor divides into a social and common wing and a family wing with 2 master-suite bedrooms. The upper floor houses 3 more master-suite bedrooms, including one with stunning sea, golf course, and cliff views. A study living room with a balcony and a corridor overlooking the double-height main living room completes this exceptional villa.
                      </p>
                    </>
                  )}
                </div>

                {/* Property Information Section */}
                <div className="flex items-center space-x-16">
                  {/* Property Type */}
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 flex items-center justify-center">
                      <img src={iconBeds} alt="Property Type" className="w-8 h-8" />
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-500 uppercase">PROPERTY TYPE</div>
                      <div className="text-lg font-bold text-black">{property?.type || 'Single Family Home'}</div>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 flex items-center justify-center">
                      <img src={iconInterior} alt="Status" className="w-8 h-8" />
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-500 uppercase">STATUS</div>
                      <div className="text-lg font-bold text-black">Available</div>
                    </div>
                  </div>

                  {/* Year Built */}
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 flex items-center justify-center">
                      <img src={iconBeds} alt="Year Built" className="w-8 h-8" />
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-500 uppercase">YEAR BUILT</div>
                      <div className="text-lg font-bold text-black">{property?.yearBuilt || '2024'}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Location Section */}
              <div id="location" className={`mt-8 ${isSticky ? 'pt-12' : ''}`}>
                <LocationMap
                  property={{
                    lat: property.lat,
                    lng: property.lng,
                    title: property.title,
                    price: property.price,
                    location: property.location,
                    image: property.image || sampleImg,
                    isCardData: property.isCardData,
                    cardPrice: property.cardPrice,
                  }}
                />
              </div>

              {/* Property Details Section */}
              <div id="property-details" className={`mt-8 ${isSticky ? 'pt-12' : ''}`}>
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-[#004236] mb-3" style={{ fontFamily: 'DM Serif Display, serif' }}>
                    Amenities & Features
                  </h2>
                  <div className="w-[262px] h-0.5" style={{ background: 'linear-gradient(90deg, #905E26 0%, #F5EC9B 25.82%, #905E26 100%)' }}></div>
                </div>

                {/* Interior Section */}
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-black mb-4 px-4 py-2 rounded" style={{ background: 'rgba(241, 241, 241, 1)' }}>Interior</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">FEATURES</div>
                      <div className="text-sm text-gray-700 font-bold">
                        {property?.indoorFeatures && property.indoorFeatures.length > 0
                          ? property.indoorFeatures.join(', ')
                          : 'No features listed'}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">BEDROOMS</div>
                      <div className="text-sm text-gray-700 font-bold">{property?.beds || 5}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">PARTIAL BATH</div>
                      <div className="text-sm text-gray-700 font-bold">1</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">FULL BATHROOMS</div>
                      <div className="text-sm text-gray-700 font-bold">{property?.baths || 6}</div>
                    </div>
                    <div className="md:col-span-2">
                      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">APPLIANCES</div>
                      <div className="text-sm text-gray-700 font-bold">
                        {property?.applianceTypes && property.applianceTypes.length > 0
                          ? property.applianceTypes.join(', ')
                          : 'No appliances listed'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Features Section */}
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-black mb-4 px-4 py-2 rounded" style={{ background: 'rgba(241, 241, 241, 1)' }}>Additional Features</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">FEATURES</div>
                      <div className="text-sm text-gray-700 font-bold">
                        {(() => {
                          const outdoorItems = property?.outdoorAmenities && property.outdoorAmenities.length > 0
                            ? property.outdoorAmenities
                            : [];
                          // Extract view type names (they may be objects with name property or strings)
                          const viewItems = property?.viewTypes && property.viewTypes.length > 0
                            ? property.viewTypes.map((v: any) => typeof v === 'string' ? v : v.name || v)
                            : [];
                          const allItems = [...outdoorItems, ...viewItems];
                          return allItems.length > 0
                            ? allItems.join(', ')
                            : 'No features listed';
                        })()}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">COMMUNITY FEATURES</div>
                      <div className="text-sm text-gray-700 font-bold">
                        {property?.communityTypes && property.communityTypes.length > 0
                          ? property.communityTypes.join(', ')
                          : 'No community features listed'}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">PARKING LOT</div>
                      <div className="text-sm text-gray-700 font-bold">
                        {property?.parkingTypes && property.parkingTypes.length > 0
                          ? property.parkingTypes.join(', ')
                          : 'No parking listed'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Building Section */}
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-black mb-4 px-4 py-2 rounded" style={{ background: 'rgba(241, 241, 241, 1)' }}>Building</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">YEAR BUILT</div>
                      <div className="text-sm text-gray-700 font-bold">{property?.yearBuilt || '2024'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">STYLE</div>
                      <div className="text-sm text-gray-700 font-bold">
                        {property?.architecturalStyles && property.architecturalStyles.length > 0
                          ? property.architecturalStyles.join(', ')
                          : 'No style listed'}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">TOTAL SQ. FT.</div>
                      <div className="text-sm text-gray-700 font-bold">{property?.sqft ? property.sqft.toLocaleString() : '14, 316'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">LOT SIZE</div>
                      <div className="text-sm text-gray-700 font-bold">
                        {convertLotSizeToAcres(property?.lotSqft, property?.lotSizeUom) || 'No lot size listed'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Listing Type Section */}
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-black mb-4 px-4 py-2 rounded" style={{ background: 'rgba(241, 241, 241, 1)' }}>Listing Type</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">PROPERTY ID</div>
                      <div className="text-sm text-gray-700 font-bold">VVP12345</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">PROPERTY TYPE</div>
                      <div className="text-sm text-gray-700 font-bold">{property?.propertyType || 'Single Family Homes'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">MARKETED BY</div>
                      <div className="text-sm text-gray-700 font-bold">Agent : Henry Johns</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">STATUS</div>
                      <div className="text-sm text-gray-700 font-bold">{property?.propertyStatus || 'Available'}</div>
                    </div>
                  </div>
                </div>

                {/* Floor Plan Section */}
                <div>
                  <h3 className="text-xl font-semibold text-black mb-4 px-4 py-2 rounded" style={{ background: 'rgba(241, 241, 241, 1)' }}>Floor Plan</h3>
                  <div className="bg-white rounded-lg p-4 space-y-6">
                    <div>
                      {propertyFloorPlans && propertyFloorPlans.length > 0 ? (
                        <div className={propertyFloorPlans.length > 1 ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : ''}>
                          {propertyFloorPlans.map((src, idx) => (
                            <button
                              key={`${src}-${idx}`}
                              type="button"
                              className="w-full text-left"
                              onClick={() => {
                                setCurrentFloorPlanIndex(idx);
                                setIsFloorPlanModalOpen(true);
                              }}
                              aria-label={`Open floor plan ${idx + 1}`}
                            >
                              <img
                                src={src}
                                alt={`Floor Plan ${idx + 1}`}
                                className="w-full h-auto rounded-lg object-contain"
                                style={{ maxHeight: '600px' }}
                              />
                            </button>
                          ))}
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="w-full text-left"
                          onClick={() => {
                            setCurrentFloorPlanIndex(0);
                            setIsFloorPlanModalOpen(true);
                          }}
                          aria-label="Open floor plan"
                        >
                          <img
                            src={floorPlanImage}
                            alt="3D Floor Plan"
                            className="w-full h-auto rounded-lg"
                          />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Mortgage card OUTSIDE the grid, placed after it but aligned to right column width */}
          <div className="-mt-6 lg:grid lg:grid-cols-[minmax(0,1fr)_540px]">
            {/* Left side: Empty for now since Property Details moved up */}
            <div className="pr-4">
            </div>
            
            <div className="lg:col-span-1">
              <div className="rounded-[22px] p-4 md:p-5 text-white shadow-lg w-full sticky top-24 z-10" style={{ background: 'var(--Green, rgba(0, 66, 54, 1))' }}>
                 {/* Top metrics */}
                 <div className="bg-white rounded-[16px] border border-gray-200 p-3 mb-3 text-black">
                   <div className="grid grid-cols-2 gap-3">
                     <div className="flex items-center gap-3 p-2">
                       <div className="w-12 h-12 rounded-[6px] flex items-center justify-center" style={{ 
                         background: 'rgba(245, 236, 155, 0.2)',
                         boxShadow: '3px 3px 3px 0px rgba(144, 94, 38, 0.2) inset, -3px -3px 3px 0px rgba(239, 234, 197, 1) inset'
                       }}>
                          <img src={iconBeds} alt="Beds" className="w-8 h-8" />
                       </div>
                       <div>
                         <div className="text-[11px] text-gray-500 uppercase">BEDS</div>
                         <div className="text-sm font-semibold text-black">{property?.beds} Beds</div>
                       </div>
                     </div>
                     <div className="flex items-center gap-3 p-2">
                       <div className="w-12 h-12 rounded-[6px] flex items-center justify-center" style={{ 
                         background: 'rgba(245, 236, 155, 0.2)',
                         boxShadow: '3px 3px 3px 0px rgba(144, 94, 38, 0.2) inset, -3px -3px 3px 0px rgba(239, 234, 197, 1) inset'
                       }}>
                          <img src={iconInterior} alt="Interior" className="w-8 h-8" />
                       </div>
                       <div>
                         <div className="text-[11px] text-gray-500 uppercase">INTERIOR</div>
                         <div className="text-sm font-semibold text-black">{(property?.sqft || 0).toLocaleString()} Sq. Ft.</div>
                       </div>
                     </div>
                   </div>
                   <div className="border-t border-gray-200 my-3"></div>
                   <div className="grid grid-cols-2 gap-3">
                     <div className="flex items-center gap-3 p-2">
                       <div className="w-12 h-12 rounded-[6px] flex items-center justify-center" style={{ 
                         background: 'rgba(245, 236, 155, 0.2)',
                         boxShadow: '3px 3px 3px 0px rgba(144, 94, 38, 0.2) inset, -3px -3px 3px 0px rgba(239, 234, 197, 1) inset'
                       }}>
                          <img src={iconBath} alt="Bath" className="w-8 h-8" />
                       </div>
                       <div>
                         <div className="text-[11px] text-gray-500 uppercase">BATH</div>
                         <div className="text-sm font-semibold text-black">{property?.baths} Bathrooms</div>
                       </div>
                     </div>
                     <div className="flex items-center gap-3 p-2">
                       <div className="w-12 h-12 rounded-[6px] flex items-center justify-center" style={{ 
                         background: 'rgba(245, 236, 155, 0.2)',
                         boxShadow: '3px 3px 3px 0px rgba(144, 94, 38, 0.2) inset, -3px -3px 3px 0px rgba(239, 234, 197, 1) inset'
                       }}>
                          <img src={iconBeds} alt="Exterior" className="w-8 h-8" />
                       </div>
                       <div>
                         <div className="text-[11px] text-gray-500 uppercase">EXTERIOR</div>
                         <div className="text-sm font-semibold text-black">{(property?.lotSqft || property?.sqft || 0).toLocaleString()} Sq. Ft.</div>
                       </div>
                     </div>
                   </div>
                 </div>

                {/* Tabs */}
                <div className="mb-5 grid grid-cols-2 w-full border-b border-white/20">
                  <button
                    type="button"
                    onClick={() => setActiveTab('mortgage')}
                    className={`justify-self-start relative px-4 pb-4 text-base md:text-lg font-semibold ${activeTab === 'mortgage' ? 'text-white' : 'text-white/80'}`}
                  >
                    Mortgage Calculator
                    {activeTab === 'mortgage' && (
                      <span className="absolute left-0 right-0 -bottom-[3px] h-[4px] rounded-full" style={{ background: 'linear-gradient(90deg, #A3733D 0%, #F5EC9B 76.92%)' }} />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('appreciation')}
                    className={`justify-self-start relative px-4 pb-4 text-base md:text-lg font-semibold ${activeTab === 'appreciation' ? 'text-white' : 'text-white/80'}`}
                  >
                    Appreciation
                    {activeTab === 'appreciation' && (
                      <span className="absolute left-0 right-0 -bottom-[3px] h-[4px] rounded-full" style={{ background: 'linear-gradient(90deg, #A3733D 0%, #F5EC9B 76.92%)' }} />
                    )}
                  </button>
                </div>

                {activeTab === 'mortgage' ? (
                  <div className="grid md:grid-cols-2 gap-4 items-start">
                    {/* Mortgage inputs (dark style) */}
                    <div>
                      <div className="mt-2 grid gap-3 text-sm">
                         {/* Row: Property valuation + Down payment */}
                         <div className="grid grid-cols-2 gap-16 md:gap-24">
                           <div>
                             <div className="opacity-90 whitespace-nowrap">Property Valuation</div>
                            <div className="font-semibold">
                              {property?.isCardData && property?.cardPrice ? (
                                `Rs. ${property.cardPrice} Cr`
                              ) : (
                                `$${property.price.toLocaleString()}`
                              )}
                            </div>
                           </div>
                           <div>
                             <div className="opacity-90 whitespace-nowrap">Down payment</div>
                             <div className="font-semibold">{isSkyvenProperty ? `Rs. ${downPayment.toLocaleString?.()}` : `$${downPayment.toLocaleString?.()}`}</div>
                           </div>
                         </div>

                        {/* Loan amount */}
                        <label className="block w-full max-w-[260px]">
                          <div className="opacity-90">Loan Amount</div>
                          <div className="flex w-full max-w-[260px]">
                            <input value={loanAmount}
                              onChange={e => {
                                const v = Number(e.target.value.replace(/[^0-9]/g, '')) || 0;
                                setLoanAmount(v);
                                const price = property?.price || 0;
                                setDownPayment(Math.max(0, price - v));
                              }}
                              className="flex-1 px-3 py-2 rounded-[10px] border border-white/30 text-white placeholder-white/70 outline-none" style={{ background: 'linear-gradient(111.83deg, rgba(0, 66, 54, 0.5) 11.73%, rgba(0, 126, 103, 0.5) 96.61%)' }} />
                            <div className="w-[100px]"></div>
                          </div>
                        </label>

                        {/* Interest */}
                        <label className="block w-full max-w-[260px]">
                          <div className="opacity-90">Interest %</div>
                          <div className="flex w-full max-w-[260px]">
                            <input value={interestPct}
                              onChange={e => setInterestPct(Number(e.target.value) || 0)}
                              className="flex-1 px-3 py-2 rounded-[10px] border border-white/30 text-white placeholder-white/70 outline-none" style={{ background: 'linear-gradient(111.83deg, rgba(0, 66, 54, 0.5) 11.73%, rgba(0, 126, 103, 0.5) 96.61%)' }} />
                            <div className="w-[100px]"></div>
                          </div>
                        </label>

                        {/* Loan Tenure (next row) */}
                        <label className="block w-full max-w-[260px]">
                          <div className="opacity-90">Loan Tenure</div>
                          <div className="flex w-full max-w-[215px]">
                            <input
                              value={loanYears}
                              onChange={e => setLoanYears(Number(e.target.value) || 0)}
                              className="flex-1 min-w-0 px-3 py-2 rounded-l-[10px] border border-white/30 text-white placeholder-white/70 outline-none"
                              style={{
                                background:
                                  "linear-gradient(111.83deg, rgba(0, 66, 54, 0.5) 11.73%, rgba(0, 126, 103, 0.5) 96.61%)",
                              }}
                            />
                            <select
                              value={loanUnit}
                              onChange={e =>
                                setLoanUnit(e.target.value as "years" | "months")
                              }
                              className="w-[80px] px-2 py-2 rounded-r-[10px] border border-white/30 text-white outline-none text-sm"
                              style={{
                                background:
                                  "linear-gradient(111.83deg, rgba(0, 66, 54, 0.5) 11.73%, rgba(0, 126, 103, 0.5) 96.61%)",
                              }}
                            >
                              <option value="years">Year</option>
                              <option value="months">Month</option>
                            </select>
                          </div>
                        </label>

                      </div>
                    </div>

                    {/* Donut chart */}
                    <div className="flex flex-col items-center justify-center mt-6 md:mt-8">
                      <DonutChart
                        values={[
                          { label: 'INTEREST', value: mortgage.totalInterest, color: 'rgba(47, 137, 121, 0.7)' },
                          { label: 'PRINCIPAL', value: mortgage.principal, color: 'url(#gradPrincipal)' },
                        ]}
                        size={180}
                        isActive={activeTab === 'mortgage'}
                        center={(
                          <div className="text-center">
                            <div className="text-xs opacity-80">MONTHLY PAYMENT</div>
                            <div className="text-xl font-extrabold">{isSkyvenProperty ? `Rs. ${mortgage.monthly.toFixed(2)}` : `$${mortgage.monthly.toFixed(2)}`}</div>
                          </div>
                        )}
                      />
                      <div className="mt-2 text-xs opacity-90 flex items-center gap-4">
                        <span className="inline-flex items-center gap-1"><span className="inline-block w-3 h-2 rounded-full" style={{ background: 'rgba(47, 137, 121, 0.7)' }} /> INTEREST</span>
                        <span className="inline-flex items-center gap-1"><span className="inline-block w-3 h-2 rounded-full" style={{ background: 'linear-gradient(90deg, #905E26 0%, #F5EC9B 25.82%, #905E26 100%)' }} /> PRINCIPAL</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full">
                    {/* Appreciation Metrics */}
                    <AppreciationMetrics
                      currentValue={property?.price || 0}
                      appreciationRate={appRate}
                      yearsToProject={appYears}
                      isSkyven={isSkyvenProperty}
                    />
                  </div>
                )}

                 {/* Services */}
                 <div className="mt-6">
                   <div className="text-white text-xl md:text-2xl font-semibold">Services</div>
                   <div className="mt-3 grid grid-cols-3 gap-4 text-center">
                     <div className="flex flex-col items-center gap-2">
                        <img src={iconWarranties} alt="Warranties" className="w-12 h-12" />
                       <div className="text-white text-sm">Warranties</div>
                     </div>
                     <div className="flex flex-col items-center gap-2">
                        <img src={iconInsurance} alt="Insurance" className="w-12 h-12" />
                       <div className="text-white text-sm">Insurance</div>
                     </div>
                     <div className="flex flex-col items-center gap-2">
                        <img src={iconInteriorDesign} alt="Interior Design" className="w-12 h-12" />
                       <div className="text-white text-sm">Interior Design</div>
                     </div>
                   </div>
                 </div>
              </div>
            </div>
          </div>

          {/* Right column: room tiles grid or photo grid */}
          <div className="lg:col-start-2 lg:row-start-1 self-start">
            {/* Show room_types if available, otherwise show photo grid */}
            {roomTypes.length > 0 ? (
              <div className="grid grid-cols-3 gap-4 mb-4">
                {roomTypes.map((room: any, idx: number) => {
                  const roomName = room.name || room.value || `Room ${idx + 1}`;
                  const roomKey = room.id || room.key || `room-${idx}`;
                  // Use image from room data if available, otherwise try to find matching room from ROOMS array
                  let roomImage = room.image || room.url;
                  if (!roomImage) {
                    const matchingRoom = ROOMS.find(r => r.label.toLowerCase() === roomName.toLowerCase());
                    roomImage = matchingRoom?.image || sampleImg;
                  }
                  
                  return (
                    <RoomTile 
                      key={roomKey} 
                      title={roomName} 
                      img={roomImage} 
                      onClick={() => {
                        setSelectedRoom({ name: roomName, image: roomImage });
                        setIsRoomModalOpen(true);
                      }}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4 mb-4">
                {propertyPhotos.slice(1, 10).map((photo, idx) => (
                  <div
                    key={idx + 1}
                    className="relative rounded-[18px] overflow-hidden h-36 md:h-44 bg-gray-100 border border-gray-200 cursor-pointer hover:shadow-lg transition-shadow duration-200"
                    onClick={() => {
                      setCurrentPhotoIndex(idx + 1);
                      setIsPhotosModalOpen(true);
                    }}
                  >
                    <img src={photo || sampleImg} alt={`Photo ${idx + 2}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contact Agent Modal */}
      {isContactModalOpen && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 py-6">
          <div className="relative w-full max-w-5xl rounded-[32px] bg-white shadow-[0_40px_80px_rgba(0,26,20,0.25)] overflow-hidden">
            <ModalCloseButton
              onClick={handleCloseContactModal}
              ariaLabel="Close contact form"
              className="absolute top-4 right-4 z-50"
            />
            <div className="flex flex-col md:flex-row gap-8 p-6 md:p-10">
              <div className="md:w-2/5 bg-gradient-to-b from-white to-[#F1F6F4] border border-[#E3E7E5] rounded-[24px] shadow-[0_20px_50px_rgba(0,66,54,0.08)] p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden border border-[#E3E7E5] bg-[#EAF3EF] flex items-center justify-center">
                    {agentDetails?.profilePhoto ? (
                      <img src={agentDetails.profilePhoto} alt={agentDetails.name} className="w-full h-full object-cover" />
                    ) : (
                      <User size={40} className="text-[#005C48]" />
                    )}
                  </div>
                  <div>
                    <div className="text-xl font-semibold text-[#0F362D]">{agentDetails?.name || 'Listing Agent'}</div>
                    <div className="text-sm text-[#4A6B63] mt-1">Real Estate Agent</div>
                  </div>
                </div>
                <button
                  className="flex items-center justify-between w-full border border-[#CDD5D2] rounded-xl px-4 py-3 text-sm font-medium text-[#0F362D] mb-6 hover:border-[#0A5E4D] transition"
                >
                  Agent Profile
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#004236] text-white">
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </span>
                </button>
                <div className="space-y-4 text-sm text-[#1D4038]">
                  {agentDetails?.phone && (
                    <div>
                      <div className="uppercase text-[11px] tracking-wide text-[#7A8E89] mb-1">Mobile</div>
                      <div>M : {agentDetails.phone}</div>
                    </div>
                  )}
                  {agentDetails?.email && (
                    <div>
                      <div className="uppercase text-[11px] tracking-wide text-[#7A8E89] mb-1">Email</div>
                      <div>E : {agentDetails.email}</div>
                    </div>
                  )}
                  {(agentOfficeInfo.company || agentOfficeInfo.officeAddress) && (
                    <div>
                      <div className="uppercase text-[11px] tracking-wide text-[#7A8E89] mb-1">Office</div>
                      <div className="font-semibold">{agentOfficeInfo.company || 'Office'}</div>
                      <div className="whitespace-pre-line text-[#425954]">
                        {agentOfficeInfo.officeAddress}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="md:flex-1">
                <div className="text-[30px] md:text-[34px] font-serif text-[#0F362D] leading-tight">Let's get in touch</div>
                <div className="w-32 h-1.5 rounded-full mt-3 mb-6" style={{ background: 'linear-gradient(90deg, #A3733D 0%, #F5EC9B 76.92%)' }} />
                <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleContactSubmit} noValidate>
                  <div>
                    <input
                      name="firstName"
                      value={contactForm.firstName}
                      onChange={handleContactInputChange}
                      placeholder="First name"
                      className={`w-full rounded-xl border bg-transparent px-4 py-3 text-sm text-[#0F362D] placeholder-[#8AA39C] focus:outline-none focus:ring-2 focus:ring-[#0B5F4F] ${contactErrors.firstName ? 'border-red-400' : 'border-[#CAD7D3]'}`}
                    />
                    {contactErrors.firstName && <p className="mt-1 text-xs text-red-500">{contactErrors.firstName}</p>}
                  </div>
                  <div>
                    <input
                      name="lastName"
                      value={contactForm.lastName}
                      onChange={handleContactInputChange}
                      placeholder="Last name"
                      className={`w-full rounded-xl border bg-transparent px-4 py-3 text-sm text-[#0F362D] placeholder-[#8AA39C] focus:outline-none focus:ring-2 focus:ring-[#0B5F4F] ${contactErrors.lastName ? 'border-red-400' : 'border-[#CAD7D3]'}`}
                    />
                    {contactErrors.lastName && <p className="mt-1 text-xs text-red-500">{contactErrors.lastName}</p>}
                  </div>
                  <div>
                    <input
                      type="email"
                      name="email"
                      value={contactForm.email}
                      onChange={handleContactInputChange}
                      placeholder="Email address"
                      className={`w-full rounded-xl border bg-transparent px-4 py-3 text-sm text-[#0F362D] placeholder-[#8AA39C] focus:outline-none focus:ring-2 focus:ring-[#0B5F4F] ${contactErrors.email ? 'border-red-400' : 'border-[#CAD7D3]'}`}
                    />
                    {contactErrors.email && <p className="mt-1 text-xs text-red-500">{contactErrors.email}</p>}
                  </div>
                  <div>
                    <input
                      type="tel"
                      name="mobile"
                      value={contactForm.mobile}
                      onChange={handleContactInputChange}
                      placeholder="Mobile no"
                      className={`w-full rounded-xl border bg-transparent px-4 py-3 text-sm text-[#0F362D] placeholder-[#8AA39C] focus:outline-none focus:ring-2 focus:ring-[#0B5F4F] ${contactErrors.mobile ? 'border-red-400' : 'border-[#CAD7D3]'}`}
                    />
                    {contactErrors.mobile && <p className="mt-1 text-xs text-red-500">{contactErrors.mobile}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <textarea
                      name="message"
                      value={contactForm.message}
                      onChange={handleContactInputChange}
                      placeholder="Enter message..."
                      rows={4}
                      className={`w-full rounded-2xl border bg-transparent px-4 py-3 text-sm text-[#0F362D] placeholder-[#8AA39C] focus:outline-none focus:ring-2 focus:ring-[#0B5F4F] ${contactErrors.message ? 'border-red-400' : 'border-[#CAD7D3]'}`}
                    />
                    {contactErrors.message && <p className="mt-1 text-xs text-red-500">{contactErrors.message}</p>}
                  </div>
                  <div className="md:col-span-2 flex items-start gap-3 text-xs text-[#4A6B63]">
                    <input
                      type="checkbox"
                      name="agree"
                      checked={contactForm.agree}
                      onChange={handleContactInputChange}
                      className="mt-1 h-4 w-4 rounded border-[#CAD7D3] text-[#0B5F4F] focus:ring-[#0B5F4F]"
                    />
                    <span>
                      By submitting this form, you agree to our{' '}
                      <a href="#" className="font-semibold underline decoration-[#A3733D]">Terms of use</a> and{' '}
                      <a href="#" className="font-semibold underline decoration-[#A3733D]">Privacy Policy</a>
                    </span>
                  </div>
                  {contactErrors.agree && <p className="md:col-span-2 text-xs text-red-500 -mt-2">{contactErrors.agree}</p>}
                  {contactErrors.api && <p className="md:col-span-2 text-xs text-red-500">{contactErrors.api}</p>}
                  <div className="md:col-span-2">
                    <button
                      type="submit"
                      disabled={contactLoading}
                      className="w-full rounded-[18px] px-6 py-4 text-base font-semibold text-white shadow-lg transition disabled:opacity-70"
                      style={{ background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)' }}
                    >
                      {contactLoading ? 'Sending...' : 'Send Message'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Forecast Modal */}
      <AIForecastModal 
        isOpen={isAIForecastModalOpen} 
        onClose={() => setIsAIForecastModalOpen(false)}
        isSkyven={isSkyvenProperty}
      />

      {/* Room Modal */}
      {selectedRoom && (
        <RoomModal
          isOpen={isRoomModalOpen}
          onClose={() => setIsRoomModalOpen(false)}
          roomName={selectedRoom.name}
          roomImage={selectedRoom.image}
          onRoomSelect={handleRoomSelect}
          onSeeAllClick={handlePhotosClick}
          rooms={ROOMS}
        />
      )}

      {/* Photos Modal */}
      <PhotosModal
        isOpen={isPhotosModalOpen}
        onClose={() => setIsPhotosModalOpen(false)}
        photos={photosForModal}
        currentPhotoIndex={currentPhotoIndex}
        onPhotoSelect={handlePhotoSelect}
      />

      {/* Floor Plan Modal */}
      <FloorPlanModal
        isOpen={isFloorPlanModalOpen}
        onClose={() => setIsFloorPlanModalOpen(false)}
        floorPlanImages={propertyFloorPlans}
        currentFloorPlanIndex={currentFloorPlanIndex}
        onFloorPlanSelect={handleFloorPlanSelect}
        title="3D Floor Plan"
        glbUrl={floorPlanGlbUrl || undefined}
      />

      {/* Videos Modal */}
      <VideosModal
        isOpen={isVideosModalOpen}
        onClose={() => setIsVideosModalOpen(false)}
        videos={propertyVideos}
      />
    </div>
  );
};

export default PropertyDetailsV3;



