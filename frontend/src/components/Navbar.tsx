import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, UsersRound, ReceiptText, UserCheck } from 'lucide-react';

export const Navbar: React.FC = () => {
  return (
    <nav className="fixed bottom-0 left-0 w-full z-40 bg-surface/95 backdrop-blur-md border-t border-outline py-2 px-4 shadow-lg">
      <div className="max-w-md mx-auto flex justify-around items-center">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `flex flex-col items-center justify-center p-1.5 rounded-xl transition-all ${
              isActive ? 'text-primary font-bold scale-105' : 'text-on-surface-variant hover:text-primary'
            }`
          }
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[11px] mt-1 font-medium">Início</span>
        </NavLink>

        <NavLink
          to="/groups"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center p-1.5 rounded-xl transition-all ${
              isActive ? 'text-primary font-bold scale-105' : 'text-on-surface-variant hover:text-primary'
            }`
          }
        >
          <Users className="w-5 h-5" />
          <span className="text-[11px] mt-1 font-medium">Grupos</span>
        </NavLink>

        <NavLink
          to="/friends"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center p-1.5 rounded-xl transition-all ${
              isActive ? 'text-primary font-bold scale-105' : 'text-on-surface-variant hover:text-primary'
            }`
          }
        >
          <UsersRound className="w-5 h-5" />
          <span className="text-[11px] mt-1 font-medium">Amigos</span>
        </NavLink>

        <NavLink
          to="/activity"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center p-1.5 rounded-xl transition-all ${
              isActive ? 'text-primary font-bold scale-105' : 'text-on-surface-variant hover:text-primary'
            }`
          }
        >
          <ReceiptText className="w-5 h-5" />
          <span className="text-[11px] mt-1 font-medium">Extrato</span>
        </NavLink>

        <NavLink
          to="/account"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center p-1.5 rounded-xl transition-all ${
              isActive ? 'text-primary font-bold scale-105' : 'text-on-surface-variant hover:text-primary'
            }`
          }
        >
          <UserCheck className="w-5 h-5" />
          <span className="text-[11px] mt-1 font-medium">Conta</span>
        </NavLink>
      </div>
    </nav>
  );
};
