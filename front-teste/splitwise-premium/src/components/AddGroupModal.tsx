/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Plus, UserPlus } from 'lucide-react';
import { Member } from '../types';

interface AddGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableMembers: Member[];
  onAddGroup: (name: string, avatar: string, selectedMemberIds: string[]) => void;
}

const AVATAR_OPTIONS = ['🏢', '🏖️', '🎉', '⛰️', '🍕', '🍷', '🚲', '✈️', '🎮', '🏠'];

export default function AddGroupModal({
  isOpen,
  onClose,
  availableMembers,
  onAddGroup,
}: AddGroupModalProps) {
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('🏖️');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>(['user-me']);
  const [newGuestName, setNewGuestName] = useState('');

  if (!isOpen) return null;

  const handleToggleMember = (id: string) => {
    if (id === 'user-me') return; // current user is always included
    setSelectedMemberIds((prev) =>
      prev.includes(id) ? prev.filter((mId) => mId !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAddGroup(name.trim(), selectedAvatar, selectedMemberIds);
    setName('');
    setSelectedMemberIds(['user-me']);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-brand-container-low border border-brand-container-highest/60 rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <header className="flex justify-between items-center px-6 py-4 border-b border-brand-container-highest/20">
          <h2 className="font-headline-md text-lg font-bold text-brand-on-surface">Novo Grupo</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-brand-on-surface-variant/70 hover:text-brand-on-surface hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Group Name input */}
          <div className="space-y-2">
            <label className="font-label-caps text-[10px] text-brand-on-surface-variant tracking-wider uppercase">
              Nome do Grupo
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Viagem de Fim de Ano, Casa Nova"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-brand-container border-2 border-brand-container-highest/30 rounded-xl px-4 py-3 text-brand-on-surface placeholder:text-brand-on-surface-variant/40 focus:border-brand-primary-container focus:outline-none transition-colors"
            />
          </div>

          {/* Group Icon picker */}
          <div className="space-y-2">
            <label className="font-label-caps text-[10px] text-brand-on-surface-variant tracking-wider uppercase">
              Ícone / Avatar
            </label>
            <div className="flex flex-wrap gap-2 py-1">
              {AVATAR_OPTIONS.map((avatar) => (
                <button
                  key={avatar}
                  type="button"
                  onClick={() => setSelectedAvatar(avatar)}
                  className={`w-10 h-10 text-xl rounded-xl flex items-center justify-center transition-all ${
                    selectedAvatar === avatar
                      ? 'bg-brand-primary-container text-white scale-110 shadow-lg shadow-brand-primary-container/25'
                      : 'bg-brand-container-highest/30 hover:bg-brand-container-highest/60 text-brand-on-surface'
                  }`}
                >
                  {avatar}
                </button>
              ))}
            </div>
          </div>

          {/* Member list selector */}
          <div className="space-y-2">
            <label className="font-label-caps text-[10px] text-brand-on-surface-variant tracking-wider uppercase">
              Membros do Grupo
            </label>
            <div className="max-h-48 overflow-y-auto divide-y divide-brand-container-highest/20 pr-1 space-y-1">
              {availableMembers
                .filter((m) => m.id !== 'member-guest') // exclude default temporary guest
                .map((member) => {
                  const isSelected = selectedMemberIds.includes(member.id);
                  const isCurrentUser = member.id === 'user-me';

                  return (
                    <div
                      key={member.id}
                      onClick={() => handleToggleMember(member.id)}
                      className={`flex items-center justify-between py-2 px-3 rounded-lg cursor-pointer transition-colors ${
                        isCurrentUser ? 'opacity-80 cursor-default' : 'hover:bg-brand-container-high/40'
                      }`}
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
                        <span className="text-sm font-medium text-brand-on-surface">
                          {member.name} {isCurrentUser && <span className="text-xs text-brand-on-surface-variant/60">(Você)</span>}
                        </span>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                          isSelected
                            ? 'bg-brand-secondary border-brand-secondary text-brand-on-secondary'
                            : 'border-brand-on-surface-variant/30'
                        }`}
                      >
                        {isSelected && (
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={3}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            className="w-full mt-4 bg-brand-primary-container text-white font-semibold py-4 rounded-xl shadow-lg shadow-brand-primary-container/30 hover:shadow-xl active:scale-[0.98] transition-all"
          >
            Criar Grupo
          </button>
        </form>
      </div>
    </div>
  );
}
