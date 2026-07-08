// client/src/socket.js — Socket.IO client connection

import { io } from 'socket.io-client';

const SERVER_URL = 'http://localhost:4000';

const socket = io(SERVER_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
});

socket.on('connect', () => {
  console.log('[socket] Connected:', socket.id);
});

socket.on('disconnect', () => {
  console.log('[socket] Disconnected');
});

export default socket;
