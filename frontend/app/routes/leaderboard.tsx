import { useEffect, useState } from "react";
import { Link } from "react-router";

export function meta() {
  return [{ title: "Leaderboard – HireX" }];
}

const API = "http://localhost:5000";

export default function Leaderboard() {
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'global' | 'city' | 'fastest'>('global');
  const [cityFilter, setCityFilter] = useState("Pune");

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  async function fetchLeaderboard() {
    try {
      const res = await fetch(`${API}/api/rewards/leaderboard`);
      const body = await res.json();
      if (body.success) setData(body);
    } catch(e) {}
  }

  if (!data) return <div style={{ padding: 40, textAlign: "center" }}>Loading...</div>;

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 24px" }}>
      <h1 style={{ margin: "0 0 8px", fontSize: 32, fontWeight: 800 }}>Leaderboards</h1>
      <p style={{ color: "var(--text-secondary)", marginBottom: 32 }}>Top referrers and the fastest 1,000 verified users.</p>

      <div className="glass-card" style={{ overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
             <thead>
               <tr style={{ background: "var(--bg-base)", textAlign: "left", fontSize: 13, color: "var(--text-muted)", textTransform: "uppercase" }}>
                 <th style={{ padding: "16px 24px", width: 60 }}>Rank</th>
                 <th style={{ padding: "16px 24px" }}>User</th>
                 <th style={{ padding: "16px 24px" }}>Location</th>
                 <th style={{ padding: "16px 24px" }}>Badges</th>
                 <th style={{ padding: "16px 24px", textAlign: "right" }}>Referrals</th>
               </tr>
             </thead>
             <tbody>
               {data.globalReferrers.map((u: any, i: number) => (
                 <tr key={u._id} style={{ borderBottom: "1px solid var(--border)" }}>
                   <td style={{ padding: "16px 24px", fontWeight: 700, fontSize: 16 }}>#{i + 1}</td>
                   <td style={{ padding: "16px 24px", fontWeight: 600 }}>
                     <Link to={`/profile/${u._id}`} style={{ textDecoration: "none", color: "var(--text-primary)" }}>{u.name}</Link>
                   </td>
                   <td style={{ padding: "16px 24px", color: "var(--text-secondary)", fontSize: 14 }}>{u.profile?.location || "Unknown"}</td>
                   <td style={{ padding: "16px 24px" }}>
                     <div style={{ display: "flex", gap: 4 }}>
                       {u.milestoneBadges?.map((b: string) => (
                         <span key={b} style={{ fontSize: 11, background: "var(--accent-from)", color: "white", padding: "2px 8px", borderRadius: 99, fontWeight: 600 }}>{b}</span>
                       ))}
                     </div>
                   </td>
                   <td style={{ padding: "16px 24px", textAlign: "right", fontWeight: 800, color: "var(--accent-from)" }}>
                     {u.referralCount}
                   </td>
                 </tr>
               ))}
               {data.globalReferrers.length === 0 && (
                 <tr><td colSpan={5} style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>No referrers found.</td></tr>
               )}
             </tbody>
          </table>
      </div>
    </div>
  );
}
