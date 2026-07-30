import React, { useState } from 'react';
import { authService } from '../services/auth.service';
import { LogOut, Copy, Check, User as UserIcon } from 'lucide-react';

export const Header: React.FC = () => {
  const user = authService.getCurrentUser();
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    if (user?.codigoPerfil) {
      navigator.clipboard.writeText(user.codigoPerfil);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <header className="w-full shrink-0 z-40 bg-surface/90 backdrop-blur-md border-b border-outline shadow-sm">
      <div className="w-full flex justify-between items-center px-4 h-14">
        {/* Logo & User Greeting */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-base border border-primary/20">
            {user?.nome ? user.nome.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
          </div>
          <div>
            <h1 className="text-base font-bold text-on-surface leading-tight">Dia 5</h1>
            <p className="text-[11px] text-on-surface-variant">Olá, <span className="font-semibold text-primary">{user?.nome || 'Usuário'}</span></p>
          </div>
        </div>

        {/* Profile Code Badge & Logout */}
        <div className="flex items-center gap-1.5">
          {user?.codigoPerfil && (
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1 px-2.5 py-1 bg-primary/10 hover:bg-primary/20 text-primary rounded-full text-[11px] font-semibold border border-primary/20 transition-all btn-active"
              title="Clique para copiar seu Código de Perfil"
            >
              <span>Código: <strong>{user.codigoPerfil}</strong></span>
              {copied ? <Check className="w-3 h-3 text-secondary" /> : <Copy className="w-3 h-3" />}
            </button>
          )}

          <button
            onClick={() => authService.logout()}
            className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-full transition-colors"
            title="Sair da conta"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
