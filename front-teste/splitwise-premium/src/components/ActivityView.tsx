/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Bell, CreditCard, Receipt, UserPlus, Users, Sparkles, CheckCircle2 } from 'lucide-react';
import { Activity } from '../types';

interface ActivityViewProps {
  activities: Activity[];
}

export default function ActivityView({ activities }: ActivityViewProps) {
  // Group activities by relative days
  const todayActivities = activities.filter((act) => {
    // Items that have relative descriptions containing "min", "horas", "Hoje" or are within 18 hours
    const isToday =
      act.timeDescription.includes('min') ||
      act.timeDescription.includes('horas') ||
      act.timeDescription.includes('Hoje');
    return isToday;
  });

  const weekActivities = activities.filter((act) => {
    const isWeek =
      act.timeDescription.includes('Ontem') ||
      act.timeDescription.includes('Terça-feira') ||
      act.timeDescription.includes('Esta semana');
    return isWeek;
  });

  const olderActivities = activities.filter((act) => {
    return !todayActivities.includes(act) && !weekActivities.includes(act);
  });

  const getIconForType = (type: string) => {
    switch (type) {
      case 'payment':
        return {
          icon: CreditCard,
          bgClass: 'bg-brand-secondary-container text-white',
        };
      case 'expense':
        return {
          icon: Receipt,
          bgClass: 'bg-brand-primary-container text-white',
        };
      case 'join':
        return {
          icon: Users,
          bgClass: 'bg-brand-container-highest/60 text-brand-on-surface-variant',
        };
      case 'invite':
        return {
          icon: UserPlus,
          bgClass: 'bg-brand-container-highest/60 text-brand-on-surface-variant',
        };
      default:
        return {
          icon: Sparkles,
          bgClass: 'bg-brand-container-highest/60 text-brand-on-surface-variant',
        };
    }
  };

  const renderActivityItem = (act: Activity, idx: number, listLength: number) => {
    const { icon: Icon, bgClass } = getIconForType(act.type);
    const hasNext = idx < listLength - 1;

    return (
      <div key={act.id} className="relative flex gap-4 animate-in fade-in duration-300">
        {/* Timeline line indicator connecting items */}
        {hasNext && (
          <div className="absolute left-7 top-14 bottom-[-16px] w-[2px] bg-gradient-to-b from-brand-primary/20 to-transparent" />
        )}

        {/* Floating Circular Icon */}
        <div className={`z-10 w-14 h-14 rounded-full flex items-center justify-center shrink-0 shadow-lg ${bgClass}`}>
          <Icon className="w-6 h-6" />
        </div>

        {/* Content Card */}
        <div className="bg-brand-container-low/40 border border-white/5 p-4 rounded-xl flex-1 hover:bg-brand-container-low/60 transition-colors">
          <p className="text-[14px] text-brand-on-surface leading-snug">
            {/* Find key names to style them bold */}
            {act.title.split(' ').map((word, wIdx) => {
              const isBold =
                word === 'Maria' ||
                word === 'João' ||
                word === 'Ricardo' ||
                word === 'Você' ||
                word.startsWith('R$') ||
                word === 'República' ||
                word === 'Churrasco' ||
                word === 'Viagem' ||
                word === 'Praia' ||
                word === 'Rio';
              return (
                <span key={wIdx} className={isBold ? 'font-bold' : ''}>
                  {word}{' '}
                </span>
              );
            })}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="font-label-caps text-[10px] text-brand-on-surface-variant/50">
              {act.timeDescription}
            </span>
            {act.groupName && (
              <>
                <span className="w-1 h-1 rounded-full bg-brand-container-highest" />
                <span className="font-label-caps text-[10px] text-brand-on-surface-variant/50">
                  {act.groupName}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen pb-32 bg-brand-surface text-brand-on-surface">
      {/* Top Bar */}
      <header className="sticky top-0 w-full z-30 flex justify-between items-center px-6 h-16 bg-brand-surface/80 backdrop-blur-xl border-b border-brand-container-highest/15">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-brand-container-high ring-1 ring-white/10">
            <img
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuC4xq5l_QK0emRp34xr5EVjrmffqbAjGzwTEsoG2aCYDtnX8OMqE-xqu2BR77lnFAHyAucKuEFTkqxC4Ils6QGhb6F4qOrxM2IiK225de2beDlNfrDiJ4NNN7CXdZ9UTW6LpmUku1yJ2J_93I70Vogs1bSR_QY0h40zQRLNw5lLlFNmcMRXu06XfWaFMWCKeAMoiVdtTuwZHrRWM442wqFyHor14Ze3J3-KAQWL23_yHJJdsZPOI3ZlI3Pl0KLLmTTKnBZB4pLzQyVM"
              alt="User"
            />
          </div>
          <h1 className="font-headline-md text-lg font-bold text-brand-primary">Atividades</h1>
        </div>
        <button className="text-brand-primary hover:opacity-80 transition-opacity active:scale-95 duration-200">
          <Bell className="w-5 h-5" />
        </button>
      </header>

      <main className="px-6 pt-6 max-w-xl mx-auto space-y-8">
        {/* Today Section */}
        {todayActivities.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-label-caps text-[11px] text-brand-on-surface-variant/70 tracking-wider uppercase">
              Hoje
            </h3>
            <div className="space-y-6">
              {todayActivities.map((act, idx) =>
                renderActivityItem(act, idx, todayActivities.length)
              )}
            </div>
          </div>
        )}

        {/* Week Section */}
        {weekActivities.length > 0 && (
          <div className="space-y-4 pt-4">
            <h3 className="font-label-caps text-[11px] text-brand-on-surface-variant/70 tracking-wider uppercase">
              Esta Semana
            </h3>
            <div className="space-y-6">
              {weekActivities.map((act, idx) =>
                renderActivityItem(act, idx, weekActivities.length)
              )}
            </div>
          </div>
        )}

        {/* Older Section */}
        {olderActivities.length > 0 && (
          <div className="space-y-4 pt-4">
            <h3 className="font-label-caps text-[11px] text-brand-on-surface-variant/70 tracking-wider uppercase">
              Anteriores
            </h3>
            <div className="space-y-6">
              {olderActivities.map((act, idx) =>
                renderActivityItem(act, idx, olderActivities.length)
              )}
            </div>
          </div>
        )}

        {activities.length === 0 && (
          <div className="text-center py-16 text-brand-on-surface-variant/40 space-y-3">
            <CheckCircle2 className="w-12 h-12 mx-auto stroke-1" />
            <p className="text-sm">Nenhuma atividade registrada ainda.</p>
          </div>
        )}
      </main>
    </div>
  );
}
