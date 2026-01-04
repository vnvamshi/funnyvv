import ResetPassword from './auth/ResetPassword';
import LocationSelectionPage from './location/LocationSelectionPage';
import LocationInfoPage from './location/LocationInfoPage';
import SkyvenData from './building/SkyvenData';

export const routes = [
  { path: '/reset-password', element: <ResetPassword /> },
  {
    path: '/location',
    element: <LocationSelectionPage />,
  },
  {
    path: '/location/info',
    element: <LocationInfoPage />,
  },
  {
    path: '/skyven-data',
    element: <SkyvenData />,
  },
]; 