import { registerRoot } from 'remotion';
import { Composition } from 'remotion';
import { ReelImmobilier } from './ReelImmobilier';

const FPS = 30;
const SCENE_DURATION = 4; // secondes
const TOTAL_SCENES = 4;

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="ReelImmobilier"
        component={ReelImmobilier}
        durationInFrames={FPS * SCENE_DURATION * TOTAL_SCENES}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={{
          photos: [
            'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1080',
            'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1080',
            'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1080',
            'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1080',
            'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1080',
          ],
          prix: 450000,
          surface: 120,
          region: 'Côte d\'Azur',
          type: 'Villa',
          email: 'contact@agence.fr',
          telephone: '04 93 00 00 00',
        }}
      />
    </>
  );
};

registerRoot(RemotionRoot);
