import { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

interface Particle {
  x: number;
  y: number;
  age: number;
}

const isTouchDevice = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(pointer: coarse)").matches;

export function FireOrb() {
  if (isTouchDevice()) return null;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const trail = useRef<Particle[]>([]);
  const mouse = useRef({ x: -300, y: -300 });

  const rawX = useMotionValue(-300);
  const rawY = useMotionValue(-300);
  const coreX = useSpring(rawX, { stiffness: 500, damping: 30 });
  const coreY = useSpring(rawY, { stiffness: 500, damping: 30 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const onMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
      rawX.set(e.clientX);
      rawY.set(e.clientY);
    };
    window.addEventListener("mousemove", onMove);
    document.body.style.cursor = "none";

    const MAX_AGE = 28;
    let animId: number;

    const draw = () => {
      const ctx = canvas.getContext("2d");
      if (!ctx) { animId = requestAnimationFrame(draw); return; }

      // Add current position
      trail.current.push({ x: mouse.current.x, y: mouse.current.y, age: 0 });

      // Age and cull
      trail.current = trail.current
        .map((p) => ({ ...p, age: p.age + 1 }))
        .filter((p) => p.age < MAX_AGE);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      trail.current.forEach((p) => {
        const t = 1 - p.age / MAX_AGE; // 1 = fresh, 0 = old
        const radius = t * 14 + 2;
        const alpha = t * 0.9;

        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius * 2.5);
        g.addColorStop(0,   `rgba(255, 210, 100, ${alpha})`);
        g.addColorStop(0.3, `rgba(255, 110, 20,  ${alpha * 0.75})`);
        g.addColorStop(0.7, `rgba(236, 60,  0,   ${alpha * 0.35})`);
        g.addColorStop(1,   `rgba(180, 30,  0,   0)`);

        ctx.beginPath();
        ctx.arc(p.x, p.y, radius * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
      });

      // Outer glow halo around newest point
      if (trail.current.length > 0) {
        const newest = trail.current[trail.current.length - 1];
        const halo = ctx.createRadialGradient(newest.x, newest.y, 0, newest.x, newest.y, 55);
        halo.addColorStop(0,   "rgba(255, 100, 20, 0.18)");
        halo.addColorStop(0.5, "rgba(236, 60,  0,  0.07)");
        halo.addColorStop(1,   "rgba(0, 0, 0, 0)");
        ctx.beginPath();
        ctx.arc(newest.x, newest.y, 55, 0, Math.PI * 2);
        ctx.fillStyle = halo;
        ctx.fill();
      }

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", resize);
      document.body.style.cursor = "";
    };
  }, [rawX, rawY]);

  return (
    <>
      {/* Comet tail canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: 9996 }}
      />

      {/* Glowing core dot */}
      <motion.div
        className="fixed pointer-events-none"
        style={{
          top: 0,
          left: 0,
          x: coreX,
          y: coreY,
          marginLeft: -8,
          marginTop: -8,
          width: 16,
          height: 16,
          borderRadius: "50%",
          background: "radial-gradient(circle, #fff5d0 0%, #ffb040 35%, #ff6010 65%, #ec5800 100%)",
          boxShadow:
            "0 0 8px 3px rgba(255,140,30,1), 0 0 20px 8px rgba(255,90,10,0.6), 0 0 40px 14px rgba(236,88,0,0.3)",
          zIndex: 9999,
        }}
      >
        {/* Pulse ring */}
        <motion.div
          className="absolute rounded-full"
          style={{
            inset: -2,
            border: "1.5px solid rgba(255,140,40,0.7)",
          }}
          animate={{ scale: [1, 2.8, 1], opacity: [0.9, 0, 0.9] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
        />
      </motion.div>
    </>
  );
}
