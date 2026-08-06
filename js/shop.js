/**
 * ============================================================================
 * KAWAD SWAD - Shop Engine (js/shop.js)
 * ============================================================================
 * Controller for product catalogue: Handles live text search, category filtering,
 * product sorting, grid re-rendering, and parsing dataset properties
 * (data-category, data-brand, data-variant, data-weight, data-price).
 */

document.addEventListener('DOMContentLoaded', () => {
    if (!window.location.pathname.includes('shop.html') && !document.querySelector('[data-shop-grid]')) return;
    initShopController();
});

function initShopController() {
    const searchInput = document.querySelector('input[placeholder*="Search"]');
    const categoryButtons = document.querySelectorAll('button[data-filter-category]');
    const sortSelect = document.querySelector('select[data-sort]');
    const productGrid = document.querySelector('[data-shop-grid]') || document.querySelector('.grid.grid-cols-1.sm\\:grid-cols-2');

    if (!productGrid) return;

    // Parse product items directly from HTML card elements and data attributes
    const originalCards = Array.from(productGrid.children).map((card, index) => {
        const titleEl = card.querySelector('h3, h2, font');
        const descEl = card.querySelector('p');

        const dataset = card.dataset;
        const title = dataset.name || (titleEl ? titleEl.textContent.trim() : '');
        const desc = dataset.description || (descEl ? descEl.textContent.trim() : '');
        const category = dataset.category || extractCategoryFromTitle(title);
        const price = parseFloat(dataset.price) || 0;
        const brand = dataset.brand || 'KAWAD SWAD';
        const variant = dataset.variant || '';
        const weight = dataset.weight || '200g';

        return {
            element: card.cloneNode(true),
            id: dataset.id || `prod_${index}`,
            title: title,
            description: desc,
            category: category.toLowerCase(),
            brand: brand,
            variant: variant,
            weight: weight,
            price: price,
            index: index
        };
    });

    let currentCategory = 'all';
    let searchQuery = '';
    let currentSort = 'default';

    /**
     * Fallback helper to infer category if HTML data-category attribute is missing.
     */
    function extractCategoryFromTitle(title) {
        const lower = title.toLowerCase();
        if (lower.includes('moong')) return 'moong';
        if (lower.includes('chana')) return 'chana';
        if (lower.includes('urad')) return 'urad';
        if (lower.includes('masala')) return 'masala';
        return 'all';
    }

    /**
     * Filters, sorts, and re-renders product cards in the grid.
     */
    function filterAndRenderProducts() {
        let filtered = originalCards.filter(item => {
            const matchesCategory = (currentCategory === 'all') || (item.category === currentCategory);
            const matchesSearch = item.title.toLowerCase().includes(searchQuery) ||
                                  item.description.toLowerCase().includes(searchQuery) ||
                                  item.brand.toLowerCase().includes(searchQuery) ||
                                  item.variant.toLowerCase().includes(searchQuery);
            return matchesCategory && matchesSearch;
        });

        // Apply Sorting
        if (currentSort === 'name-asc') {
            filtered.sort((a, b) => a.title.localeCompare(b.title));
        } else if (currentSort === 'price-low') {
            filtered.sort((a, b) => a.price - b.price);
        } else if (currentSort === 'price-high') {
            filtered.sort((a, b) => b.price - a.price);
        } else if (currentSort === 'default') {
            filtered.sort((a, b) => a.index - b.index);
        }

        // Render Cards
        productGrid.innerHTML = '';
        if (filtered.length === 0) {
            productGrid.innerHTML = `
                <div class="col-span-full py-12 text-center text-brand-muted">
                    <p class="font-serif text-lg mb-2">No matching products found.</p>
                    <p class="text-xs">Try adjusting your search query or selecting another product category.</p>
                </div>
            `;
            return;
        }

        filtered.forEach(item => {
            productGrid.appendChild(item.element.cloneNode(true));
        });
    }

    // Attach Search Input Listener
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value.toLowerCase().trim();
            filterAndRenderProducts();
        });
    }

    // Attach Category Filter Buttons Listener
    if (categoryButtons.length) {
        categoryButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                categoryButtons.forEach(b => {
                    b.classList.remove('bg-brand-dark', 'text-white');
                    b.classList.add('bg-brand-cream/60', 'text-brand-dark');
                });

                btn.classList.remove('bg-brand-cream/60', 'text-brand-dark');
                btn.classList.add('bg-brand-dark', 'text-white');

                currentCategory = (btn.dataset.filterCategory || btn.textContent.trim()).toLowerCase();
                filterAndRenderProducts();
            });
        });
    } else {
        // Fallback for non-dataset category buttons
        const genericButtons = document.querySelectorAll('section button');
        genericButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const text = btn.textContent.trim().toLowerCase();
                if (['all', 'moong', 'chana', 'urad', 'masala', 'combo packs'].some(c => text.includes(c))) {
                    genericButtons.forEach(b => {
                        b.classList.remove('bg-brand-dark', 'text-white');
                        b.classList.add('bg-brand-cream/60', 'text-brand-dark');
                    });
                    btn.classList.remove('bg-brand-cream/60', 'text-brand-dark');
                    btn.classList.add('bg-brand-dark', 'text-white');

                    if (text === 'all') currentCategory = 'all';
                    else if (text.includes('moong')) currentCategory = 'moong';
                    else if (text.includes('chana')) currentCategory = 'chana';
                    else if (text.includes('urad')) currentCategory = 'urad';
                    else if (text.includes('masala')) currentCategory = 'masala';

                    filterAndRenderProducts();
                }
            });
        });
    }

    // Attach Sort Dropdown Listener
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            const val = e.target.value.toLowerCase();
            if (val.includes('name') || val.includes('a-z')) currentSort = 'name-asc';
            else if (val.includes('low')) currentSort = 'price-low';
            else if (val.includes('high')) currentSort = 'price-high';
            else currentSort = 'default';

            filterAndRenderProducts();
        });
    }
}
