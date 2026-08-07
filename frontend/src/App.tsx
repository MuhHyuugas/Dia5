import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { authService } from './services/auth.service';
import { Header } from './components/Header';
import { Navbar } from './components/Navbar';
import { ThemeProvider } from './contexts/ThemeContext';

import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Groups } from './pages/Groups';
import { GroupDetails } from './pages/GroupDetails';
import { AddExpense } from './pages/AddExpense';
import { Friends } from './pages/Friends';
import { Activity } from './pages/Activity';
import { Account } from './pages/Account';

// Shell Web Responsivo Full Screen
const WebShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col antialiased selection:bg-primary/30 w-full relative">
      {children}
    </div>
  );
};

// Guard de Rota Protegida
const ProtectedLayout: React.FC = () => {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return (
    <WebShell>
      <Header />
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-8">
        <Outlet />
      </main>
      <Navbar />
    </WebShell>
  );
};

const PublicLayout: React.FC = () => {
  return (
    <WebShell>
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 w-full min-h-screen">
        <Outlet />
      </main>
    </WebShell>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
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
    </ThemeProvider>
  );
};

export default App;
