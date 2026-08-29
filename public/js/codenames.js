// codenames.js
(() => {
  const app = document.querySelector('#app');
  let room = null;
  let isHost = false;

  const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
  const emit = (event, payload) => window.gameSocket.emit(event, payload);

  let lastRevealedCount = 0;

  window.gameSocket.on('room:update', updatedRoom => {
    const oldState = room?.state;
    room = updatedRoom;
    isHost = room.hostId === window.gameSocket.id();
    
    const newState = room.state;

    // Détection des sons selon les événements du plateau
    if (newState) {
      // 1. Détections de nouvelles cartes révélées
      const currentRevealed = newState.cards.filter(c => c.revealed).length;
      if (oldState && currentRevealed > lastRevealedCount) {
        const newlyRevealedCard = newState.cards.find(c => c.revealed && !oldState.cards.find(oc => oc.id === c.id)?.revealed);
        
        if (newlyRevealedCard) {
          if (newlyRevealedCard.role === 'assassin') {
            window.gameAudio.playAssassin();
          } else if (newlyRevealedCard.role === newState.turn) {
            window.gameAudio.playRevealCorrect();
          } else {
            window.gameAudio.playRevealWrong();
          }
        }
      }
      lastRevealedCount = currentRevealed;

      // 2. Détection des indices donnés
      if (oldState && !oldState.clue && newState.clue) {
        window.gameAudio.playClue();
      }

      // 3. Détection de victoire
      if (oldState && oldState.phase !== 'ended' && newState.phase === 'ended') {
        window.gameAudio.playWin();
      }
    } else {
      lastRevealedCount = 0;
    }

    render();
  });

  function render() {
    if (!room) {
      app.innerHTML = `<main class="shell home"><p class="eyebrow">MY MINI GAMES</p><h1>Des images. Des associations.<br><em>Une équipe.</em></h1><p class="lead">Choisissez un jeu et invitez vos proches autour d'une partie instantanée.</p><section class="menu-grid"><article class="game-tile active"><span class="tile-icon">◈</span><div><h2>Codenames Image</h2><p>Faites deviner les bons symboles sans tomber sur l'assassin.</p></div><button id="choose-game">Jouer</button></article><article class="game-tile locked"><span class="tile-icon">✦</span><div><h2>Bientôt disponible</h2><p>De nouveaux mini-jeux arrivent dans la collection.</p></div><span class="tag">EN DEVELOPPEMENT</span></article></section></main>`;
      document.querySelector('#choose-game').onclick = showLobby;
      return;
    }

    const state = room.state;
    const me = room.players.find(p => p.id === window.gameSocket.id());
    const isMyTurn = state && me && me.team === state.turn;
    const canGiveClue = state && isMyTurn && me.role === 'spymaster' && state.phase === 'playing' && !state.clue;
    const isGameOver = state && state.phase === 'ended';

    const redPlayers = room.players.filter(p => p.team === 'red');
    const bluePlayers = room.players.filter(p => p.team === 'blue');

    app.innerHTML = `
      <main class="shell game">
        <header class="topbar">
          <button class="back" id="leave">← Menu</button>
          <div class="brand">CODENAMES <span>IMAGE</span></div>

          <!-- BOUTON RÈGLES -->
          <button id="toggle-rules" class="secondary icon-btn" title="Règles du jeu">❓</button>
          <div class="audio-controls-wrapper">
            <button id="toggle-audio-menu" class="secondary">🎵</button>
            
            <div id="audio-menu" class="audio-menu hidden">
              <div class="audio-setting">
                <label for="music-slider">Musique</label>
                <input type="range" id="music-slider" min="0" max="1" step="0.05" value="${window.gameAudio.getMusicVolume()}">
              </div>
              <div class="audio-setting">
                <label for="sfx-slider">Effets sonores</label>
                <input type="range" id="sfx-slider" min="0" max="1" step="0.05" value="${window.gameAudio.getSfxVolume()}">
              </div>
            </div>
          </div>
          <div class="room-code">SALON <strong>${room.code}</strong></div>
        </header>

        <section class="game-layout">
          <aside class="sidebar">
            <p class="eyebrow">SALON ${room.code}</p>
            <h1>Sélecteur d'équipe</h1>
            
            <div class="teams-container">
              <div class="team-box red">
                <h3>Équipe Rouge (${redPlayers.length})</h3>
                ${redPlayers.map(p => `<div class="player-tag">${escapeHtml(p.name)} <i>${p.role === 'spymaster' ? 'ESPION' : 'AGENT'}</i></div>`).join('')}
                <div class="team-actions">
                  <button class="btn-team red" data-team="red" data-role="operative">Rejoindre Agent</button>
                  <button class="btn-team red" data-team="red" data-role="spymaster">Rejoindre Espion</button>
                </div>
              </div>

              <div class="team-box blue">
                <h3>Équipe Bleue (${bluePlayers.length})</h3>
                ${bluePlayers.map(p => `<div class="player-tag">${escapeHtml(p.name)} <i>${p.role === 'spymaster' ? 'ESPION' : 'AGENT'}</i></div>`).join('')}
                <div class="team-actions">
                  <button class="btn-team blue" data-team="blue" data-role="operative">Rejoindre Agent</button>
                  <button class="btn-team blue" data-team="blue" data-role="spymaster">Rejoindre Espion</button>
                </div>
              </div>
            </div>

            <!-- BOUTONS D'ACTION HÔTE -->
            ${isHost ? `
              <div class="host-actions">
                ${!state || isGameOver ? '<button class="secondary" id="randomize-teams">🎲 Équipes Aléatoires</button>' : ''}
                ${!state ? '<button class="primary" id="start">Lancer la partie</button>' : ''}
                ${isGameOver ? '<button class="primary" id="restart">🔄 Rejouer une partie</button>' : ''}
              </div>
            ` : ''}

            ${canGiveClue ? `
              <form id="clue-form" class="clue-form">
                <label>Votre indice</label>
                <input id="clue" maxlength="40" placeholder="Ex : Voyage" required>
                <label>Nombre de cartes</label>
                <input id="count" type="number" min="1" max="8" value="2" required>
                <button class="primary">Donner l'indice</button>
              </form>
            ` : ''}
          </aside>

          <section class="board-area">
            ${state ? renderBoard(state, me) : `<div class="waiting"><span class="pulse">◈</span><h2>En attente du lancement</h2><p>Le maître du salon peut démarrer la partie.</p></div>`}
          </section>
        </section>

        <!-- FENÊTRE MODALE DES RÈGLES -->
        <div id="rules-modal" class="modal-overlay hidden">
          <div class="modal-content">
            <div class="modal-header">
              <h2>📜 Règles du jeu</h2>
              <button id="close-rules" class="close-btn">&times;</button>
            </div>
            <div class="modal-body">
              <p><strong>But du jeu :</strong> Faire deviner à votre équipe toutes vos images avant l'équipe adverse, sans jamais cliquer sur l'Assassin.</p>
              
              <h3>1. Rôles</h3>
              <ul>
                <li><strong>Maître-Espion :</strong> Voit la couleur cachée de chaque image. Il doit donner un mot-indice et un chiffre à son équipe.</li>
                <li><strong>Agents :</strong> Voiement uniquement les images et doivent se concerter pour deviner les bonnes cartes.</li>
              </ul>

              <h3>2. Le Tour de Jeu</h3>
              <ul>
                <li>Le Maître-Espion donne <strong>1 Mot</strong> + <strong>1 Nombre</strong> (ex: <em>"Mer - 2"</em>).</li>
                <li>Les Agents désignent les cartes une par une.</li>
                <li><strong> Image de votre couleur :</strong> Vous pouvez continuer à deviner (jusqu'à <code>Nombre + 1</code> essai).</li>
                <li><strong> Image adverse / Neutre :</strong> Le tour s'arrête immédiatement.</li>
                <li><strong>Carte noire :</strong> La partie s'arrête et votre équipe perd instantanément !</li>
              </ul>
            </div>
          </div>
        </div>
      </main>`;

    bindGameEvents(me);
  }

  function renderBoard(state, me) {
    const turnName = state.turn === 'red' ? 'Équipe Rouge' : 'Équipe Bleue';
    const isMyTurn = me && me.team === state.turn;
    const canGuess = isMyTurn && me.role === 'operative' && state.clue && state.phase === 'playing';
    const isSpymaster = me && me.role === 'spymaster';

    return `
      <div class="board-head">
        <div>
          <p class="eyebrow">${state.phase === 'ended' ? 'PARTIE TERMINEE' : 'TOUR EN COURS'}</p>
          <h2>${state.phase === 'ended' ? `Victoire : Équipe ${state.winner === 'red' ? 'Rouge' : 'Bleue'} !` : turnName}</h2>
        </div>
        <div class="scores">
          <span class="red-score">ROUGE <strong>${state.scores.red}/8</strong></span>
          <span class="blue-score">BLEU <strong>${state.scores.blue}/7</strong></span>
        </div>
      </div>

      ${state.clue ? `
        <div class="clue">
          <span>INDICE</span>
          <strong>${escapeHtml(state.clue)}</strong>
          <small>${state.guessesLeft-1} choix restants + 1 Bonus</small>
          ${canGuess ? '<button id="pass-btn" class="secondary pass-btn">Finir le tour</button>' : ''}
        </div>
      ` : '<div class="clue muted">En attente de l\'indice du Maître-Espion...</div>'}

      <div class="cards">
        ${state.cards.map(card => {
          const isRevealed = card.revealed;
          const role = card.role || '';
          const isDisabled = !canGuess || isRevealed || state.phase === 'ended';
          const previewClass = (!isRevealed && (isSpymaster || state.phase === 'ended')) ? `spymaster-preview ${role}` : '';

          return `
            <button class="card ${isRevealed ? `revealed ${role}` : ''} ${previewClass}" 
                    data-card="${card.id}" 
                    ${isDisabled ? 'disabled' : ''}>
              <div class="card-image-wrapper">
                <img src="${card.icon}" alt="${escapeHtml(card.label)}" class="card-img" />
              </div>
              <span>${escapeHtml(card.label)}</span>
              ${isRevealed && role ? `<i>${role === 'assassin' ? 'ASSASSIN' : role.toUpperCase()}</i>` : ''}
            </button>`;
        }).join('')}
      </div>`;
  }

  function showLobby() {
    app.innerHTML = `<main class="shell lobby"><button class="back" id="home">← Retour</button><p class="eyebrow">CODENAMES IMAGE</p><h1>Rejoindre la table</h1><p class="lead">Créez un salon ou entrez le code partagé par votre équipe.</p><section class="lobby-grid"><form id="create-form"><h2>Créer un salon</h2><input id="create-name" placeholder="Votre pseudo" maxlength="20" required><button class="primary">Créer le salon</button></form><form id="join-form"><h2>Rejoindre un salon</h2><input id="join-name" placeholder="Votre pseudo" maxlength="20" required><input id="join-code" placeholder="CODE DU SALON" maxlength="4" required><button class="secondary">Rejoindre</button></form></section><p id="error" class="error"></p></main>`;
    document.querySelector('#home').onclick = render;
    document.querySelector('#create-form').onsubmit = event => { event.preventDefault(); emit('room:create', { name: document.querySelector('#create-name').value }); };
    document.querySelector('#join-form').onsubmit = event => { event.preventDefault(); emit('room:join', { name: document.querySelector('#join-name').value, code: document.querySelector('#join-code').value }); };
  }

  function bindGameEvents(me) {
    document.querySelector('#leave')?.addEventListener('click', () => { 
      if (room) emit('room:leave', room.code);
      room = null; 
      render(); 
    });

    // Gestion de l'affichage de la modale des règles
    const rulesBtn = document.querySelector('#toggle-rules');
    const rulesModal = document.querySelector('#rules-modal');
    const closeRulesBtn = document.querySelector('#close-rules');

    rulesBtn?.addEventListener('click', () => {
      rulesModal?.classList.remove('hidden');
    });

    closeRulesBtn?.addEventListener('click', () => {
      rulesModal?.classList.add('hidden');
    });

    // Fermer en cliquant sur le fond noir
    rulesModal?.addEventListener('click', (e) => {
      if (e.target === rulesModal) {
        rulesModal.classList.add('hidden');
      }
    });

    // Ouvrir / Fermer le menu sonore
    const audioBtn = document.querySelector('#toggle-audio-menu');
    const audioMenu = document.querySelector('#audio-menu');
    
    audioBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      audioMenu?.classList.toggle('hidden');
    });

    // Fermer le menu si on clique ailleurs sur la page
    document.addEventListener('click', () => {
      audioMenu?.classList.add('hidden');
    });

    audioMenu?.addEventListener('click', (e) => {
      e.stopPropagation(); // Évite la fermeture au clic à l'intérieur du menu
    });

    // Écouteurs pour les sliders de volume
    document.querySelector('#music-slider')?.addEventListener('input', (e) => {
      window.gameAudio.setMusicVolume(e.target.value);
    });

    document.querySelector('#sfx-slider')?.addEventListener('input', (e) => {
      window.gameAudio.setSfxVolume(e.target.value);
    });

    document.querySelector('#toggle-music')?.addEventListener('click', () => {
      window.gameAudio.toggleMusic();
    });

    document.querySelector('#start')?.addEventListener('click', () => emit('game:start', room.code));
    document.querySelector('#restart')?.addEventListener('click', () => emit('game:start', room.code));
    document.querySelector('#randomize-teams')?.addEventListener('click', () => emit('teams:randomize', room.code));

    document.querySelectorAll('.btn-team').forEach(btn => {
      btn.addEventListener('click', () => {
        emit('player:selectTeam', {
          code: room.code,
          team: btn.dataset.team,
          role: btn.dataset.role
        });
      });
    });

    document.querySelectorAll('[data-card]').forEach(card => {
      card.addEventListener('click', () => {
        window.gameAudio.playCardClick();
        emit('game:reveal', { code: room.code, cardId: card.dataset.card });
      });
    });

    document.querySelector('#clue-form')?.addEventListener('submit', event => {
      event.preventDefault();
      emit('game:clue', {
        code: room.code,
        clue: document.querySelector('#clue').value,
        count: Number(document.querySelector('#count').value)
      });
    });

    document.querySelector('#pass-btn')?.addEventListener('click', () => {
      emit('game:pass', room.code);
    });

    document.querySelectorAll('[data-card]').forEach(card => {
      card.addEventListener('click', () => {
        emit('game:reveal', { code: room.code, cardId: card.dataset.card });
      });
    });
  }

  window.gameSocket.on('room:update', updatedRoom => {
    room = updatedRoom;
    isHost = room.hostId === window.gameSocket.id();
    render();
  });

  window.gameSocket.on('room:error', message => {
    const error = document.querySelector('#error');
    if (error) error.textContent = message;
  });

  render();
})();