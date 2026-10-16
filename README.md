# PageLens

PageLens is a Manifest V3 Chrome extension for inspecting page design and collecting references from the current tab. Click the toolbar button to open its tools; PageLens does not run on a page until you invoke it.

## Included tools

- Pick an element and inspect or copy its HTML and computed CSS
- Download a page UI snapshot ZIP with HTML, CSS, and assets the source site allows PageLens to fetch
- Generate a Design MD reference or a design prompt
- Find images, SVGs, videos, and CSS background assets
- Extract a page color palette and typography styles
- Preview popular or custom Google Fonts across the page, headings, body text, or a selected element
- Inspect element size, spacing, and point-to-point distance
- Preview text edits, reorder or remove elements, and undo recent edits
- Capture a visible area, full page, selected area, or selected element; crop, draw annotations, and export PNG or PDF
- Compare side-by-side responsive previews at phone, tablet, laptop, and desktop widths
- Choose a bottom dock or right sidebar, reorder tools, and save capture and viewport defaults

PageLens processes page information in your browser. It does not send page content, URLs, screenshots, or generated notes to a PageLens server. Swap Fonts loads the public Google Fonts family list from Google's fonts repository when opened; applying a font requests it from Google Fonts. Clone Page can request accessible image and media files directly from their source hosts; cross-origin restrictions may prevent some from being copied. Preferences are stored locally by Chrome. See the [Privacy Policy](PRIVACY.md).

## Preview without installing

Open the [live PageLens preview](https://xorudra.github.io/pagelens/preview.html). It runs the same `content.js` used by the extension on a built-in sample website. Use the toolbar centered along the bottom by default, or switch to a right sidebar in Workspace settings.

Screenshot capture requires the installed extension because the browser preview cannot access Chrome’s screenshot API. The preview can save workspace settings in this browser.

## Permissions

- `activeTab` and `scripting` let PageLens inspect and display tools on the current tab after you click the extension.
- `downloads` saves exports, screenshots, and assets when you choose to download them.
- `storage` saves the toolbar position, tool order, screenshot default, and responsive widths on this device.
- PageLens does not request access to all websites or run analytics. Optional font and asset requests go directly to their source hosts.

## Install in Chrome

1. [Download PageLens](https://github.com/xorudra/pagelens/raw/refs/heads/main/pagelens.zip) and extract the ZIP.
2. In Chrome, open `chrome://extensions`, turn on **Developer mode**, then choose **Load unpacked**.
3. Select the extracted PageLens folder whose top level contains `manifest.json`. The folder picker selects a folder, so `manifest.json` will not appear as a selectable file; select that folder and click **Select Folder**.
4. Open a website and click the PageLens toolbar icon. Pin PageLens from the Extensions menu if you want it beside the address bar.

If the page says **Upload package**, choose the ZIP file instead of a folder.

Some pages cannot be inspected, including browser settings and Chrome Web Store pages. A site may block the responsive preview from embedding. Clone Page downloads a ZIP with a rendered HTML snapshot, accessible CSS rules, and assets that allow a browser fetch; blocked assets stay at their original URLs. It does not include the original project source, scripts, backend, or application behavior. Use collected content and assets only when you have permission.

## Chrome Web Store listing

Store listing text, promotional artwork, and a release checklist are in the repository root. The downloadable ZIP contains only the extension files, with `manifest.json` at its root.

Swap Fonts retrieves the full Google Fonts family list from the upstream catalog and lets you apply a family to the whole page, headings, body text, or a selected element.
