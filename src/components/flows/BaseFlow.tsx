/**
 * BaseFlow - Common flow logic for Vendor/Builder/Agent flows
 * 
 * Features:
 * - Step management
 * - Voice navigation
 * - Progress tracking
 * - Common header/footer
 * - AgenticBar integration
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useAgentic } from '../core/useAgentic';
import { UnifiedAgenticBar } from '../core/UnifiedAgenticBar';

export interface FlowStep {
  id: string;
  label: string;
  component: React.ComponentType<StepProps>;
  voiceHints?: string;
}

export interface StepProps {
  data: Record<string, any>;
  updateData: (updates: Record<string, any>) => void;
  onNext: () => void;
  onBack: () => void;
  speak: (text: string) => void;
  isActive: boolean;
}

interface BaseFlowProps {
  // Config
  title: string;
  icon: string;
  steps: FlowStep[];
  flowType: 'vendor' | 'builder' | 'agent' | 'buyer';
  
  // State
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: Record<string, any>) => void;
  onBack?: () => void;
  
  // Theme
  theme?: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

const DEFAULT_THEME = {
  primary: '#004236',
  secondary: '#001a15',
  accent: '#B8860B'
};

export const BaseFlow: React.FC<BaseFlowProps> = ({
  title,
  icon,
  steps,
  flowType,
  isOpen,
  onClose,
  onComplete,
  onBack,
  theme = DEFAULT_THEME
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [flowData, setFlowData] = useState<Record<string, any>>({
    phone: '',
    otp: '',
    companyName: '',
    profile: '',
    beautifiedProfile: '',
    files: [],
    products: []
  });

  const currentStep = steps[currentStepIndex];
  
  // Voice control
  const agentic = useAgentic({
    context: `${flowType}_flow_${currentStep?.id || 'init'}`,
    onCommand: (cmd, intent) => {
      const lower = cmd.toLowerCase();
      if (lower.includes('next') || lower.includes('continue')) {
        goNext();
      }
      if (lower.includes('back') || lower.includes('previous')) {
        goBack();
      }
      if (lower.includes('close') || lower.includes('exit') || lower.includes('cancel')) {
        onClose();
      }
    }
  });

  // Navigation
  const goNext = useCallback(() => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
      agentic.speak(`Moving to ${steps[currentStepIndex + 1].label}`);
    } else {
      onComplete(flowData);
    }
  }, [currentStepIndex, steps, flowData, onComplete, agentic]);

  const goBack = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
      agentic.speak('Going back');
    } else if (onBack) {
      onBack();
    }
  }, [currentStepIndex, onBack, agentic]);

  const goToStep = useCallback((index: number) => {
    if (index >= 0 && index < steps.length) {
      setCurrentStepIndex(index);
    }
  }, [steps.length]);

  // Update data
  const updateData = useCallback((updates: Record<string, any>) => {
    setFlowData(prev => ({ ...prev, ...updates }));
  }, []);

  // Welcome message
  useEffect(() => {
    if (isOpen && currentStepIndex === 0) {
      setTimeout(() => {
        agentic.speak(`Welcome! Let's set up your ${flowType} account.`);
      }, 500);
    }
  }, [isOpen, flowType]);

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setCurrentStepIndex(0);
      setFlowData({
        phone: '', otp: '', companyName: '', profile: '',
        beautifiedProfile: '', files: [], products: []
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const CurrentStepComponent = currentStep?.component;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.92)',
      zIndex: 10000,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20
    }}>
      <div style={{
        background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
        borderRadius: 20,
        width: '100%',
        maxWidth: 800,
        maxHeight: '90vh',
        overflow: 'hidden',
        border: `2px solid ${theme.accent}40`,
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 24px',
          background: 'rgba(0,0,0,0.3)',
          borderBottom: `1px solid ${theme.accent}30`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontSize: '1.6em' }}>{icon}</span>
            <div>
              <h2 style={{ color: '#fff', margin: 0, fontSize: '1.1em' }}>{title}</h2>
              <span style={{ color: '#888', fontSize: '0.8em' }}>
                Step {currentStepIndex + 1} of {steps.length} • {currentStep?.label}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              color: '#fff',
              width: 36,
              height: 36,
              borderRadius: '50%',
              cursor: 'pointer',
              fontSize: '1.2em'
            }}
          >
            ✕
          </button>
        </div>

        {/* Progress */}
        <div style={{
          display: 'flex',
          padding: '10px 24px',
          gap: 4,
          background: 'rgba(0,0,0,0.2)'
        }}>
          {steps.map((step, i) => (
            <div
              key={step.id}
              onClick={() => i < currentStepIndex && goToStep(i)}
              style={{
                flex: 1,
                height: 4,
                borderRadius: 2,
                background: i <= currentStepIndex ? theme.accent : 'rgba(255,255,255,0.15)',
                cursor: i < currentStepIndex ? 'pointer' : 'default',
                transition: 'background 0.3s'
              }}
            />
          ))}
        </div>

        {/* Voice Status */}
        <div style={{
          padding: '12px 24px',
          background: 'rgba(0,0,0,0.2)',
          borderBottom: `1px solid ${theme.accent}20`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ color: theme.accent, fontWeight: 600 }}>🤖 AI:</span>
            <span style={{ color: agentic.isListening ? '#4CAF50' : '#888' }}>
              {agentic.isListening ? '🎤 Listening' : agentic.isSpeaking ? '🔊 Speaking' : '⏸️ Ready'}
            </span>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
              {currentStepIndex > 0 && (
                <button
                  onClick={goBack}
                  style={{
                    padding: '6px 12px',
                    background: 'rgba(255,255,255,0.1)',
                    border: 'none',
                    color: '#fff',
                    borderRadius: 15,
                    cursor: 'pointer',
                    fontSize: '0.85em'
                  }}
                >
                  ← Back
                </button>
              )}
              <button
                onClick={onClose}
                style={{
                  padding: '6px 12px',
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  color: '#888',
                  borderRadius: 15,
                  cursor: 'pointer',
                  fontSize: '0.85em'
                }}
              >
                ✕ Close
              </button>
            </div>
          </div>
          <p style={{ margin: '8px 0 0', color: '#ccc', fontSize: '0.9em' }}>
            {agentic.transcript || 'Ready to assist...'}
          </p>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
          {CurrentStepComponent && (
            <CurrentStepComponent
              data={flowData}
              updateData={updateData}
              onNext={goNext}
              onBack={goBack}
              speak={agentic.speak}
              isActive={true}
            />
          )}
        </div>

        {/* AgenticBar */}
        <div style={{ padding: '0 24px 24px' }}>
          <UnifiedAgenticBar
            context={`${flowType}_${currentStep?.id || 'flow'}`}
            position="inline"
            variant="full"
            theme="teal"
            hints={currentStep?.voiceHints || 'Speak naturally or say "next" to continue'}
            showInput={true}
          />
        </div>
      </div>
    </div>
  );
};

export default BaseFlow;
