// ─────────────────────────────────────────────────────────────────────────────
// pages.js  —  Full page sequence
//
// Page types:
//   (none)    → SpreadLayout   — single photo, editorial caption
//   "duo"     → DuoSpreadLayout — two photos side-by-side, new chapter feel
//   "collage" → PolaroidCollage — scattered polaroids, bonus reel vibe
//   "letter"  → LetterPage     — final letter, no photo, parchment texture
// ─────────────────────────────────────────────────────────────────────────────

export const pages = [
  // ── Chapter 1: The original five ────────────────────────────────────────────
  {
    id: 1,
    imageSrc: "/images/photo-1.jpg",
    placeholderLabel: "Photo 1",
    quote: "\"The beginning of everything.\"",
    caption:
      "Some places stay with you longer than you stayed in them. This was one of those places.",
    rotation: -2.5,
    captionSide: "right",
    year: "2019",
  },
  {
    id: 2,
    imageSrc: "/images/photo-2.jpg",
    placeholderLabel: "Photo 2",
    quote: "\"Somewhere between reckless and brave.\"",
    caption:
      "You said yes before anyone else did. That's always been your thing.",
    rotation: 1.8,
    captionSide: "left",
    year: "2020",
  },
  {
    id: 3,
    imageSrc: "/images/photo-3.jpg",
    placeholderLabel: "Photo 3",
    quote: "\"The ones who make you laugh the hardest.\"",
    caption:
      "Nothing staged here. This is just what it looks like when you're exactly where you're supposed to be.",
    rotation: -1.2,
    captionSide: "right",
    year: "2021",
  },
  {
    id: 4,
    imageSrc: "/images/photo-4.jpg",
    placeholderLabel: "Photo 4",
    quote: "\"Still becoming.\"",
    caption:
      "Every version of you so far has been better than the last. Watch what the next one does.",
    rotation: 2.1,
    captionSide: "left",
    year: "2024",
  },
  {
    id: 5,
    imageSrc: "/images/photo-5.jpg",
    placeholderLabel: "Photo 5",
    quote: "\"Here's to the next one.\"",
    caption:
      "Twenty-two trips around the sun. Every single one of them worth it.",
    rotation: -0.8,
    captionSide: "right",
    year: "2025",
  },

  // ── Chapter 2: A few more ────────────────────────────────────────────────────
  {
    id: 6,
    type: "duo",
    chapterLabel: "and a few more…",
    photos: [
      { src: "/images/photo-6.jpg", rotation: -3.2, label: "photo 06" },
      { src: "/images/photo-7.jpg", rotation: 2.8,  label: "photo 07" },
    ],
    caption: "Some frames don't need a caption.",
    year: "2025",
  },
  {
    id: 7,
    type: "duo",
    chapterLabel: null, // no header on second duo spread
    photos: [
      { src: "/images/photo-8.jpg",  rotation: 2.2,  label: "photo 08" },
      { src: "/images/photo-9.jpg",  rotation: -1.8, label: "photo 09" },
    ],
    caption: "Unplanned. Unfiltered. Exactly right.",
    year: "2025",
  },
  {
    id: 8,
    type: "collage",
    chapterLabel: "bonus reel.",
    photos: [
      { src: "/images/photo-10.jpg", rotation: -5.5, label: "no filter",   year: "23" },
      { src: "/images/photo-11.jpg", rotation:  4.2, label: "golden hour", year: "24" },
      { src: "/images/photo-12.jpg", rotation: -2.8, label: "candid",      year: "25" },
      { src: "/images/photo-13.jpg", rotation:  6.1, label: "unscripted",  year: "24" },
      { src: "/images/photo-14.jpg", rotation: -3.5, label: "just you",     year: "25" },
    ],
    caption: null,
    year: "2025",
  },

  // ── Final: The Letter ────────────────────────────────────────────────────────
  {
    id: 9,
    type: "letter",
    isFinal: true,
    year: "2026",
    salutation: "Luchiiiii,",
    paragraphs: [
      "Happy Birthdayyyyy !! ",
      " I know abb maybe utna excitement na ho like before but still you should celebrate yourself sirf aaj hi nhi har din hi. Idk jyada kuch nhi h bolne ko but thanks for always being there whenever i needed aur sahi raashta dikhane ke liye lol. ",
      " You are a amazing human just keep being yourself and enjoy jitna ho sake and also bf bana le ik koi sahi sa mil nhi rha but dhundte raho mil hi jayega , ab he also should be worthy of u isiliye time lag rha milne me. ",
      " Happy 22 !",
    ],
    signoff: "— with love, always",
  },
];
