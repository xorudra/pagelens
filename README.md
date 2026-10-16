# PageLens

PageLens is a Manifest V3 Chrome extension for inspecting page design and collecting references from the current tab. Click the toolbar button to open its tools; PageLens does not run on a page until you invoke it.

## Included tools

- Pick an element and inspect or copy its HTML and computed CSS
- Download a page UI snapshot ZIP with HTML, CSS, and a referenced-assets list
- Generate a Design MD reference or a design prompt
- Find images, SVGs, videos, and CSS background assets
- Extract a page color palette and typography styles
- Preview common font families across the page
- Inspect element size, spacing, and point-to-point distance
- Preview text edits, reorder or remove elements, and undo recent edits
- Capture the visible tab as a PNG
- Open a framed responsive preview at common viewport widths

PageLens processes page information in the browser. It does not send page content, URLs, or generated notes to a PageLens server. Exports and asset downloads happen only when you choose an export or download action. See the [Privacy Policy](PRIVACY.md).

## Preview without installing

Open the [live PageLens preview](https://xorudra.github.io/pagelens/preview.html). It runs the same `content.js` used by the extension on a built-in sample website. Use the horizontal toolbar centered along the bottom to review and try the page tools without installing PageLens.

Screenshot capture still requires the installed extension.

## Permissions

- `activeTab` and `scripting` let PageLens inspect and display tools on the current tab after you click the extension.
- `downloads` saves exports, screenshots, and assets when you choose to download them.
- PageLens does not request access to all websites, run analytics, or use a remote service.

## Install in Chrome

1. [Download PageLens 0.1.0](https://github.com/xorudra/pagelens/raw/refs/heads/main/pagelens-0.1.0.zip) and extract the ZIP.
2. In Chrome, open `chrome://extensions`, turn on **Developer mode**, then choose **Load unpacked**.
3. Select the extracted PageLens folder whose top level contains `manifest.json`. The folder picker selects a folder, so `manifest.json` will not appear as a selectable file; select that folder and click **Select Folder**.
4. Open a website and click the PageLens toolbar icon. Pin PageLens from the Extensions menu if you want it beside the address bar.

If the page says **Upload package**, choose the ZIP file instead of a folder.

Some pages cannot be inspected, including browser settings and Chrome Web Store pages. A site may block the responsive preview from embedding. Clone Page downloads a ZIP with a rendered HTML snapshot, accessible CSS rules, and an asset reference list. It does not include the original project source, scripts, backend, or application behavior; external assets remain at their original URLs. Use collected content and assets only when you have permission.

## Chrome Web Store listing

Store listing text, promotional artwork, and a release checklist are in the repository root. The downloadable ZIP contains only the extension files, with `manifest.json` at its root.
