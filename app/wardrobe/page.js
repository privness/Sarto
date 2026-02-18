'use client';
import { useState, useEffect } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';

export default function Wardrobe() {
  const { data: session, status } = useSession();
  const [tab, setTab] = useState('favorites');
  const [favorites, setFavorites] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newColName, setNewColName] = useState('');
  const [newColDesc, setNewColDesc] = useState('');
  const [showNewCol, setShowNewCol] = useState(false);

  useEffect(() => {
    if (session) loadData();
  }, [session, tab]);

  async function loadData() {
    setLoading(true);
    try {
      if (tab === 'favorites') {
        const res = await fetch('/api/favorites');
        const data = await res.json();
        setFavorites(data.favorites || []);
      } else {
        const res = await fetch('/api/collections');
        if (res.ok) {
          const data = await res.json();
          setCollections(data.collections || []);
        }
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  async function removeFav(productId) {
    await fetch('/api/favorites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'remove', productId }),
    });
    setFavorites(favorites.filter(f => f.product_id !== productId));
  }

  async function createCol() {
    if (!newColName.trim()) return;
    const res = await fetch('/api/collections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create', name: newColName, description: newColDesc }),
    });
    if (res.ok) {
      setNewColName('');
      setNewColDesc('');
      setShowNewCol(false);
      loadData();
    }
  }

  async function deleteCol(id) {
    await fetch('/api/collections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', collectionId: id }),
    });
    setCollections(collections.filter(c => c.id !== id));
  }

  async function removeColItem(colId, productId) {
    await fetch('/api/collections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'removeItem', collectionId: colId, productId }),
    });
    loadData();
  }

  const css = `
    *{margin:0;padding:0;box-sizing:border-box}
    :root{--sand-50:#faf8f5;--sand-100:#f5f0ea;--sand-200:#e8dfd4;--sand-300:#d4c5b0;--sand-400:#bfa88c;--sand-500:#a68b6b;--sand-600:#8a7054;--sand-700:#6b5640;--sand-800:#4a3c2e;--sand-900:#2d2520;--sand-950:#1a1613;--accent:#8b6914;--accent-light:#c4a24e;--accent-glow:rgba(196,162,78,0.15);--white:#fffdf9;--border:#e8dfd4;--serif:'Cormorant Garamond',Georgia,serif;--sans:'DM Sans',-apple-system,sans-serif;--r:8px;--rl:16px;--tr:0.3s}
    body{font-family:var(--sans);background:var(--sand-50);color:var(--sand-900)}
    .wr-page{min-height:100vh;padding:0 24px 80px}
    .wr-nav{max-width:1100px;margin:0 auto;padding:20px 0;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--border)}
    .wr-logo{font-family:var(--serif);font-size:1.6rem;font-weight:600;color:var(--sand-900);text-decoration:none;letter-spacing:0.02em}
    .wr-logo b{color:var(--accent)}
    .wr-user{display:flex;align-items:center;gap:12px}
    .wr-avatar{width:36px;height:36px;border-radius:50%;object-fit:cover;border:2px solid var(--border)}
    .wr-name{font-size:0.88rem;color:var(--sand-700)}
    .wr-out{font-size:0.78rem;color:var(--sand-500);cursor:pointer;text-decoration:underline}
    .wr-out:hover{color:var(--accent)}
    .wr-inner{max-width:1100px;margin:0 auto;padding-top:40px}
    .wr-title{font-family:var(--serif);font-size:2.2rem;font-weight:300;margin-bottom:8px}
    .wr-sub{color:var(--sand-500);font-size:0.95rem;margin-bottom:32px}
    .wr-tabs{display:flex;gap:8px;margin-bottom:32px}
    .wr-tab{padding:10px 24px;border-radius:100px;font-size:0.88rem;font-weight:500;cursor:pointer;border:1px solid var(--border);background:var(--white);color:var(--sand-700);transition:all var(--tr)}
    .wr-tab:hover{border-color:var(--accent-light)}
    .wr-tab.active{background:var(--sand-900);color:var(--white);border-color:var(--sand-900)}
    .wr-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:20px}
    .wr-card{background:var(--white);border:1px solid var(--border);border-radius:var(--rl);overflow:hidden;transition:all var(--tr)}
    .wr-card:hover{transform:translateY(-4px);box-shadow:0 12px 40px rgba(45,37,32,0.12)}
    .wr-card-img{width:100%;aspect-ratio:3/4;background:var(--sand-100);display:flex;align-items:center;justify-content:center;overflow:hidden}
    .wr-card-img img{width:100%;height:100%;object-fit:contain}
    .wr-card-info{padding:14px 16px}
    .wr-card-brand{font-size:0.68rem;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:var(--sand-400);margin-bottom:4px}
    .wr-card-name{font-family:var(--serif);font-size:0.95rem;font-weight:500;margin-bottom:6px;line-height:1.3;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
    .wr-card-bottom{display:flex;justify-content:space-between;align-items:center}
    .wr-card-price{font-weight:700;font-size:1rem}
    .wr-card-store{font-size:0.72rem;color:var(--sand-500)}
    .wr-card-actions{display:flex;gap:6px;margin-top:10px}
    .wr-btn{padding:8px 16px;border-radius:100px;font-size:0.78rem;font-weight:500;cursor:pointer;border:1px solid var(--border);background:var(--white);color:var(--sand-700);transition:all var(--tr);font-family:var(--sans)}
    .wr-btn:hover{border-color:var(--accent);color:var(--accent)}
    .wr-btn-del{border-color:transparent;color:var(--sand-400)}
    .wr-btn-del:hover{color:#c44;border-color:#c44}
    .wr-btn-accent{background:var(--accent);color:var(--white);border-color:var(--accent)}
    .wr-btn-accent:hover{background:var(--accent-light)}
    .wr-empty{text-align:center;padding:80px 24px;color:var(--sand-500)}
    .wr-empty h3{font-family:var(--serif);font-size:1.6rem;font-weight:300;color:var(--sand-700);margin-bottom:12px}
    .wr-col{background:var(--white);border:1px solid var(--border);border-radius:var(--rl);padding:24px;margin-bottom:20px}
    .wr-col-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}
    .wr-col-name{font-family:var(--serif);font-size:1.3rem;font-weight:500}
    .wr-col-desc{font-size:0.85rem;color:var(--sand-500);margin-bottom:16px}
    .wr-col-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
    .wr-col-empty{color:var(--sand-400);font-size:0.88rem;font-style:italic}
    .wr-new-col{background:var(--white);border:1px solid var(--border);border-radius:var(--rl);padding:24px;margin-bottom:24px}
    .wr-input{width:100%;padding:12px 16px;border:1px solid var(--border);border-radius:var(--r);font-family:var(--sans);font-size:0.9rem;margin-bottom:10px;background:var(--sand-50)}
    .wr-input:focus{outline:none;border-color:var(--accent)}
    .wr-premium-lock{background:linear-gradient(135deg,rgba(139,105,20,0.08),rgba(196,162,78,0.08));border:1px solid rgba(196,162,78,0.2);border-radius:var(--rl);padding:40px;text-align:center;margin-top:20px}
    .wr-premium-lock h3{font-family:var(--serif);font-size:1.4rem;font-weight:400;margin-bottom:8px}
    .wr-premium-lock p{color:var(--sand-500);font-size:0.9rem;margin-bottom:20px}
    .wr-login{min-height:100vh;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:24px;text-align:center;padding:24px}
    .wr-login h1{font-family:var(--serif);font-size:2.5rem;font-weight:300;color:var(--sand-900)}
    .wr-login p{color:var(--sand-500);font-size:1rem;max-width:400px}
    .wr-google{display:flex;align-items:center;gap:10px;padding:14px 32px;background:var(--white);border:1px solid var(--border);border-radius:100px;font-family:var(--sans);font-size:0.95rem;font-weight:500;cursor:pointer;transition:all var(--tr);color:var(--sand-900)}
    .wr-google:hover{border-color:var(--accent);box-shadow:0 4px 20px rgba(0,0,0,0.08)}
    .wr-back{position:absolute;top:24px;left:24px;font-size:0.88rem;color:var(--sand-500);text-decoration:none}
    .wr-back:hover{color:var(--accent)}
    @media(max-width:900px){.wr-grid,.wr-col-grid{grid-template-columns:repeat(2,1fr)}}
    @media(max-width:600px){.wr-grid,.wr-col-grid{grid-template-columns:repeat(2,1fr);gap:12px}}
  `;

  // Not logged in
  if (status === 'unauthenticated') {
    return (
      <>
        <style dangerouslySetInnerHTML={{__html: css}} />
        <div className="wr-login">
          <a href="/" className="wr-back">← Back to Sarto</a>
          <div className="wr-logo">SART<b>O</b></div>
          <h1>Your Wardrobe</h1>
          <p>Sign in to save favorites, create collections, and access El Sastre — your personal AI stylist.</p>
          <button className="wr-google" onClick={() => signIn('google')}>
            <svg width="20" height="20" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Sign in with Google
          </button>
        </div>
      </>
    );
  }

  // Loading
  if (status === 'loading') {
    return (
      <>
        <style dangerouslySetInnerHTML={{__html: css}} />
        <div className="wr-login"><div className="wr-logo">SART<b>O</b></div><p>Loading...</p></div>
      </>
    );
  }

  const isPremium = session?.user?.isPremium;

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: css}} />
      <div className="wr-page">
        <nav className="wr-nav">
          <a href="/" className="wr-logo">SART<b>O</b></a>
          <div className="wr-user">
            {session.user.image && <img src={session.user.image} className="wr-avatar" alt="" />}
            <div>
              <div className="wr-name">{session.user.name}</div>
              <span className="wr-out" onClick={() => signOut()}>Sign out</span>
            </div>
          </div>
        </nav>

        <div className="wr-inner">
          <h1 className="wr-title">Your Wardrobe</h1>
          <p className="wr-sub">{isPremium ? '✦ Premium' : 'Free account'} · {favorites.length} favorites</p>

          <div className="wr-tabs">
            <button className={`wr-tab${tab === 'favorites' ? ' active' : ''}`} onClick={() => setTab('favorites')}>
              ♡ Favorites
            </button>
            <button className={`wr-tab${tab === 'collections' ? ' active' : ''}`} onClick={() => setTab('collections')}>
              ◆ Collections {!isPremium && '🔒'}
            </button>
          </div>

          {tab === 'favorites' && (
            <>
              {loading ? (
                <div className="wr-empty"><p>Loading...</p></div>
              ) : favorites.length === 0 ? (
                <div className="wr-empty">
                  <h3>No favorites yet</h3>
                  <p>Search for products and click the heart to save them here.</p>
                  <a href="/" className="wr-btn wr-btn-accent" style={{display:'inline-block',marginTop:16}}>Start searching</a>
                </div>
              ) : (
                <div className="wr-grid">
                  {favorites.map(f => (
                    <div key={f.id} className="wr-card">
                      <a href={f.product_url} target="_blank" rel="noopener noreferrer" className="wr-card-img">
                        {f.product_image ? <img src={f.product_image} alt={f.product_name} /> : <span style={{color:'var(--sand-300)',fontSize:'2rem'}}>♡</span>}
                      </a>
                      <div className="wr-card-info">
                        <div className="wr-card-brand">{f.product_brand}</div>
                        <div className="wr-card-name">{f.product_name}</div>
                        <div className="wr-card-bottom">
                          <span className="wr-card-price">€{Number(f.product_price).toFixed(2)}</span>
                          <span className="wr-card-store">{f.store}</span>
                        </div>
                        <div className="wr-card-actions">
                          <a href={f.product_url} target="_blank" rel="noopener noreferrer" className="wr-btn">Visit store</a>
                          <button className="wr-btn wr-btn-del" onClick={() => removeFav(f.product_id)}>Remove</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {tab === 'collections' && (
            <>
              {!isPremium ? (
                <div className="wr-premium-lock">
                  <h3>Collections are a Premium feature</h3>
                  <p>Create themed collections, organize outfits, and let El Sastre help you build the perfect wardrobe.</p>
                  <a href="/" className="wr-btn wr-btn-accent" style={{display:'inline-block'}}>Upgrade to Premium</a>
                </div>
              ) : (
                <>
                  <button className="wr-btn wr-btn-accent" onClick={() => setShowNewCol(!showNewCol)} style={{marginBottom:20}}>
                    + New collection
                  </button>

                  {showNewCol && (
                    <div className="wr-new-col">
                      <input className="wr-input" placeholder="Collection name (e.g. Summer 2026)" value={newColName} onChange={e => setNewColName(e.target.value)} />
                      <input className="wr-input" placeholder="Description (optional)" value={newColDesc} onChange={e => setNewColDesc(e.target.value)} />
                      <div style={{display:'flex',gap:8}}>
                        <button className="wr-btn wr-btn-accent" onClick={createCol}>Create</button>
                        <button className="wr-btn" onClick={() => setShowNewCol(false)}>Cancel</button>
                      </div>
                    </div>
                  )}

                  {loading ? (
                    <div className="wr-empty"><p>Loading...</p></div>
                  ) : collections.length === 0 ? (
                    <div className="wr-empty">
                      <h3>No collections yet</h3>
                      <p>Create your first collection to organize your finds.</p>
                    </div>
                  ) : (
                    collections.map(col => (
                      <div key={col.id} className="wr-col">
                        <div className="wr-col-header">
                          <div className="wr-col-name">{col.name}</div>
                          <button className="wr-btn wr-btn-del" onClick={() => deleteCol(col.id)}>Delete</button>
                        </div>
                        {col.description && <div className="wr-col-desc">{col.description}</div>}
                        {col.items && col.items.length > 0 ? (
                          <div className="wr-col-grid">
                            {col.items.map(item => (
                              <div key={item.id} className="wr-card">
                                <a href={item.product_url} target="_blank" rel="noopener noreferrer" className="wr-card-img">
                                  {item.product_image ? <img src={item.product_image} alt={item.product_name} /> : <span>◆</span>}
                                </a>
                                <div className="wr-card-info">
                                  <div className="wr-card-brand">{item.product_brand}</div>
                                  <div className="wr-card-name">{item.product_name}</div>
                                  <div className="wr-card-bottom">
                                    <span className="wr-card-price">€{Number(item.product_price).toFixed(2)}</span>
                                  </div>
                                  <div className="wr-card-actions">
                                    <button className="wr-btn wr-btn-del" onClick={() => removeColItem(col.id, item.product_id)}>Remove</button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="wr-col-empty">No items in this collection. Search for products and add them here.</p>
                        )}
                      </div>
                    ))
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
