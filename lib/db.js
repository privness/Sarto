async function getDb() {
  const { neon } = await import('@neondatabase/serverless');
  const connStr = (process.env.NILEDB_POSTGRES_URL || process.env.POSTGRES_URL || process.env.DATABASE_URL || '').replace('postgres://', 'postgresql://');
const sql = neon(connStr);
  return sql;
}

// ====== INIT TABLES ======
export async function initDb() {
  const sql = await getDb();
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT,
      image TEXT,
      is_premium BOOLEAN DEFAULT false,
      stripe_customer_id TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS favorites (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      product_id TEXT NOT NULL,
      product_name TEXT,
      product_brand TEXT,
      product_price DECIMAL,
      product_image TEXT,
      product_url TEXT,
      store TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(user_id, product_id)
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS collections (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      description TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS collection_items (
      id SERIAL PRIMARY KEY,
      collection_id INTEGER REFERENCES collections(id) ON DELETE CASCADE,
      product_id TEXT NOT NULL,
      product_name TEXT,
      product_brand TEXT,
      product_price DECIMAL,
      product_image TEXT,
      product_url TEXT,
      store TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(collection_id, product_id)
    )
  `;
}

// ====== USERS ======
export async function getOrCreateUser(email, name, image) {
  const sql = await getDb();
  const existing = await sql`SELECT * FROM users WHERE email = ${email}`;
  if (existing.length > 0) return existing[0];
  const created = await sql`
    INSERT INTO users (email, name, image) VALUES (${email}, ${name}, ${image})
    RETURNING *
  `;
  return created[0];
}

export async function getUser(email) {
  const sql = await getDb();
  const rows = await sql`SELECT * FROM users WHERE email = ${email}`;
  return rows[0] || null;
}

// ====== FAVORITES ======
export async function getFavorites(userId) {
  const sql = await getDb();
  return await sql`SELECT * FROM favorites WHERE user_id = ${userId} ORDER BY created_at DESC`;
}

export async function addFavorite(userId, product) {
  const sql = await getDb();
  return await sql`
    INSERT INTO favorites (user_id, product_id, product_name, product_brand, product_price, product_image, product_url, store)
    VALUES (${userId}, ${product.id}, ${product.name}, ${product.brand}, ${product.price}, ${product.image}, ${product.url}, ${product.store})
    ON CONFLICT (user_id, product_id) DO NOTHING
    RETURNING *
  `;
}

export async function removeFavorite(userId, productId) {
  const sql = await getDb();
  return await sql`DELETE FROM favorites WHERE user_id = ${userId} AND product_id = ${productId}`;
}

// ====== COLLECTIONS (Premium) ======
export async function getCollections(userId) {
  const sql = await getDb();
  const collections = await sql`SELECT * FROM collections WHERE user_id = ${userId} ORDER BY created_at DESC`;
  for (const col of collections) {
    col.items = await sql`SELECT * FROM collection_items WHERE collection_id = ${col.id} ORDER BY created_at DESC`;
  }
  return collections;
}

export async function createCollection(userId, name, description) {
  const sql = await getDb();
  const rows = await sql`
    INSERT INTO collections (user_id, name, description) VALUES (${userId}, ${name}, ${description || ''})
    RETURNING *
  `;
  return rows[0];
}

export async function deleteCollection(collectionId, userId) {
  const sql = await getDb();
  return await sql`DELETE FROM collections WHERE id = ${collectionId} AND user_id = ${userId}`;
}

export async function addToCollection(collectionId, product) {
  const sql = await getDb();
  return await sql`
    INSERT INTO collection_items (collection_id, product_id, product_name, product_brand, product_price, product_image, product_url, store)
    VALUES (${collectionId}, ${product.id}, ${product.name}, ${product.brand}, ${product.price}, ${product.image}, ${product.url}, ${product.store})
    ON CONFLICT (collection_id, product_id) DO NOTHING
    RETURNING *
  `;
}

export async function removeFromCollection(collectionId, productId) {
  const sql = await getDb();
  return await sql`DELETE FROM collection_items WHERE collection_id = ${collectionId} AND product_id = ${productId}`;
}
