/* Zoom Sync — TaskPanel + App shell. */

const { useState: useS, useEffect: useE, useRef: useR, useMemo: useM } = React;
const IC = window.ZoomSyncIcons;

/* ---------------- Task panel ---------------- */
function TaskPanel({ tasks, acceptedTasks = [], newestId, onClose, onUpdate, onDismiss, onAccept, onAcceptAsMine, tab, onTabChange }) {
  const myId = "me";
  const myTasks      = tasks.filter((t) => t.owner === myId);
  const unassigned   = tasks.filter((t) => t.owner == null);
  const currentList  = tab === "mine" ? myTasks : tab === "unassigned" ? unassigned : [];

  return (
    <aside className="zs-panel zs-scroll"
      style={{ width: "var(--zs-panel-w)", flex: "none", height: "100%" }}>
      <div className="zs-panel__header">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: "rgba(139,92,246,0.18)", color: "#C7B3FF",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <IC.Sparkle size={16} strokeWidth={2} />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: "-0.01em" }}>Sync tasks</div>
            <div style={{ fontSize: 11, color: "var(--zs-text-lo)" }}>
              Listening · {tasks.length} captured
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          <button className="zs-btn zs-btn--ghost zs-btn--sm" onClick={onClose} title="Close panel">
            <IC.X size={14} strokeWidth={2} />
          </button>
        </div>
      </div>

      <div style={{ padding: "12px 16px 8px", display: "flex", flexDirection: "column", gap: 10 }}>
        <div className="zs-tabs" style={{ width: "fit-content" }}>
          <button className="zs-tab" data-active={tab === "mine" ? "true" : "false"} onClick={() => onTabChange("mine")}>
            My tasks · {myTasks.length}
          </button>
          <button className="zs-tab" data-active={tab === "unassigned" ? "true" : "false"} onClick={() => onTabChange("unassigned")}>
            Unassigned · {unassigned.length}
          </button>
          <button className="zs-tab" data-active={tab === "team" ? "true" : "false"} onClick={() => onTabChange("team")}>
            Accepted · {acceptedTasks.length}
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ position: "relative", flex: 1 }}>
            <IC.Search size={13} strokeWidth={2} style={{
              position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)",
              color: "var(--zs-text-lo)",
            }} />
            <input className="zs-input" placeholder="Search tasks…" style={{ paddingLeft: 28, height: 30, fontSize: 12 }} />
          </div>
          <button className="zs-btn zs-btn--secondary zs-btn--sm" style={{ height: 30 }}>
            <IC.Filter size={12} strokeWidth={2} />
          </button>
        </div>
      </div>

      <div className="zs-panel__body zs-scroll" style={{ padding: "4px 16px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
        {tab === "team" ? (
          <TeamTasksList tasks={acceptedTasks} />
        ) : (
          <>
            {currentList.length === 0 && (
              <div style={{
                padding: "40px 16px", textAlign: "center", color: "var(--zs-text-lo)",
                border: "1px dashed var(--zs-line)", borderRadius: 10,
              }}>
                <IC.Sparkle size={24} strokeWidth={1.5} style={{ margin: "0 auto 8px", color: "var(--zs-text-dim)" }} />
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--zs-text-md)" }}>No tasks yet</div>
                <div style={{ fontSize: 11, marginTop: 4 }}>Sync will listen and add them as they come up.</div>
              </div>
            )}
            {currentList.map((t) => (
              <TaskCard
                key={t.id}
                task={t}
                isNew={t.id === newestId}
                onAssign={(ownerId) => onUpdate(t.id, { owner: ownerId })}
                onDestination={(d) => onUpdate(t.id, { destination: d })}
                onDismiss={() => onDismiss(t.id)}
                onAccept={onAccept}
                onAcceptAsMine={onAcceptAsMine}
                onEditTitle={(newTitle) => onUpdate(t.id, { title: newTitle, edited: true })}
                onConfirm={() => onUpdate(t.id, { lowConfidence: false, confidence: 0.95 })}
              />
            ))}
          </>
        )}
      </div>

      <div style={{ padding: "10px 16px", borderTop: "1px solid var(--zs-line)",
                    display: "flex", alignItems: "center", justifyContent: "flex-start" }}>
        <div style={{ fontSize: 11, color: "var(--zs-text-lo)", display: "flex", alignItems: "center", gap: 6 }}>
          <span className="zs-livedot" style={{ background: "var(--zs-violet-500)" }} /> Capturing live
        </div>
      </div>
    </aside>
  );
}

