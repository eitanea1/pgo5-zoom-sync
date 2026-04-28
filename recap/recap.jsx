/* Zoom Sync — Recap window
   ----------------------------------------------------
   Loads from localStorage["zs.recap"] (written by in-call when host
   clicks End or Wrap up). Shows the Meeting Score reveal at the top,
   then sections for tasks (My / Team / Unassigned) and the scheduled
   follow-up. The user can mark tasks as done, accept unassigned ones,
   send reminders to pending RSVPs, and head back to a new meeting. */

const { useState, useEffect, useMemo } = React;
const RIC = window.ZoomSyncIcons;

/* ---------------- Color thresholds (mirrors overtime.jsx) ---------------- */
function recapScoreColor(score) {
  if (score >= 100) return { fg: "#1EA664", glow: "rgba(30,166,100,0.32)", soft: "rgba(30,166,100,0.18)" };
  if (score >= 90)  return { fg: "#E88B0C", glow: "rgba(232,139,12,0.32)", soft: "rgba(232,139,12,0.18)" };
  if (score >= 80)  return { fg: "#F26B0F", glow: "rgba(242,107,15,0.36)", soft: "rgba(242,107,15,0.20)" };
  return                  { fg: "#DC3545", glow: "rgba(220,53,69,0.40)",  soft: "rgba(220,53,69,0.22)"  };
}

function recapScoreVerdict(score, overtimeMin) {
  if (score >= 100) return "Finished on time. Nice work.";
  if (score >= 90)  return `${overtimeMin} min over — close to on-time.`;
  if (score >= 80)  return `${overtimeMin} min over scheduled. Try shorter agendas next time.`;
  return `${overtimeMin} min over. The next meeting will benefit from a tighter agenda.`;
}

/* Format elapsed seconds → "1h 14m" / "32m" */
function formatElapsed(seconds) {
  const m = Math.floor(seconds / 60);
  if (m < 60) return `${m}m`;
  return `${Math.floor(m / 60)}h ${m % 60}m`;
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

/* ---------------- Hero (Score Reveal) ---------------- */
function RecapHero({ score, overtimeMin, scheduledMin, elapsedSec, wrappedUp }) {
  const c = recapScoreColor(score);
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
          <strong>{recapScoreVerdict(score, overtimeMin)}</strong>{" "}
          Your private Meeting Score is captured below — only you see it. Use the
          tasks and follow-ups to close the loop.
        </p>
      </div>
      <div className="recap-hero__score">
        <div className="recap-hero__score-num">
          <CountUp to={score} />
          <small>%</small>
        </div>
        <div className="recap-hero__score-label">
          <RIC.Lock size={11} strokeWidth={2.2} />
          Private score
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

/* ---------------- Task row ---------------- */
function TaskRow({ task, owner, done, onToggleDone, action, actionLabel }) {
  const dest = window.ZS_DESTINATIONS && window.ZS_DESTINATIONS.find((d) => d.id === task.destination);
  return (
    <div className="r-task" data-done={done ? "true" : "false"}>
      <button
        className="r-task__check"
        data-done={done ? "true" : "false"}
        onClick={onToggleDone}
        aria-label={done ? "Mark as not done" : "Mark as done"}
      >
        {done && <RIC.Check size={13} strokeWidth={3} />}
      </button>
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
        </div>
      </div>
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
function TasksSection({ title, sub, tasks, doneIds, toggleDone, emptyText, action, actionLabelFn }) {
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
  const [acceptedLater, setAcceptedLater] = useState(new Set());
  const [sentReminders, setSentReminders] = useState(new Set());

  const toggleDone = (id) => setDoneIds((prev) => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  const acceptUnassigned = (task) => setAcceptedLater((prev) => new Set([...prev, task.id]));
  const sendReminder = (pid) => setSentReminders((prev) => new Set([...prev, pid]));

  // Filter unassigned to remove ones the user has now accepted
  const visibleUnassigned = data.unassigned.filter((t) => !acceptedLater.has(t.id));

  const goBack = () => { window.location.href = "../Pre-Meeting%20Popup.html"; };

  return (
    <div className="recap-shell">
      <RecapTopbar onBack={goBack} />
      <div className="recap-main">
        <RecapHero
          score={data.score}
          overtimeMin={data.overtimeMinutes}
          scheduledMin={data.scheduledMinutes}
          elapsedSec={data.elapsed}
          wrappedUp={data.wrappedUp}
        />

        <RecapStats data={{ ...data, unassigned: visibleUnassigned }} />

        <TasksSection
          title="Your tasks to close"
          sub="Tasks assigned to you that didn't get sent during the meeting."
          tasks={data.myPending}
          doneIds={doneIds}
          toggleDone={toggleDone}
          emptyText="Nothing left on your plate. Nice."
        />

        <TasksSection
          title="Sent during the meeting"
          sub="Tasks accepted and routed to Jira / Asana / Linear."
          tasks={data.accepted}
          doneIds={doneIds}
          toggleDone={toggleDone}
          emptyText="No tasks were sent during this meeting."
        />

        <TasksSection
          title="Unassigned · still need an owner"
          sub="Sync captured these but no one took them. Claim what's yours."
          tasks={visibleUnassigned}
          doneIds={doneIds}
          toggleDone={toggleDone}
          emptyText="Everything found a home."
          action={acceptUnassigned}
          actionLabelFn={() => "Take it"}
        />

        <TasksSection
          title="Team pending"
          sub="Assigned to teammates — they'll accept on their side."
          tasks={data.teamPending}
          doneIds={doneIds}
          toggleDone={toggleDone}
          emptyText="No team tasks pending."
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
