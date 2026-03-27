import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const themeIcons = {
  dark: "🌑",
  light: "☀️",
  minimal: "◻️",
  colorful: "🎨",
};

export default function Navbar({ theme, setTheme, themes, t }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const location = useLocation();

  const links = [
    { to: "/", label: "Home" },
    { to: "/about", label: "About" },
    { to: "/projects", label: "Projects" },
    { to: "/contact", label: "Contact" },
  ];

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      background: "var(--nav-bg)", backdropFilter: "blur(14px)",
      borderBottom: `1px solid var(--border)`,
      transition: "all 0.4s ease",
    }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        
        {/* Logo */}
        <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: `linear-gradient(135deg, ${t.accent}, ${t.accentSecondary})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, fontWeight: 800, color: "#fff", letterSpacing: -1,
          }}>YB</div>
          <span style={{ color: "var(--text)", fontWeight: 700, fontSize: 17, letterSpacing: -0.5 }}>Youcef Berkane</span>
        </Link>

        {/* Desktop links */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }} className="desktop-nav">
          {links.map(l => (
            <Link key={l.to} to={l.to} style={{
              textDecoration: "none", padding: "6px 14px", borderRadius: 8,
              fontSize: 14, fontWeight: 500, transition: "all 0.2s",
              color: location.pathname === l.to ? "var(--accent)" : "var(--text-muted)",
              background: location.pathname === l.to ? `${t.accent}15` : "transparent",
            }}>{l.label}</Link>
          ))}

          {/* Theme switcher */}
          <div style={{ position: "relative", marginLeft: 8 }}>
            <button onClick={() => setThemeOpen(!themeOpen)} style={{
              background: `${t.accent}20`, border: `1px solid var(--border)`,
              borderRadius: 8, padding: "6px 12px", cursor: "pointer",
              color: "var(--accent)", fontSize: 13, fontWeight: 600,
              display: "flex", alignItems: "center", gap: 6, transition: "all 0.2s",
            }}>
              {themeIcons[theme]} {theme.charAt(0).toUpperCase() + theme.slice(1)}
              <span style={{ fontSize: 10 }}>▼</span>
            </button>
            {themeOpen && (
              <div style={{
                position: "absolute", right: 0, top: "calc(100% + 8px)",
                background: "var(--bg-card)", border: `1px solid var(--border)`,
                borderRadius: 10, padding: 6, minWidth: 140, zIndex: 200,
                boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
              }}>
                {themes.map(th => (
                  <button key={th} onClick={() => { setTheme(th); setThemeOpen(false); }} style={{
                    display: "flex", alignItems: "center", gap: 8, width: "100%",
                    padding: "8px 12px", borderRadius: 7, border: "none",
                    background: theme === th ? `${t.accent}20` : "transparent",
                    color: theme === th ? "var(--accent)" : "var(--text)",
                    cursor: "pointer", fontSize: 13, fontWeight: theme === th ? 600 : 400,
                    transition: "all 0.15s",
                  }}>
                    {themeIcons[th]} {th.charAt(0).toUpperCase() + th.slice(1)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mobile menu button */}
        <button onClick={() => setMenuOpen(!menuOpen)} style={{
          display: "none", background: "transparent", border: "none",
          color: "var(--text)", fontSize: 22, cursor: "pointer",
        }} className="mobile-menu-btn">☰</button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{
          background: "var(--bg-card)", borderTop: `1px solid var(--border)`,
          padding: "12px 24px 20px",
        }}>
          {links.map(l => (
            <Link key={l.to} to={l.to} onClick={() => setMenuOpen(false)} style={{
              display: "block", padding: "10px 0", textDecoration: "none",
              color: location.pathname === l.to ? "var(--accent)" : "var(--text)",
              fontWeight: 500, fontSize: 15,
            }}>{l.label}</Link>
          ))}
          <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
            {themes.map(th => (
              <button key={th} onClick={() => { setTheme(th); setMenuOpen(false); }} style={{
                padding: "6px 12px", borderRadius: 7, border: `1px solid var(--border)`,
                background: theme === th ? `${t.accent}20` : "transparent",
                color: theme === th ? "var(--accent)" : "var(--text-muted)",
                cursor: "pointer", fontSize: 12, fontWeight: 500,
              }}>{themeIcons[th]} {th}</button>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 700px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </nav>
  );
}
