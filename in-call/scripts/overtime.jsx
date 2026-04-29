/* Zoom Sync — Meeting Overtime Alert + Meeting Score
   ----------------------------------------------------
   A private score the host sees in the top-right of the call. Starts at
   100% the moment the meeting opens; stays 100% until the scheduled end
   time. From the scheduled end onward it drops 1% per minute. The host
   gets a 5-min warning banner, then an overtime modal at T=0 with three
   choices: Extend / Schedule follow-up / Wrap up now.

   Demo time: meeting is 30 minutes scheduled, 1 wall-second = 1 simulated
   second by default — but the engine accepts a `secondsPerMinute` knob so
   we can compress the demo (default = 5s/min ⇒ a full 30min meeting runs
   in 2.5 minutes).

   Score color thresholds (matches DESIGN-SYSTEM tone families):
     100%       → green  (#1EA664)
     90–99%     → yellow (#E88B0C)
     80–89%     → orange (#F26B0F)
     <80%       → red    (#DC3545)

   The engine never decides for the user — it surfaces what to do. The
   actual "End meeting → open recap" wiring lives in app.jsx.
*/

const { useState: useOS, useEffect: useOE, useMemo: useOM, useRef: useOR } = React;
const OIC = window.ZoomSyncIcons;

/* Color thresholds. */
function scoreColor(score) {
  if (score >= 100) return { fg: "#1EA664", bg: "rgba(30,166,100,0.18)", border: "rgba(30,166,100,0.45)" };
  if (score >= 90)  return { fg: "#E88B0C", bg: "rgba(232,139,12,0.18)", border: "rgba(232,139,12,0.45)" };
  if (score >= 80)  return { fg: "#F26B0F", bg: "rgba(242,107,15,0.20)", border: "rgba(242,107,15,0.50)" };
  return                  { fg: "#DC3545", bg: "rgba(220,53,69,0.22)",  border: "rgba(220,53,69,0.55)"  };
}

function scoreLabel(score) {
  if (score >= 100) return "On track";
  if (score >= 90)  return "Slightly over";
  if (score >= 80)  return "Running long";
  return "Overtime";
}

/* ---------------- Engine hook ----------------
   Drives the entire score lifecycle. Returns a state object the host
   component can read + helpers for the modal actions.

   States:
     phase: "ontrack"       — scheduled time not yet reached, score = 100
     phase: "warning"       — within 5 min of scheduled end; banner armed
     phase: "modal"         — at scheduled end; overtime modal blocking
     phase: "overtime"      — past scheduled end, score dropping
     phase: "extended"      — host took +15 min (modal will re-fire later)
*/
function useOvertimeEngine({
  scheduledMinutes = 30,
  secondsPerMinute = 5,    // demo: 1 simulated minute = 5 wall seconds
  enabled          = true,
} = {}) {
  // simSeconds = simulated seconds elapsed (advances by 1 each
  // wall-second / secondsPerMinute * 60 = same scale, always 1s real = 1s sim
  // here we instead step by 60/secondsPerMinute simulated seconds per real second)
  // Simpler: tick every wall-second, advance simMinutes by (1/secondsPerMinute).
  const [simMinutes, setSimMinutes] = useOS(0);
  const [phase, setPhase]           = useOS("ontrack");
  const [bannerSeen, setBannerSeen] = useOS(false);
  const [modalSeen, setModalSeen]   = useOS(false);   // suppress re-firing after dismiss
  const [extensionMinutes, setExtensionMinutes] = useOS(0);

  // Tick: advance simulated minutes
  useOE(() => {
    if (!enabled) return undefined;
    const stepMin = 1 / secondsPerMinute;
    const id = setInterval(() => {
      setSimMinutes((m) => m + stepMin);
    }, 1000);
    return () => clearInterval(id);
  }, [enabled, secondsPerMinute]);

  // Effective scheduled end (with any extensions added)
  const effectiveEnd = scheduledMinutes + extensionMinutes;

  // Phase transitions driven by simMinutes
  useOE(() => {
    if (simMinutes >= effectiveEnd && !modalSeen) {
      setPhase("modal");
      return;
    }
    if (simMinutes >= effectiveEnd) {
      setPhase("overtime");
      return;
    }
    if (simMinutes >= effectiveEnd - 5 && !bannerSeen) {
      setPhase("warning");
      return;
    }
    setPhase("ontrack");
  }, [simMinutes, effectiveEnd, bannerSeen, modalSeen]);

  // Score: 100 until effectiveEnd, then -1 per simulated minute past it
  const overtimeMinutes = Math.max(0, simMinutes - effectiveEnd);
  const score = Math.max(0, 100 - Math.floor(overtimeMinutes));

  const minutesUntilEnd = Math.max(0, effectiveEnd - simMinutes);
  const isOvertime      = simMinutes > effectiveEnd;

  // Helpers (modal actions)
  const dismissBanner = () => setBannerSeen(true);
  const dismissModal  = () => { setModalSeen(true); setPhase(simMinutes >= effectiveEnd ? "overtime" : "ontrack"); };
  const extend15      = () => {
    setExtensionMinutes((x) => x + 15);
    setModalSeen(false);  // allow re-fire when the new end hits
    setBannerSeen(false);
    setPhase("ontrack");
  };

  // Tweaks debug helpers — jump to a specific phase
  const jumpTo = (target) => {
    if (target === "ontrack") {
      setSimMinutes(0); setBannerSeen(false); setModalSeen(false); setExtensionMinutes(0);
    } else if (target === "warning") {
      setSimMinutes(scheduledMinutes - 4.5); setBannerSeen(false); setModalSeen(false); setExtensionMinutes(0);
    } else if (target === "modal") {
      setSimMinutes(scheduledMinutes); setBannerSeen(true); setModalSeen(false); setExtensionMinutes(0);
    } else if (target === "overtime") {
      setSimMinutes(scheduledMinutes + 3); setBannerSeen(true); setModalSeen(true); setExtensionMinutes(0);
    } else if (target === "deepOvertime") {
      setSimMinutes(scheduledMinutes + 11); setBannerSeen(true); setModalSeen(true); setExtensionMinutes(0);
    }
  };

  return {
    phase, score, simMinutes, scheduledMinutes, effectiveEnd,
    overtimeMinutes: Math.floor(overtimeMinutes),
    minutesUntilEnd: Math.ceil(minutesUntilEnd),
    isOvertime,
    extensionMinutes,
    dismissBanner, dismissModal, extend15, jumpTo,
  };
}

