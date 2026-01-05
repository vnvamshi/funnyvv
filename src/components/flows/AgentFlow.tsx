/**
 * AgentFlow - Real Estate Agent onboarding flow
 * 
 * Customized for real estate agents:
 * - Property listings instead of catalogs
 * - MLS integration terminology
 * - Real estate specific fields
 */

import React from 'react';
import { BaseFlow, FlowStep } from './BaseFlow';
import { PhoneStep, OTPStep, ProfileStep, DashboardStep, UploadStep, PipelineStep } from './steps';

interface AgentFlowProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: Record<string, any>) => void;
  onBack?: () => void;
}

// Custom License Step for Agents
const LicenseStep: React.FC<any> = ({ data, updateData, onNext, speak, isActive }) => {
  const [license, setLicense] = React.useState(data.licenseNumber || '');
  const [state, setState] = React.useState(data.licenseState || '');
  
  React.useEffect(() => {
    if (isActive) {
      speak("Please enter your real estate license information.");
    }
  }, [isActive]);

  const handleSubmit = () => {
    if (license.trim() && state.trim()) {
      updateData({ licenseNumber: license, licenseState: state });
      speak("License verified.");
      onNext();
    } else {
      speak("Please enter both license number and state.");
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
      <span style={{ fontSize: '3em' }}>🏆</span>
      <h3 style={{ color: '#10b981', margin: 0 }}>License Verification</h3>
      <p style={{ color: '#888', fontSize: '0.9em', margin: 0 }}>Enter your real estate license details</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 15, width: '100%', maxWidth: 400 }}>
        <div>
          <label style={{ color: '#ccc', fontSize: '0.85em', display: 'block', marginBottom: 6 }}>License Number</label>
          <input
            type="text"
            value={license}
            onChange={e => setLicense(e.target.value)}
            placeholder="Enter license number"
            style={{
              width: '100%',
              padding: '14px 16px',
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              borderRadius: 10,
              color: '#fff',
              fontSize: '1em'
            }}
          />
        </div>
        <div>
          <label style={{ color: '#ccc', fontSize: '0.85em', display: 'block', marginBottom: 6 }}>State</label>
          <select
            value={state}
            onChange={e => setState(e.target.value)}
            style={{
              width: '100%',
              padding: '14px 16px',
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              borderRadius: 10,
              color: '#fff',
              fontSize: '1em'
            }}
          >
            <option value="">Select State</option>
            <option value="CA">California</option>
            <option value="TX">Texas</option>
            <option value="FL">Florida</option>
            <option value="NY">New York</option>
            <option value="IL">Illinois</option>
            <option value="PA">Pennsylvania</option>
            <option value="OH">Ohio</option>
            <option value="GA">Georgia</option>
            <option value="NC">North Carolina</option>
            <option value="MI">Michigan</option>
            {/* Add more states as needed */}
          </select>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!license.trim() || !state.trim()}
        style={{
          padding: '14px 40px',
          background: license.trim() && state.trim() ? '#10b981' : 'rgba(255,255,255,0.1)',
          border: 'none',
          borderRadius: 30,
          color: license.trim() && state.trim() ? '#000' : '#666',
          fontSize: '1em',
          fontWeight: 600,
          cursor: license.trim() && state.trim() ? 'pointer' : 'not-allowed',
          marginTop: 10
        }}
      >
        Verify License →
      </button>
    </div>
  );
};

const AGENT_STEPS: FlowStep[] = [
  {
    id: 'phone',
    label: 'Phone',
    component: PhoneStep,
    voiceHints: 'Say your phone number'
  },
  {
    id: 'otp',
    label: 'Verify',
    component: OTPStep,
    voiceHints: 'Say the 6-digit verification code'
  },
  {
    id: 'license',
    label: 'License',
    component: LicenseStep,
    voiceHints: 'Enter your real estate license number and state'
  },
  {
    id: 'profile',
    label: 'Profile',
    component: (props) => (
      <ProfileStep 
        {...props} 
        entityType="agent"
        titleOverride="Agent Profile"
        descriptionLabel="Describe your real estate services and specialties"
      />
    ),
    voiceHints: 'Tell me your agency name and services'
  },
  {
    id: 'dashboard',
    label: 'Dashboard',
    component: (props) => <DashboardStep {...props} entityType="agent" />,
    voiceHints: 'Say "upload" to add listings or "next" to continue'
  },
  {
    id: 'upload',
    label: 'Listings',
    component: (props) => (
      <UploadStep 
        {...props} 
        entityType="agent"
        acceptTypes={['pdf', 'jpg', 'jpeg', 'png', 'csv', 'xlsx']}
        titleOverride="Upload Property Listings"
        descriptionOverride="Upload property photos, virtual tours, MLS exports, or listing sheets"
      />
    ),
    voiceHints: 'Say "upload" to select listing files'
  },
  {
    id: 'pipeline',
    label: 'Processing',
    component: (props) => <PipelineStep {...props} entityType="agent" />,
    voiceHints: 'Processing your listings...'
  }
];

export const AgentFlow: React.FC<AgentFlowProps> = ({
  isOpen,
  onClose,
  onComplete,
  onBack
}) => {
  return (
    <BaseFlow
      title="Agent Setup"
      icon="🏠"
      steps={AGENT_STEPS}
      flowType="agent"
      isOpen={isOpen}
      onClose={onClose}
      onComplete={onComplete}
      onBack={onBack}
      theme={{
        primary: '#1a1a2e',
        secondary: '#16213e',
        accent: '#10b981'
      }}
    />
  );
};

export default AgentFlow;
