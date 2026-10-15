# Chrome Web Store listing draft

## Name

PageLens — Website Design Toolkit

## Short description

Inspect page elements, colors, typography, spacing, and assets. Export design notes and preview edits on the current tab.

## Detailed description

PageLens is a browser-based toolkit for understanding page design while you browse. On the tab you open, inspect and measure elements, review HTML and computed CSS, collect colors, typography, and asset references, and create a static HTML snapshot or Markdown design notes. Preview temporary text and layout edits, capture a visible-tab PNG, and open a responsive viewport preview.

PageLens starts only when you click its toolbar button and processes page information in your browser. It does not send page content, URLs, screenshots, or generated notes to a PageLens server. Files are saved only when you choose an export or download action.

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

## Privacy practices draft

PageLens reads website content and the current page address locally to provide user-facing inspection and export features. It does not collect or transmit that information to the developer or another service. Confirm the exact available checkboxes in the Chrome Web Store Privacy practices form before submission.
