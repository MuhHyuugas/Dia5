import React, { useEffect, useState } from 'react';
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
  SafeAreaView,
} from 'react-native';
import { groupsService, ActivityItem } from '../services/groups.service';
import { expensesService, GroupBalanceResponse } from '../services/expenses.service';
import { usersService } from '../services/users.service';
import { ArrowLeft, UserPlus, Plus, Trash2, Receipt, Wallet, X } from 'lucide-react-native';

export const GroupDetailsScreen = ({ route, navigation }: any) => {
  const { groupId } = route.params;

  const [balance, setBalance] = useState<GroupBalanceResponse | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal Convidado
  const [isGuestOpen, setIsGuestOpen] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (groupId) {
      loadGroupData();
    }
  }, [groupId]);

  const loadGroupData = async () => {
    try {
      setLoading(true);
      const [balanceData, activityData] = await Promise.all([
        expensesService.getGroupBalance(groupId),
        groupsService.getGroupActivity(groupId),
      ]);
      setBalance(balanceData);
      setActivity(activityData);
    } catch (err) {
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
      await usersService.createGuest(guestName);
      setIsGuestOpen(false);
      setGuestName('');
      loadGroupData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao cadastrar convidado.');
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
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={20} color="#dae2fd" />
        </TouchableOpacity>

        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Detalhes do Grupo</Text>
          <Text style={styles.subtitle}>Saldos individuais e extrato de lançamentos.</Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator color="#7c3aed" style={{ marginTop: 32 }} />
      ) : (
        <FlatList
          data={activity}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <View style={styles.sectionContainer}>
              {/* Card de Balanço dos Membros */}
              <View style={styles.card}>
                <View style={styles.cardTitleRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Wallet size={20} color="#7c3aed" />
                    <Text style={styles.cardTitle}>Balanço dos Membros</Text>
                  </View>

                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    <TouchableOpacity
                      style={styles.guestButton}
                      onPress={() => setIsGuestOpen(true)}
                    >
                      <UserPlus size={14} color="#7c3aed" />
                      <Text style={styles.guestButtonText}>+ Sem App</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.addExpenseButton}
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
                        <View style={styles.avatar}>
                          <Text style={styles.avatarText}>{m.nome.charAt(0).toUpperCase()}</Text>
                        </View>
                        <View>
                          <Text style={styles.memberName}>{m.nome}</Text>
                          <Text
                            style={[
                              styles.statusTag,
                              m.situacao === 'A Receber'
                                ? styles.statusReceber
                                : m.situacao === 'Devendo'
                                ? styles.statusDevendo
                                : styles.statusQuitado,
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
                              ? styles.positiveText
                              : m.saldoLiquido < 0
                              ? styles.negativeText
                              : styles.zeroText,
                          ]}
                        >
                          {m.saldoLiquido > 0
                            ? `+ R$ ${m.saldoLiquido.toFixed(2)}`
                            : m.saldoLiquido < 0
                            ? `- R$ ${Math.abs(m.saldoLiquido).toFixed(2)}`
                            : 'R$ 0,00'}
                        </Text>

                        <TouchableOpacity onPress={() => handleRemoveMember(m.usuarioId, m.nome)}>
                          <Trash2 size={16} color="#ef4444" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              </View>

              <Text style={styles.sectionHeader}>Extrato do Grupo ({activity.length})</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.activityCard}>
              <View
                style={[
                  styles.activityIcon,
                  item.tipo === 'DESPESA' ? styles.despesaIcon : styles.pagamentoIcon,
                ]}
              >
                <Receipt size={20} color={item.tipo === 'DESPESA' ? '#7c3aed' : '#10b981'} />
              </View>

              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text
                    style={[
                      styles.typeBadge,
                      item.tipo === 'DESPESA' ? styles.despesaBadge : styles.pagamentoBadge,
                    ]}
                  >
                    {item.tipo}
                  </Text>
                  <Text style={styles.activityDate}>
                    {new Date(item.data).toLocaleDateString()}
                  </Text>
                </View>
                <Text style={styles.activityDesc}>{item.descricao || 'Acerto de Contas'}</Text>
                <Text style={styles.activitySub}>
                  {item.tipo === 'DESPESA'
                    ? `Pago por ${item.pagador}`
                    : `${item.pagador} pagou a ${item.recebedor}`}
                </Text>
              </View>

              <Text style={styles.activityAmount}>
                R$ {(item.valorTotal || item.valorPago || 0).toFixed(2)}
              </Text>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Nenhum lançamento neste grupo ainda.</Text>
          }
          contentContainerStyle={{ padding: 16 }}
        />
      )}

      {/* Modal Adicionar Convidado sem App */}
      <Modal visible={isGuestOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Adicionar Convidado sem App</Text>
              <TouchableOpacity onPress={() => setIsGuestOpen(false)}>
                <X size={20} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            {!!error && <Text style={styles.modalError}>{error}</Text>}

            <Text style={styles.inputLabel}>NOME DA PESSOA</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Ex: João (Convidado)"
              placeholderTextColor="#94a3b8"
              value={guestName}
              onChangeText={setGuestName}
            />

            <TouchableOpacity
              style={styles.modalButton}
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
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b1326',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#171f33',
    gap: 12,
  },
  backButton: {
    padding: 8,
    backgroundColor: '#171f33',
    borderRadius: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#dae2fd',
  },
  subtitle: {
    fontSize: 12,
    color: '#94a3b8',
  },
  sectionContainer: {
    gap: 16,
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#171f33',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2d3449',
    gap: 12,
  },
  cardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#2d3449',
    paddingBottom: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#dae2fd',
  },
  guestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 4,
  },
  guestButtonText: {
    color: '#7c3aed',
    fontSize: 11,
    fontWeight: 'bold',
  },
  addExpenseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7c3aed',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 4,
  },
  addExpenseText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  memberList: {
    gap: 12,
  },
  memberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 14,
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#7c3aed',
    fontWeight: 'bold',
    fontSize: 14,
  },
  memberName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#dae2fd',
  },
  statusTag: {
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 2,
  },
  statusReceber: {
    color: '#10b981',
  },
  statusDevendo: {
    color: '#ef4444',
  },
  statusQuitado: {
    color: '#94a3b8',
  },
  balanceValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  positiveText: {
    color: '#10b981',
  },
  negativeText: {
    color: '#ef4444',
  },
  zeroText: {
    color: '#94a3b8',
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#dae2fd',
    marginTop: 8,
  },
  activityCard: {
    backgroundColor: '#171f33',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#2d3449',
    gap: 12,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  despesaIcon: {
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
  },
  pagamentoIcon: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  typeBadge: {
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  despesaBadge: {
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
    color: '#7c3aed',
  },
  pagamentoBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    color: '#10b981',
  },
  activityDate: {
    fontSize: 11,
    color: '#94a3b8',
  },
  activityDesc: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#dae2fd',
    marginTop: 2,
  },
  activitySub: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  activityAmount: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#dae2fd',
  },
  emptyText: {
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 13,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#171f33',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    gap: 16,
    borderWidth: 1,
    borderColor: '#2d3449',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#dae2fd',
  },
  modalError: {
    color: '#ef4444',
    fontSize: 13,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#94a3b8',
    letterSpacing: 1,
  },
  modalInput: {
    backgroundColor: '#0b1326',
    borderWidth: 1,
    borderColor: '#2d3449',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 50,
    color: '#dae2fd',
    fontSize: 15,
  },
  modalButton: {
    backgroundColor: '#7c3aed',
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  modalButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 15,
  },
});
