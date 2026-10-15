# PageLens

PageLens is a Manifest V3 Chrome extension for inspecting and collecting design references from the page open in the current tab. It is an original implementation inspired by the general category of browser-based website design toolkits.

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

## Install for local development

1. Open `chrome://extensions` in Chrome.
2. Turn on **Developer mode**.
3. Choose **Load unpacked** and select this project folder.
4. Open a regular website and click the PageLens toolbar icon.

Some pages cannot be inspected, including browser settings and Chrome Web Store pages. A site may block the responsive preview from embedding. The clone tool creates a static reference and does not reproduce a site's backend or application behavior. Use collected content and assets only when you have permission.
