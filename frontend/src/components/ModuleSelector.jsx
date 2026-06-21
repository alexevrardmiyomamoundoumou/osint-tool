const C = {
  surface: "#0b1c12", border: "#0f2e1a",
  green: "#009e60", yellow: "#fcd116", blue: "#3a75c4",
  text: "#c8e6d4", textDim: "#5a8a6a", muted: "#2a4a35",
};

const MODULES = [
  { id:"dns",    label:"DNS / WHOIS",  icon:"🌐", color: C.green,  desc:"Enregistrements DNS, WHOIS, IPs" },
  { id:"emails", label:"Emails",       icon:"📧", color: C.yellow, desc:"Emails liés au domaine" },
  { id:"shodan", label:"Shodan",       icon:"🔍", color: C.blue,   desc:"Services et ports exposés" },
  { id:"social", label:"Réseaux soc.", icon:"👤", color: C.green,  desc:"Présence sur les réseaux" },
  { id:"search", label:"Dorks",        icon:"🔎", color: C.yellow, desc:"Google dorks automatiques" },
];

export default function ModuleSelector({ selected, onChange }) {
  const toggle = (id) => {
    if (selected.includes(id)) {
      if (selected.length === 1) return; // garder au moins 1
      onChange(selected.filter(s => s !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  return (
    <div>
      <div style={{ fontSize:11, color: C.textDim, textTransform:"uppercase",
        letterSpacing:".1em", marginBottom:10 }}>Modules actifs</div>
      <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
        {MODULES.map(m => {
          const active = selected.includes(m.id);
          return (
            <button key={m.id} onClick={() => toggle(m.id)}
              title={m.desc}
              style={{
                display:"flex", alignItems:"center", gap:6,
                padding:"7px 14px", borderRadius:8, fontSize:13,
                background: active ? m.color + "22" : "none",
                border:`1px solid ${active ? m.color : C.border}`,
                color: active ? m.color : C.textDim,
                cursor:"pointer", transition:"all .15s",
              }}>
              <span>{m.icon}</span>
              <span>{m.label}</span>
              {active && <span style={{ fontSize:10, opacity:.7 }}>✓</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
