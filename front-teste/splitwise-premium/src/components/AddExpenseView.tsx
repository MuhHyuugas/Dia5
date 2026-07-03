/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, Calendar, Plus, ChevronRight, Check, Trash2, Ticket, Utensils, Car, Layers } from 'lucide-react';
import { Group, Member, Expense, ExpenseCategory } from '../types';

interface AddExpenseViewProps {
  group: Group;
  members: Member[];
  onClose: () => void;
  onSave: (expenseData: {
    title: string;
    amount: number;
    paidById: string;
    splitWithIds: string[];
    category: ExpenseCategory;
    date: string;
  }) => void;
  editingExpense?: Expense;
  onDelete?: (expenseId: string) => void;
}

const CATEGORIES: { name: ExpenseCategory; icon: any }[] = [
  { name: 'Entretenimento', icon: Ticket },
  { name: 'Alimentação', icon: Utensils },
  { name: 'Transporte', icon: Car },
  { name: 'Geral', icon: Layers },
];

export default function AddExpenseView({
  group,
  members,
  onClose,
  onSave,
  editingExpense,
  onDelete,
}: AddExpenseViewProps) {
  // Filter members belonging to this group
  const groupMembers = members.filter((m) => group.memberIds.includes(m.id));

  // Form states
  const [amountStr, setAmountStr] = useState(editingExpense ? editingExpense.amount.toFixed(2) : '450.00');
  const [title, setTitle] = useState(editingExpense ? editingExpense.title : '');
  const [paidById, setPaidById] = useState(editingExpense ? editingExpense.paidById : 'user-me');
  const [splitWithIds, setSplitWithIds] = useState<string[]>(
    editingExpense ? editingExpense.splitWithIds : groupMembers.map((m) => m.id)
  );
  const [category, setCategory] = useState<ExpenseCategory>(
    editingExpense ? editingExpense.category : 'Entretenimento'
  );
  const [dateType, setDateType] = useState<'Hoje' | 'Ontem'>('Hoje');
  const [showPayerDropdown, setShowPayerDropdown] = useState(false);
  const [showAddPersonInput, setShowAddPersonInput] = useState(false);
  const [newPersonName, setNewPersonName] = useState('');

  // Handle temporary addition of guest members
  const [localGroupMembers, setLocalGroupMembers] = useState<Member[]>(groupMembers);

  useEffect(() => {
    setLocalGroupMembers(members.filter((m) => group.memberIds.includes(m.id)));
  }, [members, group]);

  const amount = parseFloat(amountStr) || 0;
  const numSplitPeople = splitWithIds.length;
  const splitShare = numSplitPeople > 0 ? amount / numSplitPeople : 0;

  const handleToggleSplit = (memberId: string) => {
    setSplitWithIds((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId) // remove
        : [...prev, memberId] // add
    );
  };

  const handleAddGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPersonName.trim()) return;

    // Create a guest member ID
    const guestId = `guest-${Date.now()}`;
    const newGuest: Member = {
      id: guestId,
      name: newPersonName.trim(),
      avatar: '', // fallback avatar
    };

    // Add directly to group member IDs list
    group.memberIds.push(guestId);
    // Also push to shared members array
    members.push(newGuest);

    // Update local lists
    setLocalGroupMembers((prev) => [...prev, newGuest]);
    setSplitWithIds((prev) => [...prev, guestId]);
    setNewPersonName('');
    setShowAddPersonInput(false);
  };

  const handleSave = () => {
    if (!title.trim()) {
      alert('Por favor, informe uma descrição para a despesa.');
      return;
    }
    if (amount <= 0) {
      alert('Por favor, informe um valor maior que zero.');
      return;
    }
    if (splitWithIds.length === 0) {
      alert('Por favor, selecione pelo menos uma pessoa para dividir.');
      return;
    }

    const isoDate = dateType === 'Hoje' ? new Date().toISOString() : new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    onSave({
      title: title.trim(),
      amount,
      paidById,
      splitWithIds,
      category,
      date: isoDate,
    });
  };

  const activePayer = localGroupMembers.find((m) => m.id === paidById) || localGroupMembers[0];

  return (
    <div className="min-h-screen bg-brand-surface text-brand-on-surface pb-32 animate-in fade-in duration-300">
      {/* Header Bar */}
      <header className="sticky top-0 z-30 bg-brand-surface/90 backdrop-blur-xl border-b border-brand-container-highest/15 flex justify-between items-center px-6 h-16">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 -ml-2 text-brand-on-surface-variant/80 hover:text-brand-on-surface hover:bg-white/5 rounded-full transition-colors active:scale-95"
          >
            <X className="w-6 h-6" />
          </button>
          <h1 className="font-headline-md text-lg font-bold tracking-tight text-brand-on-surface">
            {editingExpense ? 'Editar Despesa' : 'Nova Despesa'}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {editingExpense && onDelete && (
            <button
              onClick={() => onDelete(editingExpense.id)}
              className="p-2 text-brand-error hover:bg-brand-error/10 rounded-full transition-colors mr-1"
              title="Excluir Despesa"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
          <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10">
            <img
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBrd_pMSoSi-yFxIZDwjVFKr0w4tmubu7floqwhq_08ztVIPWN5VI_soRvYbnmAcKtRRPeOHa36K2AaPDhBXyjn7X5S9JS2EgxZ5LsrZmZoC7b7Kjy4iUdiY-ZZC9rFvl_vJSYj5Gl2yyy3y29gwvHbvNzGlbAO9wrNV9c8cTNVrDs9d0b1-4hghSZ5CLgrhZm9Z6WO5JfBrwJ7mCVg2nwarj6XZyj4z9qcVbZg1OpNu5UgM50d7p5IeqsJeyYG6F9RN4ZGCZw1SL1k"
              alt="User"
            />
          </div>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-6 pt-6">
        {/* Section: Centered Amount & Description */}
        <section className="py-8 text-center space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="inline-flex flex-col items-center gap-2 w-full">
            <div className="flex items-baseline justify-center gap-1.5 text-brand-primary font-bold">
              <span className="text-xl">R$</span>
              <input
                type="number"
                step="0.01"
                placeholder="0,00"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                className="bg-transparent border-none font-numeric-xl text-[44px] text-center text-brand-primary w-56 font-bold tracking-tight focus:ring-0 focus:outline-none placeholder:text-brand-container-highest/60 selection:bg-brand-primary-container/30"
              />
            </div>
            <div className="relative w-full max-w-xs border-b-2 border-brand-container-highest/30 focus-within:border-brand-primary-container transition-colors duration-300">
              <input
                type="text"
                placeholder="Descrição (ex: Ingressos Show, Almoço)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-transparent border-none py-2 text-center font-body-lg text-brand-on-surface focus:ring-0 focus:outline-none placeholder:text-brand-on-surface-variant/40"
              />
            </div>
          </div>
        </section>

        {/* Section: Payer */}
        <section className="mt-4 relative">
          <h3 className="font-label-caps text-[10px] text-brand-on-surface-variant tracking-wider uppercase mb-2">
            Pago por
          </h3>
          <div
            onClick={() => setShowPayerDropdown(!showPayerDropdown)}
            className="bg-brand-container-low rounded-xl p-4 flex items-center justify-between border border-white/5 shadow-sm hover:bg-brand-container transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              {activePayer?.avatar ? (
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-brand-primary">
                  <img
                    className="w-full h-full object-cover"
                    src={activePayer.avatar}
                    alt={activePayer.name}
                  />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-brand-primary-container/20 text-brand-primary flex items-center justify-center font-bold text-xs">
                  {activePayer?.name?.substring(0, 1)}
                </div>
              )}
              <div>
                <p className="font-semibold text-sm text-brand-on-surface">{activePayer?.name}</p>
                <p className="text-xs text-brand-on-surface-variant/60">
                  {activePayer?.isCurrentUser ? 'Individualmente' : 'Membro do grupo'}
                </p>
              </div>
            </div>
            <ChevronRight className={`w-5 h-5 text-brand-on-surface-variant/50 transition-transform ${showPayerDropdown ? 'rotate-90' : ''}`} />
          </div>

          {/* Custom dropdown overlay */}
          {showPayerDropdown && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-brand-container-low border border-brand-container-highest/60 rounded-xl overflow-hidden shadow-2xl z-40 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="p-1 divide-y divide-brand-container-highest/10">
                {localGroupMembers.map((member) => (
                  <button
                    key={member.id}
                    onClick={() => {
                      setPaidById(member.id);
                      setShowPayerDropdown(false);
                    }}
                    className="w-full flex items-center justify-between p-3 hover:bg-white/5 transition-colors rounded-lg text-left"
                  >
                    <div className="flex items-center gap-3">
                      {member.avatar ? (
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-8 h-8 rounded-full object-cover border border-white/10"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-brand-primary-container/20 text-brand-primary flex items-center justify-center font-bold text-xs">
                          {member.name.substring(0, 1)}
                        </div>
                      )}
                      <span className="text-sm font-medium text-brand-on-surface">{member.name}</span>
                    </div>
                    {paidById === member.id && (
                      <Check className="w-4 h-4 text-brand-secondary" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Section: Split Details */}
        <section className="mt-8">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-label-caps text-[10px] text-brand-on-surface-variant tracking-wider uppercase">
              Dividido entre
            </h3>
            <span className="text-[10px] font-bold text-brand-primary uppercase tracking-wide">
              Editar Split
            </span>
          </div>

          <div className="space-y-2.5">
            {localGroupMembers.map((member) => {
              const isChecked = splitWithIds.includes(member.id);
              return (
                <div
                  key={member.id}
                  onClick={() => handleToggleSplit(member.id)}
                  className="bg-brand-container-low/80 hover:bg-brand-container-low rounded-xl p-4 flex items-center justify-between shadow-sm border border-white/5 hover:border-brand-container-highest/20 cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                        isChecked
                          ? 'bg-brand-primary-container border-brand-primary-container text-white'
                          : 'border-brand-on-surface-variant/20'
                      }`}
                    >
                      {isChecked && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
                    </div>

                    <div className="flex items-center gap-2.5">
                      {member.avatar ? (
                        <img
                          className="w-8 h-8 rounded-full object-cover border border-white/5"
                          src={member.avatar}
                          alt={member.name}
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-brand-primary-container/20 text-brand-primary flex items-center justify-center font-bold text-xs">
                          {member.name.substring(0, 1)}
                        </div>
                      )}
                      <span className="font-semibold text-sm text-brand-on-surface">
                        {member.name}
                      </span>
                      {member.id.startsWith('guest-') && (
                        <span className="px-1.5 py-0.5 bg-brand-container-highest/60 text-[8px] font-bold rounded text-brand-on-surface-variant uppercase tracking-wide">
                          Guest
                        </span>
                      )}
                    </div>
                  </div>
                  <span className={`font-semibold text-sm ${isChecked ? 'text-brand-on-surface' : 'text-brand-on-surface-variant/30'}`}>
                    R$ {isChecked ? splitShare.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0,00'}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Button: Add Temporary Person */}
          {!showAddPersonInput ? (
            <button
              onClick={() => setShowAddPersonInput(true)}
              className="w-full mt-3.5 flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-brand-container-highest/40 text-brand-on-surface-variant hover:text-brand-on-surface hover:bg-brand-container-low/40 transition-all font-label-caps text-[11px] tracking-wider uppercase"
            >
              <Plus className="w-4 h-4" /> Adicionar Pessoa
            </button>
          ) : (
            <form onSubmit={handleAddGuest} className="mt-3.5 flex gap-2 animate-in fade-in duration-200">
              <input
                type="text"
                autoFocus
                placeholder="Nome da pessoa"
                value={newPersonName}
                onChange={(e) => setNewPersonName(e.target.value)}
                className="flex-1 bg-brand-container border-2 border-brand-container-highest/30 rounded-xl px-4 py-2 text-sm text-brand-on-surface placeholder:text-brand-on-surface-variant/40 focus:border-brand-primary-container focus:outline-none"
              />
              <button
                type="submit"
                className="bg-brand-primary-container text-white px-4 rounded-xl font-semibold text-sm active:scale-95 transition-transform"
              >
                Incluir
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddPersonInput(false);
                  setNewPersonName('');
                }}
                className="bg-brand-container-high/40 text-brand-on-surface-variant px-3 rounded-xl hover:bg-brand-container-high"
              >
                Cancelar
              </button>
            </form>
          )}
        </section>

        {/* Section: Category Selection Chips */}
        <section className="mt-8">
          <h3 className="font-label-caps text-[10px] text-brand-on-surface-variant tracking-wider uppercase mb-2">
            Categoria
          </h3>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected = category === cat.name;
              return (
                <button
                  key={cat.name}
                  onClick={() => setCategory(cat.name)}
                  className={`px-4 py-2.5 rounded-full border flex items-center gap-2 transition-all cursor-pointer active:scale-95 text-xs font-semibold ${
                    isSelected
                      ? 'bg-brand-primary-container/20 border-brand-primary-container/50 text-brand-primary shadow-sm shadow-brand-primary-container/10'
                      : 'bg-brand-container-high/40 border-white/5 text-brand-on-surface-variant hover:border-brand-container-highest/40'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Section: Date */}
        <section className="mt-6">
          <h3 className="font-label-caps text-[10px] text-brand-on-surface-variant tracking-wider uppercase mb-2">
            Data
          </h3>
          <div className="flex gap-2">
            {(['Hoje', 'Ontem'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setDateType(type)}
                className={`px-4 py-2.5 rounded-full border text-xs font-semibold flex items-center gap-2 active:scale-95 transition-all cursor-pointer ${
                  dateType === type
                    ? 'bg-brand-container-highest/60 border-brand-primary/25 text-brand-primary'
                    : 'bg-brand-container-high/40 border-white/5 text-brand-on-surface-variant/80'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>{type}</span>
              </button>
            ))}
          </div>
        </section>
      </main>

      {/* Sticky Bottom Footer Action Button */}
      <footer className="fixed bottom-0 left-0 w-full p-6 bg-gradient-to-t from-brand-surface via-brand-surface to-transparent z-30">
        <div className="max-w-xl mx-auto">
          <button
            onClick={handleSave}
            className="w-full bg-brand-primary-container text-brand-on-primary-container py-4.5 rounded-xl font-headline-md text-base font-bold shadow-[0_12px_24px_-8px_rgba(124,58,237,0.4)] hover:shadow-lg hover:shadow-brand-primary-container/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            {editingExpense ? 'Atualizar Despesa' : 'Salvar Despesa'}
          </button>
        </div>
      </footer>
    </div>
  );
}
