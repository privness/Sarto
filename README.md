# 🧵 SARTO — Guía de Despliegue

## ¿Qué es Sarto?

Buscador de moda con IA que busca en todas las tiendas y encuentra la prenda exacta que buscas. Monetización por comisiones de afiliado + suscripción Premium (9.99€/mes).

## Estructura del proyecto

```
sarto-app/
├── app/
│   ├── api/
│   │   ├── search/route.js      ← Motor de búsqueda (IA + afiliados)
│   │   ├── checkout/route.js    ← Stripe checkout para Premium
│   │   └── webhook/route.js     ← Webhook de Stripe
│   ├── search/                  ← (futuro: página de resultados dedicada)
│   ├── success/page.js          ← Página post-pago Premium
│   ├── globals.css
│   ├── layout.js
│   └── page.js                  ← Landing completa + buscador + 10 idiomas
├── lib/
│   ├── i18n.js                  ← Traducciones (10 idiomas)
│   └── products.js              ← Motor de productos (demo + APIs reales)
├── package.json
├── next.config.js
├── tailwind.config.js
├── postcss.config.js
├── .env.example                 ← Variables de entorno necesarias
└── .gitignore
```

## Costes

| Concepto | Coste |
|----------|-------|
| Vercel hosting | GRATIS |
| APIs afiliados (Amazon, Awin) | GRATIS |
| Claude API (búsqueda IA) | ~$0.002/búsqueda (prepago, $5 = 2.500 búsquedas) |
| Dominio (opcional) | ~10€/año |

## Paso 1: Subir a GitHub

1. Ve a github.com → "+" → "New repository"
2. Nombre: `sarto-app` → Create repository
3. Sube CADA archivo uno a uno:
   - Click "Add file" → "Create new file"
   - Escribe la ruta completa (ej: `app/page.js`)
   - Pega el contenido
   - Click "Commit changes"

**Archivos a subir (en este orden):**
1. `package.json`
2. `next.config.js`
3. `tailwind.config.js`
4. `postcss.config.js`
5. `.gitignore`
6. `app/globals.css`
7. `app/layout.js`
8. `app/page.js`
9. `app/success/page.js`
10. `app/api/search/route.js`
11. `app/api/checkout/route.js`
12. `app/api/webhook/route.js`
13. `lib/i18n.js`
14. `lib/products.js`

## Paso 2: Desplegar en Vercel

1. Ve a vercel.com → login con GitHub
2. "Add New Project" → selecciona `sarto-app`
3. **Variables de entorno** (añade solo las que tengas):
   - `ANTHROPIC_API_KEY` = tu key de Claude (opcional, para búsqueda IA)
4. Click "Deploy"
5. En 2 minutos tienes tu URL

**Sin ninguna variable de entorno, la app funciona con datos demo.**
Esto es perfecto para empezar. Ve añadiendo las keys cuando las tengas.

## Paso 3: Activar búsqueda con IA (opcional)

1. Ve a console.anthropic.com
2. Carga $5 de saldo
3. Copia tu API key
4. En Vercel → Settings → Environment Variables → añade `ANTHROPIC_API_KEY`
5. Redeploy

Ahora los usuarios pueden buscar en lenguaje natural ("quiero un chaleco rojo de lana, tipo slim, menos de 80€") y la IA extrae los filtros automáticamente.

Si el saldo se agota, la búsqueda sigue funcionando con filtros básicos (fallback automático).

## Paso 4: Conectar productos reales (cuando tengas las API keys)

### Amazon Associates
1. Regístrate en affiliate-program.amazon.com
2. Obtén: Access Key, Secret Key, Partner Tag
3. Añade en Vercel: `AMAZON_ACCESS_KEY`, `AMAZON_SECRET_KEY`, `AMAZON_PARTNER_TAG`

### Awin (Zalando, ASOS, Mango, H&M, El Corte Inglés...)
1. Regístrate en awin.com (5€ que te devuelven)
2. Solicita acceso a los programas de moda
3. Obtén tu API Token
4. Añade en Vercel: `AWIN_API_TOKEN`

Cuando añadas estas variables, los archivos en `lib/products.js` ya tienen las funciones preparadas. Solo necesitan implementar las llamadas a cada API (te puedo ayudar con esto cuando tengas las keys).

## Paso 5: Activar pagos Premium con Stripe

1. Crea cuenta en stripe.com
2. Crea 1 producto: "Sarto Premium" → 9.99€/mes
3. Copia el Price ID
4. En Vercel, añade:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_PRICE_PREMIUM` (el price ID)
   - `STRIPE_WEBHOOK_SECRET` (lo obtienes al crear el webhook)
   - `NEXT_PUBLIC_URL` (tu URL de Vercel)
5. En Stripe → Webhooks → añade endpoint: `https://tu-url.vercel.app/api/webhook`

## Resumen de ingresos estimados

- **Afiliados**: 3-10% por venta. 1 venta/día de 60€ = 90-180€/mes
- **Premium**: 9.99€/mes por suscriptor. 20 suscriptores = 200€/mes
- **Coste**: 0€ (sin IA) o ~$5/mes (con IA activa)
- **Beneficio con 20 premium + 1 venta/día**: ~300-380€/mes

## Idiomas soportados

La web detecta automáticamente el idioma del navegador del visitante:
🇬🇧 English, 🇪🇸 Español, 🇫🇷 Français, 🇩🇪 Deutsch, 🇮🇹 Italiano,
🇧🇷 Português, 🇳🇱 Nederlands, 🇯🇵 日本語, 🇰🇷 한국어, 🇨🇳 中文
