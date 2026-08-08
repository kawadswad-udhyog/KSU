/**
 * ============================================================================
 * KAWAD SWAD - Product Engine & Shop Controller with Normalized SKU Architecture
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
        const data = await response.json();
        
        const rawList = Array.isArray(data) ? data : (data.products || []);
        productsCache = normalizeSKUsToProductFamilies(rawList);
        return productsCache;
    } catch (err) {
        console.error('Failed to load products.json:', err);
        return [];
    }
}

function normalizeSKUsToProductFamilies(rawItems) {
    const families = {};

    rawItems.forEach(item => {
        if (item.variants && Array.isArray(item.variants)) {
            families[item.id] = item;
            return;
        }

        const baseName = item.name.trim();
        const familyKey = baseName.toLowerCase();

        if (!families[familyKey]) {
            families[familyKey] = {
                id: item.id.split('-')[0] || 'KS',
                name: baseName,
                category: item.category || 'Papad',
                description: item.description || '',
                shortDescription: item.description || '',
                image: item.image || 'assets/images/products/MMP.png',
                thumbnail: item.thumbnail || item.image || '',
                displayOrder: item.displayOrder || 1,
                tags: item.tags || [],
                variants: []
            };
        }

        families[familyKey].variants.push({
            sku: item.sku || item.id,
            weight: item.weight || '200g',
            mrp: item.originalPrice || item.price || 0,
            selling: item.price || 0,
            shipping: item.shipping || (item.price > 200 ? 'Free' : '40')
        });
    });

    return Object.values(families);
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
    const productGrid = document.querySelector('[data-shop-grid]') || document.querySelector('.grid');
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
            const matchesWeight = (currentWeight === 'all') || (item.variants && item.variants.some(v => v.weight.toLowerCase().includes(currentWeight)));
            const matchesSearch = item.name.toLowerCase().includes(searchQuery) ||
                                  item.description.toLowerCase().includes(searchQuery) ||
                                  (item.variants && item.variants.some(v => v.sku.toLowerCase().includes(searchQuery)));
            return matchesCategory && matchesWeight && matchesSearch;
        });

        if (currentSort === 'name-asc') {
            filtered.sort((a, b) => a.name.localeCompare(b.name));
        } else if (currentSort === 'price-low') {
            filtered.sort((a, b) => (a.variants[0]?.selling || 0) - (b.variants[0]?.selling || 0));
        } else if (currentSort === 'price-high') {
            filtered.sort((a, b) => (b.variants[0]?.selling || 0) - (a.variants[0]?.selling || 0));
        } else {
            filtered.sort((a, b) => (a.displayOrder || 1) - (b.displayOrder || 1));
        }

        productGrid.innerHTML = '';

        if (filtered.length === 0) {
            productGrid.innerHTML = `
                <div class="col-span-full py-12 text-center text-[#8B8174]">
                    <p class="font-serif text-lg mb-2 text-[#4E342E]">No matching products found.</p>
                    <p class="text-xs">Try adjusting your search query or selecting a different category filter.</p>
                </div>
            `;
            return;
        }

        const fragment = document.createDocumentFragment();

        filtered.forEach(product => {
            const card = document.createElement('div');
            card.className = 'bg-white rounded-xl p-4 sm:p-5 border border-[#F3E6C8] shadow-sm hover:shadow-md transition-all duration-300 flex flex-col group';
            
            const variants = product.variants || [{ weight: '200g', sku: product.id, mrp: product.originalPrice || 55, selling: product.price || 45, shipping: 'Free' }];
            let activeVariant = variants[0];

            const rawImg = product.image || 'assets/images/products/MMP.png';
            const imgSrc = rawImg.startsWith('http') ? rawImg : `./${rawImg.replace(/^\/+/, '')}`;

            const variantOptionsHTML = variants.map((v, idx) => `
                <option value="${idx}" ${idx === 0 ? 'selected' : ''}>${v.weight} - &#8377;${v.selling}</option>
            `).join('');

            card.innerHTML = `
                <div class="aspect-square bg-[#FFFDF7] rounded-lg mb-4 flex items-center justify-center p-2 text-center group-hover:scale-105 transition-transform overflow-hidden border border-[#F3E6C8]">
                    <img src="${imgSrc}" alt="${product.name} - Traditional Jain Papad" loading="lazy" decoding="async" class="w-full h-full object-cover rounded-md" onerror="this.src='assets/images/products/MMP.png'">
                </div>
                <div class="flex items-center justify-between mb-2">
                    <span class="text-[10px] font-bold uppercase tracking-wider text-[#FE330E] bg-[#FFFDE6] px-2.5 py-1 rounded-full border border-[#F3E6C8]">${product.category}</span>
                    <div class="w-32">
                        <select data-variant-select class="w-full bg-white border border-[#F3E6C8] rounded-lg py-1 px-1.5 text-xs font-medium text-[#4E342E] focus:outline-none focus:border-[#FE330E]">
                            ${variantOptionsHTML}
                        </select>
                    </div>
                </div>
                <h3 class="font-serif text-base sm:text-lg font-bold text-[#4E342E] mb-1 line-clamp-1"></h3>
                <p class="text-xs text-[#5F5F5F] mb-4 flex-grow line-clamp-2 font-light"></p>
                <div class="flex items-center justify-between mb-4 pt-2 border-t border-[#F3E6C8]">
                    <span data-price-display class="text-base font-bold text-[#FE330E] font-serif">
                        &#8377;${activeVariant.selling} ${activeVariant.mrp > activeVariant.selling ? `<span class="text-[#8B8174] line-through text-xs font-normal ml-1">&#8377;${activeVariant.mrp}</span>` : ''}
                    </span>
                    <span data-shipping-display class="text-[11px] font-medium text-[#8B8174]">
                        ${activeVariant.shipping === 'Free' ? 'Free Shipping' : (activeVariant.shipping ? `+&#8377;${activeVariant.shipping} Ship` : '')}
                    </span>
                </div>
                <div class="grid grid-cols-2 gap-2">
                    <a data-detail-link href="product-detail.html?sku=${activeVariant.sku}" class="text-center py-2.5 px-2 border border-[#F3E6C8] rounded-lg text-[#4E342E] text-xs font-semibold uppercase tracking-wider hover:border-[#FE330E] hover:text-[#FE330E] transition-colors">Details</a>
                    <button type="button" data-action="add-to-cart" data-sku="${activeVariant.sku}" data-name="${product.name} (${activeVariant.weight})" data-price="${activeVariant.selling}" data-weight="${activeVariant.weight}" data-shipping="${activeVariant.shipping || ''}" data-image="${rawImg}" class="py-2.5 px-2 bg-[#FE330E] text-white text-xs font-semibold uppercase tracking-wider rounded-lg hover:bg-[#d92500] transition-colors shadow-sm">Add</button>
                </div>
            `;

            card.querySelector('h3').textContent = product.name;
            card.querySelector('p').textContent = product.shortDescription || product.description;

            const selectEl = card.querySelector('[data-variant-select]');
            const priceEl = card.querySelector('[data-price-display]');
            const shippingEl = card.querySelector('[data-shipping-display]');
            const detailLink = card.querySelector('[data-detail-link]');
            const cartBtn = card.querySelector('[data-action="add-to-cart"]');

            selectEl.addEventListener('change', (e) => {
                const selectedVariant = variants[e.target.value];
                priceEl.innerHTML = `&#8377;${selectedVariant.selling} ${selectedVariant.mrp > selectedVariant.selling ? `<span class="text-[#8B8174] line-through text-xs font-normal ml-1">&#8377;${selectedVariant.mrp}</span>` : ''}`;
                shippingEl.textContent = selectedVariant.shipping === 'Free' ? 'Free Shipping' : (selectedVariant.shipping ? `+&#8377;${selectedVariant.shipping} Ship` : '');

                detailLink.href = `product-detail.html?sku=${selectedVariant.sku}`;
                cartBtn.dataset.sku = selectedVariant.sku;
                cartBtn.dataset.name = `${product.name} (${selectedVariant.weight})`;
                cartBtn.dataset.price = selectedVariant.selling;
                cartBtn.dataset.weight = selectedVariant.weight;
                cartBtn.dataset.shipping = selectedVariant.shipping || '';
            });

            cartBtn.addEventListener('click', (e) => {
                const btn = e.currentTarget;
                const item = {
                    sku: btn.dataset.sku,
                    name: btn.dataset.name,
                    price: parseFloat(btn.dataset.price),
                    weight: btn.dataset.weight,
                    shipping: btn.dataset.shipping,
                    image: btn.dataset.image,
                    quantity: 1
                };

                if (window.KawadCart && typeof window.KawadCart.addItem === 'function') {
                    window.KawadCart.addItem(item);
                }
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
                b.classList.remove('bg-[#FE330E]', 'text-white');
                b.classList.add('bg-[#FFFDE6]', 'text-[#4E342E]');
            });
            btn.classList.remove('bg-[#FFFDE6]', 'text-[#4E342E]');
            btn.classList.add('bg-[#FE330E]', 'text-white');

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

    let selectedVariant = product.variants ? product.variants.find(v => v.sku === sku) || product.variants[0] : { weight: product.weight || '200g', sku: product.sku, mrp: product.originalPrice || 55, selling: product.price || 45, shipping: 'Free' };

    const titleEl = document.querySelector('[data-detail="title"]');
    const priceEl = document.querySelector('[data-detail="price"]');
    const mrpEl = document.querySelector('[data-detail="mrp"]');
    const shippingEl = document.querySelector('[data-detail="shipping"]');
    const descEl = document.querySelector('[data-detail="description"]');
    const codeEl = document.querySelector('[data-detail="code"]');
    const imageContainer = document.querySelector('[data-detail="image-container"]');
    const actionContainer = document.querySelector('[data-detail="actions"]');
    const variantContainer = document.querySelector('[data-detail="variants"]');

    if (titleEl) titleEl.textContent = product.name;
    if (priceEl) priceEl.textContent = `₹${selectedVariant.selling}`;
    if (mrpEl) mrpEl.textContent = selectedVariant.mrp > selectedVariant.selling ? `₹${selectedVariant.mrp}` : '';
    if (shippingEl) shippingEl.textContent = selectedVariant.shipping === 'Free' ? 'Free Shipping' : (selectedVariant.shipping ? `+₹${selectedVariant.shipping} Shipping` : '');
    if (descEl) descEl.textContent = product.description;
    if (codeEl) codeEl.textContent = selectedVariant.sku;

    if (imageContainer) {
        const rawImg = product.image || 'assets/images/products/MMP.png';
        const imgSrc = rawImg.startsWith('http') ? rawImg : `./${rawImg.replace(/^\/+/, '')}`;
        imageContainer.innerHTML = `<img src="${imgSrc}" alt="${product.name} - Detailed View" class="w-full h-full object-cover rounded-xl" onerror="this.src='assets/images/products/MMP.png'">`;
    }

    if (variantContainer && product.variants && product.variants.length > 1) {
        variantContainer.innerHTML = `
            <label class="block text-xs font-bold uppercase text-[#4E342E] mb-1.5">Select Weight / Variant:</label>
            <div class="flex flex-wrap gap-2">
                ${product.variants.map(v => `
                    <button type="button" class="variant-btn px-4 py-2 text-xs font-semibold rounded-lg border ${v.sku === selectedVariant.sku ? 'bg-[#FE330E] text-white border-[#FE330E]' : 'bg-white text-[#4E342E] border-[#F3E6C8] hover:border-[#FE330E]'}" data-sku="${v.sku}">
                        ${v.weight} (&#8377;${v.selling})
                    </button>
                `).join('')}
            </div>
        `;

        variantContainer.querySelectorAll('.variant-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const targetSku = e.currentTarget.getAttribute('data-sku');
                window.location.search = `?sku=${targetSku}`;
            });
        });
    }

    if (actionContainer) {
        actionContainer.innerHTML = `
            <button type="button" data-action="add-to-cart" data-sku="${selectedVariant.sku}" data-name="${product.name} (${selectedVariant.weight})" data-price="${selectedVariant.selling}" data-weight="${selectedVariant.weight}" data-shipping="${selectedVariant.shipping || ''}" data-image="${product.image}" class="w-full sm:w-auto px-8 py-4 bg-[#FE330E] text-white text-xs font-semibold uppercase tracking-wider rounded-xl hover:bg-[#d92500] transition-all shadow-sm">
                Add To Cart
            </button>
        `;

        actionContainer.querySelector('button').addEventListener('click', (e) => {
            const btn = e.currentTarget;
            const item = {
                sku: btn.dataset.sku,
                name: btn.dataset.name,
                price: parseFloat(btn.dataset.price),
                weight: btn.dataset.weight,
                shipping: btn.dataset.shipping,
                image: btn.dataset.image,
                quantity: 1
            };

            if (window.KawadCart && typeof window.KawadCart.addItem === 'function') {
                window.KawadCart.addItem(item);
            }
        });
    }
}
