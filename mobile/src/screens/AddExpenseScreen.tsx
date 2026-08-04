import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { groupsService, Group } from '../services/groups.service';
import { expensesService, GroupBalanceResponse } from '../services/expenses.service';
import { authService, AuthResponse } from '../services/auth.service';
import { CurrencyInput } from '../components/CurrencyInput';
import { ArrowLeft, Check, Calculator, AlertCircle } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';

export const AddExpenseScreen = ({ route, navigation }: any) => {
  const initialGroupId = route.params?.groupId || '';
  const { colors } = useTheme();

  const [currentUser, setCurrentUser] = useState<AuthResponse | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState(initialGroupId);
  const [balance, setBalance] = useState<GroupBalanceResponse | null>(null);

  const [descricao, setDescricao] = useState('');
  /** Valor total em centavos. Ex: 1000 = R$ 10,00 */
  const [valorTotalCents, setValorTotalCents] = useState(0);
  const [pagadorId, setPagadorId] = useState('');
  const [dataCompra, setDataCompra] = useState(new Date().toISOString().split('T')[0]);

  // Cotas dos participantes em centavos { usuarioId: 1000 }
  const [participantShares, setParticipantShares] = useState<{ [usuarioId: string]: number }>({});

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
    if (!balance || valorTotalCents <= 0) return;

    const count = balance.balancoIndividual.length;
    if (count === 0) return;

    // Distribui em centavos e coloca o centavo restante no primeiro participante
    const baseShare = Math.floor(valorTotalCents / count);
    const remainder = valorTotalCents - baseShare * count;

    const shares: { [usuarioId: string]: number } = {};
    balance.balancoIndividual.forEach((m, i) => {
      shares[m.usuarioId] = baseShare + (i === 0 ? remainder : 0);
    });
    setParticipantShares(shares);
  };

  const handleSubmit = async () => {
    setError('');

    if (valorTotalCents <= 0) {
      setError('Informe um valor total válido.');
      return;
    }

    if (!descricao) {
      setError('Informe a descrição da compra.');
      return;
    }

    const participantesList = Object.entries(participantShares)
      .map(([usuarioId, cents]) => ({
        usuarioId,
        valorDevido: cents / 100,
      }))
      .filter((p) => p.valorDevido > 0);

    if (participantesList.length === 0) {
      setError('Defina os valores devidos pelos participantes.');
      return;
    }

    // FE01 - Validação de Divisão Inconsistente (RN03)
    const somaPartesCents = Object.values(participantShares).reduce((sum, c) => sum + c, 0);
    if (somaPartesCents !== valorTotalCents) {
      const somaStr = (somaPartesCents / 100).toFixed(2).replace('.', ',');
      const totalStr = (valorTotalCents / 100).toFixed(2).replace('.', ',');
      setError(
        `FE01 - Divisão Inconsistente: A soma das frações (R$ ${somaStr}) não bate com o valor total (R$ ${totalStr}).`,
      );
      return;
    }

    setLoading(true);
    try {
      await expensesService.createExpense({
        grupoId: selectedGroupId,
        pagadorId: pagadorId || currentUser?.userId || '',
        descricao,
        valorTotal: valorTotalCents / 100,
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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <TouchableOpacity style={[styles.backButton, { backgroundColor: colors.surface }]} onPress={() => navigation.goBack()}>
              <ArrowLeft size={20} color={colors.textPrimary} />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={[styles.title, { color: colors.textPrimary }]}>Lançar Nova Despesa</Text>
              <Text style={[styles.subtitle, { color: colors.textMuted }]}>Registre uma compra e defina a partilha.</Text>
            </View>
          </View>

          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {!!error && (
          <View style={[styles.errorCard, { backgroundColor: colors.dangerBg, borderColor: colors.danger + '50' }]}>
            <AlertCircle size={18} color={colors.danger} />
            <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
          </View>
        )}

        {/* Escolha do Grupo */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.textMuted }]}>SELECIONAR GRUPO</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row' }}>
            {groups.map((g) => (
              <TouchableOpacity
                key={g.id}
                style={[
                  styles.chipGroup,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  selectedGroupId === g.id && { backgroundColor: colors.primary, borderColor: colors.primary },
                ]}
                onPress={() => setSelectedGroupId(g.id)}
              >
                <Text
                  style={[
                    styles.chipGroupText,
                    { color: colors.textMuted },
                    selectedGroupId === g.id && { color: '#ffffff' },
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
          <Text style={[styles.label, { color: colors.textMuted }]}>DESCRIÇÃO DA COMPRA</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
            placeholder="Ex: Mercado, Uber, Conta de Luz"
            placeholderTextColor={colors.textMuted}
            value={descricao}
            onChangeText={setDescricao}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.textMuted }]}>VALOR TOTAL (R$)</Text>
          <View style={[styles.input, styles.amountInputWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.currencySymbol, { color: colors.textMuted }]}>R$</Text>
            <CurrencyInput
              valueCents={valorTotalCents}
              onChangeCents={setValorTotalCents}
              inputStyle={[styles.amountInput, { color: colors.primary }]}
              placeholderTextColor={colors.textMuted}
            />
          </View>
        </View>

        {/* Divisão dos Participantes */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.splitHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Divisão dos Participantes</Text>
            <TouchableOpacity style={[styles.calcButton, { backgroundColor: colors.primaryBg }]} onPress={handleAutoSplitEqual}>
              <Calculator size={14} color={colors.primary} />
              <Text style={[styles.calcButtonText, { color: colors.primary }]}>Divisão Igualitária</Text>
            </TouchableOpacity>
          </View>

          {balance?.balancoIndividual.map((m) => (
            <View key={m.usuarioId} style={styles.participantRow}>
              <Text style={[styles.participantName, { color: colors.textPrimary }]}>{m.nome}</Text>
              <View style={[styles.shareInputWrapper, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <Text style={[styles.currencyPrefix, { color: colors.textMuted }]}>R$</Text>
                <CurrencyInput
                  valueCents={participantShares[m.usuarioId] ?? 0}
                  onChangeCents={(cents) =>
                    setParticipantShares({ ...participantShares, [m.usuarioId]: cents })
                  }
                  inputStyle={[styles.shareInput, { color: colors.textPrimary }]}
                  placeholderTextColor={colors.textMuted}
                />
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: colors.primary }, loading && { opacity: 0.6 }]}
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
    </KeyboardAvoidingView>
  </TouchableWithoutFeedback>
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
  content: { padding: 16, paddingBottom: 60, gap: 16 },
  errorCard: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, padding: 12, borderRadius: 14, gap: 8,
  },
  errorText: { fontSize: 12, flex: 1 },
  inputGroup: { gap: 6 },
  label: { fontSize: 11, fontWeight: 'bold', letterSpacing: 1 },
  input: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 14, height: 50, fontSize: 15 },
  amountInputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderRadius: 14, paddingHorizontal: 14, height: 60,
  },
  currencySymbol: { fontSize: 16, fontWeight: 'bold', marginRight: 6 },
  amountInput: { flex: 1, fontSize: 26, fontWeight: 'bold', textAlign: 'right' },
  chipGroup: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 14, borderWidth: 1, marginRight: 8,
  },
  chipGroupText: { fontSize: 13, fontWeight: 'bold' },
  card: { borderRadius: 24, padding: 16, borderWidth: 1, gap: 12 },
  splitHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderBottomWidth: 1, paddingBottom: 10,
  },
  cardTitle: { fontSize: 14, fontWeight: 'bold' },
  calcButton: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, gap: 4,
  },
  calcButtonText: { fontSize: 11, fontWeight: 'bold' },
  participantRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: 4,
  },
  participantName: { fontSize: 14, fontWeight: '600' },
  shareInputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderRadius: 12, paddingHorizontal: 10,
    width: 110, height: 40,
  },
  currencyPrefix: { fontSize: 12, marginRight: 4 },
  shareInput: { flex: 1, fontWeight: 'bold', fontSize: 14, textAlign: 'right' },
  submitButton: {
    height: 54, borderRadius: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, marginTop: 8, elevation: 3,
  },
  submitButtonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
});
