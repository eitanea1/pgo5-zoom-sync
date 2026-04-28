/* Zoom Sync — UI components.
   Depends on window.ZoomSyncIcons, window.ZS_PEOPLE, window.ZS_DESTINATIONS. */

const { useState, useEffect, useRef, useMemo } = React;
const I = window.ZoomSyncIcons;

/* ---------------- Zoom logo (official wordmark simplified) ---------------- */
function ZoomLogo({ height = 20 }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "baseline", gap: 6, lineHeight: 1 }}>
      <span style={{
        fontFamily: "Inter, sans-serif",
        fontWeight: 800,
        fontSize: height,
        color: "#2D8CFF",
        letterSpacing: "-0.03em",
      }}>zoom</span>
      <span style={{
        fontFamily: "Inter, sans-serif",
        fontWeight: 600,
        fontSize: height,
        color: "#2D8CFF",
        letterSpacing: "-0.01em",
      }}>Sync</span>
    </div>
  );
}

/* ---------------- Avatar ---------------- */
function Avatar({ person, size = "md" }) {
  if (!person) {
    return (
      <div className={`zs-avatar ${size === "sm" ? "zs-avatar--sm" : size === "lg" ? "zs-avatar--lg" : ""}`}
           style={{ background: "var(--zs-bg-4)", color: "var(--zs-text-lo)" }}>?</div>
    );
  }
  return (
    <div className={`zs-avatar ${size === "sm" ? "zs-avatar--sm" : size === "lg" ? "zs-avatar--lg" : ""}`}
         style={{ background: person.color }}>
      {person.photo
        ? <img src={person.photo} alt={person.name} onError={(e) => { e.target.style.display = "none"; }} />
        : person.initials}
    </div>
  );
}

