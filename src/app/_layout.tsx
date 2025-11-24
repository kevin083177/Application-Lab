import React from 'react';
import { Stack } from 'expo-router';
import { SocketProvider } from '../contexts/SocketContext'; 

export default function RootLayout() {
  return (
    <SocketProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index"/>
        <Stack.Screen name="lobby"/>
        <Stack.Screen name="game"/>
        <Stack.Screen name="result" />
      </Stack>
    </SocketProvider>
  );
}