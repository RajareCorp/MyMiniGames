FROM node:20-alpine

WORKDIR /app

# Copie d'abord les fichiers de dépendances pour profiter du cache Docker
COPY package*.json ./

RUN npm ci --only=production

# Copie du reste du code source
COPY . .

# Utilisation de l'utilisateur non-root intégré à l'image Node
USER node

EXPOSE 4000

CMD ["node", "server/server.js"]