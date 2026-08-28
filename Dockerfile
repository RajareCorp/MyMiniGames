# Utilisation d'une image Node.js légère
FROM node:20-alpine

# Création du répertoire de travail
WORKDIR /app

# Copie des fichiers de dépendances
COPY package*.json ./

# Installation des dépendances de production
RUN npm ci --only=production

# Copie du reste des fichiers du projet
COPY . .

# Exposition du port (assurez-vous que votre serveur écoute sur ce port)
EXPOSE 3000

# Commande de démarrage
CMD ["node", "server/server.js"]