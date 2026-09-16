// PageContent.jsx — page layout router
//
// Routes based on page `type` field:
//   (none)    → SpreadLayout       — single photo editorial spread
//   "duo"     → DuoSpreadLayout    — two photos side-by-side, chapter break feel
//   "collage" → PolaroidCollage    — scattered polaroids, bonus reel
//   "letter"  → LetterPage         — full-page parchment letter, no photo

import { motion } from "framer-motion";
import { useParallax } from "../hooks/useParallax.js";

/* ─── Stagger container ─────────────────────────────────────────────────────── */
const pageEnterContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.08 } },
};

const photoEnter = {
  hidden: { opacity: 0, scale: 0.96, y: 18, filter: "blur(4px)" },
  show: {
    opacity: 1, scale: 1, y: 0, filter: "blur(0px)",
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
};

const captionEnter = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1, y: 0,
    transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] },
  },
};

const yearEnter = {
  hidden: { opacity: 0, x: -8 },
  show: { opacity: 0.7, x: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

/* ─── Main router ────────────────────────────────────────────────────────────── */
export default function PageContent({ data, isUnderlay = false, isFlipping = false }) {
  const parallaxStrength = isUnderlay || isFlipping ? 0 : 10;
  const { x: px, y: py } = useParallax(parallaxStrength);

  if (!data) return null;

  const { type } = data;

  // Page background — letter page gets its own parchment tone
  const isLetter   = type === "letter";
  const isDuo      = type === "duo";
  const isCollage  = type === "collage";

  const bgStyle = isLetter
    ? {
        background: "linear-gradient(158deg, #c8b49a 0%, #bfaa90 55%, #b5a086 100%)",
      }
    : isDuo || isCollage
    ? {
        // Slightly cooler/darker than standard pages — signals new chapter
        background: "linear-gradient(158deg, #221a12 0%, #1a1209 55%, #130e07 100%)",
      }
    : {
        background: "linear-gradient(158deg, #2f2319 0%, #241a0f 55%, #1c1309 100%)",
      };

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        ...bgStyle,
        overflow: "hidden",
        willChange: "transform",
        WebkitTransform: "translateZ(0)",
      }}
    >
      {!isLetter && <JournalLines opacity={isCollage || isDuo ? 0.028 : 0.042} />}

      {isLetter ? (
        <LetterPage data={data} isUnderlay={isUnderlay} />
      ) : isDuo ? (
        <DuoSpreadLayout data={data} isUnderlay={isUnderlay} parallaxX={px} parallaxY={py} />
      ) : isCollage ? (
        <PolaroidCollage data={data} isUnderlay={isUnderlay} />
      ) : (
        <SpreadLayout
          imageSrc={data.imageSrc}
          placeholderLabel={data.placeholderLabel}
          quote={data.quote}
          caption={data.caption}
          rotation={data.rotation}
          captionSide={data.captionSide}
          year={data.year}
          parallaxX={px}
          parallaxY={py}
          animate={!isUnderlay}
        />
      )}
    </div>
  );
}

