import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router";
import { Building, Briefcase, DollarSign, Handshake, ShieldCheck, ChevronRight, CornerDownRight, CheckCircle2 } from "lucide-react";

export function meta() {
  return [
    { title: "Opportunities – HireX" },
    { name: "description", content: "The global hub for capital, procurement, and strategic alliances." },
  ];
}

const API = "http://localhost:5000";

interface User {
  id: string;
  name: string;
  email: string;
  accountType: string;
  isVerifiedCompany?: boolean;
}

interface Opportunity {
  _id: string;
  pillar: "capital" | "procurement" | "alliance";
  type: string;
  title: string;
  description: string;
  requirements: string[];
  companyId: {
    _id: string;
    companyDetails?: { companyName: string };
    name: string;
    isVerifiedCompany: boolean;
    profile?: { profilePhoto?: string };
  };
  status: string;
  fundingAmount?: number;
  equityOffered?: number;
  valuation?: number;
  dataRoomUrl?: string;
  budget?: number;
  biddingType?: string;
  allianceType?: string;
  synergyTags?: string[];
  createdAt: string;
}

export default function Opportunities() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  
  // UI State
  const [activeTab, setActiveTab] = useState<"capital" | "procurement" | "alliance">("procurement");
  const [showForm, setShowForm] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState<Partial<Opportunity>>({
    pillar: "procurement",
    title: "",
    description: "",
    requirements: [],
  });
  const [reqString, setReqString] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }
    fetchUserAndData(token);
  }, [navigate]);

  async function fetchUserAndData(token: string) {
    try {
      const uRes = await fetch(`${API}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
      if (!uRes.ok) throw new Error();
      const uData = await uRes.json();
      setUser(uData.user);

      const oRes = await fetch(`${API}/api/opportunities`, { headers: { Authorization: `Bearer ${token}` } });
      const oData = await oRes.json();
      setOpportunities(oData.opportunities || []);
      setLoading(false);
    } catch {
      navigate("/login");
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`${API}/api/opportunities`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...formData,
          requirements: reqString.split(",").map(s => s.trim()).filter(Boolean)
        }),
      });

      if (res.ok) {
        setShowForm(false);
        setFormData({ pillar: activeTab, title: "", description: "", requirements: [] });
        setReqString("");
        fetchUserAndData(token);
      }
    } catch (err) {
      console.error(err);
    }
  }

  if (loading) {
    return <div style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}><div className="spinner" /></div>;
  }

  // Filter logic: Users only ever see procurement implicitly from backend.
  // Companies can filter by tab.
  const isCompany = user?.accountType === "company";
  const displayedOpportunities = isCompany 
    ? opportunities.filter(o => o.pillar === activeTab)
    : opportunities;

  return (
    <div style={{ maxWidth: 1040, margin: "0 auto", padding: "40px 24px" }}>
      
      {/* Header Area */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.5px", margin: 0, color: "var(--text-primary)" }}>
            {isCompany ? "Opportunity Network" : "Jobs & Freelance"}
          </h1>
          <p style={{ marginTop: 8, fontSize: 16, color: "var(--text-secondary)", maxWidth: 500, lineHeight: 1.5 }}>
            {isCompany 
              ? "The unified deal room for raising capital, procuring B2B services, and forging strategic alliances."
              : "Discover contract work, internships, and full-time roles from verified companies."}
          </p>
        </div>
        
        {isCompany && (
          <button 
            onClick={() => setShowForm(!showForm)}
            style={{
              background: showForm ? "var(--bg-layer)" : "var(--text-primary)",
              color: showForm ? "var(--text-primary)" : "var(--bg-base)",
              border: "1px solid var(--border)", padding: "10px 24px",
              borderRadius: "32px", fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "all 0.2s"
            }}>
            {showForm ? "Close Portal" : "Create Opportunity"}
          </button>
        )}
      </div>

      {/* Tabs for Companies */}
      {isCompany && !showForm && (
        <div style={{ display: "flex", gap: 16, marginBottom: 32, borderBottom: "1px solid var(--border)", paddingBottom: 16 }}>
          {[
            { id: "capital", icon: <DollarSign size={16}/>, label: "Capital & Equity", desc: "Seed, Series A-C, M&A" },
            { id: "procurement", icon: <Briefcase size={16}/>, label: "B2B Procurement", desc: "Agencies, Freelance, Jobs" },
            { id: "alliance", icon: <Handshake size={16}/>, label: "Strategic Alliances", desc: "Joint Ventures & Partnerships" },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id as any); setFormData(f => ({...f, pillar: tab.id as any})); }}
              style={{
                display: "flex", flexDirection: "column", alignItems: "flex-start",
                padding: "16px 20px", borderRadius: "16px", border: "none", cursor: "pointer",
                background: activeTab === tab.id ? "var(--accent-light)" : "transparent",
                color: activeTab === tab.id ? "var(--accent-from)" : "var(--text-secondary)",
                transition: "all 0.2s", textAlign: "left", width: 220
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 600, fontSize: 15, marginBottom: 4 }}>
                {tab.icon} {tab.label}
              </div>
              <span style={{ fontSize: 12, opacity: 0.8 }}>{tab.desc}</span>
            </button>
          ))}
        </div>
      )}

      {/* Dynamic Creation Wizard */}
      {showForm && isCompany && (
        <div style={{ 
          background: "var(--bg-card)", borderRadius: 24, padding: 32, marginBottom: 40,
          border: "1px solid var(--border)", boxShadow: "0 12px 32px rgba(0,0,0,0.03)"
        }}>
          <h2 style={{ fontSize: 20, marginBottom: 24 }}>New {formData.pillar} opportunity</h2>
          <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            
            <div style={{ display: "flex", gap: 16 }}>
              <select 
                style={{ flex: 1, padding: 12, borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg-base)" }}
                value={formData.pillar} onChange={e => setFormData({...formData, pillar: e.target.value as any})}
              >
                <option value="capital">Capital & Equity</option>
                <option value="procurement">B2B Procurement</option>
                <option value="alliance">Strategic Alliances</option>
              </select>
              
              <input 
                type="text" placeholder="Opportunity Type (e.g. Seed Funding, Job, JV)" required
                style={{ flex: 2, padding: 12, borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg-base)" }}
                value={formData.type || ""} onChange={e => setFormData({...formData, type: e.target.value})}
              />
            </div>

            <input 
              type="text" placeholder="Opportunity Title" required
              style={{ padding: 12, borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg-base)", fontSize: 16, fontWeight: 500 }}
              value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
            />

            <textarea 
              placeholder="Detailed description, expectations, and deliverables..." required rows={4}
              style={{ padding: 16, borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg-base)", resize: "none" }}
              value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
            />

            {/* Dynamic Fields based on Pillar */}
            {formData.pillar === "capital" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, background: "var(--bg-base)", padding: 16, borderRadius: 12 }}>
                <input type="number" placeholder="Funding Amount ($)" style={{ padding: 12, borderRadius: 8, border: "1px solid var(--border)" }}
                  onChange={e => setFormData({...formData, fundingAmount: Number(e.target.value)})} />
                <input type="number" placeholder="Equity Offered (%)" style={{ padding: 12, borderRadius: 8, border: "1px solid var(--border)" }}
                  onChange={e => setFormData({...formData, equityOffered: Number(e.target.value)})} />
                <input type="number" placeholder="Company Valuation ($)" style={{ padding: 12, borderRadius: 8, border: "1px solid var(--border)" }}
                  onChange={e => setFormData({...formData, valuation: Number(e.target.value)})} />
                <input type="url" placeholder="Data Room URL (Secure)" style={{ padding: 12, borderRadius: 8, border: "1px solid var(--border)" }}
                  onChange={e => setFormData({...formData, dataRoomUrl: e.target.value})} />
              </div>
            )}

            {formData.pillar === "procurement" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, background: "var(--bg-base)", padding: 16, borderRadius: 12 }}>
                <input type="number" placeholder="Budget ($) - Optional" style={{ padding: 12, borderRadius: 8, border: "1px solid var(--border)" }}
                  onChange={e => setFormData({...formData, budget: Number(e.target.value)})} />
                <select style={{ padding: 12, borderRadius: 8, border: "1px solid var(--border)", background: "#fff" }}
                  onChange={e => setFormData({...formData, biddingType: e.target.value})}>
                  <option value="">Select Bidding Type</option>
                  <option value="fixed">Fixed Price</option>
                  <option value="milestone">Milestone Based Escrow</option>
                </select>
              </div>
            )}

            {formData.pillar === "alliance" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16, background: "var(--bg-base)", padding: 16, borderRadius: 12 }}>
                <input type="text" placeholder="Partnership Type (e.g. Co-Marketing, API Integration)" style={{ padding: 12, borderRadius: 8, border: "1px solid var(--border)" }}
                  onChange={e => setFormData({...formData, allianceType: e.target.value})} />
              </div>
            )}

            <input 
              type="text" placeholder="Requirements/Tags (comma separated)"
              style={{ padding: 12, borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg-base)" }}
              value={reqString} onChange={e => setReqString(e.target.value)}
            />

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
              <button type="submit" style={{
                background: "var(--accent-from)", color: "#fff", border: "none", padding: "12px 32px",
                borderRadius: "32px", fontSize: 14, fontWeight: 600, cursor: "pointer"
              }}>
                Publish Opportunity
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Feed */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {displayedOpportunities.length === 0 ? (
          <div style={{ padding: 60, textAlign: "center", color: "var(--text-muted)", background: "var(--bg-card)", borderRadius: 24, border: "1px dashed var(--border)" }}>
            <Briefcase size={32} style={{ opacity: 0.2, margin: "0 auto 16px" }} />
            No active opportunities in this category yet.
          </div>
        ) : (
          displayedOpportunities.map((opp) => (
            <div key={opp._id} style={{ 
              background: "var(--bg-card)", borderRadius: 20, padding: 24, border: "1px solid var(--border)",
              transition: "transform 0.2s, box-shadow 0.2s", cursor: "pointer"
            }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.04)"}
            onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: "var(--bg-layer)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", border: "1px solid var(--border)" }}>
                    {opp.companyId.profile?.profilePhoto ? (
                      <img src={opp.companyId.profile.profilePhoto} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : <Building size={20} color="var(--text-secondary)" />}
                  </div>
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 4px", color: "var(--text-primary)" }}>{opp.title}</h3>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text-secondary)" }}>
                      <span style={{ fontWeight: 500, color: "var(--text-primary)" }}>
                        {opp.companyId.companyDetails?.companyName || opp.companyId.name}
                      </span>
                      {opp.companyId.isVerifiedCompany && <CheckCircle2 size={14} color="#3b82f6" />}
                      <span>•</span>
                      <span style={{ textTransform: "capitalize" }}>{opp.type.replace('_', ' ')}</span>
                      <span>•</span>
                      <span>{new Date(opp.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                
                {/* Badges based on Pillar */}
                <div style={{ display: "flex", gap: 8 }}>
                  {opp.fundingAmount && (
                    <span style={{ background: "rgba(16, 185, 129, 0.1)", color: "#10b981", padding: "4px 12px", borderRadius: 16, fontSize: 12, fontWeight: 600 }}>
                      ${(opp.fundingAmount / 1000000).toFixed(1)}M Ask
                    </span>
                  )}
                  {opp.budget && (
                    <span style={{ background: "var(--accent-light)", color: "var(--accent-from)", padding: "4px 12px", borderRadius: 16, fontSize: 12, fontWeight: 600 }}>
                      ${opp.budget.toLocaleString()} Budget
                    </span>
                  )}
                  {opp.allianceType && (
                    <span style={{ background: "rgba(139, 92, 246, 0.1)", color: "#8b5cf6", padding: "4px 12px", borderRadius: 16, fontSize: 12, fontWeight: 600 }}>
                      {opp.allianceType}
                    </span>
                  )}
                </div>
              </div>
              
              <p style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.6, margin: "0 0 20px" }}>
                {opp.description.length > 200 ? opp.description.slice(0, 200) + "..." : opp.description}
              </p>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {opp.requirements.slice(0, 3).map((req, i) => (
                    <span key={i} style={{ 
                      fontSize: 12, padding: "4px 12px", background: "var(--bg-layer)", 
                      borderRadius: 16, color: "var(--text-secondary)", border: "1px solid var(--border)"
                    }}>
                      {req}
                    </span>
                  ))}
                  {opp.requirements.length > 3 && (
                    <span style={{ fontSize: 12, padding: "4px 12px", color: "var(--text-muted)" }}>+{opp.requirements.length - 3} more</span>
                  )}
                </div>
                
                <button style={{
                  background: "transparent", border: "1px solid var(--border)", color: "var(--text-primary)",
                  padding: "6px 16px", borderRadius: "16px", fontSize: 13, fontWeight: 600,
                  display: "flex", alignItems: "center", gap: 6, cursor: "pointer", transition: "all 0.2s"
                }}
                onMouseEnter={e => e.currentTarget.style.background = "var(--bg-layer)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  View Details
                </button>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
