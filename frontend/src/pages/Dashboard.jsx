import { useState } from "react";
import SearchBar      from "../components/SearchBar";
import ModuleSelector from "../components/ModuleSelector";
import ResultsPanel   from "../components/ResultsPanel";

const API_URL = "http://127.0.0.1:5000";

const C = {
  bg: "#05100a", surface: "#0b1c12", border: "#0f2e1a",
  green: "#009e60", yellow: "#fcd116", blue: "#3a75c4",
  danger: "#ef4444", text: "#c8e6d4", textDim: "#5a8a6a", muted: "#2a4a35",
};

const ModuleBadge = ({ label, status }) => {
  const color = status === "ok" ? C.green : status === "error" ? C.danger : C.yellow;
  return (
    <div style={{ display:"flex", alignItems:"center", gap:6 }}>
      <span style={{ width:7, height:7, borderRadius:"50%", background:color }}/>
      <span style={{ fontSize:12, color: C.textDim }}>{label}</span>
    </div>
  );
};

const Spinner = () => (
  <div style={{ display:"flex", alignItems:"center", gap:10, color: C.green, fontSize:14, padding:"20px 0" }}>
    <svg width="20" height="20" viewBox="0 0 20 20" style={{ animation:"spin 1.2s linear infinite" }}>
      <circle cx="10" cy="10" r="8" fill="none" stroke={C.green}  strokeWidth="2.5" strokeDasharray="14 36" strokeDashoffset="0"/>
      <circle cx="10" cy="10" r="8" fill="none" stroke={C.yellow} strokeWidth="2.5" strokeDasharray="14 36" strokeDashoffset="-17"/>
      <circle cx="10" cy="10" r="8" fill="none" stroke={C.blue}   strokeWidth="2.5" strokeDasharray="14 36" strokeDashoffset="-34"/>
    </svg>
    Analyse en cours…
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>
);

export default function Dashboard() {
  const [target,   setTarget]   = useState("");
  const [modules,  setModules]  = useState(["dns","emails","shodan","social","search"]);
  const [loading,  setLoading]  = useState(false);
  const [results,  setResults]  = useState(null);
  const [error,    setError]    = useState(null);
  const [history,  setHistory]  = useState([]);

  const run = async (forcedTarget) => {
    const t = (forcedTarget ?? target).trim();
    if (!t) return;
    setLoading(true); setError(null); setResults(null);
    try {
      const res = await fetch(`${API_URL}/api/recon`, {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ target: t, modules }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setResults(data);
      setHistory(h => [{ target: t, ts: new Date().toLocaleTimeString() }, ...h.slice(0,9)]);
    } catch(e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const moduleStatus = results ? {
    dns:    results.dns?.error    ? "error" : results.dns    ? "ok" : "idle",
    emails: results.emails?.error ? "error" : results.emails ? "ok" : "idle",
    shodan: results.shodan?.error ? "warn"  : results.shodan ? "ok" : "idle",
    social: results.social?.error ? "warn"  : results.social ? "ok" : "idle",
    search: results.search?.error ? "warn"  : results.search ? "ok" : "idle",
  } : {};

  return (
    <div style={{ minHeight:"100vh", background: C.bg, color: C.text,
      fontFamily:"'Inter', system-ui, sans-serif", padding:"32px 24px" }}>

      {/* header */}
      <div style={{ maxWidth:960, margin:"0 auto 28px" }}>
        <div style={{ display:"flex", height:4, borderRadius:2, overflow:"hidden", width:56, marginBottom:10 }}>
          <div style={{ flex:1, background: C.green }}/>
          <div style={{ flex:1, background: C.yellow }}/>
          <div style={{ flex:1, background: C.blue }}/>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:4 }}>
          <span style={{ fontSize:24, fontWeight:700, letterSpacing:"-.02em",
            background:`linear-gradient(90deg,${C.green},${C.yellow},${C.blue})`,
            WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
            OSINT
          </span>
          <span style={{ fontSize:11, padding:"2px 8px", borderRadius:4, fontFamily:"monospace",
            background: C.green+"22", color: C.green, border:`1px solid ${C.green}44` }}>v1.0</span>
          <span style={{ fontSize:11, padding:"2px 8px", borderRadius:4, fontFamily:"monospace",
            background: C.yellow+"22", color: C.yellow, border:`1px solid ${C.yellow}44` }}>dev</span>
        </div>
        <p style={{ color: C.textDim, fontSize:13, margin:0 }}>
          Reconnaissance passive — sources publiques uniquement
        </p>
      </div>

      {/* layout principal */}
      <div style={{ maxWidth:960, margin:"0 auto", display:"flex", gap:24, alignItems:"flex-start" }}>

        {/* colonne gauche */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", gap:16 }}>

          {/* search */}
          <SearchBar target={target} setTarget={setTarget} onSearch={run} loading={loading}/>

          {/* module selector */}
          <ModuleSelector selected={modules} onChange={setModules}/>

          {/* status badges après recherche */}
          {results && (
            <div style={{ display:"flex", gap:16, flexWrap:"wrap", paddingLeft:2 }}>
              {Object.entries(moduleStatus).map(([k, v]) =>
                <ModuleBadge key={k} label={k} status={v}/>
              )}
            </div>
          )}

          {/* résultats */}
          {loading && <Spinner/>}
          {error && (
            <div style={{ padding:14, background:"#1a0505",
              border:`1px solid ${C.danger}44`, borderRadius:8, color: C.danger, fontSize:14 }}>
              ⚠ {error}
            </div>
          )}
          {results && <ResultsPanel results={results} target={target}/>}
          {!loading && !results && !error && (
            <div style={{ color: C.muted, fontSize:14, padding:"48px 0", textAlign:"center" }}>
              Saisis une cible et lance l'analyse
            </div>
          )}
        </div>

        {/* sidebar historique */}
        {history.length > 0 && (
          <div style={{ width:190, flexShrink:0 }}>
            <div style={{ fontSize:11, color: C.textDim, textTransform:"uppercase",
              letterSpacing:".1em", marginBottom:10 }}>Historique</div>
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              {history.map((h, i) => (
                <div key={i} onClick={() => setTarget(h.target)}
                  style={{ padding:"8px 12px", background: C.surface,
                    border:`1px solid ${C.border}`, borderRadius:6,
                    cursor:"pointer", transition:"border-color .15s" }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = C.green}
                  onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>
                  <div style={{ fontSize:12, color: C.text, fontFamily:"monospace",
                    overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                    {h.target}
                  </div>
                  <div style={{ fontSize:11, color: C.muted, marginTop:2 }}>{h.ts}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* footer */}
      <div style={{ maxWidth:960, margin:"40px auto 0",
        display:"flex", height:3, borderRadius:2, overflow:"hidden" }}>
        <div style={{ flex:1, background: C.green }}/>
        <div style={{ flex:1, background: C.yellow }}/>
        <div style={{ flex:1, background: C.blue }}/>
      </div>
    </div>
  );
}
