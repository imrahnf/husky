"use client";
import { useState, useRef, useEffect } from "react";
import { completeTask1 } from "@/lib/api";

const ROCK_COUNT = 15;
const ROCK_W = 76;
const ROCK_H = 62;

// Deterministic shape tweaks per rock (same every render)
const VARIANTS = [
  { rx: 31, ry: 25 }, { rx: 29, ry: 24 }, { rx: 32, ry: 26 },
  { rx: 30, ry: 25 }, { rx: 28, ry: 24 }, { rx: 33, ry: 25 },
  { rx: 29, ry: 26 }, { rx: 31, ry: 24 }, { rx: 30, ry: 26 },
  { rx: 32, ry: 25 }, { rx: 28, ry: 25 }, { rx: 31, ry: 26 },
  { rx: 30, ry: 24 }, { rx: 29, ry: 25 }, { rx: 32, ry: 24 },
];

function PerfectRock({ idx }) {
  const id = `rp${idx}`;
  const { rx, ry } = VARIANTS[idx % VARIANTS.length];
  return (
    <svg width={ROCK_W} height={ROCK_H} viewBox="0 0 76 62" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id={`${id}g`} cx="38%" cy="33%" r="63%">
          <stop offset="0%" stopColor="#d0b0f5" />
          <stop offset="42%" stopColor="#8c5fd8" />
          <stop offset="100%" stopColor="#3a1470" />
        </radialGradient>
        <radialGradient id={`${id}s`} cx="36%" cy="26%" r="40%">
          <stop offset="0%" stopColor="white" stopOpacity="0.72" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}b`} cx="50%" cy="95%" r="55%">
          <stop offset="0%" stopColor="#1a0050" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#1a0050" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="38" cy="52" rx="27" ry="5" fill="rgba(0,0,0,0.28)" />
      <ellipse cx="38" cy="30" rx={rx} ry={ry} fill={`url(#${id}g)`} />
      <ellipse cx="38" cy="30" rx={rx} ry={ry} fill={`url(#${id}b)`} />
      <ellipse cx="38" cy="30" rx={rx} ry={ry} fill={`url(#${id}s)`} />
      <ellipse cx="27" cy="19" rx="11" ry="6" fill="white" opacity="0.55" transform="rotate(-12,27,19)" />
      <ellipse cx="51" cy="39" rx="4" ry="2.5" fill="white" opacity="0.18" />
    </svg>
  );
}

function ImperfectRock() {
  return (
    <svg width={ROCK_W} height={ROCK_H} viewBox="0 0 76 62" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="rig" cx="42%" cy="38%" r="62%">
          <stop offset="0%" stopColor="#a89080" />
          <stop offset="40%" stopColor="#6b5040" />
          <stop offset="100%" stopColor="#3a2418" />
        </radialGradient>
        <radialGradient id="ris" cx="38%" cy="28%" r="36%">
          <stop offset="0%" stopColor="white" stopOpacity="0.25" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="38" cy="52" rx="27" ry="5" fill="rgba(0,0,0,0.28)" />
      {/* Slightly irregular body */}
      <path d="M9,31 C8,17 21,6 38,5 C55,4 68,15 68,31 C68,47 57,58 39,57 C21,57 8,48 9,31Z" fill="url(#rig)" />
      <path d="M9,31 C8,17 21,6 38,5 C55,4 68,15 68,31 C68,47 57,58 39,57 C21,57 8,48 9,31Z" fill="url(#ris)" />
      {/* Chip */}
      <path d="M58,11 L65,8 L66,19 Z" fill="#251008" opacity="0.85" />
      {/* Main crack */}
      <path d="M30,10 L38,25 L31,35 L41,53" fill="none" stroke="#120603" strokeWidth="2.2" strokeLinecap="round" opacity="0.9" />
      {/* Branch crack */}
      <path d="M38,25 L47,30 L43,40" fill="none" stroke="#120603" strokeWidth="1.3" strokeLinecap="round" opacity="0.65" />
      <ellipse cx="27" cy="19" rx="8" ry="4.5" fill="white" opacity="0.16" transform="rotate(-8,27,19)" />
    </svg>
  );
}

function genPositions(w, h) {
  const cx = w / 2 - ROCK_W / 2;
  const cy = h / 2 - ROCK_H / 2;
  const offsets = [
    [-105,-65],[15,-85],[115,-50],[-55,15],[70,-30],
    [-125,30],[135,5],[-35,85],[85,65],[-85,-15],
    [0,25],[55,-70],[-70,55],[105,-75],[-20,-50],
  ];
  return offsets.slice(0, ROCK_COUNT).map(([dx, dy], i) => ({
    id: i,
    x: cx + dx,
    y: cy + dy,
    z: i + 1,
    rot: (i * 23 % 62) - 31,
    shake: false,
  }));
}

const STORY_TITLE = "Self-Acceptance";
const STORY_BODY =
  "The stone you chose was not ruined—it was honest. For a long time, fitting in felt like the only way to matter. But worth is not a costume you borrow. Self-acceptance is realizing you don't have to be \"normal\" to be valuable; it is choosing to stand beside yourself, cracks and all, and still call that enough.";
const TITLE_CHAR_MS = 42;
const TITLE_BODY_GAP_MS = 320;
const BODY_CHAR_MS = 24;
const AFTER_TYPING_PAUSE_MS = 2000;

