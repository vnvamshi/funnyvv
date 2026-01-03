import React, { useEffect, useRef } from "react";

const Google3DMap = () => {
  const mapRef = useRef(null);

  useEffect(() => {
    // Load the Google Maps script dynamically
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyAPoZgE4lQyj4L8Nxqls3GhRSYxCKcVGQA`;
    script.async = true;
    script.defer = true;
    script.onload = initMap;
    document.body.appendChild(script);

    function initMap() {
      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: 40.748817, lng: -73.985428 }, // Example: NYC Empire State Building
        zoom: 16,
        mapTypeId: "satellite", // "roadmap", "hybrid", "satellite", "terrain"
        tilt: 45, // Enable 3D buildings
        heading: 90, // Rotate view
      });

      // Optional: Animate rotation
      let heading = 90;
    //   setInterval(() => {
    //     heading = (heading + 10) % 360;
    //     map.setHeading(heading);
    //     map.setTilt(45);
    //   }, 2000);
    }
  }, []);

  return (
    <div>
      <h2 className="text-lg font-bold mb-2">Google Maps 3D View</h2>
      <div
        ref={mapRef}
        style={{ width: "100%", height: "500px", borderRadius: "12px" }}
      />
    </div>
  );
};

export default Google3DMap;