/* ---------------- Participant tile ---------------- */
function Tile({ person, speaking, muted, isSelf }) {
  return (
    <div className={`zs-tile ${speaking ? "zs-tile--speaking" : ""}`}>
      {person.photo ? (
        <img className="zs-tile__media" src={person.photo} alt={person.name}
             onError={(e) => { e.target.style.display = "none"; }} />
      ) : (
        <div className="zs-tile__media" style={{
          background: `linear-gradient(135deg, ${person.color} 0%, #0A0D12 120%)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#fff", fontSize: 32, fontWeight: 700, letterSpacing: "-0.02em",
        }}>{person.initials}</div>
      )}
      <div className="zs-tile__overlay" />
      <div className="zs-tile__name">
        {speaking && <span className="zs-livedot" />}
        {person.name}{isSelf ? " (you)" : ""}
      </div>
      <div className={`zs-tile__mic ${muted ? "zs-tile__mic--muted" : ""}`}>
        {muted ? <I.MicOff size={14} strokeWidth={2} /> : <I.MicOn size={14} strokeWidth={2} />}
      </div>
    </div>
  );
}

/* ---------------- Toolbar icon button ---------------- */
function ToolBtn({ icon: Icon, label, active, danger, onClick, children, wide }) {
  return (
    <button
      className="zs-icon-btn"
      data-active={active ? "true" : "false"}
      onClick={onClick}
      style={{
        minWidth: wide ? 72 : 56,
        color: danger ? "#fff" : "var(--zs-text-hi)",
        background: danger ? "var(--zs-red-500)" : undefined,
      }}
    >
      {Icon && <Icon size={22} />}
      {children}
      <span className="zs-icon-btn__label" style={{ color: danger ? "rgba(255,255,255,0.85)" : undefined }}>{label}</span>
    </button>
  );
}

/* ---------------- Destination dropdown ---------------- */
function DestinationPicker({ value, onChange, locked = false }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const dest = ZS_DESTINATIONS.find((d) => d.id === value) || ZS_DESTINATIONS[0];

  useEffect(() => {
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  if (locked) {
    return (
      <span
        title="Destination locked — task already accepted"
        style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "4px 8px", borderRadius: 6,
          background: "var(--zs-bg-2)", border: "1px solid var(--zs-line)",
          fontSize: 11, fontWeight: 600, color: "var(--zs-text-md)",
          cursor: "default",
        }}
      >
        <DestinationLogo id={dest.id} size={14} />
        <span style={{ color: "var(--zs-text-md)" }}>{dest.name}</span>
        <I.Lock size={11} strokeWidth={2} style={{ color: "var(--zs-text-lo)", marginLeft: 1 }} />
      </span>
    );
  }

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "4px 8px", borderRadius: 6,
          background: "var(--zs-bg-3)", border: "1px solid var(--zs-line)",
          fontSize: 11, fontWeight: 600, color: "var(--zs-text-md)",
        }}
      >
        <DestinationLogo id={dest.id} size={14} />
        <span style={{ color: "var(--zs-text-hi)" }}>{dest.name}</span>
        <I.ChevronDown size={12} strokeWidth={2} />
      </button>
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 20,
          minWidth: 200, background: "var(--zs-bg-2)",
          border: "1px solid var(--zs-line-strong)", borderRadius: 10,
          boxShadow: "var(--zs-shadow-lg)", padding: 4,
        }}>
          {ZS_DESTINATIONS.map((d) => (
            <button key={d.id} onClick={() => { onChange(d.id); setOpen(false); }}
              style={{
                display: "flex", alignItems: "center", gap: 10, width: "100%",
                padding: "8px 10px", borderRadius: 6,
                background: d.id === value ? "var(--zs-bg-4)" : "transparent",
                color: "var(--zs-text-hi)", fontSize: 12, fontWeight: 600, textAlign: "left",
              }}
              onMouseEnter={(e) => { if (d.id !== value) e.currentTarget.style.background = "var(--zs-bg-3)"; }}
              onMouseLeave={(e) => { if (d.id !== value) e.currentTarget.style.background = "transparent"; }}
            >
              <DestinationLogo id={d.id} size={18} />
              <div style={{ flex: 1 }}>
                <div>{d.name}</div>
                <div style={{ fontSize: 10, color: "var(--zs-text-lo)", fontWeight: 500 }}>{d.project}</div>
              </div>
              {d.id === value && <I.Check size={14} strokeWidth={2.5} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------- Assignee picker dropdown ---------------- */
function AssigneePicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const person = ZS_PEOPLE.find((p) => p.id === value);

  useEffect(() => {
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "4px 8px", borderRadius: 6,
          background: "var(--zs-bg-3)", border: "1px solid var(--zs-line)",
          fontSize: 11, fontWeight: 600,
        }}
      >
        <Avatar person={person} size="sm" />
        <span style={{ color: person ? "var(--zs-text-hi)" : "var(--zs-text-lo)" }}>
          {person ? person.name.split(" ")[0] : "Unassigned"}
        </span>
        <I.ChevronDown size={12} strokeWidth={2} />
      </button>
      {open && (
        <div className="zs-scroll" style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 30,
          minWidth: 220, maxHeight: 260, overflowY: "auto",
          background: "var(--zs-bg-2)",
          border: "1px solid var(--zs-line-strong)", borderRadius: 10,
          boxShadow: "var(--zs-shadow-lg)", padding: 4,
        }}>
          <div style={{ padding: "6px 10px 4px", fontSize: 10, fontWeight: 700,
                        letterSpacing: "0.06em", textTransform: "uppercase",
                        color: "var(--zs-text-dim)" }}>Assign to</div>
          <button
            onClick={() => { onChange(null); setOpen(false); }}
            style={{
              display: "flex", alignItems: "center", gap: 8, width: "100%",
              padding: "8px 10px", borderRadius: 6,
              background: value == null ? "var(--zs-bg-4)" : "transparent",
              color: "var(--zs-text-md)", fontSize: 12, fontWeight: 600, textAlign: "left",
            }}
            onMouseEnter={(e) => { if (value != null) e.currentTarget.style.background = "var(--zs-bg-3)"; }}
            onMouseLeave={(e) => { if (value != null) e.currentTarget.style.background = "transparent"; }}
          >
            <div style={{
              width: 24, height: 24, borderRadius: "50%",
              border: "1px dashed var(--zs-line-strong)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "var(--zs-text-lo)", flex: "none",
            }}>
              <I.User size={12} strokeWidth={2} />
            </div>
            <span style={{ flex: 1 }}>Unassigned</span>
            {value == null && <I.Check size={14} strokeWidth={2.5} />}
          </button>
          <div style={{ height: 1, background: "var(--zs-line)", margin: "4px 6px" }} />
          {ZS_PEOPLE.map((p) => (
            <button key={p.id} onClick={() => { onChange(p.id); setOpen(false); }}
              style={{
                display: "flex", alignItems: "center", gap: 8, width: "100%",
                padding: "6px 10px", borderRadius: 6,
                background: p.id === value ? "var(--zs-bg-4)" : "transparent",
                color: "var(--zs-text-hi)", fontSize: 12, fontWeight: 600, textAlign: "left",
              }}
              onMouseEnter={(e) => { if (p.id !== value) e.currentTarget.style.background = "var(--zs-bg-3)"; }}
              onMouseLeave={(e) => { if (p.id !== value) e.currentTarget.style.background = "transparent"; }}
            >
              <Avatar person={p} size="sm" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {p.name}{p.id === "me" ? " (you)" : ""}
                </div>
                {p.role && <div style={{ fontSize: 10, color: "var(--zs-text-lo)", fontWeight: 500 }}>{p.role}</div>}
              </div>
              {p.id === value && <I.Check size={14} strokeWidth={2.5} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------- Trigger-type attribution helper ---------------- */
/* Renders a one-line cue showing WHY the AI created this task — the speaker
   plus the verb that maps to the trigger type. Surfaces the four PRD trigger
   styles without adding a dedicated component. */
function attributionLabel(task) {
  const speaker = ZS_PEOPLE.find((p) => p.id === task.speaker);
  const speakerName = speaker ? speaker.name.split(" ")[0] : "Someone";
  switch (task.trigger) {
    case "volunteered":   return `${speakerName} volunteered`;
    case "role_specific": return `${speakerName} asked the room`;
    case "unattributed":  return `${speakerName} raised it`;
    case "name_spoken":   return `${speakerName} asked`;
    default:              return null;
  }
}

/* ---------------- Deadline urgency helper ---------------- */
/* Parses the human-readable due string ("Thu, May 1", "Tomorrow", etc.)
   against today's date and returns { color, text } for the inline label
   under the title. Returns null when there's no real deadline.
     overdue                 -> red
     today / tomorrow        -> red / amber
     within 3 days           -> amber
     within a week           -> soft yellow
     later                   -> muted text
   Year is wrapped to next year if the parsed date is meaningfully in the
   past (so "May 1" parsed in mid-October still reads as next year's May). */
function deadlineMeta(due) {
  if (!due || /^no due/i.test(due)) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const lower = due.toLowerCase();
  let target;
  if (lower === "today") {
    target = new Date(today);
  } else if (lower === "tomorrow") {
    target = new Date(today);
    target.setDate(target.getDate() + 1);
  } else {
    target = new Date(`${due}, ${today.getFullYear()}`);
    if (isNaN(target.getTime())) {
      return { color: "var(--zs-text-md)", text: `Due ${due}` };
    }
    target.setHours(0, 0, 0, 0);
    if (target < today && (today - target) > 7 * 86400000) {
      target.setFullYear(target.getFullYear() + 1);
    }
  }
  const diffDays = Math.round((target - today) / 86400000);
  if (diffDays < 0)    return { color: "var(--zs-red-500)",   text: `Overdue · ${due}` };
  if (diffDays === 0)  return { color: "var(--zs-red-500)",   text: "Due today" };
  if (diffDays === 1)  return { color: "var(--zs-amber-500)", text: "Due tomorrow" };
  if (diffDays <= 3)   return { color: "var(--zs-amber-500)", text: `Due ${due}` };
  if (diffDays <= 7)   return { color: "#FCCB6D",             text: `Due ${due}` };
  return                       { color: "var(--zs-text-md)",  text: `Due ${due}` };
}

window.deadlineMeta = deadlineMeta;

/* ---------------- Task card ---------------- */
function TaskCard({ task, isNew, onAssign, onDestination, onDismiss, onAccept, onAcceptAsMine, onConfirm, onEditTitle }) {
  const person = ZS_PEOPLE.find((p) => p.id === task.owner);
  const attribution = attributionLabel(task);
  const departing = task.departing === true;
  const isUnassigned = task.owner == null;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(task.title);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const titleInputRef = useRef(null);
  // Sync draft if the underlying task title changes externally and we're not editing
  useEffect(() => { if (!editing) setDraft(task.title); }, [task.title, editing]);
  // Focus + select-all when entering edit mode
  useEffect(() => {
    if (editing && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [editing]);
  const startEditTitle = () => { if (onEditTitle) { setDraft(task.title); setEditing(true); } };
  const commitEditTitle = () => {
    const next = draft.trim();
    if (next && next !== task.title && onEditTitle) onEditTitle(next);
    setEditing(false);
  };
  const cancelEditTitle = () => { setDraft(task.title); setEditing(false); };
  return (
    <div
      className={`zs-task ${task.lowConfidence ? "zs-task--lowconf" : ""} ${isNew ? "zs-task--new" : ""}`}
      style={{
        transition: "transform 380ms cubic-bezier(0.4, 0, 1, 1), opacity 380ms",
        transform: departing ? "translateX(120%)" : undefined,
        opacity: departing ? 0 : 1,
        pointerEvents: departing ? "none" : "auto",
      }}
    >
      {task.lowConfidence && (
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span className="zs-chip zs-chip--warn">
            <I.Warning size={10} strokeWidth={2.5} /> Review
          </span>
        </div>
      )}

      {editing ? (
        <input
          ref={titleInputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") { e.preventDefault(); commitEditTitle(); }
            else if (e.key === "Escape") { e.preventDefault(); cancelEditTitle(); }
          }}
          onBlur={commitEditTitle}
          style={{
            fontSize: 14, fontWeight: 600, color: "var(--zs-text-hi)", lineHeight: 1.35,
            background: "var(--zs-bg-1)", border: "1px solid var(--zs-blue-400)",
            borderRadius: 4, padding: "3px 6px", outline: "none", width: "100%",
            fontFamily: "inherit",
          }}
        />
      ) : (
        <div
          onClick={startEditTitle}
          title={onEditTitle ? "Click to edit" : undefined}
          style={{
            fontSize: 14, fontWeight: 600, color: "var(--zs-text-hi)", lineHeight: 1.35,
            cursor: onEditTitle ? "text" : "default",
            padding: "3px 6px", margin: "0 -6px",
            borderRadius: 4,
            transition: "background 120ms",
          }}
          onMouseEnter={(e) => { if (onEditTitle) e.currentTarget.style.background = "var(--zs-bg-3)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
        >
          {task.title}
        </div>
      )}

      {(() => {
        const dl = deadlineMeta(task.due);
        return dl && (
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            fontSize: 11, fontWeight: 600, color: dl.color,
            width: "fit-content",
          }}>
            <I.Clock size={11} strokeWidth={2.2} />
            {dl.text}
          </div>
        );
      })()}

      {attribution && (
        <button
          onClick={() => setQuoteOpen(!quoteOpen)}
          style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            padding: "2px 4px", borderRadius: 4,
            background: "transparent",
            border: "none",
            fontSize: 11, fontWeight: 500, color: "var(--zs-text-lo)",
            cursor: "pointer", width: "fit-content",
            transition: "color 120ms",
            margin: "0 -4px",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "var(--zs-text-hi)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "var(--zs-text-lo)"; }}
        >
          {quoteOpen
            ? <I.ChevronUp size={11} strokeWidth={2.5} />
            : <I.ChevronDown size={11} strokeWidth={2.5} />}
          <span>{quoteOpen ? "Hide quote" : "Show quote"}</span>
          {isUnassigned && (
            <>
              <span style={{ color: "var(--zs-text-dim)" }}>·</span>
              <span>{attribution}</span>
            </>
          )}
        </button>
      )}

      {quoteOpen && (
        <div style={{
          padding: "6px 10px", borderLeft: "2px solid var(--zs-bg-4)",
          display: "flex", flexDirection: "column", gap: 3,
        }}>
          {!isUnassigned && attribution && (
            <span className="zs-overline" style={{ color: "var(--zs-text-dim)" }}>
              {attribution}
            </span>
          )}
          <span style={{
            fontSize: 11, fontStyle: "italic", color: "var(--zs-text-lo)", lineHeight: 1.4,
          }}>
            “{task.quote}”
          </span>
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginTop: 2 }}>
        <AssigneePicker value={task.owner} onChange={onAssign} />
        <DestinationPicker value={task.destination} onChange={onDestination} />
      </div>

      {/* Action row — variant depends on assignment + confidence:
          - low-confidence  : Confirm / Dismiss
          - unassigned      : Accept as mine / Dismiss   (claims the task to "me")
          - assigned        : Accept / Dismiss            (sends to destination) */}
      {task.lowConfidence ? (
        <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
          <button className="zs-btn zs-btn--primary zs-btn--sm" onClick={onConfirm} style={{ flex: 1 }}>
            <I.Check size={12} strokeWidth={2.5} /> Confirm
          </button>
          <button className="zs-btn zs-btn--secondary zs-btn--sm" onClick={onDismiss} style={{ flex: 1 }}>
            <I.X size={12} strokeWidth={2} /> Dismiss
          </button>
        </div>
      ) : isUnassigned && onAcceptAsMine ? (
        <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
          <button className="zs-btn zs-btn--primary zs-btn--sm" onClick={() => onAcceptAsMine(task)} style={{ flex: 1 }}>
            <I.Check size={12} strokeWidth={2.5} /> Accept as mine
          </button>
          <button className="zs-btn zs-btn--secondary zs-btn--sm" onClick={onDismiss} style={{ flex: 1 }}>
            <I.X size={12} strokeWidth={2} /> Dismiss
          </button>
        </div>
      ) : (
        onAccept && (
          <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
            <button className="zs-btn zs-btn--primary zs-btn--sm" onClick={() => onAccept(task)} style={{ flex: 1 }}>
              <I.Check size={12} strokeWidth={2.5} /> Accept
            </button>
            <button className="zs-btn zs-btn--secondary zs-btn--sm" onClick={onDismiss} style={{ flex: 1 }}>
              <I.X size={12} strokeWidth={2} /> Dismiss
            </button>
          </div>
        )
      )}
    </div>
  );
}

/* ---------------- Detection toast ---------------- */
function DetectionToast({ person, phrase }) {
  return (
    <div className="zs-toast">
      <div className="zs-toast__icon"><I.Sparkle size={18} strokeWidth={2} /></div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
          <span className="zs-overline" style={{ color: "#C7B3FF" }}>Task detected</span>
          <span style={{ color: "#C7B3FF" }} className="zs-wave" aria-hidden="true">
            <span /><span /><span /><span />
          </span>
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--zs-text-hi)",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {phrase}
        </div>
        <div style={{ fontSize: 11, color: "var(--zs-text-md)", marginTop: 2 }}>
          From {person?.name ?? "the conversation"} · capturing now…
        </div>
      </div>
    </div>
  );
}

/* ---------------- Meeting header ---------------- */
function Header({ elapsed, taskCount, host }) {
  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");
  return (
    <header style={{
      height: "var(--zs-header-h)", padding: "0 20px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      borderBottom: "1px solid var(--zs-line)", background: "var(--zs-bg-1)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <ZoomLogo height={20} />
        <div className="zs-divider--v" style={{ height: 22 }} />
        <div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>Q2 Roadmap Review</div>
          <div style={{ fontSize: 11, color: "var(--zs-text-lo)" }}>
            Host: {host} · Meeting ID 842 · {mm}:{ss}
          </div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span className="zs-chip zs-chip--live">
          <span className="zs-livedot" /> LIVE
        </span>
        <span className="zs-chip zs-chip--ai">
          <I.Sparkle size={10} strokeWidth={2.5} /> Sync · {taskCount} tasks
        </span>
        <button className="zs-btn zs-btn--ghost zs-btn--sm" style={{ color: "var(--zs-text-md)" }}>
          <I.Shield size={14} strokeWidth={2} /> Encrypted
        </button>
      </div>
    </header>
  );
}

Object.assign(window, {
  ZoomLogo, Avatar, Tile, ToolBtn, DestinationPicker, TaskCard, DetectionToast, Header,
});

/* ---------------- Participants panel ---------------- */
function ParticipantsPanel({ onClose, speakerId, muted, host }) {
  const I = window.ZoomSyncIcons;
  const { useState, useMemo } = React;
  const [q, setQ] = useState("");
  const people = ZS_PEOPLE;

  // Stable per-session state for hand/video/mute per person
  const meta = useMemo(() => {
    const m = {};
    people.forEach((p, i) => {
      m[p.id] = {
        video: true,
        handRaised: p.id === "priya",
        isHost: p.id === "me",
        muted: p.id === "sam" || p.id === "lin",
      };
    });
    return m;
  }, []);

  const filtered = people.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));
  const speakingCount = 1;
  const handCount = people.filter((p) => meta[p.id].handRaised).length;

  return (
    <aside className="zs-panel zs-scroll"
      style={{ width: "var(--zs-panel-w)", flex: "none", height: "100%" }}>
      <div className="zs-panel__header">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: "var(--zs-blue-100)", color: "var(--zs-blue-400)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <I.Participants size={16} strokeWidth={2} />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: "-0.01em" }}>
              Participants ({people.length})
            </div>
            <div style={{ fontSize: 11, color: "var(--zs-text-lo)" }}>
              {speakingCount} speaking · {handCount} raised hand
            </div>
          </div>
        </div>
        <button className="zs-btn zs-btn--ghost zs-btn--sm" onClick={onClose} title="Close panel">
          <I.X size={14} strokeWidth={2} />
        </button>
      </div>

      <div style={{ padding: "12px 16px 8px" }}>
        <div style={{ position: "relative" }}>
          <I.Search size={13} strokeWidth={2} style={{
            position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)",
            color: "var(--zs-text-lo)",
          }} />
          <input
            className="zs-input"
            placeholder="Search participants…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            style={{ paddingLeft: 28, height: 32, fontSize: 12 }}
          />
        </div>
      </div>

      <div className="zs-panel__body zs-scroll" style={{ padding: "0 8px 12px" }}>
        {filtered.map((p) => {
          const m = meta[p.id];
          const isSpeaking = p.id === speakerId;
          const isMuted = (p.id === "me" && muted) || m.muted;
          return (
            <div key={p.id} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "8px 10px", borderRadius: 8,
              background: isSpeaking ? "rgba(23,178,106,0.08)" : "transparent",
              border: isSpeaking ? "1px solid rgba(23,178,106,0.25)" : "1px solid transparent",
              marginBottom: 2,
            }}>
              <div style={{ position: "relative", flex: "none" }}>
                <Avatar person={p} size="md" />
                {m.handRaised && (
                  <div style={{
                    position: "absolute", top: -4, right: -4,
                    width: 18, height: 18, borderRadius: 9,
                    background: "#F5A524", color: "#1a1207",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, border: "2px solid var(--zs-bg-1)",
                  }}>✋</div>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--zs-text-hi)",
                                 whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {p.name}{p.id === "me" ? " (you)" : ""}
                  </span>
                  {m.isHost && (
                    <span style={{ fontSize: 10, fontWeight: 600,
                      color: "var(--zs-blue-400)", background: "var(--zs-blue-100)",
                      padding: "1px 5px", borderRadius: 4 }}>Host</span>
                  )}
                </div>
                <div style={{ fontSize: 11, color: "var(--zs-text-lo)", display: "flex", alignItems: "center", gap: 6 }}>
                  {isSpeaking ? (
                    <>
                      <span style={{ color: "var(--zs-green-500)" }} className="zs-wave">
                        <span /><span /><span /><span />
                      </span>
                      <span style={{ color: "var(--zs-green-500)", fontWeight: 600 }}>Speaking</span>
                    </>
                  ) : m.handRaised ? "Hand raised" : "Listening"}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--zs-text-lo)" }}>
                <span title={isMuted ? "Muted" : "Unmuted"}
                  style={{ color: isMuted ? "var(--zs-red-500)" : "var(--zs-text-md)" }}>
                  {isMuted ? <I.MicOff size={16} strokeWidth={2} /> : <I.MicOn size={16} strokeWidth={2} />}
                </span>
                <span title={m.video ? "Video on" : "Video off"}
                  style={{ color: m.video ? "var(--zs-text-md)" : "var(--zs-red-500)" }}>
                  {m.video ? <I.VideoOn size={16} strokeWidth={2} /> : <I.VideoOff size={16} strokeWidth={2} />}
                </span>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div style={{ padding: "24px 12px", textAlign: "center", color: "var(--zs-text-lo)", fontSize: 12 }}>
            No one matches “{q}”.
          </div>
        )}
      </div>

      <div style={{
        padding: "10px 16px", borderTop: "1px solid var(--zs-line)",
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
      }}>
        <button className="zs-btn zs-btn--secondary zs-btn--sm" style={{ flex: 1 }}>
          <I.Plus size={12} strokeWidth={2.5} /> Invite
        </button>
        <button className="zs-btn zs-btn--secondary zs-btn--sm" style={{ flex: 1 }}>
          Mute all
        </button>
      </div>
    </aside>
  );
}

window.ParticipantsPanel = ParticipantsPanel;

/* ---------------- End meeting dialog ---------------- */
function EndMeetingDialog({ onCancel, onEnd, pendingCount }) {
  return (
    <div
      onClick={onCancel}
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "rgba(0,0,0,0.55)",
        display: "flex", alignItems: "center", justifyContent: "center",
        animation: "zs-toast-in 200ms ease-out",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(420px, calc(100% - 32px))",
          background: "var(--zs-bg-2)",
          border: "1px solid var(--zs-line-strong)",
          borderRadius: 14,
          boxShadow: "var(--zs-shadow-lg)",
          padding: 22,
        }}
      >
        <div style={{ fontSize: 18, fontWeight: 700, color: "var(--zs-text-hi)", letterSpacing: "-0.01em", marginBottom: 6 }}>
          End the meeting?
        </div>
        <div style={{ fontSize: 13, color: "var(--zs-text-md)", lineHeight: 1.45, marginBottom: 14 }}>
          This will end the meeting for everyone and show the post-meeting summary.
        </div>
        {pendingCount > 0 && (
          <div style={{
            fontSize: 12, color: "var(--zs-amber-500)",
            background: "rgba(245, 165, 36, 0.10)",
            border: "1px solid rgba(245, 165, 36, 0.28)",
            borderRadius: 8, padding: "8px 10px", marginBottom: 14,
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <I.Warning size={13} strokeWidth={2.5} />
            <span><strong>{pendingCount}</strong> {pendingCount === 1 ? "task" : "tasks"} still pending — you'll see them in the summary.</span>
          </div>
        )}
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button className="zs-btn zs-btn--secondary" onClick={onCancel} style={{ height: 36, padding: "0 16px" }}>
            Cancel
          </button>
          <button className="zs-btn zs-btn--danger" onClick={onEnd} style={{ height: 36, padding: "0 16px" }}>
            End meeting
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Summary modal (post-meeting) ---------------- */
function SummaryRow({ task, status }) {
  const dest = ZS_DESTINATIONS.find((d) => d.id === task.destination);
  const owner = ZS_PEOPLE.find((p) => p.id === task.owner);
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: 10,
      padding: "10px 12px", borderRadius: 8,
      background: "var(--zs-bg-1)", border: "1px solid var(--zs-line)",
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--zs-text-hi)", lineHeight: 1.35, marginBottom: 4 }}>
          {task.title}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", fontSize: 11, color: "var(--zs-text-lo)" }}>
          {owner ? (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
              <Avatar person={owner} size="sm" />
              <span style={{ color: "var(--zs-text-md)" }}>{owner.name.split(" ")[0]}</span>
            </span>
          ) : (
            <span style={{ color: "var(--zs-text-dim)" }}>Unassigned</span>
          )}
          {dest && <span style={{ color: "var(--zs-text-dim)" }}>·</span>}
          {dest && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
              <DestinationLogo id={dest.id} size={12} /> {dest.name}
            </span>
          )}
          {task.due && (
            <>
              <span style={{ color: "var(--zs-text-dim)" }}>·</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
                <I.Clock size={10} strokeWidth={2} /> {task.due}
              </span>
            </>
          )}
        </div>
      </div>
      {status === "accepted" && (
        <span className="zs-chip" style={{
          background: "rgba(23,178,106,0.14)", color: "#6EE0A8",
          borderColor: "rgba(23,178,106,0.28)", flex: "none",
        }}>
          <I.Check size={10} strokeWidth={2.5} /> Sent
        </span>
      )}
    </div>
  );
}

function SuggestedAbsentRow({ task, suggestion, onAssign }) {
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: 10,
      padding: "12px", borderRadius: 8,
      background: "rgba(139,92,246,0.06)",
      border: "1px solid rgba(139,92,246,0.30)",
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--zs-text-hi)", lineHeight: 1.35, marginBottom: 4 }}>
          {task.title}
        </div>
        <div style={{
          fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
          color: "#C7B3FF", marginBottom: 6, display: "flex", alignItems: "center", gap: 6,
        }}>
          <I.Sparkle size={10} strokeWidth={2.5} /> Suggested
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Avatar person={suggestion} size="sm" />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--zs-text-hi)" }}>
              {suggestion.name} <span style={{ color: "var(--zs-text-lo)", fontWeight: 500 }}>(not in meeting)</span>
            </div>
            <div style={{ fontSize: 10, color: "var(--zs-text-lo)" }}>{suggestion.role}</div>
          </div>
        </div>
      </div>
      <button
        className="zs-btn zs-btn--primary zs-btn--sm"
        onClick={() => onAssign(task, suggestion)}
        style={{ flex: "none" }}
      >
        <I.Send size={11} strokeWidth={2.5} /> Assign to {suggestion.name.split(" ")[0]}
      </button>
    </div>
  );
}

function SummaryModal({ elapsed, accepted, pending, unassigned, suggestedAbsent, onClose, onAssignAbsent }) {
  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");
  // Pull the FIRST unassigned task as the candidate for absent assignment
  const sarahTask = unassigned[0];
  const showSarah = sarahTask && suggestedAbsent;
  const otherUnassigned = showSarah ? unassigned.slice(1) : unassigned;

  const Section = ({ title, count, children, accent }) => (
    count > 0 ? (
      <section style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 4px",
        }}>
          <div style={{
            fontSize: 11, fontWeight: 700, letterSpacing: "0.06em",
            textTransform: "uppercase", color: accent || "var(--zs-text-md)",
          }}>{title}</div>
          <div style={{ fontSize: 11, color: "var(--zs-text-lo)" }}>{count}</div>
        </div>
        {children}
      </section>
    ) : null
  );

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "rgba(0,0,0,0.6)",
        display: "flex", alignItems: "center", justifyContent: "center",
        animation: "zs-toast-in 240ms ease-out",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(560px, calc(100% - 32px))",
          maxHeight: "calc(100vh - 64px)",
          background: "var(--zs-bg-2)",
          border: "1px solid var(--zs-line-strong)",
          borderRadius: 14,
          boxShadow: "var(--zs-shadow-lg)",
          display: "flex", flexDirection: "column",
        }}
      >
        <div style={{
          padding: "18px 22px", borderBottom: "1px solid var(--zs-line)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--zs-text-hi)", letterSpacing: "-0.01em" }}>
              Meeting summary
            </div>
            <div style={{ fontSize: 11, color: "var(--zs-text-lo)", marginTop: 2 }}>
              Q2 Roadmap Review · {mm}:{ss} elapsed · {accepted.length + pending.length + unassigned.length} tasks captured
            </div>
          </div>
          <button className="zs-btn zs-btn--ghost zs-btn--sm" onClick={onClose} title="Close">
            <I.X size={14} strokeWidth={2} />
          </button>
        </div>

        <div className="zs-scroll" style={{
          flex: 1, overflowY: "auto", padding: "16px 22px",
          display: "flex", flexDirection: "column", gap: 18,
        }}>
          <Section title="Accepted" count={accepted.length} accent="#6EE0A8">
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {accepted.map((t) => <SummaryRow key={t.id} task={t} status="accepted" />)}
            </div>
          </Section>

          <Section title="Still pending" count={pending.length}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {pending.map((t) => <SummaryRow key={t.id} task={t} status="pending" />)}
            </div>
          </Section>

          <Section title="Unassigned still open" count={unassigned.length} accent="#FCCB6D">
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {showSarah && (
                <SuggestedAbsentRow task={sarahTask} suggestion={suggestedAbsent} onAssign={onAssignAbsent} />
              )}
              {otherUnassigned.map((t) => <SummaryRow key={t.id} task={t} status="unassigned" />)}
            </div>
          </Section>

          {accepted.length === 0 && pending.length === 0 && unassigned.length === 0 && (
            <div style={{
              padding: "32px 16px", textAlign: "center", color: "var(--zs-text-lo)",
              border: "1px dashed var(--zs-line)", borderRadius: 10,
            }}>
              <I.CheckCircle size={28} strokeWidth={1.5} style={{ margin: "0 auto 8px", color: "var(--zs-text-dim)" }} />
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--zs-text-md)" }}>No tasks captured</div>
              <div style={{ fontSize: 11, marginTop: 4 }}>Sync didn't pick up any action items this meeting.</div>
            </div>
          )}
        </div>

        <div style={{
          padding: "12px 22px", borderTop: "1px solid var(--zs-line)",
          display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8,
        }}>
          <button className="zs-btn zs-btn--secondary" onClick={onClose} style={{ height: 34, padding: "0 14px" }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

window.EndMeetingDialog = EndMeetingDialog;
window.SummaryModal = SummaryModal;

/* ---------------- Out-of-meeting notification ---------------- */
/* Floating card bottom-right that mocks the recipient's app receiving a
   task assignment after the meeting has ended. Renders for the absent
   assignee chosen via the SummaryModal "Suggested" row. */
function OutOfMeetingNotification({ task, suggestion, assignerName, onAccept, onDecline }) {
  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 90,
      width: "min(380px, calc(100% - 32px))",
      animation: "zs-toast-in 320ms cubic-bezier(0.22, 1, 0.36, 1)",
    }}>
      <div style={{
        background: "var(--zs-bg-2)",
        border: "1px solid var(--zs-line-strong)",
        borderRadius: 12,
        padding: 14,
        boxShadow: "var(--zs-shadow-lg)",
        display: "flex", flexDirection: "column", gap: 10,
        position: "relative",
      }}>
        {/* "Mocking Sarah's app" header strip */}
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          paddingBottom: 8, borderBottom: "1px solid var(--zs-line)",
        }}>
          <div style={{
            width: 22, height: 22, borderRadius: 6,
            background: "rgba(139,92,246,0.18)", color: "#C7B3FF",
            display: "flex", alignItems: "center", justifyContent: "center", flex: "none",
          }}>
            <I.Sparkle size={12} strokeWidth={2.2} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 10, fontWeight: 700, letterSpacing: "0.06em",
              color: "#C7B3FF", textTransform: "uppercase",
            }}>
              Zoom Sync · {suggestion.name.split(" ")[0]}'s app
            </div>
            <div style={{ fontSize: 11, color: "var(--zs-text-lo)" }}>
              {assignerName} assigned you a task · expires in 72h
            </div>
          </div>
        </div>

        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--zs-text-hi)", lineHeight: 1.35 }}>
          {task.title}
        </div>

        <div style={{
          padding: "6px 10px", borderLeft: "2px solid var(--zs-bg-4)",
          fontSize: 11, fontStyle: "italic", color: "var(--zs-text-lo)", lineHeight: 1.4,
        }}>
          “{task.quote}”
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--zs-text-md)" }}>
          {task.due && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
              <I.Clock size={11} strokeWidth={2} /> {task.due}
            </span>
          )}
          <span style={{ color: "var(--zs-text-dim)" }}>·</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
            <DestinationLogo id={task.destination || "asana"} size={12} /> {(ZS_DESTINATIONS.find(d => d.id === task.destination) || ZS_DESTINATIONS[1]).name}
          </span>
        </div>

        <div style={{ display: "flex", gap: 6, marginTop: 2 }}>
          <button className="zs-btn zs-btn--primary zs-btn--sm" onClick={onAccept} style={{ flex: 1 }}>
            <I.Check size={12} strokeWidth={2.5} /> Accept
          </button>
          <button className="zs-btn zs-btn--secondary zs-btn--sm" onClick={onDecline} style={{ flex: 1 }}>
            <I.X size={12} strokeWidth={2} /> Decline
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Resolution toast ---------------- */
/* Top-center toast confirming Sarah's accept/decline. Different from the
   sent-to-destination toast — this one shows the assignee's avatar and
   accent color depends on accept (green) vs decline (amber). */
function ResolutionToast({ kind, assignee, message, sub }) {
  const accent = kind === "accepted" ? "var(--zs-green-500)" : "var(--zs-amber-500)";
  return (
    <div style={{
      position: "relative",
      padding: "12px 14px 12px 18px",
      display: "flex", alignItems: "flex-start", gap: 12,
      background: "var(--zs-bg-2)",
      border: "1px solid var(--zs-line)",
      borderRadius: 12,
      boxShadow: "var(--zs-shadow-lg)",
      overflow: "hidden",
      animation: "zs-toast-in 320ms cubic-bezier(0.22, 1, 0.36, 1)",
    }}>
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: accent }} />
      <Avatar person={assignee} size="md" />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          fontSize: 11, fontWeight: 600, color: accent,
          textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 3,
        }}>
          {kind === "accepted" ? <I.Check size={11} strokeWidth={3} /> : <I.X size={11} strokeWidth={3} />}
          {kind === "accepted" ? "Accepted" : "Declined"}
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--zs-text-hi)", letterSpacing: "-0.005em", lineHeight: 1.35 }}>
          {message}
        </div>
        {sub && (
          <div style={{ fontSize: 11, color: "var(--zs-text-lo)", marginTop: 3 }}>
            {sub}
          </div>
        )}
      </div>
    </div>
  );
}

window.OutOfMeetingNotification = OutOfMeetingNotification;
window.ResolutionToast = ResolutionToast;

/* ---------------- Leave meeting dialog (attendee) ---------------- */
/* Shown to participants when they click End. Surfaces their pending
   tasks before they leave so they can decide. The host has a different
   ceremony (EndMeetingDialog -> SummaryModal) per PRD audit G3b. */
function LeaveMeetingDialog({ viewer, pendingTasks, onCancel, onLeave, onAccept, onDismiss, leaveLabel = "Leave meeting", title = "Leaving the meeting?" }) {
  const count = pendingTasks.length;
  return (
    <div
      onClick={onCancel}
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "rgba(0,0,0,0.55)",
        display: "flex", alignItems: "center", justifyContent: "center",
        animation: "zs-toast-in 200ms ease-out",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(520px, calc(100% - 32px))",
          maxHeight: "calc(100vh - 64px)",
          background: "var(--zs-bg-2)",
          border: "1px solid var(--zs-line-strong)",
          borderRadius: 14,
          boxShadow: "var(--zs-shadow-lg)",
          display: "flex", flexDirection: "column",
        }}
      >
        <div style={{ padding: "18px 22px 14px", borderBottom: count > 0 ? "1px solid var(--zs-line)" : "none" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            {viewer && <Avatar person={viewer} size="sm" />}
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--zs-text-hi)", letterSpacing: "-0.01em" }}>
              {title}
            </div>
          </div>
          <div style={{ fontSize: 13, color: "var(--zs-text-md)", lineHeight: 1.45 }}>
            {count === 0
              ? "Nothing pending — you're good to go."
              : `You still have ${count} pending ${count === 1 ? "task" : "tasks"}. Accept or dismiss them before you go.`}
          </div>
        </div>

        {count > 0 && (
          <div className="zs-scroll" style={{
            flex: 1, overflowY: "auto", padding: "12px 22px",
            display: "flex", flexDirection: "column", gap: 8,
          }}>
            {pendingTasks.map((t) => {
              const dest = ZS_DESTINATIONS.find((d) => d.id === t.destination);
              return (
                <div key={t.id} style={{
                  padding: "12px 14px", borderRadius: 10,
                  background: "var(--zs-bg-1)", border: "1px solid var(--zs-line)",
                  display: "flex", flexDirection: "column", gap: 10,
                }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--zs-text-hi)", lineHeight: 1.35, marginBottom: 4 }}>
                      {t.title}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", fontSize: 11, color: "var(--zs-text-lo)" }}>
                      {dest && (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                          <DestinationLogo id={dest.id} size={12} /> {dest.name}
                        </span>
                      )}
                      {t.due && (
                        <>
                          <span style={{ color: "var(--zs-text-dim)" }}>·</span>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
                            <I.Clock size={10} strokeWidth={2} /> {t.due}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    {onAccept && (
                      <button
                        className="zs-btn zs-btn--primary zs-btn--sm"
                        onClick={() => onAccept(t)}
                        style={{ height: 28, padding: "0 12px", fontSize: 12 }}
                      >
                        <I.Check size={12} strokeWidth={2.5} /> Accept
                      </button>
                    )}
                    {onDismiss && (
                      <button
                        className="zs-btn zs-btn--secondary zs-btn--sm"
                        onClick={() => onDismiss(t)}
                        style={{ height: 28, padding: "0 12px", fontSize: 12 }}
                      >
                        <I.X size={12} strokeWidth={2.5} /> Dismiss
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div style={{
          padding: "12px 22px", borderTop: count > 0 ? "1px solid var(--zs-line)" : "none",
          display: "flex", gap: 8, justifyContent: "flex-end",
        }}>
          <button className="zs-btn zs-btn--secondary" onClick={onCancel} style={{ height: 36, padding: "0 16px" }}>
            Cancel
          </button>
          <button className="zs-btn zs-btn--danger" onClick={onLeave} style={{ height: 36, padding: "0 16px" }}>
            {leaveLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

window.LeaveMeetingDialog = LeaveMeetingDialog;

/* ---------------- Team tasks list (host's Team tab) ---------------- */
/* Renders the host's view of every team member's accepted tasks, grouped
   by who accepted them. Shows the host themselves first, then the rest
   of the team alphabetically by id (deterministic render order). */
function TeamTasksList({ tasks }) {
  // Group by acceptedBy. Default to "me" for legacy entries with no field.
  const groups = {};
  tasks.forEach((t) => {
    const key = t.acceptedBy || "me";
    if (!groups[key]) groups[key] = [];
    groups[key].push(t);
  });
  const ids = Object.keys(groups).sort((a, b) => {
    if (a === "me") return -1;
    if (b === "me") return 1;
    return a.localeCompare(b);
  });

  if (ids.length === 0) {
    return (
      <div style={{
        padding: "40px 16px", textAlign: "center", color: "var(--zs-text-lo)",
        border: "1px dashed var(--zs-line)", borderRadius: 10,
      }}>
        <I.CheckCircle size={24} strokeWidth={1.5} style={{ margin: "0 auto 8px", color: "var(--zs-text-dim)" }} />
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--zs-text-md)" }}>No team activity yet</div>
        <div style={{ fontSize: 11, marginTop: 4 }}>Accepted tasks will land here as the team works through them.</div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {ids.map((id) => {
        const person = ZS_PEOPLE.find((p) => p.id === id);
        const list = groups[id];
        const displayName = person ? (id === "me" ? `${person.name} (you)` : person.name) : "Unknown";
        return (
          <section key={id} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 4px" }}>
              <Avatar person={person} size="sm" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--zs-text-hi)", letterSpacing: "-0.005em" }}>
                  {displayName}
                </div>
                <div style={{ fontSize: 10, color: "var(--zs-text-lo)" }}>
                  {list.length} {list.length === 1 ? "task" : "tasks"} accepted
                </div>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {list.map((t) => {
                const dest = ZS_DESTINATIONS.find((d) => d.id === t.destination);
                return (
                  <div key={t.id} style={{
                    padding: "10px 12px", borderRadius: 8,
                    background: "var(--zs-bg-1)", border: "1px solid var(--zs-line)",
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--zs-text-hi)", lineHeight: 1.35, marginBottom: 4 }}>
                      {t.title}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", fontSize: 11, color: "var(--zs-text-lo)" }}>
                      {dest && (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                          <DestinationLogo id={dest.id} size={12} /> {dest.name}
                        </span>
                      )}
                      {t.due && (
                        <>
                          <span style={{ color: "var(--zs-text-dim)" }}>·</span>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
                            <I.Clock size={10} strokeWidth={2} /> {t.due}
                          </span>
                        </>
                      )}
                      <span style={{ color: "var(--zs-text-dim)" }}>·</span>
                      <span className="zs-chip" style={{
                        background: "rgba(23,178,106,0.14)", color: "#6EE0A8",
                        borderColor: "rgba(23,178,106,0.28)", padding: "1px 6px", fontSize: 10,
                      }}>
                        <I.Check size={9} strokeWidth={3} /> Accepted
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}

/* ---------------- Team activity notification (host) ---------------- */
/* Top-left slide-in toast that fires when a teammate accepts or sends a
   task back to Unassigned. Distinct corner from the other toasts so it
   doesn't fight for the same real estate. */
function TeamActivityToast({ kind, person, title }) {
  const accent = kind === "accepted" ? "var(--zs-green-500)" : "var(--zs-amber-500)";
  const verb   = kind === "accepted" ? "accepted" : "sent back to Unassigned";
  return (
    <div style={{
      position: "relative",
      padding: "10px 14px 10px 16px",
      display: "flex", alignItems: "flex-start", gap: 10,
      background: "var(--zs-bg-2)",
      border: "1px solid var(--zs-line)",
      borderRadius: 10,
      boxShadow: "var(--zs-shadow-lg)",
      overflow: "hidden",
      animation: "zs-toast-in 280ms cubic-bezier(0.22, 1, 0.36, 1)",
    }}>
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: accent }} />
      <Avatar person={person} size="sm" />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 11, fontWeight: 600, color: accent,
          textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 2,
        }}>
          {(person?.name || "Someone").split(" ")[0]} {verb}
        </div>
        <div style={{
          fontSize: 12, fontWeight: 600, color: "var(--zs-text-hi)",
          lineHeight: 1.35,
          overflow: "hidden", textOverflow: "ellipsis",
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
        }}>
          {title}
        </div>
      </div>
    </div>
  );
}

window.TeamTasksList = TeamTasksList;
window.TeamActivityToast = TeamActivityToast;
