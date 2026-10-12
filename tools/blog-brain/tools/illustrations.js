#!/usr/bin/env node
/*
 * illustrations.js: flat spot illustrations for feature cards, drawn as inline SVG.
 *
 * Usage, in a spec or a tool:
 *
 *   const { illustration, ILLUSTRATION_NAMES } = require("<blog-brain>/tools/illustrations.js");
 *   illustration("indoor-pool")                  // <svg viewBox="0 0 240 180" role="img" aria-label="...">...</svg>
 *   illustration("beach", { decorative: true })  // aria-hidden, for a card whose label says the same
 *   illustration("dock", { width: 320 })         // sets width and height (4:3)
 *
 *   node tools/illustrations.js                  // prints every name, its alt text and its size
 *   node tools/illustrations.js --write <dir>    // writes <name>.svg files, for review or for an <img>
 *
 * Rules the drawings keep:
 *   - Made by Chapter3 for Chapter3 pages. No traced photo, no logo, no brand, no face.
 *     No person at all: a leash runs out of the frame, a chair is empty.
 *   - The hospital sign is a navy "H", never a red cross. The red cross emblem is
 *     protected by federal law (18 U.S.C. 706).
 *   - The site palette: navy, brass, brass ink, ivory, a soft water blue and a soft green,
 *     plus four small accents (a ball, an apple, coffee). Every color is in PALETTE.
 *   - 240 by 180 (4:3). Flat fills; lines are navy or brass at about 2 px with round caps.
 *     The same sky, sun, cloud, tree and ground in every scene. No gradients, no text and no
 *     ids, so any number of drawings can sit on one page without a clash.
 *   - Each one is under 8 KB.
 *   - An unknown name throws.
 */
"use strict";

const C = {
  navy: "#1c2028", navy2: "#2a3040", brass: "#c4783a", brass2: "#d4894a", ink: "#91592b", tan: "#d9b48a",
  ivory: "#f4efe8", ivory2: "#ede5d8", cream: "#fbf8f2", sand: "#eedcbd", sand2: "#e2c69b",
  sky: "#e2ebe9", sun: "#f3d6b1", water: "#9fc6ce", water2: "#80b1bc", water3: "#c6e0e3",
  green: "#adc391", green2: "#87a570", green3: "#cddcb3", green4: "#6f8f5f", slate: "#5c6b78",
  ball: "#e6cf68", apple: "#b5523a", apple2: "#cf7055", coffee: "#6b4a2e",
};

/* Small builders. Numbers are kept short so every drawing stays small. */
const n = (v) => +(+v).toFixed(1);
const R = (x, y, w, h, f, rx) => `<rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}"${rx ? ` rx="${rx}"` : ""} fill="${f}"/>`;
const P = (d, f) => `<path d="${d}" fill="${f}"/>`;
const O = (cx, cy, r, f) => `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(r)}" fill="${f}"/>`;
const E = (cx, cy, rx, ry, f) => `<ellipse cx="${n(cx)}" cy="${n(cy)}" rx="${n(rx)}" ry="${n(ry)}" fill="${f}"/>`;
const L = (d, c = C.navy, w = 2) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const G = (t, body) => `<g transform="${t}">${body}</g>`;
const SR = (x, y, w, h, c, sw = 1.2, rx = 0) => `<rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}"${rx ? ` rx="${rx}"` : ""} fill="none" stroke="${c}" stroke-width="${sw}"/>`;
const SO = (cx, cy, r, c, sw = 1.2) => `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(r)}" fill="none" stroke="${c}" stroke-width="${sw}"/>`;

const sky = (f = C.sky) => R(0, 0, 240, 180, f);
const sun = (cx = 186, cy = 46, r = 20) => O(cx, cy, r, C.sun);
const cloud = (x, y, s = 1) => R(x, y - 6 * s, 40 * s, 12 * s, C.cream, 6 * s) + O(x + 15 * s, y - 7 * s, 9 * s, C.cream) + O(x + 26 * s, y - 5 * s, 7 * s, C.cream);
const bird = (x, y, s = 1) => L(`M${n(x - 5 * s)} ${n(y - 2 * s)}q${n(2.5 * s)} ${n(-2 * s)} ${n(5 * s)} ${n(2 * s)}q${n(2.5 * s)} ${n(-4 * s)} ${n(5 * s)} ${n(-2 * s)}`, C.slate, 1.6);

/* A band of water or land across the frame, its top edge a gentle wave. */
function band(y, amp, waves, f, x0 = 0, x1 = 240, bottom = 180) {
  const step = (x1 - x0) / waves;
  let d = `M${x0} ${y}`;
  for (let i = 0; i < waves; i++) d += `q${n(step / 2)} ${n(i % 2 ? amp : -amp)} ${n(step)} 0`;
  return P(`${d}V${bottom}H${x0}Z`, f);
}
/* Short white ripple strokes on water. */
const ripples = (pts, c = C.cream, w = 2) => pts.map(([x, y, l]) => L(`M${x} ${y}h${l}`, c, w)).join("");

