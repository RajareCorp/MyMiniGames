// server.js
const path = require('path');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const rooms = require('./roomManager');

// Dictionnaire centralisé des jeux disponibles
const games = {
  codenames: require('./games/codenames'),
  battleship: require('./games/battleship')
};

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  pingTimeout: 5000,
  pingInterval: 10000
});
const port = process.env.PORT || 4000;

app.use(express.static(path.join(__dirname, '..', 'public')));
app.get('/health', (_req, res) => res.json({ ok: true }));

function sendRoom(room) {
  const gameModule = games[room.gameType];

  for (const player of room.players.values()) {
    io.to(player.id).emit('room:update', {
      ...rooms.snapshot(room),
      settings: room.settings || {},
      messages: room.messages || [],
      pings: room.pings || [],
      // Utilisation dynamique du module de jeu s'il existe, sinon état brut
      state: gameModule && gameModule.publicState ? gameModule.publicState(room.state, player.id) : room.state
    });
  }
}

io.on('connection', socket => {
  // On peut maintenant préciser quel jeu on veut créer (par défaut 'codenames')
  socket.on('room:create', ({ name, gameType = 'codenames' } = {}) => {
    if (!games[gameType]) return socket.emit('room:error', 'Jeu inconnu.');
    
    const room = rooms.createRoom();
    room.gameType = gameType; // On stocke le type de jeu dans le salon
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
    if (!room) {
      // Sécurité : si le salon n'existe plus, on force quand même le retour au menu du client
      socket.emit('room:update', null);
      return;
    }
    
    socket.leave(room.code);
    rooms.removePlayer(room, socket.id);
    
    // 1. On prévient le joueur qui part qu'il est retourné à l'accueil
    socket.emit('room:update', null);

    // 2. On met à jour les joueurs restants dans le salon (s'il existe encore)
    if (rooms.getRoom(room.code)) {
      sendRoom(room);
    }
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

  socket.on('settings:update', ({ code, displayMode } = {}) => {
    const room = rooms.getRoom(code);
    if (!room || room.hostId !== socket.id) return;
    room.settings = room.settings || {};
    room.settings.displayMode = displayMode;
    sendRoom(room);
  });

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

  socket.on('card:ping', ({ code, cardId } = {}) => {
    const room = rooms.getRoom(code);
    if (!room) return;

    const player = room.players.get(socket.id);
    if (!player || !player.team || player.role !== 'operative') return;

    room.pings = room.pings || [];
    const numericCardId = Number(cardId);
    
    const existingIndex = room.pings.findIndex(
      p => p.cardId === numericCardId && p.playerId === player.id
    );

    if (existingIndex !== -1) {
      room.pings.splice(existingIndex, 1);
    } else {
      room.pings.push({
        cardId: numericCardId,
        playerId: player.id,
        playerName: player.name,
        team: player.team
      });
    }

    sendRoom(room);
  });

  // --- ACTIONS DE JEU DYNAMIQUES ---
  
  socket.on('game:start', code => {
    const room = rooms.getRoom(code);
    if (!room || room.hostId !== socket.id) return;
    const gameModule = games[room.gameType];
    if (!gameModule) return;

    room.pings = [];
    room.state = gameModule.createGame();

    // Initialisation spécifique pour la Bataille Navale (enregistre les joueurs)
    if (room.gameType === 'battleship') {
      for (const pId of room.players.keys()) {
        gameModule.initPlayer(room.state, pId);
      }
    }

    sendRoom(room);
  });

  // Actions spécifiques Codenames
  socket.on('game:clue', ({ code, clue, count } = {}) => {
    const room = rooms.getRoom(code);
    if (!room || room.gameType !== 'codenames') return;
    const player = room.players.get(socket.id);
    if (!player || !games.codenames.giveClue(room.state, player, clue, count)) return;
    sendRoom(room);
  });

  socket.on('game:reveal', ({ code, cardId } = {}) => {
    const room = rooms.getRoom(code);
    if (!room || room.gameType !== 'codenames') return;
    const player = room.players.get(socket.id);
    if (!player || !games.codenames.revealCard(room.state, player, cardId).ok) return;
    sendRoom(room);
  });

  socket.on('game:pass', code => {
    const room = rooms.getRoom(code);
    if (!room || room.gameType !== 'codenames') return;
    const player = room.players.get(socket.id);
    if (!player || !games.codenames.passTurn(room.state, player)) return;
    sendRoom(room);
  });

  // Actions spécifiques Bataille Navale
  socket.on('battleship:place', ({ code, ships } = {}) => {
    const room = rooms.getRoom(code);
    if (!room || room.gameType !== 'battleship') return;
    games.battleship.placeShips(room.state, socket.id, ships);
    sendRoom(room);
  });

  socket.on('battleship:fire', ({ code, x, y } = {}) => {
    const room = rooms.getRoom(code);
    if (!room || room.gameType !== 'battleship') return;
    games.battleship.fireShot(room.state, socket.id, x, y);
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