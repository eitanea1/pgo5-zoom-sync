/* Zoom Sync — Follow-up flow.
   Live transcript → AI intent detection → in-tab Intent Card →
   Host Configuration modal (slots + week view + participants) → Create Invite →
   RSVP tracker (host) / RSVP popup (attendee). */

const { useState: useFS, useEffect: useFE, useRef: useFR } = React;
const FIC = window.ZoomSyncIcons;

/* ---------------- Hook: drives the simulated transcript + intent detection ---------------- */
function useFollowUpEngine({ autoDetect, viewerRole, startDelaySec = 0 }) {
  // phase: 'idle' | 'listening' | 'detected' | 'configuring' | 'sent' | 'tracking' | 'rsvp'
  // 'idle' = waiting out the start delay so a few tasks can stream first.
  const [phase, setPhase] = useFS(startDelaySec > 0 ? "idle" : "listening");
  const [lineIdx, setLineIdx] = useFS(0);          // which transcript line
  const [partialText, setPartialText] = useFS(""); // word-by-word reveal of current line
  const [intent, setIntent] = useFS(null);
  const [participants, setParticipants] = useFS(null);
  const [selectedSlotId, setSelectedSlotId] = useFS("slot1");
  const [subject, setSubject] = useFS(ZS_FOLLOWUP_INTENT.subject);

  // After the start delay, flip to 'listening' so transcript streaming kicks in.
  // This lets a few task suggestions land first (tasks stream every
  // streamIntervalSec independently).
  useFE(() => {
    if (phase !== "idle") return undefined;
    if (startDelaySec <= 0) { setPhase("listening"); return undefined; }
    const id = setTimeout(() => setPhase("listening"), startDelaySec * 1000);
    return () => clearTimeout(id);
  }, [phase, startDelaySec]);

  // Stream the transcript word-by-word, line-by-line. When we finish line at
  // ZS_FOLLOWUP_TRIGGER_INDEX, fire intent detection (if autoDetect on).
  useFE(() => {
    if (!autoDetect) return undefined;
    if (phase !== "listening") return undefined;
    const lines = ZS_FOLLOWUP_TRANSCRIPT;
    if (lineIdx >= lines.length) return undefined;
    const line = lines[lineIdx];
    const words = line.text.split(" ");
    let wordI = 0;
    setPartialText("");
    const id = setInterval(() => {
      wordI++;
      setPartialText(words.slice(0, wordI).join(" "));
      if (wordI >= words.length) {
        clearInterval(id);
        // Pause briefly between lines, then advance.
        setTimeout(() => {
          if (lineIdx === ZS_FOLLOWUP_TRIGGER_INDEX) {
            // Trigger detection.
            setIntent(ZS_FOLLOWUP_INTENT);
            setParticipants(ZS_FOLLOWUP_INTENT.participants);
            setPhase("detected");
          } else {
            setLineIdx((i) => i + 1);
          }
        }, 700);
      }
    }, 110);
    return () => clearInterval(id);
  }, [lineIdx, phase, autoDetect]);

  // Manually trigger detection (Tweak)
  const fireDetection = () => {
    setIntent(ZS_FOLLOWUP_INTENT);
    setParticipants(ZS_FOLLOWUP_INTENT.participants);
    setLineIdx(ZS_FOLLOWUP_TRIGGER_INDEX);
    setPartialText(ZS_FOLLOWUP_TRANSCRIPT[ZS_FOLLOWUP_TRIGGER_INDEX].text);
    setPhase("detected");
  };

  const reset = () => {
    setPhase("listening");
    setLineIdx(0);
    setPartialText("");
    setIntent(null);
    setParticipants(null);
    setSelectedSlotId("slot1");
    setSubject(ZS_FOLLOWUP_INTENT.subject);
  };

  // Open config modal (host) or RSVP modal (attendee)
  const openConfigure = () => {
    if (viewerRole === "host") setPhase("configuring");
    else setPhase("rsvp");
  };
  const dismissDetection = () => setPhase("listening");

  // Submit invite — animate "Sending..." then go to tracking with simulated RSVPs.
  // The host ("me") is auto-confirmed since they are the organizer — they
  // sent the invite, so they don't need to RSVP.
  const submitInvite = () => {
    setPhase("sent");
    // After 1.4s, transition to tracking with all-pending RSVPs
    setTimeout(() => {
      setParticipants((ps) => ps.map((p) => ({
        ...p,
        rsvpStatus: p.id === "me" ? "confirmed" : "pending",
      })));
      setPhase("tracking");
      // Simulate RSVPs trickling in
      const arrivals = [
        { id: "eitan",  status: "confirmed", at: 1500 },
        { id: "tal",    status: "confirmed", at: 3200 },
        { id: "idan",   status: "confirmed", at: 5400 },
        { id: "neriya", status: "confirmed", at: 8000 },
      ];
      arrivals.forEach((a) => {
        setTimeout(() => {
          setParticipants((ps) => {
            if (!ps) return ps;
            return ps.map((p) => (p.id === a.id ? { ...p, rsvpStatus: a.status } : p));
          });
        }, a.at);
      });
    }, 1400);
  };

  return {
    phase, setPhase,
    lineIdx, partialText,
    currentSpeaker: ZS_FOLLOWUP_TRANSCRIPT[Math.min(lineIdx, ZS_FOLLOWUP_TRANSCRIPT.length - 1)]?.speaker,
    intent, participants, setParticipants,
    selectedSlotId, setSelectedSlotId,
    subject, setSubject,
    fireDetection, reset, openConfigure, dismissDetection, submitInvite,
  };
}

