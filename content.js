(() => {
  const existing = document.getElementById("pagelens-extension-root");
  if (existing) {
    existing.style.display = existing.style.display === "none" ? "block" : "none";
    return;
  }

  const tools = [
    ["pick", "Pick element", "Select a page element and copy its HTML or CSS."],
    ["clone", "Clone page", "Save a static snapshot of the rendered page."],
    ["design-md", "Design MD", "Collect the page’s colors, type, and layout notes."],
    ["prompt", "Design prompt", "Create a structured brief from this page."],
    ["assets", "Extract assets", "Find images, SVGs, videos, and background images."],
    ["colors", "Extract colors", "Build a reusable palette from the page."],
    ["fonts", "Detect fonts", "Find the typefaces and text styles in use."],
    ["swap-fonts", "Swap fonts", "Preview another font across the page."],
    ["inspect", "Inspect & measure", "Read element dimensions, spacing, and styles."],
    ["edit-text", "Edit text", "Try copy changes directly on the page."],
    ["screenshot", "Screenshot", "Capture the visible browser area."],
    ["responsive", "Responsive viewer", "Preview this page at common viewport widths."],
    ["layout", "Move & delete", "Reorder or remove elements, then undo."],
  ];

  const host = document.createElement("div");
  host.id = "pagelens-extension-root";
  host.style.cssText = "all:initial;position:fixed;inset:0;z-index:2147483647;pointer-events:none";
  document.documentElement.appendChild(host);
  const shadow = host.attachShadow({ mode: "open" });

  shadow.innerHTML = `
    <style>
      :host{all:initial;color-scheme:dark;font-family:Inter,ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif}
      *{box-sizing:border-box}
      #panel{position:fixed;right:16px;top:16px;bottom:16px;width:380px;max-width:calc(100vw - 32px);background:#10131b;color:#eef1f8;border:1px solid #2a3040;border-radius:16px;box-shadow:0 18px 65px #0008;pointer-events:auto;display:flex;flex-direction:column;overflow:hidden;font-size:13px;line-height:1.45}
      #highlight{position:fixed;display:none;border:2px solid #6e9bff;background:#6e9bff22;border-radius:4px;pointer-events:none;z-index:0}
      header{height:58px;flex:none;display:flex;align-items:center;gap:10px;padding:0 16px;border-bottom:1px solid #272d3b}
      .brand{display:flex;align-items:center;gap:9px;font-weight:700;font-size:15px;letter-spacing:.1px;flex:1}
      .logo{width:25px;height:25px;border-radius:8px;background:linear-gradient(135deg,#9a76ff,#45c6d9);display:grid;place-items:center;color:#10131b;font-size:15px;font-weight:900}
      button,select,input,textarea{font:inherit}
      button{color:inherit;background:#202635;border:1px solid #333c50;border-radius:8px;padding:8px 10px;cursor:pointer;transition:.15s ease}
      button:hover{background:#2a3346;border-color:#596989}
      button.primary{background:#8066ee;border-color:#8066ee;color:white;font-weight:650}
      button.primary:hover{background:#927cff}
      button.subtle{background:transparent;border-color:transparent;padding:6px 8px;color:#aab3c5}
      button.danger{color:#ffb8b8}
      #body{display:flex;min-height:0;flex:1}
      nav{width:132px;flex:none;padding:9px 7px;border-right:1px solid #272d3b;overflow:auto;scrollbar-width:thin}
      .navbtn{width:100%;text-align:left;background:transparent;border-color:transparent;color:#aeb6c7;padding:7px 8px;margin:1px 0;font-size:11px;line-height:1.2;white-space:normal}
      .navbtn.active{background:#242b3b;border-color:#343e53;color:#fff}
      .navbtn span{display:block;font-size:14px;margin-bottom:3px}
      main{flex:1;min-width:0;overflow:auto;padding:17px 15px 24px;scrollbar-width:thin}
      h1{font-size:18px;margin:0 0 5px;line-height:1.25} h2{font-size:13px;margin:18px 0 8px}
      p{color:#aab3c5;margin:4px 0 12px;font-size:12px}
      .muted{color:#939db1;font-size:11px}
      .card{background:#171c27;border:1px solid #2b3242;border-radius:10px;padding:11px;margin:9px 0}
      .row{display:flex;align-items:center;gap:7px;flex-wrap:wrap}
      .row>*{flex:none}.row .grow{flex:1;min-width:0}
      .stack{display:grid;gap:7px}
      .kv{display:grid;grid-template-columns:95px minmax(0,1fr);gap:6px;padding:5px 0;border-bottom:1px solid #272d3b;align-items:start}
      .kv:last-child{border-bottom:0}.key{color:#9da7ba}.value{overflow-wrap:anywhere;color:#e1e6f1}
      textarea, input[type=text], select{width:100%;background:#0d1017;color:#eef1f8;border:1px solid #333b4d;border-radius:8px;padding:9px;outline:none}
      textarea{min-height:115px;resize:vertical;font:11px/1.5 ui-monospace,SFMono-Regular,Consolas,monospace}
      .code{min-height:90px}.hint{padding:9px;border-radius:8px;background:#1a2130;color:#adb8cd;font-size:11px}
      .swatch{display:flex;gap:8px;align-items:center;width:100%;padding:6px;background:transparent;border:0;text-align:left}
      .chip{width:23px;height:23px;border:1px solid #fff4;border-radius:6px;flex:none}
      .asset{padding:7px 0;border-bottom:1px solid #272d3b}.asset:last-child{border:0}
      .asset img{width:36px;height:30px;object-fit:cover;border-radius:4px;background:#252b39}
      .status{min-height:18px;color:#b8c5df;font-size:11px;margin-top:7px}
      .preset{padding:7px 9px}.viewport-wrap{height:330px;overflow:auto;background:#262c39;border:1px solid #3b455a;border-radius:9px;padding:9px;display:flex;justify-content:center;align-items:flex-start}
      iframe{border:0;background:white;border-radius:3px;transform-origin:top center;box-shadow:0 8px 30px #0007}
      #footer{flex:none;border-top:1px solid #272d3b;padding:8px 13px;display:flex;align-items:center;gap:8px;color:#8490a6;font-size:10px}
      #toast{position:fixed;left:50%;bottom:18px;transform:translateX(-50%);background:#202635;color:#f5f7fb;border:1px solid #414b60;padding:8px 12px;border-radius:9px;box-shadow:0 6px 24px #0008;display:none;pointer-events:none}
      .welcome{padding-top:5px}.feature{font-size:11px;color:#c3ccdc;padding:7px 0;border-bottom:1px solid #272d3b}.feature:last-child{border:0}
    </style>
    <div id="highlight"></div>
    <section id="panel" role="dialog" aria-label="PageLens website toolkit">
      <header><div class="brand"><div class="logo">P</div>PageLens</div><button class="subtle" data-action="close" title="Close">✕</button></header>
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
  const state = { tool: "home", selected: null, picking: false, measuring: false, firstPoint: null, history: [], fontStyle: null, responsiveFrame: null };
  const icons = ["⌖", "▣", "▤", "✦", "▧", "◉", "Aa", "↔", "⌗", "T", "▣", "▱", "↕"];

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
    nav.innerHTML = `<button class="navbtn ${state.tool === "home" ? "active" : ""}" data-tool="home"><span>⌂</span>Overview</button>` + tools.map((item, i) =>
      `<button class="navbtn ${state.tool === item[0] ? "active" : ""}" data-tool="${item[0]}"><span>${icons[i]}</span>${esc(item[1])}</button>`).join("");
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
    const cssProps = ["display", "position", "box-sizing", "width", "height", "min-width", "max-width", "margin", "padding", "border", "border-radius", "background", "color", "font-family", "font-size", "font-weight", "line-height", "text-align", "text-decoration", "white-space", "overflow", "object-fit", "flex", "grid-template-columns", "gap", "align-items", "justify-content", "opacity", "box-shadow"];
    sourceNodes.slice(0, 2500).forEach((source, index) => {
      const target = cloneNodes[index];
      if (!target || source === document.documentElement || source === host) return;
      const cs = getComputedStyle(source);
      const values = cssProps.map((prop) => `${prop}:${cs.getPropertyValue(prop)}`).join(";");
      target.setAttribute("style", `${target.getAttribute("style") || ""};${values}`);
    });
    clone.querySelector("#pagelens-extension-root")?.remove();
    clone.querySelectorAll("script,iframe,object,embed,noscript").forEach((el) => el.remove());
    clone.querySelectorAll("*").forEach((el) => {
      [...el.attributes].forEach((attr) => {
        if (attr.name.toLowerCase().startsWith("on") || attr.name === "srcdoc") el.removeAttribute(attr.name);
      });
      if (el.tagName === "INPUT") el.removeAttribute("value");
      if (el.tagName === "TEXTAREA") el.textContent = "";
    });
    clone.querySelectorAll("link[rel=stylesheet]").forEach((el) => el.remove());
    const html = `<!doctype html>\n<!-- Static PageLens snapshot of ${location.href} -->\n${clone.outerHTML}`;
    downloadText(html, `${safeFilename(document.title || "page")}-snapshot.html`, "text/html");
  }
  function safeFilename(value) {
    return String(value).normalize("NFKD").replace(/[^\w.-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 70) || "pagelens";
  }
  function downloadText(value, filename, type) {
    const blob = new Blob([value], { type: `${type};charset=utf-8` });
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
    const info = currentInfo();
    const selected = info ? selectedCard() : "";
    const pages = {
      home: `<div class="welcome"><h1>See the details behind a page.</h1><p>Choose a tool, then work with the page open behind this panel.</p><div class="card"><h2>Quick start</h2><div class="feature">1. Pick an element to inspect its structure and styles.</div><div class="feature">2. Collect colors, type, and assets as references.</div><div class="feature">3. Try local edits or capture the visible page.</div></div><div class="hint">PageLens reads the page currently open in this tab. Edits are temporary and disappear when you reload.</div><h2>Selected element</h2>${selected || `<div class="muted">Nothing selected yet.</div>`}</div>`,
      pick: `<h1>Pick element</h1><p>Select a component to inspect its markup and computed style.</p>${button("Pick on page", "pick", true)}${selected || ""}${info ? `<h2>HTML</h2><textarea class="code" readonly>${esc(info.el.outerHTML.slice(0, 12000))}</textarea><div class="row">${button("Copy HTML", "copy-html")}${button("Copy CSS", "copy-css")}</div><h2>Computed styles</h2><textarea class="code" readonly>${esc(computedFor(info.el))}</textarea>` : ""}<div class="status"></div>`,
      clone: `<h1>Clone page</h1><p>Export a static HTML snapshot of the rendered page with key computed styles inline.</p><div class="card">${kv("Source", location.hostname)}${kv("Page title", document.title)}${kv("Export", "Standalone HTML snapshot with scripts and embedded frames removed")}</div><div class="hint">The export is a visual reference. It does not include the site’s backend, account data, or original project files.</div><div style="margin-top:12px">${button("Download HTML snapshot", "clone", true)}</div><div class="status"></div>`,
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
    main.innerHTML = pages[state.tool] || pages.home;
    if (state.tool === "responsive" && state.responsiveFrame) {
      const slot = main.querySelector("#responsive-slot");
      if (slot) slot.replaceWith(state.responsiveFrame);
    }
  }

  nav.addEventListener("click", (event) => {
    const button = event.target.closest("[data-tool]");
    if (!button) return;
    state.tool = button.dataset.tool;
    state.responsiveFrame = null;
    render();
  });
  shadow.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-action]");
    if (!button) return;
    const action = button.dataset.action;
    if (action === "close") { host.style.display = "none"; finishPick(); return; }
    if (action === "undo") return undo();
    if (action === "pick") return activatePick();
    if (action === "measure") return activatePick(true);
    if (action === "clone") { makeStaticClone(); notify("Static snapshot downloaded."); return; }
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
