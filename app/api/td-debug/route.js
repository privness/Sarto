export const maxDuration = 60;

export async function GET() {
  const TD_TOKEN = '5E6B01865574402CAF08952F882C7FAD43584939';
  const FID = '39065'; // Hurley, tiene 930 productos totales
  const sizes = [10, 25, 50, 75, 100, 150, 200];
  const results = [];

  for (const size of sizes) {
    const url = `https://api.tradedoubler.com/1.0/products.json;page=1;pageSize=${size};fid=${FID}?token=${TD_TOKEN}`;
    const start = Date.now();
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(20000) });
      const text = await response.text();
      let productCount = null;
      try {
        const json = JSON.parse(text);
        productCount = json?.products?.length ?? null;
      } catch (e) {}
      results.push({
        pageSize: size,
        status: response.status,
        ok: response.ok,
        elapsed_ms: Date.now() - start,
        product_count: productCount,
        body_preview: response.ok ? null : text.slice(0, 300),
      });
    } catch (error) {
      results.push({ pageSize: size, error: error.message });
    }
  }

  return Response.json({ results });
}
