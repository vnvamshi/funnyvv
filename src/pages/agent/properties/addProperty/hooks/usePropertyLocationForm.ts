import { useState } from 'react';

interface LocationFields {
  propertyType: string;
  streetAddress: string;
  unitNumber: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export function usePropertyLocationForm(initialValues: Partial<LocationFields> = {}) {
  const [propertyType, setPropertyType] = useState(initialValues.propertyType || '');
  const [streetAddress, setStreetAddress] = useState(initialValues.streetAddress || '');
  const [unitNumber, setUnitNumber] = useState(initialValues.unitNumber || '');
  const [city, setCity] = useState(initialValues.city || '');
  const [state, setState] = useState(initialValues.state || '');
  const [postalCode, setPostalCode] = useState(initialValues.postalCode || '');
  const [country, setCountry] = useState(initialValues.country || '');

  const validate = () => {
    // Simple validation example
    return !!(propertyType && streetAddress && city && state && postalCode && country);
  };

  return {
    propertyType, setPropertyType,
    streetAddress, setStreetAddress,
    unitNumber, setUnitNumber,
    city, setCity,
    state, setState,
    postalCode, setPostalCode,
    country, setCountry,
    validate,
  };
} 