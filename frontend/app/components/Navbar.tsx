import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router";

export default function Navbar() {
  const [user, setUser] = useState<{ name: string; accountType: string; isVerifiedCompany?: boolean } | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Re-check user when location changes
  useEffect(() => {
    const token = localStorage.getItem("token");
    const u = localStorage.getItem("user");
    if (token && u) {
      setUser(JSON.parse(u));
    } else {
      setUser(null);
    }
  }, [location.pathname]);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }

  return (
    <nav style={{ position: "sticky", top: 0, zIndex: 100, background: "#1A1A2E", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px" }}>
        <Link to="/" className="logo" style={{ fontSize: 24, fontWeight: 800, color: "var(--text-primary)", textDecoration: "none" }}>HireX</Link>
        <ul style={{ display: "flex", gap: 32, listStyle: "none", margin: 0, padding: 0 }}>
          <li>
            <Link to="/opportunities" style={{ color: location.pathname === "/opportunities" ? "var(--text-primary)" : "var(--text-secondary)", textDecoration: "none", fontWeight: 500, transition: "color 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.color = "var(--text-primary)"} onMouseLeave={(e) => e.currentTarget.style.color = location.pathname === "/opportunities" ? "var(--text-primary)" : "var(--text-secondary)"}>
              Opportunities
            </Link>
          </li>
          {user && (
            <>
              <li>
                <Link to="/dashboard" style={{ color: location.pathname === "/dashboard" ? "var(--text-primary)" : "var(--text-secondary)", textDecoration: "none", fontWeight: 500, transition: "color 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.color = "var(--text-primary)"} onMouseLeave={(e) => e.currentTarget.style.color = location.pathname === "/dashboard" ? "var(--text-primary)" : "var(--text-secondary)"}>
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/network" style={{ color: location.pathname === "/network" ? "var(--text-primary)" : "var(--text-secondary)", textDecoration: "none", fontWeight: 500, transition: "color 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.color = "var(--text-primary)"} onMouseLeave={(e) => e.currentTarget.style.color = location.pathname === "/network" ? "var(--text-primary)" : "var(--text-secondary)"}>
                  Network
                </Link>
              </li>
            </>
          )}
        </ul>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          {user ? (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginRight: 16, padding: "6px 12px", background: "var(--bg-layer)", borderRadius: 20, border: "1px solid var(--border)" }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{user.name}</span>
                {user.isVerifiedCompany && <span title="Verified Company" style={{ color: "var(--accent-from)", fontSize: 13, fontWeight: 800 }}>✓</span>}
              </div>

              {/* Logout button */}
              <button
                onClick={handleLogout}
                style={{
                  display: "flex", alignItems: "center", gap: 5,
                  padding: "6px 14px", borderRadius: 8,
                  background: "rgba(239,68,68,0.08)",
                  border: "1px solid rgba(239,68,68,0.25)",
                  cursor: "pointer", fontSize: 13, fontWeight: 700,
                  color: "#ef4444", letterSpacing: "0.3px",
                  transition: "all 0.15s", fontFamily: "'Inter', sans-serif",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.18)"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.6)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(239,68,68,0.08)"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.25)"; }}
              >
                ↪ Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Sign In</Link>
              <Link to="/signup" className="btn btn-primary btn-sm">Get Started</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
