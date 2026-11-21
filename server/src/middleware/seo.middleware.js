/**
 * SEO Middleware for Server-Side Meta Tag Injection
 * 
 * Detects search engine crawlers and social media bots (Google, Bing, Facebook, Twitter, etc.)
 * and injects dynamic meta tags into the HTML before serving it.
 * This ensures crawlers that don't execute JavaScript still see proper meta tags.
 */
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { Listing } from '../models/Listing.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SITE_URL = process.env.SITE_URL || 'https://agroharvest.in';

// Known bot user-agent patterns
const BOT_USER_AGENTS = [
  'googlebot', 'bingbot', 'slurp', 'duckduckbot', 'baiduspider', 'yandexbot',
  'facebookexternalhit', 'twitterbot', 'linkedinbot', 'whatsapp', 'telegrambot',
  'discordbot', 'applebot', 'semrushbot', 'ahrefsbot', 'rogerbot', 'embedly',
  'quora link preview', 'outbrain', 'pinterest', 'slackbot',
];

function isBot(userAgent) {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  return BOT_USER_AGENTS.some((bot) => ua.includes(bot));
}

/**
 * Generates meta tags string for a given view/query
 */
async function generateMetaTags(query) {
  const commodity = query.commodity || '';
  const view = query.view || 'marketplace';
  const listingId = query.listing || '';

  let title = "AgroHarvest – India's Agricultural Commodity Marketplace";
  let description =
    'Buy and sell Paddy, Corn & Peanuts at wholesale prices on AgroHarvest. Direct farm sourcing from verified Indian cooperatives.';
  let ogImage = `${SITE_URL}/og-image.png`;
  let canonicalUrl = SITE_URL;
  let jsonLd = '';

  // Commodity-specific pages
  if (commodity) {
    const commodityNames = {
      Paddy: 'Paddy Rice',
      Corn: 'Yellow Corn & Maize',
      Peanuts: 'Peanuts & Groundnuts',
    };
    const name = commodityNames[commodity] || commodity;
    title = `Buy ${name} Wholesale – AgroHarvest India`;
    description = `Browse verified ${name} listings from Indian cooperatives. Compare moisture levels, grades, and wholesale INR prices. Escrow protected transactions.`;
    canonicalUrl = `${SITE_URL}/?commodity=${commodity}`;
  }

  // Individual listing page
  if (listingId) {
    try {
      const listing = await Listing.findById(listingId).populate('seller', 'name companyName');
      if (listing) {
        title = `${listing.title} – ₹${Number(listing.unitPrice).toLocaleString('en-IN')}/${listing.unit} | AgroHarvest`;
        description = `${listing.commodity} ${listing.grade} from ${listing.origin?.district || ''}, ${listing.origin?.state || 'India'}. Moisture: ${listing.moisturePercentage}%. ${listing.quantity} ${listing.unit} available. Verified seller on AgroHarvest.`;
        canonicalUrl = `${SITE_URL}/?listing=${listingId}`;
        jsonLd = JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: listing.title,
          description,
          image: listing.images?.[0] || ogImage,
          brand: {
            '@type': 'Brand',
            name: listing.seller?.companyName || listing.seller?.name || 'AgroHarvest Seller',
          },
          offers: {
            '@type': 'Offer',
            priceCurrency: 'INR',
            price: listing.unitPrice,
            availability: listing.quantity > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
          },
        });
      }
    } catch (err) {
      // Listing not found – use defaults
    }
  }

  // Auth pages
  if (view === 'login') {
    title = 'Sign In | AgroHarvest';
    description = "Sign in to AgroHarvest to buy or sell Paddy, Corn & Peanuts on India's wholesale agricultural commodity marketplace.";
    canonicalUrl = `${SITE_URL}/?view=login`;
  } else if (view === 'register') {
    title = 'Create Account | AgroHarvest';
    description = "Register as a Buyer or Seller on AgroHarvest – India's wholesale agricultural marketplace for Paddy, Corn & Peanuts.";
    canonicalUrl = `${SITE_URL}/?view=register`;
  }

  return { title, description, ogImage, canonicalUrl, jsonLd };
}

/**
 * Express middleware: intercepts SPA HTML requests from bots and injects SEO meta tags.
 */
export function seoMiddleware(clientDistPath) {
  const indexPath = path.join(clientDistPath, 'index.html');

  return async (req, res, next) => {
    // Only intercept bot requests for HTML pages (not API or static assets)
    if (req.path.startsWith('/api') || req.path.includes('.')) {
      return next();
    }

    const userAgent = req.get('user-agent') || '';
    if (!isBot(userAgent)) {
      return next();
    }

    // Read the base HTML template
    let html;
    try {
      html = fs.readFileSync(indexPath, 'utf-8');
    } catch (err) {
      return next(); // If dist not built yet, fall through
    }

    const { title, description, ogImage, canonicalUrl, jsonLd } = await generateMetaTags(req.query);

    // Inject / replace meta tags in the HTML <head>
    html = html.replace(/<title>.*?<\/title>/, `<title>${title}</title>`);
    html = html.replace(
      /<meta name="description" content=".*?".*?\/>/,
      `<meta name="description" content="${description}" />`
    );
    html = html.replace(
      /<link rel="canonical".*?\/>/,
      `<link rel="canonical" href="${canonicalUrl}" />`
    );

    // Update OG tags
    html = html.replace(/<meta property="og:title" content=".*?".*?\/>/, `<meta property="og:title" content="${title}" />`);
    html = html.replace(/<meta property="og:description" content=".*?".*?\/>/, `<meta property="og:description" content="${description}" />`);
    html = html.replace(/<meta property="og:url" content=".*?".*?\/>/, `<meta property="og:url" content="${canonicalUrl}" />`);
    html = html.replace(/<meta property="og:image" content=".*?".*?\/>/, `<meta property="og:image" content="${ogImage}" />`);

    // Update Twitter tags
    html = html.replace(/<meta name="twitter:title" content=".*?".*?\/>/, `<meta name="twitter:title" content="${title}" />`);
    html = html.replace(/<meta name="twitter:description" content=".*?".*?\/>/, `<meta name="twitter:description" content="${description}" />`);

    // Inject dynamic JSON-LD before </head> if present
    if (jsonLd) {
      html = html.replace(
        '</head>',
        `<script type="application/ld+json">${jsonLd}</script>\n</head>`
      );
    }

    res.set('Content-Type', 'text/html');
    res.send(html);
  };
}
