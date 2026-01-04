import React, { useState } from 'react';

const floorsData = Array.from({ length: 40 }, (_, i) => ({
  id: i + 1,
  name: `Floor ${i + 1}`,
  description: `This is the description for Floor ${i + 1}. Add your own content here.`,
  departments: ['Office A', 'Office B', 'Meeting Room'],
}));

export default function BuildingFloors() {
  const [selectedFloor, setSelectedFloor] = useState<typeof floorsData[0] | null>(null);

  return (
    <div style={styles.container}>
      {/* Left panel - Building */}
      <div style={styles.building}>
        {floorsData
          .slice()
          .reverse()
          .map((floor) => (
            <div
              key={floor.id}
              onClick={() => setSelectedFloor(floor)}
              style={{
                ...styles.floor,
                background: selectedFloor?.id === floor.id ? '#0d6efd' : '#eaeaea',
                color: selectedFloor?.id === floor.id ? '#fff' : '#000',
              }}
            >
              {floor.name}
            </div>
          ))}
      </div>

      {/* Right panel - Floor Details */}
      <div style={styles.details}>
        {selectedFloor ? (
          <div>
            <h2>{selectedFloor.name}</h2>
            <p>{selectedFloor.description}</p>

            <h4>Departments / Rooms</h4>
            <ul>
              {selectedFloor.departments.map((d, idx) => (
                <li key={idx}>{d}</li>
              ))}
            </ul>
          </div>
        ) : (
          <h3>Click a floor to view details</h3>
        )}
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    gap: '20px',
    padding: '20px',
  },
  building: {
    width: '200px',
    border: '2px solid #444',
    display: 'flex',
    flexDirection: 'column',
  },
  floor: {
    padding: '10px',
    borderBottom: '1px solid #ccc',
    cursor: 'pointer',
    textAlign: 'center',
    userSelect: 'none',
    fontWeight: '500',
  },
  details: {
    flex: 1,
    padding: '20px',
    border: '2px solid #444',
    borderRadius: '6px',
    background: '#f8f9fa',
  },
};








