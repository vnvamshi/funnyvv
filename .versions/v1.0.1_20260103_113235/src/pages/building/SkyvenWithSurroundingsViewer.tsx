import React from 'react';

import SkyvenWithSurroundings from './SkyvenWithSurroundings';

// Viewer-only page that hides the mesh list panel and shows the overlay cards.
const SkyvenWithSurroundingsViewer: React.FC = () => {
  return <SkyvenWithSurroundings showMeshList={false} showHighlightsCard showFloorCard showFilterCard />;
};

export default SkyvenWithSurroundingsViewer;

