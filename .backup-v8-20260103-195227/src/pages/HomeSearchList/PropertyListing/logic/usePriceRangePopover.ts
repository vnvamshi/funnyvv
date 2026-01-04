import { useState } from 'react';

export interface PriceRange {
  min: number;
  max: number;
}

export const DEFAULT_MIN = 100;
export const DEFAULT_MAX = 10000000;

export function usePriceRangePopover(initialRange: PriceRange = { min: DEFAULT_MIN, max: DEFAULT_MAX }) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [range, setRange] = useState<[number, number]>([initialRange.min, initialRange.max]);
  const [tempRange, setTempRange] = useState<[number, number]>([initialRange.min, initialRange.max]);

  const openPopover = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    setTempRange(range);
  };

  const closePopover = () => {
    setAnchorEl(null);
  };

  const handleSliderChange = (_: Event, newValue: number | number[]) => {
    if (Array.isArray(newValue)) {
      setTempRange(newValue as [number, number]);
    }
  };

  const handleApply = () => {
    setRange(tempRange);
    closePopover();
  };

  const handleClear = () => {
    setTempRange([DEFAULT_MIN, DEFAULT_MAX]);
    setRange([DEFAULT_MIN, DEFAULT_MAX]);
    closePopover();
  };

  return {
    anchorEl,
    open: Boolean(anchorEl),
    openPopover,
    closePopover,
    range,
    tempRange,
    handleSliderChange,
    handleApply,
    handleClear,
    setRange,
  };
} 