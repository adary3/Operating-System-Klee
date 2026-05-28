import { useState, useEffect, useRef } from "react";

const SUPABASE_URL = "https://ggrgdegdgpquqntzvrqp.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdncmdkZWdkZ3BxdXFudHp2cnFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5NjAwMjksImV4cCI6MjA5NTUzNjAyOX0.NafgBu0mbwyXD9X8AoFlQaRCFcYUqiGEcaDO2LfyAcY";

const sb = async (table, method = "GET", body = null, filter = "") => {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}${filter}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_KEY,
      "Authorization": `Bearer ${SUPABASE_KEY}`,
      "Prefer": method === "POST" ? "return=representation" : "",
    },
    body: body ? JSON.stringify(body) : null,
  });
  if (!res.ok) return null;
  try { return await res.json(); } catch { return null; }
};

const C = {
  bg: "#0A0A0A", surface: "#111111", surface2: "#181818",
  border: "#1E1E1E", borderLit: "#2A2A2A",
  lime: "#C6F135", limeGlow: "rgba(198,241,53,0.08)",
  white: "#F5F5F5", gray: "#666666", grayLight: "#BBBBBB",
  red: "#E24B4A", yellow: "#EF9F27", green: "#1D9E75",
};

const SEED_PROJECTS = [
  { id: "p1", name: "KleeOnAI — Portfolio & Landing", url: "https://kleeonai.com", stack: "Cloudflare Pages", status: "live", notes: "Main portfolio and landing page. Story, work, books, contact. The face of KleeOnAI.", category: "web" },
  { id: "p2", name: "The Clarity Engine + Prompt Audit", url: "https://inex-40h.pages.dev", stack: "Cloudflare Pages", status: "live", notes: "22 questions that force you to say what you actually want. AI synthesizes what you can't articulate. Includes Prompt Audit tool.", category: "tool" },
  { id: "p3", name: "The Clarity Engine (Standalone)", url: "https://kleeonaiengine.netlify.app", stack: "Netlify", status: "live", notes: "Standalone version. Free, no login, no data stored. 10 minutes to know yourself better.", category: "tool" },
  { id: "p4", name: "Content Engine", url: "https://klee-on-ai-content-engine-replit-1-zip--kleeonai.replit.app", stack: "Replit", status: "live", notes: "5-step engine to turn one raw thought into something worth posting on X and LinkedIn.", category: "tool" },
  { id: "p5", name: "The Atlas — Pan-African Resource Directory", url: "https://atlaskleeon.netlify.app", stack: "Netlify", status: "live", notes: "Every tool, platform, and resource an African builder needs to go digital. 53 resources curated. Free.", category: "tool" },
  { id: "p6", name: "KleeOnAI Automation Dashboard", url: "https://kleeonai-applic.vercel.app", stack: "React · Vercel", status: "waiting for key", notes: "Three AI tools — content pipeline, task automator, career advisor. Powered by Claude.", category: "tool" },
  { id: "p7", name: "Career Roadmap Generator", url: "https://klee-on-ai-roadmap.vercel.app", stack: "React · Vercel · Serverless", status: "live", notes: "Personalized 9-month career roadmap for African students. Specific, honest, actionable.", category: "tool" },
  { id: "p8", name: "KleeOnAI OS", url: "", stack: "React · Supabase · Vercel", status: "in progress", notes: "Personal command center. Projects, build log, ideas, opportunities, notes. Cross-device via Supabase.", category: "tool" },
  { id: "p9", name: "Kleeopedia — African Opportunity Board", url: "", stack: "React · Supabase", status: "planned", notes: "AI-curated opportunity board for African students. Scholarships, fellowships, remote jobs, accelerators. Waiting on API key.", category: "tool" },
  { id: "b1", name: "AI Beyond the Exam", url: "https://selar.com/m/abakar-ahmat-oumar1", stack: "PDF · Ebook", status: "live", notes: "Using AI to build careers, not just pass exams. The alternative nobody wrote. Free.", category: "book" },
  { id: "b2", name: "Equanimity", url: "https://selar.com/m/abakar-ahmat-oumar1", stack: "PDF · Ebook", status: "live", notes: "Not a tools list. A book about how to think — then how to build. Paid.", category: "book" },
  { id: "b3", name: "The African AI Playbook", url: "https://selar.com/m/abakar-ahmat-oumar1", stack: "PDF · Ebook", status: "live", notes: "The tools are already here. I needed to actually use them — not just know they exist. Paid.", category: "book" },
  { id: "b4", name: "Whispers of Mirth", url: "", stack: "PDF · Ebook", status: "planned", notes: "Book IV · 33 Dispatches · 2026. You were never the point. It's not for you. Read it anyway. Coming Soon.", category: "book" },
];

