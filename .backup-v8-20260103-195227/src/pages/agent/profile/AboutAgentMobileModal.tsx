import React, { useState, useEffect } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import ClearIcon from '@mui/icons-material/Clear';
import api from '../../../utils/api';
import { showGlobalToast } from '../../../utils/toast';

const LANGUAGES = [
  'Afrikaans', 'Albanian', 'Amharic', 'Arabic', 'Armenian', 'Azerbaijani', 'Basque', 'Belarusian', 'Bengali', 'Bosnian',
  'Bulgarian', 'Burmese', 'Catalan', 'Cebuano', 'Chichewa', 'Chinese', 'Corsican', 'Croatian', 'Czech', 'Danish',
  'Dutch', 'English', 'Esperanto', 'Estonian', 'Filipino', 'Finnish', 'French', 'Frisian', 'Galician', 'Georgian',
  'German', 'Greek', 'Gujarati', 'Haitian Creole', 'Hausa', 'Hawaiian', 'Hebrew', 'Hindi', 'Hmong', 'Hungarian',
  'Icelandic', 'Igbo', 'Indonesian', 'Irish', 'Italian', 'Japanese', 'Javanese', 'Kannada', 'Kazakh', 'Khmer',
  'Kinyarwanda', 'Korean', 'Kurdish', 'Kyrgyz', 'Lao', 'Latin', 'Latvian', 'Lithuanian', 'Luxembourgish', 'Macedonian',
  'Malagasy', 'Malay', 'Malayalam', 'Maltese', 'Maori', 'Marathi', 'Mongolian', 'Nepali', 'Norwegian', 'Nyanja',
  'Odia', 'Pashto', 'Persian', 'Polish', 'Portuguese', 'Punjabi', 'Romanian', 'Russian', 'Samoan', 'Scots Gaelic',
  'Serbian', 'Sesotho', 'Shona', 'Sindhi', 'Sinhala', 'Slovak', 'Slovenian', 'Somali', 'Spanish', 'Sundanese',
  'Swahili', 'Swedish', 'Tajik', 'Tamil', 'Tatar', 'Telugu', 'Thai', 'Turkish', 'Turkmen', 'Ukrainian',
  'Urdu', 'Uyghur', 'Uzbek', 'Vietnamese', 'Welsh', 'Xhosa', 'Yiddish', 'Yoruba', 'Zulu'
];
const ALL_SPECIALTIES = ["Buyer's Agent", 'Listing Agent']; // Add more as needed
const YEARS = Array.from({ length: 50 }, (_, i) => `${2015 - i}`);

interface ServiceAreaOption {
  id: string;
  value: string;
}

interface UserType {
  languages?: string[];
  specialties?: string[];
  user_service_areas?: { id: string; name: string }[];
  business_since?: string | number;
}

interface AboutAgentMobileModalProps {
  open: boolean;
  onCancel: () => void;
  user?: UserType;
  onUpdated?: () => void;
}

