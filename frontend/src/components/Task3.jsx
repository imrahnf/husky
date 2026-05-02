"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { completeTask3 } from "@/lib/api";

const COMPLETE_DELAY_MS = 900;
const FLAME_COUNT = 5;
const TORCH_W = 24;
const TORCH_H = 120;

function FlameSvg({ size = 84, delay = 0 }) {
  return (
    <svg
      viewBox="0 0 90 120"
      width={size}
      height={size * 1.33}
      className="task3-flame-svg"
      style={{ animationDelay: `${delay}ms` }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`task3Outer-${delay}`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#f97316" />
          <stop offset="55%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#fde68a" />
        </linearGradient>
        <linearGradient id={`task3Inner-${delay}`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#fb7185" />
          <stop offset="70%" stopColor="#fff7ed" />
          <stop offset="100%" stopColor="#ffffff" />
        </linearGradient>
      </defs>
      <path
        d="M44 6 C55 18 64 30 67 44 C71 61 62 83 44 112 C24 84 17 62 22 44 C26 30 34 18 44 6 Z"
        fill={`url(#task3Outer-${delay})`}
      />
      <path
        d="M44 28 C51 36 55 46 55 57 C55 69 49 82 44 94 C37 81 33 68 33 57 C33 47 37 37 44 28 Z"
        fill={`url(#task3Inner-${delay})`}
      />
    </svg>
  );
}

export default function Task3({ onComplete }) {
  const playfieldRef = useRef(null);
  const flameCentersRef = useRef({});
  const collectedRef = useRef(new Set());
  const completedRef = useRef(false);
  const torchDragRef = useRef(null);
  const [collected, setCollected] = useState([]);
  const [showTorch, setShowTorch] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [torchPos, setTorchPos] = useState({ x: 48, y: 72 });
  const flames = useMemo(() => {
    const zones = [
      { xMin: 8, xMax: 24, yMin: 14, yMax: 36 },
      { xMin: 76, xMax: 92, yMin: 14, yMax: 36 },
      { xMin: 12, xMax: 28, yMin: 60, yMax: 84 },
      { xMin: 72, xMax: 88, yMin: 60, yMax: 84 },
      { xMin: 44, xMax: 56, yMin: 18, yMax: 30 },
    ];
    return zones.slice(0, FLAME_COUNT).map((zone, idx) => ({
      id: `f${idx + 1}`,
      x: zone.xMin + Math.random() * (zone.xMax - zone.xMin),
      y: zone.yMin + Math.random() * (zone.yMax - zone.yMin),
      size: 76 + Math.round(Math.random() * 16),
      delay: idx * 100,
    }));
  }, []);

  const isMobile = useMemo(() => {
    if (typeof window === "undefined") return false;
    return "ontouchstart" in window || navigator.maxTouchPoints > 0;
  }, []);

  useEffect(() => {
    if (isMobile) return undefined;
    return undefined;
  }, [isMobile]);

  useEffect(() => {
    const recomputeFlameCenters = () => {
      const rect = playfieldRef.current?.getBoundingClientRect();
      if (!rect) return;
      const next = {};
      for (const flame of flames) {
        next[flame.id] = {
          x: rect.left + (rect.width * flame.x) / 100,
          y: rect.top + (rect.height * flame.y) / 100,
          r: Math.max(44, flame.size * 0.4),
        };
      }
      flameCentersRef.current = next;
    };

    recomputeFlameCenters();
    window.addEventListener("resize", recomputeFlameCenters);
    window.addEventListener("scroll", recomputeFlameCenters, { passive: true });
    return () => {
      window.removeEventListener("resize", recomputeFlameCenters);
      window.removeEventListener("scroll", recomputeFlameCenters);
    };
  }, [flames, showTorch]);

  useEffect(() => {
    collectedRef.current = new Set(collected);
  }, [collected]);

  const collectFlame = (id) => {
    if (showTorch) return;
    setCollected((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      if (next.length === flames.length) {
        setShowTorch(true);
      }
      return next;
    });
  };

  const detectFlameHit = (xPct, yPct) => {
    if (showTorch || loading) return;
    const rect = playfieldRef.current?.getBoundingClientRect();
    if (!rect) return;
    // Tip of the dragged torch in viewport coordinates.
    const tipX = rect.left + (rect.width * xPct) / 100;
    const tipY = rect.top + (rect.height * yPct) / 100;
    for (const flame of flames) {
      if (collectedRef.current.has(flame.id)) continue;
      const center = flameCentersRef.current[flame.id];
      if (!center) continue;
      if (Math.hypot(tipX - center.x, tipY - center.y) <= center.r) {
        collectFlame(flame.id);
        break;
      }
    }
  };

  useEffect(() => {
    if (!showTorch || completedRef.current) return undefined;
    completedRef.current = true;
    const runComplete = async () => {
      setLoading(true);
      setError(null);
      try {
        await completeTask3();
        window.setTimeout(() => onComplete?.(), COMPLETE_DELAY_MS);
      } catch (e) {
        setError(e.message || String(e));
        completedRef.current = false;
      } finally {
        setLoading(false);
      }
    };
    runComplete();
    return undefined;
  }, [showTorch, onComplete]);

  const updateTorchFromPointer = (clientX, clientY) => {
    const rect = playfieldRef.current?.getBoundingClientRect();
    if (!rect) return;

    const minX = (TORCH_W / 2 / rect.width) * 100;
    const maxX = 100 - minX;
    const minY = ((TORCH_H * 0.2) / rect.height) * 100;
    const maxY = 100 - (TORCH_H / rect.height) * 100;

    const nextX = ((clientX - rect.left) / rect.width) * 100;
    const nextY = ((clientY - rect.top) / rect.height) * 100;
    const clampedX = Math.max(minX, Math.min(maxX, nextX));
    const clampedY = Math.max(minY, Math.min(maxY, nextY));

    setTorchPos({ x: clampedX, y: clampedY });
    detectFlameHit(clampedX, clampedY);
  };

  const handleTorchPointerDown = (e) => {
    if (showTorch || loading) return;
    e.preventDefault();
    torchDragRef.current = true;
    updateTorchFromPointer(e.clientX, e.clientY);
    window.addEventListener("pointermove", handleWindowPointerMove);
    window.addEventListener("pointerup", handleWindowPointerUp, { once: true });
  };

  const handleWindowPointerMove = (e) => {
    if (!torchDragRef.current) return;
    updateTorchFromPointer(e.clientX, e.clientY);
  };

  const handleWindowPointerUp = () => {
    torchDragRef.current = false;
    window.removeEventListener("pointermove", handleWindowPointerMove);
  };

  useEffect(() => {
    return () => {
      window.removeEventListener("pointermove", handleWindowPointerMove);
      window.removeEventListener("pointerup", handleWindowPointerUp);
    };
  }, []);

  const onPlayfieldPointerDown = (e) => {
    if (showTorch || loading) return;
    // Allow clicking the playfield to reposition torch quickly.
    updateTorchFromPointer(e.clientX, e.clientY);
  };

  if (isMobile) {
    return (
      <div className="task-panel">
        <h2>Level 3: Share your fire</h2>
        <p className="task-desc">
          This mini-game needs a mouse cursor. Open on desktop to play.
        </p>
      </div>
    );
  }

  return (
    <div
      className="task-panel task3-panel"
    >
      <h2>Level 3: Share your fire</h2>
      <p className="task-desc">
        Drag the torch through every flame to gather the fire.
      </p>
      <div
        ref={playfieldRef}
        className="task3-playfield"
        onPointerDown={onPlayfieldPointerDown}
      >
        {flames.map((flame) => {
          const isCollected = collected.includes(flame.id);
          return (
            <button
              type="button"
              key={flame.id}
              className={`task3-flame-node ${isCollected ? "task3-flame-collected" : ""}`}
              style={{ left: `${flame.x}%`, top: `${flame.y}%` }}
              aria-label={`Collect flame ${flame.id}`}
            >
              <FlameSvg size={flame.size} delay={flame.delay} />
            </button>
          );
        })}

        {showTorch && (
          <div className="task3-final-torch" aria-live="polite">
            <div className="task3-final-torch-flame">
              <FlameSvg size={96} delay={120} />
            </div>
            <div className="task3-final-torch-stick" />
          </div>
        )}

        {!showTorch && (
          <button
            type="button"
            className="task3-draggable-torch"
            style={{ left: `${torchPos.x}%`, top: `${torchPos.y}%` }}
            onPointerDown={handleTorchPointerDown}
            aria-label="Drag torch"
          >
            <div className="task3-stick-shaft" />
          </button>
        )}
      </div>

      {error && <p className="error-msg">{error}</p>}
      {!showTorch && <p className="task3-counter">{collected.length}/{flames.length} flames collected</p>}
    </div>
  );
}
