import React from 'react';
import { Slot } from 'expo-router';
import { SocketProvider } from '../contexts/SocketContext'; 
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NotificationProvider } from '../contexts/NotificationContext';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <NotificationProvider>
        <SocketProvider>
          <StatusBar style="light" />
          <Slot />
        </SocketProvider>
      </NotificationProvider>
    </SafeAreaProvider>
  );
}