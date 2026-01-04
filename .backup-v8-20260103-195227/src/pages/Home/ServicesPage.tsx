import React from 'react';
import logoGreen from '../../assets/images/v3/logo-green.png';
import realEstateIcon from '../../assets/images/v3/v-realestate.png';
import securityCameraIcon from '../../assets/images/v3/security-camera.png';
import interiorDesignIcon from '../../assets/images/v3/interior-design.png';
import homeImage from '../../assets/images/v3/home.jpg';
import { useNavigate } from 'react-router-dom';

const ServicesPage = () => {
    const navigate = useNavigate();

    const services = [
        {
            icon: realEstateIcon,
            title: 'Real Estate',
            alt: 'Real Estate Icon',
            path: '/location-select'
        },
        {
            icon: securityCameraIcon,
            title: 'Security Camera',
            alt: 'Security Camera Icon',
            path: '/home'
        },
        {
            icon: interiorDesignIcon,
            title: 'Interior Design',
            alt: 'Interior Design Icon',
            path: '/home'
        }
    ];

    const handleServiceClick = (title: string, path: string) => {
        if (title === 'Real Estate') {
            navigate(path);
        } else {
            navigate('/home');
        }
    };

    return (
        <div className="relative w-full h-screen overflow-hidden">
            {/* Background Image */}
            <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                    backgroundImage: `url(${homeImage})`,
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
            <div className="relative z-10 flex flex-col h-full">
                {/* Logo Section - Top Left */}
                <div className="absolute top-8 left-8 animate-fadeInUp">
                    <img
                        src={logoGreen}
                        alt="Vista View Logo"
                        className="w-48"
                    />
                </div>

                {/* Services Section - Center */}
                <div className="flex-1 flex items-center justify-center">
                    {/* Services Container */}
                    <div className="relative max-w-4xl mx-auto px-8 animate-fadeInUp delay-200">
                        {/* Top right horizontal line */}
                        <div
                            className="absolute -top-8 right-0"
                            style={{
                                width: '200px',
                                height: '2px',
                                background: 'linear-gradient(90deg, #905E26 0%, #F5EC9B 50%, #905E26 100%)',
                                animation: 'moveRightToLeft 2s infinite'
                            }}
                        />

                        {/* Top right vertical line */}
                        <div
                            className="absolute top-0 -right-1"
                            style={{
                                width: '2px',
                                height: '120px',
                                background: 'linear-gradient(180deg, #905E26 0%, #F5EC9B 50%, #905E26 100%)',
                                animation: 'moveTopToBottom 2s infinite'
                            }}
                        />

                        {/* Bottom left horizontal line */}
                        <div
                            className="absolute -bottom-8 left-0"
                            style={{
                                width: '200px',
                                height: '2px',
                                background: 'linear-gradient(90deg, #905E26 0%, #F5EC9B 50%, #905E26 100%)',
                                animation: 'moveLeftToRight 2s infinite'
                            }}
                        />

                        {/* Bottom left vertical line */}
                        <div
                            className="absolute bottom-0 -left-1"
                            style={{
                                width: '2px',
                                height: '120px',
                                background: 'linear-gradient(180deg, #905E26 0%, #F5EC9B 50%, #905E26 100%)',
                                animation: 'moveBottomToTop 2s infinite'
                            }}
                        />

                        {/* Services Grid */}
                        <div className="relative grid grid-cols-3 gap-8 p-12 bg-[#00423680]/50 rounded-3xl gradient-border-mask">
                            {services.map((service, index) => (
                                <div
                                    key={index}
                                    className={`flex flex-col items-center gap-6 group cursor-pointer animate-fadeInUp`}
                                    style={{ animationDelay: `${(index + 2) * 0.2}s` }}
                                    onClick={() => handleServiceClick(service.title, service.path)}
                                >
                                    {/* Icon Container */}
                                    <div className="relative p-[2px] rounded-2xl bg-gradient-to-r from-[#905E26] via-[#F5EC9B] to-[#905E26] transition-all duration-300">
                                        <div className="p-8 rounded-2xl bg-[#004236]">
                                            <img
                                                src={service.icon}
                                                alt={service.alt}
                                                className="w-16 h-16 object-contain transition-all duration-300 group-hover:scale-110"
                                            />
                                        </div>
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#905E26] via-[#F5EC9B] to-[#905E26]">
                                        {service.title}
                                    </h3>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServicesPage;