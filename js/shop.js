/**
 * ============================================================================
 * KAWAD SWAD - Product Engine & Shop Controller with Normalized SKU Architecture
 * ============================================================================
 */

let productsCache = null;

function getBasePath() {
    const isGitHubPages = window.location.pathname.includes('/KSU/');
    return isGitHubPages ? '/KSU/' : './';
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
        // If the item already has a variants array, treat as family root
        if (item.variants && Array.isArray(item.variants)) {
            families[item.sku] = item;
            return;
        }

        const baseName = item.name.trim();
        const familyKey = baseName.toLowerCase();

        if (!families[familyKey]) {
            families[familyKey] = {
                sku: item.sku.split('-').slice(0, 2).join('-'), 
                name: baseName,
                category: item.category || 'Papad',
                description: item.description || '',
                shortDescription: item.shortDescription || item.description || '',
                image: item.image || 'assets/images/products/MMP.png',
                displayOrder: item.displayOrder || 1,
                variants: []
            };
        }

        families[familyKey].variants.push({
            sku: item.sku,
            weight: item.variants ? item.variants[0].weight : '200g',
            mrp: item.variants ? item.variants[0].mrp : (item.mrp || item.price || 0),
            selling: item.variants ? item.variants[0].selling : (item.price || 0),
            shipping: item.variants ? item.variants[0].shipping : (item.shipping || 49)
        });
    });

    return Object.values(families);
}

document.addEventListener('DOMContentLoaded', async () => {
    const products = await ProductService.getProducts();
    const grid = document.querySelector('[data-shop-grid]');
    if (grid && products.length > 0) {
        renderProducts(products, grid);
    }
});

function renderProducts(products, container) {
    // ... existing rendering logic ...
}

function initShopPage(products) {
    const productGrid = document.querySelector('[data-shop-grid]') || document.querySelector('.grid');
    if (!productGrid) return;

    const searchInput = document.querySelector('input[placeholder*="Search"]');
    const categoryButtons = document.querySelectorAll('button[data-filter-category]');
    
    let currentCategory = 'all';
    let searchQuery = '';

    function renderGrid() {
        let filtered = products.filter(item => {
            const matchesCategory = (currentCategory === 'all') || (item.category.toLowerCase() === currentCategory);
            const matchesSearch = item.name.toLowerCase().includes(searchQuery) || 
                                  item.description.toLowerCase().includes(searchQuery);
            return matchesCategory && matchesSearch;
        });

        productGrid.innerHTML = '';

        if (filtered.length === 0) {
            productGrid.innerHTML = `<div class="col-span-full py-12 text-center text-[#8B8174]">No matching products found.</div>`;
            return;
        }

        const fragment = document.createDocumentFragment();
        filtered.forEach(product => {
            const card = document.createElement('div');
            card.className = 'card group flex flex-col p-4';
            
            const activeVariant = product.variants[0];
            const rawImg = product.image;
            const basePath = getBasePath();
            const imgSrc = rawImg.startsWith('http') ? rawImg : `${basePath}${rawImg.replace(/^\/+/, '')}`;

            card.innerHTML = `
                <div class="aspect-square bg-[#FFFDF7] rounded-lg mb-4 flex items-center justify-center overflow-hidden border border-[#F3E6C8]">
                    <img src="${imgSrc}" alt="${product.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                </div>
                <div class="flex-grow space-y-2">
                    <h3 class="font-serif text-lg font-bold text-[#4E342E]">${product.name}</h3>
                    <p class="text-xs text-[#5F5F5F] line-clamp-2">${product.shortDescription}</p>
                    <div class="flex items-center justify-between pt-2">
                        <span class="text-lg font-bold text-[#FE330E]">₹${activeVariant.selling}</span>
                        <a href="product-detail.html?sku=${activeVariant.sku}" class="btn-secondary text-xs">View Details</a>
                    </div>
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
            currentCategory = btn.dataset.filterCategory.toLowerCase();
            renderGrid();
        });
    });

    renderGrid();
}

function initProductDetailPage(products) {
    const urlParams = new URLSearchParams(window.location.search);
    const sku = urlParams.get('sku');
    
    // Find product family containing this SKU
    let product = products.find(p => p.variants.some(v => v.sku === sku));
    if (!product) product = products[0];
    
    const variant = product.variants.find(v => v.sku === sku) || product.variants[0];

    // UI Updates
    document.querySelectorAll('[data-detail="title"]').forEach(el => el.textContent = product.name);
    document.querySelectorAll('[data-detail="price"]').forEach(el => el.textContent = `₹${variant.selling}`);
    document.querySelectorAll('[data-detail="description"]').forEach(el => el.textContent = product.description);
    
    const imgEl = document.querySelector('[data-detail="image"]');
    if (imgEl) imgEl.src = getBasePath() + product.image;

    const cartBtn = document.querySelector('[data-action="add-to-cart"]');
    if (cartBtn) {
        cartBtn.addEventListener('click', () => {
            if (window.KawadCart) {
                window.KawadCart.addItem({
                    sku: variant.sku,
                    name: product.name,
                    price: variant.selling,
                    weight: variant.weight,
                    shipping: variant.shipping,
                    image: product.image,
                    quantity: 1
                });
            }
        });
    }
}
