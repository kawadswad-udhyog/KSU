/**
 * ============================================================================
 * KAWAD SWAD - Cart System (js/cart.js)
 * ============================================================================
 * Reads HTML data attributes (data-id, data-name, data-price, data-image, data-weight),
 * manages LocalStorage items, updates global header badges, calculates subtotal/tax/shipping,
 * and handles future coupon expansion.
 */

const STORAGE_KEY = 'kawad_swad_cart';

const CartManager = {
    /**
     * Reads cart array from LocalStorage.
     */
    getItems() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('Error parsing cart LocalStorage:', e);
            return [];
        }
    },

    /**
     * Saves cart array to LocalStorage and triggers badge refresh.
     */
    saveItems(items) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
            this.updateCartBadge();
        } catch (e) {
            console.error('Error writing cart LocalStorage:', e);
        }
    },

    /**
     * Adds an item object read directly from data-attributes.
     */
    addItem(product) {
        if (!product || !product.id) return;

        const items = this.getItems();
        const existingIndex = items.findIndex(
            i => i.id === product.id && i.weight === product.weight
        );

        if (existingIndex > -1) {
            items[existingIndex].quantity += (product.quantity || 1);
        } else {
            items.push({
                id: product.id,
                name: product.name || 'Jain Papad Pack',
                price: parseFloat(product.price) || 0,
                weight: product.weight || '200g',
                image: product.image || '[image-placeholder]',
                quantity: parseInt(product.quantity, 10) || 1
            });
        }

        this.saveItems(items);
        this.showToastNotification(`${product.name} (${product.weight || ''}) added to cart!`);
    },

    /**
     * Updates cart item quantity by ID and weight.
     */
    updateQuantity(id, weight, newQty) {
        let items = this.getItems();
        const index = items.findIndex(i => i.id === id && i.weight === weight);

        if (index > -1) {
            if (newQty <= 0) {
                items.splice(index, 1);
            } else {
                items[index].quantity = newQty;
            }
            this.saveItems(items);
        }
    },

    /**
     * Removes an item from cart by ID and weight.
     */
    removeItem(id, weight) {
        let items = this.getItems();
        items = items.filter(i => !(i.id === id && i.weight === weight));
        this.saveItems(items);
    },

    /**
     * Clears all cart items.
     */
    clearCart() {
        localStorage.removeItem(STORAGE_KEY);
        this.updateCartBadge();
    },

    /**
     * Calculates line items subtotal sum.
     */
    calculateSubtotal() {
        const items = this.getItems();
        return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    },

    /**
     * Prepares future shipping charge calculations.
     */
    prepareShippingPlaceholder(subtotal) {
        if (subtotal === 0) return 0;
        // Default flat rate or free shipping threshold
        return subtotal > 500 ? 0 : 50;
    },

    /**
     * Prepares future GST/Tax calculations (e.g. 5% GST on packaged food).
     */
    prepareGSTPlaceholder(subtotal) {
        const gstRate = 0.05;
        return Math.round(subtotal * gstRate);
    },

    /**
     * Calculates final grand total including subtotal, shipping, GST, and coupon discount.
     */
    calculateGrandTotal(couponDiscount = 0) {
        const subtotal = this.calculateSubtotal();
        if (subtotal === 0) return 0;

        const shipping = this.prepareShippingPlaceholder(subtotal);
        const gst = this.prepareGSTPlaceholder(subtotal);

        const total = subtotal + shipping + gst - couponDiscount;
        return Math.max(0, total);
    },

    /**
     * Updates header cart badge text count.
     */
    updateCartBadge() {
        const items = this.getItems();
        const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
        const badges = document.querySelectorAll('header a[href="cart.html"] span, #cart-count');

        badges.forEach(badge => {
            badge.textContent = totalCount;
            if (totalCount > 0) {
                badge.classList.remove('hidden');
            }
        });
    },

    /**
     * Renders cart table and dynamic summary calculations on cart.html or checkout.html.
     */
    renderCartPage() {
        const tableBody = document.querySelector('table tbody, #cart-items-container');
        if (!tableBody) return;

        const items = this.getItems();

        if (items.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="py-12 text-center text-brand-muted">
                        <p class="font-serif text-lg mb-4">Your shopping cart is currently empty.</p>
                        <a href="shop.html" class="inline-block px-6 py-2.5 bg-brand-dark text-white text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-brand-gold transition-colors">
                            Explore Shop
                        </a>
                    </td>
                </tr>
            `;
            this.updateSummaryUI(0, 0, 0, 0);
            return;
        }

        let html = '';
        items.forEach(item => {
            const lineTotal = item.price * item.quantity;
            html += `
                <tr data-id="${item.id}" data-weight="${item.weight}">
                    <td class="py-4 px-4 flex items-center gap-3">
                        <div class="w-12 h-12 bg-stone-200 rounded-xs shrink-0 flex items-center justify-center text-[8px] font-mono text-brand-muted overflow-hidden">
                            ${item.image.startsWith('http') ? `<img src="${item.image}" alt="${item.name}" class="w-full h-full object-cover">` : item.image}
                        </div>
                        <span class="font-medium text-brand-dark">${item.name}</span>
                    </td>
                    <td class="py-4 px-4 text-brand-muted">${item.weight}</td>
                    <td class="py-4 px-4">
                        <input type="number" value="${item.quantity}" min="1" class="qty-input w-16 bg-brand-cream/30 border border-stone-300 rounded-xs px-2 py-1 text-center text-xs">
                    </td>
                    <td class="py-4 px-4 font-mono text-brand-muted">${item.price ? '₹' + lineTotal : '[Price]'}</td>
                    <td class="py-4 px-4">
                        <button type="button" class="remove-btn text-xs text-brand-red hover:underline">Remove</button>
                    </td>
                </tr>
            `;
        });

        tableBody.innerHTML = html;

        const subtotal = this.calculateSubtotal();
        const shipping = this.prepareShippingPlaceholder(subtotal);
        const gst = this.prepareGSTPlaceholder(subtotal);
        const grandTotal = this.calculateGrandTotal(0);

        this.updateSummaryUI(subtotal, shipping, gst, grandTotal);
    },

    /**
     * Updates subtotal, shipping, GST, and grand total elements in DOM summaries.
     */
    updateSummaryUI(subtotal, shipping, gst, grandTotal) {
        const subtotalEls = document.querySelectorAll('[data-summary="subtotal"]');
        const shippingEls = document.querySelectorAll('[data-summary="shipping"]');
        const gstEls = document.querySelectorAll('[data-summary="gst"]');
        const totalEls = document.querySelectorAll('[data-summary="total"], .font-mono.text-brand-gold');

        subtotalEls.forEach(el => el.textContent = subtotal ? `₹${subtotal}` : '[Subtotal]');
        shippingEls.forEach(el => el.textContent = shipping ? `₹${shipping}` : (subtotal ? 'Free' : '[Calculated at checkout]'));
        gstEls.forEach(el => el.textContent = gst ? `₹${gst}` : '[GST]');
        totalEls.forEach(el => el.textContent = grandTotal ? `₹${grandTotal}` : '[Total]');
    },

    /**
     * Displays a lightweight toast notification banner upon adding an item.
     */
    showToastNotification(message) {
        let toast = document.getElementById('cart-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'cart-toast';
            toast.className = 'fixed top-24 right-6 z-50 bg-brand-dark text-white px-5 py-3 rounded-sm shadow-xl text-xs font-semibold tracking-wider uppercase border border-brand-gold flex items-center gap-2 transition-all duration-300 opacity-0 transform translate-y-2';
            document.body.appendChild(toast);
        }

        toast.innerHTML = `
            <svg class="w-4 h-4 text-brand-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

    // Delegate quantity input changes and remove item clicks in table
    const tableBody = document.querySelector('table tbody, #cart-items-container');
    if (tableBody) {
        tableBody.addEventListener('change', (e) => {
            if (e.target.classList.contains('qty-input')) {
                const tr = e.target.closest('tr');
                if (!tr) return;
                const id = tr.dataset.id;
                const weight = tr.dataset.weight;
                const newQty = parseInt(e.target.value, 10) || 1;

                CartManager.updateQuantity(id, weight, newQty);
                CartManager.renderCartPage();
            }
        });

        tableBody.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-btn')) {
                const tr = e.target.closest('tr');
                if (!tr) return;
                const id = tr.dataset.id;
                const weight = tr.dataset.weight;

                CartManager.removeItem(id, weight);
                CartManager.renderCartPage();
            }
        });
    }

    // Global Event Delegation: Read item details directly from HTML data-attributes
    document.addEventListener('click', (e) => {
        const addBtn = e.target.closest('[data-action="add-to-cart"], .add-to-cart');
        if (!addBtn) return;

        const card = addBtn.closest('[data-id]') || addBtn.closest('.group, .space-y-8') || document;

        const id = card.dataset.id || addBtn.dataset.id || ('prod_' + Date.now());
        const name = card.dataset.name || addBtn.dataset.name || (card.querySelector('h3, h1') ? card.querySelector('h3, h1').textContent.trim() : 'Jain Papad');
        const price = card.dataset.price || addBtn.dataset.price || 0;
        const image = card.dataset.image || addBtn.dataset.image || '[image-placeholder]';

        // Read dynamic weight from dropdown if available, or data-weight attribute
        const sizeSelect = card.querySelector('select');
        let weight = card.dataset.weight || addBtn.dataset.weight || '200g';
        if (sizeSelect && sizeSelect.value) {
            weight = sizeSelect.value.split('-')[0].trim();
        }

        CartManager.addItem({
            id: id,
            name: name,
            price: price,
            weight: weight,
            image: image,
            quantity: 1
        });
    });
});
