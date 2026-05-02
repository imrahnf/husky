"use client";
import { useState } from "react";
import { useFlowPoller } from "@/hooks/useFlowPoller";
import Task1 from "@/components/Task1";
import Task2 from "@/components/Task2";
import Task3 from "@/components/Task3";
import AdminPanel from "@/components/AdminPanel";

const TASK_IDS = ["task-1", "task-2", "task-3"];

function StatusBanner({ flow, activeTask, loading, error }) {
  const allCompleted =
    flow && TASK_IDS.every((id) => flow[id]?.state === "completed");
  const allWaiting =
    flow && TASK_IDS.every((id) => flow[id]?.state === "waiting");

  let label = "Fetching state...";
  if (error) label = `Error: ${error}`;
  else if (allCompleted) label = "All tasks completed ✓";
  else if (allWaiting) label = "waiting for user to join...";
  else if (activeTask) label = `${activeTask} triggered`;
  else if (loading) label = "Loading...";

  return (
    <div
      className="status-banner"
      style={{
        background:
          error
            ? "rgba(180,35,24,0.18)"
            : allCompleted
            ? "rgba(26,127,55,0.18)"
            : activeTask
            ? "rgba(154,103,0,0.22)"
            : "rgba(139,117,163,0.35)",
      }}
    >
      <span className="status-dot" />
      {label}
    </div>
  );
}

export default function Home() {
  const [polling, setPolling] = useState(false);
  const { flow, activeTask, error, loading, refresh } = useFlowPoller({ polling });

  const allCompleted =
    flow && TASK_IDS.every((id) => flow[id]?.state === "completed");

  return (
    <div
      className="page-root"
      style={{ backgroundImage: "url('/background-image.png')" }}
    >
      {/* Top Status Banner */}
      <StatusBanner
        flow={flow}
        activeTask={activeTask}
        loading={loading}
        error={error}
      />

      {/* Main Glass Panel */}
      <div className="glass-panel">
        {/* No active task */}
        {!activeTask && !allCompleted && (
          <div className="idle-state">
            <p>Waiting for Roblox to trigger a task…</p>
          </div>
        )}

        {/* All done */}
        {allCompleted && (
          <div className="idle-state">
            <p>🎉 All tasks completed. The ritual is complete.</p>
          </div>
        )}

        {/* Task 1 */}
        {activeTask === "task-1" && (
          <Task1 onComplete={refresh} />
        )}

        {/* Task 2 */}
        {activeTask === "task-2" && (
          <Task2 onComplete={refresh} />
        )}

        {/* Task 3 */}
        {activeTask === "task-3" && (
          <Task3 onComplete={refresh} />
        )}
      </div>

      {/* Console image */}
      <img
        src="/console.png"
        alt="Console"
        className="console-img"
      />

      {/* Polling + Refresh controls */}
      <div className="poll-controls">
        <button className="ctrl-btn" onClick={refresh} disabled={loading}>
          {loading ? "Refreshing…" : "Refresh"}
        </button>
        <button
          className={`ctrl-btn ${polling ? "ctrl-btn-active" : ""}`}
          onClick={() => setPolling((p) => !p)}
        >
          {polling ? "Stop Polling" : "Start Polling"}
        </button>
        <span className="mode-pill">
          {polling ? "● Polling every 2s" : "○ Manual"}
        </span>
      </div>

      {/* Admin Panel */}
      <AdminPanel flow={flow} onAction={refresh} />
    </div>
  );
}
