import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import CartShopping from './CartShopping';
import CartCheckout from './CartCheckout';
import CartComplete from './CartComplete';

export default function CartPage() {
  return (
    <Routes>
      <Route path="/" element={<CartShopping />} />
      <Route path="checkout" element={<CartCheckout />} />
      <Route path="complete" element={<CartComplete />} />
      <Route path="*" element={<Navigate to="." replace />} />
    </Routes>
  );
} 