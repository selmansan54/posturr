import {GOOD, POOR, Posture} from './posture';

export const FPS = 30;
export const USE_AUDIO = false; // public/vo/01.mp3 ... 15.mp3 koyunca true yap

export const COLORS = {
  red: '#ff2d3d',
  orange: '#ff7a1a',
  cyan: '#18e0ff',
  green: '#2bff88',
  yellow: '#ffe14d',
};

export type Scene = {
  title: string;
  seconds: number;
  frames: number;
  vo: string;
  protocol?: string;
  hero?: string;
  disclaimer?: boolean;
  status?: [string, string];
  from: Posture;
  to: Posture;
  tense: string;
  calm: string;
  focus: number[] | 'all';
  fx: string[];
  cam: [[number, number, number], [number, number, number]]; // [worldX, worldY, zoom]
  yaw: [number, number];
  metric?: {label: string; from: number; to: number; unit: string};
};

const r = (a: number, b: number) => Array.from({length: b - a + 1}, (_, i) => a + i);
const CERV = r(17, 23);
const THOR = r(5, 16);

const B: Posture = {...POOR, cerv: 16};

type Def = Omit<Scene, 'frames'>;

const DEFS: Def[] = [
  {
    title: 'The Posture Reset', seconds: 15,
    vo: 'Your head weighs about five kilos. That is about the weight of a bowling ball, balanced on top of your spine. Today, we will learn how to carry it the way your body was designed to.',
    hero: 'The Posture Reset', status: ['STATUS: SCANNING', 'STATUS: READY'],
    from: GOOD, to: GOOD, tense: COLORS.cyan, calm: COLORS.cyan, focus: 'all', fx: ['assemble'],
    cam: [[0, -260, 1.45], [0, -260, 1.6]], yaw: [0, 0.8],
  },
  {
    title: 'Cervical disc compression', seconds: 20,
    vo: 'Now look down at your phone. The further your head tilts forward, the heavier it feels to your neck. At a deep tilt, the load can grow to several times its normal weight. Your discs and muscles pay the price.',
    from: GOOD, to: {...GOOD, cerv: -24, round: 10},
    tense: COLORS.cyan, calm: COLORS.red, focus: CERV, fx: ['phone'],
    cam: [[40, -300, 1.3], [60, -390, 2.0]], yaw: [0, 0],
    metric: {label: 'NECK FLEXION', from: 0, to: 60, unit: '°'},
  },
  {
    title: 'The damage chain', seconds: 20,
    vo: 'But the problem is rarely just the neck. A forward head, rounded shoulders, a stiff upper back and a tilted pelvis all feed each other. It is one chain, and fixing it means working through every link. Let us start at the top.',
    status: ['STATUS: ANALYZING', 'STATUS: CHAIN DETECTED'],
    from: POOR, to: POOR, tense: COLORS.red, calm: COLORS.red, focus: 'all', fx: ['callouts', 'pelvis', 'ribs', 'shoulders'],
    cam: [[100, -260, 1.35], [100, -260, 1.35]], yaw: [0, 0],
    metric: {label: 'ALIGNMENT SCORE', from: 41, to: 41, unit: '%'},
  },
  {
    title: 'Suboccipital release', seconds: 15,
    vo: 'First, the base of your skull. Tiny muscles here tighten when your head drifts forward. Place two fingers just beneath the skull, press gently, and breathe slowly. Blood flow returns.',
    protocol: 'Gentle pressure  |  1 to 2 minutes',
    from: {...POOR}, to: {...POOR, cerv: -8},
    tense: COLORS.orange, calm: COLORS.cyan, focus: r(21, 23), fx: ['suboccipital', 'blood'],
    cam: [[20, -430, 3.0], [20, -430, 3.5]], yaw: [0.9, 1.2],
    metric: {label: 'MUSCLE TENSION', from: 92, to: 28, unit: '%'},
  },
  {
    title: 'Deep neck flexors and the vertical axis', seconds: 20,
    vo: 'Next, wake up the deep muscles at the front of your neck. Imagine making a double chin, and slide your head straight back, without tilting it down. Hold for five seconds. Your ear should line up over your shoulder.',
    protocol: '10 chin tucks  |  hold 5 seconds',
    from: {...POOR, cerv: -8}, to: {...POOR, cerv: 16, round: 20},
    tense: COLORS.orange, calm: COLORS.cyan, focus: CERV, fx: ['deepFlexors', 'plumb', 'reticle'],
    cam: [[30, -420, 2.4], [30, -400, 2.2]], yaw: [0, 0],
    metric: {label: 'HEAD OFFSET', from: 6.5, to: 0.5, unit: 'cm'},
  },
  {
    title: 'Levator scapulae release', seconds: 15,
    vo: 'Now release the muscle that runs from your neck to your shoulder blade. Let your shoulders rise toward your ears, then drop them completely. Feel the tension melt away.',
    protocol: '5 slow shrugs  |  long exhale on release',
    from: {...B, round: 6, elev: 22}, to: {...B, round: 6, elev: 0},
    tense: COLORS.red, calm: COLORS.cyan, focus: r(19, 23), fx: ['levator', 'shoulders'],
    cam: [[10, -400, 3.0], [10, -400, 3.2]], yaw: [0.9, 1.1],
    metric: {label: 'SHOULDER ELEVATION', from: 3.0, to: 0.2, unit: 'cm'},
  },
  {
    title: 'Scalenes and diaphragmatic breathing', seconds: 15,
    vo: 'The scalene muscles sit on the sides of your neck and lift your ribs when you breathe. When you breathe high and shallow, they tighten. Breathe low and wide, and let your ribs expand.',
    protocol: '5 deep breaths  |  stop if you feel tingling',
    from: {...B, round: 6, breath: 0.88}, to: {...B, round: 6, breath: 1.15},
    tense: COLORS.red, calm: COLORS.cyan, focus: r(17, 21), fx: ['scalenes', 'ribs', 'shoulders'],
    cam: [[40, -380, 2.8], [40, -380, 3.0]], yaw: [0.5, 0.3],
    metric: {label: 'BREATH CAPACITY', from: 62, to: 100, unit: '%'},
  },
  {
    title: 'Pec minor and torso stabilization', seconds: 15,
    vo: 'Hours of sitting shorten the small muscle under your chest and pull your shoulders forward. Try a doorway stretch, or simply roll your shoulders back, and feel your chest widen.',
    protocol: 'Doorway stretch  |  30 seconds per side',
    from: {...B, round: 28}, to: {...B, round: 0, breath: 1.1},
    tense: COLORS.red, calm: COLORS.cyan, focus: r(10, 16), fx: ['pecMinor', 'ribGreen', 'shoulders'],
    cam: [[30, -330, 2.6], [30, -330, 2.4]], yaw: [0.6, 0.4],
    metric: {label: 'SHOULDER PROTRACTION', from: 28, to: 4, unit: '%'},
  },
  {
    title: 'Lower traps and wall glide', seconds: 20,
    vo: 'Now strengthen what pulls your shoulder blades down and back. Stand with your back against a wall, and slide your arms upward like a snow angel. Keep your ribs down and your lower back relaxed. These are your lower trapezius muscles.',
    protocol: '10 slow reps  |  2 sets',
    from: {...B, round: 20}, to: {...B, round: 6, elev: 6},
    tense: COLORS.orange, calm: COLORS.green, focus: r(8, 16), fx: ['lowerTraps', 'shoulders'],
    cam: [[0, -330, 2.2], [0, -340, 2.4]], yaw: [1.0, 1.2],
    metric: {label: 'SCAPULAR TILT', from: 18, to: 3, unit: '°'},
  },
  {
    title: 'Thoracic spine mobility', seconds: 20,
    vo: 'Your mid-back is meant to move. When it stiffens, your neck and lower back have to compensate. Sit tall, place your hands behind your head, and gently arch back over your chair. Open the upper back one segment at a time.',
    protocol: '8 slow extensions  |  exhale as you arch',
    from: {...B, round: 0, kyph: 52}, to: {...B, round: 0, kyph: 30},
    tense: COLORS.orange, calm: COLORS.cyan, focus: THOR, fx: ['ribs'],
    cam: [[20, -300, 1.9], [20, -300, 2.0]], yaw: [0, 0],
    metric: {label: 'THORACIC KYPHOSIS', from: 52, to: 30, unit: '°'},
  },
  {
    title: 'Pelvic tilt and core integration', seconds: 20,
    vo: 'Everything rests on your pelvis. If it tips too far forward, your lower back arches and your upper body leans to compensate. Gently tilt it back to neutral and watch the whole spine realign, all the way up to your skull.',
    protocol: '10 pelvic tilts  |  slow and controlled',
    from: {...GOOD, tilt: 12, lord: 40, kyph: 36}, to: GOOD,
    tense: COLORS.red, calm: COLORS.cyan, focus: 'all', fx: ['wave', 'pelvis'],
    cam: [[0, -250, 1.5], [0, -300, 1.5]], yaw: [0.6, 0.6],
    metric: {label: 'PELVIC TILT', from: 12, to: 0, unit: '°'},
  },
  {
    title: 'Desk ergonomics', seconds: 15,
    vo: 'Your workspace can undo all your effort. Raise your screen so the top sits at eye level, keep your feet flat, and let your setup hold your posture for you.',
    protocol: 'Screen at eye level  |  arm length away',
    from: POOR, to: GOOD, tense: COLORS.orange, calm: COLORS.green, focus: 'all', fx: ['screen'],
    cam: [[150, -330, 1.3], [150, -330, 1.3]], yaw: [0, 0],
    metric: {label: 'GAZE ANGLE', from: 30, to: 0, unit: '°'},
  },
  {
    title: 'Move every 30 minutes', seconds: 10,
    vo: 'Posture is not a position. It is movement. Every thirty minutes, stand up, walk, and reset.',
    protocol: 'Every 30 minutes  |  stand, walk, stretch',
    status: ['STATUS: SITTING', 'STATUS: RESET'],
    from: POOR, to: GOOD, tense: COLORS.orange, calm: COLORS.green, focus: 'all', fx: ['microbreak', 'pelvis'],
    cam: [[0, -260, 1.4], [0, -260, 1.4]], yaw: [0, 0],
  },
  {
    title: 'Four weeks of small resets', seconds: 10,
    vo: 'Small daily resets add up. Five minutes a day, and within weeks, good posture starts to feel natural.',
    status: ['STATUS: DAY 1', 'STATUS: WEEK 4'],
    from: POOR, to: GOOD, tense: COLORS.orange, calm: COLORS.green, focus: 'all', fx: ['weeks', 'ribs', 'pelvis', 'shoulders'],
    cam: [[0, -260, 1.4], [0, -260, 1.4]], yaw: [0.3, 0.3],
    metric: {label: 'ALIGNMENT SCORE', from: 41, to: 88, unit: '%'},
  },
  {
    title: '360° full-body alignment', seconds: 10, disclaimer: true,
    vo: 'Aligned from head to pelvis. Posture is a skill, and you can train it. Start today.',
    status: ['STATUS: ALIGNING', 'STATUS: ALIGNED'],
    from: GOOD, to: GOOD, tense: COLORS.green, calm: COLORS.green, focus: 'all', fx: ['plumb', 'ribs', 'pelvis', 'shoulders', 'orbit'],
    cam: [[0, -260, 1.45], [0, -260, 1.45]], yaw: [0, Math.PI * 2],
    metric: {label: 'ALIGNMENT SCORE', from: 41, to: 100, unit: '%'},
  },
];

export const SCENES: Scene[] = DEFS.map((d) => ({...d, frames: d.seconds * FPS}));
export const TOTAL_FRAMES = SCENES.reduce((a, s) => a + s.frames, 0);
