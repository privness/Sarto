export const maxDuration = 60;

export async function GET() {
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

  const results = [];

  for (const feed of TD_FEEDS) {
    const url = `https://api.tradedoubler.com/1.0/products.json;page=1;pageSize=10;fid=${feed.fid}?token=${TD_TOKEN}`;
    const start = Date.now();

    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
      const elapsed = Date.now() - start;
      const text = await response.text();

      let productCount = null;
      try {
        const json = JSON.parse(text);
        productCount = json?.products?.length ?? null;
      } catch (e) {}

      results.push({
        store: feed.store,
        fid: feed.fid,
        status: response.status,
        ok: response.ok,
        elapsed_ms: elapsed,
        content_type: response.headers.get('content-type'),
        body_length: text.length,
        product_count: productCount,
        body_preview: text.slice(0, 200),
      });
    } catch (error) {
      results.push({
        store: feed.store,
        fid: feed.fid,
        error_name: error.name,
        error_message: error.message,
        elapsed_ms: Date.now() - start,
      });
    }
  }

  return Response.json({
    timestamp: new Date().toISOString(),
    vercel_region: process.env.VERCEL_REGION || 'unknown',
    results,
  }, { status: 200 });
}
