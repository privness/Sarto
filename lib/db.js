async function getDb() {
  const { default: pg } = await import('pg');
  const pool = new pg.Pool({
    connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  return pool;
}

async function query(text, params) {
  const pool = await getDb();
  try {
    const result = await pool.query(text, params);
    return result.rows;
  } finally {
    await pool.end();
  }
}

export async function initDb() {
  await query(`CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, email TEXT UNIQUE NOT NULL, name TEXT, image TEXT, is_premium BOOLEAN DEFAULT false, stripe_customer_id TEXT, created_at TIMESTAMP DEFAULT NOW())`);
  await query(`CREATE TABLE IF NOT EXISTS favorites (id SERIAL PRIMARY KEY, user_id INTEGER REFERENCES users(id) ON DELETE CASCADE, product_id TEXT NOT NULL, product_name TEXT, product_brand TEXT, product_price DECIMAL, product_image TEXT, product_url TEXT, store TEXT, created_at TIMESTAMP DEFAULT NOW(), UNIQUE(user_id, product_id))`);
  await query(`CREATE TABLE IF NOT EXISTS collections (id SERIAL PRIMARY KEY, user_id INTEGER REFERENCES users(id) ON DELETE CASCADE, name TEXT NOT NULL, description TEXT, created_at TIMESTAMP DEFAULT NOW())`);
  await query(`CREATE TABLE IF NOT EXISTS collection_items (id SERIAL PRIMARY KEY, collection_id INTEGER REFERENCES collections(id) ON DELETE CASCADE, product_id TEXT NOT NULL, product_name TEXT, product_brand TEXT, product_price DECIMAL, product_image TEXT, product_url TEXT, store TEXT, created_at TIMESTAMP DEFAULT NOW(), UNIQUE(collection_id, product_id))`);
}

export async function getOrCreateUser(email, name, image) {
  const existing = await query('SELECT * FROM users WHERE email = $1', [email]);
  if (existing.length > 0) return existing[0];
  const created = await query('INSERT INTO users (email, name, image) VALUES ($1, $2, $3) RETURNING *', [email, name, image]);
  return created[0];
}

export async function getUser(email) {
  const rows = await query('SELECT * FROM users WHERE email = $1', [email]);
  return rows[0] || null;
}

export async function getFavorites(userId) {
  return await query('SELECT * FROM favorites WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
}

export async function addFavorite(userId, product) {
  return await query('INSERT INTO favorites (user_id, product_id, product_name, product_brand, product_price, product_image, product_url, store) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (user_id, product_id) DO NOTHING RETURNING *', [userId, product.id, product.name, product.brand, product.price, product.image, product.url, product.store]);
}

export async function removeFavorite(userId, productId) {
  return await query('DELETE FROM favorites WHERE user_id = $1 AND product_id = $2', [userId, productId]);
}

export async function getCollections(userId) {
  const collections = await query('SELECT * FROM collections WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
  for (const col of collections) {
    col.items = await query('SELECT * FROM collection_items WHERE collection_id = $1 ORDER BY created_at DESC', [col.id]);
  }
  return collections;
}

export async function createCollection(userId, name, description) {
  const rows = await query('INSERT INTO collections (user_id, name, description) VALUES ($1, $2, $3) RETURNING *', [userId, name, description || '']);
  return rows[0];
}

export async function deleteCollection(collectionId, userId) {
  return await query('DELETE FROM collections WHERE id = $1 AND user_id = $2', [collectionId, userId]);
}

export async function addToCollection(collectionId, product) {
  return await query('INSERT INTO collection_items (collection_id, product_id, product_name, product_brand, product_price, product_image, product_url, store) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (collection_id, product_id) DO NOTHING RETURNING *', [collectionId, product.id, product.name, product.brand, product.price, product.image, product.url, product.store]);
}

export async function removeFromCollection(collectionId, productId) {
  return await query('DELETE FROM collection_items WHERE collection_id = $1 AND product_id = $2', [collectionId, productId]);
}
