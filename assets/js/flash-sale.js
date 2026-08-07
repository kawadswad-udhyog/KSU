/**
 * ============================================================================
 * KAWAD SWAD - Flash Sale Script Engine (flash-sale.js)
 * ============================================================================
 * Apple & Aesop inspired high-end micro-interactions, robust cart management,
 * accessible event delegation, and real-time precision countdown ticker.
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Lucide Icons Safely
    if (typeof lucide !== 'undefined') {
        try { lucide.createIcons(); } catch (e) { console.warn('Lucide icon initialization skipped:', e); }
    }

    // 2. Mobile Menu Toggle Controller
    const mobileToggle = document.getElementById('mobile-menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileToggle && mobileMenu) {
        mobileToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const isHidden = mobileMenu.classList.toggle('hidden');
            mobileToggle.setAttribute('aria-expanded', String(!isHidden));
        });

        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (!mobileMenu.classList.contains('hidden') && !mobileMenu.contains(e.target) && !mobileToggle.contains(e.target)) {
                mobileMenu.classList.add('hidden');
                mobileToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // 3. Storage Validation & Cart Management
    function storageAvailable(type) {
        try {
            const storage = window[type];
            const x = '__storage_test__';
            storage.setItem(x, x);
            storage.removeItem(x);
            return true;
        } catch (e) {
            return false;
        }
    }

    function safeJSONParse(str, fallback = []) {
        try { return JSON.parse(str) || fallback; } catch (e) { return fallback; }
    }

    let cart = [];
    if (storageAvailable('localStorage')) {
        cart = safeJSONParse(localStorage.getItem('ks_cart'), []);
    }

    function updateCartBadge() {
        const totalItems = cart.reduce((acc, item) => acc + (Number(item.qty) || 0), 0);
        const badges = document.querySelectorAll('#cart-badge, [data-summary="cart-count"]');
        badges.forEach(badge => {
            badge.textContent = totalItems;
            if (totalItems > 0) {
                badge.classList.remove('hidden');
            } else {
                badge.classList.add('hidden');
            }
        });
    }

    function saveCart() {
        if (!storageAvailable('localStorage')) return;
        localStorage.setItem('ks_cart', JSON.stringify(cart));
        updateCartBadge();
    }

    // 4. Premium Toast Notification Hub
    function announceToast(msg) {
        let hub = document.getElementById('toast-hub');
        if (!hub) {
            hub = document.createElement('div');
            hub.id = 'toast-hub';
            hub.className = 'fixed bottom-6 right-6 z-[400] flex flex-col gap-3 pointer-events-none';
            document.body.appendChild(hub);
        }

        const toast = document.createElement('div');
        toast.className = 'toast glass-panel px-5 py-3 rounded-sm border border-brand-gold text-xs font-semibold text-brand-dark shadow-xl transition-all duration-300 opacity-0 transform translate-y-2';
        toast.setAttribute('role', 'status');
        toast.setAttribute('aria-live', 'polite');
        toast.innerHTML = `
            <svg class="w-4 h-4 text-brand-gold shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
            <span>${msg}</span>
        `;
        hub.appendChild(toast);

        // Trigger entrance animation
        requestAnimationFrame(() => {
            toast.classList.remove('opacity-0', 'translate-y-2');
            toast.classList.add('opacity-100', 'translate-y-0');
        });

        setTimeout(() => {
            toast.classList.add('opacity-0', 'translate-y-2');
            toast.classList.remove('opacity-100', 'translate-y-0');
            setTimeout(() => toast.remove(), 300);
        }, 2500);
    }

    // 5. Claim Deal / Add to Cart Handler
    function claimDealFromData(attrs) {
        const { sku, title, weight, price, mrp, img } = attrs;
        let existing = cart.find(i => i.id === sku);
        
        const numericPrice = Number(price) || 0;
        const numericMrp = Number(mrp) || 0;

        if (existing) {
            existing.qty += 1;
        } else {
            cart.push({
                id: sku,
                sku: sku,
                name: title,
                title: title,
                weight: weight,
                price: numericPrice,
                mrp: numericMrp,
                shipping: weight === '1000g' ? 0 : 49,
                qty: 1,
                image: img,
                img: img
            });
        }
        saveCart();
        announceToast(`Claimed ${title} (${weight})! Added to cart.`);
    }

    // Event Delegation for Claim Buttons
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-claim-sku]');
        if (!btn) return;
        
        const sku = btn.getAttribute('data-claim-sku');
        const title = btn.getAttribute('data-title') || 'Product';
        const weight = btn.getAttribute('data-weight') || '200g';
        const price = btn.getAttribute('data-price') || 0;
        const mrp = btn.getAttribute('data-mrp') || 0;
        const img = btn.getAttribute('data-img') || '';

        claimDealFromData({ sku, title, weight, price, mrp, img });
    });

    // 6. Precision Countdown Timer
    const saleEnd = (function() {
        const now = new Date();
        const target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 18, 0, 0);
        if (target.getTime() <= now.getTime()) {
            target.setDate(target.getDate() + 1);
        }
        return target.getTime();
    })();

    function updateTimer() {
        const now = Date.now();
        let diff = Math.max(0, saleEnd - now);

        const hours = Math.floor(diff / 3600000);
        diff %= 3600000;
        const minutes = Math.floor(diff / 60000);
        diff %= 60000;
        const seconds = Math.floor(diff / 1000);
        const ms = Math.floor((diff % 1000) / 100);

        const elH = document.getElementById('timer-hours');
        const elM = document.getElementById('timer-minutes');
        const elS = document.getElementById('timer-seconds');
        const elMs = document.getElementById('timer-ms');

        if (elH) elH.textContent = String(hours).padStart(2, '0');
        if (elM) elM.textContent = String(minutes).padStart(2, '0');
        if (elS) elS.textContent = String(seconds).padStart(2, '0');
        if (elMs) elMs.textContent = String(ms);

        if (saleEnd <= now) {
            document.querySelectorAll('[data-claim-sku]').forEach(b => {
                b.disabled = true;
                b.classList.add('opacity-50', 'cursor-not-allowed');
                b.setAttribute('aria-disabled', 'true');
                b.textContent = 'Deal Expired';
            });
        }
    }

    // Tick interval
    function timerTick() {
        updateTimer();
        setTimeout(timerTick, 100);
    }
    timerTick();

    // Initial Badge Render
    updateCartBadge();
});
