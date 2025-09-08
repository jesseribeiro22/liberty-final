// src/main.jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';

import './index.css';

import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import AdminLayout from './layouts/AdminLayout.jsx';

// Admin
import AdminPage from './pages/AdminPage.jsx';             // Conteúdo do site
import AdminLeads from './pages/AdminLeads.jsx';           // Leads
import AdminClients from './pages/AdminClients.jsx';       // Clientes
import AdminAppointments from './pages/AdminAppointments.jsx'; // Agendamentos
import AdminConfig from './pages/AdminConfig.jsx';         // << NOVO: Configurações

const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  { path: '/login', element: <LoginPage /> },

  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <Navigate to="conteudo" replace /> },
      { path: 'conteudo', element: <AdminPage /> },
      { path: 'leads', element: <AdminLeads /> },
      { path: 'clientes', element: <AdminClients /> },
      { path: 'agendamentos', element: <AdminAppointments /> },
      { path: 'config', element: <AdminConfig /> }, // << NOVO
    ],
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
