import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  ImageBackground,
  Switch,
  Alert 
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/agenda_colors';

export default function ConfiguracoesScreen() {
  const router = useRouter();

  // Estados para os botões de ligar/desligar (Switches)
  const [notificacoes, setNotificacoes] = useState(true);
  const [localizacao, setLocalizacao] = useState(true);
  const [temaEscuro, setTemaEscuro] = useState(false);

  // Função para deletar conta (Apenas visual)
  const handleDeleteAccount = () => {
    Alert.alert(
        "Excluir Conta",
        "Tem certeza? Essa ação é irreversível e todos os seus orçamentos serão perdidos.",
        [
            { text: "Cancelar", style: "cancel" },
            { 
                text: "EXCLUIR", 
                style: "destructive", 
                onPress: () => {
                    Alert.alert("Conta Excluída", "Sua conta foi removida com sucesso.");
                    router.replace('/'); // Volta pro login
                }
            }
        ]
    );
  };

  // Componente Auxiliar para criar as linhas do menu
  const ConfigItem = ({ icon, titulo, tipo = "link", valor, onToggle, onPress, corIcone = "#555" }) => (
    <TouchableOpacity 
        style={styles.itemContainer} 
        onPress={tipo === "link" ? onPress : onToggle} // Se for switch, o toque muda o switch
        activeOpacity={tipo === "switch" ? 1 : 0.7} // Se for switch, não pisca o fundo
    >
        <View style={[styles.iconBox, { backgroundColor: corIcone + '15' }]}>
            <Ionicons name={icon} size={22} color={corIcone} />
        </View>
        
        <Text style={styles.itemText}>{titulo}</Text>

        {tipo === "switch" ? (
            <Switch
                trackColor={{ false: "#767577", true: COLORS.button.background }}
                thumbColor={valor ? "#f4f3f4" : "#f4f3f4"}
                ios_backgroundColor="#3e3e3e"
                onValueChange={onToggle}
                value={valor}
            />
        ) : (
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
        )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      
      {/* HEADER */}
      <View style={styles.headerContainer}>
        <ImageBackground 
          source={{ uri: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=800&q=80' }} 
          style={styles.headerImage}
          blurRadius={3}
        >
          <View style={styles.headerOverlay}>
            <Text style={styles.headerTitle}>AJUSTES</Text>
            <View style={styles.headerLine} />
          </View>
        </ImageBackground>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* SEÇÃO CONTA */}
        <Text style={styles.sectionTitle}>CONTA</Text>
        <View style={styles.sectionCard}>
            <ConfigItem 
                icon="key-outline" 
                titulo="Alterar Senha" 
                onPress={() => Alert.alert("Senha", "Tela de alterar senha")}
            />
            <View style={styles.divider} />
            <ConfigItem 
                icon="card-outline" 
                titulo="Formas de Pagamento" 
                onPress={() => Alert.alert("Pagamento", "Cartões salvos")}
            />
        </View>

        {/* SEÇÃO PREFERÊNCIAS */}
        <Text style={styles.sectionTitle}>PREFERÊNCIAS</Text>
        <View style={styles.sectionCard}>
            <ConfigItem 
                icon="notifications-outline" 
                titulo="Notificações Push" 
                tipo="switch"
                valor={notificacoes}
                onToggle={() => setNotificacoes(!notificacoes)}
                corIcone={COLORS.button.background}
            />
            <View style={styles.divider} />
            <ConfigItem 
                icon="location-outline" 
                titulo="Permitir Localização" 
                tipo="switch"
                valor={localizacao}
                onToggle={() => setLocalizacao(!localizacao)}
                corIcone="#2980B9"
            />
             <View style={styles.divider} />
            <ConfigItem 
                icon="moon-outline" 
                titulo="Modo Escuro" 
                tipo="switch"
                valor={temaEscuro}
                onToggle={() => setTemaEscuro(!temaEscuro)}
                corIcone="#8E44AD"
            />
        </View>

        {/* SEÇÃO SUPORTE */}
        <Text style={styles.sectionTitle}>SUPORTE & LEGAL</Text>
        <View style={styles.sectionCard}>
            <ConfigItem icon="document-text-outline" titulo="Termos de Uso" onPress={() => Alert.alert("Info", "Termos de uso...")} />
            <View style={styles.divider} />
            <ConfigItem icon="shield-checkmark-outline" titulo="Política de Privacidade" onPress={() => Alert.alert("Info", "Privacidade...")} />
            <View style={styles.divider} />
            <ConfigItem icon="information-circle-outline" titulo="Sobre o App" onPress={() => Alert.alert("Sobre", "Versão 1.0.0 - TCC Oficina")} />
        </View>

        {/* ZONA DE PERIGO */}
        <TouchableOpacity style={styles.btnDelete} onPress={handleDeleteAccount}>
            <Ionicons name="trash-outline" size={20} color="#FFF" style={{marginRight: 10}} />
            <Text style={styles.btnDeleteText}>EXCLUIR MINHA CONTA</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* BARRA INFERIOR */}
      <View style={styles.bottomBar}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={32} color="black" />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => router.push('/perfil')}>
          <Ionicons name="person" size={32} color="black" />
        </TouchableOpacity>
        
        {/* Ícone Ativo (Engrenagem) */}
        <TouchableOpacity>
          <Ionicons name="settings-sharp" size={32} color={COLORS.button.background} />
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F4F4' },
  
  headerContainer: { height: 120, width: '100%' },
  headerImage: { flex: 1 },
  headerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#FFF', letterSpacing: 2 },
  headerLine: { height: 3, backgroundColor: COLORS.button.background, width: 60, marginTop: 5 },

  content: { padding: 20, paddingBottom: 100 },

  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#888', marginBottom: 10, marginTop: 15, marginLeft: 5 },
  sectionCard: { backgroundColor: '#FFF', borderRadius: 12, paddingVertical: 5, elevation: 2 },
  
  itemContainer: { flexDirection: 'row', alignItems: 'center', padding: 15, justifyContent: 'space-between' },
  iconBox: { width: 36, height: 36, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  itemText: { fontSize: 16, color: '#333', flex: 1, fontWeight: '500' },
  
  divider: { height: 1, backgroundColor: '#F0F0F0', marginLeft: 65 },

  btnDelete: {
    backgroundColor: '#C0392B',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginTop: 30,
    elevation: 3
  },
  btnDeleteText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },

  bottomBar: {
    position: 'absolute', bottom: 0, width: '100%',
    height: 70,
    backgroundColor: COLORS.navBar,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 10
  },
});