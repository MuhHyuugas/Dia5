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
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { friendshipsService, Friend } from '../services/friendships.service';
import { paymentsService, GlobalBalanceResponse } from '../services/payments.service';
import { usersService, UserProfile } from '../services/users.service';
import { CurrencyInput } from '../components/CurrencyInput';
import { UserPlus, Users, Trash2, Wallet, X, Check } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';

export const FriendsScreen = () => {
  const { colors } = useTheme();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);

  // Modais
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSettleOpen, setIsSettleOpen] = useState(false);

  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [globalBalance, setGlobalBalance] = useState<GlobalBalanceResponse | null>(null);

  const [codigoPerfil, setCodigoPerfil] = useState('');
  /** Valor do pagamento em centavos */
  const [valorPagoCents, setValorPagoCents] = useState(0);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadFriends();
  }, []);

  const loadFriends = async () => {
    try {
      setLoading(true);
      const data = await friendshipsService.getFriends();
      setFriends(data);
    } catch (err) {
      console.error('Erro ao carregar amigos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFriend = async () => {
    setError('');
    if (!codigoPerfil) {
      setError('Informe o código de perfil.');
      return;
    }

    setActionLoading(true);
    try {
      await friendshipsService.addFriend(codigoPerfil);
      setIsAddOpen(false);
      setCodigoPerfil('');
      loadFriends();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao adicionar amigo.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveFriend = (friendId: string, nome: string) => {
    Alert.alert(
      'Desfazer Amizade',
      `Deseja desfazer a amizade com ${nome}? (Exige saldo zerado - RN06)`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Desfazer',
          style: 'destructive',
          onPress: async () => {
            try {
              await friendshipsService.removeFriend(friendId);
              loadFriends();
              if (selectedFriend?.id === friendId) {
                setSelectedFriend(null);
                setGlobalBalance(null);
              }
            } catch (err: any) {
              Alert.alert('Erro', err.response?.data?.message || 'Saldo pendente impede exclusão.');
            }
          },
        },
      ],
    );
  };

  const handleSelectFriend = async (friend: Friend) => {
    setSelectedFriend(friend);
    try {
      const bal = await paymentsService.getGlobalBalance(friend.id);
      setGlobalBalance(bal);
    } catch (err) {
      console.error('Erro ao carregar balanço global:', err);
    }
  };

  const handleSettleDebt = async () => {
    if (!selectedFriend || !globalBalance) return;
    setError('');

    if (valorPagoCents <= 0) {
      setError('Informe um valor válido.');
      return;
    }

    setActionLoading(true);
    try {
      // Se o saldo global é a receber (> 0), o amigo te deve -> o amigo é o pagador e você o recebedor
      // Se o saldo global é devendo (< 0), você deve -> você é o pagador e o amigo é o recebedor
      const isFriendDevendo = globalBalance.saldoLiquido > 0;
      const user = await usersService.getProfile();

      const pagadorId = isFriendDevendo ? selectedFriend.id : user.id;
      const recebedorId = isFriendDevendo ? user.id : selectedFriend.id;

      await paymentsService.settleDebt({
        pagadorId,
        recebedorId,
        valorPago: valorPagoCents / 100,
      });

      setIsSettleOpen(false);
      setValorPagoCents(0);
      handleSelectFriend(selectedFriend);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao registrar liquidação.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <View style={[styles.header, { borderBottomColor: colors.surface }]}>
        <View style={{ flex: 1, marginRight: 12 }}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Amigos Conectados</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>Saldos cruzados consolidados entre você e seus amigos.</Text>
        </View>

        <TouchableOpacity style={[styles.addButton, { backgroundColor: colors.primary }]} onPress={() => setIsAddOpen(true)}>
          <UserPlus size={18} color="#ffffff" />
          <Text style={styles.addButtonText}>+ Amigo</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={friends}
        keyExtractor={(item) => item.id}
        ListFooterComponent={
          selectedFriend && globalBalance ? (
            <View style={[styles.globalCard, { backgroundColor: colors.surface, borderColor: colors.primary + '66' }]}>
              <View style={[styles.globalHeader, { borderBottomColor: colors.border }]}>
                <View>
                  <Text style={[styles.globalLabel, { color: colors.textMuted }]}>BALANÇO GLOBAL CONSOLIDADO</Text>
                  <Text style={[styles.globalName, { color: colors.textPrimary }]}>{globalBalance.amigoNome}</Text>
                  <Text style={[styles.globalStatus, { color: colors.primary }]}>{globalBalance.situacao}</Text>
                </View>

                <TouchableOpacity
                  style={[styles.settleButton, { backgroundColor: colors.secondary }]}
                  onPress={() => setIsSettleOpen(true)}
                >
                  <Wallet size={16} color="#ffffff" />
                  <Text style={styles.settleButtonText}>Liquidar Dívida</Text>
                </TouchableOpacity>
              </View>

              <Text style={[styles.discrimTitle, { color: colors.textMuted }]}>DISCRIMINAÇÃO DAS DESPESAS EM COMUM:</Text>
              {globalBalance.discriminacao.map((item, idx) => (
                <View key={idx} style={[styles.discrimRow, { backgroundColor: colors.background }]}>
                  <Text style={[styles.discrimDesc, { color: colors.textPrimary }]}>{item.descricao} ({item.grupo})</Text>
                  <Text
                    style={[
                      styles.discrimAmount,
                      { color: item.tipo === 'A RECEBER' ? colors.secondary : colors.danger },
                    ]}
                  >
                    {item.tipo === 'A RECEBER'
                      ? `+ R$ ${item.valor.toFixed(2)}`
                      : `- R$ ${item.valor.toFixed(2)}`}
                  </Text>
                </View>
              ))}
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.friendCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
              selectedFriend?.id === item.id && { borderColor: colors.primary, backgroundColor: colors.primaryBg },
            ]}
            onPress={() => handleSelectFriend(item)}
          >
            <View style={styles.friendInfo}>
              <View style={[styles.avatar, { backgroundColor: colors.primaryBg }]}>
                <Text style={[styles.avatarText, { color: colors.primary }]}>{item.nome.charAt(0).toUpperCase()}</Text>
              </View>
              <View>
                <Text style={[styles.friendName, { color: colors.textPrimary }]}>{item.nome}</Text>
                <Text style={[styles.friendCode, { color: colors.textMuted }]}>Código: <Text style={{ color: colors.primary, fontWeight: 'bold' }}>{item.codigoPerfil}</Text></Text>
              </View>
            </View>

            <TouchableOpacity onPress={() => handleRemoveFriend(item.id, item.nome)}>
              <Trash2 size={18} color={colors.danger} />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: 32 }} />
          ) : (
            <View style={styles.emptyContainer}>
              <Users size={54} color={colors.textMuted} />
              <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>Nenhum amigo adicionado</Text>
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>Peça o código de 6 dígitos do perfil do seu amigo.</Text>
            </View>
          )
        }
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      />

      {/* Modal Adicionar Amigo por Código */}
      <Modal visible={isAddOpen} animationType="slide" transparent>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView
            style={styles.modalOverlay}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <View style={[styles.modalContent, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Adicionar Amigo por Código</Text>
                <TouchableOpacity onPress={() => setIsAddOpen(false)}>
                  <X size={20} color={colors.textMuted} />
                </TouchableOpacity>
              </View>

              {!!error && <Text style={[styles.modalError, { color: colors.danger }]}>{error}</Text>}

              <Text style={[styles.inputLabel, { color: colors.textMuted }]}>CÓDIGO DE PERFIL (6 DÍGITOS)</Text>
              <TextInput
                style={[styles.modalInput, styles.codeInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.primary }]}
                placeholder="Ex: BRE123"
                placeholderTextColor={colors.textMuted}
                maxLength={6}
                autoCapitalize="characters"
                value={codigoPerfil}
                onChangeText={(val) => setCodigoPerfil(val.toUpperCase())}
              />

              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                onPress={handleAddFriend}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.modalButtonText}>Conectar Amigo</Text>
                )}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Modal Liquidar Dívida */}
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
                    {globalBalance && globalBalance.saldoLiquido > 0
                      ? `Receber de ${selectedFriend?.nome}`
                      : `Pagar a ${selectedFriend?.nome}`}
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>
                    {globalBalance && globalBalance.saldoLiquido > 0
                      ? `Confirme que ${selectedFriend?.nome} pagou o valor a você:`
                      : `Confirme o valor pago a ${selectedFriend?.nome}:`}
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
                  valueCents={valorPagoCents}
                  onChangeCents={setValorPagoCents}
                  inputStyle={[styles.settleAmountInput, { color: colors.secondary }]}
                  placeholderTextColor={colors.textMuted}
                />
              </View>

              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.secondary }]}
                onPress={handleSettleDebt}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Check size={18} color="#ffffff" />
                    <Text style={styles.modalButtonText}>
                      {globalBalance && globalBalance.saldoLiquido > 0
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
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 12,
  },
  addButton: {
    height: 40,
    paddingHorizontal: 14,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  addButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  friendCard: {
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    borderWidth: 1,
  },
  friendInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  friendName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  friendCode: {
    fontSize: 12,
    marginTop: 2,
  },
  globalCard: {
    borderRadius: 24,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    gap: 12,
  },
  globalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    paddingBottom: 12,
  },
  globalLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  globalName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 2,
  },
  globalStatus: {
    fontSize: 13,
    fontWeight: 'bold',
    marginTop: 2,
  },
  settleButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  settleButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  discrimTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  discrimRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
  },
  discrimDesc: {
    fontSize: 12,
    fontWeight: '500',
  },
  discrimAmount: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    gap: 16,
    borderWidth: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalError: {
    fontSize: 13,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 50,
    fontSize: 15,
  },
  codeInput: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 4,
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
  modalButton: {
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
