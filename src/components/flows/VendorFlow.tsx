/**
 * VendorFlow - Vendor onboarding flow using shared components
 */

import React from 'react';
import { BaseFlow, FlowStep } from './BaseFlow';
import { PhoneStep, OTPStep, ProfileStep, DashboardStep, UploadStep, PipelineStep } from './steps';

interface VendorFlowProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: Record<string, any>) => void;
  onBack?: () => void;
}

const VENDOR_STEPS: FlowStep[] = [
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
    voiceHints: 'Say the 6-digit code sent to your phone'
  },
  {
    id: 'profile',
    label: 'Profile',
    component: (props) => <ProfileStep {...props} entityType="vendor" descriptionLabel="What products do you sell?" />,
    voiceHints: 'Tell me your company name and what you sell'
  },
  {
    id: 'dashboard',
    label: 'Dashboard',
    component: (props) => <DashboardStep {...props} entityType="vendor" />,
    voiceHints: 'Say "upload" to add your catalog or "next" to continue'
  },
  {
    id: 'upload',
    label: 'Upload',
    component: (props) => (
      <UploadStep 
        {...props} 
        entityType="vendor" 
        acceptTypes={['pdf', 'csv', 'xlsx', 'jpg', 'png']}
        titleOverride="Upload Product Catalog"
        descriptionOverride="Upload catalogs, price lists, or product images"
      />
    ),
    voiceHints: 'Say "upload" to select files or drag and drop'
  },
  {
    id: 'pipeline',
    label: 'Processing',
    component: (props) => <PipelineStep {...props} entityType="vendor" />,
    voiceHints: 'Processing your uploads...'
  }
];

export const VendorFlow: React.FC<VendorFlowProps> = ({
  isOpen,
  onClose,
  onComplete,
  onBack
}) => {
  return (
    <BaseFlow
      title="Vendor Setup"
      icon="📦"
      steps={VENDOR_STEPS}
      flowType="vendor"
      isOpen={isOpen}
      onClose={onClose}
      onComplete={onComplete}
      onBack={onBack}
      theme={{
        primary: '#004236',
        secondary: '#001a15',
        accent: '#B8860B'
      }}
    />
  );
};

export default VendorFlow;
