import { useState } from 'react';

export interface PropertyType {
  id: string;
  value: string;
}

export function usePropertyTypePopover(propertyTypes: PropertyType[], initialChecked: string[] = []) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [checked, setChecked] = useState<string[]>(initialChecked);
  const [tempChecked, setTempChecked] = useState<string[]>(initialChecked);
  const [search, setSearch] = useState('');

  const openPopover = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    setTempChecked(checked);
    setSearch('');
  };

  const closePopover = () => {
    setAnchorEl(null);
  };

  const handleCheck = (id: string) => {
    setTempChecked(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const handleApply = () => {
    setChecked(tempChecked);
    closePopover();
  };

  const handleClear = () => {
    setTempChecked([]);
    setChecked([]);
    setSearch('');
    closePopover();
  };

  const filteredTypes = propertyTypes.filter(type =>
    type.value.toLowerCase().includes(search.toLowerCase())
  );

  return {
    anchorEl,
    open: Boolean(anchorEl),
    openPopover,
    closePopover,
    checked,
    tempChecked,
    search,
    setSearch,
    handleCheck,
    handleApply,
    handleClear,
    filteredTypes,
    propertyTypes,
    setChecked,
  };
} 