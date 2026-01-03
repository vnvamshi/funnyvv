import { useState } from 'react';

interface InfoFields {
  lotSize: string;
  buildSqft: string;
  overallSqft: string;
  homeType: string;
  yearBuilt: string;
  bedRooms: string;
  fullBaths: string;
  halfBaths: string;
  sellingPrice: string;
  description: string;
}

export function usePropertyInfoForm(initialValues: Partial<InfoFields> = {}) {
  const [lotSize, setLotSize] = useState(initialValues.lotSize || '');
  const [buildSqft, setBuildSqft] = useState(initialValues.buildSqft || '');
  const [overallSqft, setOverallSqft] = useState(initialValues.overallSqft || '');
  const [homeType, setHomeType] = useState(initialValues.homeType || '');
  const [yearBuilt, setYearBuilt] = useState(initialValues.yearBuilt || '');
  const [bedRooms, setBedRooms] = useState(initialValues.bedRooms || '');
  const [fullBaths, setFullBaths] = useState(initialValues.fullBaths || '');
  const [halfBaths, setHalfBaths] = useState(initialValues.halfBaths || '');
  const [sellingPrice, setSellingPrice] = useState(initialValues.sellingPrice || '');
  const [description, setDescription] = useState(initialValues.description || '');
  // Add more fields as needed

  const validate = () => {
    // Simple validation example
    return !!(lotSize && buildSqft && overallSqft && homeType && yearBuilt && bedRooms && fullBaths && sellingPrice);
  };

  return {
    lotSize, setLotSize,
    buildSqft, setBuildSqft,
    overallSqft, setOverallSqft,
    homeType, setHomeType,
    yearBuilt, setYearBuilt,
    bedRooms, setBedRooms,
    fullBaths, setFullBaths,
    halfBaths, setHalfBaths,
    sellingPrice, setSellingPrice,
    description, setDescription,
    validate,
  };
} 