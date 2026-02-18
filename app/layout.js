import './globals.css';

export const metadata = {
  title: 'Sarto — AI-Powered Fashion Search Engine',
  description: 'Describe what you want and find it across 200+ stores. Compare prices, brands, and styles in one search. Your personal digital tailor powered by AI.',
  keywords: 'fashion search engine, AI fashion, clothing finder, price comparison, style finder, wardrobe, online shopping, compare prices, fashion deals, best price clothes',
  metadataBase: new URL('https://sartoapp.com'),
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/icon.svg',
  },
  openGraph: {
    title: 'Sarto — Find Any Fashion Item at the Best Price',
    description: 'AI-powered fashion search engine. Describe what you want, Sarto finds it across 200+ stores at the best price.',
    url: 'https://sartoapp.com',
    siteName: 'Sarto',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary',
    title: 'Sarto — AI Fashion Search Engine',
    description: 'Describe what you want. Sarto finds it across 200+ stores at the best price.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
      </head>
      <body>{children}</body>
    </html>
  );
}
