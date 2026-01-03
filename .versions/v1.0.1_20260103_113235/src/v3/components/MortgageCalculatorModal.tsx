import React, { useState, useMemo } from 'react';
import { X } from 'phosphor-react';

interface MortgageCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyPrice?: number;
}

const MortgageCalculatorModal: React.FC<MortgageCalculatorModalProps> = ({
  isOpen,
  onClose,
  propertyPrice = 600000
}) => {
  const [downPayment, setDownPayment] = useState<number>(100000);
  const [loanAmount, setLoanAmount] = useState<number>(Math.max(0, propertyPrice - 100000));
  const [interestPct, setInterestPct] = useState<number>(15);
  const [loanYears, setLoanYears] = useState<number>(5);
  const [loanUnit, setLoanUnit] = useState<'years' | 'months'>('years');

  // Update loan amount when property price changes
  React.useEffect(() => {
    setLoanAmount(Math.max(0, propertyPrice - downPayment));
  }, [propertyPrice, downPayment]);

  const mortgage = useMemo(() => {
    const principal = Math.max(0, loanAmount);
    const monthlyRate = (interestPct / 100) / 12;
    const n = loanUnit === 'years' ? loanYears * 12 : loanYears;
    const monthly = n > 0 && monthlyRate > 0
      ? (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -n))
      : (n > 0 ? principal / n : 0);
    const totalPayment = monthly * n;
    const totalInterest = Math.max(0, totalPayment - principal);
    return { monthly, principal, totalInterest };
  }, [loanAmount, interestPct, loanYears, loanUnit]);

  const DonutChart: React.FC<{ 
    values: { label: string; value: number; color: string }[]; 
    size?: number; 
    center?: React.ReactNode; 
  }> = ({ values, size = 180, center }) => {
    const [isVisible, setIsVisible] = React.useState(false);
    const total = values.reduce((s, v) => s + v.value, 0) || 1;
    let cumulative = 0;
    const radius = size / 2;
    const stroke = 22;
    const r = radius - stroke / 2;
    const circumference = 2 * Math.PI * r;

    React.useEffect(() => {
      setIsVisible(false);
      const timer = setTimeout(() => setIsVisible(true), 200);
      return () => clearTimeout(timer);
    }, [values]);

    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="block">
        <defs>
          <linearGradient id="gradPrincipal" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#905E26" />
            <stop offset="26%" stopColor="#F5EC9B" />
            <stop offset="100%" stopColor="#905E26" />
          </linearGradient>
        </defs>
        
        {/* Background circle */}
        <circle 
          cx={radius} 
          cy={radius} 
          r={r} 
          stroke="#E5E7EB" 
          strokeWidth={stroke} 
          fill="none" 
          opacity="0.15" 
        />
        
        {values.map((seg, i) => {
          const start = (cumulative / total) * 2 * Math.PI; 
          cumulative += seg.value;
          const end = (cumulative / total) * 2 * Math.PI;
          const large = end - start > Math.PI ? 1 : 0;
          const x1 = radius + r * Math.cos(start), y1 = radius + r * Math.sin(start);
          const x2 = radius + r * Math.cos(end), y2 = radius + r * Math.sin(end);
          const d = `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
          const segmentLength = (end - start) * r;
          const dashArray = `${segmentLength} ${circumference}`;
          const dashOffset = isVisible ? 0 : segmentLength;
          
          return (
            <path 
              key={`${seg.label}-${i}`} 
              d={d} 
              stroke={seg.color} 
              strokeWidth={stroke} 
              fill="none" 
              strokeLinecap="butt"
              strokeDasharray={dashArray}
              strokeDashoffset={dashOffset}
              style={{ 
                transition: `stroke-dashoffset 1.2s ease-out ${i * 0.2}s`,
                opacity: isVisible ? 1 : 0
              }} 
            />
          );
        })}
        
        {center && (
          <foreignObject 
            x={radius - size / 2} 
            y={radius - size / 2} 
            width={size} 
            height={size} 
            pointerEvents="none"
            style={{
              opacity: isVisible ? 1 : 0,
              transition: `opacity 0.8s ease-out ${values.length * 0.2 + 0.3}s`
            }}
          >
            <div className="w-full h-full flex items-center justify-center">
              {center}
            </div>
          </foreignObject>
        )}
      </svg>
    );
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0, 66, 54, 0.8)' }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div 
            className="flex items-center justify-between px-6 py-4 rounded-t-2xl"
            style={{ background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)' }}
          >
            <div className="flex items-center space-x-3">
              <img 
                src="/assets/images/v3.2/mortgate-big-icon.png" 
                alt="Mortgage Calculator" 
                className="w-8 h-8"
              />
              <h2 
                className="text-xl font-bold"
                style={{
                  background: 'linear-gradient(90deg, #A3733D 0%, #F5EC9B 76.92%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  color: 'transparent',
                }}
              >
                Mortgage Calculator
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

        {/* Body */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Section - Input Fields */}
            <div className="space-y-6">
              {/* Property Valuation and Down Payment */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-1">
                    Property Valuation
                  </div>
                  <div className="font-bold text-lg text-gray-900">
                    $ {propertyPrice.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-1">
                    Down payment
                  </div>
                  <div className="font-bold text-lg text-gray-900">
                    $ {downPayment.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Loan Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loan Amount
                </label>
                <input
                  type="text"
                  value={`$ ${loanAmount.toLocaleString()}`}
                  onChange={(e) => {
                    const value = Number(e.target.value.replace(/[^0-9]/g, '')) || 0;
                    setLoanAmount(value);
                    setDownPayment(Math.max(0, propertyPrice - value));
                  }}
                  className="w-full p-3 rounded-lg border-2 border-gray-300 focus:border-green-500 focus:outline-none text-lg font-semibold"
                  style={{ borderColor: 'rgba(0, 66, 54, 0.3)' }}
                />
              </div>

              {/* Interest Rate */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Interest %
                </label>
                <input
                  type="number"
                  value={interestPct}
                  onChange={(e) => setInterestPct(Number(e.target.value) || 0)}
                  className="w-full p-3 rounded-lg border-2 border-gray-300 focus:border-green-500 focus:outline-none text-lg font-semibold"
                  style={{ borderColor: 'rgba(0, 66, 54, 0.3)' }}
                />
              </div>

              {/* Loan Tenure */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loan Tenure
                </label>
                <div className="flex">
                  <input
                    type="number"
                    value={loanYears}
                    onChange={(e) => setLoanYears(Number(e.target.value) || 0)}
                    className="flex-1 p-3 rounded-l-lg border-2 border-r-0 border-gray-300 focus:border-green-500 focus:outline-none text-lg font-semibold"
                    style={{ borderColor: 'rgba(0, 66, 54, 0.3)' }}
                  />
                  <select
                    value={loanUnit}
                    onChange={(e) => setLoanUnit(e.target.value as 'years' | 'months')}
                    className="px-4 py-3 rounded-r-lg border-2 border-l-0 border-gray-300 focus:border-green-500 focus:outline-none text-lg font-semibold bg-white"
                    style={{ borderColor: 'rgba(0, 66, 54, 0.3)' }}
                  >
                    <option value="years">Year</option>
                    <option value="months">Month</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Right Section - Monthly Payment Chart */}
            <div className="flex flex-col items-center justify-center">
              <DonutChart
                values={[
                  { label: 'INTEREST', value: mortgage.totalInterest, color: 'rgba(47, 137, 121, 0.7)' },
                  { label: 'PRINCIPAL', value: mortgage.principal, color: 'url(#gradPrincipal)' },
                ]}
                size={200}
                center={(
                  <div className="text-center">
                    <div className="text-xs font-medium text-gray-600 mb-1">MONTHLY PAYMENT</div>
                    <div 
                      className="text-2xl font-bold"
                      style={{
                        background: 'linear-gradient(90deg, #905E26 0%, #F5EC9B 25.82%, #905E26 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        color: 'transparent',
                      }}
                    >
                      ${mortgage.monthly.toFixed(2)}
                    </div>
                  </div>
                )}
              />
              
              {/* Legend */}
              <div className="mt-4 flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: 'rgba(47, 137, 121, 0.7)' }}
                  />
                  <span className="text-sm font-medium text-gray-700">INTEREST</span>
                </div>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ 
                      background: 'linear-gradient(90deg, #905E26 0%, #F5EC9B 25.82%, #905E26 100%)'
                    }}
                  />
                  <span className="text-sm font-medium text-gray-700">PRINCIPAL</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MortgageCalculatorModal;
