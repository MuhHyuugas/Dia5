/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Member, Group, Expense, Activity, PixKey } from './types';

// Pre-defined members with the high-quality images from prompt
export const INITIAL_MEMBERS: Member[] = [
  {
    id: 'user-me',
    name: 'Você',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDQtFHpRYLrUln3iyah91d2bVAb2ED5Xyh94nDe7hBEaQkHh3WpHfPGk8jUXQdpAWL7tDkpusBgrfCGptlqWcL7m5_efIxzfyaxPkLtyJIcHaUe7D-nkWHotYwSTslCmqwJp0D5qv2RC1QLtHqh-Za40eu8hCW4DwOi62gT34c-SJ7mwkOIZs9rBo5eY5-s8wRpkwaAH4Puj0hAbNWFJhMeI-W2vskv38C_g3DrVUtNU4Yk1VHa1u4FcW4OZjTJKSYuQPbGcAfvbeWI',
    isCurrentUser: true,
  },
  {
    id: 'member-lucas',
    name: 'Lucas',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAdJ03YJzA_7LwQgIc0K1AhNelGEaMT61KlKEXOQhzdsDcxyjs9SPWPnyM2MD9S5IYuuCQ9Cxxjl5GHvDoy_NmtejsM9sB4AIetCumWVwJ42eE5wBZXEcnNLqIgcsYToJiehSq4crgpm1dsIKUEEYiDOmVBTsyhKbncjcSLxTlhTS7lUhWmwLOWZWFwf9pgWC5YqCdt52QgQ0LK6OfM3C-IbgGSdNYgaDXByT-NfEXbbc3Ug3uPVMoL461rcdtnIXIiwPA6jY7YWhyV',
  },
  {
    id: 'member-bia',
    name: 'Bia',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBwBptPDLdqVhpVksa_qbTnwO416IySWQF3up1OTJtLHNFu4VeuAjcbjY2N4b1jBRByeAs5atQ_2fk__ZsNHAH1nNfZgXcNKBeK5ZbZO_oKQPGRQiUca9Ekv2wcNt1y4toD7avtYeM2vTSd-lG6XJqjscWo75JubysjOYoEKWZfHyO8B4e3guGvZy8qNuZwCnF56Xm4h_kmoxksSlDuuW-U4qZjm_9kVbo_bpLm8HHBDVDnLvdMOzbhmEPkXY_u47NS2_G6-ZWe0zFT',
  },
  {
    id: 'member-andre',
    name: 'André',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuClUAe4yJGa-2I8MG7v7Qc6IChWg-qX4cHwFYK9VhItCDJT3xEiqCo05wg3KEElfc3WStYztfrlRtUXpyyIJD5G09rCEAmpTlQk2Dk_wTBFEJenskJVWZPdc0BqUNdUDdE3R2eHpMUXabELNvytFPhuaPCUl17SNiCZioH92vpJzHlQqaZQxNmHvppy8XkGqyY7xtPW6VJrvRCZQtQm9L7b5Is-c6mb3p1H4J59dQAis4NV26bDiit1CRhP-VNkeCLMxq5ZqR3ZwU_2',
  },
  {
    id: 'member-carla',
    name: 'Carla',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDGnvPHbi60DkegQTUhK-cCOBboyO3ZRh9hDu7ii70RYjtdCZ--pPcgMoS23wMz-RlZr5OTEtS2bkGV_lzgCKG0k3YgbmOBTAxFmyQfmYYxAfmUfJYSwA9vaLBh7l2TVRJedyl70ACk30AaSbog1HKF9FCxMlL9DPeEJr_Ej37Kolw6LS0T_1oRDPj-o9ah2Nb46zUXvJZU1ROTAV2ENN35BfUO3wFfquEJYfE_QuYbKGgv4V_z1CDZNHheiyc9Wo23WcmTV3_gvGjC',
  },
  {
    id: 'member-bia-mendes',
    name: 'Bia Mendes',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD6qnbnYY3kyMefl7e_ImeMjYyovGq7zjcRq3J1oOw_oyfiSixPwIGeynFai7IpK4JXUSoGFK_JkY_Zf-MQDziDiuSmBEsSzWOOl2MvFYsu-zlDXCx3ciQGZ762gONo3bMuycmoodX9ZoyUeizN5JNZoJ_wtLCWuNhlpEq3KMi1DrK4fZjpqCdnXoKCNKqOWqG1SGjaUbYlqXFa8ZNPNzth4X90gQG9xf-YkWu5TfexgE7okFJVwujdakI3bIvvSilC4zyK-CV6yfei',
  },
  {
    id: 'member-carlos-lima',
    name: 'Carlos Lima',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC9ZDX9uVj6nGtNwpS_tabfkyXBzLe7bJa-43cOnBLWLTmukgfPpHq7D3NCrqLgRrT_Mwtg60q8XBkwIegcmaDDYSUXcBp2iTv4TmrbSPRiKaKuAkqf46bQM82hvpfa3Oskj8PV6s49BdLFxmo39YC5YhyQIdHh73iws0Zd8cRCm_UC_keXj_-4NSzjV0hf1GkIrAP8lOj8v_KexeOMUIQ8e7hUGVEjRRcK3Y6BUXo_19KdRNLt4AW5DMjD774zEOinttev6L8ZyIHV',
  },
  {
    id: 'member-maria',
    name: 'Maria',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBrd_pMSoSi-yFxIZDwjVFKr0w4tmubu7floqwhq_08ztVIPWN5VI_soRvYbnmAcKtRRPeOHa36K2AaPDhBXyjn7X5S9JS2EgxZ5LsrZmZoC7b7Kjy4iUdiY-ZZC9rFvl_vJSYj5Gl2yyy3y29gwvHbvNzGlbAO9wrNV9c8cTNVrDs9d0b1-4hghSZ5CLgrhZm9Z6WO5JfBrwJ7mCVg2nwarj6XZyj4z9qcVbZg1OpNu5UgM50d7p5IeqsJeyYG6F9RN4ZGCZw1SL1k',
  },
  {
    id: 'member-joao',
    name: 'João',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
  },
  {
    id: 'member-ricardo',
    name: 'Ricardo',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
  },
  {
    id: 'member-guest',
    name: 'Guest',
    avatar: '', // Fallback avatar rendering
  },
];

