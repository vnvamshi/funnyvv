import { useState } from 'react';

export interface Range {
  min: number;
  max: number;
}

export const DEFAULT_MIN = 0;
export const DEFAULT_MAX = 5;

export function useBedsBathsPopover(initialBeds: Range = { min: DEFAULT_MIN, max: DEFAULT_MAX }, initialBaths: Range = { min: DEFAULT_MIN, max: DEFAULT_MAX }) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [beds, setBeds] = useState<[number, number]>([initialBeds.min, initialBeds.max]);
  const [baths, setBaths] = useState<[number, number]>([initialBaths.min, initialBaths.max]);
  const [tempBeds, setTempBeds] = useState<[number, number]>([initialBeds.min, initialBeds.max]);
  const [tempBaths, setTempBaths] = useState<[number, number]>([initialBaths.min, initialBaths.max]);

  const openPopover = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    setTempBeds(beds);
    setTempBaths(baths);
  };

  const closePopover = () => {
    setAnchorEl(null);
  };

  const handleBedsChange = (_: Event, newValue: number | number[]) => {
    if (Array.isArray(newValue)) {
      setTempBeds(newValue as [number, number]);
    }
  };

  const handleBathsChange = (_: Event, newValue: number | number[]) => {
    if (Array.isArray(newValue)) {
      setTempBaths(newValue as [number, number]);
    }
  };

  const handleApply = () => {
    setBeds(tempBeds);
    setBaths(tempBaths);
    closePopover();
  };

  const handleClear = () => {
    setTempBeds([DEFAULT_MIN, DEFAULT_MAX]);
    setTempBaths([DEFAULT_MIN, DEFAULT_MAX]);
    setBeds([DEFAULT_MIN, DEFAULT_MAX]);
    setBaths([DEFAULT_MIN, DEFAULT_MAX]);
    closePopover();
  };

  return {
    anchorEl,
    open: Boolean(anchorEl),
    openPopover,
    closePopover,
    beds,
    baths,
    tempBeds,
    tempBaths,
    handleBedsChange,
    handleBathsChange,
    handleApply,
    handleClear,
    setBeds,
    setBaths,
  };
} 