/* ---------------- Score Indicator ----------------
   Floating circular badge in the top-right of the stage. Always visible
   while the meeting runs. Pulses gently each simulated minute when in
   overtime. Hover → tooltip explaining it's private.
*/
function ScoreIndicator({ score, overtimeMinutes, isOvertime, label }) {
  const c = scoreColor(score);
  const [hover, setHover] = useOS(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: "absolute", top: 14, right: 14,
        zIndex: 60,
        display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6,
        pointerEvents: "auto",
      }}
    >
      <div style={{
        position: "relative",
        width: 64, height: 64,
        borderRadius: "50%",
        background: "rgba(0,0,0,0.55)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        border: `2px solid ${c.fg}`,
        boxShadow: `0 0 0 1px rgba(0,0,0,0.6), 0 0 18px ${c.border}, 0 8px 22px rgba(0,0,0,0.45)`,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        transition: "border-color 280ms ease, box-shadow 280ms ease",
        animation: isOvertime ? "zsScorePulse 2.4s ease-in-out infinite" : undefined,
      }}>
        <div style={{
          fontSize: 18, fontWeight: 800,
          color: c.fg, lineHeight: 1, letterSpacing: "-0.02em",
          fontFamily: "'Inter', system-ui, sans-serif",
          fontVariantNumeric: "tabular-nums",
        }}>
          {score}<span style={{ fontSize: 10, fontWeight: 700, marginLeft: 1 }}>%</span>
        </div>
        <div style={{
          fontSize: 7, fontWeight: 800, color: "rgba(255,255,255,0.62)",
          textTransform: "uppercase", letterSpacing: "0.10em",
          marginTop: 3,
        }}>
          Score
        </div>
      </div>

      {isOvertime && overtimeMinutes > 0 && (
        <div style={{
          padding: "3px 8px", borderRadius: 6,
          background: "rgba(220,53,69,0.20)",
          border: "1px solid rgba(220,53,69,0.50)",
          color: "#FF7A75",
          fontSize: 9, fontWeight: 800, letterSpacing: "0.06em",
          textTransform: "uppercase",
          fontFamily: "'Inter', system-ui, sans-serif",
          animation: "zsOvertimeBlink 1.6s ease-in-out infinite",
        }}>
          {overtimeMinutes} min over
        </div>
      )}

      {hover && (
        <div style={{
          padding: "8px 10px", borderRadius: 8,
          background: "rgba(15,18,22,0.95)",
          border: "1px solid rgba(255,255,255,0.10)",
          color: "rgba(255,255,255,0.85)",
          fontSize: 11, fontWeight: 500, lineHeight: 1.4,
          width: 220, textAlign: "right",
          boxShadow: "0 8px 22px rgba(0,0,0,0.5)",
          pointerEvents: "none",
        }}>
          <div style={{ fontWeight: 700, color: "#fff", marginBottom: 2 }}>{label}</div>
          <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 10 }}>
            Private to you. Loses 1% per minute past scheduled end.
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- 5-Min Warning Banner ----------------
   Slides down from above-center. Auto-dismisses after 8s. Yellow stroke,
   dark bg matching the toolbar.
