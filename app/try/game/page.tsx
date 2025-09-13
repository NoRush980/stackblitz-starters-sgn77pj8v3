"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type Vec = { x: number; y: number };
type Ball = { pos: Vec; vel: Vec; r: number; bounciness: number };

export default function GamePage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);

  // UI-states (alleen voor knoppen/labels buiten canvas)
  const [running, setRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  // refs voor game (stabiel, geen her-render nodig)
  const runningRef = useRef(false);
  const widthRef = useRef(900);
  const heightRef = useRef(420);
  const groundYRef = useRef(heightRef.current - 80);
  const gravityRef = useRef(0.9);
  const jumpVelRef = useRef(-16);

  const startTimeRef = useRef<number | null>(null);
  const bestSecondsRef = useRef(0);

  const playerRef = useRef({
    pos: { x: 120, y: groundYRef.current },
    vel: { x: 0, y: 0 },
    w: 38,
    h: 48,
    onGround: true,
  });

  const ballsRef = useRef<Ball[]>([]);

  /** SPRING (space/knop) */
  function jump() {
    if (!runningRef.current || gameOver) return;
    const p = playerRef.current;
    if (p.onGround) {
      p.vel.y = jumpVelRef.current;
      p.onGround = false;
    }
  }

  /** Start/Opnieuw */
  function start() {
    const cvs = canvasRef.current;
    if (!cvs) return;
    runningRef.current = true;
    setRunning(true);
    setGameOver(false);
    resetWorld();
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(loop);
  }

  /** Einde */
  function end() {
    runningRef.current = false;
    setRunning(false);
    setGameOver(true);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    // high score updaten
    const elapsed = currentSeconds();
    if (elapsed > bestSecondsRef.current) bestSecondsRef.current = elapsed;
    // 1 extra draw voor overlay
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) draw(ctx, elapsed);
  }

  /** Helpers */
  function rand(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  function clamp(v: number, a: number, z: number) {
    return Math.max(a, Math.min(z, v));
  }
  function circleRectCollide(b: { pos: Vec; r: number }, p: { pos: Vec; w: number; h: number }) {
    const rx = clamp(b.pos.x, p.pos.x - p.w / 2, p.pos.x + p.w / 2);
    const ry = clamp(b.pos.y, p.pos.y - p.h, p.pos.y);
    const dx = b.pos.x - rx;
    const dy = b.pos.y - ry;
    return dx * dx + dy * dy <= b.r * b.r;
  }

  function spawnBall(speedBoost = 0) {
    const w = widthRef.current;
    const r = rand(14, 24);
    const baseSpeed = 6 + speedBoost;
    ballsRef.current.push({
      pos: { x: w + r + rand(0, 120), y: groundYRef.current - r },
      vel: { x: -(baseSpeed + Math.random() * 2), y: -rand(2, 6) },
      r,
      bounciness: 0.55 + Math.random() * 0.2,
    });
  }

  function resetWorld() {
    const p = playerRef.current;
    p.pos = { x: 120, y: groundYRef.current };
    p.vel = { x: 0, y: 0 };
    p.onGround = true;
    ballsRef.current = [];
    startTimeRef.current = performance.now();
    spawnBall(); // begin met 1 bal
  }

  function currentSeconds() {
    return startTimeRef.current ? (performance.now() - startTimeRef.current) / 1000 : 0;
  }

  let t = 0; // lokale tick teller voor moeilijkheid

  const loop = () => {
    if (!runningRef.current) return;

    t++;
    // elke ~100 ticks extra bal, tot max 6; met kleine snelheidsboost
    if (t % 100 === 0 && ballsRef.current.length < 6) {
      const speedBoost = Math.min(6, Math.floor(t / 300));
      spawnBall(speedBoost);
    }

    // physics speler
    const p = playerRef.current;
    p.vel.y += gravityRef.current;
    p.pos.y += p.vel.y;
    if (p.pos.y >= groundYRef.current) {
      p.pos.y = groundYRef.current;
      p.vel.y = 0;
      p.onGround = true;
    }

    // physics ballen
    for (const b of ballsRef.current) {
      b.pos.x += b.vel.x;
      b.pos.y += b.vel.y;
      b.vel.y += gravityRef.current * 0.6;

      const by = groundYRef.current - b.r;
      if (b.pos.y >= by) {
        b.pos.y = by;
        b.vel.y = -Math.abs(b.vel.y) * b.bounciness;
      }
      if (b.pos.x < -b.r - 40) {
        b.pos.x = widthRef.current + b.r + rand(0, 140);
      }
    }

    // botsing?
    for (const b of ballsRef.current) {
      if (circleRectCollide(b, p)) {
        end();
        return;
      }
    }

    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) draw(ctx, currentSeconds());

    rafRef.current = requestAnimationFrame(loop);
  };

  function draw(ctx: CanvasRenderingContext2D, seconds: number) {
    const w = widthRef.current;
    const h = heightRef.current;
    const gY = groundYRef.current;

    // achtergrond
    ctx.fillStyle = "#0b1021";
    ctx.fillRect(0, 0, w, h);
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, "rgba(16,185,129,.08)");
    grad.addColorStop(1, "rgba(14,165,233,.12)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // grond
    ctx.fillStyle = "#1f2937";
    ctx.fillRect(0, gY, w, 30);

    // speler
    ctx.fillStyle = "#22c55e";
    const p = playerRef.current;
    ctx.fillRect(p.pos.x - p.w / 2, p.pos.y - p.h, p.w, p.h);

    // ballen
    ctx.fillStyle = "#60a5fa";
    ctx.strokeStyle = "#93c5fd";
    ctx.lineWidth = 2;
    for (const b of ballsRef.current) {
      ctx.beginPath();
      ctx.arc(b.pos.x, b.pos.y, b.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    // score
    ctx.fillStyle = "white";
    ctx.font = "bold 18px system-ui, -apple-system, Segoe UI, Roboto, Arial";
    ctx.fillText(`Score: ${seconds.toFixed(2)}s`, 18, 28);
    if (bestSecondsRef.current > 0) {
      ctx.fillText(`Beste: ${bestSecondsRef.current.toFixed(2)}s`, 18, 50);
    }

    // overlay als niet running
    if (!runningRef.current) {
      ctx.fillStyle = "rgba(0,0,0,.45)";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "white";
      ctx.textAlign = "center";
      ctx.font = "bold 32px system-ui, -apple-system, Segoe UI, Roboto, Arial";
      ctx.fillText(gameOver ? "GAME OVER" : "Woordblox Spring-spel", w / 2, h / 2 - 16);
      ctx.font = "16px system-ui, -apple-system, Segoe UI, Roboto, Arial";
      ctx.fillText("Start/Enter = Start • Spatie/SPRING = Spring", w / 2, h / 2 + 18);
      ctx.textAlign = "left";
    }
  }

  // init: één keer
  useEffect(() => {
    const cvs = canvasRef.current;
    const ctx = cvs?.getContext("2d");
    if (!cvs || !ctx) return;

    // eerste teken + AUTO-START
    draw(ctx, 0);
    start();

    // keyboard
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        jump();
      }
      if (e.code === "Enter" || e.code === "KeyR") {
        e.preventDefault();
        start();
      }
    };
    window.addEventListener("keydown", onKeyDown, { passive: false });

    // cleanup
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      runningRef.current = false;
    };
    // <-- geen deps: éénmalig
  }, []);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
        padding: 24,
        background: "linear-gradient(180deg,#f4f7ff 0%, #e9f3ff 100%)",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <h1 style={{ fontSize: 36, marginBottom: 8 }}>Spring-spel</h1>
        <p style={{ marginBottom: 12, color: "#475569" }}>
          <b>Spatie</b> = springen • <b>Enter</b> = start/herstart • op mobiel: SPRING-knop.
        </p>

        <div
          style={{
            position: "relative",
            margin: "0 auto 12px",
            borderRadius: 16,
            overflow: "hidden",
            boxShadow: "0 10px 30px rgba(0,0,0,.10)",
            width: widthRef.current,
            maxWidth: "100%",
          }}
        >
          <canvas ref={canvasRef} width={widthRef.current} height={heightRef.current} />
        </div>

        {/* knoppen */}
        {!running && (
  <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginBottom: 8 }}>
    <button onClick={start} style={btn("#0ea5e9", true)}>Start / Opnieuw</button>
    <Link href="/try" style={alink("#0f172a")}>Terug naar Proberen</Link>
    <Link href="/" style={alink("#0f172a")}>Home</Link>
  </div>
)}

        {running && !gameOver && (
          <button onClick={jump} style={btn("#10b981", true)}>SPRING</button>
        )}

        <p style={{ marginTop: 10, fontSize: 12, color: "#64748b" }}>
          Oefenmodus: score wordt <b>niet</b> opgeslagen.
        </p>
      </div>
    </main>
  );
}

/* ---------- UI helpers ---------- */
function btn(bg: string, whiteText = false): React.CSSProperties {
  return {
    padding: "12px 16px",
    borderRadius: 12,
    background: bg,
    color: whiteText ? "white" : "#0f172a",
    border: "none",
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: "0 6px 16px rgba(0,0,0,.08)",
  };
}

function alink(bg: string): React.CSSProperties {
  return {
    display: "inline-block",
    padding: "12px 16px",
    borderRadius: 12,
    background: bg,
    color: "white",
    textDecoration: "none",
    fontWeight: 800,
    boxShadow: "0 6px 16px rgba(0,0,0,.08)",
  };
}
