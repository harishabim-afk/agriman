/**
 * SEO Routes – Dynamic sitemap.xml and robots.txt served from the API
 * These supplement the static files in /public and can include live listing data.
 */
import express from 'express';
import { Listing } from '../models/Listing.js';

const router = express.Router();

const SITE_URL = process.env.SITE_URL || 'https://agroharvest.in';

/**
 * GET /api/seo/sitemap.xml
 * Generates a dynamic XML sitemap including all active listings.
 */
router.get('/sitemap.xml', async (req, res) => {
  try {
    // Fetch all active listings
    const listings = await Listing.find({ status: 'active' })
      .select('_id commodity updatedAt')
      .sort({ updatedAt: -1 })
      .lean();

    const today = new Date().toISOString().split('T')[0];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

  <!-- Static Pages -->
  <url>
    <loc>${SITE_URL}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${SITE_URL}/?view=login</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${SITE_URL}/?view=register</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>

  <!-- Commodity Category Pages -->
  <url>
    <loc>${SITE_URL}/?commodity=Paddy</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${SITE_URL}/?commodity=Corn</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${SITE_URL}/?commodity=Peanuts</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>

  <!-- Individual Listings (Dynamic) -->
${listings
  .map(
    (l) => `  <url>
    <loc>${SITE_URL}/?listing=${l._id}</loc>
    <lastmod>${new Date(l.updatedAt).toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
  )
  .join('\n')}

</urlset>`;

    res.set('Content-Type', 'application/xml');
    res.set('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    res.send(xml);
  } catch (err) {
    console.error('[SEO] Sitemap generation error:', err);
    res.status(500).send('<!-- Sitemap generation failed -->');
  }
});

/**
 * GET /api/seo/meta
 * Returns SEO metadata for a given page (useful for SSR or pre-rendering services).
 */
router.get('/meta', async (req, res) => {
  const { commodity, listing: listingId, view } = req.query;

  let meta = {
    title: "AgroHarvest – India's Agricultural Commodity Marketplace",
    description:
      'Buy and sell Paddy, Corn & Peanuts at wholesale prices on AgroHarvest. Direct farm sourcing from verified Indian cooperatives.',
    ogImage: `${SITE_URL}/og-image.png`,
    canonicalUrl: SITE_URL,
    keywords: 'paddy, corn, peanuts, agricultural marketplace, wholesale grain, Indian agri trade',
  };

  if (commodity) {
    meta.title = `Buy ${commodity} Wholesale – AgroHarvest India`;
    meta.description = `Browse verified ${commodity} listings from Indian cooperatives.`;
    meta.canonicalUrl = `${SITE_URL}/?commodity=${commodity}`;
  }

  if (listingId) {
    try {
      const listing = await Listing.findById(listingId)
        .populate('seller', 'name companyName')
        .lean();
      if (listing) {
        meta.title = `${listing.title} – ₹${Number(listing.unitPrice).toLocaleString('en-IN')}/${listing.unit} | AgroHarvest`;
        meta.description = `${listing.commodity} ${listing.grade} from ${listing.origin?.district || ''}, ${listing.origin?.state || 'India'}. Moisture: ${listing.moisturePercentage}%.`;
        meta.canonicalUrl = `${SITE_URL}/?listing=${listingId}`;
        meta.ogImage = listing.images?.[0] || meta.ogImage;
        meta.keywords = `${listing.commodity}, ${listing.variety || ''}, ${listing.grade}, ${listing.origin?.state || ''}, wholesale`;
      }
    } catch (err) {
      // Use defaults
    }
  }

  res.json(meta);
});

export default router;
