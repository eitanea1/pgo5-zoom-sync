/* Zoom Sync — Attendee view.
   The participant POV: tasks arrive addressed to them with a personal toast,
   accept/decline, and a "My tasks from this meeting" side list. */

const AIC = window.ZoomSyncIcons;

/* Stream of tasks addressed specifically to the viewer. Trigger types
   match host: name_spoken (default) rebuilds the quote with the viewer's
   name; volunteered uses an "I'll..." quote with the viewer as speaker;
   role_specific uses a "whoever..." quote with the assigner as speaker
   and AI inferring the viewer is the right match. */
const ATTENDEE_STREAM = [
{ title: "Pull the Q2 launch timeline into a one-pager", due: "Fri, May 2", dueInQuote: "by Friday", destination: "asana", confidence: 0.93 },
{ title: "Audit the dashboard empty states this sprint", due: "Thu, May 8", destination: "asana", confidence: 0.81,
  trigger: "volunteered", quote: "I'll take the dashboard empty-state audit this sprint." },
{ title: "Draft three onboarding copy variants", due: null, dueInQuote: null, destination: "asana", confidence: 0.89 },
{ title: "Prepare the integration demo for QBR", due: "Tue, May 6", destination: "asana", confidence: 0.88,
  trigger: "role_specific", quote: "Anyone on integrations want to put together the QBR demo?" },
{ title: "Share the pricing model with the team", due: "Tomorrow", dueInQuote: "by tomorrow", destination: "asana", confidence: 0.92 },
{ title: "Pull together the churn cohort analysis", due: "Fri, May 2", destination: "asana", confidence: 0.84,
  trigger: "volunteered", quote: "I'll pull together the churn cohort analysis by end of week." },
{ title: "Book six user research calls for the prototype", due: "Thu, May 8", dueInQuote: "before Thursday", destination: "asana", confidence: 0.84 },
{ title: "Write the exec update for Friday's review", due: "Fri, May 2", destination: "asana", confidence: 0.92,
  trigger: "role_specific", quote: "Could whoever's doing comms today put a quick exec update together?" },
{ title: "Follow up with Legal on the partner DPA", due: "Wed, Apr 30", dueInQuote: "by Wednesday", destination: "asana", confidence: 0.86 }];


/* Builds three pending-tab seed tasks for the given viewer — one for each of
   the trigger types they can land in (name_spoken, volunteered, role_specific).
   Visible immediately on page load so the variety doesn't depend on watching
   the stream cycle for 1-2 minutes. Names are computed so they make sense
   regardless of which 'Who are you' the user picked. */
function buildAttendeePendingSeed(viewer) {
  const firstName = viewer.name.split(" ")[0];
  const others = (window.ZS_PEOPLE || []).filter((p) => p.id !== viewer.id);
  const assigner1 = others[0] && others[0].name.split(" ")[0] || "Maya";
  const assigner2 = others[1] && others[1].name.split(" ")[0] || "Priya";
  return [
  {
    id: `a-pseed-name-${viewer.id}`,
    title: "Pull the Q2 launch timeline into a one-pager",
    quote: null,
    quoteParts: {
      prefix: `${firstName}, can you pull the Q2 launch timeline into a one-pager `,
      highlight: "by Friday",
      suffix: "?"
    },
    assignedBy: assigner1, speakerName: assigner1,
    trigger: "name_spoken",
    due: "Fri, May 2",
    destination: "asana",
    confidence: 0.93
  },
  {
    id: `a-pseed-vol-${viewer.id}`,
    title: "Pull together the churn cohort analysis",
    quote: "I'll pull together the churn cohort analysis by end of week.",
    assignedBy: firstName, speakerName: firstName,
    trigger: "volunteered",
    due: "Fri, May 2",
    destination: "asana",
    confidence: 0.84
  },
  {
    id: `a-pseed-role-${viewer.id}`,
    title: "Prepare the integration demo for QBR",
    quote: "Anyone on integrations want to put together the QBR demo?",
    assignedBy: assigner2, speakerName: assigner2,
    trigger: "role_specific",
    due: "Tue, May 6",
    destination: "asana",
    confidence: 0.88
  }];

}

