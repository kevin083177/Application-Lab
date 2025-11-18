import { io } from "socket.io-client";

const socket_ip = `http://${process.env.EXPO_PUBLIC_IP}:${process.env.EXPO_PUBLIC_SOCKET_PORT}`;

export const socket = io(socket_ip, {
    autoConnect: false,
});