/* A round tree: trunk and a three-lobed canopy with a light side. */
function tree(x, base, s = 1, f = C.green2, hi = C.green) {
  const t = R(x - 2.5 * s, base - 18 * s, 5 * s, 18 * s, C.ink, 1);
  return t + O(x - 9 * s, base - 26 * s, 11 * s, f) + O(x + 9 * s, base - 26 * s, 11 * s, f) + O(x, base - 38 * s, 14 * s, f)
    + O(x - 4 * s, base - 41 * s, 7 * s, hi);
}
/* A pine: a trunk and three stacked triangles. */
function pine(x, base, s = 1, f = C.green4) {
  const tri = (y, w, h) => P(`M${n(x)} ${n(y - h)}L${n(x + w)} ${n(y)}H${n(x - w)}Z`, f);
  return R(x - 2 * s, base - 10 * s, 4 * s, 10 * s, C.ink) + tri(base - 8 * s, 14 * s, 22 * s) + tri(base - 20 * s, 11 * s, 20 * s) + tri(base - 31 * s, 8 * s, 17 * s);
}
/* A palmetto: a gently curved trunk and fronds fanned from the crown. */
function palm(x, base, s = 1, lean = 4) {
  const top = [x + lean * s, base - 60 * s];
  const trunk = P(`M${n(x - 3 * s)} ${n(base)}Q${n(x + lean * 0.2 * s - 2 * s)} ${n(base - 30 * s)} ${n(top[0] - 2 * s)} ${n(top[1])}h${n(4 * s)}Q${n(x + lean * 0.2 * s + 2 * s)} ${n(base - 30 * s)} ${n(x + 3 * s)} ${n(base)}Z`, C.ink);
  const fr = [[-34, 8], [-26, -10], [-10, -20], [10, -20], [26, -10], [34, 8]].map(([dx, dy], i) => {
    const ex = top[0] + dx * s, ey = top[1] + dy * s, mx = top[0] + dx * 0.55 * s, my = top[1] + (dy - 10) * s;
    return P(`M${n(top[0])} ${n(top[1])}Q${n(mx)} ${n(my - 4 * s)} ${n(ex)} ${n(ey)}Q${n(mx)} ${n(my + 6 * s)} ${n(top[0])} ${n(top[1])}Z`, i % 2 ? C.green2 : C.green4);
  }).join("");
  return trunk + fr + O(top[0], top[1], 3 * s, C.ink);
}
/* A bush: two overlapping circles. */
const bush = (x, y, s = 1, f = C.green2) => O(x - 6 * s, y, 8 * s, f) + O(x + 5 * s, y - 2 * s, 9 * s, f) + O(x + 1 * s, y - 6 * s, 4 * s, C.green);

/* ---------------------------------------------------------------------------- */

const DRAW = {};
const ALT = {};

/* A row of floats on a pool lane line, from (x1,y1) to (x2,y2). */
function laneRope(x1, y1, x2, y2, k) {
  let s = "";
  for (let i = 0; i <= k; i++) s += O(x1 + (x2 - x1) * i / k, y1 + (y2 - y1) * i / k, 1.9, i % 2 ? C.cream : C.brass);
  return s;
}
/* A lounge chair, side view, back raised at the right. */
function lounger(x, y, f = C.brass2) {
  return E(x + 20, y + 15, 24, 2.5, C.ivory2) + L(`M${x + 3} ${y + 4}v10M${x + 30} ${y + 4}v10`, C.navy, 2)
    + P(`M${x - 2} ${y}H${x + 30}L${x + 41} ${y - 15}L${x + 45} ${y - 12}L${x + 34} ${y + 4}H${x - 2}Z`, f)
    + L(`M${x + 6} ${y + 2}H${x + 28}`, C.cream, 1.2);
}

ALT["indoor-pool"] = "Drawing of an indoor pool under a high roof with tall windows";
DRAW["indoor-pool"] = () => {
  let s = R(0, 0, 240, 180, C.ivory2);
  s += P("M0 0H240V30L120 8L0 30Z", C.cream);
  s += L("M0 30L120 8L240 30M60 19V30M120 8V30M180 19V30M0 30H240", C.ink, 2);
  for (const x of [22, 72, 122, 172]) {
    s += R(x, 42, 46, 62, C.cream, 3) + R(x + 4, 46, 38, 54, C.water3, 2);
    s += O(x + 14, 92, 10, C.green) + O(x + 30, 94, 9, C.green2) + R(x + 4, 96, 38, 4, C.green2);
    s += L(`M${x + 23} 46V100M${x + 4} 70H${x + 42}`, C.cream, 2);
  }
  s += R(0, 108, 240, 72, C.sand) + R(0, 108, 240, 3, C.sand2);
  s += P("M14 122H226L234 170H6Z", C.water2) + P("M20 126H220L226 166H14Z", C.water);
  s += ripples([[34, 140, 18], [96, 152, 22], [150, 136, 16], [184, 156, 18], [56, 160, 12]]);
  s += laneRope(80, 126, 76, 166, 10) + laneRope(160, 126, 164, 166, 10);
  s += L("M204 110V134M218 110V134M204 117H218M204 125H218", C.navy, 2.2);
  s += R(26, 112, 30, 7, C.cream, 2) + R(30, 113, 22, 2, C.water2);
  return s;
};