/* ─── SPREAD LAYOUT (single photo) ──────────────────────────────────────────── */
function SpreadLayout({
  imageSrc, placeholderLabel, quote, caption,
  rotation, captionSide, year,
  parallaxX, parallaxY,
  animate: doAnimate,
}) {
  const isRight = captionSide === "right";

  return (
    <motion.div
      variants={doAnimate ? pageEnterContainer : undefined}
      initial={doAnimate ? "hidden" : false}
      animate={doAnimate ? "show" : false}
      style={{ width: "100%", height: "100%", position: "relative" }}
    >
      {/* ── Photo ── */}
      <motion.div
        variants={doAnimate ? photoEnter : undefined}
        style={{
          x: parallaxX,
          y: parallaxY,
          position: "absolute",
          width: "clamp(155px, 50%, 340px)",
          aspectRatio: "3/4",
          [isRight ? "left" : "right"]: "clamp(1rem, 7%, 4.5rem)",
          top: "50%",
          translateY: "-50%",
          willChange: "transform",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            transform: `rotate(${rotation ?? 0}deg)`,
            boxShadow: "0 18px 48px rgba(0,0,0,0.68), 0 4px 12px rgba(0,0,0,0.38)",
            borderRadius: "2px",
            overflow: "hidden",
            background: "#1a1208",
          }}
        >
          {imageSrc ? (
            <img
              src={imageSrc}
              alt=""
              draggable={false}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
                filter: "sepia(0.14) contrast(1.04) brightness(0.95)",
                pointerEvents: "none",
              }}
            />
          ) : (
            <PlaceholderPhoto label={placeholderLabel} />
          )}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.45) 100%)",
              pointerEvents: "none",
            }}
          />
        </div>
      </motion.div>

      {/* ── Caption block ── */}
      <motion.div
        variants={doAnimate ? captionEnter : undefined}
        style={{
          position: "absolute",
          [isRight ? "right" : "left"]: "clamp(1.2rem, 5%, 3rem)",
          bottom: "clamp(1.6rem, 7%, 3.6rem)",
          maxWidth: "clamp(180px, 44%, 380px)",
          display: "flex",
          flexDirection: "column",
          gap: "clamp(0.7rem, 1.8vw, 1.1rem)",
          textAlign: isRight ? "right" : "left",
        }}
      >
        <motion.span
          variants={doAnimate ? yearEnter : undefined}
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "clamp(0.72rem, 1.8vw, 0.95rem)",
            letterSpacing: "0.24em",
            textTransform: "uppercase",
            fontWeight: 500,
            color: "var(--col-amber)",
          }}
        >
          {year}
        </motion.span>

        <blockquote
          style={{
            fontFamily: "var(--font-display)",
            fontStyle: "italic",
            fontSize: "clamp(1.15rem, 3.2vw, 1.85rem)",
            lineHeight: 1.28,
            color: "var(--col-text)",
            margin: 0,
            opacity: 0.96,
          }}
        >
          {quote}
        </blockquote>

        <div
          style={{
            width: "clamp(32px, 6vw, 52px)",
            height: "1.5px",
            background: "var(--col-amber-dim)",
            alignSelf: isRight ? "flex-end" : "flex-start",
            opacity: 0.6,
          }}
        />

        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "clamp(0.82rem, 1.8vw, 1.06rem)",
            lineHeight: 1.72,
            color: "var(--col-text)",
            opacity: 0.88,
            margin: 0,
          }}
        >
          {caption}
        </p>
      </motion.div>

      {/* Page number */}
      <span
        style={{
          position: "absolute",
          top: "1.2rem",
          right: "1.4rem",
          fontFamily: "var(--font-body)",
          fontSize: "clamp(0.6rem, 1.4vw, 0.72rem)",
          letterSpacing: "0.18em",
          color: "var(--col-text-muted)",
          opacity: 0.55,
          userSelect: "none",
        }}
      >
        — {String(placeholderLabel?.match(/\d+/)?.[0] ?? "").padStart(2, "0")} —
      </span>
    </motion.div>
  );
}

