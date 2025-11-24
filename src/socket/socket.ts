import { io } from "socket.io-client";
import Constants from 'expo-constants';

const socket_ip = Constants.expoConfig?.extra?.API_URL;

export const socket = io(socket_ip, {
    autoConnect: false,
});