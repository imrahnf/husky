"use client";
import { useState } from "react";
import { completeTask3 } from "@/lib/api";

export default function Task3({ onComplete }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleComplete = async () => {
    setLoading(true);
    setError(null);
    try {
      await completeTask3();
      onComplete?.();
    } catch (e) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="task-panel">
      <h2>Task 3 — Share Warmth</h2>
      <p className="task-desc">
        The final step. Share your warmth to complete the ritual.
      </p>
      {error && <p className="error-msg">{error}</p>}
      <button
        className="action-btn"
        onClick={handleComplete}
        disabled={loading}
      >
        {loading ? "Completing..." : "Complete Task 3"}
      </button>
    </div>
  );
}
