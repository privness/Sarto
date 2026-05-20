export async function GET() {
  const token = '5E6B01865574402CAF08952F882C7FAD43584939';
  const feeds = [
    { fid: '39065', store: 'Hurley' },
    { fid: '119233', store: 'About You' },
    { fid: '112762', store: 'Caprice' },
    { fid: '116666', store: 'Krack' },
    { fid: '39842', store: 'Merkal' },
    { fid: '51403', store: 'Mustang' },
    { fid: '118025', store: 'Toni Pons' },
  ];

  const results = [];

  for (const feed of feeds) {
    try {
      const url = `https://api.tradedoubler.com/1.0/products.json;page=1;pageSize=3;fid=${feed.fid}?token=${token}`;
      const start = Date.now();
      const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
      const elapsed = Date.now() - start;

      if (!response.ok) {
        results.push({ store: feed.store, error: 'HTTP ' + response.status, elapsed });
        continue;
      }

      const data = await response.json();
      const count = data.totalHits || 0;
      const first = data.products?.[0]?.name || null;

      results.push({ store: feed.store, totalHits: count, firstName: first, elapsed: elapsed + 'ms' });
    } catch (error) {
      results.push({ store: feed.store, error: error.message });
    }
  }

  return Response.json(results);
}
