/* Zoom Sync — TaskPanel + App shell. */

const { useState: useS, useEffect: useE, useRef: useR, useMemo: useM } = React;
const IC = window.ZoomSyncIcons;

/* ---------------- Sync panel — wraps Tasks + Follow-up tabs ----------------
   The host's right-side panel. Tabs at the top switch between:
     - Tasks (the existing TasksTabContent: Mine / Unassigned / Accepted)
     - Follow-up (FollowUpTab from followup.jsx — listening → intent → tracking)
   When Follow-up has freshly-detected intent that the user hasn't seen yet,
   we show a blue dot + "1" badge on its tab. */
function SyncPanel({
  tasks, acceptedTasks, newestId, onClose, onUpdate, onDismiss, onAccept, onAcceptAsMine, tab, onTabChange,
  // follow-up integration
  followUp, syncTab, onSyncTabChange,
  // overtime engine — drives the TimerCard inside the Tasks tab
  overtime, wrapupWindowMinutes,
}) {
  // Compute timer state once so the panel can:
  //   • know whether to show the Wrap-up tab
  //   • paint a subtle tint on its background that matches the timer colour
  const timerState = timerStateFor(overtime, wrapupWindowMinutes);
  const inWrapWindow = timerState.inWindow;
  const myId = "me";
  const myTasks    = tasks.filter((t) => t.owner === myId && !t.departing);
  // "Pending" = anything that needs the host's confirm + send, regardless of
  // which teammate (or no one) is suggested. After the host picks an owner
  // from the dropdown, the task stays here until they hit Accept.
  const unassigned = tasks.filter((t) => t.owner !== myId && !t.departing);

  // Show a notification dot on the Follow-up tab when intent has been
  // detected but the user is currently looking at the Tasks tab.
  const followUpHasNews =
    (followUp.phase === "detected" || followUp.phase === "tracking") &&
    syncTab !== "followup";
  const followUpBadgeNum = followUp.phase === "detected" ? 1 : null;

  return (
    <aside className={`zs-panel zs-scroll${inWrapWindow ? " zs-panel--lightmode" : ""}`}
      style={{
        width: "var(--zs-panel-w)", flex: "none", height: "100%",
      }}>
      {/* Panel header — Zoom Sync wordmark */}
      <div className="zs-panel__header">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img
            src="../assets/zoom-sync-logo.png"
            alt="Zoom Sync"
            style={{ height: 30, width: "auto", display: "block", filter: "drop-shadow(0 1px 0 rgba(255,255,255,0.04))" }}
          />
          <div style={{ fontSize: 11, color: "var(--zs-text-lo)", lineHeight: 1.3 }}>
            Listening · {tasks.length} captured
          </div>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          <button className="zs-btn zs-btn--ghost zs-btn--sm" onClick={onClose} title="Close panel">
            <IC.X size={14} strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Top-level Sync tabs: Live Transcript / Tasks / Wrap-up / Follow-up.
          Wrap-up surfaces only once the meeting is near end / overtime, with
          a notification dot to draw the eye. */}
      <div style={{
        display: "flex", gap: 0,
        padding: "10px 16px 0",
        borderBottom: "1px solid var(--zs-line)",
      }}>
        <SyncTopTab
          label="Live Transcript"
          active={syncTab === "transcript"}
          onClick={() => onSyncTabChange("transcript")}
        />
        <SyncTopTab
          label="Tasks"
          active={syncTab === "tasks"}
          count={tasks.length}
          onClick={() => onSyncTabChange("tasks")}
        />
        {inWrapWindow && (
          <SyncTopTab
            label="Wrap-up"
            active={syncTab === "wrapup"}
            showDot={syncTab !== "wrapup"}
            onClick={() => onSyncTabChange("wrapup")}
          />
        )}
        <SyncTopTab
          label="Follow-up"
          active={syncTab === "followup"}
          showDot={followUpHasNews}
          badge={followUpBadgeNum}
          onClick={() => onSyncTabChange("followup")}
        />
      </div>

      {/* Tab content */}
      {syncTab === "transcript" ? (
        <LiveTranscriptTab engine={followUp} />
      ) : syncTab === "tasks" ? (
        <TasksTabContent
          tasks={tasks} acceptedTasks={acceptedTasks} newestId={newestId}
          tab={tab} onTabChange={onTabChange}
          onUpdate={onUpdate} onDismiss={onDismiss}
          onAccept={onAccept} onAcceptAsMine={onAcceptAsMine}
          myTasks={myTasks} unassigned={unassigned}
          overtime={overtime}
          wrapupWindowMinutes={wrapupWindowMinutes}
        />
      ) : syncTab === "wrapup" ? (
        <WrapUpTab
          overtime={overtime}
          tasks={tasks}
          followUp={followUp}
          newestId={newestId}
          onUpdate={onUpdate}
          onDismiss={onDismiss}
          onAccept={onAccept}
          onAcceptAsMine={onAcceptAsMine}
          onScheduleFollowUp={() => {
            followUp.fireDetection();
            onSyncTabChange("followup");
          }}
        />
      ) : (
        <div className="zs-scroll" style={{
          padding: "12px 16px 16px", flex: 1, overflowY: "auto",
        }}>
          <FollowUpTab engine={followUp} />
        </div>
      )}

      {/* Footer */}
      <div style={{ padding: "10px 16px", borderTop: "1px solid var(--zs-line)",
                    display: "flex", alignItems: "center", justifyContent: "flex-start" }}>
        <div style={{ fontSize: 11, color: "var(--zs-text-lo)", display: "flex", alignItems: "center", gap: 6 }}>
          <span className="zs-livedot" style={{ background: "var(--zs-violet-500)" }} /> Capturing live
        </div>
      </div>
    </aside>
  );
}

