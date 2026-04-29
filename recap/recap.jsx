/* Zoom Sync — Recap window
   ----------------------------------------------------
   Loads from localStorage["zs.recap"] (written by in-call when host
   clicks End or Wrap up). Shows the Meeting Score reveal at the top,
   then sections for tasks (My / Team / Unassigned) and the scheduled
   follow-up. The user can mark tasks as done, accept unassigned ones,
   send reminders to pending RSVPs, and head back to a new meeting. */

const { useState, useEffect, useMemo, useRef } = React;
const RIC = window.ZoomSyncIcons;

/* ---------------- Color thresholds (overtime-driven, no score) ---------------- */
function recapTimeColor(overtimeMin) {
  if (overtimeMin <= 0) return { fg: "#1EA664", glow: "rgba(30,166,100,0.32)", soft: "rgba(30,166,100,0.18)" };
  if (overtimeMin <= 3) return { fg: "#E88B0C", glow: "rgba(232,139,12,0.32)", soft: "rgba(232,139,12,0.18)" };
  if (overtimeMin <= 8) return { fg: "#F26B0F", glow: "rgba(242,107,15,0.36)", soft: "rgba(242,107,15,0.20)" };
  return                       { fg: "#DC3545", glow: "rgba(220,53,69,0.40)",  soft: "rgba(220,53,69,0.22)"  };
}

function recapTimeVerdict(overtimeMin) {
  if (overtimeMin <= 0) return "Finished on time. Nice work.";
  if (overtimeMin <= 3) return `Ran ${overtimeMin} min over — close to on-time.`;
  if (overtimeMin <= 8) return `Ran ${overtimeMin} min over scheduled. Try a tighter agenda next time.`;
  return `Ran ${overtimeMin} min over. The next meeting will benefit from a shorter scope.`;
}

/* Format elapsed seconds → "1h 14m" / "32m" */
function formatElapsed(seconds) {
  const m = Math.floor(seconds / 60);
  if (m < 60) return `${m}m`;
  return `${Math.floor(m / 60)}h ${m % 60}m`;
}

/* Format overtime minutes → "+11m" / "+1h 17m". Returns null if not over. */
function formatOvertime(min) {
  if (min <= 0) return null;
  if (min < 60) return `+${min}m`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `+${h}h` : `+${h}h ${m}m`;
}

/* ---------------- Animated counter ---------------- */
function CountUp({ to = 0, ms = 800 }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf, start;
    const tick = (ts) => {
      if (!start) start = ts;
      const t = Math.min(1, (ts - start) / ms);
      const eased = 1 - Math.pow(1 - t, 3);
      setV(Math.round(eased * to));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, ms]);
  return <>{v}</>;
}

/* ---------------- Topbar ---------------- */
function RecapTopbar({ onBack }) {
  return (
    <div className="recap-topbar">
      <img
        src="../assets/zoom-sync-logo.png"
        alt="Zoom Sync"
        style={{ height: 32, width: "auto", display: "block" }}
      />
      <div style={{ fontSize: 11, color: "var(--zs-text-lo)", letterSpacing: "0.04em", textTransform: "uppercase", fontWeight: 600 }}>
        Meeting Recap
      </div>
      <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
        <button className="r-btn r-btn--ghost" onClick={onBack}>
          <RIC.ArrowRight size={14} strokeWidth={2} style={{ transform: "rotate(180deg)" }} />
          Back to meetings
        </button>
      </div>
    </div>
  );
}