*/
function WarningBanner({ minutesUntilEnd, score, onDismiss }) {
  useOE(() => {
    const id = setTimeout(onDismiss, 8000);
    return () => clearTimeout(id);
  }, [onDismiss]);

  return (
    <div style={{
      position: "absolute", top: 18, left: "50%",
      transform: "translateX(-50%)",
      zIndex: 65,
      width: 540, maxWidth: "calc(100% - 60px)",
      animation: "zsBannerSlideDown 320ms cubic-bezier(0.22, 1, 0.36, 1)",
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "12px 14px",
        background: "#1B1B1B",
        border: "1px solid rgba(232,139,12,0.55)",
        borderRadius: 12,
        boxShadow: "0 12px 32px rgba(0,0,0,0.55), 0 0 0 1px rgba(232,139,12,0.18)",
      }}>
        <div style={{
          width: 30, height: 30, borderRadius: 8,
          background: "rgba(232,139,12,0.18)",
          color: "#E88B0C",
          display: "flex", alignItems: "center", justifyContent: "center",
          flex: "none",
        }}>
          <OIC.Clock size={16} strokeWidth={2.2} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 13, fontWeight: 600, color: "#fff",
            letterSpacing: "-0.005em", lineHeight: 1.35,
          }}>
            Meeting ends in {minutesUntilEnd} min · Score: {score}%
          </div>
          <div style={{
            fontSize: 11, color: "rgba(255,255,255,0.55)",
            marginTop: 2,
          }}>
            Wrap up to save your score, or extend if you need more time.
          </div>
        </div>
        <button
          onClick={onDismiss}
          aria-label="Dismiss warning"
          style={{
            width: 24, height: 24, borderRadius: 6,
            background: "transparent", border: "none",
            color: "rgba(255,255,255,0.55)",
            cursor: "pointer", flex: "none",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
        >
          <OIC.X size={14} strokeWidth={2.2} />
        </button>
      </div>
    </div>
  );
}

/* ---------------- Overtime Modal ----------------
   Fires once at T=0 (scheduled end). Three options as large rows.
   Dark surface to match the rest of the Zoom Sync system.
*/
function OvertimeOption({ icon: Icon, iconColor, label, sub, primary, onClick }) {
  const [hover, setHover] = useOS(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: "100%",
        display: "flex", alignItems: "center", gap: 14,
        padding: "14px 16px",
        background: primary
          ? (hover ? "#0A52E5" : "#0B5CFF")
          : (hover ? "var(--zs-bg-3)" : "var(--zs-bg-2)"),
        border: primary
          ? "1px solid rgba(255,255,255,0.10)"
          : `1px solid ${hover ? "rgba(255,255,255,0.18)" : "var(--zs-line)"}`,
        borderRadius: 12,
        color: "var(--zs-text-hi)",
        cursor: "pointer", textAlign: "left",
        transition: "background 160ms ease, border-color 160ms ease, transform 160ms ease",
        transform: hover ? "translateY(-1px)" : "translateY(0)",
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <div style={{
        width: 36, height: 36, borderRadius: 9,
        background: primary ? "rgba(255,255,255,0.16)" : iconColor.bg,
        color: primary ? "#fff" : iconColor.fg,
        display: "flex", alignItems: "center", justifyContent: "center",
        flex: "none",
      }}>
        <Icon size={18} strokeWidth={2} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 14, fontWeight: 700,
          color: primary ? "#fff" : "var(--zs-text-hi)",
          letterSpacing: "-0.01em", marginBottom: 2,
        }}>
          {label}
        </div>
        <div style={{
          fontSize: 12,
          color: primary ? "rgba(255,255,255,0.78)" : "var(--zs-text-md)",
          lineHeight: 1.4,
        }}>
          {sub}
        </div>
      </div>
      <div style={{
        color: primary ? "rgba(255,255,255,0.78)" : "var(--zs-text-lo)",
        transform: hover ? "translateX(2px)" : "translateX(0)",
        transition: "transform 160ms ease",
      }}>
        <OIC.ArrowRight size={16} strokeWidth={2.2} />
      </div>
    </button>
  );
}

