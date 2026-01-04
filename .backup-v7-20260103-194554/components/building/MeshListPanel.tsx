import React from 'react';

type MeshListPanelProps = {
  hoveredMeshName: string | null;
  selectedMeshName: string | null;
  meshes: string[];
  title?: string;
};

const MeshListPanel: React.FC<MeshListPanelProps> = ({
  hoveredMeshName,
  selectedMeshName,
  meshes,
  title = 'Meshes',
}) => {
  return (
    <aside style={styles.sidePanel}>
      <div style={styles.statusPanel}>
        <div style={styles.statusRow}>
          <span style={styles.statusLabel}>Hovering</span>
          <span style={styles.statusValue}>{hoveredMeshName ?? '—'}</span>
        </div>
        <div style={styles.statusRow}>
          <span style={styles.statusLabel}>Selected</span>
          <span style={styles.statusValue}>{selectedMeshName ?? '—'}</span>
        </div>
      </div>

      <div style={styles.listTitle}>{title}</div>
      <div style={styles.listContainer}>
        {meshes.length === 0 ? (
          <div style={styles.emptyState}>Loading mesh list...</div>
        ) : (
          meshes.map((name, idx) => (
            <div key={`${name}-${idx}`} style={styles.listItem}>
              {idx + 1}. {name}
            </div>
          ))
        )}
      </div>
    </aside>
  );
};

export default MeshListPanel;

const styles: { [key: string]: React.CSSProperties } = {
  sidePanel: {
    width: '300px',
    padding: '16px',
    background: '#0f172a',
    color: '#e2e8f0',
    borderLeft: '1px solid rgba(255,255,255,0.08)',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    boxShadow: '-8px 0 24px rgba(0,0,0,0.12)',
  },
  statusPanel: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '10px',
    padding: '10px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  statusRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: '13px',
  },
  statusLabel: {
    color: '#cbd5e1',
    letterSpacing: '0.01em',
    textTransform: 'uppercase',
    fontWeight: 700,
  },
  statusValue: {
    color: '#e2e8f0',
    fontWeight: 600,
    maxWidth: '180px',
    textAlign: 'right',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  listTitle: {
    fontWeight: 700,
    letterSpacing: '0.02em',
    fontSize: '14px',
    textTransform: 'uppercase',
  },
  listContainer: {
    flex: 1,
    overflowY: 'auto',
    paddingRight: '4px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  listItem: {
    background: 'rgba(255,255,255,0.06)',
    padding: '10px 12px',
    borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.08)',
    fontSize: '14px',
  },
  emptyState: {
    fontSize: '13px',
    color: '#cbd5e1',
  },
};

