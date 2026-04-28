// Zoom Workplace shell: app bar, sidebar, calendar, chat panel

const ZoomLogo = () => (
  <div className="zoom-logo">
    <span className="mark">zoom</span>
    <span className="word">Workplace</span>
  </div>
);

const TopBar = () => (
  <div className="app-bar">
    <ZoomLogo />
    <div className="top-tabs">
      <div className="top-tab">Home</div>
      <div className="top-tab">Team Chat</div>
      <div className="top-tab">Mail <span className="caret">▾</span></div>
      <div className="top-tab active">Calendar <span className="caret">▾</span></div>
      <div className="top-tab">Phone</div>
      <div className="top-tab">Notes</div>
      <div className="top-tab">More <span className="caret">▾</span></div>
    </div>
    <div className="right">
      <div className="search">
        <Ic.Search /> <span>Search</span>
      </div>
      <div className="icon-btn"><Ic.Bell /></div>
      <div className="avatar-me">MC</div>
    </div>
  </div>
);

const Sidebar = () => (
  <aside className="sidebar">
    <div className="side-section">
      <button className="pill-btn primary" style={{width:'100%', justifyContent:'center', height:38}}>
        <Ic.Plus /> Schedule
      </button>
    </div>
    <div className="side-section">
      <div className="side-item"><Ic.Home /> Home</div>
      <div className="side-item active"><Ic.Calendar /> Calendar</div>
      <div className="side-item"><Ic.Mail /> Mail</div>
      <div className="side-item"><Ic.Team /> Team Chat <span className="badge">12</span></div>
      <div className="side-item"><Ic.Phone /> Phone</div>
      <div className="side-item"><Ic.Whiteboard /> Whiteboards</div>
      <div className="side-item"><Ic.Notes /> Notes</div>
    </div>
    <div className="side-section">
      <div className="side-label">My Calendars</div>
      <div className="side-item"><span style={{width:10, height:10, borderRadius:3, background:'#0B5CFF'}}></span> Ofir Even-Zur</div>
      <div className="side-item"><span style={{width:10, height:10, borderRadius:3, background:'#1F8A4C'}}></span> Product team</div>
      <div className="side-item"><span style={{width:10, height:10, borderRadius:3, background:'#6B5BD6'}}></span> Design crit</div>
      <div className="side-item"><span style={{width:10, height:10, borderRadius:3, background:'#C7860A'}}></span> 1:1s</div>
    </div>
    <div className="side-section">
      <div className="side-label">Subscribed</div>
      <div className="side-item"><span style={{width:10, height:10, borderRadius:3, background:'#A4A6AB'}}></span> Holidays — US</div>
      <div className="side-item"><span style={{width:10, height:10, borderRadius:3, background:'#A4A6AB'}}></span> Eng on-call</div>
    </div>
  </aside>
);

const dayHeads = [
  { dow: 'MON', num: 27 },
  { dow: 'TUE', num: 28, today: true },
  { dow: 'WED', num: 29 },
  { dow: 'THU', num: 30 },
  { dow: 'FRI', num: 1 },
];

// Time grid: 8am – 6pm (10 rows × 56px = 560px)
const HOURS = ['8 AM','9 AM','10 AM','11 AM','12 PM','1 PM','2 PM','3 PM','4 PM','5 PM'];
// Convert minutes since 8am to top px
const minToY = (m) => (m / 60) * 56;

// All events. day: 0..4, start/end in minutes from 8am
const EVENTS = [
  // Mon
  { day:0, start: 60,  end: 90,  title:'Standup',          meta:'9:00 AM',  tone:'gray' },
  { day:0, start: 150, end: 210, title:'Pricing WG',       meta:'10:30 AM', tone:'purple' },
  { day:0, start: 360, end: 420, title:'Focus block',      meta:'2:00 PM',  tone:'gray' },
  // Tue (today)
  { day:1, start: 60,  end: 90,  title:'Standup',          meta:'9:00 AM',  tone:'gray' },
  { day:1, start: 120, end: 150, title:'PM Weekly Sync', meta:'10:00–10:30 AM · Zoom · 5 attendees', tone:'blue', upcoming:true },
  { day:1, start: 270, end: 330, title:'1:1 — Eitan Dror', meta:'12:30 PM · Zoom', tone:'green' },
  { day:1, start: 420, end: 480, title:'Research debrief', meta:'3:00 PM',  tone:'amber' },
  // Wed
  { day:2, start: 150, end: 210, title:'Roadmap review',   meta:'10:30 AM · Zoom', tone:'blue' },
  { day:2, start: 240, end: 360, title:'Focus block',      meta:'',         tone:'gray' },
  { day:2, start: 420, end: 470, title:'Design crit',      meta:'3:00 PM',  tone:'purple' },
  // Thu
  { day:3, start: 60,  end: 90,  title:'Standup',          meta:'9:00 AM',  tone:'gray' },
  { day:3, start: 210, end: 270, title:'Exec readout prep',meta:'11:30 AM · Zoom', tone:'blue' },
  { day:3, start: 360, end: 420, title:'UXR sync',         meta:'2:00 PM · Zoom', tone:'amber' },
  // Fri
  { day:4, start: 120, end: 180, title:'Sprint demo',      meta:'10:00 AM · Zoom', tone:'blue' },
  { day:4, start: 300, end: 360, title:'Retro',            meta:'1:00 PM',  tone:'green' },
];

