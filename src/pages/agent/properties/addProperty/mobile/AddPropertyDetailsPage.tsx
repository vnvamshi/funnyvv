import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import useIsMobile from '../../../../../hooks/useIsMobile';
import { useBottomSelectModal } from '../hooks/useBottomSelectModal';
import BottomSelectField from '../components/BottomSelectField';
import api from '../../../../../utils/api';
import { useMobilePropertyWizard } from './MobilePropertyWizardContext';

const schema = yup.object().shape({
  propertyType: yup.mixed().nullable().required('Property type is required'),
  streetAddress: yup.string().required('Street address is required'),
  unitNumber: yup.string()
    .min(1, 'Unit number must be at least 1 characters')
    .max(10, 'Unit number must be at most 10 characters')
    .required('Unit number is required'),
  city: yup.mixed().nullable().required('City is required'),
  state: yup.mixed().nullable().required('State is required'),
  postalCode: yup.string()
    .matches(/^[0-9]{5}(?:-[0-9]{4})?$/, 'Invalid postal code')
    .min(5, 'Postal code must be at least 5 characters')
    .max(10, 'Postal code must be at most 10 characters')
    .required('Postal code is required'),
  country: yup.mixed().nullable().required('Country is required')
});

type LocationItem = {
  id: string | number;
  name: string;
  [key: string]: any; // For any additional properties
};

type AddPropertyFormValues = {
  propertyType: LocationItem | null;
  streetAddress: string;
  unitNumber: string;
  city: LocationItem | null;
  state: LocationItem | null;
  postalCode: string;
  country: LocationItem | null;
};

type ModalType = 'propertyType' | 'city' | 'state' | 'country';

const AddPropertyDetailsPageInner: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { saleCategoryData, handlePropertyDetailsSubmit } = useMobilePropertyWizard();

  // Form state with React Hook Form
  const { control, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      propertyType: null,
      streetAddress: '',
      unitNumber: '',
      city: null,
      state: null,
      postalCode: '',
      country: null,
    },
  });

  // API data state
  const [cities, setCities] = useState<Array<{ id: string | number; name: string }>>([]);
  const [states, setStates] = useState<Array<{id: string | number; name: string}>>([]);
  const [countries, setCountries] = useState<Array<{id: string | number; name: string}>>([]);
  const [propertyTypes, setPropertyTypes] = useState<Array<{id: string | number; name: string}>>([]);
  const [loading, setLoading] = useState(false);

  // Modal state (reusable hook)
  const { modalType, openModal, closeModal } = useBottomSelectModal<ModalType>();

  // Watch form values for display
  const watchedValues = watch();

  useEffect(() => {
    getPropertyType();
    getCity();
    getState();
    getCountry();
    console.log(saleCategoryData);
  }, []);

  // Update form values when saleCategoryData changes
  useEffect(() => {
    console.log('saleCategoryData changed:', saleCategoryData);
    if (saleCategoryData && Object.keys(saleCategoryData).length > 0) {
      setValue('propertyType', saleCategoryData.propertyType || null);
      setValue('streetAddress', saleCategoryData.streetAddress || '');
      setValue('unitNumber', saleCategoryData.unitNumber || '');
      setValue('city', saleCategoryData.city || null);
      setValue('state', saleCategoryData.state || null);
      setValue('postalCode', saleCategoryData.postalCode || '');
      setValue('country', saleCategoryData.country || null);
    }
  }, [saleCategoryData, setValue]);

  const getPropertyType = async () => {
    try {
      const response = await api.post('/common/master/list/', {
        "tables": ['propertytype']
      });
      console.log("response", response.data);
      if (response.data?.propertytype) {
        const formattedPropertyTypes = response.data.propertytype.map((item: any) => ({
          id: item.id,
          name: item.value 
        }));
        setPropertyTypes(formattedPropertyTypes);
      }
    } catch (error) {
      console.error('Error fetching master data:', error);
    }
  };

    const getCity = async () => {
    try {
      const response = await api.get('/agent/cities/');
      if (response.data.status_code === 200) {
        const formattedCities = response.data.data.map((item: any) => ({
          id: item.id || item._id || item.cityId || item.name,
          name: item.name || item.cityName || item.value || item,
        }));
        setCities(formattedCities);
      }
    } catch (error) {
      console.error('Error fetching cities:', error);
    }
  };

  const getState = async () => {
    try {
      const response = await api.get('/agent/states/');
      if (response.data.status_code === 200) {
        const formattedStates = response.data.data.map((item: any) => ({
          id: item.id || item._id || item.stateId || item.name,
          name: item.name || item.stateName || item.value || item
        }));
        setStates(formattedStates);
      }
    } catch (error) {
      console.error('Error fetching states:', error);
    }
  };

  const getCountry = async () => {
    try {
      const response = await api.get('/agent/countries/');
      if (response.data.status_code === 200) {
        const formattedCountries = response.data.data.map((item: any) => ({
          id: item.id || item._id || item.countryId || item.name,
          name: item.name || item.countryName || item.value || item
        }));
        setCountries(formattedCountries);
      }
    } catch (error) {
      console.error('Error fetching countries:', error);
    }
  };

  const handleContinue = async (data: any) => {
    setLoading(true);
    try {
      // Use context handler to submit property details
      handlePropertyDetailsSubmit(data);
    } catch (error) {
      console.error('Error saving property details:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Mobile Header */}
      <div className="flex items-center px-4 pt-6 pb-2 bg-white shadow-none">
        <button
          className="mr-2 p-2 -ml-2"
          onClick={() => navigate(-1)}
          aria-label="Back"
        >
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path d="M15 18l-6-6 6-6" stroke="#004D40" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <span className="text-green-900 text-2xl font-bold">Add property</span>
      </div>
      {/* Main Content */}
      <div className="flex flex-col px-6 pt-6 pb-8">
        <div className="text-3xl font-bold text-[#222] mb-2">Add your property for sale</div>
        <div className="text-base text-[#222] mb-6">Sell your properties at ease with Vistaview</div>
        <div className="border-b border-[#E5E7EB] mb-8" />
        <div className="mb-4 text-base">
          <span>Sale category : </span>
          <span className="font-bold">{saleCategoryData?.saleCategory || 'Property'}</span>
        </div>
        <form onSubmit={handleSubmit(handleContinue)} className="space-y-4">
          {/* Property Type */}
          <div className="mb-4">
            <Controller
              name="propertyType"
              control={control}
              render={({ field: { onChange, value } }) => (
                <BottomSelectField
                  label="Property Type"
                  value={value?.name || ''}
                  options={propertyTypes.map(pt => pt.name)}
                  placeholder="Select property type"
                  onChange={(selectedName) => {
                    const selectedType = propertyTypes.find(pt => pt.name === selectedName);
                    onChange(selectedType || null);
                  }}
                  isMobile={isMobile}
                  showModal={modalType === 'propertyType'}
                  onOpenModal={() => openModal('propertyType')}
                  onCloseModal={closeModal}
                />
              )}
            />
            {errors.propertyType && (
              <p className="text-red-500 text-sm mt-1">{errors.propertyType.message as string}</p>
            )}
          </div>

          {/* Street Address */}
          <div className="mb-4">
            <div className="font-semibold mb-2">Let's add your property address and location</div>
            <label className="block mb-2 font-semibold">Street address</label>
            <Controller
              name="streetAddress"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  className={`w-full p-4 border rounded-lg text-lg bg-white mb-1 ${
                    errors.streetAddress ? 'border-red-500' : ''
                  }`}
                  placeholder="Enter street number and address.."
                />
              )}
            />
            <div className="text-xs text-gray-500 mb-2">Enter the valid address with street number</div>
            {errors.streetAddress && (
              <p className="text-red-500 text-sm mt-1">{errors.streetAddress.message as string}</p>
            )}
          </div>

          {/* Unit Number */}
          <div className="mb-4">
            <label className="block mb-2 font-semibold">Unit number</label>
            <Controller
              name="unitNumber"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  className={`w-full p-4 border rounded-lg text-lg bg-white ${
                    errors.unitNumber ? 'border-red-500' : ''
                  }`}
                  placeholder="Enter unit"
                />
              )}
            />
            {errors.unitNumber && (
              <p className="text-red-500 text-sm mt-1">{errors.unitNumber.message as string}</p>
            )}
          </div>

          {/* City */}
          <div className="mb-4">
            <Controller
              name="city"
              control={control}
              render={({ field: { onChange, value } }) => (
                <BottomSelectField
                  label="City"
                  value={value?.name || ''}
                  options={cities.map(city => city.name)}
                  placeholder="Select City"
                  onChange={(selectedName) => {
                    const selectedCity = cities.find(city => city.name === selectedName);
                    onChange(selectedCity || null);
                  }}
                  isMobile={isMobile}
                  showModal={modalType === 'city'}
                  onOpenModal={() => openModal('city')}
                  onCloseModal={closeModal}
                  showSearch={true}
                />
              )}
            />
            {errors.city && (
              <p className="text-red-500 text-sm mt-1">{errors.city.message as string}</p>
            )}
          </div>

          {/* State */}
          <div className="mb-4">
            <Controller
              name="state"
              control={control}
              render={({ field: { onChange, value } }) => (
                <BottomSelectField
                  label="State"
                  value={value?.name || ''}
                  options={states.map(state => state.name)}
                  placeholder="State code"
                  onChange={(selectedName) => {
                    const selectedState = states.find(state => state.name === selectedName);
                    onChange(selectedState || null);
                  }}
                  isMobile={isMobile}
                  showModal={modalType === 'state'}
                  onOpenModal={() => openModal('state')}
                  onCloseModal={closeModal}
                  showSearch={true}
                />
              )}
            />
            {errors.state && (
              <p className="text-red-500 text-sm mt-1">{errors.state.message as string}</p>
            )}
          </div>

          {/* Postal Code */}
          <div className="mb-4">
            <label className="block mb-2 font-semibold">Postal code</label>
            <Controller
              name="postalCode"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  className={`w-full p-4 border rounded-lg text-lg bg-white ${
                    errors.postalCode ? 'border-red-500' : ''
                  }`}
                  placeholder="Enter code"
                />
              )}
            />
            {errors.postalCode && (
              <p className="text-red-500 text-sm mt-1">{errors.postalCode.message as string}</p>
            )}
          </div>

          {/* Country */}
          <div className="mb-4">
            <Controller
              name="country"
              control={control}
              render={({ field: { onChange, value } }) => (
                <BottomSelectField
                  label="Country"
                  value={value?.name || ''}
                  options={countries.map(country => country.name)}
                  placeholder="Select Country"
                  onChange={(selectedName) => {
                    const selectedCountry = countries.find(country => country.name === selectedName);
                    onChange(selectedCountry || null);
                  }}
                  isMobile={isMobile}
                  showModal={modalType === 'country'}
                  onOpenModal={() => openModal('country')}
                  onCloseModal={closeModal}
                  showSearch={true}
                />
              )}
            />
            {errors.country && (
              <p className="text-red-500 text-sm mt-1">{errors.country.message as string}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="settings-gradient-btn w-full max-w-xs py-3 rounded-full font-bold text-lg shadow-lg mt-6 mx-auto"
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  );
};

const AddPropertyDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { saleCategoryData, handlePropertyDetailsSubmit } = useMobilePropertyWizard();

  // Form state with React Hook Form
  const { control, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      propertyType: null,
      streetAddress: '',
      unitNumber: '',
      city: null,
      state: null,
      postalCode: '',
      country: null,
    },
  });

  // API data state
  const [cities, setCities] = useState<Array<{ id: string | number; name: string }>>([]);
  const [states, setStates] = useState<Array<{id: string | number; name: string}>>([]);
  const [countries, setCountries] = useState<Array<{id: string | number; name: string}>>([]);
  const [propertyTypes, setPropertyTypes] = useState<Array<{id: string | number; name: string}>>([]);
  const [loading, setLoading] = useState(false);

  // Modal state (reusable hook)
  const { modalType, openModal, closeModal } = useBottomSelectModal<ModalType>();

  // Watch form values for display
  const watchedValues = watch();

  useEffect(() => {
    getPropertyType();
    getCity();
    getState();
    getCountry();
    console.log(saleCategoryData);
  }, []);

  // Update form values when saleCategoryData changes
  useEffect(() => {
    console.log('saleCategoryData changed:', saleCategoryData);
    if (saleCategoryData && Object.keys(saleCategoryData).length > 0) {
      setValue('propertyType', saleCategoryData.propertyType || null);
      setValue('streetAddress', saleCategoryData.streetAddress || '');
      setValue('unitNumber', saleCategoryData.unitNumber || '');
      setValue('city', saleCategoryData.city || null);
      setValue('state', saleCategoryData.state || null);
      setValue('postalCode', saleCategoryData.postalCode || '');
      setValue('country', saleCategoryData.country || null);
    }
  }, [saleCategoryData, setValue]);

  const getPropertyType = async () => {
    try {
      const response = await api.post('/common/master/list/', {
        "tables": ['propertytype']
      });
      console.log("response", response.data);
      if (response.data?.propertytype) {
        const formattedPropertyTypes = response.data.propertytype.map((item: any) => ({
          id: item.id,
          name: item.value 
        }));
        setPropertyTypes(formattedPropertyTypes);
      }
    } catch (error) {
      console.error('Error fetching master data:', error);
    }
  };

    const getCity = async () => {
    try {
      const response = await api.get('/agent/cities/');
      if (response.data.status_code === 200) {
        const formattedCities = response.data.data.map((item: any) => ({
          id: item.id || item._id || item.cityId || item.name,
          name: item.name || item.cityName || item.value || item,
        }));
        setCities(formattedCities);
      }
    } catch (error) {
      console.error('Error fetching cities:', error);
    }
  };

  const getState = async () => {
    try {
      const response = await api.get('/agent/states/');
      if (response.data.status_code === 200) {
        const formattedStates = response.data.data.map((item: any) => ({
          id: item.id || item._id || item.stateId || item.name,
          name: item.name || item.stateName || item.value || item
        }));
        setStates(formattedStates);
      }
    } catch (error) {
      console.error('Error fetching states:', error);
    }
  };

  const getCountry = async () => {
    try {
      const response = await api.get('/agent/countries/');
      if (response.data.status_code === 200) {
        const formattedCountries = response.data.data.map((item: any) => ({
          id: item.id || item._id || item.countryId || item.name,
          name: item.name || item.countryName || item.value || item
        }));
        setCountries(formattedCountries);
      }
    } catch (error) {
      console.error('Error fetching countries:', error);
    }
  };

  const handleContinue = async (data: any) => {
    setLoading(true);
    try {
      // Use context handler to submit property details
      handlePropertyDetailsSubmit(data);
    } catch (error) {
      console.error('Error saving property details:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Mobile Header */}
      <div className="flex items-center px-4 pt-6 pb-2 bg-white shadow-none">
        <button
          className="mr-2 p-2 -ml-2"
          onClick={() => navigate(-1)}
          aria-label="Back"
        >
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path d="M15 18l-6-6 6-6" stroke="#004D40" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <span className="text-green-900 text-2xl font-bold">Add property</span>
      </div>
      {/* Main Content */}
      <div className="flex flex-col px-6 pt-6 pb-8">
        <div className="text-3xl font-bold text-[#222] mb-2">Add your property for sale</div>
        <div className="text-base text-[#222] mb-6">Sell your properties at ease with Vistaview</div>
        <div className="border-b border-[#E5E7EB] mb-8" />
        <div className="mb-4 text-base">
          <span>Sale category : </span>
          <span className="font-bold">{saleCategoryData?.saleCategory || 'Property'}</span>
        </div>
        <form onSubmit={handleSubmit(handleContinue)} className="space-y-4">
          {/* Property Type */}
          <div className="mb-4">
            <Controller
              name="propertyType"
              control={control}
              render={({ field: { onChange, value } }) => (
                <BottomSelectField
                  label="Property Type"
                  value={value?.name || ''}
                  options={propertyTypes.map(pt => pt.name)}
                  placeholder="Select property type"
                  onChange={(selectedName) => {
                    const selectedType = propertyTypes.find(pt => pt.name === selectedName);
                    onChange(selectedType || null);
                  }}
                  isMobile={isMobile}
                  showModal={modalType === 'propertyType'}
                  onOpenModal={() => openModal('propertyType')}
                  onCloseModal={closeModal}
                />
              )}
            />
            {errors.propertyType && (
              <p className="text-red-500 text-sm mt-1">{errors.propertyType.message as string}</p>
            )}
          </div>

          {/* Street Address */}
          <div className="mb-4">
            <div className="font-semibold mb-2">Let's add your property address and location</div>
            <label className="block mb-2 font-semibold">Street address</label>
            <Controller
              name="streetAddress"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  className={`w-full p-4 border rounded-lg text-lg bg-white mb-1 ${
                    errors.streetAddress ? 'border-red-500' : ''
                  }`}
                  placeholder="Enter street number and address.."
                />
              )}
            />
            <div className="text-xs text-gray-500 mb-2">Enter the valid address with street number</div>
            {errors.streetAddress && (
              <p className="text-red-500 text-sm mt-1">{errors.streetAddress.message as string}</p>
            )}
          </div>

          {/* Unit Number */}
          <div className="mb-4">
            <label className="block mb-2 font-semibold">Unit number</label>
            <Controller
              name="unitNumber"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  className={`w-full p-4 border rounded-lg text-lg bg-white ${
                    errors.unitNumber ? 'border-red-500' : ''
                  }`}
                  placeholder="Enter unit"
                />
              )}
            />
            {errors.unitNumber && (
              <p className="text-red-500 text-sm mt-1">{errors.unitNumber.message as string}</p>
            )}
          </div>

          {/* City */}
          <div className="mb-4">
            <Controller
              name="city"
              control={control}
              render={({ field: { onChange, value } }) => (
                <BottomSelectField
                  label="City"
                  value={value?.name || ''}
                  options={cities.map(city => city.name)}
                  placeholder="Select City"
                  onChange={(selectedName) => {
                    const selectedCity = cities.find(city => city.name === selectedName);
                    onChange(selectedCity || null);
                  }}
                  isMobile={isMobile}
                  showModal={modalType === 'city'}
                  onOpenModal={() => openModal('city')}
                  onCloseModal={closeModal}
                  showSearch={true}
                />
              )}
            />
            {errors.city && (
              <p className="text-red-500 text-sm mt-1">{errors.city.message as string}</p>
            )}
          </div>

          {/* State */}
          <div className="mb-4">
            <Controller
              name="state"
              control={control}
              render={({ field: { onChange, value } }) => (
                <BottomSelectField
                  label="State"
                  value={value?.name || ''}
                  options={states.map(state => state.name)}
                  placeholder="State code"
                  onChange={(selectedName) => {
                    const selectedState = states.find(state => state.name === selectedName);
                    onChange(selectedState || null);
                  }}
                  isMobile={isMobile}
                  showModal={modalType === 'state'}
                  onOpenModal={() => openModal('state')}
                  onCloseModal={closeModal}
                  showSearch={true}
                />
              )}
            />
            {errors.state && (
              <p className="text-red-500 text-sm mt-1">{errors.state.message as string}</p>
            )}
          </div>

          {/* Postal Code */}
          <div className="mb-4">
            <label className="block mb-2 font-semibold">Postal code</label>
            <Controller
              name="postalCode"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  className={`w-full p-4 border rounded-lg text-lg bg-white ${
                    errors.postalCode ? 'border-red-500' : ''
                  }`}
                  placeholder="Enter code"
                />
              )}
            />
            {errors.postalCode && (
              <p className="text-red-500 text-sm mt-1">{errors.postalCode.message as string}</p>
            )}
          </div>

          {/* Country */}
          <div className="mb-4">
            <Controller
              name="country"
              control={control}
              render={({ field: { onChange, value } }) => (
                <BottomSelectField
                  label="Country"
                  value={value?.name || ''}
                  options={countries.map(country => country.name)}
                  placeholder="Select Country"
                  onChange={(selectedName) => {
                    const selectedCountry = countries.find(country => country.name === selectedName);
                    onChange(selectedCountry || null);
                  }}
                  isMobile={isMobile}
                  showModal={modalType === 'country'}
                  onOpenModal={() => openModal('country')}
                  onCloseModal={closeModal}
                  showSearch={true}
                />
              )}
            />
            {errors.country && (
              <p className="text-red-500 text-sm mt-1">{errors.country.message as string}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="settings-gradient-btn w-full max-w-xs py-3 rounded-full font-bold text-lg shadow-lg mt-6 mx-auto"
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddPropertyDetailsPage; 