ALT["outdoor-pool"] = "Drawing of an outdoor pool with lounge chairs and a beach umbrella";
DRAW["outdoor-pool"] = () => {
  let s = sky() + sun(122, 34, 16) + cloud(150, 40, 0.8);
  s += band(92, 3, 4, C.green3) + palm(28, 104, 1.05, 5) + palm(232, 104, 0.8, -4);
  s += R(0, 96, 240, 10, C.green2) + O(12, 98, 7, C.green2) + O(60, 97, 8, C.green2) + O(170, 97, 8, C.green2) + O(206, 98, 7, C.green2);
  s += R(0, 104, 240, 76, C.sand) + L("M0 120H240M0 140H240M0 160H240M40 104V180M100 104V180M160 104V180M220 104V180", C.sand2, 1);
  s += R(10, 116, 136, 52, C.cream, 10) + R(15, 121, 126, 42, C.water, 6);
  s += P("M15 141h126v16a6 6 0 0 1-6 6H21a6 6 0 0 1-6-6Z", C.water2);
  s += ripples([[28, 131, 18], [72, 127, 22], [98, 151, 18], [40, 155, 14]]);
  s += L("M122 110V128M130 110V128M122 116H130", C.navy, 2);
  s += L("M196 76V150", C.navy, 2.2) + E(196, 152, 12, 2.5, C.sand2);
  s += P("M164 86Q196 56 228 86Z", C.brass) + P("M186 86Q196 56 206 86Z", C.cream) + R(164, 85, 64, 3, C.ink, 1.5);
  s += lounger(156, 150).replace(C.ivory2, C.sand2) + lounger(184, 162, C.brass).replace(C.ivory2, C.sand2);
  s += R(160, 145, 18, 4, C.cream, 2);
  return s;
};

ALT["clubhouse"] = "Drawing of a clubhouse with a porch, palm trees and a path to the door";
DRAW["clubhouse"] = () => {
  let s = sky() + sun(42, 38, 16) + cloud(170, 30, 0.9);
  s += band(110, 3, 3, C.green3) + R(0, 120, 240, 60, C.green);
  s += palm(22, 128, 0.9, 4) + palm(220, 128, 0.95, -4);
  s += R(44, 70, 152, 54, C.cream) + P("M36 72L76 46H164L204 72Z", C.ink) + R(36, 72, 168, 3, C.brass);
  s += P("M94 66L120 38L146 66Z", C.brass) + R(96, 66, 48, 58, C.cream) + R(94, 66, 52, 4, C.ink);
  s += O(120, 54, 6, C.water3) + L("M120 48v12M114 54h12", C.cream, 1.6);
  s += R(110, 92, 20, 32, C.navy2, 2) + R(112, 94, 7, 28, C.water2, 1) + R(121, 94, 7, 28, C.water2, 1);
  for (const x of [54, 76, 150, 172]) s += R(x, 82, 14, 20, C.water2, 1.5) + L(`M${x + 7} 82v20M${x} 92h14`, C.cream, 1.6) + R(x - 2, 102, 18, 3, C.ivory2);
  s += R(98, 70, 4, 50, C.ivory2) + R(138, 70, 4, 50, C.ivory2) + R(40, 120, 160, 6, C.ivory2);
  s += P("M108 126H132L150 180H90Z", C.sand);
  s += bush(64, 128, 1) + bush(86, 130, 0.8) + bush(156, 130, 0.8) + bush(178, 128, 1);
  return s;
};

