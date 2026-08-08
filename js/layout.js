/**
 * ============================================================================
 * KAWAD SWAD - Layout Engine (js/layout.js)
 * ============================================================================
 * Production-optimized layout controller handling component injection, 
 * resilient path-aware fetching with inline fallbacks, throttled scroll dynamics, 
 * mobile navigation accessibility, active nav state, smooth anchor scrolling,
 * and dynamic asset/favicon correction.
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
    // 1. Fix old CSS path if present
    const oldCss = document.querySelector('link[href="css/design-system.css"]');
    if (oldCss) {
        oldCss.href = 'assets/css/design-system.css';
    }

    // 2. Inject clean inline favicon referencing assets/favicon/favicon.svg
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
 * Asynchronously fetches component templates with fallback protection 
 * to completely eliminate 404 errors or rendering halts in local/static environments.
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
                .then(res => {
                    if (!res.ok) throw new Error(`Header status: ${res.status}`);
                    return res.text();
                })
                .then(html => {
                    headerContainer.outerHTML = html;
                })
                .catch(() => {
                    // Fallback injection if fetch fails or CORS blocks it
                    headerContainer.outerHTML = getFallbackHeader(basePath);
                })
        );
    }

    if (footerContainer) {
        const footerPath = `${basePath}components/footer.html`.replace(/\/+/g, '/');
        fetchTasks.push(
            fetch(footerPath)
                .then(res => {
                    if (!res.ok) throw new Error(`Footer status: ${res.status}`);
                    return res.text();
                })
                .then(html => {
                    footerContainer.outerHTML = html;
                })
                .catch(() => {
                    // Fallback injection if fetch fails or CORS blocks it
                    footerContainer.outerHTML = getFallbackFooter(basePath);
                })
        );
    }

    await Promise.all(fetchTasks);
}

/**
 * Fallback Header Template matching Kawad Heritage Theme
 */
function getFallbackHeader(basePath) {
    return `
        <header class="sticky top-0 z-50 bg-[#FFFDF7]/95 backdrop-blur-md border-b border-[#F3E6C8] transition-all duration-300">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                <!-- Brand Logo -->
                <a href="${basePath}index.html" class="flex items-center gap-2 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FE330E] rounded-lg">
                    <span class="font-serif text-2xl font-bold tracking-wider text-[#4E342E] group-hover:text-[#FE330E] transition-colors duration-300">KAWAD SWAD</span>
                </a>

                <!-- Desktop Navigation -->
                <nav aria-label="Main Navigation" class="hidden xl:flex items-center space-x-5 text-xs font-semibold uppercase tracking-wider text-[#4E342E]">
                    <a href="${basePath}index.html" class="hover:text-[#FE330E] transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FE330E] rounded-lg py-1">Home</a>
                    <a href="${basePath}about.html" class="hover:text-[#FE330E] transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FE330E] rounded-lg py-1">About</a>
                    <a href="${basePath}products.html" class="hover:text-[#FE330E] transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FE330E] rounded-lg py-1">Products</a>
                    <a href="${basePath}shop.html" class="hover:text-[#FE330E] transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FE330E] rounded-lg py-1">Shop</a>
                    <a href="${basePath}business.html" class="hover:text-[#FE330E] transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FE330E] rounded-lg py-1">Business</a>
                    <a href="${basePath}manufacturing.html" class="hover:text-[#FE330E] transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FE330E] rounded-lg py-1">Manufacturing</a>
                    <a href="${basePath}gallery.html" class="hover:text-[#FE330E] transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FE330E] rounded-lg py-1">Gallery</a>
                    <a href="${basePath}blog.html" class="hover:text-[#FE330E] transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FE330E] rounded-lg py-1">Blog</a>
                    <a href="${basePath}contact.html" class="hover:text-[#FE330E] transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FE330E] rounded-lg py-1">Contact</a>
                </nav>

                <!-- Search, Cart Badge & Mobile Menu Controls -->
                <div class="flex items-center space-x-3">
                    <!-- Search Quick Button -->
                    <a href="${basePath}shop.html" class="text-[#4E342E] hover:text-[#FE330E] transition-colors duration-200 p-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FE330E] rounded-full" aria-label="Search Products">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                        </svg>
                    </a>

                    <!-- Cart Badge Link (Synchronized with js/cart.js) -->
                    <a href="${basePath}cart.html" class="relative text-[#4E342E] hover:text-[#FE330E] transition-colors duration-200 p-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FE330E] rounded-lg cta-cart" aria-label="Shopping Cart">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
                        </svg>
                        <span id="cart-badge-count" data-cart-count class="absolute top-0 right-0 bg-[#FE330E] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center pointer-events-none shadow-sm">0</span>
                    </a>

                    <!-- Mobile Menu Toggle -->
                    <button type="button" id="mobile-menu-btn" aria-controls="mobile-menu" aria-expanded="false" class="xl:hidden p-2 text-[#4E342E] hover:text-[#FE330E] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FE330E] rounded-lg transition-colors duration-200" aria-label="Toggle Navigation Menu">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
                        </svg>
                    </button>
                </div>
            </div>

            <!-- Mobile Navigation Dropdown -->
            <div id="mobile-menu" class="hidden xl:hidden bg-[#FFFDF7]/98 border-b border-[#F3E6C8] px-6 pt-3 pb-6 space-y-3 text-xs font-semibold uppercase tracking-wider text-[#4E342E] shadow-xl">
                <a href="${basePath}index.html" class="block py-2 hover:text-[#FE330E] transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FE330E] rounded-lg">Home</a>
                <a href="${basePath}about.html" class="block py-2 hover:text-[#FE330E] transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FE330E] rounded-lg">About</a>
                <a href="${basePath}products.html" class="block py-2 hover:text-[#FE330E] transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FE330E] rounded-lg">Products</a>
                <a href="${basePath}shop.html" class="block py-2 hover:text-[#FE330E] transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FE330E] rounded-lg">Shop</a>
                <a href="${basePath}business.html" class="block py-2 hover:text-[#FE330E] transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FE330E] rounded-lg">Business</a>
                <a href="${basePath}manufacturing.html" class="block py-2 hover:text-[#FE330E] transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FE330E] rounded-lg">Manufacturing</a>
                <a href="${basePath}gallery.html" class="block py-2 hover:text-[#FE330E] transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FE330E] rounded-lg">Gallery</a>
                <a href="${basePath}blog.html" class="block py-2 hover:text-[#FE330E] transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FE330E] rounded-lg">Blog</a>
                <a href="${basePath}contact.html" class="block py-2 hover:text-[#FE330E] transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FE330E] rounded-lg">Contact</a>
            </div>
        </header>
    `;
}

