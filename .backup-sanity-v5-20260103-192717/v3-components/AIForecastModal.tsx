import React from 'react';
import aiForecastImage from '../../assets/images/v3.2/property-images/ai-forecast.png';
import ModalCloseButton from '../../components/ModalCloseButton';

interface AIForecastModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSkyven?: boolean;
}

const AIForecastModal: React.FC<AIForecastModalProps> = ({ isOpen, onClose, isSkyven = false }) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const [chartVisible, setChartVisible] = React.useState(false);
  const [shouldRender, setShouldRender] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        setIsVisible(true);
        // Delay chart animation slightly
        setTimeout(() => setChartVisible(true), 200);
      }, 10);
    } else {
      setIsVisible(false);
      setChartVisible(false);
      // Delay unmounting to allow closing animation
      setTimeout(() => setShouldRender(false), 300);
    }
  }, [isOpen]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Chart data based on the image
  const chartData = React.useMemo(() => {
    const baseData = [
      { year: '2024', value: 222.65 },
      { year: '2025', value: 301.58 },
      { year: '2026', value: 408.42 },
      { year: '2027', value: 553.19 },
      { year: '2028', value: 749.31 },
      { year: '2029', value: 975.24 },
    ];
    return baseData.map(d => ({
      ...d,
      label: isSkyven ? `Rs. ${d.value} billion` : `$${d.value} billion`
    }));
  }, [isSkyven]);

  const maxValue = Math.max(...chartData.map(d => d.value));
  const chartHeight = 200;
  const barWidth = 40;
  const spacing = 60;

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ background: 'rgba(0, 66, 54, 0.8)' }}
      onClick={handleBackdropClick}
    >
      <div
        className={`bg-white rounded-2xl shadow-2xl max-w-5xl w-full mx-4 max-h-[90vh] overflow-hidden transform transition-all duration-300 relative ${
          isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
        }`}
      >
        <ModalCloseButton
          onClick={onClose}
          ariaLabel="Close AI forecast"
          className="absolute top-4 right-4 z-50"
        />
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 bg-white">
          <h2 className="text-2xl font-bold text-gray-900">Property AI Forecast</h2>
        </div>

        {/* Modal Content */}
        <div className="flex flex-col lg:flex-row">
          {/* Left Side - Chart */}
          <div className="flex-1 p-6">
            <div className="h-80 flex flex-col items-center justify-center">
              {/* Chart Title */}
              <div className="mb-4 text-center">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Property AI Forecast</h3>
                <div className="text-sm text-gray-600">The Business</div>
              </div>
              
              {/* SVG Chart */}
              <div className="w-full max-w-md">
                <svg width="100%" height={chartHeight + 40} viewBox={`0 0 ${chartData.length * spacing + 60} ${chartHeight + 40}`}>
                  <defs>
                    <linearGradient id="barGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#3B82F6" />
                      <stop offset="100%" stopColor="#1D4ED8" />
                    </linearGradient>
                  </defs>
                  
                  {/* Y-axis label */}
                  <text
                    x="15"
                    y={chartHeight / 2 + 20}
                    fill="#6B7280"
                    fontSize="12"
                    textAnchor="middle"
                    transform={`rotate(-90, 15, ${chartHeight / 2 + 20})`}
                  >
                    Market Size (in {isSkyven ? 'INR' : 'USD'} billion)
                  </text>

                  {/* Grid lines */}
                  {[0, 200, 400, 600, 800, 1000].map((value) => (
                    <g key={value}>
                      <line
                        x1="50"
                        y1={chartHeight - (value / maxValue) * chartHeight + 20}
                        x2={chartData.length * spacing + 50}
                        y2={chartHeight - (value / maxValue) * chartHeight + 20}
                        stroke="rgba(0,0,0,0.1)"
                        strokeWidth="1"
                        strokeDasharray="2,2"
                      />
                      <text
                        x="45"
                        y={chartHeight - (value / maxValue) * chartHeight + 25}
                        fill="#6B7280"
                        fontSize="10"
                        textAnchor="end"
                      >
                        {value}
                      </text>
                    </g>
                  ))}

                  {/* Bars */}
                  {chartData.map((data, index) => {
                    const barHeight = (data.value / maxValue) * chartHeight;
                    const x = 50 + index * spacing;
                    const barX = x - barWidth / 2;

                    return (
                      <g key={data.year}>
                        {/* Bar */}
                        <rect
                          x={barX}
                          y={chartHeight - (chartVisible ? barHeight : 0) + 20}
                          width={barWidth}
                          height={chartVisible ? barHeight : 0}
                          fill="url(#barGradient)"
                          opacity="0.8"
                          style={{
                            transition: `height 0.8s ease-out ${index * 0.1}s`,
                          }}
                        />
                        
                        {/* Value label on top of bar */}
                        <text
                          x={x}
                          y={chartHeight - (chartVisible ? barHeight : 0) + 15}
                          fill="#374151"
                          fontSize="10"
                          textAnchor="middle"
                          style={{
                            opacity: chartVisible ? 1 : 0,
                            transition: `opacity 0.5s ease-out ${index * 0.1 + 0.3}s`,
                          }}
                        >
                          {data.label}
                        </text>

                        {/* Year labels */}
                        <text
                          x={x}
                          y={chartHeight + 35}
                          fill="#6B7280"
                          fontSize="12"
                          textAnchor="middle"
                        >
                          {data.year}
                        </text>
                      </g>
                    );
                  })}

                  {/* CAGR Arrow */}
                  <g style={{
                    opacity: chartVisible ? 1 : 0,
                    transition: `opacity 0.8s ease-out 0.5s`,
                  }}>
                    <path
                      d={`M 50 ${chartHeight - 20} Q ${chartData.length * spacing / 2} ${chartHeight - 60} ${chartData.length * spacing + 50} ${chartHeight - 20}`}
                      stroke="#10B981"
                      strokeWidth="3"
                      fill="none"
                      strokeDasharray="5,5"
                    />
                    <text
                      x={chartData.length * spacing / 2 + 50}
                      y={chartHeight - 70}
                      fill="#10B981"
                      fontSize="12"
                      textAnchor="middle"
                      fontWeight="bold"
                    >
                      CAGR 34.10%
                    </text>
                  </g>
                </svg>
              </div>
            </div>
          </div>

          {/* Right Side - Text Content */}
          <div className="flex-1 p-6 bg-white">
            <div className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor 
                incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud 
                exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu 
                fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in 
                culpa qui officia deserunt mollit anim id est laborum.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIForecastModal;
