import { motion } from "framer-motion";

export function HeroAnimation() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1, delay: 0.5 }}
      className="w-full max-w-3xl mx-auto select-none"
    >
      <svg viewBox="0 0 720 380" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
        <defs>
          <pattern id="bp-grid" width="22" height="22" patternUnits="userSpaceOnUse">
            <path d="M 22 0 L 0 0 0 22" fill="none" stroke="rgba(232,87,42,0.18)" strokeWidth="0.5" />
          </pattern>
        </defs>

        {/* ── LEFT: Blueprint Panel ── */}
        <motion.g initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.0, duration: 0.8 }}>
          <rect x="8" y="55" width="210" height="230" fill="url(#bp-grid)" rx="3" />
          <rect x="8" y="55" width="210" height="230" stroke="rgba(232,87,42,0.2)" strokeWidth="1" rx="3" fill="none" />

          {/* Header bar */}
          <rect x="8" y="55" width="210" height="20" fill="rgba(232,87,42,0.12)" rx="3" />
          <text x="113" y="69" fill="rgba(232,87,42,0.7)" fontSize="7" textAnchor="middle" fontFamily="monospace" letterSpacing="2.5">BUSINESS BLUEPRINT</text>

          {/* Tall building */}
          <motion.g initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ delay: 1.6, duration: 0.7, ease: "easeOut" }} style={{ transformOrigin: "55px 263px" }}>
            <rect x="25" y="115" width="60" height="148" fill="rgba(232,87,42,0.06)" stroke="rgba(232,87,42,0.5)" strokeWidth="1.5" />
            {[0,1,2,3,4,5,6].map(i => (
              <g key={i}>
                <rect x="32" y={122 + i * 18} width="10" height="12" fill="none" stroke="rgba(232,87,42,0.35)" strokeWidth="0.8" />
                <rect x="47" y={122 + i * 18} width="10" height="12" fill="none" stroke="rgba(232,87,42,0.35)" strokeWidth="0.8" />
                <rect x="62" y={122 + i * 18} width="10" height="12" fill="none" stroke="rgba(232,87,42,0.35)" strokeWidth="0.8" />
              </g>
            ))}
            <rect x="45" y="230" width="20" height="33" fill="rgba(232,87,42,0.1)" stroke="rgba(232,87,42,0.4)" strokeWidth="0.8" />
          </motion.g>

          {/* Smaller building */}
          <motion.g initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ delay: 1.9, duration: 0.5, ease: "easeOut" }} style={{ transformOrigin: "140px 263px" }}>
            <rect x="110" y="163" width="50" height="100" fill="rgba(232,87,42,0.05)" stroke="rgba(232,87,42,0.4)" strokeWidth="1.5" />
            {[0,1,2,3].map(i => (
              <g key={i}>
                <rect x="117" y={170 + i * 20} width="10" height="13" fill="none" stroke="rgba(232,87,42,0.3)" strokeWidth="0.8" />
                <rect x="133" y={170 + i * 20} width="10" height="13" fill="none" stroke="rgba(232,87,42,0.3)" strokeWidth="0.8" />
              </g>
            ))}
          </motion.g>

          {/* Ground */}
          <line x1="18" y1="264" x2="208" y2="264" stroke="rgba(232,87,42,0.45)" strokeWidth="1.5" />

          {/* Ruler */}
          <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.2, duration: 0.5 }}>
            <rect x="170" y="88" width="10" height="165" fill="rgba(232,87,42,0.08)" stroke="rgba(232,87,42,0.3)" strokeWidth="1" />
            {[0,1,2,3,4,5,6,7].map(i => (
              <line key={i} x1="170" y1={95 + i * 20} x2={i % 2 === 0 ? 180 : 176} y2={95 + i * 20} stroke="rgba(232,87,42,0.45)" strokeWidth="0.8" />
            ))}
          </motion.g>

          {/* Label */}
          <text x="113" y="296" fill="rgba(232,87,42,0.5)" fontSize="7" textAnchor="middle" fontFamily="monospace" letterSpacing="2">BUSINESS ARCHITECTS</text>
        </motion.g>

        {/* ── MONKEY CHARACTER (center) ── */}
        <motion.g
          animate={{ y: [0, -7, 0] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Hard hat */}
          <motion.g initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.5 }}>
            <ellipse cx="360" cy="148" rx="55" ry="11" fill="#E8572A" />
            <rect x="312" y="140" width="96" height="18" rx="4" fill="#E8572A" />
            <rect x="326" y="126" width="68" height="24" rx="9" fill="#CF4E26" />
            <rect x="350" y="122" width="20" height="8" rx="2" fill="#FF7A4D" />
          </motion.g>

          {/* Ears */}
          <ellipse cx="298" cy="196" rx="22" ry="24" fill="#C8916A" />
          <ellipse cx="298" cy="196" rx="14" ry="16" fill="#B07050" />
          <ellipse cx="422" cy="196" rx="22" ry="24" fill="#C8916A" />
          <ellipse cx="422" cy="196" rx="14" ry="16" fill="#B07050" />

          {/* Head */}
          <ellipse cx="360" cy="195" rx="62" ry="60" fill="#D9A878" />

          {/* Muzzle */}
          <ellipse cx="360" cy="224" rx="32" ry="24" fill="#C0885A" />

          {/* Eyes */}
          <motion.g animate={{ scaleY: [1, 0.08, 1] }} transition={{ duration: 0.15, repeat: Infinity, repeatDelay: 4 }} style={{ transformOrigin: "360px 188px" }}>
            <circle cx="341" cy="188" r="10" fill="white" />
            <circle cx="379" cy="188" r="10" fill="white" />
          </motion.g>
          <circle cx="343" cy="190" r="5.5" fill="#1a1a1a" />
          <circle cx="381" cy="190" r="5.5" fill="#1a1a1a" />
          <circle cx="345" cy="188" r="2" fill="white" />
          <circle cx="383" cy="188" r="2" fill="white" />

          {/* Eyebrows */}
          <path d="M 331 179 Q 341 174 351 178" stroke="#7A5230" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M 369 178 Q 379 174 389 179" stroke="#7A5230" strokeWidth="2.5" fill="none" strokeLinecap="round" />

          {/* Nostrils */}
          <circle cx="353" cy="227" r="3.5" fill="#A06840" />
          <circle cx="367" cy="227" r="3.5" fill="#A06840" />

          {/* Smile */}
          <path d="M 337 238 Q 360 252 383 238" stroke="#7A5230" strokeWidth="2.5" fill="none" strokeLinecap="round" />

          {/* Body suit */}
          <rect x="315" y="252" width="90" height="90" rx="10" fill="#111111" />

          {/* Shirt collar */}
          <polygon points="360,252 342,272 360,286 378,272" fill="white" />

          {/* Tie (persimmon) */}
          <polygon points="360,268 354,280 360,308 366,280" fill="#E8572A" />
          <polygon points="354,266 360,258 366,266 360,272" fill="#CF4E26" />

          {/* Lapels */}
          <polygon points="360,252 315,278 320,320 348,268" fill="#1e1e1e" />
          <polygon points="360,252 405,278 400,320 372,268" fill="#1e1e1e" />

          {/* Buttons */}
          <circle cx="360" cy="320" r="2.5" fill="#333" />
          <circle cx="360" cy="331" r="2.5" fill="#333" />

          {/* Arms */}
          <rect x="257" y="262" width="60" height="28" rx="14" fill="#C8916A" />
          <rect x="403" y="262" width="60" height="28" rx="14" fill="#C8916A" />
        </motion.g>

        {/* Blueprint scroll in left hand */}
        <motion.g initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.2, duration: 0.6 }}>
          <rect x="208" y="256" width="55" height="30" rx="6" fill="#F0E8D0" stroke="rgba(232,87,42,0.5)" strokeWidth="1.5" />
          <circle cx="208" cy="271" r="15" fill="#F0E8D0" stroke="rgba(232,87,42,0.5)" strokeWidth="1.5" />
          <circle cx="263" cy="271" r="15" fill="#F0E8D0" stroke="rgba(232,87,42,0.5)" strokeWidth="1.5" />
          <line x1="215" y1="264" x2="256" y2="264" stroke="rgba(232,87,42,0.6)" strokeWidth="1.2" />
          <line x1="215" y1="270" x2="256" y2="270" stroke="rgba(232,87,42,0.6)" strokeWidth="1.2" />
          <line x1="215" y1="276" x2="256" y2="276" stroke="rgba(232,87,42,0.6)" strokeWidth="1.2" />
          <line x1="230" y1="261" x2="230" y2="281" stroke="rgba(232,87,42,0.3)" strokeWidth="0.8" />
          <line x1="245" y1="261" x2="245" y2="281" stroke="rgba(232,87,42,0.3)" strokeWidth="0.8" />
        </motion.g>

        {/* Book in right hand */}
        <motion.g initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.4, duration: 0.6 }}>
          <rect x="457" y="253" width="32" height="40" rx="2" fill="#2a2a2a" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
          <rect x="489" y="253" width="32" height="40" rx="2" fill="#f5f5f0" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
          <rect x="487" y="251" width="6" height="44" rx="1" fill="#E8572A" />
          {[0,1,2,3,4].map(i => (
            <line key={i} x1="494" y1={260 + i * 6} x2="516" y2={260 + i * 6} stroke="rgba(100,100,100,0.6)" strokeWidth="1" />
          ))}
          {[0,1].map(i => (
            <line key={i} x1="462" y1={262 + i * 10} x2="480" y2={262 + i * 10} stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
          ))}
        </motion.g>

        {/* ── RIGHT: Story / Narrative Panel ── */}
        <motion.g initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.0, duration: 0.8 }}>

          {/* Speech bubble */}
          <motion.g
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
          >
            <rect x="502" y="52" width="208" height="125" rx="16" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
            <path d="M 520 177 L 505 196 L 540 177" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />

            <text x="606" y="80" fill="rgba(255,255,255,0.5)" fontSize="7" textAnchor="middle" fontFamily="monospace" letterSpacing="2.5">NARRATIVE DESIGN</text>
            <line x1="514" y1="87" x2="698" y2="87" stroke="rgba(255,255,255,0.08)" strokeWidth="0.8" />

            {/* Alternating story quotes */}
            <motion.text
              x="606" y="113"
              fill="rgba(232,87,42,0.85)"
              fontSize="11.5"
              textAnchor="middle"
              fontFamily="Georgia, serif"
              fontStyle="italic"
              animate={{ opacity: [0, 1, 1, 0] }}
              transition={{ duration: 5, repeat: Infinity, times: [0, 0.15, 0.75, 1] }}
            >
              "Every business has a story."
            </motion.text>
            <motion.text
              x="606" y="113"
              fill="rgba(232,87,42,0.85)"
              fontSize="11.5"
              textAnchor="middle"
              fontFamily="Georgia, serif"
              fontStyle="italic"
              animate={{ opacity: [1, 0, 0, 1] }}
              transition={{ duration: 5, repeat: Infinity, times: [0, 0.15, 0.75, 1] }}
            >
              "We write the next chapter."
            </motion.text>

            {/* Animated cursor */}
            <motion.rect
              x="685" y="103"
              width="2" height="14"
              fill="rgba(232,87,42,0.7)"
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 0.9, repeat: Infinity }}
            />

            <text x="606" y="150" fill="rgba(255,255,255,0.18)" fontSize="7.5" textAnchor="middle" fontFamily="monospace" letterSpacing="2">MONKMONKEYWORKS</text>
          </motion.g>

          {/* Story lines below */}
          <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.0, duration: 0.8 }}>
            {[
              { y: 210, w: 160, label: "Chapter 01 — Strategy" },
              { y: 232, w: 120, label: "Chapter 02 — Systems" },
              { y: 254, w: 140, label: "Chapter 03 — Standards" },
            ].map((item, i) => (
              <motion.g key={i} initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 2.0 + i * 0.2, duration: 0.5 }} style={{ transformOrigin: "502px " + item.y + "px" }}>
                <rect x="502" y={item.y - 6} width={item.w} height="16" rx="2" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)" strokeWidth="0.8" />
                <text x="510" y={item.y + 5} fill="rgba(255,255,255,0.35)" fontSize="7.5" fontFamily="monospace" letterSpacing="1">{item.label}</text>
              </motion.g>
            ))}
          </motion.g>

          {/* Label */}
          <text x="606" y="296" fill="rgba(255,255,255,0.25)" fontSize="7" textAnchor="middle" fontFamily="monospace" letterSpacing="2">STORYTELLERS</text>
        </motion.g>

        {/* ── Floating accent words ── */}
        <motion.text
          x="113" y="46"
          fill="rgba(232,87,42,0.45)"
          fontSize="8"
          textAnchor="middle"
          fontFamily="monospace"
          letterSpacing="2"
          animate={{ y: [0, -4, 0], opacity: [0.45, 0.7, 0.45] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          SYSTEMS · STRATEGY · SCALE
        </motion.text>

        <motion.text
          x="606" y="330"
          fill="rgba(255,255,255,0.12)"
          fontSize="8"
          textAnchor="middle"
          fontFamily="monospace"
          letterSpacing="2"
          animate={{ y: [0, -4, 0], opacity: [0.12, 0.25, 0.12] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        >
          STORY · DESIGN · IMPACT
        </motion.text>

      </svg>
    </motion.div>
  );
}