/* Top-level Sync tab button — Tasks / Follow-up */
function SyncTopTab({ label, active, count, badge, showDot, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        position: "relative",
        background: "transparent", border: "none",
        padding: "10px 14px",
        marginBottom: -1,
        borderBottom: active ? "2px solid #7AB8FF" : "2px solid transparent",
        color: active ? "var(--zs-text-hi)" : "var(--zs-text-md)",
        fontSize: 13, fontWeight: active ? 700 : 500,
        letterSpacing: "-0.005em",
        cursor: "pointer",
        display: "flex", alignItems: "center", gap: 7,
        transition: "color 140ms ease",
      }}
    >
      {label}
      {count != null && count > 0 && (
        <span style={{
          padding: "1px 7px", borderRadius: 99,
          background: active ? "rgba(45,140,255,0.20)" : "var(--zs-bg-2)",
          color: active ? "#7AB8FF" : "var(--zs-text-md)",
          fontSize: 10, fontWeight: 700,
        }}>{count}</span>
      )}
      {badge != null && (
        <span style={{
          padding: "1px 6px", borderRadius: 99,
          background: "#2D8CFF", color: "#fff",
          fontSize: 10, fontWeight: 700, lineHeight: 1.4,
          animation: "zs-pulse 1.6s ease-in-out infinite",
        }}>{badge}</span>
      )}
      {showDot && badge == null && (
        <span style={{
          width: 7, height: 7, borderRadius: "50%",
          background: "#2D8CFF",
          boxShadow: "0 0 0 3px rgba(45,140,255,0.20)",
          animation: "zs-pulse 1.6s ease-in-out infinite",
        }} />
      )}
    </button>
  );
}

/* ---------------- Tasks tab content (was TaskPanel body) ---------------- */
function TasksTabContent({ tasks, acceptedTasks, newestId, tab, onTabChange, onUpdate, onDismiss, onAccept, onAcceptAsMine, myTasks, unassigned, overtime, wrapupWindowMinutes }) {
  const currentList = tab === "mine" ? myTasks : tab === "unassigned" ? unassigned : [];

  return (
    <>
      <div style={{ padding: "12px 16px 8px", display: "flex", flexDirection: "column", gap: 10 }}>
        {/* Timer Card — only renders when meeting is in the wrap-up window
            (last `wrapupWindowMinutes` minutes). Outside that window the
            TimerCard returns null and nothing shows. */}
        {overtime && <TimerCard overtime={overtime} windowMinutes={wrapupWindowMinutes} />}
        <div className="zs-tabs" style={{ width: "fit-content" }}>
          <button className="zs-tab" data-active={tab === "mine" ? "true" : "false"} onClick={() => onTabChange("mine")}>
            My tasks · {myTasks.length}
          </button>
          <button className="zs-tab" data-active={tab === "unassigned" ? "true" : "false"} onClick={() => onTabChange("unassigned")}>
            Pending · {unassigned.length}
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
    </>
  );
}

