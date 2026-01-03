import React from 'react';
import { Route } from 'react-router-dom';
import MyOrders from '../pages/orders/MyOrders';
import AccountSettings from '../pages/settings/AccountSettings';
import SavedHomes from '../pages/SavedHomes'; 
import ProtectedRoute from './ProtectedRoute';
import CartShopping from '../pages/cart/CartShopping';
import CartCheckout from '../pages/cart/CartCheckout';
import CartComplete from '../pages/cart/CartComplete';

export const BuyerRoutes = [
  <Route path="/saved" element={<ProtectedRoute><SavedHomes /></ProtectedRoute>} key="saved-homes" />,
  <Route path="/myorders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} key="my-orders" />,
  <Route path="/myorders/:orderNo/:productId" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} key="my-orders-detail" />,
  <Route path="/account-settings" element={<ProtectedRoute><AccountSettings /></ProtectedRoute>} key="account-settings" />,
  <Route path="/cart" element={<ProtectedRoute><CartShopping /></ProtectedRoute>} key="cart" />,
  <Route path="/cart/checkout" element={<ProtectedRoute><CartCheckout /></ProtectedRoute>} key="cart-checkout" />,
  <Route path="/cart/complete" element={<ProtectedRoute><CartComplete /></ProtectedRoute>} key="cart-complete" />
]; 