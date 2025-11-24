import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type NotificationType = 'success' | 'warning' | 'error';

interface NotificationContextType {
  showSuccess: (message: string) => void;
  showWarning: (message: string) => void;
  showError: (message: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  const [message, setMessage] = useState('');
  const [type, setType] = useState<NotificationType>('success');
  
  const translateY = useRef(new Animated.Value(-200)).current;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const showNotification = useCallback((msg: string, notifType: NotificationType) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    setMessage(msg);
    setType(notifType);

    Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: true,
      friction: 8,
      tension: 40
    }).start();

    timerRef.current = setTimeout(() => {
      hideNotification();
    }, 3000);
  }, []);

  const hideNotification = useCallback(() => {
    Animated.timing(translateY, {
      toValue: -200,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const showSuccess = useCallback((msg: string) => showNotification(msg, 'success'), [showNotification]);
  const showWarning = useCallback((msg: string) => showNotification(msg, 'warning'), [showNotification]);
  const showError = useCallback((msg: string) => showNotification(msg, 'error'), [showNotification]);

  const getIconName = () => {
    switch (type) {
      case 'success': return 'checkmark-circle';
      case 'warning': return 'alert-circle';
      case 'error': return 'close-circle';
      default: return 'checkmark-circle';
    }
  };
  
  const getIconColor = () => {
     switch (type) {
      case 'success': return '#4CAF50';
      case 'warning': return '#FFC107';
      case 'error': return '#FF5252';
      default: return '#fff';
    }
  }

  return (
    <NotificationContext.Provider value={{ showSuccess, showWarning, showError }}>
      {children}
      
      <Animated.View 
        style={[
          styles.container, 
          { 
            transform: [{ translateY }],
            top: insets.top + 10, 
          }
        ]}
      >
        <View style={styles.content}>
          <Ionicons 
            name={getIconName()} 
            size={24} 
            color={getIconColor()} 
            style={styles.icon}
          />
          <Text style={styles.messageText} numberOfLines={2}>
            {message}
          </Text>
        </View>
      </Animated.View>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignSelf: 'center',
    width: '90%',
    maxWidth: 250,
    borderRadius: 25,
    backgroundColor: '#333333',
    paddingVertical: 12,
    paddingHorizontal: 15, 
    zIndex: 9999,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', 
  },
  icon: {
    marginRight: 8,
  },
  messageText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
    flexShrink: 1,
  }
});