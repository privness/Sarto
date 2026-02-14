import './globals.css';

export const metadata = {
  title: 'Sarto — Find the exact piece you\'re looking for',
  description: 'AI-powered fashion search engine. Describe what you want and find it across 200+ stores worldwide. Compare prices, materials, and styles in one search.',
  keywords: 'fashion search, clothing finder, price comparison, AI fashion, style finder, wardrobe, shopping',
  openGraph: {
    title: 'Sarto — Your Personal Fashion Scout',
    description: 'Find any garment across every store. AI-powered fashion search.',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
