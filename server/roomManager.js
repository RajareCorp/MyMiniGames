// roomManager.js
const rooms = new Map();

function makeCode() {
  let code;
  do {
    code = Math.random().toString(36).slice(2, 6).toUpperCase();
  } while (rooms.has(code));
  return code;
}

function createRoom(game = 'codenames') {
  const room = {
    code: makeCode(),
    game,
    players: new Map(),
    hostId: null,
    state: null
  };
  rooms.set(room.code, room);
  return room;
}

function getRoom(code) {
  return rooms.get(String(code || '').trim().toUpperCase());
}

function findPlayerRoom(playerId) {
  return [...rooms.values()].find(room => room.players.has(playerId));
}

function addPlayer(room, id, name) {
  if (!room.hostId) room.hostId = id;

  // Calcul automatique pour équilibrer les équipes au join
  let redCount = 0;
  let blueCount = 0;
  for (const p of room.players.values()) {
    if (p.team === 'red') redCount++;
    if (p.team === 'blue') blueCount++;
  }
  const defaultTeam = redCount <= blueCount ? 'red' : 'blue';

  room.players.set(id, {
    id,
    name: String(name || 'Joueur').slice(0, 20),
    team: defaultTeam,
    role: 'operative' // 'spymaster' ou 'operative'
  });
}

function setPlayerTeamAndRole(room, playerId, team, role) {
  const player = room.players.get(playerId);
  if (!player) return false;

  if (['red', 'blue'].includes(team)) player.team = team;
  if (['spymaster', 'operative'].includes(role)) player.role = role;

  return true;
}

function removePlayer(room, id) {
  room.players.delete(id);
  if (room.hostId === id) room.hostId = room.players.keys().next().value || null;
  if (room.players.size === 0) rooms.delete(room.code);
}

function snapshot(room) {
  return {
    code: room.code,
    game: room.game,
    hostId: room.hostId,
    players: [...room.players.values()],
    state: room.state
  };
}

module.exports = { createRoom, getRoom, findPlayerRoom, addPlayer, setPlayerTeamAndRole, removePlayer, snapshot };