"use client";
import { useState } from "react";
import { useFlowPoller } from "@/hooks/useFlowPoller";
import Task1 from "@/components/Task1";
import Task2 from "@/components/Task2";
import Task3 from "@/components/Task3";
import AdminPanel from "@/components/AdminPanel";

export default function Home() {
  const [polling, setPolling] = useState(false);
  const [forceTask, setForceTask] = useState(null);
  const [adminDrawerOpen, setAdminDrawerOpen] = useState(false);
  const { flow, activeTask, error, loading, refresh } = useFlowPoller({ polling });

  // forceTask lets admin preview a task UI regardless of backend state
  const displayTask = forceTask ?? activeTask;
  const allCompleted =
    !forceTask && flow && ["task-1", "task-2", "task-3"].every((id) => flow[id]?.state === "completed");

  return (
    <div
      className="page-root"
      style={{ backgroundImage: "url('/background-image.png')" }}
    >
      {/* Main Glass Panel */}
      <div className="glass-panel">
        {!displayTask && !allCompleted && (
          <div className="idle-state">
            <p>Waiting for Roblox to trigger a task…</p>
          </div>
        )}
        {allCompleted && (
          <div className="idle-state">
            <p>🎉 All tasks completed. The ritual is complete.</p>
          </div>
        )}
        {displayTask === "task-1" && (
          <Task1 onComplete={() => { setForceTask(null); refresh(); }} />
        )}
        {displayTask === "task-2" && (
          <Task2 onComplete={() => { setForceTask(null); refresh(); }} />
        )}
        {displayTask === "task-3" && (
          <Task3 onComplete={() => { setForceTask(null); refresh(); }} />
        )}
      </div>

      {/* Console image */}
      <img
        src="/console.png"
        alt="Console"
        className="console-img"
      />

      {/* Small side control — only this shows until you open admin; panel stays off-screen */}
      <button
        type="button"
        className="admin-drawer-trigger"
        onClick={() => setAdminDrawerOpen((o) => !o)}
        aria-expanded={adminDrawerOpen}
        aria-controls="admin-dev-drawer"
        title={adminDrawerOpen ? "Close admin" : "Open admin"}
      >
        {adminDrawerOpen ? "×" : "⚙"}
      </button>

      {adminDrawerOpen && (
        <button
          type="button"
          className="admin-drawer-backdrop"
          aria-label="Close admin panel"
          onClick={() => setAdminDrawerOpen(false)}
        />
      )}

      <aside
        id="admin-dev-drawer"
        className={`admin-drawer ${adminDrawerOpen ? "admin-drawer--open" : ""}`}
        aria-hidden={!adminDrawerOpen}
      >
        <div className="admin-drawer-inner">
          <div className="admin-drawer-head">
            <span className="admin-drawer-title">Dev &amp; admin</span>
            <button
              type="button"
              className="admin-drawer-close"
              onClick={() => setAdminDrawerOpen(false)}
              aria-label="Close"
            >
              ×
            </button>
          </div>
          <div className="admin-drawer-scroll">
            <div className="poll-controls admin-drawer-poll">
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
            <AdminPanel
              flow={flow}
              onAction={refresh}
              forceTask={forceTask}
              setForceTask={setForceTask}
              activeTask={activeTask}
              flowLoading={loading}
              flowError={error}
            />
          </div>
        </div>
      </aside>
    </div>
  );
}
