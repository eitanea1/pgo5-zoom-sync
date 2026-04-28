// Main app — state machine + tweaks

const STATES = [
  { id: 1, key: '1', label: 'Calendar' },
  { id: 2, key: '2', label: 'Brief modal' },
  { id: 3, key: '3', label: 'Actions expanded' },
  { id: 4, key: '4', label: 'Review details' },
  { id: 5, key: '5', label: 'Doc preview' },
  { id: 6, key: '6', label: 'Join meeting' },
];

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "fidelity": "sketch",
  "glow": true,
  "annotations": true,
  "blueAccent": "#2f7bff"
}/*EDITMODE-END*/;

function App() {
  const [state, setState] = React.useState(1);
  const [openDoc, setOpenDoc] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [tweaks, setTweak] = (window.useTweaks || ((d)=>[d, ()=>{}]))(TWEAK_DEFAULTS);

  // Apply fidelity to body
  React.useEffect(() => {
    document.body.classList.toggle('mode-hi', tweaks.fidelity === 'hifi');
  }, [tweaks.fidelity]);

  // Toggle annotations
  React.useEffect(() => {
    document.documentElement.style.setProperty('--show-annotate', tweaks.annotations ? 'block' : 'none');
    document.querySelectorAll('.annotate').forEach(el => {
      el.style.display = tweaks.annotations ? 'block' : 'none';
    });
  }, [tweaks.annotations, state]);

  // Toggle glow on event tiles
  React.useEffect(() => {
    document.querySelectorAll('.event.ai').forEach(el => {
      el.classList.toggle('glow', !!tweaks.glow);
    });
  }, [tweaks.glow, state]);

  // Set glow color
  React.useEffect(() => {
    document.documentElement.style.setProperty('--glow', tweaks.blueAccent || '#2f7bff');
  }, [tweaks.blueAccent]);

  // Brief load skeleton
  const goToBrief = () => {
    setLoading(true);
    setState(2);
    setTimeout(() => setLoading(false), 700);
  };

  // Keyboard nav
  React.useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (['1','2','3','4','5','6'].includes(e.key)) {
        const n = parseInt(e.key, 10);
        if (n === 2) goToBrief();
        else setState(n);
        if (n !== 5) setOpenDoc(null);
      }
      if (e.key === 'ArrowRight') setState(s => Math.min(6, s+1));
      if (e.key === 'ArrowLeft')  setState(s => Math.max(1, s-1));
      if (e.key === 'Escape') {
        if (openDoc) setOpenDoc(null);
        else if (state > 1) setState(s => s-1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [state, openDoc]);

  // State chips in topbar
  React.useEffect(() => {
    const strip = document.getElementById('stateStrip');
    if (!strip) return;
    strip.innerHTML = '';
    STATES.forEach(s => {
      const c = document.createElement('button');
      c.className = `state-chip ${s.id === state ? 'active' : ''}`;
      c.innerHTML = `<span class="num">${s.id}</span><span>${s.label}</span>`;
      c.onclick = () => {
        if (s.id === 2) goToBrief();
        else { setState(s.id); setOpenDoc(null); }
      };
      strip.appendChild(c);
    });
  }, [state]);

  return (
    <>
      {/* Always render calendar as the base layer */}
      <CalendarState onOpen={goToBrief} />

      {state === 2 && (
        <BriefModal
          onClose={() => setState(1)}
          onExpandTasks={() => setState(3)}
          onReviewDetails={() => setState(4)}
          onOpenDoc={(d) => { setOpenDoc(d); setState(5); }}
          onJoin={() => setState(6)}
          loading={loading}
        />
      )}
      {state === 3 && (
        <ActionsExpanded
          onClose={() => setState(1)}
          onBack={() => setState(2)}
        />
      )}
      {state === 4 && (
        <ReviewPanel
          onClose={() => setState(2)}
          onOpenDoc={(d) => { setOpenDoc(d); setState(5); }}
          onJoin={() => setState(6)}
        />
      )}
      {state === 5 && openDoc && (
        <DocPreview doc={openDoc} onClose={() => { setOpenDoc(null); setState(2); }} />
      )}
      {state === 6 && (
        <JoinMeetingState
          onLeave={() => setState(1)}
          onBackToBrief={() => setState(2)}
        />
      )}

      {/* Tweaks panel */}
      {window.TweaksPanel && (
        <TweaksPanel title="Tweaks">
          <TweakSection title="Fidelity">
            <TweakRadio
              label="Style"
              value={tweaks.fidelity}
              onChange={(v) => setTweak('fidelity', v)}
              options={[
                { value: 'sketch', label: 'Sketch' },
                { value: 'hifi', label: 'Hi-fi' },
              ]}
            />
          </TweakSection>
          <TweakSection title="AI signals">
            <TweakToggle label="Blue glow on AI-ready tiles" value={tweaks.glow} onChange={(v)=>setTweak('glow', v)} />
            <TweakColor label="Accent color" value={tweaks.blueAccent} onChange={(v)=>setTweak('blueAccent', v)} />
          </TweakSection>
          <TweakSection title="Wireframe overlay">
            <TweakToggle label="Show annotations" value={tweaks.annotations} onChange={(v)=>setTweak('annotations', v)} />
          </TweakSection>
          <TweakSection title="Jump to state">
            <div style={{display:'flex', flexWrap:'wrap', gap:6}}>
              {STATES.map(s => (
                <button key={s.id}
                  onClick={() => s.id===2 ? goToBrief() : setState(s.id)}
                  style={{
                    padding:'6px 10px', borderRadius:8,
                    border: state===s.id ? '1.5px solid #2f7bff' : '1.2px solid #d8dbe2',
                    background: state===s.id ? '#eaf1ff' : 'white',
                    fontSize:12, cursor:'pointer'
                  }}>
                  {s.id}. {s.label}
                </button>
              ))}
            </div>
          </TweakSection>
        </TweaksPanel>
      )}
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
