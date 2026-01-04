import React from 'react';
import house1 from '../../assets/images/spotlight-house1.svg';
import house2 from '../../assets/images/spotlight-house1.svg';
import SpotlightArrow from '../../assets/images/spotlight-right-arrow.svg';
import SpotlightLocationIcon from '../../assets/images/spotlight-location-icon.svg';
import MultiLocationMap from '../map/CheckMap';

const spotlightData = [
    {
        location: 'Punta Cana',
        title: 'Lorem ipsum dolor sit',
        subtitle: 'Consectetur adipiscing',
        bg: 'bg-[#FBF8E5]',
        img: house1,
    },
    {
        location: 'Juanillo',
        title: 'Ut enim ad minim veniam',
        subtitle: 'Quis nostrud exercitation',
        bg: 'bg-[#D0F2EB]',
        img: house2,
    },
    {
        location: 'Juanillo',
        title: 'Ut enim ad minim veniam',
        subtitle: 'Quis nostrud exercitation',
        bg: 'bg-[#DDF5EF]',
        img: house2,
    },
];

const SpotlightSection = () => {
    return (
        <div className="px-4 py-10">
            <div className="max-w-7xl mx-auto">
                {/* Heading */}
                <div className="mb-6">
                    <h2
                        className="text-[32px] font-semibold text-transparent bg-clip-text"
                        style={{
                            backgroundImage:
                                'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}
                    >
                        In Spotlight
                    </h2>
                    <p className="text-gray-700 mt-1">Find your best place to live with us</p>
                </div>

                {/* Draggable Card Carousel */}
                <div
                    className="flex gap-6 overflow-x-auto scroll-smooth cursor-grab select-none"
                    style={{ scrollbarWidth: 'none' }}
                    onMouseDown={(e) => {
                        e.preventDefault();
                        const container = e.currentTarget;
                        container.style.scrollBehavior = 'auto';
                        const startX = e.pageX - container.offsetLeft;
                        const scrollLeft = container.scrollLeft;

                        const onMouseMove = (eMove: MouseEvent) => {
                            const x = eMove.pageX - container.offsetLeft;
                            const walk = (x - startX) * 1.5;
                            container.scrollLeft = scrollLeft - walk;
                        };

                        const onMouseUp = () => {
                            container.style.scrollBehavior = 'smooth';
                            window.removeEventListener('mousemove', onMouseMove);
                            window.removeEventListener('mouseup', onMouseUp);
                        };

                        window.addEventListener('mousemove', onMouseMove);
                        window.addEventListener('mouseup', onMouseUp);
                    }}
                >
                    {spotlightData.map((item, idx) => (
                        <div
                            key={idx}
                            className={`relative flex min-w-[868px] h-[342px] overflow-hidden rounded-3xl`}
                            style={{
                                backgroundColor: item.bg.replace('bg-[', '').replace(']', ''),
                            }}
                        >
                            {/* Left Side Content */}
                            <div className="flex flex-col justify-between p-6 w-1/2 relative z-10 rounded-l-3xl bg-transparent min-w-[304px]">
                                <div>
                                    <div className="flex items-center gap-2 text-black font-medium text-sm mb-4">
                                        <img
                                            src={SpotlightLocationIcon}
                                            alt="Location"
                                            className="w-6 h-6 object-contain"
                                        />
                                        {item.location}
                                    </div>
                                    <div className="flex flex-col justify-center h-[100px]">
                                        <h3 className="text-xl font-bold text-black mb-1">
                                            {item.title}
                                        </h3>
                                        <p className="text-sm text-gray-700">{item.subtitle}</p>
                                    </div>
                                </div>

                                {/* Button */}
                                <button
                                    className="mt-2 w-fit px-6 py-3 text-white rounded-md text-sm font-medium"
                                    style={{
                                        background:
                                            'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)',
                                    }}
                                >
                                    Learn More
                                </button>
                            </div>

                            {/* Right Image with Gradient Overlay */}
                            <div className="w-1/2 relative rounded-3xl overflow-hidden min-w-[564px]">
                                <img
                                    src={item.img}
                                    alt={item.title}
                                    className="w-full h-full object-cover"
                                />
                                <div
                                    className="absolute inset-0"
                                    style={{
                                        background:
                                            'linear-gradient(358.85deg, rgba(0, 66, 54, 0.9) 3.14%, rgba(26, 142, 194, 0.1) 37.65%),' +
                                            'linear-gradient(179.43deg, rgba(26, 142, 194, 0.4) 3.13%, rgba(0, 66, 54, 0) 72.82%)',
                                    }}
                                />
                            </div>

                            {/* Center Arrow Button */}
                            <div className="absolute top-1/2 left-[35%] -translate-x-1/2 -translate-y-1/2 z-20">
                                <div className="bg-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg">
                                    <img
                                        src={SpotlightArrow}
                                        alt="Arrow"
                                        className="w-4 h-4 object-contain"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SpotlightSection;