/* ---------------- Toolbar ---------------- */
function Toolbar({ muted, videoOn, panelOpen, sidePanel, onToggle, onOpenSide, onEndCall, taskCount, viewerRole, onSwitchRole }) {
  return (
    <div style={{
      height: "var(--zs-toolbar-h)", padding: "0 24px",
      borderTop: "1px solid var(--zs-line)", background: "var(--zs-bg-1)",
      display: "flex", alignItems: "center", justifyContent: "space-between",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <ToolBtn icon={muted ? IC.MicOff : IC.MicOn}
          label={muted ? "Unmute" : "Mute"}
          danger={muted}
          onClick={() => onToggle("muted")} />
        <ToolBtn icon={videoOn ? IC.VideoOn : IC.VideoOff}
          label={videoOn ? "Stop Video" : "Start Video"}
          danger={!videoOn}
          onClick={() => onToggle("videoOn")} />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
        <ToolBtn icon={IC.Shield} label="Security" />
        <button
          className="zs-icon-btn"
          data-active={panelOpen && sidePanel === "participants" ? "true" : "false"}
          onClick={() => onOpenSide("participants")}
          style={{ minWidth: 64,
            background: panelOpen && sidePanel === "participants" ? "var(--zs-blue-100)" : undefined,
            color: panelOpen && sidePanel === "participants" ? "var(--zs-blue-400)" : "var(--zs-text-hi)",
            position: "relative" }}
          title="Participants"
        >
          <IC.Participants size={22} />
          <span className="zs-icon-btn__label" style={{ color: panelOpen && sidePanel === "participants" ? "var(--zs-blue-400)" : undefined }}>Participants</span>
        </button>
        <ToolBtn icon={IC.Chat} label="Chat" />
        <ToolBtn icon={IC.ScreenShare} label="Share" />
        <ToolBtn icon={IC.Record} label="Record" />
        <ToolBtn icon={IC.Reactions} label="Reactions" />
        <div className="zs-divider--v" style={{ height: 36, margin: "0 6px" }} />
        <button
          className="zs-icon-btn"
          data-active={panelOpen ? "true" : "false"}
          onClick={() => onOpenSide("tasks")}
          style={{
            minWidth: 72,
            background: panelOpen && sidePanel === "tasks" ? "rgba(139,92,246,0.18)" : undefined,
            color: panelOpen && sidePanel === "tasks" ? "#C7B3FF" : "var(--zs-text-hi)",
            position: "relative",
          }}
          title="Toggle Sync task panel"
        >
          <IC.Sparkle size={22} />
          <span className="zs-icon-btn__label" style={{ color: panelOpen && sidePanel === "tasks" ? "#C7B3FF" : undefined }}>
            Sync tasks
          </span>
          {taskCount > 0 && (
            <span style={{
              position: "absolute", top: 4, right: 10,
              background: "var(--zs-violet-500)", color: "#fff",
              fontSize: 9, fontWeight: 700, padding: "1px 5px",
              borderRadius: 99, pointerEvents: "none",
            }}>{taskCount}</span>
          )}
        </button>
        {onSwitchRole && (
          <button
            className="zs-icon-btn"
            data-active="true"
            onClick={onSwitchRole}
            style={{
              minWidth: 72,
              background: "rgba(45,140,255,0.16)",
              color: "#7AB8FF",
              position: "relative",
            }}
            title={`Switch to ${viewerRole === "host" ? "attendee" : "host"} view`}
          >
            <IC.User size={22} />
            <span className="zs-icon-btn__label" style={{ color: "#7AB8FF" }}>
              {viewerRole === "host" ? "Host view" : "Attendee view"}
            </span>
          </button>
        )}
        <ToolBtn icon={IC.More} label="More" />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button className="zs-btn zs-btn--danger"
          onClick={onEndCall}
          style={{ height: 40, padding: "0 18px", borderRadius: 20, fontSize: 13 }}>
          End
        </button>
      </div>
    </div>
  );
}

/* ---------------- Grid ---------------- */
function MeetingGrid({ speakerId, muted, layout, selfId = "me" }) {
  const cols = layout === "spotlight" ? 1 : 3;
  const people = ZS_PEOPLE;
  if (layout === "spotlight") {
    const speaker = people.find((p) => p.id === speakerId) || people[0];
    const others  = people.filter((p) => p.id !== speaker.id);
    return (
      <div style={{ display: "flex", gap: 12, flexDirection: "column", height: "100%" }}>
        <div style={{ flex: 1, minHeight: 0 }}>
          <div style={{ height: "100%" }}>
            <Tile person={speaker} speaking muted={speaker.id === selfId && muted} isSelf={speaker.id === selfId} />
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8, height: 120, flex: "none" }}>
          {others.map((p) => (
            <Tile key={p.id} person={p} speaking={false} muted={p.id === selfId && muted} isSelf={p.id === selfId} />
          ))}
        </div>
      </div>
    );
  }
  const rows = Math.ceil(people.length / cols);
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
      gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
      gap: 12, width: "100%", height: "100%", overflow: "hidden",
      alignContent: "center",
    }}>
      {people.map((p) => (
        <Tile key={p.id} person={p} speaking={p.id === speakerId} muted={p.id === selfId && muted} isSelf={p.id === selfId} />
      ))}
    </div>
  );
}

