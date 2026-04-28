// Main app — Zoom Workplace shell + Get Ready popup + context menu

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "showPopupInitially": true,
  "minutesLeft": 15,
  "dimDesktop": true
}/*EDITMODE-END*/;

function App() {
  const [tweaks, setTweak] = (window.useTweaks || ((d)=>[d, ()=>{}]))(TWEAK_DEFAULTS);

  // Popup state
  const [popupOpen, setPopupOpen] = React.useState(!!TWEAK_DEFAULTS.showPopupInitially);

  // Context menu state
  const [ctx, setCtx] = React.useState(null);   // { x, y, event }
  const [detail, setDetail] = React.useState(null); // { x, y, event }

  // When tweak forces popup on/off
  React.useEffect(() => {
    setPopupOpen(!!tweaks.showPopupInitially);
  }, [tweaks.showPopupInitially]);

  const handleEventInteract = (ev, eventData, kind) => {
    ev.stopPropagation();
    if (kind === 'context') {
      setCtx({ x: ev.clientX, y: ev.clientY, event: eventData });
      setDetail(null);
    } else {
      // left click → open meeting detail card
      setDetail({ x: ev.clientX, y: ev.clientY, event: eventData });
      setCtx(null);
    }
  };

  const openSyncFromCtx = () => {
    setCtx(null);
    setDetail(null);
    setPopupOpen(true);
  };
  const openSyncFromDetail = () => {
    setDetail(null);
    setPopupOpen(true);
  };
  const openDetailFromCtx = () => {
    if (ctx) setDetail({ x: ctx.x, y: ctx.y, event: ctx.event });
    setCtx(null);
  };

  const closePopup = () => setPopupOpen(false);
  const join = () => {
    setPopupOpen(false);
    window.location.href = 'in-call/index.html';
  };

  return (
    <>
      <TopBar />
      <div className="layout">
        <Sidebar />
        <CalendarView onContextMenu={handleEventInteract} />
        <ChatPanel />
      </div>

      {ctx && (
        <ContextMenu
          x={ctx.x} y={ctx.y} event={ctx.event}
          onClose={() => setCtx(null)}
          onOpenSync={openSyncFromCtx}
          onOpenDetail={openDetailFromCtx}
        />
      )}

      {detail && (
        <MeetingDetail
          x={detail.x} y={detail.y} event={detail.event}
          onClose={() => setDetail(null)}
          onOpenSync={openSyncFromDetail}
        />
      )}

      {popupOpen && (
        <PreMeetingPopup
          minutesLeft={tweaks.minutesLeft}
          onClose={closePopup}
          onJoin={join}
        />
      )}

      {window.TweaksPanel && (
        <TweaksPanel title="Tweaks">
          <TweakSection title="Pre-meeting popup">
            <TweakButton label="Open Get Ready popup" onClick={() => setPopupOpen(true)} />
            <TweakSlider
              label="Minutes until meeting"
              value={tweaks.minutesLeft}
              min={1} max={30} step={1}
              onChange={(v)=>setTweak('minutesLeft', v)}
            />
          </TweakSection>
          <TweakSection title="Behaviour">
            <TweakToggle
              label="Show popup on load"
              value={tweaks.showPopupInitially}
              onChange={(v)=>setTweak('showPopupInitially', v)}
            />
            <TweakToggle
              label="Dim Zoom desktop behind popup"
              value={tweaks.dimDesktop}
              onChange={(v)=>{
                setTweak('dimDesktop', v);
                const s = document.querySelector('.scrim');
                if (s) s.style.background = v ? 'rgba(15,20,30,.35)' : 'transparent';
              }}
            />
          </TweakSection>
          <TweakSection title="Tip">
            <div style={{fontSize:12, color:'#666', lineHeight:1.5}}>
              <strong>Click</strong> a meeting to open its detail card with the
              <em> Zoom Sync</em> tab.<br/>
              <strong>Right-click</strong> a meeting for the quick menu — pick
              <em> "Zoom Sync — Get Ready"</em>.
            </div>
          </TweakSection>
        </TweaksPanel>
      )}
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