const STATUSES = { live: C.lime, "waiting for key": C.yellow, "in progress": "#4A9EE2", planned: C.gray };
const PRIORITY = { high: C.red, medium: C.yellow, low: C.green };

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2);
const fmt = (d) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
const daysLeft = (d) => Math.ceil((new Date(d) - new Date()) / 86400000);

// Local fallback
const local = {
  get: (k, fb = []) => { try { const v = localStorage.getItem("kos_" + k); return v ? JSON.parse(v) : fb; } catch { return fb; } },
  set: (k, v) => localStorage.setItem("kos_" + k, JSON.stringify(v)),
};

const Logo = ({ size = 30 }) => (
  <div style={{ width: size, height: size, borderRadius: "50%", background: C.limeGlow, border: `1px solid ${C.lime}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
    <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="6.5" stroke={C.lime} strokeWidth="1.3" />
      <circle cx="9" cy="9" r="2.5" stroke={C.lime} strokeWidth="1.3" />
      <line x1="9" y1="2.5" x2="9" y2="15.5" stroke={C.lime} strokeWidth="0.9" strokeDasharray="1.5 2" />
      <line x1="2.5" y1="9" x2="15.5" y2="9" stroke={C.lime} strokeWidth="0.9" strokeDasharray="1.5 2" />
    </svg>
  </div>
);

const Pill = ({ label, color }) => (
  <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, fontWeight: 500, letterSpacing: "0.04em", background: color + "18", color, border: `1px solid ${color}33` }}>{label.toUpperCase()}</span>
);

const iStyle = { width: "100%", background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 8, color: C.white, fontSize: 13, fontFamily: "inherit", padding: "9px 12px", outline: "none", boxSizing: "border-box", transition: "border-color 0.15s" };

const Input = ({ value, onChange, placeholder, type = "text", style = {}, onKeyDown }) => (
  <input type={type} value={value} onChange={onChange} placeholder={placeholder} onKeyDown={onKeyDown}
    onFocus={e => e.target.style.borderColor = C.lime} onBlur={e => e.target.style.borderColor = C.border}
    style={{ ...iStyle, ...style }} />
);

const Textarea = ({ value, onChange, placeholder, rows = 3 }) => (
  <textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows}
    onFocus={e => e.target.style.borderColor = C.lime} onBlur={e => e.target.style.borderColor = C.border}
    style={{ ...iStyle, resize: "vertical" }} />
);

const Select = ({ value, onChange, options }) => (
  <select value={value} onChange={onChange} style={{ ...iStyle }}>
    {options.map(o => <option key={o} value={o}>{o}</option>)}
  </select>
);

const Btn = ({ children, onClick, variant = "primary", style = {} }) => (
  <button onClick={onClick} style={{
    padding: "9px 16px", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer", transition: "all 0.15s", fontFamily: "inherit",
    ...(variant === "primary" ? { background: C.lime, color: C.bg, border: "none" } : {}),
    ...(variant === "ghost" ? { background: "transparent", color: C.gray, border: `1px solid ${C.border}` } : {}),
    ...(variant === "danger" ? { background: "transparent", color: C.red, border: `1px solid ${C.red}33` } : {}),
    ...style,
  }}>{children}</button>
);

const SLabel = ({ children }) => <div style={{ fontSize: 11, color: C.gray, textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: 500, marginBottom: 6 }}>{children}</div>;
const Card = ({ children, style = {} }) => <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "1rem 1.15rem", marginBottom: 8, ...style }}>{children}</div>;
const Empty = ({ icon, text }) => <div style={{ textAlign: "center", padding: "3rem 1rem", color: C.gray }}><div style={{ fontSize: 26, marginBottom: 8 }}>{icon}</div><div style={{ fontSize: 13 }}>{text}</div></div>;
const FF = ({ label, children }) => <div style={{ marginBottom: 12 }}><SLabel>{label}</SLabel>{children}</div>;
const FRow = ({ children }) => <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>{children}</div>;

const Modal = ({ title, onClose, children }) => (
  <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: "1rem" }}>
    <div style={{ background: C.surface, border: `1px solid ${C.borderLit}`, borderRadius: 14, padding: "1.5rem", width: "100%", maxWidth: 500, maxHeight: "90vh", overflowY: "auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: C.white }}>{title}</div>
        <button onClick={onClose} style={{ background: "none", border: "none", color: C.gray, cursor: "pointer", fontSize: 20 }}>×</button>
      </div>
      {children}
    </div>
  </div>
);

// ── HOME ─────────────────────────────────────────────────────
function Home({ setActive, projects }) {
  const ideas = local.get("ideas").filter(i => i.status !== "killed");
  const logs = local.get("buildlog");
  const opps = local.get("opps");
  const urgent = opps.filter(o => o.deadline && daysLeft(o.deadline) <= 7 && daysLeft(o.deadline) > 0);
  const liveCount = projects.filter(p => p.status === "live").length;
  const lastLog = logs[0];
  const topIdea = ideas.find(i => i.priority === "high") || ideas[0];

  const exportAll = () => {
    const data = { projects, ideas, buildlog: logs, opportunities: opps, exported: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = `kleeonai-os-${Date.now()}.json`; a.click();
  };

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ fontSize: 11, color: C.lime, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 5 }}>KleeOnAI OS</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: C.white, lineHeight: 1.2, marginBottom: 3 }}>Good to have you back.</div>
        <div style={{ fontSize: 13, color: C.gray }}>Here's where everything stands.</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 7, marginBottom: "1.25rem" }}>
        {[["Projects", projects.length, C.lime], ["Live", liveCount, C.green], ["Ideas", ideas.length, "#4A9EE2"], ["Logs", logs.length, C.yellow]].map(([l, v, c]) => (
          <div key={l} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 12px", borderTop: `2px solid ${c}` }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: C.white }}>{v}</div>
            <div style={{ fontSize: 11, color: C.gray, marginTop: 2 }}>{l}</div>
          </div>
        ))}
      </div>

      {urgent.length > 0 && (
        <Card style={{ borderColor: C.red + "44", background: C.red + "08", marginBottom: "1rem" }}>
          <div style={{ fontSize: 11, color: C.red, fontWeight: 500, letterSpacing: "0.06em", marginBottom: 8 }}>⚡ CLOSING THIS WEEK</div>
          {urgent.map(o => (
            <div key={o.id} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: `1px solid ${C.border}`, fontSize: 13 }}>
              <span style={{ color: C.white }}>{o.title}</span>
              <span style={{ color: C.red, fontWeight: 500 }}>{daysLeft(o.deadline)}d left</span>
            </div>
          ))}
        </Card>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: "1rem" }}>
        {lastLog && (
          <Card onClick={() => setActive("buildlog")} style={{ cursor: "pointer" }}>
            <div style={{ fontSize: 11, color: C.gray, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>Last session</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: C.white, marginBottom: 3 }}>{lastLog.project || "General"}</div>
            <div style={{ fontSize: 12, color: C.gray, lineHeight: 1.5 }}>{lastLog.built?.slice(0, 70)}…</div>
          </Card>
        )}
        {topIdea && (
          <Card onClick={() => setActive("ideas")} style={{ cursor: "pointer" }}>
            <div style={{ fontSize: 11, color: C.gray, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>Top idea</div>
            <div style={{ fontSize: 13, color: C.white, lineHeight: 1.6 }}>{topIdea.text}</div>
            <div style={{ marginTop: 6 }}><Pill label={topIdea.priority} color={PRIORITY[topIdea.priority]} /></div>
          </Card>
        )}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <Btn variant="ghost" onClick={exportAll} style={{ flex: 1 }}>Export backup →</Btn>
        <Btn variant="ghost" onClick={() => setActive("projects")} style={{ flex: 1 }}>All projects →</Btn>
      </div>
    </div>
  );
}

// ── PROJECTS ──────────────────────────────────────────────────
function Projects({ projects, setProjects, syncing }) {
  const [modal, setModal] = useState(false);
  const [filter, setFilter] = useState("all");
  const [form, setForm] = useState({ name: "", url: "", stack: "", status: "in progress", notes: "", category: "tool" });

  const save = async () => {
    if (!form.name.trim()) return;
    const item = { ...form, id: uid(), date: new Date().toISOString() };
    const updated = [item, ...projects];
    setProjects(updated);
    await sb("kos_projects", "POST", item);
    setModal(false); setForm({ name: "", url: "", stack: "", status: "in progress", notes: "", category: "tool" });
  };

  const remove = async (id) => {
    setProjects(projects.filter(p => p.id !== id));
    await sb("kos_projects", "DELETE", null, `?id=eq.${id}`);
  };

  const cats = ["all", "tool", "book", "web"];
  const filtered = filter === "all" ? projects : projects.filter(p => p.category === filter);
  const stats = Object.fromEntries(Object.keys(STATUSES).map(s => [s, projects.filter(p => p.status === s).length]));

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.1rem" }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 600, color: C.white }}>Projects</div>
          <div style={{ fontSize: 12, color: C.gray, marginTop: 2 }}>{projects.length} total · {stats.live || 0} live {syncing && "· syncing…"}</div>
        </div>
        <Btn onClick={() => setModal(true)}>+ Add</Btn>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 7, marginBottom: "1rem" }}>
        {Object.entries(STATUSES).map(([s, c]) => (
          <div key={s} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "9px 10px", borderTop: `2px solid ${c}` }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: C.white }}>{stats[s] || 0}</div>
            <div style={{ fontSize: 10, color: C.gray, textTransform: "capitalize", marginTop: 1 }}>{s}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: "1rem", flexWrap: "wrap" }}>
        {cats.map(c => (
          <span key={c} onClick={() => setFilter(c)} style={{ fontSize: 12, padding: "4px 12px", borderRadius: 20, cursor: "pointer", border: `1px solid ${filter === c ? C.lime : C.border}`, background: filter === c ? C.limeGlow : "transparent", color: filter === c ? C.lime : C.gray }}>{c}</span>
        ))}
      </div>

      {filtered.map(p => (
        <Card key={p.id}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 6 }}>
            <div style={{ flex: 1, paddingRight: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: C.white, marginBottom: 5 }}>{p.name}</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                <Pill label={p.status} color={STATUSES[p.status]} />
                {p.category && <Pill label={p.category} color={C.gray} />}
                {p.stack && <span style={{ fontSize: 11, color: C.gray }}>{p.stack}</span>}
              </div>
            </div>
            <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
              {p.url && <a href={p.url} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: C.lime, textDecoration: "none" }}>↗</a>}
              <Btn variant="danger" onClick={() => remove(p.id)} style={{ padding: "3px 9px", fontSize: 11 }}>×</Btn>
            </div>
          </div>
          {p.notes && <div style={{ fontSize: 12, color: C.gray, lineHeight: 1.6, borderTop: `1px solid ${C.border}`, paddingTop: 7 }}>{p.notes}</div>}
        </Card>
      ))}

      {modal && (
        <Modal title="Add project" onClose={() => setModal(false)}>
          <FRow>
            <FF label="Name"><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Project name" /></FF>
            <FF label="URL"><Input value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} placeholder="https://..." /></FF>
          </FRow>
          <FRow>
            <FF label="Stack"><Input value={form.stack} onChange={e => setForm({ ...form, stack: e.target.value })} placeholder="React · Vercel" /></FF>
            <FF label="Category"><Select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} options={["tool", "book", "web", "other"]} /></FF>
          </FRow>
          <FF label="Status"><Select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} options={Object.keys(STATUSES)} /></FF>
          <FF label="Description"><Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="What does this do?" /></FF>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <Btn variant="ghost" onClick={() => setModal(false)}>Cancel</Btn>
            <Btn onClick={save}>Save</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── BUILD LOG ─────────────────────────────────────────────────
function BuildLog() {
  const [items, setItems] = useState(() => local.get("buildlog"));
  const [modal, setModal] = useState(false);
  const [quick, setQuick] = useState("");
  const [form, setForm] = useState({ project: "", built: "", broke: "", learned: "", mood: "focused" });
  const MOODS = { focused: "🎯", frustrated: "😤", proud: "🔥", confused: "🌀", flow: "⚡" };

  useEffect(() => { local.set("buildlog", items); }, [items]);

  const addQuick = () => {
    if (!quick.trim()) return;
    setItems([{ id: uid(), project: "", built: quick, broke: "", learned: "", mood: "focused", date: Date.now() }, ...items]);
    setQuick("");
  };

  const save = () => {
    if (!form.built.trim()) return;
    setItems([{ ...form, id: uid(), date: Date.now() }, ...items]);
    setModal(false); setForm({ project: "", built: "", broke: "", learned: "", mood: "focused" });
  };

  const copyAsPost = (e) => {
    const t = `Built: ${e.built}${e.broke ? `\nStruggled: ${e.broke}` : ""}${e.learned ? `\nLearned: ${e.learned}` : ""}\n\n#BuildInPublic #KleeOnAI`;
    navigator.clipboard.writeText(t);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 600, color: C.white }}>Build Log</div>
          <div style={{ fontSize: 12, color: C.gray, marginTop: 2 }}>{items.length} sessions</div>
        </div>
        <Btn onClick={() => setModal(true)}>+ Full log</Btn>
      </div>

      <Card style={{ marginBottom: "1.1rem" }}>
        <SLabel>Quick log</SLabel>
        <div style={{ display: "flex", gap: 8 }}>
          <Input value={quick} onChange={e => setQuick(e.target.value)} placeholder="What did you just build?" onKeyDown={e => e.key === "Enter" && addQuick()} />
          <Btn onClick={addQuick} style={{ flexShrink: 0 }}>→</Btn>
        </div>
      </Card>

      {items.length === 0 ? <Empty icon="◎" text="Log every session. This becomes your portfolio." /> : items.map(e => (
        <Card key={e.id}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ fontSize: 16 }}>{MOODS[e.mood] || "🎯"}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: C.white }}>{e.project || "General"}</div>
                <div style={{ fontSize: 11, color: C.gray }}>{fmt(e.date)}</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <Btn variant="ghost" onClick={() => copyAsPost(e)} style={{ padding: "3px 9px", fontSize: 11 }}>Copy</Btn>
              <Btn variant="danger" onClick={() => setItems(items.filter(i => i.id !== e.id))} style={{ padding: "3px 9px", fontSize: 11 }}>×</Btn>
            </div>
          </div>
          {e.built && <div style={{ marginBottom: 5 }}><div style={{ fontSize: 10, color: C.lime, fontWeight: 500, marginBottom: 2, textTransform: "uppercase" }}>Built</div><div style={{ fontSize: 12, color: C.grayLight, lineHeight: 1.6 }}>{e.built}</div></div>}
          {e.broke && <div style={{ marginBottom: 5 }}><div style={{ fontSize: 10, color: C.red, fontWeight: 500, marginBottom: 2, textTransform: "uppercase" }}>Broke</div><div style={{ fontSize: 12, color: C.grayLight, lineHeight: 1.6 }}>{e.broke}</div></div>}
          {e.learned && <div><div style={{ fontSize: 10, color: C.yellow, fontWeight: 500, marginBottom: 2, textTransform: "uppercase" }}>Learned</div><div style={{ fontSize: 12, color: C.grayLight, lineHeight: 1.6 }}>{e.learned}</div></div>}
        </Card>
      ))}

      {modal && (
        <Modal title="Log session" onClose={() => setModal(false)}>
          <FRow>
            <FF label="Project"><Input value={form.project} onChange={e => setForm({ ...form, project: e.target.value })} placeholder="KleeOnAI OS" /></FF>
            <FF label="Mood"><Select value={form.mood} onChange={e => setForm({ ...form, mood: e.target.value })} options={Object.keys(MOODS)} /></FF>
          </FRow>
          <FF label="What did you build?"><Textarea value={form.built} onChange={e => setForm({ ...form, built: e.target.value })} placeholder="Built the Supabase sync layer..." /></FF>
          <FF label="What broke?"><Textarea value={form.broke} onChange={e => setForm({ ...form, broke: e.target.value })} placeholder="Row-level security was blocking inserts..." /></FF>
          <FF label="What did you learn?"><Textarea value={form.learned} onChange={e => setForm({ ...form, learned: e.target.value })} placeholder="Always check RLS policies first..." /></FF>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <Btn variant="ghost" onClick={() => setModal(false)}>Cancel</Btn>
            <Btn onClick={save}>Save</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── IDEAS ─────────────────────────────────────────────────────
function IdeaQueue() {
  const [items, setItems] = useState(() => local.get("ideas"));
  const [input, setInput] = useState("");
  const [priority, setPriority] = useState("medium");
  const STATUS_C = { raw: C.gray, thinking: C.yellow, building: "#4A9EE2", shipped: C.lime, killed: C.red };

  useEffect(() => { local.set("ideas", items); }, [items]);

  const add = () => {
    if (!input.trim()) return;
    setItems([{ id: uid(), text: input, priority, date: Date.now(), status: "raw" }, ...items]);
    setInput("");
  };

  const cycle = (id) => {
    const s = ["raw", "thinking", "building", "shipped", "killed"];
    setItems(items.map(i => i.id === id ? { ...i, status: s[(s.indexOf(i.status) + 1) % s.length] } : i));
  };

  return (
    <div>
      <div style={{ fontSize: 18, fontWeight: 600, color: C.white, marginBottom: 3 }}>Idea Queue</div>
      <div style={{ fontSize: 12, color: C.gray, marginBottom: "1.1rem" }}>{items.filter(i => i.status !== "killed").length} active</div>

      <Card style={{ marginBottom: "1.1rem" }}>
        <SLabel>Drop an idea</SLabel>
        <Input value={input} onChange={e => setInput(e.target.value)} placeholder="What's in your head?" style={{ marginBottom: 10 }} onKeyDown={e => e.key === "Enter" && add()} />
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {Object.keys(PRIORITY).map(p => (
            <span key={p} onClick={() => setPriority(p)} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 20, cursor: "pointer", border: `1px solid ${priority === p ? PRIORITY[p] : C.border}`, background: priority === p ? PRIORITY[p] + "18" : "transparent", color: priority === p ? PRIORITY[p] : C.gray }}>{p}</span>
          ))}
          <Btn onClick={add} style={{ marginLeft: "auto" }}>Add →</Btn>
        </div>
      </Card>

      {items.length === 0 ? <Empty icon="✦" text="Your idea queue is empty." /> : items.map(idea => (
        <Card key={idea.id} style={{ opacity: idea.status === "killed" ? 0.4 : 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ flex: 1, paddingRight: 10 }}>
              <div style={{ fontSize: 13, color: idea.status === "killed" ? C.gray : C.white, lineHeight: 1.6, textDecoration: idea.status === "killed" ? "line-through" : "none" }}>{idea.text}</div>
              <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                <span onClick={() => cycle(idea.id)} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, cursor: "pointer", border: `1px solid ${STATUS_C[idea.status]}33`, background: STATUS_C[idea.status] + "18", color: STATUS_C[idea.status], fontWeight: 500 }}>{idea.status.toUpperCase()}</span>
                <Pill label={idea.priority} color={PRIORITY[idea.priority]} />
              </div>
            </div>
            <Btn variant="danger" onClick={() => setItems(items.filter(i => i.id !== idea.id))} style={{ padding: "3px 9px", fontSize: 11 }}>×</Btn>
          </div>
        </Card>
      ))}
    </div>
  );
}

