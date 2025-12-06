const express = require('express');
const { bundle } = require('@remotion/bundler');
const { renderMedia, selectComposition } = require('@remotion/renderer');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

// ============================================
// CONFIGURATION
// ============================================
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Configuration Cloudflare R2 (compatible S3)
const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

// ============================================
// VARIABLES GLOBALES
// ============================================
let bundled = null;

// ============================================
// BUNDLE REMOTION AU DÉMARRAGE
// ============================================
async function initBundle() {
  console.log('📦 Bundling Remotion...');
  const startTime = Date.now();

  bundled = await bundle({
    entryPoint: path.join(__dirname, 'remotion/index.jsx'),
    webpackOverride: (config) => config,
  });

  console.log(`✅ Bundle ready in ${Date.now() - startTime}ms`);
}

// ============================================
// UPLOAD VERS CLOUDFLARE R2
// ============================================
async function uploadToR2(filePath, fileName) {
  const fileContent = fs.readFileSync(filePath);

  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: `reels/${fileName}`,
    Body: fileContent,
    ContentType: 'video/mp4',
  });

  await s3Client.send(command);

  // Retourne l'URL publique
  return `${process.env.R2_PUBLIC_URL}/reels/${fileName}`;
}

// ============================================
// ROUTE PRINCIPALE : GÉNÉRER UN REEL
// ============================================
app.post('/generate-reel', async (req, res) => {
  const startTime = Date.now();

  try {
    const {
      photos,
      prix,
      surface,
      region,
      type,
      email,
      telephone,
      template = 'default', // 'default' ou 'blur'
    } = req.body;

    // Validation basique
    if (!photos || photos.length < 5) {
      return res.status(400).json({
        success: false,
        error: 'Il faut au moins 5 photos',
      });
    }

    // Valider le template
    const validTemplates = ['default', 'blur'];
    if (!validTemplates.includes(template)) {
      return res.status(400).json({
        success: false,
        error: `Template invalide. Utilisez: ${validTemplates.join(', ')}`,
      });
    }

    // Sélectionner l'ID de composition selon le template
    const compositionId = template === 'blur' ? 'ReelImmobilierBlur' : 'ReelImmobilier';

    console.log('🎬 Génération du reel...');
    console.log(`   Template: ${template}`);
    console.log(`   Type: ${type}`);
    console.log(`   Région: ${region}`);
    console.log(`   Prix: ${prix}€`);

    // Sélectionner la composition
    const composition = await selectComposition({
      serveUrl: bundled,
      id: compositionId,
      inputProps: {
        photos,
        prix,
        surface,
        region,
        type,
        email,
        telephone,
      },
    });

    // Générer un nom de fichier unique
    const videoId = uuidv4();
    const outputPath = path.join('/tmp', `${videoId}.mp4`);

    // Rendre la vidéo
    await renderMedia({
      composition,
      serveUrl: bundled,
      codec: 'h264',
      outputLocation: outputPath,
      inputProps: {
        photos,
        prix,
        surface,
        region,
        type,
        email,
        telephone,
      },
    });

    console.log('✅ Vidéo générée, upload vers R2...');

    // Upload vers R2
    const videoUrl = await uploadToR2(outputPath, `${videoId}.mp4`);

    // Nettoyer le fichier temporaire
    fs.unlinkSync(outputPath);

    const duration = Date.now() - startTime;
    console.log(`🎉 Reel prêt en ${duration}ms`);

    res.json({
      success: true,
      videoUrl,
      duration: `${duration}ms`,
    });

  } catch (error) {
    console.error('❌ Erreur:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ============================================
// ROUTE HEALTH CHECK
// ============================================
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    bundled: !!bundled,
  });
});

// ============================================
// ROUTE INFO
// ============================================
app.get('/', (req, res) => {
  res.json({
    name: 'NOYER Reels Generator',
    version: '1.1.0',
    endpoints: {
      'POST /generate-reel': 'Génère un reel immobilier',
      'GET /health': 'Vérifie l\'état du service',
    },
    templates: {
      default: 'Photos en plein écran (crop pour remplir)',
      blur: 'Photos en paysage avec fond flou esthétique',
    },
    example: {
      photos: ['url1', 'url2', 'url3', 'url4', 'url5'],
      prix: 450000,
      surface: 120,
      region: 'Provence',
      type: 'Appartement',
      email: 'contact@agence.fr',
      telephone: '04 00 00 00 00',
      template: 'blur', // 'default' ou 'blur'
    },
  });
});

// ============================================
// DÉMARRAGE DU SERVEUR
// ============================================
initBundle().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur le port ${PORT}`);
    console.log(`   POST /generate-reel - Générer un reel`);
    console.log(`   GET /health - Health check`);
  });
}).catch((err) => {
  console.error('❌ Erreur au démarrage:', err);
  process.exit(1);
});