ALT["golf-cart"] = "Drawing of a golf cart on a cart path, with a flag on the green behind";
DRAW["golf-cart"] = () => {
  let s = sky() + sun(44, 36, 15) + cloud(96, 28, 0.8);
  s += band(90, 6, 2, C.green3) + band(106, 5, 3, C.green) + E(184, 100, 30, 6, C.green3);
  s += L("M190 100V62", C.navy, 2) + P("M190 62l16 5l-16 5Z", C.brass) + E(190, 100, 3, 1.2, C.navy2);
  s += tree(22, 104, 0.8) + pine(226, 98, 0.8);
  s += P("M0 146Q120 126 240 142V180H0Z", C.sand) + P("M0 166Q120 150 240 160V180H0Z", C.green2);
  s += E(120, 156, 66, 4, C.sand2);
  s += R(66, 64, 108, 7, C.brass, 3) + R(70, 70, 100, 2, C.ink);
  s += L("M82 72V118", C.navy, 2.6) + L("M160 72L150 112", C.navy, 2.6);
  s += P("M160 74L170 74L160 112L151 112Z", C.water3);
  s += P("M64 118H150Q158 104 170 104H176Q182 104 182 112V146H62V124Q62 118 68 118Z", C.cream);
  s += R(62, 136, 120, 4, C.ivory2);
  s += R(88, 110, 44, 8, C.navy2, 3) + R(86, 92, 9, 24, C.navy2, 3);
  s += L("M146 114L138 100", C.navy, 2.4) + E(138, 99, 6, 2, C.navy);
  s += R(58, 88, 14, 40, C.ink, 4) + R(56, 86, 18, 6, C.brass2, 2) + L("M61 86V76M65 86V74M69 86V78", C.slate, 2);
  s += P("M60 76h3v3h-3ZM64 72h3v3h-3ZM68 76h3v3h-3Z", C.brass);
  for (const x of [86, 158]) s += O(x, 146, 12, C.navy) + O(x, 146, 5, C.ivory2);
  return s;
};

ALT["pickleball"] = "Drawing of a pickleball court with a net, a paddle and a ball";
DRAW["pickleball"] = () => {
  let s = sky() + cloud(86, 26, 0.8) + R(0, 58, 240, 122, C.green);
  s += tree(30, 62, 0.75) + tree(66, 60, 0.6, C.green4, C.green2) + tree(204, 62, 0.8) + pine(172, 60, 0.7);
  s += L("M0 50H240M20 50V62M70 50V62M120 50V62M170 50V62M220 50V62", C.slate, 1.4);
  s += P("M60 66H180L222 172H18Z", C.water2) + P("M70 72H170L206 164H34Z", C.water);
  s += L("M70 72H170L206 164H34ZM120 72V96M120 128V164M60 96H180M52 128H188", C.cream, 2);
  s += P("M48 104H192V114H48Z", C.navy2) + L("M48 104H192", C.cream, 2);
  let mesh = ""; for (let x = 56; x < 192; x += 14) mesh += `M${x} 106V114`;
  s += L(mesh, C.slate, 1) + R(44, 98, 4, 18, C.navy) + R(192, 98, 4, 18, C.navy);
  s += E(176, 172, 18, 3, C.green2);
  s += G("rotate(-28 186 150)", R(170, 124, 32, 36, C.brass, 12) + R(173, 127, 26, 30, C.brass2, 10) + R(182, 158, 8, 20, C.navy, 3));
  s += O(146, 160, 7, C.ball) + O(144, 158, 1.3, C.ink) + O(149, 161, 1.3, C.ink) + O(144, 163, 1.3, C.ink);
  return s;
};

ALT["bocce"] = "Drawing of a bocce court with balls on the sand and trees behind";
DRAW["bocce"] = () => {
  let s = sky() + sun(198, 36, 15) + cloud(70, 30, 0.8);
  s += band(70, 4, 3, C.green3) + tree(30, 80, 0.85) + tree(62, 76, 0.65, C.green4, C.green2) + pine(196, 78, 0.75) + tree(222, 80, 0.7);
  s += R(0, 78, 240, 102, C.green);
  s += P("M84 78H156L214 176H26Z", C.ink) + P("M90 82H150L202 170H38Z", C.sand);
  s += L("M60 140H180M80 104H160", C.sand2, 2);
  const ball = (x, y, r, f, hi) => E(x + 2, y + r - 1, r, r * 0.3, C.sand2) + O(x, y, r, f) + O(x - r * 0.35, y - r * 0.35, r * 0.3, hi);
  s += ball(118, 104, 3.6, C.cream, C.cream) + SO(118, 104, 3.6, C.ink, 1);
  s += ball(98, 118, 8, C.brass, C.brass2) + ball(140, 126, 8, C.navy2, C.slate) + ball(110, 146, 9.5, C.brass, C.brass2) + ball(160, 154, 9.5, C.navy2, C.slate);
  return s;
};

