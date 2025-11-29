import { OrcamentoService } from '../services/OrcamentoService'; // Verifique se a pasta é 'service' ou 'services'
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ImageBackground, 
  ScrollView, 
  Image,
  Alert,
  ActivityIndicator,
  Keyboard
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/agenda_colors';
import { ServicoService } from '../services/ServicoService';

export default function ServicosScreen() {
  const router = useRouter();
  
  const [termo, setTermo] = useState('');
  const [destaques, setDestaques] = useState([]); 
  const [resultados, setResultados] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [modoBusca, setModoBusca] = useState(false); 

  // --- IDs FIXOS PARA TESTE (Depois virão do Login) ---
  const CLIENTE_ID = 1;
  const OFICINA_ID = 1;

  const CATEGORIAS_FIXAS = [
    { id: 1, nome: 'Motor', img: 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=200&q=80' },
    { id: 2, nome: 'Revisão', img: 'https://images.unsplash.com/photo-1507767845848-40667e436f52?auto=format&fit=crop&w=200&q=80' },
    { id: 3, nome: 'Pneu', img: 'https://images.unsplash.com/photo-1578844251758-2f71da645217?auto=format&fit=crop&w=200&q=80' },
    { id: 4, nome: 'Óleo', img: 'https://images.unsplash.com/photo-1626073749774-706599b703dc?auto=format&fit=crop&w=200&q=80' },
    { id: 5, nome: 'Freio', img: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=200&q=80' },
    { id: 6, nome: 'Pintura', img: 'https://images.unsplash.com/photo-1562916172-23c8e40428f7?auto=format&fit=crop&w=200&q=80' },
  ];

  const CATALOGO_EXEMPLO = [
    { id: 10, nome: 'Higienização de Ar', preco: 120.00 },
    { id: 11, nome: 'Polimento Cristalizado', preco: 350.00 },
    { id: 12, nome: 'Troca de Correia', preco: 180.00 },
    { id: 13, nome: 'Alinhamento 3D', preco: 80.00 },
  ];

  useEffect(() => {
    carregarDestaques();
  }, []);

  const carregarDestaques = async () => {
    setLoading(true);
    const dados = await ServicoService.buscarDestaques();
    setDestaques(dados);
    setLoading(false);
  };

  const handleBuscar = async () => {
    if (!termo.trim()) {
      setModoBusca(false);
      Keyboard.dismiss();
      return;
    }
    setLoading(true);
    setModoBusca(true);
    const dados = await ServicoService.buscarServicos(termo);
    setResultados(dados);
    setLoading(false);
    Keyboard.dismiss();
  };

  const handleCategoriaClick = (categoriaNome) => {
    setTermo(categoriaNome);
    handleBuscar();
  };

  // --- [MUDANÇA 1] FUNÇÃO AUXILIAR PARA UNIFICAR PREÇOS ---
  const getValorItem = (item) => {
    if (item.preco) return item.preco;          // Prioridade: Front
    if (item.precoBase) return item.precoBase;  // Prioridade: Back
    return 0.00;
  };

  // --- [MUDANÇA 2] ATUALIZADO PARA USAR O PREÇO CORRETO ---
  const handleAdicionarItem = async (item) => {
    
    const valorReal = getValorItem(item); // Pega 120, 350, 80...

    Alert.alert(
      "Adicionar ao Orçamento",
      `Deseja incluir "${item.nome}" por R$ ${valorReal.toFixed(2)}?`,
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Sim", 
          onPress: async () => {
            setLoading(true);
            const resultado = await OrcamentoService.adicionarItem(
               CLIENTE_ID, 
               OFICINA_ID, 
               item.nome, 
               valorReal // Manda o valor exato
            );
            setLoading(false);

            if (resultado) {
               Alert.alert(
                 "Sucesso!", 
                 "Item adicionado. Veja na tela de Orçamentos.",
                 [{ text: "OK" }, { text: "Ir para Orçamento", onPress: () => router.push('/orcamento') }]
               );
            } else {
               Alert.alert("Erro", "Não foi possível adicionar o item.");
            }
          } 
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      
      <View style={styles.headerContainer}>
        <ImageBackground 
          source={{ uri: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80' }} 
          style={styles.headerImage}
          blurRadius={3}
        >
          <View style={styles.headerOverlay}>
            <Text style={styles.headerTitle}>SERVIÇOS</Text>
            <View style={styles.headerLine} />
          </View>
        </ImageBackground>
      </View>

      <View style={styles.content}>
        
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={24} color="#666" style={{ marginRight: 10 }} />
          <TextInput 
            style={styles.input}
            placeholder="Digite o Serviço"
            placeholderTextColor="#888"
            value={termo}
            onChangeText={setTermo}
            onSubmitEditing={handleBuscar}
          />
          {modoBusca && (
             <TouchableOpacity onPress={() => { setTermo(''); setModoBusca(false); }}>
                 <Ionicons name="close-circle" size={20} color="#999" />
             </TouchableOpacity>
          )}
        </View>

        {loading ? (
            <ActivityIndicator size="large" color={COLORS.button.background} style={{marginTop: 50}} />
        ) : (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 150 }}>
                
                {!modoBusca ? (
                    <>
                        <Text style={styles.sectionTitle}>Principais Serviços</Text>
                        
                        <ScrollView 
                          horizontal 
                          showsHorizontalScrollIndicator={false} 
                          style={styles.horizontalScroll}
                          contentContainerStyle={{ paddingRight: 20 }}
                        >
                            {CATEGORIAS_FIXAS.map((cat) => (
                              <TouchableOpacity key={cat.id} style={styles.catItem} onPress={() => handleCategoriaClick(cat.nome)}>
                                  <Image source={{ uri: cat.img }} style={styles.catImage} />
                                  <Text style={styles.catText}>{cat.nome}</Text>
                              </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <Text style={styles.sectionTitle}>Promoções</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                            {destaques.length === 0 ? (
                                <Text style={{color:'#CCC', marginLeft: 10}}>Nenhuma promoção.</Text>
                            ) : (
                                destaques.map((item) => (
                                    <TouchableOpacity key={item.id} style={styles.promoCard} onPress={() => handleAdicionarItem(item)}>
                                        <Image source={{ uri: 'https://via.placeholder.com/300x150' }} style={styles.promoImage} />
                                        <View style={styles.promoOverlay}>
                                            <Text style={styles.promoText}>{item.nome}</Text>
                                        </View>
                                        <View style={styles.iconAddPromo}>
                                            <Ionicons name="add-circle" size={24} color="#FFF" />
                                        </View>
                                    </TouchableOpacity>
                                ))
                            )}
                        </ScrollView>

                        <Text style={[styles.sectionTitle, { marginTop: 25 }]}>Catálogo Completo</Text>
                        <View style={styles.catalogoContainer}>
                            {[...destaques, ...CATALOGO_EXEMPLO].map((item, index) => (
                                <TouchableOpacity key={index} style={styles.catalogoItem} onPress={() => handleAdicionarItem(item)}>
                                    <View style={{flexDirection:'row', alignItems:'center'}}>
                                        <Ionicons name="add-circle" size={24} color={COLORS.button.background} style={{ marginRight: 10 }} />
                                        <Text style={styles.catalogoNome}>{item.nome}</Text>
                                    </View>
                                    
                                    {/* [MUDANÇA 3] Exibe o preço correto na lista */}
                                    <Text style={styles.catalogoPreco}>
                                        R$ {getValorItem(item).toFixed(2)}
                                    </Text>

                                </TouchableOpacity>
                            ))}
                        </View>

                    </>
                ) : (
                    // MODO BUSCA
                    <View style={{ marginTop: 10 }}>
                        <Text style={styles.sectionTitle}>Resultados para "{termo}":</Text>
                        {resultados.length === 0 ? (
                            <Text style={styles.emptyText}>Nenhum serviço encontrado.</Text>
                        ) : (
                            resultados.map((servico) => (
                                <TouchableOpacity key={servico.id} style={styles.resultItem} onPress={() => handleAdicionarItem(servico)}>
                                    <Ionicons name="add-circle" size={32} color={COLORS.button.background} />
                                    <View style={{ marginLeft: 15 }}>
                                        <Text style={styles.resultTitle}>{servico.nome}</Text>
                                        <Text style={styles.resultDesc}>{servico.descricao || "Serviço especializado"}</Text>
                                        
                                        {/* [MUDANÇA 4] Exibe o preço correto na busca */}
                                        <Text style={styles.resultPrice}>
                                            R$ {getValorItem(servico).toFixed(2)}
                                        </Text>

                                    </View>
                                </TouchableOpacity>
                            ))
                        )}
                    </View>
                )}
            </ScrollView>
        )}

        {/* BOTÕES FLUTUANTES */}
        <View style={styles.actionButtonsContainer}>
            <TouchableOpacity style={styles.btnAction} onPress={() => Alert.alert("Dica", "Toque no ícone (+) ao lado do serviço para adicionar ao orçamento.")}>
                <Text style={styles.btnActionText}>COMO ADICIONAR?</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.btnAction} onPress={() => router.push('/agendar')}>
                <Text style={styles.btnActionText}>AGENDAR DATA</Text>
            </TouchableOpacity>
        </View>

      </View>

      <View style={styles.bottomBar}>
        <TouchableOpacity onPress={() => router.replace('/home')}>
          <Ionicons name="arrow-back" size={32} color="black" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="person" size={32} color="black" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="settings-sharp" size={32} color="black" />
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  headerContainer: { height: 130, width: '100%' },
  headerImage: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerOverlay: { backgroundColor: 'rgba(0,0,0,0.4)', width: '100%', height:'100%', alignItems: 'center', justifyContent:'center' },
  headerTitle: { fontSize: 32, fontWeight: 'bold', color: '#FFF', letterSpacing: 2, textShadowColor: 'rgba(0,0,0,0.8)', textShadowRadius: 5 },
  headerLine: { height: 2, backgroundColor: '#FFF', width: '60%', marginTop: 5 },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  searchContainer: {
    flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.4)', height: 50, borderRadius: 8,
    alignItems: 'center', paddingHorizontal: 15, marginBottom: 20, borderWidth: 1, borderColor: '#999'
  },
  input: { flex: 1, fontSize: 18, color: '#FFF' },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFF', marginBottom: 15, marginTop: 10, textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 3 },
  horizontalScroll: { marginBottom: 10 },
  catItem: { alignItems: 'center', marginRight: 20 },
  catImage: { width: 75, height: 75, borderRadius: 37.5, borderWidth: 2, borderColor: '#FFF', marginBottom: 5 },
  catText: { color: '#FFF', fontSize: 14, fontWeight: 'bold' },
  promoCard: { width: 220, height: 130, marginRight: 15, borderRadius: 10, overflow: 'hidden', backgroundColor: '#333', position: 'relative' },
  promoImage: { width: '100%', height: '100%' },
  promoOverlay: { position: 'absolute', bottom: 0, width: '100%', backgroundColor: 'rgba(0,0,0,0.6)', padding: 5 },
  promoText: { color: '#FFF', textAlign: 'center', fontWeight: 'bold' },
  iconAddPromo: { position: 'absolute', top: 5, right: 5, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 12 },
  catalogoContainer: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 10, padding: 10 },
  catalogoItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.2)', alignItems: 'center' },
  catalogoNome: { color: '#FFF', fontSize: 16 },
  catalogoPreco: { color: '#d68910', fontWeight: 'bold', fontSize: 16 },
  resultItem: { flexDirection: 'row', backgroundColor: '#FFF', padding: 15, borderRadius: 8, marginBottom: 10, alignItems: 'center', elevation: 2 },
  resultTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  resultDesc: { fontSize: 14, color: '#666' },
  resultPrice: { fontSize: 16, fontWeight: 'bold', color: '#d68910', marginTop: 4 },
  emptyText: { color: '#FFF', textAlign: 'center', fontSize: 18, marginTop: 20 },
  actionButtonsContainer: { position: 'absolute', bottom: 80, left: 20, right: 20, flexDirection: 'row', justifyContent: 'space-between' },
  btnAction: { backgroundColor: COLORS.button.background, width: '48%', paddingVertical: 12, borderRadius: 8, alignItems: 'center', borderWidth: 2, borderColor: '#b0700b', elevation: 3 },
  btnActionText: { color: '#FFF', fontWeight: 'bold', fontSize: 14, textShadowColor: 'rgba(0,0,0,0.3)', textShadowRadius: 2 },
  bottomBar: { position: 'absolute', bottom: 0, width: '100%', height: 70, backgroundColor: COLORS.navBar, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', borderTopLeftRadius: 20, borderTopRightRadius: 20 },
});