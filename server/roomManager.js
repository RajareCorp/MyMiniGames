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

function randomizeTeams(room) {
  if (!room) return;
  const playersArray = [...room.players.values()];
  
  // Algorithme de mélange rapide (Fisher-Yates)
  for (let i = playersArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [playersArray[i], playersArray[j]] = [playersArray[j], playersArray[i]];
  }

  const half = Math.ceil(playersArray.length / 2);

  playersArray.forEach((player, index) => {
    const isRed = index < half;
    player.team = isRed ? 'red' : 'blue';
    player.role = 'operative'; // Remet tout le monde en agent par défaut
  });

  // Assigne 1 Maître-Espion par équipe au hasard s'il y a assez de joueurs
  if (half > 0) playersArray[0].role = 'spymaster';
  if (playersArray.length > 1) playersArray[half].role = 'spymaster';
}

module.exports = { 
  createRoom, 
  getRoom, 
  findPlayerRoom, 
  addPlayer, 
  setPlayerTeamAndRole, 
  removePlayer, 
  snapshot,
  randomizeTeams
};