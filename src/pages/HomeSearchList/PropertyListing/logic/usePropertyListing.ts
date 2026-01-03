import { useState, useEffect, useRef } from 'react';
import api from '../../../../utils/api';
import { usePriceRangePopover } from './usePriceRangePopover';
import { useBedsBathsPopover } from './useBedsBathsPopover';
import { usePropertyTypePopover, PropertyType } from './usePropertyTypePopover';

export function usePropertyListing({
  initialSearch = 'Punta Cana',
  propertyTypes: initialPropertyTypes = [],
}: {
  initialSearch?: string;
  propertyTypes?: PropertyType[];
}) {
  // --- Filter State ---
  const priceRangePopover = usePriceRangePopover();
  const bedsBathsPopover = useBedsBathsPopover();
  const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>(initialPropertyTypes);
  const propertyTypePopover = usePropertyTypePopover(propertyTypes);
  const [searchChip, setSearchChip] = useState(initialSearch);
  const [propertyStatus, setPropertyStatus] = useState<string[]>([]);
  const [parkingSlots, setParkingSlots] = useState<[number, number]>([0, 5]);
  const [totalSqft, setTotalSqft] = useState<[number, number]>([0, 10000]);
  const [lotSqft, setLotSqft] = useState<[number, number]>([0, 50000]);
  const [maxHoa, setMaxHoa] = useState<string>('No HOA');
  const [listingTypes, setListingTypes] = useState<string[]>([]);
  const [selectedAppliances, setSelectedAppliances] = useState<string[]>([]);
  const [selectedIndoor, setSelectedIndoor] = useState<string[]>([]);
  const [selectedOutdoor, setSelectedOutdoor] = useState<string[]>([]);
  const [selectedCommunity, setSelectedCommunity] = useState<string[]>([]);
  const [selectedLifestyles, setSelectedLifestyles] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState<'default' | 'low_to_high' | 'high_to_low'>('default');

  // --- Data State ---
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  // --- Amenities State ---
  const [amenities, setAmenities] = useState({
    appliancetype: [],
    indoorfeature: [],
    outdooramenity: [],
    communitytype: [],
    viewtype: [],
  });
  const [showMoreAmenities, setShowMoreAmenities] = useState<{ [key: string]: boolean }>({
    appliancetype: false,
    indoorfeature: false,
    outdooramenity: false,
    communitytype: false,
  });

  // --- Master Data State ---
  const [masterData, setMasterData] = useState({
    propertystatus: [],
    mortgagetype: [],
    listingtype: [],
  });

  // --- Helpers ---
  const parseHoaValue = (hoa: string) => {
    if (!hoa || hoa === 'No HOA') return undefined;
    const match = hoa.match(/\$?(\d+)/);
    return match ? parseInt(match[1], 10) : undefined;
  };

  // --- API: Fetch Master List ---
  useEffect(() => {
    api.post('/common/master/list/', { tables: ['appliancetype', 'indoorfeature', 'outdooramenity', 'communitytype', 'viewtype', 'propertytype', 'propertystatus', 'mortgagetype', 'listingtype'] })
      .then((res: any) => {
        setAmenities({
          appliancetype: res.data.appliancetype || [],
          indoorfeature: res.data.indoorfeature || [],
          outdooramenity: res.data.outdooramenity || [],
          communitytype: res.data.communitytype || [],
          viewtype: res.data.viewtype || [],
        });
        setPropertyTypes(res.data.propertytype || []);
        setMasterData({
          propertystatus: res.data.propertystatus || [],
          mortgagetype: res.data.mortgagetype || [],
          listingtype: res.data.listingtype || [],
        });
      });
  }, []);

  // --- API: Fetch Properties ---
  const fetchProperties = async (searchTerm: string, pageNum = 1, append = false, sort = sortOrder) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    setError(null);
    const [priceMin, priceMax] = priceRangePopover.range;
    const [bedsMin, bedsMax] = bedsBathsPopover.beds;
    const [bathsMin, bathsMax] = bedsBathsPopover.baths;
    const [parkingMin, parkingMax] = parkingSlots;
    const [totalSqftMin, totalSqftMax] = totalSqft;
    const [lotSqftMin, lotSqftMax] = lotSqft;
    const hoaFees = parseHoaValue(maxHoa);
    const requestBody: any = { search: searchTerm };
    if (hoaFees !== undefined) requestBody.max_hoa_fees = hoaFees;
    if (propertyStatus.length > 0) requestBody.property_status = propertyStatus;
    if (listingTypes.length > 0) requestBody.listing_types = listingTypes;
    if (parkingMin !== 0) requestBody.parking_from = parkingMin;
    if (parkingMax !== 5) requestBody.parking_to = parkingMax;
    if (totalSqftMin !== 0) requestBody.total_sqft_from = totalSqftMin;
    if (totalSqftMax !== 10000) requestBody.total_sqft_to = totalSqftMax;
    if (lotSqftMin !== 0) requestBody.lot_sqft_from = lotSqftMin;
    if (lotSqftMax !== 50000) requestBody.lot_sqft_to = lotSqftMax;
    if (selectedOutdoor.length > 0) requestBody.outdoor_amenities_uuids = selectedOutdoor;
    if (selectedLifestyles.length > 0) requestBody.viewtype_uuids = selectedLifestyles;
    if (selectedIndoor.length > 0) requestBody.indoor_features_uuids = selectedIndoor;
    if (selectedCommunity.length > 0) requestBody.community_uuids = selectedCommunity;
    if (selectedAppliances.length > 0) requestBody.appliances_uuids = selectedAppliances;
    // price, beds, baths, property types
    const priceFrom = priceMin !== 100 ? priceMin : null;
    const priceTo = priceMax !== 10000000 ? priceMax : null;
    const bedroomsFrom = bedsMin !== 0 ? bedsMin : null;
    const bedroomsTo = bedsMax !== 5 ? bedsMax : null;
    const bathroomsFrom = bathsMin !== 0 ? bathsMin : null;
    const bathroomsTo = bathsMax !== 5 ? bathsMax : null;
    if (priceFrom !== null) requestBody.price_from = priceFrom;
    if (priceTo !== null) requestBody.price_to = priceTo;
    if (bedroomsFrom !== null) requestBody.bedrooms_from = bedroomsFrom;
    if (bedroomsTo !== null) requestBody.bedrooms_to = bedroomsTo;
    if (bathroomsFrom !== null) requestBody.bathrooms_from = bathroomsFrom;
    if (bathroomsTo !== null) requestBody.bathrooms_to = bathroomsTo;
    if (propertyTypePopover.checked && propertyTypePopover.checked.length > 0) {
      requestBody.property_types = propertyTypePopover.checked;
    }
    if (sort === 'low_to_high') requestBody.sort_by = 'low_to_high';
    if (sort === 'high_to_low') requestBody.sort_by = 'high_to_low';
    // Build query params for page and page_size
    const params = new URLSearchParams({
      page: String(pageNum),
      page_size: '10',
    });
    try {
      const response = await api.post(`/buyer/properties/?${params.toString()}`, requestBody);
      const mapped = (response.data.results || []).map((item: any) => ({
        id: item.property_id,
        title: item.name,
        location: item.address,
        price: item.selling_price,
        bedrooms: item.bedrooms,
        bathrooms: item.bathrooms,
        sqft: item.sqft,
        image: item.mainphoto_url,
        description: '',
        isSaved: item.is_saved,
        lat: item.location?.lat,
        lng: item.location?.lng,
      }));
      setProperties(prev => {
        if (!append) return mapped;
        const existingIds = new Set(prev.map(p => p.id));
        const newItems = mapped.filter((item: any) => !existingIds.has(item.id));
        return [...prev, ...newItems];
      });
      setTotalCount(response.data.count);
      setHasMore(response.data.has_more);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch properties');
      if (!append) setProperties([]);
    } finally {
      if (append) {
        setLoadingMore(false);
      } else {
        setLoading(false);
      }
    }
  };

  // --- Reset Filters ---
  const resetAllFilters = () => {
    priceRangePopover.handleClear();
    bedsBathsPopover.handleClear();
    setSearchChip(initialSearch);
    setPropertyStatus([]);
    setParkingSlots([0, 5]);
    setTotalSqft([0, 10000]);
    setLotSqft([0, 50000]);
    setMaxHoa('No HOA');
    setListingTypes([]);
    setSelectedAppliances([]);
    setSelectedIndoor([]);
    setSelectedOutdoor([]);
    setSelectedCommunity([]);
    setSelectedLifestyles([]);
    if (propertyTypePopover && propertyTypePopover.handleClear) propertyTypePopover.handleClear();
  };

  return {
    // Data
    properties, loading, loadingMore, error, page, setPage, hasMore, totalCount,
    // Filters
    priceRangePopover, bedsBathsPopover, propertyTypePopover, propertyTypes, setPropertyTypes,
    searchChip, setSearchChip,
    propertyStatus, setPropertyStatus,
    parkingSlots, setParkingSlots,
    totalSqft, setTotalSqft,
    lotSqft, setLotSqft,
    maxHoa, setMaxHoa,
    listingTypes, setListingTypes,
    selectedAppliances, setSelectedAppliances,
    selectedIndoor, setSelectedIndoor,
    selectedOutdoor, setSelectedOutdoor,
    selectedCommunity, setSelectedCommunity,
    selectedLifestyles, setSelectedLifestyles,
    sortOrder, setSortOrder,
    amenities, showMoreAmenities, setShowMoreAmenities,
    // Master Data
    masterData,
    // API
    fetchProperties,
    // Helpers
    resetAllFilters,
  };
} 