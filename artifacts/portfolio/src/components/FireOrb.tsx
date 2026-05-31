import { useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export function FireOrb() {
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Tight spring for the core — snaps close to cursor
  const coreX = useSpring(mouseX, { stiffness: 400, damping: 28 });
  const coreY = useSpring(mouseY, { stiffness: 400, damping: 28 });

  // Lazy spring for the outer glow — lags behind
  const glowX = useSpring(mouseX, { stiffness: 80, damping: 18 });
  const glowY = useSpring(mouseY, { stiffness: 80, damping: 18 });

  useEffect(() => {
    const move = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener("mousemove", move);
    // Hide default cursor globally
    document.body.style.cursor = "none";
    return () => {
      window.removeEventListener("mousemove", move);
      document.body.style.cursor = "auto";
    };
  }, [mouseX, mouseY]);

  return (
    <>
      {/* Outer glow — trails lazily */}
      <motion.div
        className="fixed pointer-events-none"
        style={{
          x: glowX,
          y: glowY,
          translateX: "-50%",
          translateY: "-50%",
          width: 120,
          height: 120,
          zIndex: 9997,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,100,20,0.20) 0%, rgba(236,88,0,0.08) 50%, transparent 70%)",
          filter: "blur(20px)",
        }}
      />

      {/* Mid ring — medium lag */}
      <motion.div
        className="fixed pointer-events-none"
        style={{
          x: glowX,
          y: glowY,
          translateX: "-50%",
          translateY: "-50%",
          width: 36,
          height: 36,
          zIndex: 9998,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,130,30,0.5) 0%, rgba(236,88,0,0.2) 60%, transparent 80%)",
          filter: "blur(6px)",
          mixBlendMode: "screen",
        }}
      />

      {/* Core — tight follow, bright centre */}
      <motion.div
        className="fixed pointer-events-none"
        style={{
          x: coreX,
          y: coreY,
          translateX: "-50%",
          translateY: "-50%",
          zIndex: 9999,
          width: 14,
          height: 14,
          borderRadius: "50%",
          mixBlendMode: "screen",
        }}
      >
        {/* Pulse ring */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: "rgba(255,120,30,0.25)",
            border: "1px solid rgba(255,120,30,0.6)",
          }}
          animate={{ scale: [1, 1.8, 1], opacity: [0.7, 0, 0.7] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Bright dot */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "radial-gradient(circle, #ffb060 0%, #ff6010 50%, #ec5800 100%)",
            boxShadow:
              "0 0 8px 3px rgba(255,100,20,0.8), 0 0 20px 6px rgba(236,88,0,0.4)",
          }}
        />
      </motion.div>
    </>
  );
}
