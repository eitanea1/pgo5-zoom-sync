// The "Get Ready" / Pre-Meeting Context popup

const MEETING = {
  title: 'PGO-5 Prep · Weekly Sync',
  when:  'Tue, Apr 28 · 10:00 – 10:30 AM',
  host:  'Ofir Even-Zur (you)',
  attendees: 5,
  series: 'PGO-5 · Final 2 weeks before review',
};

const SUMMARY = {
  recap: 'Last week we locked the demo arc — Pre-Meeting Popup → In-Call → Recap — as the full PGO-5 scope. Neriya flagged that Uri will push hard on UX consistency between the three screens and the "why" behind the AI suggestions. Idan committed to the Cost-per-Brief math for Max\'s first ROI pass. Tal raised that booth logistics — 240 GSM tees, non-smudge candy, and balloons — are still unscheduled.',
  bullets: [
    { t: 'Decision: 3-screen demo flow stays as the scope. Cut the standalone dashboard idea — Uri called it a tangent.' },
    { t: 'Concern (Neriya): storytelling thread between In-Call → Recap is thin. Uri will catch the gap on the "why" before Recap reveals the score.' },
    { t: 'Open: Cost-per-Brief model — Idan owns by Wed. Max will probe the per-seat math against Business Tiers.' },
    { t: 'Logistics: 240 GSM T-shirts, non-smudge candy, balloons, branding — all still pending vendor quotes.' },
    { t: 'Per-feature PRDs: one PRD per feature, no bundling. Uri\'s rule.' },
  ],
};

const DOCS = [
  { id:'d1', name:'PGO-5 Master Figma — 3 screens locked',         src:'Figma · 18 frames · edited 2h ago by Eitan',     kind:'fig'   },
  { id:'d2', name:'PGO-5 Canva Deck v3 — Max + Uri narrative',     src:'Canva · 22 slides · 5 comments from Neriya',     kind:'doc'   },
  { id:'d3', name:'ROI Model — Cost per Brief.xlsx',               src:'Sheets · auto-refreshed by Idan · for Max',      kind:'sheet' },
  { id:'d4', name:'PRD — Meeting Score & Overtime',                src:'Notion · 1.4k words · Neriya · solo doc',        kind:'doc'   },
  { id:'d5', name:'Booth logistics — tees / candy / balloons',     src:'Notion · vendor quotes pending · Tal',           kind:'doc'   },
];

const ACTIONS = [
  { id:'a1', what:'Reorder Canva deck — open with ROI section so Max sees it first',  who:{n:'You',   i:'OE', c:'#3A8DFF'}, due:'Wed',     mine:true },
  { id:'a2', what:'Re-record the Pre-Meeting Popup demo loop — 720p, no UI flicker',  who:{n:'You',   i:'OE', c:'#3A8DFF'}, due:'Today',   warn:true, mine:true },
  { id:'a3', what:'Finalize "Why Zoom Sync" opening slide — Uri\'s first probe',      who:{n:'Eitan', i:'ED', c:'#F06A6A'}, due:'Tue 9 AM', warn:true },
  { id:'a4', what:'Send 240 GSM T-shirt + non-smudge candy quote to vendor',          who:{n:'Tal',   i:'TS', c:'#F5A524'}, due:'Today',   warn:true },
  { id:'a5', what:'Lock Cost-per-Brief math + per-seat Business Tiers for Max',       who:{n:'Idan',  i:'IG', c:'#17B26A'}, due:'Wed' },
];

const ATTENDEES = [
  { i:'OE', c:'#3A8DFF', n:'Ofir Even-Zur (host, you)' },
  { i:'ED', c:'#F06A6A', n:'Eitan Dror' },
  { i:'IG', c:'#17B26A', n:'Idan Grof' },
  { i:'NA', c:'#8B5CF6', n:'Neriya Amar (External)' },
  { i:'TS', c:'#F5A524', n:'Tal Shulman' },
];

