export const maxDuration = 60;

export async function GET() {
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

  const results = [];
  const globalStart = Date.now();

  for (const feed of TD_FEEDS) {
    const url = `https://api.tradedoubler.com/1.0/products.json;page=1;pageSize=${feed.pageSize};fid=${feed.fid}?token=${TD_TOKEN}`;
    const start = Date.now();

    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(20000) });
      const elapsed = Date.now() - start;
      const data = await response.json();
      const total = data?.products?.length || 0;

      const withOffers = (data?.products || []).filter(p => p.name && p.offers && p.offers.length > 0);
      const inStock = withOffers.filter(p => p.offers[0].inStock);

      // Muestra de un producto procesado
      const sample = inStock[0] ? {
        name: inStock[0].name?.slice(0, 80),
        hasImage: !!inStock[0].productImage?.url,
        offerCount: inStock[0].offers.length,
        fieldsCount: inStock[0].fields?.length || 0,
        sampleFinalPrice: (inStock[0].fields || []).find(f => f.name === 'finalPrice')?.value || 'NO_FINAL_PRICE',
        samplePrice: (inStock[0].fields || []).find(f => f.name === 'price')?.value || 'NO_PRICE',
      } : null;

      results.push({
        store: feed.store,
        status: response.status,
        elapsed_ms: elapsed,
        total_products: total,
        with_offers: withOffers.length,
        in_stock: inStock.length,
        sample,
      });
    } catch (error) {
      results.push({
        store: feed.store,
        error: error.message,
        error_name: error.name,
        elapsed_ms: Date.now() - start,
      });
    }
  }

  return Response.json({
    total_elapsed_ms: Date.now() - globalStart,
    vercel_region: process.env.VERCEL_REGION || 'unknown',
    results,
  });
}
