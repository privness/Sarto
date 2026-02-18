'use client';
import { useState, useEffect, useRef } from 'react';
import { LANGUAGES, T, detectLanguage, t, saveLanguage } from '../lib/i18n';

export default function Home() {
  const [lang, setLang] = useState('en');
  const [langOpen, setLangOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [premiumOpen, setPremiumOpen] = useState(false);
  const searchRef = useRef(null);
  const resultsRef = useRef(null);
  const langRef = useRef(null);

  useEffect(() => { setLang(detectLanguage()); }, []);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => {
    function handleClickOutside(e) {
      if (langRef.current && !langRef.current.contains(e.target)) {
        setLangOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const i = (key) => t(lang, key);
  const langObj = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];

  // Rate limiting helpers
  function getRateLimit(key, maxPerDay) {
    try {
      const data = JSON.parse(localStorage.getItem(`sarto-rl-${key}`) || '{}');
      const today = new Date().toDateString();
      if (data.date !== today) return { count: 0, date: today };
      return data;
    } catch { return { count: 0, date: new Date().toDateString() }; }
  }
  function incrementRate(key) {
    const today = new Date().toDateString();
    const data = getRateLimit(key);
    const updated = { count: (data.date === today ? data.count : 0) + 1, date: today };
    localStorage.setItem(`sarto-rl-${key}`, JSON.stringify(updated));
    return updated.count;
  }
  function isRateLimited(key, max) {
    const data = getRateLimit(key);
    return data.count >= max;
  }

  const SEARCH_LIMIT = 20;

  async function doSearch(q) {
    if (!q.trim()) return;
    if (isRateLimited('search', SEARCH_LIMIT)) {
      setPremiumOpen(true);
      return;
    }
    setLoading(true);
    incrementRate('search');
    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q, lang }),
      });
      const data = await res.json();
      setResults(data);
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (e) {
      console.error('Search error', e);
    }
    setLoading(false);
  }

  async function handleFav(product) {
    try {
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add',
          product: {
            id: product.id,
            name: product.name,
            brand: product.brand || product.store,
            price: product.price,
            image: product.image,
            url: product.affiliateUrl || product.storeUrl,
            store: product.store,
          }
        }),
      });
      if (res.status === 401) {
        window.location.href = '/wardrobe';
        return;
      }
      if (res.ok) {
        const btn = event?.target?.closest('.pfav');
        if (btn) btn.classList.add('faved');
      }
    } catch (e) {
      window.location.href = '/wardrobe';
    }
  }

  async function handlePremium() {
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lang }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else if (data.demo) { setPremiumOpen(false); }
      else { console.error('Checkout error:', data.error); }
    } catch (e) { console.error(e); }
  }

  const css = `
    * { margin:0;padding:0;box-sizing:border-box }
    :root{--sand-50:#faf8f5;--sand-100:#f5f0ea;--sand-200:#e8dfd4;--sand-300:#d4c5b0;--sand-400:#bfa88c;--sand-500:#a68b6b;--sand-600:#8a7054;--sand-700:#6b5640;--sand-800:#4a3c2e;--sand-900:#2d2520;--sand-950:#1a1613;--accent:#8b6914;--accent-light:#c4a24e;--accent-glow:rgba(196,162,78,0.15);--white:#fffdf9;--border:#e8dfd4;--serif:'Cormorant Garamond',Georgia,serif;--sans:'DM Sans',-apple-system,sans-serif;--r:8px;--rl:16px;--tr:0.3s cubic-bezier(0.4,0,0.2,1)}
    html{scroll-behavior:smooth}body{font-family:var(--sans);background:var(--sand-50);color:var(--sand-900);line-height:1.6;-webkit-font-smoothing:antialiased;overflow-x:hidden}
    .nav{position:fixed;top:0;left:0;right:0;z-index:100;padding:20px 40px;display:flex;align-items:center;justify-content:space-between;transition:var(--tr);background:transparent}
    .nav.s{background:rgba(250,248,245,0.92);backdrop-filter:blur(20px);border-bottom:1px solid var(--border);padding:14px 40px}
    .logo{font-family:var(--serif);font-size:1.8rem;font-weight:500;letter-spacing:0.08em;color:var(--sand-900);text-decoration:none}.logo b{color:var(--accent)}
    .nr{display:flex;gap:24px;align-items:center}.nl{display:flex;gap:28px;align-items:center}
    .nl a{font-size:0.88rem;font-weight:500;color:var(--sand-700);text-decoration:none;letter-spacing:0.04em;transition:color var(--tr)}.nl a:hover{color:var(--accent)}
    .ncta{background:var(--sand-900)!important;color:var(--white)!important;padding:10px 24px!important;border-radius:100px!important;font-size:0.85rem!important}
    .ncta:hover{background:var(--accent)!important}
    .ls{position:relative}.lb{display:flex;align-items:center;gap:8px;padding:7px 14px;background:var(--sand-100);border:1px solid var(--border);border-radius:100px;cursor:pointer;font-family:var(--sans);font-size:0.82rem;font-weight:500;color:var(--sand-700);transition:all var(--tr);white-space:nowrap;outline:none}
    .lb:hover{border-color:var(--accent-light);color:var(--accent)}.lb .f{font-size:1.1rem;line-height:1}.lb .ch{width:12px;height:12px;transition:transform var(--tr)}
    .ld{display:none;position:absolute;top:calc(100% + 8px);right:0;background:var(--white);border:1px solid var(--border);border-radius:var(--rl);box-shadow:0 12px 40px rgba(45,37,32,0.12);padding:8px;min-width:200px;z-index:200;max-height:360px;overflow-y:auto}
    .ls.o .ld{display:block}.ls.o .ch{transform:rotate(180deg)}
    .lo{display:flex;align-items:center;gap:10px;width:100%;padding:10px 14px;font-family:var(--sans);font-size:0.88rem;color:var(--sand-700);background:none;border:none;border-radius:var(--r);cursor:pointer;transition:all var(--tr);text-align:left}
    .lo:hover{background:var(--sand-100);color:var(--accent)}.lo.ac{background:var(--accent-glow);color:var(--accent);font-weight:600}.lo .nt{font-size:0.78rem;color:var(--sand-500);margin-left:auto}
    .hero{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:120px 24px 80px;position:relative;overflow:hidden}
    .hero::before{content:'';position:absolute;top:-30%;right:-20%;width:800px;height:800px;background:radial-gradient(circle,var(--accent-glow) 0%,transparent 70%);pointer-events:none;animation:glow 8s ease-in-out infinite alternate}
    @keyframes glow{0%{transform:translate(0,0) scale(1);opacity:0.6}100%{transform:translate(-60px,40px) scale(1.15);opacity:1}}
    @keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
    .badge{display:inline-flex;align-items:center;gap:8px;padding:8px 20px;background:var(--accent-glow);border:1px solid rgba(196,162,78,0.25);border-radius:100px;font-size:0.82rem;font-weight:500;color:var(--accent);letter-spacing:0.06em;margin-bottom:36px;animation:fadeUp 0.8s ease-out both}
    h1{font-family:var(--serif);font-size:clamp(3rem,7vw,5.5rem);font-weight:300;line-height:1.08;letter-spacing:-0.02em;max-width:800px;margin-bottom:24px;animation:fadeUp 0.8s ease-out 0.1s both}
    h1 em{font-style:italic;color:var(--accent);font-weight:400}
    .sub{font-size:1.15rem;color:var(--sand-700);max-width:520px;line-height:1.7;margin-bottom:48px;font-weight:300;animation:fadeUp 0.8s ease-out 0.2s both}
    .sc{width:100%;max-width:700px;animation:fadeUp 0.8s ease-out 0.3s both;position:relative;z-index:10}
    .sb{display:flex;align-items:center;gap:12px;background:var(--white);border:1.5px solid var(--border);border-radius:100px;padding:8px 8px 8px 28px;box-shadow:0 4px 20px rgba(45,37,32,0.08);transition:all var(--tr)}
    .sb:focus-within{border-color:var(--accent-light);box-shadow:0 12px 40px rgba(45,37,32,0.12),0 0 0 4px var(--accent-glow)}
    .sb input{flex:1;border:none;outline:none;font-family:var(--sans);font-size:1rem;color:var(--sand-900);background:transparent}.sb input::placeholder{color:var(--sand-400);font-weight:300}
    .sbtn{flex-shrink:0;display:flex;align-items:center;gap:8px;background:var(--sand-900);color:var(--white);border:none;padding:14px 28px;border-radius:100px;font-family:var(--sans);font-size:0.9rem;font-weight:500;cursor:pointer;transition:all var(--tr)}
    .sbtn:hover{background:var(--accent);transform:scale(1.02)}.sbtn:disabled{opacity:0.6;cursor:not-allowed;transform:none}
    .sh{margin-top:16px;font-size:0.82rem;color:var(--sand-500);display:flex;align-items:center;justify-content:center;gap:6px}
    .se{margin-top:20px;display:flex;flex-wrap:wrap;gap:8px;justify-content:center}
    .sex{padding:7px 16px;background:var(--sand-100);border:1px solid var(--border);border-radius:100px;font-size:0.82rem;color:var(--sand-700);cursor:pointer;transition:all var(--tr);font-family:var(--sans)}
    .sex:hover{background:var(--accent-glow);border-color:var(--accent-light);color:var(--accent)}
    .trust{padding:60px 24px;text-align:center;border-top:1px solid var(--border);border-bottom:1px solid var(--border);background:var(--sand-100)}
    .tl{font-size:0.75rem;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:var(--sand-500);margin-bottom:28px}
    .tlogos{display:flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:40px;opacity:0.45}
    .tlogos span{font-family:var(--serif);font-size:1.4rem;font-weight:600;color:var(--sand-700);letter-spacing:0.05em}
    .sect{padding:120px 24px;max-width:1100px;margin:0 auto}
    .slbl{font-size:0.75rem;font-weight:600;letter-spacing:0.16em;text-transform:uppercase;color:var(--accent);margin-bottom:16px}
    .stitle{font-family:var(--serif);font-size:clamp(2rem,4vw,3.2rem);font-weight:300;line-height:1.15;margin-bottom:60px;max-width:600px}.stitle em{font-style:italic;color:var(--accent);font-weight:400}
    .steps{display:grid;grid-template-columns:repeat(3,1fr);gap:40px}
    .step{padding:40px 32px;background:var(--white);border:1px solid var(--border);border-radius:var(--rl);transition:all var(--tr)}.step:hover{transform:translateY(-4px);box-shadow:0 12px 40px rgba(45,37,32,0.12);border-color:var(--accent-light)}
    .sn{font-family:var(--serif);font-size:3.5rem;font-weight:300;color:var(--sand-200);line-height:1;margin-bottom:20px}
    .step h3{font-family:var(--serif);font-size:1.4rem;font-weight:500;margin-bottom:12px}.step p{font-size:0.92rem;color:var(--sand-700);line-height:1.7;font-weight:300}
    .results-section{padding:80px 24px 120px;background:var(--sand-100);border-top:1px solid var(--border)}
    .ri{max-width:1200px;margin:0 auto}
    .rh{display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;flex-wrap:wrap;gap:12px}
    .rc{font-size:0.88rem;color:var(--sand-500)}.rsort{font-family:var(--sans);font-size:0.85rem;color:var(--sand-700);background:var(--white);border:1px solid var(--border);padding:8px 16px;border-radius:100px;cursor:pointer}
    .pg{display:grid;grid-template-columns:repeat(4,1fr);gap:20px}
    .pc{background:var(--white);border:1px solid var(--border);border-radius:var(--rl);overflow:hidden;transition:all 0.4s cubic-bezier(0.4,0,0.2,1);cursor:pointer;text-decoration:none;color:inherit;position:relative}
    .pc:hover{transform:translateY(-8px);box-shadow:0 24px 64px rgba(45,37,32,0.18);border-color:var(--accent-light)}
    .pc:hover .pvisit{opacity:1;transform:translateY(0)}
    .pc:hover .pi img{transform:scale(1.05)}
    .pi{width:100%;aspect-ratio:3/4;background:linear-gradient(180deg,var(--sand-100) 0%,var(--sand-200) 100%);position:relative;display:flex;align-items:center;justify-content:center;color:var(--sand-400);overflow:hidden}
    .pimg{width:100%;height:100%;object-fit:contain;object-position:center;transition:transform 0.5s cubic-bezier(0.4,0,0.2,1)}
    .ps{position:absolute;top:12px;left:12px;background:rgba(255,253,249,0.95);backdrop-filter:blur(12px);padding:5px 12px;border-radius:100px;font-size:0.7rem;font-weight:600;letter-spacing:0.08em;color:var(--sand-700);text-transform:uppercase;z-index:2}
    .pdiscount{position:absolute;top:12px;right:12px;background:linear-gradient(135deg,#8b6914,#c4a24e);padding:5px 10px;border-radius:100px;font-size:0.7rem;font-weight:700;color:white;letter-spacing:0.03em;z-index:2}
    .pvisit{position:absolute;bottom:12px;left:12px;right:12px;background:rgba(45,37,32,0.9);backdrop-filter:blur(12px);padding:10px;border-radius:10px;text-align:center;font-size:0.78rem;font-weight:500;color:var(--white);letter-spacing:0.04em;opacity:0;transform:translateY(8px);transition:all 0.3s cubic-bezier(0.4,0,0.2,1);z-index:2;display:flex;align-items:center;justify-content:center;gap:6px}
    .pfav{position:absolute;top:12px;right:12px;width:32px;height:32px;border-radius:50%;background:rgba(255,253,249,0.95);backdrop-filter:blur(12px);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:3;transition:all 0.2s;color:var(--sand-400)}.pfav:hover{transform:scale(1.15);color:#e05}.pfav.faved{color:#e05}
    .pinfo{padding:16px 18px 18px}
    .pbrand{font-size:0.68rem;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:var(--sand-400);margin-bottom:6px}
    .pname{font-family:var(--serif);font-size:1rem;font-weight:500;margin-bottom:10px;line-height:1.35;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;min-height:2.7em}
    .pmeta{display:flex;justify-content:space-between;align-items:center;padding-top:10px;border-top:1px solid var(--sand-100)}
    .pprice{font-size:1.1rem;font-weight:700;color:var(--sand-900)}
    .pprice .orig{font-size:0.82rem;font-weight:400;color:var(--sand-400);text-decoration:line-through;margin-left:6px}
    .pprice .save{font-size:0.72rem;font-weight:600;color:#8b6914;display:block;margin-top:2px}
    .pcolors{display:flex;gap:4px}.cdot{width:12px;height:12px;border-radius:50%;border:1.5px solid var(--border)}
    .aff{margin-top:32px;padding:16px 24px;background:var(--white);border:1px solid var(--border);border-radius:var(--r);font-size:0.82rem;color:var(--sand-500);display:flex;align-items:center;gap:10px}
    .fg{display:grid;grid-template-columns:repeat(2,1fr);gap:24px}
    .fc{padding:40px;background:var(--white);border:1px solid var(--border);border-radius:var(--rl);transition:all var(--tr)}.fc:hover{transform:translateY(-2px);box-shadow:0 4px 20px rgba(45,37,32,0.08)}
    .fi{width:48px;height:48px;background:var(--accent-glow);border-radius:12px;display:flex;align-items:center;justify-content:center;margin-bottom:20px;color:var(--accent)}
    .fc h3{font-family:var(--serif);font-size:1.3rem;font-weight:500;margin-bottom:10px}.fc p{font-size:0.9rem;color:var(--sand-700);line-height:1.7;font-weight:300}
    .sastre-section{padding:100px 24px;background:var(--sand-950);position:relative;overflow:hidden}
    .sastre-section::before{content:'';position:absolute;top:-30%;right:-10%;width:500px;height:500px;background:radial-gradient(circle,rgba(196,162,78,0.08) 0%,transparent 70%);pointer-events:none}
    .sastre-section::after{content:'';position:absolute;bottom:-20%;left:-10%;width:400px;height:400px;background:radial-gradient(circle,rgba(196,162,78,0.05) 0%,transparent 70%);pointer-events:none}
    .sastre-inner{max-width:1100px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center;position:relative;z-index:1}
    .sastre-badge{display:inline-flex;align-items:center;gap:6px;padding:6px 14px;background:linear-gradient(135deg,rgba(139,105,20,0.2),rgba(196,162,78,0.2));border:1px solid rgba(196,162,78,0.3);color:var(--accent-light);border-radius:100px;font-size:0.75rem;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:20px}
    .sastre-title{font-family:var(--serif);font-size:clamp(2rem,3.5vw,2.8rem);font-weight:300;color:var(--sand-100);margin-bottom:16px;line-height:1.2}.sastre-title em{font-style:italic;color:var(--accent-light);font-weight:400}
    .sastre-desc{font-size:1rem;color:var(--sand-400);line-height:1.7;margin-bottom:32px;font-weight:300}
    .sastre-features{display:flex;flex-direction:column;gap:16px;margin-bottom:32px}
    .sastre-feat{display:flex;gap:14px;align-items:flex-start}
    .sastre-feat-icon{width:40px;height:40px;background:rgba(196,162,78,0.1);border:1px solid rgba(196,162,78,0.2);border-radius:10px;display:flex;align-items:center;justify-content:center;color:var(--accent-light);flex-shrink:0}
    .sastre-feat strong{display:block;font-size:0.9rem;color:var(--sand-100);margin-bottom:2px}
    .sastre-feat span{font-size:0.82rem;color:var(--sand-500);line-height:1.5}
    .sastre-cta-row{display:flex;align-items:center;gap:16px;flex-wrap:wrap}
    .sastre-btn{display:inline-flex;align-items:center;gap:10px;padding:14px 32px;background:var(--accent);color:var(--white);border:none;border-radius:100px;font-family:var(--sans);font-size:0.95rem;font-weight:500;cursor:pointer;transition:all var(--tr)}.sastre-btn:hover{background:var(--accent-light);transform:translateY(-2px);box-shadow:0 8px 30px rgba(139,105,20,0.3)}
    .sastre-price{font-size:0.82rem;color:var(--sand-500)}
    .sastre-preview{position:relative}
    .sastre-chat-window{background:var(--sand-900);border:1px solid rgba(196,162,78,0.15);border-radius:20px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.3)}
    .sastre-chat-header{display:flex;align-items:center;gap:12px;padding:16px 20px;border-bottom:1px solid rgba(196,162,78,0.1);background:rgba(196,162,78,0.05)}
    .sastre-chat-avatar{width:40px;height:40px;border-radius:12px;background:var(--sand-950);display:flex;align-items:center;justify-content:center}
    .sastre-chat-header strong{display:block;font-size:0.9rem;color:var(--sand-100)}
    .sastre-chat-header span{font-size:0.72rem;color:var(--accent-light)}
    .sastre-chat-body{padding:20px;display:flex;flex-direction:column;gap:12px;min-height:220px}
    .sastre-msg{max-width:85%;padding:12px 16px;border-radius:16px;font-size:0.85rem;line-height:1.5}
    .sastre-msg p{margin:0}
    .sastre-msg-bot{background:rgba(196,162,78,0.1);color:var(--sand-200);border-bottom-left-radius:4px;align-self:flex-start}
    .sastre-msg-user{background:var(--accent);color:var(--white);border-bottom-right-radius:4px;align-self:flex-end}
    .sastre-chat-input{padding:14px 20px;border-top:1px solid rgba(196,162,78,0.1);display:flex;align-items:center}
    .sastre-chat-input span{font-size:0.82rem;color:var(--sand-600)}
    @media(max-width:900px){.sastre-inner{grid-template-columns:1fr;gap:40px}.sastre-preview{order:-1}}
    .cta{padding:120px 24px;text-align:center;background:var(--sand-950);color:var(--sand-100);position:relative;overflow:hidden}
    .cta::before{content:'';position:absolute;top:-50%;left:50%;transform:translateX(-50%);width:600px;height:600px;background:radial-gradient(circle,rgba(196,162,78,0.1) 0%,transparent 70%);pointer-events:none}
    .cta h2{font-family:var(--serif);font-size:clamp(2rem,4vw,3.5rem);font-weight:300;margin-bottom:20px;position:relative}.cta h2 em{font-style:italic;color:var(--accent-light);font-weight:400}
    .cta p{font-size:1.05rem;color:var(--sand-400);max-width:480px;margin:0 auto 40px;font-weight:300;line-height:1.7;position:relative}
    .cbtn{display:inline-flex;align-items:center;gap:10px;padding:18px 40px;background:var(--accent);color:var(--white);border:none;border-radius:100px;font-family:var(--sans);font-size:1rem;font-weight:500;cursor:pointer;text-decoration:none;transition:all var(--tr);position:relative}
    .cbtn:hover{background:var(--accent-light);transform:translateY(-2px);box-shadow:0 8px 30px rgba(139,105,20,0.3)}
    .ft{padding:60px 40px 40px;border-top:1px solid var(--border);background:var(--sand-50)}
    .fti{max-width:1100px;margin:0 auto;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:20px}
    .ftl{display:flex;gap:28px}.ftl a{font-size:0.85rem;color:var(--sand-500);text-decoration:none;transition:color var(--tr)}.ftl a:hover{color:var(--accent)}
    .ftc{width:100%;text-align:center;margin-top:40px;padding-top:24px;border-top:1px solid var(--border);font-size:0.8rem;color:var(--sand-500)}
    .ld-spinner{display:inline-block;width:20px;height:20px;border:2px solid var(--sand-300);border-top-color:var(--accent);border-radius:50%;animation:spin 0.6s linear infinite}
    @keyframes spin{to{transform:rotate(360deg)}}
    .modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.5);backdrop-filter:blur(4px);z-index:1000;display:flex;align-items:center;justify-content:center;padding:24px}
    .modal{background:var(--white);border-radius:var(--rl);max-width:440px;width:100%;padding:40px 36px 36px;position:relative;box-shadow:0 20px 60px rgba(45,37,32,0.2);max-height:90vh;overflow-y:auto}
    .modal-close{position:absolute;top:12px;right:12px;width:40px;height:40px;border-radius:50%;border:1px solid var(--border);background:var(--white);cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--sand-700);transition:all var(--tr);z-index:10;font-size:1.2rem;box-shadow:0 2px 8px rgba(0,0,0,0.08)}.modal-close:hover{border-color:var(--accent);color:var(--accent);background:var(--accent-glow);transform:scale(1.05)}
    .premium-badge{display:inline-flex;align-items:center;gap:6px;padding:6px 14px;background:linear-gradient(135deg,#8b6914,#c4a24e);color:white;border-radius:100px;font-size:0.75rem;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:20px}
    .premium-feat{display:flex;align-items:center;gap:10px;padding:10px 0;font-size:0.92rem;color:var(--sand-700)}.premium-feat svg{color:var(--accent);flex-shrink:0}
    @media(max-width:900px){.steps{grid-template-columns:1fr}.pg{grid-template-columns:repeat(2,1fr);gap:16px}.fg{grid-template-columns:1fr}.nl{display:none}}
    @media(max-width:600px){.pg{grid-template-columns:repeat(2,1fr);gap:12px}.hero{padding:100px 16px 60px}h1{font-size:2.4rem!important}.sb{padding:6px 6px 6px 18px}.sbtn{padding:12px 20px}.sbtn .bt{display:none}.lb .ll{display:none}.lb{padding:7px 10px}.pinfo{padding:12px 14px 14px}.pname{font-size:0.9rem}.pprice{font-size:0.95rem}.ps{font-size:0.62rem;padding:4px 8px}.pdiscount{font-size:0.62rem;padding:4px 8px}}
  `;

  const Check = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>;
  const Star = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3l1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3z"/></svg>;
  const Search = ({s=20}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: css}} />

      {/* NAV */}
      <nav className={`nav${scrolled?' s':''}`}>
        <a href="#" className="logo" onClick={e=>{e.preventDefault();window.scrollTo({top:0,behavior:'smooth'})}}>SART<b>O</b></a>
        <div className="nr">
          <div className="nl">
            <a href="#how">{i('nav_how')}</a>
            <a href="#features">{i('nav_features')}</a>
            <a href="#sastre" style={{display:'flex',alignItems:'center',gap:5}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>{i('nav_sastre')}</a>
            <a href="#" onClick={e=>{e.preventDefault();setPremiumOpen(true)}} style={{color:'var(--accent)',fontWeight:600}}>{i('nav_premium')} ✦</a>
            <a href="#" className="ncta" onClick={e=>{e.preventDefault();window.scrollTo({top:0,behavior:'smooth'});setTimeout(()=>searchRef.current?.focus(),500)}}>{i('nav_cta')}</a>
            <a href="/wardrobe" style={{display:'flex',alignItems:'center',gap:5,padding:'8px 16px',background:'var(--sand-900)',color:'var(--white)',borderRadius:100,fontSize:'0.85rem',fontWeight:500,textDecoration:'none'}}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
              {i('nav_wardrobe')}
            </a>
          </div>
          <div ref={langRef} className={`ls${langOpen?' o':''}`}>
            <button className="lb" onClick={()=>setLangOpen(!langOpen)}>
              <span className="f">{langObj.flag}</span>
              <span className="ll">{langObj.native}</span>
              <svg className="ch" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            <div className="ld">
              {LANGUAGES.map(l=>(
                <button key={l.code} className={`lo${l.code===lang?' ac':''}`} onClick={()=>{setLang(l.code);saveLanguage(l.code);setLangOpen(false)}}>
                  <span className="f">{l.flag}</span>
                  <span>{l.name}</span>
                  <span className="nt">{l.native}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="badge"><Star /> {i('hero_badge')}</div>
        <h1>{i('hero_title_1')}<em>{i('hero_title_em')}</em>{i('hero_title_2')}</h1>
        <p className="sub">{i('hero_sub')}</p>
        <div className="sc">
          <div className="sb">
            <Search />
            <input ref={searchRef} type="text" value={query} onChange={e=>setQuery(e.target.value)}
              placeholder={i('search_placeholder')}
              onKeyDown={e=>{if(e.key==='Enter')doSearch(query)}} />
            <button className="sbtn" onClick={()=>doSearch(query)} disabled={loading}>
              {loading ? <span className="ld-spinner"/> : <><Star /><span className="bt">{i('search_btn')}</span></>}
            </button>
          </div>
          <p className="sh"><Star /> {i('search_hint')}</p>
          <div className="se">
            {(T[lang]?.examples||T.en.examples).map((ex,idx)=>(
              <button key={idx} className="sex" onClick={()=>{setQuery(ex.query);doSearch(ex.query)}}>{ex.label}</button>
            ))}
          </div>
        </div>
      </section>

      {/* TRUSTED */}
      <section className="trust">
        <div className="tl">{i('trusted')}</div>
        <div className="tlogos">
          {['ZARA','H&M','ASOS','Zalando','Mango','Uniqlo','Amazon','Nordstrom'].map(s=><span key={s}>{s}</span>)}
        </div>
      </section>

      {/* RESULTS (shown after search) */}
      {(results || loading) && (
        <section className="results-section" ref={resultsRef}>
          <div className="ri">
            {loading ? (
              <div style={{textAlign:'center',padding:'60px 0'}}>
                <span className="ld-spinner" style={{width:32,height:32,borderWidth:3}}/><br/>
                <span style={{color:'var(--sand-500)',marginTop:16,display:'block'}}>{i('loading')}</span>
              </div>
            ) : results && results.products?.length > 0 ? (
              <>
                <div className="rh">
                  <span className="rc">{i('results_count').replace('{n}',results.total).replace('{s}',results.stores)} {results.aiParsed ? '✦ AI' : ''}</span>
                  <button className="rsort">{i('results_sort')} ↓</button>
                </div>
                <div className="pg">
                  {results.products.map(p=>{
                    const discount = p.originalPrice ? Math.round((1 - p.price/p.originalPrice)*100) : 0;
                    return (
                    <a key={p.id} className="pc" href={p.affiliateUrl || p.storeUrl} target="_blank" rel="noopener noreferrer">
                      <div className="pi">
                        {p.image ? (
                          <img src={p.image} alt={p.name} className="pimg" loading="lazy" />
                        ) : (
                          <svg width="48" height="48" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.25"><path d="M20 12h24l4 8-6 4v28H22V24l-6-4 4-8z"/></svg>
                        )}
                        <span className="ps">{p.store}</span>
                        {discount > 0 && <span className="pdiscount">-{discount}%</span>}
                        <button className="pfav" onClick={e=>{e.preventDefault();e.stopPropagation();handleFav(p)}} title={i('save')}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
                        </button>
                        <div className="pvisit">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                          {i('visit_store') || 'Visit store'}
                        </div>
                      </div>
                      <div className="pinfo">
                        <div className="pbrand">{p.brand}</div>
                        <div className="pname">{p.name}</div>
                        <div className="pmeta">
                          <div className="pprice">
                            {p.currency}{p.price.toFixed(2)}
                            {p.originalPrice && <span className="orig">{p.currency}{p.originalPrice.toFixed(2)}</span>}
                            {discount > 0 && <span className="save">{i('save') || 'Save'} {p.currency}{(p.originalPrice - p.price).toFixed(2)}</span>}
                          </div>
                          {p.colors && <div className="pcolors">{p.colors.map((c,ci)=><div key={ci} className="cdot" style={{background:c}}/>)}</div>}
                        </div>
                      </div>
                    </a>
                  );})}
                </div>
                <div className="aff">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{color:'var(--accent)',flexShrink:0}}><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                  {i('affiliate')}
                </div>
              </>
            ) : (
              <p style={{textAlign:'center',color:'var(--sand-500)',padding:'40px 0'}}>{i('no_results')}</p>
            )}
          </div>
        </section>
      )}

      {/* HOW IT WORKS */}
      <section className="sect" id="how">
        <div className="slbl">{i('how_label')}</div>
        <h2 className="stitle">{i('how_title_1')}<em>{i('how_title_em')}</em>{i('how_title_2')}</h2>
        <div className="steps">
          <div className="step"><div className="sn">01</div><h3>{i('step1_t')}</h3><p>{i('step1_d')}</p></div>
          <div className="step"><div className="sn">02</div><h3>{i('step2_t')}</h3><p>{i('step2_d')}</p></div>
          <div className="step"><div className="sn">03</div><h3>{i('step3_t')}</h3><p>{i('step3_d')}</p></div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="sect" id="features">
        <div className="slbl">{i('feat_label')}</div>
        <h2 className="stitle">{i('feat_title_1')}<em>{i('feat_title_em')}</em>{i('feat_title_2')}</h2>
        <div className="fg">
          <div className="fc"><div className="fi"><Star /></div><h3>{i('f1t')}</h3><p>{i('f1d')}</p></div>
          <div className="fc"><div className="fi"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg></div><h3>{i('f2t')}</h3><p>{i('f2d')}</p></div>
          <div className="fc"><div className="fi"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg></div><h3>{i('f3t')}</h3><p>{i('f3d')}</p></div>
          <div className="fc"><div className="fi"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg></div><h3>{i('f4t')}</h3><p>{i('f4d')}</p></div>
        </div>
      </section>

      {/* EL SASTRE - AI STYLIST */}
      <section className="sastre-section" id="sastre">
        <div className="sastre-inner">
          <div className="sastre-content">
            <div className="sastre-badge">✦ {i('sastre_badge')}</div>
            <h2 className="sastre-title">{i('sastre_title_1')}<em>{i('sastre_title_em')}</em></h2>
            <p className="sastre-desc">{i('sastre_desc')}</p>
            <div className="sastre-features">
              <div className="sastre-feat">
                <div className="sastre-feat-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg></div>
                <div><strong>{i('sastre_f1t')}</strong><span>{i('sastre_f1d')}</span></div>
              </div>
              <div className="sastre-feat">
                <div className="sastre-feat-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg></div>
                <div><strong>{i('sastre_f2t')}</strong><span>{i('sastre_f2d')}</span></div>
              </div>
              <div className="sastre-feat">
                <div className="sastre-feat-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg></div>
                <div><strong>{i('sastre_f3t')}</strong><span>{i('sastre_f3d')}</span></div>
              </div>
              <div className="sastre-feat">
                <div className="sastre-feat-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg></div>
                <div><strong>{i('sastre_f4t')}</strong><span>{i('sastre_f4d')}</span></div>
              </div>
            </div>
            <div className="sastre-cta-row">
              <button className="sastre-btn" onClick={()=>setPremiumOpen(true)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                {i('sastre_btn')}
              </button>
              <span className="sastre-price">{i('sastre_included')}</span>
            </div>
          </div>
          <div className="sastre-preview">
            <div className="sastre-chat-window">
              <div className="sastre-chat-header">
                <div className="sastre-chat-avatar">
                  <svg width="24" height="24" viewBox="0 0 64 64" fill="none"><circle cx="32" cy="32" r="28" fill="#2d2520"/><circle cx="32" cy="22" r="8" stroke="#c4a24e" strokeWidth="2" fill="none"/><path d="M32 30v12M26 36h12" stroke="#c4a24e" strokeWidth="2"/><rect x="22" y="44" width="20" height="4" rx="2" fill="#c4a24e" opacity="0.5"/></svg>
                </div>
                <div>
                  <strong>El Sastre</strong>
                  <span>{i('sastre_status')}</span>
                </div>
              </div>
              <div className="sastre-chat-body">
                <div className="sastre-msg sastre-msg-bot">
                  <p>{i('sastre_demo_1')}</p>
                </div>
                <div className="sastre-msg sastre-msg-user">
                  <p>{i('sastre_demo_2')}</p>
                </div>
                <div className="sastre-msg sastre-msg-bot">
                  <p>{i('sastre_demo_3')}</p>
                </div>
              </div>
              <div className="sastre-chat-input">
                <span>{i('sastre_placeholder')}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta">
        <h2>{i('cta_title_1')}<em>{i('cta_title_em')}</em></h2>
        <p>{i('cta_sub')}</p>
        <a href="#" className="cbtn" onClick={e=>{e.preventDefault();searchRef.current?.focus();window.scrollTo({top:0,behavior:'smooth'})}}><Search s={18}/> {i('cta_btn')}</a>
      </section>

      {/* FOOTER */}
      <footer className="ft">
        <div className="fti">
          <span className="logo" style={{fontSize:'1.4rem'}}>SART<b>O</b></span>
          <div className="ftl">
            <a href="#how">{i('footer_about')}</a>
            <a href="#how">{i('footer_how')}</a>
            <a href="#" onClick={e=>{e.preventDefault();setPremiumOpen(true)}}>{i('footer_privacy')}</a>
            <a href="#" onClick={e=>{e.preventDefault();setPremiumOpen(true)}}>{i('footer_terms')}</a>
            <a href="mailto:hello@sartoapp.com">{i('footer_contact')}</a>
          </div>
          <div className="ftc">{i('footer_copy')}</div>
        </div>
      </footer>

      {/* PREMIUM MODAL */}
      {premiumOpen && (
        <div className="modal-overlay" onClick={()=>setPremiumOpen(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <button className="modal-close" onClick={()=>setPremiumOpen(false)}>✕</button>
            <div className="premium-badge">✦ {i('premium_badge')}</div>
            <h2 style={{fontFamily:'var(--serif)',fontSize:'2rem',fontWeight:300,marginBottom:8}}>{i('premium_title')}</h2>
            <p style={{color:'var(--sand-700)',marginBottom:24,fontSize:'0.95rem'}}>{i('premium_desc')}</p>
            <div style={{fontSize:'2.5rem',fontWeight:700,color:'var(--sand-900)',marginBottom:4}}>€{i('premium_price')}<span style={{fontSize:'1rem',fontWeight:400,color:'var(--sand-500)'}}>/mo</span></div>
            <p style={{fontSize:'0.82rem',color:'var(--accent)',marginBottom:20}}>{i('premium_trial')}</p>
            <div style={{background:'linear-gradient(135deg,rgba(139,105,20,0.08),rgba(196,162,78,0.08))',border:'1px solid rgba(196,162,78,0.2)',borderRadius:12,padding:'16px',marginBottom:20}}>
              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:8}}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                <strong style={{fontSize:'0.95rem',color:'var(--sand-900)'}}>{i('premium_sastre_title')}</strong>
              </div>
              <p style={{fontSize:'0.82rem',color:'var(--sand-700)',lineHeight:1.5,margin:0}}>{i('premium_sastre_desc')}</p>
            </div>
            <div style={{borderTop:'1px solid var(--border)',paddingTop:16,marginBottom:24}}>
              <div className="premium-feat"><Check /> {i('premium_f1')}</div>
              <div className="premium-feat"><Check /> {i('premium_f2')}</div>
              <div className="premium-feat"><Check /> {i('premium_f3')}</div>
              <div className="premium-feat"><Check /> {i('premium_f4')}</div>
              <div className="premium-feat"><Check /> {i('premium_f5')}</div>
            </div>
            <button onClick={handlePremium} style={{width:'100%',padding:'16px',background:'var(--accent)',color:'var(--white)',border:'none',borderRadius:100,fontFamily:'var(--sans)',fontSize:'1rem',fontWeight:500,cursor:'pointer',transition:'all var(--tr)'}}
              onMouseOver={e=>e.target.style.background='var(--accent-light)'} onMouseOut={e=>e.target.style.background='var(--accent)'}>{i('premium_btn')}</button>
          </div>
        </div>
      )}
    </>
  );
}
