// App.jsx — Root state machine (v3)
// States: "landing" → "cover" → "book" → "closing"
//
// Transition choreography:
//   landing  → cover:   Landing shrinks+blurs OUT, Cover materialises IN
//   cover    → book:    Cover shrinks OUT, Book scales IN
//   book     → closing: Book exit, ClosingSequence fades in
//   closing  → book:    ClosingSequence fades out, Book mounts at page 0

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import Landing         from "./components/Landing.jsx";
import BookCover       from "./components/BookCover.jsx";
import Book            from "./components/Book.jsx";
import ClosingSequence from "./components/ClosingSequence.jsx";
import GrainOverlay    from "./components/GrainOverlay.jsx";
import AmbientBackground from "./components/AmbientBackground.jsx";
import AudioToggle     from "./components/AudioToggle.jsx";

const SCENES = {
  LANDING: "landing",
  COVER:   "cover",
  BOOK:    "book",
  CLOSING: "closing",
};

export default function App() {
  const [scene, setScene]       = useState(SCENES.LANDING);
  // bookEpoch increments on replay so Book remounts fresh at page 0
  const [bookEpoch, setBookEpoch] = useState(0);

  const openCover     = () => setScene(SCENES.COVER);
  const openBook      = () => setScene(SCENES.BOOK);
  const closeToEnding = () => setScene(SCENES.CLOSING);
  const replayBook    = () => {
    setBookEpoch((n) => n + 1); // force fresh Book mount
    setScene(SCENES.BOOK);
  };

  return (
    <>
      <AmbientBackground />
      <GrainOverlay />
      <AudioToggle />

      <AnimatePresence mode="wait">
        {scene === SCENES.LANDING && (
          <Landing key="landing" onOpen={openCover} />
        )}

        {scene === SCENES.COVER && (
          <BookCover key="cover" onOpen={openBook} />
        )}

        {scene === SCENES.BOOK && (
          // bookEpoch in key forces a clean remount on replay
          <Book key={`book-${bookEpoch}`} onClose={closeToEnding} />
        )}

        {scene === SCENES.CLOSING && (
          <ClosingSequence key="closing" onReplay={replayBook} />
        )}
      </AnimatePresence>
    </>
  );
}
