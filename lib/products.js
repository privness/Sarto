// =====================================================
// Sarto Product Sources
// Real Awin feed + Demo fallback
// =====================================================

// In-memory product cache
let productCache = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

// Demo products fallback
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

// =====================================================
// CSV Parser (handles quoted fields)
// =====================================================
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        result.push(current);
        current = '';
      } else {
        current += ch;
      }
    }
  }
  result.push(current);
  return result;
}

function parseCSV(text) {
  const lines = text.split('\n');
  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]);
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    try {
      const values = parseCSVLine(lines[i]);
      if (values.length >= headers.length - 1) {
        const row = {};
        headers.forEach((h, idx) => { row[h.trim()] = (values[idx] || '').trim(); });
        rows.push(row);
      }
    } catch (e) {
      // Skip malformed rows
    }
  }
  return rows;
}

// =====================================================
// Awin Feed Loader
// =====================================================
async function loadAwinFeed() {
  const now = Date.now();

  // Return cache if fresh
  if (productCache && (now - cacheTimestamp) < CACHE_DURATION) {
    return productCache;
  }

  const feedUrl = process.env.AWIN_FEED_URL;
  if (!feedUrl) return null;

  try {
    console.log('Sarto: Loading Awin product feed...');

    // Fetch the CSV feed (no compression)
    const response = await fetch(feedUrl);

    if (!response.ok) {
      console.error('Sarto: Feed fetch failed:', response.status);
      return null;
    }

    let text;
    const buffer = Buffer.from(await response.arrayBuffer());

    // Try gzip first, fallback to plain text
    try {
      const zlib = require('zlib');
      text = zlib.gunzipSync(buffer).toString('utf-8');
      console.log('Sarto: Decompressed gzip feed');
    } catch (e) {
      text = buffer.toString('utf-8');
      console.log('Sarto: Loaded plain CSV feed');
    }

    // Parse CSV
    const rows = parseCSV(text);
    console.log(`Sarto: Parsed ${rows.length} rows from Awin feed`);

    // Transform to Sarto product format
    const rawProducts = rows
      .filter(row => row.product_name && row.search_price)
      .map((row, idx) => {
        const searchPrice = parseFloat(row.search_price) || 0;
        const storePrice = parseFloat(row.store_price) || 0;

        return {
          id: `aw_${row.aw_product_id || idx}`,
          brand: (row.merchant_name || 'Unknown').toUpperCase(),
          name: row.product_name || '',
          price: searchPrice,
          originalPrice: storePrice > searchPrice ? storePrice : null,
          currency: row.currency === 'EUR' ? '€' : (row.currency === 'GBP' ? '£' : (row.currency === 'USD' ? '$' : '€')),
          store: row.merchant_name || 'Unknown',
          storeUrl: row.aw_deep_link || '#',
          affiliateUrl: row.aw_deep_link || '',
          image: row.aw_image_url || row.merchant_image_url || null,
          description: (row.description || '').slice(0, 500),
          merchantCategory: row.merchant_category || '',
          displayPrice: row.display_price || null,
        };
      })
      .filter(p => p.price > 0 && p.name.length > 0);

    // Deduplicate: keep only one entry per product name + price
    // This removes duplicate images (soles, angles, etc.)
    const seen = new Map();
    const products = [];
    for (const p of rawProducts) {
      const key = `${p.name.toLowerCase().trim()}_${p.price}`;
      if (!seen.has(key)) {
        seen.set(key, true);
        products.push(p);
      }
    }

    // Cache the products
    productCache = products;
    cacheTimestamp = now;

    console.log(`Sarto: ${products.length} valid products cached`);
    return products;

  } catch (error) {
    console.error('Sarto: Error loading Awin feed:', error.message);
    if (productCache) return productCache;
    return null;
  }
}

// =====================================================
// Search Functions
// =====================================================

// Search through real Awin products
function searchAwinProducts(products, query, filters = {}) {
  const q = query.toLowerCase();
  const words = q.split(/[\s,]+/).filter(w => w.length > 1);

  // Also handle Spanish search terms
  const translations = {
    'zapatillas': 'shoes', 'zapatos': 'shoes', 'camiseta': 'shirt', 'camisetas': 'shirts',
    'pantalon': 'pants', 'pantalones': 'pants', 'chaqueta': 'jacket', 'sudadera': 'hoodie',
    'chandal': 'tracksuit', 'deportivas': 'sneakers', 'running': 'running',
    'negro': 'black', 'blanco': 'white', 'rojo': 'red', 'azul': 'blue',
    'verde': 'green', 'rosa': 'pink', 'gris': 'grey',
    'hombre': 'men', 'mujer': 'women', 'nino': 'kids', 'nina': 'kids',
  };

  // Expand search words with translations
  const expandedWords = [...words];
  words.forEach(w => {
    if (translations[w]) expandedWords.push(translations[w]);
  });

  let results = products.filter(p => {
    const text = `${p.brand} ${p.name} ${p.description} ${p.merchantCategory}`.toLowerCase();
    const matchCount = expandedWords.filter(w => text.includes(w)).length;
    p._matchScore = matchCount;
    return matchCount > 0;
  });

  // Apply filters
  if (filters.maxPrice) {
    results = results.filter(p => p.price <= parseFloat(filters.maxPrice));
  }
  if (filters.gender) {
    const g = filters.gender.toLowerCase();
    results = results.filter(p => {
      const text = `${p.name} ${p.description} ${p.merchantCategory}`.toLowerCase();
      if (g === 'men' || g === 'hombre') return text.includes('hombre') || text.includes('men') || text.includes('man') || text.includes('masculin') || text.includes('male');
      if (g === 'women' || g === 'mujer') return text.includes('mujer') || text.includes('women') || text.includes('woman') || text.includes('feminin') || text.includes('female');
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
  if (filters.material) {
    const mat = filters.material.toLowerCase();
    results = results.filter(p => {
      const text = `${p.name} ${p.description}`.toLowerCase();
      return text.includes(mat);
    });
  }

  // Sort
  if (filters.sort === 'price_asc') {
    results.sort((a, b) => a.price - b.price);
  } else if (filters.sort === 'price_desc') {
    results.sort((a, b) => b.price - a.price);
  } else {
    // Default: relevance
    results.sort((a, b) => b._matchScore - a._matchScore);
  }

  // Limit to 60 results
  const limited = results.slice(0, 60);
  const stores = [...new Set(limited.map(p => p.store))];

  return {
    products: limited.map(p => { const { _matchScore, ...rest } = p; return rest; }),
    total: results.length,
    stores: stores.length,
    source: 'awin'
  };
}

// Demo search fallback
function searchDemo(query, filters = {}) {
  const q = query.toLowerCase();
  const words = q.split(/[\s,]+/).filter(w => w.length > 1);

  let results = DEMO_PRODUCTS.filter(p => {
    const text = `${p.brand} ${p.name} ${p.category} ${p.material} ${p.color} ${p.store}`.toLowerCase();
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
  // Try real Awin feed first
  const awinProducts = await loadAwinFeed();

  if (awinProducts && awinProducts.length > 0) {
    const awinResults = searchAwinProducts(awinProducts, query, filters);

    if (awinResults.products.length > 0) {
      return awinResults;
    }
  }

  // Fallback to demo
  await new Promise(r => setTimeout(r, 800 + Math.random() * 700));
  return searchDemo(query, filters);
}
