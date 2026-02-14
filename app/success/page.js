'use client';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function SuccessContent() {
  const params = useSearchParams();
  const plan = params.get('plan');

  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'DM Sans, sans-serif',background:'#faf8f5',padding:24}}>
      <div style={{textAlign:'center',maxWidth:480}}>
        <div style={{fontSize:'3rem',marginBottom:16}}>✨</div>
        <h1 style={{fontFamily:'Cormorant Garamond, serif',fontSize:'2.5rem',fontWeight:300,marginBottom:16,color:'#2d2520'}}>
          Welcome to Sarto Premium
        </h1>
        <p style={{color:'#6b5640',fontSize:'1.05rem',lineHeight:1.7,marginBottom:32}}>
          Your 7-day free trial has started. You now have access to price alerts,
          historical price charts, and image search. Enjoy!
        </p>
        <a href="/" style={{display:'inline-flex',alignItems:'center',gap:8,padding:'14px 32px',background:'#8b6914',color:'#fffdf9',borderRadius:100,textDecoration:'none',fontWeight:500,fontSize:'0.95rem'}}>
          Start searching with Premium
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
