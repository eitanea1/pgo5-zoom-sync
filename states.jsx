// State 1: Calendar with glowing tile

const CalendarState = ({ onOpen }) => {
  const days = ["Mon 21", "Tue 22", "Wed 23", "Thu 24", "Fri 25"];
  const today = 1; // Tue
  return (
    <div className="cal-wrap">
      <aside className="sketch cal-side">
        <div className="hand-h2" style={{fontSize:22}}>April 2026</div>
        <div className="label" style={{marginTop:2}}>this week</div>
        <div className="mini-cal">
          {["S","M","T","W","T","F","S"].map((d,i)=>(<div key={"h"+i} className="d head">{d}</div>))}
          {Array.from({length: 30}).map((_,i)=>{
            const day = i+1;
            const cls = ["d"];
            if(day===22) cls.push("today");
            if([15,18,22,24,28].includes(day)) cls.push("has");
            return <div key={day} className={cls.join(' ')}>{day}</div>;
          })}
        </div>
        <ul className="nav-list">
          <li className="active"><span className="dot" style={{background:'var(--ink)'}}></span> Mia's calendar</li>
          <li><span className="dot" style={{background:'#fff1d9'}}></span> Sam Kapoor</li>
          <li><span className="dot" style={{background:'#f3eaff'}}></span> Lena Rivers</li>
          <li><span className="dot" style={{background:'#eaf7ee'}}></span> Eng team</li>
          <li style={{marginTop:14}} className="label">⌬ AI BRIEFS</li>
          <li><span className="dot" style={{background:'var(--glow)', borderColor:'var(--glow-ink)'}}></span> 3 ready today</li>
        </ul>
      </aside>

      <div className="sketch cal-main">
        <div className="cal-head">
          <div style={{display:'flex', alignItems:'baseline', gap:14}}>
            <div className="hand-h1" style={{fontSize:24, lineHeight:1}}>Week of Apr 21</div>
            <div className="label">5 meetings · <span style={{color:'var(--glow-ink)'}}>3 with AI brief</span></div>
          </div>
          <div style={{display:'flex', gap:8}}>
            <button className="btn tiny ghost">‹</button>
            <button className="btn tiny">Today</button>
            <button className="btn tiny ghost">›</button>
            <button className="btn tiny">Week ▾</button>
          </div>
        </div>

        <div className="cal-grid" style={{position:'relative'}}>
          {/* time gutter */}
          {[9,10,11,12,13,14,15,16,17,18].map((h,i)=>(
            <div key={"t"+h} className="time" style={{gridRow: i+2, gridColumn: 1}}>{h}:00</div>
          ))}
          {/* day headers + columns */}
          {days.map((d,i)=>(
            <div key={"h"+i} className={`col-h ${i===today?'today':''}`} style={{gridColumn: i+2}}>
              <span className="day">{d.split(' ')[1]}</span>
              <span>{d.split(' ')[0]}</span>
            </div>
          ))}
          {days.map((_,i)=>(
            <div key={"c"+i} className="col" style={{gridColumn: i+2, gridRow: '2 / -1'}}>
              {/* Mon */}
              {i===0 && <>
                <div className="event" style={{top:'4%', height:'8%'}}><div className="title">Standup</div><div className="meta">9:00 · daily</div></div>
                <div className="event muted" style={{top:'30%', height:'12%'}}><div className="title">Pricing WG</div><div className="meta">11:30</div></div>
                <div className="event busy" style={{top:'60%', height:'14%'}}><div className="title">Focus block</div></div>
              </>}
              {/* Tue (today) */}
              {i===1 && <>
                <div className="event" style={{top:'4%', height:'8%'}}><div className="title">Standup</div><div className="meta">9:00</div></div>
                <div className="event ai glow" style={{top:'14%', height:'14%'}} onClick={()=>onOpen()}>
                  <div className="title">Sprint Sync — Discovery</div>
                  <div className="meta">10:00–10:45 · 6 attendees</div>
                </div>
                <div className="event" style={{top:'42%', height:'10%'}}><div className="title">1:1 — Sam</div><div className="meta">12:30</div></div>
                <div className="event muted" style={{top:'66%', height:'10%'}}><div className="title">Research debrief</div><div className="meta">15:00</div></div>
              </>}
              {/* Wed */}
              {i===2 && <>
                <div className="event ai" style={{top:'18%', height:'10%'}} onClick={()=>onOpen()}>
                  <div className="title">Roadmap review</div><div className="meta">10:30 · brief ready</div>
                </div>
                <div className="event busy" style={{top:'38%', height:'18%'}}><div className="title">Focus block</div></div>
                <div className="event" style={{top:'70%', height:'8%'}}><div className="title">Design crit</div></div>
              </>}
              {/* Thu */}
              {i===3 && <>
                <div className="event" style={{top:'4%', height:'8%'}}><div className="title">Standup</div><div className="meta">9:00</div></div>
                <div className="event ai" style={{top:'30%', height:'12%'}} onClick={()=>onOpen()}>
                  <div className="title">Exec readout prep</div><div className="meta">11:30 · brief ready</div>
                </div>
                <div className="event muted" style={{top:'56%', height:'14%'}}><div className="title">UXR sync</div><div className="meta">14:00</div></div>
              </>}
              {/* Fri */}
              {i===4 && <>
                <div className="event" style={{top:'14%', height:'10%'}}><div className="title">Sprint demo</div><div className="meta">10:00</div></div>
                <div className="event muted" style={{top:'46%', height:'10%'}}><div className="title">Retro</div><div className="meta">13:00</div></div>
              </>}
            </div>
          ))}
        </div>
      </div>

      {/* annotations */}
      <Annotate x={560} y={360} rotate={-4}>
        <span style={{fontSize:22, background:'var(--paper)', padding:'2px 8px', borderRadius:6, boxShadow:'1px 1px 0 rgba(0,0,0,.1)'}}>↖ click the glowing tile</span>
      </Annotate>
    </div>
  );
};