ALT["beach"] = "Drawing of a beach with a striped umbrella, a chair and small waves";
DRAW["beach"] = () => {
  let s = sky() + sun(188, 42, 20) + cloud(20, 30, 0.9) + bird(76, 34) + bird(92, 42, 0.8);
  s += R(0, 82, 240, 40, C.water2) + band(92, 2, 6, C.water) + band(112, 3, 5, C.water3) + band(118, 3, 4, C.sand);
  s += L("M14 104h16M150 98h22M196 108h16M64 112h18", C.cream, 2);
  s += E(112, 162, 30, 4, C.sand2);
  s += L("M96 74L104 162", C.navy, 2.4);
  const apex = [96, 52], bot = [[50, 92], [73, 88], [96, 86], [119, 88], [142, 92]];
  for (let i = 0; i < 4; i++) {
    const [a, b] = [bot[i], bot[i + 1]];
    const ca = [apex[0] + (a[0] - apex[0]) * 1.08, apex[1] + (a[1] - apex[1]) * 0.35];
    const cb = [apex[0] + (b[0] - apex[0]) * 1.08, apex[1] + (b[1] - apex[1]) * 0.35];
    s += P(`M${apex[0]} ${apex[1]}Q${n(ca[0])} ${n(ca[1])} ${a[0]} ${a[1]}Q${n((a[0] + b[0]) / 2)} ${n(Math.max(a[1], b[1]) - 7)} ${b[0]} ${b[1]}Q${n(cb[0])} ${n(cb[1])} ${apex[0]} ${apex[1]}Z`, i % 2 ? C.cream : C.brass);
  }
  s += O(96, 51, 3, C.ink);
  // a low beach chair facing the water: frame, then the striped sling
  s += E(150, 166, 22, 3, C.sand2);
  s += L("M134 130L150 166M140 152H170L176 166M146 152L136 166", C.navy, 2.2);
  s += P("M134 130L141 128L154 150L146 152Z", C.brass) + P("M146 152H168L167 156H147Z", C.brass);
  s += P("M137.5 129.2L139.5 128.6L152 150.5L150 151Z", C.cream);
  s += G("rotate(-6 54 150)", R(28, 142, 50, 18, C.water2, 2) + R(28, 147, 50, 3, C.cream) + R(28, 153, 50, 3, C.cream));
  s += L("M202 168q4 -16 2 -30M210 168q0 -12 6 -24M194 168q-2 -10 -8 -20", C.green4, 2);
  s += E(204, 138, 2.5, 5, C.tan) + E(217, 143, 2.5, 5, C.tan) + E(185, 147, 2.5, 5, C.tan);
  return s;
};

ALT["fishing-pond"] = "Drawing of a pond with a small wooden dock, reeds and a fishing rod";
DRAW["fishing-pond"] = () => {
  let s = sky() + sun(56, 38, 15) + cloud(92, 26, 0.7);
  s += tree(150, 82, 0.7) + tree(176, 84, 0.85) + pine(204, 82, 0.8) + tree(226, 84, 0.6, C.green4, C.green2) + tree(18, 84, 0.6);
  s += band(80, 3, 3, C.green3) + R(0, 86, 240, 94, C.green);
  s += E(128, 128, 112, 36, C.water2) + E(128, 126, 106, 32, C.water);
  s += ripples([[150, 112, 20], [186, 130, 16], [120, 146, 22], [170, 152, 14]]);
  s += SO(152, 128, 6, C.cream, 1.4).replace("<circle", '<circle stroke-dasharray="4 4"');
  s += P("M0 136L96 118H106L22 160H0Z", C.ink) + P("M0 156L22 160L0 170Z", C.green2);
  s += L("M14 140L102 120", C.brass2, 2) + L("M10 150L60 138M30 154L84 132", C.tan, 1.4);
  s += R(92, 118, 4, 16, C.navy2) + R(40, 136, 4, 18, C.navy2) + R(70, 128, 4, 18, C.navy2);
  s += L("M46 134L130 66", C.navy, 2) + L("M130 66Q150 92 152 124", C.slate, 1.2);
  s += O(152, 125, 3.5, C.brass) + P("M148.5 125a3.5 3.5 0 0 0 7 0Z", C.cream);
  s += R(54, 140, 16, 10, C.water2, 2) + R(54, 140, 16, 3, C.cream, 1);
  s += L("M206 150V112M214 152V104M222 150V116M198 152V120", C.green4, 2);
  s += E(214, 104, 2.6, 7, C.ink) + E(206, 112, 2.4, 6, C.ink) + E(222, 116, 2.4, 6, C.ink);
  s += L("M196 152q8 -22 2 -40M228 154q-6 -18 0 -34", C.green2, 2);
  return s;
};

