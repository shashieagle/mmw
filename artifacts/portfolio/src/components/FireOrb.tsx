import { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export function FireOrb() {
  const rawX = useMotionValue(-200);
  const rawY = useMotionValue(-200);

  const x = useSpring(rawX, { stiffness: 60, damping: 20, mass: 1.2 });
  const y = useSpring(rawY, { stiffness: 60, damping: 20, mass: 1.2 });

  useEffect(() => {
    const move = (e: MouseEvent) => {
      rawX.set(e.clientX - 200);
      rawY.set(e.clientY - 200);
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [rawX, rawY]);

  return (
    <motion.div
      className="fixed pointer-events-none z-0"
      style={{ x, y, width: 400, height: 400 }}
    >
      {/* Outer soft glow */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(236,88,0,0.13) 0%, rgba(255,80,0,0.06) 40%, transparent 70%)",
          filter: "blur(32px)",
        }}
      />
      {/* Inner core */}
      <div
        className="absolute rounded-full"
        style={{
          top: "38%",
          left: "38%",
          width: 48,
          height: 48,
          background: "radial-gradient(circle, rgba(255,120,30,0.45) 0%, rgba(236,88,0,0.2) 50%, transparent 80%)",
          filter: "blur(10px)",
        }}
      />
    </motion.div>
  );
}
