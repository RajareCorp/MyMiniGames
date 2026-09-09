// router.js
(() => {
  const app = document.querySelector('#app');
  let room = null;
  let currentGameModule = null;

  const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
  const emit = (event, payload) => window.gameSocket.emit(event, payload);

  // Écoute globale des mises à jour du salon
  window.gameSocket.on('room:update', updatedRoom => {
    room = updatedRoom;
    render();
  });

  window.gameSocket.on('room:error', message => {
    const error = document.querySelector('#error');
    if (error) error.textContent = message;
  });

  function render() {
    // 1. Si pas de salon : Page d'accueil (Sélection du jeu)
    if (!room) {
      currentGameModule = null;
      app.innerHTML = `
        <main class="shell home">
          <p class="eyebrow">MY MINI GAMES</p>
          <h1>Des images. Des associations.<br><em>Une équipe.</em></h1>
          <p class="lead">Choisissez un jeu et invitez vos proches autour d'une partie instantanée.</p>
          <section class="menu-grid">
            <article class="game-tile active" data-game="codenames">
              <span class="tile-icon">◈</span>
              <div>
                <h2>Codenames Image</h2>
                <p>Faites deviner les bons symboles sans tomber sur l'assassin.</p>
              </div>
              <button class="choose-game" data-game="codenames">Jouer</button>
            </article>
            <article class="game-tile" data-game="battleship">
              <span class="tile-icon">⚓</span>
              <div>
                <h2>Bataille Navale</h2>
                <p>Coulez la flotte adverse avant qu'elle ne détruise la vôtre.</p>
              </div>
              <button class="choose-game" data-game="battleship">Jouer</button>
            </article>
          </section>
        </main>`;

      document.querySelectorAll('.choose-game').forEach(btn => {
        btn.onclick = () => showLobby(btn.dataset.game);
      });
      return;
    }

    // 2. Si on est dans un salon, on charge dynamiquement le module de jeu correspondant
    const gameType = room.gameType || 'codenames';

    if (!currentGameModule) {
      if (gameType === 'codenames' && window.CodenamesGame) {
        currentGameModule = window.CodenamesGame;
      } else if (gameType === 'battleship' && window.BattleshipGame) {
        currentGameModule = window.BattleshipGame;
      }
    }

    if (currentGameModule && typeof currentGameModule.render === 'function') {
      currentGameModule.render(room, app);
    } else {
      app.innerHTML = `<main class="shell game"><p>Chargement du jeu (${gameType})...</p></main>`;
    }
  }

  function showLobby(gameType) {
    const savedName = localStorage.getItem('codenames_username') || '';

    app.innerHTML = `
      <main class="shell lobby">
        <button class="back" id="home">← Retour</button>
        <p class="eyebrow">${gameType.toUpperCase()}</p>
        <h1>Rejoindre la table</h1>
        <p class="lead">Créez un salon ou entrez le code partagé par vos proches.</p>
        <section class="lobby-grid">
          <form id="create-form">
            <h2>Créer un salon</h2>
            <input id="create-name" placeholder="Votre pseudo" maxlength="20" value="${escapeHtml(savedName)}" required>
            <button class="primary">Créer le salon</button>
          </form>
          <form id="join-form">
            <h2>Rejoindre un salon</h2>
            <input id="join-name" placeholder="Votre pseudo" maxlength="20" value="${escapeHtml(savedName)}" required>
            <input id="join-code" placeholder="CODE DU SALON" maxlength="4" required>
            <button class="secondary">Rejoindre</button>
          </form>
        </section>
        <p id="error" class="error"></p>
      </main>`;

    document.querySelector('#home').onclick = () => { room = null; render(); };

    document.querySelector('#create-form').onsubmit = event => {
      event.preventDefault();
      const name = document.querySelector('#create-name').value.trim();
      if (name) localStorage.setItem('codenames_username', name);
      emit('room:create', { name, gameType });
    };

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