/* ─── DUO SPREAD LAYOUT ─────────────────────────────────────────────────────── */
function DuoSpreadLayout({ data, isUnderlay, parallaxX, parallaxY }) {
  const { photos = [], caption, year, chapterLabel } = data;
  const doAnimate = !isUnderlay;

  return (
    <motion.div
      initial={doAnimate ? { opacity: 0 } : false}
      animate={doAnimate ? { opacity: 1 } : false}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      style={{ width: "100%", height: "100%", position: "relative" }}
    >
      {/* Chapter header */}
      {chapterLabel && (
        <motion.div
          initial={doAnimate ? { opacity: 0, y: -8 } : false}
          animate={doAnimate ? { opacity: 1, y: 0 } : false}
          transition={{ delay: 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: "absolute",
            top: "clamp(0.9rem, 3%, 1.6rem)",
            left: "50%",
            transform: "translateX(-50%)",
            fontFamily: "var(--font-body)",
            fontSize: "clamp(0.58rem, 1.4vw, 0.72rem)",
            letterSpacing: "0.3em",
            textTransform: "lowercase",
            color: "var(--col-amber)",
            opacity: 0.75,
            whiteSpace: "nowrap",
          }}
        >
          {chapterLabel}
        </motion.div>
      )}

      {/* Two photos */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "clamp(0.6rem, 2vw, 1.4rem)",
          padding: "clamp(2.2rem, 8%, 3.5rem) clamp(1rem, 4%, 2.5rem) clamp(2.8rem, 10%, 4rem)",
        }}
      >
        {photos.map((photo, i) => (
          <motion.div
            key={i}
            initial={doAnimate ? { opacity: 0, scale: 0.92, y: i === 0 ? 12 : -12 } : false}
            animate={doAnimate ? { opacity: 1, scale: 1, y: 0 } : false}
            transition={{
              delay: 0.2 + i * 0.18,
              duration: 0.75,
              ease: [0.16, 1, 0.3, 1],
            }}
            style={{
              x: parallaxX ? (i === 0 ? parallaxX : undefined) : undefined,
              y: parallaxY ? (i === 1 ? parallaxY : undefined) : undefined,
              flex: 1,
              maxWidth: "46%",
              aspectRatio: "3/4",
              transform: `rotate(${photo.rotation ?? 0}deg)`,
              boxShadow: "0 14px 40px rgba(0,0,0,0.72), 0 3px 10px rgba(0,0,0,0.4)",
              borderRadius: "2px",
              overflow: "hidden",
              background: "#1a1208",
              flexShrink: 0,
            }}
          >
            {photo.src ? (
              <img
                src={photo.src}
                alt=""
                draggable={false}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                  filter: "sepia(0.12) contrast(1.05) brightness(0.93)",
                  pointerEvents: "none",
                }}
              />
            ) : (
              <PlaceholderPhoto label={photo.label} />
            )}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.5) 100%)",
                pointerEvents: "none",
              }}
            />
          </motion.div>
        ))}
      </div>

      {/* Caption + year at bottom */}
      <motion.div
        initial={doAnimate ? { opacity: 0, y: 10 } : false}
        animate={doAnimate ? { opacity: 1, y: 0 } : false}
        transition={{ delay: 0.55, duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: "absolute",
          bottom: "clamp(0.9rem, 3%, 1.8rem)",
          left: "50%",
          transform: "translateX(-50%)",
          textAlign: "center",
          width: "80%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.4rem",
        }}
      >
        <div
          style={{
            width: 36,
            height: 1,
            background: "var(--col-amber-dim)",
            opacity: 0.5,
            marginBottom: "0.2rem",
          }}
        />
        {caption && (
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
              fontSize: "clamp(0.78rem, 2vw, 1rem)",
              color: "var(--col-text)",
              opacity: 0.8,
              margin: 0,
              lineHeight: 1.4,
            }}
          >
            {caption}
          </p>
        )}
        <span
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "clamp(0.55rem, 1.3vw, 0.68rem)",
            letterSpacing: "0.22em",
            color: "var(--col-amber)",
            opacity: 0.6,
            textTransform: "uppercase",
            marginTop: "0.1rem",
          }}
        >
          {year}
        </span>
      </motion.div>
    </motion.div>
  );
}

/* ─── POLAROID COLLAGE ──────────────────────────────────────────────────────── */
// Scattered polaroid cards, each slightly rotated — feels like a pile of prints
const POLAROID_POSITIONS = [
  { top: "12%",  left: "6%",   zIndex: 2 },
  { top: "18%",  right: "5%",  zIndex: 3 },
  { bottom: "12%", left: "50%", transform: "translateX(-50%)", zIndex: 1 },
];

