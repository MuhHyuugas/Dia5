import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  Alert,
} from 'react-native';
import { groupsService, Group } from '../services/groups.service';
import { expensesService, GroupBalanceResponse } from '../services/expenses.service';
import { authService, AuthResponse } from '../services/auth.service';
import { ArrowLeft, Check, Calculator, AlertCircle } from 'lucide-react-native';

export const AddExpenseScreen = ({ route, navigation }: any) => {
  const initialGroupId = route.params?.groupId || '';

  const [currentUser, setCurrentUser] = useState<AuthResponse | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState(initialGroupId);
  const [balance, setBalance] = useState<GroupBalanceResponse | null>(null);

  const [descricao, setDescricao] = useState('');
  const [valorTotal, setValorTotal] = useState('');
  const [pagadorId, setPagadorId] = useState('');
  const [dataCompra, setDataCompra] = useState(new Date().toISOString().split('T')[0]);

  // Cotas dos participantes { usuarioId: "50.00" }
  const [participantShares, setParticipantShares] = useState<{ [usuarioId: string]: string }>({});

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedGroupId) {
      loadGroupMembers(selectedGroupId);
    }
  }, [selectedGroupId]);

  const loadInitialData = async () => {
    const user = await authService.getCurrentUser();
    setCurrentUser(user);
    if (user) setPagadorId(user.userId);

    const userGroups = await groupsService.getGroups();
    setGroups(userGroups);
    if (!selectedGroupId && userGroups.length > 0) {
      setSelectedGroupId(userGroups[0].id);
    }
  };

  const loadGroupMembers = async (groupId: string) => {
    try {
      const bal = await expensesService.getGroupBalance(groupId);
      setBalance(bal);
      setParticipantShares({});
    } catch (err) {
      console.error('Erro ao carregar membros:', err);
    }
  };

  // Calculadora de Divisão Igualitária
  const handleAutoSplitEqual = () => {
    if (!balance || !valorTotal) return;
    const total = parseFloat(valorTotal);
    if (isNaN(total) || total <= 0) return;

    const count = balance.balancoIndividual.length;
    if (count === 0) return;

    const share = (total / count).toFixed(2);
    const shares: { [usuarioId: string]: string } = {};
    balance.balancoIndividual.forEach((m) => {
      shares[m.usuarioId] = share;
    });
    setParticipantShares(shares);
  };

  const handleSubmit = async () => {
    setError('');
    const total = parseFloat(valorTotal);
    if (isNaN(total) || total <= 0) {
      setError('Informe um valor total válido.');
      return;
    }

    if (!descricao) {
      setError('Informe a descrição da compra.');
      return;
    }

    const participantesList = Object.entries(participantShares)
      .map(([usuarioId, valStr]) => ({
        usuarioId,
        valorDevido: parseFloat(valStr) || 0,
      }))
      .filter((p) => p.valorDevido > 0);

    if (participantesList.length === 0) {
      setError('Defina os valores devidos pelos participantes.');
      return;
    }

    // FE01 - Validação de Divisão Inconsistente (RN03)
    const somaPartes = participantesList.reduce((sum, p) => sum + p.valorDevido, 0);
    if (Math.abs(somaPartes - total) > 0.01) {
      setError(
        `FE01 - Divisão Inconsistente: A soma das frações (R$ ${somaPartes.toFixed(
          2,
        )}) não bate com o valor total pago (R$ ${total.toFixed(2)}).`,
      );
      return;
    }

    setLoading(true);
    try {
      await expensesService.createExpense({
        grupoId: selectedGroupId,
        pagadorId: pagadorId || currentUser?.userId || '',
        descricao,
        valorTotal: total,
        dataCompra,
        participantes: participantesList,
      });

      navigation.goBack();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao registrar despesa.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={20} color="#dae2fd" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Lançar Nova Despesa</Text>
          <Text style={styles.subtitle}>Registre uma compra e defina a partilha.</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {!!error && (
          <View style={styles.errorCard}>
            <AlertCircle size={18} color="#ef4444" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Escolha do Grupo */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>SELECIONAR GRUPO</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row' }}>
            {groups.map((g) => (
              <TouchableOpacity
                key={g.id}
                style={[
                  styles.chipGroup,
                  selectedGroupId === g.id && styles.chipGroupActive,
                ]}
                onPress={() => setSelectedGroupId(g.id)}
              >
                <Text
                  style={[
                    styles.chipGroupText,
                    selectedGroupId === g.id && styles.chipGroupTextActive,
                  ]}
                >
                  {g.nome}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Descrição e Valor */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>DESCRIÇÃO DA COMPRA</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Mercado, Uber, Conta de Luz"
            placeholderTextColor="#94a3b8"
            value={descricao}
            onChangeText={setDescricao}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>VALOR TOTAL (R$)</Text>
          <TextInput
            style={[styles.input, styles.amountInput]}
            placeholder="0,00"
            placeholderTextColor="#94a3b8"
            keyboardType="numeric"
            value={valorTotal}
            onChangeText={setValorTotal}
          />
        </View>

        {/* Divisão dos Participantes */}
        <View style={styles.card}>
          <View style={styles.splitHeader}>
            <Text style={styles.cardTitle}>Divisão dos Participantes</Text>
            <TouchableOpacity style={styles.calcButton} onPress={handleAutoSplitEqual}>
              <Calculator size={14} color="#7c3aed" />
              <Text style={styles.calcButtonText}>Divisão Igualitária</Text>
            </TouchableOpacity>
          </View>

          {balance?.balancoIndividual.map((m) => (
            <View key={m.usuarioId} style={styles.participantRow}>
              <Text style={styles.participantName}>{m.nome}</Text>
              <View style={styles.shareInputWrapper}>
                <Text style={styles.currencyPrefix}>R$</Text>
                <TextInput
                  style={styles.shareInput}
                  placeholder="0,00"
                  placeholderTextColor="#94a3b8"
                  keyboardType="numeric"
                  value={participantShares[m.usuarioId] || ''}
                  onChangeText={(val) =>
                    setParticipantShares({ ...participantShares, [m.usuarioId]: val })
                  }
                />
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && { opacity: 0.6 }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <>
              <Check size={20} color="#ffffff" />
              <Text style={styles.submitButtonText}>Salvar Despesa</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
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
  content: {
    padding: 16,
    gap: 16,
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    padding: 12,
    borderRadius: 14,
    gap: 8,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    flex: 1,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#94a3b8',
    letterSpacing: 1,
  },
  input: {
    backgroundColor: '#171f33',
    borderWidth: 1,
    borderColor: '#2d3449',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 50,
    color: '#dae2fd',
    fontSize: 15,
  },
  amountInput: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#7c3aed',
  },
  chipGroup: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: '#171f33',
    borderWidth: 1,
    borderColor: '#2d3449',
    marginRight: 8,
  },
  chipGroupActive: {
    backgroundColor: '#7c3aed',
    borderColor: '#7c3aed',
  },
  chipGroupText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: 'bold',
  },
  chipGroupTextActive: {
    color: '#ffffff',
  },
  card: {
    backgroundColor: '#171f33',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2d3449',
    gap: 12,
  },
  splitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#2d3449',
    paddingBottom: 10,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#dae2fd',
  },
  calcButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 4,
  },
  calcButtonText: {
    color: '#7c3aed',
    fontSize: 11,
    fontWeight: 'bold',
  },
  participantRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  participantName: {
    fontSize: 14,
    color: '#dae2fd',
    fontWeight: '600',
  },
  shareInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0b1326',
    borderWidth: 1,
    borderColor: '#2d3449',
    borderRadius: 12,
    paddingHorizontal: 10,
    width: 110,
    height: 40,
  },
  currencyPrefix: {
    color: '#94a3b8',
    fontSize: 12,
    marginRight: 4,
  },
  shareInput: {
    flex: 1,
    color: '#dae2fd',
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'right',
  },
  submitButton: {
    backgroundColor: '#7c3aed',
    height: 54,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
