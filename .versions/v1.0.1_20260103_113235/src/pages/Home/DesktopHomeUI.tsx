import React, { useState, useRef, useEffect } from 'react';
import { FaHandHolding, FaHome, FaMapMarkerAlt } from 'react-icons/fa';
import Minus from '../../assets/images/minus.svg';
import Plus from '../../assets/images/plus.svg';
import LandImg1 from '../../assets/images/land-img-1.svg';
import LandImg2 from '../../assets/images/land-img-2.png';
import LandImg3 from '../../assets/images/land-img-3.png';
import FloorPlanImg from '../../assets/images/ipad-image.svg';
import LocationVector from '../../assets/images/location-vector.svg';
import activeBgLong from '../../assets/images/active-bg-long.svg';
import VistaViewHelp from '../../assets/images/vistaview-help.svg';
import Handhome from '../../assets/images/handhome.svg';
import HomeGreen from '../../assets/images/homegreen.svg';
import HomeOuterGreen from '../../assets/images/homeoutergreen.svg';
import ExploreImage1 from '../../assets/images/explore-img1.svg';
import ExploreImage2 from '../../assets/images/explore-img2.svg';
import ExploreImage3 from '../../assets/images/explore-img3.svg';
import ExploreImage4 from '../../assets/images/explore-img4.svg';
import ExploreImage5 from '../../assets/images/explore-img5.svg';
import ExploreImage6 from '../../assets/images/explore-img6.svg';
import ExploreImage1Grad from '../../assets/images/explore-img1-grad.svg';
import ExploreImage2Grad from '../../assets/images/explore-img2-grad.svg';
import ExploreImage5Grad from '../../assets/images/explore-img5-grad.svg';
import ExploreImage6Grad from '../../assets/images/explore-img6-grad.svg';
import { MdOutlineHouse } from 'react-icons/md';
import PropertyCard from './DesktopServiceSectionUI';
import ServiceSection from './DesktopServiceSectionUI';
import SpotlightSection from './DesktopSpotlightUI';
import { useNavigate } from 'react-router-dom';
import WhatWeOfferSection from './WhatWeOfferSection';

