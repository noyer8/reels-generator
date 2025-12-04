# Utiliser une image avec Chrome préinstallé pour Remotion
FROM node:20-bullseye

# Installer les dépendances système pour Remotion (Chromium, FFmpeg)
RUN apt-get update && apt-get install -y \
    chromium \
    ffmpeg \
    fonts-liberation \
    fonts-noto-color-emoji \
    libgbm1 \
    libnss3 \
    libatk-bridge2.0-0 \
    libgtk-3-0 \
    libasound2 \
    && rm -rf /var/lib/apt/lists/*

# Définir les variables d'environnement pour Puppeteer/Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Créer le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm install --omit=dev

# Copier le code source
COPY . .

# Exposer le port
EXPOSE 3000

# Démarrer le serveur
CMD ["npm", "start"]
