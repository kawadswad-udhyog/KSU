/**
 * KAWAD SWAD - Products Data Loader
 * Loads products from data/products.json and exposes globally
 */

let KAWAD_PRODUCTS = [];

async function loadProducts() {
  try {
    // Corrected path resolution for static/GitHub hosting
    const pathSegments = window.location.pathname.split('/').filter(Boolean);
    const isGitHubPages = pathSegments.length > 0 && pathSegments[0] === 'KSU';
    const basePath = isGitHubPages ? '/KSU/' : '/';
    
    const response = await fetch(`${basePath}data/products.json`.replace(/\/+/g, '/'));
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const data = await response.json();
    // Assuming products.json is an array at root based on previous file content
    KAWAD_PRODUCTS = Array.isArray(data) ? data : (data.products || []);
    
    window.KAWAD_PRODUCTS = KAWAD_PRODUCTS;
    console.log(`✓ Loaded ${KAWAD_PRODUCTS.length} products`);
  } catch (error) {
    console.warn('Products loader: Using fallback data', error);
    // Fallback data consistent with the provided data/products.json schema
    KAWAD_PRODUCTS = [
      {
        "sku": "KS-MMP-200",
        "slug": "moong-master-papad",
        "name": "Moong Master Papad",
        "variant": "Master",
        "category": "Moong",
        "baseType": "Papad",
        "image": "assets/images/products/MMP.png"
      }
    ];
    window.KAWAD_PRODUCTS = KAWAD_PRODUCTS;
  }
}

// Load immediately on script execution
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadProducts);
} else {
  loadProducts();
}
