// =====================================================
// Sarto Product Sources — TradeDoubler + Demo fallback
// =====================================================

let productCache = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

const TD_TOKEN = '5E6B01865574402CAF08952F882C7FAD43584939';
const TD_FEEDS = [
  { fid: '39065', store: 'Hurley' },
  { fid: '119233', store: 'About You' },
  { fid: '112762', store: 'Caprice' },
  { fid: '116666', store: 'Krack' },
  { fid: '39842', store: 'Merkal' },
  { fid: '51403', store: 'Mustang' },
  { fid: '118025', store: 'Toni Pons' },
];

const DEMO_PRODUCTS = [
  { id: 'd1', brand: 'COS', name: 'Wool-Blend Quilted Vest', price: 79, currency: '€', store: 'COS', storeUrl: 'https://cos.com', category: 'vest', image: null },
  { id: 'd2', brand: 'ZARA', name: 'Red Knit Waistcoat', price: 45.95, originalPrice: 59.95, currency: '€', store: 'ZARA', storeUrl: 'https://zara.com', category: 'vest', image: null },
  { id: 'd3', brand: 'MANGO', name: 'Merino Wool Vest', price: 59.99, currency: '€', store: 'MANGO', storeUrl: 'https://mango.com', category: 'vest', image: null },
  { id: 'd4', brand: 'UNIQLO', name: 'Premium Lambswool V-Neck Vest', price: 39.90, currency: '€', store: 'UNIQLO', storeUrl: 'https://uniqlo.com', category: 'vest', image: null },
  { id: 'd5', brand: 'H&M', name: 'Rib-Knit Sweater Vest', price: 24.99, currency: '€', store: 'H&M', storeUrl: 'https://hm.com', category: 'vest', image: null },
  { id: 'd6', brand: 'NIKE', name: 'Air Max 90', price: 149.99, currency: '€', store: 'NIKE', storeUrl: 'https://nike.com', category: 'shoes', image: null },
  { id: 'd7', brand: 'ADIDAS', name: 'Ultraboost Light', price: 189.99, currency: '€', store: 'ADIDAS', storeUrl: 'https://adidas.com', category: 'shoes', image: null },
  { id: 'd8', brand: 'LEVI\'S', name: 'Vintage Denim Jacket', price: 110, currency: '€', store: 'LEVI\'S', storeUrl: 'https://levi.com', category: 'jacket', image: null },
];

// =====================================================
// TradeDoubler Feed Loader
// =====================================================
async function loadTDFeed(feedConfig) {
  try {
    const url = `https://api.tradedoubler.com/1.0/products.json;page=1;pageSize=100;fid=${feedConfig.fid}?token=${TD_TOKEN}`;
    const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!response.ok) return [];

    const data = await response.json();
    if (!data.products || !Array.isArray(data.products)) return [];

    return data.products
      .filter(p => p.name && p.offers && p.offers.length > 0)
      .map(p => {
        const fields = {};
        if (p.fields) p.fields.forEach(f => { fields[f.name] = f.value; });

        const finalPrice = parseFloat(fields.finalPrice) || 0;
        const originalPrice = parseFloat(fields.price) || 0;
        const offer = p.offers[0];

        return {
          id: `td_${feedConfig.fid}_${offer.sourceProductId || p.identifiers?.sku || Math.random()}`,
          brand: (offer.programName || feedConfig.store).replace(/ ES$/, '').toUpperCase(),
          name: p.name.split('|')[0].trim(),
          price: finalPrice,
          originalPrice: originalPrice > finalPrice ? originalPrice : null,
          currency: '€',
          store: feedConfig.store,
          storeUrl: offer.productUrl || '#',
          affiliateUrl: offer.productUrl || '',
          image: p.productImage?.url || null,
          description: (p.description || '').replace(/<[^>]*>/g, '').slice(0, 500),
          merchantCategory: p.categories?.[0]?.name || '',
        };
      })
      .filter(p => p.price > 0 && p.name.length > 0);
  } catch (error) {
    console.error(`Sarto: Error loading ${feedConfig.store}:`, error.message);
    return [];
  }
}

async function loadAllProducts() {
  const now = Date.now();

  if (productCache && (now - cacheTimestamp) < CACHE_DURATION) {
    return productCache;
  }

  console.log('Sarto: Loading TradeDoubler feeds...');

  const results = await Promise.allSettled(TD_FEEDS.map(f => loadTDFeed(f)));

  const allProducts = [];
  results.forEach((result, idx) => {
    if (result.status === 'fulfilled' && result.value.length > 0) {
      console.log(`Sarto: ${TD_FEEDS[idx].store}: ${result.value.length} products`);
      allProducts.push(...result.value);
    } else if (result.status === 'rejected') {
      console.error(`Sarto: ${TD_FEEDS[idx].store} failed: ${result.reason}`);
    }
  });

  const seen = new Map();
  const deduped = [];
  for (const p of allProducts) {
    const key = `${p.name.toLowerCase().trim()}_${p.price}`;
    if (!seen.has(key)) {
      seen.set(key, true);
      deduped.push(p);
    }
  }

  if (deduped.length > 0) {
    productCache = deduped;
    cacheTimestamp = now;
    console.log(`Sarto: ${deduped.length} total products cached`);
  }

  return deduped;
}