const AboutAgentMobileModal: React.FC<AboutAgentMobileModalProps> = ({ open, onCancel, user, onUpdated }) => {
  const [languages, setLanguages] = useState<string[]>([]);
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [serviceAreas, setServiceAreas] = useState<ServiceAreaOption[]>([]);
  const [serviceAreaOptions, setServiceAreaOptions] = useState<ServiceAreaOption[]>([]);
  const [serviceAreaLoading, setServiceAreaLoading] = useState(false);
  const [serviceAreaInput, setServiceAreaInput] = useState('');
  const [serviceAreaFetched, setServiceAreaFetched] = useState(false);
  const [year, setYear] = useState<string>('');
  const [yearInput, setYearInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [languageInput, setLanguageInput] = useState('');

  useEffect(() => {
    if (user) {
      setLanguages(user.languages || []);
      setSpecialties(user.specialties || []);
      setServiceAreas(user.user_service_areas ? user.user_service_areas.map(area => ({ id: area.id, value: area.name })) : []);
      setYear(user.business_since ? String(user.business_since) : '');
    }
  }, [user, open]);

  // Fetch service areas on open
  useEffect(() => {
    if (open && !serviceAreaFetched) {
      setServiceAreaLoading(true);
      api.get('/agent/cities/')
        .then(res => {
          if (res.data.status_code === 200 && Array.isArray(res.data.data)) {
            const formattedCities = res.data.data.map((item: any) => {
              // Handle case where name might be an object
              let nameValue = item.name;
              if (typeof nameValue === 'object' && nameValue !== null) {
                nameValue = nameValue.name || nameValue.value || '';
              }
              return {
                id: item.id || item._id || item.cityId || (typeof item.name === 'object' ? item.name?.id : item.name),
                value: nameValue || item.cityName || item.value || '',
              };
            });
            setServiceAreaOptions(formattedCities);
          }
        })
        .catch(error => {
          console.error('Error fetching cities:', error);
        })
        .finally(() => {
          setServiceAreaLoading(false);
          setServiceAreaFetched(true);
        });
    }
  }, [open, serviceAreaFetched]);

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put('/common/profile/update/', {
        language_known: languages,
        specialities: specialties,
        service_area: serviceAreas.map(area => area.id),
        in_business_since: year,
      });
      setLoading(false);
      showGlobalToast('Profile updated successfully!');
      if (onUpdated) onUpdated();
      onCancel();
    } catch (error) {
      setLoading(false);
      // handle error
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white w-full h-full">
      <div className="flex items-center justify-between px-4 py-4 border-b">
        <span className="text-lg font-bold">About Agent</span>
        <button onClick={onCancel} className="text-2xl">&times;</button>
      </div>
      <form className="flex-1 flex flex-col overflow-y-auto px-4 pb-24" onSubmit={handleUpdate}>
        {/* Languages */}
        <div className="mt-4">
          <label className="block font-semibold mb-2">Languages known</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {languages.length > 0 ? (
              languages.map(lang => (
                <span key={lang} className="bg-[#85C6BA] text-[#004236] rounded px-3 py-1 text-sm font-medium flex items-center">
                  {lang}
                  <button type="button" className="ml-1" onClick={() => setLanguages(languages.filter(l => l !== lang))}>&times;</button>
                </span>
              ))
            ) : (
              <span className="text-gray-400">No languages listed</span>
            )}
          </div>
          <Autocomplete<string, false, false, false>
            options={LANGUAGES.filter(lang => !languages.includes(lang))}
            getOptionLabel={option => option}
            inputValue={languageInput}
            onInputChange={(_, value) => setLanguageInput(value)}
            onChange={(_, value) => {
              if (value && !languages.includes(value)) {
                setLanguages([...languages, value]);
                setLanguageInput('');
              }
            }}
            clearIcon={<ClearIcon sx={{ color: '#007E67' }} />}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select language"
                variant="outlined"
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#007E67',
                    },
                    '&:hover fieldset': {
                      borderColor: '#007E67',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#007E67',
                    },
                  },
                  '& label': {
                    color: '#007E67',
                  },
                  '& label.Mui-focused': {
                    color: '#007E67',
                  },
                }}
              />
            )}
            freeSolo={false}
            sx={{ width: '100%', mt: 1 }}
          />
        </div>
        {/* Specialties */}
        <div className="mt-6">
          <label className="block font-semibold mb-2">Specialties</label>
          <div className="flex flex-col gap-2">
            {ALL_SPECIALTIES.map(spec => (
              <label key={spec} className="flex items-center gap-2 text-base">
                <input type="checkbox" checked={specialties.includes(spec)} onChange={e => {
                  if (e.target.checked) setSpecialties([...specialties, spec]);
                  else setSpecialties(specialties.filter(s => s !== spec));
                }} className="accent-[#007E67]" />
                {spec}
              </label>
            ))}
          </div>
        </div>
        {/* Service Areas */}
        <div className="mt-6">
          <label className="block font-semibold mb-2">Service Areas</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {serviceAreas.length > 0 ? (
              serviceAreas.map(area => (
                <span key={area.id} className="bg-[#85C6BA] text-[#004236] rounded px-3 py-1 text-sm font-medium flex items-center">
                  {area.value}
                  <button type="button" className="ml-1" onClick={() => setServiceAreas(serviceAreas.filter(a => a.id !== area.id))}>&times;</button>
                </span>
              ))
            ) : (
              <span className="text-gray-400">No service areas listed</span>
            )}
          </div>
          <Autocomplete<ServiceAreaOption, false, false, false>
            options={serviceAreaOptions.filter(opt => !serviceAreas.some(a => a.id === opt.id))}
            getOptionLabel={option => option.value}
            inputValue={serviceAreaInput}
            onInputChange={(_, value) => setServiceAreaInput(value)}
            onChange={(_, value) => {
              if (value && !serviceAreas.some(a => a.id === value.id)) {
                setServiceAreas([...serviceAreas, value]);
                setServiceAreaInput('');
              }
            }}
            loading={serviceAreaLoading}
            clearIcon={<ClearIcon sx={{ color: '#007E67' }} />}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select service area"
                variant="outlined"
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#007E67',
                    },
                    '&:hover fieldset': {
                      borderColor: '#007E67',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#007E67',
                    },
                  },
                  '& label': {
                    color: '#007E67',
                  },
                  '& label.Mui-focused': {
                    color: '#007E67',
                  },
                }}
              />
            )}
            freeSolo={false}
            sx={{ width: '100%', mt: 1 }}
          />
        </div>
        {/* In business since */}
        <div className="mt-6">
          <label className="block font-semibold mb-2">In business since</label>
          <Autocomplete<string, false, false, false>
            options={YEARS}
            getOptionLabel={option => option}
            value={year}
            inputValue={yearInput}
            onInputChange={(_, value) => setYearInput(value)}
            onChange={(_, value) => {
              if (value) setYear(value);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select year"
                variant="outlined"
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#007E67',
                    },
                    '&:hover fieldset': {
                      borderColor: '#007E67',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#007E67',
                    },
                  },
                  '& label': {
                    color: '#007E67',
                  },
                  '& label.Mui-focused': {
                    color: '#007E67',
                  },
                }}
              />
            )}
            freeSolo={false}
            sx={{ width: '100%', mt: 1 }}
          />
        </div>
        {/* Sticky Buttons */}
        <div className="fixed bottom-0 left-0 w-full bg-white border-t flex gap-4 p-4 z-50">
          <button type="button" className="flex-1 border border-[#17695C] rounded-lg py-3 font-semibold text-[#17695C] bg-white hover:bg-[#F3F6F7] transition" onClick={onCancel} disabled={loading}>Cancel</button>
          <button type="submit" className="flex-1 rounded-lg py-3 font-semibold text-white bg-gradient-to-r from-[#17695C] to-[#007E67] hover:from-[#007E67] hover:to-[#17695C] transition shadow" disabled={loading}>{loading ? 'Updating...' : 'Update'}</button>
        </div>
      </form>
    </div>
  );
};

export default AboutAgentMobileModal; 