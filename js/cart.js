/**
 * ============================================================================
 * KAWAD SWAD - Cart System (js/cart.js)
 * ============================================================================
 * Manages shopping cart state via LocalStorage with safe fallbacks, path awareness,
 * image rendering, batch rendering, and accessible notification toasts.
 */

const STORAGE_KEY = 'kawad_swad_cart';
const CART_VERSION = 1;

const CartManager = {
    /**
     * Helper to resolve dynamic base path for GitHub Pages hosting (/KSU/).
     */
    getBasePath() {
        const isGitHubPages = window.location.pathname.includes('/KSU/');
        return isGitHubPages ? '/KSU/' : './';
    },

    getStorageData() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            if (!data) return { version: CART_VERSION, items: [] };
            const parsed = JSON.parse(data);
            if (Array.isArray(parsed)) {
                return { version: CART_VERSION, items: parsed };
            }
            return parsed;
        } catch (e) {
            console.warn('LocalStorage unavailable or unreadable:', e);
            return { version: CART_VERSION, items: [] };
        }
    },

    getItems() {
        return this.getStorageData().items || [];
    },

    saveItems(items) {
        try {
            const payload = {
                version: CART_VERSION,
                updatedAt: new Date().toISOString(),
                items: items
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
            this.updateCartBadge();
        } catch (e) {
            console.warn('LocalStorage write failed:', e);
        }
    },

    addItem(product) {
        if (!product || !product.sku) return;

        const items = this.getItems();
        const existingIndex = items.findIndex(i => i.sku === product.sku);

        const parsedPrice = parseFloat(product.price);
        const validPrice = !isNaN(parsedPrice) ? parsedPrice : 0;

        if (existingIndex > -1) {
            items[existingIndex].quantity += (parseInt(product.quantity, 10) || 1);
        } else {
            items.push({
                sku: product.sku,
                name: product.name || 'Jain Papad Pack',
                price: validPrice,
                weight: product.weight || '200g',
                shipping: product.shipping || '49',
                image: product.image || '',
                quantity: parseInt(product.quantity, 10) || 1
            });
        }

        this.saveItems(items);
        this.showToastNotification(`${product.name || 'Product'} (${product.weight || ''}) added to cart!`);
    },

    updateQuantity(sku, newQty) {
        let items = this.getItems();
        const index = items.findIndex(i => i.sku === sku);

        if (index > -1) {
            if (newQty <= 0) {
                items.splice(index, 1);
            } else {
                items[index].quantity = newQty;
            }
            this.saveItems(items);
        }
    },

    removeItem(sku) {
        let items = this.getItems();
        items = items.filter(i => i.sku !== sku);
        this.saveItems(items);
    },

    clearCart() {
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch (e) {
            console.warn('LocalStorage clear failed:', e);
        }
        this.updateCartBadge();
    },

    calculateSubtotal() {
        const items = this.getItems();
        return items.reduce((sum, item) => sum + ((parseFloat(item.price) || 0) * item.quantity), 0);
    },

    calculateShipping() {
        const items = this.getItems();
        if (items.length === 0) return 0;

        const hasFreeShipping = items.some(i => String(i.shipping).toLowerCase() === 'free');
        if (hasFreeShipping) return 0;

        const maxShipping = items.reduce((max, item) => {
            const val = parseFloat(item.shipping) || 0;
            return val > max ? val : max;
        }, 0);

        return maxShipping || 49;
    },

    calculateGrandTotal() {
        const subtotal = this.calculateSubtotal();
        if (subtotal === 0) return 0;
        const shipping = this.calculateShipping();
        return subtotal + shipping;
    },

    updateCartBadge() {
        const items = this.getItems();
        const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
        const badges = document.querySelectorAll('header a[href*="cart.html"] span, #cart-count');

        badges.forEach(badge => {
            badge.textContent = totalCount;
            if (totalCount > 0) {
                badge.classList.remove('hidden');
            } else {
                badge.classList.add('hidden');
            }
        });
    },

    renderCartPage() {
        const tableBody = document.querySelector('table tbody, #cart-items-container');
        if (!tableBody) return;

        const items = this.getItems();
        const basePath = this.getBasePath();

        if (items.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="py-12 text-center text-brand-muted">
                        <p class="font-serif text-lg mb-4">Your shopping cart is currently empty.</p>
                        <a href="${basePath}shop.html" class="inline-block px-6 py-2.5 bg-brand-dark text-white text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-brand-gold transition-colors">
                            Explore Shop
                        </a>
                    </td>
                </tr>
            `;
            this.updateSummaryUI(0, 0, 0);
            return;
        }

        let html = '';
        items.forEach(item => {
            const priceNum = parseFloat(item.price) || 0;
            const lineTotal = priceNum * item.quantity;
            const imageMarkup = item.image && item.image.trim() !== ''
                ? `<img src="${basePath}${item.image.replace(/^\/+/, '')}" alt="${item.name}" class="w-full h-full object-cover rounded-xs" onerror="this.outerHTML='<span class=\\'text-[8px] font-mono text-brand-muted\\'>${item.sku}</span>'">`
                : `<span class="text-[8px] font-mono text-brand-muted uppercase">${item.sku}</span>`;

            html += `
                <tr data-sku="${item.sku}">
                    <td class="py-4 px-4 flex items-center gap-3">
                        <div class="w-12 h-12 bg-stone-200 rounded-xs shrink-0 flex items-center justify-center overflow-hidden border border-stone-300/60">
                            ${imageMarkup}
                        </div>
                        <div>
                            <span class="font-medium text-brand-dark block">${item.name}</span>
                            <span class="text-[10px] font-mono text-stone-400">SKU: ${item.sku}</span>
                        </div>
                    </td>
                    <td class="py-4 px-4 text-brand-muted">${item.weight}</td>
                    <td class="py-4 px-4">
                        <input type="number" value="${item.quantity}" min="1" aria-label="Quantity for ${item.name}" class="qty-input w-16 bg-brand-cream/30 border border-stone-300 rounded-xs px-2 py-1 text-center text-xs">
                    </td>
                    <td class="py-4 px-4 font-mono text-brand-muted">${priceNum > 0 ? '₹' + lineTotal : '[Quote]'}</td>
                    <td class="py-4 px-4">
                        <button type="button" class="remove-btn text-xs text-brand-red hover:underline" aria-label="Remove ${item.name}">Remove</button>
                    </td>
                </tr>
            `;
        });

        tableBody.innerHTML = html;

        const subtotal = this.calculateSubtotal();
        const shipping = this.calculateShipping();
        const grandTotal = this.calculateGrandTotal();

        this.updateSummaryUI(subtotal, shipping, grandTotal);
    },

    renderCheckoutSummary() {
        const checkoutItemsContainer = document.getElementById('checkout-items-summary');
        if (!checkoutItemsContainer) return;

        const items = this.getItems();
        if (items.length === 0) {
            checkoutItemsContainer.innerHTML = `<p class="text-xs text-brand-muted">No items in cart.</p>`;
            return;
        }

        checkoutItemsContainer.innerHTML = items.map(item => {
            const priceNum = parseFloat(item.price) || 0;
            return `
                <div class="flex justify-between items-center pt-2">
                    <div>
                        <span class="block font-medium text-brand-dark">${item.name}</span>
                        <span class="text-xs text-brand-muted">Qty: ${item.quantity} | Size: ${item.weight}</span>
                    </div>
                    <span class="font-mono text-brand-muted">${priceNum > 0 ? '₹' + (priceNum * item.quantity) : '[Quote]'}</span>
                </div>
            `;
        }).join('');

        const subtotal = this.calculateSubtotal();
        const shipping = this.calculateShipping();
        const grandTotal = this.calculateGrandTotal();

        this.updateSummaryUI(subtotal, shipping, grandTotal);
    },

    updateSummaryUI(subtotal, shipping, grandTotal) {
        const subtotalEls = document.querySelectorAll('[data-summary="subtotal"]');
        const shippingEls = document.querySelectorAll('[data-summary="shipping"]');
        const totalEls = document.querySelectorAll('[data-summary="total"], .font-mono.text-brand-gold');

        subtotalEls.forEach(el => el.textContent = subtotal ? `₹${subtotal}` : '[Subtotal]');
        shippingEls.forEach(el => el.textContent = shipping === 0 ? 'FREE' : (shipping ? `₹${shipping}` : '[Shipping]'));
        totalEls.forEach(el => el.textContent = grandTotal ? `₹${grandTotal}` : '[Total]');
    },

    showToastNotification(message) {
        let toast = document.getElementById('cart-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'cart-toast';
            toast.setAttribute('role', 'status');
            toast.setAttribute('aria-live', 'polite');
            toast.className = 'fixed top-24 right-6 z-50 bg-brand-dark text-white px-5 py-3 rounded-sm shadow-xl text-xs font-semibold tracking-wider uppercase border border-brand-gold flex items-center gap-2 transition-all duration-300 opacity-0 transform translate-y-2';
            document.body.appendChild(toast);
        }

        toast.innerHTML = `
            <svg class="w-4 h-4 text-brand-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
            <span>${message}</span>
        `;

        toast.classList.remove('opacity-0', 'translate-y-2');
        toast.classList.add('opacity-100', 'translate-y-0');

        setTimeout(() => {
            toast.classList.add('opacity-0', 'translate-y-2');
            toast.classList.remove('opacity-100', 'translate-y-0');
        }, 2500);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    CartManager.updateCartBadge();
    CartManager.renderCartPage();
    CartManager.renderCheckoutSummary();

    const tableBody = document.querySelector('table tbody, #cart-items-container');
    if (tableBody) {
        tableBody.addEventListener('change', (e) => {
            if (e.target.classList.contains('qty-input')) {
                const tr = e.target.closest('tr');
                if (!tr) return;
                CartManager.updateQuantity(tr.dataset.sku, parseInt(e.target.value, 10) || 1);
                CartManager.renderCartPage();
            }
        });

        tableBody.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-btn')) {
                const tr = e.target.closest('tr');
                if (!tr) return;
                CartManager.removeItem(tr.dataset.sku);
                CartManager.renderCartPage();
            }
        });
    }

    document.addEventListener('click', (e) => {
        const addBtn = e.target.closest('[data-action="add-to-cart"]');
        if (!addBtn) return;

        CartManager.addItem({
            sku: addBtn.dataset.sku,
            name: addBtn.dataset.name,
            price: addBtn.dataset.price,
            weight: addBtn.dataset.weight || '200g',
            shipping: addBtn.dataset.shipping || '49',
            image: addBtn.dataset.image || '',
            quantity: 1
        });
    });
});