const PreMeetingPopup = ({ minutesLeft, onClose, onJoin, variant }) => {
  const [snoozeOpen, setSnoozeOpen] = React.useState(false);
  const [done, setDone] = React.useState({});
  const toggleDone = (id) => setDone(d => ({...d, [id]: !d[id]}));

  const mm = String(Math.max(0, minutesLeft)).padStart(2,'0');
  const ss = '00';

  return (
    <div className="scrim" onMouseDown={onClose}>
      <div className="popup" onMouseDown={(e)=>e.stopPropagation()}>
        <button className="popup-close" onClick={onClose} aria-label="Close">×</button>

        <div className="popup-head">
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', gap:10}}>
            <div className="popup-eyebrow">
              <Ic.Sparkle /> Get Ready · Pre-meeting context
            </div>
            <span className="countdown-pill">
              <span className="d"></span>
              Starts in {mm}:{ss}
            </span>
          </div>
          <h2>{MEETING.title}</h2>
          <div className="meta">
            <span><strong>{MEETING.when}</strong></span>
            <span className="sep">·</span>
            <span>Hosted by {MEETING.host}</span>
            <span className="sep">·</span>
            <span>{MEETING.attendees} attendees</span>
          </div>
        </div>

        <div className="popup-body">

          {/* Last meeting summary */}
          <div className="pp-section">
            <h4>
              <span className="ico"><Ic.Recap /></span>
              Last meeting summary
              <span className="ai-chip"><Ic.Sparkle /> AI</span>
            </h4>
            <p className="summary-text">{SUMMARY.recap}</p>
            <ul className="summary-bullets">
              {SUMMARY.bullets.map((b, i) => (
                <li key={i}><span className="b"></span><span>{b.t}</span></li>
              ))}
            </ul>
          </div>

          {/* Shared documents */}
          <div className="pp-section">
            <h4>
              <span className="ico"><Ic.Doc /></span>
              Shared documents
              <span className="count">{DOCS.length}</span>
              <span className="more">See all ›</span>
            </h4>
            <ul className="doc-list">
              {DOCS.map(d => (
                <li key={d.id} className="doc-row">
                  <span className={`doc-ico ${d.kind}`}>
                    {d.kind === 'pdf' && 'PDF'}
                    {d.kind === 'doc' && 'DOC'}
                    {d.kind === 'sheet' && 'XLS'}
                  </span>
                  <div className="doc-meta">
                    <div className="n">{d.name}</div>
                    <div className="s">{d.src}</div>
                  </div>
                  <span className="arrow">›</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Action items */}
          <div className="pp-section">
            <h4>
              <span className="ico"><Ic.Check /></span>
              Pending action items
              <span className="count">{ACTIONS.filter(a => !done[a.id]).length} open</span>
              <span className="more">See more ›</span>
            </h4>
            <ul className="action-list">
              {ACTIONS.map(a => (
                <li key={a.id} className={`action-row ${a.mine?'you':''}`}>
                  <span
                    className={`checkbox ${done[a.id]?'done':''}`}
                    onClick={()=>toggleDone(a.id)}
                  ></span>
                  <div className="action-body">
                    <div className="action-what" style={{textDecoration: done[a.id]?'line-through':'none', color: done[a.id]?'var(--ink-4)':'var(--ink)'}}>
                      {a.what}
                    </div>
                    <div className="action-meta">
                      <span className="tag-owner">
                        <span className="av" style={{background:a.who.c}}>{a.who.i}</span>
                        {a.who.n}
                      </span>
                      <span className={`tag-due ${a.warn?'warn':''}`}>
                        <Ic.Clock style={{verticalAlign:'-2px', marginRight:3}} />
                        Due {a.due}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Attendee insights */}
          <div className="pp-section">
            <h4>
              <span className="ico"><Ic.People /></span>
              Attendee insights
              <span className="count">{ATTENDEES.length}</span>
            </h4>
            <div className="attendees">
              <div className="att-stack">
                {ATTENDEES.map((a, i) => (
                  <span key={i} className="av" style={{background:a.c}} title={a.n}>{a.i}</span>
                ))}
              </div>
              <div className="att-text">
                <strong>5 of 5</strong> have accepted · <strong>Tal Shulman</strong> is new to this series · 3 attendees contributed to last meeting's decisions.
              </div>
            </div>
          </div>

        </div>

        <div className="popup-foot">
          <div className="left-actions">
            <button className="ghost-btn" onClick={()=>setSnoozeOpen(s=>!s)}>Snooze ▾</button>
          </div>
          <div className="right-actions">
            <button className="secondary-btn">Review details</button>
            <button className="primary-btn" onClick={onJoin}>
              <Ic.Video /> Join meeting
            </button>
          </div>

          <div className={`snooze-menu ${snoozeOpen?'open':''}`}>
            <button>Remind in 5 min <span className="k">⌘5</span></button>
            <button>Remind in 10 min <span className="k">⌘0</span></button>
            <button>Don't remind for this meeting</button>
            <button>Turn off Get Ready globally</button>
          </div>
        </div>
      </div>
    </div>
  );
};

window.PreMeetingPopup = PreMeetingPopup;