// State 2: Brief modal
const BriefModal = ({ onClose, onExpandTasks, onReviewDetails, onOpenDoc, loading }) => (
  <div className="scrim" onClick={onClose}>
    <div className="modal" onClick={(e)=>e.stopPropagation()}>
      <div className="modal-head">
        <div>
          <h2 className="title">Sprint Sync — Discovery Track</h2>
          <div className="sub">TUE APR 22 · 10:00–10:45 · ZOOM · RECURRING (SPRINT 24, WK 2)</div>
          <div style={{marginTop:8, display:'flex', gap:8}}>
            <AIBadge>AI BRIEF · 4 MIN AGO</AIBadge>
            <Pill tone="muted">12 sources synthesized</Pill>
          </div>
        </div>
        <button className="close-x" onClick={onClose} aria-label="close">×</button>
      </div>

      <div className="modal-body">
        <div className="section">
          <h3><SparkleIcon size={18} color="#2f7bff" /> Last meeting summary</h3>
          {loading ? (
            <div className="summary-card">
              <span className="corner">RECAP · APR 22</span>
              <Skeleton w="100%" h={14} mt={6} />
              <Skeleton w="92%" h={14} mt={8} />
              <Skeleton w="78%" h={14} mt={8} />
              <Skeleton w="40%" h={14} mt={14} />
            </div>
          ) : (
            <div className="summary-card">
              <span className="corner">RECAP · APR 22</span>
              <p>{MOCK.SUMMARY.recap}</p>
              <ul>
                {MOCK.SUMMARY.bullets.map((b,i)=>(<li key={i}>{b}</li>))}
              </ul>
              <div className="sig">
                {MOCK.SUMMARY.signals.map((s,i)=>(
                  <Pill key={i} tone={s.tone}>{s.k}: {s.v}</Pill>
                ))}
              </div>
            </div>
          )}

          <h3 style={{marginTop:18}}>📎 Shared documents <span className="count">{MOCK.DOCS.length}</span></h3>
          <ul className="doc-list">
            {MOCK.DOCS.slice(0,5).map(d => (
              <DocRow key={d.id} doc={d} onOpen={onOpenDoc} />
            ))}
          </ul>
        </div>

        <div className="section">
          <h3>
            ✓ Pending action items <span className="count">{MOCK.TASKS.filter(t=>!t.done).length} open</span>
            <button className="btn tiny ghost" style={{marginLeft:'auto'}} onClick={onExpandTasks}>expand ↗</button>
          </h3>
          <ul className="task-list">
            {MOCK.TASKS.filter(t=>!t.done).slice(0,4).map(t => (
              <TaskRow key={t.id} task={t} />
            ))}
          </ul>

          <h3 style={{marginTop:18}}>👥 Attendees <span className="count">{MOCK.ATTENDEES.length}</span></h3>
          <ul className="att-list">
            {MOCK.ATTENDEES.map((a,i)=>(<AttendeeRow key={i} a={a} />))}
          </ul>
        </div>
      </div>

      <div className="modal-foot">
        <button className="btn ghost" onClick={onReviewDetails}>📂 Review details</button>
        <div style={{display:'flex', gap:10}}>
          <button className="btn">Snooze brief</button>
          <button className="btn primary">▶ Join meeting</button>
        </div>
      </div>
    </div>
  </div>
);