/* Unassigned tasks the attendee can see and claim. owner is null until claimed.
   Each carries a real speaker + trigger so the 'Show quote' attribution works
   the same way it does in the host view. */
const ATTENDEE_UNASSIGNED_SEED = [
{
  id: "a-u-01",
  title: "Investigate the latency spike on the EU cluster",
  quote: "Someone needs to dig into the EU latency spike we saw yesterday.",
  speakerName: "Lin",
  trigger: "unattributed",
  due: "Wed, Apr 30",
  destination: "asana",
  confidence: 0.72
},
{
  id: "a-u-02",
  title: "Decide on a name for the new analytics feature",
  quote: "We still need to land on a name for the analytics thing.",
  speakerName: "Priya",
  trigger: "unattributed",
  due: null,
  destination: "asana",
  confidence: 0.61
},
{
  id: "a-u-03",
  title: "Audit the dashboard empty states this sprint",
  quote: "Whoever owns the dashboard should give the empty states a once-over.",
  speakerName: "Jordan",
  trigger: "role_specific",
  due: "Thu, May 8",
  destination: "asana",
  confidence: 0.79
}];


/* A single big "task assigned to you" card that drops in from the top of the stage.
   The attendee sees this instead of the detection toast. */
function AssignedCard({ task, viewer }) {
  const dest = ZS_DESTINATIONS.find((d) => d.id === task.destination) || ZS_DESTINATIONS[0];
  return (
    <div style={{
      padding: "8px 12px 8px 10px",
      display: "flex", alignItems: "center", gap: 10,
      background: "linear-gradient(180deg, rgba(45, 140, 255, 0.16) 0%, rgba(139, 92, 246, 0.16) 100%)",
      border: "1px solid rgba(139, 92, 246, 0.35)",
      borderRadius: 999,
      boxShadow: "var(--zs-shadow-lg), inset 0 0 0 1px rgba(255,255,255,0.04)",
      backdropFilter: "blur(14px)",
      animation: "zs-toast-in 320ms cubic-bezier(0.22, 1, 0.36, 1)",
      pointerEvents: "auto"
    }}>
      <div style={{
        width: 26, height: 26, borderRadius: "50%",
        background: "rgba(139, 92, 246, 0.28)", color: "#C7B3FF",
        display: "flex", alignItems: "center", justifyContent: "center",
        flex: "none"
      }}>
        <AIC.Sparkle size={14} strokeWidth={2.2} />
      </div>
      <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 8 }}>
        <span className="zs-overline" style={{ color: "#C7B3FF", flex: "none" }}>New task</span>
        <span style={{
          fontSize: 13, fontWeight: 600, color: "var(--zs-text-hi)", letterSpacing: "-0.005em",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", minWidth: 0, flex: 1
        }}>
          {task.title}
        </span>
      </div>
      <span style={{ color: "#C7B3FF", flex: "none" }} className="zs-wave" aria-hidden="true">
        <span /><span /><span /><span />
      </span>
    </div>);

}

/* Single attendee task row — its own component so each row keeps a local
   "show quote" + "edit title" toggle state. Mirrors the host TaskCard
   pattern (no AI percentage chip, click-to-reveal quote with speaker
   attribution in the button, click-title-to-edit). */