/**
 * Fallback Footer Template matching Kawad Heritage Theme
 */
function getFallbackFooter(basePath) {
    return `
        <footer class="bg-[#2D1F17] text-[#F5EEDC] text-sm border-t border-[#F3E6C8]/15">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
                    <!-- Brand Overview & Compliance -->
                    <div class="space-y-4 lg:col-span-2">
                        <span class="font-serif text-2xl font-bold text-white tracking-wider">KAWAD SWAD</span>
                        <p class="text-xs text-[#F5EEDC]/80 leading-relaxed max-w-sm font-light">
                            Manufacturer of premium Jain Papads delivering pure taste and traditional excellence from Nimar. Committed to quality, hygiene, and authentic flavors.
                        </p>
                        <div class="pt-2 text-xs space-y-1 text-[#F5EEDC]/70 font-mono">
                            <p>FSSAI Lic No: 21425890001224</p>
                            <p>GSTIN: 23AIAPJ3923D1ZX</p>
                            <p>Udyam Reg: UDYAM-MP-28-0044363</p>
                        </div>
                    </div>

                    <!-- Quick Links -->
                    <nav aria-label="Quick Links">
                        <h4 class="text-xs font-semibold uppercase tracking-widest text-white mb-4">Quick Links</h4>
                        <ul class="space-y-2.5 text-xs font-light">
                            <li><a href="${basePath}index.html" class="hover:text-[#FBEC0A] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FE330E]">Home</a></li>
                            <li><a href="${basePath}about.html" class="hover:text-[#FBEC0A] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FE330E]">About Us</a></li>
                            <li><a href="${basePath}products.html" class="hover:text-[#FBEC0A] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FE330E]">Products</a></li>
                            <li><a href="${basePath}shop.html" class="hover:text-[#FBEC0A] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FE330E]">Shop</a></li>
                            <li><a href="${basePath}contact.html" class="hover:text-[#FBEC0A] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FE330E]">Contact Us</a></li>
                        </ul>
                    </nav>

                    <!-- Business & Media Links -->
                    <nav aria-label="Business & Media">
                        <h4 class="text-xs font-semibold uppercase tracking-widest text-white mb-4">Business &amp; Media</h4>
                        <ul class="space-y-2.5 text-xs font-light">
                            <li><a href="${basePath}business.html" class="hover:text-[#FBEC0A] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FE330E]">Business Solutions</a></li>
                            <li><a href="${basePath}distributor.html" class="hover:text-[#FBEC0A] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FE330E]">Distributor Portal</a></li>
                            <li><a href="${basePath}bulk.html" class="hover:text-[#FBEC0A] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FE330E]">Bulk Orders</a></li>
                            <li><a href="${basePath}media.html" class="hover:text-[#FBEC0A] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FE330E]">Media &amp; Press</a></li>
                            <li><a href="${basePath}work-with-us.html" class="hover:text-[#FBEC0A] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FE330E]">Work With Us</a></li>
                            <li><a href="${basePath}manufacturing.html" class="hover:text-[#FBEC0A] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FE330E]">Manufacturing</a></li>
                            <li><a href="${basePath}gallery.html" class="hover:text-[#FBEC0A] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FE330E]">Gallery</a></li>
                            <li><a href="${basePath}blog.html" class="hover:text-[#FBEC0A] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FE330E]">Blog &amp; Recipes</a></li>
                        </ul>
                    </nav>

                    <!-- Support & Legal Links -->
                    <nav aria-label="Support & Legal">
                        <h4 class="text-xs font-semibold uppercase tracking-widest text-white mb-4">Support &amp; Legal</h4>
                        <ul class="space-y-2.5 text-xs font-light">
                            <li><a href="${basePath}faq.html" class="hover:text-[#FBEC0A] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FE330E]">FAQ</a></li>
                            <li><a href="${basePath}policies.html" class="hover:text-[#FBEC0A] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FE330E]">Privacy Policy</a></li>
                            <li><a href="${basePath}policies.html#terms-and-conditions" class="hover:text-[#FBEC0A] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FE330E]">Terms &amp; Conditions</a></li>
                            <li><a href="${basePath}policies.html#shipping-policy" class="hover:text-[#FBEC0A] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FE330E]">Shipping &amp; Returns</a></li>
                        </ul>
                    </nav>
                </div>

                <!-- Newsletter Section -->
                <div class="mt-12 pt-8 border-t border-[#F3E6C8]/15 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    <div>
                        <h5 class="text-xs font-semibold uppercase tracking-wider text-white">Subscribe to Our Newsletter</h5>
                        <p class="text-xs text-[#F5EEDC]/80 mt-1 font-light">Receive authentic Jain recipes and business updates directly.</p>
                    </div>
                    <form data-form="newsletter" novalidate class="flex gap-2">
                        <input type="email" placeholder="Enter your email" required aria-label="Email address for newsletter" class="bg-[#1E1510] border border-[#F3E6C8]/30 rounded-lg px-4 py-3 text-xs text-white focus:outline-none focus:border-[#FE330E] focus-visible:ring-2 focus-visible:ring-[#FE330E] flex-grow">
                        <button type="submit" class="px-6 py-3 bg-[#FE330E] text-white font-semibold text-xs uppercase tracking-wider rounded-lg hover:bg-[#D92500] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FE330E] shadow-lg cta-newsletter">
                            Subscribe
                        </button>
                    </form>
                </div>

                <!-- Copyright & Social Deep Links -->
                <div class="mt-12 pt-8 border-t border-[#F3E6C8]/15 flex flex-col sm:flex-row justify-between items-center text-xs text-[#F5EEDC]/70 font-light gap-4">
                    <p>&copy; 2026 KAWAD SWAD Udhyog. All rights reserved.</p>
                    <div class="flex space-x-6">
                        <a href="https://wa.me/919630976867?text=Hello%20Kawad%20Swad%20Team%2C%0A%0AI%20am%20visiting%20your%20website%20and%20need%20assistance." target="_blank" rel="noopener noreferrer" class="hover:text-[#FBEC0A] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FE330E] cta-whatsapp">WhatsApp</a>
                        <a href="${basePath}contact.html" class="hover:text-[#FBEC0A] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FE330E] cta-contact">Support</a>
                    </div>
                </div>
            </div>
        </footer>
    `;
}

