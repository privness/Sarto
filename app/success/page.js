'use client';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

const texts = {
  en: { title: 'Welcome to Sarto Premium', desc: 'Your 7-day free trial has started. You now have access to El Sastre — your personal AI stylist, price alerts, historical price charts, image search, and unlimited collections.', btn: 'Start searching with Premium' },
  es: { title: 'Bienvenido a Sarto Premium', desc: 'Tu prueba gratuita de 7 días ha comenzado. Ahora tienes acceso a El Sastre — tu estilista personal con IA, alertas de precio, historial de precios, búsqueda por imagen y colecciones ilimitadas.', btn: 'Empieza a buscar con Premium' },
  fr: { title: 'Bienvenue chez Sarto Premium', desc: 'Votre essai gratuit de 7 jours a commencé. Vous avez accès à El Sastre, alertes de prix, historique des prix et recherche par image.', btn: 'Commencez avec Premium' },
  de: { title: 'Willkommen bei Sarto Premium', desc: 'Ihre 7-tägige Testphase hat begonnen. Sie haben Zugang zu El Sastre, Preisalarmen, Preisverlauf und Bildersuche.', btn: 'Suche mit Premium starten' },
  it: { title: 'Benvenuto in Sarto Premium', desc: 'La tua prova gratuita di 7 giorni è iniziata. Hai accesso a El Sastre, avvisi prezzo, storico prezzi e ricerca per immagine.', btn: 'Inizia con Premium' },
  pt: { title: 'Bem-vindo ao Sarto Premium', desc: 'Seu teste grátis de 7 dias começou. Você tem acesso ao El Sastre, alertas de preço, histórico de preços e busca por imagem.', btn: 'Comece com Premium' },
  nl: { title: 'Welkom bij Sarto Premium', desc: 'Je 7-daagse proefperiode is gestart. Je hebt toegang tot El Sastre, prijsalarmen, prijsgeschiedenis en beeldzoeken.', btn: 'Start met Premium' },
  ja: { title: 'Sarto Premiumへようこそ', desc: '7日間の無料トライアルが開始されました。El Sastre、価格アラート、価格履歴、画像検索にアクセスできます。', btn: 'Premiumで検索開始' },
  ko: { title: 'Sarto Premium에 오신 것을 환영합니다', desc: '7일 무료 체험이 시작되었습니다. El Sastre, 가격 알림, 가격 히스토리, 이미지 검색을 이용할 수 있습니다.', btn: 'Premium으로 검색 시작' },
  zh: { title: '欢迎使用 Sarto Premium', desc: '您的7天免费试用已开始。您可以使用El Sastre、价格提醒、价格历史和图片搜索。', btn: '开始Premium搜索' },
};

function SuccessContent() {
  const params = useSearchParams();
  const lang = params.get('lang') || 'en';
  const t = texts[lang] || texts.en;

  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'DM Sans, sans-serif',background:'#faf8f5',padding:24}}>
      <div style={{textAlign:'center',maxWidth:480}}>
        <div style={{fontSize:'3rem',marginBottom:16}}>✨</div>
        <h1 style={{fontFamily:'Cormorant Garamond, serif',fontSize:'2.5rem',fontWeight:300,marginBottom:16,color:'#2d2520'}}>
          {t.title}
        </h1>
        <p style={{color:'#6b5640',fontSize:'1.05rem',lineHeight:1.7,marginBottom:32}}>
          {t.desc}
        </p>
        <a href="/" style={{display:'inline-flex',alignItems:'center',gap:8,padding:'14px 32px',background:'#8b6914',color:'#fffdf9',borderRadius:100,textDecoration:'none',fontWeight:500,fontSize:'0.95rem'}}>
          {t.btn}
        </a>
      </div>
    </div>
  );
}

export default function Success() {
  return (
    <Suspense fallback={<div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}>Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
