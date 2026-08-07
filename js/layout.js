/**
 * ============================================================================
 * KAWAD SWAD - Layout Engine (js/layout.js)
 * ============================================================================
 * Production-optimized layout controller handling component injection, 
 * path-aware fetching, throttled scroll dynamics, mobile navigation accessibility,
 * active nav state, and smooth anchor scrolling.
 */

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Asynchronously load layout components and wait for DOM injection
    await loadLayoutComponents();

    // 2. Initialize layout features AFTER DOM components are injected
    initMobileMenu();
    initActiveNavHighlight();
    initStickyHeader();
    initBackToTop();
    initSmoothScroll();
});

/**
 * Asynchronously fetches and replaces component placeholders with resilient path awareness
 * for both local environments and hosted subfolders (e.g., GitHub Pages /KSU/).
 */
async function loadLayoutComponents() {
    const headerContainer = document.querySelector('header-component, #header-container');
    const footerContainer = document.querySelector('footer-component, #footer-container');

    // Resolve current root/base path accurately
    const pathSegments = window.location.pathname.split('/').filter(Boolean);
    const isGitHubPages = pathSegments.length > 0 && pathSegments[0] === 'KSU';
    const basePath = isGitHubPages ? '/KSU/' : '/';

    const fetchTasks = [];

    if (headerContainer) {
        const headerPath = `${basePath}components/header.html`.replace(/\/+/g, '/');
        fetchTasks.push(
            fetch(headerPath)
                .then(res => {
                    if (!res.ok) throw new Error(`Header component status: ${res.status}`);
                    return res.text();
                })
                .then(html => {
                    headerContainer.outerHTML = html;
                })
                .catch(err => {
                    console.warn('Unable to load dynamic header component:', err);
                })
        );
    }

    if (footerContainer) {
        const footerPath = `${basePath}components/footer.html`.replace(/\/+/g, '/');
        fetchTasks.push(
            fetch(footerPath)
                .then(res => {
                    if (!res.ok) throw new Error(`Footer component status: ${res.status}`);
                    return res.text();
                })
                .then(html => {
                    footerContainer.outerHTML = html;
                })
                .catch(err => {
                    console.warn('Unable to load dynamic footer component:', err);
                })
        );
    }

    await Promise.all(fetchTasks);
}

/**
 * Mobile Navigation controller with keyboard trap prevention and accessibility controls.
 */
function initMobileMenu() {
    const header = document.querySelector('header');
    if (!header || header.dataset.mobileMenuBound) return;
    header.dataset.mobileMenuBound = 'true';

    header.addEventListener('click', (e) => {
        const toggleBtn = e.target.closest('button[aria-label="Toggle Navigation"]');
        const mobileMenu = document.getElementById('mobile-menu');

        if (toggleBtn && mobileMenu) {
            e.stopPropagation();
            const isHidden = mobileMenu.classList.contains('hidden');
            if (isHidden) {
                mobileMenu.classList.remove('hidden');
                mobileMenu.classList.add('slide-up');
                toggleBtn.setAttribute('aria-expanded', 'true');
            } else {
                mobileMenu.classList.add('hidden');
                mobileMenu.classList.remove('slide-up');
                toggleBtn.setAttribute('aria-expanded', 'false');
            }
            return;
        }

        const mobileLink = e.target.closest('#mobile-menu a');
        if (mobileLink && mobileMenu) {
            mobileMenu.classList.add('hidden');
            const toggle = document.querySelector('button[aria-label="Toggle Navigation"]');
            if (toggle) toggle.setAttribute('aria-expanded', 'false');
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const mobileMenu = document.getElementById('mobile-menu');
            if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
                mobileMenu.classList.add('hidden');
                const toggle = document.querySelector('button[aria-label="Toggle Navigation"]');
                if (toggle) {
                    toggle.setAttribute('aria-expanded', 'false');
                    toggle.focus();
                }
            }
        }
    });

    document.addEventListener('click', (e) => {
        const mobileMenu = document.getElementById('mobile-menu');
        const toggleBtn = document.querySelector('button[aria-label="Toggle Navigation"]');
        if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
            if (!mobileMenu.contains(e.target) && (!toggleBtn || !toggleBtn.contains(e.target))) {
                mobileMenu.classList.add('hidden');
                if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'false');
            }
        }
    });
}

