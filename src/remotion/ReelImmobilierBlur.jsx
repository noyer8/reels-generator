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
  overlay: 'rgba(0, 0, 0, 0.3)',
};

// ============================================
// COMPOSANT IMAGE AVEC FOND FLOU + KEN BURNS
// ============================================
const BlurredBackgroundImage = ({ src, direction = 'diagonal', style = {} }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Différentes directions pour l'effet Ken Burns
  const directions = {
    diagonal: {
      startScale: 1.05,
      endScale: 1.15,
      startX: -4,
      endX: 4,
      startY: -2,
      endY: 2
    },
    panoramic: {
      startScale: 1.1,
      endScale: 1.1,
      startX: -8,
      endX: 8,
      startY: 0,
      endY: 0
    },
    slowZoom: {
      startScale: 1.0,
      endScale: 1.12,
      startX: -2,
      endX: 2,
      startY: 0,
      endY: 0
    },
    out: {
      startScale: 1.15,
      endScale: 1.0,
      startX: 3,
      endX: -3,
      startY: 2,
      endY: -2
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
      {/* Fond flou - Image agrandie et floue */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        left: '-10%',
        width: '120%',
        height: '120%',
        filter: 'blur(30px)',
        transform: `scale(${scale * 1.3}) translate(${translateX * 0.5}%, ${translateY * 0.5}%)`,
      }}>
        <Img
          src={src}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      </div>

      {/* Overlay sombre sur le fond flou */}
      <AbsoluteFill style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }} />

      {/* Image principale en paysage - centrée */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: '100%',
        height: 'auto',
        transform: `translate(-50%, -50%) scale(${scale}) translate(${translateX}%, ${translateY}%)`,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <Img
          src={src}
          style={{
            width: '100%',
            height: 'auto',
            maxHeight: '55%',
            objectFit: 'contain',
            borderRadius: 12,
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          }}
        />
      </div>

      {/* Overlay léger sur l'image principale pour lisibilité des textes */}
      <AbsoluteFill style={{ backgroundColor: COLORS.overlay }} />
    </AbsoluteFill>
  );
};

// ============================================
// IMAGE SPLIT AVEC FOND FLOU
// ============================================
const BlurredSplitImage = ({ src, position = 'top', scale, translateX }) => {
  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '100%',
      overflow: 'hidden',
    }}>
      {/* Fond flou */}
      <div style={{
        position: 'absolute',
        top: '-20%',
        left: '-20%',
        width: '140%',
        height: '140%',
        filter: 'blur(25px)',
      }}>
        <Img
          src={src}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: `scale(${scale * 1.2})`,
          }}
        />
      </div>

      {/* Overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.35)',
      }} />

      {/* Image principale centrée */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: '95%',
        transform: `translate(-50%, -50%) scale(${scale}) translateX(${translateX}%)`,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <Img
          src={src}
          style={{
            width: '100%',
            height: 'auto',
            objectFit: 'contain',
            borderRadius: 8,
            boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
          }}
        />
      </div>
    </div>
  );
};

// ============================================
// CARTES D'INFORMATION ANIMÉES
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
    'bottom-left': { bottom: 180, left: 50 },
    'bottom-right': { bottom: 180, right: 50 },
    'top-left': { top: 130, left: 50 },
    'top-right': { top: 130, right: 50 },
    'bottom-center': { bottom: 180, left: '50%', marginLeft: -200 },
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
        padding: '25px 40px',
        borderRadius: 14,
        boxShadow: '0 15px 50px rgba(0,0,0,0.4)',
        minWidth: 260,
        backdropFilter: 'blur(10px)',
      }}
    >
      {children}
    </div>
  );
};

const CardLabel = ({ children }) => (
  <div style={{
    fontSize: 20,
    color: '#888',
    marginBottom: 6,
    fontFamily: 'Arial, sans-serif',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: 2,
  }}>
    {children}
  </div>
);

const CardValue = ({ children, color = COLORS.primary, style = {} }) => (
  <div style={{
    fontSize: 46,
    fontWeight: 'bold',
    color,
    fontFamily: 'Arial, sans-serif',
    ...style,
  }}>
    {children}
  </div>
);

// ============================================
// SCÈNE 1 : Photo + TYPE + RÉGION
// ============================================
const Scene1 = ({ photo, type, region }) => {
  return (
    <AbsoluteFill>
      <BlurredBackgroundImage src={photo} direction="diagonal" />

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
// SCÈNE 2 : Photo + PRIX + SURFACE
// ============================================
const Scene2 = ({ photo, prix, surface }) => {
  const formatPrix = (p) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(p);
  };

  return (
    <AbsoluteFill>
      <BlurredBackgroundImage src={photo} direction="panoramic" />

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
// SCÈNE 3 : Split horizontal avec fond flou
// ============================================
const Scene3 = ({ photo1, photo2 }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Animation d'entrée
  const slideIn = interpolate(frame, [0, 25], [100, 0], {
    extrapolateRight: 'clamp',
  });

  // Ken Burns pour chaque moitié
  const scale1 = interpolate(frame, [0, durationInFrames], [1.0, 1.08], {
    extrapolateRight: 'clamp',
  });
  const translateX1 = interpolate(frame, [0, durationInFrames], [-2, 2], {
    extrapolateRight: 'clamp',
  });

  const scale2 = interpolate(frame, [0, durationInFrames], [1.08, 1.0], {
    extrapolateRight: 'clamp',
  });
  const translateX2 = interpolate(frame, [0, durationInFrames], [2, -2], {
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
        height: 'calc(50% - 4px)',
        overflow: 'hidden',
        transform: `translateY(-${slideIn}%)`,
      }}>
        <BlurredSplitImage
          src={photo1}
          position="top"
          scale={scale1}
          translateX={translateX1}
        />
      </div>

      {/* Ligne de séparation centrale */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: 0,
        width: '100%',
        height: 8,
        backgroundColor: COLORS.white,
        transform: 'translateY(-50%)',
        zIndex: 10,
        boxShadow: '0 0 20px rgba(255,255,255,0.5)',
      }} />

      {/* Photo du BAS - Moitié inférieure */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        height: 'calc(50% - 4px)',
        overflow: 'hidden',
        transform: `translateY(${slideIn}%)`,
      }}>
        <BlurredSplitImage
          src={photo2}
          position="bottom"
          scale={scale2}
          translateX={translateX2}
        />
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
      <BlurredBackgroundImage src={photo} direction="out" />

      {/* Titre "Contactez-nous" */}
      <InfoCard delay={5} position="top-left">
        <CardValue color={COLORS.accent}>Contactez-nous</CardValue>
      </InfoCard>

      {/* EMAIL */}
      <InfoCard delay={25} position="bottom-left">
        <CardLabel>Email</CardLabel>
        <CardValue style={{ fontSize: 28 }}>{email}</CardValue>
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
// COMPOSITION PRINCIPALE - TEMPLATE BLUR
// ============================================
export const ReelImmobilierBlur = ({
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

export default ReelImmobilierBlur;
