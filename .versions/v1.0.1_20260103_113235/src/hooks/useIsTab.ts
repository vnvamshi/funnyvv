import { useState, useEffect } from "react";

// Returns true if window width is between 600px and 1024px (tablet only)
export default function useIsTab() {
  const [isTab, setIsTab] = useState(() =>
    typeof window !== "undefined"
      ? window.innerWidth >= 600 && window.innerWidth < 1024
      : false
  );
  useEffect(() => {
    function handleResize() {
      setIsTab(window.innerWidth >= 600 && window.innerWidth < 1024);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return isTab;
}