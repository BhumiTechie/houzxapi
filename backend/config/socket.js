import { io } from 'socket.io-client';

// Base URL of backend
const SOCKET_URL = 'https://houzxapi-1.onrender.com';

export const socket = io(SOCKET_URL, {
  transports: ['websocket'], // ensures WebSocket transport
});
