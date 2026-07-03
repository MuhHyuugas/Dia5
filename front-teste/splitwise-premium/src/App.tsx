/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Group, Member, Expense, Activity, PixKey, ExpenseCategory } from './types';
import {
  INITIAL_GROUPS,
  INITIAL_MEMBERS,
  INITIAL_EXPENSES,
  INITIAL_ACTIVITIES,
  INITIAL_PIX_KEYS,
  calculateUserBalances,
} from './data';

// Component Imports
import BottomNavBar from './components/BottomNavBar';
import DashboardView from './components/DashboardView';
import GroupDetailsView from './components/GroupDetailsView';
import AddExpenseView from './components/AddExpenseView';
import ActivityView from './components/ActivityView';
import ProfileView from './components/ProfileView';
import AddGroupModal from './components/AddGroupModal';

export default function App() {
  // Navigation States
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'groups' | 'activity' | 'account'>('dashboard');
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isAddGroupOpen, setIsAddGroupOpen] = useState(false);

  // Core Reactive States (loaded from localStorage if exists, otherwise fallback to defaults)
  const [groups, setGroups] = useState<Group[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [pixKeys, setPixKeys] = useState<PixKey[]>([]);

  // Track unread activities count
  const [unreadActivitiesCount, setUnreadActivitiesCount] = useState(1);

  // Initialize States from localStorage or default static mockup data
  useEffect(() => {
    try {
      const storedGroups = localStorage.getItem('sw_groups');
      const storedMembers = localStorage.getItem('sw_members');
      const storedExpenses = localStorage.getItem('sw_expenses');
      const storedActivities = localStorage.getItem('sw_activities');
      const storedPixKeys = localStorage.getItem('sw_pixKeys');

      if (storedGroups) setGroups(JSON.parse(storedGroups));
      else {
        setGroups(INITIAL_GROUPS);
        localStorage.setItem('sw_groups', JSON.stringify(INITIAL_GROUPS));
      }

      if (storedMembers) setMembers(JSON.parse(storedMembers));
      else {
        setMembers(INITIAL_MEMBERS);
        localStorage.setItem('sw_members', JSON.stringify(INITIAL_MEMBERS));
      }

      if (storedExpenses) setExpenses(JSON.parse(storedExpenses));
      else {
        setExpenses(INITIAL_EXPENSES);
        localStorage.setItem('sw_expenses', JSON.stringify(INITIAL_EXPENSES));
      }

      if (storedActivities) setActivities(JSON.parse(storedActivities));
      else {
        // Convert static dates to Date objects then serialize
        setActivities(INITIAL_ACTIVITIES);
        localStorage.setItem('sw_activities', JSON.stringify(INITIAL_ACTIVITIES));
      }

      if (storedPixKeys) setPixKeys(JSON.parse(storedPixKeys));
      else {
        setPixKeys(INITIAL_PIX_KEYS);
        localStorage.setItem('sw_pixKeys', JSON.stringify(INITIAL_PIX_KEYS));
      }
    } catch (e) {
      console.error('Error loading localStorage state', e);
      // Fallback
      setGroups(INITIAL_GROUPS);
      setMembers(INITIAL_MEMBERS);
      setExpenses(INITIAL_EXPENSES);
      setActivities(INITIAL_ACTIVITIES);
      setPixKeys(INITIAL_PIX_KEYS);
    }
  }, []);

  // Helper helper to persist state changes on the fly
  const saveToLocalStorage = (key: string, data: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error('Error saving to localStorage', e);
    }
  };

  // Calculate live dynamic balances using our Split Engine
  const { globalBalance, netBalancePerGroup } = calculateUserBalances(expenses, 'user-me');

  // Handle Tab changes
  const handleTabChange = (tab: 'dashboard' | 'groups' | 'activity' | 'account') => {
    setCurrentTab(tab);
    setActiveGroupId(null); // Return to standard group list when toggling tab
    if (tab === 'activity') {
      setUnreadActivitiesCount(0); // Mark activities as read
    }
  };

  // Add Group Flow
  const handleAddGroup = (name: string, avatar: string, selectedMemberIds: string[]) => {
    const newGroup: Group = {
      id: `group-${Date.now()}`,
      name,
      avatar,
      memberIds: selectedMemberIds,
    };

    const updatedGroups = [newGroup, ...groups];
    setGroups(updatedGroups);
    saveToLocalStorage('sw_groups', updatedGroups);

    // Create activity log
    const newAct: Activity = {
      id: `act-${Date.now()}`,
      title: `Você criou o grupo ${name}`,
      timeDescription: 'Hoje',
      groupName: name,
      type: 'join',
      date: new Date(),
    };
    const updatedActivities = [newAct, ...activities];
    setActivities(updatedActivities);
    saveToLocalStorage('sw_activities', updatedActivities);
    setUnreadActivitiesCount((prev) => prev + 1);
  };

  // Add Member to Group Flow
  const handleAddMemberToActiveGroup = (name: string) => {
    if (!activeGroupId) return;

    // Create a new member
    const newMemberId = `member-${Date.now()}`;
    const newMember: Member = {
      id: newMemberId,
      name,
      avatar: '', // fallback avatar
    };

    const updatedMembers = [...members, newMember];
    setMembers(updatedMembers);
    saveToLocalStorage('sw_members', updatedMembers);

    // Add member id to current active group
    const updatedGroups = groups.map((g) => {
      if (g.id === activeGroupId) {
        return {
          ...g,
          memberIds: [...g.memberIds, newMemberId],
        };
      }
      return g;
    });
    setGroups(updatedGroups);
    saveToLocalStorage('sw_groups', updatedGroups);

    // Log activity
    const activeGroup = groups.find((g) => g.id === activeGroupId);
    const newAct: Activity = {
      id: `act-${Date.now()}`,
      title: `Você convidou ${name} para o grupo ${activeGroup?.name || ''}`,
      timeDescription: 'Hoje',
      groupName: activeGroup?.name,
      type: 'invite',
      date: new Date(),
    };
    const updatedActivities = [newAct, ...activities];
    setActivities(updatedActivities);
    saveToLocalStorage('sw_activities', updatedActivities);
    setUnreadActivitiesCount((prev) => prev + 1);
  };

  // Save Expense Flow (Add or Edit)
  const handleSaveExpense = (expenseData: {
    title: string;
    amount: number;
    paidById: string;
    splitWithIds: string[];
    category: ExpenseCategory;
    date: string;
  }) => {
    const targetGroupId = activeGroupId || groups[0]?.id || 'group-republica';

    if (editingExpense) {
      // Editing Mode
      const updatedExpenses = expenses.map((exp) => {
        if (exp.id === editingExpense.id) {
          return {
            ...exp,
            ...expenseData,
          };
        }
        return exp;
      });
      setExpenses(updatedExpenses);
      saveToLocalStorage('sw_expenses', updatedExpenses);

      // Log activity
      const groupName = groups.find((g) => g.id === targetGroupId)?.name || '';
      const newAct: Activity = {
        id: `act-${Date.now()}`,
        title: `Você editou a despesa ${expenseData.title} de R$ ${expenseData.amount.toFixed(2)} no grupo ${groupName}`,
        timeDescription: 'Hoje',
        groupName,
        type: 'expense',
        amount: expenseData.amount,
        date: new Date(),
      };
      const updatedActivities = [newAct, ...activities];
      setActivities(updatedActivities);
      saveToLocalStorage('sw_activities', updatedActivities);
    } else {
      // Adding Mode
      const newExpense: Expense = {
        id: `exp-${Date.now()}`,
        groupId: targetGroupId,
        ...expenseData,
      };

      const updatedExpenses = [newExpense, ...expenses];
      setExpenses(updatedExpenses);
      saveToLocalStorage('sw_expenses', updatedExpenses);

      // Log activity
      const groupName = groups.find((g) => g.id === targetGroupId)?.name || '';
      const payerName = members.find((m) => m.id === expenseData.paidById)?.name || 'Alguém';
      const payerLabel = expenseData.paidById === 'user-me' ? 'Você' : payerName;

      const newAct: Activity = {
        id: `act-${Date.now()}`,
        title: `${payerLabel} adicionou a despesa ${expenseData.title} de R$ ${expenseData.amount.toFixed(2)} no grupo ${groupName}`,
        timeDescription: 'Hoje',
        groupName,
        type: 'expense',
        amount: expenseData.amount,
        date: new Date(),
      };
      const updatedActivities = [newAct, ...activities];
      setActivities(updatedActivities);
      saveToLocalStorage('sw_activities', updatedActivities);
      setUnreadActivitiesCount((prev) => prev + 1);
    }

    // Reset modals and overlays
    setIsAddingExpense(false);
    setEditingExpense(null);
  };

  // Delete Expense Flow
  const handleDeleteExpense = (expenseId: string) => {
    const updatedExpenses = expenses.filter((e) => e.id !== expenseId);
    setExpenses(updatedExpenses);
    saveToLocalStorage('sw_expenses', updatedExpenses);

    setIsAddingExpense(false);
    setEditingExpense(null);
  };

  // Settle Debt Flow
  const handleSettleDebt = (payerId: string, receiverId: string, amount: number) => {
    if (!activeGroupId) return;

    // Settle all active expenses in this group to reset the ledger
    const updatedExpenses = expenses.map((exp) => {
      if (exp.groupId === activeGroupId) {
        return {
          ...exp,
          isLiquidated: true,
        };
      }
      return exp;
    });
    setExpenses(updatedExpenses);
    saveToLocalStorage('sw_expenses', updatedExpenses);

    // Get group info
    const groupName = groups.find((g) => g.id === activeGroupId)?.name || '';
    const receiverName = members.find((m) => m.id === receiverId)?.name || '';

    // Log Activity
    const newAct: Activity = {
      id: `act-${Date.now()}`,
      title: `Você quitou a dívida de R$ ${amount.toFixed(2)} com ${receiverName}`,
      timeDescription: 'Hoje',
      groupName,
      type: 'payment',
      amount,
      date: new Date(),
    };
    const updatedActivities = [newAct, ...activities];
    setActivities(updatedActivities);
    saveToLocalStorage('sw_activities', updatedActivities);
    setUnreadActivitiesCount((prev) => prev + 1);
  };

  // Add PIX Key Flow
  const handleAddPixKey = (type: 'CPF' | 'E-mail' | 'Telefone' | 'Chave Aleatória', key: string) => {
    const newKey: PixKey = {
      id: `pix-${Date.now()}`,
      type,
      key,
    };
    const updatedKeys = [...pixKeys, newKey];
    setPixKeys(updatedKeys);
    saveToLocalStorage('sw_pixKeys', updatedKeys);
  };

  // Delete PIX Key Flow
  const handleDeletePixKey = (id: string) => {
    const updatedKeys = pixKeys.filter((pk) => pk.id !== id);
    setPixKeys(updatedKeys);
    saveToLocalStorage('sw_pixKeys', updatedKeys);
  };

  // Render active view based on routing states
  const renderActiveView = () => {
    if (isAddingExpense || editingExpense) {
      // Find current active group
      const targetGroup = groups.find((g) => g.id === activeGroupId) || groups[0] || INITIAL_GROUPS[0];
      return (
        <AddExpenseView
          group={targetGroup}
          members={members}
          onClose={() => {
            setIsAddingExpense(false);
            setEditingExpense(null);
          }}
          onSave={handleSaveExpense}
          editingExpense={editingExpense || undefined}
          onDelete={handleDeleteExpense}
        />
      );
    }

    // Main layout when not in Expense addition form
    if (activeGroupId) {
      const selectedGroup = groups.find((g) => g.id === activeGroupId);
      if (selectedGroup) {
        return (
          <GroupDetailsView
            group={selectedGroup}
            members={members}
            expenses={expenses}
            onBack={() => setActiveGroupId(null)}
            onAddExpenseClick={() => setIsAddingExpense(true)}
            onEditExpenseClick={(exp) => setEditingExpense(exp)}
            onAddMember={handleAddMemberToActiveGroup}
            onSettleDebt={handleSettleDebt}
          />
        );
      }
    }

    // Standard Tab-based screens
    switch (currentTab) {
      case 'dashboard':
        return (
          <DashboardView
            groups={groups}
            members={members}
            netBalancePerGroup={netBalancePerGroup}
            globalBalance={globalBalance}
            onSelectGroup={(gId) => setActiveGroupId(gId)}
            onOpenAddExpense={() => setIsAddingExpense(true)}
            onOpenAddGroup={() => setIsAddGroupOpen(true)}
            onNavigateToAccount={() => setCurrentTab('account')}
          />
        );
      case 'groups':
        return (
          <DashboardView
            groups={groups}
            members={members}
            netBalancePerGroup={netBalancePerGroup}
            globalBalance={globalBalance}
            onSelectGroup={(gId) => setActiveGroupId(gId)}
            onOpenAddExpense={() => setIsAddingExpense(true)}
            onOpenAddGroup={() => setIsAddGroupOpen(true)}
            onNavigateToAccount={() => setCurrentTab('account')}
          />
        );
      case 'activity':
        return <ActivityView activities={activities} />;
      case 'account':
        return (
          <ProfileView
            member={members.find((m) => m.id === 'user-me') || members[0]}
            pixKeys={pixKeys}
            onAddPixKey={handleAddPixKey}
            onDeletePixKey={handleDeletePixKey}
            onLogout={() => {
              if (confirm('Tem certeza que deseja limpar seus dados e reiniciar o SplitWise Premium?')) {
                localStorage.clear();
                window.location.reload();
              }
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-brand-surface text-brand-on-surface min-h-screen">
      {/* Active Sub-screen View */}
      {renderActiveView()}

      {/* Bottom Nav Bar (hidden inside the expense creator to match mock behavior) */}
      {!isAddingExpense && !editingExpense && (
        <BottomNavBar
          currentTab={activeGroupId ? 'groups' : currentTab}
          onTabChange={handleTabChange}
          unreadActivitiesCount={unreadActivitiesCount}
        />
      )}

      {/* Interactive Modal: Add Group */}
      <AddGroupModal
        isOpen={isAddGroupOpen}
        onClose={() => setIsAddGroupOpen(false)}
        availableMembers={members}
        onAddGroup={handleAddGroup}
      />
    </div>
  );
}

