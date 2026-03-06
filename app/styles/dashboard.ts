// ============================================================
// DASHBOARD STYLES — iOS LIGHT + YOURTRAINER GOLD — MOBILE FIRST
// ============================================================
export const S = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');

  :root {
    /* YourTrainer brand gold */
    --brand1:     #c9a84c;
    --brand2:     #b8973f;
    --brand3:     #e8c96a;
    --brand-soft: rgba(201,168,76,0.10);
    --brand-glow: rgba(201,168,76,0.20);

    /* iOS-style light backgrounds */
    --bg0:  #f2f2f7;
    --bg1:  #ffffff;
    --bg2:  #f9f9fb;
    --bg3:  #f2f2f7;
    --bg4:  #e5e5ea;

    /* iOS-style subtle borders */
    --b0:   rgba(60,60,67,0.08);
    --b1:   rgba(60,60,67,0.13);
    --b2:   rgba(60,60,67,0.20);

    /* iOS system text */
    --t1:   #1c1c1e;
    --t2:   #3a3a3c;
    --t3:   #8e8e93;
    --t4:   #aeaeb2;

    /* iOS system semantic colors */
    --red:    #ff3b30;
    --green:  #34c759;
    --yellow: #ff9500;
    --blue:   #007aff;
    --orange: #ff6b00;
    --purple: #af52de;

    --fd:     'DM Mono', monospace;
    --sb-w:   228px;

    --radius-xs: 6px;
    --radius-sm: 10px;
    --radius-md: 14px;
    --radius-lg: 18px;
    --radius-xl: 22px;

    --shadow-sm:    0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04);
    --shadow-md:    0 4px 16px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04);
    --shadow-lg:    0 16px 48px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06);
    --shadow-brand: 0 4px 18px rgba(201,168,76,0.28);
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    background: var(--bg0);
    color: var(--t1);
    font-size: 14px;
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
  }

  /* ════════════════════════════════════════
     LAYOUT
  ════════════════════════════════════════ */
  .app {
    display: flex;
    min-height: 100vh;
    background: var(--bg0);
    overflow: hidden;
  }

  /* ════════════════════════════════════════
     SIDEBAR — desktop only
  ════════════════════════════════════════ */
  .sb {
    width: var(--sb-w);
    min-width: var(--sb-w);
    background: var(--bg1);
    border-right: 1px solid var(--b0);
    display: flex;
    flex-direction: column;
    height: 100vh;
    position: sticky;
    top: 0;
    overflow: hidden;
    flex-shrink: 0;
    box-shadow: 1px 0 0 var(--b0);
  }

  .sb-logo {
    padding: 20px 16px 16px;
    border-bottom: 1px solid var(--b0);
    flex-shrink: 0;
  }

  .logo-yt {
    font-size: 19px;
    font-weight: 800;
    color: var(--t1);
    letter-spacing: -0.5px;
  }
  .logo-yt span { color: var(--brand1); }

  .logo-tag {
    font-size: 9px;
    color: var(--t4);
    text-transform: uppercase;
    letter-spacing: 1.8px;
    margin-top: 2px;
    font-weight: 600;
  }

  .rp {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 9px;
    font-weight: 700;
    padding: 3px 9px;
    border-radius: 20px;
    margin-top: 10px;
    letter-spacing: 0.5px;
    text-transform: uppercase;
  }
  .rp-a {
    background: rgba(201,168,76,0.10);
    color: var(--brand2);
    border: 1px solid rgba(201,168,76,0.25);
  }
  .rp-t {
    background: rgba(52,199,89,0.08);
    color: #1a9e40;
    border: 1px solid rgba(52,199,89,0.2);
  }

  .sb-nav { flex: 1; overflow-y: auto; padding: 10px 8px; }
  .sb-nav::-webkit-scrollbar { width: 0px; }

  .ni {
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 9px 10px;
    border-radius: var(--radius-sm);
    cursor: pointer;
    color: var(--t3);
    font-size: 13px;
    font-weight: 500;
    margin-bottom: 2px;
    transition: background 0.15s, color 0.15s;
    white-space: nowrap;
    overflow: hidden;
  }
  .ni:hover { background: var(--bg3); color: var(--t1); }
  .ni.on {
    background: var(--brand-soft);
    color: var(--brand2);
    font-weight: 700;
    border: 1px solid rgba(201,168,76,0.18);
  }

  .ni-ic { width: 18px; font-size: 14px; text-align: center; flex-shrink: 0; }
  .ni-b {
    margin-left: auto;
    font-size: 9px;
    font-weight: 700;
    padding: 2px 7px;
    border-radius: 20px;
    font-family: var(--fd);
    background: rgba(255,59,48,0.10);
    color: var(--red);
  }
  .ni-b.yellow { background: rgba(255,149,0,0.10); color: var(--yellow); }
  .ni-b.green  { background: rgba(52,199,89,0.10); color: #1a9e40; }

  .sb-foot {
    padding: 14px;
    border-top: 1px solid var(--b0);
    flex-shrink: 0;
    background: var(--bg2);
  }

  .uc { display: flex; align-items: center; gap: 9px; margin-bottom: 10px; }

  .av {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 800;
    flex-shrink: 0;
  }
  .av-a {
    background: rgba(201,168,76,0.12);
    color: var(--brand2);
    border: 1.5px solid rgba(201,168,76,0.28);
  }
  .av-t {
    background: rgba(52,199,89,0.10);
    color: #1a9e40;
    border: 1.5px solid rgba(52,199,89,0.22);
  }

  .uc-n { font-size: 12px; font-weight: 700; color: var(--t1); }
  .uc-r { font-size: 10px; color: var(--t3); }

  .btn-so {
    width: 100%;
    padding: 9px;
    background: var(--bg3);
    border: 1px solid var(--b1);
    border-radius: var(--radius-sm);
    color: var(--t3);
    font-size: 12px;
    cursor: pointer;
    transition: all 0.15s;
    font-family: 'Inter', sans-serif;
    font-weight: 600;
  }
  .btn-so:hover {
    background: rgba(255,59,48,0.06);
    color: var(--red);
    border-color: rgba(255,59,48,0.18);
  }

  /* ════════════════════════════════════════
     MAIN CONTENT
  ════════════════════════════════════════ */
  .main {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
    overflow: hidden;
    height: 100vh;
  }

  .topbar {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0 16px;
    height: 52px;
    min-height: 52px;
    border-bottom: 1px solid var(--b0);
    background: rgba(255,255,255,0.85);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    flex-shrink: 0;
    position: sticky;
    top: 0;
    z-index: 50;
  }

  .tb-t {
    font-size: 16px;
    font-weight: 700;
    color: var(--t1);
    flex: 1;
    letter-spacing: -0.3px;
  }

  .content {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    background: var(--bg0);
  }
  .content::-webkit-scrollbar { width: 3px; }
  .content::-webkit-scrollbar-thumb { background: var(--b2); border-radius: 2px; }

  /* ════════════════════════════════════════
     CARDS — iOS grouped list style
  ════════════════════════════════════════ */
  .card {
    background: var(--bg1);
    border: 1px solid var(--b0);
    border-radius: var(--radius-md);
    padding: 14px 16px;
    margin-bottom: 12px;
    box-shadow: var(--shadow-sm);
  }

  .card-sm {
    background: var(--bg2);
    border: 1px solid var(--b0);
    border-radius: var(--radius-sm);
    padding: 10px 13px;
  }

  /* ════════════════════════════════════════
     SECTION + CARD HEADERS
  ════════════════════════════════════════ */
  .sh {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
  }
  .sh-l h2 { font-size: 15px; font-weight: 700; color: var(--t1); letter-spacing: -0.2px; }
  .sh-l p  { font-size: 11px; color: var(--t3); margin-top: 2px; }

  .ch {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
    padding-bottom: 9px;
    border-bottom: 1px solid var(--b0);
  }
  .ct {
    font-size: 9px;
    font-weight: 700;
    color: var(--t4);
    text-transform: uppercase;
    letter-spacing: 1.2px;
  }

  /* ════════════════════════════════════════
     GRIDS
  ════════════════════════════════════════ */
  .g2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .g3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
  .g4 { display: grid; grid-template-columns: repeat(4,1fr); gap: 10px; }

  /* ════════════════════════════════════════
     STAT CARDS
  ════════════════════════════════════════ */
  .stat {
    background: var(--bg1);
    border: 1px solid var(--b0);
    border-radius: var(--radius-md);
    padding: 14px 16px;
    box-shadow: var(--shadow-sm);
    transition: transform 0.15s, box-shadow 0.15s;
  }
  .stat:active { transform: scale(0.98); }

  .stat-l {
    font-size: 10px;
    color: var(--t3);
    text-transform: uppercase;
    letter-spacing: 0.8px;
    margin-bottom: 5px;
    font-weight: 600;
  }
  .stat-v {
    font-size: 26px;
    font-weight: 800;
    font-family: var(--fd);
    color: var(--t1);
    line-height: 1;
    letter-spacing: -0.5px;
  }
  .stat-s { font-size: 10px; color: var(--t3); margin-top: 4px; font-weight: 500; }

  /* ════════════════════════════════════════
     BUTTONS — iOS-style
  ════════════════════════════════════════ */
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    border-radius: var(--radius-sm);
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    border: none;
    padding: 9px 16px;
    transition: opacity 0.15s, transform 0.12s, box-shadow 0.15s;
    white-space: nowrap;
    font-family: 'Inter', sans-serif;
    -webkit-tap-highlight-color: transparent;
  }
  .btn:active { transform: scale(0.96); opacity: 0.85; }
  .btn:disabled { opacity: 0.4; cursor: not-allowed; }

  .btn-p {
    background: var(--brand1);
    color: #ffffff;
    font-weight: 700;
    box-shadow: 0 2px 8px rgba(201,168,76,0.25);
  }
  .btn-p:hover:not(:disabled) {
    background: var(--brand2);
    box-shadow: var(--shadow-brand);
  }

  .btn-g {
    background: var(--bg3);
    color: var(--t2);
    border: 1px solid var(--b1);
  }
  .btn-g:hover:not(:disabled) { background: var(--bg4); color: var(--t1); }

  .btn-dn   { background: rgba(255,59,48,0.08);  color: var(--red);    border: 1px solid rgba(255,59,48,0.18); }
  .btn-ok   { background: rgba(52,199,89,0.08);  color: #1a9e40;       border: 1px solid rgba(52,199,89,0.2); }
  .btn-warn { background: rgba(255,149,0,0.08);  color: var(--yellow); border: 1px solid rgba(255,149,0,0.2); }

  .btn-dn:hover:not(:disabled)   { background: rgba(255,59,48,0.14); }
  .btn-ok:hover:not(:disabled)   { background: rgba(52,199,89,0.14); }
  .btn-warn:hover:not(:disabled) { background: rgba(255,149,0,0.14); }

  .btn-s  { padding: 7px 13px; font-size: 12px; }
  .btn-xs { padding: 4px 9px; font-size: 10px; border-radius: var(--radius-xs); }

  /* ════════════════════════════════════════
     FORMS — iOS input style
  ════════════════════════════════════════ */
  .field { margin-bottom: 10px; }
  .field label {
    display: block;
    font-size: 11px;
    font-weight: 600;
    color: var(--t3);
    text-transform: uppercase;
    letter-spacing: 0.7px;
    margin-bottom: 5px;
  }

  .fi {
    width: 100%;
    background: var(--bg2);
    border: 1.5px solid var(--b1);
    border-radius: var(--radius-sm);
    padding: 11px 13px;
    color: var(--t1);
    font-size: 15px;
    font-family: 'Inter', sans-serif;
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
    -webkit-appearance: none;
    appearance: none;
    min-height: 46px;
  }
  .fi:focus {
    border-color: var(--brand1);
    box-shadow: 0 0 0 3px rgba(201,168,76,0.12);
    background: var(--bg1);
  }
  .fi::placeholder { color: var(--t4); }
  select.fi { cursor: pointer; }
  textarea.fi { resize: vertical; min-height: 78px; line-height: 1.5; }

  /* ════════════════════════════════════════
     BADGES
  ════════════════════════════════════════ */
  .badge {
    display: inline-flex;
    align-items: center;
    padding: 3px 9px;
    border-radius: 20px;
    font-size: 10px;
    font-weight: 700;
    white-space: nowrap;
    letter-spacing: 0.2px;
  }
  .bg  { background: rgba(52,199,89,0.10);   color: #1a9e40;       border: 1px solid rgba(52,199,89,0.22);  }
  .br  { background: rgba(255,59,48,0.08);   color: var(--red);    border: 1px solid rgba(255,59,48,0.18);  }
  .by  { background: rgba(255,149,0,0.10);   color: var(--yellow); border: 1px solid rgba(255,149,0,0.22);  }
  .bb  { background: rgba(0,122,255,0.08);   color: var(--blue);   border: 1px solid rgba(0,122,255,0.18);  }
  .bo  { background: rgba(255,107,0,0.08);   color: var(--orange); border: 1px solid rgba(255,107,0,0.18);  }
  .bp  { background: rgba(175,82,222,0.08);  color: var(--purple); border: 1px solid rgba(175,82,222,0.18); }
  .bgr { background: var(--bg3); color: var(--t3); border: 1px solid var(--b1); }

  /* ════════════════════════════════════════
     ALERTS
  ════════════════════════════════════════ */
  .alert {
    padding: 10px 13px;
    border-radius: var(--radius-sm);
    font-size: 12px;
    line-height: 1.55;
    margin-bottom: 10px;
    font-weight: 500;
  }
  .al-r { background: rgba(255,59,48,0.06);  color: var(--red);    border: 1px solid rgba(255,59,48,0.18);  }
  .al-g { background: rgba(52,199,89,0.07);  color: #1a9e40;       border: 1px solid rgba(52,199,89,0.2);   }
  .al-y { background: rgba(255,149,0,0.07);  color: var(--yellow); border: 1px solid rgba(255,149,0,0.2);   }
  .al-b { background: var(--bg3);            color: var(--t3);     border: 1px solid var(--b1);             }

  /* ════════════════════════════════════════
     TABS — iOS segmented control style
  ════════════════════════════════════════ */
  .tabs {
    display: flex;
    gap: 3px;
    flex-wrap: wrap;
    margin-bottom: 14px;
    background: var(--bg3);
    padding: 3px;
    border-radius: var(--radius-sm);
    border: 1px solid var(--b0);
    width: fit-content;
  }
  .tab {
    padding: 6px 14px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    color: var(--t3);
    transition: all 0.15s;
    white-space: nowrap;
    border: 1px solid transparent;
    -webkit-tap-highlight-color: transparent;
  }
  .tab:hover { color: var(--t1); }
  .tab.on {
    background: var(--bg1);
    color: var(--t1);
    border-color: var(--b1);
    font-weight: 700;
    box-shadow: var(--shadow-sm);
  }

  /* ════════════════════════════════════════
     PROGRESS BAR
  ════════════════════════════════════════ */
  .pw { background: var(--bg4); border-radius: 4px; height: 5px; overflow: hidden; flex-shrink: 0; }
  .pb { height: 100%; border-radius: 4px; transition: width 0.4s ease; }
  .pb-g { background: var(--green); }
  .pb-y { background: var(--yellow); }
  .pb-r { background: var(--red); }

  /* ════════════════════════════════════════
     EXERCISE CARD
  ════════════════════════════════════════ */
  .ex-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 11px 13px;
    background: var(--bg1);
    border: 1px solid var(--b0);
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: border-color 0.15s, background 0.15s;
    gap: 8px;
    -webkit-tap-highlight-color: transparent;
  }
  .ex-card:hover  { border-color: var(--brand1); background: rgba(201,168,76,0.03); }
  .ex-card:active { background: var(--bg3); }

  /* ════════════════════════════════════════
     LOG ROW
  ════════════════════════════════════════ */
  .log-row {
    display: grid;
    align-items: center;
    gap: 5px;
    padding: 6px 0;
    border-bottom: 1px solid var(--b0);
  }
  .log-inp {
    background: var(--bg2);
    border: 1.5px solid var(--b1);
    border-radius: var(--radius-xs);
    padding: 5px 7px;
    color: var(--t1);
    font-size: 13px;
    text-align: center;
    width: 100%;
    outline: none;
    font-family: 'Inter', sans-serif;
    min-height: 36px;
    transition: border-color 0.15s;
  }
  .log-inp:focus { border-color: var(--brand1); background: var(--bg1); }

  /* ════════════════════════════════════════
     TABLE
  ════════════════════════════════════════ */
  .tbl { width: 100%; border-collapse: collapse; font-size: 12px; }
  .tbl th {
    text-align: left;
    padding: 8px 10px;
    color: var(--t4);
    font-size: 9px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    border-bottom: 1px solid var(--b1);
    background: var(--bg2);
  }
  .tbl td {
    padding: 10px;
    border-bottom: 1px solid var(--b0);
    color: var(--t2);
    vertical-align: middle;
  }
  .tbl tr:last-child td { border-bottom: none; }
  .tbl tr:hover td { background: var(--bg2); }

  /* ════════════════════════════════════════
     MODAL — iOS sheet style
  ════════════════════════════════════════ */
  .overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.32);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 500;
    padding: 16px;
  }

  @keyframes modalSlideUp {
    from { opacity: 0; transform: translateY(20px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }

  .modal {
    background: var(--bg1);
    border: 1px solid var(--b0);
    border-radius: var(--radius-xl);
    padding: 24px;
    width: 100%;
    max-width: 430px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: var(--shadow-lg);
    animation: modalSlideUp 0.22s cubic-bezier(0.34,1.2,0.64,1);
  }
  .modal::-webkit-scrollbar { width: 0px; }
  .modal-lg { max-width: 560px; }
  .modal-t {
    font-size: 17px;
    font-weight: 800;
    color: var(--t1);
    margin-bottom: 18px;
    letter-spacing: -0.3px;
  }

  /* ════════════════════════════════════════
     UTILS
  ════════════════════════════════════════ */
  .row  { display: flex; align-items: center; }
  .col  { display: flex; flex-direction: column; }
  .gap4  { gap: 4px; }  .gap6  { gap: 6px; }   .gap8  { gap: 8px; }
  .gap10 { gap: 10px; } .gap12 { gap: 12px; }  .gap16 { gap: 16px; }
  .mla { margin-left: auto; }
  .mt4  { margin-top: 4px; }    .mt8  { margin-top: 8px; }    .mt12 { margin-top: 12px; }  .mt16 { margin-top: 16px; }
  .mb4  { margin-bottom: 4px; } .mb8  { margin-bottom: 8px; } .mb12 { margin-bottom: 12px; } .mb16 { margin-bottom: 16px; }
  .fw6 { font-weight: 600; } .fw7 { font-weight: 700; } .fw8 { font-weight: 800; }
  .fs10 { font-size: 10px; } .fs11 { font-size: 11px; } .fs12 { font-size: 12px; } .fs13 { font-size: 13px; }
  .t1 { color: var(--t1); } .t2 { color: var(--t2); } .t3 { color: var(--t3); }
  .tg { color: #1a9e40; } .tr { color: var(--red); } .ty { color: var(--yellow); }
  .flex-wrap { flex-wrap: wrap; }

  /* ════════════════════════════════════════
     HAMBURGER
  ════════════════════════════════════════ */
  .ham {
    display: none;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 4px;
    width: 36px;
    height: 36px;
    background: var(--bg2);
    border: 1px solid var(--b1);
    border-radius: var(--radius-sm);
    cursor: pointer;
    flex-shrink: 0;
    -webkit-tap-highlight-color: transparent;
  }
  .ham span { display: block; width: 16px; height: 1.5px; background: var(--t2); border-radius: 2px; }
  .ham:hover { background: var(--bg3); }
  .ham:hover span { background: var(--t1); }

  /* ════════════════════════════════════════
     MOBILE DRAWER
  ════════════════════════════════════════ */
  .drawer-overlay {
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.28);
    backdrop-filter: blur(3px);
    -webkit-backdrop-filter: blur(3px);
    z-index: 200;
  }
  .drawer-overlay.open { display: block; }

  .drawer {
    position: fixed;
    top: 0; left: 0; bottom: 0;
    width: 272px;
    background: var(--bg1);
    border-right: 1px solid var(--b0);
    z-index: 201;
    display: flex;
    flex-direction: column;
    transform: translateX(-100%);
    transition: transform 0.26s cubic-bezier(0.4,0,0.2,1);
    box-shadow: 4px 0 24px rgba(0,0,0,0.10);
  }
  .drawer.open { transform: translateX(0); }

  .drawer-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 16px 14px;
    border-bottom: 1px solid var(--b0);
    flex-shrink: 0;
  }

  .drawer-nav { flex: 1; overflow-y: auto; padding: 10px 8px; }
  .drawer-nav::-webkit-scrollbar { width: 0; }

  .drawer-close {
    font-size: 13px;
    color: var(--t3);
    cursor: pointer;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-xs);
    background: var(--bg3);
    border: 1px solid var(--b0);
    transition: all 0.15s;
    -webkit-tap-highlight-color: transparent;
  }
  .drawer-close:hover { background: var(--bg4); color: var(--t1); }

  .drawer-section {
    font-size: 9px;
    font-weight: 700;
    color: var(--t4);
    text-transform: uppercase;
    letter-spacing: 1.5px;
    padding: 8px 10px 5px;
  }

  .dni {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 11px;
    border-radius: var(--radius-sm);
    cursor: pointer;
    color: var(--t3);
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 2px;
    transition: background 0.15s, color 0.15s;
    -webkit-tap-highlight-color: transparent;
    min-height: 46px;
  }
  .dni:hover { background: var(--bg3); color: var(--t1); }
  .dni.on {
    background: var(--brand-soft);
    color: var(--brand2);
    font-weight: 700;
    border: 1px solid rgba(201,168,76,0.18);
  }

  .dni-ic { width: 22px; font-size: 15px; text-align: center; flex-shrink: 0; }
  .dni-b {
    margin-left: auto;
    font-size: 9px;
    font-weight: 700;
    padding: 2px 7px;
    border-radius: 20px;
    background: rgba(255,59,48,0.10);
    color: var(--red);
    font-family: var(--fd);
  }

  .drawer-foot {
    padding: 14px;
    border-top: 1px solid var(--b0);
    flex-shrink: 0;
    background: var(--bg2);
  }

  /* ════════════════════════════════════════
     LOGIN PAGE
  ════════════════════════════════════════ */
  .lw {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg0);
    padding: 16px;
  }
  .lc {
    width: 100%;
    max-width: 380px;
    background: var(--bg1);
    border: 1px solid var(--b0);
    border-radius: var(--radius-xl);
    padding: 36px 28px;
    box-shadow: var(--shadow-md);
  }
  .lt {
    font-size: 22px;
    font-weight: 800;
    color: var(--t1);
    margin-top: 20px;
    margin-bottom: 4px;
    letter-spacing: -0.5px;
  }
  .ls { font-size: 13px; color: var(--t3); margin-bottom: 26px; font-weight: 500; }
  .lerr {
    background: rgba(255,59,48,0.06);
    border: 1px solid rgba(255,59,48,0.18);
    color: var(--red);
    font-size: 13px;
    padding: 10px 13px;
    border-radius: var(--radius-sm);
    margin-bottom: 14px;
    font-weight: 500;
  }
  .lb {
    display: block;
    font-size: 11px;
    font-weight: 600;
    color: var(--t3);
    text-transform: uppercase;
    letter-spacing: 0.7px;
    margin-bottom: 6px;
    margin-top: 16px;
  }
  .li {
    width: 100%;
    padding: 13px 15px;
    border-radius: var(--radius-sm);
    border: 1.5px solid var(--b1);
    background: var(--bg2);
    font-size: 16px;
    font-family: 'Inter', sans-serif;
    color: var(--t1);
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
    box-sizing: border-box;
    -webkit-appearance: none;
  }
  .li:focus {
    border-color: var(--brand1);
    box-shadow: 0 0 0 3px rgba(201,168,76,0.12);
    background: var(--bg1);
  }
  .li::placeholder { color: var(--t4); }
  .lbtn {
    width: 100%;
    padding: 14px;
    border-radius: var(--radius-sm);
    background: var(--brand1);
    color: #ffffff;
    font-size: 15px;
    font-weight: 700;
    font-family: 'Inter', sans-serif;
    border: none;
    cursor: pointer;
    margin-top: 22px;
    transition: background 0.15s, box-shadow 0.15s, transform 0.12s, opacity 0.15s;
    box-shadow: 0 2px 10px rgba(201,168,76,0.25);
    -webkit-tap-highlight-color: transparent;
  }
  .lbtn:hover:not(:disabled) {
    background: var(--brand2);
    box-shadow: var(--shadow-brand);
  }
  .lbtn:active:not(:disabled) { transform: scale(0.97); opacity: 0.9; }
  .lbtn:disabled { opacity: 0.5; cursor: not-allowed; }
  .lfoot {
    font-size: 12px;
    color: var(--t4);
    text-align: center;
    margin-top: 20px;
  }
  .lfoot span { color: var(--brand1); font-weight: 700; }

  /* ════════════════════════════════════════
     RESPONSIVE — mobile first
  ════════════════════════════════════════ */
  @media (max-width: 767px) {
    .sb   { display: none !important; }
    .ham  { display: flex !important; }
    .drawer { display: flex !important; }
    .topbar { padding: 0 12px; height: 50px; min-height: 50px; }
    .tb-t { font-size: 15px; }
    .content { padding: 10px 12px; }
    .g2 { grid-template-columns: 1fr 1fr; gap: 8px; }
    .g3 { grid-template-columns: 1fr 1fr; gap: 8px; }
    .g4 { grid-template-columns: 1fr 1fr; gap: 8px; }
    .card { padding: 12px 14px; }
    .modal { padding: 20px 18px; }
    .stat-v { font-size: 22px; }
    .log-row { grid-template-columns: 1fr 48px 48px 48px 26px !important; gap: 3px; }
    .hide-mobile { display: none !important; }
    .tabs { width: 100%; }
  }

  @media (min-width: 768px) {
    .ham { display: none !important; }
    .drawer { display: none !important; }
    .drawer-overlay { display: none !important; }
    .content { padding: 24px 28px; }
  }
`;
