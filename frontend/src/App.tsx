import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { authService } from './services/auth.service';
import { Header } from './components/Header';
import { Navbar } from './components/Navbar';

import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Groups } from './pages/Groups';
import { GroupDetails } from './pages/GroupDetails';
import { AddExpense } from './pages/AddExpense';
import { Friends } from './pages/Friends';
import { Activity } from './pages/Activity';
import { Account } from './pages/Account';

// Shell Responsivo Mobile-First (Dispositivo Móvel Centrado em Telas Grandes)
const MobileShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-900 md:bg-slate-950 flex items-center justify-center p-0 md:p-6 antialiased selection:bg-primary/30">
      {/* Container simulando um smartphone em telas grandes e 100% full screen no celular */}
      <div className="w-full max-w-md min-h-screen md:min-h-[844px] md:max-h-[920px] bg-background text-on-surface flex flex-col md:rounded-[40px] md:shadow-2xl md:border-8 md:border-slate-800 relative overflow-hidden">
        {/* Notch / Speaker visual apenas no desktop */}
        <div className="hidden md:flex justify-center pt-2 pb-1 bg-surface z-50">
          <div className="w-24 h-4 bg-slate-800 rounded-full flex items-center justify-center">
            <div className="w-3 h-1 bg-slate-700 rounded-full"></div>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
};

// Guard de Rota Protegida
const ProtectedLayout: React.FC = () => {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return (
    <MobileShell>
      <Header />
      <main className="flex-1 px-4 pt-4 pb-24 overflow-y-auto custom-scrollbar">
        <Outlet />
      </main>
      <Navbar />
    </MobileShell>
  );
};

const PublicLayout: React.FC = () => {
  return (
    <MobileShell>
      <div className="flex-1 overflow-y-auto">
        <Outlet />
      </div>
    </MobileShell>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rotas Públicas */}
        <Route element={<PublicLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Rotas Protegidas com Layout Mobile */}
        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/groups" element={<Groups />} />
          <Route path="/groups/:id" element={<GroupDetails />} />
          <Route path="/expenses/new" element={<AddExpense />} />
          <Route path="/friends" element={<Friends />} />
          <Route path="/activity" element={<Activity />} />
          <Route path="/account" element={<Account />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
