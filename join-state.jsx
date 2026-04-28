// State 6: In-call screen — built to spec (1056×542 chrome window, dark stage, 4×2 grid, full toolbar)

const ZB_PARTICIPANTS = [
  // Top row (4)
  { name: "Mia",          you: true,  toneA:"#3b4d6e", toneB:"#1a2436" },
  { name: "Sam Kapoor",   host: true, toneA:"#5c4a2e", toneB:"#2a1f12" },
  { name: "Lena",                     toneA:"#4a3964", toneB:"#1f1632" },
  { name: "Diego",                    toneA:"#2d4a3a", toneB:"#0f2018" },
  // Bottom row (4)
  { name: "Priya Shah",               toneA:"#5c3a3a", toneB:"#2a1414" },
  { name: "Noah Brandt",  muted:true, toneA:"#3a4250", toneB:"#171c24" },
  { name: "Elena",                    toneA:"#48405c", toneB:"#1c1828" },
  { name: "Jamal",        muted:true, toneA:"#2e4858", toneB:"#101e26" },
];

const ZBtn = ({ w, label, caret, green, children, onClick }) => (
  <div className={`zb-btn w${w} ${green?'green':''}`} onClick={onClick}>
    <div className="ic">{children}</div>
    <div className="lbl">{label}</div>
    {caret && <span className="caret"></span>}
  </div>
);

// Tiny inline icons matching the spec (silver, ~24px)
const IcMic   = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ACACAC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="3" width="6" height="11" rx="3" fill="#ACACAC"/><path d="M5 11a7 7 0 0 0 14 0"/><path d="M12 18v3"/></svg>;
const IcVid   = () => <svg width="22" height="20" viewBox="0 0 24 24" fill="#ACACAC"><rect x="2" y="6" width="14" height="12" rx="2"/><polygon points="16,10 22,6 22,18 16,14" /></svg>;
const IcPart  = () => <svg width="22" height="20" viewBox="0 0 24 24" fill="#ACACAC"><circle cx="8" cy="9" r="3.5"/><circle cx="16" cy="11" r="3"/><path d="M2 19c1-3 4-4 6-4s5 1 6 4z"/><path d="M12 19c1-2.5 3-3.5 4-3.5s4 1 5 3.5z"/></svg>;
const IcChat  = () => <svg width="22" height="20" viewBox="0 0 24 24" fill="#ACACAC"><path d="M3 5h18v11H8l-5 4z"/></svg>;
const IcShare = () => <svg width="22" height="20" viewBox="0 0 24 24" fill="none" stroke="#69D569" strokeWidth="2"><rect x="3" y="5" width="18" height="13" rx="1.5"/><path d="M9 11l3-3 3 3" /><path d="M12 8v7" /></svg>;
const IcRec   = () => <svg width="22" height="20" viewBox="0 0 24 24" fill="none" stroke="#ACACAC" strokeWidth="2"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5" fill="#ACACAC"/></svg>;
const IcReact = () => <svg width="22" height="20" viewBox="0 0 24 24" fill="#ACACAC"><rect x="2" y="3"  width="9" height="9" rx="1.5"/><rect x="13" y="3" width="9" height="9" rx="1.5"/><rect x="2" y="14" width="9" height="9" rx="1.5"/><rect x="13" y="14" width="9" height="9" rx="1.5"/></svg>;
const IcReact2= () => <svg width="22" height="20" viewBox="0 0 24 24" fill="#ACACAC"><circle cx="9" cy="9" r="3"/><circle cx="15" cy="11" r="2.5"/><path d="M3 17c2 3 6 4 8 4s5-1 6-3"/></svg>;
const IcAI    = () => <svg width="22" height="20" viewBox="0 0 24 24" fill="none" stroke="#ACACAC" strokeWidth="1.8"><circle cx="19" cy="5" r="2.2"/><circle cx="12" cy="13" r="7"/><circle cx="10" cy="11" r="1" fill="#ED695E" stroke="none"/><circle cx="14" cy="11" r="1" fill="#ED695E" stroke="none"/><path d="M9 16h6" stroke="#ACACAC"/></svg>;

