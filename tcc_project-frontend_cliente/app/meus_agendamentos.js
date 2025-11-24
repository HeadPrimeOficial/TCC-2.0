import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/agenda_colors';
import { AgendaService } from '../services/AgendaService';

export default function MeusAgendamentosScreen() {
  const router = useRouter();
  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(true);
  const USUARIO_ID = 1; // Fixo por enquanto

  // useFocusEffect recarrega a lista toda vez que você volta para essa tela
  useFocusEffect(
    useCallback(() => {
      carregarAgendamentos();
    }, [])
  );

 const carregarAgendamentos = async () => {
    setLoading(true);
    console.log(`>>> BUSCANDO AGENDAMENTOS PARA USUÁRIO ID: ${USUARIO_ID}`);

    try {
      const dados = await AgendaService.listarAgendamentosUsuario(USUARIO_ID);
      
      console.log(">>> O QUE O JAVA RESPONDEU:", JSON.stringify(dados, null, 2));

      if (dados && dados.length > 0) {
        const ordenado = dados.sort((a, b) => new Date(b.dataAgendamento) - new Date(a.dataAgendamento));
        setLista(ordenado);
      } else {
        console.log(">>> LISTA VEIO VAZIA DO SERVIDOR");
        setLista([]); // Garante que limpa a lista se vier vazio
      }
    } catch (error) {
      console.error(">>> ERRO FATAL AO BUSCAR:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    if (status === 'DISPONIVEL' || status === 'CONCLUIDO') return COLORS.status.disponivel;
    if (status === 'AGENDADO' || status === 'EM_PROCESSO') return COLORS.status.emProcesso;
    return COLORS.status.indisponivel;
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={[styles.statusBar, { backgroundColor: getStatusColor(item.status) }]} />
      <View style={styles.cardContent}>
        <Text style={styles.dataText}>📅 {item.dataAgendamentos}</Text>
        <Text style={styles.oficinaText}>Oficina #{item.oficinaId}</Text>
        <View style={[styles.badge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.badgeText}>{item.status}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Meus Agendamentos</Text>
        <View style={{ width: 28 }} /> 
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.button.background} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={lista}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 20 }}
          ListEmptyComponent={<Text style={styles.emptyText}>Nenhum agendamento encontrado.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f4f4' },
  header: {
    height: 90,
    backgroundColor: COLORS.navBar,
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingBottom: 15,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    elevation: 4,
  },
  title: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    marginBottom: 15,
    flexDirection: 'row',
    overflow: 'hidden',
    elevation: 3, // Sombra Android
    shadowColor: '#000', // Sombra iOS
    shadowOpacity: 0.1,
    shadowRadius: 4,
    height: 100,
  },
  statusBar: { width: 8, height: '100%' },
  cardContent: { flex: 1, padding: 15, justifyContent: 'center' },
  dataText: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 5 },
  oficinaText: { fontSize: 14, color: '#666', marginBottom: 8 },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 15 },
  badgeText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: '#999' }
});