import { useState } from "react";

const C = {
  surface: "#0b1c12", border: "#0f2e1a",
  green: "#009e60", yellow: "#fcd116", blue: "#3a75c4",
  danger: "#ef4444", text: "#c8e6d4", textDim: "#5a8a6a", muted: "#2a4a35",
};

// ── sous-composants ───────────────────────────────────────────────────────────
const Row = ({ label, value }) => (
  <div style={{ display:"flex", gap:12, alignItems:"flex-start",
    padding:"6px 0", borderBottom:`1px solid ${C.border}` }}>
    <span style={{ color: C.textDim, fontSize:12, minWidth:140,
      fontFamily:"monospace", flexShrink:0 }}>{label}</span>
    <span style={{ color: C.text, fontSize:13, wordBreak:"break-all" }}>
      {value ?? <span style={{ color: C.muted }}>—</span>}
    </span>
  </div>
);

const Pill = ({ v, color = C.green }) => (
  <span style={{
    display:"inline-block", margin:"2px 3px", padding:"3px 10px",
    borderRadius:20, fontSize:12, fontFamily:"monospace",
    background: color + "22", color, border:`1px solid ${color}33`,
  }}>{v}</span>
);

const Section = ({ title, icon, color = C.green, children, empty }) => {
  const [open, setOpen] = useState(true);
  return (
    <div style={{ background: C.surface, border:`1px solid ${C.border}`,
      borderLeft:`3px solid ${color}`, borderRadius:10, overflow:"hidden" }}>
      <div onClick={() => setOpen(o => !o)}
        style={{ display:"flex", alignItems:"center", gap:8, padding:"14px 20px",
          cursor:"pointer", userSelect:"none" }}>
        <span>{icon}</span>
        <span style={{ fontSize:12, fontWeight:600, letterSpacing:".1em",
          textTransform:"uppercase", color, flex:1 }}>{title}</span>
        <span style={{ color: C.textDim, fontSize:12 }}>{open ? "▲" : "▼"}</span>
      </div>
      {open && (
        <div style={{ padding:"4px 20px 18px" }}>
          {empty
            ? <span style={{ color: C.muted, fontSize:13, fontStyle:"italic" }}>Aucun résultat</span>
            : children}
        </div>
      )}
    </div>
  );
};

// ── sections par module ───────────────────────────────────────────────────────
const DnsSection = ({ data }) => {
  if (!data) return null;
  const ips = data.ips ?? [];
  const w   = data.whois ?? {};
  return (
    <Section title="DNS & WHOIS" icon="🌐" color={C.green}
      empty={!ips.length && !w.registrar}>
      {ips.length > 0 && (
        <div style={{ marginBottom:10 }}>
          <div style={{ fontSize:11, color: C.textDim, marginBottom:6,
            textTransform:"uppercase", letterSpacing:".08em" }}>Adresses IP</div>
          <div>{ips.map(ip => <Pill key={ip} v={ip} color={C.green}/>)}</div>
        </div>
      )}
      {w.registrar       && <Row label="Registrar"    value={w.registrar}/>}
      {w.creation_date   && <Row label="Création"     value={w.creation_date}/>}
      {w.expiration_date && <Row label="Expiration"   value={w.expiration_date}/>}
      {Array.isArray(w.name_servers) && w.name_servers.length > 0 &&
        <Row label="Name servers" value={w.name_servers.join(", ")}/>}
      {data.error && <span style={{ color: C.danger, fontSize:13 }}>⚠ {data.error}</span>}
    </Section>
  );
};

const EmailsSection = ({ data }) => {
  if (!data) return null;
  const emails = data.emails ?? [];
  return (
    <Section title="Emails détectés" icon="📧" color={C.yellow} empty={!emails.length}>
      <div style={{ display:"flex", flexWrap:"wrap", marginBottom:8 }}>
        {emails.map(e => <Pill key={e} v={e} color={C.yellow}/>)}
      </div>
      {data.search_url && (
        <a href={data.search_url} target="_blank" rel="noreferrer"
          style={{ fontSize:12, color: C.yellow, textDecoration:"none" }}>
          → Rechercher plus sur Google
        </a>
      )}
    </Section>
  );
};