const JoinMeetingState = ({ onLeave, onBackToBrief }) => {
  const [showAI, setShowAI] = React.useState(true);
  return (
    <div className="join-stage">
      {/* macOS-style title bar */}
      <div className="zb-titlebar">
        <span className="traffic t-red"></span>
        <span className="traffic t-yel"></span>
        <span className="traffic t-grn"></span>
        <span className="t-title">Sprint Sync — Discovery Track</span>
      </div>

      {/* Video stage */}
      <div className="zb-stage">
        {/* top-left: shield + Original Sound */}
        <div className="zb-tl">
          <div className="zb-shield"><span className="zb-shield-ic"></span></div>
          <div className="zb-os">
            <span>Original Sound: Off</span>
            <span className="caret"></span>
          </div>
        </div>

        {/* top-right: View / grid */}
        <div className="zb-tr">
          <div className="zb-grid-ic">
            <span/><span/><span/><span/><span/><span/><span/><span/><span/>
          </div>
          <span className="lbl">View</span>
        </div>

        {/* 4×2 participants grid */}
        <div className="zb-grid">
          {ZB_PARTICIPANTS.map((p,i) => (
            <div key={i} className={`zb-tile ${p.you?'you':''}`} style={{'--toneA': p.toneA, '--toneB': p.toneB}}>
              <span className="zb-name">
                {p.muted && <span className="mic-x"></span>}
                {p.name}{p.host?' (host)':''}
              </span>
            </div>
          ))}
        </div>

        {/* AI sidebar */}
        {showAI && (
          <div className="call-with-ai">
            <h4><SparkleIcon size={14} color="#2f7bff" /> Sync AI</h4>
            <div className="small">CONTEXT FROM PRE-MEETING BRIEF</div>

            <div className="pin">
              <div className="who">PINNED · LAST DECISION</div>
              Move paywall to post-aha. Reversible if activation regresses.
            </div>

            <div className="small" style={{marginTop:12}}>YOUR OPEN ITEMS</div>
            <div className="mini-task"><span className="cb"></span><div>Confirm Android SDK spike <span style={{color:'var(--warn)'}}>· today</span></div></div>
            <div className="mini-task"><span className="cb"></span><div>Draft kill-criteria for v3 <span style={{color:'var(--ink-soft)'}}>· Wed</span></div></div>

            <div className="small" style={{marginTop:12}}>PINNED DOCS</div>
            <div className="pinned-doc"><DocIcon kind="pdf"/><div style={{flex:1}}>Onboarding v3 funnel.pdf</div></div>
            <div className="pinned-doc"><DocIcon kind="fig"/><div style={{flex:1}}>Paywall exploration</div></div>

            <button className="btn tiny" style={{marginTop:12, width:'100%', justifyContent:'center'}} onClick={onBackToBrief}>
              ‹ reopen full brief
            </button>
          </div>
        )}
      </div>

      {/* Bottom toolbar */}
      <div className="zb-bot">
        <div className="left">
          <ZBtn w={75} label="Mute" caret>
            <IcMic />
          </ZBtn>
          <ZBtn w={86} label="Stop Video" caret>
            <IcVid />
          </ZBtn>
        </div>
        <div className="center">
          <ZBtn w={78} label="Participants" caret>
            <IcPart />
          </ZBtn>
          <ZBtn w={86} label="Chat" caret>
            <IcChat />
          </ZBtn>
          <ZBtn w={78} label="Apps">
            <IcReact />
          </ZBtn>
          <ZBtn w={83} label="Share Screen" green caret>
            <IcShare />
          </ZBtn>
          <ZBtn w={76} label="Reactions">
            <IcReact2 />
          </ZBtn>
          <ZBtn w={74} label="Record">
            <IcRec />
          </ZBtn>
          <ZBtn w={104} label="Sync AI" onClick={()=>setShowAI(s=>!s)}>
            <IcAI />
          </ZBtn>
          <ZBtn w={69} label="More" caret>
            <IcReact2 />
          </ZBtn>
        </div>
        <button className="end" onClick={onLeave}>End</button>
      </div>
    </div>
  );
};

Object.assign(window, { JoinMeetingState });
