/**
 * ============================================================================
 * KAWAD SWAD - Shop Engine (shop.js)
 * ============================================================================
 * Client-side shop controller: Handles live text search, category filtering,
 * product sorting, grid re-rendering, and pricing state coordination.
 */

document.addEventListener('DOMContentLoaded', () => {
    if (!window.location.pathname.includes('shop.html')) return;
    initShopController();
});

function initShopController() {
    const searchInput = document.querySelector('input[placeholder="Search shop..."]');
    const categoryButtons = document.querySelectorAll('section button');
    const sortSelect = document.querySelector('select');
    const productGrid = document.querySelector('.grid.grid-cols-1.sm\\:grid-cols-2');

    if (!productGrid) return;

    // Extract product card structures from static HTML
    const originalCards = Array.from(productGrid.children).map((card, index) => {
        const titleEl = card.querySelector('h3');
        const descEl = card.querySelector('p');
        const title = titleEl ? titleEl.textContent.trim() : '';
        const desc = descEl ? descEl.textContent.trim() : '';

        // Infer category based on card title or fallback
        let category = 'all';
        if (title.toLowerCase().includes('moong')) category = 'moong';
        else if (title.toLowerCase().includes('chana')) category = 'chana';
        else if (title.toLowerCase().includes('urad')) category = 'urad';
        else if (title.toLowerCase().includes('masala')) category = 'masala';

        return {
            element: card.cloneNode(true),
            title: title,
            description: desc,
            category: category,
            index: index
        };
    });

    let currentCategory = 'all';
    let searchQuery = '';
    let currentSort = 'default';

    /**
     * Filters and sorts products array based on user controls.
     */
    function filterAndRenderProducts() {
        let filtered = originalCards.filter(item => {
            const matchesCategory = (currentCategory === 'all') || (item.category === currentCategory);
            const matchesSearch = item.title.toLowerCase().includes(searchQuery) || 
                                  item.description.toLowerCase().includes(searchQuery);
            return matchesCategory && matchesSearch;
        });

        // Sorting Logic
        if (currentSort === 'name-asc') {
            filtered.sort((a, b) => a.title.localeCompare(b.title));
        } else if (currentSort === 'default') {
            filtered.sort((a, b) => a.index - b.index);
        }

        // Render Grid
        productGrid.innerHTML = '';
        if (filtered.length === 0) {
            productGrid.innerHTML = `
                <div class="col-span-full py-12 text-center text-brand-muted">
                    <p class="font-serif text-lg mb-2">No matching products found.</p>
                    <p class="text-xs">Try adjusting your search query or selecting a different category filter.</p>
                </div>
            `;
            return;
        }

        filtered.forEach(item => {
            productGrid.appendChild(item.element.cloneNode(true));
        });
    }

    // Search Input Listener
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value.toLowerCase().trim();
            filterAndRenderProducts();
        });
    }

    // Category Buttons Listener
    categoryButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            categoryButtons.forEach(b => {
                b.classList.remove('bg-brand-dark', 'text-white');
                b.classList.add('bg-brand-cream/60', 'text-brand-dark');
            });

            btn.classList.remove('bg-brand-cream/60', 'text-brand-dark');
            btn.classList.add('bg-brand-dark', 'text-white');

            const text = btn.textContent.trim().toLowerCase();
            if (text === 'all') currentCategory = 'all';
            else if (text.includes('moong')) currentCategory = 'moong';
            else if (text.includes('chana')) currentCategory = 'chana';
            else if (text.includes('urad')) currentCategory = 'urad';
            else if (text.includes('masala')) currentCategory = 'masala';

            filterAndRenderProducts();
        });
    });

    // Sort Dropdown Listener
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            const value = e.target.value;
            if (value.includes('Name')) currentSort = 'name-asc';
            else currentSort = 'default';

            filterAndRenderProducts();
        });
    }
}
