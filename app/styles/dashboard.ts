// ============================================================
// DASHBOARD STYLES — TIGHT UI, NO OVERFLOW, SAME COLOURS
// ============================================================
export const S = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');

  :root {
    --brand1: #c9a84c;
    --brand2: #e8c96a;
    --brand3: #f0d080;
    --bg0:    #0a0a0a;
    --bg1:    #111111;
    --bg2:    #181818;
    --bg3:    #222222;
    --b0:     #2a2a2a;
    --b1:     #333333;
    --b2:     #444444;
    --t1:     #f5f5f5;
    --t2:     #bbbbbb;
    --t3:     #777777;
    --t4:     #444444;
    --red:    #e05555;
    --green:  #4caf7d;
    --yellow: #e0a830;
    --blue:   #4a90d9;
    --orange: #e07840;
    --purple: #9b6dd6;
    --fd:     'DM Mono', monospace;
    --sb-w:   220px;
  }
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Inter', sans-serif;
    background: var(--bg0); color: var(--t1);
    font-size: 13px; line-height: 1.4;
    -webkit-font-smoothing: antialiased;
  }

  /* ── LAYOUT ── */
  .app { display: flex; min-height: 100vh; background: var(--bg0); overflow: hidden; }

  /* ── SIDEBAR ── */
  .sb {
    width: var(--sb-w); min-width: var(--sb-w);
    background: var(--bg1); border-right: 1px solid var(--b0);
    display: flex; flex-direction: column;
    height: 100vh; position: sticky; top: 0;
    overflow: hidden; flex-shrink: 0;
  }
  .sb-logo { padding: 12px 12px 8px; border-bottom: 1px solid var(--b0); flex-shrink: 0; }
  .logo-yt { font-size: 15px; font-weight: 800; color: var(--t1); letter-spacing: -0.3px; }
  .logo-yt span { color: var(--brand1); }
  .logo-tag { font-size: 9px; color: var(--t3); text-transform: uppercase; letter-spacing: 1.5px; margin-top: 1px; }
  .rp {
    display: inline-flex; align-items: center; gap: 4px;
    font-size: 9px; font-weight: 600; padding: 2px 6px; border-radius: 10px;
    margin-top: 5px; letter-spacing: 0.5px; text-transform: uppercase;
  }
  .rp-a { background: rgba(201,168,76,0.15); color: var(--brand2); border: 1px solid rgba(201,168,76,0.25); }
  .rp-t { background: rgba(76,175,125,0.12); color: var(--green); border: 1px solid rgba(76,175,125,0.2); }
  .sb-nav { flex: 1; overflow-y: auto; padding: 5px 7px; }
  .sb-nav::-webkit-scrollbar { width: 3px; }
  .sb-nav::-webkit-scrollbar-thumb { background: var(--b1); border-radius: 2px; }
  .ni {
    display: flex; align-items: center; gap: 7px;
    padding: 6px 7px; border-radius: 6px; cursor: pointer;
    color: var(--t3); font-size: 12px; font-weight: 500;
    margin-bottom: 1px; transition: background 0.15s, color 0.15s;
    position: relative; white-space: nowrap; overflow: hidden;
  }
  .ni:hover { background: var(--bg3); color: var(--t2); }
  .ni.on {
    background: rgba(201,168,76,0.12); color: var(--brand2);
    font-weight: 600; border-left: 3px solid var(--brand1); padding-left: 4px;
  }
  .ni-ic { width: 17px; font-size: 12px; text-align: center; flex-shrink: 0; }
  .ni-b {
    margin-left: auto; font-size: 9px; font-weight: 700;
    padding: 1px 5px; border-radius: 8px; font-family: var(--fd);
  }
  .ni-b.red    { background: rgba(224,85,85,0.2);  color: var(--red); }
  .ni-b.yellow { background: rgba(224,168,48,0.2); color: var(--yellow); }
  .ni-b.green  { background: rgba(76,175,125,0.2); color: var(--green); }
  .sb-foot { padding: 8px 10px; border-top: 1px solid var(--b0); flex-shrink: 0; }
  .uc { display: flex; align-items: center; gap: 7px; margin-bottom: 7px; }
  .av {
    width: 28px; height: 28px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 10px; font-weight: 800; flex-shrink: 0;
  }
  .av-a { background: rgba(201,168,76,0.2); color: var(--brand2); border: 1px solid rgba(201,168,76,0.3); }
  .av-t { background: rgba(76,175,125,0.2); color: var(--green); border: 1px solid rgba(76,175,125,0.3); }
  .uc-n { font-size: 11px; font-weight: 600; color: var(--t1); }
  .uc-r { font-size: 10px; color: var(--t3); }
  .btn-so {
    width: 100%; padding: 6px; background: var(--bg3);
    border: 1px solid var(--b1); border-radius: 6px; color: var(--t3);
    font-size: 11px; cursor: pointer; transition: background 0.15s, color 0.15s;
  }
  .btn-so:hover { background: var(--b0); color: var(--red); }

  /* ── MAIN ── */
  .main { flex: 1; display: flex; flex-direction: column; min-width: 0; overflow: hidden; height: 100vh; }
  .topbar {
    display: flex; align-items: center; gap: 8px;
    padding: 0 14px; height: 46px; min-height: 46px;
    border-bottom: 1px solid var(--b0); background: var(--bg1); flex-shrink: 0;
  }
  .tb-t { font-size: 13px; font-weight: 700; color: var(--t1); flex: 1; }
  .content { flex: 1; overflow-y: auto; padding: 10px 12px; background: var(--bg0); }
  .content::-webkit-scrollbar { width: 4px; }
  .content::-webkit-scrollbar-thumb { background: var(--b1); border-radius: 2px; }

  /* ── CARDS ── */
  .card { background: var(--bg1); border: 1px solid var(--b0); border-radius: 9px; padding: 10px 12px; margin-bottom: 8px; }
  .card-sm { background: var(--bg2); border: 1px solid var(--b0); border-radius: 7px; padding: 7px 10px; }

  /* ── SECTION HEADER ── */
  .sh { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
  .sh-l h2 { font-size: 14px; font-weight: 700; color: var(--t1); }
  .sh-l p  { font-size: 11px; color: var(--t3); margin-top: 1px; }

  /* ── CARD HEADER ── */
  .ch {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 8px; padding-bottom: 7px; border-bottom: 1px solid var(--b0);
  }
  .ct { font-size: 10px; font-weight: 700; color: var(--t3); text-transform: uppercase; letter-spacing: 0.8px; }

  /* ── GRIDS ── */
  .g2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .g3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
  .g4 { display: grid; grid-template-columns: repeat(4,1fr); gap: 8px; }

  /* ── STAT CARDS ── */
  .stat { background: var(--bg2); border: 1px solid var(--b0); border-radius: 7px; padding: 9px 11px; }
  .stat-l { font-size: 9px; color: var(--t3); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 3px; }
  .stat-v { font-size: 18px; font-weight: 800; font-family: var(--fd); color: var(--t1); line-height: 1; }
  .stat-s { font-size: 10px; color: var(--t3); margin-top: 2px; }

  /* ── BUTTONS ── */
  .btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 4px;
    border-radius: 7px; font-size: 12px; font-weight: 600; cursor: pointer; border: none;
    padding: 7px 13px; transition: opacity 0.15s, background 0.15s;
    white-space: nowrap; font-family: 'Inter', sans-serif;
  }
  .btn:hover { opacity: 0.88; }
  .btn:disabled { opacity: 0.45; cursor: not-allowed; }
  .btn-p    { background: var(--brand1); color: #0a0a0a; }
  .btn-g    { background: var(--bg3); color: var(--t2); border: 1px solid var(--b1); }
  .btn-dn   { background: rgba(224,85,85,0.15);  color: var(--red);    border: 1px solid rgba(224,85,85,0.25); }
  .btn-ok   { background: rgba(76,175,125,0.15); color: var(--green);  border: 1px solid rgba(76,175,125,0.25); }
  .btn-warn { background: rgba(224,168,48,0.15); color: var(--yellow); border: 1px solid rgba(224,168,48,0.25); }
  .btn-s    { padding: 5px 10px; font-size: 11px; }
  .btn-xs   { padding: 3px 8px; font-size: 10px; border-radius: 5px; }

  /* ── FORMS ── */
  .field { margin-bottom: 7px; }
  .field label {
    display: block; font-size: 10px; font-weight: 600; color: var(--t3);
    text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 3px;
  }
  .fi {
    width: 100%; background: var(--bg2); border: 1px solid var(--b1);
    border-radius: 6px; padding: 6px 9px; color: var(--t1);
    font-size: 12px; font-family: 'Inter', sans-serif;
    outline: none; transition: border-color 0.15s; -webkit-appearance: none;
  }
  .fi:focus { border-color: var(--brand1); }
  .fi::placeholder { color: var(--t4); }
  select.fi { cursor: pointer; }
  textarea.fi { resize: vertical; min-height: 56px; }

  /* ── BADGES ── */
  .badge { display: inline-flex; align-items: center; padding: 2px 6px; border-radius: 10px; font-size: 10px; font-weight: 600; white-space: nowrap; }
  .bg  { background: rgba(76,175,125,0.15);  color: var(--green);  }
  .br  { background: rgba(224,85,85,0.15);   color: var(--red);    }
  .by  { background: rgba(224,168,48,0.15);  color: var(--yellow); }
  .bb  { background: rgba(74,144,217,0.15);  color: var(--blue);   }
  .bo  { background: rgba(224,120,64,0.15);  color: var(--orange); }
  .bp  { background: rgba(155,109,214,0.15); color: var(--purple); }
  .bgr { background: var(--bg3); color: var(--t3); border: 1px solid var(--b1); }

  /* ── ALERTS ── */
  .alert { padding: 6px 10px; border-radius: 6px; font-size: 11px; line-height: 1.4; margin-bottom: 8px; }
  .al-r { background: rgba(224,85,85,0.1);   color: var(--red);    border: 1px solid rgba(224,85,85,0.2);   }
  .al-g { background: rgba(76,175,125,0.1);  color: var(--green);  border: 1px solid rgba(76,175,125,0.2);  }
  .al-y { background: rgba(224,168,48,0.1);  color: var(--yellow); border: 1px solid rgba(224,168,48,0.2);  }
  .al-b { background: var(--bg2); color: var(--t3); border: 1px solid var(--b1); }

  /* ── TABS ── */
  .tabs { display: flex; gap: 4px; flex-wrap: wrap; margin-bottom: 10px; }
  .tab {
    padding: 4px 9px; border-radius: 5px; font-size: 11px; font-weight: 600;
    cursor: pointer; background: var(--bg2); color: var(--t3);
    border: 1px solid var(--b1); transition: all 0.15s; white-space: nowrap;
  }
  .tab:hover { color: var(--t2); }
  .tab.on { background: rgba(201,168,76,0.15); color: var(--brand2); border-color: rgba(201,168,76,0.3); }

  /* ── PROGRESS BAR ── */
  .pw { background: var(--bg3); border-radius: 3px; height: 4px; overflow: hidden; flex-shrink: 0; }
  .pb { height: 100%; border-radius: 3px; transition: width 0.3s; }
  .pb-g { background: var(--green); }
  .pb-y { background: var(--yellow); }
  .pb-r { background: var(--red); }

  /* ── EXERCISE CARD ── */
  .ex-card {
    display: flex; align-items: center; justify-content: space-between;
    padding: 7px 9px; background: var(--bg2); border: 1px solid var(--b0);
    border-radius: 6px; cursor: pointer; transition: border-color 0.15s, background 0.15s; gap: 8px;
  }
  .ex-card:hover { border-color: var(--brand1); background: var(--bg3); }

  /* ── LOG ROW ── */
  .log-row { display: grid; align-items: center; gap: 5px; padding: 4px 0; border-bottom: 1px solid var(--b0); }
  .log-inp {
    background: var(--bg3); border: 1px solid var(--b1); border-radius: 5px;
    padding: 4px 5px; color: var(--t1); font-size: 11px; text-align: center; width: 100%; outline: none;
  }
  .log-inp:focus { border-color: var(--brand1); }

  /* ── TABLE ── */
  .tbl { width: 100%; border-collapse: collapse; font-size: 11px; }
  .tbl th {
    text-align: left; padding: 5px 7px; color: var(--t3);
    font-size: 9px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.8px; border-bottom: 1px solid var(--b0);
  }
  .tbl td { padding: 6px 7px; border-bottom: 1px solid var(--b0); color: var(--t2); vertical-align: middle; }
  .tbl tr:last-child td { border-bottom: none; }
  .tbl tr:hover td { background: var(--bg2); }

  /* ── MODAL ── */
  .overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.75);
    backdrop-filter: blur(3px); display: flex; align-items: center;
    justify-content: center; z-index: 500; padding: 12px;
  }
  .modal {
    background: var(--bg1); border: 1px solid var(--b1); border-radius: 11px;
    padding: 18px; width: 100%; max-width: 420px; max-height: 92vh; overflow-y: auto;
  }
  .modal-lg { max-width: 560px; }
  .modal-t { font-size: 14px; font-weight: 800; color: var(--t1); margin-bottom: 12px; }

  /* ── UTILS ── */
  .row  { display: flex; align-items: center; }
  .col  { display: flex; flex-direction: column; }
  .gap4  { gap: 4px; } .gap6  { gap: 6px; }  .gap8  { gap: 8px; }
  .gap10 { gap: 10px; }.gap12 { gap: 12px; } .gap16 { gap: 16px; }
  .mla { margin-left: auto; }
  .mt4  { margin-top: 4px;  } .mt8  { margin-top: 8px;   } .mt12 { margin-top: 12px;  } .mt16 { margin-top: 16px; }
  .mb4  { margin-bottom: 4px;} .mb8  { margin-bottom: 8px;} .mb12 { margin-bottom: 12px;} .mb16 { margin-bottom: 16px; }
  .fw6 { font-weight: 600; } .fw7 { font-weight: 700; } .fw8 { font-weight: 800; }
  .fs10 { font-size: 10px; } .fs11 { font-size: 11px; } .fs12 { font-size: 12px; } .fs13 { font-size: 13px; }
  .t1 { color: var(--t1); } .t2 { color: var(--t2); } .t3 { color: var(--t3); }
  .tg { color: var(--green); } .tr { color: var(--red); } .ty { color: var(--yellow); }
  .flex-wrap { flex-wrap: wrap; }

  /* ── HAMBURGER ── */
  .ham {
    display: none; flex-direction: column; justify-content: center; align-items: center;
    gap: 4px; width: 34px; height: 34px; background: var(--bg2);
    border: 1px solid var(--b1); border-radius: 7px; cursor: pointer; flex-shrink: 0;
  }
  .ham span { display: block; width: 17px; height: 2px; background: var(--t2); border-radius: 2px; }
  .ham:hover span { background: var(--t1); }

  /* ── MOBILE DRAWER ── */
  .drawer-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.55); backdrop-filter: blur(2px); z-index: 200; }
  .drawer-overlay.open { display: block; }
  .drawer {
    position: fixed; top: 0; left: 0; bottom: 0; width: 255px;
    background: var(--bg1); border-right: 1px solid var(--b0);
    z-index: 201; display: flex; flex-direction: column;
    transform: translateX(-100%); transition: transform 0.25s cubic-bezier(0.4,0,0.2,1);
  }
  .drawer.open { transform: translateX(0); }
  .drawer-head {
    display: flex; align-items: center; justify-content: space-between;
    padding: 12px 12px 9px; border-bottom: 1px solid var(--b0); flex-shrink: 0;
  }
  .drawer-nav { flex: 1; overflow-y: auto; padding: 7px 7px; }
  .dni {
    display: flex; align-items: center; gap: 9px; padding: 8px 9px; border-radius: 7px;
    cursor: pointer; color: var(--t3); font-size: 13px; font-weight: 500;
    margin-bottom: 2px; transition: background 0.15s, color 0.15s;
  }
  .dni:hover { background: var(--bg3); color: var(--t2); }
  .dni.on {
    background: rgba(201,168,76,0.12); color: var(--brand2);
    font-weight: 600; border-left: 3px solid var(--brand1); padding-left: 6px;
  }
  .dni-ic { width: 19px; font-size: 14px; text-align: center; flex-shrink: 0; }
  .dni-b {
    margin-left: auto; font-size: 9px; font-weight: 700; padding: 1px 5px;
    border-radius: 8px; background: rgba(224,85,85,0.2); color: var(--red); font-family: var(--fd);
  }
  .drawer-foot { padding: 9px 11px; border-top: 1px solid var(--b0); flex-shrink: 0; }

  /* ── RESPONSIVE ── */
  @media (max-width: 767px) {
    .sb   { display: none !important; }
    .ham  { display: flex !important; }
    .drawer { display: flex !important; }
    .topbar { padding: 0 10px; height: 46px; }
    .content { padding: 8px 8px; }
    .g2 { grid-template-columns: 1fr 1fr; gap: 6px; }
    .g3 { grid-template-columns: 1fr 1fr; gap: 6px; }
    .g4 { grid-template-columns: 1fr 1fr; gap: 5px; }
    .card { padding: 9px 10px; }
    .modal { padding: 14px; }
    .log-row { grid-template-columns: 1fr 48px 48px 48px 26px !important; gap: 3px; }
    .hide-mobile { display: none !important; }
  }
  @media (min-width: 768px) {
    .ham { display: none !important; }
    .drawer { display: none !important; }
    .drawer-overlay { display: none !important; }
  }
`;
