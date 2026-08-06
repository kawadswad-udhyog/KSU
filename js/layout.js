/**
 * ============================================================================
 * KAWAD SWAD - Layout Engine (js/layout.js)
 * ============================================================================
 * Handles component injection (Header/Footer), sticky header dynamics,
 * mobile navigation toggles, active page highlighting, back-to-top button,
 * and smooth scrolling across all pages.
 */

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Load HTML components asynchronously before initializing dependent UI
    await loadLayoutComponents();

    // 2. Initialize layout features
    initMobileMenu();
    initActiveNavHighlight();
    initStickyHeader();
    initBackToTop();
    initSmoothScroll();
});

/**
 * Fetches and injects shared Header and Footer components if component containers exist,
 * or verifies inline elements before resolving.
 */
async function loadLayoutComponents() {
    const headerContainer = document.querySelector('header-component, #header-container');
    const footerContainer = document.querySelector('footer-component, #footer-container');

    const fetchTasks = [];

    if (headerContainer) {
        fetchTasks.push(
            fetch('components/header.html')
                .then(res => {
                    if (!res.ok) throw new Error(`Header status: ${res.status}`);
                    return res.text();
                })
                .then(html => {
                    headerContainer.outerHTML = html;
                })
                .catch(err => console.warn('Could not load header component:', err))
        );
    }

    if (footerContainer) {
        fetchTasks.push(
            fetch('components/footer.html')
                .then(res => {
                    if (!res.ok) throw new Error(`Footer status: ${res.status}`);
                    return res.text();
                })
                .then(html => {
                    footerContainer.outerHTML = html;
                })
                .catch(err => console.warn('Could not load footer component:', err))
        );
    }

    await Promise.all(fetchTasks);
}

/**
 * Handles mobile navigation menu toggling and auto-closing with event delegation.
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
            } else {
                mobileMenu.classList.add('hidden');
                mobileMenu.classList.remove('slide-up');
            }
            return;
        }

        // Close menu if a link inside mobile navigation is clicked
        const mobileLink = e.target.closest('#mobile-menu a');
        if (mobileLink && mobileMenu) {
            mobileMenu.classList.add('hidden');
        }
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        const mobileMenu = document.getElementById('mobile-menu');
        const toggleBtn = document.querySelector('button[aria-label="Toggle Navigation"]');
        if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
            if (!mobileMenu.contains(e.target) && (!toggleBtn || !toggleBtn.contains(e.target))) {
                mobileMenu.classList.add('hidden');
            }
        }
    });
}

/**
 * Highlights current active navigation link based on the window path.
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
 * Enhances header backdrop and shadow state dynamically upon scrolling.
 */
function initStickyHeader() {
    const header = document.querySelector('header');
    if (!header || header.dataset.stickyBound) return;
    header.dataset.stickyBound = 'true';

    const handleScroll = () => {
        if (window.scrollY > 20) {
            header.classList.add('shadow-md', 'bg-brand-cream/95');
            header.classList.remove('bg-brand-cream/90');
        } else {
            header.classList.remove('shadow-md', 'bg-brand-cream/95');
            header.classList.add('bg-brand-cream/90');
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
        backToTopBtn.className = 'fixed bottom-6 right-6 z-40 p-3 bg-brand-dark text-brand-gold rounded-full shadow-lg border border-brand-gold/30 opacity-0 pointer-events-none transition-all duration-300 hover:bg-brand-gold hover:text-brand-dark focus:outline-none';
        backToTopBtn.innerHTML = `
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"/>
            </svg>
        `;
        document.body.appendChild(backToTopBtn);
    }

    if (backToTopBtn.dataset.bound) return;
    backToTopBtn.dataset.bound = 'true';

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
 * Handles smooth scrolling for all internal hash anchor links.
 */
function initSmoothScroll() {
    if (document.dataset.smoothScrollBound) return;
    document.dataset.smoothScrollBound = 'true';

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
        }
    });
}