function PolaroidCollage({ data, isUnderlay }) {
  const { photos = [], chapterLabel } = data;
  const doAnimate = !isUnderlay;

  return (
    <motion.div
      initial={doAnimate ? { opacity: 0 } : false}
      animate={doAnimate ? { opacity: 1 } : false}
      transition={{ duration: 0.5 }}
      style={{ width: "100%", height: "100%", position: "relative" }}
    >
      {/* Header */}
      {chapterLabel && (
        <motion.div
          initial={doAnimate ? { opacity: 0 } : false}
          animate={doAnimate ? { opacity: 1 } : false}
          transition={{ delay: 0.1, duration: 0.6 }}
          style={{
            position: "absolute",
            top: "clamp(0.7rem, 2.5%, 1.2rem)",
            left: "50%",
            transform: "translateX(-50%)",
            fontFamily: "var(--font-body)",
            fontSize: "clamp(0.55rem, 1.3vw, 0.7rem)",
            letterSpacing: "0.3em",
            textTransform: "lowercase",
            color: "var(--col-amber)",
            opacity: 0.65,
            whiteSpace: "nowrap",
            zIndex: 10,
          }}
        >
          {chapterLabel}
        </motion.div>
      )}

      {/* Polaroid cards */}
      {photos.map((photo, i) => {
        const pos = POLAROID_POSITIONS[i] || POLAROID_POSITIONS[0];
        return (
          <motion.div
            key={i}
            initial={doAnimate ? { opacity: 0, scale: 0.88, rotate: 0 } : false}
            animate={doAnimate ? { opacity: 1, scale: 1, rotate: photo.rotation ?? 0 } : false}
            transition={{
              delay: 0.15 + i * 0.22,
              duration: 0.7,
              ease: [0.16, 1, 0.3, 1],
            }}
            style={{
              position: "absolute",
              ...pos,
              width: "clamp(100px, 36%, 200px)",
              background: "#f0e8d8",
              padding: "clamp(4px, 1.2vw, 8px)",
              paddingBottom: "clamp(20px, 5vw, 32px)",
              boxShadow: "0 8px 28px rgba(0,0,0,0.7), 0 2px 8px rgba(0,0,0,0.4)",
              borderRadius: "1px",
            }}
          >
            <div
              style={{
                width: "100%",
                aspectRatio: "1/1",
                overflow: "hidden",
                background: "#1a1208",
              }}
            >
              {photo.src ? (
                <img
                  src={photo.src}
                  alt=""
                  draggable={false}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                    filter: "sepia(0.18) contrast(1.06) brightness(0.92)",
                    pointerEvents: "none",
                  }}
                />
              ) : (
                <PlaceholderPhoto label={photo.label} />
              )}
            </div>

            {/* Polaroid caption */}
            <div
              style={{
                marginTop: "clamp(4px, 1.2vw, 7px)",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "1px",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontStyle: "italic",
                  fontSize: "clamp(0.5rem, 1.2vw, 0.65rem)",
                  color: "#4a3828",
                  opacity: 0.9,
                  lineHeight: 1.2,
                }}
              >
                {photo.label}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "clamp(0.42rem, 1vw, 0.52rem)",
                  color: "#6a5848",
                  opacity: 0.65,
                  letterSpacing: "0.1em",
                }}
              >
                '{photo.year}
              </span>
            </div>
          </motion.div>
        );
      })}

      {/* Faint corner note */}
      <div
        style={{
          position: "absolute",
          bottom: "clamp(0.7rem, 2%, 1.2rem)",
          right: "clamp(0.9rem, 3%, 1.8rem)",
          fontFamily: "var(--font-body)",
          fontSize: "clamp(0.48rem, 1.1vw, 0.58rem)",
          letterSpacing: "0.16em",
          color: "var(--col-text-muted)",
          opacity: 0.4,
          textTransform: "uppercase",
        }}
      >
        unedited ·
      </div>
    </motion.div>
  );
}

