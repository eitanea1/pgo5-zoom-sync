// Right-click context menu + meeting detail card with "Zoom Sync" tab

const ContextMenu = ({ x, y, event, onClose, onOpenSync, onOpenDetail }) => {
  // Clamp to viewport
  const ref = React.useRef(null);
  const [pos, setPos] = React.useState({ left: x, top: y });
  React.useEffect(() => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const dRect = document.querySelector('.desktop').getBoundingClientRect();
    let left = x - dRect.left;
    let top  = y - dRect.top;
    if (left + rect.width > 1440) left = 1440 - rect.width - 8;
    if (top + rect.height > 900) top = 900 - rect.height - 8;
    setPos({ left, top });
  }, [x, y]);

  React.useEffect(() => {
    // Close on any click outside (after opening tick)
    let opened = false;
    const tickId = setTimeout(() => { opened = true; }, 0);
    const off = (e) => { if (opened) onClose(); };
    const esc = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('mousedown', off);
    document.addEventListener('keydown', esc);
    return () => {
      clearTimeout(tickId);
      document.removeEventListener('mousedown', off);
      document.removeEventListener('keydown', esc);
    };
  }, [onClose]);

  return (
    <div className="ctx-menu" ref={ref}
         style={{ left: pos.left, top: pos.top }}
         onMouseDown={(e)=>e.stopPropagation()}>
      <button onClick={onOpenDetail}>
        <Ic.Calendar /> Open meeting…
      </button>
      <button>
        <Ic.Video /> Join meeting
      </button>
      <div className="sep"></div>
      <button className="featured" onClick={onOpenSync}>
        <Ic.Sparkle /> Zoom Sync — Get Ready
        <span className="ai-chip"><Ic.Sparkle /> AI</span>
      </button>
      <div className="sep"></div>
      <button>
        <Ic.Doc /> Copy meeting link
      </button>
      <button>
        <Ic.Mail /> Email attendees
      </button>
      <button>
        <Ic.Bell /> Edit reminders
      </button>
      <div className="sep"></div>
      <button style={{color:'var(--warn)'}}>
        Decline meeting
      </button>
    </div>
  );
};

// Meeting Detail card — shown when user picks "Open meeting…"
// Has Details / Zoom Sync / Chat tabs.
const MeetingDetail = ({ x, y, event, onClose, onOpenSync }) => {
  const [tab, setTab] = React.useState('details');

  const ref = React.useRef(null);
  const [pos, setPos] = React.useState({ left: x, top: y });
  React.useEffect(() => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const dRect = document.querySelector('.desktop').getBoundingClientRect();
    let left = x - dRect.left;
    let top  = Math.max(40, y - dRect.top - 40);
    if (left + 520 > 1440) left = 1440 - 520 - 16;
    if (top  + 380 > 900)  top  = 900 - 380 - 16;
    setPos({ left, top });
  }, [x, y]);

  React.useEffect(() => {
    const off = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', off);
    return () => document.removeEventListener('mousedown', off);
  }, [onClose]);

  return (
    <div className="meeting-detail" ref={ref}
         style={{ left: pos.left, top: pos.top }}>
      <div className="md-head">
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:10}}>
          <div>
            <h3>{event?.title || 'PM Weekly Sync'}</h3>
            <div className="when">
              {event?.day === 1 ? 'Tue, Apr 28' : 'Apr 28'} · {event?.meta || '10:00–10:45 AM'}
            </div>
          </div>
          <button className="popup-close" style={{position:'static'}} onClick={onClose}>×</button>
        </div>
      </div>

      <div className="md-tabs">
        <div className={`md-tab ${tab==='details'?'active':''}`} onClick={()=>setTab('details')}>
          <Ic.Calendar /> Details
        </div>
        <div className={`md-tab sync ${tab==='sync'?'active':''}`} onClick={()=>setTab('sync')}>
          <Ic.Sparkle /> Zoom Sync
          <span className="ai-chip" style={{marginLeft:4}}>AI</span>
        </div>
        <div className={`md-tab ${tab==='chat'?'active':''}`} onClick={()=>setTab('chat')}>
          <Ic.Team /> Chat
        </div>
      </div>

      <div className="md-body">
        {tab === 'details' && (
          <div style={{fontSize:13, color:'var(--ink-2)', lineHeight:1.6}}>
            <div style={{display:'flex', gap:8, alignItems:'center', marginBottom:6}}>
              <Ic.Clock /> 10:00 – 10:45 AM (45 min)
            </div>
            <div style={{display:'flex', gap:8, alignItems:'center', marginBottom:6}}>
              <Ic.Video /> Zoom — Personal meeting room (link copied)
            </div>
            <div style={{display:'flex', gap:8, alignItems:'center', marginBottom:12}}>
              <Ic.People /> 5 attendees · 5 accepted
            </div>
            <div style={{padding:'10px 12px', background:'var(--bg)', borderRadius:8, fontSize:12.5, color:'var(--ink-3)'}}>
              <strong style={{color:'var(--ink-2)'}}>Description.</strong> Weekly PM sync on roadmap
              priorities and onboarding/paywall experiments. Eitan to walk through Q2 results;
              Ofir to surface kill-criteria for v3 rollout.
            </div>
          </div>
        )}

        {tab === 'sync' && (
          <div className="sync-cta">
            <div className="badge"><Ic.Sparkle /></div>
            <div className="copy">
              <strong>Get Ready Context is ready.</strong><br/>
              AI summary from your last meeting, shared docs, open action items
              and attendee insights — all in one view.
            </div>
            <button onClick={onOpenSync}>Open</button>
          </div>
        )}

        {tab === 'chat' && (
          <div style={{fontSize:13, color:'var(--ink-3)'}}>
            No messages in the meeting chat yet. Messages posted here are kept with the
            meeting record.
          </div>
        )}
      </div>

      <div className="md-foot">
        <button className="secondary-btn" onClick={onClose}>Close</button>
        <button className="primary-btn"><Ic.Video /> Join</button>
      </div>
    </div>
  );
};

window.ContextMenu = ContextMenu;
window.MeetingDetail = MeetingDetail;
