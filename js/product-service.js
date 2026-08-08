/**
 * KAWAD SWAD - Centralized Product Data Service
 */
const ProductService = {
    cache: null,

    async getProducts() {
        if (this.cache) return this.cache;

        try {
            const response = await fetch('data/products.json');
            if (!response.ok) throw new Error('Failed to fetch products');
            this.cache = await response.json();
            return this.cache;
        } catch (error) {
            console.error('Error loading products:', error);
            return [];
        }
    }
};
