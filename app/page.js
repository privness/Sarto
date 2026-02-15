'use client';
import { useState, useEffect, useRef } from 'react';
import { LANGUAGES, T, detectLanguage, t } from '../lib/i18n';

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

  async function doSearch(q) {
    if (!q.trim()) return;
    setLoading(true);
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

  async function handlePremium() {
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lang }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else if (data.demo) { setPremiumOpen(false); alert('Stripe not configured yet. See .env.example'); }
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
    .pg{display:grid;grid-template-columns:repeat(4,1fr);gap:24px}
    .pc{background:var(--white);border:1px solid var(--border);border-radius:var(--rl);overflow:hidden;transition:all var(--tr);cursor:pointer;text-decoration:none;color:inherit}
    .pc:hover{transform:translateY(-6px);box-shadow:0 20px 60px rgba(45,37,32,0.16);border-color:var(--accent-light)}
    .pi{width:100%;aspect-ratio:3/4;background:var(--sand-200);position:relative;display:flex;align-items:center;justify-content:center;color:var(--sand-400)}
    .ps{position:absolute;top:12px;left:12px;background:rgba(255,253,249,0.92);backdrop-filter:blur(8px);padding:5px 12px;border-radius:100px;font-size:0.72rem;font-weight:600;letter-spacing:0.06em;color:var(--sand-700);text-transform:uppercase}
    .pinfo{padding:18px}.pbrand{font-size:0.72rem;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:var(--sand-500);margin-bottom:4px}
    .pname{font-family:var(--serif);font-size:1.05rem;font-weight:500;margin-bottom:8px;line-height:1.3}
    .pmeta{display:flex;justify-content:space-between;align-items:center}.pprice{font-size:1.05rem;font-weight:600}
    .pprice .orig{font-size:0.85rem;font-weight:400;color:var(--sand-500);text-decoration:line-through;margin-left:6px}
    .pcolors{display:flex;gap:4px}.cdot{width:14px;height:14px;border-radius:50%;border:1.5px solid var(--border)}
    .aff{margin-top:32px;padding:16px 24px;background:var(--white);border:1px solid var(--border);border-radius:var(--r);font-size:0.82rem;color:var(--sand-500);display:flex;align-items:center;gap:10px}
    .fg{display:grid;grid-template-columns:repeat(2,1fr);gap:24px}
    .fc{padding:40px;background:var(--white);border:1px solid var(--border);border-radius:var(--rl);transition:all var(--tr)}.fc:hover{transform:translateY(-2px);box-shadow:0 4px 20px rgba(45,37,32,0.08)}
    .fi{width:48px;height:48px;background:var(--accent-glow);border-radius:12px;display:flex;align-items:center;justify-content:center;margin-bottom:20px;color:var(--accent)}
    .fc h3{font-family:var(--serif);font-size:1.3rem;font-weight:500;margin-bottom:10px}.fc p{font-size:0.9rem;color:var(--sand-700);line-height:1.7;font-weight:300}
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
    .modal{background:var(--white);border-radius:var(--rl);max-width:440px;width:100%;padding:48px 40px;position:relative;box-shadow:0 20px 60px rgba(45,37,32,0.2)}
    .modal-close{position:absolute;top:16px;right:16px;width:36px;height:36px;border-radius:50%;border:1px solid var(--border);background:none;cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--sand-500);transition:all var(--tr)}.modal-close:hover{border-color:var(--accent);color:var(--accent)}
    .premium-badge{display:inline-flex;align-items:center;gap:6px;padding:6px 14px;background:linear-gradient(135deg,#8b6914,#c4a24e);color:white;border-radius:100px;font-size:0.75rem;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:20px}
    .premium-feat{display:flex;align-items:center;gap:10px;padding:10px 0;font-size:0.92rem;color:var(--sand-700)}.premium-feat svg{color:var(--accent);flex-shrink:0}
    @media(max-width:900px){.steps{grid-template-columns:1fr}.pg{grid-template-columns:repeat(2,1fr)}.fg{grid-template-columns:1fr}.nl{display:none}}
    @media(max-width:600px){.pg{grid-template-columns:1fr;gap:16px}.hero{padding:100px 16px 60px}h1{font-size:2.4rem!important}.sb{padding:6px 6px 6px 18px}.sbtn{padding:12px 20px}.sbtn .bt{display:none}.lb .ll{display:none}.lb{padding:7px 10px}}
  `;

  const Check = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>;
  const Star = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3l1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3z"/></svg>;
  const Search = ({s=20}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: css}} />

      {/* NAV */}
      <nav className={`nav${scrolled?' s':''}`}>
        <a href="#" className="logo">SART<b>O</b></a>
        <div className="nr">
          <div className="nl">
            <a href="#how">{i('nav_how')}</a>
            <a href="#features">{i('nav_features')}</a>
            <a href="#" onClick={e=>{e.preventDefault();setPremiumOpen(true)}} style={{color:'var(--accent)',fontWeight:600}}>{i('nav_premium')} ✦</a>
            <a href="#" className="ncta" onClick={e=>{e.preventDefault();searchRef.current?.focus()}}>{i('nav_cta')}</a>
          </div>
          <div ref={langRef} className={`ls${langOpen?' o':''}`}>
            <button className="lb" onClick={()=>setLangOpen(!langOpen)}>
              <span className="f">{langObj.flag}</span>
              <span className="ll">{langObj.native}</span>
              <svg className="ch" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            <div className="ld">
              {LANGUAGES.map(l=>(
                <button key={l.code} className={`lo${l.code===lang?' ac':''}`} onClick={()=>{setLang(l.code);setLangOpen(false)}}>
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
                  {results.products.map(p=>(
                    <a key={p.id} className="pc" href={p.storeUrl} target="_blank" rel="noopener noreferrer">
                      <div className="pi">
                        <svg width="48" height="48" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3"><path d="M20 12h24l4 8-6 4v28H22V24l-6-4 4-8z"/></svg>
                        <span className="ps">{p.store}</span>
                      </div>
                      <div className="pinfo">
                        <div className="pbrand">{p.brand}</div>
                        <div className="pname">{p.name}</div>
                        <div className="pmeta">
                          <div className="pprice">{p.currency}{p.price}{p.originalPrice && <span className="orig">{p.currency}{p.originalPrice}</span>}</div>
                          <div className="pcolors">{p.colors?.map((c,ci)=><div key={ci} className="cdot" style={{background:c}}/>)}</div>
                        </div>
                      </div>
                    </a>
                  ))}
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
            <a href="#">{i('footer_about')}</a>
            <a href="#">{i('footer_how')}</a>
            <a href="#">{i('footer_privacy')}</a>
            <a href="#">{i('footer_terms')}</a>
            <a href="#">{i('footer_contact')}</a>
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
            <p style={{fontSize:'0.82rem',color:'var(--accent)',marginBottom:28}}>{i('premium_trial')}</p>
            <div style={{borderTop:'1px solid var(--border)',paddingTop:20,marginBottom:28}}>
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
