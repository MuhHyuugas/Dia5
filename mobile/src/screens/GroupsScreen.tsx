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
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { groupsService, Group } from '../services/groups.service';
import { Plus, KeyRound, Users, ChevronRight, X, Check } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';

export const GroupsScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);

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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <View style={[styles.header, { borderBottomColor: colors.surface }]}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Meus Grupos</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>Gerencie suas contas divididas por contexto.</Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => setIsJoinOpen(true)}
          >
            <KeyRound size={20} color={colors.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.createButton, { backgroundColor: colors.primary }]}
            onPress={() => setIsCreateOpen(true)}
          >
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
            style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => navigation.navigate('GroupDetails', { groupId: item.id })}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.badge, { backgroundColor: colors.primaryBg }]}>
                <Text style={[styles.badgeText, { color: colors.primary }]}>{item.nome.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={[styles.codeTag, { backgroundColor: colors.primaryBg }]}>
                <Text style={[styles.codeTagText, { color: colors.primary }]}>{item.codigoConvite}</Text>
              </View>
            </View>

            <Text style={[styles.groupTitle, { color: colors.textPrimary }]}>{item.nome}</Text>
            <Text style={[styles.groupSub, { color: colors.textMuted }]}>Toque para ver os participantes e extrato</Text>

            <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
              <Text style={[styles.footerText, { color: colors.textMuted }]}>
                Código: <Text style={[styles.footerCode, { color: colors.primary }]}>{item.codigoConvite}</Text>
              </Text>
              <ChevronRight size={18} color={colors.primary} />
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: 32 }} />
          ) : (
            <View style={styles.emptyContainer}>
              <Users size={54} color={colors.textMuted} />
              <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>Nenhum grupo encontrado</Text>
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                Crie um novo espaço (ex: "Casa") ou entre usando um código de convite.
              </Text>
            </View>
          )
        }
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      />

      {/* Modal Criar Grupo */}
      <Modal visible={isCreateOpen} animationType="slide" transparent>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView
            style={styles.modalOverlay}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <View style={[styles.modalContent, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Criar Novo Grupo</Text>
                <TouchableOpacity onPress={() => setIsCreateOpen(false)}>
                  <X size={20} color={colors.textMuted} />
                </TouchableOpacity>
              </View>

              {!!error && <Text style={[styles.modalError, { color: colors.danger }]}>{error}</Text>}

              <Text style={[styles.inputLabel, { color: colors.textMuted }]}>NOME DO GRUPO</Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.textPrimary }]}
                placeholder="Ex: República, Viagem Praia"
                placeholderTextColor={colors.textMuted}
                value={nomeGrupo}
                onChangeText={setNomeGrupo}
              />

              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.primary }]}
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
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Modal Entrar com Código */}
      <Modal visible={isJoinOpen} animationType="slide" transparent>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView
            style={styles.modalOverlay}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <View style={[styles.modalContent, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Entrar em um Grupo</Text>
                <TouchableOpacity onPress={() => setIsJoinOpen(false)}>
                  <X size={20} color={colors.textMuted} />
                </TouchableOpacity>
              </View>

              {!!error && <Text style={[styles.modalError, { color: colors.danger }]}>{error}</Text>}

              <Text style={[styles.inputLabel, { color: colors.textMuted }]}>CÓDIGO DE CONVITE (6 DÍGITOS)</Text>
              <TextInput
                style={[styles.modalInput, styles.codeInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.primary }]}
                placeholder="Ex: REP456"
                placeholderTextColor={colors.textMuted}
                maxLength={6}
                autoCapitalize="characters"
                value={codigoConvite}
                onChangeText={(val) => setCodigoConvite(val.toUpperCase())}
              />

              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.secondary }]}
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  title: { fontSize: 22, fontWeight: 'bold' },
  subtitle: { fontSize: 12 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconButton: {
    width: 40, height: 40, borderRadius: 14,
    borderWidth: 1, alignItems: 'center', justifyContent: 'center',
  },
  createButton: {
    height: 40, paddingHorizontal: 14, borderRadius: 14,
    flexDirection: 'row', alignItems: 'center', gap: 6,
  },
  createButtonText: { color: '#ffffff', fontWeight: 'bold', fontSize: 12 },
  card: { borderRadius: 24, padding: 16, marginBottom: 12, borderWidth: 1, gap: 8 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  badge: {
    width: 44, height: 44, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  badgeText: { fontWeight: 'bold', fontSize: 20 },
  codeTag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  codeTagText: { fontWeight: 'bold', fontSize: 12 },
  groupTitle: { fontSize: 18, fontWeight: 'bold' },
  groupSub: { fontSize: 12 },
  cardFooter: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: 8, borderTopWidth: 1,
  },
  footerText: { fontSize: 12 },
  footerCode: { fontWeight: 'bold' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 },
  emptyTitle: { fontSize: 16, fontWeight: 'bold' },
  emptyText: { fontSize: 13, textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: {
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24, gap: 16, borderWidth: 1,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontSize: 18, fontWeight: 'bold' },
  modalError: { fontSize: 13 },
  inputLabel: { fontSize: 11, fontWeight: 'bold', letterSpacing: 1 },
  modalInput: {
    borderWidth: 1, borderRadius: 14,
    paddingHorizontal: 14, height: 50, fontSize: 15,
  },
  codeInput: { textAlign: 'center', fontSize: 20, fontWeight: 'bold', letterSpacing: 4 },
  modalButton: {
    height: 52, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center', marginTop: 8,
  },
  modalButtonText: { color: '#ffffff', fontWeight: 'bold', fontSize: 15 },
});
