// socket-client.js
const socket = io();

window.gameSocket = {
  on(event, handler) { socket.on(event, handler); },
  emit(event, payload) { socket.emit(event, payload); },
  id() { return socket.id; }
};
