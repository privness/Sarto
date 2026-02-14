import { searchProducts } from '../../../lib/products';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(request) {
  try {
    const { query, filters = {}, lang = 'en' } = await request.json();

    if (!query || query.trim().length === 0) {
      return Response.json({ error: 'Query required' }, { status: 400 });
    }

    let parsedFilters = { ...filters };

    // Try AI parsing if API key is available
    if (process.env.ANTHROPIC_API_KEY && query.length > 5) {
      try {
        const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
        const msg = await client.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 300,
          messages: [{
            role: 'user',
            content: `Extract structured fashion search filters from this query. Respond ONLY with valid JSON, no markdown, no explanation.
Query: "${query}"
Language: ${lang}

Return this JSON structure:
{
  "searchTerms": "normalized english search keywords",
  "category": "shirt|vest|jacket|coat|pants|dress|skirt|shoes|sneakers|boots|accessories|bag|hat|scarf|null",
  "color": "red|blue|black|white|green|brown|camel|beige|grey|navy|burgundy|pink|null",
  "material": "wool|cotton|linen|silk|leather|denim|cashmere|polyester|synthetic|null",
  "cut": "slim|regular|oversized|relaxed|null",
  "maxPrice": number or null,
  "gender": "men|women|unisex|null"
}`
          }]
        });

        const text = msg.content[0].text.replace(/```json|```/g, '').trim();
        const aiFilters = JSON.parse(text);
        parsedFilters = { ...parsedFilters, ...aiFilters };
      } catch (aiError) {
        // AI failed — continue with basic search (fallback)
        console.log('AI parsing skipped:', aiError.message);
      }
    }

    // Search products
    const searchQuery = parsedFilters.searchTerms || query;
    const results = await searchProducts(searchQuery, parsedFilters);

    return Response.json({
      ...results,
      query: query,
      filters: parsedFilters,
      aiParsed: !!parsedFilters.searchTerms,
    });

  } catch (error) {
    console.error('Search error:', error);
    return Response.json({ error: 'Search failed' }, { status: 500 });
  }
}
