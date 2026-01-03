import React, { useState, useEffect } from 'react';
import { PlusIcon, MinusIcon } from '../../../assets/icons/CommonIcons';
import api from '../../../utils/api';
import AboutAgentMobileModal from './AboutAgentMobileModal';

const LANGUAGES = ['English', 'Spanish', 'French'];
const SPECIALTIES = ["Buyer's Agent", 'Listing Agent'];
const SERVICE_AREAS = ['Punta Cana', 'Santo Domingo', 'Santiago', 'Puerto Plata'];
const YEARS = Array.from({ length: 50 }, (_, i) => `${2015 - i}`);

const AboutAgentMobile: React.FC<{ onCancel?: () => void, onUpdate?: () => void }> = ({ onCancel, onUpdate }) => {
  const [languages, setLanguages] = useState<string[]>(['English', 'Spanish', 'French']);
  const [specialties, setSpecialties] = useState<string[]>(["Buyer's Agent", 'Listing Agent']);
  const [serviceAreas, setServiceAreas] = useState<string[]>(['Punta Cana', 'Santo Domingo']);
  const [year, setYear] = useState('2015');
  const [loading, setLoading] = useState(false);
  const [areaInput, setAreaInput] = useState('');
  const [showAboutModal, setShowAboutModal] = useState(false);

  const handleLanguageToggle = (lang: string) => {
    setLanguages(langs => langs.includes(lang) ? langs.filter(l => l !== lang) : [...langs, lang]);
  };
  const handleSpecialtyToggle = (spec: string) => {
    setSpecialties(specs => specs.includes(spec) ? specs.filter(s => s !== spec) : [...specs, spec]);
  };
  const handleAreaAdd = (area: string) => {
    if (area && !serviceAreas.includes(area)) setServiceAreas([...serviceAreas, area]);
    setAreaInput('');
  };
  const handleAreaRemove = (area: string) => {
    setServiceAreas(serviceAreas.filter(a => a !== area));
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center px-4 pt-4 pb-2 bg-white sticky top-0 z-10">
        <button onClick={onCancel} className="mr-2">
          <svg width="24" height="24" fill="none" stroke="#17695C" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
        </button>
        <span className="text-lg font-semibold text-[#17695C]">About Agent</span>
      </div>
      <form className="flex-1 flex flex-col px-4 pb-4" onSubmit={e => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
          setLoading(false);
          if (onUpdate) onUpdate();
        }, 1000);
      }}>
        {/* Languages known */}
        <div className="mt-4">
          <label className="block font-semibold mb-2">Languages known</label>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map(lang => (
              <button type="button" key={lang} onClick={() => handleLanguageToggle(lang)}
                className={`px-3 py-1 rounded-full text-sm font-medium border ${languages.includes(lang) ? 'bg-[#D1FADF] text-[#007E67] border-[#007E67]' : 'bg-[#F3F6F7] text-[#007E67] border-[#007E67]'} flex items-center gap-1`}>
                {lang} {languages.includes(lang) && <span className="ml-1">&times;</span>}
              </button>
            ))}
          </div>
        </div>
        {/* Specialties */}
        <div className="mt-6">
          <label className="block font-semibold mb-2">Specialties</label>
          <div className="flex flex-col gap-2">
            {SPECIALTIES.map(spec => (
              <label key={spec} className="flex items-center gap-2 text-base">
                <input type="checkbox" checked={specialties.includes(spec)} onChange={() => handleSpecialtyToggle(spec)} className="accent-[#007E67]" />
                {spec}
              </label>
            ))}
          </div>
        </div>
        {/* Service Areas */}
        <div className="mt-6">
          <label className="block font-semibold mb-2">Service Areas</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {serviceAreas.map(area => (
              <span key={area} className="px-3 py-1 rounded-full text-sm font-medium bg-[#D1FADF] text-[#007E67] flex items-center gap-1">
                {area}
                <button type="button" className="ml-1" onClick={() => handleAreaRemove(area)}>&times;</button>
              </span>
            ))}
          </div>
          <select className="w-full border border-gray-300 rounded-lg px-4 py-2 text-base" value={areaInput} onChange={e => setAreaInput(e.target.value)}>
            <option value="">Select area</option>
            {SERVICE_AREAS.filter(a => !serviceAreas.includes(a)).map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
          <button type="button" className="mt-2 text-[#007E67] underline text-sm" onClick={() => handleAreaAdd(areaInput)} disabled={!areaInput}>Add Area</button>
        </div>
        {/* In business since */}
        <div className="mt-6">
          <label className="block font-semibold mb-2">In business since</label>
          <select className="w-full border border-gray-300 rounded-lg px-4 py-2 text-base" value={year} onChange={e => setYear(e.target.value)}>
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        {/* Buttons */}
        <div className="flex gap-4 mt-10 mb-2 justify-center">
          <button type="button" className="border border-[#17695C] rounded-lg px-8 py-2 font-semibold text-[#17695C] bg-white hover:bg-[#F3F6F7] transition" onClick={onCancel} disabled={loading}>Cancel</button>
          <button type="submit" className="rounded-lg px-8 py-2 font-semibold text-white bg-gradient-to-r from-[#17695C] to-[#007E67] hover:from-[#007E67] hover:to-[#17695C] transition shadow" disabled={loading}>{loading ? 'Updating...' : 'Update'}</button>
        </div>
      </form>
      <AboutAgentMobileModal open={showAboutModal} onCancel={() => setShowAboutModal(false)} user={userData} onUpdated={onProfileUpdated} />
    </div>
  );
};

export default AboutAgentMobile; 