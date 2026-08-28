// server.js
const path = require('path');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const rooms = require('./roomManager');
const codenames = require('./games/codenames');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  pingTimeout: 5000,    // Détection rapide des déconnexions (5s)
  pingInterval: 10000
});
const port = process.env.PORT || 4000;

app.use(express.static(path.join(__dirname, '..', 'public')));
app.get('/health', (_req, res) => res.json({ ok: true }));

function sendRoom(room) {
  for (const player of room.players.values()) {
    io.to(player.id).emit('room:update', {
      ...rooms.snapshot(room),
      state: codenames.publicState(room.state, player)
    });
  }
}

io.on('connection', socket => {
  socket.on('room:create', ({ name } = {}) => {
    const room = rooms.createRoom();
    rooms.addPlayer(room, socket.id, name);
    socket.join(room.code);
    sendRoom(room);
  });

  socket.on('room:join', ({ code, name } = {}) => {
    const room = rooms.getRoom(code);
    if (!room) return socket.emit('room:error', 'Salon introuvable.');
    rooms.addPlayer(room, socket.id, name);
    socket.join(room.code);
    sendRoom(room);
  });

  socket.on('room:leave', (code) => {
    const room = rooms.getRoom(code);
    if (!room) return;
    socket.leave(room.code);
    rooms.removePlayer(room, socket.id);
    if (rooms.getRoom(room.code)) sendRoom(room);
  });

  socket.on('player:selectTeam', ({ code, team, role } = {}) => {
    const room = rooms.getRoom(code);
    if (!room) return;
    if (rooms.setPlayerTeamAndRole(room, socket.id, team, role)) {
      sendRoom(room);
    }
  });

  socket.on('teams:randomize', (code) => {
    const room = rooms.getRoom(code);
    if (!room || room.hostId !== socket.id) return;
    rooms.randomizeTeams(room);
    sendRoom(room);
  });

  socket.on('game:start', code => {
    const room = rooms.getRoom(code);
    if (!room || room.hostId !== socket.id) return;
    // Crée une nouvelle partie (sert aussi pour rejouer)
    room.state = codenames.createGame();
    sendRoom(room);
  });

  socket.on('game:clue', ({ code, clue, count } = {}) => {
    const room = rooms.getRoom(code);
    if (!room) return;
    const player = room.players.get(socket.id);
    if (!player || !codenames.giveClue(room.state, player, clue, count)) return;
    sendRoom(room);
  });

  socket.on('game:reveal', ({ code, cardId } = {}) => {
    const room = rooms.getRoom(code);
    if (!room) return;
    const player = room.players.get(socket.id);
    if (!player || !codenames.revealCard(room.state, player, cardId).ok) return;
    sendRoom(room);
  });

  socket.on('game:pass', code => {
    const room = rooms.getRoom(code);
    if (!room) return;
    const player = room.players.get(socket.id);
    if (!player || !codenames.passTurn(room.state, player)) return;
    sendRoom(room);
  });

  socket.on('disconnect', () => {
    const room = rooms.findPlayerRoom(socket.id);
    if (!room) return;
    rooms.removePlayer(room, socket.id);
    if (rooms.getRoom(room.code)) sendRoom(room);
  });
});

server.listen(port, () => console.log(`MyMiniGames disponible sur http://localhost:${port}`));