ALT["dog-walk"] = "Drawing of a dog on a leash on a path between trees, with a bench";
DRAW["dog-walk"] = () => {
  let s = sky() + sun(40, 36, 15) + cloud(76, 26, 0.8);
  s += band(84, 4, 3, C.green3) + tree(20, 96, 0.9) + pine(54, 92, 0.7) + tree(228, 96, 0.8) + R(0, 94, 240, 86, C.green);
  s += P("M100 94H134Q146 130 196 180H36Q82 130 100 94Z", C.sand);
  s += E(192, 125, 26, 3, C.green2) + R(170, 100, 44, 5, C.ink, 2) + R(170, 108, 44, 5, C.ink, 2);
  s += L("M174 113V124M210 113V124", C.navy, 2) + R(170, 92, 44, 5, C.brass, 2) + L("M174 97V100M210 97V100", C.navy, 2);
  s += E(112, 163, 34, 4, C.sand2);
  // the dog, side view, facing right; the far legs are darker
  s += L("M82 124Q68 118 70 102", C.brass, 5);
  s += R(88, 134, 6, 26, C.ink, 3) + R(120, 134, 6, 26, C.ink, 3);
  s += R(78, 116, 58, 26, C.brass, 13);
  s += P("M118 124L128 98L148 100L142 130Z", C.brass) + O(140, 96, 13, C.brass);
  s += R(144, 92, 22, 14, C.brass, 6) + O(164, 96, 3, C.navy) + L("M152 103h7", C.ink, 1.4);
  s += P("M131 86Q121 90 123 104Q125 113 131 109Q136 99 136 88Z", C.ink) + O(146, 92, 2, C.navy);
  s += R(96, 134, 6, 28, C.brass, 3) + R(128, 134, 6, 28, C.brass, 3);
  s += L("M127 109L141 115", C.navy, 4);
  s += L("M132 111Q112 58 100 0", C.navy, 2);
  s += bush(26, 142, 1.1) + bush(218, 152, 1.2);
  return s;
};

ALT["card-table"] = "Drawing of a card table seen from above, with playing cards, chips and two cups of coffee";
DRAW["card-table"] = () => {
  let s = R(0, 0, 240, 180, C.ivory2) + L("M0 30H240M0 150H240", C.sand2, 1);
  s += E(124, 96, 104, 76, C.sand2) + E(120, 92, 104, 76, C.ink) + E(120, 90, 96, 70, C.green2) + E(120, 90, 88, 63, C.green);
  const card = (x, y, r, mark) => G(`rotate(${r} ${x + 13} ${y + 18})`, R(x + 1.5, y + 2, 26, 36, C.green2, 3) + R(x, y, 26, 36, C.cream, 3) + SR(x, y, 26, 36, C.sand2, 1, 3) + mark(x + 13, y + 18));
  const heart = (x, y) => P(`M${x} ${y + 6}l-6 -6a3.4 3.4 0 0 1 6 -4a3.4 3.4 0 0 1 6 4Z`, C.brass);
  const diamond = (x, y) => P(`M${x} ${y - 7}l5 7l-5 7l-5 -7Z`, C.brass);
  const spade = (x, y) => P(`M${x} ${y - 7}l6 7a3.4 3.4 0 0 1 -6 3a3.4 3.4 0 0 1 -6 -3ZM${x} ${y + 1}l2.5 6h-5Z`, C.navy);
  const club = (x, y) => O(x, y - 4, 3.2, C.navy) + O(x - 3.6, y + 1.5, 3.2, C.navy) + O(x + 3.6, y + 1.5, 3.2, C.navy) + P(`M${x} ${y}l2.5 7h-5Z`, C.navy);
  s += card(78, 66, -18, heart) + card(96, 62, -6, spade) + card(114, 62, 6, diamond) + card(132, 66, 18, club);
  s += card(152, 110, 70, heart) + card(54, 106, -64, club);
  for (const [x, y, c] of [[100, 128, C.navy2], [108, 132, C.brass], [116, 128, C.cream], [132, 130, C.navy2], [140, 126, C.brass]]) s += O(x, y, 6, c) + SO(x, y, 3, c === C.cream ? C.sand2 : C.cream);
  for (const [x, y] of [[34, 40], [206, 146]]) s += O(x + 2, y + 2, 14, C.sand2) + O(x, y, 14, C.cream) + O(x, y, 10, C.ink) + O(x, y, 8, C.coffee) + L(`M${x + 14} ${y - 4}h4a4 4 0 0 1 0 8h-4`, C.cream, 3);
  s += G("rotate(8 196 40)", R(182, 24, 32, 40, C.sand2, 2) + R(180, 22, 32, 40, C.cream, 2) + L("M186 32h20M186 40h20M186 48h14", C.slate, 1.2)) + L("M218 30L204 62", C.brass, 2.4);
  return s;
};

