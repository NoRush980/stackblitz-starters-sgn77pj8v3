// app/page.tsx
import Link from "next/link";
import type { CSSProperties } from "react";

export default function Home() {
  const btn = (bg: string, fg: string): CSSProperties => ({
    display: "inline-block",
    padding: "14px 18px",
    borderRadius: 14,
    background: bg,
    color: fg,
    textDecoration: "none",
    fontWeight: 700,
    boxShadow: "0 6px 16px rgba(0,0,0,.08)",
    transition: "transform .15s ease, background .15s ease",
  });

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "linear-gradient(180deg,#f4f7ff 0%,#e9f3ff 100%)",
        fontFamily:
          "system-ui,-apple-system,Segoe UI,Roboto,Arial,'Noto Sans',sans-serif",
      }}
    >
      <section style={{ maxWidth: 960, width: "100%", padding: 24, textAlign: "center" }}>
        {/* HERO met overlay */}
        <div
          style={{
            position: "relative",
            borderRadius: 24,
            overflow: "hidden",
            boxShadow: "0 10px 30px rgba(0,0,0,.12)",
            marginBottom: 24,
          }}
        >
          <img
            src="https://images.pexels.com/photos/7848986/pexels-photo-7848986.jpeg?auto=compress&cs=tinysrgb&w=1600"
            alt="Tiener gamet met headset - Woordblox"
            style={{ width: "100%", height: 360, objectFit: "cover" }}
          />
          {/* Donkere gradient overlay voor meer contrast */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(180deg, rgba(0,0,0,.35) 0%, rgba(0,0,0,.15) 100%)",
            }}
          />
        </div>

        <h1 style={{ fontSize: 48, margin: "8px 0 8px" }}>Woordblox</h1>
        <p style={{ fontSize: 18, marginBottom: 24 }}>
          Leren + korte spelletjes voor kids (8–13 jaar). Simpel, leuk en veilig.
        </p>

        <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
          <Link href="/register" style={btn("white", "#0f172a")}>
            Registreren (ouders)
          </Link>
          <Link href="/login" style={btn("#0ea5e9", "white")}>
            Inloggen (kids)
          </Link>
          <Link href="/try" style={btn("#10b981", "white")}>
            Proberen (kids)
          </Link>
        </div>

        <p style={{ fontSize: 12, color: "#64748b", marginTop: 16 }}>
          *Proberen = 10 oefenvragen + spring-spel (zonder scores).*
        </p>
      </section>
    </main>
  );
}
