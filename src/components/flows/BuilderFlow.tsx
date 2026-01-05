/**
 * BuilderFlow - Builder/Construction onboarding flow
 * 
 * Same structure as VendorFlow but customized for builders:
 * - Portfolio instead of catalog
 * - Project photos instead of product images
 * - Construction-specific terminology
 */

import React from 'react';
import { BaseFlow, FlowStep } from './BaseFlow';
import { PhoneStep, OTPStep, ProfileStep, DashboardStep, UploadStep, PipelineStep } from './steps';

interface BuilderFlowProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: Record<string, any>) => void;
  onBack?: () => void;
}

const BUILDER_STEPS: FlowStep[] = [
  {
    id: 'phone',
    label: 'Phone',
    component: PhoneStep,
    voiceHints: 'Say your phone number like "seven zero three..."'
  },
  {
    id: 'otp',
    label: 'Verify',
    component: OTPStep,
    voiceHints: 'Say the 6-digit verification code'
  },
  {
    id: 'profile',
    label: 'Profile',
    component: (props) => (
      <ProfileStep 
        {...props} 
        entityType="builder" 
        titleOverride="Builder Profile"
        descriptionLabel="What construction services do you offer?"
      />
    ),
    voiceHints: 'Tell me your company name and services you provide'
  },
  {
    id: 'dashboard',
    label: 'Dashboard',
    component: (props) => <DashboardStep {...props} entityType="builder" />,
    voiceHints: 'Say "upload" to add your portfolio or "next" to continue'
  },
  {
    id: 'upload',
    label: 'Portfolio',
    component: (props) => (
      <UploadStep 
        {...props} 
        entityType="builder"
        acceptTypes={['pdf', 'jpg', 'jpeg', 'png', 'docx', 'xlsx']}
        titleOverride="Upload Your Portfolio"
        descriptionOverride="Upload project photos, floor plans, certifications, or portfolio documents"
      />
    ),
    voiceHints: 'Say "upload" to select project files or drag and drop'
  },
  {
    id: 'pipeline',
    label: 'Processing',
    component: (props) => <PipelineStep {...props} entityType="builder" />,
    voiceHints: 'Processing your portfolio...'
  }
];

export const BuilderFlow: React.FC<BuilderFlowProps> = ({
  isOpen,
  onClose,
  onComplete,
  onBack
}) => {
  return (
    <BaseFlow
      title="Builder Setup"
      icon="🏗️"
      steps={BUILDER_STEPS}
      flowType="builder"
      isOpen={isOpen}
      onClose={onClose}
      onComplete={onComplete}
      onBack={onBack}
      theme={{
        primary: '#1e3a5f',
        secondary: '#0f1c2e',
        accent: '#f59e0b'
      }}
    />
  );
};

export default BuilderFlow;
