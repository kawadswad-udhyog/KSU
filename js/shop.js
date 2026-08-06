/**
 * ============================================================================
 * KAWAD SWAD - Product Engine & Shop Controller (js/shop.js)
 * ============================================================================
 * Dynamically loads products from data/products.json, controls search, category,
 * price, and weight filtering, handles pagination, sorting, and dynamic detail pages.
 */

let productsDatabase = [];

document.addEventListener('DOMContentLoaded', async () => {
    await loadProductsDatabase();
    
    if (window.location.pathname.includes('shop.html')) {
        initShopPage();
    } else if (window.location.pathname.includes('product-detail.html')) {
        initProductDetailPage();
    }
});

/**
 * Single Source of Truth loader fetching data/products.json
 */
async function loadProductsDatabase() {
    try {
        const response = await fetch('data/products.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        productsDatabase = await response.json();
    } catch (err) {
        console.error('Failed to load products.json:', err);
        productsDatabase = [];
    }
}

/**
 * Initializes controls and rendering for shop.html
 */
function initShopPage() {
    const productGrid = document.querySelector('[data-shop-grid]') || document.querySelector('.grid.grid-cols-1.sm\\:grid-cols-2');
    if (!productGrid) return;

    const searchInput = document.querySelector('input[placeholder*="Search"]');
    const categoryButtons = document.querySelectorAll('button[data-filter-category], section button');
    const sortSelect = document.querySelector('select[data-sort]') || document.querySelector('select');

    let currentCategory = 'all';
    let searchQuery = '';
    let currentSort = 'default';

    function renderGrid() {
        let filtered = productsDatabase.filter(item => {
            const matchesCategory = (currentCategory === 'all') || (item.category.toLowerCase() === currentCategory);
            const matchesSearch = item.name.toLowerCase().includes(searchQuery) ||
                                  item.description.toLowerCase().includes(searchQuery) ||
                                  item.sku.toLowerCase().includes(searchQuery);
            return matchesCategory && matchesSearch;
        });

        // Sorting
        if (currentSort === 'name-asc') {
            filtered.sort((a, b) => a.name.localeCompare(b.name));
        } else if (currentSort === 'price-low') {
            filtered.sort((a, b) => (a.websitePrice || a.mrp) - (b.websitePrice || b.mrp));
        } else if (currentSort === 'price-high') {
            filtered.sort((a, b) => (b.websitePrice || b.mrp) - (a.websitePrice || a.mrp));
        }

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

        filtered.forEach(product => {
            const card = document.createElement('div');
            card.className = 'bg-brand-cream/40 rounded-sm p-5 border border-stone-200/80 hover:shadow-xl transition-all duration-300 flex flex-col group';
            card.dataset.id = product.sku;
            card.dataset.sku = product.sku;
            card.dataset.name = product.name;
            card.dataset.price = product.websitePrice || product.mrp || 0;
            card.dataset.category = product.category;

            const displayPrice = product.websitePrice 
                ? `₹${product.websitePrice} <span class="text-stone-400 line-through text-[11px] ml-1">₹${product.mrp}</span>`
                : `₹${product.mrp}`;

            card.innerHTML = `
                <div class="aspect-square bg-stone-200 rounded-sm mb-4 flex items-center justify-center p-4 text-center group-hover:scale-[1.02] transition-transform overflow-hidden">
                    ${product.image && product.image.endsWith('.jpg') ? `<img src="${product.image}" alt="${product.name}" class="w-full h-full object-cover" onerror="this.outerHTML='<span class=\\'text-xs font-mono text-brand-muted\\'>[${product.sku}]</span>'">` : `<span class="text-xs font-mono text-brand-muted">[${product.sku}]</span>`}
                </div>
                <div class="flex items-center justify-between mb-1">
                    <span class="text-[10px] font-semibold uppercase tracking-wider text-brand-gold">${product.category}</span>
                    <span class="text-[10px] font-mono text-brand-muted">${product.weight}</span>
                </div>
                <h3 class="font-serif text-lg font-semibold text-brand-dark mb-1">${product.name}</h3>
                <p class="text-xs text-brand-muted mb-3 flex-grow line-clamp-2">${product.shortDescription}</p>
                <div class="flex items-center justify-between mb-4">
                    <span class="text-sm font-semibold text-brand-dark font-mono">${displayPrice}</span>
                    <span class="text-[10px] ${product.shipping === 'Free' ? 'text-green-700 bg-green-100' : 'text-stone-500 bg-stone-100'} px-2 py-0.5 rounded-xs font-medium">
                        ${product.shipping === 'Free' ? 'Free Shipping' : `+₹${product.shipping} Shipping`}
                    </span>
                </div>
                <div class="grid grid-cols-2 gap-2">
                    <a href="product-detail.html?sku=${product.sku}" class="text-center py-2 px-2 border border-brand-dark text-brand-dark text-[11px] font-semibold uppercase tracking-wider hover:bg-brand-dark hover:text-white transition-colors">Details</a>
                    <button type="button" data-action="add-to-cart" data-sku="${product.sku}" data-name="${product.name}" data-price="${product.websitePrice || product.mrp}" data-weight="${product.weight}" class="py-2 px-2 bg-brand-dark text-white text-[11px] font-semibold uppercase tracking-wider rounded-sm hover:bg-brand-gold hover:text-brand-dark transition-colors">Add</button>
                </div>
            `;
            productGrid.appendChild(card);
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value.toLowerCase().trim();
            renderGrid();
        });
    }

    categoryButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            categoryButtons.forEach(b => {
                b.classList.remove('bg-brand-dark', 'text-white');
                b.classList.add('bg-brand-cream/60', 'text-brand-dark');
            });

            btn.classList.remove('bg-brand-cream/60', 'text-brand-dark');
            btn.classList.add('bg-brand-dark', 'text-white');

            const text = (btn.dataset.filterCategory || btn.textContent).trim().toLowerCase();
            if (text === 'all') currentCategory = 'all';
            else if (text.includes('moong')) currentCategory = 'moong';
            else if (text.includes('chana')) currentCategory = 'chana';
            else if (text.includes('urad')) currentCategory = 'urad';
            else if (text.includes('combo')) currentCategory = 'combo';
            else currentCategory = text;

            renderGrid();
        });
    });

    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            const val = e.target.value.toLowerCase();
            if (val.includes('name') || val.includes('a-z')) currentSort = 'name-asc';
            else if (val.includes('low')) currentSort = 'price-low';
            else if (val.includes('high')) currentSort = 'price-high';
            else currentSort = 'default';

            renderGrid();
        });
    }

    renderGrid();
}

