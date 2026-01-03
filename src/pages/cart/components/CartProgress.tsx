import React from 'react';
import { Check } from 'phosphor-react';

interface CartProgressProps {
  currentStep: number;
}

export default function CartProgress({ currentStep }: CartProgressProps) {
  const steps = [
    { number: 1, label: 'Shopping cart' },
    { number: 2, label: 'Checkout details' },
    { number: 3, label: 'Order complete' }
  ];

  return (
    <div className="flex items-center justify-center mt-8">
      {steps.map((step, index) => (
        <div
          key={step.number}
          className={`flex flex-col items-center ${
            index < steps.length - 1 ? 'mr-16' : ''
          }`}
        >
          <div className="flex items-center w-full">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${
                currentStep >= step.number 
                  ? 'from-[#004236] to-[#007E67]'
                  : 'bg-gray-200 text-gray-400'
              }`}
              style={{
                background: currentStep >= step.number 
                  ? 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)'
                  : undefined
              }}
            >
              {currentStep > step.number ? (
                <Check weight="bold" className="w-5 h-5" />
              ) : (
                step.number
              )}
            </div>
            <span 
              className={`ml-3 font-medium ${
                currentStep >= step.number ? 'text-[#004236]' : 'text-gray-400'
              }`}
            >
              {step.label}
            </span>
          </div>
          {currentStep === step.number && (
            <div 
              className="h-0.5 mt-2 w-full"
              style={{
                background: '#004236'
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
} 