const HomeDesktop = ({ }) => {
    const accordionItems = [
        {
            label: 'Floor Plans',
            content: 'Gain a deeper understanding of your floor plans with true-to-scale 2D and 3D experiences'
        },
        {
            label: 'Architectural Models',
            content: 'Detailed architectural models with scale accuracy and 3D interactivity.',
        },
        {
            label: '3D Virtual Tours',
            content: 'Step inside your future space with immersive 3D virtual tours.',
        },
    ];

    const images = [LandImg1, LandImg2, LandImg3];

    const [openIndex, setOpenIndex] = useState<number | null>(0);
    const [index, setIndex] = useState(0);
    const [searchValue, setSearchValue] = useState('');

    // Auto slide every 5 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % images.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const toggleAccordion = (index: number) => {
        setOpenIndex(prev => (prev === index ? null : index));
    };

    const navigate = useNavigate();

    return (
        <div className="w-full">
            <div className="relative w-full h-screen overflow-hidden">
                {/* Background Image Carousel */}
                <div
                    className="absolute inset-0 bg-cover bg-center transition-all duration-700"
                    style={{ backgroundImage: `url(${images[index]})` }}
                />

                {/* Gradient + Blur Overlay */}
                <div
                    className="absolute inset-0"
                    style={{
                        opacity: 0.3,
                        background:
                            'linear-gradient(176.7deg, rgba(0, 66, 54, 0.72) 4.41%, rgba(26, 142, 194, 0) 144.91%)',
                        backdropFilter: 'blur(4px)',
                        WebkitBackdropFilter: 'blur(4px)',
                    }}
                />

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 text-center text-white space-y-6">
                    {/* Heading */}
                    <h1 className="relative text-5xl font-bold leading-tight max-w-4xl">
                        {/* Shadow Text */}
                        <span
                            className="absolute inset-0 text-black"
                            style={{
                                fontFamily: '"DM Serif Display", serif',
                                zIndex: 0,
                                transform: 'translate(1.5px, 0px)',
                            }}
                            aria-hidden="true"
                        >
                            The Amazon of Real Estate
                        </span>

                        {/* Gradient Text */}
                        <span
                            className="relative z-10 bg-clip-text text-transparent"
                            style={{
                                fontFamily: '"DM Serif Display", serif',
                                backgroundImage:
                                    'linear-gradient(91.15deg, #905E26 -21.69%, #F5EC9B 46.73%, #905E26 129.71%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}
                        >
                            The Amazon of Real Estate
                        </span>
                    </h1>

                    {/* Subtitle */}
                    <p className="text-[20px] font-medium text-white">
                        Your one-stop platform for all real estate needs
                    </p>

                    {/* Search bar */}
                    <div className="bg-white rounded-md flex items-center w-full max-w-xl p-1 shadow-md">
                        <img src={LocationVector} alt="Location Icon" className="ml-2 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by location"
                            className="flex-1 p-3 text-sm focus:outline-none text-black form-input"
                            value={searchValue}
                            onChange={e => setSearchValue(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === 'Enter' && searchValue.trim()) {
                                    navigate(`/property-listing?search=${encodeURIComponent(searchValue.trim())}`);
                                }
                            }}
                        />
                        <button
                            className="custom-vtour-gradient-btn text-white px-6 py-2 rounded-md m-1 transition-all duration-300"
                            onClick={() => {
                                if (searchValue.trim()) {
                                    navigate(`/property-listing?search=${encodeURIComponent(searchValue.trim())}`);
                                }
                            }}
                        >
                            Search
                        </button>
                    </div>

                    {/* Dash Indicators */}
                    <div className="flex justify-center gap-2 mt-6">
                        {images.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setIndex(i)}
                                className={`w-3 h-0.5 rounded-full transition-all duration-300 ${index === i ? 'bg-white w-6' : 'bg-white/50'
                                    }`}
                            />
                        ))}
                    </div>
                </div>
            </div>


            {/* Feature Section */}
            <div className="w-full bg-white md:px-10 py-0 flex flex-col md:flex-row items-center gap-10">
                {/* Left Image Section */}
                <div className="basis-1/2 flex justify-center">
                    <img
                        src={FloorPlanImg}
                        alt="3D Floor Plan"
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Right Content */}
                <div className="basis-1/2 w-full max-w-xl space-y-6 pl-12">
                    <div className="space-y-1">
                        <div className="flex items-center gap-4 uppercase text-sm tracking-widest text-black-500 text-[16px]">
                            <span>Digital Experience</span>
                            <div className="flex-grow border-t-2 border-black"></div>
                        </div>
                        <h2
                            className="text-[40px] font-semibold leading-snug bg-clip-text text-transparent"
                            style={{
                                backgroundImage: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)',
                            }}
                        >
                            Explore your home, <br /> your way
                        </h2>
                    </div>

                    {/* Accordions */}
                    <div className="space-y-4">
                        {accordionItems.map((item, index) => {
                            const isOpen = openIndex === index;
                            const contentRef = useRef<HTMLDivElement>(null);

                            return (
                                <div
                                    key={item.label}
                                    className={`w-full rounded-md transition-all duration-300 overflow-hidden ${isOpen ? 'text-white shadow-md' : 'bg-white text-black'}`}
                                    style={{
                                        ...(isOpen
                                            ? {
                                                background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)',
                                            }
                                            : {
                                                border: '3px solid',
                                                borderImageSource:
                                                    'linear-gradient(90deg, #905E26 0%, #F5EC9B 25.82%, #905E26 100%)',
                                                borderImageSlice: 1,
                                            }),
                                        transition: 'max-height 0.4s ease',
                                        maxHeight: isOpen ? (contentRef.current ? contentRef.current.scrollHeight + 80 + 'px' : 0) : '60px',
                                    }}
                                >
                                    <button
                                        onClick={() => toggleAccordion(index)}
                                        className="w-full flex items-center justify-between text-left px-4 py-3 focus:outline-none text-[18px] font-medium"
                                    >
                                        {item.label}
                                        {isOpen ? (
                                            <img src={Minus} alt="Collapse" className="w-5 h-5" />
                                        ) : (
                                            <img src={Plus} alt="Expand" className="w-5 h-5" />
                                        )}
                                    </button>

                                    <div
                                        ref={contentRef}
                                        className="px-4 pb-4 text-[14px] font-normal"
                                        style={{
                                            transition: 'opacity 0.4s ease',
                                            opacity: isOpen ? 1 : 0,
                                        }}
                                    >
                                        {item.content}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>



            {/* <!-- Background Section --> */}
            <div className="relative bg-cover bg-center min-h-screen" style={{ backgroundImage: `url(${VistaViewHelp})` }}>
                {/* <!-- Overlay --> */}
                <div
                    className="absolute inset-0"
                    style={{
                        opacity: 0.3,
                        background: `
                        linear-gradient(176.7deg, rgba(0, 66, 54, 0.9) 4.41%, rgba(26, 142, 194, 0) 113.84%),
                        linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)
                    `,
                        backdropFilter: 'blur(4px)',
                        WebkitBackdropFilter: 'blur(4px)',
                    }}
                ></div>


                {/* <!-- Content Container --> */}
                <div className="relative z-10 flex flex-col items-center justify-center px-6 py-20 text-white text-center">

                    {/* <!-- Top Section --> */}
                    <div className="mb-10">
                        <div className="flex items-center justify-center gap-4 text-xs tracking-widest uppercase mb-2">
                            <div className="w-40 h-px bg-white"></div>
                            <span className='text-[16px]'>What We Offer</span>
                            <div className="w-40 h-px bg-white"></div>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-medium">See how Vistaview can help</h2>
                    </div>

                    <div className="relative flex flex-col md:flex-row items-center justify-center gap-8 w-full">
                        {/* Left Card */}
                        <div className="bg-transparent border border-white text-white rounded-2xl p-12 flex items-center justify-center max-w-md w-full shadow-lg min-h-[460px]">
                            <div className="text-white space-y-8">
                                {/* Icon and first line */}
                                <div className="flex gap-3 mb-1">
                                    <img src={Handhome} alt="Location Icon" className="ml-1 w-12 h-12" />
                                </div>

                                {/* Second line */}
                                <h2 className="text-[39px] font-[500] mb-4 text-left space-y-8">
                                    Want to sell a home <br />in Vistaview
                                </h2>
                                <div className='text-left'>
                                    {/* Button */}
                                    <button className="px-5 py-2 bg-white text-[#004236] rounded-md hover:bg-gray-100 transition">
                                        Sell Home
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Right Cards */}
                        <div className="flex flex-col gap-6 flex-1 max-w-md w-full">
                            {/* Buy Home Card */}
                            <div className="bg-[#D0F2EB] rounded-2xl p-6 items-center justify-between min-h-[190px]">
                                <div className="text-white space-y-4">
                                    {/* Icon and first line */}
                                    <div className="flex gap-3 mb-1">
                                        <img src={HomeGreen} alt="Location Icon" className="ml-1 w-8 h-8" />
                                    </div>

                                    {/* Second line */}
                                    <h2
                                        className="text-[22px] font-[600] mb-2 text-left text-transparent bg-clip-text"
                                        style={{
                                            backgroundImage:
                                                'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                        }}
                                    >
                                        Want to buy a new home with <br /> more amenities
                                    </h2>

                                    <div className="text-right">
                                        {/* Button */}
                                        <button
                                            className="px-5 py-2 text-white rounded-md hover:opacity-90 transition bg-[linear-gradient(111.83deg,_#004236_11.73%,_#007E67_96.61%)]"
                                        >
                                            Buy Home
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Rent Home Card */}
                            <div className="bg-[#FBF8E5] rounded-2xl p-6 items-center justify-between min-h-[190px]">
                                <div className="text-white space-y-4">
                                    {/* Icon and first line */}
                                    <div className="flex gap-3 mb-1">
                                        <img src={HomeOuterGreen} alt="Location Icon" className="ml-1 w-8 h-8" />
                                    </div>

                                    {/* Second line */}
                                    <h2
                                        className="text-[22px] font-[600] mb-2 text-left text-transparent bg-clip-text"
                                        style={{
                                            backgroundImage:
                                                'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                        }}
                                    >
                                        Want to buy a new home with <br /> more amenities
                                    </h2>

                                    <div className="text-right">
                                        {/* Button */}
                                        <button
                                            className="px-5 py-2 text-white rounded-md hover:opacity-90 transition bg-[linear-gradient(111.83deg,_#004236_11.73%,_#007E67_96.61%)]"
                                        >
                                            Find Rental Home
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <section className="py-16 px-4 pb-5 max-w-screen-xl mx-auto text-center">
                {/* Top Heading */}
                <div className="mb-12">
                    <div className="flex items-center justify-center gap-4 text-sm font-medium text-gray-500 mb-2">
                        <div className="w-40 h-[2px] bg-black" />
                        <div className='text-[16px] text-black'>PROPERTIES</div>
                        <div className="w-40 h-[2px] bg-black" />
                    </div>
                    <h2
                        className="text-3xl md:text-4xl font-[550] mb-4 text-transparent bg-clip-text"
                        style={{
                            backgroundImage:
                                "linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)",
                        }}
                    >
                        Explore homes on Vistaview
                    </h2>

                    <p className="max-w-xl mx-auto text-black text-[16px]">
                        The Amazon of Real Estate - Your one-stop platform for all real estate needs.
                        Find, buy, sell, and rent properties with ease.
                    </p>
                </div>
                {/* Grid Layout */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-left min-w-[242px]">
                    {/* Column 1 */}
                    <div
                        className="rounded-xl overflow-hidden relative group h-[365px] bg-cover bg-center"
                        style={{ backgroundImage: `url(${ExploreImage1})` }}
                    >
                        <div
                            className="absolute inset-0 bg-cover bg-center"
                            style={{
                                backgroundImage: `url(${ExploreImage1Grad})`,
                            }}
                        />

                        {/* Heading at top */}
                        <div className="absolute top-4 left-4 right-4 text-white z-10 text-[18px]">
                            <h3 className="text-lg">Sed ut perspiciatis unde omnis</h3>
                        </div>

                        {/* Button stays at bottom */}
                        <div className="absolute bottom-4 left-4 right-4 text-white z-10">
                            <button
                                className="mt-2 px-4 py-2 text-sm rounded-md font-medium text-[#004236]"
                                style={{ backgroundColor: '#FFFFFF99' }} // 60% opacity white
                            >
                                View home
                            </button>
                        </div>
                    </div>

                    {/* Column 2 - stacked */}
                    <div className="flex flex-col gap-4">
                        <div
                            className="rounded-xl p-4 text-white h-[173px]"
                            style={{
                                backgroundImage: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)',
                            }}
                        >
                            <h3 className="text-[14px] mb-2">Punta Cana</h3>
                            <p className="text-[12px] font-semibold mb-2 underline">Excepteur sint, occaecat</p>
                            <p className="text-[12px] leading-relaxed text-ellipsis overflow-hidden">
                                Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                            </p>
                        </div>

                        <div
                            className="rounded-xl overflow-hidden relative group bg-cover bg-center h-[173px]"
                            style={{ backgroundImage: `url(${ExploreImage2})` }}
                        >

                            <div
                                className="absolute inset-0 bg-cover bg-center"
                                style={{
                                    backgroundImage: `url(${ExploreImage2Grad})`,
                                }}
                            />

                            {/* Heading at the Top */}
                            <div className="absolute top-4 left-4 right-4 text-white z-10">
                                <h3 className="text-[18px]">The Amazon of Real Estate</h3>
                            </div>

                            {/* Button at the Bottom */}
                            <div className="absolute bottom-4 left-4 right-4 text-white z-10">
                                <button
                                    className="mt-2 px-4 py-2 text-sm rounded-md font-medium text-[#004236]"
                                    style={{ backgroundColor: '#FFFFFF99' }} // 60% opacity white
                                >
                                    View home
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Column 3 */}
                    <div className="flex flex-col gap-4">
                        <div
                            className="rounded-xl overflow-hidden relative group bg-cover bg-center h-[173px]"
                            style={{ backgroundImage: `url(${ExploreImage3})` }}
                        >

                            <div
                                className="absolute inset-0 bg-cover bg-center"
                                style={{
                                    backgroundImage: `url(${ExploreImage2Grad})`,
                                }}
                            />

                            {/* Heading at the Top */}
                            <div className="absolute top-4 left-4 right-4 text-white z-10">
                                <h3 className="text-[18px]">Ut enim ad minim veniam</h3>
                            </div>

                            {/* Button at the Bottom */}
                            <div className="absolute bottom-4 left-4 right-4 text-white z-10">
                                <button
                                    className="mt-2 px-4 py-2 text-sm rounded-md font-medium text-[#004236]"
                                    style={{ backgroundColor: '#FFFFFF99' }} // 60% opacity white
                                >
                                    View home
                                </button>
                            </div>
                        </div>
                        <div
                            className="rounded-xl overflow-hidden relative group bg-cover bg-center h-[173px]"
                            style={{ backgroundImage: `url(${ExploreImage4})` }}
                        >

                            <div
                                className="absolute inset-0 bg-cover bg-center"
                                style={{
                                    backgroundImage: `url(${ExploreImage2Grad})`,
                                }}
                            />

                            {/* Heading at the Top */}
                            <div className="absolute top-4 left-4 right-4 text-white z-10">
                                <h3 className="text-[18px]">Quis nostrud
                                    exercitation </h3>
                            </div>

                            {/* Button at the Bottom */}
                            <div className="absolute bottom-4 left-4 right-4 text-white z-10">
                                <button
                                    className="mt-2 px-4 py-2 text-sm rounded-md font-medium text-[#004236]"
                                    style={{ backgroundColor: '#FFFFFF99' }} // 60% opacity white
                                >
                                    View home
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Column 4 */}
                    <div
                        className="rounded-xl overflow-hidden relative group h-[365px] bg-cover bg-center"
                        style={{ backgroundImage: `url(${ExploreImage5})` }}
                    >
                        <div
                            className="absolute inset-0 bg-cover bg-center"
                            style={{
                                backgroundImage: `url(${ExploreImage5Grad})`,
                            }}
                        />

                        {/* Heading at top */}
                        <div className="absolute top-4 left-4 right-4 text-white z-10 text-[18px]">
                            <h3 className="text-lg">Consectetur adipiscing</h3>
                        </div>

                        {/* Button stays at bottom */}
                        <div className="absolute bottom-4 left-4 right-4 text-white z-10">
                            <button
                                className="mt-2 px-4 py-2 text-sm rounded-md font-medium text-[#004236]"
                                style={{ backgroundColor: '#FFFFFF99' }} // 60% opacity white
                            >
                                View home
                            </button>
                        </div>
                    </div>

                    {/* Column 5 - stacked */}
                    <div className="flex flex-col gap-4">
                        <div
                            className="rounded-xl overflow-hidden relative group bg-cover bg-center h-[173px]"
                            style={{ backgroundImage: `url(${ExploreImage6})` }}
                        >

                            <div
                                className="absolute inset-0 bg-cover bg-center"
                                style={{
                                    backgroundImage: `url(${ExploreImage6Grad})`,
                                }}
                            />

                            {/* Heading at the Top */}
                            <div className="absolute top-4 left-4 right-4 text-white z-10">
                                <h3 className="text-[18px]">Quis nostrud
                                    exercitation </h3>
                            </div>

                            {/* Button at the Bottom */}
                            <div className="absolute bottom-4 left-4 right-4 text-white z-10">
                                <button
                                    className="mt-2 px-4 py-2 text-sm rounded-md font-medium text-[#004236]"
                                    style={{ backgroundColor: '#FFFFFF99' }} // 60% opacity white
                                >
                                    View home
                                </button>
                            </div>
                        </div>
                        <div
                            className="rounded-xl p-4 h-[173px]"
                            style={{
                                background: '#D0F2EB',
                                color: '#01483B', // Set font color globally
                            }}
                        >
                            <h3 className="text-[14px] mb-2">Punta Cana</h3>
                            <p className="text-[12px] font-semibold mb-2 underline">Excepteur sint, occaecat</p>
                            <p className="text-[12px] leading-relaxed text-ellipsis overflow-hidden">
                                Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                            </p>
                        </div>

                    </div>
                </div>
            </section>
            <SpotlightSection />
            {/* <ServiceSection /> */}
        </div>
    );
};

export default HomeDesktop;