function OvertimeModal({ score, onExtend, onScheduleFollowUp, onWrapUp, onDismiss }) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: "rgba(0,0,0,0.55)",
      backdropFilter: "blur(4px)",
      WebkitBackdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24,
      animation: "zsOvertimeFade 280ms ease-out",
    }}>
      <div style={{
        width: 560, maxWidth: "100%",
        background: "var(--zs-bg-1)",
        border: "1px solid var(--zs-line)",
        borderRadius: 16,
        boxShadow: "0 24px 64px rgba(0,0,0,0.55)",
        animation: "zsOvertimeScale 320ms cubic-bezier(0.22, 1, 0.36, 1)",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Top accent bar — yellow */}
        <div style={{
          height: 3,
          background: "linear-gradient(90deg, transparent 0%, #E88B0C 50%, transparent 100%)",
        }} />

        {/* Close */}
        <button
          onClick={onDismiss}
          aria-label="Dismiss"
          style={{
            position: "absolute", top: 14, right: 14,
            width: 28, height: 28, borderRadius: 7,
            background: "transparent", border: "none",
            color: "var(--zs-text-lo)",
            cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "var(--zs-bg-2)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
        >
          <OIC.X size={16} strokeWidth={2.2} />
        </button>

        {/* Header */}
        <div style={{ padding: "26px 28px 18px", textAlign: "left" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: "rgba(232,139,12,0.18)",
              color: "#E88B0C",
              display: "flex", alignItems: "center", justifyContent: "center",
              flex: "none",
            }}>
              <OIC.Clock size={22} strokeWidth={2} />
            </div>
            <div>
              <div style={{
                fontSize: 18, fontWeight: 700, color: "var(--zs-text-hi)",
                letterSpacing: "-0.015em", lineHeight: 1.25,
              }}>
                Meeting reached scheduled end
              </div>
              <div style={{
                fontSize: 12, color: "var(--zs-text-md)",
                marginTop: 3,
              }}>
                Your private Meeting Score will drop 1% per minute. What's next?
              </div>
            </div>
          </div>
        </div>

        {/* Options */}
        <div style={{
          padding: "0 22px 22px",
          display: "flex", flexDirection: "column", gap: 10,
        }}>
          <OvertimeOption
            icon={OIC.Clock}
            iconColor={{ fg: "#E88B0C", bg: "rgba(232,139,12,0.18)" }}
            label="Extend 15 min"
            sub="All attendees are free until 11:15 — Sync will check before extending"
            onClick={onExtend}
          />
          <OvertimeOption
            icon={OIC.Calendar}
            iconColor={{ fg: "#7AB8FF", bg: "rgba(45,140,255,0.18)" }}
            label="Schedule follow-up"
            sub="Sync next week instead — finds a slot that works for everyone"
            onClick={onScheduleFollowUp}
          />
          <OvertimeOption
            icon={OIC.Check}
            iconColor={{ fg: "#1EA664", bg: "rgba(30,166,100,0.18)" }}
            label="Wrap up now"
            sub={`Save ${score}% score · finalize tasks and send recap`}
            primary
            onClick={onWrapUp}
          />
        </div>

        {/* Footer note */}
        <div style={{
          padding: "12px 28px",
          borderTop: "1px solid var(--zs-line)",
          background: "var(--zs-bg-0)",
          fontSize: 11, color: "var(--zs-text-lo)",
          display: "flex", alignItems: "center", gap: 6,
        }}>
          <OIC.Lock size={11} strokeWidth={2.2} />
          Score is private — only you see this. Used to help you plan better next time.
        </div>
      </div>
    </div>
  );
}

/* ---------------- Animations ---------------- */
(function injectOvertimeStyles() {
  if (document.getElementById("zs-overtime-styles")) return;
  const style = document.createElement("style");
  style.id = "zs-overtime-styles";
  style.textContent = `
    @keyframes zsScorePulse {
      0%, 100% { transform: scale(1);    box-shadow: 0 0 0 1px rgba(0,0,0,0.6), 0 0 18px rgba(220,53,69,0.55), 0 8px 22px rgba(0,0,0,0.45); }
      50%      { transform: scale(1.05); box-shadow: 0 0 0 1px rgba(0,0,0,0.6), 0 0 28px rgba(220,53,69,0.75), 0 8px 22px rgba(0,0,0,0.45); }
    }
    @keyframes zsOvertimeBlink {
      0%, 100% { opacity: 1;    }
      50%      { opacity: 0.55; }
    }
    @keyframes zsBannerSlideDown {
      from { transform: translate(-50%, -16px); opacity: 0; }
      to   { transform: translate(-50%, 0);     opacity: 1; }
    }
    @keyframes zsOvertimeFade {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    @keyframes zsOvertimeScale {
      from { transform: scale(0.95); opacity: 0; }
      to   { transform: scale(1);    opacity: 1; }
    }
  `;
  document.head.appendChild(style);
})();

/* ---------------- Timer Card ----------------
   Replaces the floating Score Indicator + WarningBanner + OvertimeModal.
   Lives inside the Sync panel (top of the Tasks tab). 3 colour states:
     • Time Remaining (green)  — minutes left > 5
     • Ending Soon  (yellow)   — minutes left ≤ 5 and not yet overtime
     • Overtime     (red)      — past scheduled end; shows +MM:SS
*/
function TimerCard({ overtime }) {
  const { simMinutes, effectiveEnd, isOvertime, overtimeMinutes } = overtime;

  let label, fg, bg, border;
  let display;

  if (isOvertime) {
    label = "Overtime";
    fg = "#DC3545";
    bg = "rgba(220,53,69,0.12)";
    border = "rgba(220,53,69,0.40)";
    const overSec = Math.max(0, Math.floor(overtimeMinutes * 60));
    const mm = String(Math.floor(overSec / 60)).padStart(2, "0");
    const ss = String(overSec % 60).padStart(2, "0");
    display = `+${mm}:${ss}`;
  } else {
    const minutesLeft = Math.max(0, effectiveEnd - simMinutes);
    const nearEnd = minutesLeft <= 5;
    if (nearEnd) {
      label = "Ending Soon";
      fg = "#E88B0C";
      bg = "rgba(232,139,12,0.12)";
      border = "rgba(232,139,12,0.40)";
    } else {
      label = "Time Remaining";
      fg = "#1EA664";
      bg = "rgba(30,166,100,0.12)";
      border = "rgba(30,166,100,0.40)";
    }
    const totalSec = Math.max(0, Math.floor(minutesLeft * 60));
    const mm = String(Math.floor(totalSec / 60)).padStart(2, "0");
    const ss = String(totalSec % 60).padStart(2, "0");
    display = `${mm}:${ss}`;
  }

  const iconBg = bg.replace("0.12", "0.22");

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "10px 14px",
      background: bg,
      border: `1px solid ${border}`,
      borderRadius: 10,
      marginBottom: 12,
      animation: isOvertime ? "zsTimerPulse 1.6s ease-in-out infinite" : undefined,
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: 8,
        background: iconBg,
        display: "flex", alignItems: "center", justifyContent: "center",
        flex: "none",
      }}>
        <OIC.Clock size={16} color={fg} strokeWidth={2.4} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 9, fontWeight: 800,
          color: fg, opacity: 0.85,
          letterSpacing: "0.10em",
          textTransform: "uppercase",
          fontFamily: "'Inter', system-ui, sans-serif",
        }}>
          {label}
        </div>
        <div style={{
          fontSize: 22, fontWeight: 800,
          color: fg,
          fontVariantNumeric: "tabular-nums",
          letterSpacing: "0.04em",
          lineHeight: 1.15,
          fontFamily: "'Inter', system-ui, sans-serif",
        }}>
          {display}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Live Transcript Tab ----------------
   Renders the streamed transcript that drives follow-up detection.
   Each line shows the speaker's avatar, name, and the line being typed.
   Before any line streams, shows a "Sync is listening…" placeholder. */
