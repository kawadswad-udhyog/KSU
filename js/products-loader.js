/**
 * KAWAD SWAD - Products Data Loader
 * Uses ProductService to load data and exposes it globally
 */

let KAWAD_PRODUCTS = [];

async function loadProducts() {
  try {
    // Rely on ProductService for the data
    const data = await ProductService.getProducts();
    
    // Process the data from the service
    KAWAD_PRODUCTS = Array.isArray(data) ? data : (data.products || []);
    
    // Expose to window for legacy support if needed
    window.KAWAD_PRODUCTS = KAWAD_PRODUCTS;
    
    console.log(`✓ Products loader: Successfully populated ${KAWAD_PRODUCTS.length} products`);
  } catch (error) {
    console.error('Products loader: Failed to populate data', error);
    KAWAD_PRODUCTS = [];
    window.KAWAD_PRODUCTS = KAWAD_PRODUCTS;
  }
}

// Ensure execution happens after the service is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadProducts);
} else {
  loadProducts();
}
