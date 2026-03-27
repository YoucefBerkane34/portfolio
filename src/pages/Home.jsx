import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const terminalLines = [
  "$ whoami",
  "> youcef_berkane — sysadmin",
  "$ systemctl status servers",
  "> ● All systems operational",
  "$ uptime",
  "> 99.9% availability this month",
  "$ cat skills.txt",
  "> Linux · Networking · Security · Bash",
  "$ _",
];

function Terminal({ t, theme }) {
  const [lines, setLines] = useState([]);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (idx >= terminalLines.length) return;
    const timeout = setTimeout(() => {
      setLines(prev => [...prev, terminalLines[idx]]);
      setIdx(i => i + 1);
    }, idx === 0 ? 600 : 520);
    return () => clearTimeout(timeout);
  }, [idx]);

  return (
    <div style={{
      background: theme === "minimal" ? "#1a1a1a" : "#0d1117",
      border: `1px solid ${theme === "colorful" ? t.border : "#30363d"}`,
      borderRadius: 12, padding: "20px 24px", fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      fontSize: 13, lineHeight: 1.9, minHeight: 220,
      boxShadow: `0 0 40px ${t.accent}18`,
    }}>
      <div style={{ display: "flex", gap: 7, marginBottom: 16 }}>
        {["#ff5f57","#ffbd2e","#28c840"].map(c => (
          <div key={c} style={{ width: 12, height: 12, borderRadius: "50%", background: c }} />
        ))}
        <span style={{ marginLeft: 8, fontSize: 11, color: "#6b7280" }}>bash — youcef@server</span>
      </div>
      {lines.map((line, i) => (
        <div key={i} style={{
          color: line.startsWith("$") ? t.accent
            : line.startsWith(">") ? (theme === "colorful" ? t.accentSecondary : "#7ee787")
            : "#94a3b8",
          opacity: 0, animation: "fadeIn 0.3s forwards",
        }}>{line}</div>
      ))}
      <style>{`@keyframes fadeIn { to { opacity: 1; } }`}</style>
    </div>
  );
}

const stats = [
  { label: "Systems managed", value: "10+" },
  { label: "Uptime maintained", value: "99.9%" },
  { label: "Scripts automated", value: "30+" },
  { label: "Issues resolved", value: "200+" },
];

export default function Home({ t, theme }) {
  return (
    <div style={{ paddingTop: 64 }}>

      {/* Hero */}
      <section style={{
        minHeight: "100vh", display: "flex", alignItems: "center",
        padding: "0 24px", maxWidth: 1100, margin: "0 auto",
        gap: 60, flexWrap: "wrap",
      }}>
        <div style={{ flex: "1 1 340px" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: `${t.accent}15`, border: `1px solid ${t.accent}40`,
            borderRadius: 20, padding: "6px 16px", marginBottom: 24,
          }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", animation: "pulse 2s infinite" }} />
            <span style={{ color: t.accent, fontSize: 13, fontWeight: 500 }}>Available for opportunities</span>
          </div>

          <h1 style={{
            fontSize: "clamp(36px, 6vw, 62px)", fontWeight: 800,
            lineHeight: 1.1, letterSpacing: -2, margin: "0 0 16px",
            color: "var(--text)",
          }}>
            Hi, I'm{" "}
            <span style={{
              background: `linear-gradient(135deg, ${t.accent}, ${t.accentSecondary})`,
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>Youcef</span>
          </h1>

          <h2 style={{
            fontSize: "clamp(18px, 3vw, 26px)", fontWeight: 500,
            color: "var(--text-muted)", margin: "0 0 20px", letterSpacing: -0.5,
          }}>
            System Administrator
          </h2>

          <p style={{ fontSize: 16, lineHeight: 1.8, color: "var(--text-muted)", maxWidth: 440, margin: "0 0 36px" }}>
            I keep infrastructure alive, secure, and efficient. From server setup to automation scripts — I make sure the systems behind the scenes never sleep.
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link to="/projects" style={{
              display: "inline-block", padding: "12px 28px", borderRadius: 10,
              background: `linear-gradient(135deg, ${t.accent}, ${t.accentSecondary})`,
              color: "#fff", textDecoration: "none", fontWeight: 600, fontSize: 15,
              boxShadow: `0 4px 20px ${t.accent}40`, transition: "all 0.2s",
            }}>View Projects →</Link>
            <Link to="/contact" style={{
              display: "inline-block", padding: "12px 28px", borderRadius: 10,
              border: `1px solid var(--border)`, color: "var(--text)",
              textDecoration: "none", fontWeight: 600, fontSize: 15,
              background: "transparent", transition: "all 0.2s",
            }}>Get in touch</Link>
          </div>
        </div>

        <div style={{ flex: "1 1 320px", maxWidth: 480 }}>
          <Terminal t={t} theme={theme} />
        </div>
      </section>

      {/* Stats */}
      <section style={{
        borderTop: `1px solid var(--border)`, borderBottom: `1px solid var(--border)`,
        background: "var(--bg-secondary)", padding: "40px 24px",
      }}>
        <div style={{
          maxWidth: 1100, margin: "0 auto", display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 32,
        }}>
          {stats.map(s => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div style={{
                fontSize: 36, fontWeight: 800, letterSpacing: -1,
                background: `linear-gradient(135deg, ${t.accent}, ${t.accentSecondary})`,
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>{s.value}</div>
              <div style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
