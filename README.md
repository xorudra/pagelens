# PageLens

PageLens is a Manifest V3 Chrome extension for inspecting page design and collecting references from the current tab. Click the toolbar button to open its tools; PageLens does not run on a page until you invoke it.

## Included tools

- Pick an element and inspect or copy its HTML and computed CSS
- Export a static HTML snapshot with selected computed styles inline
- Generate a Design MD reference or a design prompt
- Find images, SVGs, videos, and CSS background assets
- Extract a page color palette and typography styles
- Preview common font families across the page
- Inspect element size, spacing, and point-to-point distance
- Preview text edits, reorder or remove elements, and undo recent edits
- Capture the visible tab as a PNG
- Open a framed responsive preview at common viewport widths

PageLens processes page information in the browser. It does not send page content, URLs, or generated notes to a PageLens server. Exports and asset downloads happen only when you choose an export or download action. See the [Privacy Policy](PRIVACY.md).

## Permissions

- `activeTab` and `scripting` let PageLens inspect and display tools on the current tab after you click the extension.
- `downloads` saves exports, screenshots, and assets when you choose to download them.
- PageLens does not request access to all websites, run analytics, or use a remote service.

## Install for local development

1. Open `chrome://extensions` in Chrome.
2. Turn on **Developer mode**.
3. Choose **Load unpacked** and select this project folder.
4. Open a regular website and click the PageLens toolbar icon.

Some pages cannot be inspected, including browser settings and Chrome Web Store pages. A site may block the responsive preview from embedding. The clone tool creates a static reference and does not reproduce a site's backend or application behavior. Use collected content and assets only when you have permission.

## Chrome Web Store listing

Store listing text, promotional artwork, and a release checklist are in the repository root. The extension package must be a ZIP with `manifest.json` at the ZIP root.
