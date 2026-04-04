import { useRef, useEffect, useCallback } from 'react';

interface Props {
  speed: 'cinematic' | 'medium' | 'quick';
  onComplete: () => void;
}

const SPEED_MS: Record<Props['speed'], number> = {
  cinematic: 10000,
  medium: 6000,
  quick: 3000,
};

const PHI = (1 + Math.sqrt(5)) / 2;
const B = Math.log(PHI) / (Math.PI / 2);
const TOTAL_THETA = 6 * Math.PI;
const SPIRAL_A = 4;

function SpiralAnimation({ speed, onComplete }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const completedRef = useRef(false);
  const sandGrainsRef = useRef<{ x: number; y: number; r: number; alpha: number }[]>([]);

  const generateSandGrains = useCallback((w: number, h: number) => {
    const grains: { x: number; y: number; r: number; alpha: number }[] = [];
    for (let i = 0; i < 120; i++) {
      grains.push({
        x: Math.random() * w,
        y: h * 0.75 + Math.random() * h * 0.25,
        r: 0.5 + Math.random() * 1.5,
        alpha: 0.1 + Math.random() * 0.25,
      });
    }
    sandGrainsRef.current = grains;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      generateSandGrains(rect.width, rect.height);
    };

    resize();
    window.addEventListener('resize', resize);

    const duration = SPEED_MS[speed];
    startTimeRef.current = 0;
    completedRef.current = false;

    const spiralPoint = (theta: number, scale: number, cx: number, cy: number) => {
      const r = SPIRAL_A * Math.exp(B * theta) * scale;
      return { x: cx + r * Math.cos(theta), y: cy - r * Math.sin(theta) };
    };

    const drawBackground = (w: number, h: number) => {
      const bg = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) * 0.7);
      bg.addColorStop(0, '#1a4a6e');
      bg.addColorStop(1, '#0f0f1a');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // Wave gradient at bottom
      const waveGrad = ctx.createLinearGradient(0, h * 0.8, 0, h);
      waveGrad.addColorStop(0, 'rgba(26, 74, 110, 0)');
      waveGrad.addColorStop(0.5, 'rgba(26, 74, 110, 0.1)');
      waveGrad.addColorStop(1, 'rgba(26, 74, 110, 0.15)');
      ctx.fillStyle = waveGrad;
      ctx.fillRect(0, 0, w, h);

      // Sand grains
      for (const grain of sandGrainsRef.current) {
        ctx.beginPath();
        ctx.arc(grain.x, grain.y, grain.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(210, 180, 140, ${grain.alpha})`;
        ctx.fill();
      }
    };

    const drawSpiral = (progress: number, w: number, h: number) => {
      const cx = w / 2;
      const cy = h / 2;
      const maxDim = Math.min(w, h);
      const scale = maxDim / (SPIRAL_A * Math.exp(B * TOTAL_THETA) * 2.4);

      // Draw from outside in: map progress to theta drawn so far
      // We draw from TOTAL_THETA down to 0 as progress goes 0 -> 1
      const spiralProgress = Math.min(progress / 0.7, 1);
      const drawnThetaRange = spiralProgress * TOTAL_THETA;

      if (drawnThetaRange <= 0) return;

      const steps = Math.floor(drawnThetaRange * 40);
      if (steps < 2) return;

      // Draw the spiral stroke by stroke for color/width variation
      for (let i = 0; i < steps - 1; i++) {
        // theta goes from TOTAL_THETA (outer) down to inner
        const theta0 = TOTAL_THETA - (i / (TOTAL_THETA * 40)) * TOTAL_THETA;
        const theta1 = TOTAL_THETA - ((i + 1) / (TOTAL_THETA * 40)) * TOTAL_THETA;

        if (theta0 < TOTAL_THETA - drawnThetaRange) continue;

        const p0 = spiralPoint(theta0, scale, cx, cy);
        const p1 = spiralPoint(theta1, scale, cx, cy);

        // Color: sandy gold at outer, shell pink at center
        const t = i / (TOTAL_THETA * 40);
        const r = Math.round(194 + (240 - 194) * t);
        const g = Math.round(149 + (196 - 149) * t);
        const b_ = Math.round(107 + (172 - 107) * t);

        // Ridged organic feel: alpha variation using sin
        const ridge = 0.6 + 0.4 * Math.abs(Math.sin(theta0 * 3));

        // Width: thick at outer, thin at center, with sin variation
        const baseWidth = 4 - 3 * t;
        const widthVar = 0.7 + 0.3 * Math.sin(theta0 * 5);
        const lineWidth = baseWidth * widthVar;

        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b_}, ${ridge})`;
        ctx.lineWidth = lineWidth;
        ctx.lineCap = 'round';
        ctx.stroke();
      }
    };

    const drawChambers = (progress: number, w: number, h: number) => {
      // Phase 2: 0.7 -> 0.85
      if (progress < 0.7) return;
      const chamberProgress = Math.min((progress - 0.7) / 0.15, 1);
      const alpha = chamberProgress * 0.5;

      const cx = w / 2;
      const cy = h / 2;
      const maxDim = Math.min(w, h);
      const scale = maxDim / (SPIRAL_A * Math.exp(B * TOTAL_THETA) * 2.4);

      // Draw curved chamber lines at quarter-turn intervals
      const chamberAngles = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2, 2 * Math.PI];

      for (const baseAngle of chamberAngles) {
        ctx.beginPath();
        const innerTheta = baseAngle + 0.1;
        const outerTheta = baseAngle + TOTAL_THETA * 0.6;
        const arcSteps = 60;

        for (let j = 0; j <= arcSteps; j++) {
          const t = j / arcSteps;
          const theta = innerTheta + t * (outerTheta - innerTheta);

          // Chamber line follows a slightly offset spiral
          const rVal = SPIRAL_A * Math.exp(B * theta) * scale * 0.98;
          const px = cx + rVal * Math.cos(theta + 0.05);
          const py = cy - rVal * Math.sin(theta + 0.05);

          if (j === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }

        ctx.strokeStyle = `rgba(240, 196, 172, ${alpha * 0.35})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }

      // Draw concentric arc chambers (cross-section lines)
      for (let c = 1; c <= 4; c++) {
        const chamberTheta = (c / 4) * TOTAL_THETA * 0.8;
        const rInner = SPIRAL_A * Math.exp(B * chamberTheta) * scale;
        const rOuter = SPIRAL_A * Math.exp(B * (chamberTheta + Math.PI / 2)) * scale;

        ctx.beginPath();
        const arcStart = chamberTheta;
        const arcEnd = chamberTheta + Math.PI * 0.4;
        const arcRes = 30;

        for (let j = 0; j <= arcRes; j++) {
          const t = j / arcRes;
          const angle = arcStart + t * (arcEnd - arcStart);
          const rMid = rInner + (rOuter - rInner) * 0.5;
          const px = cx + rMid * Math.cos(angle);
          const py = cy - rMid * Math.sin(angle);

          if (j === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }

        ctx.strokeStyle = `rgba(240, 196, 172, ${alpha * 0.25})`;
        ctx.lineWidth = 0.6;
        ctx.stroke();
      }
    };

    const drawText = (progress: number, w: number, h: number) => {
      // Phase 3: 0.85 -> 1.0
      if (progress < 0.85) return;
      const textProgress = Math.min((progress - 0.85) / 0.15, 1);

      const cx = w / 2;
      const cy = h / 2;

      // Ease out
      const ease = 1 - Math.pow(1 - textProgress, 3);
      const alpha = ease;
      const scaleVal = 0.9 + 0.1 * ease;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(scaleVal, scaleVal);

      // Warm glow behind text
      const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, 40);
      glow.addColorStop(0, `rgba(244, 217, 176, ${alpha * 0.4})`);
      glow.addColorStop(1, `rgba(244, 217, 176, 0)`);
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(0, 0, 40, 0, Math.PI * 2);
      ctx.fill();

      // Text
      const fontSize = Math.min(w, h) * 0.06;
      ctx.font = `bold ${fontSize}px Georgia, "Times New Roman", serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = `rgba(244, 217, 176, ${alpha})`;
      ctx.shadowColor = `rgba(244, 217, 176, ${alpha * 0.6})`;
      ctx.shadowBlur = 12;
      ctx.fillText('Hi Mom', 0, 0);
      ctx.shadowBlur = 0;

      ctx.restore();
    };

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;

      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      const rect = container.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      ctx.clearRect(0, 0, w, h);
      drawBackground(w, h);
      drawSpiral(progress, w, h);
      drawChambers(progress, w, h);
      drawText(progress, w, h);

      if (progress >= 1 && !completedRef.current) {
        completedRef.current = true;
        onComplete();
      }

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [speed, onComplete, generateSandGrains]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        background: '#0f0f1a',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
        }}
      />
    </div>
  );
}

export default SpiralAnimation;
