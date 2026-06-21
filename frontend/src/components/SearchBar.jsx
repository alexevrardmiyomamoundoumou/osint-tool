const C = {
  surface: "#0b1c12", border: "#0f2e1a", borderActive: "#009e6055",
  green: "#009e60", text: "#c8e6d4", textDim: "#5a8a6a", muted: "#2a4a35",
};

export default function SearchBar({ target, setTarget, onSearch, loading }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
      <div style={{ display:"flex", gap:10 }}>
        <input
          value={target}
          onChange={e => setTarget(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !loading && onSearch()}
          placeholder="domaine, IP ou email cible…"
          style={{
            flex:1, padding:"12px 18px", borderRadius:8,
            background: C.surface, border:`1px solid ${C.borderActive}`,
            color: C.text, fontSize:15, fontFamily:"monospace", outline:"none",
          }}
        />
        <button
          onClick={onSearch}
          disabled={loading || !target.trim()}
          style={{
            padding:"12px 28px", borderRadius:8, border:"none",
            background: loading || !target.trim() ? C.muted : C.green,
            color:"#fff", fontWeight:700, fontSize:14,
            cursor: loading || !target.trim() ? "not-allowed" : "pointer",
            transition:"background .2s", whiteSpace:"nowrap",
          }}
        >
          {loading ? "…" : "Analyser"}
        </button>
      </div>

      {/* suggestions rapides */}
      <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
        {["google.com","github.com","8.8.8.8"].map(s => (
          <button key={s} onClick={() => { setTarget(s); onSearch && onSearch(s); }}
            style={{
              padding:"3px 12px", borderRadius:20, fontSize:12,
              background:"none", border:`1px solid ${C.border}`,
              color: C.textDim, cursor:"pointer", fontFamily:"monospace",
              transition:"border-color .15s, color .15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = C.green; e.currentTarget.style.color = C.green; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textDim; }}
          >{s}</button>
        ))}
      </div>
    </div>
  );
}