// State 3: Actions Expanded — same modal, wider, all tasks
const ActionsExpanded = ({ onClose, onBack, onReviewDetails }) => {
  const open = MOCK.TASKS.filter(t=>!t.done);
  const done = MOCK.TASKS.filter(t=>t.done);
  const mine = open.filter(t=>t.who==='You');
  const others = open.filter(t=>t.who!=='You');
  return (
    <div className="scrim" onClick={onClose}>
      <div className="modal wide" onClick={(e)=>e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <h2 className="title">Action items — Sprint Sync</h2>
            <div className="sub">CARRIED OVER FROM 2 PRIOR MEETINGS · GROUPED BY OWNER</div>
            <div style={{marginTop:8, display:'flex', gap:8}}>
              <Pill tone="warn">{mine.length} owed by you</Pill>
              <Pill>{others.length} from team</Pill>
              <Pill tone="good">{done.length} completed</Pill>
            </div>
          </div>
          <button className="close-x" onClick={onBack}>‹</button>
        </div>
        <div className="modal-body" style={{gridTemplateColumns:'1fr'}}>
          <div className="section">
            <div className="actions-grid">
              <div className="group-title">— Yours · {mine.length}</div>
              {mine.map(t => <TaskRow key={t.id} task={t} expanded />)}
              <div className="group-title">— Team · {others.length}</div>
              {others.map(t => <TaskRow key={t.id} task={t} expanded />)}
              <div className="group-title">— Completed · {done.length}</div>
              {done.map(t => <TaskRow key={t.id} task={t} expanded />)}
            </div>
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn ghost" onClick={onBack}>‹ back to brief</button>
          <div style={{display:'flex', gap:10}}>
            <button className="btn">Reassign…</button>
            <button className="btn primary">Mark all reviewed</button>
          </div>
        </div>
      </div>
    </div>
  );
};


// State 4: Review details — slide-in panel
const ReviewPanel = ({ onClose, onOpenDoc, onJoin }) => (
  <div className="scrim" onClick={onClose} style={{ background: 'rgba(20,20,20,.28)' }}>
    <div className="review-panel" onClick={(e)=>e.stopPropagation()}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
        <div>
          <h2 className="hand-h1" style={{fontSize:32, margin:0}}>Series history</h2>
          <div className="label">SPRINT SYNC · 14 PRIOR INSTANCES · OPENED FROM BRIEF</div>
        </div>
        <button className="close-x" onClick={onClose}>×</button>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:18, marginTop:20}}>
        <div className="sketch" style={{padding:14}}>
          <div className="label">Cadence</div>
          <div className="hand-h2" style={{fontSize:22, marginTop:4}}>Weekly · Tue 10am</div>
          <div style={{fontSize:13, color:'var(--ink-soft)', marginTop:4}}>Last 8 weeks: 7 held · 1 cancelled</div>
        </div>
        <div className="sketch" style={{padding:14}}>
          <div className="label">Decision velocity</div>
          <div className="hand-h2" style={{fontSize:22, marginTop:4}}>2.1 / meeting</div>
          <div style={{fontSize:13, color:'var(--ink-soft)', marginTop:4}}>Trending up vs. last sprint (1.4)</div>
        </div>
      </div>

      <h3 className="hand-h2" style={{fontSize:22, marginTop:22, marginBottom:6}}>Key decisions</h3>
      <div className="decisions">
        {MOCK.DECISIONS.map((d,i)=>(
          <div key={i} className="decision">
            <span className="stamp">DECIDED · {d.when}</span>
            <div className="what">{d.what}</div>
            <div className="why">{d.why}</div>
          </div>
        ))}
      </div>

      <h3 className="hand-h2" style={{fontSize:22, marginTop:22, marginBottom:6}}>Timeline</h3>
      <div className="timeline">
        {MOCK.HISTORY.map((h,i)=>(
          <div key={i} className={`tl-item ${h.key?'key':''}`}>
            <div className="tl-date">{h.date}</div>
            <div className="tl-title">{h.title}</div>
            <div className="tl-body">{h.body}</div>
          </div>
        ))}
      </div>

      <h3 className="hand-h2" style={{fontSize:22, marginTop:22, marginBottom:6}}>All shared documents <span className="label">{MOCK.DOCS.length}</span></h3>
      <ul className="doc-list">
        {MOCK.DOCS.map(d => <DocRow key={d.id} doc={d} onOpen={onOpenDoc} />)}
      </ul>

      <div style={{display:'flex', justifyContent:'flex-end', gap:10, marginTop:22}}>
        <button className="btn ghost" onClick={onClose}>‹ back</button>
        <button className="btn primary" onClick={onJoin}>▶ Join meeting</button>
      </div>
    </div>
  </div>
);