/* ---------------- (legacy) TaskPanel — kept for backwards compat, unused ---------------- */
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
            Pending · {unassigned.length}
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
/* ---------------- Workplace-style toolbar item ---------------- */
/* Matches the Figma spec: 150×92, #1B1B1B bg, 7px radius,
   icon centered top, Roboto 18px label below in #C4C4C4 (or accent). */
function WPItem({ icon: Icon, label, onClick, active, accent, danger, badge, hasChevron, title }) {
  const labelColor = danger ? "#FF7A75" : accent || "#C4C4C4";
  const iconColor  = danger ? "#FF7A75" : accent || "#C4C4C4";
  return (
    <button
      onClick={onClick}
      title={title || label}
      style={{
        width: 150, height: 92, flex: "none",
        background: active ? "#2A2A2A" : "#1B1B1B",
        border: "none", borderRadius: 7,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        gap: 6, cursor: "pointer",
        position: "relative",
        transition: "background 120ms ease",
        padding: 0,
      }}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "#262626"; }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "#1B1B1B"; }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 4, color: iconColor }}>
        {Icon && <Icon size={28} strokeWidth={1.75} />}
        {hasChevron && (
          <span style={{ color: "#C4C4C4", fontSize: 8, marginTop: 6 }}>▲</span>
        )}
      </div>
      <span style={{
        fontFamily: "'Roboto', 'Inter', sans-serif",
        fontWeight: 400, fontSize: 14, lineHeight: 1.2,
        color: labelColor,
        letterSpacing: "0.01em",
      }}>{label}</span>
      {badge != null && badge !== 0 && (
        <span style={{
          position: "absolute", top: 10, right: 22,
          minWidth: 18, height: 18, padding: "0 5px",
          borderRadius: 99,
          background: "#2D8CFF", color: "#fff",
          fontSize: 11, fontWeight: 700,
          display: "flex", alignItems: "center", justifyContent: "center",
          lineHeight: 1,
        }}>{badge}</span>
      )}
    </button>
  );
}

function Toolbar({ muted, videoOn, panelOpen, sidePanel, onToggle, onOpenSide, onEndCall, taskCount, viewerRole, onSwitchRole, participantCount }) {
  return (
    <div style={{
      height: 92,
      background: "#000",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 20px",
      gap: 8,
      flex: "none",
    }}>
      {/* Left cluster — Mute + Video */}
      <div style={{ display: "flex", gap: 0 }}>
        <WPItem
          icon={muted ? IC.MicOff : IC.MicOn}
          label={muted ? "Unmute" : "Mute"}
          danger={muted}
          hasChevron
          onClick={() => onToggle("muted")}
        />
        <WPItem
          icon={videoOn ? IC.VideoOn : IC.VideoOff}
          label={videoOn ? "Stop Video" : "Start Video"}
          danger={!videoOn}
          hasChevron
          onClick={() => onToggle("videoOn")}
        />
      </div>

      {/* Center cluster — main meeting controls + Sync tasks */}
      <div style={{ display: "flex", gap: 0 }}>
        <WPItem icon={IC.Shield} label="Security" />
        <WPItem
          icon={IC.Participants}
          label="Participants"
          badge={participantCount}
          hasChevron
          active={panelOpen && sidePanel === "participants"}
          accent={panelOpen && sidePanel === "participants" ? "#7AB8FF" : undefined}
          onClick={() => onOpenSide("participants")}
        />
        <WPItem icon={IC.Chat} label="Chat" />
        <WPItem
          icon={IC.ScreenShare}
          label="Share Screen"
          accent="#63C454"
          hasChevron
        />
        <WPItem icon={IC.Record} label="Record" />
        <WPItem icon={IC.Reactions} label="Reactions" />
        <WPItem
          icon={IC.Sparkle}
          label="Sync tasks"
          active={panelOpen && sidePanel === "tasks"}
          accent={panelOpen && sidePanel === "tasks" ? "#C7B3FF" : undefined}
          badge={taskCount > 0 ? taskCount : undefined}
          onClick={() => onOpenSide("tasks")}
        />
        {onSwitchRole && (
          <WPItem
            icon={IC.User}
            label={viewerRole === "host" ? "Host" : "Attendee"}
            accent="#7AB8FF"
            active
            onClick={onSwitchRole}
            title={`Switch to ${viewerRole === "host" ? "attendee" : "host"} view`}
          />
        )}
      </div>

      {/* Right cluster — End */}
      <button
        onClick={onEndCall}
        title="End meeting"
        style={{
          width: 100, height: 50,
          background: "#CC3B33", border: "none", borderRadius: 11,
          color: "#fff",
          fontFamily: "'Roboto', 'Inter', sans-serif",
          fontWeight: 400, fontSize: 22, lineHeight: "26px",
          cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          flex: "none",
          transition: "background 120ms ease",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = "#B83229"; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "#CC3B33"; }}
      >
        End
      </button>
    </div>
  );
}