const ShodanSection = ({ data }) => {
  if (!data) return null;
  const ports = data.ports ?? [];
  return (
    <Section title="Shodan — services exposés" icon="🔍" color={C.blue} empty={!data.ip && !data.error}>
      {data.error && <span style={{ color: C.yellow, fontSize:13 }}>⚠ {data.error}</span>}
      {data.ip      && <Row label="IP"           value={data.ip}/>}
      {data.org     && <Row label="Organisation" value={data.org}/>}
      {data.country && <Row label="Pays"         value={data.country}/>}
      {data.os && data.os !== "N/A" && <Row label="OS" value={data.os}/>}
      {ports.length > 0 && (
        <div style={{ marginTop:8 }}>
          <div style={{ fontSize:11, color: C.textDim, marginBottom:6,
            textTransform:"uppercase", letterSpacing:".08em" }}>Ports ouverts</div>
          <div>{ports.map(p => <Pill key={p} v={p} color={C.blue}/>)}</div>
        </div>
      )}
      {data.hostnames?.length > 0 &&
        <Row label="Hostnames" value={data.hostnames.join(", ")}/>}
    </Section>
  );
};

const SocialSection = ({ data }) => {
  if (!data) return null;
  return (
    <Section title="Réseaux sociaux" icon="👤" color={C.green} empty={!data.linkedin && !data.twitter}>
      {data.linkedin && (
        <div style={{ marginBottom:6 }}>
          <a href={data.linkedin} target="_blank" rel="noreferrer"
            style={{ fontSize:13, color: C.green, textDecoration:"none" }}>
            → LinkedIn
          </a>
        </div>
      )}
      {data.twitter && (
        <div>
          <a href={data.twitter} target="_blank" rel="noreferrer"
            style={{ fontSize:13, color: C.green, textDecoration:"none" }}>
            → Twitter / X
          </a>
        </div>
      )}
      {data.note && <p style={{ color: C.textDim, fontSize:12, marginTop:8 }}>{data.note}</p>}
    </Section>
  );
};

const SearchSection = ({ data }) => {
  if (!data) return null;
  const results = data.results ?? [];
  return (
    <Section title="Google Dorks" icon="🔎" color={C.yellow} empty={!results.length && !data.error}>
      {data.error && <span style={{ color: C.danger, fontSize:13 }}>⚠ {data.error}</span>}
      {results.map((r, i) => (
        <div key={i} style={{ padding:"8px 0", borderBottom:`1px solid ${C.border}` }}>
          <a href={r.url} target="_blank" rel="noreferrer"
            style={{ fontSize:13, color: C.yellow, textDecoration:"none", display:"block", marginBottom:2 }}>
            {r.title}
          </a>
          {r.snippet && <p style={{ margin:0, fontSize:12, color: C.textDim }}>{r.snippet}</p>}
        </div>
      ))}
      {data.dorks_used && (
        <div style={{ marginTop:10 }}>
          <div style={{ fontSize:11, color: C.textDim, marginBottom:6,
            textTransform:"uppercase", letterSpacing:".08em" }}>Dorks utilisés</div>
          {data.dorks_used.map(d => <Pill key={d} v={d} color={C.yellow}/>)}
        </div>
      )}
    </Section>
  );
};

// ── export stats ──────────────────────────────────────────────────────────────
const ExportBar = ({ results, target }) => {
  const exportJson = () => {
    const blob = new Blob([JSON.stringify(results, null, 2)], { type:"application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `osint_${target}_${Date.now()}.json`;
    a.click();
  };
  const [rawOpen, setRawOpen] = useState(false);
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
      <div style={{ display:"flex", gap:8 }}>
        <button onClick={exportJson}
          style={{ padding:"6px 16px", borderRadius:6, border:`1px solid ${C.green}`,
            background:"none", color: C.green, fontSize:12, cursor:"pointer" }}>
          ↓ Exporter JSON
        </button>
        <button onClick={() => setRawOpen(o => !o)}
          style={{ padding:"6px 16px", borderRadius:6, border:`1px solid ${C.border}`,
            background:"none", color: C.textDim, fontSize:12, cursor:"pointer" }}>
          {rawOpen ? "▲ Masquer JSON" : "▼ JSON brut"}
        </button>
      </div>
      {rawOpen && (
        <pre style={{ padding:16, background:"#020a05", border:`1px solid ${C.border}`,
          borderRadius:8, fontSize:12, color: C.green, overflowX:"auto",
          maxHeight:300, overflowY:"auto", margin:0 }}>
          {JSON.stringify(results, null, 2)}
        </pre>
      )}
    </div>
  );
};

// ── composant principal exporté ───────────────────────────────────────────────
export default function ResultsPanel({ results, target }) {
  if (!results) return null;
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <DnsSection    data={results.dns}/>
      <EmailsSection data={results.emails}/>
      <ShodanSection data={results.shodan}/>
      <SocialSection data={results.social}/>
      <SearchSection data={results.search}/>
      <ExportBar results={results} target={target}/>
    </div>
  );
}
