import React from 'react';
import { Route } from 'react-router-dom';
import V3Layout from '../layouts/V3Layout';
import V3Landing from '../pages/Landing';
import V3RealEstate from '../pages/RealEstate';
import V3MapSearch from '../pages/MapSearch';
import PropertyDetailsV3 from '../pages/PropertyDetails';
import V3CartPage from '../pages/V3CartPage';
import V3Plan from '../pages/plan/V3Plan';
import V3PlanSubmit from '../pages/plan/V3PlanSubmit';
import V3PlanCheckout from '../pages/plan/V3PlanCheckout';
import V3PlanSuccess from '../pages/plan/V3PlanSuccess';
import ProductCatalog from '../pages/ProductCatalog';
import ProductDetail from '../pages/ProductDetail';
import Product360View from '../pages/Product360View';

export const V3Routes = [
	<Route path="/" element={<V3Landing />} key="v3-landing-root" />,
	<Route path="/v3" element={<V3Layout />} key="v3-layout">
		<Route index element={<V3Landing />} key="v3-layout-index" />
		<Route path="real-estate" element={<V3RealEstate />} key="v3-layout-real-estate" />
		<Route path="product-catalog" element={<ProductCatalog />} key="v3-layout-product-catalog" />
		<Route path="product-detail/:productId" element={<ProductDetail />} key="v3-layout-product-detail" />
		<Route path="product-360-view/:productId" element={<Product360View />} key="v3-layout-product-360-view" />
		<Route path="map-search" element={<V3MapSearch />} key="v3-layout-map-search" />
		<Route path="property" element={<PropertyDetailsV3 />} key="v3-layout-property-details" />
		<Route path="property/:id" element={<PropertyDetailsV3 />} key="v3-layout-property-details-legacy" />
		<Route path="cart/*" element={<V3CartPage />} key="v3-layout-cart" />
		<Route path="plan" element={<V3Plan />} key="v3-layout-plan" />
		<Route path="plan/submit" element={<V3PlanSubmit />} key="v3-layout-plan-submit" />
		<Route path="plan/checkout" element={<V3PlanCheckout />} key="v3-layout-plan-checkout" />
		<Route path="plan/success" element={<V3PlanSuccess />} key="v3-layout-plan-success" />
	</Route>,
]; 