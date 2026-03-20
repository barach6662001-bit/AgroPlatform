import { useRef, useState, useCallback } from 'react';
import { Button, Alert, Space, Typography, Tag } from 'antd';
import { reportNdviProblems } from '../../api/fields';
import { useTranslation } from '../../i18n';

const { Text } = Typography;

interface Props {
  fieldId: string;
}

interface ZoneCount {
  low: number;    // NDVI < 0.3  → red
  mid: number;    // NDVI 0.3–0.6 → yellow
  high: number;   // NDVI > 0.6  → green
}

// Sample NDVI-like image: we draw a synthetic field pattern on an offscreen canvas
// (simulates real satellite imagery when a live endpoint is unavailable).
function drawSyntheticNdvi(src: HTMLCanvasElement) {
  const ctx = src.getContext('2d')!;
  const w = src.width;
  const h = src.height;

  // Base: healthy vegetation (dark green)
  ctx.fillStyle = '#2d7a2d';
  ctx.fillRect(0, 0, w, h);

  // Mid-quality strip
  ctx.fillStyle = '#a0a020';
  ctx.fillRect(w * 0.15, h * 0.1, w * 0.25, h * 0.8);

  // Low-quality (problem) patches
  ctx.fillStyle = '#b83030';
  ctx.fillRect(w * 0.5, h * 0.05, w * 0.2, h * 0.3);
  ctx.fillRect(w * 0.72, h * 0.55, w * 0.15, h * 0.35);

  // Another mid-quality zone
  ctx.fillStyle = '#c8c032';
  ctx.fillRect(w * 0.45, h * 0.5, w * 0.2, h * 0.4);
}

// Approximate NDVI from RGB pixel of a colour-coded NDVI image.
// Convention: red channel dominance → low, green dominance → high.
function pixelNdvi(r: number, g: number, b: number): number {
  const total = r + g + b;
  if (total === 0) return 0.5; // transparent / black → neutral
  // Map green ratio → NDVI range [0, 1]
  const greenness = g / total;         // 0.0 – 1.0
  const redness   = r / total;
  // NDVI proxy: (NIR-like - Red-like) / (NIR-like + Red-like)
  // Use green channel as NIR proxy (common in visible NDVI composites)
  return (greenness - redness) / (greenness + redness + 0.0001);
}

const CANVAS_W = 500;
const CANVAS_H = 340;

    // Simple DFS flood-fill to count connected problem zones
function countConnectedZones(mask: Uint8Array, w: number, h: number): number {
  const visited = new Uint8Array(w * h);
  let zones = 0;
  for (let i = 0; i < w * h; i++) {
    if (mask[i] && !visited[i]) {
      zones++;
      // DFS using explicit stack
      const stack = [i];
      while (stack.length) {
        const idx = stack.pop()!;
        if (visited[idx]) continue;
        visited[idx] = 1;
        const x = idx % w;
        const y = Math.floor(idx / w);
        const neighbours = [
          y > 0     ? (y - 1) * w + x : -1,
          y < h - 1 ? (y + 1) * w + x : -1,
          x > 0     ? y * w + x - 1   : -1,
          x < w - 1 ? y * w + x + 1   : -1,
        ];
        for (const n of neighbours) {
          if (n >= 0 && mask[n] && !visited[n]) stack.push(n);
        }
      }
    }
  }
  return zones;
}

