import { motion } from "framer-motion";

export function FireOrb() {
  return (
    <>
      {/* Primary orb — slow drift */}
      <motion.div
        className="fixed pointer-events-none"
        style={{ zIndex: 9998, width: 500, height: 500 }}
        animate={{
          x: ["-10vw", "60vw", "80vw", "30vw", "-10vw"],
          y: ["10vh", "60vh", "20vh", "70vh", "10vh"],
        }}
        transition={{
          duration: 28,
          repeat: Infinity,
          ease: "easeInOut",
          times: [0, 0.25, 0.5, 0.75, 1],
        }}
      >
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(236,88,0,0.18) 0%, rgba(255,80,0,0.08) 45%, transparent 70%)",
            filter: "blur(50px)",
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            top: "35%",
            left: "35%",
            width: 100,
            height: 100,
            background:
              "radial-gradient(circle, rgba(255,120,30,0.35) 0%, rgba(236,88,0,0.15) 55%, transparent 80%)",
            filter: "blur(18px)",
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            top: "44%",
            left: "44%",
            width: 50,
            height: 50,
            background:
              "radial-gradient(circle, rgba(255,150,50,0.65) 0%, rgba(236,88,0,0.3) 50%, transparent 80%)",
            filter: "blur(7px)",
          }}
        />
      </motion.div>

      {/* Secondary smaller orb — offset drift */}
      <motion.div
        className="fixed pointer-events-none"
        style={{ zIndex: 9997, width: 280, height: 280 }}
        animate={{
          x: ["70vw", "20vw", "50vw", "10vw", "70vw"],
          y: ["60vh", "20vh", "75vh", "40vh", "60vh"],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut",
          times: [0, 0.25, 0.5, 0.75, 1],
          delay: 4,
        }}
      >
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(255,100,20,0.12) 0%, rgba(236,88,0,0.05) 50%, transparent 70%)",
            filter: "blur(35px)",
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            top: "40%",
            left: "40%",
            width: 36,
            height: 36,
            background:
              "radial-gradient(circle, rgba(255,140,40,0.55) 0%, rgba(236,88,0,0.2) 55%, transparent 80%)",
            filter: "blur(6px)",
          }}
        />
      </motion.div>
    </>
  );
}