ALT["walking-path"] = "Drawing of a walking path winding between trees";
DRAW["walking-path"] = () => {
  let s = sky() + sun(122, 46, 18) + cloud(150, 30, 0.8) + bird(60, 32) + bird(76, 40, 0.8);
  s += band(84, 5, 3, C.green3) + R(0, 92, 240, 88, C.green);
  s += pine(20, 92, 0.9) + tree(56, 94, 0.75, C.green4, C.green2) + tree(186, 92, 0.8) + pine(222, 94, 1);
  s += P("M116 90H126Q140 104 120 118Q92 138 128 158Q150 170 156 180H72Q60 160 92 140Q118 122 112 108Q106 98 116 90Z", C.sand);
  s += E(40, 158, 22, 3, C.green2) + E(214, 162, 24, 3, C.green4);
  s += tree(34, 156, 1.2) + tree(212, 160, 1.3, C.green4, C.green2) + pine(176, 140, 0.9) + bush(70, 120, 0.8) + bush(160, 116, 0.7);
  s += R(150, 118, 4, 22, C.navy2) + R(146, 112, 12, 7, C.navy2, 2) + R(148, 114, 8, 3, C.sun);
  s += L("M54 168l-4 -8M60 170l2 -9M198 172l-3 -8", C.green4, 2);
  return s;
};

ALT["dock"] = "Drawing of a boat tied to a dock on the waterway, with marsh grass across the water";
DRAW["dock"] = () => {
  let s = sky() + sun(56, 42, 16) + cloud(178, 32, 0.8) + bird(140, 30) + bird(154, 38, 0.8);
  s += tree(140, 82, 0.6, C.green4, C.green2) + tree(164, 82, 0.7, C.green4, C.green2) + tree(222, 82, 0.6, C.green4, C.green2);
  s += band(78, 2, 4, C.green2) + band(84, 2, 6, C.green3, 0, 240, 92);
  s += R(0, 90, 240, 90, C.water) + band(124, 3, 5, C.water2);
  s += ripples([[20, 102, 22], [120, 98, 18], [196, 108, 24], [60, 160, 18], [170, 168, 24]]);
  s += P("M240 112H150L138 126H240Z", C.ink) + L("M150 112H240", C.brass2, 2) + L("M160 118H240M150 123H240", C.tan, 1.2);
  for (const x of [152, 186, 222]) s += R(x, 104, 6, 34, C.navy2, 2) + R(x, 104, 6, 3, C.slate, 1);
  s += L("M155 112q-12 6 -24 18", C.ivory2, 1.6);
  s += E(84, 152, 52, 3, C.water2);
  s += P("M30 124H134L126 146Q120 150 110 150H52Q40 150 34 140Z", C.cream) + P("M33 130H133L131 136H36Z", C.brass);
  s += R(80, 108, 22, 16, C.navy2, 2) + R(84, 111, 14, 6, C.water3, 1) + L("M76 104H110M90 104V96", C.navy, 2);
  s += R(52, 116, 16, 8, C.ivory2, 2) + R(114, 118, 12, 6, C.ivory2, 2);
  s += R(14, 64, 4, 36, C.navy2) + R(8, 56, 16, 12, C.green4, 1) + L("M10 100h12", C.water3, 2);
  return s;
};

ALT["grocery"] = "Drawing of a paper grocery bag with bread, greens and fruit";
DRAW["grocery"] = () => {
  let s = R(0, 0, 240, 180, C.ivory2) + O(120, 92, 70, C.sky);
  s += R(0, 150, 240, 30, C.sand) + L("M0 150H240", C.sand2, 2);
  s += G("rotate(14 128 60)", R(116, 20, 18, 74, C.brass2, 9) + L("M121 34l8 -4M121 46l8 -4M121 58l8 -4", C.ink, 2));
  s += P("M86 60Q80 30 96 36Q100 22 108 40Q118 30 112 64Z", C.green2) + P("M94 62Q92 42 100 44Q104 50 102 64Z", C.green4);
  s += P("M140 62Q150 36 164 42Q156 52 150 64Z", C.green4) + R(146, 56, 10, 14, C.brass, 3);
  s += E(122, 160, 56, 4, C.sand2);
  s += P("M78 62H162L168 158H72Z", C.tan) + P("M78 62H162L163 74H77Z", C.sand2);
  s += L("M104 80V150M136 80V150", C.sand2, 1.6) + R(106, 96, 28, 20, C.cream, 2) + L("M112 103h16M112 109h10", C.sand2, 2);
  s += E(182, 157, 13, 2.5, C.sand2) + O(180, 144, 13, C.brass) + O(176, 139, 4, C.brass2) + L("M180 131q2 -6 6 -7", C.green4, 2);
  s += E(58, 158, 12, 2.5, C.sand2) + O(56, 146, 12, C.apple) + O(52, 141, 3.5, C.apple2) + L("M56 134q-1 -5 3 -7", C.ink, 2) + P("M58 131q6 -6 10 -2q-6 4 -10 2Z", C.green2);
  return s;
};

