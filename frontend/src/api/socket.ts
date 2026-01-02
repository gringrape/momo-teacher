import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const createSocketClient = (): Socket => {
    if (!socket) {
        const url = import.meta.env.VITE_API_URL;
        socket = io(url, {
            path: '/socket.io',
            // Add any other default config here if needed
        });
    }
    return socket;
};

export const getSocket = (): Socket | null => {
    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};
