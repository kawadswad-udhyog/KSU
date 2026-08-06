/**
 * ============================================================================
 * KAWAD SWAD - Product Engine & Shop Controller (js/shop.js)
 * ============================================================================
 * Handles single-fetch product database caching, dynamic rendering for shop.html
 * and product-detail.html, category/weight/price filtering, and search.
 */

let productsCache = null;

/**
 * Singleton database loader for products.json
 */
async function getProductsDatabase() {
    if (productsCache) return productsCache;
    try {
        const response = await fetch('data/products.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        productsCache = await response.json();
        return productsCache;
    } catch (err) {
        console.error('Failed to load products.json:', err);
        return [];
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const products = await getProductsDatabase();
    
    if (window.location.pathname.includes('shop.html') || document.querySelector('[data-shop-grid]')) {
        initShopPage(products);
    } else if (window.location.pathname.includes('product-detail.html')) {
        initProductDetailPage(products);
    }
});

/**
 * Initializes filtering, search, and dynamic grid rendering for shop.html
 */
function initShopPage(products) {
    const productGrid = document.querySelector('[data-shop-grid]') || document.querySelector('.grid.grid-cols-1.sm\\:grid-cols-2');
    if (!productGrid) return;

    const searchInput = document.querySelector('input[placeholder*="Search"]');
    const categoryButtons = document.querySelectorAll('button[data-filter-category], section button');
    const weightSelect = document.querySelector('select[data-filter-weight]');
    const sortSelect = document.querySelector('select[data-sort]') || document.querySelector('select');

    let currentCategory = 'all';
    let currentWeight = 'all';
    let searchQuery = '';
    let currentSort = 'default';

    function renderGrid() {
        let filtered = products.filter(item => {
            const matchesCategory = (currentCategory === 'all') || (item.category.toLowerCase() === currentCategory);
            const matchesWeight = (currentWeight === 'all') || (item.weight.toLowerCase() === currentWeight);
            const matchesSearch = item.name.toLowerCase().includes(searchQuery) ||
                                  item.variant.toLowerCase().includes(searchQuery) ||
                                  item.sku.toLowerCase().includes(searchQuery);
            return matchesCategory && matchesWeight && matchesSearch;
        });

        // Sort execution
        if (currentSort === 'name-asc') {
            filtered.sort((a, b) => a.name.localeCompare(b.name));
        } else if (currentSort === 'price-low') {
            filtered.sort((a, b) => (a.websitePrice || a.mrp) - (b.websitePrice || b.mrp));
        } else if (currentSort === 'price-high') {
            filtered.sort((a, b) => (b.websitePrice || b.mrp) - (a.websitePrice || a.mrp));
        } else {
            filtered.sort((a, b) => a.displayOrder - b.displayOrder);
        }

        productGrid.innerHTML = '';

        if (filtered.length === 0) {
            productGrid.innerHTML = `
                <div class="col-span-full py-12 text-center text-brand-muted">
                    <p class="font-serif text-lg mb-2">No matching products found.</p>
                    <p class="text-xs">Try adjusting your search query or filters.</p>
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
            card.dataset.weight = product.weight;
            card.dataset.shipping = product.shipping || '';

            const priceDisplay = product.websitePrice 
                ? `₹${product.websitePrice} <span class="text-stone-400 line-through text-[11px] ml-1">₹${product.mrp}</span>`
                : (product.mrp ? `₹${product.mrp}` : 'Enquire for Price');

            const shippingDisplay = product.shipping === 'Free' 
                ? '<span class="text-[10px] text-green-700 bg-green-100 px-2 py-0.5 rounded-xs font-medium">Free Shipping</span>'
                : (product.shipping ? `<span class="text-[10px] text-stone-500 bg-stone-100 px-2 py-0.5 rounded-xs font-medium">+₹${product.shipping} Shipping</span>` : '');

            card.innerHTML = `
                <div class="aspect-square bg-stone-200 rounded-sm mb-4 flex items-center justify-center p-4 text-center group-hover:scale-[1.02] transition-transform overflow-hidden">
                    ${product.image ? `<img src="${product.image}" alt="${product.imageAlt || product.name}" class="w-full h-full object-cover">` : `<span class="text-xs font-mono text-brand-muted">[${product.sku}]</span>`}
                </div>
                <div class="flex items-center justify-between mb-1">
                    <span class="text-[10px] font-semibold uppercase tracking-wider text-brand-gold">${product.category}</span>
                    <span class="text-[10px] font-mono text-brand-muted">${product.weight}</span>
                </div>
                <h3 class="font-serif text-lg font-semibold text-brand-dark mb-1">${product.name}</h3>
                <p class="text-xs text-brand-muted mb-3 flex-grow line-clamp-2">${product.shortDescription || product.variant + ' variant'}</p>
                <div class="flex items-center justify-between mb-4">
                    <span class="text-sm font-semibold text-brand-dark font-mono">${priceDisplay}</span>
                    ${shippingDisplay}
                </div>
                <div class="grid grid-cols-2 gap-2">
                    <a href="product-detail.html?sku=${product.sku}" class="text-center py-2 px-2 border border-brand-dark text-brand-dark text-[11px] font-semibold uppercase tracking-wider hover:bg-brand-dark hover:text-white transition-colors">Details</a>
                    <button type="button" data-action="add-to-cart" data-sku="${product.sku}" data-name="${product.name}" data-price="${product.websitePrice || product.mrp || 0}" data-weight="${product.weight}" data-shipping="${product.shipping || ''}" class="py-2 px-2 bg-brand-dark text-white text-[11px] font-semibold uppercase tracking-wider rounded-sm hover:bg-brand-gold hover:text-brand-dark transition-colors">Add</button>
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

    if (weightSelect) {
        weightSelect.addEventListener('change', (e) => {
            currentWeight = e.target.value.toLowerCase().trim();
            renderGrid();
        });
    }

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
 * Initializes data population for product-detail.html using URL SKU param
 */
function initProductDetailPage(products) {
    const urlParams = new URLSearchParams(window.location.search);
    const sku = urlParams.get('sku') || 'KS-MMP-200';

    const product = products.find(p => p.sku === sku) || products[0];
    if (!product) return;

    // Populate DOM elements
    const breadcrumbName = document.querySelector('[data-detail="breadcrumb-name"]');
    const categoryBadge = document.querySelector('[data-detail="category"]');
    const titleEl = document.querySelector('[data-detail="title"]');
    const descEl = document.querySelector('[data-detail="description"]');
    const codeEl = document.querySelector('[data-detail="code"]');
    const mrpEl = document.querySelector('[data-detail="mrp"]');
    const priceEl = document.querySelector('[data-detail="price"]');
    const shippingEl = document.querySelector('[data-detail="shipping"]');
    const ingredientsList = document.querySelector('[data-detail="ingredients"]');
    const dietBadge = document.querySelector('[data-detail="diet-type"]');
    const actionContainer = document.querySelector('[data-detail="actions"]');
    const imageContainer = document.querySelector('[data-detail="image-container"]');

    if (breadcrumbName) breadcrumbName.textContent = `${product.name} ${product.weight}`;
    if (categoryBadge) categoryBadge.textContent = product.category;
    if (titleEl) titleEl.textContent = `${product.name} (${product.weight})`;
    if (descEl) descEl.textContent = product.description || product.shortDescription;
    if (codeEl) codeEl.textContent = product.sku;

    if (mrpEl) mrpEl.textContent = product.mrp ? `₹${product.mrp}` : '';
    if (priceEl) priceEl.textContent = product.websitePrice ? `₹${product.websitePrice}` : (product.mrp ? `₹${product.mrp}` : 'Enquire for Price');
    if (shippingEl) shippingEl.textContent = product.shipping === 'Free' ? 'Free Shipping' : (product.shipping ? `+₹${product.shipping} Shipping` : '');

    if (dietBadge) dietBadge.textContent = product.dietType;

    if (imageContainer) {
        if (product.image) {
            imageContainer.innerHTML = `<img src="${product.image}" alt="${product.imageAlt || product.name}" class="w-full h-full object-cover">`;
        } else {
            imageContainer.innerHTML = `
                <svg class="w-20 h-20 text-stone-400/80 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                <span class="text-xs font-mono uppercase tracking-wider text-brand-muted">${product.sku}</span>
            `;
        }
    }

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
            <button type="button" data-action="add-to-cart" data-sku="${product.sku}" data-name="${product.name}" data-price="${product.websitePrice || product.mrp || 0}" data-weight="${product.weight}" data-shipping="${product.shipping || ''}" class="px-8 py-4 bg-brand-dark text-white text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-brand-gold hover:text-brand-dark transition-all duration-300 shadow-sm">
                Add To Cart
            </button>
            <a href="contact.html?enquiry=${product.sku}" class="inline-flex justify-center items-center px-8 py-4 border border-brand-dark text-xs font-semibold uppercase tracking-wider rounded-sm text-brand-dark hover:bg-brand-dark hover:text-white transition-all duration-300">
                Enquire Now
            </a>
        `;
    }
}
