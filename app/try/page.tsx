"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

/** Types */
type AgeBand = "8-9" | "10-11" | "12-13";
type QBase = { question: string; options: string[]; correct: number; explain?: string };
type QuizItem = {
  question: string;
  options: { text: string; correct: boolean }[]; // al geschud
  source?: QBase; // voor "herhaal fouten"
};

/** Hulpfuncties */
function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function sample<T>(arr: T[], k: number): T[] {
  if (k >= arr.length) return shuffle(arr);
  const picked: T[] = [];
  const used = new Set<number>();
  while (picked.length < k) {
    const idx = Math.floor(Math.random() * arr.length);
    if (!used.has(idx)) {
      used.add(idx);
      picked.push(arr[idx]);
    }
  }
  return picked;
}
function toQuizItems(pool: QBase[], count = 10): QuizItem[] {
  return sample(pool, count).map((q) => {
    const opts = q.options.map((t, i) => ({ text: t, correct: i === q.correct }));
    return { question: q.question, options: shuffle(opts), source: q };
  });
}

/** Vraagpools (iets ruimer dan 10 per leeftijd) */
const DATA: Record<AgeBand, QBase[]> = {
  "8-9": [
    { question: 'Wat is het meervoud van "boom"?', options: ["boom", "bomen", "boomen", "boomsen"], correct: 1, explain: "Meervoud is ‘bomen’." },
    { question: 'Wat is het verkleinwoord van "boek"?', options: ["boekje", "boekjes", "boekje's", "boekje-"], correct: 0, explain: "Verkleinwoord: boek → boekje." },
    { question: 'Wat is de tegenstelling van "nat"?', options: ["koud", "droog", "zwaar", "klein"], correct: 1, explain: "Tegenstelling: nat ↔ droog." },
    { question: "Welk dier miauwt?", options: ["hond", "kat", "koe", "kip"], correct: 1, explain: "Een kat miauwt." },
    { question: 'Eerste letter van "vliegtuig"?', options: ["f", "v", "b", "t"], correct: 1, explain: "Vliegtuig begint met een v." },
    { question: "Welk woord is een werkwoord?", options: ["stoel", "rennen", "blauw", "winter"], correct: 1, explain: "‘Rennen’ is een werkwoord." },
    { question: "Hoe schrijf je het goed: schrij…", options: ["schrijfen", "schrijven", "schryven", "schriven"], correct: 1, explain: "Juiste vorm: schrijven." },
    { question: 'Synoniem van "snel"?', options: ["traag", "vlug", "zwaar", "klein"], correct: 1, explain: "‘Vlug’ is synoniem voor ‘snel’." },
    { question: "De zon schijnt aan de ____.", options: ["lucht", "hemel", "muur", "grond"], correct: 1, explain: "De zon staat aan de hemel." },
    { question: 'Meervoud van "ei"?', options: ["eien", "eieren", "ei's", "eers"], correct: 1, explain: "Meervoud: eieren." },
    { question: 'Wat is het meervoud van "raam"?', options: ["ramen", "raamen", "rammen", "raams"], correct: 0 },
    { question: "Welke is een kleur?", options: ["springen", "blauw", "boeken", "lopen"], correct: 1 },
  ],
  "10-11": [
    { question: 'Synoniem van "beginnen"?', options: ["stoppen", "starten", "denken", "vallen"], correct: 1, explain: "‘Starten’ = beginnen." },
    { question: 'Tegenstelling van "oud"?', options: ["groot", "jong", "nieuw", "vers"], correct: 1, explain: "Tegenstelling: oud ↔ jong." },
    { question: "Welke hoort niet?", options: ["fiets", "auto", "trein", "appel"], correct: 3, explain: "‘Appel’ is geen vervoermiddel." },
    { question: 'Betekenis "onderzoeken"?', options: ["iets goed bekijken", "weggooien", "hard rennen", "slapen"], correct: 0 },
    { question: "Voltooid deelwoord: Ik heb het boek …", options: ["geleest", "gelezen", "gelezend", "leesd"], correct: 1 },
    { question: "Kies het bijvoeglijk naamwoord: de ____ hond", options: ["hard", "luidruchtige", "blaft", "hond"], correct: 1 },
    { question: 'Meervoud van "museum"?', options: ["museums", "musea", "museeën", "museus"], correct: 1 },
    { question: 'Betekenis "concentreren"?', options: ["je aandacht richten", "hard praten", "rondlopen", "vergeten"], correct: 0 },
    { question: "Welk woord is samengesteld?", options: ["tandarts", "mooi", "lopen", "stoel"], correct: 0 },
    { question: "Kies de juiste zin.", options: ["Zij word morgen twaalf jaar.", "Zij worden morgen twaalf jaar.", "Zij worde morgen twaalf jaar.", "Zij wordt morgen twaalf jaar (meervoud)."], correct: 1 },
    { question: "Welke is een bijwoord?", options: ["snel", "stoel", "lopen", "grijs"], correct: 0 },
    { question: "Welk voorvoegsel maakt ‘eerlijk’ tot tegenstellend woord?", options: ["be-", "on-", "ge-", "ver-"], correct: 1, explain: "oneerlijk." },
  ],
  "12-13": [
    { question: 'Synoniem van "motiveren"?', options: ["tegenwerken", "aansporen", "negeren", "vertragen"], correct: 1 },
    { question: 'Tegenstelling van "complex"?', options: ["eenvoudig", "interessant", "diepgaand", "lang"], correct: 0 },
    { question: "Wat is een metafoor?", options: ["vergelijking met 'als'", "vergelijking zonder 'als'", "opsomming", "uitroep"], correct: 1, explain: "Zonder ‘als’ is metafoor; met ‘als’ is vergelijking." },
    { question: "Welke zin is correct?", options: ["Hij word later leraar.", "Hij wordt later leraar.", "Hij werdt later leraar.", "Hij wordtt later leraar."], correct: 1 },
    { question: 'Betekenis "consequent"?', options: ["steeds hetzelfde doen", "soms wel, soms niet", "heel snel", "onbeleefd"], correct: 0 },
    { question: 'Meervoud van "criterium"?', options: ["criteriums", "criteria", "criteriumns", "criteriae"], correct: 1 },
    { question: "Welk woord is een homoniem?", options: ["bank", "vrolijk", "lopen", "groot"], correct: 0, explain: "‘Bank’ = meubel of geldinstelling." },
    { question: "Welk voorzetsel past? Hij wacht ___ de bus.", options: ["aan", "op", "naar", "voor"], correct: 1 },
    { question: "Kies de juiste schrijfwijze.", options: ["pannekoek", "pannenkoek", "pannen-koek", "pannen koek"], correct: 1 },
    { question: 'Wat is het bijwoord in "Zij zingt prachtig"?', options: ["zij", "zingt", "prachtig", "—"], correct: 2 },
    { question: "Welke stijlfiguur is ‘de tijd vliegt’?", options: ["hyperbool", "metoniem", "personificatie", "eufemisme"], correct: 2 },
    { question: "Kies het correcte voltooid deelwoord: ‘Ik heb het …’", options: ["gedownload", "gedownloadt", "gedownloadd", "ge-download"], correct: 0 },
  ],
};