function LiveTranscriptTab({ engine }) {
  const { lineIdx, partialText, phase } = engine;
  const lines = window.ZS_FOLLOWUP_TRANSCRIPT || [];
  const people = window.ZS_PEOPLE || [];
  const peopleById = (id) => people.find((p) => p.id === id);

  const completed = lines.slice(0, lineIdx);
  const currentLine = lineIdx < lines.length ? lines[lineIdx] : null;
  const isStreamingPhase =
    phase === "listening" || phase === "detected" ||
    phase === "configuring" || phase === "sent" ||
    phase === "tracking" || phase === "rsvp";
  const showCurrent = currentLine && (partialText || isStreamingPhase);
  const isWaiting = phase === "idle" && completed.length === 0 && !partialText;

  const renderRow = (line, text, isCurrent, key) => {
    const person = peopleById(line.speaker);
    return (
      <div key={key} style={{
        display: "flex", gap: 10, marginBottom: 14, alignItems: "flex-start",
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: "50%",
          backgroundImage: person?.photo ? `url(${person.photo})` : undefined,
          backgroundColor: person?.color || "var(--zs-bg-3)",
          backgroundSize: "cover", backgroundPosition: "center",
          flex: "none",
          border: isCurrent ? "1.5px solid #4FCB7F" : "1.5px solid transparent",
          boxShadow: isCurrent ? "0 0 0 2px rgba(79,203,127,0.25)" : undefined,
        }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 2 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--zs-text-hi)" }}>
              {person?.name || "Speaker"}
            </span>
            {isCurrent && (
              <span style={{
                fontSize: 9, fontWeight: 800, letterSpacing: "0.06em",
                color: "#4FCB7F", textTransform: "uppercase",
              }}>
                speaking…
              </span>
            )}
          </div>
          <div style={{
            fontSize: 12.5, color: "var(--zs-text-md)",
            lineHeight: 1.5,
          }}>
            {text}
            {isCurrent && (
              <span style={{
                display: "inline-block", width: 6, height: 14,
                background: "#4FCB7F", marginLeft: 2, verticalAlign: "middle",
                animation: "zsCursorBlink 0.9s step-end infinite",
              }} />
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="zs-scroll" style={{
      flex: 1, overflowY: "auto", padding: "14px 16px 16px",
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        marginBottom: 14, padding: "8px 12px",
        background: "rgba(45,140,255,0.08)",
        border: "1px solid rgba(45,140,255,0.25)",
        borderRadius: 9,
      }}>
        <span style={{
          width: 7, height: 7, borderRadius: "50%",
          background: "#4FCB7F",
          boxShadow: "0 0 8px rgba(79,203,127,0.65)",
          animation: "zsLivePulse 1.4s ease-in-out infinite",
          flex: "none",
        }} />
        <span style={{
          fontSize: 11, fontWeight: 700, color: "#7AB8FF",
          letterSpacing: "0.06em", textTransform: "uppercase",
        }}>
          Live · transcript only
        </span>
      </div>

      {isWaiting && (
        <div style={{
          padding: "32px 14px", textAlign: "center",
          color: "var(--zs-text-lo)",
          border: "1px dashed var(--zs-line)",
          borderRadius: 10,
        }}>
          <OIC.Sparkle size={22} strokeWidth={1.5} style={{ marginBottom: 10, color: "var(--zs-text-dim)" }} />
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--zs-text-md)" }}>Sync is listening…</div>
          <div style={{ fontSize: 11, marginTop: 4 }}>Transcript will appear here as the meeting progresses.</div>
        </div>
      )}

      {completed.map((line, i) => renderRow(line, line.text, false, `c${i}`))}
      {showCurrent && currentLine && renderRow(currentLine, partialText || "", true, "live")}
    </div>
  );
}

/* ---------------- Wrap-up Tab ----------------
   Auto-opens when the meeting hits the 5-minute warning. Helps the host
   close cleanly:
     • AI Summary       — what was said + decisions made
     • Open Tasks       — captured but not yet sent to Jira / Slack / etc.
     • Follow-up        — show scheduled invite OR offer to schedule one
*/
const WRAPUP_SUMMARY = [
  { kind: "decision",  text: "3-screen demo flow stays as scope — Pre-Meeting → In-Call → Recap. Standalone dashboard cut." },
  { kind: "decision",  text: "One PRD per feature. No bundling — Uri's rule." },
  { kind: "owned",     text: "Idan owns Cost-per-Brief math + per-seat Business Tiers slide for Max — by Wed." },
  { kind: "open",      text: "“Why Zoom Sync” opening slide still needs a strong draft — Uri’s first probe." },
  { kind: "logistics", text: "Booth — 240 GSM tees + non-smudge candy + balloons — vendor quotes pending." },
];

function WrapUpBanner({ overtime }) {
  const isOvertime = overtime.isOvertime;
  const minutesLeft = Math.max(0, Math.ceil(overtime.effectiveEnd - overtime.simMinutes));
  const fg = isOvertime ? "#DC3545" : "#E88B0C";
  const bg = isOvertime ? "rgba(220,53,69,0.12)" : "rgba(232,139,12,0.12)";
  const border = isOvertime ? "rgba(220,53,69,0.40)" : "rgba(232,139,12,0.40)";

  const headline = isOvertime
    ? `Past scheduled end · ${overtime.overtimeMinutes} min over`
    : `Meeting ends in ${minutesLeft} min · time to wrap up`;
  const sub = isOvertime
    ? "Sync put together everything you need to close cleanly. End the meeting once the open tasks are sent."
    : "Sync put together what you need to close on time and let attendees leave with full clarity.";

  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: 12,
      padding: "12px 14px",
      background: bg,
      border: `1px solid ${border}`,
      borderRadius: 11,
      marginBottom: 14,
    }}>
      <div style={{
        width: 34, height: 34, borderRadius: 9,
        background: bg.replace("0.12", "0.22"),
        display: "flex", alignItems: "center", justifyContent: "center",
        flex: "none",
      }}>
        <OIC.Sparkle size={17} color={fg} strokeWidth={2.2} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 12.5, fontWeight: 700,
          color: "var(--zs-text-hi)",
          letterSpacing: "-0.01em",
          marginBottom: 3,
        }}>
          {headline}
        </div>
        <div style={{
          fontSize: 11.5, color: "var(--zs-text-md)",
          lineHeight: 1.45,
        }}>
          {sub}
        </div>
      </div>
    </div>
  );
}

