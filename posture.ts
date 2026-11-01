export type Posture = {
  tilt: number;   // pelvic tilt, deg (+ = anterior)
  lord: number;   // lumbar lordosis, deg
  kyph: number;   // thoracic kyphosis, deg
  cerv: number;   // cervical lordosis, deg (negative = forward head)
  round: number;  // shoulder protraction, px
  elev: number;   // shoulder elevation, px
  breath: number; // ribcage scale
};

export const GOOD: Posture = {tilt: 0, lord: 28, kyph: 32, cerv: 16, round: 0, elev: 0, breath: 1};
export const POOR: Posture = {tilt: 12, lord: 40, kyph: 52, cerv: -22, round: 28, elev: 14, breath: 0.92};

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
export const ease = (t: number) => {
  const x = clamp01(t);
  return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
};

export const mixPosture = (a: Posture, b: Posture, t: number): Posture => {
  const out = {} as Posture;
  (Object.keys(a) as (keyof Posture)[]).forEach((k) => {
    out[k] = lerp(a[k], b[k], t);
  });
  return out;
};

const parse = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
export const lerpColor = (a: string, b: string, t: number) => {
  const A = parse(a);
  const B = parse(b);
  const c = A.map((v, i) => Math.round(lerp(v, B[i], clamp01(t))));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
};

export type SpinePt = {x: number; y: number; a: number};

// 24 vertebrae from sacrum upward: 0-4 lumbar, 5-16 thoracic, 17-23 cervical. y is UP.
export const buildSpine = (p: Posture): SpinePt[] => {
  const rad = Math.PI / 180;
  const pts: SpinePt[] = [];
  let x = 0;
  let y = 0;
  let a = 12 + p.tilt;
  for (let i = 0; i < 24; i++) {
    const lumbar = i < 5;
    const thor = i < 17;
    const L = lumbar ? 24 : thor ? 20 : 15;
    if (lumbar) a -= p.lord / 5;
    else if (thor) a += p.kyph / 12;
    else a -= p.cerv / 7;
    pts.push({x, y, a});
    x += L * Math.sin(a * rad);
    y += L * Math.cos(a * rad);
  }
  return pts;
};
