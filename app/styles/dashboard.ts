// ============================================================
// DASHBOARD STYLES — WARM WHITE + GOLD THEME
// ============================================================
export const S = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');

  :root {
    --brand1: #c9a84c;
    --brand2: #b8973f;
    --brand3: #e8c96a;
    --bg0:    #faf8f4;
    --bg1:    #ffffff;
    --bg2:    #fdf9f3;
    --bg3:    #f5f0e8;
    --b0:     #ede8de;
    --b1:     #e0d8cc;
    --b2:     #ccc4b4;
    --t1:     #1a1a1a;
    --t2:     #3a3a3a;
    --t3:     #777777;
    --t4:     #aaaaaa;
    --red:    #c0392b;
    --green:  #1e8a4c;
    --yellow: #b8860b;
    --blue:   #2563a8;
    --orange: #c05a20;
    --purple: #6d3db5;
    --fd:     'DM Mono', monospace;
    --sb-w:   224px;
    --shadow: 0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(180,150,80,0.07);
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'Inter', sans-serif;
    background: var(--bg0);
    color: var(--t1);
    font-size: 13px;
    line-height: 1.4;
    -webkit-font-smoothing: antialiased;
  }

  /* ── LAYOUT ── */
  .app { display: flex; min-height: 100vh; background: var(--bg0); overflow: hidden; }

  /* ── SIDEBAR ── */
  .sb {
    width: var(--sb-w); min-width: var(--sb-w);
    background: var(--bg1);
    border-right: 1px solid var(--b0);
    display: flex; flex-direction: column;
    height: 100vh; position: sticky; top: 0;
    overflow: hidden; flex-shrink: 0;
    box-shadow: 1px 0 0 var(--b0);
  }
  .sb-logo {
    padding: 18px 16px 14px;
    border-bottom: 1px solid var(--b0);
    flex-shrink: 0;
  }
  .logo-yt {
    font-size: 17px; font-weight: 800;
    color: var(--t1); letter-spacing: -0.4px;
  }
  .logo-yt span { color: var(--brand1); }
  .logo-tag {
    font-size: 9px; color: var(--t4);
    text-transform: uppercase; letter-spacing: 1.5px; margin-top: 2px;
  }
  .rp {
    display: inline-flex; align-items: center; gap: 4px;
    font-size: 9px; font-weight: 700; padding: 3px 8px;
    border-radius: 10px; margin-top: 8px;
    letter-spacing: 0.5px; text-transform: uppercase;
  }
  .rp-a {
    background: rgba(201,168,76,0.12);
    color: var(--brand1);
    border: 1px solid rgba(201,168,76,0.3);
  }
  .rp-t {
    background: rgba(30,138,76,0.08);
    color: var(--green);
    border: 1px solid rgba(30,138,76,0.2);
  }
  .sb-nav { flex: 1; overflow-y: auto; padding: 8px; }
  .sb-nav::-webkit-scrollbar { width: 3px; }
  .sb-nav::-webkit-scrollbar-thumb { background: var(--b1); border-radius: 2px; }

  .ni {
    display: flex; align-items: center; gap: 8px;
    padding: 7px 9px; border-radius: 8px; cursor: pointer;
    color: var(--t3); font-size: 12px; font-weight: 500;
    margin-bottom: 1px; transition: background 0.15s, color 0.15s;
    white-space: nowrap; overflow: hidden;
  }
  .ni:hover { background: var(--bg3); color: var(--t1); }
  .ni.on {
    background: rgba(201,168,76,0.1);
    color: var(--brand1);
    font-weight: 700;
    border-left: 3px solid var(--brand1);
    padding-left: 6px;
  }
  .ni-ic { width: 17px; font-size: 13px; text-align: center; flex-shrink: 0; }
  .ni-b {
    margin-left: auto; font-size: 9px; font-weight: 700;
    padding: 2px 6px; border-radius: 8px; font-family: var(--fd);
  }
  .ni-b.red    { background: rgba(192,57,43,0.1);   color: var(--red);    }
  .ni-b.yellow { background: rgba(184,134,11,0.1);  color: var(--yellow); }
  .ni-b.green  { background: rgba(30,138,76,0.1);   color: var(--green);  }

  .sb-foot {
    padding: 12px 14px;
    border-top: 1px solid var(--b0);
    flex-shrink: 0;
    background: var(--bg2);
  }
  .uc { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
  .av {
    width: 30px; height: 30px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 10px; font-weight: 800; flex-shrink: 0;
  }
  .av-a {
    background: rgba(201,168,76,0.15);
    color: var(--brand1);
    border: 1.5px solid rgba(201,168,76,0.35);
  }
  .av-t {
    background: rgba(30,138,76,0.1);
    color: var(--green);
    border: 1.5px solid rgba(30,138,76,0.25);
  }
  .uc-n { font-size: 12px; font-weight: 700; color: var(--t1); }
  .uc-r { font-size: 10px; color: var(--t3); }
  .btn-so {
    width: 100%; padding: 7px;
    background: var(--bg3);
    border: 1px solid var(--b1);
    border-radius: 7px; color: var(--t3);
    font-size: 11px; cursor: pointer;
    transition: background 0.15s, color 0.15s;
    font-family: 'Inter', sans-serif;
    font-weight: 500;
  }
  .btn-so:hover { background: #fde8e8; color: var(--red); border-color: rgba(192,57,43,0.2); }

  /* ── MAIN ── */
  .main { flex: 1; display: flex; flex-direction: column; min-width: 0; overflow: hidden; height: 100vh; }

  .topbar {
    display: flex; align-items: center; gap: 8px;
    padding: 0 16px; height: 48px; min-height: 48px;
    border-bottom: 1px solid var(--b0);
    background: var(--bg1);
    flex-shrink: 0;
    box-shadow: 0 1px 0 var(--b0);
  }
  .tb-t { font-size: 14px; font-weight: 700; color: var(--t1); flex: 1; }

  .content {
    flex: 1; overflow-y: auto;
    padding: 14px 14px;
    background: var(--bg0);
  }
  .content::-webkit-scrollbar { width: 4px; }
  .content::-webkit-scrollbar-thumb { background: var(--b1); border-radius: 2px; }

  /* ── CARDS ── */
  .card {
    background: var(--bg1);
    border: 1px solid var(--b0);
    border-radius: 10px;
    padding: 12px 14px;
    margin-bottom: 10px;
    box-shadow: var(--shadow);
  }
  .card-sm {
    background: var(--bg2);
    border: 1px solid var(--b0);
    border-radius: 8px;
    padding: 8px 11px;
  }

  /* ── SECTION HEADER ── */
  .sh { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
  .sh-l h2 { font-size: 15px; font-weight: 700; color: var(--t1); }
  .sh-l p  { font-size: 11px; color: var(--t3); margin-top: 2px; }

  /* ── CARD HEADER ── */
  .ch {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 10px; padding-bottom: 8px;
    border-bottom: 1px solid var(--b0);
  }
  .ct {
    font-size: 10px; font-weight: 700; color: var(--t3);
    text-transform: uppercase; letter-spacing: 0.8px;
  }

  /* ── GRIDS ── */
  .g2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .g3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
  .g4 { display: grid; grid-template-columns: repeat(4,1fr); gap: 10px; }

  /* ── STAT CARDS ── */
  .stat {
    background: var(--bg1);
    border: 1px solid var(--b0);
    border-radius: 9px;
    padding: 12px 14px;
    box-shadow: var(--shadow);
  }
  .stat-l {
    font-size: 9px; color: var(--t3);
    text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px;
    font-weight: 600;
  }
  .stat-v {
    font-size: 22px; font-weight: 800;
    font-family: var(--fd); color: var(--t1); line-height: 1;
  }
  .stat-s { font-size: 10px; color: var(--t3); margin-top: 3px; }

  /* ── BUTTONS ── */
  .btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 5px;
    border-radius: 8px; font-size: 12px; font-weight: 600;
    cursor: pointer; border: none;
    padding: 8px 14px;
    transition: opacity 0.15s, background 0.15s, box-shadow 0.15s;
    white-space: nowrap; font-family: 'Inter', sans-serif;
  }
  .btn:hover { opacity: 0.87; }
  .btn:disabled { opacity: 0.45; cursor: not-allowed; }
  .btn-p    { background: var(--brand1); color: #fff; }
  .btn-p:hover:not(:disabled) { background: var(--brand2); box-shadow: 0 3px 10px rgba(201,168,76,0.3); opacity: 1; }
  .btn-g    { background: var(--bg3); color: var(--t2); border: 1px solid var(--b1); }
  .btn-dn   { background: rgba(192,57,43,0.08);  color: var(--red);    border: 1px solid rgba(192,57,43,0.2); }
  .btn-ok   { background: rgba(30,138,76,0.08);  color: var(--green);  border: 1px solid rgba(30,138,76,0.2); }
  .btn-warn { background: rgba(184,134,11,0.08); color: var(--yellow); border: 1px solid rgba(184,134,11,0.2); }
  .btn-s    { padding: 6px 11px; font-size: 11px; }
  .btn-xs   { padding: 3px 8px; font-size: 10px; border-radius: 6px; }

  /* ── FORMS ── */
  .field { margin-bottom: 8px; }
  .field label {
    display: block; font-size: 10px; font-weight: 600; color: var(--t3);
    text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 4px;
  }
  .fi {
    width: 100%;
    background: var(--bg2);
    border: 1.5px solid var(--b1);
    border-radius: 7px;
    padding: 7px 10px;
    color: var(--t1);
    font-size: 12px; font-family: 'Inter', sans-serif;
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
    -webkit-appearance: none;
  }
  .fi:focus {
    border-color: var(--brand1);
    box-shadow: 0 0 0 3px rgba(201,168,76,0.12);
    background: var(--bg1);
  }
  .fi::placeholder { color: var(--t4); }
  select.fi { cursor: pointer; }
  textarea.fi { resize: vertical; min-height: 60px; }

  /* ── BADGES ── */
  .badge {
    display: inline-flex; align-items: center;
    padding: 2px 7px; border-radius: 10px;
    font-size: 10px; font-weight: 600; white-space: nowrap;
  }
  .bg  { background: rgba(30,138,76,0.1);   color: var(--green);  border: 1px solid rgba(30,138,76,0.2);   }
  .br  { background: rgba(192,57,43,0.08);  color: var(--red);    border: 1px solid rgba(192,57,43,0.15);  }
  .by  { background: rgba(184,134,11,0.1);  color: var(--yellow); border: 1px solid rgba(184,134,11,0.2);  }
  .bb  { background: rgba(37,99,168,0.08);  color: var(--blue);   border: 1px solid rgba(37,99,168,0.15);  }
  .bo  { background: rgba(192,90,32,0.08);  color: var(--orange); border: 1px solid rgba(192,90,32,0.15);  }
  .bp  { background: rgba(109,61,181,0.08); color: var(--purple); border: 1px solid rgba(109,61,181,0.15); }
  .bgr { background: var(--bg3); color: var(--t3); border: 1px solid var(--b1); }

  /* ── ALERTS ── */
  .alert {
    padding: 8px 11px; border-radius: 7px;
    font-size: 11px; line-height: 1.5; margin-bottom: 10px;
  }
  .al-r { background: rgba(192,57,43,0.06);  color: var(--red);    border: 1px solid rgba(192,57,43,0.2);  }
  .al-g { background: rgba(30,138,76,0.07);  color: var(--green);  border: 1px solid rgba(30,138,76,0.2);  }
  .al-y { background: rgba(184,134,11,0.07); color: var(--yellow); border: 1px solid rgba(184,134,11,0.2); }
  .al-b { background: var(--bg3); color: var(--t3); border: 1px solid var(--b1); }

  /* ── TABS ── */
  .tabs { display: flex; gap: 4px; flex-wrap: wrap; margin-bottom: 12px; }
  .tab {
    padding: 5px 11px; border-radius: 6px; font-size: 11px; font-weight: 600;
    cursor: pointer; background: var(--bg2); color: var(--t3);
    border: 1px solid var(--b1); transition: all 0.15s; white-space: nowrap;
  }
  .tab:hover { color: var(--t1); background: var(--bg3); }
  .tab.on {
    background: rgba(201,168,76,0.1);
    color: var(--brand1);
    border-color: rgba(201,168,76,0.35);
    font-weight: 700;
  }

  /* ── PROGRESS BAR ── */
  .pw { background: var(--b0); border-radius: 3px; height: 5px; overflow: hidden; flex-shrink: 0; }
  .pb { height: 100%; border-radius: 3px; transition: width 0.3s; }
  .pb-g { background: var(--green); }
  .pb-y { background: var(--yellow); }
  .pb-r { background: var(--red); }

  /* ── EXERCISE CARD ── */
  .ex-card {
    display: flex; align-items: center; justify-content: space-between;
    padding: 8px 10px; background: var(--bg2);
    border: 1px solid var(--b0);
    border-radius: 7px; cursor: pointer;
    transition: border-color 0.15s, background 0.15s, box-shadow 0.15s; gap: 8px;
  }
  .ex-card:hover {
    border-color: var(--brand1);
    background: var(--bg1);
    box-shadow: 0 2px 8px rgba(201,168,76,0.1);
  }

  /* ── LOG ROW ── */
  .log-row { display: grid; align-items: center; gap: 5px; padding: 5px 0; border-bottom: 1px solid var(--b0); }
  .log-inp {
    background: var(--bg2); border: 1.5px solid var(--b1); border-radius: 6px;
    padding: 4px 6px; color: var(--t1); font-size: 11px;
    text-align: center; width: 100%; outline: none;
    font-family: 'Inter', sans-serif;
  }
  .log-inp:focus { border-color: var(--brand1); background: var(--bg1); }

  /* ── TABLE ── */
  .tbl { width: 100%; border-collapse: collapse; font-size: 11px; }
  .tbl th {
    text-align: left; padding: 6px 8px; color: var(--t3);
    font-size: 9px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.8px; border-bottom: 2px solid var(--b0);
    background: var(--bg2);
  }
  .tbl td {
    padding: 7px 8px; border-bottom: 1px solid var(--b0);
    color: var(--t2); vertical-align: middle;
  }
  .tbl tr:last-child td { border-bottom: none; }
  .tbl tr:hover td { background: var(--bg2); }

  /* ── MODAL ── */
  .overlay {
    position: fixed; inset: 0;
    background: rgba(20,15,5,0.45);
    backdrop-filter: blur(4px);
    display: flex; align-items: center;
    justify-content: center; z-index: 500; padding: 16px;
  }
  .modal {
    background: var(--bg1);
    border: 1px solid var(--b0);
    border-radius: 14px;
    padding: 22px; width: 100%;
    max-width: 420px; max-height: 92vh;
    overflow-y: auto;
    box-shadow: 0 8px 40px rgba(0,0,0,0.12);
  }
  .modal-lg { max-width: 560px; }
  .modal-t { font-size: 15px; font-weight: 800; color: var(--t1); margin-bottom: 14px; }

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
    gap: 4px; width: 34px; height: 34px;
    background: var(--bg2);
    border: 1px solid var(--b1); border-radius: 7px;
    cursor: pointer; flex-shrink: 0;
  }
  .ham span { display: block; width: 17px; height: 2px; background: var(--t2); border-radius: 2px; }
  .ham:hover span { background: var(--t1); }

  /* ── MOBILE DRAWER ── */
  .drawer-overlay {
    display: none; position: fixed; inset: 0;
    background: rgba(20,15,5,0.4);
    backdrop-filter: blur(2px); z-index: 200;
  }
  .drawer-overlay.open { display: block; }
  .drawer {
    position: fixed; top: 0; left: 0; bottom: 0; width: 260px;
    background: var(--bg1); border-right: 1px solid var(--b0);
    z-index: 201; display: flex; flex-direction: column;
    transform: translateX(-100%);
    transition: transform 0.25s cubic-bezier(0.4,0,0.2,1);
    box-shadow: 4px 0 20px rgba(0,0,0,0.08);
  }
  .drawer.open { transform: translateX(0); }
  .drawer-head {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 14px 12px; border-bottom: 1px solid var(--b0); flex-shrink: 0;
  }
  .drawer-nav { flex: 1; overflow-y: auto; padding: 8px; }
  .drawer-close {
    font-size: 16px; color: var(--t3); cursor: pointer;
    width: 28px; height: 28px; display: flex; align-items: center;
    justify-content: center; border-radius: 6px;
  }
  .drawer-close:hover { background: var(--bg3); color: var(--t1); }
  .drawer-section {
    font-size: 9px; font-weight: 700; color: var(--t4);
    text-transform: uppercase; letter-spacing: 1.2px;
    padding: 6px 9px 4px;
  }
  .dni {
    display: flex; align-items: center; gap: 9px;
    padding: 8px 10px; border-radius: 8px;
    cursor: pointer; color: var(--t3); font-size: 13px; font-weight: 500;
    margin-bottom: 2px; transition: background 0.15s, color 0.15s;
  }
  .dni:hover { background: var(--bg3); color: var(--t1); }
  .dni.on {
    background: rgba(201,168,76,0.1);
    color: var(--brand1);
    font-weight: 700;
    border-left: 3px solid var(--brand1);
    padding-left: 7px;
  }
  .dni-ic { width: 20px; font-size: 14px; text-align: center; flex-shrink: 0; }
  .dni-b {
    margin-left: auto; font-size: 9px; font-weight: 700;
    padding: 2px 6px; border-radius: 8px;
    background: rgba(192,57,43,0.1); color: var(--red);
    font-family: var(--fd);
  }
  .drawer-foot {
    padding: 12px 14px; border-top: 1px solid var(--b0);
    flex-shrink: 0; background: var(--bg2);
  }

  /* ── LOGIN PAGE ── */
  .lw {
    min-height: 100vh;
    display: flex; align-items: center; justify-content: center;
    background: var(--bg0); padding: 16px;
  }
  .lc {
    width: 100%; max-width: 380px;
    background: var(--bg1);
    border: 1px solid var(--b0);
    border-radius: 16px; padding: 36px 32px;
    box-shadow: var(--shadow);
  }
  .lt {
    font-size: 20px; font-weight: 700; color: var(--t1);
    margin-top: 22px; margin-bottom: 4px;
  }
  .ls { font-size: 12px; color: var(--t3); margin-bottom: 22px; }
  .lerr {
    background: rgba(192,57,43,0.06); border: 1px solid rgba(192,57,43,0.2);
    color: var(--red); font-size: 12px;
    padding: 9px 12px; border-radius: 7px; margin-bottom: 14px;
  }
  .lb {
    display: block; font-size: 11px; font-weight: 600; color: var(--t3);
    text-transform: uppercase; letter-spacing: 0.6px;
    margin-bottom: 5px; margin-top: 14px;
  }
  .li {
    width: 100%; padding: 11px 14px; border-radius: 8px;
    border: 1.5px solid var(--b1); background: var(--bg2);
    font-size: 14px; font-family: 'Inter', sans-serif;
    color: var(--t1); outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
    box-sizing: border-box;
  }
  .li:focus {
    border-color: var(--brand1);
    box-shadow: 0 0 0 3px rgba(201,168,76,0.12);
    background: var(--bg1);
  }
  .li::placeholder { color: var(--t4); }
  .lbtn {
    width: 100%; padding: 12px; border-radius: 8px;
    background: var(--brand1); color: #fff;
    font-size: 14px; font-weight: 700;
    font-family: 'Inter', sans-serif;
    border: none; cursor: pointer; margin-top: 22px;
    transition: background 0.15s, box-shadow 0.15s, opacity 0.15s;
    letter-spacing: 0.2px;
  }
  .lbtn:hover:not(:disabled) {
    background: var(--brand2);
    box-shadow: 0 4px 14px rgba(201,168,76,0.35);
  }
  .lbtn:disabled { opacity: 0.6; cursor: not-allowed; }
  .lfoot {
    font-size: 11px; color: var(--t4);
    text-align: center; margin-top: 20px;
  }
  .lfoot span { color: var(--brand1); font-weight: 600; }

  /* ── RESPONSIVE ── */
  @media (max-width: 767px) {
    .sb   { display: none !important; }
    .ham  { display: flex !important; }
    .drawer { display: flex !important; }
    .topbar { padding: 0 10px; height: 46px; }
    .content { padding: 8px; }
    .g2 { grid-template-columns: 1fr 1fr; gap: 8px; }
    .g3 { grid-template-columns: 1fr 1fr; gap: 8px; }
    .g4 { grid-template-columns: 1fr 1fr; gap: 6px; }
    .card { padding: 10px 11px; }
    .modal { padding: 16px; }
    .log-row { grid-template-columns: 1fr 48px 48px 48px 26px !important; gap: 3px; }
    .hide-mobile { display: none !important; }
  }
  @media (min-width: 768px) {
    .ham { display: none !important; }
    .drawer { display: none !important; }
    .drawer-overlay { display: none !important; }
  }
`;
