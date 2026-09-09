# 🎮 MyMiniGames

Plateforme de mini-jeux multijoueurs en temps réel (incluant une version de *Codenames Image*), développée avec Node.js, Express et Socket.io.

## 📁 Structure du projet

- `public/` : Interface front-end (HTML, CSS, JS client, audio, assets)
- `server/` : Logique serveur, gestion des rooms et des règles de jeux (Socket.io)

## 🚀 Démarrage rapide (avec Docker)

Le projet est entièrement conteneurisé. Assurez-vous d'avoir installé Docker et Docker Compose.

1. Clonez le dépôt et placez-vous dedans :
   ```bash
   git clone <url-de-votre-repo>
   cd MyMiniGames

   docker compose up -d --build
    ```

2. Accédez au jeu dans votre navigateur :
   ```bash
   http://localhost:4000
    ```

## 🛠️ Développement local (sans Docker)

Si vous souhaitez modifier le code en direct avec rechargement automatique :

1. Installez les dépendances :
   ```bash
    npm install
    ```

2. Lancez le serveur en mode développement ::
   ```bash
   npm run dev
    ```