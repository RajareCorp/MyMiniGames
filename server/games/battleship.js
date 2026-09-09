// server/games/battleship.js

function createGame() {
  return {
    phase: 'placing',
    turn: null,
    boardSize: 10,
    playersData: {}
  };
}

function initPlayer(game, playerId) {
  if (game.playersData[playerId]) return;
  game.playersData[playerId] = {
    ships: [], // Contiendra la liste exhaustive de toutes les coordonnées occupées [{x, y}]
    shotsFired: [],
    ready: false
  };
}

function placeShips(game, playerId, rawShips) {
  if (!game || game.phase !== 'placing') return false;
  const player = game.playersData[playerId];
  if (!player) return false;

  if (!Array.isArray(rawShips) || rawShips.length === 0) return false;

  // Tailles standard de la flotte
  const expectedSizes = [5, 4, 3, 3, 2];
  let calculatedCoords = [];

  // Validation et calcul des cases occupées par chaque navire
  for (const ship of rawShips) {
    if (typeof ship.x !== 'number' || typeof ship.y !== 'number' || typeof ship.size !== 'number') return false;
    
    for (let i = 0; i < ship.size; i++) {
      const x = ship.vertical ? ship.x : ship.x + i;
      const y = ship.vertical ? ship.y + i : ship.y;

      // Vérifier les limites de la grille (10x10)
      if (x < 0 || x >= game.boardSize || y < 0 || y >= game.boardSize) return false;
      // Vérifier les superpositions
      if (calculatedCoords.some(c => c.x === x && c.y === y)) return false;

      calculatedCoords.push({ x, y });
    }
  }

  player.ships = calculatedCoords;
  player.ready = true;

  // Lancement de la partie si les deux joueurs sont prêts
  const playerIds = Object.keys(game.playersData);
  if (playerIds.length === 2 && playerIds.every(id => game.playersData[id].ready)) {
    game.phase = 'playing';
    game.turn = playerIds[0];
  }

  return true;
}

function fireShot(game, playerId, targetX, targetY) {
  if (!game || game.phase !== 'playing') return { ok: false };
  if (game.turn !== playerId) return { ok: false };

  const playerIds = Object.keys(game.playersData);
  const opponentId = playerIds.find(id => id !== playerId);
  const opponent = game.playersData[opponentId];
  const shooter = game.playersData[playerId];

  if (shooter.shotsFired.some(s => s.x === targetX && s.y === targetY)) return { ok: false };

  const hit = opponent.ships.some(s => s.x === targetX && s.y === targetY);
  shooter.shotsFired.push({ x: targetX, y: targetY, hit });

  const totalShips = opponent.ships.length;
  const successfulHits = shooter.shotsFired.filter(s => s.hit).length;

  if (successfulHits >= totalShips) {
    game.phase = 'ended';
    game.winner = playerId;
  } else {
    game.turn = opponentId;
  }

  return { ok: true, hit, gameOver: game.phase === 'ended' };
}

function publicState(game, playerId) {
  if (!game) return null;
  const player = game.playersData[playerId] || { ships: [], shotsFired: [], ready: false };
  const playerIds = Object.keys(game.playersData);
  const opponentId = playerIds.find(id => id !== playerId);
  const opponent = opponentId ? game.playersData[opponentId] : null;

  return {
    phase: game.phase,
    turn: game.turn,
    boardSize: game.boardSize,
    isReady: player.ready,
    myShips: player.ships,
    myShots: player.shotsFired,
    opponentReady: opponent ? opponent.ready : false,
    opponentShots: opponent ? opponent.shotsFired : [],
    winner: game.winner
  };
}

module.exports = { createGame, initPlayer, placeShips, fireShot, publicState };