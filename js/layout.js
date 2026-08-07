/**
 * ============================================================================
 * KAWAD SWAD - Path-Aware Layout Loader (Theme: Kawad Heritage)
 * ============================================================================
 * Dynamically injects the header and footer components with correct relative paths.
 */

class HeaderComponent extends HTMLElement {
    connectedCallback() {
        // Determine root path based on current location depth
        const depth = window.location.pathname.split('/').length - 2;
        const prefix = depth > 0 ? '../'.repeat(depth) : '';

        this.innerHTML = `
        <header class="sticky top-0 z-40 bg-[#FFF9F0]/95 backdrop-blur-md border-b border-[#E7DCC7]">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                <!-- Brand Logo -->
                <a href="${prefix}index.html" class="flex items-center gap-3 group focus:outline-none">
                    <span class="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#4E342E] group-hover:text-[#C62828] transition-colors">
                        KAWAD <span class="text-[#C62828] italic">SWAD</span>
                    </span>
                </a>

                <!-- Desktop Navigation -->
                <nav class="hidden lg:flex items-center space-x-8 text-xs font-semibold uppercase tracking-wider text-[#4E342E]">
                    <a href="${prefix}index.html" class="hover:text-[#C62828] transition-colors">Home</a>
                    <a href="${prefix}about.html" class="hover:text-[#C62828] transition-colors">About Us</a>
                    <a href="${prefix}products.html" class="hover:text-[#C62828] transition-colors">Products</a>
                    <a href="${prefix}shop.html" class="hover:text-[#C62828] transition-colors">Shop</a>
                    <a href="${prefix}business.html" class="hover:text-[#C62828] transition-colors">Business Hub</a>
                    <a href="${prefix}blog.html" class="hover:text-[#C62828] transition-colors">Blog</a>
                    <a href="${prefix}contact.html" class="hover:text-[#C62828] transition-colors">Contact</a>
                </nav>

                <!-- Actions / Cart / Mobile Toggle -->
                <div class="flex items-center space-x-4">
                    <a href="${prefix}shop.html" class="relative p-2 text-[#4E342E] hover:text-[#C62828] transition-colors" aria-label="Cart">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
                        <span id="cart-badge" class="absolute top-1 right-1 w-4 h-4 bg-[#C62828] text-white rounded-full text-[10px] font-bold flex items-center justify-center hidden">0</span>
                    </a>
                    <button id="mobile-menu-button" aria-label="Toggle Mobile Menu" class="lg:hidden p-2 text-[#4E342E] hover:text-[#C62828] focus:outline-none">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
                    </button>
                </div>
            </div>

            <!-- Mobile Drawer -->
            <div id="mobile-menu" class="hidden lg:hidden bg-white border-b border-[#E7DCC7] px-4 pt-4 pb-6 space-y-3">
                <a href="${prefix}index.html" class="block py-2 text-xs font-semibold uppercase tracking-wider text-[#4E342E] hover:text-[#C62828]">Home</a>
                <a href="${prefix}about.html" class="block py-2 text-xs font-semibold uppercase tracking-wider text-[#4E342E] hover:text-[#C62828]">About Us</a>
                <a href="${prefix}products.html" class="block py-2 text-xs font-semibold uppercase tracking-wider text-[#4E342E] hover:text-[#C62828]">Products</a>
                <a href="${prefix}shop.html" class="block py-2 text-xs font-semibold uppercase tracking-wider text-[#4E342E] hover:text-[#C62828]">Shop</a>
                <a href="${prefix}business.html" class="block py-2 text-xs font-semibold uppercase tracking-wider text-[#4E342E] hover:text-[#C62828]">Business Hub</a>
                <a href="${prefix}blog.html" class="block py-2 text-xs font-semibold uppercase tracking-wider text-[#4E342E] hover:text-[#C62828]">Blog</a>
                <a href="${prefix}contact.html" class="block py-2 text-xs font-semibold uppercase tracking-wider text-[#4E342E] hover:text-[#C62828]">Contact</a>
            </div>
        </header>
        `;

        // Toggle logic for mobile menu
        setTimeout(() => {
            const btn = document.getElementById('mobile-menu-button');
            const menu = document.getElementById('mobile-menu');
            if (btn && menu) {
                btn.addEventListener('click', () => {
                    menu.classList.toggle('hidden');
                });
            }
        }, 100);
    }
}

