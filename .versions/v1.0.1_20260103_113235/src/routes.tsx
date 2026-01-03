import React from 'react';
import { Routes } from 'react-router-dom';
import { V3Routes } from './v3/routes';
import { CommonRoutes } from './routes/CommonRoutes';
import { AgentRoutes } from './routes/AgentRoutes';
import { BuyerRoutes } from './routes/BuyerRoutes';

const AppRoutes = () => (
  <Routes>
    {V3Routes}
    {CommonRoutes}
    {AgentRoutes}
    {BuyerRoutes}
  </Routes>
);

export default AppRoutes;
