import React, { useState } from 'react';
import BottomModal from '../../../../../components/BottomModal';

interface BottomSelectFieldProps {
  label: string;
  value: string;
  options: string[];
  placeholder: string;
  onChange: (value: string) => void;
  isMobile: boolean;
  showModal: boolean;
  onOpenModal: () => void;
  onCloseModal: () => void;
  showSearch?: boolean;
  inline?: boolean;
}

const BottomSelectField: React.FC<BottomSelectFieldProps> = ({
  label,
  value,
  options,
  placeholder,
  onChange,
  isMobile,
  showModal,
  onOpenModal,
  onCloseModal,
  showSearch = false,
  inline = false,
}) => {
  const [search, setSearch] = useState('');
  const filteredOptions = showSearch
    ? options.filter(opt => opt.toLowerCase().includes(search.toLowerCase()))
    : options;

  return (
    <div className={inline ? '' : 'mb-4'}>
      {!inline && <label className="block mb-2 font-semibold">{label}</label>}
      {isMobile ? (
        <>
          <button
            type="button"
            className={`w-full border rounded-lg text-lg bg-white text-left flex items-center justify-between ${inline ? 'p-3 h-12' : 'p-4'}`}
            onClick={onOpenModal}
          >
            <span className={value ? 'text-black' : 'text-gray-400'}>
              {value || placeholder}
            </span>
            <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
              <path d="M6 8l4 4 4-4" stroke="#222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          {showModal && (
            <BottomModal
              open={showModal}
              title={`Select ${label}`}
              onCancel={() => {
                setSearch('');
                onCloseModal();
              }}
            >
              {showSearch && (
                <input
                  className="w-full mb-3 p-2 border rounded text-lg"
                  placeholder={`Search ${label}`}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  autoFocus
                />
              )}
              <div className="flex flex-col gap-2">
                {filteredOptions.length === 0 ? (
                  <div className="text-center text-gray-400 py-6">No options found</div>
                ) : (
                  filteredOptions.map(opt => (
                    <button
                      key={opt}
                      className={`w-full text-left px-4 py-3 rounded-lg text-lg ${value === opt ? 'bg-green-100 text-green-900 font-bold' : 'bg-white text-black'}`}
                      onClick={() => {
                        onChange(opt);
                        setSearch('');
                        onCloseModal();
                      }}
                    >
                      {opt}
                    </button>
                  ))
                )}
              </div>
            </BottomModal>
          )}
        </>
      ) : (
        <select
          className="w-full p-4 border rounded-lg text-lg bg-white"
          value={value}
          onChange={e => onChange(e.target.value)}
        >
          <option value="" disabled>{placeholder}</option>
          {options.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      )}
    </div>
  );
};

export default BottomSelectField; 