import React from 'react';
import {Posture, buildSpine, lerpColor, clamp01, lerp} from './posture';
import {Scene, COLORS} from './scenes';

type Props = {post: Posture; yaw: number; p: number; t: number; frame: number; scene: Scene};

const RAD = Math.PI / 180;
const BASE = '#33566b';
const DIM = '#2a4a5c';

export const Figure: React.FC<Props> = ({post, yaw, p, t, frame, scene}) => {
  const pts = buildSpine(post);
  const cy = Math.cos(yaw);
  const sy = Math.sin(yaw);
  // 3D -> 2D world (screen y is down)
  const P = (x: number, y: number, z = 0): [number, number] => [x * cy + z * sy, -y];
  const str = (arr: [number, number][]) => arr.map((q) => q.join(',')).join(' ');
  const c = lerpColor(scene.tense, scene.calm, p);
  const fx = (k: string) => scene.fx.includes(k);
  const focused = (i: number) => scene.focus === 'all' || scene.focus.includes(i);
  const colorOf = (i: number) => {
    if (fx('wave')) return lerpColor(scene.tense, scene.calm, clamp01(p * 2.2 - (i / 23) * 1.2));
    return focused(i) ? c : BASE;
  };

  // head
  const last = pts[23];
  const topX = last.x + 15 * Math.sin(last.a * RAD);
  const topY = last.y + 15 * Math.cos(last.a * RAD);
  const ah = last.a * 0.85;
  const hx = topX + 34 * Math.sin(ah * RAD);
  const hy = topY + 34 * Math.cos(ah * RAD);
  const nose = P(hx + 38 * Math.cos(ah * RAD), hy - 38 * Math.sin(ah * RAD));
  const [HX, HY] = P(hx, hy);

  // shoulders
  const sp = pts[15];
  const sx = sp.x + post.round;
  const sY = sp.y + post.elev * 0.8;
  const SL = P(sx, sY, -46);
  const SR = P(sx, sY, 46);

  // rib rings
  const ribColor = fx('ribs') ? c : fx('ribGreen') ? lerpColor(DIM, COLORS.green, p) : DIM;
  const rings = [6, 8, 10, 12, 14].map((i, k) => {
    const q = pts[i];
    const rx = [38, 46, 50, 46, 38][k] * post.breath;
    const rz = rx * 1.1;
    const poly: [number, number][] = [];
    for (let t = 0; t <= 24; t++) {
      const th = (t / 24) * Math.PI * 2;
      poly.push(P(q.x + rx * 0.8 + rx * Math.cos(th), q.y, rz * Math.sin(th)));
    }
    return poly;
  });

  // pelvis ring
  const pelvis: [number, number][] = [];
  for (let t = 0; t <= 24; t++) {
    const th = (t / 24) * Math.PI * 2;
    const X = 26 * Math.cos(th);
    pelvis.push(P(pts[0].x + X, pts[0].y - X * Math.sin(post.tilt * RAD), 40 * Math.sin(th)));
  }

  const front = (i: number, off: number): [number, number] => {
    const q = pts[i];
    return [q.x + off * Math.cos(q.a * RAD), q.y - off * Math.sin(q.a * RAD)];
  };

  const bodyVis = fx('assemble') ? clamp01((t - 0.35) / 0.3) : 1;
  // desk scene
  const monitorY = lerp(250, hy, p);

  return (
    <g>
      <g opacity={bodyVis}>
      {/* body volume */}
      <polyline
        points={str(pts.map((q) => P(q.x + 12, q.y)))}
        fill="none" stroke="#7fd8ff" strokeOpacity={0.07} strokeWidth={96}
        strokeLinecap="round" strokeLinejoin="round"
      />
      <circle cx={HX} cy={HY} r={36} fill="#7fd8ff" fillOpacity={0.06} stroke="#7fd8ff" strokeOpacity={0.35} strokeWidth={1.5} />
      <line x1={HX} y1={HY} x2={nose[0]} y2={nose[1]} stroke="#7fd8ff" strokeOpacity={0.5} strokeWidth={2} />

      {/* ribs and pelvis */}
      {rings.map((poly, k) => (
        <polyline key={k} points={str(poly)} fill="none" stroke={ribColor} strokeOpacity={0.7} strokeWidth={2.5} />
      ))}
      <polyline points={str(pelvis)} fill="none" stroke={fx('pelvis') ? c : DIM} strokeWidth={3} strokeOpacity={0.9}
        filter={fx('pelvis') ? 'url(#glow)' : undefined} />

      </g>
      {/* vertebrae */}
      {pts.map((q, i) => {
        const L = i < 5 ? 24 : i < 17 ? 20 : 15;
        const w = i < 5 ? 30 : i < 17 ? 26 : 20;
        const [X, Y] = P(q.x + (L / 2) * Math.sin(q.a * RAD), q.y + (L / 2) * Math.cos(q.a * RAD));
        const col = colorOf(i);
        const lit = fx('wave') || focused(i);
        const vis = fx('assemble') ? clamp01((t / 0.55) * 26 - i) : 1;
        return (
          <rect key={i} x={-w / 2} y={-(L * 0.72) / 2} width={w} height={L * 0.72} rx={4}
            transform={`translate(${X} ${Y}) rotate(${q.a * cy})`}
            opacity={vis} fill={col} fillOpacity={lit ? 0.85 : 0.45} stroke={col} strokeWidth={1.5}
            filter={lit ? 'url(#glow)' : undefined} />
        );
      })}

      {/* shoulders */}
      {(fx('shoulders') || fx('levator') || fx('pecMinor')) && (
        <g stroke={fx('levator') || fx('pecMinor') ? c : fx('lowerTraps') ? COLORS.green : BASE} strokeWidth={5} strokeLinecap="round">
          <line x1={SL[0]} y1={SL[1]} x2={SR[0]} y2={SR[1]} />
          <circle cx={SL[0]} cy={SL[1]} r={8} fill="#0a0f14" />
          <circle cx={SR[0]} cy={SR[1]} r={8} fill="#0a0f14" />
        </g>
      )}

      {/* phone (scene 1) */}
      {fx('phone') && (
        <rect x={-13} y={-23} width={26} height={46} rx={5} fill="#0a0f14" stroke="#cfefff" strokeWidth={2}
          transform={`translate(${P(hx + 85, hy - 85)[0]} ${P(hx + 85, hy - 85)[1]}) rotate(25)`} />
      )}

      {/* suboccipital muscles, fingers, blood flow */}
      {fx('suboccipital') && (
        <g>
          {[-1, 1].map((s) => {
            const a = P(topX, topY, 0);
            const b = P(hx - 26, hy - 8 * s, 18 * s);
            return <line key={s} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={c} strokeWidth={7} strokeLinecap="round" filter="url(#glow)" />;
          })}
          {[-12, 12].map((z) => {
            const q = P(topX - 6, topY + 4, z);
            return <circle key={z} cx={q[0]} cy={q[1]} r={7 + 2 * Math.sin(frame * 0.3)} fill="#fff" fillOpacity={0.9} />;
          })}
        </g>
      )}
      {fx('blood') && (
        <g opacity={p}>
          {[-22, -11, 11, 22].map((z) => (
            <polyline key={z} points={str(pts.slice(17).map((q) => P(q.x - 10, q.y, z)))}
              fill="none" stroke={COLORS.red} strokeWidth={3} strokeDasharray="8 10"
              strokeDashoffset={-frame * 2} filter="url(#glow)" />
          ))}
        </g>
      )}

      {/* deep neck flexors */}
      {fx('deepFlexors') && (
        <polyline points={str(pts.slice(17).map((q, i) => P(...front(17 + i, 13))))}
          fill="none" stroke={c} strokeWidth={9} strokeLinecap="round" filter="url(#glow)" />
      )}

      {/* levator scapulae */}
      {fx('levator') &&
        [-1, 1].map((s) => {
          const a = P(pts[21].x, pts[21].y, 8 * s);
          const b = s < 0 ? SL : SR;
          return <line key={s} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={c} strokeWidth={8} strokeLinecap="round" filter="url(#glow)" />;
        })}

      {/* scalenes + brachial plexus */}
      {fx('scalenes') &&
        [-1, 1].map((s) => {
          const f = front(19, 10);
          const a = P(f[0], f[1], 8 * s);
          const b = P(pts[16].x + 26, pts[16].y - 20, 30 * s);
          const n = P(pts[16].x + 20, pts[16].y - 10, 34 * s);
          const nb = P(sx + 10, sY - 30, 60 * s);
          return (
            <g key={s}>
              <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={c} strokeWidth={7} strokeLinecap="round" filter="url(#glow)" />
              <polyline points={str([a, n, nb])} fill="none" stroke={COLORS.yellow} strokeWidth={3} strokeLinecap="round" />
            </g>
          );
        })}

      {/* pec minor */}
      {fx('pecMinor') &&
        [-1, 1].map((s) => {
          const f = front(11, 46 * post.breath);
          const a = P(f[0], f[1], 20 * s);
          const b = s < 0 ? SL : SR;
          return <line key={s} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={c} strokeWidth={9} strokeLinecap="round" filter="url(#glow)" />;
        })}

      {/* lower trapezius V + scapulae */}
      {fx('lowerTraps') && (
        <g>
          {[-1, 1].map((s) => {
            const a = P(pts[7].x, pts[7].y, 0);
            const b = s < 0 ? SL : SR;
            const sc = P(sx - 8, sY - 45, 30 * s);
            return (
              <g key={s}>
                <polyline points={str([a, sc, b])} fill={COLORS.green} fillOpacity={0.12 + 0.2 * p}
                  stroke={COLORS.green} strokeWidth={4} filter="url(#glow)" />
                <ellipse cx={sc[0]} cy={sc[1]} rx={10} ry={28} fill={COLORS.green} fillOpacity={0.5}
                  transform={`rotate(${lerp(18, 2, p) * s} ${sc[0]} ${sc[1]})`} />
              </g>
            );
          })}
        </g>
      )}

      {/* vertical alignment line + reticle */}
      {fx('plumb') && (
        <g>
          <line x1={P(sx, 0)[0]} y1={P(0, -40)[1]} x2={P(sx, 0)[0]} y2={P(0, hy + 90)[1]}
            stroke={fx('reticle') ? lerpColor(COLORS.orange, COLORS.cyan, p) : COLORS.green}
            strokeWidth={3} filter="url(#glow)" />
          <line x1={HX} y1={HY} x2={P(sx, 0)[0]} y2={HY} stroke="#cfefff" strokeWidth={1.5} strokeDasharray="5 5" />
        </g>
      )}
      {fx('reticle') && (
        <g transform={`translate(${HX} ${HY})`}>
          <circle r={50} fill="none" stroke={COLORS.cyan} strokeWidth={2} strokeDasharray="14 10" transform={`rotate(${frame * 2})`} />
          <path d="M-64 0H-36M36 0H64M0 -64V-36M0 36V64" stroke={COLORS.cyan} strokeWidth={2} />
        </g>
      )}

      {/* desk, monitor, gaze line */}
      {fx('screen') && (
        <g>
          <line x1={140} y1={-205} x2={430} y2={-205} stroke="#6a8aa0" strokeWidth={6} />
          <line x1={400} y1={-205} x2={400} y2={0} stroke="#3a5566" strokeWidth={4} />
          <line x1={330} y1={-205} x2={330} y2={-monitorY + 60} stroke="#6a8aa0" strokeWidth={5} />
          <rect x={322} y={-monitorY - 60} width={16} height={120} rx={3} fill="#0a0f14" stroke="#cfefff" strokeWidth={2} />
          <line x1={P(hx + 30, hy)[0]} y1={P(hx + 30, hy)[1]} x2={322} y2={-monitorY}
            stroke={lerpColor(COLORS.orange, COLORS.green, p)} strokeWidth={3} filter="url(#glow)" />
        </g>
      )}

      {/* damage-map callouts */}
      {fx('callouts') &&
        [
          ['Forward head', HX, HY],
          ['Rounded shoulders', P(sx, sY)[0], P(sx, sY)[1]],
          ['Stiff mid-back', P(pts[10].x, pts[10].y)[0], P(pts[10].x, pts[10].y)[1]],
          ['Tilted pelvis', P(pts[0].x, pts[0].y)[0], P(pts[0].x, pts[0].y)[1]],
        ].map(([label, ax, ay], k) => {
          const op = clamp01((t - 0.12 - k * 0.12) * 8);
          return (
            <g key={k} opacity={op}>
              <line x1={ax as number} y1={ay as number} x2={230} y2={ay as number} stroke={COLORS.red} strokeWidth={1.5} strokeDasharray="4 4" />
              <circle cx={ax as number} cy={ay as number} r={5} fill={COLORS.red} />
              <text x={238} y={(ay as number) + 6} fill="#ff9a9a" fontFamily="Menlo, Consolas, monospace" fontSize={18}>{label}</text>
            </g>
          );
        })}
    </g>
  );
};
