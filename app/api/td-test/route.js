export async function GET() {
  try {
    const start = Date.now();
    const url = 'https://api.tradedoubler.com/1.0/products.json;page=1;pageSize=5;fid=39065?token=5E6B01865574402CAF08952F882C7FAD43584939';
    const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
    const elapsed = Date.now() - start;
    
    if (!response.ok) {
      return Response.json({ error: 'TD responded ' + response.status, elapsed });
    }
    
    const data = await response.json();
    const count = data.products ? data.products.length : 0;
    
    return Response.json({ 
      success: true, 
      elapsed: elapsed + 'ms',
      totalHits: data.totalHits,
      productsReturned: count,
      firstName: count > 0 ? data.products[0].name : null
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