// ── OPPORTUNITIES ─────────────────────────────────────────────
function Opportunities() {
  const [items, setItems] = useState(() => local.get("opps"));
  const [modal, setModal] = useState(false);
  const [filter, setFilter] = useState("all");
  const [form, setForm] = useState({ title: "", org: "", type: "scholarship", deadline: "", link: "", notes: "", eligibility: "" });
  const TYPES = ["scholarship", "fellowship", "internship", "job", "accelerator", "grant"];
  const TYPE_C = { scholarship: "#4A9EE2", fellowship: "#A855F7", internship: C.yellow, job: C.lime, accelerator: "#F97316", grant: C.green };

  useEffect(() => { local.set("opps", items); }, [items]);

  const save = () => {
    if (!form.title.trim()) return;
    setItems([{ ...form, id: uid(), saved: Date.now() }, ...items]);
    setModal(false); setForm({ title: "", org: "", type: "scholarship", deadline: "", link: "", notes: "", eligibility: "" });
  };

  const urgent = items.filter(o => o.deadline && daysLeft(o.deadline) <= 14 && daysLeft(o.deadline) > 0);
  const filtered = filter === "all" ? items : items.filter(i => i.type === filter);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.1rem" }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 600, color: C.white }}>Opportunities</div>
          <div style={{ fontSize: 12, color: C.gray, marginTop: 2 }}>{items.length} saved · {urgent.length} closing soon</div>
        </div>
        <Btn onClick={() => setModal(true)}>+ Add</Btn>
      </div>

      {urgent.length > 0 && (
        <Card style={{ borderColor: C.red + "44", background: C.red + "08", marginBottom: "1rem" }}>
          <div style={{ fontSize: 11, color: C.red, fontWeight: 500, marginBottom: 8 }}>⚡ CLOSING SOON</div>
          {urgent.map(o => (
            <div key={o.id} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: `1px solid ${C.border}`, fontSize: 12 }}>
              <span style={{ color: C.white }}>{o.title}</span>
              <span style={{ color: C.red, fontWeight: 500 }}>{daysLeft(o.deadline)}d</span>
            </div>
          ))}
        </Card>
      )}

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: "1rem" }}>
        {["all", ...TYPES].map(t => (
          <span key={t} onClick={() => setFilter(t)} style={{ fontSize: 12, padding: "4px 12px", borderRadius: 20, cursor: "pointer", border: `1px solid ${filter === t ? C.lime : C.border}`, background: filter === t ? C.limeGlow : "transparent", color: filter === t ? C.lime : C.gray }}>{t}</span>
        ))}
      </div>

      {filtered.length === 0 ? <Empty icon="◆" text="No opportunities saved yet." /> : filtered.map(o => (
        <Card key={o.id}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 5 }}>
            <div style={{ flex: 1, paddingRight: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: C.white, marginBottom: 5 }}>{o.title}</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <Pill label={o.type} color={TYPE_C[o.type]} />
                {o.org && <span style={{ fontSize: 11, color: C.gray }}>{o.org}</span>}
                {o.deadline && <span style={{ fontSize: 11, color: daysLeft(o.deadline) <= 14 ? C.red : C.gray }}>Closes {fmt(o.deadline)}</span>}
              </div>
            </div>
            <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
              {o.link && <a href={o.link} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: C.lime, textDecoration: "none" }}>↗</a>}
              <Btn variant="danger" onClick={() => setItems(items.filter(i => i.id !== o.id))} style={{ padding: "3px 9px", fontSize: 11 }}>×</Btn>
            </div>
          </div>
          {o.notes && <div style={{ fontSize: 12, color: C.gray, lineHeight: 1.6, borderTop: `1px solid ${C.border}`, paddingTop: 7 }}>{o.notes}</div>}
        </Card>
      ))}

      {modal && (
        <Modal title="Add opportunity" onClose={() => setModal(false)}>
          <FRow>
            <FF label="Title"><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Chevening Scholarship" /></FF>
            <FF label="Organisation"><Input value={form.org} onChange={e => setForm({ ...form, org: e.target.value })} placeholder="UK Government" /></FF>
          </FRow>
          <FRow>
            <FF label="Type"><Select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} options={TYPES} /></FF>
            <FF label="Deadline"><Input type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} /></FF>
          </FRow>
          <FF label="Link"><Input value={form.link} onChange={e => setForm({ ...form, link: e.target.value })} placeholder="https://..." /></FF>
          <FF label="Eligibility"><Input value={form.eligibility} onChange={e => setForm({ ...form, eligibility: e.target.value })} placeholder="Open to all African countries" /></FF>
          <FF label="Notes"><Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Requirements, tips..." /></FF>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <Btn variant="ghost" onClick={() => setModal(false)}>Cancel</Btn>
            <Btn onClick={save}>Save</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── NOTES ─────────────────────────────────────────────────────
