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
  SafeAreaView,
} from 'react-native';
import { groupsService, Group } from '../services/groups.service';
import { Plus, KeyRound, Users, ChevronRight, X, Check } from 'lucide-react-native';

export const GroupsScreen = ({ navigation }: any) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  // Modais
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);

  // Formulários
  const [nomeGrupo, setNomeGrupo] = useState('');
  const [codigoConvite, setCodigoConvite] = useState('');
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const data = await groupsService.getGroups();
      setGroups(data);
    } catch (err) {
      console.error('Erro ao carregar grupos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async () => {
    setError('');
    if (!nomeGrupo) {
      setError('Informe o nome do grupo.');
      return;
    }

    setActionLoading(true);
    try {
      const newGroup = await groupsService.createGroup(nomeGrupo);
      setIsCreateOpen(false);
      setNomeGrupo('');
      loadGroups();
      navigation.navigate('GroupDetails', { groupId: newGroup.id });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao criar grupo.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleJoinGroup = async () => {
    setError('');
    if (!codigoConvite) {
      setError('Informe o código de convite.');
      return;
    }

    setActionLoading(true);
    try {
      const res = await groupsService.joinGroup(codigoConvite);
      setIsJoinOpen(false);
      setCodigoConvite('');
      loadGroups();
      navigation.navigate('GroupDetails', { groupId: res.group.id });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Código de grupo inválido.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Meus Grupos</Text>
          <Text style={styles.subtitle}>Gerencie suas contas divididas por contexto.</Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconButton} onPress={() => setIsJoinOpen(true)}>
            <KeyRound size={20} color="#7c3aed" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.createButton} onPress={() => setIsCreateOpen(true)}>
            <Plus size={18} color="#ffffff" />
            <Text style={styles.createButtonText}>Novo Grupo</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={groups}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('GroupDetails', { groupId: item.id })}
          >
            <View style={styles.cardHeader}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.nome.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={styles.codeTag}>
                <Text style={styles.codeTagText}>{item.codigoConvite}</Text>
              </View>
            </View>

            <Text style={styles.groupTitle}>{item.nome}</Text>
            <Text style={styles.groupSub}>Toque para ver os participantes e extrato</Text>

            <View style={styles.cardFooter}>
              <Text style={styles.footerText}>
                Código: <Text style={styles.footerCode}>{item.codigoConvite}</Text>
              </Text>
              <ChevronRight size={18} color="#7c3aed" />
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator color="#7c3aed" style={{ marginTop: 32 }} />
          ) : (
            <View style={styles.emptyContainer}>
              <Users size={54} color="#64748b" />
              <Text style={styles.emptyTitle}>Nenhum grupo encontrado</Text>
              <Text style={styles.emptyText}>
                Crie um novo espaço (ex: "Casa") ou entre usando um código de convite.
              </Text>
            </View>
          )
        }
        contentContainerStyle={{ padding: 16 }}
      />

      {/* Modal Criar Grupo */}
      <Modal visible={isCreateOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Criar Novo Grupo</Text>
              <TouchableOpacity onPress={() => setIsCreateOpen(false)}>
                <X size={20} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            {!!error && <Text style={styles.modalError}>{error}</Text>}

            <Text style={styles.inputLabel}>NOME DO GRUPO</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Ex: República, Viagem Praia"
              placeholderTextColor="#94a3b8"
              value={nomeGrupo}
              onChangeText={setNomeGrupo}
            />

            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleCreateGroup}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.modalButtonText}>Salvar e Gerar Código</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal Entrar com Código */}
      <Modal visible={isJoinOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Entrar em um Grupo</Text>
              <TouchableOpacity onPress={() => setIsJoinOpen(false)}>
                <X size={20} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            {!!error && <Text style={styles.modalError}>{error}</Text>}

            <Text style={styles.inputLabel}>CÓDIGO DE CONVITE (6 DÍGITOS)</Text>
            <TextInput
              style={[styles.modalInput, styles.codeInput]}
              placeholder="Ex: REP456"
              placeholderTextColor="#94a3b8"
              maxLength={6}
              autoCapitalize="characters"
              value={codigoConvite}
              onChangeText={(val) => setCodigoConvite(val.toUpperCase())}
            />

            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: '#10b981' }]}
              onPress={handleJoinGroup}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Check size={18} color="#ffffff" />
                  <Text style={styles.modalButtonText}>Entrar no Grupo</Text>
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#171f33',
    borderWidth: 1,
    borderColor: '#2d3449',
    alignItems: 'center',
    justifyContent: 'center',
  },
  createButton: {
    height: 40,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: '#7c3aed',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  createButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  card: {
    backgroundColor: '#171f33',
    borderRadius: 24,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2d3449',
    gap: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#7c3aed',
    fontWeight: 'bold',
    fontSize: 20,
  },
  codeTag: {
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  codeTagText: {
    color: '#7c3aed',
    fontWeight: 'bold',
    fontSize: 12,
  },
  groupTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#dae2fd',
  },
  groupSub: {
    fontSize: 12,
    color: '#94a3b8',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(45, 52, 73, 0.5)',
  },
  footerText: {
    fontSize: 12,
    color: '#94a3b8',
  },
  footerCode: {
    color: '#7c3aed',
    fontWeight: 'bold',
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
