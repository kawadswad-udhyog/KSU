Markdown
# KAWAD SWAD - Premium Jain Papad Website

**Version:** 1.0.0  
**License:** Proprietary - KAWAD SWAD Udhyog  
**Brand:** KAWAD SWAD  
**FSSAI Lic No:** 21425890001224  

---

## Project Overview

KAWAD SWAD is a modern, responsive, high-performance, and accessible web application designed for a premium FMCG Jain Papad manufacturer. Built with semantic HTML5, Tailwind CSS, and modular Vanilla JavaScript, the platform features a complete direct-to-consumer store, B2B inquiry portals, manufacturing process showcase, interactive blog/recipes journal, and comprehensive SEO architecture.

---

## Directory & File Structure

.
├── components/
│   ├── header.html            # Global Reusable Header Component
│   └── footer.html            # Global Reusable Footer Component
├── data/
│   └── products.json          # Master Product Database (43 SKUs - Single Source of Truth)
├── js/
│   ├── layout.js              # Path-aware Header/Footer Async Loader, Mobile Nav, Scroll Engine
│   ├── main.js                # Validation Engine, Form Payloads, Accordions, Animations
│   ├── cart.js                # LocalStorage Cart Manager, Image Thumbnails, Shipping Calculator
│   └── shop.js                # Path-aware Database Loader, Search, Filters, Sorting, Details Engine
├── assets/
│   ├── favicon/               # Multi-platform Favicons & Touch Icons
│   └── images/                # Product, Factory, and Graphic Assets
│       └── products/          # Master Product Image Assets (MMP.png, MMPG.png, etc.)
├── index.html                 # Homepage
├── about.html                 # Brand Story, Mission, Vision, and Values
├── products.html              # Full Product Catalogue Grid
├── product-detail.html        # Dynamic Product Details Template
├── shop.html                  # Direct Store with Live Filtering & Sorting
├── cart.html                  # Shopping Cart Review & Item Updates
├── checkout.html              # Order Checkout & Customer Data Form
├── order-success.html          # Order Confirmation & Next Steps
├── business.html              # B2B Distributorship & Private Label Portal
├── manufacturing.html         # Factory Process & Quality Control Highlights
├── gallery.html               # Factory, Product & Event Photo/Video Gallery
├── reviews.html               # Customer & Business Testimonials
├── blog.html                  # Recipes, Cooking Tips & Knowledge Center
├── blog-detail.html           # Master Article / Recipe Template
├── contact.html               # Contact Form & Communication Channels
├── faq.html                   # Accordion-based Knowledge Base
├── policies.html              # Legal Center (Privacy, Terms, Returns, Shipping)
├── 404.html                   # Custom Page Not Found Template
├── robots.txt                 # Search Engine Crawler Instructions
├── sitemap.xml                # XML Sitemap for Search Indexing
└── site.webmanifest           # Web Application Manifest


---

## Technical Stack & Features

- **Frontend Core:** Semantic HTML5, Tailwind CSS (via CDN with custom color scheme tokens), Modular Vanilla JavaScript (ES6+).
- **Architecture:** Zero build-step / zero bundler framework. Shared component dynamic loader (`components/header.html` and `components/footer.html`).
- **Product Engine:** 43 frozen SKUs stored in `data/products.json`. Dynamic catalogue filtering by category (Moong, Chana, Urad, Combo) and weight (200g, 235g, 500g, 1000g), debounced search (`200ms`), and sorting (Price, Name, Default Order).
- **Cart Engine:** Persistent LocalStorage manager (`CART_VERSION: 1`) supporting line-item updates, image thumbnail preservation, price sanitation, shipping calculations, and badge counter synchronization.
- **Form & Communication System:** Client-side validation engine supporting Indian Mobile (10-digit) and PIN Code (6-digit) verification, ARIA live region error announcements (`role="alert"`, `aria-live="polite"`), structured JSON payload output in browser console (`schemaVersion: 1`), and deep-linked WhatsApp/Tel/Mailto integrations.
- **Accessibility:** Screen-reader accessible controls, visible focus indicators, WCAG AA color contrast compliance, and `@media (prefers-reduced-motion: reduce)` animation handling.

---

## Local Development & Deployment

### Running Locally
No Node.js compilation step is required. Serve the root directory using any local web server:

```bash
# Python 3 Built-in HTTP Server
python -m http.server 8000
