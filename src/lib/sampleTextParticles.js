const SLOT = new Map();

function scratchCanvas() {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  return { canvas, ctx };
}

/**
 * @returns {{ points: { x: number, y: number, sx: number, sy: number, seed: number }[], width: number, height: number }}
 */
export function buildTextParticles(text, options = {}) {
  const {
    font = '600 48px Fraunces, Georgia, serif',
    maxWidth = 900,
    step = 3,
    scatter = 140,
    align = 'center',
    pad = 0,
  } = options;

  const key = `${font}|${maxWidth}|${step}|${pad}|${text}`;
  if (SLOT.has(key)) return SLOT.get(key);

  const { canvas, ctx } = scratchCanvas();
  ctx.font = font;
  const lines = wrapLines(ctx, text, maxWidth);
  const lineHeight = parseLineHeight(font);
  const width = Math.min(
    maxWidth,
    Math.max(...lines.map((line) => ctx.measureText(line).width), 1),
  );
  const height = lines.length * lineHeight;
  const margin = Math.ceil(pad + scatter * 0.85);
  canvas.width = Math.ceil(width) + 8 + margin * 2;
  canvas.height = Math.ceil(height) + 8 + margin * 2;

  ctx.font = font;
  ctx.fillStyle = '#ffffff';
  ctx.textBaseline = 'top';
  lines.forEach((line, index) => {
    let x = 4 + margin;
    if (align === 'center') {
      x = (canvas.width - ctx.measureText(line).width) * 0.5;
    }
    ctx.fillText(line, x, 4 + margin + index * lineHeight);
  });

  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const points = [];

  for (let y = 0; y < canvas.height; y += step) {
    for (let x = 0; x < canvas.width; x += step) {
      const alpha = data[(y * canvas.width + x) * 4 + 3];
      if (alpha < 96) continue;
      const angle = Math.random() * Math.PI * 2;
      const dist = scatter * (0.35 + Math.random() * 0.65);
      points.push({
        x: x - canvas.width * 0.5,
        y: y - canvas.height * 0.5,
        sx: Math.cos(angle) * dist,
        sy: Math.sin(angle) * dist,
        seed: Math.random() * 1000,
      });
    }
  }

  const result = { points, width: canvas.width, height: canvas.height };
  SLOT.set(key, result);
  return result;
}

function parseLineHeight(font) {
  const match = font.match(/(\d+)px/);
  const size = match ? Number(match[1]) : 48;
  return size * 1.15;
}

function wrapLines(ctx, text, maxWidth) {
  const words = text.split(/\s+/);
  const lines = [];
  let line = '';

  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/** 0 = scattered, 1 = locked to glyph */
export function particleAlpha(t) {
  return Math.min(1, Math.max(0, t));
}

export function easeFormation(t) {
  const x = Math.min(1, Math.max(0, t));
  return 1 - (1 - x) ** 3;
}