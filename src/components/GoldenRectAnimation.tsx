import React, { useRef, useEffect, useCallback } from "react";

const PHI = 1.618033988749895;

interface Props {
  speed: "cinematic" | "medium" | "quick";
  onComplete: () => void;
}

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Subdivision {
  square: Rect;
  remaining: Rect;
}

const SPEED_DURATIONS: Record<Props["speed"], number> = {
  cinematic: 10000,
  medium: 6000,
  quick: 3000,
};

const LEVELS = 9;

function computeSubdivisions(initial: Rect): Subdivision[] {
  const results: Subdivision[] = [];
  let rect = { ...initial };

  for (let i = 0; i < LEVELS; i++) {
    const landscape = rect.w >= rect.h;
    let square: Rect;
    let remaining: Rect;

    if (landscape) {
      const size = rect.h;
      square = { x: rect.x, y: rect.y, w: size, h: size };
      remaining = { x: rect.x + size, y: rect.y, w: rect.w - size, h: rect.h };
    } else {
      const size = rect.w;
      square = { x: rect.x, y: rect.y, w: size, h: size };
      remaining = { x: rect.x, y: rect.y + size, w: rect.w, h: rect.h - size };
    }

    results.push({ square, remaining });
    rect = { ...remaining };
  }

  return results;
}

function drawSquareBorder(
  ctx: CanvasRenderingContext2D,
  sq: Rect,
  progress: number,
  opacity: number
) {
  const p = Math.max(0, Math.min(1, progress));
  if (p <= 0) return;

  const perimeter = 2 * (sq.w + sq.h);
  const drawLen = p * perimeter;

  const segments = [
    { x0: sq.x, y0: sq.y, x1: sq.x + sq.w, y1: sq.y, len: sq.w },
    { x0: sq.x + sq.w, y0: sq.y, x1: sq.x + sq.w, y1: sq.y + sq.h, len: sq.h },
    { x0: sq.x + sq.w, y0: sq.y + sq.h, x1: sq.x, y1: sq.y + sq.h, len: sq.w },
    { x0: sq.x, y0: sq.y + sq.h, x1: sq.x, y1: sq.y, len: sq.h },
  ];

  ctx.save();
  ctx.strokeStyle = `rgba(212, 160, 23, ${opacity})`;
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();

  let remaining = drawLen;
  for (const seg of segments) {
    if (remaining <= 0) break;
    const t = Math.min(1, remaining / seg.len);
    const ex = seg.x0 + (seg.x1 - seg.x0) * t;
    const ey = seg.y0 + (seg.y1 - seg.y0) * t;

    if (seg === segments[0]) {
      ctx.moveTo(seg.x0, seg.y0);
    }
    ctx.lineTo(ex, ey);
    remaining -= seg.len;
  }

  ctx.stroke();
  ctx.restore();
}

function fillSquare(ctx: CanvasRenderingContext2D, sq: Rect, opacity: number) {
  ctx.save();
  ctx.fillStyle = `rgba(212, 160, 23, ${0.05 * opacity})`;
  ctx.fillRect(sq.x, sq.y, sq.w, sq.h);
  ctx.restore();
}

