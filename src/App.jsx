import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import About from "./pages/About";
import Projects from "./pages/Projects";
import Contact from "./pages/Contact";
import LinuxHardeningCourse from "./pages/LinuxHardeningCourse";

const themes = {
  dark: {
    name: "dark",
    bg: "#0a0f1e",
    bgSecondary: "#111827",
    bgCard: "#1a2235",
    text: "#e2e8f0",
    textMuted: "#94a3b8",
    accent: "#38bdf8",
    accentSecondary: "#818cf8",
    border: "#1e3a5f",
    navBg: "rgba(10,15,30,0.85)",
  },
  light: {
    name: "light",
    bg: "#f0f4f8",
    bgSecondary: "#e2e8f0",
    bgCard: "#ffffff",
    text: "#1e293b",
    textMuted: "#64748b",
    accent: "#0ea5e9",
    accentSecondary: "#6366f1",
    border: "#cbd5e1",
    navBg: "rgba(240,244,248,0.85)",
  },
  minimal: {
    name: "minimal",
    bg: "#fafafa",
    bgSecondary: "#f4f4f4",
    bgCard: "#ffffff",
    text: "#111111",
    textMuted: "#666666",
    accent: "#111111",
    accentSecondary: "#555555",
    border: "#e0e0e0",
    navBg: "rgba(250,250,250,0.92)",
  },
  colorful: {
    name: "colorful",
    bg: "#0f0524",
    bgSecondary: "#1a0a3d",
    bgCard: "#1f1050",
    text: "#f0e6ff",
    textMuted: "#c4b5fd",
    accent: "#f472b6",
    accentSecondary: "#34d399",
    border: "#4c1d95",
    navBg: "rgba(15,5,36,0.88)",
  },
};

export default function App() {
  const [theme, setTheme] = useState("dark");
  const t = themes[theme];

  useEffect(() => {
    const root = document.documentElement;
    const th = themes[theme];
    root.style.setProperty("--bg", th.bg);
    root.style.setProperty("--bg-secondary", th.bgSecondary);
    root.style.setProperty("--bg-card", th.bgCard);
    root.style.setProperty("--text", th.text);
    root.style.setProperty("--text-muted", th.textMuted);
    root.style.setProperty("--accent", th.accent);
    root.style.setProperty("--accent2", th.accentSecondary);
    root.style.setProperty("--border", th.border);
    root.style.setProperty("--nav-bg", th.navBg);
    document.body.style.backgroundColor = th.bg;
    document.body.style.color = th.text;
  }, [theme]);

  return (
    <Router>
      <div style={{ minHeight: "100vh", backgroundColor: "var(--bg)", color: "var(--text)", transition: "all 0.4s ease", fontFamily: "'DM Sans', sans-serif" }}>
        <Navbar theme={theme} setTheme={setTheme} themes={Object.keys(themes)} t={t} />
        <Routes>
          <Route path="/" element={<Home t={t} theme={theme} />} />
          <Route path="/about" element={<About t={t} theme={theme} />} />
          <Route path="/projects" element={<Projects t={t} theme={theme} />} />
          <Route path="/contact" element={<Contact t={t} theme={theme} />} />
          <Route path="/projects/linux-hardening" element={<LinuxHardeningCourse t={t} theme={theme} />} />
        </Routes>
      </div>
    </Router>
  );
}
