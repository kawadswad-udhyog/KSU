/**
 * ============================================================================
 * KAWAD SWAD - Layout Engine (layout.js)
 * ============================================================================
 * Manages global structural behaviors: Mobile Navigation, Active Link Highlighting,
 * Sticky Header Dynamics, Back to Top Floating Button, and Smooth Scrolling.
 */

document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    initActiveNavHighlight();
    initStickyHeader();
    initBackToTop();
    initSmoothScroll();
});

/**
 * Handles mobile hamburger menu toggle and auto-closes menu upon selecting a link.
 */
function initMobileMenu() {
    const menuToggleBtn = document.querySelector('button[aria-label="Toggle Navigation"]');
    const mobileMenu = document.getElementById('mobile-menu');

    if (!menuToggleBtn || !mobileMenu) return;

    menuToggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isHidden = mobileMenu.classList.contains('hidden');
        if (isHidden) {
            mobileMenu.classList.remove('hidden');
            mobileMenu.classList.add('slide-up');
        } else {
            mobileMenu.classList.add('hidden');
            mobileMenu.classList.remove('slide-up');
        }
    });

    // Close menu when clicking any link inside mobile navigation
    mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.add('hidden');
        });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!mobileMenu.contains(e.target) && !menuToggleBtn.contains(e.target)) {
            mobileMenu.classList.add('hidden');
        }
    });
}

/**
 * Dynamically highlights current page's active link in desktop and mobile navigation.
 */
function initActiveNavHighlight() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('header nav a, #mobile-menu a');

    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPath || (currentPath === '' && href === 'index.html')) {
            link.classList.add('text-brand-gold', 'font-semibold');
            link.classList.remove('hover:text-brand-gold');
        }
    });
}

/**
 * Enhances sticky header visual weight on scroll down.
 */
function initStickyHeader() {
    const header = document.querySelector('header');
    if (!header) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
            header.classList.add('shadow-md', 'bg-brand-cream/95');
            header.classList.remove('bg-brand-cream/90');
        } else {
            header.classList.remove('shadow-md', 'bg-brand-cream/95');
            header.classList.add('bg-brand-cream/90');
        }
    }, { passive: true });
}

/**
 * Creates and inserts a Back to Top button dynamically into the DOM.
 */
function initBackToTop() {
    // Avoid creating duplicate button
    if (document.getElementById('back-to-top')) return;

    const backToTopBtn = document.createElement('button');
    backToTopBtn.id = 'back-to-top';
    backToTopBtn.ariaLabel = 'Back to Top';
    backToTopBtn.className = 'fixed bottom-6 right-6 z-40 p-3 bg-brand-dark text-brand-gold rounded-full shadow-lg border border-brand-gold/30 opacity-0 pointer-events-none transition-all duration-300 hover:bg-brand-gold hover:text-brand-dark focus:outline-none';
    backToTopBtn.innerHTML = `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"/>
        </svg>
    `;

    document.body.appendChild(backToTopBtn);

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTopBtn.classList.remove('opacity-0', 'pointer-events-none');
            backToTopBtn.classList.add('opacity-100', 'pointer-events-auto');
        } else {
            backToTopBtn.classList.add('opacity-0', 'pointer-events-none');
            backToTopBtn.classList.remove('opacity-100', 'pointer-events-auto');
        }
    }, { passive: true });

    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

/**
 * Ensures smooth anchor link navigation across all internal page jumps.
 */
function initSmoothScroll() {
    document.addEventListener('click', (e) => {
        const targetAnchor = e.target.closest('a[href^="#"]');
        if (!targetAnchor) return;

        const hash = targetAnchor.getAttribute('href');
        if (hash === '#') return;

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
        }
    });
}
