"use client";
import { useEffect, useState } from "react";
import { completeTask2 } from "@/lib/api";
import TargetCursor from "@/components/TargetCursor";

const CHOICES = ["guarded", "uneasy", "unspoken"];
const STORY_TITLE = "Vulnerability";
const STORY_TEXT =
  "Before moving to the next level, take this with you: vulnerability is letting go of the heavy stuff you carry alone. Sharing it turns weight into connection.";
const ADVANCE_DELAY_MS = 2200;

export default function Task2({ onComplete }) {
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showStory, setShowStory] = useState(false);

  useEffect(() => {
    if (!showStory) return undefined;
    const timeoutId = window.setTimeout(() => {
      onComplete?.();
    }, ADVANCE_DELAY_MS);

    return () => window.clearTimeout(timeoutId);
  }, [showStory, onComplete]);

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
    <div className="task-panel">
      <TargetCursor
        targetSelector=".cursor-target"
        spinDuration={2}
        hideDefaultCursor={true}
        hoverDuration={0.2}
        parallaxOn={true}
      />

      <h2>Task 2 — Being Honest With Yourself</h2>
      {!showStory && (
        <p className="task-desc">
          Choose one word that feels true right now, then release it.
        </p>
      )}

      {!showStory ? (
        <>
          <div className="task2-word-rows">
            {[0, 1].map((row) => (
              <div className="task2-word-row" key={row}>
                {CHOICES.map((word) => (
                  <button
                    key={`${row}-${word}`}
                    className={`task2-word-btn cursor-target ${
                      selected === word ? "task2-word-selected" : ""
                    }`}
                    onClick={() => setSelected(word)}
                    type="button"
                  >
                    {word}
                  </button>
                ))}
              </div>
            ))}
          </div>
          {error && <p className="error-msg">{error}</p>}
          <button
            className="action-btn cursor-target"
            onClick={handleComplete}
            disabled={!selected || loading}
            type="button"
          >
            {loading ? "Whispering..." : "Whisper to the wind"}
          </button>
        </>
      ) : (
        <div className="task2-story">
          <h3>{STORY_TITLE}</h3>
          <p>{STORY_TEXT}</p>
        </div>
      )}
    </div>
  );
}