/* ---------------- Hero (no score — time-based summary) ---------------- */
function RecapHero({ overtimeMin, scheduledMin, elapsedSec, wrappedUp }) {
  const c = recapTimeColor(overtimeMin);
  const isOvertime = overtimeMin > 0;
  const overtimeStr = formatOvertime(overtimeMin);
  return (
    <div
      className="recap-hero"
      style={{
        "--hero-glow": c.glow,
        "--score-color": c.fg,
        "--score-glow": c.glow,
      }}
    >
      <div>
        <img
          src="../assets/zoom-sync-logo.png"
          alt="Zoom Sync"
          style={{
            height: 72, width: "auto", display: "block",
            marginBottom: 22,
            filter: "drop-shadow(0 8px 24px rgba(45,140,255,0.20))",
          }}
        />
        <div className="recap-hero__eyebrow">
          <span style={{
            width: 6, height: 6, borderRadius: "50%",
            background: c.fg, boxShadow: `0 0 8px ${c.glow}`,
          }} />
          Meeting · {formatElapsed(elapsedSec)} elapsed · {scheduledMin}m scheduled
        </div>
        <h1 className="recap-hero__title">
          {wrappedUp ? "Wrapped up." : "Meeting ended."}
        </h1>
        <p className="recap-hero__sub">
          <strong>{recapTimeVerdict(overtimeMin)}</strong>{" "}
          Use the tasks and follow-ups below to close the loop.
        </p>
      </div>
      <div className="recap-hero__score">
        <div style={{
          display: "flex", flexDirection: "column",
          alignItems: "center", gap: 14,
        }}>
          {isOvertime ? (
            <>
              <div style={{
                color: c.fg,
                fontSize: 64, fontWeight: 800, lineHeight: 1,
                letterSpacing: "-0.03em",
                fontVariantNumeric: "tabular-nums",
                textShadow: `0 0 28px ${c.glow}`,
              }}>
                {overtimeStr}
              </div>
              <div style={{
                fontSize: 10, fontWeight: 800, letterSpacing: "0.10em",
                color: c.fg, textTransform: "uppercase",
                padding: "5px 11px", borderRadius: 99,
                background: c.soft, border: `1px solid ${c.glow}`,
              }}>
                Over scheduled
              </div>
            </>
          ) : (
            <>
              <div style={{
                width: 78, height: 78, borderRadius: "50%",
                background: c.soft,
                border: `2px solid ${c.glow}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: `0 0 32px ${c.glow}`,
              }}>
                <RIC.Check size={36} color={c.fg} strokeWidth={3} />
              </div>
              <div style={{
                fontSize: 11, fontWeight: 800, letterSpacing: "0.10em",
                color: c.fg, textTransform: "uppercase",
                padding: "5px 11px", borderRadius: 99,
                background: c.soft, border: `1px solid ${c.glow}`,
              }}>
                On time
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Stats row ---------------- */
function RecapStats({ data }) {
  const totalTasks = data.accepted.length + data.myPending.length
    + data.teamPending.length + data.unassigned.length;
  return (
    <div className="recap-stats">
      <div className="recap-stat">
        <div className="recap-stat__label">Tasks captured</div>
        <div className="recap-stat__val">{totalTasks}</div>
        <div className="recap-stat__sub">{data.accepted.length} sent · {totalTasks - data.accepted.length} open</div>
      </div>
      <div className="recap-stat">
        <div className="recap-stat__label">Yours to close</div>
        <div className="recap-stat__val">{data.myPending.length}</div>
        <div className="recap-stat__sub">My tasks remaining</div>
      </div>
      <div className="recap-stat">
        <div className="recap-stat__label">Team pending</div>
        <div className="recap-stat__val">{data.teamPending.length + data.unassigned.length}</div>
        <div className="recap-stat__sub">Awaiting acceptance</div>
      </div>
      <div className="recap-stat">
        <div className="recap-stat__label">Follow-up</div>
        <div className="recap-stat__val">
          {data.followUp ? "1" : "0"}
        </div>
        <div className="recap-stat__sub">{data.followUp ? "Scheduled" : "Not scheduled"}</div>
      </div>
    </div>
  );
}

/* ---------------- Assign menu (popover for unassigned tasks) ---------------- */
function AssignMenu({ onAssign }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);
  const people = window.ZS_PEOPLE || [];
  return (
    <div ref={ref} style={{ position: "relative", alignSelf: "center" }}>
      <button className="r-btn" onClick={() => setOpen((v) => !v)}>
        Assign
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
             style={{ marginLeft: 5, transform: open ? "rotate(180deg)" : "none", transition: "transform 140ms ease" }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", right: 0, zIndex: 50,
          minWidth: 200,
          background: "var(--zs-bg-2)",
          border: "1px solid var(--zs-line)",
          borderRadius: 10,
          boxShadow: "0 16px 40px rgba(0,0,0,0.50)",
          padding: 6,
        }}>
          {people.map((p) => (
            <button
              key={p.id}
              onClick={() => { onAssign(p.id); setOpen(false); }}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 10,
                padding: "8px 10px", borderRadius: 7, border: "none", cursor: "pointer",
                background: "transparent", color: "var(--zs-text-hi)",
                fontSize: 12.5, fontWeight: 500, textAlign: "left",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "var(--zs-bg-3)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            >
              <span style={{
                width: 22, height: 22, borderRadius: "50%",
                backgroundImage: p.photo ? `url(${p.photo})` : undefined,
                backgroundColor: p.color,
                backgroundSize: "cover", backgroundPosition: "center",
                flex: "none",
              }} />
              <span style={{ flex: 1 }}>
                {p.id === "me" ? "Take it (me)" : p.name}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------- Task row ---------------- */
function TaskRow({ task, owner, done, onToggleDone, action, actionLabel, assignMenu, sentBadge, hideCheckbox }) {
  const dest = window.ZS_DESTINATIONS && window.ZS_DESTINATIONS.find((d) => d.id === task.destination);
  return (
    <div className="r-task" data-done={done ? "true" : "false"}>
      {!hideCheckbox && (
        <button
          className="r-task__check"
          data-done={done ? "true" : "false"}
          onClick={onToggleDone}
          aria-label={done ? "Mark as not done" : "Mark as done"}
        >
          {done && <RIC.Check size={13} strokeWidth={3} />}
        </button>
      )}
      <div className="r-task__main">
        <div className="r-task__title">{task.title}</div>
        <div className="r-task__meta">
          {owner && (
            <span className="r-chip r-chip--owner">
              <RIC.User size={10} strokeWidth={2.5} /> {owner.name}
            </span>
          )}
          {!owner && task.owner == null && (
            <span className="r-chip">
              Unassigned
            </span>
          )}
          {task.due && (
            <span className="r-chip r-chip--due">
              <RIC.Clock size={10} strokeWidth={2.5} /> Due {task.due}
            </span>
          )}
          {dest && window.DestinationLogo && (
            <span className="r-task__dest">
              <window.DestinationLogo id={dest.id} size={14} />
              <span>{dest.name}</span>
            </span>
          )}
          {sentBadge && (
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              padding: "3px 8px", borderRadius: 99,
              fontSize: 9, fontWeight: 800, letterSpacing: "0.06em",
              textTransform: "uppercase",
              background: "rgba(30,166,100,0.15)",
              color: "#4FCB7F",
              border: "1px solid rgba(30,166,100,0.30)",
            }}>
              <RIC.Check size={9} strokeWidth={3} /> Sent
            </span>
          )}
        </div>
      </div>
      {assignMenu}
      {action && (
        <button className="r-btn" onClick={action} style={{ alignSelf: "center" }}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}

function personById(id) {
  return window.ZS_PEOPLE && window.ZS_PEOPLE.find((p) => p.id === id);
}

/* ---------------- Tasks Section ---------------- */
function TasksSection({ title, sub, tasks, doneIds, toggleDone, emptyText, action, actionLabelFn, assignable, onAssign, hideCheckbox, sentBadge }) {
  return (
    <div className="recap-section">
      <div className="recap-section__head">
        <div>
          <h2 className="recap-section__title">{title}</h2>
          {sub && <div className="recap-section__sub">{sub}</div>}
        </div>
        <span className="recap-section__count">{tasks.length}</span>
      </div>
      <div className="recap-section__body">
        {tasks.length === 0 && (
          <div className="r-empty">{emptyText}</div>
        )}
        {tasks.map((t) => (
          <TaskRow
            key={t.id}
            task={t}
            owner={personById(t.owner)}
            done={doneIds.has(t.id)}
            onToggleDone={() => toggleDone(t.id)}
            action={action ? () => action(t) : null}
            actionLabel={actionLabelFn ? actionLabelFn(t) : null}
            assignMenu={assignable ? <AssignMenu onAssign={(ownerId) => onAssign(t, ownerId)} /> : null}
            hideCheckbox={hideCheckbox}
            sentBadge={sentBadge}
          />
        ))}
      </div>
    </div>
  );
}

/* ---------------- Follow-up Section ---------------- */
function FollowUpSection({ followUp, sentReminders, onSendReminder }) {
  if (!followUp) {
    return (
      <div className="recap-section">
        <div className="recap-section__head">
          <div>
            <h2 className="recap-section__title">Follow-up meeting</h2>
            <div className="recap-section__sub">No follow-up was scheduled in this meeting.</div>
          </div>
        </div>
        <div className="recap-section__body">
          <div className="r-empty">
            If a topic stayed open, schedule a follow-up — Sync will find a slot that works for everyone.
          </div>
        </div>
      </div>
    );
  }

  const slot = followUp.slot;
  const date = new Date(slot.dateTime);
  const day = date.toLocaleDateString("en-US", { weekday: "short" });
  const monthDay = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const time = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  const confirmed = followUp.participants.filter((p) => p.rsvpStatus === "confirmed").length;
  const declined  = followUp.participants.filter((p) => p.rsvpStatus === "declined").length;
  const pending   = followUp.participants.length - confirmed - declined;

  return (
    <div className="recap-section">
      <div className="recap-section__head">
        <div>
          <h2 className="recap-section__title">
            Follow-up meeting · scheduled
          </h2>
          <div className="recap-section__sub">
            {confirmed} confirmed · {declined} declined · {pending} pending RSVP
          </div>
        </div>
        <span className="recap-section__count">{followUp.participants.length}</span>
      </div>

      <div className="recap-section__body">
        <div className="recap-followup">
          <div className="recap-followup__when">
            <div className="recap-followup__day">{day}</div>
            <div className="recap-followup__date">{monthDay}</div>
            <div className="recap-followup__time">{time} · 30 min</div>
            <div className="recap-followup__subject">{followUp.subject}</div>
          </div>

          <div className="recap-followup__people">
            <div className="recap-followup__people-title">RSVP status</div>
            {followUp.participants.map((p) => {
              const status = p.rsvpStatus || "pending";
              const isPending = status === "pending";
              const reminded = sentReminders.has(p.id);
              return (
                <div key={p.id} className="recap-rsvp-row">
                  <div
                    className="recap-rsvp-row__avatar"
                    style={p.photo ? { backgroundImage: `url(${p.photo})` } : { background: p.color }}
                  >
                    {!p.photo && (p.initials || p.name.split(" ").map((s) => s[0]).join(""))}
                  </div>
                  <div className="recap-rsvp-row__name">
                    {p.name}
                    {!p.isInternal && (
                      <span style={{
                        marginLeft: 6, fontSize: 9, fontWeight: 700,
                        color: "var(--zs-text-lo)", letterSpacing: "0.04em",
                        textTransform: "uppercase",
                      }}>External</span>
                    )}
                  </div>
                  <span
                    className="recap-rsvp-row__status"
                    data-status={status}
                  >
                    {status}
                  </span>
                  {isPending && !reminded && (
                    <button
                      className="r-btn"
                      style={{ padding: "5px 10px", fontSize: 11 }}
                      onClick={() => onSendReminder(p.id)}
                    >
                      Send reminder
                    </button>
                  )}
                  {isPending && reminded && (
                    <span style={{
                      fontSize: 10, fontWeight: 700,
                      color: "#4FCB7F",
                      letterSpacing: "0.04em", textTransform: "uppercase",
                      display: "inline-flex", alignItems: "center", gap: 4,
                    }}>
                      <RIC.Check size={11} strokeWidth={3} /> Sent
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- App ---------------- */
function RecapApp() {
  const data = useMemo(() => {
    try {
      const raw = localStorage.getItem("zs.recap");
      if (raw) return JSON.parse(raw);
    } catch (e) { /* ignore */ }
    // Demo fallback (so the page renders standalone for review)
    return {
      endedAt: Date.now(),
      elapsed: 36 * 60 + 14,
      score: 94,
      scheduledMinutes: 30,
      overtimeMinutes: 6,
      wrappedUp: true,
      accepted: [],
      myPending: [],
      teamPending: [],
      unassigned: [],
      followUp: null,
    };
  }, []);

  const [doneIds, setDoneIds] = useState(new Set());
  // assignments: Map<taskId, ownerId> — tracks late assignments made in the
  // recap. Clicking "Assign → Take it (me)" or any teammate populates this.
  const [assignments, setAssignments] = useState({});
  const [sentReminders, setSentReminders] = useState(new Set());

  const toggleDone = (id) => setDoneIds((prev) => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  const assignTask = (task, ownerId) => {
    setAssignments((prev) => ({ ...prev, [task.id]: ownerId }));
  };
  const sendReminder = (pid) => setSentReminders((prev) => new Set([...prev, pid]));

  // Reflect any late assignments. The host can re-assign tasks from any
  // section in the recap, and the lists re-bucket accordingly:
  //   • assignment override === "me"  → Your tasks to close
  //   • override is a teammate         → Team pending
  //   • override is null               → Unassigned
  // For Sent tasks, the owner display updates in place — the task stays
  // in "Sent during the meeting" since it was already routed.
  const effectiveOwner = (t) =>
    assignments[t.id] !== undefined ? assignments[t.id] : t.owner;
  const enrichOwner = (t) =>
    assignments[t.id] !== undefined ? { ...t, owner: assignments[t.id] } : t;

  const allPending = [...data.myPending, ...data.teamPending, ...data.unassigned];
  const visibleMyPending = allPending
    .filter((t) => effectiveOwner(t) === "me")
    .map(enrichOwner);
  const visibleTeamPending = allPending
    .filter((t) => {
      const o = effectiveOwner(t);
      return o && o !== "me";
    })
    .map(enrichOwner);
  const visibleUnassigned = allPending
    .filter((t) => !effectiveOwner(t));
  const visibleAccepted = data.accepted.map(enrichOwner);

  const goBack = () => { window.location.href = "../Pre-Meeting%20Popup.html"; };

  return (
    <div className="recap-shell">
      <RecapTopbar onBack={goBack} />
      <div className="recap-main">
        <RecapHero
          overtimeMin={data.overtimeMinutes}
          scheduledMin={data.scheduledMinutes}
          elapsedSec={data.elapsed}
          wrappedUp={data.wrappedUp}
        />

        <RecapStats data={{
          ...data,
          unassigned: visibleUnassigned,
          myPending: visibleMyPending,
          teamPending: visibleTeamPending,
        }} />

        <TasksSection
          title="Your tasks to close"
          sub="Tasks assigned to you that didn't get sent during the meeting."
          tasks={visibleMyPending}
          doneIds={doneIds}
          toggleDone={toggleDone}
          emptyText="Nothing left on your plate. Nice."
          assignable={true}
          onAssign={assignTask}
        />

        <TasksSection
          title="Sent during the meeting"
          sub="Tasks accepted and routed to Jira / Asana / Linear."
          tasks={visibleAccepted}
          doneIds={doneIds}
          toggleDone={toggleDone}
          emptyText="No tasks were sent during this meeting."
          hideCheckbox={true}
          sentBadge={true}
          assignable={true}
          onAssign={assignTask}
        />

        <TasksSection
          title="Unassigned · still need an owner"
          sub="Sync captured these but no one took them. Pick an owner — yourself or a teammate."
          tasks={visibleUnassigned}
          doneIds={doneIds}
          toggleDone={toggleDone}
          emptyText="Everything found a home."
          assignable={true}
          onAssign={assignTask}
        />

        <TasksSection
          title="Team pending"
          sub="Assigned to teammates — they'll accept on their side."
          tasks={visibleTeamPending}
          doneIds={doneIds}
          toggleDone={toggleDone}
          emptyText="No team tasks pending."
          assignable={true}
          onAssign={assignTask}
        />

        <FollowUpSection
          followUp={data.followUp}
          sentReminders={sentReminders}
          onSendReminder={sendReminder}
        />
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<RecapApp />);
