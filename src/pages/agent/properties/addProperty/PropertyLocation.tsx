import React, { useEffect, useMemo, useRef, useState } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';
import api from '../../../../utils/api';

type LocationOption = {
  id: string | number;
  name: string;
  [key: string]: any;
};

interface LocationDetails {
  address: string;
  lat: number;
  lng: number;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  unitNumber?: string;
  propertyType?: string;
  propertyType_detail?: LocationOption | null;
  city_detail?: LocationOption | null;
  state_detail?: LocationOption | null;
  country_detail?: LocationOption | null;
}

interface PropertyLocationProps {
  locationData: LocationDetails;
  onLocationDataChange: (updates: Partial<LocationDetails>) => void;
  onConfirm: () => void;
  onChangeLocation: () => void;
  onSelectOnMap?: (lat: number, lng: number) => void;
  isLoading?: boolean;
}

type FormValues = {
  propertyType: LocationOption | null;
  streetAddress: string;
  unitNumber: string;
  city: LocationOption | null;
  state: LocationOption | null;
  postalCode: string;
  country: LocationOption | null;
};

const STEPS = [
  'Location',
  'Property Info',
  'Media',
  'Amenities',
  'Contact Info',
  'Review',
];

const resolveName = (value: any) => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    return value.name || value.value || value.label || '';
  }
  return '';
};

const normalizeOption = (option?: any, fallback?: string | null): LocationOption | null => {
  if (!option && !fallback) return null;
  if (option && typeof option === 'object') {
    const label = resolveName(option.name ?? option);
    return {
      id: option.id ?? option._id ?? option.value ?? label ?? fallback ?? '',
      name: label || fallback || '',
      ...option,
    };
  }
  if (typeof option === 'string') {
    return { id: option, name: option };
  }
  if (fallback) {
    return { id: fallback, name: fallback };
  }
  return null;
};

const formatCompositeAddress = (data: LocationDetails) => {
  return [data.address, data.city, data.state, data.postalCode, data.country].filter(Boolean).join(', ');
};