export default function FieldNdviTab({ fieldId }: Props) {
  const { t } = useTranslation();
  const srcRef     = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const [zones, setZones] = useState<ZoneCount | null>(null);
  const [problemZones, setProblemZones] = useState<number | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [alerted, setAlerted] = useState(false);

  const handleAnalyze = useCallback(async () => {
    const src     = srcRef.current;
    const overlay = overlayRef.current;
    if (!src || !overlay) return;

    setAnalyzing(true);
    setAlerted(false);

    // Draw synthetic NDVI image on source canvas
    drawSyntheticNdvi(src);

    const srcCtx     = src.getContext('2d')!;
    const overlayCtx = overlay.getContext('2d')!;
    const W = CANVAS_W;
    const H = CANVAS_H;

    const imageData = srcCtx.getImageData(0, 0, W, H);
    const pixels    = imageData.data;

    const overlayData = overlayCtx.createImageData(W, H);
    const od          = overlayData.data;

    const lowMask  = new Uint8Array(W * H);
    let lowCount   = 0;
    let midCount   = 0;
    let highCount  = 0;

    for (let i = 0; i < W * H; i++) {
      const r = pixels[i * 4];
      const g = pixels[i * 4 + 1];
      const b = pixels[i * 4 + 2];
      const a = pixels[i * 4 + 3];
      if (a === 0) continue;

      const ndvi = pixelNdvi(r, g, b);

      let or = 0, og = 0, ob = 0, oa = 0;
      if (ndvi < 0.3) {
        // Red overlay
        or = 220; og = 50; ob = 50; oa = 160;
        lowMask[i] = 1;
        lowCount++;
      } else if (ndvi < 0.6) {
        // Yellow overlay
        or = 240; og = 220; ob = 30; oa = 130;
        midCount++;
      } else {
        // Green overlay
        or = 50; og = 200; ob = 50; oa = 100;
        highCount++;
      }
      od[i * 4]     = or;
      od[i * 4 + 1] = og;
      od[i * 4 + 2] = ob;
      od[i * 4 + 3] = oa;
    }

    overlayCtx.putImageData(overlayData, 0, 0);

    const nProblems = countConnectedZones(lowMask, W, H);
    setZones({ low: lowCount, mid: midCount, high: highCount });
    setProblemZones(nProblems);

    // Backend notification when problems found
    if (nProblems > 0) {
      try {
        await reportNdviProblems(fieldId, nProblems);
      } catch {
        // Notification failure is non-critical
      }
    }

    setAnalyzing(false);
    setAlerted(true);
  }, [fieldId]);

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Text type="secondary">{t.fields.ndviDescription}</Text>

      <Button
        type="primary"
        onClick={handleAnalyze}
        loading={analyzing}
      >
        {analyzing ? t.fields.ndviAnalyzing : t.fields.ndviAnalyze}
      </Button>

      {alerted && problemZones !== null && (
        <Alert
          type={problemZones > 0 ? 'warning' : 'success'}
          message={
            problemZones > 0
              ? t.fields.ndviDetected.replace('{n}', String(problemZones))
              : t.fields.ndviNoProblems
          }
          showIcon
        />
      )}

      <div style={{ position: 'relative', display: 'inline-block' }}>
        {/* Source (NDVI) canvas */}
        <canvas
          ref={srcRef}
          width={CANVAS_W}
          height={CANVAS_H}
          style={{ display: 'block', borderRadius: 4, border: '1px solid #d9d9d9' }}
        />
        {/* Colour overlay canvas – positioned on top */}
        <canvas
          ref={overlayRef}
          width={CANVAS_W}
          height={CANVAS_H}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            pointerEvents: 'none',
            borderRadius: 4,
          }}
        />
      </div>

      {/* Legend */}
      <Space wrap>
        <Tag color="red">{t.fields.ndviLegendLow}</Tag>
        <Tag color="gold">{t.fields.ndviLegendMid}</Tag>
        <Tag color="green">{t.fields.ndviLegendHigh}</Tag>
      </Space>

      {zones && (
        <Space>
          <Text type="secondary">
            {`${t.fields.ndviLegendLow}: ${zones.low.toLocaleString()} px · `}
            {`${t.fields.ndviLegendMid}: ${zones.mid.toLocaleString()} px · `}
            {`${t.fields.ndviLegendHigh}: ${zones.high.toLocaleString()} px`}
          </Text>
        </Space>
      )}
    </Space>
  );
}