function AttendeeTaskRow({ task: t, onAccept, onAcceptAsMine, onDismiss, onChangeDestination, onEditTitle }) {
  const { useState, useRef, useEffect } = React;
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(t.title);
  const titleInputRef = useRef(null);
  // Sync draft if the underlying title changes externally and we're not editing
  useEffect(() => {if (!editing) setDraft(t.title);}, [t.title, editing]);
  // Focus + select-all when entering edit mode
  useEffect(() => {
    if (editing && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [editing]);
  const startEditTitle = () => {if (onEditTitle && !t.accepted) {setDraft(t.title);setEditing(true);}};
  const commitEditTitle = () => {
    const next = draft.trim();
    if (next && next !== t.title && onEditTitle) onEditTitle(t.id, next);
    setEditing(false);
  };
  const cancelEditTitle = () => {setDraft(t.title);setEditing(false);};
  // Speaker context: assignedBy for tasks addressed to viewer, or speakerName
  // for unassigned seed entries
  const speakerName = t.assignedBy || t.speakerName || null;
  const verb = t.trigger === "volunteered" ? "volunteered" :
  t.trigger === "role_specific" ? "asked the room" :
  t.trigger === "unattributed" ? "raised it" :
  "asked";
  const attribution = speakerName ? `${speakerName} ${verb}` : null;
  const isUnassigned = t.owner == null && !t.assignedBy;
  const titleEditable = onEditTitle && !t.accepted;

  return (
    <div className={`zs-task ${t.isNew ? "zs-task--new" : ""}`}>
      {t.accepted &&
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span className="zs-chip" style={{ background: "rgba(23,178,106,0.14)", color: "#6EE0A8", borderColor: "rgba(23,178,106,0.28)" }}>
            <AIC.Check size={10} strokeWidth={2.5} /> Accepted
          </span>
        </div>
      }

      {editing ?
      <input
        ref={titleInputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {e.preventDefault();commitEditTitle();} else
          if (e.key === "Escape") {e.preventDefault();cancelEditTitle();}
        }}
        onBlur={commitEditTitle}
        style={{
          fontSize: 14, fontWeight: 600, color: "var(--zs-text-hi)", lineHeight: 1.35,
          background: "var(--zs-bg-1)", border: "1px solid var(--zs-blue-400)",
          borderRadius: 4, padding: "3px 6px", outline: "none", width: "100%",
          fontFamily: "inherit"
        }} /> :


      <div
        onClick={startEditTitle}
        title={titleEditable ? "Click to edit" : undefined}
        style={{
          fontSize: 14, fontWeight: 600, color: "var(--zs-text-hi)", lineHeight: 1.35,
          cursor: titleEditable ? "text" : "default",
          padding: "3px 6px", margin: "0 -6px",
          borderRadius: 4,
          transition: "background 120ms"
        }}
        onMouseEnter={(e) => {if (titleEditable) e.currentTarget.style.background = "var(--zs-bg-3)";}}
        onMouseLeave={(e) => {e.currentTarget.style.background = "transparent";}}>
        
          {t.title}
        </div>
      }

      {(() => {
        const dl = window.deadlineMeta(t.due);
        return dl &&
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 4,
          fontSize: 11, fontWeight: 600, color: dl.color,
          width: "fit-content"
        }}>
            <AIC.Clock size={11} strokeWidth={2.2} />
            {dl.text}
          </div>;

      })()}

      {attribution &&
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
          margin: "0 -4px"
        }}
        onMouseEnter={(e) => {e.currentTarget.style.color = "var(--zs-text-hi)";}}
        onMouseLeave={(e) => {e.currentTarget.style.color = "var(--zs-text-lo)";}}>
        
          {quoteOpen ?
        <AIC.ChevronUp size={11} strokeWidth={2.5} /> :
        <AIC.ChevronDown size={11} strokeWidth={2.5} />}
          <span>{quoteOpen ? "Hide quote" : "Show quote"}</span>
          {isUnassigned &&
        <>
              <span style={{ color: "var(--zs-text-dim)" }}>·</span>
              <span>{attribution}</span>
            </>
        }
        </button>
      }

      {quoteOpen &&
      <div style={{
        padding: "6px 10px", borderLeft: "2px solid var(--zs-bg-4)",
        display: "flex", flexDirection: "column", gap: 3
      }}>
          {!isUnassigned && attribution &&
        <span className="zs-overline" style={{ color: "var(--zs-text-dim)" }}>
              {attribution}
            </span>
        }
          <span style={{
          fontSize: 11, fontStyle: "italic", color: "var(--zs-text-lo)", lineHeight: 1.55
        }}>
            “{t.quoteParts?.prefix || t.quote}
            {t.quoteParts?.highlight &&
          <span style={{
            display: "inline-block",
            padding: "0 5px", margin: "0 1px",
            border: "1px solid var(--zs-amber-500)",
            borderRadius: 3,
            color: "var(--zs-amber-500)",
            fontStyle: "normal", fontWeight: 700,
            fontSize: 10.5
          }}>
                {t.quoteParts.highlight}
              </span>
          }
            {t.quoteParts?.suffix || ""}”
          </span>
        </div>
      }

      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: "var(--zs-text-md)", flexWrap: "wrap" }}>
        <DestinationPicker value={t.destination}
        locked={t.accepted}
        onChange={(d) => onChangeDestination(t.id, d)} />
      </div>

      {!t.accepted &&
      <div style={{ display: "flex", gap: 6, justifyContent: "flex-start", marginTop: 2 }}>
          {isUnassigned ?
        <button className="zs-btn zs-btn--primary zs-btn--sm" onClick={() => onAcceptAsMine(t.id)}>
              <AIC.Check size={12} strokeWidth={2.5} /> Accept as mine
            </button> :

        <button className="zs-btn zs-btn--primary zs-btn--sm" onClick={() => onAccept(t.id)}>
              <AIC.Check size={12} strokeWidth={2.5} /> Accept
            </button>
        }
          <button className="zs-btn zs-btn--secondary zs-btn--sm" onClick={() => onDismiss(t.id)}>
            <AIC.X size={12} strokeWidth={2} /> Dismiss
          </button>
        </div>
      }
    </div>);

}