export const INITIAL_GROUPS: Group[] = [
  {
    id: 'group-republica',
    name: 'República',
    avatar: '🏢',
    memberIds: ['user-me', 'member-joao', 'member-maria'],
  },
  {
    id: 'group-viagem-praia',
    name: 'Viagem Praia',
    avatar: '🏖️',
    memberIds: ['user-me', 'member-bia-mendes', 'member-carlos-lima'],
  },
  {
    id: 'group-festa',
    name: 'Festa',
    avatar: '🎉',
    memberIds: ['user-me', 'member-lucas', 'member-bia-mendes'],
  },
  {
    id: 'group-viagem-rio',
    name: 'Viagem Rio',
    avatar: '⛰️',
    memberIds: ['user-me', 'member-lucas', 'member-bia', 'member-andre', 'member-carla'],
  },
];

export const INITIAL_EXPENSES: Expense[] = [
  // República
  {
    id: 'exp-rep-1',
    groupId: 'group-republica',
    title: 'Internet & Luz',
    amount: 135.0,
    paidById: 'user-me',
    splitWithIds: ['user-me', 'member-joao', 'member-maria'],
    category: 'Geral',
    date: '2026-06-28T12:00:00Z',
  },
  {
    id: 'exp-rep-2',
    groupId: 'group-republica',
    title: 'Faxina',
    amount: 90.0,
    paidById: 'member-maria',
    splitWithIds: ['user-me', 'member-joao', 'member-maria'],
    category: 'Geral',
    date: '2026-06-29T10:00:00Z',
    isLiquidated: true, // This matches Maria settling her debt
  },

  // Viagem Praia
  {
    id: 'exp-praia-1',
    groupId: 'group-viagem-praia',
    title: 'Aluguel de Guarda-Sol & Cadeiras',
    amount: 180.0,
    paidById: 'user-me',
    splitWithIds: ['user-me', 'member-bia-mendes', 'member-carlos-lima'],
    category: 'Geral',
    date: '2026-06-29T14:00:00Z',
  },
  {
    id: 'exp-praia-2',
    groupId: 'group-viagem-praia',
    title: 'Lanches na Orla',
    amount: 90.0,
    paidById: 'member-bia-mendes',
    splitWithIds: ['user-me', 'member-bia-mendes', 'member-carlos-lima'],
    category: 'Alimentação',
    date: '2026-06-30T11:00:00Z',
  },

  // Festa
  {
    id: 'exp-festa-1',
    groupId: 'group-festa',
    title: 'Bebidas Festa',
    amount: 45.0,
    paidById: 'member-lucas',
    splitWithIds: ['user-me', 'member-lucas', 'member-bia-mendes'],
    category: 'Entretenimento',
    date: '2026-06-30T19:30:00Z',
  },

  // Viagem Rio
  {
    id: 'exp-rio-1',
    groupId: 'group-viagem-rio',
    title: 'Mercado',
    amount: 100.0,
    paidById: 'user-me',
    splitWithIds: ['user-me', 'member-lucas'],
    category: 'Alimentação',
    date: '2026-06-30T15:00:00Z', // Hoje
  },
  {
    id: 'exp-rio-2',
    groupId: 'group-viagem-rio',
    title: 'Uber',
    amount: 40.0,
    paidById: 'member-lucas',
    splitWithIds: ['user-me', 'member-lucas'],
    category: 'Transporte',
    date: '2026-06-30T16:20:00Z', // Hoje
  },
  {
    id: 'exp-rio-3',
    groupId: 'group-viagem-rio',
    title: 'Show Luísa Sonza',
    amount: 600.0,
    paidById: 'member-bia',
    splitWithIds: ['member-bia', 'member-andre', 'member-carla', 'member-lucas'], // Você is NOT in this split but shown in mock "Envolvido" status
    category: 'Entretenimento',
    date: '2026-06-29T21:00:00Z', // Ontem
  },
  {
    id: 'exp-rio-4',
    groupId: 'group-viagem-rio',
    title: 'Jantar Japonês',
    amount: 420.0,
    paidById: 'member-andre',
    splitWithIds: ['user-me', 'member-lucas', 'member-bia', 'member-andre'],
    category: 'Alimentação',
    date: '2026-06-29T20:00:00Z', // Ontem
    isLiquidated: true, // Matches "Liquidado R$ 105,00" decoration
  },
  {
    id: 'exp-rio-5',
    groupId: 'group-viagem-rio',
    title: 'Reserva de Hotel',
    amount: 2060.5,
    paidById: 'member-carla',
    splitWithIds: ['member-carla', 'member-andre', 'member-bia', 'member-lucas'], // You are excluded to keep totals clean
    category: 'Geral',
    date: '2026-06-28T10:00:00Z',
  },
  {
    id: 'exp-rio-6',
    groupId: 'group-viagem-rio',
    title: 'Passagens de Ônibus',
    amount: 200.0,
    paidById: 'user-me',
    splitWithIds: ['user-me', 'member-bia'], // Bia owes R$ 100.00
    category: 'Transporte',
    date: '2026-06-28T09:00:00Z',
  },
];

