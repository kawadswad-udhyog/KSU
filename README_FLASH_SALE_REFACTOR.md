Refactor: extract assets for flash-sale page (tailwind placeholder, page css, extracted JS)

- Added assets/css/tailwind.css (placeholder; replace with real Tailwind build for production)
- Added assets/css/flash-sale.css (page styles)
- Added assets/js/flash-sale.js (extracted & minified behavior)
- Updated flash-sale.html to load external assets and include CSP and JSON-LD
- Left NBSP-named file as a small redirect note (cannot delete files via this commit tool); please remove if desired
