# PageLens

PageLens is a Manifest V3 Chrome extension for inspecting page design and collecting references from the current tab. Click the toolbar button to open its tools; PageLens does not run on a page until you invoke it.

## Included tools

- Pick an element, preview it safely, and copy or save its HTML and computed CSS
- Preview a rendered page snapshot, browse syntax-highlighted, line-numbered contents of every text file in the ZIP (HTML, CSS, JSON, README, and text assets), inspect binary asset previews, search, copy, or save files, and choose which asset categories to include
- Generate a visual Design MD reference with colors, typography, and spacing, or create an editable, detailed design prompt with page sections, measured layout, controls, responsive rules, goal, audience, and preferred stack
- Filter and search images, SVGs, video, and CSS backgrounds; copy URLs, save one file, or bundle selected assets
- Extract a page color palette and typography styles; hover over text to inspect font family, size, weight, and line height
- Preview popular or custom Google Fonts across the page, headings, body text, or a selected element
- Inspect element size, spacing, computed styles, and point-to-point distance
- Preview text edits, reorder or remove elements, and undo recent page edits
- Capture visible, full-page, selected-area, or selected-element screenshots; wait for lazy content, cancel a long capture, crop, annotate, blur, and add a frame or background
- Export captures as PNG, JPG, WebP, or PDF
- Compare responsive previews at built-in or custom widths; arrange previews, adjust their scale, and save a viewport reference image
- Choose a bottom dock or right sidebar, reorder tools, and save capture and viewport defaults

PageLens processes page information in your browser. It does not send page content, URLs, screenshots, or generated notes to a PageLens server. Swap Fonts loads the public Google Fonts family list from Google's fonts repository when opened; applying a font requests it from Google Fonts. Clone Page lets you independently choose whether images/assets, fonts, and video/audio are copied into its ZIP. Selected files are requested directly from their source hosts; cross-origin restrictions and size limits may prevent some from being copied. Clone choices and other preferences are stored locally by Chrome. See the [Privacy Policy](PRIVACY.md).

## Preview without installing

Open the [live PageLens preview](https://xorudra.github.io/pagelens/preview.html). It runs the same `content.js` used by the extension on a built-in sample website. Use the toolbar centered along the bottom by default, or switch to a right sidebar in Workspace settings.

Screenshot capture and responsive reference capture require the installed extension because the browser preview cannot access Chrome’s screenshot API. The preview can show the tools and save workspace settings in this browser.

## Permissions

- `activeTab` and `scripting` let PageLens inspect and display tools on the current tab after you click the extension.
- `downloads` saves exports, screenshots, and assets when you choose to download them.
- `storage` saves the toolbar position, tool order, screenshot default, responsive widths, and Clone Page inclusion choices on this device.
- PageLens does not request access to all websites or run analytics. Optional font and asset requests go directly to their source hosts.

## Install in Chrome

1. [Download PageLens](https://github.com/xorudra/pagelens/raw/refs/heads/main/pagelens.zip) and extract the ZIP.
2. In Chrome, open `chrome://extensions`, turn on **Developer mode**, then choose **Load unpacked**.
3. Select the extracted PageLens folder whose top level contains `manifest.json`. The folder picker selects a folder, so `manifest.json` will not appear as a selectable file; select that folder and click **Select Folder**.
4. Open a website and click the PageLens toolbar icon. Pin PageLens from the Extensions menu if you want it beside the address bar.

If you already installed an earlier ZIP, download and extract the updated ZIP, then click **Reload** for PageLens on `chrome://extensions` so Chrome uses the fixed files.

If the page says **Upload package**, choose the ZIP file instead of a folder.

Some pages cannot be inspected, including browser settings and Chrome Web Store pages. A site may block the responsive preview from embedding. Full-page capture is limited to 40 screens and may repeat sticky elements. Clone Page downloads a ZIP with a rendered HTML snapshot, accessible CSS rules, and only the selected image/assets, fonts, and media that the browser can fetch. Unselected or blocked files stay linked to their original URLs. It does not include the original project source, scripts, backend, or application behavior. Use collected content and assets only when you have permission.

## Chrome Web Store listing

Store listing text, promotional artwork, and a release checklist are in the repository root. The downloadable ZIP contains only the extension files, with `manifest.json` at its root.

Swap Fonts retrieves the full Google Fonts family list from the upstream catalog and lets you apply a family to the whole page, headings, body text, or a selected element.
