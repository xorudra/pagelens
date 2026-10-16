# Chrome Web Store listing draft

## Name

PageLens

## Short description

Inspect page elements, colors, typography, spacing, and assets. Export design notes and preview edits on the current tab.

## Detailed description

PageLens is a browser-based toolkit for understanding page design while you browse. Pick an element to preview it safely and inspect its HTML and computed CSS. Preview a rendered page snapshot before downloading its HTML, styles, and accessible assets. Build a visual Design MD reference or a structured design prompt, collect colors, inspect typography by hovering over text, and filter or bundle page assets.

Preview temporary text and layout edits, measure dimensions and spacing, and undo page experiments. Capture a visible area, full page, snip, or element; wait for lazy content, crop, annotate, blur, add a frame or background, and export PNG, JPG, WebP, or PDF. Compare responsive previews at built-in or custom widths, adjust their scale, arrange them, and save reference screenshots. Choose a bottom dock or sidebar and reorder the toolbar.

PageLens starts only when you click its toolbar button and processes page information in your browser. It does not send page content, URLs, screenshots, or generated notes to a PageLens server. Swap Fonts loads the public family list from Google's fonts repository when opened; applying a Google font requests it from Google Fonts. Clone Page fetches assets directly from their source hosts when browser access permits. Files are saved only when you choose an export or download action.

Some pages, including Chrome internal pages and Chrome Web Store pages, cannot be inspected. Sites may block an embedded responsive preview. Static snapshots do not reproduce a site's backend or application behavior. Use collected content and assets only when you have permission.

## Listing details

- Category: Developer Tools
- Language: English
- Price: Free
- Homepage: https://github.com/xorudra/pagelens
- Support: https://github.com/xorudra/pagelens/issues
- Privacy policy: https://github.com/xorudra/pagelens/blob/main/PRIVACY.md
- Small promotional image: `promo-small.png` (440 × 280)
- At least one actual product screenshot is still needed for the listing.

## Permission justifications

- `activeTab`: limit page access to the tab the user explicitly opens PageLens on.
- `scripting`: inject PageLens's inspection interface after the user clicks its toolbar button.
- `downloads`: save a screenshot, export, or selected asset only when the user chooses that action.
- `storage`: save local workspace preferences such as toolbar position, tool order, and preview defaults.

## Privacy practices draft

PageLens reads website content and the current page address locally to provide inspection and export features. It does not send page content, page addresses, screenshots, or notes to the developer or a PageLens server. Opening Swap Fonts requests a public font family list from Google's fonts repository; applying a font makes a request to Google Fonts, and Clone Page may request selected assets from their source hosts. Confirm the exact available checkboxes in the Chrome Web Store Privacy practices form before submission.
