import React, { useState, useEffect } from 'react';
import { PlusIcon, MinusIcon } from '../../../assets/icons/CommonIcons';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import ClearIcon from '@mui/icons-material/Clear';
import api from '../../../utils/api';
import { ToastContext } from '../../../App';

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
const SPECIALTIES = ["Buyer's Agent", 'Listing Agent'];
const SERVICE_AREAS = ['Punta Cana', 'Santo Domingo', 'Santiago', 'Puerto Plata'];
const YEARS = Array.from({ length: 50 }, (_, i) => `${2015 - i}`);

interface AboutAgentModalProps {
  open: boolean;
  onCancel: () => void;
  user?: any;
}

const AboutAgentModal: React.FC<AboutAgentModalProps> = ({
  open,
  onCancel,
  user,
}) => {
  const [languages, setLanguages] = useState<string[]>([]);
  const ALL_SPECIALTIES = ["Buyer's Agent", 'Listing Agent']; // Add more as needed
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [serviceAreaOptions, setServiceAreaOptions] = useState<{ id: string; value: string }[]>([]);
  const [serviceAreaLoading, setServiceAreaLoading] = useState(false);
  const [serviceAreaInput, setServiceAreaInput] = useState('');
  const [serviceAreas, setServiceAreas] = useState<{ id: string; value: string }[]>([]);
  const [serviceAreaFetched, setServiceAreaFetched] = useState(false);
  const [year, setYear] = useState('');
  const [loading, setLoading] = useState(false);
  const [autocompleteInput, setAutocompleteInput] = useState('');

  const { showToast } = React.useContext(ToastContext);

  // Accordion state
  const [openAccordion, setOpenAccordion] = useState<{ [key: string]: boolean }>({});

  const toggleAccordion = (key: string) => {
    setOpenAccordion((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAddLanguage = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const lang = e.target.value;
    if (lang && !languages.includes(lang)) {
      setLanguages([...languages, lang]);
    }
  };

  const handleRemoveLanguage = (lang: string) => {
    setLanguages(languages.filter(l => l !== lang));
  };

  // Fetch service areas when accordion is opened for the first time
  useEffect(() => {
    if (openAccordion['serviceAreas'] && !serviceAreaFetched) {
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
  }, [openAccordion['serviceAreas'], serviceAreaFetched]);

  // Prefill fields from user prop
  useEffect(() => {
    if (user) {
      setLanguages(user.languages || []);
      setSpecialties(user.specialties || []);
      setServiceAreas(
        user.user_service_areas
          ? user.user_service_areas.map((area: any) => ({ id: area.id, value: area.name }))
          : []
      );
      setYear(user.business_since ? String(user.business_since) : '');
    }
  }, [user, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-lg shadow-lg px-20 py-8 max-w-md w-full relative max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">About Agent</h2>
        <form
          onSubmit={async e => {
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
              showToast && showToast('Profile updated successfully!');
              onCancel();
            } catch (error: any) {
              setLoading(false);
              showToast && showToast(error?.response?.data?.message || 'Failed to update profile');
            }
          }}
        >
          {/* Languages known Accordion */}
          <div className="mb-2">
            <div className="flex items-center justify-between mb-2 cursor-pointer" onClick={() => toggleAccordion('languages')}>
              <label className="block font-semibold text-lg">Languages known</label>
              <span className="text-xl font-bold text-[#007E67]">{openAccordion['languages'] ? <MinusIcon /> : <PlusIcon />}</span>
            </div>
            {openAccordion['languages'] && (
              <>
                <div className="flex flex-wrap gap-2 mb-2">
                  {languages.length > 0 ? (
                    languages.map(lang => (
                      <span key={lang} style={{ background: '#85C6BA', color: '#004236', display: 'flex', alignItems: 'center', borderRadius: '6px', padding: '2px 8px', fontWeight: 500, fontSize: '14px' }}>
                        {lang}
                        <button
                          type="button"
                          onClick={() => handleRemoveLanguage(lang)}
                          style={{ marginLeft: 6, background: 'transparent', border: 'none', color: '#004236', fontSize: '16px', cursor: 'pointer', lineHeight: 1 }}
                          aria-label={`Remove ${lang}`}
                        >
                          ×
                        </button>
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400">No languages listed</span>
                  )}
                </div>
                <Autocomplete
                  options={LANGUAGES.filter(lang => !languages.includes(lang))}
                  getOptionLabel={option => option}
                  inputValue={autocompleteInput}
                  onInputChange={(_, value) => setAutocompleteInput(value)}
                  onChange={(_, value) => {
                    if (value && !languages.includes(value)) {
                      setLanguages([...languages, value]);
                      setAutocompleteInput(''); // Clear input after selection
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
              </>
            )}
          </div>
          <hr className="border-gray-200 my-4" />
          {/* Specialties Accordion */}
          <div className="mb-2">
            <div className="flex items-center justify-between mb-2 cursor-pointer" onClick={() => toggleAccordion('specialties')}>
              <label className="block font-semibold text-lg">Specialties</label>
              <span className="text-xl font-bold text-[#007E67]">{openAccordion['specialties'] ? <MinusIcon /> : <PlusIcon />}</span>
            </div>
            {openAccordion['specialties'] && (
              <div className="flex flex-col gap-2 mb-2">
                {ALL_SPECIALTIES.map(spec => (
                  <label key={spec} className="flex items-center gap-2 text-base">
                    <input
                      type="checkbox"
                      checked={specialties.includes(spec)}
                      onChange={e => {
                        if (e.target.checked) {
                          setSpecialties([...specialties, spec]);
                        } else {
                          setSpecialties(specialties.filter(s => s !== spec));
                        }
                      }}
                      className="accent-[#007E67]"
                    />
                    {spec}
                  </label>
                ))}
                {ALL_SPECIALTIES.length === 0 && <span className="text-gray-400">No specialties available</span>}
              </div>
            )}
          </div>
          <hr className="border-gray-200 my-4" />
          {/* Service Areas Accordion */}
          <div className="mb-2">
            <div className="flex items-center justify-between mb-2 cursor-pointer" onClick={() => toggleAccordion('serviceAreas')}>
              <label className="block font-semibold text-lg">Service Areas</label>
              <span className="text-xl font-bold text-[#007E67]">{openAccordion['serviceAreas'] ? <MinusIcon /> : <PlusIcon />}</span>
            </div>
            {openAccordion['serviceAreas'] && (
              <>
                <div className="flex flex-wrap gap-2 mb-2">
                  {serviceAreas.length > 0 ? (
                    serviceAreas.map(area => (
                      <span key={area.id} style={{ background: '#85C6BA', color: '#004236', display: 'flex', alignItems: 'center', borderRadius: '6px', padding: '2px 8px', fontWeight: 500, fontSize: '14px' }}>
                        {area.value}
                        <button
                          type="button"
                          className="ml-1"
                          onClick={() => setServiceAreas(serviceAreas.filter(a => a.id !== area.id))}
                        >
                          ×
                        </button>
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400">No service areas listed</span>
                  )}
                </div>
                <Autocomplete
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
              </>
            )}
          </div>
          <hr className="border-gray-200 my-4" />
          {/* In business since Accordion */}
          <div className="mb-2">
            <div className="flex items-center justify-between mb-2 cursor-pointer" onClick={() => toggleAccordion('businessSince')}>
              <label className="block font-semibold text-lg">In business since</label>
              <span className="text-xl font-bold text-[#007E67]">{openAccordion['businessSince'] ? <MinusIcon /> : <PlusIcon />}</span>
            </div>
            {openAccordion['businessSince'] && (
              <Autocomplete
                options={YEARS}
                getOptionLabel={option => option}
                value={year}
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
                sx={{ width: '100%' }}
              />
            )}
          </div>
          <div className="flex gap-6 justify-center mt-8">
            <button
              type="button"
              className="settings-cancel-btn border border-[#17695C] rounded-lg px-8 py-2 font-semibold text-[#17695C] bg-white hover:bg-[#F3F6F7] transition"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="settings-gradient-btn rounded-lg px-8 py-2 font-semibold text-white bg-gradient-to-r from-[#17695C] to-[#007E67] hover:from-[#007E67] hover:to-[#17695C] transition shadow"
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AboutAgentModal; 