/**
 * Mobile Navigation controller with keyboard trap prevention and accessibility controls.
 */
function initMobileMenu() {
    const header = document.querySelector('header');
    if (!header || header.dataset.mobileMenuBound) return;
    header.dataset.mobileMenuBound = 'true';

    header.addEventListener('click', (e) => {
        const toggleBtn = e.target.closest('button[aria-label="Toggle Navigation"], button[aria-label="Toggle Navigation Menu"], #mobile-menu-btn, #mobile-menu-button');
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
            const toggle = document.querySelector('button[aria-label="Toggle Navigation"], button[aria-label="Toggle Navigation Menu"], #mobile-menu-btn, #mobile-menu-button');
            if (toggle) toggle.setAttribute('aria-expanded', 'false');
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const mobileMenu = document.getElementById('mobile-menu');
            if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
                mobileMenu.classList.add('hidden');
                const toggle = document.querySelector('button[aria-label="Toggle Navigation"], button[aria-label="Toggle Navigation Menu"], #mobile-menu-btn, #mobile-menu-button');
                if (toggle) {
                    toggle.setAttribute('aria-expanded', 'false');
                    toggle.focus();
                }
            }
        }
    });

    document.addEventListener('click', (e) => {
        const mobileMenu = document.getElementById('mobile-menu');
        const toggleBtn = document.querySelector('button[aria-label="Toggle Navigation"], button[aria-label="Toggle Navigation Menu"], #mobile-menu-btn, #mobile-menu-button');
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
            link.classList.add('text-[#FE330E]', 'font-semibold');
            link.classList.remove('hover:text-[#FE330E]');
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
                    header.classList.add('shadow-md', 'bg-[#FFFDF7]/95');
                    header.classList.remove('bg-[#FFFDF7]/90');
                } else {
                    header.classList.remove('shadow-md', 'bg-[#FFFDF7]/95');
                    header.classList.add('bg-[#FFFDF7]/90');
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
        backToTopBtn.className = 'fixed bottom-6 right-6 z-40 p-3 bg-[#2D1F17] text-[#E6B800] rounded-full shadow-lg border border-[#E6B800]/30 opacity-0 pointer-events-none transition-all duration-300 hover:bg-[#E6B800] hover:text-[#2D1F17] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FE330E]';
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
