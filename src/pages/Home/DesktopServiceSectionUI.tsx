import React from 'react';
import Realestate from '../../assets/images/realestate.svg';
import SecurityCamera from '../../assets/images/security-cam.svg';
import InteriorDesign from '../../assets/images/interior-design.svg';

const services = [
  {
    icon: Realestate,
    label: 'Real Estate',
  },
  {
    icon: SecurityCamera,
    label: 'Security Camera',
  },
  {
    icon: InteriorDesign,
    label: 'Interior Design',
  },
];

const ServiceSection = () => {
  return (
    <div className="text-center px-4 py-12 pt-4">
      {/* Heading */}
      <h2
        className="text-2xl md:text-3xl font-semibold mb-10 text-transparent bg-clip-text"
        style={{
          backgroundImage: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)',
        }}
      >
        Explore more services with Vistaview
      </h2>


      {/* Card Container */}
      <div
        className="bg-white rounded-2xl py-10 px-6 max-w-5xl mx-auto flex flex-col sm:flex-row justify-center gap-20"
        style={{
          boxShadow: '10px 10px 50px 0px #0000000D',
        }}
      >
        {services.map((service, index) => (
          <div key={index} className="flex flex-col items-center">
            <img src={service.icon} alt={service.label} className="w-40 h-40" />
            <p className="mt-4 text-[20px] font-semibold text-[#004236]">{service.label}</p>
          </div>
        ))}
      </div>

    </div>
  );
};

export default ServiceSection;