export default function Task1({ onComplete }) {
  const containerRef = useRef(null);
  const [rocks, setRocks] = useState(null);
  const [maxZ, setMaxZ] = useState(ROCK_COUNT + 1);
  const [error, setError] = useState(null);
  /** playing → submitting (API) → story (typewriter) */
  const [phase, setPhase] = useState("playing");
  const [typedTitle, setTypedTitle] = useState("");
  const [typedBody, setTypedBody] = useState("");
  const [storyTypingDone, setStoryTypingDone] = useState(false);
  const [hint, setHint] = useState(false);
  const [imperfectIdx] = useState(() => Math.floor(Math.random() * ROCK_COUNT));
  const dragRef = useRef(null);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (phase !== "story") return;

    const timeouts = [];
    let cancelled = false;

    const wait = (ms) =>
      new Promise((resolve) => {
        const id = window.setTimeout(resolve, ms);
        timeouts.push(id);
      });

    const run = async () => {
      for (let i = 1; i <= STORY_TITLE.length; i++) {
        if (cancelled) return;
        await wait(TITLE_CHAR_MS);
        setTypedTitle(STORY_TITLE.slice(0, i));
      }
      await wait(TITLE_BODY_GAP_MS);
      for (let i = 1; i <= STORY_BODY.length; i++) {
        if (cancelled) return;
        await wait(BODY_CHAR_MS);
        setTypedBody(STORY_BODY.slice(0, i));
      }
      if (!cancelled) setStoryTypingDone(true);
    };

    run();

    return () => {
      cancelled = true;
      timeouts.forEach((id) => window.clearTimeout(id));
    };
  }, [phase]);

  useEffect(() => {
    if (!storyTypingDone) return;
    const id = window.setTimeout(() => {
      onCompleteRef.current?.();
    }, AFTER_TYPING_PAUSE_MS);
    return () => window.clearTimeout(id);
  }, [storyTypingDone]);

  useEffect(() => {
    if (!containerRef.current) return;
    const { width, height } = containerRef.current.getBoundingClientRect();
    setRocks(genPositions(width, height));
  }, []);

  const handlePointerDown = (e, rockId) => {
    e.preventDefault();
    e.stopPropagation();
    setRocks(prev => {
      const rock = prev.find(r => r.id === rockId);
      if (!rock) return prev;
      const nz = maxZ + 1;
      setMaxZ(nz);
      dragRef.current = {
        rockId,
        startX: e.clientX,
        startY: e.clientY,
        offsetX: e.clientX - rock.x,
        offsetY: e.clientY - rock.y,
        moved: false,
        imperfectIdx,
      };
      return prev.map(r => r.id === rockId ? { ...r, z: nz } : r);
    });

    const onMove = (ev) => {
      const cx = ev.clientX ?? ev.touches?.[0]?.clientX;
      const cy = ev.clientY ?? ev.touches?.[0]?.clientY;
      const d = dragRef.current;
      if (!d) return;
      if (Math.abs(cx - d.startX) > 4 || Math.abs(cy - d.startY) > 4) d.moved = true;
      setRocks(prev => prev.map(r =>
        r.id === d.rockId ? { ...r, x: cx - d.offsetX, y: cy - d.offsetY } : r
      ));
    };

    const onUp = async () => {
      const d = dragRef.current;
      dragRef.current = null;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      if (!d || d.moved) return;
      // clicked
      if (d.rockId === d.imperfectIdx) {
        setPhase("submitting");
        setError(null);
        try {
          await completeTask1();
          setTypedTitle("");
          setTypedBody("");
          setStoryTypingDone(false);
          setPhase("story");
        } catch (err) {
          setError(err.message || String(err));
          setPhase("playing");
        }
      } else {
        setHint(true);
        setRocks(prev => prev.map(r => r.id === d.rockId ? { ...r, shake: true } : r));
        setTimeout(() => setRocks(prev => prev.map(r => r.id === d.rockId ? { ...r, shake: false } : r)), 550);
      }
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  return (
    <div
      className={`task-panel task1-wrap${phase !== "playing" ? " task1-wrap--blocked" : ""}`}
      style={{ width: "100%", height: "100%" }}
    >
      <h2>Task 1 — Recognize Imperfection</h2>
      <p className="task-desc">
        Dig through the pile. Find the stone that {"doesn't"} belong.
      </p>
      {hint && <p className="task1-hint">Look closer… one is different.</p>}
      {error && <p className="error-msg">{error}</p>}
      <div className="task1-container" ref={containerRef}>
        {!rocks && <p className="task1-loading">Loading…</p>}
        {rocks?.map(rock => (
          <div
            key={rock.id}
            className={`task1-rock${rock.shake ? " task1-shake" : ""}`}
            style={{
              left: rock.x,
              top: rock.y,
              zIndex: rock.z,
              transform: `rotate(${rock.rot}deg)`,
            }}
            onPointerDown={(e) => handlePointerDown(e, rock.id)}
          >
            {rock.id === imperfectIdx ? <ImperfectRock /> : <PerfectRock idx={rock.id} />}
          </div>
        ))}
      </div>

      {phase === "submitting" && (
        <div className="task1-story-overlay" aria-live="polite">
          <div className="task1-story-typing task1-story-typing--compact">
            <p className="task1-story-submit-msg">Hold on…</p>
          </div>
        </div>
      )}

      {phase === "story" && (
        <div className="task1-story-overlay" aria-live="polite">
          <div className="task1-story-typing">
            <h3 className="task1-story-title">
              {typedTitle}
              {!storyTypingDone && typedTitle.length < STORY_TITLE.length && (
                <span className="task1-story-cursor" aria-hidden="true" />
              )}
            </h3>
            <p className="task1-story-line">
              {typedBody}
              {storyTypingDone ? null : typedTitle.length === STORY_TITLE.length ? (
                <span className="task1-story-cursor" aria-hidden="true" />
              ) : null}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
