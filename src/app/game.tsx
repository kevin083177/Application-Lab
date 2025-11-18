import { View, Text, StyleSheet, TouchableOpacity, Alert, SafeAreaView, StatusBar } from "react-native";
import { useSocket } from "../contexts/SocketContext";
import { useRouter } from "expo-router";
import { useEffect } from "react";

export default function Game() {
    const { currentScenario, makeChoice, leaveRoom, room } = useSocket();
    const router = useRouter();

    useEffect(() => {
        if (!room) {
            router.replace('/');
        }
    }, [room]);

    const handleOptionPress = (nextId: string | null) => {
        if (nextId) {
            makeChoice(nextId);
        } else {
            Alert.alert("遊戲結束", "你已到達結局", [
                { text: "返回大廳", onPress: () => {
                    leaveRoom();
                    router.replace('/');
                }}
            ]);
        }
    };

    if (!currentScenario) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>載入場景中...</Text>
            </View>
        );
    }

    const options = currentScenario.options || [];
    const option1 = options[0];
    const option2 = options[1];

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            
            <View style={styles.splitScreen}>
                <TouchableOpacity 
                    style={[styles.half, styles.topHalf]}
                    activeOpacity={0.9}
                    onPress={() => option1 ? handleOptionPress(option1.nextScenarioId) : null}
                    disabled={!option1}
                >
                    <View style={styles.optionOverlay}>
                         <Text style={styles.optionLabel}>A</Text>
                         {option1 && <Text style={styles.optionText}>{option1.text}</Text>}
                    </View>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={[styles.half, styles.bottomHalf]}
                    activeOpacity={0.9}
                    onPress={() => option2 ? handleOptionPress(option2.nextScenarioId) : null}
                    disabled={!option2}
                >
                    <View style={styles.optionOverlay}>
                        <Text style={styles.optionLabel}>B</Text>
                        {option2 ? (
                            <Text style={styles.optionText}>{option2.text}</Text>
                        ) : (
                            <Text style={styles.endText}>沒有更多選項 (結局?)</Text>
                        )}
                    </View>
                </TouchableOpacity>
            </View>

            <SafeAreaView style={styles.storyWrapper} pointerEvents="none">
                <View style={styles.storyCard}>
                    <Text style={styles.scenarioTitle}>{currentScenario.title}</Text>
                    <Text style={styles.scenarioDesc}>
                        {currentScenario.description}
                    </Text>
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: '#111827',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: '#fff',
        fontSize: 20,
    },
    splitScreen: {
        flex: 1,
        flexDirection: 'column',
    },
    half: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    topHalf: {
        backgroundColor: '#1e3a8a',
        borderBottomWidth: 2,
        borderBottomColor: '#000',
    },
    bottomHalf: {
        backgroundColor: '#be123c',
        borderTopWidth: 2,
        borderTopColor: '#000',
    },
    optionOverlay: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    optionLabel: {
        fontSize: 80,
        fontWeight: '900',
        color: 'rgba(255,255,255,0.1)',
        position: 'absolute',
    },
    optionText: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        textShadowColor: 'rgba(0,0,0,0.75)',
        textShadowOffset: {width: -1, height: 1},
        textShadowRadius: 10,
        zIndex: 10,
    },
    endText: {
        color: '#999',
        fontSize: 18,
        fontStyle: 'italic',
    },
    
    // 故事卡片樣式
    storyWrapper: {
        ...StyleSheet.absoluteFillObject, // 絕對定位覆蓋全屏
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 20, // 確保在最上層
    },
    storyCard: {
        backgroundColor: 'rgba(0, 0, 0, 0.85)', // 半透明黑底
        width: '85%',
        padding: 25,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        alignItems: 'center',
    },
    scenarioTitle: {
        color: '#fbbf24', // 金黃色
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 15,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    scenarioDesc: {
        color: '#e5e7eb', // 灰白色
        fontSize: 16,
        lineHeight: 24,
        textAlign: 'center',
    },
});