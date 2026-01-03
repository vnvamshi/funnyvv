import React from "react";
import { useNavigate } from 'react-router-dom';

interface ProjectsProps {
  image: string;
  title: string;
  subtitle: string;
  tag: string;
  buttonLabel: string;
}

const Projects: React.FC<ProjectsProps> = ({ image, title, subtitle, tag, buttonLabel }) => {
  const navigate = useNavigate();
  return (
    <div
      className="relative min-w-[240px] h-[300px] rounded-xl overflow-hidden shadow-md cursor-pointer"
      style={{
        backgroundImage: `url(${image})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      onClick={() => navigate('/property/1')}
    >
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
      {/* Bottom Info Overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent text-white p-3 z-10">
        <h3 className="text-sm font-semibold">{title}</h3>
        <p className="text-xs text-gray-200">{subtitle}</p>
        <div className="mt-2 flex items-center justify-between">
           <button
          className="w-[80px] h-[25px] text-white text-xs rounded-[7px]"
          style={{ backgroundColor: "rgba(255, 255, 255, 0.4)" }}
          onClick={e => e.stopPropagation()}
        >  {tag}
        </button>
          
          
          <button className="text-xs bg-white text-green-700 px-3 py-[2px] rounded-full font-medium" onClick={e => e.stopPropagation()}>
            {buttonLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Projects;