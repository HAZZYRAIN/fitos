// mobileFix.ts
// Import this and append to S in both AdminDashboard and TrainerDashboard
// Usage: <style>{S + MOBILE_FIX}</style>

export const MOBILE_FIX = `

/* ═══════════════════════════════════════════════════════════════
   MOBILE GLOBAL FIXES
   ═══════════════════════════════════════════════════════════════ */

/* ── 1. Box model — nothing should overflow the screen ── */
*, *::before, *::after {
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}

/* ── 2. Root html/body must not scroll horizontally ── */
html, body {
  width: 100%;
  max-width: 100vw;
  overflow-x: hidden;
  -webkit-text-size-adjust: 100%;
  text-size-adjust: 100%;
}

/* ── 3. App shell: full height, no overflow ── */
.app {
  width: 100%;
  max-width: 100vw;
  overflow-x: hidden;
}

/* ── 4. Main content area: constrained width on mobile ── */
.main {
  min-width: 0;
  max-width: 100%;
  overflow-x: hidden;
}

.content {
  min-width: 0;
  max-width: 100%;
  overflow-x: hidden;
  padding: 16px 14px 100px 14px;
}

@media (min-width: 768px) {
  .content {
    padding: 24px 28px 40px 28px;
  }
}

/* ── 5. ALL inputs/selects/textareas: font-size 16px minimum ──
   This is THE fix for iOS auto-zoom on input focus.
   iOS zooms in whenever an input has font-size < 16px.
   Setting 16px prevents zoom entirely. ── */
input,
input[type="text"],
input[type="number"],
input[type="email"],
input[type="password"],
input[type="date"],
input[type="tel"],
input[type="search"],
select,
textarea {
  font-size: 16px !important;
  -webkit-appearance: none;
  appearance: none;
  border-radius: 8px;
  touch-action: manipulation;
}

/* ── 6. Number input: hide spinners on mobile (cleaner look) ── */
input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type="number"] {
  -moz-appearance: textfield;
}

/* ── 7. Buttons: minimum tap target 44px, no tap flash ── */
button, .btn, .ni, .dni {
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  cursor: pointer;
}

button {
  min-height: 36px;
}

.btn {
  min-height: 40px;
}

/* ── 8. Cards and all block elements: never overflow ── */
.card, .wiz-card, .step-card, .ex-card {
  max-width: 100%;
  overflow: hidden;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

/* ── 9. Typography: readable on mobile ── */
@media (max-width: 640px) {
  h1 { font-size: 20px !important; }
  h2 { font-size: 17px !important; }
  h3 { font-size: 15px !important; }

  .tb-t {
    font-size: 15px !important;
  }

  .fs12 { font-size: 13px !important; }
  .fs11 { font-size: 12px !important; }
  .fs10 { font-size: 11px !important; }

  .card {
    padding: 14px 12px !important;
  }

  .fi {
    font-size: 16px !important;
    padding: 11px 12px !important;
    min-height: 46px !important;
  }

  label {
    font-size: 13px !important;
  }

  .btn-p, .btn-g {
    min-height: 46px !important;
    font-size: 14px !important;
  }
}

/* ── 10. Grid: 2-col grids collapse to 1 col on small screens ── */
@media (max-width: 480px) {
  .g2, .g3, .g4 {
    grid-template-columns: 1fr !important;
  }
}

/* ── 11. Topbar: safe area padding for iPhone notch ── */
.topbar {
  padding-top: max(12px, env(safe-area-inset-top));
  padding-left: max(16px, env(safe-area-inset-left));
  padding-right: max(16px, env(safe-area-inset-right));
}

/* ── 12. Drawer: full safe area coverage ── */
.drawer {
  padding-bottom: max(24px, env(safe-area-inset-bottom));
  padding-left: max(0px, env(safe-area-inset-left));
}

/* ── 13. Bottom of page padding for mobile nav bar ── */
@media (max-width: 768px) {
  .content {
    padding-bottom: max(80px, calc(60px + env(safe-area-inset-bottom)));
  }
}

/* ── 14. Overlays/modals: full mobile screen ── */
@media (max-width: 640px) {
  .overlay {
    align-items: flex-end !important;
    padding: 0 !important;
  }

  .modal {
    width: 100% !important;
    max-width: 100% !important;
    border-radius: 22px 22px 0 0 !important;
    max-height: 90vh !important;
    overflow-y: auto !important;
    padding: 20px 16px max(20px, env(safe-area-inset-bottom)) !important;
  }

  .modal-lg {
    max-height: 92vh !important;
  }
}

/* ── 15. Wiz stepper: fit on small screens ── */
@media (max-width: 400px) {
  .wiz-bar {
    gap: 0 !important;
  }
  .wiz-step {
    padding: 4px 4px !important;
  }
  .wiz-lbl {
    font-size: 8px !important;
  }
  .wiz-circle {
    width: 26px !important;
    height: 26px !important;
    font-size: 10px !important;
  }
  .wiz-div {
    width: 10px !important;
  }
}

/* ── 16. Prevent horizontal scroll from any element ── */
.row {
  flex-wrap: wrap;
  min-width: 0;
}

.row > * {
  min-width: 0;
}

`;
