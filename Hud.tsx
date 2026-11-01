import React from 'react';
import {Scene} from './scenes';
import {clamp01, lerp, lerpColor} from './posture';

type Props = {scene: Scene; index: number; count: number; frame: number; p: number; t: number; total: number};

const wrap = (s: string, n: number) => {
  const out: string[] = [];
  let cur = '';
  s.split(' ').forEach((w) => {
    if ((cur + ' ' + w).trim().length > n) {
      out.push(cur);
      cur = w;
    } else cur = (cur + ' ' + w).trim();
  });
  if (cur) out.push(cur);
  return out;
};

export const Hud: React.FC<Props> = ({scene, index, count, frame, p, t, total}) => {
  const col = lerpColor(scene.tense, scene.calm, p);
  const m = scene.metric;
  const fade = Math.min(1, frame / 12, (total - frame) / 12);
  const F = 'Menlo, Consolas, "DejaVu Sans Mono", monospace';
  const R = 52;
  const C = 2 * Math.PI * R;
  const fx = (k: string) => scene.fx.includes(k);
  const status = scene.status ?? ['STATUS: TENSION', 'STATUS: RELEASED'];

  const corner = (x: number, y: number, sx: number, sy: number) => (
    <path d={`M${x} ${y + 60 * sy}V${y}H${x + 60 * sx}`} fill="none" stroke={col} strokeWidth={3} />
  );

  // altyazı: cümle cümle, kelime sayısına göre zamanlanır
  const sents = scene.vo.split(/(?<=[.!?])\s+/);
  const words = sents.map((s) => s.split(' ').length);
  const sumW = words.reduce((a, b) => a + b, 0);
  const f = clamp01((frame - 20) / (total * 0.92 - 20));
  let acc = 0;
  let idx = sents.length - 1;
  for (let i = 0; i < sents.length; i++) {
    acc += words[i] / sumW;
    if (f <= acc) {
      idx = i;
      break;
    }
  }
  const lines = wrap(sents[idx], 62);

  const heroOp = scene.hero ? clamp01((t - 0.55) * 6) * clamp01((0.97 - t) * 20) : 0;
  const protoOp = clamp01((t - 0.12) * 8);
  const discOp = scene.disclaimer ? clamp01((t - 0.45) * 6) : 0;

  return (
    <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}} opacity={fade}>
      <g stroke="#7fd8ff" strokeOpacity={0.05}>
        {Array.from({length: 24}, (_, i) => <line key={'v' + i} x1={i * 80} y1={0} x2={i * 80} y2={1080} />)}
        {Array.from({length: 14}, (_, i) => <line key={'h' + i} x1={0} y1={i * 80} x2={1920} y2={i * 80} />)}
      </g>
      {corner(40, 40, 1, 1)}
      {corner(1880, 40, -1, 1)}
      {corner(40, 1040, 1, -1)}
      {corner(1880, 1040, -1, -1)}

      <text x={90} y={100} fill="#cfefff" fontFamily={F} fontSize={22} letterSpacing={3}>
        SCENE {String(index + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
      </text>
      <text x={90} y={146} fill="#ffffff" fontFamily={F} fontSize={40} fontWeight={700}>{scene.title}</text>
      <text x={90} y={186} fill={col} fontFamily={F} fontSize={22} letterSpacing={3}>
        {p < 0.5 ? status[0] : status[1]}
      </text>

      {m && (
        <g transform="translate(1500 90)">
          <text fill="#9fc3d6" fontFamily={F} fontSize={20} letterSpacing={3}>{m.label}</text>
          <text y={64} fill={col} fontFamily={F} fontSize={60} fontWeight={700}>
            {Number.isInteger(m.from) && Number.isInteger(m.to) ? Math.round(lerp(m.from, m.to, p)) : lerp(m.from, m.to, p).toFixed(1)}
            {m.unit}
          </text>
          <rect y={86} width={320} height={6} fill="#ffffff" fillOpacity={0.12} />
          <rect y={86} width={320 * clamp01(Math.abs(lerp(m.from, m.to, p) - m.from) / (Math.abs(m.to - m.from) || 1))} height={6} fill={col} />
        </g>
      )}

      <g transform="translate(1760 900)">
        <circle r={R} fill="none" stroke="#ffffff" strokeOpacity={0.12} strokeWidth={8} />
        <circle r={R} fill="none" stroke={col} strokeWidth={8} strokeDasharray={`${C * p} ${C}`} transform="rotate(-90)" strokeLinecap="round" />
        <text textAnchor="middle" y={8} fill="#fff" fontFamily={F} fontSize={22}>{Math.round(p * 100)}%</text>
      </g>

      {/* hero title */}
      {scene.hero && (
        <text x={960} y={880} textAnchor="middle" fill="#fff" fontFamily={F} fontSize={72} fontWeight={700}
          opacity={heroOp} stroke="#000" strokeWidth={8} paintOrder="stroke">
          {scene.hero}
        </text>
      )}

      {/* protocol box */}
      {scene.protocol && (
        <g opacity={protoOp} transform="translate(90 840)">
          <rect width={scene.protocol.length * 14.5 + 70} height={52} fill="#000" fillOpacity={0.55} stroke={col} strokeWidth={2} />
          <text x={20} y={34} fill="#fff" fontFamily={F} fontSize={24}>{scene.protocol}</text>
        </g>
      )}

      {/* 30 dakikalık mola zaman çizelgesi */}
      {fx('microbreak') && (
        <g transform="translate(360 790)">
          <line x1={0} y1={0} x2={1200} y2={0} stroke="#9fc3d6" strokeOpacity={0.5} strokeWidth={3} />
          {[0, 30, 60, 90, 120].map((mm, i) => (
            <g key={mm} transform={`translate(${i * 300} 0)`}>
              <line y1={-12} y2={12} stroke="#cfefff" strokeWidth={3} />
              <text y={40} textAnchor="middle" fill="#9fc3d6" fontFamily={F} fontSize={20}>{mm} min</text>
            </g>
          ))}
          <circle cx={1200 * t} cy={0} r={12 + 6 * Math.abs(Math.sin(frame * 0.2))} fill={col} />
        </g>
      )}

      {/* 4 haftalık ilerleme */}
      {fx('weeks') && (
        <g transform="translate(660 790)">
          <line x1={0} y1={0} x2={660} y2={0} stroke="#9fc3d6" strokeOpacity={0.4} strokeWidth={3} />
          <line x1={0} y1={0} x2={660 * clamp01(p)} y2={0} stroke={col} strokeWidth={5} />
          {[0, 1, 2, 3].map((i) => (
            <g key={i} transform={`translate(${i * 220} 0)`}>
              <circle r={16} fill={p * 3 >= i - 0.05 ? col : '#0a0f14'} stroke={col} strokeWidth={3} />
              <text y={50} textAnchor="middle" fill="#cfefff" fontFamily={F} fontSize={20}>Week {i + 1}</text>
            </g>
          ))}
        </g>
      )}

      {/* uyarı */}
      {scene.disclaimer && (
        <g opacity={discOp} fontFamily={F} fontSize={22} fill="#cfefff" textAnchor="middle" stroke="#000" strokeWidth={5} paintOrder="stroke">
          <text x={960} y={870}>This video is for education only and is not medical advice.</text>
          <text x={960} y={902}>If numbness, tingling or pain persists, see a qualified health professional.</text>
        </g>
      )}

      {/* altyazı */}
      {!scene.disclaimer || t < 0.45 || true ? (
        <g fontFamily={F} fontSize={30} fill="#ffffff" textAnchor="middle" stroke="#000" strokeWidth={6} paintOrder="stroke">
          {lines.map((ln, i) => (
            <text key={i} x={960} y={1000 - (lines.length - 1 - i) * 38}>{ln}</text>
          ))}
        </g>
      ) : null}
    </svg>
  );
};