// State 5: Doc preview
const DocPreview = ({ doc, onClose }) => {
  if(!doc) return null;
  return (
    <div className="scrim" onClick={onClose} style={{background:'rgba(20,20,20,.32)'}}>
      <div className="doc-preview" onClick={(e)=>e.stopPropagation()}>
        <div className="head">
          <div style={{display:'flex', gap:12, alignItems:'center'}}>
            <DocIcon kind={doc.color} />
            <div>
              <div className="hand-h2" style={{fontSize:18}}>{doc.name}</div>
              <div className="label">{doc.source} · {doc.touched}</div>
            </div>
          </div>
          <div style={{display:'flex', gap:8}}>
            <AIBadge>AI HIGHLIGHTS · 3</AIBadge>
            <button className="close-x" onClick={onClose}>×</button>
          </div>
        </div>
        <div className="body">
          <div className="doc-page">
            <h1>{doc.name.replace(/\.pdf$/,'')}</h1>
            <div className="meta">{doc.source.toUpperCase()} · 7 PAGES · OWNED BY SAM K. · LAST EDIT {doc.touched.toUpperCase()}</div>
            <h2>1 · Background</h2>
            <p>This document captures the discovery work for Sprint 24, focused on reducing time-to-aha for new sign-ups. We compared the current onboarding (6 questions) against a leaner 3-question variant in two prior tests. Both tests showed activation lift between 4–7%, with no measurable downstream churn impact.</p>
            <div className="placeholder">[ chart placeholder · activation cohorts wk 21-24 ]</div>
            <h2>2 · Proposed change</h2>
            <p>Move paywall placement to immediately after the first 'aha' moment — defined as completing the first project shell. Pricing copy variants are being explored separately and will land before Tue 9am (Sam owns).</p>
            <h2>3 · Risks</h2>
            <p>Android parity is the main risk. The current SDK upgrade blocks the new paywall component on Android; we propose a 1-sprint pause on parity work and a re-evaluation on Apr 29.</p>
            <div className="placeholder">[ screenshot placeholder · paywall A/B/C ]</div>
            <h2>4 · Decision asks</h2>
            <p>Approve 10% rollout for iOS on Tue. Confirm Android pause. Sign off on kill-criteria draft (owed by Mia, Wed).</p>
          </div>
          <div className="doc-side">
            <h4><SparkleIcon size={14} color="#2f7bff" /> AI highlights</h4>
            <div className="high">
              <div className="where">§ 2 — Proposed change</div>
              Paywall moves to <b>post-aha</b>; reversible if activation regresses.
            </div>
            <div className="high">
              <div className="where">§ 3 — Risks</div>
              <b>Android pause</b> proposed for 1 sprint; re-eval Apr 29.
            </div>
            <div className="high">
              <div className="where">§ 4 — Decision asks</div>
              Mia owes <b>kill-criteria draft</b> by Wed.
            </div>

            <h4 style={{marginTop:18}}>Mentions of you</h4>
            <div style={{fontSize:13, color:'var(--ink-soft)', lineHeight:1.5}}>
              "<i>Mia raised concerns about Android parity.</i>" — § 3<br/>
              "<i>Owed by Mia, Wed.</i>" — § 4
            </div>

            <h4 style={{marginTop:18}}>Comments <span className="label">5</span></h4>
            <div style={{fontSize:13, color:'var(--ink-soft)'}}>
              <Avatar initials="SK" tone="#fff1d9" /> Sam · "Pricing copy lands Mon."<br/><br/>
              <Avatar initials="LR" tone="#f3eaff" /> Lena · "3 frames added."
            </div>
          </div>
        </div>
        <div className="foot">
          <button className="btn ghost" onClick={onClose}>‹ back to brief</button>
          <button className="btn">Open in {doc.source}</button>
          <button className="btn primary">Add to brief</button>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { CalendarState, BriefModal, ActionsExpanded, ReviewPanel, DocPreview });
