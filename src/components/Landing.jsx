// Landing.jsx — Full-screen kinetic headline (v2 — mobile-first, alive)
//
// Changes vs v1:
//  • Word-group stagger: each word staggered at 140ms, letters within a word at 35ms
//    giving a speech-rhythm cadence rather than uniform ticker-tape
//  • Floating ambient particles in background (pure CSS, 5 micro-orbs)
//  • Wax-seal button has slow idle breathing pulse when visible
//  • Exit: upward drift + blur for depth-continuous hand-off to cover
//  • All touch targets ≥ 48px via padding; whileTap on all interactive elements

import { motion } from "framer-motion";

const HEADLINE = "22 trips around the sun.";
const SUBLINE  = "Some proof, in case you forgot how good it\u2019s been.";

/* ── Animation variants ── */

// Word-level container: stagger between words
const sentenceVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.15 },
  },
};

// Letter-level container (one per word): stagger within a word
const wordVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.025 },
  },
};

// Individual letter: blur-in from below
const letterVariants = {
  hidden: { opacity: 0, y: 18, filter: "blur(8px)" },
  visible: {
    opacity: 1, y: 0, filter: "blur(0px)",
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

const sublineVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.9 },
  },
};

const ruleVariants = {
  hidden: { scaleX: 0, opacity: 0 },
  visible: {
    scaleX: 1, opacity: 1,
    transition: { delay: 0.75, duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

const buttonVariants = {
  hidden: { opacity: 0, scale: 0.75 },
  visible: {
    opacity: 1, scale: 1,
    transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1], delay: 1.1 },
  },
};

/* ─────────────────────────────────────────────────────────────────────────── */
export default function Landing({ onOpen }) {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{
        opacity: 0, scale: 0.94, y: -20, filter: "blur(10px)",
        transition: { duration: 0.62, ease: [0.4, 0, 1, 1] },
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "clamp(1.5rem, 5vw, 3rem)",
        gap: "clamp(1.2rem, 3.5vw, 2.4rem)",
      }}
    >
      {/* Floating ambient particles — purely decorative, GPU CSS only */}
      <FloatingParticles />

      {/* Kinetic headline — word-by-word stagger with letter-level detail */}
      <motion.h1
        variants={sentenceVariants}
        initial="hidden"
        animate="visible"
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(2rem, 9vw, 6rem)",
          fontWeight: 900,
          lineHeight: 1.08,
          letterSpacing: "-0.02em",
          textAlign: "center",
          color: "var(--col-text)",
          maxWidth: "16ch",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          columnGap: "0.25em",
          rowGap: "0.05em",
          // 3D context for letter rotateX if desired
          perspective: "600px",
        }}
      >
        {HEADLINE.split(" ").map((word, wi) => (
          <motion.span
            key={wi}
            variants={wordVariants}
            style={{ display: "inline-flex", overflow: "visible" }}
          >
            {word.split("").map((char, ci) => (
              <motion.span
                key={ci}
                variants={letterVariants}
                style={{ display: "inline-block" }}
              >
                {char}
              </motion.span>
            ))}
          </motion.span>
        ))}
      </motion.h1>

      {/* Accent rule */}
      <motion.div
        variants={ruleVariants}
        initial="hidden"
        animate="visible"
        style={{
          width: "clamp(48px, 12vw, 120px)",
          height: "1px",
          background:
            "linear-gradient(90deg, transparent, var(--col-amber), transparent)",
          transformOrigin: "center",
        }}
      />

      {/* Sub-headline */}
      <motion.p
        variants={sublineVariants}
        initial="hidden"
        animate="visible"
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "clamp(0.62rem, 2.2vw, 0.9rem)",
          color: "var(--col-text-dim)",
          letterSpacing: "0.08em",
          textAlign: "center",
          textTransform: "uppercase",
          maxWidth: "36ch",
        }}
      >
        {SUBLINE}
      </motion.p>

      {/* Wax-seal "Open" button — idle breathing + tap feedback */}
      <motion.button
        variants={buttonVariants}
        initial="hidden"
        animate="visible"
        onClick={onOpen}
        whileTap={{ scale: 0.91, transition: { duration: 0.1 } }}
        style={{
          marginTop: "clamp(0.4rem, 2vw, 0.8rem)",
          // Minimum 48px touch target covered by the circle itself
          width: "clamp(88px, 20vw, 118px)",
          height: "clamp(88px, 20vw, 118px)",
          borderRadius: "50%",
          border: "1.5px solid var(--col-amber-dim)",
          background:
            "radial-gradient(circle at 40% 35%, #3a2c1a 0%, #1a1208 70%)",
          cursor: "pointer",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.3rem",
          boxShadow:
            "0 0 0 4px rgba(201,129,58,0.07), inset 0 1px 0 rgba(255,255,255,0.04)",
          position: "relative",
          overflow: "hidden",
          // No -webkit-tap-highlight
          WebkitTapHighlightColor: "transparent",
          outline: "none",
        }}
      >
        {/* Idle breathing glow ring — starts after button appears */}
        <motion.div
          aria-hidden="true"
          animate={{
            boxShadow: [
              "0 0 0px 0px rgba(201,129,58,0)",
              "0 0 22px 8px rgba(201,129,58,0.22)",
              "0 0 0px 0px rgba(201,129,58,0)",
            ],
          }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            pointerEvents: "none",
          }}
        />

        <WaxSealRings />

        <span
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "clamp(0.55rem, 1.8vw, 0.65rem)",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "var(--col-amber-glow)",
            fontWeight: 500,
            position: "relative",
            zIndex: 1,
          }}
        >
          Let's go
        </span>
      </motion.button>
    </motion.div>
  );
}