function Notes() {
  const [notes, setNotes] = useState(() => localStorage.getItem("kos_note") || "");
  const [saved, setSaved] = useState(false);
  const t = useRef(null);

  const onChange = (v) => {
    setNotes(v); setSaved(false);
    clearTimeout(t.current);
    t.current = setTimeout(() => { localStorage.setItem("kos_note", v); setSaved(true); }, 800);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.1rem" }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 600, color: C.white }}>Notes</div>
          <div style={{ fontSize: 12, color: C.gray, marginTop: 2 }}>Dump the chaos. Clear your head.</div>
        </div>
        <span style={{ fontSize: 11, color: saved ? C.lime : "#444" }}>{saved ? "✓ Saved" : "·"}</span>
      </div>
      <textarea value={notes} onChange={e => onChange(e.target.value)}
        placeholder={"What's on your mind?\n\nNo format. No rules. Think out loud.\nAuto-saves as you type."}
        style={{ width: "100%", minHeight: 420, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, color: C.grayLight, fontSize: 14, fontFamily: "inherit", padding: "1.1rem", outline: "none", resize: "vertical", lineHeight: 1.85, boxSizing: "border-box" }}
        onFocus={e => e.target.style.borderColor = C.borderLit}
        onBlur={e => e.target.style.borderColor = C.border}
      />
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
        <span style={{ fontSize: 11, color: "#444" }}>{notes.length} chars</span>
        <Btn variant="danger" onClick={() => { setNotes(""); localStorage.removeItem("kos_note"); }} style={{ fontSize: 11, padding: "4px 12px" }}>Clear</Btn>
      </div>
    </div>
  );
}

