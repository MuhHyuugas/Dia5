import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { groupsService, ActivityItem } from '../services/groups.service';
import { Receipt, Calendar } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';

export const ActivityScreen = () => {
  const { colors } = useTheme();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const userGroups = await groupsService.getGroups();
      const promises = userGroups.map(async (g) => {
        const items = await groupsService.getGroupActivity(g.id);
        return items.map((item) => ({ ...item, grupoNome: g.nome }));
      });
      const results = await Promise.all(promises);
      const combined = results.flat().sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
      setActivities(combined);
    } catch (err) {
      console.error('Erro ao carregar histórico:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <View style={[styles.header, { borderBottomColor: colors.surface }]}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Extrato & Atividades</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>Histórico cronológico de lançamentos e pagamentos.</Text>
      </View>

      <FlatList
        data={activities}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View
              style={[
                styles.iconBox,
                { backgroundColor: item.tipo === 'DESPESA' ? colors.primaryBg : colors.secondaryBg },
              ]}
            >
              <Receipt size={20} color={item.tipo === 'DESPESA' ? colors.primary : colors.secondary} />
            </View>

            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
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
                {!!item.grupoNome && (
                  <View style={[styles.groupTag, { backgroundColor: colors.background, borderColor: colors.border }]}>
                    <Text style={[styles.groupTagText, { color: colors.primary }]}>{item.grupoNome}</Text>
                  </View>
                )}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Calendar size={12} color={colors.textMuted} />
                  <Text style={[styles.dateText, { color: colors.textMuted }]}>{new Date(item.data).toLocaleDateString()}</Text>
                </View>
              </View>

              <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>{item.descricao || 'Acerto de Contas'}</Text>
              <Text style={[styles.cardSub, { color: colors.textMuted }]}>
                {item.tipo === 'DESPESA'
                  ? `Pago por ${item.pagador}`
                  : `${item.pagador} pagou a ${item.recebedor}`}
              </Text>
            </View>

            <Text style={[styles.amount, { color: colors.textPrimary }]}>
              R$ {(item.valorTotal || item.valorPago || 0).toFixed(2)}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: 32 }} />
          ) : (
            <View style={styles.emptyContainer}>
              <Receipt size={54} color={colors.textMuted} />
              <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>Nenhum lançamento registrado</Text>
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>Suas despesas aparecerão aqui em ordem cronológica.</Text>
            </View>
          )
        }
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  title: { fontSize: 22, fontWeight: 'bold' },
  subtitle: { fontSize: 12 },
  card: {
    borderRadius: 20,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    gap: 12,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeBadge: {
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  groupTag: {
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  groupTagText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  dateText: { fontSize: 11 },
  cardTitle: { fontSize: 15, fontWeight: 'bold', marginTop: 2 },
  cardSub: { fontSize: 12, marginTop: 2 },
  amount: { fontSize: 15, fontWeight: 'bold' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 },
  emptyTitle: { fontSize: 16, fontWeight: 'bold' },
  emptyText: { fontSize: 13, textAlign: 'center' },
});