/* ── Floating ambient particles ── */
const PARTICLES = [
  { size: 3,   x: 12,  y: 22,  dur: 14, delay: 0,  amp: 9 },
  { size: 2,   x: 78,  y: 38,  dur: 18, delay: 2.5, amp: 7 },
  { size: 3.5, x: 52,  y: 72,  dur: 12, delay: 5,  amp: 11 },
  { size: 2,   x: 25,  y: 82,  dur: 20, delay: 1.5, amp: 8 },
  { size: 2.5, x: 88,  y: 58,  dur: 16, delay: 7,  amp: 10 },
  { size: 1.5, x: 42,  y: 18,  dur: 22, delay: 4,  amp: 6 },
];

function FloatingParticles() {
  return (
    <div
      aria-hidden="true"
      style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }}
    >
      {PARTICLES.map((p, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0, 0.45, 0.18, 0.45, 0],
            y: [0, -p.amp, 0, p.amp * 0.5, 0],
          }}
          transition={{
            duration: p.dur,
            delay: p.delay + 1.5, // start after headline begins
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            background: "var(--col-amber)",
            boxShadow: `0 0 ${p.size * 3}px ${p.size}px rgba(201,129,58,0.3)`,
            // GPU layer
            willChange: "transform, opacity",
          }}
        />
      ))}
    </div>
  );
}

/* ── Wax-seal decorative rings ── */
function WaxSealRings() {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 120 120"
      style={{ position: "absolute", inset: 0, opacity: 0.42 }}
      aria-hidden="true"
    >
      <circle cx="60" cy="60" r="54" fill="none"
        stroke="rgba(201,129,58,0.6)" strokeWidth="0.8" strokeDasharray="3 4" />
      <circle cx="60" cy="60" r="44" fill="none"
        stroke="rgba(201,129,58,0.3)" strokeWidth="0.6" />
      {[0, 45, 90, 135].map((deg) => (
        <line key={deg} x1="60" y1="52" x2="60" y2="68"
          stroke="rgba(201,129,58,0.5)" strokeWidth="0.7" strokeLinecap="round"
          transform={`rotate(${deg} 60 60)`} />
      ))}
    </svg>
  );
}
