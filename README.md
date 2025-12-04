# NOYER Reels Generator

API de génération automatique de reels immobiliers pour la plateforme NOYER.

## 🎬 Fonctionnalités

- Génération de vidéos au format Reels (1080x1920)
- 4 scènes de 4 secondes chacune (16s total)
- Effet Ken Burns professionnel sur les photos
- Cartes d'information animées
- Upload automatique vers Cloudflare R2

## 📋 Structure des scènes

1. **Scène 1** : Photo 1 + Type de bien + Région
2. **Scène 2** : Photo 2 + Prix + Surface
3. **Scène 3** : Split horizontal (Photo 3 en haut, Photo 4 en bas)
4. **Scène 4** : Photo 5 + Email + Téléphone

## 🚀 Déploiement sur Render

### 1. Créer le repo GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/TON_USERNAME/noyer-reels-generator.git
git push -u origin main
```

### 2. Déployer sur Render

1. Va sur [render.com](https://render.com) et connecte-toi
2. Clique sur "New" → "Web Service"
3. Connecte ton repo GitHub
4. Render détectera automatiquement le Dockerfile
5. Configure les variables d'environnement (voir ci-dessous)
6. Clique sur "Create Web Service"

### 3. Variables d'environnement

Configure ces variables dans Render :

| Variable | Description |
|----------|-------------|
| `R2_ACCOUNT_ID` | ID de ton compte Cloudflare (ex: `70cfdb518b7975d38272d093878ae79c`) |
| `R2_ACCESS_KEY_ID` | Access Key ID de ton token R2 |
| `R2_SECRET_ACCESS_KEY` | Secret Access Key de ton token R2 |
| `R2_BUCKET_NAME` | Nom du bucket (ex: `noyer`) |
| `R2_PUBLIC_URL` | URL publique du bucket (ex: `https://pub-xxx.r2.dev`) |

## 📡 Utilisation de l'API

### Endpoint

```
POST https://ton-service.onrender.com/generate-reel
```

### Requête depuis n8n

```json
{
  "photos": [
    "https://example.com/photo1.jpg",
    "https://example.com/photo2.jpg",
    "https://example.com/photo3.jpg",
    "https://example.com/photo4.jpg",
    "https://example.com/photo5.jpg"
  ],
  "prix": 450000,
  "surface": 120,
  "region": "Provence-Alpes-Côte d'Azur",
  "type": "Appartement",
  "email": "contact@agence.fr",
  "telephone": "04 93 00 00 00"
}
```

### Réponse

```json
{
  "success": true,
  "videoUrl": "https://pub-xxx.r2.dev/reels/abc123.mp4",
  "duration": "45000ms"
}
```

## 🔧 Développement local

### Prérequis

- Node.js 18+
- FFmpeg installé
- Chrome/Chromium installé

### Installation

```bash
npm install
```

### Configuration

Copie `.env.example` vers `.env` et remplis tes clés :

```bash
cp .env.example .env
```

### Lancement

```bash
npm run dev
```

## 📁 Structure du projet

```
noyer-reels-generator/
├── src/
│   ├── server.js              # API Express
│   └── remotion/
│       ├── index.jsx          # Point d'entrée Remotion
│       └── ReelImmobilier.jsx # Composant du reel
├── Dockerfile                 # Config Docker pour Render
├── render.yaml               # Config Render
├── package.json
└── README.md
```

## 💡 Personnalisation

### Modifier les couleurs

Dans `src/remotion/ReelImmobilier.jsx`, modifie l'objet `COLORS` :

```javascript
const COLORS = {
  primary: '#1a1a2e',    // Fond
  accent: '#e94560',     // Couleur d'accent (prix, etc.)
  white: '#ffffff',
  gold: '#d4af37',
  overlay: 'rgba(0, 0, 0, 0.4)',
};
```

### Modifier la durée des scènes

Change `SCENE_DURATION` (en frames, 30fps) :

```javascript
const SCENE_DURATION = 120; // 4 secondes
```

## 📝 License

Propriétaire - NOYER
