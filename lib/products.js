// =====================================================
// Sarto Product Sources
// Demo data + real API connectors (activate with env vars)
// =====================================================

// Demo products for when APIs are not yet configured
const DEMO_PRODUCTS = [
  { id: 'd1', brand: 'COS', name: 'Wool-Blend Quilted Vest', price: 79, currency: '€', store: 'COS', storeUrl: 'https://cos.com', colors: ['#c0392b','#2c3e50','#8b6914'], category: 'vest', material: 'wool', color: 'red', image: null },
  { id: 'd2', brand: 'ZARA', name: 'Red Knit Waistcoat', price: 45.95, originalPrice: 59.95, currency: '€', store: 'ZARA', storeUrl: 'https://zara.com', colors: ['#c0392b','#ecf0f1'], category: 'vest', material: 'knit', color: 'red', image: null },
  { id: 'd3', brand: 'MANGO', name: 'Merino Wool Vest — Burgundy', price: 59.99, currency: '€', store: 'MANGO', storeUrl: 'https://mango.com', colors: ['#922b21','#c0392b','#2c3e50'], category: 'vest', material: 'wool', color: 'red', image: null },
  { id: 'd4', brand: 'UNIQLO', name: 'Premium Lambswool V-Neck Vest', price: 39.90, currency: '€', store: 'UNIQLO', storeUrl: 'https://uniqlo.com', colors: ['#c0392b','#1a5276','#566573'], category: 'vest', material: 'wool', color: 'red', image: null },
  { id: 'd5', brand: 'MASSIMO DUTTI', name: 'Wool Gilet with Leather Trim', price: 129, currency: '€', store: 'MASSIMO DUTTI', storeUrl: 'https://massimodutti.com', colors: ['#922b21','#4a3c2e'], category: 'vest', material: 'wool', color: 'red', image: null },
  { id: 'd6', brand: 'H&M', name: 'Rib-Knit Sweater Vest', price: 24.99, currency: '€', store: 'H&M', storeUrl: 'https://hm.com', colors: ['#c0392b','#f0e6d3','#2d2520'], category: 'vest', material: 'knit', color: 'red', image: null },
  { id: 'd7', brand: 'ARKET', name: 'Alpaca-Blend Vest', price: 89, currency: '€', store: 'ARKET', storeUrl: 'https://arket.com', colors: ['#c0392b','#d4c5b0'], category: 'vest', material: 'alpaca', color: 'red', image: null },
  { id: 'd8', brand: 'ASOS', name: 'Lambswool Fitted Vest — Red', price: 34.50, originalPrice: 52, currency: '€', store: 'ASOS', storeUrl: 'https://asos.com', colors: ['#c0392b','#1a1a2e'], category: 'vest', material: 'wool', color: 'red', image: null },
  { id: 'd9', brand: 'RALPH LAUREN', name: 'Cable-Knit Cotton Vest', price: 159, currency: '€', store: 'ZALANDO', storeUrl: 'https://zalando.com', colors: ['#c0392b','#1a5276'], category: 'vest', material: 'cotton', color: 'red', image: null },
  { id: 'd10', brand: 'TOMMY HILFIGER', name: 'Organic Cotton Vest', price: 89.90, currency: '€', store: 'ZALANDO', storeUrl: 'https://zalando.com', colors: ['#c0392b','#2c3e50','#ecf0f1'], category: 'vest', material: 'cotton', color: 'red', image: null },
  { id: 'd11', brand: 'LEVI\'S', name: 'Vintage Denim Jacket', price: 110, currency: '€', store: 'LEVI\'S', storeUrl: 'https://levi.com', colors: ['#2c3e50','#5d6d7e'], category: 'jacket', material: 'denim', color: 'blue', image: null },
  { id: 'd12', brand: 'NIKE', name: 'Air Max 90 — Neutral', price: 149.99, currency: '€', store: 'NIKE', storeUrl: 'https://nike.com', colors: ['#d4c5b0','#2d2520','#ecf0f1'], category: 'shoes', material: 'synthetic', color: 'neutral', image: null },
  { id: 'd13', brand: 'ADIDAS', name: 'Ultraboost Light', price: 189.99, currency: '€', store: 'ADIDAS', storeUrl: 'https://adidas.com', colors: ['#2d2520','#ecf0f1'], category: 'shoes', material: 'synthetic', color: 'black', image: null },
  { id: 'd14', brand: 'COS', name: 'Oversized Wool Coat — Camel', price: 250, currency: '€', store: 'COS', storeUrl: 'https://cos.com', colors: ['#d4c5b0','#4a3c2e'], category: 'coat', material: 'wool', color: 'camel', image: null },
  { id: 'd15', brand: 'ZARA', name: 'Linen Shirt — White', price: 35.95, currency: '€', store: 'ZARA', storeUrl: 'https://zara.com', colors: ['#ecf0f1','#aed6f1'], category: 'shirt', material: 'linen', color: 'white', image: null },
  { id: 'd16', brand: 'MANGO', name: 'Leather Biker Jacket', price: 199.99, originalPrice: 249.99, currency: '€', store: 'MANGO', storeUrl: 'https://mango.com', colors: ['#2d2520','#922b21'], category: 'jacket', material: 'leather', color: 'black', image: null },
];

