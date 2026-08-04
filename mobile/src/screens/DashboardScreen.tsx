import React, { useCallback, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { groupsService, Group } from '../services/groups.service';
import { authService, AuthResponse } from '../services/auth.service';
import { expensesService } from '../services/expenses.service';
import { usersService } from '../services/users.service';
import { useFocusEffect } from '@react-navigation/native';
import { Plus, Users, Wallet, ChevronRight, TrendingUp, BookOpen } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';

export const DashboardScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const [user, setUser] = useState<AuthResponse | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [consolidatedBalance, setConsolidatedBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, []),
  );

  const loadData = async () => {
    try {
      setLoading(true);
      const [currentUser, profile, data] = await Promise.all([
        authService.getCurrentUser(),
        usersService.getProfile().catch(() => null),
        groupsService.getGroups(),
      ]);
      setUser(currentUser);
      setGroups(data);

      const myUserId = profile?.id || currentUser?.userId || currentUser?.id;

      if (myUserId && data.length > 0) {
        const balances = await Promise.all(
          data.map((g) => expensesService.getGroupBalance(g.id).catch(() => null))
        );
        let sum = 0;
        for (const b of balances) {
          if (b && b.balancoIndividual) {
            const myB = b.balancoIndividual.find((m: any) => m.usuarioId === myUserId);
            if (myB) {
              sum += Number(myB.saldoLiquido) || 0;
            }
          }
        }
        setConsolidatedBalance(Math.round(sum * 100) / 100);
      } else {
        setConsolidatedBalance(0);
      }
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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <View style={styles.content}>
        {/* Header Superior */}
        <View style={[styles.header, { borderBottomColor: colors.surface }]}>
          <View style={styles.userSection}>
            <View style={[styles.avatar, { backgroundColor: colors.primaryBg, borderColor: colors.primary }]}>
              <Text style={[styles.avatarText, { color: colors.primary }]}>
                {user?.nome ? user.nome.charAt(0).toUpperCase() : 'U'}
              </Text>
            </View>
            <View>
              <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Dia 5</Text>
              <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
                Olá, <Text style={[styles.username, { color: colors.primary }]}>{user?.nome || 'Usuário'}</Text>
              </Text>
            </View>
          </View>
        </View>

        <FlatList
          data={groups}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
          ListHeaderComponent={
            <View style={styles.bannerContainer}>
              {/* Card de Balanço Geral */}
              <View style={[styles.balanceCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.balanceHeader}>
                  <View>
                    <Text style={[styles.balanceLabel, { color: colors.textMuted }]}>BALANÇO GERAL CONSOLIDADO</Text>
                    <Text
                      style={[
                        styles.balanceValue,
                        consolidatedBalance > 0
                          ? { color: colors.secondary }
                          : consolidatedBalance < 0
                          ? { color: colors.danger }
                          : { color: colors.textMuted },
                      ]}
                    >
                      {consolidatedBalance > 0
                        ? `+ R$ ${consolidatedBalance.toFixed(2)}`
                        : consolidatedBalance < 0
                        ? `- R$ ${Math.abs(consolidatedBalance).toFixed(2)}`
                        : 'R$ 0,00'}
                    </Text>
                    <Text style={[styles.balanceSubtext, { color: colors.textMuted }]}>
                      {consolidatedBalance > 0
                        ? 'Você tem saldo a receber somando todos os seus grupos.'
                        : consolidatedBalance < 0
                        ? 'Você tem dívidas pendentes somando todos os seus grupos.'
                        : 'Você está quitado em todos os seus grupos!'}
                    </Text>
                  </View>
                  <View style={[styles.walletIcon, { backgroundColor: colors.secondaryBg }]}>
                    <Wallet size={24} color={colors.secondary} />
                  </View>
                </View>

                {/* Botões de Ação Rápida */}
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[styles.primaryActionButton, { backgroundColor: colors.primary }]}
                    onPress={() => navigation.navigate('AddExpense')}
                  >
                    <Plus size={20} color="#ffffff" />
                    <Text style={styles.primaryActionText}>Lançar Gastos</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.secondaryActionButton, { backgroundColor: colors.background, borderColor: colors.border }]}
                    onPress={() => navigation.navigate('GroupsTab')}
                  >
                    <Users size={20} color={colors.primary} />
                    <Text style={[styles.secondaryActionText, { color: colors.textPrimary }]}>Meus Grupos</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Card Tutorial */}
              <TouchableOpacity
                style={[styles.tutorialCard, { backgroundColor: colors.primaryBg, borderColor: colors.primary + '40' }]}
                onPress={() => navigation.navigate('Onboarding', { isReplay: true })}
              >
                <BookOpen size={20} color={colors.primary} />
                <View style={styles.tipContent}>
                  <Text style={[styles.tipTitle, { color: colors.primary }]}>APRENDA A USAR O DIA 5</Text>
                  <Text style={[styles.tipText, { color: colors.textMuted }]}>
                    Veja o tutorial passo a passo e domine todas as funcionalidades!
                  </Text>
                </View>
                <ChevronRight size={16} color={colors.primary} />
              </TouchableOpacity>

              {/* Dica da Semana */}
              <View style={[styles.tipCard, { backgroundColor: colors.primaryBg, borderColor: colors.primary + '30' }]}>
                <TrendingUp size={20} color={colors.primary} />
                <View style={styles.tipContent}>
                  <Text style={[styles.tipTitle, { color: colors.primary }]}>DICA INTELIGENTE DIA 5</Text>
                  <Text style={[styles.tipText, { color: colors.textMuted }]}>
                    Adicione Usuários Convidados (Shadow Users) para registrar contas de pessoas que não possuem o app!
                  </Text>
                </View>
              </View>

              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Meus Grupos ({groups.length})</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.groupCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => navigation.navigate('GroupDetails', { groupId: item.id })}
            >
              <View style={[styles.groupBadge, { backgroundColor: colors.primaryBg }]}>
                <Text style={[styles.groupBadgeText, { color: colors.primary }]}>{item.nome.charAt(0).toUpperCase()}</Text>
              </View>

              <View style={styles.groupInfo}>
                <Text style={[styles.groupName, { color: colors.textPrimary }]}>{item.nome}</Text>
                <Text style={[styles.groupCode, { color: colors.textMuted }]}>
                  Código: <Text style={[styles.codeText, { color: colors.primary }]}>{item.codigoConvite}</Text>
                </Text>
              </View>

              <ChevronRight size={20} color={colors.textMuted} />
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            loading ? (
              <ActivityIndicator color={colors.primary} style={{ marginTop: 24 }} />
            ) : (
              <View style={styles.emptyContainer}>
                <Users size={48} color={colors.textMuted} />
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>Você ainda não participa de nenhum grupo.</Text>
              </View>
            )
          }
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  avatarText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 12,
  },
  username: {
    fontWeight: 'bold',
  },
  bannerContainer: {
    gap: 16,
    marginBottom: 16,
  },
  balanceCard: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  balanceLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  balanceValue: {
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 4,
  },
  balanceSubtext: {
    fontSize: 12,
    marginTop: 2,
  },
  walletIcon: {
    padding: 10,
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
    borderWidth: 1,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryActionText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  tutorialCard: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    gap: 12,
    alignItems: 'center',
  },
  tipCard: {
    flexDirection: 'row',
    borderWidth: 1,
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
    letterSpacing: 1,
  },
  tipText: {
    fontSize: 12,
    marginTop: 4,
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
  },
  groupCard: {
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
  },
  groupBadge: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  groupBadgeText: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  groupCode: {
    fontSize: 12,
    marginTop: 2,
  },
  codeText: {
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
});