/* ---------------- Grid ---------------- */
/* Stage = a single composed screenshot of the Zoom call. We overlay an
   animated green "active speaker" frame on whichever tile is currently
   speaking, mapped to the tile's position within the source image. */
const TILE_RECTS = {
  // Calibrated against zoom-call-stage.png (1691×858) by detecting the dark
  // gaps between tiles in the source image. Bottom row (neriya, tal) is
  // intentionally omitted — the active-speaker frame is suppressed for them.
  me:     { left: "0.65%",  top: "9.91%",  width: "33.24%", height: "43.36%" },
  eitan:  { left: "34.06%", top: "9.91%",  width: "32.76%", height: "43.36%" },
  idan:   { left: "67.47%", top: "9.91%",  width: "31.81%", height: "43.36%" },
};

function MeetingGrid({ speakerId, muted, layout, selfId = "me" }) {
  const imgRef = useR(null);
  const [imgBox, setImgBox] = useS(null);

  // Track the rendered image's actual box (object-fit: contain centers it
  // and adds letterboxing). The overlay must align to this — not to the
  // outer container — or the green frame drifts off the tile.
  useE(() => {
    const update = () => {
      const el = imgRef.current;
      if (!el) return;
      const parent = el.parentElement.getBoundingClientRect();
      const natW = el.naturalWidth || 1691;
      const natH = el.naturalHeight || 858;
      const scale = Math.min(parent.width / natW, parent.height / natH);
      const w = natW * scale;
      const h = natH * scale;
      const left = (parent.width - w) / 2;
      const top  = (parent.height - h) / 2;
      setImgBox({ left, top, width: w, height: h });
    };
    update();
    const ro = new ResizeObserver(update);
    if (imgRef.current) ro.observe(imgRef.current.parentElement);
    return () => ro.disconnect();
  }, []);

  const rect = TILE_RECTS[speakerId];

  return (
    <div style={{
      width: "100%", height: "100%",
      borderRadius: 12, overflow: "hidden",
      background: "#000",
      position: "relative",
    }}>
      <img
        ref={imgRef}
        src="assets/zoom-call-stage.png"
        alt="Meeting participants"
        style={{
          width: "100%", height: "100%",
          objectFit: "contain",
          objectPosition: "center center",
          display: "block",
        }}
      />
      {rect && imgBox && (
        <div
          key={speakerId}
          className="zs-speaker-frame"
          style={{
            position: "absolute",
            left: `calc(${imgBox.left}px + ${rect.left})`,
            top: `calc(${imgBox.top}px + ${rect.top})`,
            width: `calc(${imgBox.width}px * ${parseFloat(rect.width) / 100})`,
            height: `calc(${imgBox.height}px * ${parseFloat(rect.height) / 100})`,
            boxSizing: "border-box",
            border: "3px solid #2EBF5A",
            borderRadius: 6,
            pointerEvents: "none",
            transition: "left 280ms ease, top 280ms ease, width 280ms ease, height 280ms ease",
            animation: "zsSpeakerPulse 1.4s ease-in-out infinite",
          }}
        />
      )}
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
  "viewerRole": "host",
  "viewerId": "me",
  "followUpAutoDetect": true,
  "followUpStartDelaySec": 60,
  "scheduledMinutes": 30,
  "demoSecondsPerMinute": 5,
  "wrapupWindowMinutes": 10
}/*EDITMODE-END*/;

function HostApp({ t, setTweak }) {
  const [state, setState] = useS({
    muted: false,
    videoOn: true,
    panelOpen: t.panelOpen,
    elapsed: 14 * 60 + 22,
    speakerIdx: 0, // pinned to "me" (Ofir) — viewer is the active speaker
    tab: t.initialTab || "mine",
    syncTab: "tasks",
    tasks: [],
    acceptedTasks: [],
    dismissedTasks: [],   // tasks the host explicitly dismissed — surfaced in recap so they can be revived
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

  // Follow-up engine: drives the live transcript reveal, intent detection,
  // host config modal, and RSVP tracking. Exposes phase + handlers.
  const followUp = useFollowUpEngine({
    autoDetect: t.followUpAutoDetect !== false,
    startDelaySec: t.followUpStartDelaySec ?? 60,
    viewerRole: "host",
  });
  // When intent is freshly detected, auto-open the panel + flip to Follow-up tab
  useE(() => {
    if (followUp.phase === "detected") {
      setState((s) => ({ ...s, panelOpen: true, syncTab: "followup" }));
    }
  }, [followUp.phase]);

  // Overtime engine — drives the TimerCard inside the Sync panel.
  // Demo-compressed: 1 simulated minute = `secondsPerMinute` wall seconds.
  const overtime = useOvertimeEngine({
    scheduledMinutes: t.scheduledMinutes || 30,
    secondsPerMinute: t.demoSecondsPerMinute || 5,
    enabled: !state.streamPaused,
  });
  // Skip the legacy "modal" phase — we no longer block the user with a
  // modal at T+0. The TimerCard turns red instead.
  useE(() => {
    if (overtime.phase === "modal") overtime.dismissModal();
  }, [overtime.phase]);

  // First time the meeting enters the wrap-up window (default last 10 min),
  // auto-open the Wrap-up sidebar and snap the panel onto it. We track a
  // "have we already done this once?" flag so the user can switch tabs and
  // it won't keep yanking them back.
  const wrapupAutoOpenedRef = useR(false);
  const wrapupWindowMin = t.wrapupWindowMinutes || 10;
  useE(() => {
    const minutesLeft = overtime.effectiveEnd - overtime.simMinutes;
    const inWrapWindow = overtime.isOvertime || minutesLeft <= wrapupWindowMin;
    if (inWrapWindow && !wrapupAutoOpenedRef.current) {
      wrapupAutoOpenedRef.current = true;
      setState((s) => ({ ...s, panelOpen: true, syncTab: "wrapup" }));
    }
  }, [overtime.simMinutes, overtime.effectiveEnd, overtime.isOvertime, wrapupWindowMin]);

  // When a NEW task lands (toast appears), bring the Sync panel forward
  // and snap to Tasks → Pending so the user actually sees the capture
  // (new tasks land Unassigned, which lives under the Pending sub-tab).
  useE(() => {
    if (state.newestTaskId) {
      setState((s) => ({ ...s, panelOpen: true, syncTab: "tasks", tab: "unassigned" }));
    }
  }, [state.newestTaskId]);

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
  // Stops once we've cycled through every template (no duplicates) or when
  // the meeting has been ended.
  useE(() => {
    if (state.streamPaused) return undefined;
    const intervalMs = Math.max(3, t.streamIntervalSec) * 1000;
    const id = setInterval(() => {
      setState((s) => {
        if (s.streamPaused) return s;
        if (s.streamIdx >= ZS_TASK_STREAM.length) return s;  // exhausted templates
        const template = ZS_TASK_STREAM[s.streamIdx];
        const newId = `t-stream-${Date.now()}`;
        // Tasks land Unassigned so the host has to confirm + assign each one.
        // The template's `owner` becomes a `suggestedOwner` hint instead.
        const newTask = {
          ...template,
          id: newId,
          createdAtOffset: 0,
          suggestedOwner: template.owner ?? null,
          owner: null,
        };
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
            title: template.title,
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

  // Note: a team activity simulator used to live here that auto-accepted
  // teammate tasks. Removed — only tasks the host explicitly accepts should
  // ever land in the Accepted bucket. Acceptance is the host's decision.

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
  // Dismiss = "I disagree with this task." We still keep a record of it so
  // the host can revive it from the recap if they change their mind.
  const dismissTask = (id) => setState((s) => {
    const task = s.tasks.find((x) => x.id === id);
    if (!task) return s;
    return {
      ...s,
      tasks: s.tasks.filter((x) => x.id !== id),
      dismissedTasks: [{ ...task, dismissedAt: Date.now() }, ...s.dismissedTasks],
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
  // End-meeting flow: clicking End opens a confirm dialog; confirming
  // pauses task generation, saves the full meeting state to localStorage,
  // and navigates to the recap window. The recap is a separate HTML
  // file (../recap/) and reads from localStorage on load.
  const openEndDialog = () => setState((s) => ({ ...s, endDialogOpen: true }));
  const cancelEnd     = () => setState((s) => ({ ...s, endDialogOpen: false }));

  const persistAndGoToRecap = () => {
    setState((s) => {
      const payload = {
        endedAt: Date.now(),
        elapsed: s.elapsed,
        score: overtime.score,
        scheduledMinutes: overtime.scheduledMinutes,
        overtimeMinutes: overtime.overtimeMinutes,
        wrappedUp: !overtime.isOvertime || overtime.score >= 90,
        // Tasks split into the same buckets the panel uses
        accepted: s.acceptedTasks,
        dismissed: s.dismissedTasks,
        myPending: s.tasks.filter((x) => x.owner === "me" && !x.departing),
        teamPending: s.tasks.filter((x) => x.owner != null && x.owner !== "me" && !x.departing),
        unassigned: s.tasks.filter((x) => x.owner == null && !x.departing),
        // Follow-up summary (if a follow-up was scheduled this meeting)
        followUp: (followUp.phase === "tracking" || followUp.phase === "sent") && followUp.intent && followUp.participants ? {
          subject: followUp.subject,
          slot: followUp.intent.suggestedSlots.find((sl) => sl.id === followUp.selectedSlotId) || followUp.intent.suggestedSlots[0],
          participants: followUp.participants,
        } : null,
      };
      try {
        localStorage.setItem("zs.recap", JSON.stringify(payload));
      } catch (e) { /* ignore */ }
      return { ...s, endDialogOpen: false, streamPaused: true };
    });
    // Defer navigation so the state update commits + localStorage write lands
    setTimeout(() => { window.location.href = "../recap/index.html"; }, 80);
  };

  const confirmEnd   = persistAndGoToRecap;
  const closeSummary = () => setState((s) => ({ ...s, summaryOpen: false }));

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
      <Header elapsed={state.elapsed} taskCount={state.tasks.length} host="Ofir Even-Zur" />

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
          <div style={{ flex: 1, minHeight: 0, position: "relative" }}>
            <MeetingGrid speakerId={speaker.id} muted={state.muted} layout={t.layout} />
            {/* Score Indicator + Warning Banner are now inside the Sync panel
                as a single TimerCard (top of the Tasks tab). The stage stays
                clean — no floating overlays competing with the meeting. */}
          </div>
        </section>

        {state.panelOpen && t.sidePanel === "tasks" && (
          <SyncPanel
            tasks={state.tasks}
            acceptedTasks={state.acceptedTasks}
            newestId={state.newestTaskId}
            tab={state.tab}
            onTabChange={(tab) => setState((s) => ({ ...s, tab }))}
            syncTab={state.syncTab}
            onSyncTabChange={(syncTab) => setState((s) => ({ ...s, syncTab }))}
            overtime={overtime}
            wrapupWindowMinutes={wrapupWindowMin}
            followUp={followUp}
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
            host="Ofir Even-Zur"
            onClose={() => setState((s) => ({ ...s, panelOpen: false }))}
          />
        )}

        {state.toast && (
          <div key={state.toast.id}
            onClick={() => setState((s) => ({
              ...s,
              panelOpen: true,
              syncTab: "tasks",
              tab: "unassigned",
              newestTaskId: state.toast.id,  // re-arms the highlight on the card
              toast: null,                    // dismiss the toast on click
            }))}
            style={{
              position: "absolute", top: 92,
              left: state.panelOpen ? "calc(50% - (var(--zs-panel-w) / 2) - 8px)" : "50%",
              width: "min(580px, calc(100% - 48px))",
              zIndex: 50, pointerEvents: "auto", cursor: "pointer",
            }}>
            <DetectionToast person={state.toast.person} phrase={state.toast.phrase} title={state.toast.title} />
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
        participantCount={ZS_PEOPLE.length}
        viewerRole={t.viewerRole}
        onSwitchRole={() => setTweak("viewerRole", t.viewerRole === "host" ? "attendee" : "host")}
      />

      {state.endDialogOpen && (
        <LeaveMeetingDialog
          viewer={ZS_PEOPLE.find((p) => p.id === "me")}
          // Anything Sync captured that hasn't been sent yet is "pending" —
          // host can still send / dismiss / reassign before walking away.
          pendingTasks={state.tasks.filter((x) => !x.departing)}
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

      {/* Follow-up host configuration modal — opens when user clicks
          "Configure & Send" on the Intent Card. */}
      {followUp.phase === "configuring" || followUp.phase === "sent" ? (
        <FUHostConfigModal
          engine={followUp}
          onClose={() => followUp.phase === "configuring" && followUp.setPhase("detected")}
        />
      ) : null}

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

      {/* The blocking Overtime Modal was removed. The TimerCard inside the
          Sync panel handles the same signal (turns red at T+0). To keep the
          engine progressing past its "modal" phase, auto-dismiss it. */}

      {/* Tweaks panel */}
      <TweaksPanel>
        <TweakSection label="Role" />
        <TweakRadio label="View as" value={t.viewerRole}
          options={["host", "attendee"]}
          onChange={(v) => setTweak("viewerRole", v)} />
        <TweakRadio label="Who are you" value={t.viewerId}
          options={["me", "eitan", "idan", "neriya", "tal"]}
          onChange={(v) => setTweak("viewerId", v)} />

        <TweakSection label="Panel" />
        <TweakToggle label="Side panel open" value={t.panelOpen} onChange={(v) => setTweak("panelOpen", v)} />
        <TweakRadio label="Which panel" value={t.sidePanel}
          options={["tasks", "participants"]}
          onChange={(v) => setTweak("sidePanel", v)} />

        <TweakSection label="Follow-up" />
        <TweakToggle
          label="Auto-detect intent"
          value={t.followUpAutoDetect !== false}
          onChange={(v) => setTweak("followUpAutoDetect", v)}
        />
        <TweakSlider label="Detect after" value={t.followUpStartDelaySec ?? 60}
          min={0} max={180} step={5} unit="s"
          onChange={(v) => setTweak("followUpStartDelaySec", v)} />
        <TweakButton label="Trigger detection now" onClick={() => followUp.fireDetection()} />
        <TweakButton label="Reset Follow-up" onClick={() => followUp.reset()} />
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

        <TweakSection label="Wrap-up timer" />
        <TweakSlider label="Scheduled length" value={t.scheduledMinutes || 30}
          min={5} max={90} step={5} unit=" min"
          onChange={(v) => setTweak("scheduledMinutes", v)} />
        <TweakSlider label="Timer appears at" value={t.wrapupWindowMinutes || 10}
          min={2} max={30} step={1} unit=" min left"
          onChange={(v) => setTweak("wrapupWindowMinutes", v)} />
        <TweakSlider label="Demo speed (1 min =)" value={t.demoSecondsPerMinute || 5}
          min={1} max={60} step={1} unit="s"
          onChange={(v) => setTweak("demoSecondsPerMinute", v)} />
        <TweakButton label="→ On track (no timer)" onClick={() => overtime.jumpTo("ontrack")} />
        <TweakButton label="→ Green · 8 min left" onClick={() => overtime.jumpTo("warning")} />
        <TweakButton label="→ Orange · 4 min left" onClick={() => overtime.jumpTo("orange")} />
        <TweakButton label="→ Red · 2 min left" onClick={() => overtime.jumpTo("modal")} />
        <TweakButton label="→ Overtime · +3 min" onClick={() => overtime.jumpTo("overtime")} />
        <TweakButton label="→ Deep overtime · +11" onClick={() => overtime.jumpTo("deepOvertime")} />
        <TweakButton label="→ End → Recap window" onClick={persistAndGoToRecap} />
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
