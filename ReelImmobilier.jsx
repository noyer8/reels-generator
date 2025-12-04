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
// EFFET KEN BURNS
// ============================================
const KenBurnsImage = ({ src, direction = 'in', style = {} }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Différentes directions pour l'effet Ken Burns
  const directions = {
    in: { startScale: 1, endScale: 1.15, startX: 0, endX: 0, startY: 0, endY: 0 },
    out: { startScale: 1.15, endScale: 1, startX: 0, endX: 0, startY: 0, endY: 0 },
    left: { startScale: 1.1, endScale: 1.1, startX: 5, endX: -5, startY: 0, endY: 0 },
    right: { startScale: 1.1, endScale: 1.1, startX: -5, endX: 5, startY: 0, endY: 0 },
    upLeft: { startScale: 1, endScale: 1.2, startX: 3, endX: -3, startY: 3, endY: -3 },
  };

  const d = directions[direction] || directions.in;

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
// CARTES D'INFORMATION ANIMÉES
// ============================================
const InfoCard = ({ children, delay = 0, position = 'bottom-left', style = {} }) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [delay, delay + 15], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const translateY = interpolate(frame, [delay, delay + 15], [30, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const positions = {
    'bottom-left': { bottom: 180, left: 40 },
    'bottom-right': { bottom: 180, right: 40 },
    'top-left': { top: 120, left: 40 },
    'top-right': { top: 120, right: 40 },
    'center': { top: '50%', left: '50%', transform: `translate(-50%, -50%) translateY(${translateY}px)` },
    'bottom-center': { bottom: 180, left: '50%', transform: `translateX(-50%) translateY(${translateY}px)` },
  };

  const posStyle = positions[position] || positions['bottom-left'];

  return (
    <div
      style={{
        position: 'absolute',
        ...posStyle,
        opacity,
        transform: posStyle.transform || `translateY(${translateY}px)`,
        backgroundColor: COLORS.white,
        padding: '20px 35px',
        borderRadius: 12,
        boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

const CardLabel = ({ children }) => (
  <div style={{ fontSize: 18, color: '#666', marginBottom: 5, fontFamily: 'Arial', fontWeight: 500 }}>
    {children}
  </div>
);

const CardValue = ({ children, color = COLORS.primary }) => (
  <div style={{ fontSize: 42, fontWeight: 'bold', color, fontFamily: 'Arial' }}>
    {children}
  </div>
);

// ============================================
// SCÈNE 1 : Photo + TYPE + RÉGION
// ============================================
const Scene1 = ({ photo, type, region }) => {
  return (
    <AbsoluteFill>
      <KenBurnsImage src={photo} direction="in" />

      {/* Badge TYPE en haut */}
      <InfoCard delay={10} position="top-left">
        <CardLabel>Type de bien</CardLabel>
        <CardValue>{type}</CardValue>
      </InfoCard>

      {/* Badge RÉGION en bas */}
      <InfoCard delay={25} position="bottom-right">
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
      <KenBurnsImage src={photo} direction="left" />

      {/* Badge PRIX */}
      <InfoCard delay={10} position="top-right">
        <CardLabel>Prix</CardLabel>
        <CardValue color={COLORS.accent}>{formatPrix(prix)}</CardValue>
      </InfoCard>

      {/* Badge SURFACE */}
      <InfoCard delay={25} position="bottom-left">
        <CardLabel>Surface</CardLabel>
        <CardValue>{surface} m²</CardValue>
      </InfoCard>
    </AbsoluteFill>
  );
};

// ============================================
// SCÈNE 3 : Split horizontal (2 photos)
// ============================================
const Scene3 = ({ photo1, photo2 }) => {
  const frame = useCurrentFrame();

  const clipTop = interpolate(frame, [0, 20], [100, 50], {
    extrapolateRight: 'clamp',
  });

  const clipBottom = interpolate(frame, [10, 30], [100, 50], {
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill>
      {/* Photo du haut */}
      <div style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '50%',
        overflow: 'hidden',
        clipPath: `inset(0 0 ${100 - clipTop}% 0)`,
      }}>
        <KenBurnsImage src={photo1} direction="right" style={{ height: '200%' }} />
      </div>

      {/* Photo du bas */}
      <div style={{ 
        position: 'absolute', 
        bottom: 0, 
        left: 0, 
        width: '100%', 
        height: '50%',
        overflow: 'hidden',
        clipPath: `inset(${100 - clipBottom}% 0 0 0)`,
      }}>
        <KenBurnsImage src={photo2} direction="upLeft" style={{ height: '200%' }} />
      </div>

      {/* Ligne de séparation */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: 0,
        width: '100%',
        height: 4,
        backgroundColor: COLORS.white,
        transform: 'translateY(-50%)',
        opacity: interpolate(frame, [25, 35], [0, 1], { extrapolateRight: 'clamp' }),
      }} />
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
      <InfoCard delay={5} position="top-left" style={{ backgroundColor: COLORS.accent }}>
        <CardValue color={COLORS.white}>Contactez-nous</CardValue>
      </InfoCard>

      {/* EMAIL */}
      <InfoCard delay={20} position="bottom-left">
        <CardLabel>Email</CardLabel>
        <CardValue style={{ fontSize: 28 }}>{email}</CardValue>
      </InfoCard>

      {/* TÉLÉPHONE */}
      <InfoCard delay={35} position="bottom-right">
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