/* ---------------- Helpers ---------------- */
function fuFormatDate(iso, opts) {
  return new Date(iso).toLocaleDateString("en-US", opts);
}
function fuFormatTime(iso, opts = { hour: "numeric", minute: "2-digit" }) {
  return new Date(iso).toLocaleTimeString("en-US", opts);
}
function fuPersonById(id, list) {
  return (list || ZS_FOLLOWUP_PARTICIPANTS).find((p) => p.id === id);
}

/* ---------------- Listening Empty State ---------------- */
function FUListening({ partialText, currentSpeaker, lineIdx, onManualTrigger }) {
  const speakerPerson = fuPersonById(currentSpeaker);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, padding: "8px 4px 0" }}>
      {/* Hero state */}
      <div style={{
        textAlign: "center", padding: "20px 12px",
        border: "1px dashed var(--zs-line)", borderRadius: 12,
        background: "linear-gradient(180deg, rgba(45,140,255,0.05), transparent)",
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: "rgba(45,140,255,0.14)", color: "var(--zs-blue-500, #2D8CFF)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 10px",
          animation: "zsListenPulse 2.4s ease-in-out infinite",
        }}>
          <FIC.Sparkle size={22} strokeWidth={2} />
        </div>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--zs-text-hi)", letterSpacing: "-0.01em" }}>
          Listening for scheduling intent
        </div>
        <div style={{ fontSize: 11, color: "var(--zs-text-lo)", marginTop: 4, lineHeight: 1.45 }}>
          When someone proposes a follow-up, Sync will draft the invite for you.
        </div>
      </div>

      {/* Live transcript reveal */}
      <div>
        <div style={{
          fontSize: 10, fontWeight: 700, color: "var(--zs-text-lo)",
          letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8,
          display: "flex", alignItems: "center", gap: 6,
        }}>
          <span className="zs-livedot" style={{ background: "var(--zs-violet-500)" }} />
          Live transcript
        </div>
        <div style={{
          background: "var(--zs-bg-1)",
          border: "1px solid var(--zs-line)",
          borderRadius: 10,
          padding: "10px 12px",
          minHeight: 92,
          fontSize: 12, color: "var(--zs-text-md)", lineHeight: 1.5,
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          {/* Show prior lines (greyed) + current line being revealed */}
          {ZS_FOLLOWUP_TRANSCRIPT.slice(0, lineIdx).map((l, i) => {
            const p = fuPersonById(l.speaker);
            return (
              <div key={i} style={{ marginBottom: 6, opacity: 0.55 }}>
                <span style={{ color: p?.color || "var(--zs-text-md)", fontWeight: 600 }}>
                  {p?.name.split(" ")[0] || l.speaker}:
                </span>{" "}
                {l.text}
              </div>
            );
          })}
          {partialText && (
            <div>
              <span style={{ color: speakerPerson?.color || "var(--zs-text-md)", fontWeight: 600 }}>
                {speakerPerson?.name.split(" ")[0] || currentSpeaker}:
              </span>{" "}
              {partialText}
              <span style={{
                display: "inline-block", width: 6, height: 12,
                background: "currentColor", marginLeft: 2,
                animation: "zsCaretBlink 1s steps(2) infinite",
                verticalAlign: "text-bottom",
              }} />
            </div>
          )}
        </div>
      </div>

      <button
        onClick={onManualTrigger}
        className="zs-btn zs-btn--ghost zs-btn--sm"
        style={{ alignSelf: "center", fontSize: 11, color: "var(--zs-text-lo)" }}
        title="Skip transcript and trigger detection now"
      >
        Trigger detection now →
      </button>
    </div>
  );
}

