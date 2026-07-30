import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { groupsService, ActivityItem } from '../services/groups.service';
import { Receipt, Calendar } from 'lucide-react-native';

export const ActivityScreen = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const userGroups = await groupsService.getGroups();
      const promises = userGroups.map((g) => groupsService.getGroupActivity(g.id));
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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Extrato & Atividades</Text>
        <Text style={styles.subtitle}>Histórico cronológico de lançamentos e pagamentos.</Text>
      </View>

      <FlatList
        data={activities}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View
              style={[
                styles.iconBox,
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
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Calendar size={12} color="#94a3b8" />
                  <Text style={styles.dateText}>{new Date(item.data).toLocaleDateString()}</Text>
                </View>
              </View>

              <Text style={styles.cardTitle}>{item.descricao || 'Acerto de Contas'}</Text>
              <Text style={styles.cardSub}>
                {item.tipo === 'DESPESA'
                  ? `Pago por ${item.pagador}`
                  : `${item.pagador} pagou a ${item.recebedor}`}
              </Text>
            </View>

            <Text style={styles.amount}>
              R$ {(item.valorTotal || item.valorPago || 0).toFixed(2)}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator color="#7c3aed" style={{ marginTop: 32 }} />
          ) : (
            <View style={styles.emptyContainer}>
              <Receipt size={54} color="#64748b" />
              <Text style={styles.emptyTitle}>Nenhum lançamento registrado</Text>
              <Text style={styles.emptyText}>Suas despesas aparecerão aqui em ordem cronológica.</Text>
            </View>
          )
        }
        contentContainerStyle={{ padding: 16 }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b1326',
  },
  header: {
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
  card: {
    backgroundColor: '#171f33',
    borderRadius: 20,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#2d3449',
    gap: 12,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 16,
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
  dateText: {
    fontSize: 11,
    color: '#94a3b8',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#dae2fd',
    marginTop: 2,
  },
  cardSub: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  amount: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#dae2fd',
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
});
