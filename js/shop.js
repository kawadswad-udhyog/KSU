/**
 * ============================================================================
 * KAWAD SWAD - Product Engine & Shop Controller with Variant Dropdown
 * ============================================================================
 */

let productsCache = null;

function getBasePath() {
    return './';
}

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

async function getProductsDatabase() {
    if (productsCache) return productsCache;
    try {
        const basePath = getBasePath();
        const response = await fetch(`${basePath}data/products.json`);
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

    function renderGrid() {
        let filtered = products.filter(item => {
            const matchesCategory = (currentCategory === 'all') || (item.category.toLowerCase() === currentCategory);
            const matchesWeight = (currentWeight === 'all') || (item.variants && item.variants.some(v => v.weight.toLowerCase() === currentWeight));
            const matchesSearch = item.name.toLowerCase().includes(searchQuery) ||
                                  (item.variant && item.variant.toLowerCase().includes(searchQuery)) ||
                                  (item.sku && item.sku.toLowerCase().includes(searchQuery));
            return matchesCategory && matchesWeight && matchesSearch;
        });

        if (currentSort === 'name-asc') {
            filtered.sort((a, b) => a.name.localeCompare(b.name));
        } else if (currentSort === 'price-low') {
            filtered.sort((a, b) => (a.variants[0]?.selling || 0) - (b.variants[0]?.selling || 0));
        } else if (currentSort === 'price-high') {
            filtered.sort((a, b) => (b.variants[0]?.selling || 0) - (a.variants[0]?.selling || 0));
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
            
            const variants = product.variants || [{ weight: product.weight || '200g', sku: product.sku, mrp: product.price?.mrp, selling: product.price?.selling, shipping: product.price?.shipping }];
            let activeVariant = variants[0];

            const rawImg = product.image || 'assets/images/product-placeholder.webp';
            const imgSrc = rawImg.startsWith('http') ? rawImg : `./${rawImg.replace(/^\/+/, '')}`;

            const variantOptionsHTML = variants.map((v, idx) => `
                <option value="${idx}" ${idx === 0 ? 'selected' : ''}>${v.weight} - ₹${v.selling !== undefined ? v.selling : v.mrp}</option>
            `).join('');

            card.innerHTML = `
                <div class="aspect-square bg-stone-200 rounded-sm mb-4 flex items-center justify-center p-4 text-center group-hover:scale-[1.02] transition-transform overflow-hidden">
                    <img src="${imgSrc}" alt="${product.name}" loading="lazy" decoding="async" class="w-full h-full object-cover" onerror="this.outerHTML='<span class=\\'text-xs font-mono text-brand-muted\\'>[${product.sku}]</span>'">
                </div>
                <div class="flex items-center justify-between mb-1">
                    <span class="text-[10px] font-semibold uppercase tracking-wider text-brand-gold">${product.category}</span>
                    <div class="w-28">
                        <select data-variant-select class="w-full bg-white border border-stone-300 rounded-xs py-1 px-1 text-[11px] font-mono text-brand-dark focus:outline-none focus:border-brand-gold">
                            ${variantOptionsHTML}
                        </select>
                    </div>
                </div>
                <h3 class="font-serif text-lg font-semibold text-brand-dark mb-1">${product.name}</h3>
                <p class="text-xs text-brand-muted mb-3 flex-grow line-clamp-2">${product.shortDescription || (product.variant + ' variant')}</p>
                <div class="flex items-center justify-between mb-4">
                    <span data-price-display class="text-sm font-semibold text-brand-dark font-mono">
                        ₹${activeVariant.selling} <span class="text-stone-400 line-through text-[11px] ml-1">₹${activeVariant.mrp}</span>
                    </span>
                    <span data-shipping-display>
                        ${activeVariant.shipping === 'Free' ? '<span class="text-[10px] text-green-700 bg-green-100 px-2 py-0.5 rounded-xs font-medium">Free Shipping</span>' : (activeVariant.shipping ? `<span class="text-[10px] text-stone-500 bg-stone-100 px-2 py-0.5 rounded-xs font-medium">+₹${activeVariant.shipping} Shipping</span>` : '')}
                    </span>
                </div>
                <div class="grid grid-cols-2 gap-2">
                    <a data-detail-link href="product-detail.html?sku=${activeVariant.sku}" class="text-center py-2 px-2 border border-brand-dark text-brand-dark text-[11px] font-semibold uppercase tracking-wider hover:bg-brand-dark hover:text-white transition-colors">Details</a>
                    <button type="button" data-action="add-to-cart" data-sku="${activeVariant.sku}" data-name="${product.name} (${activeVariant.weight})" data-price="${activeVariant.selling}" data-weight="${activeVariant.weight}" data-shipping="${activeVariant.shipping || ''}" data-image="${rawImg}" class="py-2 px-2 bg-brand-dark text-white text-[11px] font-semibold uppercase tracking-wider rounded-sm hover:bg-brand-gold hover:text-brand-dark transition-colors">Add</button>
                </div>
            `;

            // Dynamic change handler for the variant dropdown
            const selectEl = card.querySelector('[data-variant-select]');
            const priceEl = card.querySelector('[data-price-display]');
            const shippingEl = card.querySelector('[data-shipping-display]');
            const detailLink = card.querySelector('[data-detail-link]');
            const cartBtn = card.querySelector('[data-action="add-to-cart"]');

            selectEl.addEventListener('change', (e) => {
                const selectedVariant = variants[e.target.value];
                priceEl.innerHTML = `₹${selectedVariant.selling} <span class="text-stone-400 line-through text-[11px] ml-1">₹${selectedVariant.mrp}</span>`;
                
                if (selectedVariant.shipping === 'Free') {
                    shippingEl.innerHTML = '<span class="text-[10px] text-green-700 bg-green-100 px-2 py-0.5 rounded-xs font-medium">Free Shipping</span>';
                } else if (selectedVariant.shipping) {
                    shippingEl.innerHTML = `<span class="text-[10px] text-stone-500 bg-stone-100 px-2 py-0.5 rounded-xs font-medium">+₹${selectedVariant.shipping} Shipping</span>`;
                } else {
                    shippingEl.innerHTML = '';
                }

                detailLink.href = `product-detail.html?sku=${selectedVariant.sku}`;
                cartBtn.dataset.sku = selectedVariant.sku;
                cartBtn.dataset.name = `${product.name} (${selectedVariant.weight})`;
                cartBtn.dataset.price = selectedVariant.selling;
                cartBtn.dataset.weight = selectedVariant.weight;
                cartBtn.dataset.shipping = selectedVariant.shipping || '';
            });

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
            currentCategory = text === 'all' ? 'all' : text;
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

    let product = products.find(p => p.sku === sku || (p.variants && p.variants.some(v => v.sku === sku))) || products[0];
    if (!product) return;

    let selectedVariant = product.variants ? product.variants.find(v => v.sku === sku) || product.variants[0] : { weight: product.weight, sku: product.sku, mrp: product.price?.mrp, selling: product.price?.selling, shipping: product.price?.shipping };

    const titleEl = document.querySelector('[data-detail="title"]');
    const priceEl = document.querySelector('[data-detail="price"]');
    const mrpEl = document.querySelector('[data-detail="mrp"]');
    const shippingEl = document.querySelector('[data-detail="shipping"]');
    const descEl = document.querySelector('[data-detail="description"]');
    const codeEl = document.querySelector('[data-detail="code"]');
    const imageContainer = document.querySelector('[data-detail="image-container"]');
    const actionContainer = document.querySelector('[data-detail="actions"]');

    if (titleEl) titleEl.textContent = `${product.name} (${selectedVariant.weight})`;
    if (priceEl) priceEl.textContent = `₹${selectedVariant.selling}`;
    if (mrpEl) mrpEl.textContent = selectedVariant.mrp ? `₹${selectedVariant.mrp}` : '';
    if (shippingEl) shippingEl.textContent = selectedVariant.shipping === 'Free' ? 'Free Shipping' : (selectedVariant.shipping ? `+₹${selectedVariant.shipping} Shipping` : '');
    if (descEl) descEl.textContent = product.description;
    if (codeEl) codeEl.textContent = selectedVariant.sku;

    if (imageContainer) {
        const rawImg = product.image || 'assets/images/product-placeholder.webp';
        const imgSrc = rawImg.startsWith('http') ? rawImg : `./${rawImg.replace(/^\/+/, '')}`;
        imageContainer.innerHTML = `<img src="${imgSrc}" alt="${product.name}" class="w-full h-full object-cover">`;
    }

    if (actionContainer) {
        actionContainer.innerHTML = `
            <button type="button" data-action="add-to-cart" data-sku="${selectedVariant.sku}" data-name="${product.name} (${selectedVariant.weight})" data-price="${selectedVariant.selling}" data-weight="${selectedVariant.weight}" data-shipping="${selectedVariant.shipping || ''}" data-image="${product.image}" class="px-8 py-4 bg-brand-dark text-white text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-brand-gold hover:text-brand-dark transition-all">
                Add To Cart
            </button>
        `;
    }
}
