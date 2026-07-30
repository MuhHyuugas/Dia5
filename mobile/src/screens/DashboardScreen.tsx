import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { groupsService, Group } from '../services/groups.service';
import { authService, AuthResponse } from '../services/auth.service';
import { Plus, Users, Wallet, ChevronRight, TrendingUp, LogOut } from 'lucide-react-native';

export const DashboardScreen = ({ navigation }: any) => {
  const [user, setUser] = useState<AuthResponse | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      const data = await groupsService.getGroups();
      setGroups(data);
    } catch (err) {
      console.error('Erro ao carregar dashboard nativo:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleLogout = async () => {
    await authService.logout();
    navigation.replace('Login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header Superior */}
        <View style={styles.header}>
          <View style={styles.userSection}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.nome ? user.nome.charAt(0).toUpperCase() : 'U'}
              </Text>
            </View>
            <View>
              <Text style={styles.headerTitle}>Dia 5</Text>
              <Text style={styles.headerSubtitle}>
                Olá, <Text style={styles.username}>{user?.nome || 'Usuário'}</Text>
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={20} color="#94a3b8" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={groups}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7c3aed" />
          }
          ListHeaderComponent={
            <View style={styles.bannerContainer}>
              {/* Card de Balanço Geral */}
              <View style={styles.balanceCard}>
                <View style={styles.balanceHeader}>
                  <View>
                    <Text style={styles.balanceLabel}>BALANÇO GERAL CONSOLIDADO</Text>
                    <Text style={styles.balanceValue}>+ R$ 0,00</Text>
                    <Text style={styles.balanceSubtext}>Saldos sincronizados em tempo real.</Text>
                  </View>
                  <View style={styles.walletIcon}>
                    <Wallet size={24} color="#10b981" />
                  </View>
                </View>

                {/* Botões de Ação Rápida */}
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={styles.primaryActionButton}
                    onPress={() => navigation.navigate('AddExpense')}
                  >
                    <Plus size={20} color="#ffffff" />
                    <Text style={styles.primaryActionText}>Lançar Gastos</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.secondaryActionButton}
                    onPress={() => navigation.navigate('GroupsTab')}
                  >
                    <Users size={20} color="#7c3aed" />
                    <Text style={styles.secondaryActionText}>Meus Grupos</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Dica da Semana */}
              <View style={styles.tipCard}>
                <TrendingUp size={20} color="#7c3aed" />
                <View style={styles.tipContent}>
                  <Text style={styles.tipTitle}>DICA INTELIGENTE DIA 5</Text>
                  <Text style={styles.tipText}>
                    Adicione Usuários Convidados (Shadow Users) para registrar contas de pessoas que não possuem o app!
                  </Text>
                </View>
              </View>

              <Text style={styles.sectionTitle}>Meus Grupos ({groups.length})</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.groupCard}
              onPress={() => navigation.navigate('GroupDetails', { groupId: item.id })}
            >
              <View style={styles.groupBadge}>
                <Text style={styles.groupBadgeText}>{item.nome.charAt(0).toUpperCase()}</Text>
              </View>

              <View style={styles.groupInfo}>
                <Text style={styles.groupName}>{item.nome}</Text>
                <Text style={styles.groupCode}>Código: <Text style={styles.codeText}>{item.codigoConvite}</Text></Text>
              </View>

              <ChevronRight size={20} color="#64748b" />
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            loading ? (
              <ActivityIndicator color="#7c3aed" style={{ marginTop: 24 }} />
            ) : (
              <View style={styles.emptyContainer}>
                <Users size={48} color="#64748b" />
                <Text style={styles.emptyText}>Você ainda não participa de nenhum grupo.</Text>
              </View>
            )
          }
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b1326',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#171f33',
    marginBottom: 16,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#7c3aed',
  },
  avatarText: {
    color: '#7c3aed',
    fontWeight: 'bold',
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#dae2fd',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
  },
  username: {
    color: '#7c3aed',
    fontWeight: 'bold',
  },
  logoutButton: {
    padding: 8,
  },
  bannerContainer: {
    gap: 16,
    marginBottom: 16,
  },
  balanceCard: {
    backgroundColor: '#171f33',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2d3449',
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  balanceLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#94a3b8',
    letterSpacing: 1,
  },
  balanceValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#10b981',
    marginTop: 4,
  },
  balanceSubtext: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  walletIcon: {
    padding: 10,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  primaryActionButton: {
    flex: 1,
    height: 48,
    backgroundColor: '#7c3aed',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryActionText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  secondaryActionButton: {
    height: 48,
    paddingHorizontal: 16,
    backgroundColor: '#0b1326',
    borderWidth: 1,
    borderColor: '#2d3449',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryActionText: {
    color: '#dae2fd',
    fontWeight: 'bold',
    fontSize: 14,
  },
  tipCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(124, 58, 237, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.2)',
    borderRadius: 20,
    padding: 16,
    gap: 12,
    alignItems: 'flex-start',
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#7c3aed',
    letterSpacing: 1,
  },
  tipText: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#dae2fd',
    marginTop: 8,
  },
  groupCard: {
    backgroundColor: '#171f33',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2d3449',
  },
  groupBadge: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  groupBadgeText: {
    color: '#7c3aed',
    fontWeight: 'bold',
    fontSize: 18,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#dae2fd',
  },
  groupCode: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  codeText: {
    color: '#7c3aed',
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 14,
    textAlign: 'center',
  },
});
