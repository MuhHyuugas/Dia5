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
import { friendshipsService, Friend } from '../services/friendships.service';
import { paymentsService, GlobalBalanceResponse } from '../services/payments.service';
import { UserPlus, Users, Trash2, Wallet, X, Check } from 'lucide-react-native';

export const FriendsScreen = () => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);

  // Modais
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSettleOpen, setIsSettleOpen] = useState(false);

  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [globalBalance, setGlobalBalance] = useState<GlobalBalanceResponse | null>(null);

  const [codigoPerfil, setCodigoPerfil] = useState('');
  const [valorPago, setValorPago] = useState('');
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
    if (!selectedFriend) return;
    setError('');

    const valor = parseFloat(valorPago);
    if (isNaN(valor) || valor <= 0) {
      setError('Informe um valor válido.');
      return;
    }

    setActionLoading(true);
    try {
      await paymentsService.settleDebt({
        recebedorId: selectedFriend.id,
        valorPago: valor,
      });

      setIsSettleOpen(false);
      setValorPago('');
      handleSelectFriend(selectedFriend);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao registrar liquidação.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Amigos Conectados</Text>
          <Text style={styles.subtitle}>Saldos cruzados consolidados entre você e seus amigos.</Text>
        </View>

        <TouchableOpacity style={styles.addButton} onPress={() => setIsAddOpen(true)}>
          <UserPlus size={18} color="#ffffff" />
          <Text style={styles.addButtonText}>+ Amigo</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={friends}
        keyExtractor={(item) => item.id}
        ListFooterComponent={
          selectedFriend && globalBalance ? (
            <View style={styles.globalCard}>
              <View style={styles.globalHeader}>
                <View>
                  <Text style={styles.globalLabel}>BALANÇO GLOBAL CONSOLIDADO</Text>
                  <Text style={styles.globalName}>{globalBalance.amigoNome}</Text>
                  <Text style={styles.globalStatus}>{globalBalance.situacao}</Text>
                </View>

                <TouchableOpacity
                  style={styles.settleButton}
                  onPress={() => setIsSettleOpen(true)}
                >
                  <Wallet size={16} color="#ffffff" />
                  <Text style={styles.settleButtonText}>Liquidar Dívida</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.discrimTitle}>DISCRIMINAÇÃO DAS DESPESAS EM COMUM:</Text>
              {globalBalance.discriminacao.map((item, idx) => (
                <View key={idx} style={styles.discrimRow}>
                  <Text style={styles.discrimDesc}>{item.descricao} ({item.grupo})</Text>
                  <Text
                    style={[
                      styles.discrimAmount,
                      item.tipo === 'A RECEBER' ? styles.positiveText : styles.negativeText,
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
              selectedFriend?.id === item.id && styles.friendCardSelected,
            ]}
            onPress={() => handleSelectFriend(item)}
          >
            <View style={styles.friendInfo}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.nome.charAt(0).toUpperCase()}</Text>
              </View>
              <View>
                <Text style={styles.friendName}>{item.nome}</Text>
                <Text style={styles.friendCode}>Código: <Text style={{ color: '#7c3aed', fontWeight: 'bold' }}>{item.codigoPerfil}</Text></Text>
              </View>
            </View>

            <TouchableOpacity onPress={() => handleRemoveFriend(item.id, item.nome)}>
              <Trash2 size={18} color="#ef4444" />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator color="#7c3aed" style={{ marginTop: 32 }} />
          ) : (
            <View style={styles.emptyContainer}>
              <Users size={54} color="#64748b" />
              <Text style={styles.emptyTitle}>Nenhum amigo adicionado</Text>
              <Text style={styles.emptyText}>Peça o código de 6 dígitos do perfil do seu amigo.</Text>
            </View>
          )
        }
        contentContainerStyle={{ padding: 16 }}
      />

      {/* Modal Adicionar Amigo por Código */}
      <Modal visible={isAddOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Adicionar Amigo por Código</Text>
              <TouchableOpacity onPress={() => setIsAddOpen(false)}>
                <X size={20} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            {!!error && <Text style={styles.modalError}>{error}</Text>}

            <Text style={styles.inputLabel}>CÓDIGO DE PERFIL (6 DÍGITOS)</Text>
            <TextInput
              style={[styles.modalInput, styles.codeInput]}
              placeholder="Ex: BRE123"
              placeholderTextColor="#94a3b8"
              maxLength={6}
              autoCapitalize="characters"
              value={codigoPerfil}
              onChangeText={(val) => setCodigoPerfil(val.toUpperCase())}
            />

            <TouchableOpacity
              style={styles.modalButton}
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
        </View>
      </Modal>

      {/* Modal Liquidar Dívida */}
      <Modal visible={isSettleOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Liquidar Dívida com {selectedFriend?.nome}</Text>
              <TouchableOpacity onPress={() => setIsSettleOpen(false)}>
                <X size={20} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            {!!error && <Text style={styles.modalError}>{error}</Text>}

            <Text style={styles.inputLabel}>VALOR PAGO (R$)</Text>
            <TextInput
              style={[styles.modalInput, { fontSize: 20, fontWeight: 'bold', color: '#10b981' }]}
              placeholder="0,00"
              placeholderTextColor="#94a3b8"
              keyboardType="numeric"
              value={valorPago}
              onChangeText={setValorPago}
            />

            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: '#10b981' }]}
              onPress={handleSettleDebt}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Check size={18} color="#ffffff" />
                  <Text style={styles.modalButtonText}>Confirmar Pagamento</Text>
                </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#171f33',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#dae2fd',
  },
  subtitle: {
    fontSize: 12,
    color: '#94a3b8',
  },
  addButton: {
    height: 40,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: '#7c3aed',
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
    backgroundColor: '#171f33',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2d3449',
  },
  friendCardSelected: {
    borderColor: '#7c3aed',
    backgroundColor: 'rgba(124, 58, 237, 0.08)',
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
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#7c3aed',
    fontWeight: 'bold',
    fontSize: 18,
  },
  friendName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#dae2fd',
  },
  friendCode: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  globalCard: {
    backgroundColor: '#171f33',
    borderRadius: 24,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.4)',
    gap: 12,
  },
  globalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#2d3449',
    paddingBottom: 12,
  },
  globalLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#94a3b8',
    letterSpacing: 1,
  },
  globalName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#dae2fd',
    marginTop: 2,
  },
  globalStatus: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#7c3aed',
    marginTop: 2,
  },
  settleButton: {
    backgroundColor: '#10b981',
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
    color: '#94a3b8',
    letterSpacing: 1,
  },
  discrimRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0b1326',
    padding: 10,
    borderRadius: 12,
  },
  discrimDesc: {
    fontSize: 12,
    color: '#dae2fd',
    fontWeight: '500',
  },
  discrimAmount: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  positiveText: {
    color: '#10b981',
  },
  negativeText: {
    color: '#ef4444',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
  },
  emptyTitle: {
    color: '#dae2fd',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 13,
    textAlign: 'center',
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
  codeInput: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#7c3aed',
    letterSpacing: 4,
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
