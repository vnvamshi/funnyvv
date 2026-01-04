import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import homeImage from '../../assets/images/v3/home.jpg';
import logoGreen from '../../assets/images/v3/logo-green.png';
import realEstateHeading from '../../assets/images/v3/real-estate-heading.png';
import indiaIcon from '../../assets/images/v3/india.svg';
import usaIcon from '../../assets/images/v3/usa.svg';
import australiaIcon from '../../assets/images/v3/australia.svg';
import dubaiIcon from '../../assets/images/v3/dubai.svg';
import locationIcon from '../../assets/images/v3/location.png';
// Import background images
import indiaBack from '../../assets/images/v3/india-back.png';
import usaBack from '../../assets/images/v3/usa-back.png';
import australiaBack from '../../assets/images/v3/australia-back.png';
import dubaiBack from '../../assets/images/v3/dubai-back.png';

interface CountryOption {
    id: string;
    name: string;
    icon: string;
    background: string;
}

const LocationSelectionPage = () => {
    const navigate = useNavigate();
    const [userLocation, setUserLocation] = useState<GeolocationCoordinates | null>(null);
    const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
    const [permissionStatus, setPermissionStatus] = useState<string>('');

    const countries: CountryOption[] = [
        { id: 'india', name: 'India', icon: indiaIcon, background: indiaBack },
        { id: 'usa', name: 'USA', icon: usaIcon, background: usaBack },
        { id: 'australia', name: 'Australia', icon: australiaIcon, background: australiaBack },
        { id: 'uae', name: 'Dubai', icon: dubaiIcon, background: dubaiBack }
    ];

    // Get current background image based on selection
    const getCurrentBackground = () => {
        if (!selectedCountry) return homeImage;
        const country = countries.find(c => c.id === selectedCountry);
        return country ? country.background : homeImage;
    };

    useEffect(() => {
        // Check initial permission status
        if ("permissions" in navigator) {
            navigator.permissions.query({ name: 'geolocation' })
                .then((result) => {
                    setPermissionStatus(result.state);
                    result.onchange = () => {
                        setPermissionStatus(result.state);
                    };
                });
        }
    }, []);

    useEffect(() => {
        // Check if geolocation is supported
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation(position.coords);
                    console.log("Location permission granted:", {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy
                    });
                },
                (error) => {
                    console.log("Error getting location permission:", error.message);
                }
            );
        } else {
            console.log("Geolocation is not supported by this browser.");
        }
    }, []);

    const handleCountrySelect = (countryId: string) => {
        setSelectedCountry(countryId);
        // Store selected country and location data if available
        localStorage.setItem('selectedCountry', countryId);
        if (userLocation) {
            localStorage.setItem('userLocation', JSON.stringify({
                lat: userLocation.latitude,
                lng: userLocation.longitude
            }));
        }
    };

    const handleUseCurrentLocation = () => {
        if (!("geolocation" in navigator)) {
            console.log("Geolocation is not supported by this browser.");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const coordinates = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                };
                
                console.log("Location permission granted:", {
                    ...coordinates,
                    accuracy: position.coords.accuracy,
                    timestamp: new Date().toISOString()
                });
                
                setUserLocation(position.coords);
                setPermissionStatus('granted');
                
                // Navigate to location info page with coordinates
                navigate('/location-select/info', {
                    state: { coordinates }
                });
            },
            (error) => {
                console.log("Error getting location:", error);
                setPermissionStatus('denied');
            }
        );
    };

    return (
        <div className="relative w-full h-screen overflow-hidden">
            
            {/* Background Image */}
            <div
                className="absolute inset-0 bg-cover bg-center transition-all duration-700"
                style={{
                    backgroundImage: `url(${getCurrentBackground()})`,
                }}
            />

            {/* Dark Teal-Green Overlay with Gradient */}
            <div
                className="absolute inset-0"
                style={{
                    background: 'linear-gradient(135deg, rgba(0, 66, 54, 0.8) 0%, rgba(0, 66, 54, 0.6) 50%, rgba(0, 66, 54, 0.4) 100%)',
                }}
            />

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center h-full pt-32">
                <div className="absolute top-0 w-full">
                    {/* Logo */}
                    <div className="absolute top-8 left-8 animate-fadeInUp">
                        <img 
                            src={logoGreen} 
                            alt="Vista View Logo" 
                            className="w-48"
                        />
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
                <div className="max-w-xl w-full mx-auto px-8 animate-fadeInUp delay-200 mt-10">
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

                        <h2 className="text-center mb-8">
                            <span className="text-l text-transparent bg-clip-text bg-gradient-to-r from-[#905E26] via-[#F5EC9B] to-[#905E26] inline-block">
                                Select Country
                            </span>
                        </h2>

                        {/* Country Grid */}
                        <div className="grid grid-cols-2 gap-4 mb-8 px-6">
                            {countries.map((country) => (
                                <button
                                key={country.id}
                                onClick={() => handleCountrySelect(country.id)}
                                className={`relative rounded-xl transition-all duration-300 hover:scale-105 ${
                                  country.id === selectedCountry
                                    ? 'bg-gradient-to-r from-[#905E26] to-[#F5EC9B]'
                                    : 'gradient-border-mask'
                                }`}
                              >
                                <div
                                  className="rounded-xl flex items-center gap-3 p-4 w-full h-full"
                                >
                                  <img 
                                    src={country.icon} 
                                    alt={country.name}
                                    className={`w-8 h-8 ${
                                      country.id === selectedCountry 
                                      ? 'brightness-[0.2]' 
                                      : '[filter:invert(54%)_sepia(75%)_saturate(444%)_hue-rotate(353deg)_brightness(92%)_contrast(87%)]'
                                    }`}
                                  />
                                  <span
                                    className={`text-lg font-medium ${
                                      country.id === selectedCountry
                                        ? 'text-[#004236]'
                                        : 'text-transparent bg-clip-text bg-gradient-to-r from-[#905E26] via-[#F5EC9B] to-[#905E26]'
                                    }`}
                                  >
                                    {country.name}
                                  </span>
                                </div>
                              </button>
                            ))}
                        </div>

                        {/* Current Location Option */}
                        <button
                            onClick={handleUseCurrentLocation}
                            className="w-fit mx-auto flex items-center justify-center gap-2 py-2 px-4 rounded-lg hover:bg-[#F5EC9B]/10 transition-all duration-300"
                        >
                            <img src={locationIcon} alt="Location" className="w-6 h-6 [filter:invert(54%)_sepia(75%)_saturate(444%)_hue-rotate(353deg)_brightness(92%)_contrast(87%)]" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#905E26] via-[#F5EC9B] to-[#905E26]">
                                Use current location
                            </span>
                        </button>
                        {permissionStatus === 'denied' && (
                            <p className="text-[#F5EC9B] text-sm text-center mt-2">
                                Please enable location access in your browser settings
                            </p>
                        )}
                    </div>
                </div>

                {/* Enter Button */}
                <div className="relative animate-fadeInUp delay-600">

                    {/* Begin Journey Button */}
                    <button
                        onClick={() => {
                            if (selectedCountry) {
                                const countryMap: Record<string, string> = {
                                    india: 'India',
                                    usa: 'United States',
                                    australia: 'Australia',
                                    uae: 'United Arab Emirates'
                                };
                                const country = countryMap[selectedCountry];
                                if (!country) {
                                    console.error('Invalid country selected:', selectedCountry);
                                    return;
                                }
                                navigate('/location-select/info', {
                                    state: { country }
                                });
                            }
                        }}
                        className={`relative px-8 py-4 mt-12 font-bold text-lg rounded-lg transition-all duration-300 transform z-10 ${
                            selectedCountry ? 'hover:scale-105 opacity-100' : 'opacity-50 cursor-not-allowed'
                        }`}
                        style={{
                            backgroundColor: '#fcfaeb',
                            boxShadow: '5px 5px 5px 0px #905E2633 inset, -5px -5px 5px 0px #EFEAC5 inset',
                            border: 'none'
                        }}
                    >
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#905E26] via-[#F5EC9B] to-[#905E26]">
                            Begin your journey ≫
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LocationSelectionPage;