/* My-tasks side panel for the attendee — three tabs: Pending / Unassigned / Accepted */
function MyTasksPanel({ viewer, tasks, onClose, onDismiss, onAccept, onAcceptAsMine, onChangeDestination, onEditTitle }) {
  const { useState } = React;
  const [filter, setFilter] = useState("pending");
  const pending = tasks.filter((t) => !t.accepted && t.assignedBy);
  const unassigned = tasks.filter((t) => !t.accepted && !t.assignedBy);
  const accepted = tasks.filter((t) => t.accepted);
  const filtered =
  filter === "pending" ? pending :
  filter === "unassigned" ? unassigned :
  accepted;

  const emptyCopy = {
    pending: { title: "You're all caught up", sub: "New tasks will land here as they come up." },
    unassigned: { title: "No unassigned tasks right now", sub: "When the room raises one, you can claim it here." },
    accepted: { title: "Nothing accepted yet", sub: "Tasks you accept will move here." }
  }[filter];

  return (
    <aside className="zs-panel zs-scroll"
    style={{ width: "var(--zs-panel-w)", flex: "none", height: "100%" }}>
      <div className="zs-panel__header">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar person={viewer} size="md" />
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: "-0.01em" }}>
              My tasks
            </div>
            <div style={{ fontSize: 11, color: "var(--zs-text-lo)" }}>
              {pending.length} pending · {unassigned.length} open in room
            </div>
          </div>
        </div>
        <button className="zs-btn zs-btn--ghost zs-btn--sm" onClick={onClose} title="Close panel">
          <AIC.X size={14} strokeWidth={2} />
        </button>
      </div>

      <div style={{ padding: "12px 16px 8px" }}>
        <div className="zs-tabs">
          <button className="zs-tab" data-active={filter === "pending"} onClick={() => setFilter("pending")}>
            Pending · {pending.length}
          </button>
          <button className="zs-tab" data-active={filter === "unassigned"} onClick={() => setFilter("unassigned")}>
            Unassigned · {unassigned.length}
          </button>
          <button className="zs-tab" data-active={filter === "accepted"} onClick={() => setFilter("accepted")}>
            Accepted · {accepted.length}
          </button>
        </div>
      </div>

      <div className="zs-panel__body zs-scroll" style={{ padding: "4px 16px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.length === 0 &&
        <div style={{
          padding: "40px 16px", textAlign: "center", color: "var(--zs-text-lo)",
          border: "1px dashed var(--zs-line)", borderRadius: 10
        }}>
            <AIC.CheckCircle size={24} strokeWidth={1.5} style={{ margin: "0 auto 8px", color: "var(--zs-text-dim)" }} />
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--zs-text-md)" }}>{emptyCopy.title}</div>
            <div style={{ fontSize: 11, marginTop: 4 }}>{emptyCopy.sub}</div>
          </div>
        }
        {filtered.map((t) =>
        <AttendeeTaskRow
          key={t.id}
          task={t}
          onAccept={onAccept}
          onAcceptAsMine={onAcceptAsMine}
          onDismiss={onDismiss}
          onChangeDestination={onChangeDestination}
          onEditTitle={onEditTitle} />

        )}
      </div>

      <div style={{ padding: "10px 16px", borderTop: "1px solid var(--zs-line)",
        display: "flex", alignItems: "center", justifyContent: "flex-start" }}>
        <div style={{ fontSize: 11, color: "var(--zs-text-lo)", display: "flex", alignItems: "center", gap: 6 }}>
          <span className="zs-livedot" style={{ background: "var(--zs-violet-500)" }} /> Capturing live
        </div>
      </div>
    </aside>);

}

