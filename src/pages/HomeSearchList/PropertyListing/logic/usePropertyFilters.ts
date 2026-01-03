import { useState, useMemo } from 'react';
import { Property, PropertyFilters, PropertyList } from '../types';

export const usePropertyFilters = (properties: PropertyList) => {
  const [filters, setFilters] = useState<PropertyFilters>({
    search: '',
    priceRange: [0, 10000000],
    bedrooms: null,
    bathrooms: null,
    propertyType: null,
  });

  const filteredProperties = useMemo(() => {
    return properties.filter((property) => {
      const matchesSearch =
        filters.search === '' ||
        property.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        property.location.toLowerCase().includes(filters.search.toLowerCase());
      const matchesPrice =
        property.price >= filters.priceRange[0] &&
        property.price <= filters.priceRange[1];
      const matchesBedrooms =
        filters.bedrooms === null || property.bedrooms === filters.bedrooms;
      const matchesBathrooms =
        filters.bathrooms === null || property.bathrooms === filters.bathrooms;
      // Property type logic can be added if needed
      return (
        matchesSearch &&
        matchesPrice &&
        matchesBedrooms &&
        matchesBathrooms
      );
    });
  }, [properties, filters]);

  return { filters, setFilters, filteredProperties };
}; 