import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig, Img, interpolate } from 'remotion';

// ============================================
// CONFIGURATION
// ============================================
const SCENE_DURATION = 120; // 4 secondes à 30fps
const TOTAL_DURATION = SCENE_DURATION * 4; // 16 secondes total

// Couleurs du thème immobilier
const COLORS = {
  primary: '#1a1a2e',
  accent: '#e94560',
  white: '#ffffff',
  gold: '#d4af37',
  overlay: 'rgba(0, 0, 0, 0.4)',
};

// ============================================
// EFFET KEN BURNS AMÉLIORÉ
// ============================================
const KenBurnsImage = ({ src, direction = 'in', style = {} }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Différentes directions pour l'effet Ken Burns - PLUS DYNAMIQUES
  const directions = {
    // Scène 1 : Mouvement diagonal + zoom (effet caméra sur place)
    diagonal: { 
      startScale: 1.2, 
      endScale: 1.35, 
      startX: -8, 
      endX: 8, 
      startY: -5, 
      endY: 5 
    },
    // Scène 2 : Rotation panoramique rapide
    panoramic: { 
      startScale: 1.3, 
      endScale: 1.3, 
      startX: -15, 
      endX: 15, 
      startY: 0, 
      endY: 0 
    },
    // Pour les splits
    slowZoom: { 
      startScale: 1.1, 
      endScale: 1.25, 
      startX: -3, 
      endX: 3, 
      startY: 0, 
      endY: 0 
    },
    slowZoomReverse: { 
      startScale: 1.25, 
      endScale: 1.1, 
      startX: 3, 
      endX: -3, 
      startY: 0, 
      endY: 0 
    },
    // Scène 4 : Zoom out doux
    out: { 
      startScale: 1.3, 
      endScale: 1.1, 
      startX: 5, 
      endX: -5, 
      startY: 3, 
      endY: -3 
    },
  };

  const d = directions[direction] || directions.diagonal;

  const scale = interpolate(frame, [0, durationInFrames], [d.startScale, d.endScale], {
    extrapolateRight: 'clamp',
  });

  const translateX = interpolate(frame, [0, durationInFrames], [d.startX, d.endX], {
    extrapolateRight: 'clamp',
  });

  const translateY = interpolate(frame, [0, durationInFrames], [d.startY, d.endY], {
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ overflow: 'hidden', ...style }}>
      <Img
        src={src}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `scale(${scale}) translate(${translateX}%, ${translateY}%)`,
        }}
      />
      {/* Overlay sombre pour meilleure lisibilité */}
      <AbsoluteFill style={{ backgroundColor: COLORS.overlay }} />
    </AbsoluteFill>
  );
};

// ============================================
// CARTES D'INFORMATION ANIMÉES - STYLE UNIFIÉ ET PLUS GRANDES
// ============================================
const InfoCard = ({ children, delay = 0, position = 'bottom-left' }) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [delay, delay + 15], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const translateY = interpolate(frame, [delay, delay + 15], [40, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const positions = {
    'bottom-left': { bottom: 200, left: 50 },
    'bottom-right': { bottom: 200, right: 50 },
    'top-left': { top: 150, left: 50 },
    'top-right': { top: 150, right: 50 },
    'bottom-center': { bottom: 200, left: '50%', marginLeft: -200 },
  };

  const posStyle = positions[position] || positions['bottom-left'];

  return (
    <div
      style={{
        position: 'absolute',
        ...posStyle,
        opacity,
        transform: `translateY(${translateY}px)`,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        padding: '30px 50px',
        borderRadius: 16,
        boxShadow: '0 15px 50px rgba(0,0,0,0.4)',
        minWidth: 280,
        backdropFilter: 'blur(10px)',
      }}
    >
      {children}
    </div>
  );
};

const CardLabel = ({ children }) => (
  <div style={{ 
    fontSize: 22, 
    color: '#888', 
    marginBottom: 8, 
    fontFamily: 'Arial, sans-serif', 
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: 2,
  }}>
    {children}
  </div>
);

const CardValue = ({ children, color = COLORS.primary }) => (
  <div style={{ 
    fontSize: 52, 
    fontWeight: 'bold', 
    color, 
    fontFamily: 'Arial, sans-serif' 
  }}>
    {children}
  </div>
);

// ============================================
// SCÈNE 1 : Photo + TYPE + RÉGION (Ken Burns diagonal dynamique)
// ============================================
const Scene1 = ({ photo, type, region }) => {
  return (
    <AbsoluteFill>
      <KenBurnsImage src={photo} direction="diagonal" />

      {/* Badge TYPE en haut */}
      <InfoCard delay={10} position="top-left">
        <CardLabel>Type de bien</CardLabel>
        <CardValue>{type}</CardValue>
      </InfoCard>

      {/* Badge RÉGION en bas */}
      <InfoCard delay={30} position="bottom-right">
        <CardLabel>Localisation</CardLabel>
        <CardValue color={COLORS.accent}>{region}</CardValue>
      </InfoCard>
    </AbsoluteFill>
  );
};

// ============================================
// SCÈNE 2 : Photo + PRIX + SURFACE (Panoramique rapide)
// ============================================
const Scene2 = ({ photo, prix, surface }) => {
  const formatPrix = (p) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(p);
  };

  return (
    <AbsoluteFill>
      <KenBurnsImage src={photo} direction="panoramic" />

      {/* Badge PRIX */}
      <InfoCard delay={10} position="top-right">
        <CardLabel>Prix</CardLabel>
        <CardValue color={COLORS.accent}>{formatPrix(prix)}</CardValue>
      </InfoCard>

      {/* Badge SURFACE */}
      <InfoCard delay={30} position="bottom-left">
        <CardLabel>Surface</CardLabel>
        <CardValue>{surface} m²</CardValue>
      </InfoCard>
    </AbsoluteFill>
  );
};