function WrapUpSection({ title, count, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        marginBottom: 10,
        paddingBottom: 6,
        borderBottom: "1px solid var(--zs-line)",
      }}>
        <span style={{
          fontSize: 10, fontWeight: 800,
          color: "var(--zs-text-md)",
          letterSpacing: "0.10em", textTransform: "uppercase",
        }}>
          {title}
        </span>
        {count != null && (
          <span style={{
            padding: "1px 7px", borderRadius: 99,
            background: "var(--zs-bg-2)",
            color: "var(--zs-text-md)",
            fontSize: 10, fontWeight: 700,
            border: "1px solid var(--zs-line)",
          }}>
            {count}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

function SummaryBullet({ kind, text }) {
  const palette = {
    decision:  { fg: "#1EA664", bg: "rgba(30,166,100,0.18)",  label: "Decision" },
    owned:     { fg: "#7AB8FF", bg: "rgba(45,140,255,0.18)",  label: "Owned" },
    open:      { fg: "#E88B0C", bg: "rgba(232,139,12,0.18)",  label: "Open" },
    logistics: { fg: "#C7B3FF", bg: "rgba(139,92,246,0.18)",  label: "Logistics" },
  };
  const c = palette[kind] || palette.decision;
  return (
    <div style={{
      display: "flex", gap: 10, alignItems: "flex-start",
      padding: "8px 0",
    }}>
      <span style={{
        fontSize: 9, fontWeight: 800,
        letterSpacing: "0.06em", textTransform: "uppercase",
        color: c.fg, background: c.bg,
        padding: "3px 8px", borderRadius: 99,
        flex: "none", marginTop: 1,
      }}>
        {c.label}
      </span>
      <span style={{
        flex: 1,
        fontSize: 12.5, color: "var(--zs-text-md)",
        lineHeight: 1.5,
      }}>
        {text}
      </span>
    </div>
  );
}

function WrapUpFollowUp({ followUp, onSchedule }) {
  const scheduled = followUp.phase === "tracking" || followUp.phase === "sent";

  if (scheduled && followUp.intent && followUp.participants) {
    const slot = followUp.intent.suggestedSlots.find((s) => s.id === followUp.selectedSlotId)
              || followUp.intent.suggestedSlots[0];
    const date = new Date(slot.dateTime);
    const day = date.toLocaleDateString("en-US", { weekday: "short" });
    const monthDay = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const time = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    const confirmed = followUp.participants.filter((p) => p.rsvpStatus === "confirmed").length;
    const total = followUp.participants.length;

    return (
      <div style={{
        padding: "12px 14px",
        background: "rgba(30,166,100,0.10)",
        border: "1px solid rgba(30,166,100,0.35)",
        borderRadius: 10,
        display: "flex", alignItems: "center", gap: 12,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 9,
          background: "rgba(30,166,100,0.22)",
          color: "#1EA664",
          display: "flex", alignItems: "center", justifyContent: "center",
          flex: "none",
        }}>
          <OIC.Check size={18} strokeWidth={2.4} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--zs-text-hi)", marginBottom: 2 }}>
            {followUp.subject || "Follow-up"} · {day} {monthDay} · {time}
          </div>
          <div style={{ fontSize: 11, color: "var(--zs-text-md)" }}>
            {confirmed} of {total} confirmed
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      padding: "14px 14px",
      background: "var(--zs-bg-2)",
      border: "1px dashed var(--zs-line)",
      borderRadius: 10,
      textAlign: "center",
    }}>
      <div style={{
        fontSize: 12, color: "var(--zs-text-md)",
        marginBottom: 10, lineHeight: 1.5,
      }}>
        No follow-up scheduled yet.<br/>
        <span style={{ color: "var(--zs-text-lo)" }}>Schedule one if topics stayed open.</span>
      </div>
      <button
        onClick={onSchedule}
        className="zs-btn zs-btn--primary zs-btn--sm"
        style={{ width: "100%" }}
      >
        <OIC.Calendar size={13} strokeWidth={2.2} /> Schedule follow-up
      </button>
    </div>
  );
}

