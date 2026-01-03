import React from 'react';
import Popover from '@mui/material/Popover';
import Slider from '@mui/material/Slider';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import { useBedsBathsPopover, DEFAULT_MIN, DEFAULT_MAX } from './logic/useBedsBathsPopover';

interface BedsBathsPopoverProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  tempBeds: [number, number];
  tempBaths: [number, number];
  onClose: () => void;
  onBedsChange: (event: Event, value: number | number[]) => void;
  onBathsChange: (event: Event, value: number | number[]) => void;
  onApply: () => void;
  onClear: () => void;
}

export const BedsBathsPopover: React.FC<BedsBathsPopoverProps> = ({
  anchorEl,
  open,
  tempBeds,
  tempBaths,
  onClose,
  onBedsChange,
  onBathsChange,
  onApply,
  onClear,
}) => {
  const gradient = 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)';
  return (
    <>
      {open && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: '#00000066',
            zIndex: 1300,
          }}
          onClick={onClose}
        />
      )}
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={onClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        PaperProps={{
          sx: {
            borderRadius: 3,
            minWidth: 350,
            p: 2,
            color: 'transparent',
            background: '#fff',
            backgroundClip: 'padding-box',
            border: '1px solid',
            borderImageSource: gradient,
            borderImageSlice: 1,
          },
        }}
      >
        {/* Bedrooms Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <Typography variant="h6" fontWeight={700} sx={{ color: 'black' }}>
            Bedrooms
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ color: 'black' }}>
            {(() => {
              const [min, max] = tempBeds;
              if (min === DEFAULT_MIN && max === DEFAULT_MAX) {
                return 'Any';
              }
              const minLabel = min === DEFAULT_MIN ? 'No Min' : min;
              const maxLabel = max === DEFAULT_MAX ? 'No Max' : max;
              return `${minLabel} - ${maxLabel}`;
            })()}
          </Typography>
        </div>
        <Slider
          value={tempBeds}
          onChange={onBedsChange}
          min={DEFAULT_MIN}
          max={DEFAULT_MAX}
          step={1}
          sx={{
            mb: 1,
            height: 8,
            '& .MuiSlider-track': {
              background: gradient,
              border: 'none',
              height: 4,
              borderRadius: 2,
            },
            '& .MuiSlider-rail': {
              background: gradient,
              opacity: 0.3,
              height: 4,
              borderRadius: 2,
            },
            '& .MuiSlider-thumb': {
              width: 24,
              height: 24,
              backgroundColor: '#007E67',
              border: '3px solid #fff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              '&:focus, &:hover, &.Mui-active': {
                boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
              },
            },
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <Typography variant="body2" sx={{ color: 'black' }}>0</Typography>
          <Typography variant="body2" sx={{ color: 'black' }}>5+</Typography>
        </div>
        <Divider sx={{ mb: 2 }} />
        {/* Bathrooms Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <Typography variant="h6" fontWeight={700} sx={{ color: 'black' }}>
            Bathrooms
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ color: 'black' }}>
            {(() => {
              const [min, max] = tempBaths;
              if (min === DEFAULT_MIN && max === DEFAULT_MAX) {
                return 'Any';
              }
              const minLabel = min === DEFAULT_MIN ? 'No Min' : min;
              const maxLabel = max === DEFAULT_MAX ? 'No Max' : max;
              return `${minLabel} - ${maxLabel}`;
            })()}
          </Typography>
        </div>
        <Slider
          value={tempBaths}
          onChange={onBathsChange}
          min={DEFAULT_MIN}
          max={DEFAULT_MAX}
          step={1}
          sx={{
            mb: 1,
            height: 8,
            '& .MuiSlider-track': {
              background: gradient,
              border: 'none',
              height: 4,
              borderRadius: 2,
            },
            '& .MuiSlider-rail': {
              background: gradient,
              opacity: 0.3,
              height: 4,
              borderRadius: 2,
            },
            '& .MuiSlider-thumb': {
              width: 24,
              height: 24,
              backgroundColor: '#007E67',
              border: '3px solid #fff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              '&:focus, &:hover, &.Mui-active': {
                boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
              },
            },
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <Typography variant="body2" sx={{ color: 'black' }}>0</Typography>
          <Typography variant="body2" sx={{ color: 'black' }}>5+</Typography>
        </div>
        <Divider sx={{ mb: 2 }} />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 16 }}>
          <Button onClick={onClear} sx={{ color: '#007E67', textTransform: 'none' }}>
            Clear
          </Button>
          <Button
            onClick={onApply}
            variant="outlined"
            sx={{ color: '#007E67', borderColor: '#007E67', textTransform: 'none', minWidth: 80 }}
          >
            Apply
          </Button>
        </div>
      </Popover>
    </>
  );
}; 