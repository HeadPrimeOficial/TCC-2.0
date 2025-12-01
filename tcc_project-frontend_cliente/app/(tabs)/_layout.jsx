// app/(tabs)/_layout.jsx

import React from 'react';
import { Stack } from 'expo-router'; // <--- Mudamos de Tabs para Stack

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // Isso remove a barra de cima (Título), já que você tem seus headers personalizados
        contentStyle: { backgroundColor: '#8c8c91' } // Define uma cor de fundo padrão para evitar piscadas brancas
      }}
    >
      {/* Aqui você lista as telas que estão dentro da pasta (tabs) */}
      <Stack.Screen name="home" />
      <Stack.Screen name="ordens" />
      <Stack.Screen name="perfil" />
      
      {/* Se tiver outras telas nessa pasta, o Stack carrega automaticamente, 
          mas é bom listar se quiser opções específicas */}
    </Stack>
  );
}