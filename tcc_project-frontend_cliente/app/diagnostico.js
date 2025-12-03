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

// IMPORTANTE: Importe sua API configurada (aquela que tem o IP automático)
// Se sua pasta for 'service' (no singular), ajuste aqui embaixo:
import api from '../services/api'; 

export default function DiagnosticoScreen() {
  const router = useRouter();
  
  const [defeito, setDefeito] = useState('');
  const [imagemSelecionada, setImagemSelecionada] = useState(null);
  const [analisando, setAnalisando] = useState(false);
  const [resultadoIA, setResultadoIA] = useState(null); // Para guardar a resposta da IA

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert("Permissão necessária", "Precisamos de acesso à galeria.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, // Deixa cortar a foto
      aspect: [4, 3],
      quality: 0.5, // Reduz qualidade para não travar o envio (IA lê bem mesmo assim)
    });

    if (!result.canceled) {
      setImagemSelecionada(result.assets[0].uri);
      setResultadoIA(null); // Limpa resultado anterior se trocar a foto
    }
  };

  // --- AQUI ESTÁ A LÓGICA REAL COM O JAVA + OLLAMA ---
  const handleAnalisar = async () => {
    if (!imagemSelecionada && !defeito) {
      Alert.alert("Atenção", "Por favor, descreva o defeito ou envie uma foto.");
      return;
    }

    setAnalisando(true);
    setResultadoIA(null);

    try {
      // 1. Criar o FormData (Pacote para enviar arquivo)
      const formData = new FormData();
      
      // Adiciona a descrição
      formData.append('descricao', defeito || "Analise esta imagem em busca de defeitos automotivos.");

      // Adiciona a imagem (Se tiver)
      if (imagemSelecionada) {
        // Truque para pegar o nome e tipo do arquivo no React Native
        const filename = imagemSelecionada.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image/jpeg`;

        formData.append('imagem', { 
          uri: imagemSelecionada, 
          name: filename, 
          type: type 
        });
      }

      // 2. Enviar para o Java
      // Nota: 'Content-Type': 'multipart/form-data' é automático no Axios quando usa FormData
      const response = await api.post('/api/diagnostico/analisar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000 // Aumenta tempo limite para 60s (IA de imagem demora um pouco)
      });

      // 3. Sucesso!
      setAnalisando(false);
      setResultadoIA(response.data.diagnostico); // Guarda o texto da IA
      
      Alert.alert("Diagnóstico Concluído", "Veja a análise abaixo.");

    } catch (error) {
      setAnalisando(false);
      console.error("Erro na IA:", error);
      Alert.alert("Erro", "Falha ao conectar com a Inteligência Artificial. Verifique se o servidor está rodando.");
    }
  };

  return (
    <View style={styles.container}>
      
      <View style={styles.headerContainer}>
        <ImageBackground 
          source={{ uri: 'https://blog.tecnodux.com.br/wp-content/uploads/2022/09/Saiba-importancia-dos-Scanners-para-sua-oficina.jpg' }} 
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
                placeholder="Descreva o barulho ou problema..."
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
                    <Text style={{color:'#666', marginTop: 10}}>Toque para enviar foto</Text>
                </View>
            )}
        </TouchableOpacity>

        {/* BOTÕES DE AÇÃO */}
        <View style={styles.rowButtons}>
            <TouchableOpacity style={styles.btnMediumOrange} onPress={() => setImagemSelecionada(null)}>
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
                        <Text style={styles.btnTextMedium}>PENSANDO...</Text>
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
        <TouchableOpacity onPress={() => router.replace('/home')}>
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

  // Resultado
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