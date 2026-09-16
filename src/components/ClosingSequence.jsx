// ClosingSequence.jsx — final scene after the letter page
//
// Sequence:
//  1. Full-screen fade-in over ambient background
//  2. "Here's to 22." — letter stagger blur-to-focus (same mechanic as Landing)
//  3. Quiet replay link fades in below
//  4. If audio is playing, it fades out gently on mount
//
// Props:
//   onReplay — called when user taps the replay link (resets Book to page 0)

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const CLOSING_LINE = "Here's to 22.";

// Split into words for stagger, letters within words for blur-reveal
const words = CLOSING_LINE.split(" ");

const letterVariant = {
  hidden: { opacity: 0, y: 20, filter: "blur(12px)" },
  visible: {
    opacity: 1, y: 0, filter: "blur(0px)",
    transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] },
  },
};

export default function ClosingSequence({ onReplay }) {
  const audioFadeRef = useRef(null);

  // Fade out any playing audio when closing sequence mounts
  useEffect(() => {
    // Find the ambient audio element by its src ending
    const audios = Array.from(document.querySelectorAll("audio"));
    const ambient = audios.find((a) => a.src?.includes("ambient"));
    if (!ambient || ambient.paused) return;

    const startVol = ambient.volume;
    const step = startVol / 40; // fade over ~40 ticks
    let count = 0;

    audioFadeRef.current = setInterval(() => {
      count++;
      const next = Math.max(0, ambient.volume - step);
      ambient.volume = next;
      if (next <= 0 || count > 50) {
        clearInterval(audioFadeRef.current);
        ambient.pause();
        ambient.volume = startVol; // restore for replay
      }
    }, 80); // 80ms × 40 = ~3.2s fade

    return () => clearInterval(audioFadeRef.current);
  }, []);

  // Total stagger: count letters + word gaps
  const totalLetters = CLOSING_LINE.replace(/ /g, "").length;
  const replayDelay = 0.4 + totalLetters * 0.042 + 0.8;

  return (
    <motion.div
      key="closing"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 20,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "clamp(1.8rem, 6vw, 3.2rem)",
        // Semi-transparent overlay so ambient background shows through
        background: "rgba(17,13,8,0.88)",
      }}
    >
      {/* ── Animated headline ─────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "0 0.4em",
          overflow: "hidden",
        }}
        aria-label={CLOSING_LINE}
      >
        {words.map((word, wi) => {
          // Count letters up to this word for delay offset
          const lettersBeforeThisWord = words
            .slice(0, wi)
            .reduce((acc, w) => acc + w.length, 0);

          return (
            <span
              key={wi}
              style={{ display: "inline-flex", overflow: "hidden" }}
              aria-hidden="true"
            >
              {word.split("").map((char, ci) => {
                const globalIndex = lettersBeforeThisWord + ci;
                return (
                  <motion.span
                    key={ci}
                    variants={letterVariant}
                    initial="hidden"
                    animate="visible"
                    transition={{
                      delay: 0.4 + globalIndex * 0.042,
                      duration: 0.75,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    style={{
                      fontFamily: "var(--font-display)",
                      fontStyle: "italic",
                      fontWeight: 700,
                      fontSize: "clamp(2rem, 7vw, 4.5rem)",
                      color: "var(--col-text)",
                      display: "inline-block",
                      lineHeight: 1.1,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {char}
                  </motion.span>
                );
              })}
            </span>
          );
        })}
      </div>

      {/* ── Decorative rule ────────────────────────────────────────────────── */}
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ delay: replayDelay - 0.5, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        style={{
          width: "clamp(40px, 10vw, 72px)",
          height: "1px",
          background: "var(--col-amber-dim)",
          opacity: 0.5,
          transformOrigin: "center",
        }}
      />

      {/* ── Quiet replay link ──────────────────────────────────────────────── */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: replayDelay, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        onClick={onReplay}
        whileTap={{ scale: 0.95, transition: { duration: 0.08 } }}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          fontFamily: "var(--font-body)",
          fontSize: "clamp(0.58rem, 1.5vw, 0.72rem)",
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: "var(--col-text-muted)",
          opacity: 0.55,
          textDecoration: "underline",
          textUnderlineOffset: "3px",
          textDecorationColor: "rgba(138,90,38,0.3)",
          padding: "0.5rem 1rem",
          minHeight: 44,
          WebkitTapHighlightColor: "transparent",
          outline: "none",
          transition: "opacity 0.3s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.55")}
      >
        read it again
      </motion.button>
    </motion.div>
  );
}
