// Banque de 100 cartes variées (Iconify SVG)
const cardPool = [
  // Nature & Éléments
  ['Lune', 'https://api.iconify.design/noto:crescent-moon.svg'],
  ['Plage', 'https://api.iconify.design/noto:beach-with-umbrella.svg'],
  ['Jardin', 'https://api.iconify.design/noto:potted-plant.svg'],
  ['Volcan', 'https://api.iconify.design/noto:volcano.svg'],
  ['Nuage', 'https://api.iconify.design/noto:cloud.svg'],
  ['Foret', 'https://api.iconify.design/noto:evergreen-tree.svg'],
  ['Etoile', 'https://api.iconify.design/noto:glowing-star.svg'],
  ['Ocean', 'https://api.iconify.design/noto:water-wave.svg'],
  ['Foudre', 'https://api.iconify.design/noto:high-voltage.svg'],
  ['Feu', 'https://api.iconify.design/noto:fire.svg'],
  ['Montagne', 'https://api.iconify.design/noto:mountain.svg'],
  ['Soleil', 'https://api.iconify.design/noto:sun.svg'],
  ['Tornade', 'https://api.iconify.design/noto:tornado.svg'],
  ['Arc-en-ciel', 'https://api.iconify.design/noto:rainbow.svg'],
  ['Fleur', 'https://api.iconify.design/noto:cherry-blossom.svg'],
  ['Cactus', 'https://api.iconify.design/noto:cactus.svg'],
  ['Planète', 'https://api.iconify.design/noto:ringed-planet.svg'],
  ['Comète', 'https://api.iconify.design/noto:comet.svg'],
  ['Ile', 'https://api.iconify.design/noto:desert-island.svg'],
  ['Flocon', 'https://api.iconify.design/noto:snowflake.svg'],

  // Animaux & Fantastique
  ['Dragon', 'https://api.iconify.design/noto:dragon-face.svg'],
  ['Papillon', 'https://api.iconify.design/noto:butterfly.svg'],
  ['Robot', 'https://api.iconify.design/noto:robot.svg'],
  ['Astronaute', 'https://api.iconify.design/noto:astronaut.svg'],
  ['Chien', 'https://api.iconify.design/noto:dog-face.svg'],
  ['Chat', 'https://api.iconify.design/noto:cat-face.svg'],
  ['Licorne', 'https://api.iconify.design/noto:unicorn.svg'],
  ['Pieuvre', 'https://api.iconify.design/noto:octopus.svg'],
  ['Requin', 'https://api.iconify.design/noto:shark.svg'],
  ['Serpent', 'https://api.iconify.design/noto:snake.svg'],
  ['Hibou', 'https://api.iconify.design/noto:owl.svg'],
  ['Aigle', 'https://api.iconify.design/noto:eagle.svg'],
  ['Dauphin', 'https://api.iconify.design/noto:dolphin.svg'],
  ['Dinosaure', 'https://api.iconify.design/noto:t-rex.svg'],
  ['Alien', 'https://api.iconify.design/noto:alien.svg'],
  ['Fantôme', 'https://api.iconify.design/noto:ghost.svg'],
  ['Abeille', 'https://api.iconify.design/noto:honeybee.svg'],
  ['Grenouille', 'https://api.iconify.design/noto:frog.svg'],
  ['Lion', 'https://api.iconify.design/noto:lion.svg'],
  ['Tortue', 'https://api.iconify.design/noto:turtle.svg'],

  // Objet & Technologie
  ['Boussole', 'https://api.iconify.design/noto:compass.svg'],
  ['Piano', 'https://api.iconify.design/noto:musical-keyboard.svg'],
  ['Miroir', 'https://api.iconify.design/noto:mirror.svg'],
  ['Appareil photo', 'https://api.iconify.design/noto:camera.svg'],
  ['Livre', 'https://api.iconify.design/noto:books.svg'],
  ['Cle', 'https://api.iconify.design/noto:old-key.svg'],
  ['Téléphone', 'https://api.iconify.design/noto:mobile-phone.svg'],
  ['Guitare', 'https://api.iconify.design/noto:guitar.svg'],
  ['Horloge', 'https://api.iconify.design/noto:mantelpiece-clock.svg'],
  ['Sablier', 'https://api.iconify.design/noto:hourglass-done.svg'],
  ['Ampoule', 'https://api.iconify.design/noto:light-bulb.svg'],
  ['Télévision', 'https://api.iconify.design/noto:television.svg'],
  ['Microphone', 'https://api.iconify.design/noto:microphone.svg'],
  ['Batterie', 'https://api.iconify.design/noto:battery.svg'],
  ['Cadenas', 'https://api.iconify.design/noto:locked.svg'],
  ['Ciseaux', 'https://api.iconify.design/noto:scissors.svg'],
  ['Casque', 'https://api.iconify.design/noto:headphone.svg'],
  ['Parapluie', 'https://api.iconify.design/noto:umbrella.svg'],
  ['Loupe', 'https://api.iconify.design/noto:magnifying-glass-tilted-left.svg'],
  ['Bouteille', 'https://api.iconify.design/noto:baby-bottle.svg'],

  // Véhicules & Bâtiments
  ['Train', 'https://api.iconify.design/noto:locomotive.svg'],
  ['Chateau', 'https://api.iconify.design/noto:castle.svg'],
  ['Avion', 'https://api.iconify.design/noto:airplane.svg'],
  ['Fusée', 'https://api.iconify.design/noto:rocket.svg'],
  ['Bateau', 'https://api.iconify.design/noto:sailboat.svg'],
  ['Voiture', 'https://api.iconify.design/noto:automobile.svg'],
  ['Vélo', 'https://api.iconify.design/noto:bicycle.svg'],
  ['Sous-marin', 'https://api.iconify.design/emojione:submarine.svg'],
  ['Phare', 'https://api.iconify.design/noto:lighthouse.svg'],
  ['Pirate', 'https://api.iconify.design/noto:pirate-flag.svg'],
  ['Bicyclette', 'https://api.iconify.design/noto:kick-scooter.svg'],
  ['Bus', 'https://api.iconify.design/noto:bus.svg'],
  ['Tractor', 'https://api.iconify.design/noto:tractor.svg'],
  ['Tente', 'https://api.iconify.design/noto:camping.svg'],
  ['Maison', 'https://api.iconify.design/noto:house.svg'],

  // Nourriture & Loisirs
  ['Pizza', 'https://api.iconify.design/noto:slice-of-pizza.svg'],
  ['Couronne', 'https://api.iconify.design/noto:crown.svg'],
  ['Pomme', 'https://api.iconify.design/noto:red-apple.svg'],
  ['Gâteau', 'https://api.iconify.design/noto:birthday-cake.svg'],
  ['Glace', 'https://api.iconify.design/noto:soft-ice-cream.svg'],
  ['Café', 'https://api.iconify.design/noto:hot-beverage.svg'],
  ['Burger', 'https://api.iconify.design/noto:hamburger.svg'],
  ['Donut', 'https://api.iconify.design/noto:doughnut.svg'],
  ['Fraise', 'https://api.iconify.design/noto:strawberry.svg'],
  ['Avocat', 'https://api.iconify.design/noto:avocado.svg'],
  ['Trophée', 'https://api.iconify.design/noto:trophy.svg'],
  ['Manette', 'https://api.iconify.design/noto:video-game.svg'],
  ['Dés', 'https://api.iconify.design/noto:game-die.svg'],
  ['Ballon', 'https://api.iconify.design/noto:soccer-ball.svg'],
  ['Cadeau', 'https://api.iconify.design/noto:wrapped-gift.svg'],
  ['Médaille', 'https://api.iconify.design/noto:sports-medal.svg'],
  ['Masque', 'https://api.iconify.design/noto:performing-arts.svg'],
  ['Pinceau', 'https://api.iconify.design/noto:paintbrush.svg'],
  ['Diamant', 'https://api.iconify.design/noto:gem-stone.svg'],
  ['Trésor', 'https://api.iconify.design/noto:coin.svg']
];

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