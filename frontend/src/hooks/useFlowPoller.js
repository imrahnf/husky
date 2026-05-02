"use client";
import { useState, useEffect, useRef } from "react";
import { getFlow } from "@/lib/api";

const POLL_INTERVAL_MS = 2000;

/**
 * Returns { flow, activeTask, error, loading, refresh }
 * flow shape: { "task-1": { state, ... }, "task-2": { state, choice, ... }, "task-3": { state, ... } }
 * activeTask: "task-1" | "task-2" | "task-3" | null
 */
export function useFlowPoller({ polling = false } = {}) {
  const [flow, setFlow] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef(null);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getFlow();
      setFlow(data?.flow ?? data);
    } catch (e) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    if (polling) {
      timerRef.current = setInterval(refresh, POLL_INTERVAL_MS);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [polling]);

  const TASK_IDS = ["task-1", "task-2", "task-3"];
  const activeTask = flow
    ? TASK_IDS.find((id) => flow[id]?.state === "triggered") ?? null
    : null;

  return { flow, activeTask, error, loading, refresh };
}