const CalendarView = ({ onContextMenu }) => {
  // "Now" line at 9:45 AM (so the 10 AM meeting is in 15 min)
  const nowMin = 105; // 9:45 AM
  const nowY = minToY(nowMin);

  return (
    <div className="main">
      <div className="cal-toolbar">
        <div className="left">
          <button className="arrow-btn">‹</button>
          <button className="arrow-btn">›</button>
          <button className="pill-btn">Today</button>
          <h1>April 2026</h1>
          <span className="date">Week of Apr 27</span>
        </div>
        <div className="btn-row">
          <button className="pill-btn">Week ▾</button>
          <button className="pill-btn"><Ic.Plus /> Add</button>
        </div>
      </div>

      <div className="week-grid">
        <div className="week-head">
          <div className="gutter"></div>
          {dayHeads.map((d, i) => (
            <div key={i} className={`day-h ${d.today?'today':''}`}>
              <div className="dow">{d.dow}</div>
              <div className="num">{d.num}</div>
            </div>
          ))}
        </div>
        <div className="week-body">
          {/* time labels */}
          {HOURS.map((h, i) => (
            <div key={h} className="time-label" style={{gridRow: i+1}}>{h}</div>
          ))}
          {/* day columns */}
          {dayHeads.map((d, i) => (
            <div key={i} className="col" style={{gridColumn: i+2, gridRow: '1 / -1'}}>
              {EVENTS.filter(e => e.day === i).map((e, j) => {
                const top = minToY(e.start);
                const h = minToY(e.end - e.start);
                return (
                  <div key={j} className={`ev ${e.tone} ${e.upcoming?'upcoming':''}`}
                       style={{top, height: h - 4}}
                       onClick={(ev) => onContextMenu && onContextMenu(ev, e, 'click')}
                       onContextMenu={(ev) => { ev.preventDefault(); onContextMenu && onContextMenu(ev, e, 'context'); }}>
                    <div className="t">{e.title}</div>
                    {e.meta && <div className="m">{e.meta}</div>}
                  </div>
                );
              })}
              {/* now line on Tue (today) */}
              {d.today && (
                <div className="now-line" style={{top: nowY}}>
                  <span className="t">9:45</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const CHATS = [
  { n:'Eitan Dror',     t:'9:42 AM', p:'Pricing copy lands Mon — promise 🤝', initials:'ED', color:'#F06A6A', unread:true },
  { n:'PM Team',        t:'9:31 AM', p:'Tal: Just dropped 3 paywall frames in Figma', initials:'PM', color:'#6B5BD6', unread:true },
  { n:'Tal Shulman',    t:'9:14 AM', p:'You: lgtm — let\'s review at sync', initials:'TS', color:'#F5A524' },
  { n:'Idan Grof',      t:'8:50 AM', p:'Cohort data refreshed in the sheet', initials:'IG', color:'#17B26A' },
  { n:'Neriya Amar',    t:'Yesterday', p:'SDK upgrade ETA still Wed', initials:'NA', color:'#8B5CF6' },
  { n:'Eng on-call',    t:'Mon', p:'No incidents 🎉', initials:'EO', color:'#A4A6AB' },
];

const ChatPanel = () => (
  <aside className="chat">
    <div className="chat-head">
      <h3>Team Chat</h3>
      <div style={{display:'flex', gap:6}}>
        <div className="icon-btn" style={{width:28, height:28}}><Ic.Plus /></div>
      </div>
    </div>
    <div className="chat-search">
      <Ic.Search /> <span>Search chats</span>
    </div>
    <div className="chat-list">
      {CHATS.map((c, i) => (
        <div key={i} className={`chat-row ${c.unread?'unread':''}`}>
          <div className="chat-avatar" style={{background:c.color}}>{c.initials}</div>
          <div className="chat-meta">
            <div className="chat-name">
              <span className="n">{c.n}</span>
              <span className="t">{c.t}</span>
            </div>
            <div className="chat-preview">{c.p}</div>
          </div>
          {c.unread && <span className="chat-dot"></span>}
        </div>
      ))}
    </div>
    <div className="chat-compose">
      <div className="chat-input">Type a message…</div>
    </div>
  </aside>
);

window.TopBar = TopBar;
window.Sidebar = Sidebar;
window.CalendarView = CalendarView;
window.ChatPanel = ChatPanel;
