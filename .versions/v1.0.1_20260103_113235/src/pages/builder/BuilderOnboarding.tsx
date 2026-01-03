import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import { Check, ArrowLeft, Edit2, X } from 'lucide-react';
// @ts-ignore - Image import
import verifyInProgressImage from '../../assets/images/v3.2/verify_inprogress.png';
import { fetchCompanyTypes, fetchRoleTypes, fetchCountries, fetchStateCityHierarchy, uploadFile, validateFile, submitBuilderOnboarding, fetchBuilderOnboarding, CompanyType, RoleType, Country, StateCityHierarchy, State, City } from '../../utils/api';
import { showGlobalToast } from '../../utils/toast';
import { useAuth } from '../../contexts/AuthContext';

const STEPS = [
  { id: 1, name: 'Builder Account Creation', key: 'account' },
  { id: 2, name: 'Company & Compliance Details', key: 'company' },
  { id: 3, name: 'Service Geography Configuration', key: 'geography' },
  { id: 4, name: 'Authorized Contacts', key: 'contacts' },
  { id: 5, name: 'Review', key: 'review' },
];

interface Project {
  id: string;
  name: string;
  location: string;
  reraId: string;
  locationType?: 'state' | 'city';
  stateId?: string | null;
  cityId?: string | null;
  countryId?: string;
}

interface Contact {
  id: string;
  name: string;
  role: string;
  roleTypeId?: string;
  contactNo: string;
  email: string;
}

const BuilderOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(2); // Start at step 2 (Company & Compliance)
  const [submitting, setSubmitting] = useState(false);
  const [verificationSubmitted, setVerificationSubmitted] = useState(false);
  
  // Form state
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedCountryIdStep1, setSelectedCountryIdStep1] = useState<string>('');
  const [businessName, setBusinessName] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [gstVerified, setGstVerified] = useState(false);
  const [reraIdType, setReraIdType] = useState('');
  const [reraId, setReraId] = useState('');
  const [stateCityHierarchyStep2, setStateCityHierarchyStep2] = useState<StateCityHierarchy | null>(null);
  const [serviceLocations, setServiceLocations] = useState(0);
  const [country, setCountry] = useState('');
  const [selectedCountryId, setSelectedCountryId] = useState<string>('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectLocation, setNewProjectLocation] = useState('');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [newContact, setNewContact] = useState({ name: '', role: '', roleTypeId: '', contactNo: '', email: '' });
  const [selectedLocationType, setSelectedLocationType] = useState<'state' | 'city' | null>(null);
  const [selectedLocationStateId, setSelectedLocationStateId] = useState<string | null>(null);
  const [selectedLocationCityId, setSelectedLocationCityId] = useState<string | null>(null);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showReraTypeDropdown, setShowReraTypeDropdown] = useState(false);
  const countryDropdownRef = useRef<HTMLDivElement>(null);
  const reraTypeDropdownRef = useRef<HTMLDivElement>(null);
  const countryTriggerRef = useRef<HTMLButtonElement>(null);
  const reraTypeTriggerRef = useRef<HTMLButtonElement>(null);
  const [showCompanyDetailsForm, setShowCompanyDetailsForm] = useState(false);
  
  // Company Details form state
  const [companyType, setCompanyType] = useState('');
  const [companyTypeId, setCompanyTypeId] = useState<string>('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [cityId, setCityId] = useState<string>('');
  const [state, setState] = useState('');
  const [stateId, setStateId] = useState<string>('');
  const [countryIdStep2, setCountryIdStep2] = useState<string>('');
  const [postalCode, setPostalCode] = useState('');
  const [yearOfEstablishment, setYearOfEstablishment] = useState('');
  const [showCompanyTypeDropdown, setShowCompanyTypeDropdown] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const [showCountryDropdownStep3, setShowCountryDropdownStep3] = useState(false);
  const [showRoleTypeDropdown, setShowRoleTypeDropdown] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  
  // API data state
  const [companyTypes, setCompanyTypes] = useState<CompanyType[]>([]);
  const [roleTypes, setRoleTypes] = useState<RoleType[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [stateCityHierarchy, setStateCityHierarchy] = useState<StateCityHierarchy | null>(null);
  const [loadingCompanyTypes, setLoadingCompanyTypes] = useState(false);
  const [loadingRoleTypes, setLoadingRoleTypes] = useState(false);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingStateCity, setLoadingStateCity] = useState(false);
  const [locationSearchQuery, setLocationSearchQuery] = useState('');
  const companyTypeDropdownRef = useRef<HTMLDivElement>(null);
  const cityDropdownRef = useRef<HTMLDivElement>(null);
  const stateDropdownRef = useRef<HTMLDivElement>(null);
  const yearDropdownRef = useRef<HTMLDivElement>(null);
  const countryDropdownStep3Ref = useRef<HTMLDivElement>(null);
  const roleTypeDropdownRef = useRef<HTMLDivElement>(null);
  const companyTypeTriggerRef = useRef<HTMLButtonElement>(null);
  const cityTriggerRef = useRef<HTMLButtonElement>(null);
  const stateTriggerRef = useRef<HTMLButtonElement>(null);
  const yearTriggerRef = useRef<HTMLButtonElement>(null);
  const countryTriggerStep3Ref = useRef<HTMLButtonElement>(null);
  const roleTypeTriggerRef = useRef<HTMLButtonElement>(null);
  const locationDropdownRef = useRef<HTMLDivElement>(null);
  const locationTriggerRef = useRef<HTMLButtonElement>(null);
  
  // File upload refs and state
  const logoFileInputRef = useRef<HTMLInputElement>(null);
  const companyCertFileInputRef = useRef<HTMLInputElement>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [companyCertFile, setCompanyCertFile] = useState<File | null>(null);
  const [logoFileUrl, setLogoFileUrl] = useState<string | null>(null);
  const [companyCertFileUrl, setCompanyCertFileUrl] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCert, setUploadingCert] = useState(false);
  const [logoUploadProgress, setLogoUploadProgress] = useState(0);
  const [certUploadProgress, setCertUploadProgress] = useState(0);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      
      if (showCountryDropdown && 
          countryTriggerRef.current && 
          !countryTriggerRef.current.contains(target) &&
          countryDropdownRef.current &&
          !countryDropdownRef.current.contains(target)) {
        setShowCountryDropdown(false);
      }
      
      if (showReraTypeDropdown &&
          reraTypeTriggerRef.current &&
          !reraTypeTriggerRef.current.contains(target) &&
          reraTypeDropdownRef.current &&
          !reraTypeDropdownRef.current.contains(target)) {
        setShowReraTypeDropdown(false);
      }

      if (showCompanyTypeDropdown &&
          companyTypeTriggerRef.current &&
          !companyTypeTriggerRef.current.contains(target) &&
          companyTypeDropdownRef.current &&
          !companyTypeDropdownRef.current.contains(target)) {
        setShowCompanyTypeDropdown(false);
      }

      if (showCityDropdown &&
          cityTriggerRef.current &&
          !cityTriggerRef.current.contains(target) &&
          cityDropdownRef.current &&
          !cityDropdownRef.current.contains(target)) {
        setShowCityDropdown(false);
      }

      if (showStateDropdown &&
          stateTriggerRef.current &&
          !stateTriggerRef.current.contains(target) &&
          stateDropdownRef.current &&
          !stateDropdownRef.current.contains(target)) {
        setShowStateDropdown(false);
      }

      if (showYearDropdown &&
          yearTriggerRef.current &&
          !yearTriggerRef.current.contains(target) &&
          yearDropdownRef.current &&
          !yearDropdownRef.current.contains(target)) {
        setShowYearDropdown(false);
      }

      if (showCountryDropdownStep3 &&
          countryTriggerStep3Ref.current &&
          !countryTriggerStep3Ref.current.contains(target) &&
          countryDropdownStep3Ref.current &&
          !countryDropdownStep3Ref.current.contains(target)) {
        setShowCountryDropdownStep3(false);
      }

      if (showRoleTypeDropdown &&
          roleTypeTriggerRef.current &&
          !roleTypeTriggerRef.current.contains(target) &&
          roleTypeDropdownRef.current &&
          !roleTypeDropdownRef.current.contains(target)) {
        setShowRoleTypeDropdown(false);
      }

      if (showLocationDropdown &&
          locationTriggerRef.current &&
          !locationTriggerRef.current.contains(target) &&
          locationDropdownRef.current &&
          !locationDropdownRef.current.contains(target)) {
        setShowLocationDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showCountryDropdown, showReraTypeDropdown, showCompanyTypeDropdown, showCityDropdown, showStateDropdown, showYearDropdown, showCountryDropdownStep3, showRoleTypeDropdown, showLocationDropdown]);

  // Scroll to top when step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep, showCompanyDetailsForm]);

  // Fetch company types on component mount
  useEffect(() => {
    const loadCompanyTypes = async () => {
      try {
        setLoadingCompanyTypes(true);
        const types = await fetchCompanyTypes();
        setCompanyTypes(types);
      } catch (error) {
        console.error('Error fetching company types:', error);
      } finally {
        setLoadingCompanyTypes(false);
      }
    };
    loadCompanyTypes();
  }, []);

  // Fetch role types on component mount
  useEffect(() => {
    const loadRoleTypes = async () => {
      try {
        setLoadingRoleTypes(true);
        const types = await fetchRoleTypes();
        setRoleTypes(types);
      } catch (error) {
        console.error('Error fetching role types:', error);
      } finally {
        setLoadingRoleTypes(false);
      }
    };
    loadRoleTypes();
  }, []);

  // Fetch countries on component mount
  useEffect(() => {
    const loadCountries = async () => {
      try {
        setLoadingCountries(true);
        const countryList = await fetchCountries();
        console.log('Loaded countries:', countryList);
        console.log('Sample country structure:', countryList[0]);
        setCountries(countryList);
      } catch (error) {
        console.error('Error fetching countries:', error);
      } finally {
        setLoadingCountries(false);
      }
    };
    loadCountries();
  }, []);

  // Fetch existing onboarding data on mount
  useEffect(() => {
    const loadOnboardingData = async () => {
      if (!user?.user_id) {
        return;
      }

      try {
        const response = await fetchBuilderOnboarding(user.user_id);
        if (response.status && response.data) {
          const data = response.data;
          
          // Set current step based on API response
          if (data.current_step) {
            setCurrentStep(data.current_step);
          }

          // Prefill Step 1 data (Business Registration)
          if (data.business_registration) {
            const br = data.business_registration;
            setBusinessName(br.business_name || '');
            setGstNumber(br.govt_number || '');
            setReraIdType(br.govt_details?.rera_id_type || '');
            setReraId(br.govt_details?.rera_id || '');
            setCompanyCertFileUrl(br.govt_certificate || null);
            
            // Set country for step 1
            if (br.country_detail) {
              setSelectedCountry(br.country_detail.name || '');
              setSelectedCountryIdStep1(br.country || br.country_detail.id || '');
            }
          }

          // Prefill Step 2 data (Company Details)
          if (data.company_details) {
            const cd = data.company_details;
            setCompanyType(cd.company_type_detail?.name || '');
            setCompanyTypeId(cd.company_type || '');
            setYearOfEstablishment(cd.year?.toString() || '');
            setLogoFileUrl(cd.logo_url || null);
            setAddressLine1(cd.address_line1 || '');
            setAddressLine2(cd.address_line2 || '');
            setPostalCode(cd.postal_code || '');
            setCountryIdStep2(cd.country || '');
            
            // Set state and city
            if (cd.state_detail) {
              setState(cd.state_detail.name || '');
              setStateId(cd.state || '');
            }
            if (cd.city_detail) {
              setCity(cd.city_detail.name || '');
              setCityId(cd.city || '');
            }
            
            // Set country for step 2
            if (cd.country_detail) {
              setSelectedCountry(cd.country_detail.name || '');
              // Fetch state-city hierarchy for step 2
              if (cd.country) {
                try {
                  const hierarchy = await fetchStateCityHierarchy(cd.country);
                  setStateCityHierarchyStep2(hierarchy);
                } catch (error) {
                  console.error('Error fetching state-city hierarchy for step 2:', error);
                }
              }
            }
            
            // Show company details form if step 2 data exists
            if (data.current_step >= 2) {
              setShowCompanyDetailsForm(true);
            }
          }

          // Prefill Step 3 data (Service Locations)
          if (data.service_locations && Array.isArray(data.service_locations)) {
            const serviceLocations = data.service_locations.map((sl: any) => ({
              id: sl.id || Date.now().toString() + Math.random(),
              name: sl.project_name || '',
              location: sl.state_detail?.name || sl.city_detail?.name || '',
              reraId: '', // RERA ID is not in the API response for service locations
              locationType: sl.location_type || 'state',
              stateId: sl.state || null,
              cityId: sl.city || null,
              countryId: sl.country || '',
            }));
            setProjects(serviceLocations);
            
            // Set country for step 3 if there are service locations
            if (serviceLocations.length > 0 && serviceLocations[0].countryId) {
              setSelectedCountryId(serviceLocations[0].countryId);
              // Find and set country name from countries list
              const countryData = data.service_locations[0]?.country_detail;
              if (countryData) {
                setCountry(countryData.name || '');
              }
              // Fetch state-city hierarchy for step 3
              try {
                const hierarchy = await fetchStateCityHierarchy(serviceLocations[0].countryId);
                setStateCityHierarchy(hierarchy);
              } catch (error) {
                console.error('Error fetching state-city hierarchy for step 3:', error);
              }
            }
          }

          // Prefill Step 4 data (Contact Persons)
          if (data.contact_persons && Array.isArray(data.contact_persons)) {
            const contactPersons = data.contact_persons.map((cp: any) => ({
              id: cp.id || Date.now().toString() + Math.random(),
              name: cp.name || '',
              role: cp.role_type_detail?.name || '',
              roleTypeId: cp.role_type || '',
              contactNo: cp.contact_no || '',
              email: cp.email_id || '',
            }));
            setContacts(contactPersons);
          }
        }
      } catch (error) {
        console.error('Error fetching onboarding data:', error);
        // Don't show error toast, just log it - user might be starting fresh
      }
    };
    loadOnboardingData();
  }, [user?.user_id]);

  // Fetch state-city hierarchy when country is selected in step 3
  useEffect(() => {
    const loadStateCityHierarchy = async () => {
      console.log('useEffect triggered for selectedCountryId:', selectedCountryId);
      
      if (!selectedCountryId || selectedCountryId.trim() === '') {
        console.log('No country ID, clearing state-city hierarchy');
        setStateCityHierarchy(null);
        setNewProjectLocation('');
        setLoadingStateCity(false);
        return;
      }

      try {
        console.log('Fetching state-city hierarchy for country ID:', selectedCountryId);
        setLoadingStateCity(true);
        const hierarchy = await fetchStateCityHierarchy(selectedCountryId);
        console.log('State-city hierarchy loaded successfully:', hierarchy);
        setStateCityHierarchy(hierarchy);
      } catch (error) {
        console.error('Error fetching state-city hierarchy:', error);
        setStateCityHierarchy(null);
      } finally {
        setLoadingStateCity(false);
      }
    };
    loadStateCityHierarchy();
  }, [selectedCountryId]);

  const handleBack = () => {
    // If on Company Details form (step 2), go back to initial step 2 form
    if (currentStep === 2 && showCompanyDetailsForm) {
      setShowCompanyDetailsForm(false);
      return;
    }
    
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate(-1);
    }
  };

  // Submit step 1 data (Company & Compliance Details)
  const submitStep1 = async (): Promise<boolean> => {
    if (!user?.user_id) {
      showGlobalToast('User not authenticated');
      return false;
    }

    // Use stored country ID from step 1
    if (!selectedCountryIdStep1) {
      showGlobalToast('Please select a country');
      return false;
    }

    if (!businessName || !gstNumber || !companyCertFileUrl) {
      showGlobalToast('Please fill all required fields');
      return false;
    }

    try {
      setSubmitting(true);
      const data = {
        step: 1 as const,
        user_id: user.user_id,
        country_id: selectedCountryIdStep1,
        business_name: businessName,
        govt_number: gstNumber,
        number_type: 'GST',
        govt_certificate: companyCertFileUrl,
        govt_details: {
          rera_id_type: reraIdType || 'Company level',
          rera_id: reraId || '',
        },
      };

      await submitBuilderOnboarding(data);
      showGlobalToast('Step 1 data saved successfully');
      return true;
    } catch (error: any) {
      console.error('Error submitting step 1:', error);
      showGlobalToast(error?.message || 'Failed to save step 1 data');
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  // Submit step 2 data (Company Details)
  const submitStep2 = async (): Promise<boolean> => {
    if (!user?.user_id) {
      showGlobalToast('User not authenticated');
      return false;
    }

    if (!companyTypeId || !logoFileUrl || !addressLine1 || !cityId || !stateId || !countryIdStep2 || !postalCode || !yearOfEstablishment) {
      showGlobalToast('Please fill all required fields');
      return false;
    }

    try {
      setSubmitting(true);
      const data = {
        step: 2 as const,
        user_id: user.user_id,
        company_type_id: companyTypeId,
        year: parseInt(yearOfEstablishment),
        logo_url: logoFileUrl,
        address_line1: addressLine1,
        address_line2: addressLine2 || undefined,
        city_id: cityId,
        state_id: stateId,
        country_id: countryIdStep2,
        postal_code: postalCode,
      };

      await submitBuilderOnboarding(data);
      showGlobalToast('Step 2 data saved successfully');
      return true;
    } catch (error: any) {
      console.error('Error submitting step 2:', error);
      showGlobalToast(error?.message || 'Failed to save step 2 data');
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  // Submit step 3 data (Service Geography)
  const submitStep3 = async (): Promise<boolean> => {
    if (!user?.user_id) {
      showGlobalToast('User not authenticated');
      return false;
    }

    if (projects.length === 0) {
      showGlobalToast('Please add at least one project');
      return false;
    }

    try {
      setSubmitting(true);
      const serviceLocations = projects.map((project) => ({
        country_id: project.countryId || selectedCountryId,
        project_name: project.name,
        location_type: project.locationType || 'state',
        state_id: project.locationType === 'city' ? null : (project.stateId || null),
        city_id: project.locationType === 'city' ? (project.cityId || null) : null,
      }));

      const data = {
        step: 3 as const,
        user_id: user.user_id,
        no_of_service_locations: projects.length,
        service_locations: serviceLocations,
      };

      await submitBuilderOnboarding(data);
      showGlobalToast('Step 3 data saved successfully');
      return true;
    } catch (error: any) {
      console.error('Error submitting step 3:', error);
      showGlobalToast(error?.message || 'Failed to save step 3 data');
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  // Submit step 4 data (Authorized Contacts)
  const submitStep4 = async (): Promise<boolean> => {
    if (!user?.user_id) {
      showGlobalToast('User not authenticated');
      return false;
    }

    if (contacts.length === 0) {
      showGlobalToast('Please add at least one contact');
      return false;
    }

    try {
      setSubmitting(true);
      const contactPersons = contacts.map((contact) => ({
        name: contact.name,
        role_type_id: contact.roleTypeId || '',
        contact_no: contact.contactNo,
        email_id: contact.email,
      }));

      const data = {
        step: 4 as const,
        user_id: user.user_id,
        contact_persons: contactPersons,
      };

      await submitBuilderOnboarding(data);
      showGlobalToast('Step 4 data saved successfully');
      return true;
    } catch (error: any) {
      console.error('Error submitting step 4:', error);
      showGlobalToast(error?.message || 'Failed to save step 4 data');
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = async () => {
    // For step 2, show Company Details form first, then go to step 3
    if (currentStep === 2 && !showCompanyDetailsForm) {
      // Submit step 1 data before showing step 2 form
      const success = await submitStep1();
      if (success) {
      setShowCompanyDetailsForm(true);
      }
      return;
    }

    // Submit data before moving to next step
    if (currentStep === 2 && showCompanyDetailsForm) {
      const success = await submitStep2();
      if (success && currentStep < STEPS.length) {
        setCurrentStep(currentStep + 1);
      }
      return;
    }

    if (currentStep === 3) {
      const success = await submitStep3();
      if (success && currentStep < STEPS.length) {
        setCurrentStep(currentStep + 1);
      }
      return;
    }

    if (currentStep === 4) {
      const success = await submitStep4();
      if (success && currentStep < STEPS.length) {
        setCurrentStep(currentStep + 1);
      }
      return;
    }
    
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSkip = () => {
    handleNext();
  };

  const handleAddProject = () => {
    if (newProjectName && newProjectLocation && selectedCountryId) {
      setProjects([...projects, {
        id: Date.now().toString(),
        name: newProjectName,
        location: newProjectLocation,
        reraId: '',
        locationType: selectedLocationType || 'state',
        stateId: selectedLocationStateId || null,
        cityId: selectedLocationCityId || null,
        countryId: selectedCountryId,
      }]);
      setNewProjectName('');
      setNewProjectLocation('');
      setSelectedLocationType(null);
      setSelectedLocationStateId(null);
      setSelectedLocationCityId(null);
    }
  };

  const handleRemoveProject = (id: string) => {
    setProjects(projects.filter(p => p.id !== id));
  };

  const handleAddContact = () => {
    if (newContact.name && newContact.role && newContact.roleTypeId && newContact.contactNo && newContact.email) {
      setContacts([...contacts, {
        id: Date.now().toString(),
        ...newContact,
      }]);
      setNewContact({ name: '', role: '', roleTypeId: '', contactNo: '', email: '' });
    }
  };

  const handleRemoveContact = (id: string) => {
    setContacts(contacts.filter(c => c.id !== id));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return null; // Account creation is already done
      case 2:
        // Show Company Details form if step 2 has been saved
        if (showCompanyDetailsForm) {
          return (
            <div className="space-y-6">
              {/* Notification Banners */}
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                <Check size={20} className="text-green-600 flex-shrink-0" />
                <p className="text-sm text-green-800">
                  Your GSTIN are verified, please proceed with RERA and License details
                </p>
              </div>
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                <span className="text-red-600 text-xl flex-shrink-0">⚠</span>
                <p className="text-sm text-red-800">
                  You are considered as Non-registered company and add required details
                </p>
              </div>

              {/* Company Details Form - Two Columns */}
              <div className="grid grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">
                      Company Type
                    </label>
                    <div className="relative">
                      <button
                        ref={companyTypeTriggerRef}
                        type="button"
                        onClick={() => setShowCompanyTypeDropdown((open) => !open)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-700 bg-white text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-[#16634a]"
                      >
                        <span className={companyType ? '' : 'text-gray-400'}>{companyType || 'Select Company Type'}</span>
                        <span className="ml-2 text-gray-400 text-xs">▼</span>
                      </button>
                      {showCompanyTypeDropdown && (
                        <div ref={companyTypeDropdownRef} className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-56 overflow-y-auto">
                          {loadingCompanyTypes ? (
                            <div className="px-4 py-2 text-sm text-gray-500">Loading...</div>
                          ) : companyTypes.length > 0 ? (
                            companyTypes.map((type) => (
                            <button
                                key={type.id}
                              type="button"
                              onClick={() => {
                                  setCompanyType(type.name);
                                  setCompanyTypeId(type.id);
                                setShowCompanyTypeDropdown(false);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-gray-800 hover:bg-[#f3fdfa]"
                            >
                                {type.name}
                            </button>
                            ))
                          ) : (
                            <div className="px-4 py-2 text-sm text-gray-500">No company types available</div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#16634a]"
                    />
                  </div>

                  <div className="mt-[24px]">
                    <label className="block text-sm font-bold text-gray-900 mb-2">
                      Address line 1
                    </label>
                    <input
                      type="text"
                      value={addressLine1}
                      onChange={(e) => setAddressLine1(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#16634a]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">
                      City
                    </label>
                    <div className="relative">
                      <button
                        ref={cityTriggerRef}
                        type="button"
                        onClick={() => setShowCityDropdown((open) => !open)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-700 bg-white text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-[#16634a]"
                      >
                        <span className={city ? '' : 'text-gray-400'}>{city || 'Select City'}</span>
                        <span className="ml-2 text-gray-400 text-xs">▼</span>
                      </button>
                      {showCityDropdown && (
                        <div ref={cityDropdownRef} className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-56 overflow-y-auto">
                          {stateCityHierarchyStep2 && stateCityHierarchyStep2.states.length > 0 ? (
                            stateCityHierarchyStep2.states.flatMap((state) =>
                              state.cities.map((city) => (
                            <button
                                  key={city.id}
                              type="button"
                              onClick={() => {
                                    setCity(city.name);
                                    setCityId(city.id);
                                setShowCityDropdown(false);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-gray-800 hover:bg-[#f3fdfa]"
                            >
                                  {city.name}
                            </button>
                              ))
                            )
                          ) : (
                            <div className="px-4 py-2 text-sm text-gray-500">Select country first to load cities</div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">
                      Country
                    </label>
                    <div className="relative">
                      <button
                        ref={countryTriggerRef}
                        type="button"
                        onClick={() => setShowCountryDropdown((open) => !open)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-700 bg-white text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-[#16634a]"
                      >
                        <span className={selectedCountry ? '' : 'text-gray-400'}>{selectedCountry || 'Select Country'}</span>
                        <span className="ml-2 text-gray-400 text-xs">▼</span>
                      </button>
                      {showCountryDropdown && (
                        <div ref={countryDropdownRef} className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-56 overflow-y-auto">
                          {loadingCountries ? (
                            <div className="px-4 py-2 text-sm text-gray-500">Loading...</div>
                          ) : countries.length > 0 ? (
                            countries.map((country) => (
                            <button
                                key={country.country_code || country.code || country.country}
                              type="button"
                              onClick={async () => {
                                  setSelectedCountry(country.country);
                                  // Store country ID for step 2
                                  const countryIdValue = country.id || 
                                                        (country as any)?._id || 
                                                        (country as any)?.countryId || 
                                                        (country as any)?.country_id ||
                                                        '';
                                  if (countryIdValue) {
                                    setCountryIdStep2(countryIdValue);
                                    // Fetch state-city hierarchy for step 2
                                    try {
                                      const hierarchy = await fetchStateCityHierarchy(countryIdValue);
                                      setStateCityHierarchyStep2(hierarchy);
                                    } catch (error) {
                                      console.error('Error fetching state-city hierarchy for step 2:', error);
                                    }
                                  }
                                setShowCountryDropdown(false);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-gray-800 hover:bg-[#f3fdfa]"
                            >
                                {country.country}
                            </button>
                            ))
                          ) : (
                            <div className="px-4 py-2 text-sm text-gray-500">No countries available</div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">
                      Year of establishment
                    </label>
                    <div className="relative">
                      <button
                        ref={yearTriggerRef}
                        type="button"
                        onClick={() => setShowYearDropdown((open) => !open)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-700 bg-white text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-[#16634a]"
                      >
                        <span className={yearOfEstablishment ? '' : 'text-gray-400'}>{yearOfEstablishment || 'Select Year'}</span>
                        <span className="ml-2 text-gray-400 text-xs">▼</span>
                      </button>
                      {showYearDropdown && (
                        <div ref={yearDropdownRef} className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-56 overflow-y-auto">
                          {Array.from({ length: 30 }, (_, i) => 2024 - i).map((year) => (
                            <button
                              key={year}
                              type="button"
                              onClick={() => {
                                setYearOfEstablishment(year.toString());
                                setShowYearDropdown(false);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-gray-800 hover:bg-[#f3fdfa]"
                            >
                              {year}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <label className="block text-sm font-bold text-gray-900 mb-2">
                      Logo
                    </label>
                    <div>
                      <input
                        type="file"
                        ref={logoFileInputRef}
                        accept="image/png,image/jpeg,image/jpg"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            // Validate file format and size
                            const validation = validateFile(file, ['.png', '.jpg', '.jpeg'], 1048576); // 1 MB
                            if (!validation.valid) {
                              showGlobalToast(validation.error || 'Invalid file');
                              e.target.value = ''; // Clear the input
                              return;
                            }

                            setLogoFile(file);
                            setUploadingLogo(true);
                            setLogoUploadProgress(0);
                            
                            try {
                              const url = await uploadFile(
                                file,
                                'builder/onboarding/logo',
                                (progress) => {
                                  setLogoUploadProgress(progress);
                                }
                              );
                              if (url) {
                                setLogoFileUrl(url);
                                showGlobalToast('Logo uploaded successfully');
                              } else {
                                showGlobalToast('Failed to upload logo. Please try again.');
                                setLogoFile(null);
                                setLogoUploadProgress(0);
                              }
                            } catch (error) {
                              console.error('Error uploading logo:', error);
                              showGlobalToast('Error uploading logo. Please try again.');
                              setLogoFile(null);
                              setLogoUploadProgress(0);
                            } finally {
                              setUploadingLogo(false);
                            }
                          }
                        }}
                      />
                      <div className="space-y-2">
                      <div className="border border-gray-300 rounded-lg px-4 py-2 flex items-center justify-between h-10">
                          <p className="text-sm text-gray-400">
                            {uploadingLogo ? `Uploading... ${logoUploadProgress}%` : logoFile ? logoFile.name : 'Upload or drag file here !'}
                          </p>
                        <button
                          type="button"
                          onClick={() => logoFileInputRef.current?.click()}
                            disabled={uploadingLogo}
                            className="px-3 py-1 text-white rounded text-xs font-semibold flex-shrink-0 h-6 disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{
                            background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)'
                          }}
                        >
                            {uploadingLogo ? 'Uploading...' : 'Upload'}
                        </button>
                        </div>
                        {uploadingLogo && (
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="h-2 rounded-full transition-all duration-300"
                              style={{
                                width: `${logoUploadProgress}%`,
                                background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)'
                              }}
                            />
                          </div>
                        )}
                      </div>
                      <p className="text-xs mt-1" style={{ color: '#16634a' }}>
                        Upload only PNG / JPEG image, maximum size upto 1 MB
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">
                      Address line 2
                    </label>
                    <input
                      type="text"
                      value={addressLine2}
                      onChange={(e) => setAddressLine2(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#16634a]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">
                      State
                    </label>
                    <div className="relative">
                      <button
                        ref={stateTriggerRef}
                        type="button"
                        onClick={() => setShowStateDropdown((open) => !open)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-700 bg-white text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-[#16634a]"
                      >
                        <span className={state ? '' : 'text-gray-400'}>{state || 'Select State'}</span>
                        <span className="ml-2 text-gray-400 text-xs">▼</span>
                      </button>
                      {showStateDropdown && (
                        <div ref={stateDropdownRef} className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-56 overflow-y-auto">
                          {stateCityHierarchyStep2 && stateCityHierarchyStep2.states.length > 0 ? (
                            stateCityHierarchyStep2.states.map((stateOption) => (
                            <button
                                key={stateOption.id}
                              type="button"
                              onClick={() => {
                                  setState(stateOption.name);
                                  setStateId(stateOption.id);
                                setShowStateDropdown(false);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-gray-800 hover:bg-[#f3fdfa]"
                            >
                                {stateOption.name}
                            </button>
                            ))
                          ) : (
                            <div className="px-4 py-2 text-sm text-gray-500">Select country first to load states</div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#16634a]"
                    />
                  </div>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start gap-2 text-sm text-gray-700">
                <input type="checkbox" className="mt-1" />
                <span>
                  By clicking on "Agree and continue", you agree to the{' '}
                  <a href="#" className="text-blue-600 underline">Vistaview Inc. Services Business Solutions Agreement</a> and{' '}
                  <a href="#" className="text-blue-600 underline">Vistaview Inc.'s Privacy Notice</a>.
                </span>
              </div>
            </div>
          );
        }

        // Initial step 2 form
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Where is your business registered ?
              </label>
              <div className="relative">
                <button
                  ref={countryTriggerRef}
                  type="button"
                  onClick={() => setShowCountryDropdown((open) => !open)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-700 bg-white text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-[#16634a]"
                >
                  <span className={selectedCountry ? '' : 'text-gray-400'}>{selectedCountry || 'Select Country'}</span>
                  <span className="ml-2 text-gray-400 text-xs">▼</span>
                </button>

                {showCountryDropdown && (
                  <div ref={countryDropdownRef} className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-56 overflow-y-auto">
                    {loadingCountries ? (
                      <div className="px-4 py-2 text-sm text-gray-500">Loading...</div>
                    ) : countries.length > 0 ? (
                      countries.map((country) => (
                      <button
                          key={country.country_code || country.code || country.country}
                        type="button"
                          onClick={async () => {
                            setSelectedCountry(country.country);
                            // Store country ID for step 1
                            const countryIdValue = country.id || 
                                                  (country as any)?._id || 
                                                  (country as any)?.countryId || 
                                                  (country as any)?.country_id ||
                                                  '';
                            if (countryIdValue) {
                              setSelectedCountryIdStep1(countryIdValue);
                              // Also fetch state-city hierarchy for step 2
                              try {
                                const hierarchy = await fetchStateCityHierarchy(countryIdValue);
                                setStateCityHierarchyStep2(hierarchy);
                                setCountryIdStep2(countryIdValue);
                              } catch (error) {
                                console.error('Error fetching state-city hierarchy for step 2:', error);
                              }
                            }
                          setShowCountryDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-800 hover:bg-[#f3fdfa]"
                      >
                          {country.country}
                      </button>
                      ))
                    ) : (
                      <div className="px-4 py-2 text-sm text-gray-500">No countries available</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Business name, used to register with your government
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#16634a]"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                GST Number (Optional)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={gstNumber}
                  onChange={(e) => setGstNumber(e.target.value)}
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#16634a]"
                />
                {gstVerified && (
                  <button
                    type="button"
                    className="px-3 py-2 bg-green-600 text-white text-xs font-semibold rounded-lg flex items-center gap-1"
                    style={{
                      background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)'
                    }}
                  >
                    <Check size={14} className="text-white" />
                    Verified
                  </button>
                )}
              </div>
              {gstVerified && gstNumber && (
                <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700">
                  <div className="font-semibold mb-1">{businessName}</div>
                  <div className="mb-1">GST: {gstNumber}</div>
                  <div>Plot No. 32, G Floor, Brindhavan Colony, N/r Rajapushpa Regalia, Gandipet, Gandipet Road, K.v.Rangareddy, Rajendra Nagar, Telangana, India, 500075</div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Upload Company Registration certificate
              </label>
              <input
                type="file"
                ref={companyCertFileInputRef}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    // Validate file format and size
                    const validation = validateFile(file, ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'], 10485760); // 10 MB
                    if (!validation.valid) {
                      showGlobalToast(validation.error || 'Invalid file');
                      e.target.value = ''; // Clear the input
                      return;
                    }

                    setCompanyCertFile(file);
                    setUploadingCert(true);
                    setCertUploadProgress(0);
                    
                    try {
                      const url = await uploadFile(
                        file,
                        'builder/onboarding/certificates',
                        (progress) => {
                          setCertUploadProgress(progress);
                        }
                      );
                      if (url) {
                        setCompanyCertFileUrl(url);
                        showGlobalToast('Certificate uploaded successfully');
                      } else {
                        showGlobalToast('Failed to upload certificate. Please try again.');
                        setCompanyCertFile(null);
                        setCertUploadProgress(0);
                      }
                    } catch (error) {
                      console.error('Error uploading certificate:', error);
                      showGlobalToast('Error uploading certificate. Please try again.');
                      setCompanyCertFile(null);
                      setCertUploadProgress(0);
                    } finally {
                      setUploadingCert(false);
                    }
                  }
                }}
              />
              <div className="space-y-2">
              <div className="border border-gray-300 rounded-lg px-4 py-2 flex items-center justify-between h-10">
                  <p className="text-sm text-gray-400">
                    {uploadingCert ? `Uploading... ${certUploadProgress}%` : companyCertFile ? companyCertFile.name : 'Upload or drag file here !'}
                  </p>
                <button 
                  type="button"
                  onClick={() => companyCertFileInputRef.current?.click()}
                    disabled={uploadingCert}
                    className="px-3 py-1 text-white rounded text-xs font-semibold flex-shrink-0 h-6 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)'
                  }}
                >
                    {uploadingCert ? 'Uploading...' : 'Upload'}
                </button>
                </div>
                {uploadingCert && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${certUploadProgress}%`,
                        background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)'
                      }}
                    />
                  </div>
                )}
              </div>
              <p className="text-xs mt-1" style={{ color: '#16634a' }}>
                Allowed extensions: pdf, jpg, png, doc. Maximum file size: 10 MB
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                RERA Id Type
              </label>
              <div className="relative">
                <button
                  ref={reraTypeTriggerRef}
                  type="button"
                  onClick={() => setShowReraTypeDropdown((open) => !open)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-700 bg-white text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-[#16634a]"
                >
                  <span className={reraIdType ? '' : 'text-gray-400'}>{reraIdType || 'Select RERA Id Type'}</span>
                  <span className="ml-2 text-gray-400 text-xs">▼</span>
                </button>

                {showReraTypeDropdown && (
                  <div ref={reraTypeDropdownRef} className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-56 overflow-y-auto">
                    {['Company Level', 'Project Level'].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => {
                          setReraIdType(type);
                          setShowReraTypeDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-800 hover:bg-[#f3fdfa]"
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                RERA Id
              </label>
              <input
                type="text"
                value={reraId}
                onChange={(e) => setReraId(e.target.value)}
                placeholder="Enter value"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#16634a]"
              />
            </div>

            <div className="flex items-start gap-2 text-sm text-gray-700">
              <input type="checkbox" className="mt-1" />
              <span>
                By clicking on "Agree and continue", you agree to the{' '}
                <a href="#" className="text-blue-600 underline">Vistaview Inc. Services Business Solutions Agreement</a> and{' '}
                <a href="#" className="text-blue-600 underline">Vistaview Inc.'s Privacy Notice</a>.
              </span>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  No. of Service locations
                </label>
                <input
                  type="number"
                  value={serviceLocations}
                  onChange={(e) => setServiceLocations(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#16634a]"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Country
                </label>
                <div className="relative">
                  <button
                    ref={countryTriggerStep3Ref}
                    type="button"
                    onClick={() => setShowCountryDropdownStep3((open) => !open)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-700 bg-white text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-[#16634a]"
                  >
                    <span className={country ? '' : 'text-gray-400'}>{country || 'Select Country'}</span>
                    <span className="ml-2 text-gray-400 text-xs">▼</span>
                  </button>
                  {showCountryDropdownStep3 && (
                    <div ref={countryDropdownStep3Ref} className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-56 overflow-y-auto">
                      {loadingCountries ? (
                        <div className="px-4 py-2 text-sm text-gray-500">Loading...</div>
                      ) : countries.length > 0 ? (
                        countries.map((countryOption) => {
                          // Try to get country ID from various possible fields
                          const countryId = countryOption.id || 
                                          (countryOption as any)._id || 
                                          (countryOption as any).countryId || 
                                          (countryOption as any).country_id ||
                                          (countryOption as any).uuid ||
                                          '';
                          
                          return (
                        <button
                              key={countryOption.country_code || countryOption.code || countryOption.country}
                          type="button"
                          onClick={() => {
                                setCountry(countryOption.country);
                                // Clear previous location when country changes
                                setNewProjectLocation('');
                                setLocationSearchQuery('');
                                setStateCityHierarchy(null);
                                
                                // Set country ID for fetching state-city hierarchy
                                console.log('Selected country:', countryOption.country, 'Full object:', countryOption, 'Extracted ID:', countryId);
                                
                                if (countryId && countryId.trim() !== '') {
                                  console.log('Setting country ID:', countryId);
                                  setSelectedCountryId(countryId);
                                } else {
                                  console.warn('Country ID not found in object, trying to find in countries list');
                                  // Try to find the country in the list by name to get its ID
                                  const foundCountry = countries.find(c => c.country === countryOption.country);
                                  const foundId = foundCountry?.id || 
                                                 (foundCountry as any)?._id || 
                                                 (foundCountry as any)?.countryId || 
                                                 (foundCountry as any)?.country_id ||
                                                 (foundCountry as any)?.uuid;
                                  
                                  if (foundId && foundId.trim() !== '') {
                                    console.log('Found country ID by name lookup:', foundId);
                                    setSelectedCountryId(foundId);
                                  } else {
                                    console.error('Could not find country ID. Country object:', countryOption);
                                    // Still try to set it - maybe the API will work with empty or we need to handle differently
                                    setSelectedCountryId('');
                                  }
                                }
                            setShowCountryDropdownStep3(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-800 hover:bg-[#f3fdfa]"
                        >
                              {countryOption.country}
                        </button>
                          );
                        })
                      ) : (
                        <div className="px-4 py-2 text-sm text-gray-500">No countries available</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Project Name
                </label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="Search location / Region / City"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#16634a]"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Location / Region
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <button
                      ref={locationTriggerRef}
                      type="button"
                      onClick={() => {
                        console.log('Location dropdown clicked. selectedCountryId:', selectedCountryId, 'country:', country);
                        if (selectedCountryId || country) {
                          setShowLocationDropdown((open) => !open);
                        }
                      }}
                      disabled={(!selectedCountryId || selectedCountryId.trim() === '') && !country}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-700 bg-white text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-[#16634a] disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <span className={newProjectLocation ? '' : 'text-gray-400'}>
                        {newProjectLocation || (selectedCountryId || country ? (loadingStateCity ? 'Loading locations...' : 'Select State or City') : 'Select Country first')}
                      </span>
                      <span className="ml-2 text-gray-400 text-xs">▼</span>
                    </button>
                    {showLocationDropdown && (selectedCountryId || country) && (
                      <div ref={locationDropdownRef} className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 flex flex-col">
                        {/* Search input */}
                        <div className="p-2 border-b border-gray-200 sticky top-0 bg-white">
                  <input
                    type="text"
                            value={locationSearchQuery}
                            onChange={(e) => setLocationSearchQuery(e.target.value)}
                            placeholder="Search state or city..."
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#16634a]"
                            onClick={(e) => e.stopPropagation()}
                            autoFocus
                          />
                        </div>
                        {/* Results */}
                        <div className="overflow-y-auto max-h-56">
                          {loadingStateCity ? (
                            <div className="px-4 py-2 text-sm text-gray-500">Loading...</div>
                          ) : stateCityHierarchy && stateCityHierarchy.states.length > 0 ? (() => {
                            // Filter states and cities based on search query
                            const searchLower = locationSearchQuery.toLowerCase().trim();
                            const filteredStates = stateCityHierarchy.states
                              .map((state) => {
                                const stateMatches = !searchLower || state.name.toLowerCase().includes(searchLower);
                                const filteredCities = state.cities?.filter((city) =>
                                  !searchLower || city.name.toLowerCase().includes(searchLower)
                                ) || [];
                                const hasMatchingCities = filteredCities.length > 0;
                                
                                // Include state if it matches or has matching cities
                                if (stateMatches || hasMatchingCities) {
                                  return {
                                    ...state,
                                    cities: stateMatches ? state.cities : filteredCities,
                                  };
                                }
                                return null;
                              })
                              .filter((state): state is State => state !== null);
                            
                            if (filteredStates.length === 0) {
                              return (
                                <div className="px-4 py-2 text-sm text-gray-500">No locations found</div>
                              );
                            }
                            
                            return filteredStates.map((state) => (
                              <div key={state.id}>
                                {/* State option */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setNewProjectLocation(state.name);
                                    setSelectedLocationType('state');
                                    setSelectedLocationStateId(state.id);
                                    setSelectedLocationCityId(null);
                                    setShowLocationDropdown(false);
                                    setLocationSearchQuery('');
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-[#f3fdfa] border-b border-gray-100"
                                >
                                  {state.name}
                                </button>
                                {/* Cities under this state */}
                                {state.cities && state.cities.length > 0 && state.cities.map((city) => (
                                  <button
                                    key={city.id}
                                    type="button"
                                    onClick={() => {
                                      setNewProjectLocation(city.name);
                                      setSelectedLocationType('city');
                                      setSelectedLocationCityId(city.id);
                                      setSelectedLocationStateId(null);
                                      setShowLocationDropdown(false);
                                      setLocationSearchQuery('');
                                    }}
                                    className="w-full text-left px-8 py-2 text-sm text-gray-700 hover:bg-[#f3fdfa]"
                                  >
                                    {city.name}
                                  </button>
                                ))}
                              </div>
                            ));
                          })() : (
                            <div className="px-4 py-2 text-sm text-gray-500">No locations available</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={handleAddProject}
                    className="px-4 py-2 text-white rounded-lg text-sm font-semibold"
                    style={{
                      background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)'
                    }}
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {projects.map((project) => (
                <div key={project.id} className="border border-gray-300 rounded-lg p-4 relative" style={{ background: 'rgba(240, 240, 240, 1)' }}>
                  <button
                    onClick={() => handleRemoveProject(project.id)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={16} />
                  </button>
                  <div className="font-semibold text-sm text-gray-900 mb-1">{project.name}</div>
                  <div className="text-xs text-gray-600 mb-2">{project.location}</div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Project RERA Id</label>
                    <input
                      type="text"
                      value={project.reraId}
                      onChange={(e) => {
                        setProjects(projects.map(p => p.id === project.id ? { ...p, reraId: e.target.value } : p));
                      }}
                      placeholder="Enter value"
                      className="w-full border border-gray-300 rounded px-2 py-1 text-xs text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-[#16634a]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Add your contact</h3>
              <p className="text-sm text-gray-600">
                Designated builder representatives with role-based access (Admin, Sales, Finance, Support) authorized to manage profile, compliance, communications, and platform interactions.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Name</label>
                <input
                  type="text"
                  value={newContact.name}
                  onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#16634a]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Role Type</label>
                <div className="relative">
                  <button
                    ref={roleTypeTriggerRef}
                    type="button"
                    onClick={() => setShowRoleTypeDropdown((open) => !open)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-700 bg-white text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-[#16634a]"
                  >
                    <span className={newContact.role ? '' : 'text-gray-400'}>{newContact.role || 'Select Role Type'}</span>
                    <span className="ml-2 text-gray-400 text-xs">▼</span>
                  </button>
                  {showRoleTypeDropdown && (
                    <div ref={roleTypeDropdownRef} className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-56 overflow-y-auto">
                      {loadingRoleTypes ? (
                        <div className="px-4 py-2 text-sm text-gray-500">Loading...</div>
                      ) : roleTypes.length > 0 ? (
                        roleTypes.map((role) => (
                        <button
                            key={role.id}
                          type="button"
                          onClick={() => {
                              setNewContact({ ...newContact, role: role.name, roleTypeId: role.id });
                            setShowRoleTypeDropdown(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-800 hover:bg-[#f3fdfa]"
                        >
                            {role.name}
                        </button>
                        ))
                      ) : (
                        <div className="px-4 py-2 text-sm text-gray-500">No role types available</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Contact No.</label>
                <input
                  type="tel"
                  value={newContact.contactNo}
                  onChange={(e) => setNewContact({ ...newContact, contactNo: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#16634a]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Email Id</label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={newContact.email}
                    onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                    placeholder="Enter email id"
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#16634a]"
                  />
                  <button
                    onClick={handleAddContact}
                    className="px-4 py-2 bg-[#16634a] text-white rounded-lg text-sm font-semibold"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {contacts.map((contact) => (
                <div key={contact.id} className="border border-gray-300 rounded-lg p-4 relative" style={{ background: 'rgba(240, 240, 240, 1)' }}>
                  <button
                    onClick={() => handleRemoveContact(contact.id)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={16} />
                  </button>
                  <div className="font-semibold text-sm text-gray-900">{contact.name}</div>
                  <div className="text-xs text-gray-600">Role: {contact.role}</div>
                  <div className="text-xs text-gray-600">Contact No.: {contact.contactNo}</div>
                  <div className="text-xs text-gray-600">Email: {contact.email}</div>
                </div>
              ))}
            </div>
          </div>
        );

      case 5:
        // Build full address string
        const addressParts = [
          addressLine1,
          addressLine2,
          city,
          state,
          selectedCountry,
          postalCode
        ].filter(Boolean);
        const fullAddress = addressParts.join(', ');

        return (
          <div className="space-y-6">
            {/* Two Column Layout */}
            <div className="grid grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Builder Name Section */}
                <div className="border-b border-gray-200 pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Builder name</h3>
                    <button 
                      onClick={() => {
                        setCurrentStep(2);
                        setShowCompanyDetailsForm(false);
                      }}
                      className="flex items-center gap-1 text-[#16634a] text-sm font-semibold border border-[#16634a] px-3 py-1 rounded"
                    >
                      <Edit2 size={16} />
                      Update
                    </button>
                  </div>
                  <div className="p-4 rounded-lg border border-gray-300" style={{ background: 'rgba(240, 240, 240, 1)' }}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="text-sm font-semibold text-gray-900">{businessName || 'N/A'}</div>
                      <div className="text-sm font-semibold text-gray-900">GST : {gstNumber || 'N/A'}</div>
                    </div>
                    <div className="text-sm text-gray-700">{fullAddress || 'No address provided'}</div>
                  </div>
                </div>

                {/* Service Locations (Projects) Section */}
                <div className="border-b border-gray-200 pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Service Locations</h3>
                    <button 
                      onClick={() => setCurrentStep(3)}
                      className="flex items-center gap-1 text-[#16634a] text-sm font-semibold border border-[#16634a] px-3 py-1 rounded"
                    >
                      <Edit2 size={16} />
                      Update
                    </button>
                  </div>
                  <div className="space-y-3">
                    {projects.map((project) => {
                      // Build location string: project name, location, state
                      let locationString = project.name;
                      if (project.location) {
                        locationString += `, ${project.location}`;
                      }
                      // Add state if available
                      if (project.locationType === 'state' && stateCityHierarchy) {
                        const selectedState = stateCityHierarchy.states.find(s => s.id === project.stateId);
                        if (selectedState && selectedState.name !== project.location) {
                          locationString += `, ${selectedState.name}`;
                        }
                      } else if (project.locationType === 'city' && stateCityHierarchy) {
                        const selectedCity = stateCityHierarchy.states
                          .flatMap(s => s.cities.map(c => ({ ...c, stateName: s.name })))
                          .find(c => c.id === project.cityId);
                        if (selectedCity && selectedCity.stateName) {
                          locationString += `, ${selectedCity.stateName}`;
                        }
                      }

                      return (
                        <div key={project.id} className="p-4 rounded-lg border border-gray-300 relative" style={{ background: 'rgba(240, 240, 240, 1)' }}>
                          <button
                            onClick={() => handleRemoveProject(project.id)}
                            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                          >
                            <X size={16} />
                          </button>
                          <div className="text-sm font-semibold text-gray-900 mb-1">{locationString || project.name}</div>
                          <div className="text-xs text-gray-600">Project RERA Id: {project.reraId || '-'}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Column - Authorized Contacts */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Authorized Contacts</h3>
                  <button 
                    onClick={() => setCurrentStep(4)}
                    className="flex items-center gap-1 text-[#16634a] text-sm font-semibold border border-[#16634a] px-3 py-1 rounded"
                  >
                    <Edit2 size={16} />
                    Update
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {contacts.map((contact) => (
                    <div key={contact.id} className="p-4 rounded-lg border border-gray-300 relative" style={{ background: 'rgba(240, 240, 240, 1)' }}>
                      <button
                        onClick={() => handleRemoveContact(contact.id)}
                        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                      >
                        <X size={16} />
                      </button>
                      <div className="text-sm font-semibold text-gray-900 mb-1 break-words">{contact.name}</div>
                      <div className="text-xs text-gray-600 break-words">{contact.role}</div>
                      <div className="text-xs text-gray-600 break-words">{contact.contactNo}</div>
                      <div className="text-xs text-gray-600 break-words">{contact.email}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Message */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-700">
                Your builder account will be activated once the verification process is completed.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Show verification status page if submitted
  if (verificationSubmitted) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        {/* Full width header section close to navbar */}
        <div className="w-full bg-white pt-4 pb-6">
          <div className="w-full px-6 md:px-8 relative flex items-start">
            {/* Left side: Back Button and Builder Information */}
            <div className="flex items-center gap-4 flex-shrink-0">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-700 bg-gray-200 transition-colors w-fit px-3 py-1.5 rounded hover:bg-gray-300 hover:text-[#16634a]"
              >
                <ArrowLeft size={20} />
                <span>Back</span>
              </button>

              <div>
                <h2 className="text-sm font-semibold text-gray-700 mb-1">Builder Information</h2>
                <p className="text-xs text-gray-600">Sell your property in vistaview platform at ease</p>
              </div>
            </div>
          </div>
        </div>

        {/* Verification Status Content */}
        <div className="w-full px-6 md:px-8 pb-8">
          <div className="max-w-2xl mx-auto mt-12">
            <div className="text-center space-y-6">
              {/* Green Checkmark with Company Name */}
              <div className="flex items-center justify-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#16634a] flex items-center justify-center">
                  <Check size={20} className="text-white" />
                </div>
                <h2 className="text-xl font-semibold text-[#16634a]">{businessName || 'E-Infra Constructions LLP'}</h2>
              </div>

              {/* Submitted Message */}
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Builder details are submitted for Verification
              </h1>

              {/* Verification In Progress Image */}
              <div className="flex justify-center pt-8">
                <img 
                  src={verifyInProgressImage} 
                  alt="Verification in progress" 
                  className="w-24 h-24 object-contain"
                />
              </div>

              {/* Verification Status */}
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                Verification is under process
              </h2>

              {/* Info Message */}
              <p className="text-sm text-gray-600 max-w-md mx-auto">
                Your builder account will be activated once the verification process is completed.
              </p>

              {/* Go to Account Setting Button */}
              <div className="pt-8">
                <button
                  onClick={() => navigate('/builder/profile')}
                  className="px-6 py-3 text-white rounded-lg font-semibold transition-colors"
                  style={{ background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)' }}
                >
                  Go to Account setting
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      {/* Full width header section close to navbar */}
      <div className="w-full bg-white pt-4 pb-6">
        <div className="w-full px-6 md:px-8 relative flex items-start">
          {/* Left side: Back Button and Builder Information */}
          <div className="flex items-center gap-4 flex-shrink-0">
            <button
              onClick={handleBack}
              disabled={currentStep === 2 && !showCompanyDetailsForm}
              className={`flex items-center gap-2 text-gray-700 bg-gray-200 transition-colors w-fit px-3 py-1.5 rounded ${
                currentStep === 2 && !showCompanyDetailsForm
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:bg-gray-300 hover:text-[#16634a]'
              }`}
            >
              <ArrowLeft size={20} />
              <span>Back</span>
            </button>

            <div>
              <h2 className="text-sm font-semibold text-gray-700 mb-1">Builder Information</h2>
              <p className="text-xs text-gray-600">Sell your property in vistaview platform at ease</p>
            </div>
          </div>

          {/* Main Title - Centered on same line */}
          <h1 className="absolute left-1/2 transform -translate-x-1/2 text-3xl md:text-4xl font-bold text-gray-900 whitespace-nowrap">
            Welcome to Vistaview Platform
          </h1>
          
          {/* Spacer to balance the layout */}
          <div className="flex-1"></div>
        </div>
      </div>

      {/* Centered content section */}
      <div className="w-full px-6 md:px-8 pb-8">
        <div className="max-w-6xl mx-auto">

          {/* Progress Indicator - Centered */}
          <div className="mb-8">
            <div className="relative max-w-4xl mx-auto">
              {/* Continuous line behind all circles - starts at right edge of first circle, ends at left edge of last circle */}
              <div className="absolute top-4 h-0.5 flex z-0" style={{ 
                left: 'calc((100% / 5) / 2 + 16px)', 
                right: 'calc((100% / 5) / 2 - 16px)'
              }}>
                {STEPS.map((step, index) => {
                  if (index === STEPS.length - 1) return null;
                  
                  return (
                    <div
                      key={`line-${index}`}
                      className="flex-1 bg-gray-300"
                    />
                  );
                })}
              </div>
              
              {/* Circles and labels - positioned on top of the line, overlapping it */}
              <div className="flex items-start relative z-10">
                {STEPS.map((step, index) => {
                  const isCompleted = currentStep > step.id;
                  const isCurrent = currentStep === step.id;

                  return (
                    <div key={step.id} className="flex flex-col items-center flex-1">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors flex-shrink-0 ${
                          isCompleted
                            ? 'border-transparent'
                            : isCurrent
                            ? 'border-transparent'
                            : 'bg-white border-gray-300'
                        }`}
                        style={
                          isCompleted || isCurrent
                            ? {
                                background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)',
                                border: 'none'
                              }
                            : {}
                        }
                      >
                        {isCompleted ? (
                          <Check size={16} className="text-white" />
                        ) : isCurrent ? (
                          <div 
                            className="w-2 h-2 rounded-full" 
                            style={{
                              background: 'linear-gradient(90deg, #905E26 0%, #F5EC9B 25.82%, #905E26 100%)'
                            }}
                          />
                        ) : (
                          <div className="w-2 h-2 bg-gray-300 rounded-full" />
                        )}
                      </div>
                      <span
                        className={`text-xs mt-2 text-center ${
                          isCurrent
                            ? 'text-[#16634a] font-semibold'
                            : 'text-gray-500'
                        }`}
                      >
                        {step.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Step Content - Centered */}
          <div className="bg-white rounded-lg p-6 md:p-8 mb-6 max-w-4xl mx-auto">
            {renderStepContent()}
          </div>

          {/* Action Buttons - Right aligned */}
          {currentStep > 1 && currentStep < STEPS.length && (
            <div className="flex gap-4 justify-end max-w-4xl mx-auto">
              <button
                onClick={handleSkip}
                className="px-6 py-2 border rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                style={{
                  borderColor: '#16634a',
                  color: '#16634a'
                }}
              >
                Skip for now
              </button>
              <button
                onClick={handleNext}
                disabled={submitting}
                className="px-6 py-2 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)'
                }}
              >
                {submitting ? 'Saving...' : 'Save & Continue'}
              </button>
            </div>
          )}

          {currentStep === STEPS.length && (
            <div className="flex justify-center max-w-4xl mx-auto">
              <button
                onClick={async () => {
                  // Submit all steps for final verification
                  try {
                    setSubmitting(true);
                    // Submit step 4 if not already submitted
                    const success = await submitStep4();
                    if (success) {
                      setVerificationSubmitted(true);
                    }
                  } catch (error) {
                    console.error('Error submitting for verification:', error);
                  } finally {
                    setSubmitting(false);
                  }
                }}
                disabled={submitting}
                className="px-6 py-2 bg-[#16634a] text-white rounded-lg font-semibold hover:bg-[#145a3f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting...' : 'Submit for Verification'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BuilderOnboarding;

