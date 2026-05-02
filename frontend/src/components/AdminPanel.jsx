"use client";
import { useState } from "react";
import {
  resetFlow,
  completeTask1,
  completeTask2,
  completeTask3,
  triggerTask1,
  triggerTask2,
  triggerTask3,
} from "@/lib/api";

const TASK_IDS = ["task-1", "task-2", "task-3"];

function LiveFlowStatus({ flow, activeTask, flowLoading, flowError }) {
  const allCompleted =
    flow && TASK_IDS.every((id) => flow[id]?.state === "completed");
  const allWaiting =
    flow && TASK_IDS.every((id) => flow[id]?.state === "waiting");

  let label = "Fetching state...";
  if (flowError) label = `Error: ${flowError}`;
  else if (allCompleted) label = "All tasks completed ✓";
  else if (allWaiting) label = "waiting for user to join...";
  else if (activeTask) label = `${activeTask} triggered`;
  else if (flowLoading) label = "Loading...";

  const bg = flowError
    ? "rgba(180,35,24,0.22)"
    : allCompleted
    ? "rgba(26,127,55,0.22)"
    : activeTask
    ? "rgba(154,103,0,0.28)"
    : "rgba(139,117,163,0.35)";

  return (
    <div className="admin-section">
      <div className="admin-section-label">Live status</div>
      <div className="admin-status-pill" style={{ background: bg }}>
        <span className="admin-status-dot" />
        {label}
      </div>
    </div>
  );
}

function StateTag({ state }) {
  const colors = {
    waiting: "#888",
    triggered: "#9a6700",
    completed: "#1a7f37",
    unknown: "#555",
  };
  return (
    <span style={{ color: colors[state] ?? colors.unknown, fontWeight: state === "triggered" ? "bold" : "normal" }}>
      {state ?? "unknown"}
    </span>
  );
}

export default function AdminPanel({
  flow,
  onAction,
  forceTask,
  setForceTask,
  activeTask = null,
  flowLoading = false,
  flowError = null,
}) {
  const [responses, setResponses] = useState({});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState({});

  const run = async (key, fn) => {
    setLoading((l) => ({ ...l, [key]: true }));
    setErrors((e) => ({ ...e, [key]: null }));
    setResponses((r) => ({ ...r, [key]: null }));
    try {
      const res = await fn();
      setResponses((r) => ({ ...r, [key]: JSON.stringify(res, null, 2) }));
      onAction?.();
    } catch (e) {
      setErrors((err) => ({ ...err, [key]: e.message || String(e) }));
    } finally {
      setLoading((l) => ({ ...l, [key]: false }));
    }
  };

  const tasks = flow ?? {};

  return (
    <div className="admin-panel">
      <div className="admin-title">Admin Panel</div>

      <LiveFlowStatus
        flow={flow}
        activeTask={activeTask}
        flowLoading={flowLoading}
        flowError={flowError}
      />

      {/* Flow Status */}
      <div className="admin-section">
        <div className="admin-section-label">Flow Status</div>
        <div className="admin-tasks-row">
          {TASK_IDS.map((id) => (
            <div key={id} className="admin-task-card">
              <strong>{id}</strong>
              <div>state: <StateTag state={tasks[id]?.state} /></div>
              {tasks[id]?.choice && <div>choice: <em>{tasks[id].choice}</em></div>}
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="admin-section">
        <div className="admin-section-label">Actions</div>
        <div className="admin-actions-row">
          <AdminBtn
            label="Reset Flow"
            loading={loading["reset"]}
            response={responses["reset"]}
            error={errors["reset"]}
            onClick={() => run("reset", resetFlow)}
            danger
          />
          <AdminBtn
            label="Complete Task 1"
            loading={loading["t1"]}
            response={responses["t1"]}
            error={errors["t1"]}
            onClick={() => run("t1", completeTask1)}
          />
          <AdminBtn
            label='Complete Task 2 (choice: "unspoken")'
            loading={loading["t2"]}
            response={responses["t2"]}
            error={errors["t2"]}
            onClick={() => run("t2", () => completeTask2("unspoken"))}
          />
          <AdminBtn
            label="Complete Task 3"
            loading={loading["t3"]}
            response={responses["t3"]}
            error={errors["t3"]}
            onClick={() => run("t3", completeTask3)}
          />
        </div>
      </div>

      {/* Force Preview */}
      <div className="admin-section">
        <div className="admin-section-label">Force Preview (dev only)</div>
        <div className="admin-actions-row">
          {["task-1", "task-2", "task-3"].map(id => (
            <button
              key={id}
              className={`admin-btn ${forceTask === id ? "admin-btn-active-preview" : ""}`}
              onClick={() => setForceTask(forceTask === id ? null : id)}
            >
              {forceTask === id ? `✕ Exit ${id}` : `Preview ${id}`}
            </button>
          ))}
        </div>
        {forceTask && (
          <div style={{ fontSize: "0.72rem", color: "rgba(255,220,100,0.7)", marginTop: 4 }}>
            ⚠ Previewing {forceTask} — backend state not affected
          </div>
        )}
      </div>

      {/* Debug: trigger tasks (same as Roblox → husky.omrahnfaqiri.com/.../trigger) */}
      <div className="admin-section">
        <div className="admin-section-label">Debug — trigger tasks (no Roblox)</div>
        <p className="admin-debug-hint">
          Calls POST <code>/api/task-N/trigger</code> (proxied to{" "}
          <code>husky.omrahnfaqiri.com</code>). Refreshes flow after each call.
        </p>
        <div className="admin-actions-row">
          <AdminBtn
            label="Trigger task 1"
            loading={loading["trig1"]}
            response={responses["trig1"]}
            error={errors["trig1"]}
            onClick={() => run("trig1", triggerTask1)}
          />
          <AdminBtn
            label="Trigger task 2"
            loading={loading["trig2"]}
            response={responses["trig2"]}
            error={errors["trig2"]}
            onClick={() => run("trig2", triggerTask2)}
          />
          <AdminBtn
            label="Trigger task 3"
            loading={loading["trig3"]}
            response={responses["trig3"]}
            error={errors["trig3"]}
            onClick={() => run("trig3", triggerTask3)}
          />
        </div>
      </div>
    </div>
  );
}

function AdminBtn({ label, loading, response, error, onClick, danger }) {
  return (
    <div className="admin-btn-group">
      <button
        className={`admin-btn ${danger ? "admin-btn-danger" : ""}`}
        onClick={onClick}
        disabled={loading}
      >
        {loading ? "..." : label}
      </button>
      {response && <pre className="admin-response">{response}</pre>}
      {error && <div className="admin-error">{error}</div>}
    </div>
  );
}