/**
 * Initializes dynamic data rendering on product-detail.html
 */
function initProductDetailPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const sku = urlParams.get('sku') || 'KS-MMP-200';

    const product = productsDatabase.find(p => p.sku === sku) || productsDatabase[0];
    if (!product) return;

    // Update DOM elements
    const breadcrumbName = document.querySelector('[data-detail="breadcrumb-name"]');
    const categoryBadge = document.querySelector('[data-detail="category"]');
    const titleEl = document.querySelector('[data-detail="title"]');
    const shortDescEl = document.querySelector('[data-detail="short-desc"]');
    const codeEl = document.querySelector('[data-detail="code"]');
    const mrpEl = document.querySelector('[data-detail="mrp"]');
    const priceEl = document.querySelector('[data-detail="price"]');
    const shippingEl = document.querySelector('[data-detail="shipping"]');
    const ingredientsList = document.querySelector('[data-detail="ingredients"]');
    const dietBadge = document.querySelector('[data-detail="diet-type"]');
    const actionContainer = document.querySelector('[data-detail="actions"]');

    if (breadcrumbName) breadcrumbName.textContent = product.name + ' ' + product.weight;
    if (categoryBadge) categoryBadge.textContent = product.category;
    if (titleEl) titleEl.textContent = `${product.name} (${product.weight})`;
    if (shortDescEl) shortDescEl.textContent = product.description || product.shortDescription;
    if (codeEl) codeEl.textContent = product.sku;
    
    if (mrpEl) mrpEl.textContent = product.mrp ? `₹${product.mrp}` : '';
    if (priceEl) priceEl.textContent = product.websitePrice ? `₹${product.websitePrice}` : (product.mrp ? `₹${product.mrp}` : 'Enquire for Price');
    if (shippingEl) shippingEl.textContent = product.shipping === 'Free' ? 'Free Shipping' : (product.shipping ? `+₹${product.shipping} Shipping` : '');

    if (dietBadge) dietBadge.textContent = product.dietType;

    if (ingredientsList && product.ingredients) {
        ingredientsList.innerHTML = product.ingredients.map(ing => `
            <li class="flex items-center gap-3">
                <span class="w-2 h-2 rounded-full bg-brand-gold flex-shrink-0"></span>
                <span>${ing}</span>
            </li>
        `).join('');
    }

    if (actionContainer) {
        actionContainer.innerHTML = `
            <button type="button" data-action="add-to-cart" data-sku="${product.sku}" data-name="${product.name}" data-price="${product.websitePrice || product.mrp || 0}" data-weight="${product.weight}" class="px-8 py-4 bg-brand-dark text-white text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-brand-gold hover:text-brand-dark transition-all duration-300 shadow-sm">
                Add To Cart
            </button>
            <a href="contact.html?enquiry=${product.sku}" class="inline-flex justify-center items-center px-8 py-4 border border-brand-dark text-xs font-semibold uppercase tracking-wider rounded-sm text-brand-dark hover:bg-brand-dark hover:text-white transition-all duration-300">
                Enquire Now
            </a>
        `;
    }
}