function WrapUpTab({ overtime, tasks, followUp, onUpdate, onDismiss, onAccept, onAcceptAsMine, newestId, onScheduleFollowUp }) {
  // Open tasks = anything captured by Sync that hasn't been sent yet.
  const openTasks = (tasks || []).filter((t) => !t.departing);

  const TaskCardCmp = window.TaskCard;
  const ZS_PEOPLE = window.ZS_PEOPLE || [];

  return (
    <div className="zs-scroll" style={{
      flex: 1, overflowY: "auto", padding: "14px 16px 18px",
    }}>
      <WrapUpBanner overtime={overtime} />

      <WrapUpSection title="AI Summary" count={WRAPUP_SUMMARY.length}>
        <div>
          {WRAPUP_SUMMARY.map((b, i) => (
            <SummaryBullet key={i} kind={b.kind} text={b.text} />
          ))}
        </div>
      </WrapUpSection>

      <WrapUpSection title="Open Tasks · not yet sent" count={openTasks.length}>
        {openTasks.length === 0 ? (
          <div style={{
            padding: "18px 14px", borderRadius: 10,
            background: "rgba(30,166,100,0.10)",
            border: "1px solid rgba(30,166,100,0.30)",
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <OIC.Check size={16} color="#1EA664" strokeWidth={2.4} />
            <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--zs-text-hi)" }}>
              All captured tasks are sent. Nothing left open.
            </span>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {openTasks.map((task) => TaskCardCmp ? (
              <TaskCardCmp
                key={task.id}
                task={task}
                isNew={task.id === newestId}
                onAssign={(ownerId) => onUpdate(task.id, { owner: ownerId })}
                onDestination={(d) => onUpdate(task.id, { destination: d })}
                onDismiss={() => onDismiss(task.id)}
                onAccept={onAccept}
                onAcceptAsMine={onAcceptAsMine}
                onConfirm={() => onAcceptAsMine && onAcceptAsMine(task)}
              />
            ) : (
              <div key={task.id} style={{
                padding: 10, borderRadius: 8,
                background: "var(--zs-bg-2)",
                fontSize: 12, color: "var(--zs-text-hi)",
              }}>
                {task.title}
              </div>
            ))}
          </div>
        )}
      </WrapUpSection>

      <WrapUpSection title="Follow-up">
        <WrapUpFollowUp followUp={followUp} onSchedule={onScheduleFollowUp} />
      </WrapUpSection>
    </div>
  );
}

/* Inject extra animations used by the new components. */
(function injectTimerStyles() {
  if (document.getElementById("zs-timercard-styles")) return;
  const style = document.createElement("style");
  style.id = "zs-timercard-styles";
  style.textContent = `
    @keyframes zsTimerPulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(220,53,69,0.0); }
      50%      { box-shadow: 0 0 0 4px rgba(220,53,69,0.18); }
    }
    @keyframes zsLivePulse {
      0%, 100% { opacity: 1;   transform: scale(1); }
      50%      { opacity: 0.6; transform: scale(1.25); }
    }
    @keyframes zsCursorBlink {
      0%, 50%   { opacity: 1; }
      50.01%, 100% { opacity: 0; }
    }
  `;
  document.head.appendChild(style);
})();

Object.assign(window, {
  useOvertimeEngine,
  ScoreIndicator,
  WarningBanner,
  OvertimeModal,
  TimerCard,
  LiveTranscriptTab,
  WrapUpTab,
  scoreColor,
  scoreLabel,
});
