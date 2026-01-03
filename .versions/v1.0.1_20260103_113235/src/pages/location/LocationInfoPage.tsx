import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getLocationInfo, getSelectedCountries } from '../../utils/api';
import logoGreen from '../../assets/images/v3/logo-green.png';
import indiaBack from '../../assets/images/v3/india-back.png';
import usaBack from '../../assets/images/v3/usa-back.png';
import dubaiBack from '../../assets/images/v3/dubai-back.png';
import australiaBack from '../../assets/images/v3/australia-back.png';
import defaultBack from '../../assets/images/v3/home.jpg';
import realEstateHeading from '../../assets/images/v3/real-estate-heading.png';
import locationIcon from '../../assets/images/v3/location.png';
import selectedIcon from '../../assets/images/v3/selected.png';

interface LocationState {
  country?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

interface LocationInfo {
  country: string;
  country_code: string;
  flag_svg: string;
  flag_png: string;
  states: string[];
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

interface Country {
  country: string;
  country_code: string;
  flag_svg: string;
  flag_png: string;
}

// Background images for countries
const COUNTRY_BACKGROUNDS: Record<string, string> = {
  'India': indiaBack,
  'United States': usaBack,
  'United Arab Emirates': dubaiBack,
  'Australia': australiaBack,
};

const LocationInfoPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [locationInfo, setLocationInfo] = useState<LocationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [backgroundImage, setBackgroundImage] = useState<string>(defaultBack);
  const [showAllCities, setShowAllCities] = useState(false);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [countries, setCountries] = useState<Country[]>([]);

