/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Bell, Copy, Check, ChevronRight, Key, CreditCard, Palette, LogOut, Info, Plus, Trash2 } from 'lucide-react';
import { PixKey, Member } from '../types';

interface ProfileViewProps {
  member: Member;
  pixKeys: PixKey[];
  onAddPixKey: (type: 'CPF' | 'E-mail' | 'Telefone' | 'Chave Aleatória', key: string) => void;
  onDeletePixKey: (id: string) => void;
  onLogout: () => void;
}

export default function ProfileView({
  member,
  pixKeys,
  onAddPixKey,
  onDeletePixKey,
  onLogout,
}: ProfileViewProps) {
  const [copied, setCopied] = useState(false);
  const [showPixManager, setShowPixManager] = useState(false);
  const [newPixType, setNewPixType] = useState<'CPF' | 'E-mail' | 'Telefone' | 'Chave Aleatória'>('E-mail');
  const [newPixVal, setNewPixVal] = useState('');

  const handleCopyCode = () => {
    navigator.clipboard.writeText('MUR-9988');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);

    // Vibration feedback simulator
    if (navigator.vibrate) {
      navigator.vibrate(20);
    }
  };

  const handleAddPix = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPixVal.trim()) return;
    onAddPixKey(newPixType, newPixVal.trim());
    setNewPixVal('');
  };

  return (
    <div className="min-h-screen pb-32 bg-brand-surface text-brand-on-surface animate-in fade-in duration-300">
      {/* Top Header */}
      <header className="sticky top-0 w-full z-30 flex justify-between items-center px-6 h-16 backdrop-blur-xl bg-brand-surface/80 border-b border-brand-container-highest/15">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-brand-container-high">
            <img className="w-full h-full object-cover" src={member.avatar} alt={member.name} />
          </div>
          <span className="font-headline-md text-lg font-bold text-brand-primary">Perfil</span>
        </div>
        <button className="hover:opacity-80 transition-opacity active:scale-95 duration-200">
          <Bell className="w-5 h-5 text-brand-primary" />
        </button>
      </header>

      <main className="px-6 pt-6 max-w-xl mx-auto">
        {/* Profile Card Section */}
        <section className="flex flex-col items-center mb-8">
          <div className="relative mb-4">
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-brand-primary-container ring-4 ring-brand-primary-container/25">
              <img className="w-full h-full object-cover" src={member.avatar} alt={member.name} />
            </div>
            {/* Green Verified Badge */}
            <div className="absolute bottom-0 right-0 bg-brand-secondary w-6 h-6 rounded-full border-2 border-brand-surface flex items-center justify-center shadow-md">
              <span className="text-[10px] text-brand-on-secondary font-extrabold">✓</span>
            </div>
          </div>
          <h1 className="font-headline-md text-xl font-bold text-brand-on-surface mb-1">
            {member.name}
          </h1>
          <p className="font-label-caps text-[10px] text-brand-secondary tracking-widest uppercase font-bold">
            Premium Member
          </p>
        </section>

        {/* Profile Code Card */}
        <section className="bg-gradient-to-br from-brand-primary-container to-brand-primary rounded-2xl p-6 mb-8 shadow-xl relative overflow-hidden active:scale-[0.99] transition-transform">
          {/* Subtle overlay shine */}
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/20 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-label-caps text-[10px] text-brand-on-primary-container/85 tracking-wider uppercase font-semibold">
                Código de Perfil
              </span>
              <Info className="w-4 h-4 text-brand-on-primary-container/80" />
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="font-numeric-xl text-3xl text-brand-on-primary-container font-black tracking-tight">
                MUR-9988
              </span>
              <button
                onClick={handleCopyCode}
                className="bg-white/20 hover:bg-white/35 backdrop-blur-md px-4 py-2 rounded-full font-label-caps text-[10px] text-brand-on-primary-container flex items-center gap-2 transition-all cursor-pointer font-bold"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copiado!' : 'Copiar'}
              </button>
            </div>
            <p className="text-xs text-brand-on-primary-container/70 leading-relaxed font-normal">
              Use este código para vincular contas de convidados e unificar seus gastos em grupos
              compartilhados de forma segura.
            </p>
          </div>
        </section>

        {/* Option List */}
        <section className="bg-brand-container-low/50 border border-white/5 rounded-2xl overflow-hidden shadow-md divide-y divide-brand-container-highest/20 mb-8">
          {/* PIX Keys Manager Toggler */}
          <div
            onClick={() => setShowPixManager(!showPixManager)}
            className="flex items-center justify-between p-4.5 hover:bg-white/5 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-brand-secondary/10 flex items-center justify-center text-brand-secondary">
                <CreditCard className="w-5 h-5" />
              </div>
              <span className="font-semibold text-sm text-brand-on-surface">Minhas Chaves PIX</span>
            </div>
            <ChevronRight className={`w-5 h-5 text-brand-on-surface-variant/40 transition-transform ${showPixManager ? 'rotate-95 text-brand-primary' : ''}`} />
          </div>

          {/* Expanded PIX Keys Subview */}
          {showPixManager && (
            <div className="bg-black/20 p-5 space-y-4 border-b border-brand-container-highest/10 animate-in fade-in duration-200">
              <div className="space-y-3">
                {pixKeys.map((pk) => (
                  <div
                    key={pk.id}
                    className="bg-brand-container-high/40 border border-white/5 p-3 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-[10px] text-brand-secondary tracking-wide block uppercase">
                        {pk.type}
                      </span>
                      <span className="font-mono text-brand-on-surface mt-1 block">
                        {pk.key}
                      </span>
                    </div>
                    <button
                      onClick={() => onDeletePixKey(pk.id)}
                      className="text-brand-on-surface-variant/40 hover:text-brand-error p-1 transition-colors"
                      title="Remover Chave"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {pixKeys.length === 0 && (
                  <p className="text-xs text-brand-on-surface-variant/40 text-center py-2">
                    Nenhuma chave cadastrada. Adicione uma abaixo para receber pagamentos!
                  </p>
                )}
              </div>

              {/* Add Key Form inline */}
              <form onSubmit={handleAddPix} className="space-y-3 pt-2 border-t border-brand-container-highest/10">
                <div className="flex gap-2">
                  <select
                    value={newPixType}
                    onChange={(e: any) => setNewPixType(e.target.value)}
                    className="bg-brand-container border border-brand-container-highest/30 rounded-xl px-2.5 py-2 text-xs text-brand-on-surface focus:outline-none focus:border-brand-primary-container"
                  >
                    <option value="E-mail">E-mail</option>
                    <option value="CPF">CPF</option>
                    <option value="Telefone">Telefone</option>
                    <option value="Chave Aleatória">Aleatória</option>
                  </select>
                  <input
                    type="text"
                    required
                    placeholder="Chave PIX..."
                    value={newPixVal}
                    onChange={(e) => setNewPixVal(e.target.value)}
                    className="flex-1 bg-brand-container border border-brand-container-highest/30 rounded-xl px-3 py-2 text-xs text-brand-on-surface placeholder:text-brand-on-surface-variant/40 focus:outline-none focus:border-brand-primary-container"
                  />
                  <button
                    type="submit"
                    className="bg-brand-primary-container text-white px-3.5 py-2 rounded-xl font-bold text-xs hover:bg-brand-primary-container/90 active:scale-95 transition-all"
                  >
                    Salvar
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Notificações Settings link */}
          <div className="flex items-center justify-between p-4.5 hover:bg-white/5 transition-colors cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                <Bell className="w-5 h-5" />
              </div>
              <span className="font-semibold text-sm text-brand-on-surface">Notificações</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] px-2 py-0.5 bg-brand-secondary/10 text-brand-secondary rounded-full font-bold uppercase tracking-wider">
                Ativas
              </span>
              <ChevronRight className="w-5 h-5 text-brand-on-surface-variant/40" />
            </div>
          </div>

          {/* Appearance Settings link */}
          <div className="flex items-center justify-between p-4.5 hover:bg-white/5 transition-colors cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-brand-container-highest/60 flex items-center justify-center text-brand-primary">
                <Palette className="w-5 h-5 text-brand-primary" />
              </div>
              <span className="font-semibold text-sm text-brand-on-surface">Aparência</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-brand-on-surface-variant/60 font-medium">Dark</span>
              <ChevronRight className="w-5 h-5 text-brand-on-surface-variant/40" />
            </div>
          </div>

          {/* Logout Settings link */}
          <div
            onClick={onLogout}
            className="flex items-center justify-between p-4.5 hover:bg-brand-error/5 transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-brand-error/10 flex items-center justify-center text-brand-error group-hover:bg-brand-error/20 transition-colors">
                <LogOut className="w-5 h-5" />
              </div>
              <span className="font-semibold text-sm text-brand-error">Sair da Conta</span>
            </div>
            <ChevronRight className="w-5 h-5 text-brand-error/40" />
          </div>
        </section>

        {/* Footer / Version info */}
        <footer className="text-center pb-12 pt-4">
          <p className="font-label-caps text-[10px] text-brand-on-surface-variant/40 mb-1.5 tracking-widest font-bold">
            SPLITWISE v4.12.0
          </p>
          <p className="text-[10px] text-brand-on-surface-variant/25 px-8 leading-relaxed">
            Desenvolvido para máxima transparência financeira e simplicidade social.
          </p>
        </footer>
      </main>
    </div>
  );
}
