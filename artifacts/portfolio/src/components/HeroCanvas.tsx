import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  life: number;
  maxLife: number;
}

export function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);

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

    // — Source point: top-center, slightly above frame —
    const SX = () => width * 0.5;
    const SY = () => -height * 0.04;

    // — Particles pool —
    const PARTICLE_COUNT = 200;
    const particles: Particle[] = [];

    function spawnParticle(): Particle {
      const sx = SX();
      const sy = SY();
      // spawn within the light cone (±28 deg from straight down)
      const angle = (Math.PI / 2) + (Math.random() - 0.5) * (Math.PI * 0.52);
      const dist = Math.random() * height * 1.1;
      const speed = 0.08 + Math.random() * 0.18;
      return {
        x: sx + Math.cos(angle) * dist * (0.1 + Math.random() * 0.5),
        y: sy + dist,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -speed * 0.3 + Math.random() * speed,
        size: 0.4 + Math.random() * 1.4,
        opacity: 0.15 + Math.random() * 0.55,
        life: Math.random(),
        maxLife: 180 + Math.random() * 300,
      };
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const p = spawnParticle();
      p.life = Math.random() * p.maxLife;
      particles.push(p);
    }

    // — Ray definitions (angle offsets from straight down) —
    const rays = [
      { offset: -0.22, width: 0.13, alpha: 0.11 },
      { offset: -0.13, width: 0.09, alpha: 0.17 },
      { offset: -0.05, width: 0.14, alpha: 0.20 },
      { offset:  0.0,  width: 0.18, alpha: 0.25 },
      { offset:  0.06, width: 0.11, alpha: 0.18 },
      { offset:  0.16, width: 0.08, alpha: 0.13 },
      { offset:  0.25, width: 0.12, alpha: 0.09 },
      { offset: -0.30, width: 0.07, alpha: 0.07 },
      { offset:  0.35, width: 0.06, alpha: 0.06 },
    ];

    function drawFrame(t: number) {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);

      const sx = SX();
      const sy = SY();

      // === 1. Base black ===
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, width, height);

      // === 2. Godray beams ===
      for (const ray of rays) {
        const flicker = 1 + Math.sin(t * 1.1 + ray.offset * 20) * 0.06;
        const baseAngle = Math.PI / 2 + ray.offset;
        const halfW = ray.width / 2;
        const reach = height * 1.15;

        const lx = sx + Math.cos(baseAngle - halfW) * reach;
        const ly = sy + Math.sin(baseAngle - halfW) * reach;
        const rx = sx + Math.cos(baseAngle + halfW) * reach;
        const ry = sy + Math.sin(baseAngle + halfW) * reach;

        // gradient from source → far end
        const grd = ctx.createLinearGradient(sx, sy, sx, sy + reach);
        grd.addColorStop(0,    `rgba(255,252,245,${ray.alpha * flicker * 1.0})`);
        grd.addColorStop(0.15, `rgba(255,252,245,${ray.alpha * flicker * 0.85})`);
        grd.addColorStop(0.45, `rgba(255,252,245,${ray.alpha * flicker * 0.45})`);
        grd.addColorStop(0.75, `rgba(255,252,245,${ray.alpha * flicker * 0.15})`);
        grd.addColorStop(1,    `rgba(255,252,245,0)`);

        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(lx, ly);
        ctx.lineTo(rx, ry);
        ctx.closePath();
        ctx.fillStyle = grd;
        ctx.fill();
      }

      // === 3. Hot source flare ===
      const flare = ctx.createRadialGradient(sx, sy + 10, 0, sx, sy + 10, width * 0.28);
      flare.addColorStop(0,    "rgba(255,255,255,0.45)");
      flare.addColorStop(0.08, "rgba(255,248,220,0.22)");
      flare.addColorStop(0.25, "rgba(255,240,200,0.07)");
      flare.addColorStop(1,    "rgba(0,0,0,0)");
      ctx.fillStyle = flare;
      ctx.fillRect(0, 0, width, height);

      // === 4. Atmospheric haze / smoke mid-beam ===
      for (let i = 0; i < 6; i++) {
        const phase = t * 0.08 + i * 1.1;
        const px = sx + Math.sin(phase + i) * width * 0.08;
        const py = height * (0.28 + i * 0.06) + Math.cos(phase * 0.7) * 30;
        const pr = width * (0.14 + i * 0.03);
        const hazeAlpha = 0.025 + Math.sin(phase * 0.4) * 0.008;
        const haze = ctx.createRadialGradient(px, py, 0, px, py, pr);
        haze.addColorStop(0, `rgba(220,215,200,${hazeAlpha})`);
        haze.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = haze;
        ctx.fillRect(0, 0, width, height);
      }

      // === 5. Dust particles ===
      for (const p of particles) {
        // is particle inside the cone?
        const dx = p.x - sx;
        const dy = p.y - sy;
        const angle = Math.atan2(dx, dy);
        const inCone = Math.abs(angle) < 0.36;

        if (!inCone) {
          p.opacity *= 0.92;
        }

        const lifeFrac = p.life / p.maxLife;
        const fade = lifeFrac < 0.1 ? lifeFrac / 0.1 : lifeFrac > 0.85 ? (1 - lifeFrac) / 0.15 : 1;
        const alpha = p.opacity * fade * (inCone ? 1 : 0.15);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,252,235,${alpha})`;
        ctx.fill();

        p.x += p.vx;
        p.y += p.vy;
        p.life++;
        if (p.life > p.maxLife) {
          const np = spawnParticle();
          Object.assign(p, np);
        }
      }

      // === 6. Floor light pool ===
      const poolY = height * 0.98;
      const poolGrd = ctx.createRadialGradient(sx, poolY, 0, sx, poolY, width * 0.28);
      poolGrd.addColorStop(0,    "rgba(255,252,230,0.12)");
      poolGrd.addColorStop(0.35, "rgba(255,250,220,0.055)");
      poolGrd.addColorStop(0.7,  "rgba(255,250,220,0.015)");
      poolGrd.addColorStop(1,    "rgba(0,0,0,0)");
      ctx.fillStyle = poolGrd;
      ctx.fillRect(0, 0, width, height);

      // === 7. Dark sides vignette ===
      const leftVig = ctx.createLinearGradient(0, 0, width * 0.42, 0);
      leftVig.addColorStop(0, "rgba(0,0,0,0.88)");
      leftVig.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = leftVig;
      ctx.fillRect(0, 0, width, height);

      const rightVig = ctx.createLinearGradient(width, 0, width * 0.58, 0);
      rightVig.addColorStop(0, "rgba(0,0,0,0.88)");
      rightVig.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = rightVig;
      ctx.fillRect(0, 0, width, height);

      // Bottom fade to pure black
      const btmFade = ctx.createLinearGradient(0, height * 0.7, 0, height);
      btmFade.addColorStop(0, "rgba(0,0,0,0)");
      btmFade.addColorStop(1, "rgba(0,0,0,0.92)");
      ctx.fillStyle = btmFade;
      ctx.fillRect(0, 0, width, height);

      // Top tight dark (source area stays dark except flare)
      const topFade = ctx.createLinearGradient(0, 0, 0, height * 0.08);
      topFade.addColorStop(0, "rgba(0,0,0,0.6)");
      topFade.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = topFade;
      ctx.fillRect(0, 0, width, height);
    }

    let start: number | null = null;
    function loop(ts: number) {
      if (!start) start = ts;
      drawFrame((ts - start) / 1000);
      frameRef.current = requestAnimationFrame(loop);
    }
    frameRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
}
