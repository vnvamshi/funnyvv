import { useState } from 'react';

export function useMoreFiltersDrawer() {
  const [moreDrawerOpen, setMoreDrawerOpen] = useState(false);
  const [expandedAccordion, setExpandedAccordion] = useState<string | false>(false);

  const handleMoreOpen = () => setMoreDrawerOpen(true);
  const handleMoreClose = () => setMoreDrawerOpen(false);
  const handleAccordionChange = (panel: string) => (_: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedAccordion(isExpanded ? panel : false);
  };

  return {
    moreDrawerOpen,
    setMoreDrawerOpen,
    expandedAccordion,
    setExpandedAccordion,
    handleMoreOpen,
    handleMoreClose,
    handleAccordionChange,
  };
} 