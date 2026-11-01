import React from 'react';
import {Composition} from 'remotion';
import {Video} from './Video';
import {TOTAL_FRAMES, FPS} from './scenes';

export const Root: React.FC = () => (
  <Composition
    id="PostureFilm"
    component={Video}
    durationInFrames={TOTAL_FRAMES}
    fps={FPS}
    width={1920}
    height={1080}
  />
);
