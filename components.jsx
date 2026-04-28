// Reusable sketchy components

const Pill = ({ tone = "", children }) => (
  <span className={`pill ${tone}`}>{children}</span>
);

const Avatar = ({ initials, tone = "#eee" }) => (
  <span className="avatar" style={{ background: tone }}>{initials}</span>
);

const SparkleIcon = ({ size = 14, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3 L13.5 9.5 L20 11 L13.5 12.5 L12 19 L10.5 12.5 L4 11 L10.5 9.5 Z"/>
    <path d="M19 4 L19.6 6 L21.5 6.6 L19.6 7.2 L19 9 L18.4 7.2 L16.5 6.6 L18.4 6 Z"/>
  </svg>
);

const AIBadge = ({ children = "AI BRIEF" }) => (
  <span className="ai-badge"><SparkleIcon size={11} color="#2f7bff" /> {children}</span>
);

const DocIcon = ({ kind = "doc" }) => (
  <span className={`ico ${kind}`}><span className="lines"></span></span>
);

const DocRow = ({ doc, onOpen }) => (
  <li className="doc" onClick={() => onOpen?.(doc)}>
    <DocIcon kind={doc.color} />
    <div className="meta">
      <div className="name">{doc.name}</div>
      <div className="info">{doc.source} · {doc.touched}</div>
    </div>
    <button className="btn tiny ghost" onClick={(e)=>{e.stopPropagation(); onOpen?.(doc);}}>open ›</button>
  </li>
);

const TaskRow = ({ task, expanded = false }) => {
  const [done, setDone] = React.useState(!!task.done);
  return (
    <li className="task">
      <span className={`checkbox ${done ? 'done' : ''}`} onClick={()=>setDone(d=>!d)}></span>
      <div className="body">
        <div className="what" style={{textDecoration: done ? 'line-through' : 'none', color: done ? 'var(--ink-faint)' : 'var(--ink)'}}>
          {task.what}
        </div>
        <div className="who">
          <Avatar initials={task.initials} tone={task.who === 'You' ? '#eaf1ff' : '#f3f2ec'} />
          <span>{task.who}</span>
          <Pill tone={task.priority === 'high' ? 'warn' : task.priority === 'low' ? 'muted' : ''}>
            due {task.due}
          </Pill>
          {expanded && <Pill tone="muted">from {task.from}</Pill>}
        </div>
      </div>
    </li>
  );
};

const AttendeeRow = ({ a }) => (
  <li className="att">
    <Avatar initials={a.initials} tone={a.avatarTone} />
    <div style={{flex:1}}>
      <div className="name">{a.name}</div>
      <div className="role">{a.role}</div>
    </div>
    {a.tag && (
      <Pill tone={a.tag === 'You' ? 'glow' : a.tag === 'Host' ? 'good' : a.tag === 'New' ? 'warn' : ''}>
        {a.tag}
      </Pill>
    )}
  </li>
);

const Skeleton = ({ w = "100%", h = 14, mt = 0 }) => (
  <div className="skel" style={{ width: w, height: h, marginTop: mt }} />
);

const Annotate = ({ x, y, rotate = -3, children, arrow = "tl" }) => (
  <div className="annotate" style={{ left: x, top: y, transform: `rotate(${rotate}deg)` }}>
    {children}
  </div>
);

Object.assign(window, { Pill, Avatar, SparkleIcon, AIBadge, DocIcon, DocRow, TaskRow, AttendeeRow, Skeleton, Annotate });