/* Attendee app wrapper */
function AttendeeApp({ t, setTweak }) {
  const { useState, useEffect } = React;
  const viewer = ZS_PEOPLE.find((p) => p.id === t.viewerId) || ZS_PEOPLE[1];
  const others = ZS_PEOPLE.filter((p) => p.id !== viewer.id);

  const [state, setState] = useState({
    muted: false,
    videoOn: true,
    elapsed: 14 * 60 + 22,
    speakerIdx: 0,
    assignedCard: null,
    sentToast: null,
    leftToast: null, // brief 'You left the meeting' confirmation
    tasks: [],
    streamIdx: 0,
    panelOpen: t.panelOpen,
    leaveDialogOpen: false // LeaveMeetingDialog visibility
  });

  useEffect(() => {setState((s) => ({ ...s, panelOpen: t.panelOpen }));}, [t.panelOpen]);

  // Timer
  useEffect(() => {
    const id = setInterval(() => setState((s) => ({ ...s, elapsed: s.elapsed + 1 })), 1000);
    return () => clearInterval(id);
  }, []);

  // Active speaker cycle — assigner rotates among non-self participants
  useEffect(() => {
    if (!t.activeSpeakerCycle) return;
    const id = setInterval(() => {
      setState((s) => ({ ...s, speakerIdx: (s.speakerIdx + 1) % ZS_PEOPLE.length }));
    }, 3800);
    return () => clearInterval(id);
  }, [t.activeSpeakerCycle]);

  // Reset tasks when the viewer identity changes — old quotes were addressed to a different person.
  useEffect(() => {
    setState((s) => ({
      ...s,
      tasks: [],
      streamIdx: 0,
      assignedCard: null
    }));
  }, [t.viewerId]);

  // Stream tasks assigned to viewer. Trigger field on each template drives
  // how the quote is built and who the speaker is.
  useEffect(() => {
    const intervalMs = Math.max(3, t.streamIntervalSec) * 1000;
    const id = setInterval(() => {
      setState((s) => {
        const template = ATTENDEE_STREAM[s.streamIdx % ATTENDEE_STREAM.length];
        const assigner = others[s.streamIdx % others.length];
        const newId = `a-task-${Date.now()}`;
        const firstName = viewer.name.split(" ")[0];
        const trigger = template.trigger || "name_spoken";

        let quoteParts = null,quote,speakerName;
        if (trigger === "volunteered") {
          // Viewer is the speaker — they volunteered themselves
          quote = template.quote;
          speakerName = firstName;
        } else if (trigger === "role_specific") {
          // Some other person addressed a role; AI inferred the viewer
          quote = template.quote;
          speakerName = assigner.name.split(" ")[0];
        } else {
          // Default name_spoken — quote is rebuilt with viewer's name
          const base = `${firstName}, can you ${template.title.charAt(0).toLowerCase() + template.title.slice(1)}`;
          quoteParts = template.dueInQuote ?
          { prefix: `${base} `, highlight: template.dueInQuote, suffix: "?" } :
          { prefix: base, highlight: null, suffix: "?" };
          quote = null;
          speakerName = assigner.name.split(" ")[0];
        }

        const task = {
          ...template,
          id: newId,
          quote,
          quoteParts,
          assignedBy: speakerName,
          speakerName,
          trigger,
          accepted: false,
          isNew: true,
          capturedAt: s.elapsed
        };
        return {
          ...s,
          tasks: [task, ...s.tasks],
          streamIdx: s.streamIdx + 1,
          assignedCard: t.showToast ? task : null,
          panelOpen: s.panelOpen
        };
      });
    }, intervalMs);
    return () => clearInterval(id);
  }, [t.streamIntervalSec, t.showToast, t.viewerId]);

  // Auto-dismiss assigned card
  useEffect(() => {
    if (!state.assignedCard) return;
    const id = setTimeout(() =>
    setState((s) => ({ ...s, assignedCard: null })), t.toastDurationMs + 2000);
    return () => clearTimeout(id);
  }, [state.assignedCard, t.toastDurationMs]);

  // Clear "isNew" flag
  useEffect(() => {
    const hasNew = state.tasks.some((x) => x.isNew);
    if (!hasNew) return;
    const id = setTimeout(() => setState((s) => ({
      ...s, tasks: s.tasks.map((x) => ({ ...x, isNew: false }))
    })), 1200);
    return () => clearTimeout(id);
  }, [state.tasks]);

  const speaker = ZS_PEOPLE[state.speakerIdx];
  const pendingCount = state.tasks.filter((t) => !t.accepted).length;

  const acceptTask = (id) => {
    const task = state.tasks.find((x) => x.id === id);
    const dest = task ? ZS_DESTINATIONS.find((d) => d.id === task.destination) : null;
    const toastId = `sent-${id}-${Date.now()}`;
    setState((s) => ({
      ...s,
      tasks: s.tasks.map((x) => x.id === id ? { ...x, accepted: true } : x),
      assignedCard: s.assignedCard?.id === id ? null : s.assignedCard,
      sentToast: dest && task ? {
        id: toastId,
        destination: dest,
        title: task.title,
        due: task.due
      } : s.sentToast
    }));
    setTimeout(() => {
      setState((s) => s.sentToast?.id === toastId ? { ...s, sentToast: null } : s);
    }, 2400);
  };
  // Dismiss semantics (matches host):
  //   - already in Unassigned (no assignedBy)        → fully remove
  //   - tasks addressed to viewer (has assignedBy)   → return to Unassigned
  //     by clearing assignedBy. Speaker name is preserved on speakerName so
  //     the attribution chip keeps working ('{Speaker} raised it').
  const dismissTask = (id) => setState((s) => {
    const task = s.tasks.find((x) => x.id === id);
    if (!task) return s;
    const baseClear = {
      ...s,
      assignedCard: s.assignedCard?.id === id ? null : s.assignedCard
    };
    if (!task.assignedBy) {
      return { ...baseClear, tasks: s.tasks.filter((x) => x.id !== id) };
    }
    return {
      ...baseClear,
      tasks: s.tasks.map((x) => x.id === id ? {
        ...x,
        speakerName: x.speakerName || x.assignedBy,
        assignedBy: undefined,
        trigger: "unattributed",
        isNew: true
      } : x)
    };
  });
  // Accept-as-mine: claim an unassigned task. Sets assignedBy = "the meeting"
  // so the row moves to the Pending tab and shows a regular Accept button next.
  const acceptAsMineTask = (id) => setState((s) => ({
    ...s,
    tasks: s.tasks.map((x) => x.id === id ? { ...x, assignedBy: "the meeting", isNew: true } : x)
  }));
  // Leave meeting flow: clicking End on the toolbar opens the dialog so the
  // attendee can see what's pending before leaving. Confirming closes the
  // dialog and shows a brief 'You left the meeting' toast.
  const openLeaveDialog = () => setState((s) => ({ ...s, leaveDialogOpen: true }));
  const cancelLeave = () => setState((s) => ({ ...s, leaveDialogOpen: false }));
  const confirmLeave = () => {
    const id = `left-${Date.now()}`;
    setState((s) => ({
      ...s,
      leaveDialogOpen: false,
      leftToast: { id, message: "You left the meeting" }
    }));
    setTimeout(() => setState((s) => s.leftToast?.id === id ? { ...s, leftToast: null } : s), 2400);
  };

  return (
    <div data-screen-label="Attendee view" style={{
      position: "absolute", inset: 0, display: "flex", flexDirection: "column",
      background: "var(--zs-bg-0)"
    }}>
      <header style={{
        height: "var(--zs-header-h)", padding: "0 20px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        borderBottom: "1px solid var(--zs-line)", background: "var(--zs-bg-1)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <ZoomLogo height={20} />
          <div className="zs-divider--v" style={{ height: 22 }} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Q2 Roadmap Review</div>
            <div style={{ fontSize: 11, color: "var(--zs-text-lo)" }}>
              Host: Alex Rivera · You're attending as {viewer.name} · {String(Math.floor(state.elapsed / 60)).padStart(2, "0")}:{String(state.elapsed % 60).padStart(2, "0")}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="zs-chip zs-chip--live">
            <span className="zs-livedot" /> LIVE
          </span>
        </div>
      </header>

      <main style={{ flex: 1, minHeight: 0, display: "flex", gap: 16, padding: 16, position: "relative", height: "720px" }}>
        <section style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Avatar person={speaker} size="sm" />
              <div style={{ fontSize: 12, color: "var(--zs-text-md)" }}>
                <span style={{ color: "var(--zs-text-hi)", fontWeight: 600 }}>{speaker.name}</span> is speaking
              </div>
              <span style={{ color: "var(--zs-green-500)" }} className="zs-wave">
                <span /><span /><span /><span />
              </span>
            </div>
          </div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <MeetingGrid speakerId={speaker.id} muted={state.muted} layout={t.layout} selfId={viewer.id} />
          </div>

          {/* Assigned-to-you card floats bottom-center of stage */}
          {state.assignedCard &&
          <div style={{
            position: "absolute", bottom: 16,
            left: state.panelOpen ? "calc(50% - (var(--zs-panel-w) / 2) - 8px)" : "50%",
            transform: "translateX(-50%)",
            width: "min(420px, calc(100% - 48px))", zIndex: 50
          }}>
              <AssignedCard
              task={state.assignedCard}
              viewer={viewer} />
            
            </div>
          }

          {/* "Sent to X" confirmation toast — top-center of stage */}
          {state.sentToast &&
          <div key={state.sentToast.id} style={{
            position: "absolute", top: 20,
            left: state.panelOpen ? "calc(50% - (var(--zs-panel-w) / 2) - 8px)" : "50%",
            transform: "translateX(-50%)",
            zIndex: 55,
            width: "min(420px, calc(100% - 48px))"
          }}>
              <div style={{
              position: "relative",
              padding: "12px 14px 12px 18px",
              display: "flex", alignItems: "flex-start", gap: 12,
              background: "var(--zs-bg-2)",
              border: "1px solid var(--zs-line)",
              borderRadius: 12,
              boxShadow: "var(--zs-shadow-lg)",
              overflow: "hidden"
            }}>
                {/* Left accent bar */}
                <div style={{
                position: "absolute", left: 0, top: 0, bottom: 0, width: 3,
                background: "var(--zs-green-500)"
              }} />
                {/* Destination logo tile */}
                <div style={{
                width: 40, height: 40, borderRadius: 8,
                background: "var(--zs-bg-1)",
                border: "1px solid var(--zs-line)",
                display: "flex", alignItems: "center", justifyContent: "center", flex: "none"
              }}>
                  <DestinationLogo id={state.sentToast.destination.id} size={22} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                  display: "flex", alignItems: "center", gap: 6,
                  fontSize: 11, fontWeight: 600, color: "var(--zs-green-500)",
                  textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 3
                }}>
                    <AIC.Check size={11} strokeWidth={3} />
                    Sent to {state.sentToast.destination.name}
                  </div>
                  <div style={{
                  fontSize: 13, fontWeight: 600, color: "var(--zs-text-hi)",
                  letterSpacing: "-0.005em", lineHeight: 1.35
                }}>
                    {state.sentToast.title}
                  </div>
                  <div style={{
                  display: "flex", alignItems: "center", gap: 6, marginTop: 5, flexWrap: "wrap"
                }}>
                    {state.sentToast.due &&
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 4,
                    padding: "2px 7px", borderRadius: 4,
                    background: "rgba(245, 165, 36, 0.14)",
                    border: "1px solid rgba(245, 165, 36, 0.32)",
                    fontSize: 10, fontWeight: 700, color: "var(--zs-amber-500)",
                    textTransform: "uppercase", letterSpacing: "0.03em"
                  }}>
                        <AIC.Clock size={10} strokeWidth={2.5} />
                        Due {state.sentToast.due}
                      </span>
                  }
                    <span style={{ fontSize: 11, color: "var(--zs-text-lo)" }}>
                      {state.sentToast.destination.project}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          }
        </section>

        {state.panelOpen &&
        <MyTasksPanel
          viewer={viewer}
          tasks={state.tasks}
          onClose={() => setState((s) => ({ ...s, panelOpen: false }))}
          onDismiss={dismissTask}
          onAccept={acceptTask}
          onAcceptAsMine={acceptAsMineTask}
          onChangeDestination={(id, d) => setState((s) => ({
            ...s,
            tasks: s.tasks.map((x) => x.id === id ? { ...x, destination: d } : x)
          }))}
          onEditTitle={(id, newTitle) => setState((s) => ({
            ...s,
            tasks: s.tasks.map((x) => x.id === id ? { ...x, title: newTitle, edited: true } : x)
          }))} />

        }
      </main>

      <Toolbar
        muted={state.muted}
        videoOn={state.videoOn}
        panelOpen={state.panelOpen}
        sidePanel="tasks"
        onToggle={(k) => setState((s) => ({ ...s, [k]: !s[k] }))}
        onOpenSide={() => setState((s) => ({ ...s, panelOpen: !s.panelOpen }))}
        onEndCall={openLeaveDialog}
        taskCount={pendingCount}
        viewerRole={t.viewerRole}
        onSwitchRole={() => setTweak("viewerRole", t.viewerRole === "host" ? "attendee" : "host")} />
      

      {state.leaveDialogOpen &&
      <LeaveMeetingDialog
        viewer={viewer}
        pendingTasks={state.tasks.filter((x) => !x.accepted && x.assignedBy)}
        onCancel={cancelLeave}
        onLeave={confirmLeave}
        onAccept={(task) => acceptTask(task.id)}
        onDismiss={(task) => dismissTask(task.id)} />

      }

      {state.leftToast &&
      <div key={state.leftToast.id} style={{
        position: "fixed", top: 24, left: "50%",
        transform: "translateX(-50%)", zIndex: 95,
        width: "min(360px, calc(100% - 48px))",
        padding: "10px 16px",
        background: "var(--zs-bg-2)",
        border: "1px solid var(--zs-line)",
        borderRadius: 10,
        boxShadow: "var(--zs-shadow-lg)",
        fontSize: 13, fontWeight: 600, color: "var(--zs-text-hi)",
        textAlign: "center",
        animation: "zs-toast-in 280ms cubic-bezier(0.22, 1, 0.36, 1)"
      }}>
          {state.leftToast.message}
        </div>
      }
    </div>);

}

window.AttendeeApp = AttendeeApp;
window.ATTENDEE_STREAM = ATTENDEE_STREAM;