// public/js/games/codenames.js
window.CodenamesGame = (() => {
  let lastRevealedCount = 0;

  const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
  const emit = (event, payload) => window.gameSocket.emit(event, payload);

  function handleAudioTriggers(state, oldState) {
    if (!state) {
      lastRevealedCount = 0;
      return;
    }

    const currentRevealed = state.cards.filter(c => c.revealed).length;
    if (oldState && currentRevealed > lastRevealedCount) {
      const newlyRevealedCard = state.cards.find(c => c.revealed && !oldState.cards.find(oc => oc.id === c.id)?.revealed);
      
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

    if (oldState && !oldState.clue && state.clue) {
      window.gameAudio.playClue();
    }

    if (oldState && oldState.phase !== 'ended' && state.phase === 'ended') {
      window.gameAudio.playWin();
    }
  }

  function render(room, appContainer) {
    const state = room.state;
    const isHost = room.hostId === window.gameSocket.id();
    const me = room.players.find(p => p.id === window.gameSocket.id());
    const displayMode = room.settings?.displayMode || 'both';
    const isGameOver = state && state.phase === 'ended';
    const redPlayers = room.players.filter(p => p.team === 'red');
    const bluePlayers = room.players.filter(p => p.team === 'blue');

    // 1. Installe l'ossature HTML une seule fois si elle n'est pas déjà dans le DOM
    if (!document.querySelector('.shell.game')) {
      appContainer.innerHTML = getGameLayout(room);
      bindStaticEvents(room);
    }

    // Gestion propre et directe du bouton Quitter/Menu à chaque rendu
    const leaveBtn = document.querySelector('#leave');
    if (leaveBtn) {
      leaveBtn.onclick = () => {
        if (room) emit('room:leave', room.code);
      };
    }

    // 2. Met à jour les zones dynamiques
    updateDynamicViews(room, state, me, isHost, displayMode, isGameOver, redPlayers, bluePlayers);
  }

  function getGameLayout(room) {
    return `
      <main class="shell game">
        <header class="topbar">
          <button class="back" id="leave">← Menu</button>
          <div class="brand">CODENAMES <span>IMAGE</span></div>
          <button id="toggle-rules" class="secondary icon-btn" title="Règles du jeu">❓</button>
          <div class="audio-controls-wrapper">
            <button id="toggle-audio-menu" class="secondary icon-btn" title="Audio">🎵</button>
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

            <div class="chat-box">
              <h3>Tchat</h3>
              <div id="chat-messages" class="chat-messages"></div>
              <form id="chat-form" class="chat-form">
                <input id="chat-input" placeholder="Écrire..." maxlength="120" autocomplete="off" required>
                <button type="submit" class="secondary chat-submit-btn" title="Envoyer">➔</button>
              </form>
            </div>

            <div id="host-actions-container"></div>
            <div id="clue-form-container"></div>
          </aside>

          <section id="board-area" class="board-area"></section>
        </section>

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

  function updateDynamicViews(room, state, me, isHost, displayMode, isGameOver, redPlayers, bluePlayers) {
    document.querySelector('#topbar-code').textContent = room.code;
    document.querySelector('#sidebar-code').textContent = `SALON ${room.code}`;

    // Équipes
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

    // Actions Hôte
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

    // Formulaire Indice
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

    // Plateau de jeu
    const boardArea = document.querySelector('#board-area');
    if (state) {
      boardArea.innerHTML = renderBoard(room, state, me, displayMode);
      bindBoardEvents(room, me);
    } else {
      boardArea.innerHTML = `<div class="waiting"><span class="pulse">◈</span><h2>En attente du lancement</h2><p>Le maître du salon peut démarrer la partie.</p></div>`;
    }
  }

  function renderBoard(room, state, me, displayMode) {
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

  function bindBoardEvents(room, me) {
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

  function bindStaticEvents(room) {
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

    window.gameSocket.off('chat:new');

    // Écouteur chat en direct
    window.gameSocket.on('chat:new', msg => {
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
  }

  return { render };
})();