function drawHiMom(
  ctx: CanvasRenderingContext2D,
  canvasW: number,
  canvasH: number,
  opacity: number
) {
  if (opacity <= 0) return;

  ctx.save();
  const fontSize = Math.min(canvasW, canvasH) * 0.12;
  ctx.font = `bold ${fontSize}px "Georgia", serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const gradient = ctx.createLinearGradient(
    canvasW / 2 - fontSize * 1.5,
    canvasH / 2,
    canvasW / 2 + fontSize * 1.5,
    canvasH / 2
  );
  gradient.addColorStop(0, `rgba(178, 134, 11, ${opacity})`);
  gradient.addColorStop(0.5, `rgba(255, 215, 0, ${opacity})`);
  gradient.addColorStop(1, `rgba(178, 134, 11, ${opacity})`);

  ctx.fillStyle = gradient;
  ctx.fillText("Hi Mom", canvasW / 2, canvasH / 2);
  ctx.restore();
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

const GoldenRectAnimation: React.FC<Props> = ({ speed, onComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const completedRef = useRef(false);

  const render = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      subdivisions: Subdivision[],
      canvasW: number,
      canvasH: number,
      totalDuration: number,
      timestamp: number
    ) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;

      // Timeline breakdown:
      // 0% - 65%: drawing subdivisions (each level gets equal slice)
      // 65% - 78%: fade rectangles to 20% opacity
      // 78% - 95%: "Hi Mom" fade in
      // 95% - 100%: hold, then complete

      const drawPhaseEnd = 0.65;
      const fadePhaseEnd = 0.78;
      const textPhaseEnd = 0.95;

      const progress = Math.min(1, elapsed / totalDuration);

      ctx.clearRect(0, 0, canvasW, canvasH);

      // Compute global opacity for all rectangles
      let rectOpacity = 1;
      if (progress > drawPhaseEnd && progress <= fadePhaseEnd) {
        const fadeProg = (progress - drawPhaseEnd) / (fadePhaseEnd - drawPhaseEnd);
        rectOpacity = 1 - 0.8 * easeInOutCubic(fadeProg);
      } else if (progress > fadePhaseEnd) {
        rectOpacity = 0.2;
      }

      // Draw each subdivision
      const levelSlice = drawPhaseEnd / LEVELS;
      for (let i = 0; i < subdivisions.length; i++) {
        const levelStart = i * levelSlice;
        const levelEnd = levelStart + levelSlice;

        let drawProgress = 0;
        if (progress >= levelEnd) {
          drawProgress = 1;
        } else if (progress > levelStart) {
          drawProgress = easeInOutCubic(
            (progress - levelStart) / (levelEnd - levelStart)
          );
        }

        if (drawProgress <= 0) continue;

        const sub = subdivisions[i];
        const levelOpacityBase = 1 - i * 0.06;
        const opacity = levelOpacityBase * rectOpacity;

        fillSquare(ctx, sub.square, rectOpacity);
        drawSquareBorder(ctx, sub.square, drawProgress, opacity);
      }

      // Draw "Hi Mom" text
      if (progress > fadePhaseEnd) {
        let textOpacity = 0;
        if (progress <= textPhaseEnd) {
          textOpacity = easeInOutCubic(
            (progress - fadePhaseEnd) / (textPhaseEnd - fadePhaseEnd)
          );
        } else {
          textOpacity = 1;
        }
        drawHiMom(ctx, canvasW, canvasH, textOpacity);
      }

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame((ts) =>
          render(ctx, subdivisions, canvasW, canvasH, totalDuration, ts)
        );
      } else {
        if (!completedRef.current) {
          completedRef.current = true;
          onComplete();
        }
      }
    },
    [onComplete]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const setupAndRun = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = container.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Compute initial golden rectangle centered on canvas
      const padding = 0.08;
      const availW = w * (1 - 2 * padding);
      const availH = h * (1 - 2 * padding);

      let rectW: number;
      let rectH: number;

      // Fit golden rectangle (landscape) within available area
      if (availW / availH > PHI) {
        rectH = availH;
        rectW = rectH * PHI;
      } else {
        rectW = availW;
        rectH = rectW / PHI;
      }

      const rectX = (w - rectW) / 2;
      const rectY = (h - rectH) / 2;

      const initialRect: Rect = { x: rectX, y: rectY, w: rectW, h: rectH };
      const subdivisions = computeSubdivisions(initialRect);

      const totalDuration = SPEED_DURATIONS[speed];

      // Reset state
      startTimeRef.current = 0;
      completedRef.current = false;
      cancelAnimationFrame(animFrameRef.current);

      animFrameRef.current = requestAnimationFrame((ts) =>
        render(ctx, subdivisions, w, h, totalDuration, ts)
      );
    };

    setupAndRun();

    const resizeObserver = new ResizeObserver(() => {
      setupAndRun();
    });
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      resizeObserver.disconnect();
    };
  }, [speed, render]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: "block",
          position: "absolute",
          top: 0,
          left: 0,
        }}
      />
    </div>
  );
};

export default GoldenRectAnimation;
