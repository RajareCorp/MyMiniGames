const cardPool = require('./cardPool');

//games/codenames.js (les items sont déclarés dans le tableau cardPool au dessus)
function shuffle(items) {
  const array = [...items];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function createGame() {
  const roles = shuffle([
    ...Array(8).fill('red'),
    ...Array(7).fill('blue'),
    ...Array(9).fill('neutral'),
    'assassin'
  ]);

  // Sélectionne 25 cartes au hasard dans le pool de 100
  const selectedCards = shuffle(cardPool).slice(0, 25);

  const cards = selectedCards.map(([label, icon], index) => ({
    id: index,
    label,
    icon,
    role: roles[index],
    revealed: false
  }));

  return { 
    phase: 'playing', 
    turn: 'red', 
    clue: null, 
    guessesLeft: 0, 
    cards, 
    scores: { red: 0, blue: 0 },
    winner: null 
  };
}

function giveClue(game, player, clue, count) {
  if (!game || game.phase !== 'playing') return false;
  if (player.team !== game.turn || player.role !== 'spymaster') return false;
  if (!clue || !Number.isInteger(count) || count < 1) return false;

  game.clue = String(clue).slice(0, 40);
  game.guessesLeft = count + 1; // +1 règle officielle Codenames
  return true;
}

function revealCard(game, player, cardId) {
  if (!game || game.phase !== 'playing' || game.guessesLeft < 1) return { ok: false };
  if (player.team !== game.turn || player.role !== 'operative') return { ok: false };

  const card = game.cards.find(item => item.id === Number(cardId));
  if (!card || card.revealed) return { ok: false };

  card.revealed = true;
  game.guessesLeft -= 1;

  // 1. Cas de l'Assassin : Fin de partie immédiate (l'équipe adverse gagne)
  if (card.role === 'assassin') {
    game.phase = 'ended';
    game.winner = game.turn === 'red' ? 'blue' : 'red';
    return { ok: true, card };
  }

  // 2. Carte trouvée appartenant à l'équipe en cours
  if (card.role === game.turn) {
    game.scores[game.turn] += 1;

    // Condition de victoire : toutes les cartes de l'équipe sont trouvées
    if (game.scores.red >= 8 || game.scores.blue >= 7) {
      game.phase = 'ended';
      game.winner = game.scores.red >= 8 ? 'red' : 'blue';
      return { ok: true, card };
    }

    // Plus de choix restants pour ce tour -> Changement de tour
    if (game.guessesLeft === 0) {
      endTurn(game);
    }
  } 
  // 3. Carte Neutre ou Carte Adverse : Fin immédiate du tour (pas fin de partie !)
  else {
    if (card.role === 'red') game.scores.red += 1;
    if (card.role === 'blue') game.scores.blue += 1;

    // Vérifier si la carte adverse révélée par erreur fait gagner l'autre équipe
    if (game.scores.red >= 8 || game.scores.blue >= 7) {
      game.phase = 'ended';
      game.winner = game.scores.red >= 8 ? 'red' : 'blue';
    } else {
      endTurn(game);
    }
  }

  return { ok: true, card };
}

function passTurn(game, player) {
  if (!game || game.phase !== 'playing') return false;
  if (player.team !== game.turn || player.role !== 'operative') return false;
  if (!game.clue) return false;

  endTurn(game);
  return true;
}

function endTurn(game) {
  game.turn = game.turn === 'red' ? 'blue' : 'red';
  game.clue = null;
  game.guessesLeft = 0;
}

function publicState(game, player) {
  if (!game) return null;
  const isSpymaster = player && player.role === 'spymaster';
  const isGameOver = game.phase === 'ended';

  return {
    ...game,
    cards: game.cards.map(card => ({
      ...card,
      role: (card.revealed || isSpymaster || isGameOver) ? card.role : null
    }))
  };
}

module.exports = { createGame, giveClue, revealCard, passTurn, publicState };