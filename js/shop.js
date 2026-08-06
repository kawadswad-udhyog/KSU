/**
 * ============================================================================
 * KAWAD SWAD - Product Engine & Shop Controller (js/shop.js)
 * ============================================================================
 * Optimized single-fetch product database controller supporting debounced input 
 * processing, category/weight filtering, layout stability, and accessibility.
 */

let productsCache = null;

/**
 * Debounce helper function for search inputs
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Database loader with memory caching
 */
async function getProductsDatabase() {
    if (productsCache) return productsCache;
    try {
        const response = await fetch('data/products.json');
        if (!response.ok) throw new Error(`HTTP status: ${response.status}`);
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

    function getSellingPrice(item) {
        if (item.price && typeof item.price.selling === 'number') return item.price.selling;
        if (item.price && typeof item.price.mrp === 'number') return item.price.mrp;
        return 0;
    }

    function renderGrid() {
        let filtered = products.filter(item => {
            const matchesCategory = (currentCategory === 'all') || (item.category.toLowerCase() === currentCategory);
            const matchesWeight = (currentWeight === 'all') || (item.weight.toLowerCase() === currentWeight);
            const matchesSearch = item.name.toLowerCase().includes(searchQuery) ||
                                  item.variant.toLowerCase().includes(searchQuery) ||
                                  item.sku.toLowerCase().includes(searchQuery);
            return matchesCategory && matchesWeight && matchesSearch;
        });

        if (currentSort === 'name-asc') {
            filtered.sort((a, b) => a.name.localeCompare(b.name));
        } else if (currentSort === 'price-low') {
            filtered.sort((a, b) => getSellingPrice(a) - getSellingPrice(b));
        } else if (currentSort === 'price-high') {
            filtered.sort((a, b) => getSellingPrice(b) - getSellingPrice(a));
        } else {
            filtered.sort((a, b) => a.displayOrder - b.displayOrder);
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

        const fragment = document.createDocumentFragment();

        filtered.forEach(product => {
            const card = document.createElement('div');
            card.className = 'bg-brand-cream/40 rounded-sm p-5 border border-stone-200/80 hover:shadow-xl transition-all duration-300 flex flex-col group';
            
            const mrp = product.price ? product.price.mrp : null;
            const selling = product.price ? product.price.selling : null;
            const shipping = product.price ? product.price.shipping : null;
            const activePrice = selling !== null ? selling : (mrp !== null ? mrp : 0);

            card.dataset.id = product.sku;
            card.dataset.sku = product.sku;
            card.dataset.name = product.name;
            card.dataset.price = activePrice;
            card.dataset.category = product.category;
            card.dataset.weight = product.weight;
            card.dataset.shipping = shipping !== null ? shipping : '';

            const priceDisplay = (selling !== null && mrp !== null && selling !== mrp)
                ? `₹${selling} <span class="text-stone-400 line-through text-[11px] ml-1">₹${mrp}</span>`
                : (activePrice ? `₹${activePrice}` : 'Enquire for Price');

            const shippingDisplay = (shipping === 'Free')
                ? '<span class="text-[10px] text-green-700 bg-green-100 px-2 py-0.5 rounded-xs font-medium">Free Shipping</span>'
                : (shipping ? `<span class="text-[10px] text-stone-500 bg-stone-100 px-2 py-0.5 rounded-xs font-medium">+₹${shipping} Shipping</span>` : '');

            const imgSrc = product.image || product.placeholderImage || 'assets/images/product-placeholder.webp';

            card.innerHTML = `
                <div class="aspect-square bg-stone-200 rounded-sm mb-4 flex items-center justify-center p-4 text-center group-hover:scale-[1.02] transition-transform overflow-hidden">
                    <img src="${imgSrc}" alt="${product.imageAlt || product.name}" loading="lazy" decoding="async" class="w-full h-full object-cover" onerror="this.outerHTML='<span class=\\'text-xs font-mono text-brand-muted\\'>[${product.sku}]</span>'">
                </div>
                <div class="flex items-center justify-between mb-1">
                    <span class="text-[10px] font-semibold uppercase tracking-wider text-brand-gold">${product.category}</span>
                    <span class="text-[10px] font-mono text-brand-muted">${product.weight}</span>
                </div>
                <h3 class="font-serif text-lg font-semibold text-brand-dark mb-1">${product.name}</h3>
                <p class="text-xs text-brand-muted mb-3 flex-grow line-clamp-2">${product.shortDescription || (product.variant + ' variant')}</p>
                <div class="flex items-center justify-between mb-4">
                    <span class="text-sm font-semibold text-brand-dark font-mono">${priceDisplay}</span>
                    ${shippingDisplay}
                </div>
                <div class="grid grid-cols-2 gap-2">
                    <a href="product-detail.html?sku=${product.sku}" class="text-center py-2 px-2 border border-brand-dark text-brand-dark text-[11px] font-semibold uppercase tracking-wider hover:bg-brand-dark hover:text-white transition-colors">Details</a>
                    <button type="button" data-action="add-to-cart" data-sku="${product.sku}" data-name="${product.name}" data-price="${activePrice}" data-weight="${product.weight}" data-shipping="${shipping || ''}" class="py-2 px-2 bg-brand-dark text-white text-[11px] font-semibold uppercase tracking-wider rounded-sm hover:bg-brand-gold hover:text-brand-dark transition-colors">Add</button>
                </div>
            `;
            fragment.appendChild(card);
        });

        productGrid.appendChild(fragment);
    }

    if (searchInput) {
        searchInput.addEventListener('input', debounce((e) => {
            searchQuery = e.target.value.toLowerCase().trim();
            renderGrid();
        }, 200));
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

function initProductDetailPage(products) {
    const urlParams = new URLSearchParams(window.location.search);
    const sku = urlParams.get('sku') || 'KS-MMP-200';

    const product = products.find(p => p.sku === sku) || products[0];
    if (!product) return;

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

    const mrp = product.price ? product.price.mrp : null;
    const selling = product.price ? product.price.selling : null;
    const shipping = product.price ? product.price.shipping : null;
    const activePrice = selling !== null ? selling : (mrp !== null ? mrp : 0);

    if (breadcrumbName) breadcrumbName.textContent = `${product.name} ${product.weight}`;
    if (categoryBadge) categoryBadge.textContent = product.category;
    if (titleEl) titleEl.textContent = `${product.name} (${product.weight})`;
    if (descEl) descEl.textContent = product.description || product.shortDescription;
    if (codeEl) codeEl.textContent = product.sku;

    if (mrpEl) mrpEl.textContent = mrp ? `₹${mrp}` : '';
    if (priceEl) priceEl.textContent = selling !== null ? `₹${selling}` : (mrp ? `₹${mrp}` : 'Enquire for Price');
    if (shippingEl) shippingEl.textContent = shipping === 'Free' ? 'Free Shipping' : (shipping ? `+₹${shipping} Shipping` : '');

    if (dietBadge) dietBadge.textContent = product.dietType;

    if (imageContainer) {
        const placeholder = product.placeholderImage || 'assets/images/product-placeholder.webp';
        const imgSrc = product.image || placeholder;
        imageContainer.innerHTML = `
            <img src="${imgSrc}" alt="${product.imageAlt || product.name}" loading="lazy" decoding="async" class="w-full h-full object-cover" onerror="this.style.opacity='0.4'">
            ${!product.image ? `<span class="absolute text-xs font-mono uppercase tracking-wider text-brand-muted">${product.sku}</span>` : ''}
        `;
    }

    if (ingredientsList) {
        if (product.ingredients && product.ingredients.length) {
            ingredientsList.innerHTML = product.ingredients.map(ing => `
                <li class="flex items-center gap-3">
                    <span class="w-2 h-2 rounded-full bg-brand-gold flex-shrink-0"></span>
                    <span>${ing}</span>
                </li>
            `).join('');
        } else {
            ingredientsList.innerHTML = `<li class="text-xs text-brand-muted italic">Ingredients information will be updated.</li>`;
        }
    }

    if (actionContainer) {
        actionContainer.innerHTML = `
            <button type="button" data-action="add-to-cart" data-sku="${product.sku}" data-name="${product.name}" data-price="${activePrice}" data-weight="${product.weight}" data-shipping="${shipping || ''}" class="px-8 py-4 bg-brand-dark text-white text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-brand-gold hover:text-brand-dark transition-all duration-300 shadow-sm">
                Add To Cart
            </button>
            <a href="contact.html?enquiry=${product.sku}" class="inline-flex justify-center items-center px-8 py-4 border border-brand-dark text-xs font-semibold uppercase tracking-wider rounded-sm text-brand-dark hover:bg-brand-dark hover:text-white transition-all duration-300">
                Enquire Now
            </a>
        `;
    }
}
