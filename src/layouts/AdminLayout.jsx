// src/layouts/AdminLayout.jsx
import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, NavLink, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

function AdminLayout() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (loading) return <div className="p-6">Carregando…</div>;
  if (!session) return <Navigate to="/login" />;

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* App shell: sidebar fixa + área principal */}
      <div className="grid" style={{ gridTemplateColumns: '260px 1fr' }}>
        {/* Sidebar */}
        <aside className="border-r bg-white min-h-screen">
          <div className="px-4 py-4 font-bold text-lg">Painel Liberty</div>
          <nav className="px-2 py-2 space-y-1">
            <SideLink to="/admin/conteudo" icon="📄" label="Conteúdo" />
            <SideLink to="/admin/leads" icon="🗂️" label="Leads" />
            <SideLink to="/admin/clientes" icon="👥" label="Clientes" />
            <SideLink to="/admin/agendamentos" icon="📅" label="Agendamentos" />
            <SideLink to="/admin/config" icon="⚙️" label="Configurações" />
          </nav>
        </aside>

        {/* Área principal */}
        <div className="min-h-screen flex flex-col overflow-x-hidden">
          {/* Cabeçalho */}
          <header className="bg-white border-b">
            <div className="admin-container py-3 px-6 flex items-center gap-3 justify-end">
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
                title="Sair"
              >
                Sair
              </button>
            </div>
          </header>

          {/* Conteúdo */}
          <main className="flex-1">
            <div className="admin-container py-6 px-6">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

function SideLink({ to, label, icon, disabled = false }) {
  if (disabled) {
    return (
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-md text-gray-400 cursor-not-allowed select-none"
        title="Em breve"
      >
        <span className="text-base">{icon}</span>
        <span className="text-sm">{label}</span>
      </div>
    );
  }

  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          'flex items-center gap-2 px-3 py-2 rounded-md text-sm',
          isActive ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100',
        ].join(' ')
      }
    >
      <span className="text-base">{icon}</span>
      <span>{label}</span>
    </NavLink>
  );
}

export default AdminLayout;


