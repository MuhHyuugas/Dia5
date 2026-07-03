/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Bell, Plus, ChevronRight, Sparkles, Wallet, Users } from 'lucide-react';
import { Group, Member } from '../types';

interface DashboardViewProps {
  groups: Group[];
  members: Member[];
  netBalancePerGroup: { [groupId: string]: number };
  globalBalance: number;
  onSelectGroup: (groupId: string) => void;
  onOpenAddExpense: () => void;
  onOpenAddGroup: () => void;
  onNavigateToAccount: () => void;
}

export default function DashboardView({
  groups,
  members,
  netBalancePerGroup,
  globalBalance,
  onSelectGroup,
  onOpenAddExpense,
  onOpenAddGroup,
  onNavigateToAccount,
}: DashboardViewProps) {
  // Get active current user image
  const currentUser = members.find((m) => m.id === 'user-me');

  const formatCurrency = (val: number) => {
    const formatted = Math.abs(val).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return `${val >= 0 ? '+' : '-'} R$ ${formatted}`;
  };

  return (
    <div className="min-h-screen pb-32 bg-brand-surface text-brand-on-surface">
      {/* Top Header */}
      <header className="sticky top-0 w-full z-30 bg-brand-surface/80 backdrop-blur-xl border-b border-brand-container-highest/20 flex justify-between items-center px-6 h-16">
        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateToAccount}
            className="w-10 h-10 rounded-full overflow-hidden border-2 border-brand-primary-container/20 hover:scale-95 transition-transform duration-200 cursor-pointer"
          >
            <img
              className="w-full h-full object-cover"
              src={currentUser?.avatar}
              alt="Profile avatar"
            />
          </button>
          <h1 className="font-headline-md text-xl font-bold tracking-tight text-brand-on-surface">
            SplitWise Premium
          </h1>
        </div>
        <button
          onClick={onNavigateToAccount}
          className="relative hover:opacity-80 transition-opacity p-2 rounded-full hover:bg-white/5 active:scale-95 duration-200"
        >
          <Bell className="w-6 h-6 text-brand-primary" />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-brand-error rounded-full" />
        </button>
      </header>

      <main className="px-6 py-6 space-y-8 max-w-xl mx-auto">
        {/* Section: Global Balance Card */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-gradient-to-br from-brand-container-low via-brand-container-low to-brand-container/60 rounded-2xl p-6 border border-white/5 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary-container/10 rounded-full -mr-16 -mt-16 blur-xl" />
            <div className="relative z-10 space-y-4">
              <div>
                <p className="font-label-caps text-[11px] text-brand-on-surface-variant/70 tracking-widest uppercase">
                  Saldo Global
                </p>
                <div
                  className={`font-numeric-xl text-[38px] font-extrabold tracking-tight mt-1 ${
                    globalBalance >= 0 ? 'text-brand-secondary' : 'text-brand-error'
                  }`}
                >
                  {formatCurrency(globalBalance)}
                </div>
                <p className="text-sm text-brand-on-surface-variant/60 mt-1">
                  {globalBalance >= 0
                    ? 'Você está no positivo este mês.'
                    : 'Você está devendo no balanço geral.'}
                </p>
              </div>

              {/* Balance Card Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={onOpenAddExpense}
                  className="flex-1 bg-brand-primary-container hover:bg-brand-primary-container/90 text-brand-on-primary-container py-3.5 px-4 rounded-xl font-bold transition-all hover:shadow-lg hover:shadow-brand-primary-container/20 active:scale-[0.98] flex items-center justify-center gap-2 text-sm"
                >
                  <Plus className="w-5 h-5" /> Adicionar Gasto
                </button>
                <button
                  onClick={onNavigateToAccount}
                  className="w-12 h-12 rounded-xl bg-brand-container-high/40 hover:bg-brand-container-high/70 border border-brand-container-highest/30 flex items-center justify-center text-brand-on-surface transition-colors active:scale-95"
                  title="Minhas Chaves PIX"
                >
                  <Wallet className="w-5 h-5 text-brand-primary" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Groups */}
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-headline-md text-lg font-bold text-brand-on-surface">
              Meus Grupos
            </h2>
            <button
              onClick={onOpenAddGroup}
              className="text-xs text-brand-primary font-semibold hover:underline"
            >
              Criar Novo
            </button>
          </div>

          <div className="space-y-3">
            {groups.map((group) => {
              const balance = netBalancePerGroup[group.id] || 0;
              const hasBalance = balance !== 0;

              // Pre-select image style mapping or generic background based on name
              let bgGradient = 'from-emerald-950/20 to-teal-950/20';
              if (group.name.includes('Rio') || group.name.includes('Praia')) {
                bgGradient = 'from-sky-950/20 to-blue-950/20';
              } else if (group.name.includes('Festa')) {
                bgGradient = 'from-violet-950/20 to-fuchsia-950/20';
              } else if (group.name.includes('República')) {
                bgGradient = 'from-amber-950/20 to-orange-950/20';
              }

              return (
                <div
                  key={group.id}
                  id={`group-card-${group.id}`}
                  onClick={() => onSelectGroup(group.id)}
                  className="bg-brand-container-low/70 hover:bg-brand-container-low rounded-xl p-4 flex items-center justify-between border border-white/5 hover:border-white/10 shadow-sm transition-all cursor-pointer group active:scale-[0.99]"
                >
                  <div className="flex items-center gap-4">
                    {/* Visual custom styled icon container */}
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${bgGradient} border border-white/5 flex items-center justify-center text-2xl shadow-inner`}
                    >
                      {group.avatar}
                    </div>
                    <div>
                      <h3 className="font-semibold text-brand-on-surface text-[15px] group-hover:text-brand-primary transition-colors">
                        {group.name}
                      </h3>
                      {hasBalance ? (
                        <p
                          className={`text-xs mt-0.5 font-medium ${
                            balance > 0 ? 'text-brand-secondary' : 'text-brand-error'
                          }`}
                        >
                          {balance > 0 ? 'Você recebe' : 'Você deve'}{' '}
                          R$ {Math.abs(balance).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      ) : (
                        <p className="text-xs text-brand-on-surface-variant/40 mt-0.5 font-medium">
                          Tudo quitado
                        </p>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-brand-on-surface-variant/40 group-hover:text-brand-primary group-hover:translate-x-1 transition-all" />
                </div>
              );
            })}
          </div>
        </section>

        {/* Section: Insights Box */}
        <section className="animate-in fade-in duration-700">
          <div className="border border-dashed border-brand-container-highest/40 bg-brand-container-low/30 rounded-2xl p-5 flex flex-col gap-3 relative overflow-hidden">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-brand-primary-container/10 flex items-center justify-center text-brand-primary">
                <Sparkles className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-semibold text-brand-on-surface">Insight da Semana</h4>
            </div>
            <p className="text-xs text-brand-on-surface-variant/80 leading-relaxed font-normal">
              Você gastou <span className="text-brand-secondary font-semibold">15% menos</span> com &quot;Mercado&quot; em relação à semana passada no grupo Viagem Rio. Continue assim!
            </p>
          </div>
        </section>
      </main>

      {/* Floating Action Button (FAB) to Add Group */}
      <button
        onClick={onOpenAddGroup}
        className="fixed bottom-24 right-6 w-14 h-14 bg-brand-secondary-container text-white rounded-full shadow-lg shadow-brand-secondary-container/20 hover:shadow-xl active:scale-90 transition-transform z-40 flex items-center justify-center cursor-pointer group"
        title="Criar Novo Grupo"
      >
        <Users className="w-6 h-6 group-hover:scale-110 transition-transform" />
      </button>
    </div>
  );
}