/* ---------------- App ---------------- */
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "panelOpen": true,
  "showToast": true,
  "activeSpeakerCycle": true,
  "initialTab": "mine",
  "streamIntervalSec": 18,
  "layout": "grid",
  "toastDurationMs": 4500,
  "sidePanel": "tasks",
  "viewerRole": "attendee",
  "viewerId": "maya"
}/*EDITMODE-END*/;

// A few accepted tasks across team members so the host's Team tab is
// populated immediately. Without this, the tab is empty until the simulator
// fires its first event ~18s later.
const TEAM_ACCEPTED_SEED = [
  {
    id: "ta-priya-01", title: "Draft three onboarding copy variants",
    owner: "priya", acceptedBy: "priya",
    quote: "Priya, can you draft three onboarding copy variants for us to test?",
    speaker: "maya", trigger: "name_spoken",
    due: "Mon, May 5", destination: "asana", confidence: 0.89,
  },
  {
    id: "ta-lin-01", title: "Pull together the churn cohort analysis",
    owner: "lin", acceptedBy: "lin",
    quote: "I'll pull together the churn cohort analysis by end of week.",
    speaker: "lin", trigger: "volunteered",
    due: "Fri, May 2", destination: "asana", confidence: 0.84,
  },
  {
    id: "ta-jord-01", title: "Book user research sessions for mobile prototype",
    owner: "jord", acceptedBy: "jord",
    quote: "Jordan, let's line up six user research calls for the mobile prototype.",
    speaker: "maya", trigger: "name_spoken",
    due: "Thu, May 8", destination: "asana", confidence: 0.77,
  },
  {
    id: "ta-sam-01", title: "Follow up with Legal on the partner DPA",
    owner: "sam", acceptedBy: "sam",
    quote: "Sam, can you follow up with Legal about the partner DPA?",
    speaker: "maya", trigger: "name_spoken",
    due: "Wed, Apr 30", destination: "asana", confidence: 0.86,
  },
];