export const INITIAL_ACTIVITIES: Activity[] = [
  {
    id: 'act-1',
    title: 'Maria quitou a dívida de R$ 150 com você',
    timeDescription: 'Há 10 min',
    groupName: 'Geral',
    type: 'payment',
    amount: 150,
    date: new Date(Date.now() - 10 * 60 * 1000),
  },
  {
    id: 'act-2',
    title: 'João adicionou uma despesa de R$ 60 no grupo República',
    timeDescription: 'Há 2 horas',
    groupName: 'República',
    type: 'expense',
    amount: 60,
    date: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: 'act-3',
    title: 'Você entrou no grupo Viagem Praia',
    timeDescription: 'Ontem',
    groupName: 'Social',
    type: 'join',
    date: new Date(Date.now() - 24 * 60 * 60 * 1000),
  },
  {
    id: 'act-4',
    title: 'Ricardo aceitou seu convite para o grupo Churrasco',
    timeDescription: 'Terça-feira',
    type: 'invite',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
];

export const INITIAL_PIX_KEYS: PixKey[] = [
  { id: 'pix-1', type: 'CPF', key: '123.456.789-00' },
  { id: 'pix-2', type: 'E-mail', key: 'murilo.oliveira@premium.com' },
];

/**
 * Live Financial Split Engine
 * Computes exact balance relations for the current user across a set of groups/expenses.
 */
export function calculateUserBalances(expenses: Expense[], currentUserId: string = 'user-me') {
  // netBalancePerGroup: maps groupId -> amount (positive means user receives, negative means user owes)
  const netBalancePerGroup: { [groupId: string]: number } = {};
  
  // spentPerGroup: maps groupId -> total active spending
  const totalSpentPerGroup: { [groupId: string]: number } = {};

  // detail breakdown of what you owe/are-owed per group
  const groupDetails: {
    [groupId: string]: {
      totalSpent: number;
      lent: number; // what you paid that others owe you
      owed: number; // what others paid that you owe them
    };
  } = {};

  expenses.forEach((exp) => {
    if (exp.isLiquidated) return; // ignore settled expenses

    const groupId = exp.groupId;
    if (!totalSpentPerGroup[groupId]) totalSpentPerGroup[groupId] = 0;
    totalSpentPerGroup[groupId] += exp.amount;

    if (!groupDetails[groupId]) {
      groupDetails[groupId] = { totalSpent: 0, lent: 0, owed: 0 };
    }
    groupDetails[groupId].totalSpent += exp.amount;

    const numSplits = exp.splitWithIds.length;
    if (numSplits === 0) return;

    const share = exp.amount / numSplits;

    // If the current user paid
    if (exp.paidById === currentUserId) {
      const userIsInSplit = exp.splitWithIds.includes(currentUserId);
      const othersShare = exp.amount - (userIsInSplit ? share : 0);
      groupDetails[groupId].lent += othersShare;
    } 
    // If someone else paid and current user is in split
    else if (exp.splitWithIds.includes(currentUserId)) {
      groupDetails[groupId].owed += share;
    }
  });

  // Compile final net balance per group
  Object.keys(groupDetails).forEach((gId) => {
    netBalancePerGroup[gId] = groupDetails[gId].lent - groupDetails[gId].owed;
  });

  // Calculate global balance
  let globalBalance = 0;
  Object.values(netBalancePerGroup).forEach((val) => {
    globalBalance += val;
  });

  return {
    globalBalance,
    netBalancePerGroup,
    totalSpentPerGroup,
    groupDetails,
  };
}