/* ─── LETTER PAGE ───────────────────────────────────────────────────────────── */
function LetterPage({ data, isUnderlay }) {
  const { salutation, paragraphs = [], signoff, year } = data;
  const doAnimate = !isUnderlay;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        padding: "clamp(1.8rem, 7%, 3rem) clamp(1.6rem, 6%, 3.5rem)",
        gap: "clamp(0.9rem, 2.5%, 1.4rem)",
        // Parchment vignette overlay
      }}
    >
      {/* Parchment vignette */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 50% 45%, transparent 35%, rgba(90,60,30,0.28) 100%)",
          pointerEvents: "none",
          zIndex: 2,
        }}
      />

      {/* Paper texture lines — faint horizontal rules */}
      <svg
        aria-hidden="true"
        width="100%"
        height="100%"
        style={{ position: "absolute", inset: 0, opacity: 0.07, pointerEvents: "none", zIndex: 1 }}
        preserveAspectRatio="none"
      >
        {Array.from({ length: 28 }).map((_, i) => (
          <line
            key={i}
            x1="0" y1={38 + i * 22} x2="100%" y2={38 + i * 22}
            stroke="#5a3a1a" strokeWidth="0.6"
          />
        ))}
      </svg>

      {/* Header: "a note." label */}
      <motion.div
        initial={doAnimate ? { opacity: 0 } : false}
        animate={doAnimate ? { opacity: 1 } : false}
        transition={{ delay: 0.3, duration: 0.7 }}
        style={{
          position: "relative",
          zIndex: 3,
          display: "flex",
          alignItems: "center",
          gap: "0.7rem",
          marginBottom: "0.2rem",
        }}
      >
        <div style={{ flex: 1, height: 1, background: "rgba(90,60,30,0.35)" }} />
        <span
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "clamp(0.52rem, 1.3vw, 0.65rem)",
            letterSpacing: "0.28em",
            textTransform: "lowercase",
            color: "#7a5030",
            opacity: 0.85,
          }}
        >
          a note.
        </span>
        <div style={{ flex: 1, height: 1, background: "rgba(90,60,30,0.35)" }} />
      </motion.div>

      {/* Salutation */}
      <motion.p
        initial={doAnimate ? { opacity: 0, y: 10 } : false}
        animate={doAnimate ? { opacity: 1, y: 0 } : false}
        transition={{ delay: 0.55, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: "relative",
          zIndex: 3,
          fontFamily: "var(--font-display)",
          fontStyle: "italic",
          fontSize: "clamp(1.05rem, 3vw, 1.55rem)",
          color: "#3d2510",
          opacity: 0.92,
          margin: 0,
          lineHeight: 1.3,
        }}
      >
        {salutation}
      </motion.p>

      {/* Paragraphs — staggered fade-up */}
      {paragraphs.map((para, i) => (
        <motion.p
          key={i}
          initial={doAnimate ? { opacity: 0, y: 8 } : false}
          animate={doAnimate ? { opacity: 1, y: 0 } : false}
          transition={{
            delay: 0.9 + i * 0.55,
            duration: 0.85,
            ease: [0.16, 1, 0.3, 1],
          }}
          style={{
            position: "relative",
            zIndex: 3,
            fontFamily: "var(--font-body)",
            fontSize: "clamp(0.7rem, 1.6vw, 0.88rem)",
            lineHeight: 1.85,
            color: "#4a3020",
            opacity: 0.88,
            margin: 0,
          }}
        >
          {para}
        </motion.p>
      ))}

      {/* Sign-off */}
      <motion.p
        initial={doAnimate ? { opacity: 0 } : false}
        animate={doAnimate ? { opacity: 1 } : false}
        transition={{
          delay: 0.9 + paragraphs.length * 0.55 + 0.3,
          duration: 1,
          ease: [0.16, 1, 0.3, 1],
        }}
        style={{
          position: "relative",
          zIndex: 3,
          fontFamily: "var(--font-display)",
          fontStyle: "italic",
          fontSize: "clamp(0.82rem, 2vw, 1.05rem)",
          color: "#5a3818",
          opacity: 0.75,
          margin: 0,
          marginTop: "auto",
          paddingTop: "0.6rem",
        }}
      >
        {signoff}
      </motion.p>

      {/* Year watermark */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          bottom: "clamp(0.7rem, 2%, 1.2rem)",
          right: "clamp(0.9rem, 3%, 1.8rem)",
          fontFamily: "var(--font-body)",
          fontSize: "clamp(0.48rem, 1.1vw, 0.58rem)",
          letterSpacing: "0.2em",
          color: "#7a5030",
          opacity: 0.35,
          textTransform: "uppercase",
          zIndex: 3,
        }}
      >
        {year}
      </div>
    </div>
  );
}

/* ─── PLACEHOLDER PHOTO ─────────────────────────────────────────────────────── */
function PlaceholderPhoto({ label }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "linear-gradient(160deg, #2e2218 0%, #1a1208 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.8rem",
        border: "1px dashed rgba(201,129,58,0.18)",
      }}
    >
      <svg
        width="30" height="30" viewBox="0 0 24 24"
        fill="none" stroke="rgba(201,129,58,0.35)"
        strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
        <circle cx="12" cy="13" r="4" />
      </svg>
      <span
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "0.52rem",
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "rgba(201,129,58,0.32)",
          textAlign: "center",
          padding: "0 1rem",
        }}
      >
        {label}<br />
        <span style={{ opacity: 0.6 }}>Drop image here</span>
      </span>
    </div>
  );
}

/* ─── JOURNAL LINES ─────────────────────────────────────────────────────────── */
function JournalLines({ opacity = 0.042 }) {
  return (
    <svg
      width="100%" height="100%"
      style={{ position: "absolute", inset: 0, opacity, pointerEvents: "none" }}
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      {Array.from({ length: 30 }).map((_, i) => (
        <line
          key={i}
          x1="0" y1={26 + i * 21} x2="100%" y2={26 + i * 21}
          stroke="#d4c5a9" strokeWidth="0.5"
        />
      ))}
    </svg>
  );
}
