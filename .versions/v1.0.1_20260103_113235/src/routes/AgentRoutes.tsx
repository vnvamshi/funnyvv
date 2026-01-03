import React from 'react';
import { Route } from 'react-router-dom';
import AgentProfilePage from '../pages/agent/profile';
import AgentMyPropertyListings from '../pages/agent/properties/AgentMyPropertyListings';
import AddOrUpdatePropertyWizard from '../pages/agent/properties/addProperty/AddOrUpdatePropertyWizard';
import MobilePropertyLayout from '../pages/agent/properties/addProperty/mobile/MobilePropertyLayout';
import ProtectedRoute from './ProtectedRoute';
import MobileProfileUpdate from '../pages/agent/profile/MobileProfileUpdate';
import AboutAgentMobile from '../pages/agent/profile/AboutAgentMobile';
import Agent3DHomes from '../pages/agent/homes3D/Agent3DHomes';
import Agent3DHomeEdit from '../pages/agent/homes3D/Agent3DHomeEdit';
import AgentPropertyDetails from '../pages/agent/properties/AgentPropertyDetails';

export const AgentRoutes = [
  <Route path="/agent/profile" element={<ProtectedRoute><AgentProfilePage /></ProtectedRoute>} key="agent-profile" />,
  <Route path="/agent/properties/listings" element={<ProtectedRoute><AgentMyPropertyListings /></ProtectedRoute>} key="agent-listings" />,
  <Route path="/agent/properties/add" element={<ProtectedRoute><AddOrUpdatePropertyWizard /></ProtectedRoute>} key="agent-add-property" />,
  <Route path="/agent/about" element={<ProtectedRoute><AboutAgentMobile /></ProtectedRoute>} key="agent-about" />,
  <Route path="/agent/properties/:id" element={<ProtectedRoute><AddOrUpdatePropertyWizard /></ProtectedRoute>} key="agent-edit-property" />,
  <Route path="/agent/properties/details/:id" element={<ProtectedRoute><AgentPropertyDetails /></ProtectedRoute>} key="agent-property-details" />,

  <Route path="/agent/homes3d" element={<ProtectedRoute><Agent3DHomes /></ProtectedRoute>} key="agent-homes3d" />,
  <Route path="/agent/homes3d/:id/edit" element={<ProtectedRoute><Agent3DHomeEdit /></ProtectedRoute>} key="agent-homes3d-edit" />,
  
  // Mobile property flow with shared context
  <Route path="/agent/properties/add/*" element={<ProtectedRoute><MobilePropertyLayout /></ProtectedRoute>} key="mobile-property-add-flow" />,
  <Route path="/agent/properties/*" element={<ProtectedRoute><MobilePropertyLayout /></ProtectedRoute>} key="mobile-property-flow" />,
  <Route path="/agent/profile/update" element={<MobileProfileUpdate />} key="agent-profile-update" />
];
