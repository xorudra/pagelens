(() => {
  // Cosmetic filters can collapse injected overlays with !important rules.
  // Keep PageLens's viewport host usable while leaving page styles untouched.
  function protectHost(host) {
    const protectedStyles = {
      display: "block",
      visibility: "visible",
      opacity: "1",
      position: "fixed",
      inset: "0",
      "z-index": "2147483647",
      "pointer-events": "none",
      width: "100vw",
      height: "100vh",
      "max-width": "none",
      "max-height": "none",
      "box-sizing": "border-box",
      overflow: "visible",
      clip: "auto",
      "clip-path": "none",
      transform: "none"
    };
    for (const [property, value] of Object.entries(protectedStyles)) {
      host.style.setProperty(property, value, "important");
    }
  }

  const existing = document.getElementById("pagelens-extension-root");
  if (existing) {
    const computed = getComputedStyle(existing);
    const hiddenByPage = computed.display === "none"
      || computed.visibility === "hidden"
      || Number(computed.opacity) === 0
      || computed.width === "0px"
      || computed.height === "0px";
    const currentlyOpen = existing.dataset.pagelensOpen !== "false";
    const shouldOpen = !currentlyOpen || hiddenByPage;
    if (shouldOpen) {
      protectHost(existing);
      existing.dataset.pagelensOpen = "true";
    } else {
      existing.dataset.pagelensOpen = "false";
    }
    return;
  }

  const tools = [
    ["pick", "Pick element", "Select a page element and copy its HTML or CSS.", "Pick"],
    ["clone", "Clone page", "Preview the snapshot, inspect generated HTML and CSS, then download its ZIP.", "Clone page"],
    ["prompt", "Design prompt", "Create a structured brief from this page.", "Prompt"],
    ["design-md", "Design MD", "Collect the page’s colors, type, and layout notes."],
    ["assets", "Extract assets", "Find images, SVGs, videos, and background images.", "Assets"],
    ["colors", "Extract colors", "Build a reusable palette from the page.", "Colors"],
    ["fonts", "Detect fonts", "Find the typefaces and text styles in use.", "Fonts"],
    ["inspect", "Inspect & measure", "Read element dimensions, spacing, and styles.", "Measure"],
    ["edit-text", "Edit text", "Try copy changes directly on the page."],
    ["screenshot", "Screenshot", "Capture the visible browser area.", "Capture"],
    ["responsive", "Responsive viewer", "Preview this page at common viewport widths.", "Responsive"],
    ["swap-fonts", "Swap fonts", "Preview another font across the page.", "Swap font"],
    ["layout", "Move & delete", "Reorder or remove elements, then undo.", "Arrange"],
  ];

  const host = document.createElement("div");
  host.id = "pagelens-extension-root";
  host.style.cssText = "all:initial;position:fixed;inset:0;z-index:2147483647;pointer-events:none;font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,\"Segoe UI\",sans-serif;font-size:14px;line-height:1.45;color:#f5f5fa";
  host.dataset.pagelensOpen = "true";
  protectHost(host);
  document.documentElement.appendChild(host);
  const shadow = host.attachShadow({ mode: "open" });

  shadow.innerHTML = `
    <style>
      :host{all:initial;color-scheme:dark;font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#f5f5fa;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility;font-synthesis:none;--pl-panel:#111218;--pl-surface:#191a22;--pl-surface-hover:#252630;--pl-line:#343541;--pl-text:#f5f5fa;--pl-muted:#c4c6d1;--pl-subtle:#aaadbb;--pl-accent:#b58cff;--pl-accent-strong:#7051db}
      *{box-sizing:border-box}
      #panel{position:fixed;left:50%;right:auto;top:auto;bottom:12px;transform:translateX(-50%);width:min(1120px,calc(100vw - 24px));height:auto;max-height:calc(100vh - 24px);background:var(--pl-panel);color:var(--pl-text);border:1px solid #b58cffaa;border-radius:18px;box-shadow:0 22px 70px #0009,0 0 0 1px #b58cff1f;backdrop-filter:blur(18px);pointer-events:auto;display:flex;flex-direction:column;overflow:hidden;font-size:14px;font-weight:500;line-height:1.45;letter-spacing:-.01em}
      #panel.expanded{height:auto;max-height:min(680px,calc(100vh - 24px))}
      #panel.sidebar{left:auto;right:12px;top:12px;bottom:12px;transform:none;width:min(900px,calc(100vw - 24px));height:calc(100vh - 24px);max-height:none}
      #panel.sidebar.expanded{height:calc(100vh - 24px);max-height:none}
      #panel.sidebar:not(.expanded){left:auto;right:12px;top:50%;bottom:auto;transform:translateY(-50%);width:90px;height:auto;max-height:calc(100vh - 24px)}
      #panel.sidebar:not(.expanded) #body{display:flex;flex-direction:column}
      #panel.sidebar:not(.expanded) nav{width:90px;flex:0 0 auto;max-height:70vh}
      #highlight{position:fixed;display:none;border:2px solid #6e9bff;background:#6e9bff22;border-radius:4px;pointer-events:none;z-index:0}
      #highlight[data-font-tip]::after{content:attr(data-font-tip);position:absolute;left:0;top:calc(100% + 5px);padding:6px 9px;border-radius:7px;background:#171821;color:#fff;border:1px solid #aaa0c2;box-shadow:0 3px 16px #0008;font:600 12px/1.3 ui-sans-serif,system-ui;white-space:nowrap;max-width:min(440px,80vw);overflow:hidden;text-overflow:ellipsis}
      header{display:none;height:54px;flex:none;align-items:center;gap:10px;padding:0 16px;border-bottom:1px solid var(--pl-line);background:#15161d}
      #panel.expanded header{display:flex}
      .brand{display:flex;align-items:center;gap:9px;font-weight:700;font-size:15px;letter-spacing:-.015em;flex:1}
      .logo{width:27px;height:27px;border-radius:9px;background:linear-gradient(135deg,#b58cff,#6ecbdb);display:grid;place-items:center;color:#111218;font-size:15px;font-weight:800}
      button,select,input,textarea{font:inherit;letter-spacing:inherit}
      button{color:inherit;background:#20222c;border:1px solid #3a3c49;border-radius:9px;padding:9px 12px;cursor:pointer;transition:background .15s ease,border-color .15s ease,transform .15s ease;font-weight:600}
      button:hover{background:#2a2c38;border-color:#646579}
      button:focus-visible,select:focus-visible,input:focus-visible,textarea:focus-visible{outline:2px solid var(--pl-accent);outline-offset:2px}
      button:active{transform:translateY(1px)}
      button.primary{background:var(--pl-accent-strong);border-color:var(--pl-accent-strong);color:#fff;font-weight:700}
      button.primary:hover{background:#7a5bdf;border-color:#7a5bdf}
      button.subtle{background:transparent;border-color:transparent;padding:6px 8px;color:var(--pl-muted)}
      button.danger{color:#ffb8b8}
      #body{display:contents}
      #panel.expanded #body{display:flex;min-height:0;flex:0 1 auto;flex-direction:column}
      #panel.sidebar.expanded #body{flex:1;min-height:0;flex-direction:row}
      nav{order:2;width:100%;flex:none;display:flex;align-items:center;gap:6px;padding:10px 12px;border:0;background:#121319;overflow-x:auto;overflow-y:hidden;scrollbar-width:thin;scrollbar-color:#555060 transparent;scroll-snap-type:x proximity}
      .navbtn{width:78px;height:64px;flex:0 0 78px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;text-align:center;background:#191a22;border:1px solid #383943;border-radius:12px;color:#eeedf5;padding:5px 4px;margin:0;font-size:12px;font-weight:700;line-height:1.2;letter-spacing:-.015em;white-space:normal;scroll-snap-align:center}
      .navbtn:hover{background:#252630;border-color:#777389}
      .navbtn.active{background:#29233a;border-color:var(--pl-accent);color:#fff;box-shadow:inset 0 0 0 1px #b58cff35}
      .navbtn .tool-icon{width:21px;height:21px;display:grid;place-items:center;flex:none;color:#f5f3f8}
      .navbtn .tool-icon svg{width:21px;height:21px;display:block;fill:none;stroke:currentColor;stroke-width:1.85;stroke-linecap:round;stroke-linejoin:round}
      .navbtn .tool-label{display:block;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      main{display:none;order:1;flex:0 1 auto;min-height:0;min-width:0;max-height:min(480px,calc(100vh - 210px));overflow:auto;padding:19px 22px 20px;scrollbar-width:thin;scrollbar-color:#555060 transparent}
      #panel.expanded main{display:block}
      #panel.sidebar main{order:2;flex:1;max-height:none;min-height:0}
      #panel.sidebar nav{order:1;width:90px;flex:0 0 90px;flex-direction:column;align-items:stretch;overflow-x:hidden;overflow-y:auto;scroll-snap-type:y proximity;border-right:1px solid var(--pl-line)}
      #panel.sidebar .navbtn{width:100%;height:62px;flex:0 0 62px}
      h1{font-size:20px;font-weight:750;letter-spacing:-.025em;margin:0 0 7px;line-height:1.2} h2{font-size:15px;font-weight:700;letter-spacing:-.015em;margin:20px 0 9px;line-height:1.35}
      p{color:var(--pl-muted);margin:5px 0 15px;font-size:14px;font-weight:500;line-height:1.45;letter-spacing:0}
      .muted{color:#c2c4d0;font-size:13px;font-weight:500;line-height:1.45}
      .card{background:var(--pl-surface);border:1px solid var(--pl-line);border-radius:12px;padding:13px;margin:10px 0}
      .row{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
      .row>*{flex:none}.row .grow{flex:1;min-width:0}
      .stack{display:grid;gap:8px}
      .kv{display:grid;grid-template-columns:115px minmax(0,1fr);gap:8px;padding:7px 0;border-bottom:1px solid #30313c;align-items:start}
      .kv:last-child{border-bottom:0}.key{color:#b7b9c5;font-weight:600}.value{overflow-wrap:anywhere;color:#f0eff6}
      textarea, input[type=text], select{width:100%;background:#15161d;color:#f5f5fa;border:1px solid #3a3c49;border-radius:9px;padding:11px;outline:none;font-size:14px;line-height:1.45}
      textarea{min-height:125px;resize:vertical;font:13px/1.55 ui-monospace,SFMono-Regular,Consolas,monospace}
      .code{min-height:90px}.hint{padding:12px;border-radius:10px;background:#1a1c25;color:#d0d1dc;font-size:13px;font-weight:500;line-height:1.45}
      .swatch{display:flex;gap:10px;align-items:center;width:100%;padding:8px;background:transparent;border:0;text-align:left;border-radius:8px}
      .chip{width:23px;height:23px;border:1px solid #fff4;border-radius:6px;flex:none}
      .asset{padding:9px 0;border-bottom:1px solid #30313c}.asset:last-child{border:0}
      .asset img{width:36px;height:30px;object-fit:cover;border-radius:4px;background:#252b39}
      .status{min-height:18px;color:#d7d8e2;font-size:13px;font-weight:600;margin-top:9px;line-height:1.45}
      .preset{padding:8px 10px}.viewport-wrap{height:330px;overflow:auto;background:#1b1d26;border:1px solid #3a3c49;border-radius:10px;padding:10px;display:flex;justify-content:center;align-items:flex-start}
      .compare-wrap{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;align-items:start;max-height:470px;overflow:auto;background:#1b1d26;border:1px solid #3a3c49;border-radius:10px;padding:12px}
      .device-card{min-width:0;padding:8px;background:#121319;border:1px solid #383943;border-radius:10px;overflow:hidden}
      .device-title{margin-bottom:7px;color:#dddce7;font-size:12px;font-weight:700}
      .device-window{position:relative;overflow:hidden;background:white;border-radius:4px;box-shadow:0 5px 18px #0006}
      .device-window iframe{position:absolute;left:0;top:0;transform-origin:top left;border-radius:0}
      .editor-tools{display:flex;gap:7px;flex-wrap:wrap;margin:10px 0}
      .editor-stage{max-height:360px;overflow:auto;padding:8px;background:#0d0e12;border:1px solid #393a46;border-radius:10px;text-align:center}
      .editor-stage canvas{display:block;max-width:100%;height:auto;margin:0 auto;touch-action:none;cursor:crosshair}
      .check-row{display:flex;align-items:center;gap:7px;padding:7px 9px;border:1px solid #383943;border-radius:8px;background:#191a22;font-size:12px;font-weight:600}
      .check-row input{accent-color:#a47aff}
      iframe{border:0;background:white;border-radius:3px;transform-origin:top center;box-shadow:0 8px 30px #0007}
      #footer{display:none;flex:none;border-top:1px solid var(--pl-line);padding:9px 15px;align-items:center;gap:8px;color:#b2b5c2;font-size:12px;font-weight:500;line-height:1.4;background:#15161d}
      #panel.expanded #footer{display:flex}
      #toast{position:fixed;left:50%;bottom:90px;transform:translateX(-50%);background:#202635;color:#f5f7fb;border:1px solid #414b60;padding:8px 12px;border-radius:9px;box-shadow:0 6px 24px #0008;display:none;pointer-events:none}
      .welcome{padding-top:2px}.feature{font-size:13px;font-weight:600;line-height:1.45;color:#dedee7;padding:9px 0;border-bottom:1px solid #30313c}.feature:last-child{border:0}
      @media(max-width:640px){#panel{width:calc(100vw - 16px);bottom:8px;border-radius:16px}#panel.expanded{max-height:calc(100vh - 16px)}#panel.sidebar{left:8px;right:8px;top:8px;bottom:8px;width:calc(100vw - 16px);height:calc(100vh - 16px)}#panel.sidebar:not(.expanded){left:auto;right:8px;top:50%;bottom:auto;transform:translateY(-50%);width:72px;height:auto;max-height:calc(100vh - 16px)}header{height:50px;padding:0 12px}nav{padding:8px}.navbtn{width:74px;height:60px;flex-basis:74px;font-size:11px}main{padding:16px 15px 18px;max-height:calc(100vh - 190px)}.kv{grid-template-columns:95px minmax(0,1fr)}#panel.sidebar nav{width:72px;flex-basis:72px;padding:6px 4px}.compare-wrap{grid-template-columns:1fr 1fr;padding:8px;gap:8px}}
    </style>
    <div id="highlight"></div>
    <section id="panel" role="dialog" aria-label="PageLens website toolkit">
      <header><div class="brand"><div class="logo">P</div>PageLens</div><button class="subtle" data-action="settings" title="Workspace settings" aria-label="Workspace settings">⚙</button><button class="subtle" data-action="close" title="Back to tools">⌄</button></header>
      <div id="body"><nav id="nav"></nav><main id="main"></main></div>
      <div id="footer"><span class="grow">Local page tools · Changes are temporary</span><button class="subtle" data-action="undo">Undo</button></div>
    </section>
    <div id="toast" role="status"></div>
  `;

  const panel = shadow.getElementById("panel");
  const main = shadow.getElementById("main");
  const nav = shadow.getElementById("nav");
  const highlight = shadow.getElementById("highlight");
  const toast = shadow.getElementById("toast");
  const defaultPreferences = { dock: "bottom", captureMode: "visible", responsiveWidths: [375, 768, 1280], toolOrder: tools.map((item) => item[0]) };
  const state = { tool: null, selected: null, picking: false, measuring: false, fontInspecting: false, firstPoint: null, history: [], fontStyle: null, fontLink: null, fontCatalog: null, fontCatalogLoading: false, fontCatalogLoaded: false, responsiveFrames: [], screenshotCanvas: null, originalScreenshot: null, editorMode: "view", editorHistory: [], editorRedo: [], annotationColor: "#ff4d8d", annotationText: "Note", captureCancel: false, capturing: false, assets: null, selectedAssets: new Set(), clonePreviewHtml: "", cloneCodeHtml: "", clonePreviewCss: "", cloneCodeTab: "html", preferences: { ...defaultPreferences } };
  const icons = [
    `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 3H4a1 1 0 0 0-1 1v4m13-5h4a1 1 0 0 1 1 1v4M3 16v4a1 1 0 0 0 1 1h4m8 0h4a1 1 0 0 0 1-1v-4M10 8l6 7-3 .2 1.2 3.3-1.8.7-1.3-3.3-2 2z"/></svg>`,
    `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="13" height="13" rx="1.5"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/></svg>`,
    `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 20 9-9M7 4v4M5 6h4m9-3v5m-2.5-2.5h5M18 13v4m-2-2h4"/><path d="m14 4 1-2 1 2 2 1-2 1-1 2-1-2-2-1z"/></svg>`,
    `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h8l4 4v14H6zM14 3v5h5M8 13h2l1 4 1-4h2M8 19h7"/></svg>`,
    `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9" r="1.5"/><path d="m21 15-5-5L5 20"/></svg>`,
    `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3c-2 3-7 7.8-7 12a7 7 0 0 0 14 0c0-4.2-5-9-7-12z"/><path d="M8 16a4 4 0 0 0 4 3"/></svg>`,
    `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5h14M12 5v14M8 19h8"/><path d="m8 9 4-4 4 4"/></svg>`,
    `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v14H4zM8 8v4M12 8v2M16 8v4M8 16v-2M12 16v-2M16 16v-2"/></svg>`,
    `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16M12 5v14M8 19h8"/><path d="M6 9h12"/></svg>`,
    `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 8h4l2-3h6l2 3h4v11H3z"/><circle cx="12" cy="13" r="3.5"/></svg>`,
    `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="13" height="11" rx="1.5"/><path d="M7 20h5m-2.5-5v5"/><rect x="18" y="7" width="3" height="13" rx="1"/></svg>`,
    `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h15m-4-4 4 4-4 4M20 16H5m4-4-4 4 4 4"/></svg>`,
    `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v18M3 12h18M12 3 9 6m3-3 3 3M12 21l-3-3m3 3 3-3M3 12l3-3m-3 3 3 3m15-3-3-3m3 3-3 3"/></svg>`
  ];
  const fontChoices = ["Inter", "Roboto", "Open Sans", "Lato", "Montserrat", "Poppins", "Nunito", "Nunito Sans", "Source Sans 3", "Source Serif 4", "Merriweather", "Playfair Display", "DM Sans", "DM Serif Display", "Manrope", "Work Sans", "Fira Sans", "Fira Code", "IBM Plex Sans", "IBM Plex Mono", "Space Grotesk", "Space Mono", "Plus Jakarta Sans", "Outfit", "Sora", "Urbanist", "Rubik", "Karla", "Barlow", "Barlow Condensed", "Oswald", "Archivo", "Archivo Black", "Raleway", "Quicksand", "Mulish", "Cabin", "Libre Franklin", "Libre Baskerville", "Lora", "Cormorant Garamond", "Bodoni Moda", "Fraunces", "Bitter", "Crimson Text", "Alegreya", "Spectral", "PT Sans", "PT Serif", "Ubuntu", "Inconsolata", "JetBrains Mono", "Figtree", "Red Hat Display", "Red Hat Text", "Lexend", "Epilogue", "Josefin Sans", "Kanit", "Titillium Web", "Archivo Narrow", "Noto Sans", "Noto Serif", "Noto Sans Mono", "Google Sans", "Arial", "Georgia", "Verdana", "system-ui", "monospace"];

  function esc(value) {
    return String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  }
  function notify(message) {
    toast.textContent = message;
    toast.style.display = "block";
    clearTimeout(notify.timer);
    notify.timer = setTimeout(() => { toast.style.display = "none"; }, 2200);
  }
  function setStatus(message) {
    const target = main.querySelector(".status");
    if (target) target.textContent = message;
  }
  function button(label, action, primary = false, extra = "") {
    return `<button class="${primary ? "primary " : ""}${extra}" data-action="${esc(action)}">${esc(label)}</button>`;
  }
  function kv(key, value) {
    return `<div class="kv"><div class="key">${esc(key)}</div><div class="value">${esc(value)}</div></div>`;
  }
  function navMarkup() {
    const ordered = state.preferences.toolOrder.map((id) => tools.find((item) => item[0] === id)).filter(Boolean);
    tools.filter((item) => !ordered.includes(item)).forEach((item) => ordered.push(item));
    nav.innerHTML = ordered.map((item) => {
      const iconIndex = tools.indexOf(item);
      return `<button class="navbtn ${state.tool === item[0] ? "active" : ""}" data-tool="${item[0]}" title="${esc(item[1])}" aria-label="${esc(item[1])}"><span class="tool-icon">${icons[iconIndex]}</span><span class="tool-label">${esc(item[3] || item[1])}</span></button>`;
    }).join("");
    panel.classList.toggle("sidebar", state.preferences.dock === "sidebar");
  }
  function savePreferences() {
    try { chrome.storage?.local?.set({ pagelensPreferences: state.preferences }); } catch (_) {}
  }
  async function loadFontCatalog() {
    if (state.fontCatalogLoaded || state.fontCatalogLoading) return;
    state.fontCatalogLoading = true;
    try {
      const response = await fetch("https://raw.githubusercontent.com/google/fonts/main/tags/all/families.csv", { mode: "cors", credentials: "omit" });
      if (!response.ok) throw new Error(`Catalog request failed (${response.status})`);
      const csv = await response.text();
      state.fontCatalog = [...new Set(csv.split(/\r?\n/).map((line) => line.split(",", 1)[0].trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b));
    } catch (_) {
      state.fontCatalog = [];
    } finally {
      state.fontCatalogLoading = false;
      state.fontCatalogLoaded = true;
      if (state.tool === "swap-fonts") render();
    }
  }
  function loadPreferences() {
    try {
      chrome.storage?.local?.get({ pagelensPreferences: null }, (result) => {
        const saved = result?.pagelensPreferences;
        if (saved && typeof saved === "object") {
          state.preferences = {
            ...defaultPreferences,
            ...saved,
            responsiveWidths: Array.isArray(saved.responsiveWidths) ? [...new Set(saved.responsiveWidths.map(Number).filter((width) => Number.isInteger(width) && width >= 280 && width <= 2560))] : defaultPreferences.responsiveWidths,
            toolOrder: Array.isArray(saved.toolOrder) ? [...new Set(saved.toolOrder.filter((id) => tools.some((item) => item[0] === id))), ...tools.map((item) => item[0]).filter((id) => !saved.toolOrder.includes(id))] : defaultPreferences.toolOrder
          };
          render();
        }
      });
    } catch (_) {}
  }
  function currentInfo() {
    const el = state.selected;
    if (!el || !el.isConnected) return null;
    const rect = el.getBoundingClientRect();
    const style = getComputedStyle(el);
    return { el, rect, style, tag: el.tagName.toLowerCase(), selector: selectorFor(el) };
  }
  function selectorFor(el) {
    if (!el) return "";
    if (el.id) return `#${el.id}`;
    const classes = Array.from(el.classList || []).slice(0, 2).map((name) => `.${name}`).join("");
    return `${el.tagName.toLowerCase()}${classes}`;
  }
  function hoverElement(el) {
    if (!el || el === host || el === document.documentElement || el === document.body) {
      highlight.style.display = "none";
      highlight.removeAttribute("data-font-tip");
      return;
    }
    const r = el.getBoundingClientRect();
    highlight.style.cssText = `position:fixed;display:block;left:${Math.max(0, r.left)}px;top:${Math.max(0, r.top)}px;width:${Math.max(0, r.width)}px;height:${Math.max(0, r.height)}px;border:2px solid #6e9bff;background:#6e9bff22;border-radius:4px;pointer-events:none;z-index:0`;
  }
  function activatePick(measure = false) {
    state.picking = true;
    state.measuring = measure;
    state.firstPoint = null;
    panel.dataset.picking = "true";
    notify(measure ? "Click two points on the page to measure." : "Point to an element and click to select it.");
  }
  function finishPick() {
    state.picking = false;
    state.measuring = false;
    panel.dataset.picking = "false";
    highlight.style.display = "none";
  }
  function addUndo(fn) { state.history.push(fn); }
  function undo() {
    const action = state.history.pop();
    if (action) { action(); notify("Last page edit undone."); render(); }
    else notify("There are no page edits to undo.");
  }
  function computedFor(el) {
    const style = getComputedStyle(el);
    const props = ["display", "position", "width", "height", "color", "backgroundColor", "fontFamily", "fontSize", "fontWeight", "lineHeight", "margin", "padding", "border", "borderRadius", "boxShadow"];
    return props.map((name) => `${name.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)}: ${style[name]};`).join("\n");
  }
  function elementPreviewHTML(el) {
    const clone = el.cloneNode(true);
    const sourceNodes = [el, ...el.querySelectorAll("*")].slice(0, 600);
    const cloneNodes = [clone, ...clone.querySelectorAll("*")].slice(0, 600);
    const cssProps = ["display", "position", "box-sizing", "width", "height", "max-width", "margin", "padding", "border", "border-radius", "background", "color", "font-family", "font-size", "font-weight", "line-height", "text-align", "text-decoration", "overflow", "object-fit", "flex", "grid-template-columns", "gap", "align-items", "justify-content", "box-shadow"];
    sourceNodes.forEach((source, index) => {
      const target = cloneNodes[index];
      if (!target) return;
      const style = getComputedStyle(source);
      target.setAttribute("style", `${target.getAttribute("style") || ""};${cssProps.map((prop) => `${prop}:${style.getPropertyValue(prop)}`).join(";")}`);
      [...target.attributes].forEach((attr) => {
        if (attr.name.toLowerCase().startsWith("on") || attr.name === "srcdoc" || /^(?:javascript|vbscript):/i.test(attr.value.trim())) target.removeAttribute(attr.name);
      });
    });
    clone.querySelectorAll("script,iframe,object,embed,form").forEach((node) => node.remove());
    return `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;min-height:100%;font-family:system-ui,sans-serif}body{padding:16px;background:#fff;color:#222}</style></head><body>${clone.outerHTML}</body></html>`;
  }
  function selectedCard() {
    const info = currentInfo();
    if (!info) return `<div class="hint">Choose “Pick on page” and select an element first.</div>`;
    return `<div class="card">${kv("Element", `<${info.tag}>`)}${kv("Selector", info.selector)}${kv("Size", `${Math.round(info.rect.width)} × ${Math.round(info.rect.height)} px`)}${kv("Font family", info.style.fontFamily)}${kv("Font size / weight", `${info.style.fontSize} · ${info.style.fontWeight}`)}${kv("Line height", info.style.lineHeight)}${kv("Color", `${info.style.color} · ${info.style.backgroundColor}`)}</div>`;
  }
  function scanColors() {
    const counts = new Map();
    const nodes = Array.from(document.querySelectorAll("body *")).slice(0, 2500);
    for (const el of nodes) {
      if (host.contains(el)) continue;
      const cs = getComputedStyle(el);
      [cs.color, cs.backgroundColor, cs.borderTopColor].forEach((color) => {
        if (!color || color === "transparent" || color === "rgba(0, 0, 0, 0)") return;
        counts.set(color, (counts.get(color) || 0) + 1);
      });
    }
    return [...counts].sort((a, b) => b[1] - a[1]).slice(0, 40).map(([color, count]) => ({ color, count }));
  }
  function scanFonts() {
    const counts = new Map();
    for (const el of Array.from(document.querySelectorAll("body *")).slice(0, 3000)) {
      if (host.contains(el)) continue;
      const text = (el.innerText || "").trim();
      if (!text || text.length > 400) continue;
      const cs = getComputedStyle(el);
      const key = `${cs.fontFamily} | ${cs.fontSize} | ${cs.fontWeight} | ${cs.lineHeight}`;
      const item = counts.get(key) || { key, fontFamily: cs.fontFamily, fontSize: cs.fontSize, fontWeight: cs.fontWeight, lineHeight: cs.lineHeight, sample: text.slice(0, 70), count: 0 };
      item.count++;
      counts.set(key, item);
    }
    return [...counts.values()].sort((a, b) => b.count - a.count).slice(0, 60);
  }
  function scanSpacing() {
    const counts = new Map();
    const props = ["margin-top", "margin-right", "margin-bottom", "margin-left", "padding-top", "padding-right", "padding-bottom", "padding-left", "gap", "row-gap", "column-gap", "border-radius"];
    for (const el of Array.from(document.querySelectorAll("body *")).slice(0, 2200)) {
      if (host.contains(el)) continue;
      const style = getComputedStyle(el);
      for (const prop of props) {
        const value = style.getPropertyValue(prop).trim();
        if (!value || /^(?:0(?:px|rem|em|%)?|auto|normal|none)$/i.test(value)) continue;
        const key = `${prop}: ${value}`;
        counts.set(key, (counts.get(key) || 0) + 1);
      }
    }
    return [...counts].sort((a, b) => b[1] - a[1]).slice(0, 18).map(([value, count]) => ({ value, count }));
  }
  function scanAssets() {
    const result = [];
    const seen = new Set();
    const add = (url, type, el) => {
      if (!url || (url.startsWith("data:") && type !== "SVG") || seen.has(`${type}:${url}`)) return;
      seen.add(`${type}:${url}`);
      result.push({ url, type, alt: el?.alt || el?.getAttribute("aria-label") || "", preview: ["Image", "SVG", "Background"].includes(type) ? url : "" });
    };
    for (const el of Array.from(document.querySelectorAll("img,video,source,svg,body *")).slice(0, 3500)) {
      if (host.contains(el)) continue;
      if (el.tagName === "IMG") add(el.currentSrc || el.src, "Image", el);
      else if (el.tagName === "VIDEO") add(el.currentSrc || el.src || el.poster, "Video", el);
      else if (el.tagName === "SOURCE") add(el.src, "Media", el);
      else if (el.localName?.toLowerCase() === "svg") add(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(el.outerHTML)}`, "SVG", el);
      const bg = getComputedStyle(el).backgroundImage;
      for (const match of bg.matchAll(/url\(["']?(.*?)["']?\)/g)) add(new URL(match[1], location.href).href, "Background", el);
    }
    return result.slice(0, 200);
  }
  function filteredAssets() {
    const items = state.assets || (state.assets = scanAssets());
    const kind = main.querySelector("#assets-filter")?.value || "all";
    const query = (main.querySelector("#asset-search")?.value || "").trim().toLowerCase();
    return items.map((item, index) => ({ ...item, index })).filter((item) => {
      const typeMatch = kind === "all" || (kind === "image" ? ["Image", "SVG", "Background"].includes(item.type) : kind === "media" ? ["Video", "Media"].includes(item.type) : item.type === kind);
      const textMatch = !query || `${item.type} ${item.alt} ${item.url}`.toLowerCase().includes(query);
      return typeMatch && textMatch;
    });
  }
  function pageDetails() {
    const colors = scanColors();
    const fonts = scanFonts();
    const headings = Array.from(document.querySelectorAll("h1,h2,h3")).slice(0, 12).map((el) => (el.innerText || "").trim()).filter(Boolean);
    const meta = document.querySelector('meta[name="description"]')?.content || "";
    const bodyText = (document.body.innerText || "").replace(/\s+/g, " ").trim().slice(0, 800);
    return { title: document.title, url: location.href, description: meta, viewport: `${innerWidth} × ${innerHeight}`, headings, bodyText, colors, fonts, spacing: scanSpacing() };
  }
  function detailsMarkdown(details = pageDetails()) {
    return `# Design reference: ${details.title}\n\nSource: ${details.url}\n\n${details.description ? `> ${details.description}\n\n` : ""}## Page\n\n- Viewport: ${details.viewport}\n- Page title: ${details.title}\n\n## Color palette\n\n${details.colors.slice(0, 20).map((c) => `- ${c.color} (${c.count} uses)`).join("\n") || "- No colors detected"}\n\n## Typography\n\n${details.fonts.slice(0, 16).map((f) => `- ${f.fontFamily}, ${f.fontSize}, weight ${f.fontWeight}, line-height ${f.lineHeight}`).join("\n") || "- No text styles detected"}\n\n## Spacing and layout tokens\n\n${details.spacing.map((item) => `- ${item.value} (${item.count} uses)`).join("\n") || "- No spacing tokens detected"}\n\n## Headings\n\n${details.headings.map((h) => `- ${h}`).join("\n") || "- No headings detected"}\n\n## Visible content sample\n\n${details.bodyText || "(No page text found)"}\n\n---\nGenerated locally with PageLens. Treat this as a reference, not the original source design file.\n`;
  }
  function designPrompt() {
    const d = pageDetails();
    return `Create an original web page inspired by the design characteristics below. Do not reuse the source brand, wording, imagery, or proprietary assets.\n\nPage context: ${d.title}\nDescription: ${d.description || "Not provided"}\nViewport reviewed: ${d.viewport}\n\nVisual direction\n- Main colors: ${d.colors.slice(0, 8).map((c) => c.color).join(", ") || "not detected"}\n- Typography: ${d.fonts.slice(0, 8).map((f) => `${f.fontFamily} ${f.fontSize} / ${f.fontWeight}`).join("; ") || "not detected"}\n- Spacing patterns: ${d.spacing.slice(0, 8).map((item) => item.value).join("; ") || "not detected"}\n- Content structure: ${d.headings.join(" → ") || "inspect the page sample"}\n\nBuild an accessible, responsive implementation with clear spacing, reusable components, and original copy and visual assets. Use the extracted details as a starting point and make your own design decisions.`;
  }
  async function makeStaticClone(includeAssets = true, previewOnly = false) {
    const clone = document.documentElement.cloneNode(true);
    const sourceNodes = [document.documentElement, ...document.documentElement.querySelectorAll("*")];
    const cloneNodes = [clone, ...clone.querySelectorAll("*")];
    const cssProps = ["display", "position", "box-sizing", "width", "height", "min-width", "max-width", "margin", "padding", "border", "border-radius", "background", "background-size", "background-position", "color", "font-family", "font-size", "font-weight", "line-height", "text-align", "text-decoration", "text-transform", "white-space", "overflow", "object-fit", "flex", "grid-template-columns", "gap", "align-items", "justify-content", "opacity", "box-shadow"];
    sourceNodes.slice(0, 2500).forEach((source, index) => {
      const target = cloneNodes[index];
      if (!target || source === document.documentElement || source === host) return;
      const cs = getComputedStyle(source);
      const values = cssProps.map((prop) => `${prop}:${cs.getPropertyValue(prop)}`).join(";");
      target.setAttribute("style", `${target.getAttribute("style") || ""};${values}`);
    });
    clone.querySelector("#pagelens-extension-root")?.remove();
    clone.querySelectorAll("script,iframe,object,embed,noscript,base,link,style,meta[http-equiv]").forEach((el) => el.remove());
    clone.querySelectorAll("*").forEach((el) => {
      [...el.attributes].forEach((attr) => {
        if (attr.name.toLowerCase().startsWith("on") || attr.name === "srcdoc") el.removeAttribute(attr.name);
      });
      ["src", "href", "poster", "xlink:href"].forEach((name) => {
        const value = el.getAttribute(name);
        if (!value) return;
        if (/^(?:javascript|vbscript|file):/i.test(value.trim()) || (name === "href" && /^data:/i.test(value.trim())) || (name !== "href" && /^data:/i.test(value.trim()) && !/^data:image\/(?:png|jpe?g|gif|webp|svg\+xml);/i.test(value.trim()))) { el.removeAttribute(name); return; }
        if (value.startsWith("#") || /^(?:[a-z]+:|\/\/)/i.test(value)) return;
        try { el.setAttribute(name, new URL(value, document.baseURI).href); } catch (_) {}
      });
      if (el.tagName === "INPUT") el.removeAttribute("value");
      if (el.tagName === "TEXTAREA") el.textContent = "";
      if (el.tagName === "FORM") { el.removeAttribute("action"); el.removeAttribute("method"); }
      if (el.tagName === "BUTTON" && el.closest("form")) el.type = "button";
    });
    const stylesheet = clone.ownerDocument.createElement("link");
    stylesheet.rel = "stylesheet";
    stylesheet.href = "styles.css";
    clone.querySelector("head")?.appendChild(stylesheet);
    let html = `<!doctype html>\n${clone.outerHTML}`;
    let styles = collectPageStyles();
    const foundAssets = scanAssets().filter((item) => /^https?:/i.test(item.url)).slice(0, 150);
    const packaged = [];
    const assetPaths = new Map();
    let assetBytes = 0;
    if (includeAssets) {
      setStatus("Finding assets the page allows PageLens to save…");
      for (let index = 0; index < Math.min(foundAssets.length, 45); index++) {
        const item = foundAssets[index];
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 7000);
          const response = await fetch(item.url, { mode: "cors", credentials: "omit", signal: controller.signal });
          clearTimeout(timeout);
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          const type = (response.headers.get("content-type") || "").split(";")[0].toLowerCase();
          if (type && !/^(image\/|font\/|audio\/|video\/|application\/font|application\/vnd\.ms-fontobject|application\/octet-stream)/.test(type)) throw new Error("Not an image, font, or media file");
          const contentLength = Number(response.headers.get("content-length") || 0);
          if (contentLength > 1500000 || assetBytes + contentLength > 8000000) throw new Error("Asset exceeds the ZIP size limit");
          const reader = response.body?.getReader();
          const chunks = []; let byteCount = 0;
          if (reader) {
            while (true) {
              const part = await reader.read();
              if (part.done) break;
              byteCount += part.value.length;
              if (byteCount > 1500000 || assetBytes + byteCount > 8000000) { await reader.cancel(); throw new Error("Asset exceeds the ZIP size limit"); }
              chunks.push(part.value);
            }
          } else {
            const part = new Uint8Array(await response.arrayBuffer()); byteCount = part.length; chunks.push(part);
          }
          if (!byteCount || byteCount > 1500000 || assetBytes + byteCount > 8000000) throw new Error("Asset exceeds the ZIP size limit");
          const bytes = new Uint8Array(byteCount); let byteOffset = 0;
          for (const chunk of chunks) { bytes.set(chunk, byteOffset); byteOffset += chunk.length; }
          const pathName = (() => { try { return decodeURIComponent(new URL(item.url).pathname.split("/").pop() || "asset"); } catch (_) { return "asset"; } })();
          let ext = pathName.match(/\.[a-z0-9]{1,8}$/i)?.[0] || "";
          if (!/^(?:\.png|\.jpe?g|\.gif|\.webp|\.avif|\.svg|\.ico|\.woff2?|\.ttf|\.otf|\.eot|\.mp3|\.mp4|\.webm|\.ogg)$/i.test(ext)) ext = "";
          if (!ext) ext = ({ "image/jpeg": ".jpg", "image/svg+xml": ".svg", "image/png": ".png", "image/webp": ".webp", "image/gif": ".gif", "image/avif": ".avif", "font/woff2": ".woff2", "font/woff": ".woff", "font/ttf": ".ttf", "audio/mpeg": ".mp3", "video/mp4": ".mp4" })[type] || ".bin";
          const packagePath = `assets/${String(index + 1).padStart(3, "0")}-${safeFilename(pathName.replace(/\.[^.]*$/, "") || item.type.toLowerCase())}${ext}`;
          assetPaths.set(item.url, packagePath);
          packaged.push({ name: packagePath, bytes });
          assetBytes += bytes.length;
        } catch (_) {
          // CORS, unavailable files, or ZIP limits leave this asset linked to its original URL.
        }
      }
    }
    if (assetPaths.size) {
      for (const el of clone.querySelectorAll("[src],[href],[poster],[xlink\\:href]")) {
        for (const name of ["src", "href", "poster", "xlink:href"]) {
          const value = el.getAttribute(name);
          if (!value) continue;
          const localPath = assetPaths.get(value);
          if (localPath) el.setAttribute(name, localPath);
        }
      }
      for (const [url, packagePath] of assetPaths) {
        html = html.replaceAll(url.replaceAll("&", "&amp;"), packagePath).replaceAll(url, packagePath);
        styles = styles.replaceAll(url, packagePath);
      }
    }
    state.cloneCodeHtml = html;
    state.clonePreviewCss = styles || "/* No accessible stylesheet rules were found. Computed styles are saved inline in the HTML. */\n";
    state.clonePreviewHtml = html.replace(/<link rel="stylesheet" href="styles\.css">/i, "");
    if (previewOnly) {
      state.cloneCodeTab = "html";
      state.tool = "clone";
      render();
      setStatus("Snapshot preview ready. External page scripts are disabled.");
      return;
    }
    const assets = foundAssets.map(({ type, alt, url }) => ({ type, alt, url, included: assetPaths.has(url), ...(assetPaths.has(url) ? { packagePath: assetPaths.get(url) } : {}) }));
    const readme = `# ${document.title || "PageLens UI snapshot"}\n\nThis ZIP contains a local snapshot of the rendered page UI.\n\n- Open index.html in a browser to view the snapshot.\n- styles.css contains readable page rules that the browser allowed PageLens to collect. Key computed styles are also saved inline in the HTML.\n- assets.json lists referenced images and media. Those assets remain hosted at their original URLs and may need an internet connection.\n\nThis is a rendered UI snapshot, not the website's original source project. Scripts and embedded frames are removed for safety, so app behavior, server code, and backend features are not included.\n\nSource page: ${location.href}\nCaptured viewport: ${innerWidth} × ${innerHeight}\n`;
    const zip = makeZip([
      { name: "index.html", content: html },
      { name: "styles.css", content: styles || "/* PageLens saved the available computed styles inline in index.html. */\n" },
      { name: "assets.json", content: JSON.stringify(assets, null, 2) },
      { name: "README.md", content: readme.replace("Those assets remain hosted at their original URLs and may need an internet connection.", `${assetPaths.size} assets were copied into the assets/ folder when the source site allowed it; remaining assets stay linked to their original URLs and may need an internet connection.`) },
      ...packaged
    ]);
    downloadBlob(zip, `${safeFilename(document.title || "page")}-ui.zip`);
    render();
    setStatus(`ZIP ready · ${assetPaths.size} of ${foundAssets.length} assets included.`);
  }
  function collectPageStyles() {
    const chunks = [];
    let totalChars = 0;
    for (const sheet of Array.from(document.styleSheets)) {
      if (totalChars >= 1000000) break;
      try {
        const rules = Array.from(sheet.cssRules || []).slice(0, 3000);
        const base = sheet.href || document.baseURI;
        const css = rules.map((rule) => rebaseCssUrls(rule.cssText, base)).join("\n");
        if (!css.trim()) continue;
        const source = (sheet.href || "inline stylesheet").replace(/[\r\n*]/g, " ");
        const chunk = `/* Source: ${source} */\n${css}`.slice(0, 1000000 - totalChars);
        chunks.push(chunk);
        totalChars += chunk.length;
      } catch (_) {
        // Cross-origin stylesheets can block CSSOM access. The HTML still has computed styles inline.
      }
    }
    return chunks.join("\n\n");
  }
  function rebaseCssUrls(css, base) {
    return css.replace(/url\(\s*(?:(['"])(.*?)\1|([^)]*?))\s*\)/gi, (_match, quote, quoted, unquoted) => {
      const value = String(quoted ?? unquoted ?? "").trim();
      if (/^(?:javascript|vbscript|file):/i.test(value)) return "url(\"\")";
      if (!value || /^(?:data:|blob:|https?:|#)/i.test(value)) return `url("${value}")`;
      try { return `url("${new URL(value, base).href.replace(/["\\]/g, "\\$&")}")`; }
      catch (_) { return `url("${value.replace(/["\\]/g, "\\$&")}")`; }
    });
  }
  function makeZip(files) {
    const encoder = new TextEncoder();
    const now = new Date();
    const dosTime = (now.getHours() << 11) | (now.getMinutes() << 5) | Math.floor(now.getSeconds() / 2);
    const dosDate = ((Math.max(1980, now.getFullYear()) - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();
    const u16 = (n) => Uint8Array.of(n & 255, (n >>> 8) & 255);
    const u32 = (n) => Uint8Array.of(n & 255, (n >>> 8) & 255, (n >>> 16) & 255, (n >>> 24) & 255);
    const join = (parts) => {
      const size = parts.reduce((sum, part) => sum + part.length, 0);
      const result = new Uint8Array(size);
      let offset = 0;
      for (const part of parts) { result.set(part, offset); offset += part.length; }
      return result;
    };
    const crcTable = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
      crcTable[n] = c >>> 0;
    }
    const crc32 = (bytes) => {
      let crc = 0xffffffff;
      for (const byte of bytes) crc = crcTable[(crc ^ byte) & 255] ^ (crc >>> 8);
      return (crc ^ 0xffffffff) >>> 0;
    };
    const localParts = [];
    const centralParts = [];
    let offset = 0;
    for (const file of files) {
      const name = encoder.encode(file.name);
      const data = file.bytes instanceof Uint8Array ? file.bytes : encoder.encode(file.content || "");
      const crc = crc32(data);
      const local = join([u32(0x04034b50), u16(20), u16(0x0800), u16(0), u16(dosTime), u16(dosDate), u32(crc), u32(data.length), u32(data.length), u16(name.length), u16(0), name, data]);
      const central = join([u32(0x02014b50), u16(20), u16(20), u16(0x0800), u16(0), u16(dosTime), u16(dosDate), u32(crc), u32(data.length), u32(data.length), u16(name.length), u16(0), u16(0), u16(0), u16(0), u32(0), u32(offset), name]);
      localParts.push(local);
      centralParts.push(central);
      offset += local.length;
    }
    const central = join(centralParts);
    const end = join([u32(0x06054b50), u16(0), u16(0), u16(files.length), u16(files.length), u32(central.length), u32(offset), u16(0)]);
    return new Blob([...localParts, central, end], { type: "application/zip" });
  }
  function safeFilename(value) {
    return String(value).normalize("NFKD").replace(/[^\w.-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 70) || "pagelens";
  }
  function downloadText(value, filename, type) {
    const blob = new Blob([value], { type: `${type};charset=utf-8` });
    downloadBlob(blob, filename);
  }
  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.style.display = "none";
    document.documentElement.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }
  async function copy(value) {
    try { await navigator.clipboard.writeText(value); }
    catch (_) {
      const box = document.createElement("textarea"); box.value = value; box.style.cssText = "position:fixed;left:-9999px;top:0";
      shadow.appendChild(box); box.select(); document.execCommand("copy"); box.remove();
    }
    notify("Copied to clipboard.");
  }
  function colorList(colors) {
    return colors.length ? colors.map((item) => `<button class="swatch" data-action="copy-color" data-color="${esc(item.color)}"><span class="chip" style="background:${esc(item.color)}"></span><span class="grow">${esc(item.color)}</span><span class="muted">${item.count}</span></button>`).join("") : `<div class="hint">No page colors were found.</div>`;
  }
  function fontList(fonts) {
    return fonts.length ? fonts.slice(0, 30).map((item) => `<div class="asset">${kv(item.fontSize, `${item.fontFamily} · ${item.fontWeight}`)}<div class="muted">${esc(item.sample)}</div></div>`).join("") : `<div class="hint">No text styles were found.</div>`;
  }
  function assetsList(items) {
    return items.map((item) => `<div class="asset row"><input type="checkbox" data-asset-select data-index="${item.index}" aria-label="Select ${esc(item.type)} asset" ${state.selectedAssets.has(item.url) ? "checked" : ""}>${item.preview ? `<img src="${esc(item.preview)}" alt="">` : item.type === "Video" ? `<video src="${esc(item.url)}" muted preload="metadata" style="width:54px;height:36px;object-fit:cover;border-radius:4px"></video>` : `<span class="chip">${esc(item.type.slice(0,1))}</span>`}<div class="grow"><b>${esc(item.type)}</b><div class="muted">${esc(item.alt || item.url).slice(0, 96)}</div></div><button data-action="copy-asset-url" data-index="${item.index}">Copy URL</button><button data-action="download-asset" data-index="${item.index}">Save</button></div>`).join("") || `<div class="hint">No assets match these filters.</div>`;
  }
  async function downloadAssetsZip(items) {
    if (!items.length) { setStatus("No matching assets to download."); return; }
    const files = [], index = [], maxTotal = 8_000_000;
    let total = 0, skipped = 0;
    setStatus(`Preparing ${Math.min(items.length, 40)} assets for download…`);
    for (const [i, item] of items.slice(0, 40).entries()) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 6500);
      try {
        const response = await fetch(item.url, { mode: "cors", credentials: "omit", signal: controller.signal });
        if (!response.ok) throw new Error("unavailable");
        const mime = (response.headers.get("content-type") || "application/octet-stream").split(";")[0].toLowerCase();
        if (!/^(image\/|video\/|audio\/|font\/|application\/(?:font|vnd\.ms-fontobject|octet-stream))/.test(mime)) throw new Error("unsupported type");
        const contentLength = Number(response.headers.get("content-length") || 0);
        if (contentLength > 1_500_000 || total + contentLength > maxTotal) throw new Error("size limit");
        const reader = response.body?.getReader(), chunks = [];
        let byteLength = 0;
        if (reader) {
          while (true) {
            const part = await reader.read();
            if (part.done) break;
            byteLength += part.value.length;
            if (byteLength > 1_500_000 || total + byteLength > maxTotal) { await reader.cancel(); throw new Error("size limit"); }
            chunks.push(part.value);
          }
        } else { const chunk = new Uint8Array(await response.arrayBuffer()); byteLength = chunk.length; chunks.push(chunk); }
        if (!byteLength || byteLength > 1_500_000 || total + byteLength > maxTotal) throw new Error("size limit");
        const bytes = new Uint8Array(byteLength); let offset = 0;
        for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
        const original = (() => { try { return decodeURIComponent(new URL(item.url).pathname.split("/").pop() || "asset"); } catch (_) { return "asset"; } })();
        const ext = original.match(/\.[a-z0-9]{1,8}$/i)?.[0] || ({ "image/jpeg": ".jpg", "image/svg+xml": ".svg", "image/png": ".png", "image/webp": ".webp", "image/gif": ".gif", "image/avif": ".avif", "video/mp4": ".mp4", "video/webm": ".webm", "font/woff2": ".woff2" })[mime] || ".bin";
        const name = `assets/${String(i + 1).padStart(2, "0")}-${safeFilename(original.replace(/\.[^.]*$/, "") || item.type)}${ext}`;
        files.push({ name, bytes }); total += bytes.length;
        index.push({ type: item.type, alt: item.alt, source: item.url, file: name, bytes: bytes.length });
      } catch (_) { skipped++; }
      finally { clearTimeout(timer); }
    }
    if (!files.length) { setStatus("No files could be fetched. Some sites block downloads from other websites."); return; }
    files.unshift({ name: "assets.json", content: JSON.stringify(index, null, 2) });
    files.unshift({ name: "README.md", content: `# PageLens assets\n\nAssets saved from ${location.href}\n\n${index.length} file(s) included. ${skipped} could not be fetched because the source host may block cross-site access.\n` });
    downloadBlob(makeZip(files), `${safeFilename(document.title || "page")}-assets.zip`);
    setStatus(`${index.length} assets added to ZIP${skipped ? ` · ${skipped} skipped by source limits` : ""}.`);
  }
  function copyCanvas(source) {
    const canvas = document.createElement("canvas");
    canvas.width = source.width; canvas.height = source.height;
    canvas.getContext("2d").drawImage(source, 0, 0);
    return canvas;
  }
  function canvasFromDataUrl(dataUrl) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => { const canvas = document.createElement("canvas"); canvas.width = image.naturalWidth; canvas.height = image.naturalHeight; canvas.getContext("2d").drawImage(image, 0, 0); resolve(canvas); };
      image.onerror = () => reject(new Error("The screenshot image could not be opened."));
      image.src = dataUrl;
    });
  }
  function captureFrame() {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ type: "pagelens:capture-frame" }, (response) => {
        if (chrome.runtime.lastError) return reject(new Error(chrome.runtime.lastError.message));
        if (!response?.ok || !response.dataUrl) return reject(new Error(response?.error || "Screenshot capture failed."));
        resolve(response.dataUrl);
      });
    });
  }
  async function captureScreenshot(mode) {
    if (mode === "element" && !state.selected?.isConnected) {
      state.pickPurpose = "screenshot-element";
      activatePick();
      setStatus("Click the page element to capture it.");
      return;
    }
    const oldX = scrollX, oldY = scrollY;
    const target = mode === "element" ? state.selected : null;
    state.captureDelay = Number(main.querySelector("#capture-delay")?.value || 300);
    state.captureLazy = main.querySelector("#capture-lazy")?.checked !== false;
    state.captureCancel = false;
    state.capturing = true;
    render();
    let captureMessage = "", captureSuccess = false;
    try {
      setStatus(mode === "full" ? "Capturing and stitching page frames…" : "Capturing page…");
      if (target) target.scrollIntoView({ block: "center", inline: "center", behavior: "instant" });
      let canvas;
      if (mode === "full") {
        const viewportHeight = Math.max(1, innerHeight);
        const pageHeight = Math.min(Math.max(document.documentElement.scrollHeight, document.body.scrollHeight), Math.floor(40000 / Math.max(1, devicePixelRatio)), viewportHeight * 40);
        const yPositions = [];
        for (let y = 0; y < pageHeight; y += viewportHeight) yPositions.push(y);
        for (let index = 0; index < yPositions.length; index++) {
          if (state.captureCancel) throw new Error("Capture cancelled.");
          const y = yPositions[index];
          window.scrollTo(0, y);
          setStatus(`Capturing screen ${index + 1} of ${yPositions.length}…`);
          await new Promise((resolve) => setTimeout(resolve, state.captureLazy ? state.captureDelay : 60));
          if (state.captureCancel) throw new Error("Capture cancelled.");
          host.dataset.pagelensCapturing = "true";
          await new Promise((resolve) => setTimeout(resolve, 80));
          let frame;
          try { frame = await canvasFromDataUrl(await captureFrame()); }
          finally { delete host.dataset.pagelensCapturing; }
          const scale = frame.height / viewportHeight;
          if (!canvas) { canvas = document.createElement("canvas"); canvas.width = frame.width; canvas.height = Math.max(1, Math.ceil(pageHeight * scale)); }
          const cropHeight = Math.min(frame.height, Math.ceil((pageHeight - y) * scale));
          canvas.getContext("2d").drawImage(frame, 0, 0, frame.width, cropHeight, 0, Math.round(y * scale), frame.width, cropHeight);
        }
      } else {
        await new Promise((resolve) => setTimeout(resolve, 110));
        host.dataset.pagelensCapturing = "true";
        await new Promise((resolve) => setTimeout(resolve, 80));
        let frame;
        try { frame = await canvasFromDataUrl(await captureFrame()); }
        finally { delete host.dataset.pagelensCapturing; }
        if (target) {
          const rect = target.getBoundingClientRect();
          const scaleX = frame.width / innerWidth, scaleY = frame.height / innerHeight;
          const x = Math.max(0, Math.floor(rect.left * scaleX)), y = Math.max(0, Math.floor(rect.top * scaleY));
          const width = Math.min(frame.width - x, Math.ceil(rect.width * scaleX)), height = Math.min(frame.height - y, Math.ceil(rect.height * scaleY));
          if (width < 1 || height < 1) throw new Error("The selected element is outside the screenshot area.");
          canvas = document.createElement("canvas"); canvas.width = width; canvas.height = height;
          canvas.getContext("2d").drawImage(frame, x, y, width, height, 0, 0, width, height);
        } else canvas = frame;
      }
      state.screenshotCanvas = canvas;
      state.originalScreenshot = copyCanvas(canvas);
      state.editorHistory = [];
      state.editorRedo = [];
      state.editorMode = mode === "area" ? "crop" : "view";
      state.tool = "screenshot";
      state.capturing = false;
      render();
      captureSuccess = true;
      setStatus(`${mode === "full" ? "Full page" : mode === "element" ? "Element" : mode === "area" ? "Area" : "Visible area"} captured · ${canvas.width} × ${canvas.height} px.`);
    } catch (error) {
      captureMessage = error.message || "Screenshot failed. Try a normal website tab.";
    } finally {
      state.capturing = false;
      delete host.dataset.pagelensCapturing;
      window.scrollTo(oldX, oldY);
      if (state.tool === "screenshot" && !captureSuccess) { render(); setStatus(captureMessage); }
    }
  }
  function saveEditorUndo(snapshot = copyCanvas(state.screenshotCanvas)) {
    if (!snapshot) return;
    state.editorHistory.push(snapshot);
    if (state.editorHistory.length > 4) state.editorHistory.shift();
    state.editorRedo = [];
  }
  function undoEditor() {
    if (!state.editorHistory.length) { notify("No screenshot edits to undo."); return; }
    state.editorRedo.push(copyCanvas(state.screenshotCanvas));
    state.screenshotCanvas = state.editorHistory.pop();
    state.editorMode = "view"; render();
  }
  function redoEditor() {
    if (!state.editorRedo.length) { notify("No screenshot edits to redo."); return; }
    state.editorHistory.push(copyCanvas(state.screenshotCanvas));
    state.screenshotCanvas = state.editorRedo.pop();
    state.editorMode = "view"; render();
  }
  function addBrowserFrame() {
    const source = state.screenshotCanvas;
    if (!source) return;
    saveEditorUndo();
    const margin = Math.max(22, Math.round(source.width * 0.025)), top = Math.max(48, Math.round(source.width * 0.055));
    const framed = document.createElement("canvas"); framed.width = source.width + margin * 2; framed.height = source.height + margin + top;
    const ctx = framed.getContext("2d"), bg = main.querySelector("#frame-background")?.value || "#f1f1f4";
    ctx.fillStyle = bg; ctx.fillRect(0, 0, framed.width, framed.height);
    ctx.fillStyle = "#20212a"; ctx.fillRect(margin, margin, source.width, top);
    ["#ff6159", "#ffbd2e", "#28c840"].forEach((color, index) => { ctx.beginPath(); ctx.fillStyle = color; ctx.arc(margin + 15 + index * 20, margin + top / 2, 5, 0, Math.PI * 2); ctx.fill(); });
    ctx.fillStyle = "#c9c9d3"; ctx.font = `${Math.max(12, source.width / 110)}px system-ui, sans-serif`; ctx.textBaseline = "middle";
    ctx.fillText(location.hostname, margin + 82, margin + top / 2, Math.max(80, source.width - 100));
    ctx.drawImage(source, margin, margin + top);
    state.screenshotCanvas = framed; state.editorMode = "view"; render();
  }
  function addScreenshotBackground() {
    const source = state.screenshotCanvas;
    if (!source) return;
    saveEditorUndo();
    const padding = Math.max(24, Math.round(source.width * 0.04));
    const canvas = document.createElement("canvas"); canvas.width = source.width + padding * 2; canvas.height = source.height + padding * 2;
    const ctx = canvas.getContext("2d"); ctx.fillStyle = main.querySelector("#frame-background")?.value || "#f1f1f4"; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.drawImage(source, padding, padding);
    state.screenshotCanvas = canvas; state.editorMode = "view"; render();
  }
  function exportEditorImage(type) {
    const canvas = state.screenshotCanvas;
    if (!canvas) return;
    const ext = type === "image/jpeg" ? "jpg" : type === "image/webp" ? "webp" : "png";
    canvas.toBlob((blob) => {
      if (blob) downloadBlob(blob, `${safeFilename(document.title || "pagelens-capture")}.${ext}`);
      else notify(`${ext.toUpperCase()} export failed. Try PNG.`);
    }, type, type === "image/png" ? undefined : 0.92);
  }
  async function captureResponsiveReference(index) {
    const card = state.responsiveFrames[index], iframe = card?.querySelector("iframe");
    if (!iframe) { setStatus("Compare viewport sizes first."); return; }
    const oldX = scrollX, oldY = scrollY;
    try {
      iframe.scrollIntoView({ block: "center", inline: "center", behavior: "instant" });
      await new Promise((resolve) => setTimeout(resolve, 250));
      const rect = iframe.getBoundingClientRect();
      host.dataset.pagelensCapturing = "true";
      await new Promise((resolve) => setTimeout(resolve, 120));
      const screenshot = await canvasFromDataUrl(await captureFrame());
      const sx = screenshot.width / innerWidth, sy = screenshot.height / innerHeight;
      const left = Math.max(0, Math.floor(rect.left * sx)), top = Math.max(0, Math.floor(rect.top * sy));
      const width = Math.min(screenshot.width - left, Math.ceil(rect.width * sx)), height = Math.min(screenshot.height - top, Math.ceil(rect.height * sy));
      if (width < 1 || height < 1) throw new Error("The viewport preview is outside the visible area.");
      const output = document.createElement("canvas"); output.width = width; output.height = height;
      output.getContext("2d").drawImage(screenshot, left, top, width, height, 0, 0, width, height);
      output.toBlob((blob) => { if (blob) downloadBlob(blob, `${safeFilename(document.title || "page")}-${card.dataset.viewport || "viewport"}.png`); });
      setStatus("Responsive preview saved as a PNG reference.");
    } catch (error) { setStatus(error.message || "Could not capture this responsive preview."); }
    finally { delete host.dataset.pagelensCapturing; window.scrollTo(oldX, oldY); }
  }
  function drawArrow(ctx, from, to, color, width) {
    const angle = Math.atan2(to.y - from.y, to.x - from.x), head = Math.max(12, width * 4);
    ctx.beginPath(); ctx.moveTo(from.x, from.y); ctx.lineTo(to.x, to.y);
    ctx.lineTo(to.x - head * Math.cos(angle - Math.PI / 6), to.y - head * Math.sin(angle - Math.PI / 6));
    ctx.moveTo(to.x, to.y); ctx.lineTo(to.x - head * Math.cos(angle + Math.PI / 6), to.y - head * Math.sin(angle + Math.PI / 6));
    ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.stroke();
  }
  function editorPoint(event) {
    const rect = state.screenshotCanvas.getBoundingClientRect();
    return { x: Math.max(0, Math.min(state.screenshotCanvas.width, (event.clientX - rect.left) * state.screenshotCanvas.width / rect.width)), y: Math.max(0, Math.min(state.screenshotCanvas.height, (event.clientY - rect.top) * state.screenshotCanvas.height / rect.height)) };
  }
  function editorPointerDown(event) {
    if (state.editorMode === "view") return;
    event.preventDefault();
    const point = editorPoint(event);
    state.editorInteraction = { start: point, last: point, snapshot: copyCanvas(state.screenshotCanvas) };
    state.screenshotCanvas.setPointerCapture?.(event.pointerId);
    if (state.editorMode === "draw") {
      const ctx = state.screenshotCanvas.getContext("2d");
      ctx.beginPath(); ctx.moveTo(point.x, point.y); ctx.strokeStyle = state.annotationColor; ctx.lineWidth = Math.max(3, state.screenshotCanvas.width / 500); ctx.lineCap = "round"; ctx.lineJoin = "round";
    }
  }
  function editorPointerMove(event) {
    if (!state.editorInteraction) return;
    const point = editorPoint(event);
    if (state.editorMode === "draw") {
      const ctx = state.screenshotCanvas.getContext("2d"); ctx.lineTo(point.x, point.y); ctx.stroke(); state.editorInteraction.last = point;
    } else if (state.editorMode === "crop") {
      const canvas = state.screenshotCanvas, ctx = canvas.getContext("2d"), start = state.editorInteraction.start;
      ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.drawImage(state.editorInteraction.snapshot, 0, 0);
      ctx.save(); ctx.strokeStyle = "#bb8cff"; ctx.lineWidth = Math.max(2, canvas.width / 700); ctx.setLineDash([10, 7]); ctx.strokeRect(start.x, start.y, point.x - start.x, point.y - start.y); ctx.restore();
      state.editorInteraction.last = point;
    } else if (["arrow", "rect", "blur"].includes(state.editorMode)) {
      const canvas = state.screenshotCanvas, ctx = canvas.getContext("2d"), start = state.editorInteraction.start;
      ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.drawImage(state.editorInteraction.snapshot, 0, 0);
      const width = Math.max(3, canvas.width / 500);
      if (state.editorMode === "rect") { ctx.strokeStyle = state.annotationColor; ctx.lineWidth = width; ctx.strokeRect(start.x, start.y, point.x - start.x, point.y - start.y); }
      else if (state.editorMode === "arrow") drawArrow(ctx, start, point, state.annotationColor, width);
      else { ctx.strokeStyle = "#ffffff"; ctx.lineWidth = Math.max(2, width / 2); ctx.setLineDash([9, 6]); ctx.strokeRect(start.x, start.y, point.x - start.x, point.y - start.y); }
      state.editorInteraction.last = point;
    }
  }
  function editorPointerUp(event) {
    const interaction = state.editorInteraction;
    if (!interaction) return;
    const endPoint = editorPoint(event);
    if (state.editorMode === "crop") {
      const left = Math.max(0, Math.floor(Math.min(interaction.start.x, endPoint.x))), top = Math.max(0, Math.floor(Math.min(interaction.start.y, endPoint.y)));
      const width = Math.floor(Math.abs(endPoint.x - interaction.start.x)), height = Math.floor(Math.abs(endPoint.y - interaction.start.y));
      if (width > 8 && height > 8) {
        saveEditorUndo(interaction.snapshot);
        const cropped = document.createElement("canvas"); cropped.width = width; cropped.height = height;
        cropped.getContext("2d").drawImage(interaction.snapshot, left, top, width, height, 0, 0, width, height);
        state.screenshotCanvas = cropped; state.editorMode = "view"; render();
      } else {
        state.screenshotCanvas.getContext("2d").clearRect(0, 0, state.screenshotCanvas.width, state.screenshotCanvas.height);
        state.screenshotCanvas.getContext("2d").drawImage(interaction.snapshot, 0, 0);
      }
    } else if (state.editorMode !== "view") {
      const canvas = state.screenshotCanvas, ctx = canvas.getContext("2d"), start = interaction.start;
      const left = Math.max(0, Math.floor(Math.min(start.x, endPoint.x))), top = Math.max(0, Math.floor(Math.min(start.y, endPoint.y)));
      const width = Math.max(1, Math.floor(Math.abs(endPoint.x - start.x))), height = Math.max(1, Math.floor(Math.abs(endPoint.y - start.y)));
      saveEditorUndo(interaction.snapshot);
      if (state.editorMode !== "draw") { ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.drawImage(interaction.snapshot, 0, 0); }
      if (state.editorMode === "arrow") drawArrow(ctx, start, endPoint, state.annotationColor, Math.max(3, canvas.width / 500));
      else if (state.editorMode === "rect") { ctx.strokeStyle = state.annotationColor; ctx.lineWidth = Math.max(3, canvas.width / 500); ctx.strokeRect(start.x, start.y, endPoint.x - start.x, endPoint.y - start.y); }
      else if (state.editorMode === "text") {
        const text = (main.querySelector("#annotation-text")?.value || "Note").trim();
        ctx.fillStyle = state.annotationColor; ctx.font = `700 ${Math.max(18, canvas.width / 35)}px system-ui, sans-serif`; ctx.textBaseline = "top";
        String(text).split(/\r?\n/).slice(0, 6).forEach((line, index) => ctx.fillText(line.slice(0, 120), start.x, start.y + index * Math.max(22, canvas.width / 30), canvas.width - start.x));
      } else if (state.editorMode === "blur" && width > 3 && height > 3) {
        const patch = document.createElement("canvas"); patch.width = width; patch.height = height;
        patch.getContext("2d").drawImage(interaction.snapshot, left, top, width, height, 0, 0, width, height);
        ctx.save(); ctx.filter = `blur(${Math.max(8, canvas.width / 150)}px)`; ctx.drawImage(patch, left, top, width, height); ctx.restore();
      } else if (state.editorMode === "draw") {
        ctx.beginPath(); ctx.lineTo(endPoint.x, endPoint.y); ctx.stroke();
      }
      render();
    }
    state.editorInteraction = null;
  }
  async function exportEditorPdf() {
    const canvas = state.screenshotCanvas;
    const data = atob(canvas.toDataURL("image/jpeg", 0.94).split(",")[1]);
    const jpeg = Uint8Array.from(data, (ch) => ch.charCodeAt(0));
    const pageW = 612, pageH = 792, scale = Math.min(pageW / canvas.width, pageH / canvas.height);
    const drawW = canvas.width * scale, drawH = canvas.height * scale, left = (pageW - drawW) / 2, bottom = (pageH - drawH) / 2;
    const encoder = new TextEncoder();
    const stream = encoder.encode(`q\n${drawW.toFixed(3)} 0 0 ${drawH.toFixed(3)} ${left.toFixed(3)} ${bottom.toFixed(3)} cm\n/Im0 Do\nQ\n`);
    const objects = [
      encoder.encode("<< /Type /Catalog /Pages 2 0 R >>"),
      encoder.encode("<< /Type /Pages /Kids [3 0 R] /Count 1 >>"),
      encoder.encode(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageW} ${pageH}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>`),
      [encoder.encode(`<< /Type /XObject /Subtype /Image /Width ${canvas.width} /Height ${canvas.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`), jpeg, encoder.encode("\nendstream")],
      [encoder.encode(`<< /Length ${stream.length} >>\nstream\n`), stream, encoder.encode("endstream")]
    ];
    const pieces = [encoder.encode("%PDF-1.4\n")], offsets = [0]; let byteLength = pieces[0].length;
    objects.forEach((obj, index) => {
      offsets.push(byteLength); const prefix = encoder.encode(`${index + 1} 0 obj\n`), suffix = encoder.encode("\nendobj\n");
      pieces.push(prefix); byteLength += prefix.length;
      const parts = Array.isArray(obj) ? obj : [obj]; for (const part of parts) { pieces.push(part); byteLength += part.length; }
      pieces.push(suffix); byteLength += suffix.length;
    });
    const xrefOffset = byteLength;
    const xref = `xref\n0 ${offsets.length}\n0000000000 65535 f \n${offsets.slice(1).map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`).join("")}trailer\n<< /Size ${offsets.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
    pieces.push(encoder.encode(xref));
    downloadBlob(new Blob(pieces, { type: "application/pdf" }), `${safeFilename(document.title || "pagelens-capture")}.pdf`);
  }
  function render() {
    navMarkup();
    panel.classList.toggle("expanded", Boolean(state.tool));
    if (!state.tool) { main.innerHTML = ""; return; }
    const info = currentInfo();
    const selected = info ? selectedCard() : "";
    const responsiveOptions = [...new Set([280, 320, 344, 360, 375, 430, 673, 768, 1024, 1280, 1440, 1920, ...state.preferences.responsiveWidths])].sort((a, b) => a - b);
    const designDetails = state.tool === "design-md" ? pageDetails() : { colors: [], fonts: [], spacing: [] };
    const promptText = state.tool === "prompt" ? designPrompt() : "";
    const cloneCodeText = state.cloneCodeTab === "css" ? state.clonePreviewCss : state.cloneCodeHtml;
    const cloneCodeLimit = 120000;
    const cloneCodeExcerpt = cloneCodeText.slice(0, cloneCodeLimit);
    const cloneCodeHint = cloneCodeText.length > cloneCodeLimit ? `Showing the first ${cloneCodeLimit.toLocaleString()} characters. The ZIP contains the complete file.` : "Read-only preview of the generated ZIP file.";
    const pages = {
      home: `<div class="welcome"><h1>See the details behind a page.</h1><p>Choose a tool, then work with the page open behind this panel.</p><div class="card"><h2>Quick start</h2><div class="feature">1. Pick an element to inspect its structure and styles.</div><div class="feature">2. Collect colors, type, and assets as references.</div><div class="feature">3. Try local edits or capture the visible page.</div></div><div class="hint">PageLens reads the page currently open in this tab. Edits are temporary and disappear when you reload.</div><h2>Selected element</h2>${selected || `<div class="muted">Nothing selected yet.</div>`}</div>`,
      pick: `<h1>Pick element</h1><p>Select a component to preview its rendered appearance, then inspect or save its HTML and CSS.</p>${button("Pick on page", "pick", true)}${selected || ""}${info ? `<h2>Component preview</h2><iframe id="pick-preview-frame" title="Selected element preview" sandbox="" style="width:100%;height:220px;border:1px solid #3a3c49;border-radius:10px;background:white"></iframe><h2>HTML</h2><textarea class="code" readonly>${esc(info.el.outerHTML.slice(0, 12000))}</textarea><div class="row">${button("Copy HTML", "copy-html")}${button("Save HTML", "save-html")}${button("Copy CSS", "copy-css")}${button("Save CSS", "save-css")}</div><h2>Computed styles</h2><textarea class="code" readonly>${esc(computedFor(info.el))}</textarea>` : ""}<div class="status"></div>`,
      clone: `<h1>Clone page</h1><p>Preview the rendered page snapshot and inspect its generated HTML and CSS before saving a ZIP.</p><div class="card">${kv("Source", location.hostname)}${kv("Page title", document.title)}${kv("ZIP contents", "index.html · styles.css · assets/ · assets.json · README.md")}</div><label class="check-row"><input id="clone-include-assets" type="checkbox" checked> Include accessible images, fonts, and media in ZIP</label><div class="hint" style="margin-top:10px">Cross site asset servers may block downloads. Blocked files stay linked to their original URL. Scripts and embedded frames are removed; this is a rendered snapshot, not the original source project.</div><div class="row" style="margin-top:12px">${button("Preview snapshot", "preview-clone")}${button("Download UI ZIP", "clone", true)}</div>${state.clonePreviewHtml ? `<h2>Snapshot preview</h2><iframe id="clone-preview-frame" title="Page snapshot preview" sandbox="" style="width:100%;height:360px;border:1px solid #3a3c49;border-radius:10px;background:white"></iframe><div class="row" style="margin-top:14px"><h2 style="margin:0;flex:1">Generated code</h2>${button(`Copy ${state.cloneCodeTab.toUpperCase()}`, "clone-copy-code")}</div><div class="row" role="tablist" aria-label="Generated code file">${button("HTML · index.html", "clone-code-html", state.cloneCodeTab === "html")}${button("CSS · styles.css", "clone-code-css", state.cloneCodeTab === "css")}</div><textarea class="code" id="clone-code-source" aria-label="Generated ${state.cloneCodeTab.toUpperCase()} code" readonly spellcheck="false" style="height:230px;max-height:36vh;resize:vertical">${esc(cloneCodeExcerpt)}</textarea><div class="muted" style="margin-top:5px">${cloneCodeHint}</div>` : ""}<div class="status"></div>`,
      "design-md": `<h1>Design MD</h1><p>Review a visual reference of this page, then save the colors, typography, spacing, and layout notes as Markdown.</p><div class="card">${kv("Page", document.title)}${kv("URL", location.href)}${kv("Viewport", `${innerWidth} × ${innerHeight}`)}<h2>Color palette</h2><div class="row">${colorList(designDetails.colors.slice(0, 10))}</div><h2>Typography samples</h2>${fontList(designDetails.fonts.slice(0, 6))}<h2>Spacing tokens</h2>${designDetails.spacing.slice(0, 10).map((item) => `<div class="row asset">${kv(item.value, `${item.count} uses`)}</div>`).join("") || `<div class="muted">No spacing tokens found.</div>`}</div><div class="row">${button("Download Design MD", "design-md", true)}${button("Copy Markdown", "copy-md")}</div><div class="status"></div>`,
      prompt: `<h1>Design prompt</h1><p>Turn the observed design details into an original implementation brief.</p><textarea id="prompt-text">${esc(promptText)}</textarea><div class="row">${button("Copy prompt", "copy-prompt", true)}${button("Download .txt", "download-prompt")}</div><div class="status"></div>`,
      assets: `<h1>Extract assets</h1><p>Filter page images and media, copy their URLs, or bundle files the source host allows PageLens to fetch.</p><div class="row">${button("Rescan assets", "refresh-assets")}<select id="assets-filter" aria-label="Filter asset type"><option value="all">All types</option><option value="image">Images & backgrounds</option><option value="SVG">Inline SVG</option><option value="media">Video & media</option></select><input id="asset-search" type="text" placeholder="Search name or URL" aria-label="Search assets"></div><div class="row" style="margin-top:8px">${button("Copy visible URLs", "copy-asset-urls")}${button("Download selected ZIP", "download-assets-zip", true)}${button("Download visible ZIP", "download-visible-assets")}</div><div class="muted" style="margin:6px 0">${state.selectedAssets.size} selected</div><div id="assets-list" class="stack">${assetsList(filteredAssets())}</div><div class="status"></div>`,
      colors: `<h1>Extract colors</h1><p>Frequent text, surface, and border colors. Select a swatch to copy it.</p><div class="row">${button("Copy CSS variables", "copy-palette", true)}${button("Export JSON", "export-palette")}</div><div class="card" id="color-list">${colorList(scanColors())}</div><div class="status"></div>`,
      fonts: `<h1>Detect fonts</h1><p>Hover over page text to inspect its family, size, weight, and line height.</p>${button(state.fontInspecting ? "Stop font inspection" : "Start hover inspection", "font-hover", true)}${selected || ""}<h2>Detected text styles</h2><div class="card">${fontList(scanFonts())}</div><div class="status"></div>`,
      "swap-fonts": `<h1>Swap fonts</h1><p>Search the Google Fonts family list or type a family name. Choose which page text to update.</p><div class="card">${kv("Current page fonts", [...new Set(scanFonts().map((f) => f.fontFamily))].slice(0, 5).join(" · ") || "None found")}</div><label class="muted" for="font-choice">Preview font family</label><input id="font-choice" type="text" list="font-options" value="Inter" placeholder="Search fonts, e.g. Space Grotesk"><datalist id="font-options">${[...new Set([...fontChoices, ...(state.fontCatalog || [])])].map((name) => `<option value="${esc(name)}"></option>`).join("")}</datalist><div class="muted" style="margin:5px 0 10px">${state.fontCatalogLoading ? "Loading the full Google Fonts family list…" : state.fontCatalog?.length ? `${state.fontCatalog.length.toLocaleString()} families available` : "Popular families are listed; you can also type a family name."}</div><label class="muted" for="font-scope" style="display:block;margin-top:10px">Apply to</label><select id="font-scope"><option value="all">Whole page</option><option value="headings">Headings</option><option value="body">Body text</option><option value="selected">Selected element</option></select><div class="row" style="margin-top:9px">${button("Apply preview", "apply-font", true)}${button("Reset font", "reset-font")}</div><div class="hint" style="margin-top:10px">The font preview is temporary. Applying a Google font sends the selected family name to Google Fonts.</div><div class="status"></div>`,
      inspect: `<h1>Inspect & measure</h1><p>Pick an element to read its box size, spacing, and computed styles.</p>${button("Pick element", "pick", true)}${selected || ""}${info ? `<div class="card">${kv("Position", `${Math.round(info.rect.left)}, ${Math.round(info.rect.top)} px`)}${kv("Margin", info.style.margin)}${kv("Padding", info.style.padding)}${kv("Border", info.style.border)}${kv("Display", info.style.display)}${kv("Positioning", info.style.position)}</div>` : ""}<h2>Measure distance</h2><p>Click two points in the page to calculate the straight-line distance.</p>${button("Start measuring", "measure")}${state.firstPoint ? `<div class="hint" style="margin-top:8px">First point: ${Math.round(state.firstPoint.x)}, ${Math.round(state.firstPoint.y)} px</div>` : ""}<div class="status"></div>`,
      "edit-text": `<h1>Edit text</h1><p>Select a text element and try a copy change in place.</p>${button("Pick text", "pick", true)}${selected || ""}${info ? `<h2>Preview copy</h2><textarea id="edit-value">${esc(info.el.innerText || "")}</textarea><div class="row">${button("Apply to page", "apply-text", true)}${button("Undo edit", "undo")}</div>` : ""}<div class="hint" style="margin-top:12px">This edits the current rendered page only. Reload the tab to restore the original text.</div><div class="status"></div>`,
      screenshot: `<h1>Screenshot</h1><p>Capture the visible area or stitch a long page, then crop, annotate, and export the result.</p><div class="card">${kv("Viewport", `${innerWidth} × ${innerHeight} px`)}${kv("Page", location.hostname)}</div>${state.capturing ? `<div class="row">${button("Cancel capture", "cancel-capture", false, "danger")}</div>` : `<div class="row">${button("Capture visible", "capture-visible", state.preferences.captureMode === "visible")}${button("Capture full page", "capture-full", state.preferences.captureMode === "full")}${button("Capture area", "capture-area")}${button("Capture element", "capture-element")}</div><div class="row" style="margin-top:8px"><label class="check-row"><input id="capture-lazy" type="checkbox" checked> Wait for lazy content while scrolling</label><label class="muted">Scroll wait <select id="capture-delay"><option value="110">Quick</option><option value="300" selected>Balanced</option><option value="650">Careful</option></select></label></div>`}${state.screenshotCanvas ? `<div class="editor-tools">${button("Crop", "editor-crop", state.editorMode === "crop")}${button("Draw", "editor-draw", state.editorMode === "draw")}${button("Arrow", "editor-arrow", state.editorMode === "arrow")}${button("Rectangle", "editor-rect", state.editorMode === "rect")}${button("Text", "editor-text", state.editorMode === "text")}${button("Blur", "editor-blur", state.editorMode === "blur")}${button("View", "editor-view", state.editorMode === "view")}${button("Undo", "editor-undo")}${button("Redo", "editor-redo")}${button("Reset", "editor-reset")}</div><div class="row"><label class="muted">Annotation color <input id="annotation-color" type="color" value="${esc(state.annotationColor)}" style="width:48px;height:38px;padding:3px"></label><label class="grow muted">Text note <input id="annotation-text" type="text" value="${esc(state.annotationText)}" maxlength="120"></label>${button("Add browser frame", "editor-frame")}${button("Add background", "editor-background")}</div><div class="row" style="margin-top:8px">${button("PNG", "editor-png", true)}${button("JPG", "editor-jpg")}${button("WebP", "editor-webp")}${button("PDF", "editor-pdf")}<span class="muted">Frame color <input id="frame-background" type="color" value="#f1f1f4" style="width:48px;height:34px;padding:3px;vertical-align:middle"></span></div><div id="editor-stage" class="editor-stage"></div><div class="muted" style="margin-top:7px">Drag on the image to crop, draw, add shapes, blur an area, or place a note.</div>` : `<div class="hint" style="margin-top:10px">Full page capture can stitch up to 40 screens. Sticky elements may repeat, and some browser pages cannot be captured.</div>`}<div class="status"></div>`,
      responsive: `<h1>Responsive viewer</h1><p>Compare phone, foldable, tablet, laptop, and desktop viewport widths side by side.</p><div class="row">${responsiveOptions.map((width) => `<label class="check-row"><input type="checkbox" data-responsive-width value="${width}" ${state.preferences.responsiveWidths.includes(width) ? "checked" : ""}>${[344, 673].includes(width) ? "Foldable · " : width === 280 ? "Small · " : ""}${width}px</label>`).join("")}</div><div class="row" style="margin-top:9px"><input id="custom-width" type="number" min="280" max="2560" step="1" placeholder="Custom width (280–2560 px)" aria-label="Custom viewport width">${button("Add width", "add-responsive-width")}</div><div class="row" style="margin-top:9px"><label class="grow muted">Preview scale <input id="responsive-scale" type="range" min="20" max="100" value="35"></label><span class="muted">35%</span></div><div class="row" style="margin-top:9px">${button("Compare selected sizes", "compare-responsive", true)}${button("Use saved sizes", "use-responsive-sizes")}</div><div id="responsive-grid" class="compare-wrap" style="margin-top:10px">${state.responsiveFrames.length ? "" : `<div class="muted">Select viewport sizes and compare them.</div>`}</div><div class="hint" style="margin-top:10px">A site may block previews in frames. PageLens uses normal browser rendering and does not bypass frame restrictions.</div><div class="status"></div>`,
      settings: `<h1>Workspace settings</h1><p>Choose where PageLens sits, set capture defaults, and arrange the toolbar.</p><div class="card"><label class="muted" for="dock-choice">Toolbar position</label><select id="dock-choice"><option value="bottom" ${state.preferences.dock === "bottom" ? "selected" : ""}>Bottom dock</option><option value="sidebar" ${state.preferences.dock === "sidebar" ? "selected" : ""}>Right sidebar</option></select><label class="muted" for="capture-default" style="display:block;margin-top:10px">Default screenshot mode</label><select id="capture-default"><option value="visible" ${state.preferences.captureMode === "visible" ? "selected" : ""}>Visible area</option><option value="full" ${state.preferences.captureMode === "full" ? "selected" : ""}>Full page</option></select><h2>Toolbar order</h2><div class="stack">${state.preferences.toolOrder.map((id, index) => { const item = tools.find((tool) => tool[0] === id); return `<div class="row card" style="margin:0;padding:8px 10px"><span class="grow">${esc(item?.[1] || id)}</span><button data-action="move-tool" data-index="${index}" data-direction="up" ${index === 0 ? "disabled" : ""} aria-label="Move up">↑</button><button data-action="move-tool" data-index="${index}" data-direction="down" ${index === state.preferences.toolOrder.length - 1 ? "disabled" : ""} aria-label="Move down">↓</button></div>`; }).join("")}</div><div class="status">Settings save automatically on this browser.</div></div>`,
      layout: `<h1>Move & delete</h1><p>Select an element, then move it before or after a sibling or remove it.</p>${button("Pick element", "pick", true)}${selected || ""}${info ? `<div class="stack" style="margin-top:9px">${button("Move earlier", "move-up")}${button("Move later", "move-down")}${button("Remove element", "remove", false, "danger")}</div>` : ""}<div class="hint" style="margin-top:12px">Changes affect this tab only. Use Undo below or reload the page to restore its original layout.</div><div class="status"></div>`
    };
    main.innerHTML = pages[state.tool] || "";
    if (state.tool === "clone" && state.clonePreviewHtml) {
      const frame = main.querySelector("#clone-preview-frame");
      if (frame) frame.srcdoc = state.clonePreviewHtml;
    }
    if (state.tool === "pick" && info) {
      const frame = main.querySelector("#pick-preview-frame");
      if (frame) frame.srcdoc = elementPreviewHTML(info.el);
    }
    if (state.tool === "responsive" && state.responsiveFrames.length) {
      const grid = main.querySelector("#responsive-grid");
      if (grid) {
        grid.replaceChildren(...state.responsiveFrames);
        grid.addEventListener("dragover", (event) => event.preventDefault());
        grid.addEventListener("drop", (event) => {
          event.preventDefault();
          const source = state.dragFrame, target = event.target.closest(".device-card");
          if (!source || !target || source === target) return;
          const rect = target.getBoundingClientRect();
          if (event.clientY < rect.top + rect.height / 2) target.before(source); else target.after(source);
          state.responsiveFrames = [...grid.children]; state.dragFrame = null;
        });
        grid.querySelectorAll(".device-card").forEach((card) => card.addEventListener("dragstart", () => { state.dragFrame = card; }));
      }
    }
    if (state.tool === "screenshot" && state.screenshotCanvas) {
      const stage = main.querySelector("#editor-stage");
      if (stage) {
        stage.appendChild(state.screenshotCanvas);
        state.screenshotCanvas.style.width = `${Math.min(state.screenshotCanvas.width, Math.max(220, main.clientWidth - 52))}px`;
        if (!state.screenshotCanvas.dataset.bound) {
          state.screenshotCanvas.dataset.bound = "true";
          state.screenshotCanvas.addEventListener("pointerdown", editorPointerDown);
          state.screenshotCanvas.addEventListener("pointermove", editorPointerMove);
          state.screenshotCanvas.addEventListener("pointerup", editorPointerUp);
          state.screenshotCanvas.addEventListener("pointercancel", editorPointerUp);
        }
      }
    }
    if (state.tool === "swap-fonts") loadFontCatalog();
  }

  nav.addEventListener("click", (event) => {
    const button = event.target.closest("[data-tool]");
    if (!button) return;
    state.fontInspecting = false;
    highlight.removeAttribute("data-font-tip");
    state.tool = state.tool === button.dataset.tool ? null : button.dataset.tool;
    render();
  });
  shadow.addEventListener("change", (event) => {
    const target = event.target;
    if (target.id === "dock-choice") state.preferences.dock = target.value;
    if (target.id === "capture-default") state.preferences.captureMode = target.value;
    if (target.id === "annotation-color") state.annotationColor = target.value;
    if (target.id === "annotation-text") state.annotationText = target.value;
    if (target.matches("[data-responsive-width]")) {
      const checked = [...main.querySelectorAll("[data-responsive-width]:checked")].map((input) => Number(input.value));
      state.preferences.responsiveWidths = checked;
    }
    if (target.matches("[data-asset-select]")) {
      const asset = (state.assets || [])[Number(target.dataset.index)];
      if (asset) { if (target.checked) state.selectedAssets.add(asset.url); else state.selectedAssets.delete(asset.url); }
      const summary = main.querySelector(".muted[style*=margin]");
      if (summary) summary.textContent = `${state.selectedAssets.size} selected`;
    }
    savePreferences();
    if (target.id === "assets-filter") main.querySelector("#assets-list").innerHTML = assetsList(filteredAssets());
    if (target.id === "dock-choice" || target.id === "capture-default") render();
  });
  shadow.addEventListener("input", (event) => {
    const target = event.target;
    if (target.id === "asset-search") { main.querySelector("#assets-list").innerHTML = assetsList(filteredAssets()); return; }
    if (target.id === "annotation-color") state.annotationColor = target.value;
    if (target.id === "annotation-text") state.annotationText = target.value;
    if (target.id === "responsive-scale") { const label = target.parentElement?.nextElementSibling; if (label) label.textContent = `${target.value}%`; }
  });
  shadow.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-action]");
    if (!button) return;
    const action = button.dataset.action;
    if (action === "close") { state.tool = null; state.fontInspecting = false; highlight.removeAttribute("data-font-tip"); finishPick(); render(); return; }
    if (action === "settings") { state.tool = "settings"; render(); return; }
    if (action === "move-tool") {
      const from = Number(button.dataset.index), to = from + (button.dataset.direction === "up" ? -1 : 1);
      if (to >= 0 && to < state.preferences.toolOrder.length) {
        const order = [...state.preferences.toolOrder]; [order[from], order[to]] = [order[to], order[from]]; state.preferences.toolOrder = order; savePreferences(); render();
      }
      return;
    }
    if (action === "undo") return undo();
    if (action === "font-hover") { state.fontInspecting = !state.fontInspecting; if (!state.fontInspecting) { highlight.style.display = "none"; highlight.removeAttribute("data-font-tip"); } render(); if (state.fontInspecting) notify("Hover over text on the page to inspect its typography."); return; }
    if (action === "pick") return activatePick();
    if (action === "measure") return activatePick(true);
    if (action === "preview-clone") { setStatus("Preparing a safe snapshot preview…"); await makeStaticClone(false, true); return; }
    if (action === "clone-code-html" || action === "clone-code-css") { state.cloneCodeTab = action === "clone-code-css" ? "css" : "html"; render(); return; }
    if (action === "clone-copy-code") return copy(state.cloneCodeTab === "css" ? state.clonePreviewCss : state.cloneCodeHtml);
    if (action === "clone") { setStatus("Building the page snapshot ZIP…"); await makeStaticClone(main.querySelector("#clone-include-assets")?.checked !== false); notify("Page UI ZIP downloaded."); return; }
    if (action === "design-md") { downloadText(detailsMarkdown(), `${safeFilename(document.title)}-design.md`, "text/markdown"); notify("Design MD downloaded."); return; }
    if (action === "copy-md") return copy(detailsMarkdown());
    if (action === "copy-prompt") return copy(main.querySelector("#prompt-text")?.value || designPrompt());
    if (action === "download-prompt") { downloadText(main.querySelector("#prompt-text")?.value || designPrompt(), `${safeFilename(document.title)}-design-prompt.txt`, "text/plain"); notify("Prompt downloaded."); return; }
    if (action === "copy-html" && state.selected) return copy(state.selected.outerHTML);
    if (action === "copy-css" && state.selected) return copy(computedFor(state.selected));
    if (action === "save-html" && state.selected) { downloadText(state.selected.outerHTML, `${safeFilename(selectorFor(state.selected))}.html`, "text/html"); notify("HTML snippet saved."); return; }
    if (action === "save-css" && state.selected) { downloadText(computedFor(state.selected), `${safeFilename(selectorFor(state.selected))}.css`, "text/css"); notify("CSS snippet saved."); return; }
    if (action === "copy-color") return copy(button.dataset.color);
    if (action === "copy-palette") return copy(`:root {\n${scanColors().slice(0, 30).map((c, i) => `  --page-color-${i + 1}: ${c.color};`).join("\n")}\n}`);
    if (action === "export-palette") { downloadText(JSON.stringify(scanColors(), null, 2), `${safeFilename(document.title)}-colors.json`, "application/json"); notify("Palette exported."); return; }
    if (action === "refresh-assets") { state.assets = scanAssets(); state.selectedAssets.clear(); main.querySelector("#assets-list").innerHTML = assetsList(filteredAssets()); notify(`${state.assets.length} assets found.`); return; }
    if (action === "copy-asset-urls") { const urls = filteredAssets().map((asset) => asset.url); if (urls.length) return copy(urls.join("\n")); setStatus("No matching asset URLs to copy."); return; }
    if (action === "download-assets-zip") { const selected = (state.assets || []).filter((asset) => state.selectedAssets.has(asset.url)); await downloadAssetsZip(selected); return; }
    if (action === "download-visible-assets") { await downloadAssetsZip(filteredAssets()); return; }
    if (action === "copy-asset-url") { const asset = (state.assets || [])[Number(button.dataset.index)]; if (asset) return copy(asset.url); return; }
    if (action === "download-asset") {
      const asset = (state.assets || scanAssets())[Number(button.dataset.index)];
      if (!asset) return;
      if (asset.url.startsWith("data:")) { const a = document.createElement("a"); a.href = asset.url; a.download = `pagelens-asset-${button.dataset.index}.svg`; a.click(); }
      else chrome.runtime.sendMessage({ type: "pagelens:download-url", url: asset.url, filename: `pagelens-${safeFilename(asset.alt || "asset")}` }, (response) => notify(response?.ok ? "Download started." : "Could not download this asset."));
      return;
    }
    if (action === "apply-font") {
      const family = (main.querySelector("#font-choice")?.value || "Arial").trim();
      if (!/^[a-zA-Z0-9 \u00C0-\u024f'-]{1,80}$/.test(family)) { setStatus("Enter a font family name using letters, numbers, spaces, or hyphens."); return; }
      const scope = main.querySelector("#font-scope")?.value || "all";
      if (scope === "selected" && !state.selected?.isConnected) { setStatus("Pick an element first, or choose another scope."); return; }
      if (!state.fontStyle) { state.fontStyle = document.createElement("style"); state.fontStyle.id = "pagelens-font-preview"; document.documentElement.appendChild(state.fontStyle); }
      const old = state.fontStyle.textContent;
      const priorTarget = state.fontTargetEl;
      if (priorTarget && priorTarget.isConnected) priorTarget.removeAttribute("data-pagelens-font-target");
      let selector = "body *:not(#pagelens-extension-root *):not(#pagelens-extension-root)";
      if (scope === "headings") selector = "body h1,body h2,body h3,body h4,body h5,body h6";
      if (scope === "body") selector = "body p,body li,body blockquote,body dd,body dt,body figcaption,body label";
      if (scope === "selected") { state.selected.setAttribute("data-pagelens-font-target", "selected"); state.fontTargetEl = state.selected; selector = '[data-pagelens-font-target="selected"]'; }
      else state.fontTargetEl = null;
      const fallback = /^(Arial|Georgia|Verdana|system-ui|monospace)$/i.test(family) ? "" : ", sans-serif";
      state.fontStyle.textContent = `${selector}{font-family:"${family}"${fallback} !important}`;
      if (!/^(Arial|Georgia|Verdana|system-ui|monospace)$/i.test(family)) {
        if (!state.fontLink) { state.fontLink = document.createElement("link"); state.fontLink.id = "pagelens-google-font"; state.fontLink.rel = "stylesheet"; document.head.appendChild(state.fontLink); }
        state.fontLink.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family).replaceAll("%20", "+")}:wght@400;500;600;700&display=swap`;
      }
      addUndo(() => { state.fontStyle.textContent = old; });
      notify(`Font preview applied to ${scope === "all" ? "the page" : scope}.`); return;
    }
    if (action === "reset-font") { state.fontStyle?.remove(); state.fontStyle = null; state.fontLink?.remove(); state.fontLink = null; state.fontTargetEl?.removeAttribute("data-pagelens-font-target"); state.fontTargetEl = null; notify("Font preview reset."); return; }
    if (action === "apply-text" && state.selected) {
      const editedElement = state.selected;
      const old = editedElement.innerText;
      const next = main.querySelector("#edit-value")?.value ?? old;
      editedElement.innerText = next;
      addUndo(() => { if (editedElement.isConnected) editedElement.innerText = old; });
      notify("Text preview updated."); render(); return;
    }
    if (action === "cancel-capture") { state.captureCancel = true; setStatus("Cancelling after the current frame…"); return; }
    if (action === "capture-visible") return captureScreenshot("visible");
    if (action === "capture-full") return captureScreenshot("full");
    if (action === "capture-area") return captureScreenshot("area");
    if (action === "capture-element") return captureScreenshot("element");
    if (["editor-crop", "editor-draw", "editor-arrow", "editor-rect", "editor-text", "editor-blur", "editor-view"].includes(action)) { state.editorMode = action.replace("editor-", ""); render(); return; }
    if (action === "editor-undo") return undoEditor();
    if (action === "editor-redo") return redoEditor();
    if (action === "editor-frame") { addBrowserFrame(); return; }
    if (action === "editor-background") { addScreenshotBackground(); return; }
    if (action === "editor-reset" && state.originalScreenshot) { state.screenshotCanvas = copyCanvas(state.originalScreenshot); state.editorHistory = []; state.editorRedo = []; state.editorMode = "view"; render(); return; }
    if (action === "editor-png" && state.screenshotCanvas) { exportEditorImage("image/png"); return; }
    if (action === "editor-jpg" && state.screenshotCanvas) { exportEditorImage("image/jpeg"); return; }
    if (action === "editor-webp" && state.screenshotCanvas) { exportEditorImage("image/webp"); return; }
    if (action === "editor-pdf" && state.screenshotCanvas) { await exportEditorPdf(); return; }
    if (action === "compare-responsive" || action === "use-responsive-sizes") {
      const widths = action === "use-responsive-sizes" ? state.preferences.responsiveWidths : [...main.querySelectorAll("[data-responsive-width]:checked")].map((input) => Number(input.value));
      if (!widths.length) { setStatus("Choose at least one viewport size."); return; }
      state.preferences.responsiveWidths = widths; savePreferences(); state.responsiveFrames = widths.map((width) => {
        const card = document.createElement("div"); card.className = "device-card"; card.draggable = true; card.dataset.viewport = `${width}px`;
        const requestedScale = Number(main.querySelector("#responsive-scale")?.value || 35) / 100;
        const scale = Math.min(1, requestedScale, 480 / width), height = 720;
        const device = [344, 673].includes(width) ? "Foldable" : width <= 300 ? "Small phone" : width < 500 ? "Phone" : width < 900 ? "Tablet" : width < 1300 ? "Laptop" : "Desktop";
        card.innerHTML = `<div class="device-title">${device} · ${width}px</div><div class="device-window" style="width:${Math.round(width * scale)}px;height:${Math.round(height * scale)}px"><iframe title="${width}px responsive preview" style="width:${width}px;height:${height}px;transform:scale(${scale})" src="${esc(location.href)}"></iframe></div><div class="row" style="margin-top:7px">${button("Capture reference", "capture-device", false)}<span class="muted">Drag to arrange</span></div>`;
        return card;
      });
      render(); notify("Responsive comparison loaded where the site allows framing."); return;
    }
    if (action === "capture-device") { await captureResponsiveReference(state.responsiveFrames.indexOf(button.closest(".device-card"))); return; }
    if (action === "add-responsive-width") {
      const input = main.querySelector("#custom-width"), width = Number(input?.value);
      if (!Number.isInteger(width) || width < 280 || width > 2560) { setStatus("Enter a whole number from 280 to 2560 pixels."); return; }
      state.preferences.responsiveWidths = [...new Set([...state.preferences.responsiveWidths, width])].sort((a, b) => a - b); savePreferences(); render(); notify(`${width}px added to saved viewport sizes.`); return;
    }
    if ((action === "move-up" || action === "move-down" || action === "remove") && state.selected?.isConnected) {
      const el = state.selected;
      const parent = el.parentNode;
      const next = el.nextSibling;
      const prev = el.previousSibling;
      const following = action === "move-up" ? el.previousElementSibling : el.nextElementSibling;
      if (action === "remove") {
        const marker = document.createComment("PageLens undo marker");
        parent.insertBefore(marker, el); el.remove(); state.selected = null;
        addUndo(() => { marker.parentNode?.replaceChild(el, marker); state.selected = el; });
        notify("Element removed."); render(); return;
      }
      if (!following) { notify("There is no sibling in that direction."); return; }
      const oldFollowing = following;
      if (action === "move-up") parent.insertBefore(el, following);
      else parent.insertBefore(following, el);
      addUndo(() => { if (el.isConnected) parent.insertBefore(el, next && next.parentNode === parent ? next : null); });
      notify("Element moved."); render(); return;
    }
  });

  document.addEventListener("pointermove", (event) => {
    const target = event.composedPath().find((node) => node instanceof Element && !host.contains(node));
    if (state.fontInspecting) {
      if (target && target !== document.body && target !== document.documentElement) {
        hoverElement(target);
        const style = getComputedStyle(target);
        highlight.dataset.fontTip = `${style.fontFamily} · ${style.fontSize} · ${style.fontWeight} · line height ${style.lineHeight}`;
      } else highlight.style.display = "none";
      return;
    }
    if (!state.picking) return;
    if (target) hoverElement(target);
  }, true);

  document.addEventListener("click", (event) => {
    if (!state.picking) return;
    if (event.composedPath().includes(host)) return;
    event.preventDefault(); event.stopPropagation(); event.stopImmediatePropagation();
    const target = event.composedPath().find((node) => node instanceof Element && !host.contains(node));
    if (state.measuring) {
      const point = { x: event.clientX, y: event.clientY };
      if (!state.firstPoint) { state.firstPoint = point; notify(`First point: ${Math.round(point.x)}, ${Math.round(point.y)} px`); render(); }
      else {
        const distance = Math.hypot(point.x - state.firstPoint.x, point.y - state.firstPoint.y);
        finishPick(); setStatus(`Distance: ${distance.toFixed(1)} px`); notify(`Distance: ${distance.toFixed(1)} px`); state.firstPoint = null;
      }
      return;
    }
    const purpose = state.pickPurpose;
    state.selected = target;
    state.pickPurpose = null;
    finishPick(); render();
    notify(`Selected ${selectorFor(target) || target.tagName.toLowerCase()}.`);
    if (purpose === "screenshot-element") captureScreenshot("element");
  }, true);

  chrome.runtime.onMessage.addListener((message) => {
    if (message?.type === "pagelens:hide-for-capture") host.dataset.pagelensCapturing = "true";
    if (message?.type === "pagelens:restore-after-capture") delete host.dataset.pagelensCapturing;
  });

  render();
  loadPreferences();
})();
