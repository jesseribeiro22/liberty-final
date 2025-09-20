// src/layouts/AdminLayout.jsx
import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, NavLink, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

function AdminLayout() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // <-- PASSO 1
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
      {/* App shell: sidebar + área principal */}
      <div className="relative md:grid md:grid-cols-[260px_1fr]"> {/* <-- PASSO 2 */}
        {/* Sidebar */}
        <aside className={`absolute inset-y-0 left-0 z-20 w-[260px] transform border-r bg-white transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}> {/* <-- PASSO 3 */}
          <div className="px-4 py-4 font-bold text-lg">Painel Liberty</div>
          <nav className="px-2 py-2 space-y-1">
            {/* <-- PASSO 6 (início) --> */}
            <SideLink to="/admin/conteudo" icon="📄" label="Conteúdo" onNavigate={() => setIsSidebarOpen(false)} />
            <SideLink to="/admin/leads" icon="🗂️" label="Leads" onNavigate={() => setIsSidebarOpen(false)} />
            <SideLink to="/admin/clientes" icon="👥" label="Clientes" onNavigate={() => setIsSidebarOpen(false)} />
            <SideLink to="/admin/agendamentos" icon="📅" label="Agendamentos" onNavigate={() => setIsSidebarOpen(false)} />
            <SideLink to="/admin/config" icon="⚙️" label="Configurações" onNavigate={() => setIsSidebarOpen(false)} />
          </nav>
        </aside>

        {/* Overlay para fechar o menu em telas pequenas */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-10 bg-black/50 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )} {/* <-- PASSO 5 */}

        {/* Área principal */}
        <div className="min-h-screen flex flex-col overflow-x-hidden">
          {/* Cabeçalho */}
          <header className="bg-white border-b"> {/* <-- PASSO 4 */}
            <div className="admin-container py-3 px-6 flex items-center gap-4 justify-between md:justify-end">
              {/* Botão de Menu (só aparece em telas pequenas) */}
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="md:hidden text-gray-600"
                aria-label="Abrir menu"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

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

function SideLink({ to, label, icon, disabled = false, onNavigate }) { // <-- PASSO 6 (continuação)
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
      onClick={onNavigate} // <-- PASSO 6 (final)
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
