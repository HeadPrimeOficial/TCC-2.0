import React, { useState } from 'react';
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
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker'; 
import { COLORS } from '../constants/agenda_colors';

// Importe sua API configurada (para pegar a URL base)
import api from '../services/api'; 

export default function DiagnosticoScreen() {
  const router = useRouter();
  
  const [defeito, setDefeito] = useState('');
  const [imagemSelecionada, setImagemSelecionada] = useState(null);
  const [analisando, setAnalisando] = useState(false);
  const [resultadoIA, setResultadoIA] = useState(null);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert("Permissão necessária", "Precisamos de acesso à galeria.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      // [CORREÇÃO CRÍTICA] Voltamos para MediaTypeOptions. 
      // O novo 'MediaType' estava vindo undefined e quebrando o app.
      // O aviso amarelo no terminal é normal, mas o app não vai mais fechar.
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.3, // BAIXEI PARA 0.3 (Mais leve para rede 4G/Wifi escolar)
    });

    if (!result.canceled) {
      setImagemSelecionada(result.assets[0].uri);
      setResultadoIA(null);
    }
  };

  const handleAnalisar = async () => {
    if (!imagemSelecionada && !defeito.trim()) {
      Alert.alert("Atenção", "Para analisar, descreva o defeito OU envie uma foto.");
      return;
    }

    setAnalisando(true);
    setResultadoIA(null);

    try {
      const formData = new FormData();
      
      // Texto
      let descricaoFinal = defeito;
      if (!descricaoFinal && imagemSelecionada) {
          descricaoFinal = "Analise esta imagem em busca de defeitos visuais.";
      }
      formData.append('descricao', descricaoFinal);

      // Imagem
      if (imagemSelecionada) {
        const filename = imagemSelecionada.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image/jpeg`;

        formData.append('imagem', { 
          uri: imagemSelecionada, 
          name: filename, 
          type: type 
        });
      }

      // --- CORREÇÃO DA URL E DO PROTOCOLO ---
      const baseUrl = api.defaults.baseURL || 'http://localhost:8080'; 
      
      // Garante que não tenha barra no final
      let cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;

      // [CORREÇÃO 2] Se for Ngrok, força HTTPS (Android bloqueia HTTP)
      if (cleanBaseUrl.includes('ngrok') && cleanBaseUrl.startsWith('http:')) {
          cleanBaseUrl = cleanBaseUrl.replace('http:', 'https:');
          console.log(">>> Forçando HTTPS para Ngrok:", cleanBaseUrl);
      }

      const finalUrl = cleanBaseUrl.includes('/api') 
          ? `${cleanBaseUrl}/diagnostico/analisar` 
          : `${cleanBaseUrl}/api/diagnostico/analisar`;

      console.log("Enviando para:", finalUrl);

      const response = await fetch(finalUrl, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
          // [CORREÇÃO 3] Esse header evita a tela de aviso do Ngrok que quebra o JSON
          'ngrok-skip-browser-warning': 'true', 
        },
      });

      // Verifica se a resposta foi ok antes de tentar ler JSON
      if (!response.ok) {
          const text = await response.text();
          throw new Error(`Erro do servidor: ${response.status} - ${text.substring(0, 100)}`);
      }

      const data = await response.json();

      setAnalisando(false);
      
      if (data && data.diagnostico) {
          setResultadoIA(data.diagnostico);
          Alert.alert("Sucesso", "Diagnóstico realizado!");
      } else {
          Alert.alert("Erro na IA", "O servidor não retornou um diagnóstico.");
      }

    } catch (error) {
      setAnalisando(false);
      console.error("Erro na Requisição:", error);
      Alert.alert("Erro de Conexão", "Falha ao enviar. Se estiver usando Ngrok, verifique se ele não expirou.");
    }
  };

  return (
    <View style={styles.container}>
      
      <View style={styles.headerContainer}>
        <ImageBackground 
          source={{ uri: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80' }} 
          style={styles.headerImage}
          blurRadius={2}
        >
          <View style={styles.headerOverlay}>
            <Text style={styles.headerTitle}>DIAGNÓSTICO IA</Text>
            <View style={styles.headerLine} />
          </View>
        </ImageBackground>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        <View style={styles.inputBox}>
            <Ionicons name="search" size={24} color="#333" style={{marginRight: 10}} />
            <TextInput 
                style={styles.inputText}
                placeholder="Descreva o problema..."
                placeholderTextColor="#666"
                value={defeito}
                onChangeText={setDefeito}
            />
        </View>

        <TouchableOpacity style={styles.uploadArea} onPress={pickImage}>
            {imagemSelecionada ? (
                <Image source={{ uri: imagemSelecionada }} style={styles.imagePreview} />
            ) : (
                <View style={styles.uploadPlaceholder}>
                    <Ionicons name="camera-outline" size={60} color="#666" />
                    <Text style={{color:'#666', marginTop: 10}}>Toque para enviar foto (Opcional)</Text>
                </View>
            )}
        </TouchableOpacity>

        {/* BOTÕES DE AÇÃO */}
        <View style={styles.rowButtons}>
            <TouchableOpacity style={styles.btnMediumOrange} onPress={() => {setImagemSelecionada(null); setDefeito(''); setResultadoIA(null);}}>
                <Text style={styles.btnTextMedium}>LIMPAR</Text>
            </TouchableOpacity>

            <TouchableOpacity 
                style={[styles.btnMediumOrange, {backgroundColor: analisando ? '#999' : '#d68910'}]} 
                onPress={handleAnalisar} 
                disabled={analisando}
            >
                {analisando ? (
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                        <ActivityIndicator color="#FFF" style={{marginRight: 5}}/>
                        <Text style={styles.btnTextMedium}>...</Text>
                    </View>
                ) : (
                    <Text style={styles.btnTextMedium}>ANALISAR</Text>
                )}
            </TouchableOpacity>
        </View>

        {/* --- RESULTADO DA IA --- */}
        {resultadoIA && (
            <View style={styles.resultContainer}>
                <View style={styles.resultHeader}>
                    <MaterialCommunityIcons name="robot" size={24} color={COLORS.button.background} />
                    <Text style={styles.resultTitle}>Análise da IA</Text>
                </View>
                
                <Text style={styles.resultText}>
                    {resultadoIA}
                </Text>

                <TouchableOpacity style={styles.btnSchedule} onPress={() => router.push('/agendar')}>
                    <Text style={styles.btnScheduleText}>AGENDAR REPARO AGORA</Text>
                </TouchableOpacity>
            </View>
        )}

      </ScrollView>

      {/* BARRA INFERIOR */}
      <View style={styles.bottomBar}>
        <TouchableOpacity onPress={() => router.replace('/homeo')}>
          <Ionicons name="home-outline" size={32} color="black" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/perfil')}>
          <Ionicons name="person" size={32} color="black" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/configuracoes')}>
          <Ionicons name="settings-sharp" size={32} color="black" />
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#8c8c91' },
  headerContainer: { height: 140, width: '100%' },
  headerImage: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerOverlay: { backgroundColor: 'rgba(0,0,0,0.5)', width: '100%', height:'100%', alignItems: 'center', justifyContent:'center' },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#FFF', letterSpacing: 2 },
  headerLine: { height: 2, backgroundColor: '#FFF', width: '60%', marginTop: 5 },

  content: { padding: 20, paddingBottom: 100 },

  inputBox: {
    flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: 10,
    paddingHorizontal: 15, height: 50, alignItems: 'center', marginBottom: 20
  },
  inputText: { flex: 1, fontSize: 16, color: '#000' },

  uploadArea: {
    height: 200, backgroundColor: 'rgba(255,255,255,0.4)', borderRadius: 15,
    justifyContent: 'center', alignItems: 'center', marginBottom: 20,
    borderWidth: 2, borderColor: '#FFF', borderStyle: 'dashed'
  },
  uploadPlaceholder: { alignItems: 'center' },
  imagePreview: { width: '100%', height: '100%', borderRadius: 13 },

  rowButtons: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  btnMediumOrange: {
    backgroundColor: '#d68910', width: '48%', paddingVertical: 12, borderRadius: 8,
    alignItems: 'center', elevation: 3, borderWidth: 1, borderColor: '#b0700b'
  },
  btnTextMedium: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },

  resultContainer: {
    backgroundColor: '#FFF', borderRadius: 10, padding: 15, elevation: 4, marginTop: 10
  },
  resultHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 5 },
  resultTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 10, color: '#333' },
  resultText: { fontSize: 16, color: '#444', lineHeight: 24, textAlign: 'justify' },
  
  btnSchedule: {
    backgroundColor: '#27AE60', padding: 15, borderRadius: 8, marginTop: 15, alignItems: 'center'
  },
  btnScheduleText: { color: '#FFF', fontWeight: 'bold' },

  bottomBar: {
    position: 'absolute', bottom: 0, width: '100%', height: 70, backgroundColor: COLORS.navBar,
    flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center',
    borderTopLeftRadius: 20, borderTopRightRadius: 20, elevation: 10
  },
});