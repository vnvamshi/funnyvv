import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import V3CartShopping from './V3CartShopping';
import V3CartCheckout from './V3CartCheckout';
import V3CartComplete from './V3CartComplete';

export default function V3CartPage() {
  return (
    <Routes>
      <Route path="/" element={<V3CartShopping />} />
      <Route path="checkout" element={<V3CartCheckout />} />
      <Route path="complete" element={<V3CartComplete />} />
      <Route path="*" element={<Navigate to="." replace />} />
    </Routes>
  );
}
