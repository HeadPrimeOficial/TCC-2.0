import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  ScrollView, 
  ImageBackground,
  Alert 
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { COLORS } from '../constants/agenda_colors'; // Mantendo sua paleta de cores

export default function PerfilScreen() {
  const router = useRouter();

  // --- DADOS FICTÍCIOS (MOCK) ---
  // Como não tem backend, deixamos fixo aqui para visualização
  const usuario = {
    nome: "Usuario",
    telefone: "(71) 99999-8888",
    foto: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80",
    carro: "Chevrolet Onix 1.0 Turbo",
    placa: "PKD-1234",
    ano: "2022"
  };

  const handleLogout = () => {
    Alert.alert(
        "Sair",
        "Deseja realmente sair do aplicativo?",
        [
            { text: "Cancelar", style: "cancel" },
            { 
                text: "Sair", 
                style: "destructive",
                // Redireciona para a tela de login (ajuste a rota se for diferente)
                onPress: () => router.replace('/') 
            }
        ]
    );
  };

  const OpcaoMenu = ({ icon, titulo, sub, color = "#333", onPress }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
        <View style={[styles.iconBox, { backgroundColor: color + '20' }]}> 
            <Ionicons name={icon} size={22} color={color} />
        </View>
        <View style={{ flex: 1 }}>
            <Text style={styles.menuTitle}>{titulo}</Text>
            {sub && <Text style={styles.menuSub}>{sub}</Text>}
        </View>
        <Ionicons name="chevron-forward" size={20} color="#ccc" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      
      {/* HEADER COM FOTO */}
      <View style={styles.headerContainer}>
        <ImageBackground 
          source={{ uri: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=800&q=80' }} 
          style={styles.headerImage}
          blurRadius={4}
        >
          <View style={styles.headerOverlay}>
             <View style={styles.avatarContainer}>
                <Image source={{ uri: usuario.foto }} style={styles.avatar} />
                <TouchableOpacity style={styles.editIcon}>
                    <Ionicons name="camera" size={16} color="#FFF" />
                </TouchableOpacity>
             </View>
             <Text style={styles.userName}>{usuario.nome}</Text>
             <Text style={styles.userEmail}>{usuario.email}</Text>
          </View>
        </ImageBackground>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        
        {/* CARD DO VEÍCULO */}
        <Text style={styles.sectionTitle}>MEU VEÍCULO</Text>
        <View style={styles.carCard}>
            <View style={styles.carIconBox}>
                <FontAwesome5 name="car" size={30} color="#FFF" />
            </View>
            <View>
                <Text style={styles.carName}>{usuario.carro}</Text>
                <Text style={styles.carDetail}>Placa: {usuario.placa} • Ano: {usuario.ano}</Text>
            </View>
            <TouchableOpacity style={{ marginLeft: 'auto' }}>
                <Ionicons name="create-outline" size={24} color="#666" />
            </TouchableOpacity>
        </View>

        {/* MENU DE OPÇÕES */}
        <Text style={styles.sectionTitle}>CONFIGURAÇÕES</Text>
        
        <View style={styles.menuContainer}>
            <OpcaoMenu 
                icon="person-outline" 
                titulo="Dados Pessoais" 
                sub="Nome, telefone, endereço" 
                color={COLORS.button.background}
                onPress={() => Alert.alert("Editar", "Tela de edição de perfil")}
            />
            <View style={styles.divider} />
            <OpcaoMenu 
                icon="shield-checkmark-outline" 
                titulo="Segurança" 
                sub="Senha e autenticação" 
                color={COLORS.button.background} 
            />
             <View style={styles.divider} />
            <OpcaoMenu 
                icon="notifications-outline" 
                titulo="Notificações" 
                sub="Alertas de revisão" 
                color={COLORS.button.background} 
            />
        </View>

        <Text style={styles.sectionTitle}>OUTROS</Text>
        <View style={styles.menuContainer}>
            <OpcaoMenu icon="help-circle-outline" titulo="Ajuda e Suporte" color="#F39C12" />
            <View style={styles.divider} />
            <OpcaoMenu icon="log-out-outline" titulo="Sair da Conta" color="#E74C3C" onPress={handleLogout} />
        </View>

      </ScrollView>

      {/* BARRA INFERIOR */}
      <View style={styles.bottomBar}>
        <TouchableOpacity onPress={() => router.replace('/home')}>
          <Ionicons name="home-outline" size={32} color="black" />
        </TouchableOpacity>
        
        {/* Ícone Ativo (Pessoa) */}
        <TouchableOpacity>
          <Ionicons name="person" size={32} color={COLORS.button.background} />
        </TouchableOpacity>
        
        <TouchableOpacity>
          <Ionicons name="settings-outline" size={32} color="black" />
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  
  // Header
  headerContainer: { height: 260 },
  headerImage: { flex: 1 },
  headerOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'center', 
    alignItems: 'center',
    paddingTop: 20
  },
  avatarContainer: { position: 'relative', marginBottom: 15 },
  avatar: { 
    width: 110, 
    height: 110, 
    borderRadius: 55, 
    borderWidth: 4, 
    borderColor: '#FFF' 
  },
  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.button.background,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF'
  },
  userName: { fontSize: 24, fontWeight: 'bold', color: '#FFF' },
  userEmail: { fontSize: 14, color: '#DDD', marginTop: 4 },

  content: { padding: 20, paddingBottom: 100 },

  sectionTitle: { 
    fontSize: 14, 
    fontWeight: 'bold', 
    color: '#999', 
    marginBottom: 10, 
    marginTop: 20,
    marginLeft: 5 
  },

  // Card Carro
  carCard: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  carIconBox: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.button.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15
  },
  carName: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  carDetail: { fontSize: 14, color: '#666' },

  // Menu
  menuContainer: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    paddingVertical: 5,
    elevation: 2
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15
  },
  menuTitle: { fontSize: 16, fontWeight: '600', color: '#333' },
  menuSub: { fontSize: 12, color: '#999' },
  divider: { height: 1, backgroundColor: '#F0F0F0', marginLeft: 70 },

  // Bottom Bar
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