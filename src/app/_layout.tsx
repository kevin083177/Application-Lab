import React from 'react';
import { Stack } from 'expo-router';
import { SocketProvider } from '../contexts/SocketContext'; 

export default function RootLayout() {
  return (
    <SocketProvider>
      <Stack>
        <Stack.Screen name="index" options={{headerShown: false}}/>
        <Stack.Screen name="lobby" options={{headerShown: false}}/>
        <Stack.Screen name="game" options={{headerShown: false}}/>
      </Stack>
    </SocketProvider>
  );
}