// ============================================================
// YOURTRAINER — GLOBAL STYLES
// Mobile-first. Light theme. White / Gold / Black / Red / Green.
// ============================================================

export const S = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }

  :root {
    /* ── Backgrounds ── */
    --bg:  #FAF9F6;
    --s1:  #FFFFFF;
    --s2:  #F4F3EF;
    --s3:  #ECEAE4;
    --s4:  #E0DED7;

    /* ── Borders ── */
    --b1: rgba(0,0,0,0.07);
    --b2: rgba(0,0,0,0.11);
    --b3: rgba(0,0,0,0.18);

    /* ── Text ── */
    --t1: #1A1A1A;
    --t2: #4A4A4A;
    --t3: #888880;
    --t4: #BCBCB4;

    /* ── Brand — Gold ── */
    --brand:  #C9A84C;
    --brand2: #B8922E;
    --brand3: rgba(201,168,76,0.12);

    /* ── Semantic colours ── */
    --green:  #1A7A4A;
    --green2: rgba(26,122,74,0.10);
    --red:    #D42B2B;
    --red2:   rgba(212,43,43,0.10);
    --yellow: #B07800;
    --yellow2:rgba(176,120,0,0.10);
    --blue:   #1A5FA8;
    --blue2:  rgba(26,95,168,0.10);
    --purple: #6B3FA8;
    --purple2:rgba(107,63,168,0.10);

    /* ── Typography ── */
    --fd: 'Outfit', sans-serif;
    --fb: 'Outfit', sans-serif;

    /* ── Radius ── */
    --r:  14px;
    --rs: 10px;

    /* ── Shadow ── */
    --sh1: 0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04);
    --sh2: 0 2px 8px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.06);
  }

  html, body {
    background: var(--bg);
    color: var(--t1);
    font-family: var(--fb);
    height: 100%;
    -webkit-font-smoothing: antialiased;
  }

  /* ═══════════════════════════════════════
     APP LAYOUT — Mobile first
  ═══════════════════════════════════════ */
  .app {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    padding-bottom: 64px; /* space for bottom nav */
  }

  @media (min-width: 768px) {
    .app {
      flex-direction: row;
      height: 100vh;
      overflow: hidden;
      padding-bottom: 0;
    }
  }

  /* ═══════════════════════════════════════
     SIDEBAR — hidden on mobile (bottom nav instead)
  ═══════════════════════════════════════ */
  .sb {
    display: none;
  }

  @media (min-width: 768px) {
    .sb {
      display: flex;
      width: 240px;
      min-width: 240px;
      background: var(--s1);
      border-right: 1px solid var(--b1);
      flex-direction: column;
      overflow: hidden;
      box-shadow: var(--sh1);
    }
  }

  .sb-logo { padding: 22px 18px 16px; border-bottom: 1px solid var(--b1); }
  .logo-yt { font-family: var(--fd); font-size: 20px; font-weight: 900; letter-spacing: -0.5px; color: var(--t1); }
  .logo-yt span { color: var(--brand); }
  .logo-tag { font-size: 10px; color: var(--t3); letter-spacing: 2px; text-transform: uppercase; margin-top: 3px; }
  .rp { display: inline-flex; align-items: center; gap: 5px; margin-top: 10px; padding: 3px 10px; border-radius: 20px; font-size: 10px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; }
  .rp-a { background: var(--brand3); color: var(--brand2); border: 1px solid rgba(201,168,76,0.3); }
  .rp-t { background: var(--blue2); color: var(--blue); border: 1px solid rgba(26,95,168,0.3); }

  .sb-nav { flex: 1; padding: 10px 8px; overflow-y: auto; display: flex; flex-direction: column; gap: 1px; }
  .ni {
    display: flex; align-items: center; gap: 10px;
    padding: 9px 12px; border-radius: var(--rs);
    cursor: pointer; color: var(--t3);
    font-size: 13px; font-weight: 500;
    transition: all 0.15s;
    border: 1px solid transparent;
    position: relative;
  }
  .ni:hover { background: var(--s2); color: var(--t2); }
  .ni.on {
    background: var(--brand3);
    color: var(--brand2);
    border-color: rgba(201,168,76,0.25);
    font-weight: 700;
  }
  .ni.on::before {
    content: '';
    position: absolute; left: 0; top: 20%; bottom: 20%;
    width: 3px; background: var(--brand);
    border-radius: 0 3px 3px 0;
  }
  .ni-ic { font-size: 15px; width: 20px; text-align: center; flex-shrink: 0; }
  .ni-b { margin-left: auto; background: var(--brand); color: white; font-size: 10px; font-weight: 800; padding: 1px 6px; border-radius: 10px; }
  .ni-b.red { background: var(--red); }
  .ni-b.yellow { background: var(--yellow); color: white; }

  .sb-foot { padding: 12px; border-top: 1px solid var(--b1); }
  .uc { display: flex; align-items: center; gap: 10px; padding: 10px 12px; background: var(--s2); border-radius: var(--rs); border: 1px solid var(--b1); }
  .av { width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; flex-shrink: 0; }
  .av-a { background: linear-gradient(135deg, var(--brand), var(--brand2)); color: white; }
  .av-t { background: linear-gradient(135deg, #1A5FA8, #0D3D70); color: white; }
  .av-c { background: linear-gradient(135deg, var(--green), #0F5030); color: white; }
  .uc-n { font-size: 13px; font-weight: 700; color: var(--t1); }
  .uc-r { font-size: 11px; color: var(--t3); }

  .btn-so {
    width: 100%; margin-top: 8px;
    background: var(--red2); color: var(--red);
    border: 1px solid rgba(212,43,43,0.2);
    padding: 8px; border-radius: var(--rs);
    font-size: 12px; font-weight: 700;
    cursor: pointer; font-family: var(--fb);
    transition: all 0.15s;
  }
  .btn-so:hover { background: rgba(212,43,43,0.18); }

  /* ═══════════════════════════════════════
     BOTTOM NAV — Mobile only
  ═══════════════════════════════════════ */
  .bottom-nav {
    position: fixed; bottom: 0; left: 0; right: 0;
    background: var(--s1);
    border-top: 1px solid var(--b1);
    display: flex; align-items: stretch;
    height: 64px;
    z-index: 100;
    box-shadow: 0 -2px 12px rgba(0,0,0,0.06);
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
  .bottom-nav::-webkit-scrollbar { display: none; }

  @media (min-width: 768px) {
    .bottom-nav { display: none; }
  }

  .bn-item {
    flex: 1; min-width: 56px;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    gap: 3px; cursor: pointer;
    color: var(--t3); font-size: 10px;
    font-weight: 600; padding: 0 4px;
    border: none; background: none;
    transition: color 0.15s;
    position: relative;
    font-family: var(--fb);
  }
  .bn-item.on { color: var(--brand2); }
  .bn-item.on::before {
    content: '';
    position: absolute; top: 0; left: 20%; right: 20%;
    height: 2px; background: var(--brand);
    border-radius: 0 0 3px 3px;
  }
  .bn-icon { font-size: 18px; line-height: 1; }
  .bn-badge {
    position: absolute; top: 6px; right: calc(50% - 16px);
    background: var(--red); color: white;
    font-size: 9px; font-weight: 800;
    padding: 1px 5px; border-radius: 8px;
  }

  /* ═══════════════════════════════════════
     MAIN CONTENT
  ═══════════════════════════════════════ */
  .main { flex: 1; display: flex; flex-direction: column; overflow: hidden; }

  .topbar {
    height: 56px; min-height: 56px;
    background: var(--s1);
    border-bottom: 1px solid var(--b1);
    display: flex; align-items: center;
    padding: 0 16px; gap: 12px;
    box-shadow: var(--sh1);
    position: sticky; top: 0; z-index: 50;
  }

  @media (min-width: 768px) {
    .topbar { padding: 0 24px; height: 60px; min-height: 60px; }
  }

  .tb-t { font-family: var(--fd); font-size: 16px; font-weight: 800; flex: 1; letter-spacing: -0.3px; color: var(--t1); }

  @media (min-width: 768px) {
    .tb-t { font-size: 18px; }
  }

  .content {
    flex: 1; overflow-y: auto;
    padding: 16px;
    display: flex; flex-direction: column; gap: 16px;
  }

  @media (min-width: 768px) {
    .content { padding: 24px; gap: 20px; }
  }

  .sh { display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 10px; }
  .sh-l h2 { font-family: var(--fd); font-size: 18px; font-weight: 800; letter-spacing: -0.3px; color: var(--t1); }
  .sh-l p { font-size: 12px; color: var(--t3); margin-top: 3px; }

  @media (min-width: 768px) {
    .sh-l h2 { font-size: 20px; }
  }

  /* ═══════════════════════════════════════
     BUTTONS
  ═══════════════════════════════════════ */
  .btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 9px 18px; border-radius: var(--rs);
    font-size: 13px; font-weight: 700;
    cursor: pointer; font-family: var(--fb);
    transition: all 0.15s; border: none;
    letter-spacing: 0.2px; white-space: nowrap;
  }
  .btn-p { background: var(--brand); color: white; }
  .btn-p:hover { background: var(--brand2); box-shadow: 0 4px 14px rgba(201,168,76,0.35); }
  .btn-g { background: var(--s2); color: var(--t2); border: 1px solid var(--b2); }
  .btn-g:hover { background: var(--s3); color: var(--t1); }
  .btn-s { padding: 6px 14px; font-size: 12px; }
  .btn-xs { padding: 4px 10px; font-size: 11px; }
  .btn-dn { background: var(--red2); color: var(--red); border: 1px solid rgba(212,43,43,0.2); }
  .btn-dn:hover { background: rgba(212,43,43,0.18); }
  .btn-ok { background: var(--green2); color: var(--green); border: 1px solid rgba(26,122,74,0.2); }
  .btn-ok:hover { background: rgba(26,122,74,0.18); }
  .btn-warn { background: var(--yellow2); color: var(--yellow); border: 1px solid rgba(176,120,0,0.2); }

  /* ═══════════════════════════════════════
     CARDS
  ═══════════════════════════════════════ */
  .card {
    background: var(--s1);
    border: 1px solid var(--b1);
    border-radius: var(--r);
    padding: 16px;
    box-shadow: var(--sh1);
  }

  @media (min-width: 768px) {
    .card { padding: 20px; }
  }

  .card-sm {
    background: var(--s2);
    border: 1px solid var(--b1);
    border-radius: var(--rs);
    padding: 12px;
  }

  .ch { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
  .ct { font-family: var(--fd); font-size: 11px; font-weight: 700; color: var(--t3); text-transform: uppercase; letter-spacing: 1px; }

  /* ═══════════════════════════════════════
     STAT CARDS
  ═══════════════════════════════════════ */
  .sc {
    background: var(--s1);
    border: 1px solid var(--b1);
    border-radius: var(--r);
    padding: 16px;
    position: relative; overflow: hidden;
    box-shadow: var(--sh1);
    transition: box-shadow 0.2s;
  }
  .sc:hover { box-shadow: var(--sh2); }
  .sc-bar { position: absolute; top: 0; left: 0; right: 0; height: 3px; border-radius: 3px 3px 0 0; }
  .sl { font-size: 10px; color: var(--t3); text-transform: uppercase; letter-spacing: 1.5px; font-weight: 700; margin-bottom: 8px; }
  .sv { font-family: var(--fd); font-size: 28px; font-weight: 900; line-height: 1; letter-spacing: -1px; color: var(--t1); }
  .ss { font-size: 11px; color: var(--t3); margin-top: 5px; }
  .sd { display: inline-flex; align-items: center; gap: 3px; font-size: 11px; font-weight: 700; margin-top: 5px; }
  .sup { color: var(--green); }
  .sdn { color: var(--red); }

  @media (min-width: 768px) {
    .sv { font-size: 32px; }
  }

  /* ═══════════════════════════════════════
     GRIDS — stack on mobile
  ═══════════════════════════════════════ */
  .g4 { display: grid; grid-template-columns: repeat(2,1fr); gap: 10px; }
  .g3 { display: grid; grid-template-columns: repeat(2,1fr); gap: 10px; }
  .g2 { display: grid; grid-template-columns: 1fr; gap: 12px; }
  .g23 { display: grid; grid-template-columns: 1fr; gap: 12px; }
  .g32 { display: grid; grid-template-columns: 1fr; gap: 12px; }

  @media (min-width: 480px) {
    .g3 { grid-template-columns: repeat(3,1fr); }
    .g2 { grid-template-columns: repeat(2,1fr); }
  }

  @media (min-width: 768px) {
    .g4 { grid-template-columns: repeat(4,1fr); gap: 14px; }
    .g3 { grid-template-columns: repeat(3,1fr); gap: 14px; }
    .g2 { grid-template-columns: repeat(2,1fr); gap: 14px; }
    .g23 { grid-template-columns: 2fr 1fr; gap: 14px; }
    .g32 { grid-template-columns: 3fr 2fr; gap: 14px; }
  }

  /* ═══════════════════════════════════════
     TABLES — horizontal scroll on mobile
  ═══════════════════════════════════════ */
  .tw { overflow-x: auto; -webkit-overflow-scrolling: touch; }
  table { width: 100%; border-collapse: collapse; min-width: 500px; }
  th {
    text-align: left; padding: 10px 14px;
    font-size: 10px; color: var(--t3);
    text-transform: uppercase; letter-spacing: 1.5px;
    border-bottom: 2px solid var(--b1);
    font-weight: 700; white-space: nowrap;
    background: var(--s2);
  }
  td {
    padding: 12px 14px; font-size: 13px;
    border-bottom: 1px solid var(--b1);
    color: var(--t2); vertical-align: middle;
  }
  tr:last-child td { border-bottom: none; }
  tr:hover td { background: var(--s2); }

  /* ═══════════════════════════════════════
     BADGES
  ═══════════════════════════════════════ */
  .badge { display: inline-flex; align-items: center; padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: 700; }
  .bg  { background: var(--green2);   color: var(--green);  border: 1px solid rgba(26,122,74,0.2); }
  .br  { background: var(--red2);     color: var(--red);    border: 1px solid rgba(212,43,43,0.2); }
  .by  { background: var(--yellow2);  color: var(--yellow); border: 1px solid rgba(176,120,0,0.2); }
  .bb  { background: var(--blue2);    color: var(--blue);   border: 1px solid rgba(26,95,168,0.2); }
  .bp  { background: var(--purple2);  color: var(--purple); border: 1px solid rgba(107,63,168,0.2); }
  .bgr { background: var(--s2);       color: var(--t3);     border: 1px solid var(--b1); }
  .bo  { background: var(--brand3);   color: var(--brand2); border: 1px solid rgba(201,168,76,0.3); }

  /* ═══════════════════════════════════════
     PROGRESS BARS
  ═══════════════════════════════════════ */
  .pw { background: var(--s3); border-radius: 4px; overflow: hidden; height: 6px; }
  .pb { height: 100%; border-radius: 4px; }
  .pb-g { background: linear-gradient(90deg, var(--green), #0F5030); }
  .pb-y { background: linear-gradient(90deg, var(--yellow), #7A5200); }
  .pb-r { background: linear-gradient(90deg, var(--red), #9A1A1A); }
  .pb-o { background: linear-gradient(90deg, var(--brand), var(--brand2)); }
  .pb-b { background: linear-gradient(90deg, var(--blue), #0D3D70); }

  /* ═══════════════════════════════════════
     TABS
  ═══════════════════════════════════════ */
  .tabs {
    display: flex; gap: 2px;
    background: var(--s2); padding: 4px;
    border-radius: var(--rs); border: 1px solid var(--b1);
    width: fit-content; flex-wrap: wrap;
    max-width: 100%;
  }
  .tab {
    padding: 6px 14px; border-radius: 8px;
    cursor: pointer; font-size: 12px; font-weight: 600;
    color: var(--t3); transition: all 0.15s;
    white-space: nowrap;
  }
  .tab.on { background: var(--s1); color: var(--t1); box-shadow: 0 1px 4px rgba(0,0,0,0.1); font-weight: 700; }

  /* ═══════════════════════════════════════
     ACTIVITY ITEMS
  ═══════════════════════════════════════ */
  .ai { display: flex; align-items: flex-start; gap: 10px; padding: 10px 0; border-bottom: 1px solid var(--b1); }
  .ai:last-child { border-bottom: none; }
  .ad { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; margin-top: 6px; }

  /* ═══════════════════════════════════════
     SCROLLBAR
  ═══════════════════════════════════════ */
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-thumb { background: var(--s4); border-radius: 4px; }

  /* ═══════════════════════════════════════
     UTILITIES
  ═══════════════════════════════════════ */
  .row { display: flex; align-items: center; gap: 8px; }
  .col { display: flex; flex-direction: column; }
  .flex-wrap { flex-wrap: wrap; }
  .gap4{gap:4px}.gap6{gap:6px}.gap8{gap:8px}.gap10{gap:10px}
  .gap12{gap:12px}.gap14{gap:14px}.gap16{gap:16px}
  .mb4{margin-bottom:4px}.mb6{margin-bottom:6px}.mb8{margin-bottom:8px}
  .mb10{margin-bottom:10px}.mb12{margin-bottom:12px}.mb16{margin-bottom:16px}
  .mb20{margin-bottom:20px}.mb24{margin-bottom:24px}
  .mt4{margin-top:4px}.mt6{margin-top:6px}.mt8{margin-top:8px}
  .mt10{margin-top:10px}.mt12{margin-top:12px}.mt16{margin-top:16px}
  .ml8{margin-left:8px}.mla{margin-left:auto}
  .fw6{font-weight:600}.fw7{font-weight:700}.fw8{font-weight:800}
  .fs9{font-size:9px}.fs10{font-size:10px}.fs11{font-size:11px}
  .fs12{font-size:12px}.fs13{font-size:13px}.fs14{font-size:14px}
  .fs15{font-size:15px}.fs16{font-size:16px}
  .t1{color:var(--t1)}.t2{color:var(--t2)}.t3{color:var(--t3)}
  .tg{color:var(--green)}.tr{color:var(--red)}.ty{color:var(--yellow)}
  .tb{color:var(--blue)}.tp{color:var(--purple)}.to{color:var(--brand2)}

  /* ═══════════════════════════════════════
     MODALS
  ═══════════════════════════════════════ */
  .overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.45);
    display: flex; align-items: flex-end; justify-content: center;
    z-index: 999; backdrop-filter: blur(4px);
  }

  @media (min-width: 768px) {
    .overlay { align-items: center; }
  }

  .modal {
    background: var(--s1);
    border: 1px solid var(--b1);
    border-radius: 20px 20px 0 0;
    padding: 24px 20px;
    width: 100%; max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 -8px 40px rgba(0,0,0,0.12);
  }

  @media (min-width: 768px) {
    .modal { border-radius: 18px; width: 460px; padding: 28px; box-shadow: var(--sh2); }
    .modal-lg { width: 640px; }
  }

  .modal-t { font-family: var(--fd); font-size: 16px; font-weight: 800; margin-bottom: 18px; color: var(--t1); }

  /* ═══════════════════════════════════════
     FORMS
  ═══════════════════════════════════════ */
  .field { display: flex; flex-direction: column; gap: 5px; margin-bottom: 12px; }
  .field label { font-size: 11px; color: var(--t3); font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; }
  .fi {
    background: var(--s2); border: 1.5px solid var(--b2);
    border-radius: var(--rs); padding: 10px 12px;
    color: var(--t1); font-size: 14px;
    font-family: var(--fb); outline: none;
    transition: border-color 0.2s; width: 100%;
    -webkit-appearance: none;
  }
  .fi:focus { border-color: var(--brand); background: var(--s1); }
  .fi::placeholder { color: var(--t4); }
  select.fi { cursor: pointer; }

  /* ═══════════════════════════════════════
     ALERTS
  ═══════════════════════════════════════ */
  .alert { padding: 10px 14px; border-radius: var(--rs); font-size: 12px; font-weight: 500; line-height: 1.5; }
  .al-r { background: var(--red2);    border: 1px solid rgba(212,43,43,0.2);  color: var(--red); }
  .al-y { background: var(--yellow2); border: 1px solid rgba(176,120,0,0.2); color: var(--yellow); }
  .al-g { background: var(--green2);  border: 1px solid rgba(26,122,74,0.2); color: var(--green); }
  .al-b { background: var(--blue2);   border: 1px solid rgba(26,95,168,0.2); color: var(--blue); }

  /* ═══════════════════════════════════════
     SPECIAL COMPONENTS
  ═══════════════════════════════════════ */
  .ex-card {
    background: var(--s1); border: 1px solid var(--b1);
    border-radius: var(--rs); padding: 12px 14px;
    display: flex; align-items: center; justify-content: space-between;
    cursor: pointer; transition: all 0.15s;
    box-shadow: var(--sh1);
  }
  .ex-card:hover { border-color: var(--brand); box-shadow: var(--sh2); }

  .bc { height: 90px; display: flex; align-items: flex-end; gap: 4px; }
  .bw { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 3px; }
  .bb2 { width: 100%; border-radius: 3px 3px 0 0; min-height: 4px; }
  .bl { font-size: 9px; color: var(--t3); }

  .log-row {
    display: grid; grid-template-columns: 1fr 68px 68px 68px 32px;
    gap: 6px; align-items: center;
    padding: 8px 0; border-bottom: 1px solid var(--b1);
  }
  .log-row:last-child { border-bottom: none; }
  .log-inp {
    background: var(--s2); border: 1.5px solid var(--b2);
    border-radius: 6px; padding: 6px 8px;
    color: var(--t1); font-size: 13px;
    font-family: var(--fb); outline: none;
    width: 100%; text-align: center;
  }
  .log-inp:focus { border-color: var(--brand); }

  .flag-card { background: var(--s1); border-radius: var(--rs); padding: 12px 14px; border-left: 3px solid; box-shadow: var(--sh1); }

  .cc {
    background: var(--s1); border: 1px solid var(--b1);
    border-radius: var(--r); padding: 16px;
    cursor: pointer; transition: all 0.15s;
    box-shadow: var(--sh1);
  }
  .cc:hover { border-color: var(--brand); box-shadow: var(--sh2); }

  .overdue-tag {
    background: var(--red2); color: var(--red);
    font-size: 10px; font-weight: 700;
    padding: 2px 7px; border-radius: 4px;
    text-transform: uppercase;
  }

  .score-ring { display: flex; flex-direction: column; align-items: center; gap: 4px; }

  /* ═══════════════════════════════════════
     LOGIN PAGE
  ═══════════════════════════════════════ */
  .lw {
    min-height: 100vh; display: flex;
    align-items: center; justify-content: center;
    background: var(--bg);
    padding: 20px;
  }
  .lc {
    width: 100%; max-width: 420px;
    background: var(--s1);
    border: 1px solid var(--b1);
    border-radius: 20px; padding: 32px 24px;
    box-shadow: var(--sh2);
  }

  @media (min-width: 480px) {
    .lc { padding: 40px; }
  }

  .lt { font-family: var(--fd); font-size: 20px; font-weight: 900; margin: 20px 0 5px; color: var(--t1); }
  .ls { font-size: 12px; color: var(--t3); margin-bottom: 24px; }
  .li {
    width: 100%; padding: 12px 14px;
    background: var(--s2); border: 1.5px solid var(--b2);
    border-radius: var(--rs); color: var(--t1);
    font-size: 14px; font-family: var(--fb);
    outline: none; transition: border-color 0.2s;
    margin-bottom: 10px; -webkit-appearance: none;
  }
  .li:focus { border-color: var(--brand); background: var(--s1); }
  .li::placeholder { color: var(--t4); }
  .lb { font-size: 11px; color: var(--t3); font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 5px; display: block; }
  .lbtn {
    width: 100%; padding: 14px;
    background: var(--brand); color: white;
    border: none; border-radius: var(--rs);
    font-size: 15px; font-weight: 800;
    font-family: var(--fb); cursor: pointer;
    transition: all 0.2s; margin-top: 4px;
  }
  .lbtn:hover { background: var(--brand2); box-shadow: 0 6px 20px rgba(201,168,76,0.35); }
  .lbtn:disabled { opacity: 0.5; cursor: not-allowed; }
  .lerr {
    background: var(--red2); border: 1px solid rgba(212,43,43,0.25);
    border-radius: var(--rs); padding: 10px 12px;
    font-size: 12px; color: var(--red); margin-bottom: 14px;
  }
`;