export default function TryPage() {
  const [band, setBand] = useState<AgeBand | null>(null);
  const [quiz, setQuiz] = useState<QuizItem[]>([]);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const [wrongList, setWrongList] = useState<QBase[]>([]);

  const total = quiz.length;
  const curr = quiz[index] || null;

  /** Nieuwe run starten voor gekozen leeftijd */
  function startBand(b: AgeBand) {
    setBand(b);
    const q = toQuizItems(DATA[b], 10);
    setQuiz(q);
    setIndex(0);
    setPicked(null);
    setCorrectCount(0);
    setFinished(false);
    setWrongList([]);
  }

  /** Antwoord kiezen */
  function choose(i: number) {
    if (picked !== null || !curr) return;
    setPicked(i);
    if (curr.options[i].correct) {
      setCorrectCount((c) => c + 1);
    } else {
      // bewaar bronvraag voor herhalen
      if (curr.source) setWrongList((w) => [...w, curr.source!]);
    }
  }

  /** Volgende vraag of afronden */
  function next() {
    if (picked === null) return;
    if (index + 1 >= total) {
      setFinished(true);
    } else {
      setIndex((i) => i + 1);
      setPicked(null);
    }
  }

  /** Alleen fouten herhalen (nieuwe 10 of minder) */
  function repeatWrong() {
    if (wrongList.length === 0) return;
    const q = toQuizItems(wrongList, Math.min(10, wrongList.length));
    setQuiz(q);
    setIndex(0);
    setPicked(null);
    setCorrectCount(0);
    setFinished(false);
    setWrongList([]);
  }

  /** Toetsenbord 1–4 */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!curr || finished) return;
      if (e.key >= "1" && e.key <= "4") {
        const n = parseInt(e.key, 10) - 1;
        if (n >= 0 && n < curr.options.length) choose(n);
      }
      if ((e.key === "Enter" || e.key === " ") && picked !== null) {
        e.preventDefault();
        next();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [curr, picked, finished]);

  /** UI helpers */
  const progressPct = useMemo(() => {
    if (!total) return 0;
    // zodra gekozen is telt de vraag als "afgerond"
    const done = index + (picked !== null ? 1 : 0);
    return Math.round((done / total) * 100);
  }, [index, picked, total]);

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
      <div
        style={{
          width: "100%",
          maxWidth: 900,
          background: "white",
          borderRadius: 20,
          boxShadow: "0 10px 30px rgba(0,0,0,.10)",
          padding: 24,
        }}
      >
        <h1 style={{ fontSize: 32, marginBottom: 4, textAlign: "center" }}>Proberen (kids)</h1>

        <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
  <Link href="/" style={alink("#0f172a")}>Home</Link>