// =====================================================
// Search
// =====================================================
const translations = {
  'zapatillas': 'shoes', 'zapatos': 'shoes', 'camiseta': 'shirt', 'camisetas': 'shirts',
  'pantalon': 'pants', 'pantalones': 'pants', 'chaqueta': 'jacket', 'sudadera': 'hoodie',
  'chandal': 'tracksuit', 'deportivas': 'sneakers', 'running': 'running',
  'vestido': 'dress', 'falda': 'skirt', 'bolso': 'bag', 'gorra': 'cap',
  'sandalias': 'sandals', 'botas': 'boots', 'bermudas': 'shorts',
  'negro': 'black', 'blanco': 'white', 'rojo': 'red', 'azul': 'blue',
  'verde': 'green', 'rosa': 'pink', 'gris': 'grey', 'amarillo': 'yellow',
  'hombre': 'men', 'mujer': 'women', 'nino': 'kids', 'nina': 'kids',
  'chaussures': 'shoes', 'chemise': 'shirt', 'veste': 'jacket', 'robe': 'dress',
  'schuhe': 'shoes', 'hemd': 'shirt', 'jacke': 'jacket', 'kleid': 'dress',
  'scarpe': 'shoes', 'camicia': 'shirt', 'giacca': 'jacket', 'vestito': 'dress',
};

function searchProducts_internal(products, query, filters = {}) {
  const q = query.toLowerCase();
  const words = q.split(/[\s,]+/).filter(w => w.length > 1);

  const expandedWords = [...words];
  words.forEach(w => {
    if (translations[w]) expandedWords.push(translations[w]);
  });

  let results = products.filter(p => {
    const text = `${p.brand} ${p.name} ${p.description} ${p.merchantCategory} ${p.store}`.toLowerCase();
    const matchCount = expandedWords.filter(w => text.includes(w)).length;
    p._matchScore = matchCount;
    return matchCount > 0;
  });

  if (filters.maxPrice) results = results.filter(p => p.price <= parseFloat(filters.maxPrice));

  if (filters.gender) {
    const g = filters.gender.toLowerCase();
    results = results.filter(p => {
      const text = `${p.name} ${p.description} ${p.merchantCategory}`.toLowerCase();
      if (g === 'men' || g === 'hombre') return text.includes('hombre') || text.includes('men') || text.includes('man') || text.includes('masculin');
      if (g === 'women' || g === 'mujer') return text.includes('mujer') || text.includes('women') || text.includes('woman') || text.includes('feminin');
      return true;
    });
  }

  if (filters.color) {
    const col = filters.color.toLowerCase();
    results = results.filter(p => {
      const text = `${p.name} ${p.description}`.toLowerCase();
      return text.includes(col) || text.includes(translations[col] || col);
    });
  }

  if (filters.sort === 'price_asc') results.sort((a, b) => a.price - b.price);
  else if (filters.sort === 'price_desc') results.sort((a, b) => b.price - a.price);
  else results.sort((a, b) => b._matchScore - a._matchScore);

  const limited = results.slice(0, 60);
  const stores = [...new Set(limited.map(p => p.store))];

  return {
    products: limited.map(p => { const { _matchScore, ...rest } = p; return rest; }),
    total: results.length,
    stores: stores.length,
    source: 'tradedoubler'
  };
}

function searchDemo(query, filters = {}) {
  const q = query.toLowerCase();
  const words = q.split(/[\s,]+/).filter(w => w.length > 1);

  let results = DEMO_PRODUCTS.filter(p => {
    const text = `${p.brand} ${p.name} ${p.category} ${p.store}`.toLowerCase();
    return words.some(w => text.includes(w));
  });

  if (filters.maxPrice) results = results.filter(p => p.price <= filters.maxPrice);
  if (filters.sort === 'price_asc') results.sort((a, b) => a.price - b.price);
  else if (filters.sort === 'price_desc') results.sort((a, b) => b.price - a.price);
  if (results.length === 0) results = DEMO_PRODUCTS.slice(0, 8);

  const stores = [...new Set(results.map(p => p.store))];
  return { products: results, total: results.length, stores: stores.length, source: 'demo' };
}

// =====================================================
// Main Search (exported)
// =====================================================
export async function searchProducts(query, filters = {}) {
  const allProducts = await loadAllProducts();

  if (allProducts && allProducts.length > 0) {
    const results = searchProducts_internal(allProducts, query, filters);
    if (results.products.length > 0) return results;
  }

  await new Promise(r => setTimeout(r, 800 + Math.random() * 700));
  return searchDemo(query, filters);
}
