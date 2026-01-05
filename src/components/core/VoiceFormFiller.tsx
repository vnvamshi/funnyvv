/**
 * VoiceFormFiller - Universal form filling from voice
 * 
 * Logic-only component that fills forms based on voice input
 */

import React, { useCallback } from 'react';
import { useAgentic } from './useAgentic';

interface FieldConfig {
  selector: string;
  voiceKeys?: string[];  // Multiple voice keys can map to same field
  setter?: (value: string) => void;
  transform?: (value: string) => string;  // Transform before setting
}

interface VoiceFormFillerProps {
  fields: Record<string, FieldConfig>;
  context?: string;
  autoStart?: boolean;
  onFill?: (field: string, value: string) => void;
  onComplete?: (filledFields: string[]) => void;
}

export const VoiceFormFiller: React.FC<VoiceFormFillerProps> = ({
  fields,
  context = 'form',
  autoStart = false,
  onFill,
  onComplete
}) => {
  const filledFieldsRef = React.useRef<string[]>([]);

  const handleFormData = useCallback(async (formData: Record<string, string>) => {
    const agentic = useAgentic({ context });
    
    for (const [key, value] of Object.entries(formData)) {
      if (!value) continue;
      
      // Find matching field config
      let fieldName: string | null = null;
      let fieldConfig: FieldConfig | null = null;
      
      for (const [name, config] of Object.entries(fields)) {
        const keys = config.voiceKeys || [name];
        if (keys.some(k => k.toLowerCase() === key.toLowerCase())) {
          fieldName = name;
          fieldConfig = config;
          break;
        }
      }
      
      if (!fieldName || !fieldConfig) continue;
      
      const transformedValue = fieldConfig.transform ? fieldConfig.transform(value) : value;
      
      await agentic.fillField(fieldConfig.selector, transformedValue, true);
      fieldConfig.setter?.(transformedValue);
      onFill?.(fieldName, transformedValue);
      
      if (!filledFieldsRef.current.includes(fieldName)) {
        filledFieldsRef.current.push(fieldName);
      }
    }
    
    // Check if all fields filled
    if (filledFieldsRef.current.length === Object.keys(fields).length) {
      onComplete?.(filledFieldsRef.current);
    }
  }, [fields, onFill, onComplete, context]);

  useAgentic({
    context,
    autoStart,
    onFormData: handleFormData
  });

  return null; // Logic-only component
};

export default VoiceFormFiller;
