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

    if (newState) {
      const currentRevealed = newState.cards.filter(c => c.revealed).length;
      if (oldState && currentRevealed > lastRevealedCount) {
        const newlyRevealedCard = newState.cards.find(c => c.revealed && !oldState.cards.find(oc => oc.id === c.id)?.revealed);
        
        if (newlyRevealedCard) {
          if (newlyRevealedCard.role === 'assassin') {
            window.gameAudio.playAssassin();
          } else if (newlyRevealedCard.role === oldState.turn) {
            window.gameAudio.playRevealCorrect();
          } else {
            window.gameAudio.playRevealWrong();
          }
        }
      }
      lastRevealedCount = currentRevealed;

      if (oldState && !oldState.clue && newState.clue) {
        window.gameAudio.playClue();
      }

      if (oldState && oldState.phase !== 'ended' && newState.phase === 'ended') {
        window.gameAudio.playWin();
      }
    } else {
      lastRevealedCount = 0;
    }

    render();
  });

  window.gameSocket.on('chat:new', msg => {
    if (!room) return;
    room.messages = room.messages || [];
    room.messages.push(msg);
    
    window.gameAudio.playChatMessage();

    const chatContainer = document.querySelector('#chat-messages');
    if (chatContainer) {
      const msgEl = document.createElement('div');
      msgEl.className = `chat-msg ${msg.team || 'neutral'}`;
      msgEl.innerHTML = `<strong>${escapeHtml(msg.sender)}:</strong> ${escapeHtml(msg.text)} <small>${msg.time}</small>`;
      chatContainer.appendChild(msgEl);
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  });

  window.gameSocket.on('room:error', message => {
    const error = document.querySelector('#error');
    if (error) error.textContent = message;
  });

  function render() {
    if (!room) {
      app.innerHTML = `<main class="shell home"><p class="eyebrow">MY MINI GAMES</p><h1>Des images. Des associations.<br><em>Une équipe.</em></h1><p class="lead">Choisissez un jeu et invitez vos proches autour d'une partie instantanée.</p><section class="menu-grid"><article class="game-tile active"><span class="tile-icon">◈</span><div><h2>Codenames Image</h2><p>Faites deviner les bons symboles sans tomber sur l'assassin.</p></div><button id="choose-game">Jouer</button></article><article class="game-tile locked"><span class="tile-icon">✦</span><div><h2>Bientôt disponible</h2><p>De nouveaux mini-jeux arrivent dans la collection.</p></div><span class="tag">EN DEVELOPPEMENT</span></article></section></main>`;
      document.querySelector('#choose-game').onclick = showLobby;
      return;
    }

    // 1. Installe l'ossature HTML une seule fois si elle n'est pas déjà dans le DOM
    if (!document.querySelector('.shell.game')) {
      initGameLayout();
      bindStaticEvents();
    }

    // 2. Met à jour uniquement les zones dynamiques (SANS toucher aux champs de texte en cours de frappe)
    updateDynamicViews();
  }

  function initGameLayout() {
    app.innerHTML = `
      <main class="shell game">
        <header class="topbar">
          <button class="back" id="leave">← Menu</button>
          <div class="brand">CODENAMES <span>IMAGE</span></div>
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
          <div class="room-code">SALON <strong id="topbar-code"></strong></div>
        </header>

        <section class="game-layout">
          <aside class="sidebar">
            <p class="eyebrow" id="sidebar-code"></p>
            <h1>Sélecteur d'équipe</h1>
            
            <div id="teams-container" class="teams-container"></div>

            <!-- CHAT EN DIRECT (Conservé tel quel entre les rendus) -->
            <div class="chat-box">
              <h3>Tchat d'équipe</h3>
              <div id="chat-messages" class="chat-messages"></div>
              <form id="chat-form" class="chat-form">
                <input id="chat-input" placeholder="Écrire..." maxlength="120" autocomplete="off" required>
                <button type="submit" class="secondary chat-submit-btn" title="Envoyer">➔</button>
              </form>
            </div>

            <!-- BOUTONS HÔTE & FORMULAIRE INDICE -->
            <div id="host-actions-container"></div>
            <div id="clue-form-container"></div>
          </aside>

          <!-- PLATEAU DE JEU -->
          <section id="board-area" class="board-area"></section>
        </section>

        <!-- MODALE DES RÈGLES -->
        <div id="rules-modal" class="modal-overlay hidden">
          <div class="modal-content">
            <div class="modal-header">
              <h2>📜 Règles du jeu</h2>
              <button id="close-rules" class="close-btn">&times;</button>
            </div>
            <div class="modal-body">
              <p><strong>But du jeu :</strong> Faire deviner à votre équipe toutes vos cartes avant l'équipe adverse, sans jamais cliquer sur l'Assassin.</p>
              <h3>Pings de réflexion (Agents uniquement)</h3>
              <p>Faites un <strong>clic droit</strong> sur une carte pour poser ou retirer un marqueur visuel visible par vos coéquipiers et les Maîtres-Espions.</p>
            </div>
          </div>
        </div>
      </main>`;
  }

  function updateDynamicViews() {
    const state = room.state;
    const me = room.players.find(p => p.id === window.gameSocket.id());
    const displayMode = room.settings?.displayMode || 'both';
    const isGameOver = state && state.phase === 'ended';
    const redPlayers = room.players.filter(p => p.team === 'red');
    const bluePlayers = room.players.filter(p => p.team === 'blue');

    // Mise à jour des codes du salon
    document.querySelector('#topbar-code').textContent = room.code;
    document.querySelector('#sidebar-code').textContent = `SALON ${room.code}`;

    // 1. Équipes
    document.querySelector('#teams-container').innerHTML = `
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
      </div>`;

    document.querySelectorAll('.btn-team').forEach(btn => {
      btn.onclick = () => {
        emit('player:selectTeam', { code: room.code, team: btn.dataset.team, role: btn.dataset.role });
      };
    });

    // 2. Actions Hôte
    const hostContainer = document.querySelector('#host-actions-container');
    if (isHost) {
      hostContainer.innerHTML = `
        <div class="host-actions">
          ${(!state || isGameOver) ? `
            <div class="mode-selector">
              <label for="display-mode-select">Mode d'affichage :</label>
              <select id="display-mode-select">
                <option value="both" ${displayMode === 'both' ? 'selected' : ''}>Images + Mots</option>
                <option value="images" ${displayMode === 'images' ? 'selected' : ''}>Images Seules</option>
                <option value="words" ${displayMode === 'words' ? 'selected' : ''}>Mots Seuls</option>
              </select>
            </div>
            <button class="secondary" id="randomize-teams">🎲 Équipes Aléatoires</button>
          ` : ''}
          ${!state ? '<button class="primary" id="start">Lancer la partie</button>' : ''}
          ${isGameOver ? '<button class="primary" id="restart">🔄 Rejouer une partie</button>' : ''}
        </div>`;

      document.querySelector('#display-mode-select')?.addEventListener('change', e => {
        emit('settings:update', { code: room.code, displayMode: e.target.value });
      });
      document.querySelector('#randomize-teams')?.addEventListener('click', () => emit('teams:randomize', room.code));
      document.querySelector('#start')?.addEventListener('click', () => emit('game:start', room.code));
      document.querySelector('#restart')?.addEventListener('click', () => emit('game:start', room.code));
    } else {
      hostContainer.innerHTML = '';
    }

    // 3. Formulaire Indice (Crée uniquement s'il n'existe pas encore)
    const isMyTurn = state && me && me.team === state.turn;
    const canGiveClue = state && isMyTurn && me.role === 'spymaster' && state.phase === 'playing' && !state.clue;
    const clueContainer = document.querySelector('#clue-form-container');

    if (canGiveClue) {
      if (!document.querySelector('#clue-form')) {
        clueContainer.innerHTML = `
          <form id="clue-form" class="clue-form">
            <label>Votre indice</label>
            <input id="clue" maxlength="40" placeholder="Ex : Voyage" required>
            <label>Nombre de cartes</label>
            <input id="count" type="number" min="1" max="8" value="2" required>
            <button class="primary">Donner l'indice</button>
          </form>`;

        document.querySelector('#clue-form').onsubmit = event => {
          event.preventDefault();
          emit('game:clue', {
            code: room.code,
            clue: document.querySelector('#clue').value,
            count: Number(document.querySelector('#count').value)
          });
        };
      }
    } else {
      clueContainer.innerHTML = '';
    }

    // 4. Plateau de jeu
    const boardArea = document.querySelector('#board-area');
    if (state) {
      boardArea.innerHTML = renderBoard(state, me, displayMode);
      bindBoardEvents(me);
    } else {
      boardArea.innerHTML = `<div class="waiting"><span class="pulse">◈</span><h2>En attente du lancement</h2><p>Le maître du salon peut démarrer la partie.</p></div>`;
    }
  }

  function renderBoard(state, me, displayMode) {
    const turnName = state.turn === 'red' ? 'Équipe Rouge' : 'Équipe Bleue';
    const isMyTurn = me && me.team === state.turn;
    const canGuess = isMyTurn && me.role === 'operative' && state.clue && state.phase === 'playing';
    const isSpymaster = me && me.role === 'spymaster';
    const myTeam = me ? me.team : null;

    const allPings = room.pings || [];
    const visiblePings = allPings.filter(p => isSpymaster || p.team === myTeam);

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
          <small>${state.guessesLeft - 1} choix restants + 1 Bonus</small>
          ${canGuess ? '<button id="pass-btn" class="secondary pass-btn">Finir le tour</button>' : ''}
        </div>
      ` : '<div class="clue muted">En attente de l\'indice du Maître-Espion...</div>'}

      <div class="cards">
        ${state.cards.map(card => {
          const isRevealed = card.revealed;
          const role = card.role || '';
          const isDisabled = !canGuess || isRevealed || state.phase === 'ended';
          const previewClass = (!isRevealed && (isSpymaster || state.phase === 'ended')) ? `spymaster-preview ${role}` : '';
          const cardPings = visiblePings.filter(p => p.cardId === card.id);

          return `
            <button class="card ${isRevealed ? `revealed ${role}` : ''} ${previewClass}" 
                    data-card="${card.id}" 
                    ${isDisabled ? 'disabled' : ''}>
              
              <div class="card-ping-container">
                ${cardPings.map(p => `<span class="ping-badge ${p.team}">📍 ${escapeHtml(p.playerName)}</span>`).join('')}
              </div>

              ${(displayMode === 'both' || displayMode === 'images') && card.icon ? `
                <div class="card-image-wrapper">
                  <img src="${card.icon}" alt="${escapeHtml(card.label)}" class="card-img" />
                </div>
              ` : ''}

              ${(displayMode === 'both' || displayMode === 'words') ? `
                <span>${escapeHtml(card.label)}</span>
              ` : ''}

              ${isRevealed && role ? `<i>${role === 'assassin' ? 'ASSASSIN' : role.toUpperCase()}</i>` : ''}
            </button>`;
        }).join('')}
      </div>`;
  }

  function bindBoardEvents(me) {
    document.querySelectorAll('[data-card]').forEach(card => {
      card.onclick = () => {
        if (!card.hasAttribute('disabled')) {
          window.gameAudio.playCardClick();
          emit('game:reveal', { code: room.code, cardId: card.dataset.card });
        }
      };

      card.oncontextmenu = e => {
        e.preventDefault();
        if (me && me.role === 'operative') {
          window.gameAudio.playPingToggle();
          emit('card:ping', { code: room.code, cardId: card.dataset.card });
        }
      };
    });

    const passBtn = document.querySelector('#pass-btn');
    if (passBtn) {
      passBtn.onclick = () => {
        window.gameAudio.playPassTurn();
        emit('game:pass', room.code);
      };
    }
  }

  function bindStaticEvents() {
    document.querySelector('#leave')?.addEventListener('click', () => { 
      if (room) emit('room:leave', room.code);
      room = null; 
      render(); 
    });

    const rulesBtn = document.querySelector('#toggle-rules');
    const rulesModal = document.querySelector('#rules-modal');
    const closeRulesBtn = document.querySelector('#close-rules');

    rulesBtn?.addEventListener('click', () => rulesModal?.classList.remove('hidden'));
    closeRulesBtn?.addEventListener('click', () => rulesModal?.classList.add('hidden'));
    rulesModal?.addEventListener('click', e => { if (e.target === rulesModal) rulesModal.classList.add('hidden'); });

    const audioBtn = document.querySelector('#toggle-audio-menu');
    const audioMenu = document.querySelector('#audio-menu');
    
    audioBtn?.addEventListener('click', e => {
      e.stopPropagation();
      audioMenu?.classList.toggle('hidden');
    });

    document.addEventListener('click', () => audioMenu?.classList.add('hidden'));
    audioMenu?.addEventListener('click', e => e.stopPropagation());

    document.querySelector('#music-slider')?.addEventListener('input', e => window.gameAudio.setMusicVolume(e.target.value));
    document.querySelector('#sfx-slider')?.addEventListener('input', e => window.gameAudio.setSfxVolume(e.target.value));

    document.querySelector('#chat-form')?.addEventListener('submit', e => {
      e.preventDefault();
      const input = document.querySelector('#chat-input');
      if (input && input.value.trim()) {
        emit('chat:message', { code: room.code, message: input.value });
        input.value = '';
      }
    });
  }

  function showLobby() {
    // Récupération du pseudo enregistré (s'il existe)
    const savedName = localStorage.getItem('codenames_username') || '';

    app.innerHTML = `<main class="shell lobby"><button class="back" id="home">← Retour</button><p class="eyebrow">CODENAMES IMAGE</p><h1>Rejoindre la table</h1><p class="lead">Créez un salon ou entrez le code partagé par votre équipe.</p><section class="lobby-grid"><form id="create-form"><h2>Créer un salon</h2><input id="create-name" placeholder="Votre pseudo" maxlength="20" value="${escapeHtml(savedName)}" required><button class="primary">Créer le salon</button></form><form id="join-form"><h2>Rejoindre un salon</h2><input id="join-name" placeholder="Votre pseudo" maxlength="20" value="${escapeHtml(savedName)}" required><input id="join-code" placeholder="CODE DU SALON" maxlength="4" required><button class="secondary">Rejoindre</button></form></section><p id="error" class="error"></p></main>`;
    
    document.querySelector('#home').onclick = render;

    // Sauvegarde du pseudo lors de la création
    document.querySelector('#create-form').onsubmit = event => { 
      event.preventDefault(); 
      const name = document.querySelector('#create-name').value.trim();
      if (name) localStorage.setItem('codenames_username', name);
      emit('room:create', { name }); 
    };

    // Sauvegarde du pseudo lors de la jonction
    document.querySelector('#join-form').onsubmit = event => { 
      event.preventDefault(); 
      const name = document.querySelector('#join-name').value.trim();
      const code = document.querySelector('#join-code').value.trim();
      if (name) localStorage.setItem('codenames_username', name);
      emit('room:join', { name, code }); 
    };
  }

  render();
})();