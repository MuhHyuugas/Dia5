import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { authService } from '../services/auth.service';
import { useTheme } from '../contexts/ThemeContext';
import {
  LogOut,
  Copy,
  Check,
  Sun,
  Moon,
  LayoutDashboard,
  Users,
  UsersRound,
  ReceiptText,
  UserCheck,
} from 'lucide-react';

export const Header: React.FC = () => {
  const user = authService.getCurrentUser();
  const { isDark, toggleTheme } = useTheme();
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    if (user?.codigoPerfil) {
      navigator.clipboard.writeText(user.codigoPerfil);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const navItems = [
    { to: '/', label: 'Início', icon: LayoutDashboard, end: true },
    { to: '/groups', label: 'Grupos', icon: Users },
    { to: '/friends', label: 'Amigos', icon: UsersRound },
    { to: '/activity', label: 'Extrato', icon: ReceiptText },
    { to: '/account', label: 'Conta', icon: UserCheck },
  ];

  return (
    <header className="w-full shrink-0 z-40 bg-surface/90 backdrop-blur-md border-b border-outline shadow-sm sticky top-0">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
        {/* Logo & User Greeting */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center font-extrabold text-lg shadow-md shadow-primary/20">
            D5
          </div>
          <div>
            <h1 className="text-base font-bold text-on-surface leading-tight">Dia 5</h1>
            <p className="text-xs text-on-surface-variant">
              Olá, <span className="font-semibold text-primary">{user?.nome || 'Usuário'}</span>
            </p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-primary/10 text-primary font-bold shadow-sm'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-outline/20'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {user?.codigoPerfil && (
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl text-xs font-semibold border border-primary/20 transition-all btn-active"
              title="Clique para copiar seu Código de Perfil"
            >
              <span>Código: <strong>{user.codigoPerfil}</strong></span>
              {copied ? <Check className="w-3.5 h-3.5 text-secondary" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          )}

          {/* Toggle de Tema */}
          <button
            onClick={toggleTheme}
            className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-xl transition-colors"
            title={isDark ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            onClick={() => authService.logout()}
            className="p-2 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-xl transition-colors"
            title="Sair da conta"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
