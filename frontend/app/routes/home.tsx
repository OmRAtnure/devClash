import { Link } from "react-router";
import { Shield, Zap, Bot, Lock, BarChart, Globe, Sparkles, Heart } from "lucide-react";
export function meta() {
  return [
    { title: "HireX – AI-Powered Hiring Platform" },
    {
      name: "description",
      content:
        "HireX is a next-generation hiring platform with biometric identity verification, real-time assessments, and AI-driven candidate matching.",
    },
  ];
}

const features = [
  {
    icon: <Shield size={32} />,
    title: "Biometric Verification",
    description:
      "ArcFace-powered facial recognition with active liveness detection ensures one identity per account — zero fraud.",
  },
  {
    icon: <Zap size={32} />,
    title: "Real-Time Assessments",
    description:
      "Live coding challenges and AI-proctored skill tests that accurately measure candidate capabilities.",
  },
  {
    icon: <Bot size={32} />,
    title: "AI Candidate Matching",
    description:
      "Intelligent ranking algorithms match the right talent to the right role — instantly.",
  },
  {
    icon: <Lock size={32} />,
    title: "Enterprise Security",
    description:
      "End-to-end encrypted data with SOC 2 compliance. Your hiring data stays private.",
  },
  {
    icon: <BarChart size={32} />,
    title: "Analytics Dashboard",
    description:
      "Deep insights into your talent pipeline with actionable hiring metrics and funnel analysis.",
  },
  {
    icon: <Globe size={32} />,
    title: "Global Talent Pool",
    description:
      "Access thousands of pre-verified candidates from around the world — ready to interview.",
  },
];

export default function Home() {
  return (
    <div style={{ background: "var(--bg-base)", minHeight: "100vh" }}>
      {/* ─── Navbar ─────────────────────────────────────────────── */}
      <nav className="navbar">
        <div className="navbar-inner">
          <Link to="/" className="logo">HireX</Link>
          <ul className="nav-links">
            <li><a href="#features">Features</a></li>
            <li><a href="#about">About</a></li>
          </ul>
          <div className="flex gap-4">
            <Link to="/login" className="btn btn-ghost btn-sm">Sign In</Link>
            <Link to="/signup" className="btn btn-primary btn-sm">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* ─── Hero ────────────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="animate-in" style={{ position: "relative", zIndex: 1 }}>
          <div className="hero-badge">
            <span style={{ display: "inline-flex", alignItems: "center" }}><Sparkles size={14} /></span> Biometric-First Hiring Platform
          </div>
          <h1 className="hero-title">
            Hire Smarter,<br />
            <span className="gradient-text">Verify Faster</span>
          </h1>
          <p className="hero-subtitle">
            The only hiring platform that verifies every candidate's identity with
            bank-grade biometrics — before they even submit a resume.
          </p>
          <div className="hero-cta">
            <Link to="/signup" className="btn btn-primary btn-lg pulse-glow">
              Start for Free →
            </Link>
            <Link to="/login" className="btn btn-outline btn-lg">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Features ────────────────────────────────────────────── */}
      <section id="features" className="features-section">
        <div className="container text-center">
          <p className="section-label">Why HireX?</p>
          <h2 className="section-title">
            Built for the <span className="gradient-text">Modern Recruiter</span>
          </h2>
          <p className="section-subtitle" style={{ margin: "0 auto" }}>
            Every feature is designed to eliminate hiring fraud and reduce
            time-to-hire — without sacrificing candidate experience.
          </p>
          <div className="features-grid">
            {features.map((f) => (
              <div key={f.title} className="feature-card">
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Band ─────────────────────────────────────────────── */}
      <section
        id="about"
        style={{
          padding: "100px 24px",
          textAlign: "center",
          background:
            "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(242,101,34,0.08) 0%, transparent 70%)",
        }}
      >
        <div className="container">
          <h2 className="section-title">
            Ready to transform<br />
            <span className="gradient-text">your hiring process?</span>
          </h2>
          <p
            className="section-subtitle"
            style={{ margin: "16px auto 40px", color: "var(--text-secondary)" }}
          >
            Join companies that trust HireX for secure, verified, AI-assisted hiring.
          </p>
          <Link to="/signup" className="btn btn-primary btn-lg">
            Create Free Account →
          </Link>
        </div>
      </section>

      {/* ─── Footer ───────────────────────────────────────────────── */}
      <footer className="footer">
        <div className="container">
          <p style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>© {new Date().getFullYear()} HireX. Built with <Heart size={14} /> for modern teams.</p>
        </div>
      </footer>
    </div>
  );
}
