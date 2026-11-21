import React from 'react';
import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'AgroHarvest';
const DEFAULT_TITLE = 'AgroHarvest – India\'s Agricultural Commodity Marketplace';
const DEFAULT_DESCRIPTION =
  'Buy and sell Paddy, Corn & Peanuts at wholesale prices on AgroHarvest. Direct farm sourcing from verified Indian cooperatives with escrow payment protection, moisture lab certification, and transparent INR pricing.';
const DEFAULT_IMAGE = '/og-image.png';
const SITE_URL = typeof window !== 'undefined' ? window.location.origin : 'https://agroharvest.in';

/**
 * SEOHead – Dynamic per-view meta tags for search engines, social shares, and crawlers.
 *
 * @param {string}  title        – Page-specific title (appended with site name)
 * @param {string}  description  – Meta description (155 chars recommended)
 * @param {string}  keywords     – Comma-separated keywords
 * @param {string}  canonicalPath – Canonical URL path, e.g. "/marketplace"
 * @param {string}  ogType       – Open Graph type ("website", "product", etc.)
 * @param {string}  ogImage      – Social share image URL
 * @param {object}  jsonLd       – Structured data (JSON-LD) object to inject
 * @param {boolean} noIndex      – If true, tells crawlers not to index this page
 */
export const SEOHead = ({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords = 'paddy, corn, peanuts, groundnut, agricultural marketplace, wholesale grain, Indian agri trade, farm produce, bulk order, INR pricing, AgroHarvest',
  canonicalPath = '/',
  ogType = 'website',
  ogImage = DEFAULT_IMAGE,
  jsonLd,
  noIndex = false,
}) => {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE;
  const canonicalUrl = `${SITE_URL}${canonicalPath}`;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={canonicalUrl} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={`${SITE_URL}${ogImage}`} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_IN" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${SITE_URL}${ogImage}`} />

      {/* Geo / Regional */}
      <meta name="geo.region" content="IN" />
      <meta name="geo.placename" content="India" />

      {/* Structured Data (JSON-LD) */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
};

/* ───────────────────────────────────────────────
 * Pre-built JSON-LD generators for common pages
 * ─────────────────────────────────────────────── */

/** Organization schema for the site-wide footer / about */
export const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'AgroHarvest',
  url: typeof window !== 'undefined' ? window.location.origin : 'https://agroharvest.in',
  logo: '/logo192.png',
  description:
    'Wholesale agricultural exchange connecting certified Indian grain cooperatives with mills, food processors, and international exporters.',
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+91-1800-AGRO',
    contactType: 'customer service',
    areaServed: 'IN',
    availableLanguage: ['English', 'Hindi'],
  },
  sameAs: [],
};

/** WebSite schema with sitelinks search box */
export const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'AgroHarvest',
  url: typeof window !== 'undefined' ? window.location.origin : 'https://agroharvest.in',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate:
        (typeof window !== 'undefined' ? window.location.origin : 'https://agroharvest.in') +
        '/?search={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
};

/**
 * Generate a Product JSON-LD for an individual listing.
 * @param {object} listing – A listing object from the API
 */
export const listingToProductJsonLd = (listing) => {
  if (!listing) return null;
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://agroharvest.in';
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: listing.title,
    description:
      listing.description ||
      `${listing.commodity} – ${listing.variety || 'Standard'} grade ${listing.grade}, sourced from ${listing.origin?.district || ''}, ${listing.origin?.state || 'India'}.`,
    image: listing.images?.[0] || `${siteUrl}/og-image.png`,
    brand: {
      '@type': 'Brand',
      name: listing.seller?.companyName || listing.seller?.name || 'AgroHarvest Seller',
    },
    category: listing.commodity,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'INR',
      price: listing.unitPrice,
      availability:
        listing.quantity > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: listing.seller?.companyName || listing.seller?.name || 'AgroHarvest Seller',
      },
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    },
    additionalProperty: [
      {
        '@type': 'PropertyValue',
        name: 'Moisture Percentage',
        value: `${listing.moisturePercentage}%`,
      },
      {
        '@type': 'PropertyValue',
        name: 'Quality Grade',
        value: listing.grade,
      },
      {
        '@type': 'PropertyValue',
        name: 'Origin',
        value: `${listing.origin?.district || ''}, ${listing.origin?.state || 'India'}`,
      },
    ],
  };
};

/**
 * Generate an ItemList JSON-LD for a collection of listings (marketplace page).
 * @param {Array} listings – Array of listing objects
 */
export const listingsToItemListJsonLd = (listings) => {
  if (!listings || listings.length === 0) return null;
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://agroharvest.in';
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'AgroHarvest Agricultural Commodity Listings',
    description: 'Browse wholesale Paddy, Corn, and Peanut listings from verified Indian cooperatives.',
    numberOfItems: listings.length,
    itemListElement: listings.slice(0, 20).map((listing, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Product',
        name: listing.title,
        url: `${siteUrl}/?listing=${listing._id}`,
        image: listing.images?.[0] || `${siteUrl}/og-image.png`,
        offers: {
          '@type': 'Offer',
          priceCurrency: 'INR',
          price: listing.unitPrice,
          availability:
            listing.quantity > 0
              ? 'https://schema.org/InStock'
              : 'https://schema.org/OutOfStock',
        },
      },
    })),
  };
};

/**
 * Generate a BreadcrumbList JSON-LD.
 * @param {Array<{name: string, path: string}>} items – Breadcrumb items
 */
export const breadcrumbJsonLd = (items) => {
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://agroharvest.in';
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${siteUrl}${item.path}`,
    })),
  };
};
