import React from 'react';
import Popover from '@mui/material/Popover';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import { usePropertyTypePopover } from './logic/usePropertyTypePopover';

interface PropertyType {
  id: string;
  value: string;
}

interface PropertyTypePopoverProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  tempChecked: string[];
  search: string;
  setSearch: (val: string) => void;
  filteredTypes: PropertyType[];
  onClose: () => void;
  onCheck: (id: string) => void;
  onApply: () => void;
  onClear: () => void;
}

export const PropertyTypePopover: React.FC<PropertyTypePopoverProps> = ({
  anchorEl,
  open,
  tempChecked,
  search,
  setSearch,
  filteredTypes,
  onClose,
  onCheck,
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
        <Typography variant="h6" fontWeight={700} mb={1} sx={{ color: 'black' }}>
          Property Type
        </Typography>
        <TextField
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search type.."
          size="small"
          fullWidth
          InputProps={{
            // startAdornment: (
            //   <span role="img" aria-label="search" style={{ marginRight: 8, color: '#888' }}>🔍</span>
            // ),
            sx: { borderRadius: 2, background: '#f5f5f5' },
          }}
          sx={{ mb: 2 }}
        />
        {filteredTypes.map(type => (
          <div key={type.id} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
            <Checkbox
              checked={tempChecked.includes(type.id)}
              onChange={() => onCheck(type.id)}
              sx={{ color: '#007E67' }}
            />
            <Typography variant="body1" sx={{ color: 'black' }}>{type.value}</Typography>
          </div>
        ))}
        <Divider sx={{ mb: 2, mt: 2 }} />
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