function HostApp({ t, setTweak }) {
  const [state, setState] = useS({
    muted: false,
    videoOn: true,
    panelOpen: t.panelOpen,
    elapsed: 14 * 60 + 22,
    speakerIdx: 1,
    tab: t.initialTab || "mine",
    tasks: [],
    acceptedTasks: [],
    newestTaskId: null,
    toast: null,
    sentToast: null,
    streamIdx: 0,
    endDialogOpen: false,  // EndMeetingDialog visibility
    summaryOpen: false,    // SummaryModal visibility (post-meeting)
    streamPaused: false,   // when meeting ends, stop generating new tasks
    outOfMeeting: null,    // { task, suggestion, phase: 'pending'|'visible' } — Sarah flow
    resolutionToast: null, // { kind, assignee, message, sub } — accept/decline confirmation
    teamToast: null,       // { id, kind: 'accepted'|'dismissed', person, title } — team activity
  });

  // Sync tweak changes to local state
  useE(() => { setState((s) => ({ ...s, panelOpen: t.panelOpen })); }, [t.panelOpen]);
  useE(() => { setState((s) => ({ ...s, tab: t.initialTab })); }, [t.initialTab]);

  // Timer
  useE(() => {
    const id = setInterval(() => setState((s) => ({ ...s, elapsed: s.elapsed + 1 })), 1000);
    return () => clearInterval(id);
  }, []);

  // Active speaker cycle
  useE(() => {
    if (!t.activeSpeakerCycle) return;
    const id = setInterval(() => {
      setState((s) => ({ ...s, speakerIdx: (s.speakerIdx + 1) % ZS_PEOPLE.length }));
    }, 3800);
    return () => clearInterval(id);
  }, [t.activeSpeakerCycle]);

  // Task streaming — every t.streamIntervalSec seconds a new task arrives with toast.
  // Skipped when the meeting has been ended (streamPaused).
  useE(() => {
    if (state.streamPaused) return undefined;
    const intervalMs = Math.max(3, t.streamIntervalSec) * 1000;
    const id = setInterval(() => {
      setState((s) => {
        if (s.streamPaused) return s;
        const template = ZS_TASK_STREAM[s.streamIdx % ZS_TASK_STREAM.length];
        const newId = `t-stream-${Date.now()}`;
        const newTask = { ...template, id: newId, createdAtOffset: 0 };
        // Toast attribution shows who SAID the line (speaker), not who the task is for (owner).
        // Falls back to owner for legacy data without a speaker field.
        const speakerId = template.speaker || template.owner;
        return {
          ...s,
          tasks: [newTask, ...s.tasks],
          newestTaskId: newId,
          streamIdx: s.streamIdx + 1,
          toast: t.showToast ? {
            person: ZS_PEOPLE.find((p) => p.id === speakerId),
            phrase: template.quote,
            id: newId,
          } : null,
        };
      });
    }, intervalMs);
    return () => clearInterval(id);
  }, [t.streamIntervalSec, t.showToast, state.streamPaused]);

  // Auto-clear toast
  useE(() => {
    if (!state.toast) return;
    const id = setTimeout(() => setState((s) => ({ ...s, toast: null })), t.toastDurationMs);
    return () => clearTimeout(id);
  }, [state.toast, t.toastDurationMs]);

  // Team activity simulator — every ~18s a teammate either accepts a pending
  // task (70%) or sends one back to Unassigned (30%). Fires a notification
  // toast and updates the Team tab. Skipped when the meeting has been ended.
  useE(() => {
    if (state.streamPaused) return undefined;
    const intervalMs = 18000;
    const id = setInterval(() => {
      setState((s) => {
        if (s.streamPaused) return s;
        // Eligible: tasks owned by someone other than 'me' and not departing.
        const candidates = s.tasks.filter((x) => x.owner && x.owner !== "me" && !x.departing);
        if (candidates.length === 0) return s;
        const task = candidates[Math.floor(Math.random() * candidates.length)];
        const isAccept = Math.random() < 0.7;
        const person = ZS_PEOPLE.find((p) => p.id === task.owner);
        const toastId = `team-${Date.now()}`;
        if (isAccept) {
          return {
            ...s,
            tasks: s.tasks.filter((x) => x.id !== task.id),
            acceptedTasks: [{ ...task, acceptedBy: task.owner, acceptedAt: Date.now() }, ...s.acceptedTasks],
            teamToast: { id: toastId, kind: "accepted", person, title: task.title },
          };
        }
        // Otherwise simulate dismissal — task returns to Unassigned
        return {
          ...s,
          tasks: s.tasks.map((x) => (x.id === task.id ? { ...x, owner: null, trigger: "unattributed" } : x)),
          teamToast: { id: toastId, kind: "dismissed", person, title: task.title },
        };
      });
    }, intervalMs);
    return () => clearInterval(id);
  }, [state.streamPaused]);

  // Auto-clear team toast after 4.5s
  useE(() => {
    if (!state.teamToast) return;
    const expiringId = state.teamToast.id;
    const id = setTimeout(() => setState((s) => (s.teamToast?.id === expiringId ? { ...s, teamToast: null } : s)), 4500);
    return () => clearTimeout(id);
  }, [state.teamToast]);

  // Auto-clear "new" highlight
  useE(() => {
    if (!state.newestTaskId) return;
    const id = setTimeout(() => setState((s) => ({ ...s, newestTaskId: null })), 1200);
    return () => clearTimeout(id);
  }, [state.newestTaskId]);

  const toggle = (key) => setState((s) => ({ ...s, [key]: !s[key] }));
  const updateTask = (id, patch) => setState((s) => ({
    ...s, tasks: s.tasks.map((x) => (x.id === id ? { ...x, ...patch } : x)),
  }));
  // Dismiss semantics:
  //   - if the task is already in Unassigned, fully remove it (it has nowhere
  //     left to go — the host is rejecting it outright)
  //   - if it's assigned, send it back to Unassigned so anyone else can claim
  //     it. Trigger is set to 'unattributed' so the attribution chip shows
  //     '{Speaker} raised it' instead of '{Speaker} asked' (semantically
  //     correct now that no specific person owns it).
  const dismissTask = (id) => setState((s) => {
    const task = s.tasks.find((x) => x.id === id);
    if (!task) return s;
    if (task.owner == null) {
      return { ...s, tasks: s.tasks.filter((x) => x.id !== id) };
    }
    return {
      ...s,
      tasks: s.tasks.map((x) => (x.id === id ? { ...x, owner: null, trigger: "unattributed" } : x)),
      newestTaskId: id,
    };
  });
  // Accept-as-mine: claim an unassigned task to the current user (me).
  // Reassigns owner = "me" and re-triggers the "new" highlight so the task
  // visibly lands in the My tasks tab. Tab counts auto-update via filter.
  const acceptAsMine = (task) => {
    setState((s) => ({
      ...s,
      tasks: s.tasks.map((x) => (x.id === task.id ? { ...x, owner: "me" } : x)),
      newestTaskId: task.id,
    }));
  };
  // Accept flow: mark task as departing → 380ms slide-out → remove from list,
  // then push the accepted snapshot into acceptedTasks history (so the
  // post-meeting summary can show what got sent). Sent toast appears
  // immediately and clears after 2.4s.
  const acceptTask = (task) => {
    const dest = ZS_DESTINATIONS.find((d) => d.id === task.destination);
    const toastId = `sent-${task.id}-${Date.now()}`;
    setState((s) => ({
      ...s,
      tasks: s.tasks.map((x) => (x.id === task.id ? { ...x, departing: true } : x)),
      sentToast: dest ? {
        id: toastId,
        destination: dest,
        title: task.title,
        due: task.due,
      } : s.sentToast,
    }));
    setTimeout(() => {
      setState((s) => ({
        ...s,
        tasks: s.tasks.filter((x) => x.id !== task.id),
        acceptedTasks: [{ ...task, acceptedBy: "me", acceptedAt: Date.now() }, ...s.acceptedTasks],
      }));
    }, 380);
    setTimeout(() => {
      setState((s) => (s.sentToast?.id === toastId ? { ...s, sentToast: null } : s));
    }, 2400);
  };
  // End-meeting flow: clicking End opens a confirm dialog; confirming pauses
  // task generation, closes dialog, and reveals the post-meeting summary.
  const openEndDialog = () => setState((s) => ({ ...s, endDialogOpen: true }));
  const cancelEnd     = () => setState((s) => ({ ...s, endDialogOpen: false }));
  const confirmEnd    = () => setState((s) => ({
    ...s,
    endDialogOpen: false,
    streamPaused: true,
    summaryOpen: true,
  }));
  const closeSummary  = () => setState((s) => ({ ...s, summaryOpen: false }));

  // Out-of-meeting flow: when host assigns the absent person from the
  // SummaryModal, schedule the recipient's notification card for 3 seconds
  // later (mocking the recipient's app receiving the assignment).
  const assignToAbsent = (task, suggestion) => {
    setState((s) => ({
      ...s,
      summaryOpen: false,
      outOfMeeting: { task, suggestion, phase: "pending" },
    }));
    setTimeout(() => {
      setState((s) => {
        if (!s.outOfMeeting || s.outOfMeeting.phase !== "pending") return s;
        return { ...s, outOfMeeting: { ...s.outOfMeeting, phase: "visible" } };
      });
    }, 3000);
  };
  const acceptAbsent = () => {
    setState((s) => {
      if (!s.outOfMeeting) return s;
      const { task, suggestion } = s.outOfMeeting;
      const dest = ZS_DESTINATIONS.find((d) => d.id === task.destination);
      return {
        ...s,
        outOfMeeting: null,
        resolutionToast: {
          id: `res-${Date.now()}`,
          kind: "accepted",
          assignee: suggestion,
          message: `${suggestion.name.split(" ")[0]} accepted — task in ${dest ? dest.name : "Asana"}`,
          sub: task.title,
        },
      };
    });
    setTimeout(() => setState((s) => ({ ...s, resolutionToast: null })), 2800);
  };
  const declineAbsent = () => {
    setState((s) => {
      if (!s.outOfMeeting) return s;
      const { suggestion } = s.outOfMeeting;
      return {
        ...s,
        outOfMeeting: null,
        resolutionToast: {
          id: `res-${Date.now()}`,
          kind: "declined",
          assignee: suggestion,
          message: `${suggestion.name.split(" ")[0]} declined — task back to Unassigned`,
        },
      };
    });
    setTimeout(() => setState((s) => ({ ...s, resolutionToast: null })), 2800);
  };
  const addManualTask = () => {
    const id = `t-manual-${Date.now()}`;
    setState((s) => ({
      ...s,
      tasks: [{
        id, owner: "me",
        title: "New task",
        quote: "Added manually",
        due: "No due date",
        destination: "asana",
        confidence: 1.0,
      }, ...s.tasks],
      newestTaskId: id,
    }));
  };

  const speaker = ZS_PEOPLE[state.speakerIdx];

  return (
    <div data-screen-label="In-Meeting View" style={{
      position: "absolute", inset: 0, display: "flex", flexDirection: "column",
      background: "var(--zs-bg-0)",
    }}>
      <Header elapsed={state.elapsed} taskCount={state.tasks.length} host="Alex Rivera" />

      <main style={{
        flex: 1, minHeight: 0, display: "flex", gap: 16, padding: 16,
        position: "relative",
      }}>
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
            <div style={{ display: "flex", gap: 4 }}>
              <button className="zs-btn zs-btn--ghost zs-btn--sm"
                onClick={() => setTweak("layout", "grid")}
                style={{ background: t.layout === "grid" ? "var(--zs-bg-3)" : "transparent" }}>
                <IC.Grid size={14} strokeWidth={2} /> Gallery
              </button>
              <button className="zs-btn zs-btn--ghost zs-btn--sm"
                onClick={() => setTweak("layout", "spotlight")}
                style={{ background: t.layout === "spotlight" ? "var(--zs-bg-3)" : "transparent" }}>
                <IC.Layout size={14} strokeWidth={2} /> Speaker
              </button>
            </div>
          </div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <MeetingGrid speakerId={speaker.id} muted={state.muted} layout={t.layout} />
          </div>
        </section>

        {state.panelOpen && t.sidePanel === "tasks" && (
          <TaskPanel
            tasks={state.tasks}
            acceptedTasks={state.acceptedTasks}
            newestId={state.newestTaskId}
            tab={state.tab}
            onTabChange={(tab) => setState((s) => ({ ...s, tab }))}
            onClose={() => setState((s) => ({ ...s, panelOpen: false }))}
            onUpdate={updateTask}
            onDismiss={dismissTask}
            onAccept={acceptTask}
            onAcceptAsMine={acceptAsMine}
          />
        )}
        {state.panelOpen && t.sidePanel === "participants" && (
          <ParticipantsPanel
            speakerId={speaker.id}
            muted={state.muted}
            host="Alex Rivera"
            onClose={() => setState((s) => ({ ...s, panelOpen: false }))}
          />
        )}

        {state.toast && (
          <div style={{
            position: "absolute", bottom: 16,
            left: state.panelOpen ? "calc(50% - (var(--zs-panel-w) / 2) - 8px)" : "50%",
            transform: "translateX(-50%)",
            width: "min(520px, calc(100% - 48px))",
            zIndex: 50, pointerEvents: "none",
          }}>
            <DetectionToast person={state.toast.person} phrase={state.toast.phrase} />
          </div>
        )}

        {/* Sent toast — top-center of stage, confirms task was sent to destination */}
        {state.sentToast && (
          <div key={state.sentToast.id} style={{
            position: "absolute", top: 20,
            left: state.panelOpen ? "calc(50% - (var(--zs-panel-w) / 2) - 8px)" : "50%",
            transform: "translateX(-50%)",
            width: "min(420px, calc(100% - 48px))",
            zIndex: 55,
          }}>
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
              <div style={{
                position: "absolute", left: 0, top: 0, bottom: 0, width: 3,
                background: "var(--zs-green-500)",
              }} />
              <div style={{
                width: 40, height: 40, borderRadius: 8,
                background: "var(--zs-bg-1)",
                border: "1px solid var(--zs-line)",
                display: "flex", alignItems: "center", justifyContent: "center", flex: "none",
              }}>
                <DestinationLogo id={state.sentToast.destination.id} size={22} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 6,
                  fontSize: 11, fontWeight: 600, color: "var(--zs-green-500)",
                  textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 3,
                }}>
                  <IC.Check size={11} strokeWidth={3} />
                  Sent to {state.sentToast.destination.name}
                </div>
                <div style={{
                  fontSize: 13, fontWeight: 600, color: "var(--zs-text-hi)",
                  letterSpacing: "-0.005em", lineHeight: 1.35,
                }}>
                  {state.sentToast.title}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 5, flexWrap: "wrap" }}>
                  {state.sentToast.due && (
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: 4,
                      padding: "2px 7px", borderRadius: 4,
                      background: "rgba(245, 165, 36, 0.14)",
                      border: "1px solid rgba(245, 165, 36, 0.32)",
                      fontSize: 10, fontWeight: 700, color: "var(--zs-amber-500)",
                      textTransform: "uppercase", letterSpacing: "0.03em",
                    }}>
                      <IC.Clock size={10} strokeWidth={2.5} />
                      Due {state.sentToast.due}
                    </span>
                  )}
                  <span style={{ fontSize: 11, color: "var(--zs-text-lo)" }}>
                    {state.sentToast.destination.project}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Toolbar
        muted={state.muted}
        videoOn={state.videoOn}
        panelOpen={state.panelOpen}
        sidePanel={t.sidePanel}
        onToggle={toggle}
        onOpenSide={(which) => {
          if (state.panelOpen && t.sidePanel === which) {
            setState((s) => ({ ...s, panelOpen: false }));
          } else {
            setTweak("sidePanel", which);
            setState((s) => ({ ...s, panelOpen: true }));
          }
        }}
        onEndCall={openEndDialog}
        taskCount={state.tasks.length}
        viewerRole={t.viewerRole}
        onSwitchRole={() => setTweak("viewerRole", t.viewerRole === "host" ? "attendee" : "host")}
      />

      {state.endDialogOpen && (
        <LeaveMeetingDialog
          viewer={ZS_PEOPLE.find((p) => p.id === "me")}
          pendingTasks={state.tasks.filter((x) => x.owner === "me" && !x.departing)}
          onCancel={cancelEnd}
          onLeave={confirmEnd}
          onAccept={acceptTask}
          onDismiss={(task) => dismissTask(task.id)}
          title="End the meeting?"
          leaveLabel="End meeting"
        />
      )}
      {state.summaryOpen && (
        <SummaryModal
          elapsed={state.elapsed}
          accepted={state.acceptedTasks}
          pending={state.tasks.filter((x) => x.owner != null)}
          unassigned={state.tasks.filter((x) => x.owner == null)}
          suggestedAbsent={ZS_ORG_DIRECTORY[0]}
          onClose={closeSummary}
          onAssignAbsent={assignToAbsent}
        />
      )}

      {/* Out-of-meeting notification — bottom-right, appears 3s after Assign */}
      {state.outOfMeeting && state.outOfMeeting.phase === "visible" && (
        <OutOfMeetingNotification
          task={state.outOfMeeting.task}
          suggestion={state.outOfMeeting.suggestion}
          assignerName="Alex Rivera"
          onAccept={acceptAbsent}
          onDecline={declineAbsent}
        />
      )}

      {/* Resolution toast — top-center, confirms accept/decline */}
      {state.resolutionToast && (
        <div key={state.resolutionToast.id} style={{
          position: "fixed", top: 24, left: "50%",
          transform: "translateX(-50%)", zIndex: 95,
          width: "min(420px, calc(100% - 48px))",
        }}>
          <ResolutionToast {...state.resolutionToast} />
        </div>
      )}

      {/* Team activity toast — top-left, fires on simulated team accept/dismiss */}
      {state.teamToast && (
        <div key={state.teamToast.id} style={{
          position: "fixed", top: 24, left: 24, zIndex: 92,
          width: "min(320px, calc(100% - 48px))",
        }}>
          <TeamActivityToast
            kind={state.teamToast.kind}
            person={state.teamToast.person}
            title={state.teamToast.title}
          />
        </div>
      )}

      {/* Tweaks panel */}
      <TweaksPanel>
        <TweakSection label="Role" />
        <TweakRadio label="View as" value={t.viewerRole}
          options={["host", "attendee"]}
          onChange={(v) => setTweak("viewerRole", v)} />
        <TweakRadio label="Who are you" value={t.viewerId}
          options={["maya", "jord", "priya", "sam", "lin"]}
          onChange={(v) => setTweak("viewerId", v)} />

        <TweakSection label="Panel" />
        <TweakToggle label="Side panel open" value={t.panelOpen} onChange={(v) => setTweak("panelOpen", v)} />
        <TweakRadio label="Which panel" value={t.sidePanel}
          options={["tasks", "participants"]}
          onChange={(v) => setTweak("sidePanel", v)} />
        <TweakRadio label="Tasks tab" value={t.initialTab}
          options={["mine", "unassigned"]}
          onChange={(v) => setTweak("initialTab", v)} />

        <TweakSection label="Detection" />
        <TweakToggle label="Detection toast" value={t.showToast} onChange={(v) => setTweak("showToast", v)} />
        <TweakSlider label="New task every" value={t.streamIntervalSec}
          min={3} max={120} step={1} unit="s" onChange={(v) => setTweak("streamIntervalSec", v)} />
        <TweakSlider label="Toast duration" value={t.toastDurationMs}
          min={1500} max={12000} step={250} unit="ms" onChange={(v) => setTweak("toastDurationMs", v)} />

        <TweakSection label="Stage" />
        <TweakToggle label="Speaker cycle" value={t.activeSpeakerCycle} onChange={(v) => setTweak("activeSpeakerCycle", v)} />
        <TweakRadio label="Layout" value={t.layout}
          options={["grid", "spotlight"]}
          onChange={(v) => setTweak("layout", v)} />
      </TweaksPanel>
    </div>
  );
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  if (t.viewerRole === "attendee") {
    return <AttendeeApp t={t} setTweak={setTweak} />;
  }
  return <HostApp t={t} setTweak={setTweak} />;
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
