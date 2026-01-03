import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useContext, useState } from 'react';
import { ToastContext } from '../../../App';
import { showGlobalToast } from '../../../utils/toast';
import api from '../../../utils/api';

export interface AgentProfileFormValues {
  name: string;
  mlsAgentId?: string;
  address: string;
  profile_photo_url?: string;
}

const schema = yup.object().shape({
  name: yup.string().required('Name is required'),
  mlsAgentId: yup.string().optional(),
  address: yup.string().required('Address is required').min(10, 'Address is too short'),
});

export function useAgentProfileForm(defaultValues?: Partial<AgentProfileFormValues>) {
  const [loading, setLoading] = useState(false);
  const form = useForm<AgentProfileFormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: defaultValues?.name || '',
      mlsAgentId: defaultValues?.mlsAgentId || '',
      address: defaultValues?.address || '',
      profile_photo_url: defaultValues?.profile_photo_url || '',
    },
  });

  const { showToast } = useContext(ToastContext);

  const showToastMessage = (message: string, duration?: number) => {
    if (showToast && typeof showToast === 'function') {
      showToast(message, duration);
    } else {
      showGlobalToast(message, duration);
    }
  };

  const onSubmit = async (data: AgentProfileFormValues, onSuccess?: () => void) => {
    setLoading(true);
    try {
      const response = await api.put('/common/profile/update/', 
        {
          username: data.name,
          mls_agent_id: data.mlsAgentId || '',
          address: data.address,
          ...(data.profile_photo_url && { profile_photo_url: data.profile_photo_url }),
        }
      );
      if(response.data.status_code === 200){
        showToastMessage(response.data.message);
        setLoading(false);
        onSuccess?.();
      }
    } catch (error: any) {
      showToastMessage(error.response.data.message);
      setLoading(false);
    }
   
  };

  return {
    ...form,
    loading,
    onSubmit,
  };
} 