/* ---------------- Intent Card (in-panel) ---------------- */
function FUIntentCard({ intent, onConfigure, onDismiss }) {
  const date = new Date(intent.suggestedTime);
  return (
    <div style={{
      background: "var(--zs-bg-1)",
      border: "1px solid rgba(45,140,255,0.32)",
      borderRadius: 14,
      overflow: "hidden",
      boxShadow: "0 0 0 4px rgba(45,140,255,0.08)",
      animation: "zs-toast-in 360ms cubic-bezier(0.22, 1, 0.36, 1)",
    }}>
      {/* Header */}
      <div style={{
        padding: "12px 14px", borderBottom: "1px solid var(--zs-line)",
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 9,
            background: "rgba(45,140,255,0.18)", color: "#7AB8FF",
            display: "flex", alignItems: "center", justifyContent: "center", flex: "none",
          }}>
            <FIC.Sparkle size={16} strokeWidth={2} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--zs-text-hi)", letterSpacing: "-0.01em" }}>
              Schedule a follow-up?
            </div>
            <div style={{ fontSize: 11, color: "var(--zs-text-lo)", marginTop: 1 }}>
              AI detected scheduling intent
            </div>
          </div>
        </div>
        <button onClick={onDismiss} className="zs-btn zs-btn--ghost zs-btn--sm" title="Dismiss">
          <FIC.X size={14} strokeWidth={2} />
        </button>
      </div>

      {/* Body */}
      <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 12 }}>
        {/* Detected phrase */}
        <div style={{
          background: "rgba(45,140,255,0.08)",
          border: "1px solid rgba(45,140,255,0.18)",
          borderRadius: 10, padding: "9px 11px",
        }}>
          <div style={{
            fontSize: 9, fontWeight: 700, color: "rgba(122,184,255,0.85)",
            letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 3,
          }}>
            Detected phrase
          </div>
          <div style={{
            fontSize: 12, color: "var(--zs-text-hi)", lineHeight: 1.45,
            fontStyle: "italic",
          }}>
            “{intent.detectedPhrase}”
          </div>
        </div>

        {/* Meeting preview */}
        <div style={{
          background: "var(--zs-bg-2)", borderRadius: 10, padding: "10px 12px",
          display: "flex", flexDirection: "column", gap: 8,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <FIC.Calendar size={13} strokeWidth={2} style={{ color: "var(--zs-text-lo)", flex: "none" }} />
            <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--zs-text-hi)" }}>
              {intent.subject}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <FIC.Clock size={13} strokeWidth={2} style={{ color: "var(--zs-text-lo)", flex: "none" }} />
            <span style={{ fontSize: 12, color: "var(--zs-text-md)" }}>
              {date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
              {" · "}
              {date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
            </span>
          </div>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            paddingTop: 4, borderTop: "1px solid var(--zs-line)",
          }}>
            <div style={{ display: "flex" }}>
              {intent.participants.slice(0, 5).map((p, i) => (
                <img
                  key={p.id}
                  src={p.photo}
                  alt={p.name}
                  title={p.name}
                  style={{
                    width: 26, height: 26, borderRadius: "50%",
                    objectFit: "cover",
                    border: "2px solid var(--zs-bg-2)",
                    marginLeft: i === 0 ? 0 : -7,
                  }}
                />
              ))}
              {intent.participants.length > 5 && (
                <div style={{
                  width: 26, height: 26, borderRadius: "50%",
                  background: "rgba(45,140,255,0.2)", color: "#7AB8FF",
                  border: "2px solid var(--zs-bg-2)",
                  fontSize: 9, fontWeight: 700,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginLeft: -7,
                }}>+{intent.participants.length - 5}</div>
              )}
            </div>
            <span style={{ fontSize: 11, color: "var(--zs-text-lo)" }}>
              {intent.participants.length} participants
            </span>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={onConfigure}
            className="zs-btn zs-btn--primary"
            style={{ flex: 1, fontSize: 13, fontWeight: 600, justifyContent: "center" }}
          >
            Configure & Send
          </button>
          <button
            onClick={onDismiss}
            className="zs-btn zs-btn--secondary"
            style={{ fontSize: 13 }}
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Calendar Availability View (in modal) ---------------- */
function FUCalendarAvailability({ slots, participants, selectedSlot, onSelect }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        fontSize: 10, fontWeight: 700, color: "var(--zs-text-md)",
        letterSpacing: "0.08em", textTransform: "uppercase",
      }}>
        <span>{slots.length} options found</span>
        <span style={{
          marginLeft: "auto", display: "flex", alignItems: "center", gap: 4,
          color: "var(--zs-amber-500)", fontSize: 10.5,
        }}>
          <FIC.Globe size={11} strokeWidth={2} />
          Cross-timezone
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {slots.map((slot) => {
          const date = new Date(slot.dateTime);
          const all = slot.availableParticipants.length === participants.length;
          const isSelected = selectedSlot === slot.id;
          const borderColor = isSelected
            ? "var(--zs-blue-500, #2D8CFF)"
            : all ? "rgba(23,178,106,0.35)" : "var(--zs-line)";
          const bg = isSelected
            ? "rgba(45,140,255,0.14)"
            : all ? "rgba(23,178,106,0.06)" : "var(--zs-bg-1)";
          return (
            <button
              key={slot.id}
              onClick={() => onSelect(slot.id)}
              style={{
                width: "100%", textAlign: "left",
                background: bg, border: `1px solid ${borderColor}`,
                borderRadius: 12, padding: "12px 14px",
                cursor: "pointer", color: "inherit",
                transition: "background 140ms ease, border 140ms ease",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 9 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                    <FIC.Calendar size={13} strokeWidth={2} style={{ color: "var(--zs-text-lo)" }} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: "var(--zs-text-hi)" }}>
                      {date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--zs-text-md)" }}>
                    <FIC.Clock size={13} strokeWidth={2} style={{ color: "var(--zs-text-lo)" }} />
                    <span style={{ fontSize: 12 }}>
                      {date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 4,
                  padding: "3px 9px", borderRadius: 99,
                  fontSize: 10.5, fontWeight: 700,
                  background: all ? "rgba(23,178,106,0.18)" : "rgba(245,165,36,0.18)",
                  color: all ? "var(--zs-green-500)" : "var(--zs-amber-500)",
                  border: `1px solid ${all ? "rgba(23,178,106,0.32)" : "rgba(245,165,36,0.32)"}`,
                }}>
                  {all ? <FIC.CheckCircle size={11} strokeWidth={2.5} /> : <FIC.UsersIcon size={11} strokeWidth={2.5} />}
                  {slot.availableParticipants.length}/{participants.length} free
                </span>
              </div>
              <div style={{ display: "flex", gap: 14 }}>
                {slot.availableParticipants.length > 0 && (
                  <div>
                    <div style={{ fontSize: 9, color: "var(--zs-text-lo)", marginBottom: 4, letterSpacing: "0.06em", textTransform: "uppercase" }}>Free</div>
                    <div style={{ display: "flex" }}>
                      {slot.availableParticipants.map((pid, i) => {
                        const p = fuPersonById(pid, participants);
                        if (!p) return null;
                        return (
                          <img key={pid} src={p.photo} alt={p.name} title={p.name}
                            style={{
                              width: 24, height: 24, borderRadius: "50%",
                              objectFit: "cover",
                              border: "2px solid var(--zs-bg-2)",
                              boxShadow: "0 0 0 1.5px rgba(23,178,106,0.45)",
                              marginLeft: i === 0 ? 0 : -6,
                            }} />
                        );
                      })}
                    </div>
                  </div>
                )}
                {slot.unavailableParticipants.length > 0 && (
                  <div>
                    <div style={{ fontSize: 9, color: "var(--zs-text-lo)", marginBottom: 4, letterSpacing: "0.06em", textTransform: "uppercase" }}>Busy</div>
                    <div style={{ display: "flex" }}>
                      {slot.unavailableParticipants.map((pid, i) => {
                        const p = fuPersonById(pid, participants);
                        if (!p) return null;
                        return (
                          <img key={pid} src={p.photo} alt={p.name} title={`${p.name} (Busy)`}
                            style={{
                              width: 24, height: 24, borderRadius: "50%",
                              objectFit: "cover", filter: "grayscale(1)", opacity: 0.4,
                              border: "2px solid var(--zs-bg-2)",
                              marginLeft: i === 0 ? 0 : -6,
                            }} />
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
      {/* AI Analysis */}
      <div style={{
        background: "rgba(45,140,255,0.08)",
        border: "1px solid rgba(45,140,255,0.20)",
        borderRadius: 11, padding: "10px 12px",
        display: "flex", gap: 8, alignItems: "flex-start",
      }}>
        <FIC.Sparkle size={13} strokeWidth={2} style={{ color: "#7AB8FF", marginTop: 1, flex: "none" }} />
        <div style={{ fontSize: 11, color: "rgba(147,197,253,0.95)", lineHeight: 1.5 }}>
          <strong style={{ color: "#7AB8FF" }}>AI Analysis:</strong>{" "}
          Found {slots.filter((s) => s.score === 100).length} time
          {slots.filter((s) => s.score === 100).length !== 1 ? "s" : ""} when everyone is free.
          Prioritized golden hours for cross-timezone participants.
        </div>
      </div>
    </div>
  );
}

/* ---------------- Calendar Week View (per-participant heatmap) ---------------- */
function FUCalendarWeek({ participants, selectedDate }) {
  const today = new Date(selectedDate || "2026-05-04");
  const weekDays = [];
  for (let i = 0; i < 5; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    weekDays.push(d);
  }
  const HOURS = [9, 10, 11, 12, 13, 14, 15, 16];
  const isBusy = (pid, dayIdx, hour) => {
    const blocks = ZS_FOLLOWUP_BUSY[pid] || [];
    return blocks.some((b) => b.day === dayIdx && hour >= b.hour && hour < b.hour + b.duration);
  };

  return (
    <div style={{ overflowX: "auto" }}>
      <div style={{ minWidth: 540 }}>
        <div style={{ display: "grid", gridTemplateColumns: "120px repeat(5, 1fr)", gap: 6, marginBottom: 8 }}>
          <div />
          {weekDays.map((d, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "var(--zs-text-md)" }}>
                {d.toLocaleDateString("en-US", { weekday: "short" })}
              </div>
              <div style={{ fontSize: 10, color: "var(--zs-text-lo)" }}>
                {d.toLocaleDateString("en-US", { month: "numeric", day: "numeric" })}
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {participants.map((p) => (
            <div key={p.id} style={{ display: "grid", gridTemplateColumns: "120px repeat(5, 1fr)", gap: 6, alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, minWidth: 0 }}>
                <img src={p.photo} alt={p.name}
                  style={{ width: 22, height: 22, borderRadius: "50%", objectFit: "cover", border: "1px solid var(--zs-line)" }} />
                <span style={{ fontSize: 11, color: "var(--zs-text-md)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {p.name.split(" ")[0]}
                </span>
              </div>
              {weekDays.map((_, dayIdx) => (
                <div key={dayIdx} style={{
                  height: 26, background: "var(--zs-bg-1)", borderRadius: 4,
                  overflow: "hidden", display: "flex",
                }}>
                  {HOURS.map((hour) => {
                    const busy = isBusy(p.id, dayIdx, hour);
                    return (
                      <div key={hour}
                        title={`${hour}:00 — ${busy ? "Busy" : "Free"}`}
                        style={{
                          flex: 1,
                          borderRight: "1px solid rgba(255,255,255,0.04)",
                          background: busy ? "rgba(240,68,56,0.36)" : "rgba(23,178,106,0.18)",
                        }} />
                    );
                  })}
                </div>
              ))}
            </div>
          ))}
        </div>
        <div style={{
          marginTop: 10, display: "flex", alignItems: "center", gap: 14,
          fontSize: 11, color: "var(--zs-text-lo)",
        }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 12, height: 12, background: "rgba(23,178,106,0.3)", borderRadius: 3 }} />Free
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 12, height: 12, background: "rgba(240,68,56,0.4)", borderRadius: 3 }} />Busy
          </span>
          <span style={{ marginLeft: "auto" }}>9 AM – 5 PM</span>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Host Configuration Modal ---------------- */
function FUHostConfigModal({ engine, onClose }) {
  const { intent, participants, setParticipants, selectedSlotId, setSelectedSlotId, subject, setSubject, submitInvite, phase } = engine;
  const [showCalendarView, setShowCalendarView] = useFS(false);
  const [showAddEmail, setShowAddEmail] = useFS(false);
  const [newEmail, setNewEmail] = useFS("");
  const sending = phase === "sent";
  const selectedSlot = intent.suggestedSlots.find((s) => s.id === selectedSlotId) || intent.suggestedSlots[0];
  const dateTime = selectedSlot.dateTime;
  const internal = participants.filter((p) => p.isInternal).length;
  const external = participants.filter((p) => !p.isInternal).length;

  const removeParticipant = (id) => setParticipants(participants.filter((p) => p.id !== id));
  const addParticipant = () => {
    if (!newEmail.includes("@")) return;
    const name = newEmail.split("@")[0];
    setParticipants([...participants, {
      id: `new-${Date.now()}`,
      name: name.charAt(0).toUpperCase() + name.slice(1),
      email: newEmail,
      isInternal: newEmail.endsWith("@company.com"),
      isOriginalInvitee: false,
      isCurrentAttendee: false,
      photo: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=2D8CFF&color=fff&size=120`,
    }]);
    setNewEmail("");
    setShowAddEmail(false);
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "absolute", inset: 0, zIndex: 60,
        background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 24,
        animation: "zsFadeIn 200ms ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(780px, 100%)", maxHeight: "calc(100vh - 48px)",
          background: "var(--zs-bg-1)", border: "1px solid var(--zs-line)",
          borderRadius: 18, boxShadow: "var(--zs-shadow-xl, 0 20px 60px rgba(0,0,0,0.55))",
          display: "flex", flexDirection: "column", overflow: "hidden",
          animation: "zsModalIn 240ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 18px", borderBottom: "1px solid var(--zs-line)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: "rgba(45,140,255,0.18)", color: "#7AB8FF",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <FIC.Sparkle size={18} strokeWidth={2} />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--zs-text-hi)", letterSpacing: "-0.01em" }}>
                Configure Follow-up Meeting
              </div>
              <div style={{ fontSize: 11, color: "var(--zs-text-lo)", marginTop: 1 }}>
                AI-powered scheduling · {participants.length} participants
              </div>
            </div>
          </div>
          <button onClick={onClose} className="zs-btn zs-btn--ghost zs-btn--sm">
            <FIC.X size={16} strokeWidth={2} />
          </button>
        </div>

        {/* Body */}
        <div className="zs-scroll" style={{
          padding: 18, overflowY: "auto", flex: 1,
          display: "flex", flexDirection: "column", gap: 16,
        }}>
          {/* Subject */}
          <div>
            <label style={{
              display: "block", fontSize: 10, fontWeight: 700,
              color: "var(--zs-text-lo)", letterSpacing: "0.08em",
              textTransform: "uppercase", marginBottom: 6,
            }}>
              Meeting Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="zs-input"
              style={{ width: "100%", height: 38, fontSize: 13, fontWeight: 500 }}
            />
          </div>

          {/* AI Suggested Slots */}
          <div style={{
            background: "var(--zs-bg-2)", border: "1px solid var(--zs-line)",
            borderRadius: 14, padding: 14,
          }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 7, marginBottom: 12,
              fontSize: 11, fontWeight: 700, color: "#7AB8FF",
              letterSpacing: "0.08em", textTransform: "uppercase",
            }}>
              <FIC.Sparkle size={12} strokeWidth={2} />
              AI Suggested Slots
            </div>
            <FUCalendarAvailability
              slots={intent.suggestedSlots}
              participants={participants}
              selectedSlot={selectedSlotId}
              onSelect={setSelectedSlotId}
            />
            <button
              onClick={() => setShowCalendarView((v) => !v)}
              style={{
                marginTop: 12, width: "100%",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                background: "transparent", border: "none",
                fontSize: 12, color: "#7AB8FF", cursor: "pointer", padding: "6px 0",
              }}
            >
              <FIC.Calendar size={14} strokeWidth={2} />
              {showCalendarView ? "Hide" : "View"} calendar analysis
              <FIC.ChevronDown size={14} strokeWidth={2}
                style={{ transition: "transform 200ms", transform: showCalendarView ? "rotate(180deg)" : "none" }} />
            </button>
            {showCalendarView && (
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--zs-line)" }}>
                <FUCalendarWeek participants={participants} selectedDate={dateTime} />
              </div>
            )}
          </div>

          {/* Participants — Golden List */}
          <div>
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              marginBottom: 8,
            }}>
              <label style={{
                fontSize: 10, fontWeight: 700, color: "var(--zs-text-lo)",
                letterSpacing: "0.08em", textTransform: "uppercase",
              }}>
                Participants
              </label>
              <div style={{ display: "flex", gap: 12, fontSize: 11, color: "var(--zs-text-lo)" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <FIC.UsersIcon size={11} strokeWidth={2} />
                  {internal} internal
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <FIC.Mail size={11} strokeWidth={2} />
                  {external} external
                </span>
              </div>
            </div>
            <div style={{
              background: "var(--zs-bg-2)", border: "1px solid var(--zs-line)",
              borderRadius: 12, maxHeight: 240, overflowY: "auto",
            }}>
              {participants.map((p, i) => (
                <div
                  key={p.id}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "10px 14px",
                    borderTop: i === 0 ? "none" : "1px solid var(--zs-line)",
                  }}
                >
                  <div style={{ position: "relative", flex: "none" }}>
                    <img src={p.photo} alt={p.name}
                      style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover", border: "1px solid var(--zs-line)" }} />
                    {!p.isInternal && (
                      <div style={{
                        position: "absolute", bottom: -2, right: -2,
                        width: 13, height: 13, borderRadius: "50%",
                        background: "#F97316", border: "2px solid var(--zs-bg-2)",
                      }} />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--zs-text-hi)" }}>{p.name}</div>
                    <div style={{
                      display: "flex", alignItems: "center", gap: 8, marginTop: 2,
                      fontSize: 11, color: "var(--zs-text-lo)",
                    }}>
                      <span>{p.email}</span>
                      {!p.isInternal && (
                        <span style={{
                          padding: "1px 6px", borderRadius: 4, fontSize: 9.5, fontWeight: 700,
                          background: "rgba(249,115,22,0.16)", color: "#FB923C",
                          letterSpacing: "0.04em", textTransform: "uppercase",
                        }}>External</span>
                      )}
                      {p.isCurrentAttendee && (
                        <span style={{ color: "var(--zs-green-500)", fontSize: 10 }}>• In call</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => removeParticipant(p.id)}
                    className="zs-btn zs-btn--ghost zs-btn--sm"
                    title="Remove participant"
                    style={{ color: "var(--zs-text-lo)" }}
                  >
                    <FIC.X size={13} strokeWidth={2} />
                  </button>
                </div>
              ))}
            </div>
            {showAddEmail ? (
              <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                <input
                  type="email" autoFocus
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addParticipant()}
                  placeholder="colleague@company.com"
                  className="zs-input"
                  style={{ flex: 1, height: 34, fontSize: 12 }}
                />
                <button onClick={addParticipant} className="zs-btn zs-btn--primary" style={{ height: 34, fontSize: 12 }}>Add</button>
                <button onClick={() => { setShowAddEmail(false); setNewEmail(""); }}
                  className="zs-btn zs-btn--secondary" style={{ height: 34, fontSize: 12 }}>Cancel</button>
              </div>
            ) : (
              <button
                onClick={() => setShowAddEmail(true)}
                style={{
                  marginTop: 8, width: "100%",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  padding: "9px 12px",
                  background: "transparent",
                  border: "1px dashed var(--zs-line)",
                  borderRadius: 10, fontSize: 12,
                  color: "var(--zs-text-lo)", cursor: "pointer",
                  transition: "color 140ms, border-color 140ms",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "#7AB8FF"; e.currentTarget.style.borderColor = "rgba(45,140,255,0.5)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "var(--zs-text-lo)"; e.currentTarget.style.borderColor = "var(--zs-line)"; }}
              >
                <FIC.Plus size={13} strokeWidth={2} />
                Add participant
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: "12px 18px", borderTop: "1px solid var(--zs-line)",
          background: "var(--zs-bg-2)",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
        }}>
          <div style={{ fontSize: 11, color: "var(--zs-text-lo)" }}>
            {participants.length} participant{participants.length === 1 ? "" : "s"} will be notified
          </div>
          <button
            onClick={submitInvite}
            disabled={sending}
            className="zs-btn zs-btn--primary"
            style={{ fontSize: 13, fontWeight: 600, padding: "0 18px", height: 38, opacity: sending ? 0.7 : 1 }}
          >
            {sending ? (
              <>
                <span className="zs-spinner" style={{
                  width: 12, height: 12, borderRadius: "50%",
                  border: "2px solid rgba(255,255,255,0.3)",
                  borderTopColor: "#fff",
                  animation: "zsSpin 700ms linear infinite",
                }} />
                Sending…
              </>
            ) : (
              <>
                <FIC.Send size={13} strokeWidth={2} />
                Create Invite
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- RSVP Tracker (in-panel summary) ---------------- */
function FURSVPTracker({ participants, intent, selectedSlot, onSendReminder }) {
  const confirmed = participants.filter((p) => p.rsvpStatus === "confirmed").length;
  const declined  = participants.filter((p) => p.rsvpStatus === "declined").length;
  const pending   = participants.filter((p) => !p.rsvpStatus || p.rsvpStatus === "pending").length;
  const date = new Date(selectedSlot.dateTime);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "8px 4px 0" }}>
      {/* Sent confirmation */}
      <div style={{
        background: "rgba(23,178,106,0.10)",
        border: "1px solid rgba(23,178,106,0.32)",
        borderRadius: 12, padding: "10px 12px",
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <div style={{
          width: 30, height: 30, borderRadius: 9,
          background: "rgba(23,178,106,0.22)", color: "var(--zs-green-500)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <FIC.Check size={15} strokeWidth={3} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--zs-text-hi)" }}>Invite sent</div>
          <div style={{ fontSize: 11, color: "var(--zs-text-lo)" }}>
            {intent.subject} · {date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} · {date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
          </div>
        </div>
      </div>

      {/* RSVP summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
        <div style={{
          background: "rgba(23,178,106,0.10)", border: "1px solid rgba(23,178,106,0.25)",
          borderRadius: 12, padding: "10px 6px", textAlign: "center",
        }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: "var(--zs-green-500)", lineHeight: 1 }}>{confirmed}</div>
          <div style={{ fontSize: 10, color: "rgba(46,191,90,0.85)", marginTop: 4, fontWeight: 600 }}>Confirmed</div>
        </div>
        <div style={{
          background: "var(--zs-bg-1)", border: "1px solid var(--zs-line)",
          borderRadius: 12, padding: "10px 6px", textAlign: "center",
        }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: "var(--zs-text-md)", lineHeight: 1 }}>{pending}</div>
          <div style={{ fontSize: 10, color: "var(--zs-text-lo)", marginTop: 4, fontWeight: 600 }}>Pending</div>
        </div>
        <div style={{
          background: "rgba(240,68,56,0.08)", border: "1px solid rgba(240,68,56,0.22)",
          borderRadius: 12, padding: "10px 6px", textAlign: "center",
        }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#F87171", lineHeight: 1 }}>{declined}</div>
          <div style={{ fontSize: 10, color: "rgba(248,113,113,0.85)", marginTop: 4, fontWeight: 600 }}>Declined</div>
        </div>
      </div>

      {/* Participant list */}
      <div>
        <div style={{
          fontSize: 10, fontWeight: 700, color: "var(--zs-text-lo)",
          letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 7,
        }}>
          Tracking responses
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {participants.map((p) => (
            <div key={p.id} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "8px 10px",
              background: "var(--zs-bg-1)", border: "1px solid var(--zs-line)",
              borderRadius: 10,
              transition: "background 200ms ease",
            }}>
              <div style={{ position: "relative", flex: "none" }}>
                <img src={p.photo} alt={p.name}
                  style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover", border: "1px solid var(--zs-line)" }} />
                {!p.isInternal && (
                  <div style={{
                    position: "absolute", bottom: -2, right: -2,
                    width: 11, height: 11, borderRadius: "50%",
                    background: "#F97316", border: "2px solid var(--zs-bg-1)",
                  }} />
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--zs-text-hi)" }}>{p.name}</div>
                <div style={{ fontSize: 10, color: "var(--zs-text-lo)" }}>
                  {p.isInternal ? "Internal" : "External"}
                </div>
              </div>
              <div style={{ flex: "none" }}>
                {p.rsvpStatus === "confirmed" && (
                  <FIC.CheckCircle size={18} strokeWidth={2} style={{ color: "var(--zs-green-500)" }} />
                )}
                {p.rsvpStatus === "declined" && (
                  <FIC.XCircle size={18} strokeWidth={2} style={{ color: "#F87171" }} />
                )}
                {(!p.rsvpStatus || p.rsvpStatus === "pending") && (
                  <FIC.Clock size={18} strokeWidth={2} style={{
                    color: "var(--zs-text-lo)",
                    animation: "zsSpin 3s linear infinite",
                  }} />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Attendee RSVP Modal ---------------- */
function FUParticipantRSVPModal({ engine, onClose }) {
  const { intent, participants, selectedSlotId, setParticipants, setPhase } = engine;
  const slot = intent.suggestedSlots.find((s) => s.id === selectedSlotId) || intent.suggestedSlots[0];
  const date = new Date(slot.dateTime);
  const [responding, setResponding] = useFS(false);

  const respond = (status) => {
    setResponding(true);
    setTimeout(() => {
      setParticipants(participants.map((p) => (p.id === "me" ? { ...p, rsvpStatus: status } : p)));
      setPhase("tracking");
    }, 900);
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "absolute", inset: 0, zIndex: 60,
        background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
        animation: "zsFadeIn 200ms ease",
      }}
    >
      <div onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(420px, 100%)",
          background: "var(--zs-bg-1)", border: "1px solid var(--zs-line)",
          borderRadius: 18, overflow: "hidden",
          boxShadow: "var(--zs-shadow-xl, 0 20px 60px rgba(0,0,0,0.55))",
          animation: "zsModalIn 240ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}>
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 18px", borderBottom: "1px solid var(--zs-line)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: "rgba(45,140,255,0.18)", color: "#7AB8FF",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <FIC.Calendar size={18} strokeWidth={2} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--zs-text-hi)" }}>Meeting Invitation</div>
              <div style={{ fontSize: 11, color: "var(--zs-text-lo)", marginTop: 1 }}>You've been invited to a follow-up</div>
            </div>
          </div>
          <button onClick={onClose} className="zs-btn zs-btn--ghost zs-btn--sm">
            <FIC.X size={16} strokeWidth={2} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{
            background: "var(--zs-bg-2)", border: "1px solid var(--zs-line)",
            borderRadius: 12, padding: 14, display: "flex", flexDirection: "column", gap: 8,
          }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--zs-text-hi)" }}>{intent.subject}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--zs-text-md)" }}>
              <FIC.Calendar size={14} strokeWidth={2} style={{ color: "var(--zs-text-lo)" }} />
              {date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--zs-text-md)" }}>
              <FIC.Clock size={14} strokeWidth={2} style={{ color: "var(--zs-text-lo)" }} />
              {date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--zs-text-md)" }}>
              <FIC.UsersIcon size={14} strokeWidth={2} style={{ color: "var(--zs-text-lo)" }} />
              {participants.length} participants
            </div>
          </div>

          <div>
            <div style={{
              fontSize: 10, fontWeight: 700, color: "var(--zs-text-lo)",
              letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6,
            }}>Attendees</div>
            <div style={{ display: "flex" }}>
              {participants.slice(0, 6).map((p, i) => (
                <img key={p.id} src={p.photo} alt={p.name} title={p.name}
                  style={{
                    width: 32, height: 32, borderRadius: "50%",
                    objectFit: "cover", border: "2px solid var(--zs-bg-1)",
                    marginLeft: i === 0 ? 0 : -8,
                  }} />
              ))}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <button
              onClick={() => respond("confirmed")}
              disabled={responding}
              className="zs-btn zs-btn--primary"
              style={{ height: 42, fontSize: 13, fontWeight: 600, justifyContent: "center" }}
            >
              <FIC.CheckCircle size={14} strokeWidth={2.5} />
              {responding ? "Confirming…" : "Accept & Add to Calendar"}
            </button>
            <button
              onClick={() => respond("declined")}
              disabled={responding}
              className="zs-btn zs-btn--secondary"
              style={{ height: 42, fontSize: 13, justifyContent: "center" }}
            >
              <FIC.XCircle size={14} strokeWidth={2} />
              Decline
            </button>
          </div>
          <div style={{ fontSize: 10.5, color: "var(--zs-text-lo)", textAlign: "center" }}>
            You can also respond via email
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Top-level FollowUpTab — what renders in the panel ---------------- */
function FollowUpTab({ engine }) {
  const { phase, lineIdx, partialText, currentSpeaker, intent, participants, selectedSlotId, fireDetection, dismissDetection, openConfigure } = engine;

  if (phase === "listening") {
    return (
      <FUListening
        partialText={partialText}
        currentSpeaker={currentSpeaker}
        lineIdx={lineIdx}
        onManualTrigger={fireDetection}
      />
    );
  }
  if (phase === "detected" || phase === "configuring" || phase === "sent") {
    return <FUIntentCard intent={intent} onConfigure={openConfigure} onDismiss={dismissDetection} />;
  }
  if (phase === "rsvp") {
    return <FUIntentCard intent={intent} onConfigure={openConfigure} onDismiss={dismissDetection} />;
  }
  if (phase === "tracking") {
    const slot = intent.suggestedSlots.find((s) => s.id === selectedSlotId) || intent.suggestedSlots[0];
    return <FURSVPTracker participants={participants} intent={intent} selectedSlot={slot} />;
  }
  return null;
}

Object.assign(window, {
  useFollowUpEngine,
  FollowUpTab,
  FUHostConfigModal,
  FUParticipantRSVPModal,
});