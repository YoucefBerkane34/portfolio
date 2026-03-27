const contacts = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2"/>
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
      </svg>
    ),
    label: "Email",
    value: "YoucefBerkane34@gmail.com",
    href: "mailto:YoucefBerkane34@gmail.com",
    description: "Best for professional inquiries and opportunities",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
      </svg>
    ),
    label: "GitHub",
    value: "github.com/YoucefBerkane34",
    href: "https://github.com/YoucefBerkane34",
    description: "Check out my scripts and projects",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    ),
    label: "LinkedIn",
    value: "linkedin.com/in/youcefberkane34/",
    href: "https://www.linkedin.com/in/youcefberkane34/",
    description: "Connect with me professionally",
  },
];

export default function Contact({ t, theme }) {
  return (
    <div style={{ paddingTop: 88, paddingBottom: 80 }}>
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 24px" }}>

        <div style={{ marginBottom: 48 }}>
          <span style={{
            fontSize: 12, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase",
            color: t.accent, display: "block", marginBottom: 12,
          }}>Contact</span>
          <h1 style={{ fontSize: "clamp(30px, 5vw, 48px)", fontWeight: 800, letterSpacing: -1.5, margin: "0 0 16px" }}>
            Get in touch
          </h1>
          <p style={{ fontSize: 16, lineHeight: 1.8, color: "var(--text-muted)", maxWidth: 500 }}>
            Whether you have an opportunity, a question, or just want to connect — I'm always open to a conversation.
          </p>
        </div>

        {/* Contact cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 56 }}>
          {contacts.map(c => (
            <a key={c.label} href={c.href} target="_blank" rel="noopener noreferrer" style={{
              textDecoration: "none",
              background: "var(--bg-card)",
              border: `1px solid var(--border)`,
              borderRadius: 14, padding: "20px 24px",
              display: "flex", alignItems: "center", gap: 20,
              transition: "all 0.25s", color: "inherit",
            }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = t.accent;
                e.currentTarget.style.boxShadow = `0 6px 24px ${t.accent}20`;
                e.currentTarget.style.transform = "translateX(4px)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.transform = "translateX(0)";
              }}
            >
              <div style={{
                width: 52, height: 52, borderRadius: 12, flexShrink: 0,
                background: `${t.accent}18`, color: t.accent,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>{c.icon}</div>

              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 500, marginBottom: 2 }}>{c.label}</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text)" }}>{c.value}</div>
                <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 3 }}>{c.description}</div>
              </div>

              <div style={{ color: t.accent, fontSize: 20, flexShrink: 0 }}>→</div>
            </a>
          ))}
        </div>

        {/* Availability note */}
        <div style={{
          background: `${t.accent}10`, border: `1px solid ${t.accent}30`,
          borderRadius: 14, padding: "20px 24px",
          display: "flex", alignItems: "center", gap: 14,
        }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#22c55e", flexShrink: 0, animation: "pulse 2s infinite" }} />
          <div>
            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 2 }}>Currently available</div>
            <div style={{ fontSize: 14, color: "var(--text-muted)" }}>
              Open to junior sysadmin roles, internships, and freelance infrastructure work.
            </div>
          </div>
        </div>

        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(34,197,94,0.4); }
            50% { opacity: 0.8; box-shadow: 0 0 0 6px rgba(34,197,94,0); }
          }
        `}</style>
      </div>
    </div>
  );
}
