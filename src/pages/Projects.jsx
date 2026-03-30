import { useNavigate } from "react-router-dom";

const projects = [
  {
    icon: "🛡️",
    title: "Linux Server Hardening",
    description:
      "Set up a fresh Ubuntu 22.04 server from scratch, applied security best practices: disabled root SSH login, configured UFW firewall rules, enabled fail2ban to block brute force, set up automatic security updates, and created limited user accounts with sudo only where needed.",
    tags: ["Linux", "UFW", "fail2ban", "SSH", "Security"],
    highlights: ["Blocked 100% of root SSH access", "Reduced attack surface by 70%", "Automated patch cycle"],
  },
  {
    icon: "🔄",
    title: "Automated Backup System",
    description:
      "Wrote a Bash script that automatically backs up critical directories to a remote location every night at 2am using cron. Sends an email report on success or failure. Compressed backups with tar, tested full restore procedure.",
    tags: ["Bash", "cron", "rsync", "tar", "Automation"],
    highlights: ["Nightly automated backups", "Email alerts on failure", "Full restore tested"],
  },
  {
    icon: "📡",
    title: "Home Lab Network Setup",
    description:
      "Built a home lab with a router, managed switch, and multiple VMs running different OS environments. Configured VLANs to separate traffic, set up local DNS with Pi-hole, assigned static IPs via DHCP reservation, and documented everything.",
    tags: ["Networking", "VLAN", "DNS", "DHCP", "Pi-hole"],
    highlights: ["3 VLANs configured", "100% local DNS coverage", "Full network documentation"],
  },
  {
    icon: "📊",
    title: "System Monitoring Dashboard",
    description:
      "Deployed a monitoring stack on a local VM: installed Netdata to track CPU, memory, disk, and network in real time. Set up alert thresholds and configured notifications. Also wrote a Python script that logs system stats to a CSV every 5 minutes.",
    tags: ["Netdata", "Python", "Monitoring", "Alerting", "Linux"],
    highlights: ["Real-time metrics", "Custom alert thresholds", "Historical logging"],
  },
  {
    icon: "👥",
    title: "User & Permission Management",
    description:
      "Managed users and groups across a small simulated company environment. Created department-based groups, set up folder permissions with correct ownership, wrote a Bash script to bulk-create users from a CSV file, and enforced password policies.",
    tags: ["Linux", "Bash", "chmod", "chown", "User Management"],
    highlights: ["Bulk user provisioning", "Group-based access control", "Password policy enforced"],
  },
  {
    icon: "🤖",
    title: "Sysadmin Automation Scripts",
    description:
      "Collection of useful Bash and Python scripts written to automate repetitive tasks: disk usage alerts, log rotation, service health checks, and a system info report generator that outputs a clean summary of the server's state.",
    tags: ["Bash", "Python", "Automation", "Scripting"],
    highlights: ["10+ reusable scripts", "Saved hours of manual work", "Documented & reusable"],
  },
];

export default function Projects({ t, theme }) {
  const navigate = useNavigate();
  return (
    <div style={{ paddingTop: 88, paddingBottom: 80 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>

        <div style={{ marginBottom: 48 }}>
          <span style={{
            fontSize: 12, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase",
            color: t.accent, display: "block", marginBottom: 12,
          }}>Portfolio</span>
          <h1 style={{ fontSize: "clamp(30px, 5vw, 48px)", fontWeight: 800, letterSpacing: -1.5, margin: "0 0 16px" }}>
            Projects
          </h1>
          <p style={{ fontSize: 16, color: "var(--text-muted)", maxWidth: 560 }}>
            Real-world sysadmin scenarios I've built, configured, and documented. Each project reflects a skill set I'm actively developing.
          </p>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: 24,
        }}>
          {projects.map(p => (
            <div key={p.title} style={{
              background: "var(--bg-card)",
              border: `1px solid var(--border)`,
              borderRadius: 16, padding: 28,
              display: "flex", flexDirection: "column", gap: 16,
              transition: "all 0.25s",
              cursor: p.title === "Linux Server Hardening" ? "pointer" : "default",
            }}
              onClick={() => { if (p.title === "Linux Server Hardening") navigate("/projects/linux-hardening"); }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = t.accent;
                e.currentTarget.style.boxShadow = `0 8px 32px ${t.accent}18`;
                e.currentTarget.style.transform = "translateY(-3px)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 12, fontSize: 22,
                  background: `${t.accent}18`, display: "flex", alignItems: "center", justifyContent: "center",
                }}>{p.icon}</div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>{p.title}</h3>
                  {p.title === "Linux Server Hardening" && (
                    <span style={{
                      fontSize: 10, fontWeight: 700, letterSpacing: 1.5,
                      textTransform: "uppercase", color: t.accent,
                      background: `${t.accent}18`, padding: "2px 8px",
                      borderRadius: 4, display: "inline-block", marginTop: 4,
                    }}>
                      📖 View Course →
                    </span>
                  )}
                </div>
              </div>

              <p style={{ fontSize: 14, lineHeight: 1.75, color: "var(--text-muted)", margin: 0 }}>
                {p.description}
              </p>

              {/* Highlights */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {p.highlights.map(h => (
                  <div key={h} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text)" }}>
                    <span style={{ color: t.accentSecondary, fontSize: 14 }}>✓</span> {h}
                  </div>
                ))}
              </div>

              {/* Tags */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: "auto" }}>
                {p.tags.map(tag => (
                  <span key={tag} style={{
                    padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600,
                    background: `${t.accent}15`, color: t.accent,
                    border: `1px solid ${t.accent}30`, letterSpacing: 0.3,
                  }}>{tag}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
