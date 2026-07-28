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

// Guard de Rota Protegida
const ProtectedLayout: React.FC = () => {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col antialiased">
      <Header />
      <main className="flex-1 px-4 pt-6 max-w-4xl mx-auto w-full">
        <Outlet />
      </main>
      <Navbar />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rotas Públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Rotas Protegidas com Layout (Header + Navbar) */}
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
