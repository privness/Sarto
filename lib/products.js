// =====================================================
// Sarto Product Sources
// Awin feed + TradeDoubler feeds + Demo fallback
// =====================================================

// Separate caches (bug fix: antes compartían productCache)
let awinCache = null;
let awinTimestamp = 0;
let tdCache = null;
let tdTimestamp = 0;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

// TradeDoubler feed configs
const TD_TOKEN = '5E6B01865574402CAF08952F882C7FAD43584939';
const TD_FEEDS = [
  { fid: '39065', store: 'Hurley', pageSize: 200 },
  { fid: '119233', store: 'About You', pageSize: 300 },
  { fid: '112762', store: 'Caprice', pageSize: 200 },
  { fid: '116666', store: 'Krack', pageSize: 200 },
  { fid: '39842', store: 'Merkal', pageSize: 200 },
  { fid: '51403', store: 'Mustang', pageSize: 200 },
  { fid: '118025', store: 'Toni Pons', pageSize: 200 },
];

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
// CSV Parser
// =====================================================
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') { current += '"'; i++; }
      else if (ch === '"') { inQuotes = false; }
      else { current += ch; }
    } else {
      if (ch === '"') { inQuotes = true; }
      else if (ch === ',') { result.push(current); current = ''; }
      else { current += ch; }
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
    } catch (e) {}
  }
  return rows;
}

// =====================================================
// Awin Feed Loader
// =====================================================
async function loadAwinFeed() {
  const now = Date.now();
  if (awinCache && (now - awinTimestamp) < CACHE_DURATION) {
    return awinCache;
  }

  const feedUrl = process.env.AWIN_FEED_URL;
  if (!feedUrl) return null;

  try {
    console.log('Sarto: Loading Awin product feed...');
    const response = await fetch(feedUrl);
    if (!response.ok) {
      console.error('Sarto: Awin fetch failed:', response.status);
      return null;
    }

    let text;
    const buffer = Buffer.from(await response.arrayBuffer());
    try {
      const zlib = require('zlib');
      text = zlib.gunzipSync(buffer).toString('utf-8');
    } catch (e) {
      text = buffer.toString('utf-8');
    }

    const rows = parseCSV(text);
    console.log(`Sarto: Parsed ${rows.length} Awin rows`);

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

    const seen = new Map();
    const products = [];
    for (const p of rawProducts) {
      const key = `${p.name.toLowerCase().trim()}_${p.price}`;
      if (!seen.has(key)) { seen.set(key, true); products.push(p); }
    }

    awinCache = products;
    awinTimestamp = now;
    console.log(`Sarto: ${products.length} Awin products cache