// ── MAIN ──────────────────────────────────────────────────────
const TABS = [
  { id: "home", label: "Home", icon: "⌂" },
  { id: "projects", label: "Projects", icon: "◈" },
  { id: "buildlog", label: "Log", icon: "◎" },
  { id: "ideas", label: "Ideas", icon: "✦" },
  { id: "opps", label: "Opps", icon: "◆" },
  { id: "notes", label: "Notes", icon: "▸" },
];

export default function App() {
  const [active, setActive] = useState("home");
  const [projects, setProjects] = useState(SEED_PROJECTS);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const init = async () => {
      setSyncing(true);
      try {
        const rows = await sb("kos_projects", "GET", null, "?order=date.desc");
        if (rows && rows.length > 0) {
          setProjects(rows);
        } else {
          for (const p of SEED_PROJECTS) { await sb("kos_projects", "POST", p); }
        }
      } catch {}
      setSyncing(false);
    };
    init();
  }, []);

  const PANELS = {
    home: <Home setActive={setActive} projects={projects} />,
    projects: <Projects projects={projects} setProjects={setProjects} syncing={syncing} />,
    buildlog: <BuildLog />,
    ideas: <IdeaQueue />,
    opps: <Opportunities />,
    notes: <Notes />,
  };

  return (
    <div style={{ background: C.bg, minHeight: "100vh", fontFamily: "'Inter','DM Sans',system-ui,sans-serif", color: C.white }}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        ::placeholder{color:#333!important;}
        input,textarea,select{color-scheme:dark;font-family:inherit;}
        ::-webkit-scrollbar{width:3px;}
        ::-webkit-scrollbar-thumb{background:#2A2A2A;border-radius:3px;}
        .desktop-layout{display:flex;}
        .sidebar{width:200px;background:#111;border-right:1px solid #1E1E1E;padding:1.25rem .875rem;display:flex;flex-direction:column;position:sticky;top:0;height:100vh;flex-shrink:0;}
        .main-content{flex:1;padding:2rem;max-width:720px;overflow-y:auto;}
        .bottom-nav{display:none;}
        @media(max-width:640px){
          .desktop-layout{display:block;}
          .sidebar{display:none;}
          .main-content{padding:1rem 1rem 90px;}
          .bottom-nav{display:flex;position:fixed;bottom:0;left:0;right:0;background:#111;border-top:1px solid #1E1E1E;padding:8px 0 12px;z-index:100;}
          .bottom-nav-item{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;cursor:pointer;padding:4px 0;}
          .bottom-nav-icon{font-size:16px;}
          .bottom-nav-label{font-size:9px;letter-spacing:0.04em;}
        }
      `}</style>

      <div className="desktop-layout">
        <div className="sidebar">
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "1.75rem" }}>
            <Logo size={28} />
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.white }}>KleeOnAI</div>
              <div style={{ fontSize: 9, color: C.gray, letterSpacing: "0.06em" }}>OS · PRIVATE</div>
            </div>
          </div>
          <nav style={{ flex: 1 }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setActive(t.id)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 7, border: "none", cursor: "pointer", marginBottom: 2, background: active === t.id ? C.limeGlow : "transparent", color: active === t.id ? C.lime : C.gray, fontFamily: "inherit", transition: "all 0.15s" }}>
                <span style={{ fontSize: 11 }}>{t.icon}</span>
                <span style={{ fontSize: 13, fontWeight: active === t.id ? 500 : 400 }}>{t.label}</span>
              </button>
            ))}
          </nav>
          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: "1rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5, marginBottom: 6 }}>
              {[["Projects", projects.length], ["Ideas", local.get("ideas").filter(i => i.status !== "killed").length], ["Opps", local.get("opps").length], ["Logs", local.get("buildlog").length]].map(([l, v]) => (
                <div key={l} style={{ background: C.surface2, borderRadius: 7, padding: "6px 8px" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.white }}>{v}</div>
                  <div style={{ fontSize: 9, color: C.gray }}>{l}</div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 10, color: "#2A2A2A", textAlign: "center" }}>kleeonai.com</div>
          </div>
        </div>

        <div className="main-content">{PANELS[active]}</div>
      </div>

      <div className="bottom-nav">
        {TABS.map(t => (
          <div key={t.id} className="bottom-nav-item" onClick={() => setActive(t.id)}>
            <div className="bottom-nav-icon" style={{ color: active === t.id ? C.lime : C.gray }}>{t.icon}</div>
            <div className="bottom-nav-label" style={{ color: active === t.id ? C.lime : C.gray }}>{t.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
