/**
 * UploadStep - Shared file upload step (all formats)
 */

import React, { useEffect } from 'react';
import { StepProps } from '../BaseFlow';
import { UniversalUploader } from '../../core/UniversalUploader';

const THEME = { accent: '#B8860B' };

interface UploadStepProps extends StepProps {
  entityType?: 'vendor' | 'builder' | 'agent';
  acceptTypes?: string[];
  titleOverride?: string;
  descriptionOverride?: string;
}

export const UploadStep: React.FC<UploadStepProps> = ({
  data,
  updateData,
  onNext,
  speak,
  isActive,
  entityType = 'vendor',
  acceptTypes = ['pdf', 'csv', 'xlsx', 'jpg', 'png', 'docx'],
  titleOverride,
  descriptionOverride
}) => {
  useEffect(() => {
    if (isActive) {
      speak(`Upload your ${entityType === 'builder' ? 'project portfolio' : entityType === 'agent' ? 'property listings' : 'product catalog'}.`);
    }
  }, [isActive, entityType]);

  const handleUpload = (results: any[]) => {
    const successfulUploads = results.filter(r => r.success);
    updateData({ 
      files: successfulUploads.map(r => r.file),
      products: successfulUploads.flatMap(r => r.data?.products || [])
    });
    
    if (successfulUploads.length > 0) {
      speak(`${successfulUploads.length} files uploaded successfully.`);
    }
  };

  const titles: Record<string, string> = {
    vendor: 'Upload Your Catalog',
    builder: 'Upload Portfolio',
    agent: 'Upload Listings'
  };

  const descriptions: Record<string, string> = {
    vendor: 'Upload product catalogs, price lists, or inventory sheets',
    builder: 'Upload project photos, floor plans, or portfolio documents',
    agent: 'Upload property photos, listings, or brochures'
  };

  const hasUploads = (data.files?.length || 0) > 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ textAlign: 'center' }}>
        <span style={{ fontSize: '2.5em' }}>📄</span>
        <h3 style={{ color: THEME.accent, margin: '10px 0 5px' }}>
          {titleOverride || titles[entityType]}
        </h3>
        <p style={{ color: '#888', fontSize: '0.9em', margin: 0 }}>
          {descriptionOverride || descriptions[entityType]}
        </p>
      </div>

      <UniversalUploader
        accept={acceptTypes}
        multiple={true}
        onUpload={handleUpload}
        speak={speak}
        enableVoice={true}
        voiceContext={`${entityType}_upload`}
        theme="teal"
        showPreview={true}
      />

      {hasUploads && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 10 }}>
          <button
            onClick={onNext}
            style={{
              padding: '14px 40px',
              background: THEME.accent,
              border: 'none',
              borderRadius: 30,
              color: '#000',
              fontSize: '1em',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Continue →
          </button>
        </div>
      )}

      <p style={{ color: '#64748b', fontSize: '0.8em', textAlign: 'center', marginTop: 10 }}>
        💡 You can upload multiple files of different types
      </p>
    </div>
  );
};

export default UploadStep;
