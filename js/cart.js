/**
 * ============================================================================
 * KAWAD SWAD - E-Commerce LocalStorage Cart System (cart.js)
 * ============================================================================
 * Client-side shopping cart manager supporting add, update, remove, persistence,
 * header badge updates, and dynamic summary recalculation.
 */

const STORAGE_KEY = 'kawad_swad_cart';

const CartManager = {
    /**
     * Retrieves cart array from LocalStorage.
     */
    getItems() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('Error reading cart from localStorage', e);
            return [];
        }
    },

    /**
     * Saves cart array to LocalStorage and triggers UI refresh.
     */
    saveItems(items) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
            this.updateCartBadge();
        } catch (e) {
            console.error('Error saving cart to localStorage', e);
        }
    },

    /**
     * Adds product item to cart or increments quantity if exists.
     */
    addItem(product) {
        const items = this.getItems();
        const existingIndex = items.findIndex(
            i => i.id === product.id && i.size === product.size
        );

        if (existingIndex > -1) {
            items[existingIndex].quantity += (product.quantity || 1);
        } else {
            items.push({
                id: product.id || 'prod_' + Date.now(),
                name: product.name || 'Jain Papad Pack',
                size: product.size || '200g',
                price: product.price || 100,
                quantity: product.quantity || 1,
                image: product.image || '[thumb]'
            });
        }

        this.saveItems(items);
        this.showToastNotification(`${product.name || 'Item'} added to cart!`);
    },

    /**
     * Updates item quantity by ID and Size.
     */
    updateQuantity(id, size, newQty) {
        let items = this.getItems();
        const index = items.findIndex(i => i.id === id && i.size === size);

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
     * Removes an item from the cart.
     */
    removeItem(id, size) {
        let items = this.getItems();
        items = items.filter(i => !(i.id === id && i.size === size));
        this.saveItems(items);
    },

    /**
     * Empties the entire cart.
     */
    clearCart() {
        localStorage.removeItem(STORAGE_KEY);
        this.updateCartBadge();
    },

    /**
     * Recalculates total items for cart counter in global header.
     */
    updateCartBadge() {
        const items = this.getItems();
        const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
        const badges = document.querySelectorAll('header a[href="cart.html"] span');

        badges.forEach(badge => {
            badge.textContent = totalCount;
            if (totalCount > 0) {
                badge.classList.remove('hidden');
            }
        });
    },

    /**
     * Renders items table and totals on cart.html.
     */
    renderCartPage() {
        const tableBody = document.querySelector('table tbody');
        if (!tableBody || !window.location.pathname.includes('cart.html')) return;

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
            this.updateSummaryTotals(0);
            return;
        }

        let html = '';
        let subtotal = 0;

        items.forEach(item => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;

            html += `
                <tr data-id="${item.id}" data-size="${item.size}">
                    <td class="py-4 px-4 flex items-center gap-3">
                        <div class="w-12 h-12 bg-stone-200 rounded-xs shrink-0 flex items-center justify-center text-[8px] font-mono text-brand-muted">
                            ${item.image}
                        </div>
                        <span class="font-medium text-brand-dark">${item.name}</span>
                    </td>
                    <td class="py-4 px-4 text-brand-muted">${item.size}</td>
                    <td class="py-4 px-4">
                        <input type="number" value="${item.quantity}" min="1" class="qty-input w-16 bg-brand-cream/30 border border-stone-300 rounded-xs px-2 py-1 text-center text-xs">
                    </td>
                    <td class="py-4 px-4 font-mono text-brand-muted">₹${itemTotal}</td>
                    <td class="py-4 px-4">
                        <button type="button" class="remove-btn text-xs text-brand-red hover:underline">Remove</button>
                    </td>
                </tr>
            `;
        });

        tableBody.innerHTML = html;
        this.updateSummaryTotals(subtotal);
        this.bindCartPageEvents(tableBody);
    },

    /**
     * Binds input change and remove click listeners on cart page via event delegation.
     */
    bindCartPageEvents(tableBody) {
        tableBody.addEventListener('change', (e) => {
            if (e.target.classList.contains('qty-input')) {
                const tr = e.target.closest('tr');
                const id = tr.dataset.id;
                const size = tr.dataset.size;
                const newQty = parseInt(e.target.value, 10) || 1;

                this.updateQuantity(id, size, newQty);
                this.renderCartPage();
            }
        });

        tableBody.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-btn')) {
                const tr = e.target.closest('tr');
                const id = tr.dataset.id;
                const size = tr.dataset.size;

                this.removeItem(id, size);
                this.renderCartPage();
            }
        });
    },

    /**
     * Updates subtotal and total display elements on cart/checkout pages.
     */
    updateSummaryTotals(subtotal) {
        const subtotalEls = document.querySelectorAll('.font-mono:has-text("Subtotal"), [data-summary="subtotal"]');
        const totalEls = document.querySelectorAll('.font-mono.text-brand-gold, [data-summary="total"]');

        subtotalEls.forEach(el => el.textContent = `₹${subtotal}`);
        totalEls.forEach(el => el.textContent = `₹${subtotal}`);
    },

    /**
     * Displays non-blocking popup notification when items are added.
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

    // Event delegation for "Add To Cart" buttons across shop and detail pages
    document.addEventListener('click', (e) => {
        const addBtn = e.target.closest('a[href="cart.html"], button.add-to-cart');
        if (addBtn && !window.location.pathname.includes('cart.html')) {
            const card = addBtn.closest('.group, .space-y-8') || document;
            const productNameEl = card.querySelector('h3, h1');
            const sizeSelectEl = card.querySelector('select');

            const productName = productNameEl ? productNameEl.textContent.trim() : 'Jain Papad Pack';
            const sizeValue = sizeSelectEl ? sizeSelectEl.value.split('-')[0].trim() : '200g';

            CartManager.addItem({
                id: 'prod_' + productName.toLowerCase().replace(/\s+/g, '_'),
                name: productName,
                size: sizeValue,
                price: 150,
                quantity: 1,
                image: '[thumb]'
            });
        }
    });
});
