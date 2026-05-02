"use client";
import { useEffect, useState } from "react";
import { completeTask2 } from "@/lib/api";

const CHOICES = [
  { id: "guarded", x: 16, y: 30, drift: "a", delay: "0s" },
  { id: "uneasy", x: 47, y: 56, drift: "b", delay: "0.6s" },
  { id: "unspoken", x: 76, y: 34, drift: "c", delay: "1.1s" },
];
const STORY_TITLE = "Vulnerability";
const STORY_TEXT =
  "Speaking what you hide is not weakness—it is courage. Vulnerability turns silent weight into shared strength.";
const TITLE_CHAR_MS = 40;
const TITLE_BODY_GAP_MS = 260;
const BODY_CHAR_MS = 22;
const ADVANCE_DELAY_MS = 1800;

export default function Task2({ onComplete }) {
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showStory, setShowStory] = useState(false);
  const [typedTitle, setTypedTitle] = useState("");
  const [typedBody, setTypedBody] = useState("");
  const [storyTypingDone, setStoryTypingDone] = useState(false);

  useEffect(() => {
    if (!showStory) return undefined;
    const timeouts = [];
    let cancelled = false;

    const wait = (ms) =>
      new Promise((resolve) => {
        const id = window.setTimeout(resolve, ms);
        timeouts.push(id);
      });

    const run = async () => {
      setTypedTitle("");
      setTypedBody("");
      setStoryTypingDone(false);
      for (let i = 1; i <= STORY_TITLE.length; i++) {
        if (cancelled) return;
        await wait(TITLE_CHAR_MS);
        setTypedTitle(STORY_TITLE.slice(0, i));
      }
      await wait(TITLE_BODY_GAP_MS);
      for (let i = 1; i <= STORY_TEXT.length; i++) {
        if (cancelled) return;
        await wait(BODY_CHAR_MS);
        setTypedBody(STORY_TEXT.slice(0, i));
      }
      if (!cancelled) setStoryTypingDone(true);
    };

    run();

    return () => {
      cancelled = true;
      timeouts.forEach((id) => window.clearTimeout(id));
    };
  }, [showStory]);

  useEffect(() => {
    if (!storyTypingDone) return undefined;
    const timeoutId = window.setTimeout(() => {
      onComplete?.();
    }, ADVANCE_DELAY_MS);
    return () => window.clearTimeout(timeoutId);
  }, [storyTypingDone, onComplete]);

  const handleComplete = async () => {
    if (!selected || showStory) return;
    setLoading(true);
    setError(null);
    try {
      await completeTask2(selected);
      setShowStory(true);
    } catch (e) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="task-panel task2-panel-capture">
      <h2>Task 2 — Being Honest With Yourself</h2>
      {!showStory && (
        <p className="task-desc">
          Catch one floating truth and own it.
        </p>
      )}

      {!showStory ? (
        <>
          <div className="task2-sky">
            {CHOICES.map((word) => (
              <button
                key={word.id}
                className={`task2-float-word task2-float-${word.drift} ${
                  selected === word.id ? "task2-word-selected" : ""
                }`}
                style={{
                  left: `${word.x}%`,
                  top: `${word.y}%`,
                  animationDelay: word.delay,
                }}
                onClick={() => setSelected(word.id)}
                type="button"
              >
                {word.id}
              </button>
            ))}
          </div>
          {error && <p className="error-msg">{error}</p>}
          <button
            className="action-btn"
            onClick={handleComplete}
            disabled={!selected || loading}
            type="button"
          >
            {loading ? "Whispering..." : selected ? `Captured: ${selected}` : "Capture one word"}
          </button>
        </>
      ) : (
        <div className="task2-story">
          <h3>
            {typedTitle}
            {!storyTypingDone && typedTitle.length < STORY_TITLE.length && (
              <span className="task1-story-cursor" aria-hidden="true" />
            )}
          </h3>
          <p>
            {typedBody}
            {storyTypingDone ? null : typedTitle.length === STORY_TITLE.length ? (
              <span className="task1-story-cursor" aria-hidden="true" />
            ) : null}
          </p>
        </div>
      )}
    </div>
  );
}
