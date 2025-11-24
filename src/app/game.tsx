import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useSocket } from '../contexts/SocketContext';
import { useRouter } from 'expo-router';
import { SocketResponse } from '../interfaces/socket';
import { VoteResult } from '../interfaces/scenario';

export default function Game() {
  const { socket, currentScenario, submitVote } = useSocket();
  const router = useRouter();
  
  const [hasVoted, setHasVoted] = useState(false);
  
  const [roundResult, setRoundResult] = useState<VoteResult | null>(null);

  useEffect(() => {
    if (currentScenario) {
      setHasVoted(false);
      setRoundResult(null);
    }
  }, [currentScenario]);

  useEffect(() => {
    if (roundResult && !roundResult.nextScenarioId) {
      const timer = setTimeout(() => {
        router.replace('/result');
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [roundResult, router]);

  useEffect(() => {
    if (!socket) return;

    const handleVoteResult = (response: SocketResponse<VoteResult>) => {
        if (response.success && response.body) {
            setRoundResult(response.body);
        }
    };
    
    const handleRoomClosed = () => {
        Alert.alert("遊戲結束", "房主已關閉房間", [
            { text: "確定", onPress: () => router.replace('/') }
        ]);
    };

    socket.on('vote:result', handleVoteResult);
    socket.on('room:closed', handleRoomClosed);

    return () => {
        socket.off('vote:result', handleVoteResult);
        socket.off('room:closed', handleRoomClosed);
    };
  }, [socket, router]);

  const handleVote = (optionId: string) => {
      if (!socket || hasVoted || roundResult) return;
      submitVote(optionId);
      setHasVoted(true);
  };

  if (!currentScenario) {
      return (
          <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color="#fff" style={{ marginBottom: 20 }} />
              <Text style={styles.text}>載入場景中...</Text>
          </View>
      );
  }

//   if (roundResult) {
//       const isGameOver = !roundResult.nextScenarioId; 

//       return (
//           <View style={[styles.centerContainer, { paddingHorizontal: 24 }]}>
//               <Text style={styles.consequenceTitle}>選擇結果</Text>
              
//               <View style={styles.consequenceBox}>
//                   <Text style={styles.consequenceText}>
//                       {roundResult.consequence}
//                   </Text>
//               </View>
//           </View>
//       );
//   }

  if (hasVoted) {
      return (
          <View style={styles.centerContainer}>
              <Text style={styles.votedTitle}>已送出</Text>
              <Text style={styles.votedSubtitle}>等待其他玩家...</Text>
              <ActivityIndicator size="small" color="#666" style={{ marginTop: 20 }} />
          </View>
      );
  }

  const optionA = currentScenario.options[0];
  const optionB = currentScenario.options[1];

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={[styles.optionButton, styles.optionA]} 
        activeOpacity={0.9}
        onPress={() => handleVote(optionA.optionId)}
      >
        <Text style={styles.bgLabel}>A</Text>
        <View style={styles.textWrapper}>
            <Text style={styles.optionText}>{optionA.text}</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.optionButton, styles.optionB]} 
        activeOpacity={0.9}
        onPress={() => handleVote(optionB.optionId)}
      >
        <Text style={styles.bgLabel}>B</Text>
        <View style={styles.textWrapper}>
            <Text style={styles.optionText}>{optionB.text}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  // ... 樣式保持不變
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  centerContainer: {
      flex: 1,
      backgroundColor: '#1a1a1a',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
  },
  text: {
      color: '#fff',
      fontSize: 18,
  },
  votedTitle: {
      color: '#00cc66',
      fontSize: 36,
      fontWeight: 'bold',
      marginBottom: 16,
      letterSpacing: 2,
  },
  votedSubtitle: {
      color: '#888',
      fontSize: 18,
  },
  consequenceTitle: {
      color: '#FFD700',
      fontSize: 28,
      fontWeight: 'bold',
      marginBottom: 20,
      letterSpacing: 1,
  },
  consequenceBox: {
      backgroundColor: 'rgba(255,255,255,0.1)',
      padding: 24,
      borderRadius: 16,
      borderLeftWidth: 4,
      borderLeftColor: '#FFD700',
      width: '100%',
  },
  consequenceText: {
      color: '#fff',
      fontSize: 20,
      lineHeight: 32,
      textAlign: 'center',
      fontWeight: '500',
  },
  statusText: {
      color: '#888',
      fontSize: 16,
      marginBottom: 16,
  },
  optionButton: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
  },
  optionA: {
      backgroundColor: '#FF6B6B',
  },
  optionB: {
      backgroundColor: '#4ECDC4',
  },
  bgLabel: {
      fontSize: 180,
      fontWeight: '900',
      color: 'rgba(0,0,0,0.15)',
      position: 'absolute',
      zIndex: 1,
  },
  textWrapper: {
      zIndex: 2,
      paddingHorizontal: 30,
      alignItems: 'center',
  },
  optionText: {
      fontSize: 32,
      fontWeight: 'bold',
      color: '#fff',
      textAlign: 'center',
      textShadowColor: 'rgba(0,0,0,0.3)',
      textShadowOffset: { width: 1, height: 2 },
      textShadowRadius: 4,
      lineHeight: 40,
  },
});