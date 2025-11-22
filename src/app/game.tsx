/* */
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useSocket } from '../contexts/SocketContext';
import { useRouter } from 'expo-router';

export default function Game() {
  const { socket, currentScenario, submitVote } = useSocket();
  const router = useRouter();
  
  const [hasVoted, setHasVoted] = useState(false);
  const [waitingForNext, setWaitingForNext] = useState(false);

  useEffect(() => {
    if (currentScenario) {
      setHasVoted(false);
      setWaitingForNext(false);
    }
  }, [currentScenario]);

  useEffect(() => {
    if (!socket) return;

    const handleVoteResult = () => {
        setWaitingForNext(true);
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
      if (!socket || hasVoted || waitingForNext) return;

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

  if (waitingForNext && !hasVoted) {
      return (
          <View style={styles.centerContainer}>
              <Text style={[styles.votedTitle, { color: '#ff4444' }]}>時間已到</Text>
              <Text style={styles.votedSubtitle}>來不及投票，請等待下一關...</Text>
              <ActivityIndicator size="small" color="#666" style={{ marginTop: 20 }} />
          </View>
      );
  }

  if (hasVoted) {
      return (
          <View style={styles.centerContainer}>
              <Text style={styles.votedTitle}>已送出</Text>
              <Text style={styles.votedSubtitle}>
                  {waitingForNext ? "等待下一關..." : "等待其他玩家回答..."}
              </Text>
              {waitingForNext && <ActivityIndicator size="small" color="#666" style={{ marginTop: 20 }} />}
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
        onPress={() => handleVote(optionA?.optionId)}
        disabled={waitingForNext}
      >
        <Text style={styles.bgLabel}>A</Text>
        <View style={styles.textWrapper}>
            <Text style={styles.optionText}>{optionA?.text || "Option A"}</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.optionButton, styles.optionB]} 
        activeOpacity={0.9}
        onPress={() => handleVote(optionB?.optionId)}
        disabled={waitingForNext}
      >
        <Text style={styles.bgLabel}>B</Text>
        <View style={styles.textWrapper}>
            <Text style={styles.optionText}>{optionB?.text || "Option B"}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
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