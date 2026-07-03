/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LayoutGrid, Users, Bell, User } from 'lucide-react';

interface BottomNavBarProps {
  currentTab: 'dashboard' | 'groups' | 'activity' | 'account';
  onTabChange: (tab: 'dashboard' | 'groups' | 'activity' | 'account') => void;
  unreadActivitiesCount?: number;
}

export default function BottomNavBar({
  currentTab,
  onTabChange,
  unreadActivitiesCount = 0,
}: BottomNavBarProps) {
  const tabs = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutGrid },
    { id: 'groups' as const, label: 'Groups', icon: Users },
    { id: 'activity' as const, label: 'Activity', icon: Bell, badge: unreadActivitiesCount },
    { id: 'account' as const, label: 'Account', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full z-40 bg-brand-container-low/95 backdrop-blur-2xl border-t border-brand-container-highest/40 shadow-[0_-10px_30px_rgba(0,0,0,0.4)] flex justify-around items-center px-4 pt-3 pb-safe h-20 rounded-t-2xl">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id;
        return (
          <button
            key={tab.id}
            id={`nav-tab-${tab.id}`}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-300 relative ${
              isActive
                ? 'text-brand-secondary font-bold scale-105 bg-white/5'
                : 'text-brand-on-surface-variant/60 hover:text-brand-on-surface'
            }`}
          >
            <div className="relative">
              <Icon className={`w-6 h-6 ${isActive ? 'fill-brand-secondary/10 text-brand-secondary' : ''}`} />
              {tab.badge && tab.badge > 0 ? (
                <span className="absolute -top-1.5 -right-1.5 bg-brand-primary-container text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                  {tab.badge}
                </span>
              ) : null}
            </div>
            <span className="font-label-caps text-[10px] mt-1 uppercase tracking-wider">
              {tab.label}
            </span>
            {isActive && (
              <span className="absolute bottom-1 w-1.5 h-1.5 bg-brand-secondary rounded-full" />
            )}
          </button>
        );
      })}
    </nav>
  );
}