</div>


        {!band && (
          <>
            <p style={{ textAlign: "center", marginBottom: 16 }}>
              Kies je leeftijdscategorie. Je krijgt <b>10 vragen</b>, met direct feedback.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              {(["8-9", "10-11", "12-13"] as AgeBand[]).map((b) => (
                <button key={b} onClick={() => startBand(b)} style={pill(b)}>
                  {b} jaar
                </button>
              ))}
            </div>
          </>
        )}

        {band && !finished && curr && (
          <div style={{ marginTop: 16 }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ color: "#64748b" }}>
                Leeftijd: <b>{band}</b>
              </span>
              <span style={{ color: "#64748b" }}>
                Vraag <b>{index + 1}</b> / {total}
              </span>
            </div>

            {/* Progress */}
            <div
              aria-label="Voortgang"
              style={{
                height: 10,
                background: "#e2e8f0",
                borderRadius: 999,
                overflow: "hidden",
                marginBottom: 12,
              }}
            >
              <div style={{ width: `${progressPct}%`, height: "100%", background: "#10b981" }} />
            </div>

            {/* Vraag */}
            <div
              style={{
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: 16,
                padding: 16,
                marginBottom: 12,
                fontSize: 18,
              }}
            >
              {curr.question}
            </div>

            {/* Opties */}
            <div style={{ display: "grid", gap: 10 }}>
              {curr.options.map((opt, i) => {
                const chosen = picked === i;
                const correct = picked !== null && opt.correct;
                const wrongPick = chosen && !opt.correct;

                let bg = "white";
                if (correct) bg = "#dcfce7"; // groen
                else if (wrongPick) bg = "#fee2e2"; // rood
                else if (chosen) bg = "#e2e8f0"; // grijs gekozen

                return (
                  <button
                    key={i}
                    onClick={() => choose(i)}
                    disabled={picked !== null}
                    style={{
                      textAlign: "left",
                      padding: "12px 14px",
                      borderRadius: 12,
                      border: "1px solid #cbd5e1",
                      background: bg,
                      cursor: picked !== null ? "default" : "pointer",
                      fontSize: 16,
                    }}
                    aria-pressed={chosen}
                  >
                    <span style={{ opacity: 0.6, marginRight: 8 }}>{i + 1}.</span>
                    {opt.text}
                  </button>
                );
              })}
            </div>

            {/* Feedback + next */}
            {picked !== null && (
              <div style={{ marginTop: 12, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div
                  style={{
                    color: curr.options[picked].correct ? "#16a34a" : "#dc2626",
                    fontWeight: 700,
                  }}
                >
                  {curr.options[picked].correct ? "Goed gedaan!" : "Helaas, dit is niet goed."}
                </div>
                <button onClick={next} style={btn("#0f172a", true)}>
                  Volgende
                </button>
              </div>
            )}

            {/* Uitleg */}
            {picked !== null && curr.source?.explain && (
              <div
                style={{
                  marginTop: 10,
                  padding: 12,
                  background: "#f1f5f9",
                  borderRadius: 12,
                  border: "1px solid #e2e8f0",
                  color: "#334155",
                }}
              >
                <b>Uitleg: </b>
                {curr.source.explain}
              </div>
            )}

            {/* Onderste knoppen */}
            <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button onClick={() => startBand(band)} style={btn("#e2e8f0")}>
                Opnieuw (nieuwe set)
              </button>
              <button onClick={() => setBand(null)} style={btn("#e2e8f0")}>
                Andere leeftijd
              </button>
              <Link href="/try/game" style={alink("#10b981")}>
                Speel het spel
              </Link>
            </div>
          </div>
        )}

        {band && finished && (
          <div style={{ textAlign: "center", marginTop: 12 }}>
            <h2 style={{ fontSize: 28, marginBottom: 8 }}>Klaar!</h2>
            <p style={{ marginBottom: 12 }}>
              Je scoorde <b>{correctCount}</b> van de <b>{total}</b>.
            </p>

            {/* Herhaal fouten blok */}
            <div style={{ marginBottom: 12 }}>
              {wrongList.length > 0 ? (
                <p>
                  Je had <b>{wrongList.length}</b> vraag{wrongList.length > 1 ? "en" : ""} fout. Wil je die meteen
                  <b> opnieuw oefenen</b>?
                </p>
              ) : (
                <p>Top! Alles goed. 🎉</p>
              )}
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              {wrongList.length > 0 && (
                <button onClick={repeatWrong} style={btn("#0ea5e9", true)}>
                  Herhaal alleen fouten
                </button>
              )}
              <button onClick={() => startBand(band!)} style={btn("#e2e8f0")}>
                Nieuwe willekeurige 10
              </button>
              <Link href="/try/game" style={alink("#10b981")}>
                Speel het spel
              </Link>
              <button onClick={() => setBand(null)} style={btn("#e2e8f0")}>
                Andere leeftijd
              </button>
            </div>

            <p style={{ marginTop: 8, fontSize: 12, color: "#64748b" }}>
              In de oefenruimte wordt niets opgeslagen.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

/** Kleine UI helpers */
function pill(b: AgeBand): React.CSSProperties {
  const color = b === "8-9" ? "#10b981" : b === "10-11" ? "#0ea5e9" : "#a78bfa";
  return {
    padding: "10px 14px",
    borderRadius: 999,
    background: color,
    color: "white",
    border: "none",
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: "0 6px 16px rgba(0,0,0,.08)",
  };
}
function btn(bg: string, white = false): React.CSSProperties {
  return {
    padding: "12px 14px",
    borderRadius: 12,
    background: bg,
    color: white ? "white" : "#0f172a",
    border: "none",
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: "0 6px 16px rgba(0,0,0,.08)",
  };
}
function alink(bg: string): React.CSSProperties {
  return {
    display: "inline-block",
    padding: "12px 14px",
    borderRadius: 12,
    background: bg,
    color: "white",
    textDecoration: "none",
    fontWeight: 800,
    boxShadow: "0 6px 16px rgba(0,0,0,.08)",
  };
}