class FooterComponent extends HTMLElement {
    connectedCallback() {
        const depth = window.location.pathname.split('/').length - 2;
        const prefix = depth > 0 ? '../'.repeat(depth) : '';

        this.innerHTML = `
        <footer class="bg-[#2D1F17] text-[#F5EEDC] text-sm border-t border-[#E7DCC7]/10">
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
                            <li><a href="${prefix}index.html" class="hover:text-[#E6B800] transition-colors">Home</a></li>
                            <li><a href="${prefix}about.html" class="hover:text-[#E6B800] transition-colors">About Us</a></li>
                            <li><a href="${prefix}products.html" class="hover:text-[#E6B800] transition-colors">Products</a></li>
                            <li><a href="${prefix}shop.html" class="hover:text-[#E6B800] transition-colors">Shop</a></li>
                            <li><a href="${prefix}contact.html" class="hover:text-[#E6B800] transition-colors">Contact Us</a></li>
                        </ul>
                    </nav>

                    <!-- Business & Media Links -->
                    <nav aria-label="Business & Media">
                        <h4 class="text-xs font-semibold uppercase tracking-widest text-white mb-4">Business &amp; Media</h4>
                        <ul class="space-y-2.5 text-xs font-light">
                            <li><a href="${prefix}business.html" class="hover:text-[#E6B800] transition-colors">Business Solutions</a></li>
                            <li><a href="${prefix}distributor.html" class="hover:text-[#E6B800] transition-colors">Distributor Portal</a></li>
                            <li><a href="${prefix}bulk.html" class="hover:text-[#E6B800] transition-colors">Bulk Orders</a></li>
                            <li><a href="${prefix}media.html" class="hover:text-[#E6B800] transition-colors">Media &amp; Press</a></li>
                            <li><a href="${prefix}work-with-us.html" class="hover:text-[#E6B800] transition-colors">Work With Us</a></li>
                            <li><a href="${prefix}manufacturing.html" class="hover:text-[#E6B800] transition-colors">Manufacturing</a></li>
                            <li><a href="${prefix}gallery.html" class="hover:text-[#E6B800] transition-colors">Gallery</a></li>
                            <li><a href="${prefix}blog.html" class="hover:text-[#E6B800] transition-colors">Blog &amp; Recipes</a></li>
                        </ul>
                    </nav>

                    <!-- Support & Legal Links -->
                    <nav aria-label="Support & Legal">
                        <h4 class="text-xs font-semibold uppercase tracking-widest text-white mb-4">Support &amp; Legal</h4>
                        <ul class="space-y-2.5 text-xs font-light">
                            <li><a href="${prefix}faq.html" class="hover:text-[#E6B800] transition-colors">FAQ</a></li>
                            <li><a href="${prefix}policies.html" class="hover:text-[#E6B800] transition-colors">Privacy Policy</a></li>
                            <li><a href="${prefix}policies.html#terms-and-conditions" class="hover:text-[#E6B800] transition-colors">Terms &amp; Conditions</a></li>
                            <li><a href="${prefix}policies.html#shipping-policy" class="hover:text-[#E6B800] transition-colors">Shipping &amp; Returns</a></li>
                        </ul>
                    </nav>
                </div>

                <!-- Newsletter Section -->
                <div class="mt-12 pt-8 border-t border-[#E7DCC7]/10 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    <div>
                        <h5 class="text-xs font-semibold uppercase tracking-wider text-white">Subscribe to Our Newsletter</h5>
                        <p class="text-xs text-[#F5EEDC]/80 mt-1 font-light">Receive authentic Jain recipes and business updates directly.</p>
                    </div>
                    <form data-form="newsletter" novalidate class="flex gap-2">
                        <input type="email" placeholder="Enter your email" required aria-label="Email address for newsletter" class="bg-[#1C1917] border border-[#E7DCC7]/20 rounded-sm px-4 py-3 text-xs text-white focus:outline-none focus:border-[#E6B800] flex-grow">
                        <button type="submit" class="px-6 py-3 bg-[#E6B800] text-[#2D1F17] font-semibold text-xs uppercase tracking-wider rounded-sm hover:bg-white transition-colors">
                            Subscribe
                        </button>
                    </form>
                </div>

                <!-- Copyright & Social Deep Links -->
                <div class="mt-12 pt-8 border-t border-[#E7DCC7]/10 flex flex-col sm:flex-row justify-between items-center text-xs text-[#F5EEDC]/70 font-light gap-4">
                    <p>&copy; 2026 KAWAD SWAD Udhyog. All rights reserved.</p>
                    <div class="flex space-x-6">
                        <a href="https://wa.me/919630976867?text=Hello%20Kawad%20Swad%20Team%2C%0A%0AI%20am%20visiting%20your%20website%20and%20need%20assistance." target="_blank" rel="noopener noreferrer" class="hover:text-[#E6B800] transition-colors">WhatsApp</a>
                        <a href="${prefix}contact.html" class="hover:text-[#E6B800] transition-colors">Support</a>
                    </div>
                </div>
            </div>
        </footer>
        `;
    }
}

customElements.define('header-component', HeaderComponent);
customElements.define('footer-component', FooterComponent);
