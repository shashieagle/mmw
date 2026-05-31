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
      className="fixed pointer-events-none"
      style={{ x, y, width: 420, height: 420, zIndex: 9998 }}
    >
      {/* Outer soft glow */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(236,88,0,0.22) 0%, rgba(255,80,0,0.10) 45%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />
      {/* Mid ring */}
      <div
        className="absolute rounded-full"
        style={{
          top: "28%",
          left: "28%",
          width: 120,
          height: 120,
          background: "radial-gradient(circle, rgba(255,110,20,0.28) 0%, rgba(236,88,0,0.12) 55%, transparent 80%)",
          filter: "blur(20px)",
        }}
      />
      {/* Inner core */}
      <div
        className="absolute rounded-full"
        style={{
          top: "43%",
          left: "43%",
          width: 56,
          height: 56,
          background: "radial-gradient(circle, rgba(255,140,40,0.6) 0%, rgba(236,88,0,0.3) 50%, transparent 80%)",
          filter: "blur(8px)",
        }}
      />
    </motion.div>
  );
}
