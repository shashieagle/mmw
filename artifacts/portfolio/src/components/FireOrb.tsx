import { useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export function FireOrb() {
  const mouseX = useMotionValue(-200);
  const mouseY = useMotionValue(-200);

  // Core — tight follow
  const coreX = useSpring(mouseX, { stiffness: 500, damping: 30 });
  const coreY = useSpring(mouseY, { stiffness: 500, damping: 30 });

  // Outer glow — lazy trail
  const glowX = useSpring(mouseX, { stiffness: 90, damping: 20 });
  const glowY = useSpring(mouseY, { stiffness: 90, damping: 20 });

  useEffect(() => {
    const move = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener("mousemove", move);
    document.body.style.cursor = "none";
    return () => {
      window.removeEventListener("mousemove", move);
      document.body.style.cursor = "";
    };
  }, [mouseX, mouseY]);

  return (
    <>
      {/* Outer haze — lazy */}
      <motion.div
        className="fixed pointer-events-none"
        style={{
          top: 0,
          left: 0,
          x: glowX,
          y: glowY,
          marginLeft: -80,
          marginTop: -80,
          width: 160,
          height: 160,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,95,20,0.30) 0%, rgba(236,88,0,0.12) 50%, transparent 75%)",
          filter: "blur(24px)",
          zIndex: 9996,
        }}
      />

      {/* Mid ring — medium follow */}
      <motion.div
        className="fixed pointer-events-none"
        style={{
          top: 0,
          left: 0,
          x: glowX,
          y: glowY,
          marginLeft: -20,
          marginTop: -20,
          width: 40,
          height: 40,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,120,30,0.55) 0%, rgba(236,88,0,0.25) 55%, transparent 80%)",
          filter: "blur(8px)",
          zIndex: 9997,
        }}
      />

      {/* Bright core — snaps to cursor */}
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
          background: "radial-gradient(circle, #ffe0a0 0%, #ff7020 40%, #ec5800 75%)",
          boxShadow: "0 0 10px 4px rgba(255,100,20,0.9), 0 0 24px 8px rgba(236,88,0,0.5)",
          zIndex: 9999,
        }}
      >
        {/* Pulse ring */}
        <motion.div
          className="absolute rounded-full border border-orange-400/60"
          style={{ inset: 0 }}
          animate={{ scale: [1, 2.4, 1], opacity: [0.8, 0, 0.8] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
        />
      </motion.div>
    </>
  );
}
