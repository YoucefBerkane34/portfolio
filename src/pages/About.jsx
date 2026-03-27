const skillCategories = [
  {
    icon: "🖥️",
    title: "Systems & Servers",
    skills: ["Linux (Ubuntu, CentOS)", "Windows Server", "VMware / VirtualBox", "Server setup & hardening"],
  },
  {
    icon: "🔐",
    title: "Security",
    skills: ["Firewall configuration", "UFW / iptables", "Security patching", "Threat monitoring", "Access control & permissions"],
  },
  {
    icon: "🌐",
    title: "Networking",
    skills: ["DNS configuration", "DHCP / IP management", "Router & switch setup", "VPN setup", "Troubleshooting connectivity"],
  },
  {
    icon: "⚙️",
    title: "Automation",
    skills: ["Bash scripting", "Python scripting", "Task scheduling (cron)", "Log monitoring scripts"],
  },
  {
    icon: "💾",
    title: "Backups & Storage",
    skills: ["Backup scheduling", "Data recovery", "Disk & filesystem management", "rsync / tar"],
  },
  {
    icon: "📊",
    title: "Monitoring",
    skills: ["CPU / memory / disk monitoring", "Log analysis", "System performance tuning", "Alert setup"],
  },
  {
    icon: "👥",
    title: "User Management",
    skills: ["Account creation & deletion", "Password policies", "Group permissions", "Sudo management"],
  },
  {
    icon: "📝",
    title: "Documentation",
    skills: ["Configuration records", "Runbooks & procedures", "Change management logs"],
  },
];

export default function About({ t, theme }) {
  return (
    <div style={{ paddingTop: 88, paddingBottom: 80 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>

        {/* Header */}
        <div style={{ marginBottom: 56 }}>
          <span style={{
            fontSize: 12, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase",
            color: t.accent, display: "block", marginBottom: 12,
          }}>About me</span>
          <h1 style={{ fontSize: "clamp(30px, 5vw, 48px)", fontWeight: 800, letterSpacing: -1.5, margin: "0 0 20px" }}>
            Who I am
          </h1>
          <p style={{ fontSize: 17, lineHeight: 1.85, color: "var(--text-muted)", maxWidth: 660 }}>
            I'm Youcef Berkane, a beginner system administrator passionate about building and maintaining reliable IT infrastructure. 
            I focus on keeping systems running smoothly, securely, and efficiently — so teams can work without worrying about what's happening behind the scenes.
          </p>
          <p style={{ fontSize: 17, lineHeight: 1.85, color: "var(--text-muted)", maxWidth: 660, marginTop: 16 }}>
            I'm actively building my skills across Linux, networking, security, and automation — learning by doing, building real systems, and solving real problems.
          </p>
        </div>

        {/* Skills grid */}
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 28, letterSpacing: -0.5 }}>What I can do</h2>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 20,
          }}>
            {skillCategories.map(cat => (
              <div key={cat.title} style={{
                background: "var(--bg-card)",
                border: `1px solid var(--border)`,
                borderRadius: 14, padding: 24,
                transition: "all 0.25s",
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = t.accent;
                  e.currentTarget.style.boxShadow = `0 0 24px ${t.accent}20`;
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div style={{ fontSize: 26, marginBottom: 10 }}>{cat.icon}</div>
                <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 12px", color: "var(--text)" }}>{cat.title}</h3>
                <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                  {cat.skills.map(s => (
                    <li key={s} style={{
                      fontSize: 13, color: "var(--text-muted)", padding: "4px 0",
                      borderBottom: `1px solid var(--border)`, display: "flex", alignItems: "center", gap: 8,
                    }}>
                      <span style={{ color: t.accent, fontSize: 10 }}>▶</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
