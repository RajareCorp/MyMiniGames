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
      settings: room.settings || { displayMode: 'both' },
      messages: room.messages || [],
      pings: room.pings || [],
      state: codenames.publicState(room.state, player)
    });
  }
}

io.on('connection', socket => {
  socket.on('room:create', ({ name } = {}) => {
    const room = rooms.createRoom();
    room.settings = { displayMode: 'both' };
    room.messages = [];
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

  // Modification des paramètres de la partie (Hôte uniquement)
  socket.on('settings:update', ({ code, displayMode } = {}) => {
    const room = rooms.getRoom(code);
    if (!room || room.hostId !== socket.id) return;
    room.settings = room.settings || {};
    room.settings.displayMode = displayMode;
    sendRoom(room);
  });

  // Émission et enregistrement du tchat d'équipe
  socket.on('chat:message', ({ code, message } = {}) => {
    const room = rooms.getRoom(code);
    if (!room || !message || !String(message).trim()) return;

    const player = room.players.get(socket.id);
    if (!player) return;

    const chatMsg = {
      id: Date.now(),
      sender: player.name,
      team: player.team,
      text: String(message).trim().slice(0, 120),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    room.messages = room.messages || [];
    room.messages.push(chatMsg);
    if (room.messages.length > 50) room.messages.shift();

    io.to(code).emit('chat:new', chatMsg);
  });

  // Basculer un ping (Ajouter / Supprimer) par un Agent
  socket.on('card:ping', ({ code, cardId } = {}) => {
    const room = rooms.getRoom(code);
    if (!room) return;

    const player = room.players.get(socket.id);
    // Seuls les agents d'une équipe peuvent poser des pings
    if (!player || !player.team || player.role !== 'operative') return;

    room.pings = room.pings || [];
    const numericCardId = Number(cardId);
    
    const existingIndex = room.pings.findIndex(
      p => p.cardId === numericCardId && p.playerId === player.id
    );

    if (existingIndex !== -1) {
      // Retirer le ping s'il existe déjà
      room.pings.splice(existingIndex, 1);
    } else {
      // Ajouter le ping
      room.pings.push({
        cardId: numericCardId,
        playerId: player.id,
        playerName: player.name,
        team: player.team
      });
    }

    sendRoom(room);
  });

  socket.on('game:start', code => {
    const room = rooms.getRoom(code);
    if (!room || room.hostId !== socket.id) return;
    // Crée une nouvelle partie (sert aussi pour rejouer)
    room.pings = [];
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