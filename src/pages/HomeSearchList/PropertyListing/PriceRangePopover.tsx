import React from 'react';
import Popover from '@mui/material/Popover';
import Slider from '@mui/material/Slider';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import { usePriceRangePopover, DEFAULT_MIN, DEFAULT_MAX } from './logic/usePriceRangePopover';

interface PriceRangePopoverProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  tempRange: [number, number];
  onClose: () => void;
  onSliderChange: (event: Event, value: number | number[]) => void;
  onApply: () => void;
  onClear: () => void;
}

export const PriceRangePopover: React.FC<PriceRangePopoverProps> = ({
  anchorEl,
  open,
  tempRange,
  onClose,
  onSliderChange,
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
            zIndex: 1300, // MUI popover default is 1300
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
        <Typography
          variant="h6"
          fontWeight={700}
          mb={0.5}
          sx={{
            color: 'black',
          }}
        >
          Price
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          mb={2}
          sx={{
            color: 'black',
          }}
        >
          {(() => {
            const [min, max] = tempRange;
            if (min === DEFAULT_MIN && max === DEFAULT_MAX) {
              return 'Any';
            }
            const minLabel = min === DEFAULT_MIN ? 'No Min' : `$${min.toLocaleString()}`;
            const maxLabel = max === DEFAULT_MAX ? 'No Max' : `$${max.toLocaleString()}`;
            return `${minLabel} - ${maxLabel}`;
          })()}
        </Typography>
        <Slider
          value={tempRange}
          onChange={onSliderChange}
          min={DEFAULT_MIN}
          max={DEFAULT_MAX}
          step={100}
          sx={{
            mb: 1,
            '& .MuiSlider-track': {
              background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)',
              border: 'none',
            },
            '& .MuiSlider-rail': {
              background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)',
              opacity: 0.3,
            },
            '& .MuiSlider-thumb': {
              backgroundColor: '#007E67',
              border: '2px solid #fff',
            },
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <Typography
            variant="body2"
            sx={{
              color: 'black',
            }}
          >
            No Min
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: 'black',
            }}
          >
            No Max
          </Typography>
        </div>
        <Divider sx={{ mb: 2 }} />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 16 }}>
          <Button
            onClick={onClear}
            sx={{
              background: gradient,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              border: 'none',
              textTransform: 'none',
              fontWeight: 500,
            }}
          >
            Clear
          </Button>
          <Button
            onClick={onApply}
            variant="outlined"
            sx={{
              textTransform: 'none',
              minWidth: 80,
              fontWeight: 500,
              color: '#007E67',
              borderColor: '#007E67',
              borderRadius: 2
            }}
          >
            Apply
          </Button>
        </div>
      </Popover>
    </>
  );
}; 