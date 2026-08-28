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
  ['Biohazard', 'https://api.iconify.design/noto:biohazard.svg'],
  ['Goutte', 'https://api.iconify.design/noto:droplet.svg'],
  ['Sang ', 'https://api.iconify.design/noto:drop-of-blood.svg'],

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
  ['Cheval', 'https://api.iconify.design/noto:horse.svg'],
  ['Panda', 'https://api.iconify.design/noto:panda.svg'],
  ['Cochon', 'https://api.iconify.design/noto:pig.svg'],
  ['Ours', 'https://api.iconify.design/noto:bear.svg'],
  ['Araignée', 'https://api.iconify.design/noto:spider.svg'],
  ['Coccinelle', 'https://api.iconify.design/noto:lady-beetle.svg'],
  ['Fourmi', 'https://api.iconify.design/noto:ant.svg'],
  ['Crabe', 'https://api.iconify.design/noto:crab.svg'],
  ['Chauve-souris', 'https://api.iconify.design/noto:bat.svg'],
  ['Poulpe', 'https://api.iconify.design/noto:squid.svg'],

  // Objet & Technologie
  ['Alambic', 'https://api.iconify.design/noto:alembic.svg'],
  ['Abacus', 'https://api.iconify.design/noto:abacus.svg'],
  ['Accordéon', 'https://api.iconify.design/noto:accordion.svg'],
  ['Pansement', 'https://api.iconify.design/noto:adhesive-bandage.svg'],
  ['Ticket', 'https://api.iconify.design/noto:admission-tickets.svg'],
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
  ['Seringue', 'https://api.iconify.design/noto:syringe.svg'],
  ['Axe', 'https://api.iconify.design/noto:axe.svg'],
  ['Anchor', 'https://api.iconify.design/noto:anchor.svg'],
  ['Amphore', 'https://api.iconify.design/noto:amphora.svg'],
  ['Coeur', 'https://api.iconify.design/noto:anatomical-heart.svg'],
  ['Sac à dos', 'https://api.iconify.design/noto:backpack.svg'],
  ['Bikini', 'https://api.iconify.design/noto:bikini.svg'],
  ['Bière', 'https://api.iconify.design/noto:beer-mug.svg'],
  ['Lèvre mordue', 'https://api.iconify.design/noto:biting-lip.svg'],
  ['Cigarette', 'https://api.iconify.design/noto:cigarette.svg'],
  ['Cerceuil', 'https://api.iconify.design/noto:coffin.svg'],
  ['Boule de cristal', 'https://api.iconify.design/noto:crystal-ball.svg'],
  ['Invisible', 'https://api.iconify.design/noto:dotted-line-face.svg'],
  ['Jarre', 'https://api.iconify.design/noto:jar.svg'],
  ['-18', 'https://api.iconify.design/noto:no-one-under-eighteen.svg'],
  ['Chaussettes', 'https://api.iconify.design/noto:socks.svg'],
  ['Savon', 'https://api.iconify.design/noto:soap.svg'],
  ['Eponge', 'https://api.iconify.design/noto:sponge.svg'],
  ['Toilette', 'https://api.iconify.design/noto:toilet.svg'],

  // Véhicules & Bâtiments
  ['Train', 'https://api.iconify.design/noto:locomotive.svg'],
  ['Chateau', 'https://api.iconify.design/noto:castle.svg'],
  ['Avion', 'https://api.iconify.design/noto:airplane.svg'],
  ['Fusée', 'https://api.iconify.design/noto:rocket.svg'],
  ['Bateau', 'https://api.iconify.design/noto:sailboat.svg'],
  ['Voiture', 'https://api.iconify.design/noto:automobile.svg'],
  ['Voiture de police', 'https://api.iconify.design/noto:police-car.svg'],
  ['Vélo', 'https://api.iconify.design/noto:bicycle.svg'],
  ['Télécabine', 'https://api.iconify.design/noto:aerial-tramway.svg'],
  ['Phare', 'https://api.iconify.design/noto:lighthouse.svg'],
  ['Pirate', 'https://api.iconify.design/noto:pirate-flag.svg'],
  ['Bicyclette', 'https://api.iconify.design/noto:kick-scooter.svg'],
  ['Bus', 'https://api.iconify.design/noto:bus.svg'],
  ['Tractor', 'https://api.iconify.design/noto:tractor.svg'],
  ['Tente', 'https://api.iconify.design/noto:camping.svg'],
  ['Maison', 'https://api.iconify.design/noto:house.svg'],
  ['Maison en ruine', 'https://api.iconify.design/noto:derelict-house.svg'],
  ['Mosqué', 'https://api.iconify.design/noto:mosque.svg'],
  ['Eglise', 'https://api.iconify.design/noto:church.svg'],
  ['Synagogue', 'https://api.iconify.design/noto:synagogue.svg'],
  ['Banque', 'https://api.iconify.design/noto:bank.svg'],
  ['Hut', 'https://api.iconify.design/noto:hut.svg'],
  ['Love Hotel', 'https://api.iconify.design/noto:love-hotel.svg'],

  // Nourriture & Loisirs
  ['Pizza', 'https://api.iconify.design/noto:pizza.svg'],
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
  ['Trésor', 'https://api.iconify.design/noto:coin.svg'],
  ['Steak', 'https://api.iconify.design/noto:cut-of-meat.svg'],
  ['Maïs', 'https://api.iconify.design/noto:ear-of-corn.svg'],
  ['Aubergine', 'https://api.iconify.design/noto:eggplant.svg'],

  //Personnages & Métiers
  ['Bébé', 'https://api.iconify.design/noto:baby-dark-skin-tone.svg'],
  ['Handicapé', 'https://api.iconify.design/noto:wheelchair-symbol.svg'],
  ['Transgenre', 'https://api.iconify.design/noto:transgender.svg'],
  ['Mère allaitante', 'https://api.iconify.design/noto:breast-feeding-medium-skin-tone.svg'],
  ['Cuisinier', 'https://api.iconify.design/noto:cook-medium-dark-skin-tone.svg'],
  ['Couple hétéro', 'https://api.iconify.design/noto:couple-with-heart-woman-man.svg'],
  ['Couple gay', 'https://api.iconify.design/noto:couple-with-heart-man-man.svg'],
  ['Couple lesbienne', 'https://api.iconify.design/noto:couple-with-heart-woman-woman.svg'],
  ['Baver', 'https://api.iconify.design/noto:drooling-face.svg'],
  ['Famille', 'https://api.iconify.design/noto:family-adult-child.svg'],
  ['Famille', 'https://api.iconify.design/noto:family-man-girl.svg'],
  ['Femelle', 'https://api.iconify.design/noto:female-sign.svg'],
  ['Male', 'https://api.iconify.design/noto:male-sign.svg'],
  ['Pied', 'https://api.iconify.design/noto:foot-light-skin-tone.svg'],
  ['Prier', 'https://api.iconify.design/noto:folded-hands-light-skin-tone.svg'],
  ['Juge', 'https://api.iconify.design/noto:judge-medium-light-skin-tone.svg'],
  ['Croix chrétienne', 'https://api.iconify.design/noto:latin-cross.svg'],
  ['Etoile de David', 'https://api.iconify.design/noto:star-of-david.svg'],
  ['Etoile et croissant', 'https://api.iconify.design/noto:star-and-crescent.svg'],
  ['Roux', 'https://api.iconify.design/noto:man-dark-skin-tone-red-hair.svg'],
  ['Elf', 'https://api.iconify.design/noto:man-elf-light-skin-tone.svg'],
  ['Fauteuil roulant', 'https://api.iconify.design/noto:man-in-manual-wheelchair.svg'],
  ['Zombie', 'https://api.iconify.design/noto:man-zombie.svg'],
  ['Aveugle', 'https://api.iconify.design/noto:man-with-white-cane.svg'],
  ['Homme avec un turban', 'https://api.iconify.design/noto:man-wearing-turban-medium-skin-tone.svg'],
  ['Homme en marié', 'https://api.iconify.design/noto:man-with-veil.svg'],
  ['Bunny Boys', 'https://api.iconify.design/noto:men-with-bunny-ears-light-skin-tone-dark-skin-tone.svg'],
  ['Bunny Girls', 'https://api.iconify.design/noto:women-with-bunny-ears-light-skin-tone-dark-skin-tone.svg'],
  ['Control de police', 'https://api.iconify.design/noto:passport-control.svg'],
  ['Policier', 'https://api.iconify.design/noto:police-officer-medium-light-skin-tone.svg'],
  ['Homme enceinte', 'https://api.iconify.design/noto:pregnant-person.svg'],
  ['Drapeau transgenre', 'https://api.iconify.design/noto:transgender-flag.svg'],
  ['Drapeau arc-en-ciel', 'https://api.iconify.design/noto:rainbow-flag.svg'],
  ['Drapeau pirate', 'https://api.iconify.design/noto:pirate-flag.svg'],
  ['Langue', 'https://api.iconify.design/noto:tongue.svg'],
  ['Mariage', 'https://api.iconify.design/noto:wedding.svg'],
  ['Femme à barbe', 'https://api.iconify.design/noto:woman-beard.svg'],
  ['Chauve', 'https://api.iconify.design/noto:man-light-skin-tone-bald.svg'],
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