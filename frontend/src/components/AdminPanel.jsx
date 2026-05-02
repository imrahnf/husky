"use client";
import { useState } from "react";
import { resetFlow, completeTask1, completeTask2, completeTask3 } from "@/lib/api";

const TASK_IDS = ["task-1", "task-2", "task-3"];

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

export default function AdminPanel({ flow, onAction }) {
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
            label='Complete Task 2 (choice: "doubt")'
            loading={loading["t2"]}
            response={responses["t2"]}
            error={errors["t2"]}
            onClick={() => run("t2", () => completeTask2("doubt"))}
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