/**
 * Highlights active page navigation link using normalized pathname comparison.
 */
function initActiveNavHighlight() {
    const rawPath = window.location.pathname;
    const currentPath = rawPath.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('header nav a, #mobile-menu a');

    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (!href) return;

        const cleanHref = href.split('/').pop();
        const isMatch = cleanHref === currentPath || (currentPath === '' && cleanHref === 'index.html') || (rawPath.endsWith('/') && cleanHref === 'index.html');

        if (isMatch) {
            link.classList.add('text-brand-gold', 'font-semibold');
            link.classList.remove('hover:text-brand-gold');
            link.setAttribute('aria-current', 'page');
        }
    });
}

/**
 * Header scroll state manager throttled via requestAnimationFrame.
 */
function initStickyHeader() {
    const header = document.querySelector('header');
    if (!header || header.dataset.stickyBound) return;
    header.dataset.stickyBound = 'true';

    let ticking = false;

    const handleScroll = () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                if (window.scrollY > 20) {
                    header.classList.add('shadow-md', 'bg-brand-cream/95');
                    header.classList.remove('bg-brand-cream/90');
                } else {
                    header.classList.remove('shadow-md', 'bg-brand-cream/95');
                    header.classList.add('bg-brand-cream/90');
                }
                ticking = false;
            });
            ticking = true;
        }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
}

/**
 * Injects and manages the Back To Top button behavior.
 */
function initBackToTop() {
    let backToTopBtn = document.getElementById('back-to-top');

    if (!backToTopBtn) {
        backToTopBtn = document.createElement('button');
        backToTopBtn.id = 'back-to-top';
        backToTopBtn.type = 'button';
        backToTopBtn.setAttribute('aria-label', 'Back to Top');
        backToTopBtn.className = 'fixed bottom-6 right-6 z-40 p-3 bg-brand-dark text-brand-gold rounded-full shadow-lg border border-brand-gold/30 opacity-0 pointer-events-none transition-all duration-300 hover:bg-brand-gold hover:text-brand-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold';
        backToTopBtn.innerHTML = `
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"/>
            </svg>
        `;
        document.body.appendChild(backToTopBtn);
    }

    if (backToTopBtn.dataset.bound) return;
    backToTopBtn.dataset.bound = 'true';

    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                if (window.scrollY > 300) {
                    backToTopBtn.classList.remove('opacity-0', 'pointer-events-none');
                    backToTopBtn.classList.add('opacity-100', 'pointer-events-auto');
                } else {
                    backToTopBtn.classList.add('opacity-0', 'pointer-events-none');
                    backToTopBtn.classList.remove('opacity-100', 'pointer-events-auto');
                }
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });

    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

/**
 * Handles accessible smooth scrolling for all internal anchor jumps.
 */
function initSmoothScroll() {
    const root = document.documentElement;
    if (root.dataset.smoothScrollBound) return;
    root.dataset.smoothScrollBound = 'true';

    document.addEventListener('click', (e) => {
        const targetAnchor = e.target.closest('a[href^="#"]');
        if (!targetAnchor) return;

        const hash = targetAnchor.getAttribute('href');
        if (!hash || hash === '#') return;

        const targetEl = document.querySelector(hash);
        if (targetEl) {
            e.preventDefault();
            const headerOffset = 90;
            const elementPosition = targetEl.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });

            if (!targetEl.hasAttribute('tabindex')) {
                targetEl.setAttribute('tabindex', '-1');
            }
            targetEl.focus({ preventScroll: true });
        }
    });
}