ALT["hospital"] = "Drawing of a hospital building with an entrance canopy and an H sign";
DRAW["hospital"] = () => {
  let s = sky() + sun(214, 34, 13) + cloud(20, 28, 0.8);
  s += band(126, 3, 3, C.green3) + R(0, 134, 240, 46, C.green);
  s += R(34, 56, 92, 84, C.cream) + R(126, 30, 80, 110, C.ivory2) + R(32, 52, 96, 6, C.slate) + R(124, 26, 84, 6, C.slate);
  for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) s += R(42 + c * 21, 66 + r * 16, 14, 9, C.water2, 1.5);
  for (let r = 0; r < 5; r++) for (let c = 0; c < 3; c++) s += R(136 + c * 22, 40 + r * 15, 16, 9, C.water2, 1.5);
  s += R(132, 110, 68, 30, C.ivory2) + R(150, 114, 32, 26, C.water2, 1) + L("M166 114V140", C.cream, 2);
  s += R(138, 104, 56, 7, C.navy2, 2) + L("M142 111V128M190 111V128", C.navy, 2);
  s += L("M62 52V44M86 52V44", C.navy, 2) + R(58, 22, 32, 24, C.navy2, 4) + L("M67 28V40M81 28V40M67 34H81", C.cream, 3);
  s += P("M150 140H182L196 180H136Z", C.sand) + bush(24, 140, 1) + bush(104, 142, 0.9) + bush(218, 142, 1) + tree(12, 136, 0.7);
  return s;
};

/* ---------------------------------------------------------------------------- */

const ALIASES = {
  "indoor": "indoor-pool", "pool": "outdoor-pool", "swimming-pool": "outdoor-pool", "lounge": "outdoor-pool",
  "club": "clubhouse", "golf": "golf-cart", "cart": "golf-cart", "golf-carts": "golf-cart",
  "tennis": "pickleball", "court": "pickleball", "pickleball-court": "pickleball", "bocce-court": "bocce",
  "ocean": "beach", "pond": "fishing-pond", "fishing": "fishing-pond", "ponds": "fishing-pond",
  "dog": "dog-walk", "dogs": "dog-walk", "pets": "dog-walk", "dog-park": "dog-walk",
  "cards": "card-table", "games": "card-table", "game-table": "card-table", "card-games": "card-table",
  "trail": "walking-path", "walking": "walking-path", "walking-trail": "walking-path", "paths": "walking-path",
  "boat": "dock", "boat-dock": "dock", "marina": "dock", "waterway": "dock",
  "groceries": "grocery", "grocery-bag": "grocery", "shopping": "grocery",
  "doctor": "hospital", "medical": "hospital",
};

const ILLUSTRATION_NAMES = Object.keys(DRAW);
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function resolve(name) {
  const k = String(name || "").trim().toLowerCase().replace(/[\s_/]+/g, "-");
  const key = DRAW[k] ? k : ALIASES[k];
  if (!key) throw new Error(`illustrations.js: no illustration named "${name}". Names: ${ILLUSTRATION_NAMES.join(", ")}`);
  return key;
}

/*
 * The inline SVG. Options:
 *   alt         replaces the built-in alt text (role="img" with this aria-label)
 *   decorative  true: aria-hidden, no label (use when the words next to it say the same)
 *   width       sets width and height attributes (height = width * 3/4)
 *   style       extra inline CSS on the <svg>
 */
function illustration(name, opts = {}) {
  const key = resolve(name);
  const body = DRAW[key]();
  const a11y = opts.decorative ? 'aria-hidden="true" focusable="false"' : `role="img" aria-label="${esc(opts.alt || ALT[key])}"`;
  const size = opts.width ? ` width="${+opts.width}" height="${Math.round(+opts.width * 0.75)}"` : "";
  const style = opts.style ? ` style="${esc(opts.style)}"` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 180"${size} ${a11y}${style}>${body}</svg>`;
}

const illustrationAlt = (name) => ALT[resolve(name)];

module.exports = { illustration, illustrationAlt, ILLUSTRATION_NAMES, ALIASES, resolveIllustration: resolve, PALETTE: C };

if (require.main === module) {
  const i = process.argv.indexOf("--write");
  if (i > 0) {
    const fs = require("fs"), path = require("path");
    const dir = process.argv[i + 1];
    if (!dir) throw new Error("--write needs a folder");
    fs.mkdirSync(dir, { recursive: true });
    for (const k of ILLUSTRATION_NAMES) fs.writeFileSync(path.join(dir, `${k}.svg`), illustration(k));
    console.log(`wrote ${ILLUSTRATION_NAMES.length} files to ${dir}`);
  } else {
    for (const k of ILLUSTRATION_NAMES) {
      const al = Object.keys(ALIASES).filter((a) => ALIASES[a] === k);
      console.log(`${k.padEnd(14)} ${String(Buffer.byteLength(illustration(k))).padStart(5)} bytes  ${ALT[k]}${al.length ? `  (also: ${al.join(", ")})` : ""}`);
    }
  }
}
