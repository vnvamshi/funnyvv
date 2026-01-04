import React from 'react';
import { Route } from 'react-router-dom';
import Home from '../pages/Home/Home';
import Login from '../pages/auth/Login';
import Signup from '../pages/auth/Signup';
import OTPVerify from '../pages/auth/OTPVerify';
import Plan from '../pages/plan/Plan';
import SavedHomes from '../pages/SavedHomes';
import PropertyListing from '../pages/HomeSearchList/PropertyListing';
import PropertyDetails from '../pages/PropertyDetails';
import SubmitPlanMain from '../pages/plan/SubmitPlanMain';
import PlanPaymentCheckout from '../pages/plan/PlanPaymentCheckout';
import PlanSubscriptionSuccess from '../pages/plan/PlanSubscriptionSuccess';
import Sell from '../pages/Home/Sell';
import MobileAgentSignup from '../pages/auth/MobileAgentSignup';
import MySubscriptions from '../pages/plan/MySubscriptions';
import ResetPassword from '../pages/auth/ResetPassword';
import Help from '../pages/Help';
import Reports from '../pages/Reports';
import LandingPage from '../pages/LandingPage';
import ServicesPage from '../pages/Home/ServicesPage';
import LocationSelectionPage from '../pages/location/LocationSelectionPage';
import LocationInfoPage from '../pages/location/LocationInfoPage';
import Map3DPage from '../pages/map/Map3DPage';
import Room3DPage from '../pages/map/Room3DPage';
import LottieTest from '../pages/test/LottieTest';
import VADDemo from '../pages/test/VADDemo';
import MicrophoneTest from '../pages/test/MicrophoneTest';
import LandingPageV3_2 from '../pages/LandingPageV3_2';
import BuildingFloors from '../pages/building/BuildingFloors';
import FuturisticTower from '../pages/building/FuturisticTower';
import FuturisticTowerClassic from '../pages/building/FuturisticTowerClassic';
import SkyvenStandalone from '../pages/building/SkyvenStandalone';
import SkyvenWithSurroundings from '../pages/building/SkyvenWithSurroundings';
import SkyvenWithSurroundingsViewer from '../pages/building/SkyvenWithSurroundingsViewer';
import SkyvenData from '../pages/building/SkyvenData';
import InteractivePlotMap from '../pages/map/InteractivePlotMap';
import BuilderOnboarding from '../pages/builder/BuilderOnboarding';
import BuilderProfilePage from '../pages/builder/profile/BuilderProfilePage';
import ProtectedRoute from './ProtectedRoute';

export const CommonRoutes = [
  <Route path="/" element={<LandingPage />} key="landing" />, 
  <Route path="/home" element={<Home />} key="home" />,
  <Route path="/landing" element={<LandingPage />} key="landing2" />,
  <Route path="/landing-v3-2" element={<LandingPageV3_2 />} key="landing-v3-2" />,
  <Route path="/login" element={<Login />} key="login" />,
  <Route path="/signup" element={<Signup />} key="signup" />,
  <Route path="/agent-signup" element={<MobileAgentSignup />} key="agent-signup" />,
  <Route path="/otp-verify" element={<OTPVerify />} key="otp-verify" />,
  <Route path="/sell" element={<Sell />} key="sell" />, 
  <Route path="/plan" element={<Plan />} key="plan" />,
  <Route path="/property-listing" element={<PropertyListing />} key="property-listing" />,
  <Route path="/property/:id" element={<PropertyDetails />} key="property-details" />,
  <Route path="/plan/submit" element={<SubmitPlanMain />} key="plan-submit" />,
  <Route path="/plan/checkout" element={<PlanPaymentCheckout />} key="plan-checkout" />,
  <Route path="/plan/success" element={<PlanSubscriptionSuccess />} key="plan-success" />,
  <Route path="/my-subscriptions" element={<MySubscriptions />} key="my-subscriptions" />,
  <Route path="/reset-password" element={<ResetPassword />} key="reset-password" />,
  <Route path="/help" element={<Help />} key="help" />,
  <Route path="/reports" element={<Reports />} key="reports" />,
  <Route path="/services" element={<ServicesPage />} key="services" />,
  <Route path="/location-select" element={<LocationSelectionPage />} key="location-select" />,
  <Route path="/location-select/info" element={<LocationInfoPage />} key="location-info" />,
  <Route path="/map3d" element={<Map3DPage />} key="map3d" />,
  <Route path="/property3d/:propertyId" element={<Room3DPage />} key="room3d" />,
  <Route path="/test/lottie" element={<LottieTest />} key="lottie-test" />,
  <Route path="/test/vad" element={<VADDemo />} key="vad-test" />,
  <Route path="/test/microphone" element={<MicrophoneTest />} key="microphone-test" />,
  <Route path="/building-floors" element={<BuildingFloors />} key="building-floors" />,
  <Route path="/tower-3d" element={<FuturisticTower />} key="tower-3d" />,
  <Route path="/tower-3d-classic" element={<FuturisticTowerClassic />} key="tower-3d-classic" />,
  <Route path="/skyven-glb" element={<SkyvenStandalone />} key="skyven-glb" />,
  <Route path="/skyven-with-surroundings" element={<SkyvenWithSurroundings />} key="skyven-with-surroundings" />,
  <Route
    path="/skyven-with-surroundings-viewer"
    element={<SkyvenWithSurroundingsViewer />}
    key="skyven-with-surroundings-viewer"
  />,
  <Route path="/skyven-data" element={<SkyvenData />} key="skyven-data" />,
  <Route path="/plot-map" element={<InteractivePlotMap />} key="plot-map" />,
  <Route path="/builder/onboarding" element={<BuilderOnboarding />} key="builder-onboarding" />,
  <Route path="/builder/profile" element={<ProtectedRoute><BuilderProfilePage /></ProtectedRoute>} key="builder-profile" />,
]; 