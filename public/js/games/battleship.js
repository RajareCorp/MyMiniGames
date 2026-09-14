// public/js/games/battleship.js
window.BattleshipGame = (() => {
  const BOAT_SIZES = [5, 4, 3, 3, 2];
  const BOAT_NAMES = ['Porte-avions', 'Croiseur', 'Contre-torpilleur', 'Sous-marin', 'Torpilleur'];
  let currentBoatIndex = 0;
  let placedBoats = [];
  let isVertical = false;
  let savedAppContainer = null; // Mémorise le conteneur d'origine

  // Sert à détecter les changements de salon / de partie (revanche) pour
  // réinitialiser le placement local, qui sinon restait figé sur l'ancienne
  // flotte lors d'une nouvelle partie dans le même salon.
  let lastRoomCode = null;
  let lastPhase = null;

  function resetPlacementState() {
    placedBoats = [];
    currentBoatIndex = 0;
    isVertical = false;
  }

  // Système de sons légers via Web Audio API
  const soundSystem = (() => {
    let audioCtx = null;
    function getContext() {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      return audioCtx;
    }
    return {
      play(type) {
        try {
          const ctx = getContext();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);

          if (type === 'click') {
            osc.frequency.setValueAtTime(400, ctx.currentTime);
            gain.gain.setValueAtTime(0.05, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
            osc.start();
            osc.stop(ctx.currentTime + 0.05);
          }
        } catch (e) {}
      }
    };
  })();

  const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
  const emit = (event, payload) => window.gameSocket.emit(event, payload);

  function render(room, appContainer) {
    if (appContainer) savedAppContainer = appContainer;
    const targetContainer = savedAppContainer || appContainer;

    const state = room.state;
    const isHost = room.hostId === window.gameSocket.id();
    const me = room.players.find(p => p.id === window.gameSocket.id());

    // Nouveau salon : on repart de zéro.
    if (room.code !== lastRoomCode) {
      lastRoomCode = room.code;
      lastPhase = null;
      resetPlacementState();
    }

    // Revanche dans le même salon : le serveur repasse en phase "placing"
    // après une fin de partie ("ended") ou un lancement initial. On ne
    // réinitialise que lors de cette transition, pas à chaque rendu, pour
    // ne pas effacer un placement en cours.
    if (state && state.phase === 'placing' && !state.isReady && lastPhase !== 'placing') {
      resetPlacementState();
    }
    lastPhase = state ? state.phase : null;

    if (!document.querySelector('.shell.game')) {
      targetContainer.innerHTML = getGameLayout(room);
      bindStaticEvents(room);
    }

    updateDynamicViews(room, state, me, isHost);
  }

  function getGameLayout(room) {
    return `
      <main class="shell game">
        <header class="topbar">
          <button class="back" id="leave">← Menu</button>
          <div class="brand">BATAILLE <span>NAVALE</span></div>
          <div class="room-code">SALON <strong id="topbar-code"></strong></div>
        </header>

        <section class="game-layout">
          <aside class="sidebar">
            <p class="eyebrow" id="sidebar-code"></p>
            <h1>Participants</h1>
            <div id="teams-container" class="teams-container"></div>
            <div id="host-actions-container"></div>
          </aside>

          <section id="board-area" class="board-area battleship-board"></section>
        </section>
      </main>`;
  }

  function updateDynamicViews(room, state, me, isHost) {
    const codeEl = document.querySelector('#topbar-code');
    const sidebarCodeEl = document.querySelector('#sidebar-code');
    if (codeEl) codeEl.textContent = room.code;
    if (sidebarCodeEl) sidebarCodeEl.textContent = `SALON ${room.code}`;

    const teamsContainer = document.querySelector('#teams-container');
    if (teamsContainer) {
      teamsContainer.innerHTML = `
        <div class="team-box">
          <h3>Joueurs (${room.players.length}/2)</h3>
          ${room.players.map(p => {
            let statusHtml = '';
            if (state && state.phase === 'placing') {
              const isReady = (p.id === me?.id && state.isReady) || (p.id !== me?.id && state.opponentReady);
              statusHtml = `<span class="status-badge ${isReady ? 'ready' : 'waiting'}">${isReady ? 'Prêt ✓' : 'En placement'}</span>`;
            }
            return `
              <div class="player-tag" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span>${escapeHtml(p.name)}</span>
                ${statusHtml}
              </div>`;
          }).join('')}
        </div>`;
    }

    const hostContainer = document.querySelector('#host-actions-container');
    if (hostContainer) {
      if (isHost && (!state || state.phase === 'ended')) {
        hostContainer.innerHTML = `<button class="primary" id="start">Lancer la Bataille</button>`;
        document.querySelector('#start')?.addEventListener('click', () => {
          soundSystem.play('click');
          emit('game:start', room.code);
        });
      } else {
        hostContainer.innerHTML = '';
      }
    }

    const boardArea = document.querySelector('#board-area');
    if (boardArea) {
      if (state) {
        boardArea.innerHTML = renderBoard(state, me);
        bindBoardEvents(room, state);
      } else {
        boardArea.innerHTML = `<div class="waiting"><span class="pulse">⚓</span><h2>En attente du lancement</h2><p>Le capitaine peut lancer la partie.</p></div>`;
      }
    }
  }

  function renderFleetChecklist() {
    return `
      <ul class="fleet-checklist">
        ${BOAT_SIZES.map((size, i) => {
          const done = i < currentBoatIndex;
          const active = i === currentBoatIndex;
          return `<li class="${done ? 'done' : ''} ${active ? 'active' : ''}">
            <span class="fleet-dot">${done ? '✓' : size}</span> ${BOAT_NAMES[i]} (${size})
          </li>`;
        }).join('')}
      </ul>`;
  }

  function renderBoard(state, me) {
    if (state.phase === 'placing') {
      const isReady = state.isReady;
      const currentSize = BOAT_SIZES[currentBoatIndex];

      return `
        <div class="board-head">
          <h2>Placez votre flotte</h2>
          <p>${isReady ? "Flotte validée ! En attente de l'adversaire..." : `Placez votre navire de <strong>${currentSize} cases</strong>`}</p>
        </div>
        ${!isReady ? renderFleetChecklist() : ''}
        ${!isReady ? `
          <div class="placement-controls">
            <button class="secondary" id="toggle-orientation">Rotation : ${isVertical ? 'Vertical ↕' : 'Horizontal ↔'}</button>
            ${placedBoats.length > 0 ? '<button class="secondary" id="reset-boats">Recommencer</button>' : ''}
          </div>
        ` : ''}
        <div class="battleship-grid-container">
          <div class="grid-box">
            <h3>Votre Grille</h3>
            <div class="grid" id="placement-grid">
              ${renderGridCells(10, (x, y) => {
                for (const b of placedBoats) {
                  for (let i = 0; i < b.size; i++) {
                    const bx = b.vertical ? b.x : b.x + i;
                    const by = b.vertical ? b.y + i : b.y;
                    if (bx === x && by === y) return 'ship';
                  }
                }
                return '';
              })}
            </div>
          </div>
        </div>
        ${!isReady && currentBoatIndex >= BOAT_SIZES.length ? `
          <button class="primary" id="validate-ships">Valider ma flotte définitive</button>
        ` : ''}
      `;
    }

    if (state.phase === 'playing' || state.phase === 'ended') {
      const isMyTurn = state.turn === window.gameSocket.id();
      const iWon = state.winner === window.gameSocket.id();
      const fleet = state.fleet || { myAlive: 0, myTotal: 0, opponentAlive: 0, opponentTotal: 0 };
      const mySunk = new Set(state.mySunkShipIds || []);
      const opponentSunkCells = state.opponentSunkCells || [];

      let headline;
      if (state.phase === 'ended') {
        headline = iWon ? 'Victoire ! 🏆' : 'Défaite... 💀';
        if (state.forfeited) headline += iWon ? ' (adversaire déconnecté)' : '';
      } else {
        headline = isMyTurn ? 'À vous de tirer ! 🎯' : "Tour de l'adversaire... ⏳";
      }

      return `
        <div class="board-head">
          <h2 class="${isMyTurn && state.phase === 'playing' ? 'my-turn' : ''}">${headline}</h2>
          <div class="fleet-summary">
            <span>Votre flotte : ${fleet.myAlive}/${fleet.myTotal} 🚢</span>
            <span>Flotte adverse : ${fleet.opponentAlive}/${fleet.opponentTotal} 🚢</span>
          </div>
        </div>
        <div class="battleship-duo-grids">
          <div class="grid-box">
            <h3>Vos Navires</h3>
            <div class="grid">
              ${renderGridCells(10, (x, y) => {
                const shipCell = state.myShips.find(s => s.x === x && s.y === y);
                const gotHit = state.opponentShots.some(s => s.x === x && s.y === y && s.hit);
                const gotMiss = state.opponentShots.some(s => s.x === x && s.y === y && !s.hit);
                if (gotHit && shipCell && mySunk.has(shipCell.shipId)) return 'sunk';
                if (gotHit) return 'hit';
                if (gotMiss) return 'miss';
                if (shipCell) return 'ship';
                return '';
              })}
            </div>
          </div>
          <div class="grid-box">
            <h3>Tirs Ennemis</h3>
            <div class="grid" id="target-grid">
              ${renderGridCells(10, (x, y) => {
                const isSunkCell = opponentSunkCells.some(c => c.x === x && c.y === y);
                if (isSunkCell) return 'sunk';
                const shot = state.myShots.find(s => s.x === x && s.y === y);
                if (shot) return shot.hit ? 'hit' : 'miss';
                return '';
              })}
            </div>
          </div>
        </div>
      `;
    }
  }

  function renderGridCells(size, classNameFn) {
    let html = '';
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const cls = classNameFn(x, y);
        html += `<div class="cell ${cls}" data-x="${x}" data-y="${y}"></div>`;
      }
    }
    return html;
  }

  function checkCollision(x, y, size, vertical) {
    if (vertical && y + size > 10) return true;
    if (!vertical && x + size > 10) return true;

    for (let i = 0; i < size; i++) {
      const nx = vertical ? x : x + i;
      const ny = vertical ? y + i : y;

      const overlap = placedBoats.some(b => {
        for (let j = 0; j < b.size; j++) {
          const bx = b.vertical ? b.x : b.x + j;
          const by = b.vertical ? b.y + j : b.y;
          if (bx === nx && by === ny) return true;
        }
        return false;
      });
      if (overlap) return true;
    }
    return false;
  }

  function bindBoardEvents(room, state) {
    if (state.phase === 'placing' && !state.isReady) {
      document.querySelector('#toggle-orientation')?.addEventListener('click', () => {
        soundSystem.play('click');
        isVertical = !isVertical;
        updateDynamicViews(room, state, room.players.find(p => p.id === window.gameSocket.id()), room.hostId === window.gameSocket.id());
      });

      document.querySelector('#reset-boats')?.addEventListener('click', () => {
        soundSystem.play('click');
        placedBoats = [];
        currentBoatIndex = 0;
        updateDynamicViews(room, state, room.players.find(p => p.id === window.gameSocket.id()), room.hostId === window.gameSocket.id());
      });

      const gridCells = document.querySelectorAll('#placement-grid .cell');
      
      gridCells.forEach(cell => {
        cell.onmouseenter = () => {
          if (currentBoatIndex >= BOAT_SIZES.length) return;
          const x = Number(cell.dataset.x);
          const y = Number(cell.dataset.y);
          const size = BOAT_SIZES[currentBoatIndex];
          const hasCollision = checkCollision(x, y, size, isVertical);

          gridCells.forEach(c => {
            const cx = Number(c.dataset.x);
            const cy = Number(c.dataset.y);
            
            for (let i = 0; i < size; i++) {
              const px = isVertical ? x : x + i;
              const py = isVertical ? y + i : y;
              if (cx === px && cy === py) {
                c.classList.add(hasCollision ? 'preview-invalid' : 'preview');
              }
            }
          });
        };

        cell.onmouseleave = () => {
          gridCells.forEach(c => c.classList.remove('preview', 'preview-invalid'));
        };

        cell.onclick = () => {
          if (currentBoatIndex >= BOAT_SIZES.length) return;
          const x = Number(cell.dataset.x);
          const y = Number(cell.dataset.y);
          const size = BOAT_SIZES[currentBoatIndex];

          if (checkCollision(x, y, size, isVertical)) return;

          soundSystem.play('click');
          placedBoats.push({ size, x, y, vertical: isVertical });
          currentBoatIndex++;
          updateDynamicViews(room, state, room.players.find(p => p.id === window.gameSocket.id()), room.hostId === window.gameSocket.id());
        };
      });

      document.querySelector('#validate-ships')?.addEventListener('click', () => {
        soundSystem.play('click');
        emit('battleship:place', { code: room.code, ships: placedBoats });
      });
    }

    if (state.phase === 'playing' && state.turn === window.gameSocket.id()) {
      document.querySelectorAll('#target-grid .cell').forEach(cell => {
        cell.onclick = () => {
          const x = Number(cell.dataset.x);
          const y = Number(cell.dataset.y);
          emit('battleship:fire', { code: room.code, x, y });
        };
      });
    }
  }

  function bindStaticEvents(room) {
    document.querySelector('#leave')?.addEventListener('click', () => {
      const state = room?.state;
      const gameInProgress = state && (state.phase === 'placing' || state.phase === 'playing');
      if (gameInProgress && !window.confirm('Quitter maintenant abandonnera la partie en cours. Continuer ?')) {
        return;
      }
      soundSystem.play('click');
      if (room) emit('room:leave', room.code);
    });
  }

  return { render };
})();