  // Add click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch countries on component mount
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const data = await getSelectedCountries();
        console.log('Fetched countries:', data);
        if (data && Array.isArray(data.countries)) {
          setCountries(data.countries);
        }
      } catch (err) {
        console.error('Error fetching countries:', err);
      }
    };
    fetchCountries();
  }, []);

  const handleCountrySelect = async (countryName: string) => {
    console.log('Selected country:', countryName);
    setIsDropdownOpen(false);
    
    try {
      // Update background image immediately for better UX
      setBackgroundImage(COUNTRY_BACKGROUNDS[countryName] || defaultBack);
      
      // Fetch location info with states for the selected country
      const locationData = await getLocationInfo({ country: countryName });
      
      // Update location info with the new data
      setLocationInfo(locationData);
      
      // Navigate to the current page with new state
      navigate('/location-select/info', { 
        state: { 
          country: countryName,
          locationInfo: locationData 
        }
      });
    } catch (err) {
      console.error('Error fetching location info:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch location info');
    }
  };

  const toggleCitySelection = (city: string) => {
    setSelectedCities((prev: string[]) => 
      prev.includes(city) 
        ? prev.filter((c: string) => c !== city) 
        : [...prev, city]
    );
  };

  useEffect(() => {
    const fetchLocationInfo = async () => {
      try {
        const state = location.state as LocationState;
        
        if (!state) {
          throw new Error('No location data provided');
        }

        if (!state.country && !state.coordinates) {
          throw new Error('Neither country nor coordinates provided');
        }

        if (state.coordinates && (typeof state.coordinates.latitude !== 'number' || typeof state.coordinates.longitude !== 'number')) {
          throw new Error('Invalid coordinates provided');
        }

        const params = state.country 
          ? { country: state.country }
          : { 
              latitude: state.coordinates!.latitude,
              longitude: state.coordinates!.longitude
            };

        const data = await getLocationInfo(params);
        
        if (!data) {
          throw new Error('No data received from the server');
        }

        // Validate the required data structure
        if (!data.country || !data.country_code) {
          throw new Error('Invalid location data received from server');
        }

        setLocationInfo(data);
        
        // Set background image based on country
        setBackgroundImage(COUNTRY_BACKGROUNDS[data.country] || defaultBack);

      } catch (err) {
        console.error('Error fetching location info:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch location info');
      } finally {
        setLoading(false);
      }
    };

    fetchLocationInfo();
  }, [location.state]);

  // Filter cities based on search query
  const filteredCities = locationInfo?.states?.filter(state => 
    state.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

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
          onClick={() => navigate('/location-select')}
          className="px-6 py-3 rounded-lg bg-[#F5EC9B] text-[#004236] hover:opacity-90 transition-opacity"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full min-h-screen overflow-y-auto">
      {/* Background Image */}
      <div 
        className="fixed inset-0 bg-cover bg-center transition-all duration-700"
        style={{
          backgroundImage: `url("${backgroundImage}")`,
        }}
      />
      
      {/* Dark Teal-Green Overlay with Gradient */}
      <div
        className="fixed inset-0"
        style={{
          background: 'linear-gradient(135deg, rgba(0, 66, 54, 0.8) 0%, rgba(0, 66, 54, 0.6) 50%, rgba(0, 66, 54, 0.4) 100%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center min-h-screen pt-32 pb-16">
        <div className="absolute top-0 w-full">
          {/* Logo */}
          <div className="absolute top-8 left-8 animate-fadeInUp">
            <img src={logoGreen} alt="Vista View Logo" className="w-48" />
          </div>

          {/* Country Selector Dropdown */}
          <div className="absolute top-8 right-8 z-50">
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => {
                  console.log('Toggle dropdown clicked');
                  setIsDropdownOpen(!isDropdownOpen);
                }}
                className={`relative rounded-xl transition-all duration-300 hover:scale-105 min-w-[250px] w-auto ${!isDropdownOpen ? 'gradient-border-mask' : ''}`}
                style={isDropdownOpen ? {
                  background: 'linear-gradient(90deg, #905E26 0%, #F5EC9B 25.82%, #905E26 100%)',
                  boxShadow: '3px 3px 5px 0px #F5EC9B33 inset, -3px -3px 5px 0px #00000040 inset, 10px 10px 10px 0px #0C656E1A'
                } : undefined}
              >
                <div className={`rounded-xl px-3 py-2 w-full h-full flex flex-col min-h-[60px]`}>
                  <div className="flex items-center w-full gap-2">
                    <div className="flex gap-3 flex-1 items-center overflow-hidden">
                      <img 
                        src={locationInfo?.flag_png || (countries.find(c => c.country === locationInfo?.country)?.flag_png)} 
                        alt={`${locationInfo?.country || 'Select'} flag`}
                        className="w-10 h-[30px] object-cover rounded flex-shrink-0"
                      />
                      <div className="flex flex-col min-w-0 flex-1 justify-center">
                        <span className={`${isDropdownOpen 
                          ? 'text-[#004236] font-medium'
                          : 'text-transparent bg-clip-text bg-gradient-to-r from-[#905E26] via-[#F5EC9B] to-[#905E26]'
                        } truncate text-left whitespace-nowrap`}>
                          {locationInfo?.country || 'Select Country'}
                        </span>
                        <span className={`text-xs mt-0.5 ${isDropdownOpen 
                          ? 'text-[#004236]' 
                          : 'text-transparent bg-clip-text bg-gradient-to-r from-[#905E26] via-[#F5EC9B] to-[#905E26]'
                        } text-left whitespace-nowrap truncate`}>
                          Select Locality
                        </span>
                      </div>
                    </div>
                    <svg
                      className={`w-4 h-4 transition-transform duration-300 flex-shrink-0 ${isDropdownOpen ? 'transform rotate-180' : ''}`}
                      fill="none"
                      stroke={isDropdownOpen ? '#004236' : '#F5EC9B'}
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </button>

              {isDropdownOpen && countries.length > 0 && (
                <div 
                  className="absolute right-0 mt-2 w-full rounded-xl overflow-hidden"
                  style={{
                    background: 'rgba(0, 66, 54, 0.5)',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  {countries
                    .filter(country => country.country !== locationInfo?.country)
                    .map((country, index, filteredArray) => (
                    <button
                      key={country.country_code}
                      onClick={() => handleCountrySelect(country.country)}
                      className={`
                        w-full transition-all duration-300 hover:bg-[#F5EC9B]/10
                        ${index !== filteredArray.length - 1 ? 'border-b border-[#F5EC9B]/10' : ''}
                      `}
                    >
                      <div className="px-3 py-2 w-full h-full flex items-center min-h-[48px] gap-2">
                        <img 
                          src={country.flag_png} 
                          alt={`${country.country} flag`}
                          className="w-10 h-[30px] object-cover rounded flex-shrink-0"
                        />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#905E26] via-[#F5EC9B] to-[#905E26] truncate text-left whitespace-nowrap flex-1">
                          {country.country}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Real Estate Heading */}
          <div className="flex items-center justify-center gap-3 pt-12 animate-fadeInUp">
              <img 
                  src={realEstateHeading} 
                  alt="Real Estate" 
                  className="h-12"
              />
              <span className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#905E26] via-[#F5EC9B] to-[#905E26]">
                  Real Estate
              </span>
          </div>
        </div>

        {/* Selection Container */}
        <div className="max-w-3xl w-full mx-auto mt-12 px-8 animate-fadeInUp delay-200">
          <div className="relative bg-[#004236]/50 rounded-3xl p-8 gradient-border-mask">
            {/* Top right horizontal line */}
            <div 
              className="absolute -top-4 right-0"
              style={{
                width: '150px',
                height: '2px',
                background: 'linear-gradient(90deg, #905E26 0%, #F5EC9B 50%, #905E26 100%)',
                animation: 'moveRightToLeft 2s infinite'
              }}
            />

            {/* Top right vertical line */}
            <div 
              className="absolute top-0 -right-4"
              style={{
                width: '2px',
                height: '120px',
                background: 'linear-gradient(180deg, #905E26 0%, #F5EC9B 50%, #905E26 100%)',
                animation: 'moveTopToBottom 2s infinite'
              }}
            />

            {/* Bottom left horizontal line */}
            <div 
              className="absolute -bottom-4 left-0"
              style={{
                width: '150px',
                height: '2px',
                background: 'linear-gradient(90deg, #905E26 0%, #F5EC9B 50%, #905E26 100%)',
                animation: 'moveLeftToRight 2s infinite'
              }}
            />

            {/* Bottom left vertical line */}
            <div 
              className="absolute bottom-0 -left-4"
              style={{
                width: '2px',
                height: '120px',
                background: 'linear-gradient(180deg, #905E26 0%, #F5EC9B 50%, #905E26 100%)',
                animation: 'moveBottomToTop 2s infinite'
              }}
            />

            {/* Header with Search Box */}
            <div className="flex flex-col mb-8">
              {/* Locality Selection Text */}
              <h2 className="text-white text-sm mb-4 text-center">
                Select the locality in {locationInfo?.country}
              </h2>

              <div className="flex items-center justify-between w-full">
                <div className="w-[300px] relative">
                  {/* Search Icon */}
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <svg 
                      width="16" 
                      height="16" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path 
                        d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" 
                        stroke="white" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={`Search localities in ${locationInfo?.country}`}
                    className="w-full pl-10 pr-8 py-1.5 bg-transparent text-white text-sm placeholder-white/50 outline-none rounded-lg"
                    style={{
                      border: '2px solid transparent',
                      backgroundImage: 'linear-gradient(#004236, #004236), linear-gradient(90deg, #905E26, #F5EC9B, #905E26)',
                      backgroundOrigin: 'border-box',
                      backgroundClip: 'padding-box, border-box',
                    }}
                  />
                  {/* Clear Button */}
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 hover:opacity-80 transition-opacity"
                    >
                      <svg 
                        width="16" 
                        height="16" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path 
                          d="M18 6L6 18M6 6L18 18" 
                          stroke="white" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  )}
                </div>
                <button 
                  className="flex items-center gap-2 px-4 py-1.5 rounded-lg hover:bg-[#F5EC9B]/10 transition-all duration-300"
                >
                  <img src={locationIcon} alt="Location" className="w-5 h-5 [filter:invert(54%)_sepia(75%)_saturate(444%)_hue-rotate(353deg)_brightness(92%)_contrast(87%)]" />
                  <span className="text-transparent text-sm bg-clip-text bg-gradient-to-r from-[#905E26] via-[#F5EC9B] to-[#905E26]">
                    Use current location
                  </span>
                </button>
              </div>
            </div>

            {/* Cities/States Grid */}
            <div className={`px-6 ${showAllCities ? 'h-[400px] overflow-y-auto scrollbar-hide' : ''}`}>
              <div className={`grid grid-cols-3 gap-4 mb-6 place-items-center`}>
                {(searchQuery ? filteredCities : locationInfo?.states?.slice(0, showAllCities ? undefined : 6))?.map((state, index) => {
                  const isSelected = selectedCities.includes(state);
                  return (
                    <button 
                      key={index}
                      onClick={() => toggleCitySelection(state)}
                      className={`relative rounded-xl transition-all duration-300 hover:scale-105 w-full`}
                      style={isSelected ? {
                        background: 'linear-gradient(90deg, #905E26 0%, #F5EC9B 25.82%, #905E26 100%)',
                        boxShadow: '3px 3px 5px 0px #F5EC9B33 inset, -3px -3px 5px 0px #00000040 inset, 10px 10px 10px 0px #0C656E1A'
                      } : undefined}
                    >
                      <div className={`rounded-xl p-4 w-full h-full flex items-center justify-center min-h-[60px] gap-2 ${!isSelected ? 'gradient-border-mask' : ''}`}>
                        {isSelected && (
                          <img 
                            src={selectedIcon} 
                            alt="Selected" 
                            className="w-5 h-5"
                          />
                        )}
                        <span className={`${isSelected 
                          ? 'text-[#004236] font-medium'
                          : 'text-transparent bg-clip-text bg-gradient-to-r from-[#905E26] via-[#F5EC9B] to-[#905E26]'
                        }`}>
                          {state}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Cities Count */}
            {selectedCities.length > 0 && (
              <div className="text-center mt-4">
                <span className="text-[#F5EC9B] text-sm">
                  {selectedCities.length} {selectedCities.length === 1 ? 'city' : 'cities'} selected
                </span>
              </div>
            )}

            {/* View More Button */}
            <div className="text-center mt-6">
              <button
                onClick={() => setShowAllCities(!showAllCities)}
                className="flex items-center justify-center gap-2 mx-auto text-sm hover:bg-[#F5EC9B]/10 transition-all duration-300 px-4 py-2 rounded-lg"
              >
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#905E26] via-[#F5EC9B] to-[#905E26]">
                  {showAllCities ? 'Show less' : 'View more cities'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="relative animate-fadeInUp delay-600 mt-8">
          <button
            onClick={() => {
              if (selectedCities.length > 0) {
                navigate('/map3d', {
                  state: {
                    cities: selectedCities,
                    country: locationInfo?.country
                  }
                });
              }
            }}
            disabled={selectedCities.length === 0}
            className={`relative px-8 py-4 font-bold text-lg rounded-lg transition-all duration-300 transform z-10 ${
              selectedCities.length > 0 ? 'hover:scale-105' : 'opacity-50 cursor-not-allowed'
            }`}
            style={{
              backgroundColor: selectedCities.length > 0 ? '#fcfaeb' : '#e5e5e5',
              boxShadow: selectedCities.length > 0 
                ? '5px 5px 5px 0px #905E2633 inset, -5px -5px 5px 0px #EFEAC5 inset'
                : 'none',
              border: 'none'
            }}
          >
            <span className={`text-transparent bg-clip-text bg-gradient-to-r from-[#905E26] via-[#F5EC9B] to-[#905E26] ${
              selectedCities.length === 0 ? 'opacity-50' : ''
            }`}>
              Search Properties
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationInfoPage;