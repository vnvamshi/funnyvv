import React, { useEffect, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import { useForm, Controller, ControllerRenderProps } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Autocomplete from '@mui/material/Autocomplete';
import api from '../../../../utils/api';



const schema = yup.object().shape({
  propertyType: yup.object().required('Property type is required'),
  streetAddress: yup.string().required('Street address is required'),
  unitNumber: yup.string()
    .min(1, 'Unit number must be at least 1 characters')
    .max(10, 'Unit number must be at most 10 characters')
    .required('Unit number is required'),
  city: yup.object().required('City is required'),
  state: yup.object().required('State is required'),
  postalCode: yup.string()
    .matches(/^[0-9]{5}(?:-[0-9]{4})?$/, 'Invalid postal code')
    .min(5, 'Postal code must be at least 5 characters')
    .max(10, 'Postal code must be at most 10 characters')
    .required('Postal code is required'),
  country: yup.object().required('Country is required')
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

interface AddPropertyModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: AddPropertyFormValues) => void;
  saleCategory: string;
}

const AddPropertyModal: React.FC<AddPropertyModalProps> = ({ open, onCancel, onSubmit, saleCategory }) => {
  const { control, handleSubmit, formState: { errors }, setValue } = useForm<AddPropertyFormValues>({
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

  // Helper function to handle form submission
  const onSubmitHandler = (data: AddPropertyFormValues) => {
    // Pass the complete form data with location objects
    onSubmit({
      ...data,
      // You can also add any additional formatting here if needed
    });
  };

  const [cities, setCities] = useState<Array<{ id: string | number; name: string }>>([]);
  const [states, setStates] = useState<Array<{ id: string | number; name: string }>>([]);
  const [countries, setCountries] = useState<Array<{ id: string | number; name: string }>>([]);
  const [propertyTypes, setPropertyTypes] = useState<Array<{ id: string | number; name: string }>>([]);

  useEffect(() => {
    if (!open) {
      getCity();
      getState();
      getCountry();
      getPropertyType();
    }
  }, [open]);

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
        const formattedCities = response.data.data.map((item: any) => {
          // Handle case where name might be an object
          let nameValue = item.name;
          if (typeof nameValue === 'object' && nameValue !== null) {
            nameValue = nameValue.name || nameValue.value || '';
          }
          return {
            id: item.id || item._id || item.cityId || (typeof item.name === 'object' ? item.name?.id : item.name),
            name: nameValue || item.cityName || item.value || '',
          };
        });
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
        const formattedStates = response.data.data.map((item: any) => {
          // Handle case where name might be an object
          let nameValue = item.name;
          if (typeof nameValue === 'object' && nameValue !== null) {
            nameValue = nameValue.name || nameValue.value || '';
          }
          return {
            id: item.id || item._id || item.stateId || (typeof item.name === 'object' ? item.name?.id : item.name),
            name: nameValue || item.stateName || item.value || ''
          };
        });
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
        const formattedCountries = response.data.data.map((item: any) => {
          // Handle case where name might be an object
          let nameValue = item.name;
          if (typeof nameValue === 'object' && nameValue !== null) {
            nameValue = nameValue.name || nameValue.value || '';
          }
          return {
            id: item.id || item._id || item.countryId || (typeof item.name === 'object' ? item.name?.id : item.name),
            name: nameValue || item.countryName || item.value || ''
          };
        });
        setCountries(formattedCountries);
      }
    } catch (error) {
      console.error('Error fetching countries:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
      <DialogTitle>Add your property for sale</DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmitHandler)} className="w-full max-w-lg mx-auto p-2">
          <div className="text-lg mb-2">Sell your properties at ease with Vistaview</div>
          <hr className="my-4" />
          <div className="mb-4 text-base">
            <span>Sale category : </span>
            <span className="font-bold">{saleCategory}</span>
          </div>
          <div className="mb-4">
            <label className="block mb-2 font-semibold">Property Type</label>
            <Controller
              name="propertyType"
              control={control}
              render={({ field: { onChange, value, ...field } }) => (
                <Autocomplete
                  options={propertyTypes}
                  getOptionLabel={(option) => {
                    if (typeof option === 'string') return option;
                    if (typeof option?.name === 'string') return option.name;
                    if (typeof option?.name === 'object' && option?.name !== null) {
                      return option.name.name || option.name.value || '';
                    }
                    return '';
                  }}
                  isOptionEqualToValue={(option, value) => {
                    if (!value) return false;
                    return option.id === value.id;
                  }}
                  onChange={(_, data) => onChange(data)}
                  value={value}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      {...field}
                      fullWidth
                      placeholder="Search or select a property type"
                      error={!!errors.propertyType}
                      helperText={errors.propertyType?.message}
                      variant="outlined"
                      size="medium"
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <React.Fragment>
                            {params.InputProps.endAdornment}
                          </React.Fragment>
                        ),
                      }}
                    />
                  )}
                  renderOption={(props, option) => (
                    <li {...props} key={option.id}>
                      {option.name}
                    </li>
                  )}
                  noOptionsText="No Property Type found"
                />
              )}
            />
          </div>
          <div className="mb-4">
            <div className="font-semibold mb-2">Let's add your property address and location</div>
            <label className="block mb-2 font-semibold">Street address</label>
            <Controller
              name="streetAddress"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  placeholder="Enter street number and address.."
                  error={!!errors.streetAddress}
                  helperText={errors.streetAddress?.message || 'Enter the valid address with street number'}
                  variant="outlined"
                  size="medium"
                />
              )}
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2 font-semibold">Unit number</label>
            <Controller
              name="unitNumber"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  placeholder="Enter unit"
                  error={!!errors.unitNumber}
                  helperText={errors.unitNumber?.message}
                  variant="outlined"
                  size="medium"
                />
              )}
            />
          </div>
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <label className="block mb-2 font-semibold">City</label>
              <Controller
                name="city"
                control={control}
                render={({ field: { onChange, value, ...field } }) => (
                  <Autocomplete
                    options={cities}
                    getOptionLabel={(option) => {
                    if (typeof option === 'string') return option;
                    if (typeof option?.name === 'string') return option.name;
                    if (typeof option?.name === 'object' && option?.name !== null) {
                      return option.name.name || option.name.value || '';
                    }
                    return '';
                  }}
                    isOptionEqualToValue={(option, value) => {
                      if (!value) return false;
                      return option.id === value.id;
                    }}
                    onChange={(_, data) => onChange(data)}
                    value={value}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        {...field}
                        fullWidth
                        placeholder="Search or select a city"
                        error={!!errors.city}
                        helperText={errors.city?.message}
                        variant="outlined"
                        size="medium"
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <React.Fragment>
                              {params.InputProps.endAdornment}
                            </React.Fragment>
                          ),
                        }}
                      />
                    )}
                    renderOption={(props, option) => (
                      <li {...props} key={option.id}>
                        {option.name}
                      </li>
                    )}
                    noOptionsText="No cities found"
                  />
                )}
              />
            </div>
            <div className="flex-1">
              <label className="block mb-2 font-semibold">State</label>
              <Controller
                name="state"
                control={control}
                render={({ field: { onChange, value, ...field } }) => (
                  <Autocomplete
                    options={states}
                    getOptionLabel={(option) => {
                    if (typeof option === 'string') return option;
                    if (typeof option?.name === 'string') return option.name;
                    if (typeof option?.name === 'object' && option?.name !== null) {
                      return option.name.name || option.name.value || '';
                    }
                    return '';
                  }}
                    isOptionEqualToValue={(option, value) => {
                      if (!value) return false;
                      return option.id === value.id;
                    }}
                    onChange={(_, data) => onChange(data)}
                    value={value}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        {...field}
                        fullWidth
                        placeholder="Search or select a state"
                        error={!!errors.state}
                        helperText={errors.state?.message}
                        variant="outlined"
                        size="medium"
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <React.Fragment>
                              {params.InputProps.endAdornment}
                            </React.Fragment>
                          ),
                        }}
                      />
                    )}
                    renderOption={(props, option) => (
                      <li {...props} key={option.id}>
                        {option.name}
                      </li>
                    )}
                    noOptionsText="No states found"
                  />
                )}
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block mb-2 font-semibold">Postal code</label>
            <Controller
              name="postalCode"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  placeholder="Enter code"
                  error={!!errors.postalCode}
                  helperText={errors.postalCode?.message}
                  variant="outlined"
                  size="medium"
                />
              )}
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2 font-semibold">Country</label>
            <Controller
              name="country"
              control={control}
              render={({ field: { onChange, value, ...field } }) => (
                <Autocomplete
                  options={countries}
                  getOptionLabel={(option) => {
                    if (typeof option === 'string') return option;
                    if (typeof option?.name === 'string') return option.name;
                    if (typeof option?.name === 'object' && option?.name !== null) {
                      return option.name.name || option.name.value || '';
                    }
                    return '';
                  }}
                  isOptionEqualToValue={(option, value) => {
                    if (!value) return false;
                    return option.id === value.id;
                  }}
                  onChange={(_, data) => onChange(data)}
                  value={value}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      {...field}
                      fullWidth
                      placeholder="Search or select a country"
                      error={!!errors.country}
                      helperText={errors.country?.message}
                      variant="outlined"
                      size="medium"
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <React.Fragment>
                            {params.InputProps.endAdornment}
                          </React.Fragment>
                        ),
                      }}
                    />
                  )}
                  renderOption={(props, option) => (
                    <li {...props} key={option.id}>
                      {option.name}
                    </li>
                  )}
                  noOptionsText="No countries found"
                />
              )}
            />
          </div>
          <DialogActions>
            <Button type="submit" className="settings-gradient-btn"
              style={{ color: '#fff', fontSize: 20, fontWeight: 500, width: '100%' }}>Continue</Button>
          </DialogActions>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddPropertyModal; 