const PropertyLocation: React.FC<PropertyLocationProps> = ({
  locationData,
  onLocationDataChange,
  onConfirm,
  onChangeLocation,
  onSelectOnMap,
  isLoading = false,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<any>(null);
  const mapInstance = useRef<any>(null);
  const [isMarkerEditable, setIsMarkerEditable] = useState(false);
  const [cities, setCities] = useState<LocationOption[]>([]);
  const [states, setStates] = useState<LocationOption[]>([]);
  const [countries, setCountries] = useState<LocationOption[]>([]);
  const [propertyTypes, setPropertyTypes] = useState<LocationOption[]>([]);
  const [isOptionsLoading, setIsOptionsLoading] = useState(false);

  const toFormValues = (data: LocationDetails): FormValues => ({
    propertyType: normalizeOption(data.propertyType_detail, data.propertyType) || null,
    streetAddress: data.address || '',
    unitNumber: data.unitNumber || '',
    city: normalizeOption(data.city_detail, data.city) || null,
    state: normalizeOption(data.state_detail, data.state) || null,
    postalCode: data.postalCode || '',
    country: normalizeOption(data.country_detail, data.country) || null,
  });

  const [formValues, setFormValues] = useState<FormValues>(() => toFormValues(locationData));

  useEffect(() => {
    setFormValues(prev => {
      const next = toFormValues(locationData);
      const isSame =
        prev.streetAddress === next.streetAddress &&
        prev.unitNumber === next.unitNumber &&
        prev.postalCode === next.postalCode &&
        ((prev.propertyType === null && next.propertyType === null) ||
          (prev.propertyType?.id === next.propertyType?.id && prev.propertyType?.name === next.propertyType?.name)) &&
        ((prev.city === null && next.city === null) ||
          (prev.city?.id === next.city?.id && prev.city?.name === next.city?.name)) &&
        ((prev.state === null && next.state === null) ||
          (prev.state?.id === next.state?.id && prev.state?.name === next.state?.name)) &&
        ((prev.country === null && next.country === null) ||
          (prev.country?.id === next.country?.id && prev.country?.name === next.country?.name)) &&
        prev.unitNumber === next.unitNumber;
      if (isSame) {
        return prev;
      }
      return next;
    });
  }, [locationData]);

  const formattedAddress = useMemo(() => formatCompositeAddress(locationData), [locationData]);

  useEffect(() => {
    let isMounted = true;

    const parseList = (items: any[], fallbackKeys: string[] = []) => {
      return items.map(item => {
        const label =
          resolveName(item.name) ||
          resolveName(item.cityName) ||
          resolveName(item.stateName) ||
          resolveName(item.countryName) ||
          item.value ||
          '';
        const fallbackId = fallbackKeys.map(key => item[key]).find(Boolean);
        return {
          id:
            item.id ??
            item._id ??
            fallbackId ??
            (typeof item.name === 'object' ? item.name?.id : undefined) ??
            label,
          name: label,
          ...item,
        };
      });
    };

    const fetchLocationOptions = async () => {
      setIsOptionsLoading(true);
      try {
        const [citiesRes, statesRes, countriesRes, propertyTypesRes] = await Promise.allSettled([
          api.get('/agent/cities/'),
          api.get('/agent/states/'),
          api.get('/agent/countries/'),
          api.post('/common/master/list/', { tables: ['propertytype'] }),
        ]);

        if (!isMounted) {
          return;
        }

        if (citiesRes.status === 'fulfilled') {
          const results = citiesRes.value.data?.data || [];
          setCities(parseList(results, ['cityId']));
        }
        if (statesRes.status === 'fulfilled') {
          const results = statesRes.value.data?.data || [];
          setStates(parseList(results, ['stateId']));
        }
        if (countriesRes.status === 'fulfilled') {
          const results = countriesRes.value.data?.data || [];
          setCountries(parseList(results, ['countryId']));
        }
        if (propertyTypesRes.status === 'fulfilled') {
          const results = propertyTypesRes.value.data?.propertytype || [];
          setPropertyTypes(
            results.map((item: any) => ({
              id: item.id ?? item.value,
              name: resolveName(item.value ?? item.name ?? item.label) || item.value || '',
              ...item,
            })),
          );
        }
      } catch (error) {
        console.error('Error fetching location metadata:', error);
      } finally {
        if (isMounted) {
          setIsOptionsLoading(false);
        }
      }
    };

    fetchLocationOptions();
    return () => {
      isMounted = false;
    };
  }, []);

  // Check if we have valid coordinates (not default coordinates)
  const hasValidCoordinates = locationData.lat && locationData.lng && 
    !isNaN(Number(locationData.lat)) && !isNaN(Number(locationData.lng)) &&
    (Number(locationData.lat) !== 18.5601 || Number(locationData.lng) !== -68.3725);

  // Initialize map
  useEffect(() => {
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initializeMap;
      document.head.appendChild(script);
    } else {
      initializeMap();
    }
  }, []);

  const initializeMap = () => {
    if (!mapRef.current) return;

    const mapCenter = hasValidCoordinates ? { lat: Number(locationData.lat), lng: Number(locationData.lng) } : { lat: 18.5601, lng: -68.3725 };
    
    const map = new window.google.maps.Map(mapRef.current, {
      center: mapCenter,
      zoom: hasValidCoordinates ? 15 : 12,
      mapTypeId: window.google.maps.MapTypeId.ROADMAP,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }],
        },
      ],
    });
    
    mapInstance.current = map;
    
    // Only create marker if we have valid coordinates
    if (hasValidCoordinates) {
      createMarker(map, { lat: Number(locationData.lat), lng: Number(locationData.lng) });
    }
  };

  const createMarker = (map: any, position: { lat: number; lng: number }) => {
    // Remove existing marker if any
    if (markerRef.current) {
      markerRef.current.setMap(null);
    }

    markerRef.current = new window.google.maps.Marker({
      position,
      map,
      draggable: isMarkerEditable,
      title: formattedAddress,
    });

    // Add drag event listener
    if (isMarkerEditable && onSelectOnMap) {
      markerRef.current.addListener('dragend', (e: any) => {
        const newLat = e.latLng.lat();
        const newLng = e.latLng.lng();
        console.log('Desktop PropertyLocation: Marker dragged to:', { lat: newLat, lng: newLng });
        onSelectOnMap(newLat, newLng);
      });
    }
  };

  // Update marker position when coordinates change
  useEffect(() => {
    if (mapInstance.current && hasValidCoordinates) {
      const position = { lat: Number(locationData.lat), lng: Number(locationData.lng) };
      
      // Update map center
      mapInstance.current.setCenter(position);
      
      // Create or update marker
      createMarker(mapInstance.current, position);
    }
  }, [locationData.lat, locationData.lng, hasValidCoordinates]);

  // Update marker draggable property and map click listener when isMarkerEditable changes
  useEffect(() => {
    if (!mapInstance.current || !onSelectOnMap) return;

    const map = mapInstance.current;
    let clickListener: any = null;

    if (markerRef.current) {
      markerRef.current.setDraggable(isMarkerEditable);
    }

    if (isMarkerEditable) {
      // Add click listener to map for placing marker
      clickListener = map.addListener('click', (e: any) => {
        const newLat = e.latLng.lat();
        const newLng = e.latLng.lng();
        
        console.log('Desktop PropertyLocation: Map clicked at:', { lat: newLat, lng: newLng });
        
        // Update marker position
        if (markerRef.current) {
          markerRef.current.setPosition(e.latLng);
        } else {
          createMarker(map, { lat: newLat, lng: newLng });
        }
        
        onSelectOnMap(newLat, newLng);
      });
    }

    // Cleanup function
    return () => {
      if (clickListener) {
        window.google.maps.event.removeListener(clickListener);
      }
    };
  }, [isMarkerEditable, onSelectOnMap]);

  const handleChangeLocationClick = () => {
    setIsMarkerEditable(true);
    onChangeLocation();
    
    // If no marker exists and we have a map, create one at center
    if (!markerRef.current && mapInstance.current) {
      const center = mapInstance.current.getCenter();
      createMarker(mapInstance.current, { lat: center.lat(), lng: center.lng() });
      
      if (onSelectOnMap) {
        onSelectOnMap(center.lat(), center.lng());
      }
    }
  };

  const handleConfirmLocation = () => {
    setIsMarkerEditable(false);
    onConfirm();
  };

  const handleLocationInputChange = (field: keyof Pick<FormValues, 'streetAddress' | 'unitNumber' | 'postalCode'>) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setFormValues(prev => ({ ...prev, [field]: value }));
    const updates: Partial<LocationDetails> = {};
    if (field === 'streetAddress') {
      updates.address = value;
    } else if (field === 'unitNumber') {
      updates.unitNumber = value;
    } else if (field === 'postalCode') {
      updates.postalCode = value;
    }
    onLocationDataChange(updates);
  };

  const handleAutocompleteChange = (field: keyof Pick<FormValues, 'propertyType' | 'city' | 'state' | 'country'>) => (
    _event: any,
    value: LocationOption | null,
  ) => {
    setFormValues(prev => ({ ...prev, [field]: value }));
    const updates: Partial<LocationDetails> = {};
    switch (field) {
      case 'propertyType':
        updates.propertyType = value?.name || '';
        updates.propertyType_detail = value;
        break;
      case 'city':
        updates.city = value?.name || '';
        updates.city_detail = value;
        break;
      case 'state':
        updates.state = value?.name || '';
        updates.state_detail = value;
        break;
      case 'country':
        updates.country = value?.name || '';
        updates.country_detail = value;
        break;
      default:
        break;
    }
    onLocationDataChange(updates);
  };

  const renderAutocomplete = (
    label: string,
    field: keyof Pick<FormValues, 'propertyType' | 'city' | 'state' | 'country'>,
    options: LocationOption[],
    placeholder: string,
  ) => (
    <Autocomplete
      fullWidth
      options={options}
      loading={isOptionsLoading}
      value={formValues[field]}
      onChange={handleAutocompleteChange(field)}
      getOptionLabel={(option) => (typeof option === 'string' ? option : option?.name || '')}
      isOptionEqualToValue={(option, value) => option?.id === value?.id}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          size="small"
          fullWidth
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {isOptionsLoading ? <CircularProgress color="inherit" size={16} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );

  const handleInlineFormSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    handleConfirmLocation();
  };

  return (
    <div className="w-full mx-auto px-4 md:px-8 lg:px-20 py-8">
      <div className="mb-10">
        <div className="text-3xl font-bold mb-6">Property Location</div>

        <form
          onSubmit={handleInlineFormSubmit}
          className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm mb-6 flex flex-col gap-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-2">
              {renderAutocomplete('Property Type', 'propertyType', propertyTypes, 'Select property type')}
            </div>
            <div className="lg:col-span-3">
              <TextField
                label="Street address"
                placeholder="Enter street number and address"
                value={formValues.streetAddress}
                size="small"
                fullWidth
                onChange={handleLocationInputChange('streetAddress')}
                helperText="Enter the valid address with street number"
                FormHelperTextProps={{
                  sx: { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.2, mt: 0.5 },
                }}
              />
            </div>
            <div className="lg:col-span-2">
              {renderAutocomplete('City', 'city', cities, 'Select city')}
            </div>
            <div className="lg:col-span-2">
              {renderAutocomplete('State', 'state', states, 'Select state')}
            </div>
            <div className="lg:col-span-1">
              <TextField
                label="Zipcode"
                placeholder="Enter code"
                value={formValues.postalCode}
                size="small"
                fullWidth
                onChange={handleLocationInputChange('postalCode')}
              />
            </div>
            <div className="lg:col-span-2">
              {renderAutocomplete('Country', 'country', countries, 'Select country')}
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              type="submit"
              className="settings-gradient-btn"
              style={{
                minWidth: 120,
                height: 36,
                color: '#fff',
                fontSize: 14,
                fontWeight: 600,
                borderRadius: 8,
                textTransform: 'none',
                paddingInline: 16,
              }}
            >
              Continue
            </Button>
          </div>
        </form>

        <div className="mb-4 text-lg font-semibold">
          Is this your property accurate location?{' '}
          <span className="text-[#007E67] cursor-pointer underline" onClick={handleChangeLocationClick}>
            If not, select in map
          </span>
        </div>
        <div className="text-base text-[#222] mb-6">{formattedAddress || 'No address data available'}</div>
      </div>

      <div className="w-full">
        {isLoading ? (
          <div className="w-full h-[340px] rounded-xl border border-[#E5E7EB] overflow-hidden mb-6 bg-gray-100 flex items-center justify-center">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mb-2"></div>
              <div className="text-sm text-gray-600">Loading map...</div>
            </div>
          </div>
        ) : (
          <div ref={mapRef} className="w-full h-[340px] rounded-xl border border-[#E5E7EB] overflow-hidden mb-6" />
        )}

        {isMarkerEditable && (
          <div className="inline-flex items-start gap-2 mb-3 px-3 py-2 rounded-md border border-blue-200 bg-blue-50 text-xs text-blue-700">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#2563EB" strokeWidth="1.5" />
              <path d="M12 7v5" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="12" cy="15.5" r="0.75" fill="#2563EB" />
            </svg>
            <span>
              <strong>Map editing mode:</strong> Click anywhere on the map or drag the marker to set the property location.
            </span>
          </div>
        )}

        <div className="flex gap-4 flex-wrap">
          <Button
            onClick={handleConfirmLocation}
            className="settings-gradient-btn flex-1 min-w-[240px]"
            style={{
              height: 50,
              color: '#fff',
              fontSize: 18,
              fontWeight: 500,
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textTransform: 'none',
            }}
            disabled={isLoading}
          >
            Yes, It's the correct location
          </Button>
          <Button
            onClick={handleChangeLocationClick}
            className="flex-1 min-w-[240px]"
            style={{
              height: 50,
              border: '1.5px solid #007E67',
              color: '#007E67',
              fontSize: 18,
              fontWeight: 500,
              background: '#fff',
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textTransform: 'none',
            }}
            disabled={isLoading}
          >
            No, Let me change it
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PropertyLocation; 