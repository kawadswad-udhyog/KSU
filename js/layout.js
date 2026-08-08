/**
 * ============================================================================
 * KAWAD SWAD - Layout Engine (js/layout.js)
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', async () => {
    // 0. Auto-correct asset paths and inject clean inline favicon dynamically
    initAssetCorrections();

    // 1. Asynchronously load layout components and wait for DOM injection or fallback
    await loadLayoutComponents();

    // 2. Initialize layout features AFTER DOM components are injected
    initMobileMenu();
    initActiveNavHighlight();
    initStickyHeader();
    initBackToTop();
    initSmoothScroll();
});

/**
 * Automatically corrects missing stylesheet paths and injects a clean inline SVG favicon.
 */
function initAssetCorrections() {
    const oldCss = document.querySelector('link[href="css/design-system.css"]');
    if (oldCss) {
        oldCss.href = 'assets/css/design-system.css';
    }

    const existingFavicon = document.querySelector('link[rel="icon"]');
    if (!existingFavicon || existingFavicon.href.includes('favicon') || existingFavicon.href.startsWith('data:image/svg+xml')) {
        if (existingFavicon) existingFavicon.remove();
        
        const newFavicon = document.createElement('link');
        newFavicon.rel = 'icon';
        newFavicon.type = 'image/svg+xml';
        newFavicon.href = 'assets/favicon/favicon.svg';
        document.head.appendChild(newFavicon);
    }
}

/**
 * Asynchronously fetches component templates and injects global dependencies (forms.js)
 */
async function loadLayoutComponents() {
    const headerContainer = document.querySelector('header-component, #header-container');
    const footerContainer = document.querySelector('footer-component, #footer-container');

    const pathSegments = window.location.pathname.split('/').filter(Boolean);
    const isGitHubPages = pathSegments.length > 0 && pathSegments[0] === 'KSU';
    const basePath = isGitHubPages ? '/KSU/' : '/';

    const fetchTasks = [];

    if (headerContainer) {
        const headerPath = `${basePath}components/header.html`.replace(/\/+/g, '/');
        fetchTasks.push(
            fetch(headerPath)
                .then(res => res.ok ? res.text() : Promise.reject())
                .then(html => headerContainer.outerHTML = html)
                .catch(() => headerContainer.outerHTML = getFallbackHeader(basePath))
        );
    }

    if (footerContainer) {
        const footerPath = `${basePath}components/footer.html`.replace(/\/+/g, '/');
        fetchTasks.push(
            fetch(footerPath)
                .then(res => res.ok ? res.text() : Promise.reject())
                .then(html => {
                    footerContainer.outerHTML = html;
                    injectGlobalScripts(); // Inject forms.js after footer loads
                })
                .catch(() => {
                    footerContainer.outerHTML = getFallbackFooter(basePath);
                    injectGlobalScripts(); // Inject forms.js after fallback footer loads
                })
        );
    }

    await Promise.all(fetchTasks);
}

/**
 * Ensures global scripts like forms.js are loaded exactly once.
 */
function injectGlobalScripts() {
    if (!document.querySelector('script[src*="js/forms.js"]')) {
        const script = document.createElement('script');
        script.src = 'js/forms.js';
        script.async = true;
        document.body.appendChild(script);
    }
}

// ... (Keep your getFallbackHeader, getFallbackFooter, and other init functions below as they were)
