"use client";
import { useState } from "react";
import { completeTask1 } from "@/lib/api";

export default function Task1({ onComplete }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleComplete = async () => {
    setLoading(true);
    setError(null);
    try {
      await completeTask1();
      onComplete?.();
    } catch (e) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="task-panel">
      <h2>Task 1 — Recognize Imperfection</h2>
      <p className="task-desc">
        This task is now active. Acknowledge the imperfection to complete it.
      </p>
      {error && <p className="error-msg">{error}</p>}
      <button
        className="action-btn"
        onClick={handleComplete}
        disabled={loading}
      >
        {loading ? "Completing..." : "Complete Task 1"}
      </button>
    </div>
  );
}
