"use client";
import { useState } from "react";
import { completeTask2 } from "@/lib/api";

const CHOICES = ["doubt", "fear", "shame", "regret"];

export default function Task2({ onComplete }) {
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleComplete = async () => {
    if (!selected) return;
    setLoading(true);
    setError(null);
    try {
      await completeTask2(selected);
      onComplete?.();
    } catch (e) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="task-panel">
      <h2>Task 2 — Name a Flaw</h2>
      <p className="task-desc">Choose the flaw that resonates most.</p>
      <div className="choices-grid">
        {CHOICES.map((c) => (
          <button
            key={c}
            className={`choice-btn ${selected === c ? "choice-selected" : ""}`}
            onClick={() => setSelected(c)}
          >
            {c}
          </button>
        ))}
      </div>
      {error && <p className="error-msg">{error}</p>}
      <button
        className="action-btn"
        onClick={handleComplete}
        disabled={!selected || loading}
      >
        {loading ? "Submitting..." : "Submit Choice"}
      </button>
    </div>
  );
}
