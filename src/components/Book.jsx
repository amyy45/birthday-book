// Book.jsx — page-flip orchestrator (v4)
//
// Changes vs v3:
//  • pages.js now has 9 pages (indices 0-8); last page (index 8) is the letter
//  • When on the letter page (isFinal), right ClickZone is hidden and a
//    "close" indicator appears after the letter finishes animating (~3.5s)
//    — tapping it calls onClose() which now transitions to ClosingSequence
//  • Left ClickZone works normally on the letter page (can go back)
//  • Everything else (flip mechanic, swipe, keyboard) unchanged

import { useState, useCallback, useRef, useEffect } from "react";
import {
  motion, AnimatePresence,
  useMotionValue, useTransform,
  animate, useAnimate,
} from "framer-motion";
import PageContent from "./PageContent.jsx";
import ProgressIndicator from "./ProgressIndicator.jsx";
import { useSwipe } from "../hooks/useSwipe.js";
import { pages } from "../data/pages.js";

export default function Book({ onClose }) {
  const [currentPage,   setCurrentPage]   = useState(0);
  const [underlayIndex, setUnderlayIndex] = useState(null);
  const [isFlipping,    setIsFlipping]    = useState(false);
  // Track whether the letter has finished revealing (for the close indicator)
  const [letterRevealed, setLetterRevealed] = useState(false);
  const totalPages = pages.length;

  // ── Book-container scope for closing animation ───────────────────────────
  const [bookScope, bookAnimate] = useAnimate();

  // ── MotionValue driving the 3D flip ─────────────────────────────────────
  const rotY = useMotionValue(0);

  // Derived warp + lighting from rotY
  const skewY      = useTransform(rotY, [-180,-135,-90,-45,0], [0, 2.8, 0, -2.8, 0]);
  const rotX       = useTransform(rotY, [-180,-90,0],          [0, 1.5, 0]);
  const foldShadow = useTransform(rotY, [-180,-90,-30,0],      [0, 0, 0.52, 0]);
  const castShadow = useTransform(rotY, [-180,-130,-90,-50,0], [0, 0.35, 0.55, 0.35, 0]);

  // ── Flip sequencer ───────────────────────────────────────────────────────
  const flipInProgress = useRef(false);

  const triggerFlip = useCallback(async (targetIndex) => {
    if (flipInProgress.current) return;
    if (targetIndex < 0 || targetIndex >= totalPages) return;

    flipInProgress.current = true;
    setLetterRevealed(false); // reset letter reveal on any flip
    setUnderlayIndex(targetIndex);
    setIsFlipping(true);

    // Phase 1 — corner lift
    await animate(rotY, -13, { duration: 0.19, ease: [0.4, 0, 0.9, 0.6] });

    // Phase 2 — full arc spring
    await animate(rotY, -180, {
      type: "spring", stiffness: 50, damping: 11.5,
      mass: 1.1, restDelta: 0.5, restSpeed: 0.5,
    });

    // Phase 3 — swap, reset
    setCurrentPage(targetIndex);
    setUnderlayIndex(null);
    setIsFlipping(false);
    flipInProgress.current = false;
    rotY.set(0);
  }, [rotY, totalPages]);

  const goNext = useCallback(() => triggerFlip(currentPage + 1), [triggerFlip, currentPage]);
  const goPrev = useCallback(() => triggerFlip(currentPage - 1), [triggerFlip, currentPage]);

  // ── Letter reveal timer ───────────────────────────────────────────────────
  // When the letter page is reached, wait for all paragraphs to animate in
  // (stagger: 0.9 + n*0.55 + 0.3 for signoff + 1s buffer) then show close cue
  const currentPageData = pages[currentPage];
  const isLetterPage = currentPageData?.type === "letter";

  useEffect(() => {
    if (!isLetterPage || isFlipping) return;
    setLetterRevealed(false);

    const paragraphCount = currentPageData?.paragraphs?.length ?? 3;
    const revealDuration = 0.9 + paragraphCount * 0.55 + 0.3 + 1.2; // seconds
    const timer = setTimeout(() => setLetterRevealed(true), revealDuration * 1000);
    return () => clearTimeout(timer);
  }, [isLetterPage, isFlipping, currentPage, currentPageData]);

  // ── Replay — book closes, resets to page 0 ───────────────────────────────
  const replay = useCallback(async () => {
    if (flipInProgress.current) return;
    flipInProgress.current = true;

    const el = bookScope.current;

    // Rumble
    await bookAnimate(el,
      { rotateZ: [0, -1.2, 1.4, -1, 1, -0.5, 0] },
      { duration: 0.55, ease: "easeInOut" }
    );

    // Scale-down + blur out
    await bookAnimate(el,
      { scale: 0.86, opacity: 0, filter: "blur(5px)" },
      { duration: 0.42, ease: [0.4, 0, 1, 1] }
    );

    // Reset state
    setCurrentPage(0);
    setUnderlayIndex(null);
    setIsFlipping(false);
    setLetterRevealed(false);
    rotY.set(0);

    // Reopen
    await bookAnimate(el,
      { scale: 1, opacity: 1, filter: "blur(0px)" },
      { duration: 0.65, ease: [0.16, 1, 0.3, 1] }
    );

    flipInProgress.current = false;
  }, [bookAnimate, bookScope, rotY]);

  // ── Keyboard nav ─────────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") goNext();
      if (e.key === "ArrowLeft"  || e.key === "ArrowUp")   goPrev();
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, goPrev, onClose]);

  // ── Touch swipe ──────────────────────────────────────────────────────────
  const { ref: swipeRef } = useSwipe({ onSwipeLeft: goNext, onSwipeRight: goPrev });

  const isLastPage   = currentPage === totalPages - 1;
  const underlayData = underlayIndex !== null ? pages[underlayIndex] : null;
  const currentData  = pages[currentPage];

  return (
    <motion.div
      ref={swipeRef}
      key="book"
      initial={{ opacity: 0, scale: 0.88, y: 24 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.88, transition: { duration: 0.48 } }}
      transition={{ duration: 0.78, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        touchAction: "none",
      }}
    >
      {/* ── Book stage ───────────────────────────────────────────────────── */}
      <div
        ref={bookScope}
        style={{
          position: "relative",
          width: "var(--page-w)",
          height: "var(--page-h)",
          perspective: "2400px",
          perspectiveOrigin: "50% 50%",
          willChange: "transform",
        }}
      >
        {/* Drop shadow */}
        <div aria-hidden="true" style={{
          position: "absolute",
          bottom: -22, left: "6%", right: "6%", height: 22,
          background: "radial-gradient(ellipse at center, rgba(0,0,0,0.62) 0%, transparent 80%)",
          filter: "blur(12px)",
          pointerEvents: "none",
        }} />

        {/* ── UNDERLAY ─────────────────────────────────────────────────── */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 1,
          borderRadius: "3px 8px 8px 3px",
          overflow: "hidden",
          willChange: "transform",
          WebkitTransform: "translateZ(0)",
        }}>
          {underlayData ? (
            <PageContent data={underlayData} isUnderlay isFlipping={isFlipping} />
          ) : (
            <PageContent data={currentData} isUnderlay isFlipping={false} />
          )}

          {/* Cast shadow from turning page */}
          <motion.div aria-hidden="true" style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(90deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.28) 38%, transparent 72%)",
            opacity: castShadow,
            pointerEvents: "none",
            zIndex: 10,
          }} />
        </div>

        {/* ── FLIP CARD ────────────────────────────────────────────────── */}
        <motion.div
          style={{
            position: "absolute", inset: 0,
            zIndex: isFlipping ? 5 : 3,
            transformStyle: "preserve-3d",
            transformOrigin: "left center",
            rotateY: rotY,
            skewY,
            rotateX: rotX,
            willChange: "transform",
          }}
        >
          {/* Front face */}
          <div style={{
            position: "absolute", inset: 0,
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            borderRadius: "3px 8px 8px 3px",
            overflow: "hidden",
            willChange: "transform",
          }}>
            <PageContent
              key={currentPage}
              data={currentData}
              isUnderlay={false}
              isFlipping={isFlipping}
            />
            {/* Fold self-shadow */}
            <motion.div aria-hidden="true" style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(90deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.14) 22%, transparent 46%)",
              opacity: foldShadow,
              pointerEvents: "none",
            }} />
          </div>

          {/* Back face — aged paper */}
          <div style={{
            position: "absolute", inset: 0,
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            borderRadius: "8px 3px 3px 8px",
            overflow: "hidden",
            willChange: "transform",
          }}>
            <AgedPaperReverse />
          </div>
        </motion.div>

        {/* Book chrome */}
        <div aria-hidden="true" style={{
          position: "absolute", inset: 0,
          borderRadius: "3px 8px 8px 3px",
          border: "1px solid rgba(201,129,58,0.1)",
          boxShadow: "0 24px 72px rgba(0,0,0,0.72), 0 6px 20px rgba(0,0,0,0.42), inset 0 1px 0 rgba(255,255,255,0.025)",
          pointerEvents: "none",
          zIndex: 8,
        }} />
        {/* Spine */}
        <div aria-hidden="true" style={{
          position: "absolute", left: 0, top: 0, bottom: 0, width: 14,
          background: "linear-gradient(180deg, #3a2c1a 0%, #241a0f 60%, #1a1208 100%)",
          borderRight: "1px solid rgba(201,129,58,0.14)",
          boxShadow: "inset -3px 0 10px rgba(0,0,0,0.55), 2px 0 14px rgba(0,0,0,0.35)",
          zIndex: 7,
          pointerEvents: "none",
        }} />

        {/* ── Nav click zones ───────────────────────────────────────────── */}
        <ClickZone
          side="left"
          onClick={goPrev}
          disabled={currentPage === 0 || isFlipping}
          direction="left"
        />
        {/* Right zone hidden on letter page — instead show "close" indicator */}
        {!isLetterPage && (
          <ClickZone
            side="right"
            onClick={goNext}
            disabled={isLastPage || isFlipping}
            direction="right"
          />
        )}

        {/* ── Letter page close indicator ───────────────────────────────── */}
        <AnimatePresence>
          {isLetterPage && letterRevealed && !isFlipping && (
            <motion.button
              key="letter-close"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              onClick={onClose}
              whileTap={{ scale: 0.92, transition: { duration: 0.08 } }}
              style={{
                position: "absolute",
                bottom: "clamp(1rem, 4%, 2rem)",
                left: "50%",
                transform: "translateX(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.5rem",
                zIndex: 10,
                WebkitTapHighlightColor: "transparent",
                outline: "none",
                minHeight: 44,
                padding: "0.5rem 1.5rem",
              }}
            >
              {/* Pulsing chevron */}
              <motion.span
                animate={{ opacity: [0.4, 0.9, 0.4] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "clamp(0.55rem, 1.4vw, 0.68rem)",
                  letterSpacing: "0.22em",
                  textTransform: "lowercase",
                  color: "#7a5030",
                  opacity: 0.7,
                }}
              >
                close the book
              </motion.span>
            </motion.button>
          )}
        </AnimatePresence>

        {/* ── Close button (top-left, all non-letter pages) ─────────────── */}
        {!isLetterPage && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.6 }}
            onClick={onClose}
            title="Close book"
            whileTap={{ scale: 0.9, transition: { duration: 0.08 } }}
            style={{
              position: "absolute",
              top: "0.8rem", left: "0.9rem",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--col-text-dim)",
              fontFamily: "var(--font-body)",
              fontSize: "clamp(0.62rem, 1.6vw, 0.75rem)",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              opacity: 0.65,
              zIndex: 10,
              padding: "0.55rem 0.3rem",
              minHeight: 44,
              display: "flex",
              alignItems: "center",
              WebkitTapHighlightColor: "transparent",
              outline: "none",
            }}
          >
            ← Close
          </motion.button>
        )}
      </div>

      <ProgressIndicator total={totalPages} current={currentPage} />
    </motion.div>
  );
}

