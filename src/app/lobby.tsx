import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from "react-native"
import { useSocket } from "../contexts/SocketContext"
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";

export default function Lobby() {
    const { room, socketId, leaveRoom, startGame } = useSocket();
    const router = useRouter();
    const [dots, setDots] = useState(''); 

    useEffect(() => {
        const interval = setInterval(() => {
            setDots(prevDots => {
                if (prevDots.length >= 3) {
                    return ''; 
                }
                return prevDots + '.';
            });
        }, 500);

        return () => clearInterval(interval);
    }, [room, socketId]);

    if (!room) return null;

    const isHost = room.hostId === socketId;

    const handleLeaveRoom = () => {
        leaveRoom();

        setTimeout(() => {
            router.replace('/');
        }, 100);
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.label}>ROOM CODE</Text>
                <Text style={styles.code}>{room.code}</Text>
            </View>

            <View style={styles.playersContainer}>
                <Text style={styles.sectionTitle}>
                    等待玩家中 ({room.players.length}人)
                </Text>
                <ScrollView style={styles.list}>
                    {room.players.map((pid, index) => (
                        <View key={pid} style={styles.playerRow}>
                            <View style={styles.playerInfo}>
                                <View style={styles.avatar}>
                                    <Text style={styles.avatarText}>{index + 1}</Text>
                                </View>
                                <Text style={styles.playerId}>
                                    {pid}
                                </Text>
                            </View>
                            {pid === socketId && (
                                <View style={styles.hostTag}>
                                    <Text style={styles.hostTagText}>You</Text>
                                </View>
                            )}
                        </View>
                    ))}
                </ScrollView>
            </View>

            <View style={styles.footer}>
                {isHost ? (
                    <TouchableOpacity style={[styles.button, styles.startBtn]} onPress={startGame}>
                        <Text style={styles.btnText}>開始遊戲</Text>
                    </TouchableOpacity>
                ) : (
                    <View style={styles.waitingBox}>
                        <Text style={styles.waitingText}>
                            等待主持人開始遊戲{dots} 
                        </Text>
                    </View>
                )}

                <TouchableOpacity style={[styles.button, styles.leaveBtn]} onPress={handleLeaveRoom}>
                    <Text style={styles.btnText}>離開房間</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#111827',
        padding: 20,
        paddingTop: 60,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    label: {
        color: '#9ca3af',
        fontSize: 14,
        letterSpacing: 2,
        marginBottom: 5,
    },
    code: {
        color: '#fff',
        fontSize: 48,
        fontWeight: 'bold',
        letterSpacing: 5,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    playersContainer: {
        flex: 1,
        backgroundColor: '#1f2937',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
    },
    sectionTitle: {
        color: '#fff',
        fontSize: 18,
        marginBottom: 15,
        fontWeight: '600',
    },
    list: {
        flex: 1,
    },
    playerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#374151',
    },
    playerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#374151',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarText: {
        color: '#9ca3af',
        fontWeight: 'bold',
    },
    playerId: {
        color: '#e5e7eb',
        fontSize: 16,
    },
    hostTag: {
        backgroundColor: '#4ade80',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    hostTagText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    footer: {
        gap: 15,
    },
    button: {
        padding: 18,
        borderRadius: 12,
        alignItems: 'center',
    },
    startBtn: {
        backgroundColor: '#10b981',
    },
    leaveBtn: {
        backgroundColor: '#ef4444',
    },
    btnText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    waitingBox: {
        padding: 18,
        alignItems: 'center',
        backgroundColor: '#374151',
        borderRadius: 12,
    },
    waitingText: {
        color: '#93c5fd',
        fontSize: 16,
        fontWeight: '500',
    },
});