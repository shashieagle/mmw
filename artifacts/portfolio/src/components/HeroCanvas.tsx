import { useEffect, useRef } from "react";

export function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);
  const offsetRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;

    function resize() {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }

    resize();
    window.addEventListener("resize", resize);

    function drawGrid(t: number) {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const horizon = height * 0.46;
      const numV = 22;
      const spread = width * 1.4;
      const numH = 18;
      const gridDepth = height * 0.9;
      const speed = 0.18;
      const phase = (t * speed) % 1;

      // — perspective grid lines (vertical) —
      for (let i = 0; i <= numV; i++) {
        const frac = i / numV;
        const xBase = cx - spread / 2 + frac * spread;
        const xTop = cx + (xBase - cx) * 0.01;

        const alpha = 0.10 + 0.10 * (1 - Math.abs(frac - 0.5) * 2);
        ctx.beginPath();
        ctx.moveTo(xTop, horizon);
        ctx.lineTo(xBase, height + 10);
        ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
        ctx.lineWidth = 0.7;
        ctx.stroke();
      }

      // — perspective grid lines (horizontal, animated) —
      for (let i = 0; i <= numH; i++) {
        const rawT = (i / numH + phase) % 1;
        const perspective = rawT * rawT;
        const y = horizon + perspective * gridDepth;
        if (y < horizon || y > height + 2) continue;

        const xL = cx + (cx * -1.4) * (1 - rawT);
        const xR = cx + cx * 1.4 * (1 - rawT);

        const fade = rawT < 0.1 ? rawT / 0.1 : rawT > 0.88 ? (1 - rawT) / 0.12 : 1;
        const alpha = 0.04 + 0.11 * rawT * fade;

        ctx.beginPath();
        ctx.moveTo(xL, y);
        ctx.lineTo(xR, y);
        ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
        ctx.lineWidth = 0.6;
        ctx.stroke();
      }

      // — horizon glow —
      const grd = ctx.createLinearGradient(0, horizon - 60, 0, horizon + 120);
      grd.addColorStop(0, "rgba(255,255,255,0)");
      grd.addColorStop(0.45, "rgba(180,180,255,0.055)");
      grd.addColorStop(0.55, "rgba(180,180,255,0.055)");
      grd.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = grd;
      ctx.fillRect(0, horizon - 60, width, 180);

      // — floating orbs —
      const orbs = [
        { x: 0.18, y: 0.28, r: 220, color: "80,60,180", a: 0.055 },
        { x: 0.82, y: 0.35, r: 180, color: "60,140,200", a: 0.045 },
        { x: 0.5,  y: 0.6,  r: 140, color: "160,80,255", a: 0.03  },
        { x: 0.1,  y: 0.72, r: 100, color: "255,120,80", a: 0.025 },
        { x: 0.9,  y: 0.65, r: 120, color: "80,200,180", a: 0.025 },
      ];

      for (const orb of orbs) {
        const ox = orb.x * width + Math.sin(t * 0.25 + orb.x * 10) * 18;
        const oy = orb.y * height + Math.cos(t * 0.2 + orb.y * 8) * 14;
        const gr = ctx.createRadialGradient(ox, oy, 0, ox, oy, orb.r);
        gr.addColorStop(0, `rgba(${orb.color},${orb.a})`);
        gr.addColorStop(1, `rgba(${orb.color},0)`);
        ctx.beginPath();
        ctx.arc(ox, oy, orb.r, 0, Math.PI * 2);
        ctx.fillStyle = gr;
        ctx.fill();
      }

      // — scan-line overlay (subtle) —
      for (let y = 0; y < height; y += 4) {
        ctx.fillStyle = "rgba(0,0,0,0.055)";
        ctx.fillRect(0, y, width, 1);
      }

      // — vignette —
      const vig = ctx.createRadialGradient(cx, height * 0.5, height * 0.2, cx, height * 0.5, height * 0.95);
      vig.addColorStop(0, "rgba(0,0,0,0)");
      vig.addColorStop(1, "rgba(0,0,0,0.75)");
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, width, height);
    }

    let start: number | null = null;
    function loop(ts: number) {
      if (!start) start = ts;
      const t = (ts - start) / 1000;
      drawGrid(t);
      frameRef.current = requestAnimationFrame(loop);
    }

    frameRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ opacity: 0.9 }}
    />
  );
}
