/**
 * KAWAD SWAD - Products Data Loader
 * Loads products from data/products.json and exposes globally
 */

let KAWAD_PRODUCTS = [];

async function loadProducts() {
  try {
    const response = await fetch('data/products.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    KAWAD_PRODUCTS = data.products || [];
    window.KAWAD_PRODUCTS = KAWAD_PRODUCTS;
    console.log(`✓ Loaded ${KAWAD_PRODUCTS.length} products`);
  } catch (error) {
    console.warn('Products loader: Using fallback data', error);
    // Fallback data for offline scenarios
    KAWAD_PRODUCTS = [
      {
        id: 'MMP-200',
        name: 'Moong Master Papad',
        category: 'Moong',
        price: 45,
        originalPrice: 55,
        image: 'assets/images/products/MMP.png'
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
