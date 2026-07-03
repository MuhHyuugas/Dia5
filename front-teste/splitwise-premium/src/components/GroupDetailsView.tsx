/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ArrowLeft, Bell, Filter, Plus, ChevronRight, HelpCircle, CheckCircle2, Ticket, Utensils, Car, Layers, RefreshCw } from 'lucide-react';
import { Group, Member, Expense, ExpenseCategory } from '../types';

interface GroupDetailsViewProps {
  group: Group;
  members: Member[];
  expenses: Expense[];
  onBack: () => void;
  onAddExpenseClick: () => void;
  onEditExpenseClick: (expense: Expense) => void;
  onAddMember: (name: string) => void;
  onSettleDebt: (payerId: string, receiverId: string, amount: number) => void;
}

export default function GroupDetailsView({
  group,
  members,
  expenses,
  onBack,
  onAddExpenseClick,
  onEditExpenseClick,
  onAddMember,
  onSettleDebt,
}: GroupDetailsViewProps) {
  const [filterCategory, setFilterCategory] = useState<ExpenseCategory | 'Todos'>('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showAddMemberInput, setShowAddMemberInput] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [showSettleModal, setShowSettleModal] = useState(false);

  // Group members list
  const groupMembers = members.filter((m) => group.memberIds.includes(m.id));

  // Active (non-liquidated) expenses for this group
  const groupExpenses = expenses.filter((e) => e.groupId === group.id);

  // Dynamic split calculations for this group
  let totalSpent = 0;
  let youLent = 0;
  let youOwe = 0;

  // Track who owes who in a ledger
  // key: memberId -> amount you owe them (if negative, they owe you)
  const ledger: { [memberId: string]: number } = {};
  groupMembers.forEach((m) => {
    if (m.id !== 'user-me') ledger[m.id] = 0;
  });

  groupExpenses.forEach((exp) => {
    if (exp.isLiquidated) return;

    totalSpent += exp.amount;

    const numSplits = exp.splitWithIds.length;
    if (numSplits === 0) return;
    const share = exp.amount / numSplits;

    // If I paid
    if (exp.paidById === 'user-me') {
      const iAmInSplit = exp.splitWithIds.includes('user-me');
      const othersShare = exp.amount - (iAmInSplit ? share : 0);
      youLent += othersShare;

      // Distribute how much each person in the split owes me
      exp.splitWithIds.forEach((mId) => {
        if (mId === 'user-me') return;
        // They owe me 'share'. So my net ledger towards them decreases (they owe me)
        ledger[mId] -= share;
      });
    }
    // If someone else paid
    else {
      const iAmInSplit = exp.splitWithIds.includes('user-me');
      if (iAmInSplit) {
        youOwe += share;
        // I owe the payer 'share'. My net ledger towards them increases (I owe them)
        if (ledger[exp.paidById] !== undefined) {
          ledger[exp.paidById] += share;
        }
      }
    }
  });

  // Filtered expenses list
  const filteredExpenses = groupExpenses.filter((exp) => {
    const matchesCategory = filterCategory === 'Todos' || exp.category === filterCategory;
    const matchesSearch = exp.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryIcon = (cat: ExpenseCategory) => {
    switch (cat) {
      case 'Entretenimento':
        return Ticket;
      case 'Alimentação':
        return Utensils;
      case 'Transporte':
        return Car;
      default:
        return Layers;
    }
  };

  const getCategoryColor = (cat: ExpenseCategory) => {
    switch (cat) {
      case 'Entretenimento':
        return 'bg-pink-500/15 text-pink-400 border-pink-500/10';
      case 'Alimentação':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/10';
      case 'Transporte':
        return 'bg-sky-500/15 text-sky-400 border-sky-500/10';
      default:
        return 'bg-brand-primary-container/15 text-brand-primary border-brand-primary/10';
    }
  };

  const handleAddMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;
    onAddMember(newMemberName.trim());
    setNewMemberName('');
    setShowAddMemberInput(false);
  };

  const handleQuickSettle = (memberId: string, amount: number) => {
    if (amount <= 0) return;
    onSettleDebt('user-me', memberId, amount);
    setShowSettleModal(false);
  };

  const handleQuickCollect = (memberId: string, amount: number) => {
    if (amount <= 0) return;
    onSettleDebt(memberId, 'user-me', amount);
    setShowSettleModal(false);
  };

  // Identify who has balances to settle
  const debtBreakdown = Object.entries(ledger)
    .map(([mId, val]) => {
      const member = groupMembers.find((m) => m.id === mId);
      return {
        member,
        amount: val, // positive means I owe them, negative means they owe me
      };
    })
    .filter((d) => d.member && Math.abs(d.amount) > 0.01);

  return (
    <div className="min-h-screen pb-32 bg-brand-surface text-brand-on-surface">
      {/* Top Bar Navigation */}
      <header className="sticky top-0 z-30 bg-brand-surface/80 backdrop-blur-xl border-b border-brand-container-highest/15 flex justify-between items-center px-6 h-16">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 -ml-2 text-brand-on-surface-variant/80 hover:text-brand-on-surface hover:bg-white/5 rounded-full transition-colors active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="w-10 h-10 rounded-full bg-brand-container border border-white/5 flex items-center justify-center text-xl">
            {group.avatar}
          </div>
          <span className="font-headline-md text-lg font-bold tracking-tight text-brand-on-surface">
            {group.name}
          </span>
        </div>
        <button
          onClick={() => setShowSettleModal(true)}
          className="hover:opacity-80 transition-all p-2 rounded-full hover:bg-white/5 active:scale-95 duration-200 text-brand-primary"
          title="Balanço detalhado"
        >
          <Bell className="w-5 h-5" />
        </button>
      </header>

      <main className="pb-12">
        {/* Section: Horizontal Member Scroller */}
        <section className="py-5 bg-brand-container-low/30 border-b border-brand-container-highest/10">
          <div className="flex overflow-x-auto gap-4 px-6 scrollbar-none">
            {/* Add Member Button */}
            {!showAddMemberInput ? (
              <button
                onClick={() => setShowAddMemberInput(true)}
                className="flex-shrink-0 flex flex-col items-center gap-2 group cursor-pointer"
              >
                <div className="w-14 h-14 rounded-full border-2 border-dashed border-brand-on-surface-variant/30 flex items-center justify-center group-hover:border-brand-primary group-hover:bg-brand-primary/5 transition-all">
                  <Plus className="w-5 h-5 text-brand-on-surface-variant/70 group-hover:text-brand-primary" />
                </div>
                <span className="font-label-caps text-[10px] text-brand-on-surface-variant/70">
                  Add
                </span>
              </button>
            ) : (
              <form
                onSubmit={handleAddMemberSubmit}
                className="flex-shrink-0 flex flex-col items-center gap-2 animate-in fade-in duration-200"
              >
                <div className="w-14 h-14 rounded-full border border-brand-primary flex items-center justify-center bg-brand-container-high px-1">
                  <input
                    type="text"
                    autoFocus
                    placeholder="Nome"
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    className="w-full text-[10px] text-center bg-transparent border-none focus:outline-none focus:ring-0 text-brand-on-surface p-0"
                  />
                </div>
                <div className="flex gap-1">
                  <button type="submit" className="text-[8px] bg-brand-primary text-brand-on-surface font-bold px-1 py-0.5 rounded">
                    OK
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddMemberInput(false)}
                    className="text-[8px] bg-brand-container-highest text-brand-on-surface-variant px-1 py-0.5 rounded"
                  >
                    X
                  </button>
                </div>
              </form>
            )}

            {/* Members List */}
            {groupMembers.map((member) => {
              const isMe = member.id === 'user-me';
              return (
                <div key={member.id} className="flex-shrink-0 flex flex-col items-center gap-2">
                  {member.avatar ? (
                    <div
                      className={`w-14 h-14 rounded-full p-[2px] transition-transform ${
                        isMe
                          ? 'ring-2 ring-brand-primary-container ring-offset-2 ring-offset-brand-surface'
                          : 'opacity-90'
                      }`}
                    >
                      <img
                        className="w-full h-full rounded-full object-cover"
                        src={member.avatar}
                        alt={member.name}
                      />
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-brand-primary-container/20 text-brand-primary border-2 border-brand-primary/20 flex items-center justify-center font-bold text-sm">
                      {member.name.substring(0, 1)}
                    </div>
                  )}
                  <span
                    className={`font-label-caps text-[10px] truncate max-w-[56px] text-center ${
                      isMe ? 'text-brand-on-surface font-bold' : 'text-brand-on-surface-variant/70'
                    }`}
                  >
                    {isMe ? 'Você' : member.name}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Section: Balanço do Grupo card */}
        <section className="px-6 mt-6 max-w-xl mx-auto">
          <div className="bg-brand-container-low/70 border border-white/5 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary-container/10 rounded-full -mr-16 -mt-16 blur-xl" />
            <div className="relative z-10 space-y-4">
              <div>
                <p className="font-label-caps text-[10px] text-brand-on-surface-variant/70 tracking-widest uppercase mb-1">
                  Balanço do Grupo
                </p>
                <div className="flex items-baseline gap-2.5">
                  <span className="font-numeric-xl text-[34px] font-black tracking-tight text-brand-on-surface">
                    R$ {totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className="font-label-caps text-[10px] text-brand-secondary font-bold uppercase tracking-wider">
                    total gasto
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-brand-container-highest/10">
                <div>
                  <p className="font-label-caps text-[10px] text-brand-on-surface-variant/65 uppercase tracking-wider">
                    Você emprestou
                  </p>
                  <p className="text-brand-secondary font-black text-[15px] mt-0.5">
                    R$ {youLent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <p className="font-label-caps text-[10px] text-brand-on-surface-variant/65 uppercase tracking-wider">
                    Você deve
                  </p>
                  <p className="text-brand-error font-black text-[15px] mt-0.5">
                    R$ {youOwe.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              {/* Debt settlement action trigger */}
              {debtBreakdown.length > 0 && (
                <button
                  onClick={() => setShowSettleModal(true)}
                  className="w-full bg-brand-primary-container/10 border border-brand-primary-container/30 text-brand-primary py-2.5 rounded-xl text-xs font-bold transition-all hover:bg-brand-primary-container/20 flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Acertar Contas ({debtBreakdown.length})
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Section: Chronological Feed */}
        <section className="px-6 mt-10 max-w-xl mx-auto space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-headline-md text-[17px] font-bold text-brand-on-surface">Despesas</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`font-label-caps text-[10px] font-bold flex items-center gap-1 py-1 px-2.5 rounded-lg border transition-all ${
                  showFilters
                    ? 'bg-brand-primary-container/20 border-brand-primary-container text-brand-primary'
                    : 'bg-brand-container-low/50 border-white/5 text-brand-on-surface-variant'
                }`}
              >
                Filtrar <Filter className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Search and Filters Drawer */}
          {showFilters && (
            <div className="bg-brand-container-low/60 border border-white/5 p-4 rounded-xl space-y-3 animate-in fade-in duration-200">
              <input
                type="text"
                placeholder="Buscar despesa..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-brand-container border border-brand-container-highest/30 rounded-lg px-3 py-1.5 text-xs text-brand-on-surface placeholder:text-brand-on-surface-variant/40 focus:outline-none focus:border-brand-primary"
              />
              <div className="flex flex-wrap gap-1.5">
                {(['Todos', 'Entretenimento', 'Alimentação', 'Transporte', 'Geral'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilterCategory(cat)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-all ${
                      filterCategory === cat
                        ? 'bg-brand-primary/20 border-brand-primary/40 text-brand-primary'
                        : 'bg-brand-container/30 border-white/5 text-brand-on-surface-variant'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4">
            {filteredExpenses.map((exp) => {
              const payer = groupMembers.find((m) => m.id === exp.paidById);
              const isPayerMe = exp.paidById === 'user-me';
              const isIncluded = exp.splitWithIds.includes('user-me');

              const CatIcon = getCategoryIcon(exp.category);
              const catStyle = getCategoryColor(exp.category);

              // Calculate display cost
              const numSplits = exp.splitWithIds.length;
              const userShare = exp.amount / numSplits;

              return (
                <div
                  key={exp.id}
                  id={`expense-row-${exp.id}`}
                  onClick={() => onEditExpenseClick(exp)}
                  className={`flex items-center gap-4 p-4 rounded-xl bg-brand-container-low/40 hover:bg-brand-container-low border border-white/5 hover:border-white/10 transition-colors group cursor-pointer ${
                    exp.isLiquidated ? 'opacity-50' : ''
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${catStyle}`}>
                    <CatIcon className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className={`font-semibold text-sm truncate text-brand-on-surface ${exp.isLiquidated ? 'line-through' : ''}`}>
                      {exp.title}
                    </h3>
                    <p className="text-xs text-brand-on-surface-variant/60 truncate mt-0.5">
                      Pago por {isPayerMe ? 'Você' : payer?.name} • R$ {exp.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    {exp.isLiquidated ? (
                      <div>
                        <p className="text-[11px] text-brand-on-surface-variant/40 font-semibold uppercase">
                          Liquidado
                        </p>
                        <p className="text-xs font-bold text-brand-on-surface-variant/30 line-through">
                          R$ {userShare.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    ) : isPayerMe ? (
                      <div>
                        <p className="text-xs text-brand-secondary font-bold">Você emprestou</p>
                        <p className="text-xs font-black text-brand-on-surface mt-0.5">
                          R$ {(exp.amount - (isIncluded ? userShare : 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    ) : isIncluded ? (
                      <div>
                        <p className="text-xs text-brand-error font-bold">Você deve</p>
                        <p className="text-xs font-black text-brand-on-surface mt-0.5">
                          R$ {userShare.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-[11px] text-brand-on-surface-variant/65 font-bold italic uppercase tracking-wider">
                          Envolvido
                        </p>
                        <p className="text-[10px] text-brand-on-surface-variant/40 mt-0.5">
                          Sem pendência
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {filteredExpenses.length === 0 && (
              <div className="text-center py-12 text-brand-on-surface-variant/30 space-y-2">
                <p className="text-sm">Nenhuma despesa encontrada.</p>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Floating Action Button for New Expense */}
      <button
        onClick={onAddExpenseClick}
        className="fixed bottom-24 right-6 w-14 h-14 bg-brand-primary-container text-white rounded-full shadow-lg shadow-brand-primary-container/30 flex items-center justify-center active:scale-90 transition-transform z-40 cursor-pointer group"
        title="Adicionar Despesa"
      >
        <Plus className="w-6 h-6 group-hover:scale-110 transition-all" />
      </button>

      {/* Settlement Detailed Balances Bottom Sheet/Modal */}
      {showSettleModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-brand-container-low border border-brand-container-highest/60 rounded-t-2xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-200">
            <header className="flex justify-between items-center px-6 py-4 border-b border-brand-container-highest/20">
              <div>
                <h3 className="font-headline-md text-base font-bold text-brand-on-surface">
                  Acerto de Contas
                </h3>
                <p className="text-xs text-brand-on-surface-variant/60 mt-0.5">
                  Liquide saldos pendentes diretamente por aqui
                </p>
              </div>
              <button
                onClick={() => setShowSettleModal(false)}
                className="p-1 rounded-full text-brand-on-surface-variant/70 hover:text-brand-on-surface hover:bg-white/10 transition-colors"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </header>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="space-y-3">
                {debtBreakdown.map((db) => {
                  const isYouOweThem = db.amount > 0; // positive means you owe them, negative means they owe you
                  const displayAmount = Math.abs(db.amount);

                  return (
                    <div
                      key={db.member?.id}
                      className="bg-brand-container p-4 rounded-xl flex items-center justify-between border border-white/5"
                    >
                      <div className="flex items-center gap-3">
                        {db.member?.avatar ? (
                          <img
                            src={db.member.avatar}
                            alt={db.member.name}
                            className="w-10 h-10 rounded-full object-cover border border-white/10"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-brand-primary-container/20 text-brand-primary flex items-center justify-center font-bold text-xs">
                            {db.member?.name?.substring(0, 1)}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-sm text-brand-on-surface">
                            {db.member?.name}
                          </p>
                          <p className={`text-xs font-semibold mt-0.5 ${isYouOweThem ? 'text-brand-error' : 'text-brand-secondary'}`}>
                            {isYouOweThem ? 'Você deve' : 'Você recebe'}{' '}
                            R$ {displayAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                      </div>

                      {isYouOweThem ? (
                        <button
                          onClick={() => handleQuickSettle(db.member!.id, displayAmount)}
                          className="bg-brand-primary-container hover:bg-brand-primary-container/90 text-white px-3.5 py-1.5 rounded-xl font-bold text-xs transition-colors active:scale-95"
                        >
                          Pagar
                        </button>
                      ) : (
                        <button
                          onClick={() => handleQuickCollect(db.member!.id, displayAmount)}
                          className="bg-brand-secondary-container hover:bg-brand-secondary-container/90 text-white px-3.5 py-1.5 rounded-xl font-bold text-xs transition-colors active:scale-95"
                        >
                          Receber
                        </button>
                      )}
                    </div>
                  );
                })}

                {debtBreakdown.length === 0 && (
                  <div className="text-center py-8 text-brand-on-surface-variant/40 space-y-2">
                    <CheckCircle2 className="w-12 h-12 text-brand-secondary mx-auto stroke-1" />
                    <p className="text-sm">Tudo acertado! Nenhuma pendência neste grupo.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Inline fallback XIcon if not imported
function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      {...props}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