/* ─── AGED PAPER REVERSE ───────────────────────────────────────────────────── */
function AgedPaperReverse() {
  return (
    <div style={{
      width: "100%", height: "100%",
      background: "linear-gradient(160deg, #c8b99e 0%, #bfad94 50%, #c4b49a 100%)",
      position: "relative", overflow: "hidden",
    }}>
      <svg width="100%" height="100%"
        style={{ position: "absolute", inset: 0, opacity: 0.18, pointerEvents: "none" }}
        aria-hidden="true" preserveAspectRatio="none">
        {Array.from({ length: 30 }).map((_, i) => (
          <line key={i} x1="0" y1={28 + i * 21} x2="100%" y2={28 + i * 21}
            stroke="#8a7a64" strokeWidth="0.5" />
        ))}
      </svg>
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse at 60% 50%, transparent 40%, rgba(90,70,50,0.38) 100%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        opacity: 0.06, pointerEvents: "none",
      }}>
        <span style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(3rem, 10vw, 7rem)",
          fontStyle: "italic",
          color: "#5a4030",
          userSelect: "none",
          transform: "rotate(-8deg)",
          letterSpacing: "-0.02em",
        }}>
          memoir
        </span>
      </div>
    </div>
  );
}

/* ─── CLICK ZONE ─────────────────────────────────────────────────────────── */
function ClickZone({ side, onClick, disabled, direction }) {
  if (disabled) return null;

  return (
    <motion.button
      onClick={onClick}
      initial="rest"
      whileHover="hover"
      whileTap="tap"
      style={{
        position: "absolute",
        top: 0, bottom: 0,
        [side]: 0,
        width: "30%",
        background: "none",
        border: "none",
        cursor: "pointer",
        zIndex: 6,
        display: "flex",
        alignItems: "center",
        justifyContent: side === "left" ? "flex-start" : "flex-end",
        padding: "0 clamp(0.5rem, 2.5vw, 0.9rem)",
        WebkitTapHighlightColor: "transparent",
        outline: "none",
      }}
    >
      {/* Edge glow line */}
      <motion.div
        aria-hidden="true"
        variants={{
          rest:  { opacity: 0, scaleY: 0.4 },
          hover: { opacity: 1, scaleY: 1, transition: { duration: 0.22, ease: [0.16,1,0.3,1] } },
          tap:   { opacity: 0.5, scaleY: 0.7 },
        }}
        style={{
          position: "absolute",
          [side]: 2,
          top: "18%", bottom: "18%",
          width: 2,
          background: "linear-gradient(to bottom, transparent 0%, var(--col-amber-dim) 40%, var(--col-amber-dim) 60%, transparent 100%)",
          transformOrigin: "center",
          pointerEvents: "none",
          borderRadius: 2,
        }}
      />

      {/* Page-lift backlight */}
      <motion.div
        aria-hidden="true"
        variants={{
          rest:  { opacity: 0 },
          hover: { opacity: 1, transition: { duration: 0.3 } },
          tap:   { opacity: 0.3 },
        }}
        style={{
          position: "absolute", inset: 0,
          background: side === "right"
            ? "linear-gradient(90deg, transparent 30%, rgba(201,129,58,0.04) 100%)"
            : "linear-gradient(270deg, transparent 30%, rgba(201,129,58,0.04) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Chevron */}
      <motion.span
        aria-hidden="true"
        variants={{
          rest:  { opacity: 0, x: direction === "left" ? 10 : -10, scale: 0.8 },
          hover: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.22, ease: [0.16,1,0.3,1] } },
          tap:   { opacity: 0.7, scale: 0.9, x: direction === "left" ? -2 : 2 },
        }}
        style={{
          color: "var(--col-amber-glow)",
          fontSize: "clamp(1.2rem, 4vw, 1.5rem)",
          lineHeight: 1,
          userSelect: "none",
          textShadow: "0 0 16px rgba(201,129,58,0.55)",
          position: "relative",
        }}
      >
        {direction === "left" ? "‹" : "›"}
      </motion.span>
    </motion.button>
  );
}
