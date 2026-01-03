import React from 'react';
import VistaViewHelp from '../../assets/images/vistaview-help.svg';
import Handhome from '../../assets/images/handhome.svg';
import HomeGreen from '../../assets/images/homegreen.svg';
import HomeOuterGreen from '../../assets/images/homeoutergreen.svg';

const WhatWeOfferSection = () => (
  <div className="relative bg-cover bg-center min-h-screen" style={{ backgroundImage: `url(${VistaViewHelp})` }}>
    {/* Overlay */}
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
    {/* Content Container */}
    <div className="relative z-10 flex flex-col items-center justify-center px-6 py-20 text-white text-center">
      {/* Top Section */}
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
);

export default WhatWeOfferSection; 