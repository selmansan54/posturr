import React from 'react';
import {AbsoluteFill, Audio, Series, staticFile, useCurrentFrame} from 'remotion';
import {SCENES, USE_AUDIO, Scene} from './scenes';
import {ease, lerp, mixPosture} from './posture';
import {Figure} from './Figure';
import {Hud} from './Hud';

const SceneView: React.FC<{scene: Scene; index: number}> = ({scene, index}) => {
  const frame = useCurrentFrame();
  const t = frame / scene.frames;
  const micro = scene.fx.includes('microbreak');
  // microbreak: otur -> sıfırla döngüsü, 1.5 tur, sonda düzgün duruş
  const p = micro ? 0.5 - 0.5 * Math.cos(t * Math.PI * 3) : ease(frame / (scene.frames * 0.7));
  const post = mixPosture(scene.from, scene.to, p);
  const yaw = lerp(scene.yaw[0], scene.yaw[1], scene.fx.includes('orbit') ? t : ease(t));
  const [a, b] = scene.cam;
  const cam = [0, 1, 2].map((i) => lerp(a[i], b[i], ease(t)));

  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, #0b1218 0%, #000 70%)'}}>
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <g transform={`translate(960 540) scale(${cam[2]}) translate(${-cam[0]} ${-cam[1]})`}>
          <Figure post={post} yaw={yaw} p={p} t={t} frame={frame} scene={scene} />
        </g>
      </svg>
      <Hud scene={scene} index={index} total={scene.frames} frame={frame} p={p} t={t} count={SCENES.length} />
      {USE_AUDIO && <Audio src={staticFile(`vo/${String(index + 1).padStart(2, '0')}.mp3`)} />}
    </AbsoluteFill>
  );
};

export const Video: React.FC = () => (
  <Series>
    {SCENES.map((s, i) => (
      <Series.Sequence key={i} durationInFrames={s.frames}>
        <SceneView scene={s} index={i} />
      </Series.Sequence>
    ))}
  </Series>
);
