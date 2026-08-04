import React, { useCallback, useState } from 'react';

import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { groupsService, ActivityItem } from '../services/groups.service';
import { expensesService, GroupBalanceResponse } from '../services/expenses.service';
import { usersService, UserProfile } from '../services/users.service';
import { paymentsService } from '../services/payments.service';
import { CurrencyInput } from '../components/CurrencyInput';
import { useFocusEffect } from '@react-navigation/native';
import { ArrowLeft, UserPlus, Plus, Trash2, Receipt, Wallet, X, HandCoins, Check } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';

export const GroupDetailsScreen = ({ route, navigation }: any) => {
  const { groupId } = route.params;
  const { colors } = useTheme();

  const [balance, setBalance] = useState<GroupBalanceResponse | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal Convidado
  const [isGuestOpen, setIsGuestOpen] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  // Modal Liquidar Dívida no Grupo
  const [isSettleOpen, setIsSettleOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<{ usuarioId: string; nome: string; saldoLiquido: number; isGuest?: boolean } | null>(null);
  const [settleAmountCents, setSettleAmountCents] = useState(0);

  // Recarrega dados toda vez que a tela entra em foco (ex: ao voltar da tela de Nova Despesa)
  useFocusEffect(
    useCallback(() => {
      if (groupId) {
        loadGroupData();
      }
    }, [groupId]),
  );

  const loadGroupData = async () => {
    try {
      setLoading(true);
      const [balanceData, activityData, userData] = await Promise.all([
        expensesService.getGroupBalance(groupId),
        groupsService.getGroupActivity(groupId),
        usersService.getProfile(),
      ]);
      setBalance(balanceData);
      setActivity(activityData);
      setCurrentUser(userData);
    } catch (err: any) {
      console.error('Erro ao carregar detalhes do grupo:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGuest = async () => {
    setError('');
    if (!guestName) {
      setError('Informe o nome da pessoa.');
      return;
    }

    setActionLoading(true);
    try {
      // UC07: Cria o convidado já vinculado ao grupo atual
      await usersService.createGuest(guestName, groupId);
      setIsGuestOpen(false);
      setGuestName('');
      loadGroupData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao cadastrar convidado.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenSettle = (member: { usuarioId: string; nome: string; saldoLiquido: number; isGuest?: boolean }) => {
    setError('');
    setSelectedMember(member);
    const cents = Math.round(Math.abs(member.saldoLiquido) * 100);
    setSettleAmountCents(cents);
    setIsSettleOpen(true);
  };

  const handleSettleGroupDebt = async () => {
    if (!selectedMember) return;
    setError('');

    if (settleAmountCents <= 0) {
      setError('Informe um valor válido.');
      return;
    }

    setActionLoading(true);
    try {
      const user = currentUser || await usersService.getProfile();

      // Se o membro está devendo (saldoLiquido < 0), ele está pagando o usuário logado
      // Se o membro tem a receber (saldoLiquido > 0), o usuário logado está pagando ele
      const isMemberDevendo = selectedMember.saldoLiquido < 0;
      const pagadorId = isMemberDevendo ? selectedMember.usuarioId : user.id;
      const recebedorId = isMemberDevendo ? user.id : selectedMember.usuarioId;

      await paymentsService.settleDebt({
        pagadorId,
        recebedorId,
        grupoId: groupId,
        valorPago: settleAmountCents / 100,
      });

      setIsSettleOpen(false);
      setSelectedMember(null);
      setSettleAmountCents(0);
      loadGroupData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao registrar liquidação.');
    } finally {
      setActionLoading(false);
    }
  };
  const handleRemoveMember = (memberId: string, nome: string) => {
    Alert.alert(
      'Remover Membro',
      `Deseja realmente remover ${nome} do grupo? (Saldo deve estar zerado - RN06)`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            try {
              await groupsService.removeMember(groupId, memberId);
              loadGroupData();
            } catch (err: any) {
              Alert.alert('Erro', err.response?.data?.message || 'Erro ao remover participante.');
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity style={[styles.backButton, { backgroundColor: colors.surface }]} onPress={() => navigation.goBack()}>
          <ArrowLeft size={20} color={colors.textPrimary} />
        </TouchableOpacity>

        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Detalhes do Grupo</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>Saldos individuais e extrato de lançamentos.</Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 32 }} />
      ) : (
        <FlatList
          data={activity}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <View style={styles.sectionContainer}>
              {/* Card de Balanço dos Membros */}
              <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={[styles.cardTitleRow, { borderBottomColor: colors.border }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Wallet size={20} color={colors.primary} />
                    <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Balanço dos Membros</Text>
                  </View>

                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    <TouchableOpacity
                      style={[styles.guestButton, { backgroundColor: colors.primaryBg }]}
                      onPress={() => setIsGuestOpen(true)}
                    >
                      <UserPlus size={14} color={colors.primary} />
                      <Text style={[styles.guestButtonText, { color: colors.primary }]}>+ Sem App</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.addExpenseButton, { backgroundColor: colors.primary }]}
                      onPress={() => navigation.navigate('AddExpense', { groupId })}
                    >
                      <Plus size={14} color="#ffffff" />
                      <Text style={styles.addExpenseText}>Nova Despesa</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Lista de Membros e Saldos */}
                <View style={styles.memberList}>
                  {balance?.balancoIndividual.map((m) => (
                    <View key={m.usuarioId} style={styles.memberRow}>
                      <View style={styles.memberInfo}>
                        <View style={[styles.avatar, { backgroundColor: colors.primaryBg }]}>
                          <Text style={[styles.avatarText, { color: colors.primary }]}>{m.nome.charAt(0).toUpperCase()}</Text>
                        </View>
                        <View>
                          <Text style={[styles.memberName, { color: colors.textPrimary }]}>{m.nome}</Text>
                          <Text
                            style={[
                              styles.statusTag,
                              m.situacao === 'A Receber'
                                ? { color: colors.secondary }
                                : m.situacao === 'Devendo'
                                ? { color: colors.danger }
                                : { color: colors.textMuted },
                            ]}
                          >
                            {m.situacao}
                          </Text>
                        </View>
                      </View>

                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        <Text
                          style={[
                            styles.balanceValue,
                            m.saldoLiquido > 0
                              ? { color: colors.secondary }
                              : m.saldoLiquido < 0
                              ? { color: colors.danger }
                              : { color: colors.textMuted },
                          ]}
                        >
                          {m.saldoLiquido > 0
                            ? `+ R$ ${m.saldoLiquido.toFixed(2)}`
                            : m.saldoLiquido < 0
                            ? `- R$ ${Math.abs(m.saldoLiquido).toFixed(2)}`
                            : 'R$ 0,00'}
                        </Text>

                        {(() => {
                          const myBalance = balance?.balancoIndividual.find((b) => b.usuarioId === currentUser?.id);
                          const iOweMoney = (myBalance?.saldoLiquido || 0) < 0;
                          const isGuestMember = m.isGuest || m.nome.toLowerCase().includes('convidado');
                          // Mostra o botão Liquidar se:
                          // 1. Você deve dinheiro e o membro tem a receber
                          // 2. OU o membro é um Convidado sem app e está devendo (assim o criador da despesa pode dar baixa pelo convidado)
                          const showLiquidar = m.usuarioId !== currentUser?.id && (
                            (iOweMoney && m.saldoLiquido > 0) ||
                            (isGuestMember && m.saldoLiquido < 0)
                          );
                          return showLiquidar ? (
                            <TouchableOpacity
                              style={[styles.settleMemberButton, { backgroundColor: colors.secondaryBg }]}
                              onPress={() => handleOpenSettle(m)}
                            >
                              <HandCoins size={14} color={colors.secondary} />
                              <Text style={[styles.settleMemberText, { color: colors.secondary }]}>Liquidar</Text>
                            </TouchableOpacity>
                          ) : null;
                        })()}

                        <TouchableOpacity onPress={() => handleRemoveMember(m.usuarioId, m.nome)}>
                          <Trash2 size={16} color={colors.danger} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              </View>

              <Text style={[styles.sectionHeader, { color: colors.textPrimary }]}>Extrato do Grupo ({activity.length})</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={[styles.activityCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View
                style={[
                  styles.activityIcon,
                  { backgroundColor: item.tipo === 'DESPESA' ? colors.primaryBg : colors.secondaryBg },
                ]}
              >
                <Receipt size={20} color={item.tipo === 'DESPESA' ? colors.primary : colors.secondary} />
              </View>

              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text
                    style={[
                      styles.typeBadge,
                      item.tipo === 'DESPESA'
                        ? { backgroundColor: colors.primaryBg, color: colors.primary }
                        : { backgroundColor: colors.secondaryBg, color: colors.secondary },
                    ]}
                  >
                    {item.tipo}
                  </Text>
                  <Text style={[styles.activityDate, { color: colors.textMuted }]}>
                    {new Date(item.data).toLocaleDateString()}
                  </Text>
                </View>
                <Text style={[styles.activityDesc, { color: colors.textPrimary }]}>{item.descricao || 'Acerto de Contas'}</Text>
                <Text style={[styles.activitySub, { color: colors.textMuted }]}>
                  {item.tipo === 'DESPESA'
                    ? `Pago por ${item.pagador}`
                    : `${item.pagador} pagou a ${item.recebedor}`}
                </Text>
              </View>

              <Text style={[styles.activityAmount, { color: colors.textPrimary }]}>
                R$ {(item.valorTotal || item.valorPago || 0).toFixed(2)}
              </Text>
            </View>
          )}
          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>Nenhum lançamento neste grupo ainda.</Text>
          }
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        />
      )}

      {/* Modal Adicionar Convidado sem App */}
      <Modal visible={isGuestOpen} animationType="slide" transparent>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView
            style={styles.modalOverlay}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <View style={[styles.modalContent, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Adicionar Convidado sem App</Text>
                <TouchableOpacity onPress={() => setIsGuestOpen(false)}>
                  <X size={20} color={colors.textMuted} />
                </TouchableOpacity>
              </View>

              {!!error && <Text style={[styles.modalError, { color: colors.danger }]}>{error}</Text>}

              <Text style={[styles.inputLabel, { color: colors.textMuted }]}>NOME DA PESSOA</Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.textPrimary }]}
                placeholder="Ex: João (Convidado)"
                placeholderTextColor={colors.textMuted}
                value={guestName}
                onChangeText={setGuestName}
              />

              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                onPress={handleCreateGuest}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.modalButtonText}>Adicionar ao Grupo</Text>
                )}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Modal Liquidar Dívida do Grupo */}
      <Modal visible={isSettleOpen} animationType="slide" transparent>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView
            style={styles.modalOverlay}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <View style={[styles.modalContent, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.modalHeader}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                    {selectedMember && selectedMember.saldoLiquido < 0
                      ? `Receber de ${selectedMember.nome}`
                      : `Pagar a ${selectedMember?.nome}`}
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>
                    {selectedMember && selectedMember.saldoLiquido < 0
                      ? `Confirme que ${selectedMember.nome} pagou o valor a você:`
                      : `Confirme o valor pago a ${selectedMember?.nome}:`}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setIsSettleOpen(false)}>
                  <X size={20} color={colors.textMuted} />
                </TouchableOpacity>
              </View>

              {!!error && <Text style={[styles.modalError, { color: colors.danger }]}>{error}</Text>}

              <Text style={[styles.inputLabel, { color: colors.textMuted }]}>VALOR DO ACERTO (R$)</Text>
              <View style={[styles.settleInputWrapper, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <Text style={[styles.settleCurrencySymbol, { color: colors.textMuted }]}>R$</Text>
                <CurrencyInput
                  valueCents={settleAmountCents}
                  onChangeCents={setSettleAmountCents}
                  inputStyle={[styles.settleAmountInput, { color: colors.secondary }]}
                  placeholderTextColor={colors.textMuted}
                />
              </View>

              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.secondary }]}
                onPress={handleSettleGroupDebt}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Check size={18} color="#ffffff" />
                    <Text style={styles.modalButtonText}>
                      {selectedMember && selectedMember.saldoLiquido < 0
                        ? `Confirmar Recebimento`
                        : `Confirmar Pagamento`}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  backButton: { padding: 8, borderRadius: 12 },
  title: { fontSize: 18, fontWeight: 'bold' },
  subtitle: { fontSize: 12 },
  sectionContainer: { gap: 16, marginBottom: 12 },
  card: { borderRadius: 24, padding: 16, borderWidth: 1, gap: 12 },
  cardTitleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    borderBottomWidth: 1,
    paddingBottom: 12,
  },
  cardTitle: { fontSize: 15, fontWeight: 'bold' },
  guestButton: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, gap: 4,
  },
  guestButtonText: { fontSize: 11, fontWeight: 'bold' },
  addExpenseButton: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, gap: 4,
  },
  addExpenseText: { color: '#ffffff', fontSize: 11, fontWeight: 'bold' },
  memberList: { gap: 12 },
  memberRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  memberInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 36, height: 36, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontWeight: 'bold', fontSize: 14 },
  memberName: { fontSize: 14, fontWeight: 'bold' },
  statusTag: { fontSize: 10, fontWeight: 'bold', marginTop: 2 },
  balanceValue: { fontSize: 14, fontWeight: 'bold' },
  sectionHeader: { fontSize: 16, fontWeight: 'bold', marginTop: 8 },
  activityCard: {
    borderRadius: 16, padding: 14,
    flexDirection: 'row', alignItems: 'center',
    marginBottom: 10, borderWidth: 1, gap: 12,
  },
  activityIcon: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  typeBadge: { fontSize: 10, fontWeight: 'bold', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  activityDate: { fontSize: 11 },
  activityDesc: { fontSize: 14, fontWeight: 'bold', marginTop: 2 },
  activitySub: { fontSize: 12, marginTop: 2 },
  activityAmount: { fontSize: 15, fontWeight: 'bold' },
  emptyText: { textAlign: 'center', marginTop: 20, fontSize: 13 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, gap: 16, borderWidth: 1 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontSize: 18, fontWeight: 'bold' },
  modalError: { fontSize: 13 },
  inputLabel: { fontSize: 11, fontWeight: 'bold', letterSpacing: 1 },
  modalInput: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 14, height: 50, fontSize: 15 },
  modalButton: { height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  modalButtonText: { color: '#ffffff', fontWeight: 'bold', fontSize: 15 },
  settleMemberButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  settleMemberText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  settleInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 60,
  },
  settleCurrencySymbol: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 6,
  },
  settleAmountInput: {
    flex: 1,
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'right',
  },
});