// ============================================
// SCÈNE 3 : Split horizontal FIXÉ (2 photos vraiment séparées)
// ============================================
const Scene3 = ({ photo1, photo2 }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Animation d'entrée
  const slideIn = interpolate(frame, [0, 25], [100, 0], {
    extrapolateRight: 'clamp',
  });

  // Ken Burns pour chaque moitié
  const scale1 = interpolate(frame, [0, durationInFrames], [1.1, 1.25], {
    extrapolateRight: 'clamp',
  });
  const translateX1 = interpolate(frame, [0, durationInFrames], [-3, 3], {
    extrapolateRight: 'clamp',
  });

  const scale2 = interpolate(frame, [0, durationInFrames], [1.25, 1.1], {
    extrapolateRight: 'clamp',
  });
  const translateX2 = interpolate(frame, [0, durationInFrames], [3, -3], {
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.primary }}>
      {/* Photo du HAUT - Moitié supérieure */}
      <div style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: 'calc(50% - 3px)',
        overflow: 'hidden',
        transform: `translateY(-${slideIn}%)`,
      }}>
        <Img
          src={photo1}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: `scale(${scale1}) translateX(${translateX1}%)`,
          }}
        />
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: COLORS.overlay,
        }} />
      </div>

      {/* Ligne de séparation centrale */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: 0,
        width: '100%',
        height: 6,
        backgroundColor: COLORS.white,
        transform: 'translateY(-50%)',
        zIndex: 10,
      }} />

      {/* Photo du BAS - Moitié inférieure */}
      <div style={{ 
        position: 'absolute', 
        bottom: 0, 
        left: 0, 
        width: '100%', 
        height: 'calc(50% - 3px)',
        overflow: 'hidden',
        transform: `translateY(${slideIn}%)`,
      }}>
        <Img
          src={photo2}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: `scale(${scale2}) translateX(${translateX2}%)`,
          }}
        />
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: COLORS.overlay,
        }} />
      </div>
    </AbsoluteFill>
  );
};

// ============================================
// SCÈNE 4 : Photo + EMAIL + TÉLÉPHONE
// ============================================
const Scene4 = ({ photo, email, telephone }) => {
  return (
    <AbsoluteFill>
      <KenBurnsImage src={photo} direction="out" />

      {/* Titre "Contactez-nous" */}
      <InfoCard delay={5} position="top-left">
        <CardValue color={COLORS.accent}>Contactez-nous</CardValue>
      </InfoCard>

      {/* EMAIL */}
      <InfoCard delay={25} position="bottom-left">
        <CardLabel>Email</CardLabel>
        <CardValue style={{ fontSize: 32 }}>{email}</CardValue>
      </InfoCard>

      {/* TÉLÉPHONE */}
      <InfoCard delay={40} position="bottom-right">
        <CardLabel>Téléphone</CardLabel>
        <CardValue color={COLORS.accent}>{telephone}</CardValue>
      </InfoCard>
    </AbsoluteFill>
  );
};

// ============================================
// COMPOSITION PRINCIPALE
// ============================================
export const ReelImmobilier = ({
  photos = [],
  prix = 0,
  surface = 0,
  region = '',
  type = '',
  email = '',
  telephone = '',
}) => {
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.primary }}>
      {/* Scène 1: Photo 1 + Type + Région */}
      <Sequence from={0} durationInFrames={SCENE_DURATION}>
        <Scene1 photo={photos[0]} type={type} region={region} />
      </Sequence>

      {/* Scène 2: Photo 2 + Prix + Surface */}
      <Sequence from={SCENE_DURATION} durationInFrames={SCENE_DURATION}>
        <Scene2 photo={photos[1]} prix={prix} surface={surface} />
      </Sequence>

      {/* Scène 3: Photos 3 et 4 en split */}
      <Sequence from={SCENE_DURATION * 2} durationInFrames={SCENE_DURATION}>
        <Scene3 photo1={photos[2]} photo2={photos[3]} />
      </Sequence>

      {/* Scène 4: Photo 5 + Contact */}
      <Sequence from={SCENE_DURATION * 3} durationInFrames={SCENE_DURATION}>
        <Scene4 photo={photos[4]} email={email} telephone={telephone} />
      </Sequence>
    </AbsoluteFill>
  );
};

export default ReelImmobilier;