// Simple keyword-based search for demo mode
function searchDemo(query, filters = {}) {
  const q = query.toLowerCase();
  const words = q.split(/[\s,]+/).filter(w => w.length > 1);

  let results = DEMO_PRODUCTS.filter(p => {
    const text = `${p.brand} ${p.name} ${p.category} ${p.material} ${p.color} ${p.store}`.toLowerCase();
    // At least one word must match
    return words.some(w => text.includes(w));
  });

  // Apply filters
  if (filters.maxPrice) results = results.filter(p => p.price <= filters.maxPrice);
  if (filters.category) results = results.filter(p => p.category === filters.category);
  if (filters.color) results = results.filter(p => p.color === filters.color);
  if (filters.material) results = results.filter(p => p.material === filters.material);

  // Sort
  if (filters.sort === 'price_asc') results.sort((a, b) => a.price - b.price);
  else if (filters.sort === 'price_desc') results.sort((a, b) => b.price - a.price);

  // If no results, return some anyway for demo
  if (results.length === 0) results = DEMO_PRODUCTS.slice(0, 8);

  const stores = [...new Set(results.map(p => p.store))];
  return { products: results, total: results.length, stores: stores.length, source: 'demo' };
}

// =====================================================
// Real API connectors (activated by environment variables)
// =====================================================

// Amazon Product Advertising API
async function searchAmazon(query, filters) {
  // Requires: AMAZON_ACCESS_KEY, AMAZON_SECRET_KEY, AMAZON_PARTNER_TAG
  // TODO: Implement when API keys are available
  return { products: [], total: 0, stores: 0, source: 'amazon' };
}

// Awin Affiliate Network API
async function searchAwin(query, filters) {
  // Requires: AWIN_API_TOKEN
  // Covers: Zalando, ASOS, Mango, El Corte Inglés, H&M, etc.
  // TODO: Implement when API key is available
  return { products: [], total: 0, stores: 0, source: 'awin' };
}

// Main search function — uses real APIs if available, falls back to demo
export async function searchProducts(query, filters = {}) {
  const hasAmazon = process.env.AMAZON_ACCESS_KEY;
  const hasAwin = process.env.AWIN_API_TOKEN;

  // If no real APIs configured, use demo
  if (!hasAmazon && !hasAwin) {
    // Simulate network delay for realism
    await new Promise(r => setTimeout(r, 800 + Math.random() * 700));
    return searchDemo(query, filters);
  }

  // Query real APIs in parallel
  const promises = [];
  if (hasAmazon) promises.push(searchAmazon(query, filters));
  if (hasAwin) promises.push(searchAwin(query, filters));

  const results = await Promise.allSettled(promises);
  const allProducts = [];
  let totalStores = 0;

  for (const r of results) {
    if (r.status === 'fulfilled' && r.value.products.length > 0) {
      allProducts.push(...r.value.products);
      totalStores += r.value.stores;
    }
  }

  // If real APIs returned nothing, fall back to demo
  if (allProducts.length === 0) return searchDemo(query, filters);

  return { products: allProducts, total: allProducts.length, stores: totalStores, source: 'live' };
}
