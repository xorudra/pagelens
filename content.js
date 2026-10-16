(() => {
  const existing = document.getElementById("pagelens-extension-root");
  if (existing) {
    existing.style.display = existing.style.display === "none" ? "block" : "none";
    return;
  }

  const tools = [
    ["pick", "Pick element", "Select a page element and copy its HTML or CSS.", "Pick"],
    ["clone", "Clone page", "Download the page UI snapshot as a ZIP.", "Clone page"],
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
  document.documentElement.appendChild(host);
  const shadow = host.attachShadow({ mode: "open" });

  shadow.innerHTML = `
    <style>
      :host{all:initial;color-scheme:dark;font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#f5f5fa;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility;font-synthesis:none;--pl-panel:#111218;--pl-surface:#191a22;--pl-surface-hover:#252630;--pl-line:#343541;--pl-text:#f5f5fa;--pl-muted:#c4c6d1;--pl-subtle:#aaadbb;--pl-accent:#b58cff;--pl-accent-strong:#7051db}
      *{box-sizing:border-box}
      #panel{position:fixed;left:50%;right:auto;top:auto;bottom:12px;transform:translateX(-50%);width:min(1120px,calc(100vw - 24px));height:auto;max-height:calc(100vh - 24px);background:var(--pl-panel);color:var(--pl-text);border:1px solid #b58cffaa;border-radius:18px;box-shadow:0 22px 70px #0009,0 0 0 1px #b58cff1f;backdrop-filter:blur(18px);pointer-events:auto;display:flex;flex-direction:column;overflow:hidden;font-size:14px;font-weight:500;line-height:1.45;letter-spacing:-.01em}
      #panel.expanded{height:auto;max-height:min(680px,calc(100vh - 24px))}
      #highlight{position:fixed;display:none;border:2px solid #6e9bff;background:#6e9bff22;border-radius:4px;pointer-events:none;z-index:0}
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
      nav{order:2;width:100%;flex:none;display:flex;align-items:center;gap:6px;padding:10px 12px;border:0;background:#121319;overflow-x:auto;overflow-y:hidden;scrollbar-width:thin;scrollbar-color:#555060 transparent;scroll-snap-type:x proximity}
      .navbtn{width:78px;height:64px;flex:0 0 78px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;text-align:center;background:#191a22;border:1px solid #383943;border-radius:12px;color:#eeedf5;padding:5px 4px;margin:0;font-size:12px;font-weight:700;line-height:1.2;letter-spacing:-.015em;white-space:normal;scroll-snap-align:center}
      .navbtn:hover{background:#252630;border-color:#777389}
      .navbtn.active{background:#29233a;border-color:var(--pl-accent);color:#fff;box-shadow:inset 0 0 0 1px #b58cff35}
      .navbtn .tool-icon{width:21px;height:21px;display:grid;place-items:center;flex:none;color:#f5f3f8}
      .navbtn .tool-icon svg{width:21px;height:21px;display:block;fill:none;stroke:currentColor;stroke-width:1.85;stroke-linecap:round;stroke-linejoin:round}
      .navbtn .tool-label{display:block;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      main{display:none;order:1;flex:0 1 auto;min-height:0;min-width:0;max-height:min(480px,calc(100vh - 210px));overflow:auto;padding:19px 22px 20px;scrollbar-width:thin;scrollbar-color:#555060 transparent}
      #panel.expanded main{display:block}
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
      iframe{border:0;background:white;border-radius:3px;transform-origin:top center;box-shadow:0 8px 30px #0007}
      #footer{display:none;flex:none;border-top:1px solid var(--pl-line);padding:9px 15px;align-items:center;gap:8px;color:#b2b5c2;font-size:12px;font-weight:500;line-height:1.4;background:#15161d}
      #panel.expanded #footer{display:flex}
      #toast{position:fixed;left:50%;bottom:90px;transform:translateX(-50%);background:#202635;color:#f5f7fb;border:1px solid #414b60;padding:8px 12px;border-radius:9px;box-shadow:0 6px 24px #0008;display:none;pointer-events:none}
      .welcome{padding-top:2px}.feature{font-size:13px;font-weight:600;line-height:1.45;color:#dedee7;padding:9px 0;border-bottom:1px solid #30313c}.feature:last-child{border:0}
      @media(max-width:640px){#panel{width:calc(100vw - 16px);bottom:8px;border-radius:16px}#panel.expanded{max-height:calc(100vh - 16px)}header{height:50px;padding:0 12px}nav{padding:8px}.navbtn{width:74px;height:60px;flex-basis:74px;font-size:11px}main{padding:16px 15px 18px;max-height:calc(100vh - 190px)}.kv{grid-template-columns:95px minmax(0,1fr)}}
    </style>
    <div id="highlight"></div>
    <section id="panel" role="dialog" aria-label="PageLens website toolkit">
      <header><div class="brand"><div class="logo">P</div>PageLens</div><button class="subtle" data-action="close" title="Back to tools">⌄</button></header>
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
  const state = { tool: null, selected: null, picking: false, measuring: false, firstPoint: null, history: [], fontStyle: null, responsiveFrame: null };
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
    nav.innerHTML = tools.map((item, i) =>
      `<button class="navbtn ${state.tool === item[0] ? "active" : ""}" data-tool="${item[0]}" title="${esc(item[1])}" aria-label="${esc(item[1])}"><span class="tool-icon">${icons[i]}</span><span class="tool-label">${esc(item[3] || item[1])}</span></button>`).join("");
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
  function selectedCard() {
    const info = currentInfo();
    if (!info) return `<div class="hint">Choose “Pick on page” and select an element first.</div>`;
    return `<div class="card">${kv("Element", `<${info.tag}>`)}${kv("Selector", info.selector)}${kv("Size", `${Math.round(info.rect.width)} × ${Math.round(info.rect.height)} px`)}${kv("Font", `${info.style.fontFamily} · ${info.style.fontSize} · ${info.style.fontWeight}`)}${kv("Color", `${info.style.color} · ${info.style.backgroundColor}`)}</div>`;
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
  function scanAssets() {
    const result = [];
    const seen = new Set();
    const add = (url, type, el) => {
      if (!url || (url.startsWith("data:") && type !== "SVG") || seen.has(`${type}:${url}`)) return;
      seen.add(`${type}:${url}`);
      result.push({ url, type, alt: el?.alt || el?.getAttribute("aria-label") || "", preview: type === "Image" ? url : "" });
    };
    for (const el of Array.from(document.querySelectorAll("img,video,source,svg,body *")).slice(0, 3500)) {
      if (host.contains(el)) continue;
      if (el.tagName === "IMG") add(el.currentSrc || el.src, "Image", el);
      else if (el.tagName === "VIDEO") add(el.currentSrc || el.src || el.poster, "Video", el);
      else if (el.tagName === "SOURCE") add(el.src, "Media", el);
      else if (el.tagName === "SVG") add(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(el.outerHTML)}`, "SVG", el);
      const bg = getComputedStyle(el).backgroundImage;
      for (const match of bg.matchAll(/url\(["']?(.*?)["']?\)/g)) add(new URL(match[1], location.href).href, "Background", el);
    }
    return result.slice(0, 200);
  }
  function pageDetails() {
    const colors = scanColors();
    const fonts = scanFonts();
    const headings = Array.from(document.querySelectorAll("h1,h2,h3")).slice(0, 12).map((el) => (el.innerText || "").trim()).filter(Boolean);
    const meta = document.querySelector('meta[name="description"]')?.content || "";
    const bodyText = (document.body.innerText || "").replace(/\s+/g, " ").trim().slice(0, 800);
    return { title: document.title, url: location.href, description: meta, viewport: `${innerWidth} × ${innerHeight}`, headings, bodyText, colors, fonts };
  }
  function detailsMarkdown(details = pageDetails()) {
    return `# Design reference: ${details.title}\n\nSource: ${details.url}\n\n${details.description ? `> ${details.description}\n\n` : ""}## Page\n\n- Viewport: ${details.viewport}\n- Page title: ${details.title}\n\n## Color palette\n\n${details.colors.slice(0, 20).map((c) => `- ${c.color} (${c.count} uses)`).join("\n") || "- No colors detected"}\n\n## Typography\n\n${details.fonts.slice(0, 16).map((f) => `- ${f.fontFamily}, ${f.fontSize}, weight ${f.fontWeight}, line-height ${f.lineHeight}`).join("\n") || "- No text styles detected"}\n\n## Headings\n\n${details.headings.map((h) => `- ${h}`).join("\n") || "- No headings detected"}\n\n## Visible content sample\n\n${details.bodyText || "(No page text found)"}\n\n---\nGenerated locally with PageLens. Treat this as a reference, not the original source design file.\n`;
  }
  function designPrompt() {
    const d = pageDetails();
    return `Create an original web page inspired by the design characteristics below. Do not reuse the source brand, wording, imagery, or proprietary assets.\n\nPage context: ${d.title}\nDescription: ${d.description || "Not provided"}\nViewport reviewed: ${d.viewport}\n\nVisual direction\n- Main colors: ${d.colors.slice(0, 8).map((c) => c.color).join(", ") || "not detected"}\n- Typography: ${d.fonts.slice(0, 8).map((f) => `${f.fontFamily} ${f.fontSize} / ${f.fontWeight}`).join("; ") || "not detected"}\n- Content structure: ${d.headings.join(" → ") || "inspect the page sample"}\n\nBuild an accessible, responsive implementation with clear spacing, reusable components, and original copy and visual assets. Use the extracted details as a starting point and make your own design decisions.`;
  }
  function makeStaticClone() {
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
    const html = `<!doctype html>\n${clone.outerHTML}`;
    const styles = collectPageStyles();
    const assets = scanAssets().filter((item) => !item.url.startsWith("data:")).slice(0, 150).map(({ type, alt, url }) => ({ type, alt, url }));
    const readme = `# ${document.title || "PageLens UI snapshot"}\n\nThis ZIP contains a local snapshot of the rendered page UI.\n\n- Open index.html in a browser to view the snapshot.\n- styles.css contains readable page rules that the browser allowed PageLens to collect. Key computed styles are also saved inline in the HTML.\n- assets.json lists referenced images and media. Those assets remain hosted at their original URLs and may need an internet connection.\n\nThis is a rendered UI snapshot, not the website's original source project. Scripts and embedded frames are removed for safety, so app behavior, server code, and backend features are not included.\n\nSource page: ${location.href}\nCaptured viewport: ${innerWidth} × ${innerHeight}\n`;
    const zip = makeZip([
      { name: "index.html", content: html },
      { name: "styles.css", content: styles || "/* PageLens saved the available computed styles inline in index.html. */\n" },
      { name: "assets.json", content: JSON.stringify(assets, null, 2) },
      { name: "README.md", content: readme }
    ]);
    downloadBlob(zip, `${safeFilename(document.title || "page")}-ui.zip`);
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
      const data = encoder.encode(file.content);
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
    return items.map((item, i) => `<div class="asset row">${item.preview ? `<img src="${esc(item.preview)}" alt="">` : `<span class="chip">${esc(item.type.slice(0,1))}</span>`}<div class="grow"><b>${esc(item.type)}</b><div class="muted">${esc(item.alt || item.url).slice(0, 96)}</div></div><button data-action="download-asset" data-index="${i}">Save</button></div>`).join("") || `<div class="hint">No assets found.</div>`;
  }
  function render() {
    navMarkup();
    panel.classList.toggle("expanded", Boolean(state.tool));
    if (!state.tool) { main.innerHTML = ""; return; }
    const info = currentInfo();
    const selected = info ? selectedCard() : "";
    const pages = {
      home: `<div class="welcome"><h1>See the details behind a page.</h1><p>Choose a tool, then work with the page open behind this panel.</p><div class="card"><h2>Quick start</h2><div class="feature">1. Pick an element to inspect its structure and styles.</div><div class="feature">2. Collect colors, type, and assets as references.</div><div class="feature">3. Try local edits or capture the visible page.</div></div><div class="hint">PageLens reads the page currently open in this tab. Edits are temporary and disappear when you reload.</div><h2>Selected element</h2>${selected || `<div class="muted">Nothing selected yet.</div>`}</div>`,
      pick: `<h1>Pick element</h1><p>Select a component to inspect its markup and computed style.</p>${button("Pick on page", "pick", true)}${selected || ""}${info ? `<h2>HTML</h2><textarea class="code" readonly>${esc(info.el.outerHTML.slice(0, 12000))}</textarea><div class="row">${button("Copy HTML", "copy-html")}${button("Copy CSS", "copy-css")}</div><h2>Computed styles</h2><textarea class="code" readonly>${esc(computedFor(info.el))}</textarea>` : ""}<div class="status"></div>`,
      clone: `<h1>Clone page</h1><p>Package the page’s visible UI into a ZIP with an HTML snapshot, saved CSS, and an asset reference list.</p><div class="card">${kv("Source", location.hostname)}${kv("Page title", document.title)}${kv("ZIP contents", "index.html · styles.css · assets.json · README.md")}</div><div class="hint">This is a rendered UI snapshot, not the original source project. Scripts and embedded frames are removed; app behavior and backend code are not included.</div><div style="margin-top:12px">${button("Download UI ZIP", "clone", true)}</div><div class="status"></div>`,
      "design-md": `<h1>Design MD</h1><p>Build a Markdown reference with extracted colors, type styles, headings, and page context.</p><div class="card">${kv("Page", document.title)}${kv("URL", location.href)}${kv("Viewport", `${innerWidth} × ${innerHeight}`)}${kv("Palette", `${scanColors().length} colors sampled`)}${kv("Text styles", `${scanFonts().length} styles sampled`)}</div><div class="row">${button("Download Design MD", "design-md", true)}${button("Copy Markdown", "copy-md")}</div><div class="status"></div>`,
      prompt: `<h1>Design prompt</h1><p>Turn the observed design details into an original implementation brief.</p><textarea id="prompt-text">${esc(designPrompt())}</textarea><div class="row">${button("Copy prompt", "copy-prompt", true)}${button("Download .txt", "download-prompt")}</div><div class="status"></div>`,
      assets: `<h1>Extract assets</h1><p>Images, SVGs, media, and CSS background images found on this page.</p><div class="row">${button("Rescan assets", "refresh-assets")}</div><div id="assets-list" class="stack">${assetsList(scanAssets())}</div><div class="status"></div>`,
      colors: `<h1>Extract colors</h1><p>Frequent text, surface, and border colors. Select a swatch to copy it.</p><div class="row">${button("Copy CSS variables", "copy-palette", true)}${button("Export JSON", "export-palette")}</div><div class="card" id="color-list">${colorList(scanColors())}</div><div class="status"></div>`,
      fonts: `<h1>Detect fonts</h1><p>Text styles found in visible page content, ordered by frequency.</p><div class="card">${fontList(scanFonts())}</div><div class="status"></div>`,
      "swap-fonts": `<h1>Swap fonts</h1><p>Preview a typeface across the page. The change stays local and resets on reload.</p><div class="card">${kv("Current page fonts", [...new Set(scanFonts().map((f) => f.fontFamily))].slice(0, 5).join(" · ") || "None found")}</div><label class="muted" for="font-choice">Preview font family</label><select id="font-choice"><option value="Arial, sans-serif">Arial</option><option value="Georgia, serif">Georgia</option><option value="Verdana, sans-serif">Verdana</option><option value="system-ui, sans-serif">System UI</option><option value="monospace">Monospace</option><option value="'Courier New', monospace">Courier New</option></select><div class="row" style="margin-top:9px">${button("Apply preview", "apply-font", true)}${button("Reset font", "reset-font")}</div><div class="status"></div>`,
      inspect: `<h1>Inspect & measure</h1><p>Pick an element to read its box size, spacing, and computed styles.</p>${button("Pick element", "pick", true)}${selected || ""}${info ? `<div class="card">${kv("Position", `${Math.round(info.rect.left)}, ${Math.round(info.rect.top)} px`)}${kv("Margin", info.style.margin)}${kv("Padding", info.style.padding)}${kv("Border", info.style.border)}${kv("Display", info.style.display)}${kv("Positioning", info.style.position)}</div>` : ""}<h2>Measure distance</h2><p>Click two points in the page to calculate the straight-line distance.</p>${button("Start measuring", "measure")}${state.firstPoint ? `<div class="hint" style="margin-top:8px">First point: ${Math.round(state.firstPoint.x)}, ${Math.round(state.firstPoint.y)} px</div>` : ""}<div class="status"></div>`,
      "edit-text": `<h1>Edit text</h1><p>Select a text element and try a copy change in place.</p>${button("Pick text", "pick", true)}${selected || ""}${info ? `<h2>Preview copy</h2><textarea id="edit-value">${esc(info.el.innerText || "")}</textarea><div class="row">${button("Apply to page", "apply-text", true)}${button("Undo edit", "undo")}</div>` : ""}<div class="hint" style="margin-top:12px">This edits the current rendered page only. Reload the tab to restore the original text.</div><div class="status"></div>`,
      screenshot: `<h1>Screenshot</h1><p>Save a PNG of the visible browser area, with this panel hidden during capture.</p><div class="card">${kv("Capture size", `${innerWidth} × ${innerHeight} px`)}${kv("Page", location.hostname)}</div>${button("Capture visible area", "screenshot", true)}<div class="hint" style="margin-top:10px">For a longer page, scroll to the section you want and capture it in separate frames.</div><div class="status"></div>`,
      responsive: `<h1>Responsive viewer</h1><p>Open the current page in a framed preview at a common viewport width.</p><div class="row"><select id="responsive-size"><option value="375">Phone · 375 px</option><option value="430">Large phone · 430 px</option><option value="768">Tablet · 768 px</option><option value="1024">Laptop · 1024 px</option><option value="1280">Desktop · 1280 px</option></select>${button("Load", "load-responsive", true)}</div><div class="viewport-wrap" style="margin-top:10px"><div id="responsive-slot" class="muted">Choose a viewport and load a preview.</div></div><div class="hint" style="margin-top:10px">Some websites block embedded previews. The viewer uses your browser’s normal rendering engine.</div><div class="status"></div>`,
      layout: `<h1>Move & delete</h1><p>Select an element, then move it before or after a sibling or remove it.</p>${button("Pick element", "pick", true)}${selected || ""}${info ? `<div class="stack" style="margin-top:9px">${button("Move earlier", "move-up")}${button("Move later", "move-down")}${button("Remove element", "remove", false, "danger")}</div>` : ""}<div class="hint" style="margin-top:12px">Changes affect this tab only. Use Undo below or reload the page to restore its original layout.</div><div class="status"></div>`
    };
    main.innerHTML = pages[state.tool] || "";
    if (state.tool === "responsive" && state.responsiveFrame) {
      const slot = main.querySelector("#responsive-slot");
      if (slot) slot.replaceWith(state.responsiveFrame);
    }
  }

  nav.addEventListener("click", (event) => {
    const button = event.target.closest("[data-tool]");
    if (!button) return;
    state.tool = state.tool === button.dataset.tool ? null : button.dataset.tool;
    state.responsiveFrame = null;
    render();
  });
  shadow.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-action]");
    if (!button) return;
    const action = button.dataset.action;
    if (action === "close") { state.tool = null; state.responsiveFrame = null; finishPick(); render(); return; }
    if (action === "undo") return undo();
    if (action === "pick") return activatePick();
    if (action === "measure") return activatePick(true);
    if (action === "clone") { makeStaticClone(); notify("Page UI ZIP downloaded."); return; }
    if (action === "design-md") { downloadText(detailsMarkdown(), `${safeFilename(document.title)}-design.md`, "text/markdown"); notify("Design MD downloaded."); return; }
    if (action === "copy-md") return copy(detailsMarkdown());
    if (action === "copy-prompt") return copy(main.querySelector("#prompt-text")?.value || designPrompt());
    if (action === "download-prompt") { downloadText(main.querySelector("#prompt-text")?.value || designPrompt(), `${safeFilename(document.title)}-design-prompt.txt`, "text/plain"); notify("Prompt downloaded."); return; }
    if (action === "copy-html" && state.selected) return copy(state.selected.outerHTML);
    if (action === "copy-css" && state.selected) return copy(computedFor(state.selected));
    if (action === "copy-color") return copy(button.dataset.color);
    if (action === "copy-palette") return copy(`:root {\n${scanColors().slice(0, 30).map((c, i) => `  --page-color-${i + 1}: ${c.color};`).join("\n")}\n}`);
    if (action === "export-palette") { downloadText(JSON.stringify(scanColors(), null, 2), `${safeFilename(document.title)}-colors.json`, "application/json"); notify("Palette exported."); return; }
    if (action === "refresh-assets") { state.assets = scanAssets(); main.querySelector("#assets-list").innerHTML = assetsList(state.assets); notify(`${state.assets.length} assets found.`); return; }
    if (action === "download-asset") {
      const asset = (state.assets || scanAssets())[Number(button.dataset.index)];
      if (!asset) return;
      if (asset.url.startsWith("data:")) { const a = document.createElement("a"); a.href = asset.url; a.download = `pagelens-asset-${button.dataset.index}.svg`; a.click(); }
      else chrome.runtime.sendMessage({ type: "pagelens:download-url", url: asset.url, filename: `pagelens-${safeFilename(asset.alt || "asset")}` }, (response) => notify(response?.ok ? "Download started." : "Could not download this asset."));
      return;
    }
    if (action === "apply-font") {
      const value = main.querySelector("#font-choice")?.value || "Arial, sans-serif";
      if (!state.fontStyle) { state.fontStyle = document.createElement("style"); state.fontStyle.id = "pagelens-font-preview"; document.documentElement.appendChild(state.fontStyle); }
      const old = state.fontStyle.textContent;
      state.fontStyle.textContent = `body *:not(#pagelens-extension-root *):not(#pagelens-extension-root){font-family:${value} !important}`;
      addUndo(() => { state.fontStyle.textContent = old; });
      notify("Font preview applied."); return;
    }
    if (action === "reset-font") { state.fontStyle?.remove(); state.fontStyle = null; notify("Font preview reset."); return; }
    if (action === "apply-text" && state.selected) {
      const editedElement = state.selected;
      const old = editedElement.innerText;
      const next = main.querySelector("#edit-value")?.value ?? old;
      editedElement.innerText = next;
      addUndo(() => { if (editedElement.isConnected) editedElement.innerText = old; });
      notify("Text preview updated."); render(); return;
    }
    if (action === "screenshot") {
      setStatus("Capturing visible area…");
      chrome.runtime.sendMessage({ type: "pagelens:capture-visible" }, (response) => {
        if (chrome.runtime.lastError || !response?.ok) setStatus(response?.error || "Capture failed. Try again on a normal website tab.");
        else setStatus("PNG capture saved.");
      });
      return;
    }
    if (action === "load-responsive") {
      const width = Number(main.querySelector("#responsive-size")?.value || 375);
      const wrap = main.querySelector(".viewport-wrap");
      const iframe = document.createElement("iframe");
      iframe.title = `${width}px responsive preview`;
      iframe.style.width = `${width}px`; iframe.style.height = "720px"; iframe.style.maxWidth = "none";
      iframe.src = location.href;
      const slot = main.querySelector("#responsive-slot");
      slot.replaceWith(iframe); state.responsiveFrame = iframe;
      if (width > wrap.clientWidth - 18) iframe.style.transform = `scale(${(wrap.clientWidth - 18) / width})`;
      notify("Responsive preview loaded when the site allows embedding."); return;
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
    if (!state.picking) return;
    const target = event.composedPath().find((node) => node instanceof Element && !host.contains(node));
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
    state.selected = target;
    finishPick(); render();
    notify(`Selected ${selectorFor(target) || target.tagName.toLowerCase()}.`);
  }, true);

  chrome.runtime.onMessage.addListener((message) => {
    if (message?.type === "pagelens:hide-for-capture") host.style.visibility = "hidden";
    if (message?.type === "pagelens:restore-after-capture") host.style.visibility = "visible";
  });

  render();
})();
