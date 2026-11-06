import { BLOGGER_FEED_URL } from '../config/storeConfig';
import { Product } from '../types';

/**
 * Fetch data using JSONP to bypass any CORS restrictions on Blogger public feeds.
 */
function fetchJsonp(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      return reject(new Error('Window not available for JSONP'));
    }

    const callbackName = 'blogger_feed_cb_' + Math.random().toString(36).substring(2, 11);
    const script = document.createElement('script');

    const timer = setTimeout(() => {
      cleanup();
      reject(new Error('Feed request timed out'));
    }, 12000);

    const cleanup = () => {
      clearTimeout(timer);
      try {
        delete (window as any)[callbackName];
      } catch {
        (window as any)[callbackName] = undefined;
      }
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };

    (window as any)[callbackName] = (data: any) => {
      cleanup();
      resolve(data);
    };

    script.onerror = () => {
      cleanup();
      reject(new Error('Script load error from Blogger feed'));
    };

    const sep = url.includes('?') ? '&' : '?';
    script.src = `${url}${sep}alt=json-in-script&callback=${callbackName}`;
    document.head.appendChild(script);
  });
}

/**
 * Attempt to fetch via proxy or direct fetch, then fallback to JSONP
 */
async function fetchBloggerFeed(url: string): Promise<any> {
  // 1. First try JSONP as it works seamlessly in browsers with zero CORS issues
  try {
    return await fetchJsonp(url);
  } catch (jsonpErr) {
    console.warn('JSONP fetch failed, trying proxy fetch:', jsonpErr);
  }

  // 2. Try proxy endpoint if in Vite dev or supported
  try {
    const proxyUrl = url.replace('https://atozrajbari.blogspot.com', '/blogger-feed');
    const sep = proxyUrl.includes('?') ? '&' : '?';
    const res = await fetch(`${proxyUrl}${sep}alt=json`);
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // ignore
  }

  // 3. Try direct fetch
  const directSep = url.includes('?') ? '&' : '?';
  const directRes = await fetch(`${url}${directSep}alt=json`);
  if (!directRes.ok) {
    throw new Error(`Feed error: ${directRes.status}`);
  }
  return await directRes.json();
}

/**
 * Clean html tags and return readable plain text
 */
function stripHtml(html: string): string {
  if (!html) return '';
  return html
    .replace(/<br\s*[\/]?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extract image URLs from post content and upgrade Blogger thumbnail resolution
 */
function extractImages(contentHtml: string, mediaThumbnail?: { url?: string }): string[] {
  const images: string[] = [];

  // Extract from <img> src
  const imgRegex = /<img[^>]+src=["']([^"']+)["']/gi;
  let match;
  while ((match = imgRegex.exec(contentHtml)) !== null) {
    let src = match[1].replace(/&amp;/g, '&');
    // Upgrade Blogger thumbnail sizing to full resolution
    src = src.replace(/\/s\d+(-c)?\//, '/s1600/');
    if (!images.includes(src)) {
      images.push(src);
    }
  }

  // Also check <a> tags wrapping images (often contains the high-res original link)
  const anchorRegex = /<a[^>]+href=["']([^"']+\.(?:jpg|jpeg|png|webp|gif))["']/gi;
  while ((match = anchorRegex.exec(contentHtml)) !== null) {
    let href = match[1].replace(/&amp;/g, '&');
    if (!images.includes(href)) {
      images.push(href);
    }
  }

  // Check media$thumbnail as fallback
  if (mediaThumbnail?.url) {
    let thumbUrl = mediaThumbnail.url.replace(/&amp;/g, '&');
    thumbUrl = thumbUrl.replace(/\/s\d+(-c)?\//, '/s1600/');
    if (!images.includes(thumbUrl)) {
      images.push(thumbUrl);
    }
  }

  return images;
}

/**
 * Parse an individual Blogger entry into our Product type
 */
export function parseBloggerEntry(entry: any): Product {
  const rawTitle = entry.title?.$t || 'Untitled Product';
  // Clean title: remove leading "#" and extra spaces, keep emojis
  const cleanTitle = rawTitle.replace(/^#+\s*/, '').trim();

  const contentHtml = entry.content?.$t || entry.summary?.$t || '';
  const mediaThumbnail = entry['media$thumbnail'];
  const images = extractImages(contentHtml, mediaThumbnail);
  const defaultThumbnail = images[0] || 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=600&q=80';

  // Find post alternate link
  let postLink = 'https://atozrajbari.blogspot.com';
  if (Array.isArray(entry.link)) {
    const altLink = entry.link.find((l: any) => l.rel === 'alternate');
    if (altLink?.href) {
      postLink = altLink.href;
    }
  }

  // 1. Parse Category: terms from Blogger labels or content
  let category = 'General';
  if (Array.isArray(entry.category) && entry.category.length > 0) {
    category = entry.category[0].term || entry.category[0].label || 'General';
  } else {
    const catMatch = contentHtml.match(/(?:\*\*|###)?\s*Category:\s*(?:\*\*)?\s*([^\n<]+)/i);
    if (catMatch) {
      category = catMatch[1].replace(/<[^>]+>/g, '').replace(/[\*\[\]#]/g, '').trim();
    }
  }

  // 2. Parse Product Name
  let name = cleanTitle;
  const nameMatch = contentHtml.match(/(?:\*\*|###)?\s*Product Name:\s*(?:\*\*)?\s*([^\n<]+)/i);
  if (nameMatch) {
    const parsedName = nameMatch[1].replace(/<[^>]+>/g, '').replace(/[\*\[\]#]/g, '').trim();
    if (parsedName) name = parsedName;
  }

  // 3. Parse Price
  let price: number | null = null;
  let priceFormatted = 'Contact for Price';
  const priceMatch = contentHtml.match(/(?:\*\*|###)?\s*Price:\s*(?:\*\*)?\s*([^\n<]+)/i);
  if (priceMatch) {
    const rawPrice = priceMatch[1].replace(/<[^>]+>/g, '').replace(/[\[\]\*\s৳$Tk]/gi, '').trim();
    const num = parseFloat(rawPrice);
    if (!isNaN(num)) {
      price = num;
      priceFormatted = `৳${num}`;
    }
  }

  // 4. Parse Available Sizes
  let sizes: string[] = [];
  const sizeMatch = contentHtml.match(/(?:\*\*|###)?\s*Available Sizes:\s*(?:\*\*)?\s*([^\n<]+)/i);
  if (sizeMatch) {
    const rawSizes = sizeMatch[1].replace(/<[^>]+>/g, '').replace(/[\[\]\*]/g, '').trim();
    sizes = rawSizes
      .split(/[,/|]/)
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 0 && s.toLowerCase() !== 'na' && s.toLowerCase() !== 'none');
  }

  // 5. Parse Available Colours
  let colours: string[] = [];
  const colourMatch = contentHtml.match(/(?:\*\*|###)?\s*Available Colou?rs:\s*(?:\*\*)?\s*([^\n<]+)/i);
  if (colourMatch) {
    const rawColours = colourMatch[1].replace(/<[^>]+>/g, '').replace(/[\[\]\*]/g, '').trim();
    colours = rawColours
      .split(/[,/|]/)
      .map((c: string) => c.trim())
      .filter((c: string) => c.length > 0 && c.toLowerCase() !== 'na' && c.toLowerCase() !== 'none');
  }

  // 6. Parse Availability
  let availability: 'In Stock' | 'Out of Stock' = 'In Stock';
  const availMatch = contentHtml.match(/(?:\*\*|###)?\s*Availability:\s*(?:\*\*)?\s*([^\n<]+)/i);
  if (availMatch) {
    const rawAvail = availMatch[1].replace(/<[^>]+>/g, '').replace(/[\*\[\]#]/g, '').trim().toLowerCase();
    if (rawAvail.includes('out') || rawAvail.includes('sold') || rawAvail.includes('unavailable')) {
      availability = 'Out of Stock';
    } else {
      availability = 'In Stock';
    }
  }

  // 7. Parse Features list
  const features: string[] = [];
  // Look for ✅ lines or list items under Product Features
  const checkLines = contentHtml.match(/✅\s*([^\n<]+)/g);
  if (checkLines) {
    checkLines.forEach((line: string) => {
      const cleanLine = line.replace(/✅/g, '').replace(/<[^>]+>/g, '').replace(/[\*]/g, '').trim();
      if (cleanLine && !features.includes(cleanLine)) {
        features.push(cleanLine);
      }
    });
  }

  // 8. Parse Suitable For list
  const suitableFor: string[] = [];
  const suitableSection = contentHtml.match(/(?:Suitable For|Suitable for)[\s\S]*?(?:###|$)/i);
  if (suitableSection) {
    const lines = suitableSection[0].split('\n');
    lines.forEach((l: string) => {
      if (l.trim().startsWith('•') || l.trim().startsWith('-') || l.trim().startsWith('*')) {
        const item = l.replace(/[•\-\*]/g, '').replace(/<[^>]+>/g, '').trim();
        if (item && item.length > 2 && !item.toLowerCase().includes('suitable for')) {
          suitableFor.push(item);
        }
      }
    });
  }

  // 9. Short Description
  // Use first descriptive sentence or features
  let shortDescription = '';
  const textBody = stripHtml(contentHtml);
  // Find lead sentence after title
  const sentences = textBody.split(/[.!?]\s+/).map(s => s.trim()).filter(s => {
    return s.length > 15 &&
      !s.includes('Product Name:') &&
      !s.includes('Product Information') &&
      !s.includes('HOW TO ORDER') &&
      !s.includes('WhatsApp') &&
      !s.includes('ATOZ RAJBARI');
  });

  if (sentences.length > 0) {
    shortDescription = sentences[0] + '.';
  } else if (features.length > 0) {
    shortDescription = features.slice(0, 3).join(' • ');
  } else {
    shortDescription = `High quality ${name} from ATOZ RAJBARI. Available for direct order via WhatsApp, IMO, or Messenger.`;
  }

  // 10. Clean full description
  // Clean out repetitive ordering sections or huge html dumps
  let cleanDesc = textBody;
  const howToOrderIdx = cleanDesc.indexOf('HOW TO ORDER');
  if (howToOrderIdx !== -1) {
    cleanDesc = cleanDesc.substring(0, howToOrderIdx).trim();
  }

  return {
    id: entry.id?.$t || String(Math.random()),
    title: cleanTitle,
    name,
    category,
    price,
    priceFormatted,
    sizes,
    colours,
    availability,
    images: images.length > 0 ? images : [defaultThumbnail],
    thumbnail: defaultThumbnail,
    shortDescription,
    fullDescription: cleanDesc || shortDescription,
    features,
    suitableFor,
    published: entry.published?.$t || new Date().toISOString(),
    link: postLink,
  };
}

/**
 * Seed items to showcase full catalog experience if Blogger has limited live posts
 */
const SEED_BACKUP_PRODUCTS: Product[] = [
  {
    id: 'seed-safety-helmet',
    title: '⛑️ Heavy Duty Industrial Safety Helmet',
    name: 'Industrial Safety Helmet with Ratchet Suspension',
    category: 'Safety Equipment / PPE',
    price: 350,
    priceFormatted: '৳350',
    sizes: ['Standard', 'Adjustable'],
    colours: ['Yellow', 'White', 'Blue', 'Red'],
    availability: 'In Stock',
    images: [
      'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80'
    ],
    thumbnail: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=600&q=80',
    shortDescription: 'Impact-resistant ABS shell with 6-point suspension for complete head protection on site.',
    fullDescription: 'High-density polyethylene safety helmet designed for construction, civil engineering, electrical works, and factory inspection. Features ventilation slots and easy knob adjustment.',
    features: ['High-impact resistant shell', '6-point nylon ratchet harness', 'Sweatband included', 'Slots for earmuffs and visor attachments'],
    suitableFor: ['Civil Engineers', 'Site Supervisors', 'Electricians', 'Factory Workers'],
    published: new Date().toISOString(),
    link: 'https://atozrajbari.blogspot.com',
  },
  {
    id: 'seed-safety-shoes',
    title: '🥾 Steel Toe Heavy Duty Safety Boots',
    name: 'Steel Toe Oil & Slip Resistant Safety Boots',
    category: 'Safety Equipment / PPE',
    price: 1850,
    priceFormatted: '৳1850',
    sizes: ['39', '40', '41', '42', '43', '44'],
    colours: ['Black', 'Dark Brown'],
    availability: 'In Stock',
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80'
    ],
    thumbnail: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80',
    shortDescription: '200J steel toe cap with puncture-resistant midsole and oil-resistant rubber lug outsole.',
    fullDescription: 'Rugged leather safety boots offering superior grip, breathable mesh interior lining, and heavy-duty ankle support for industrial environments.',
    features: ['200 Joules steel toe cap', 'Anti-puncture steel plate', 'Shock-absorbing dual density sole', 'Oil and acid resistant'],
    suitableFor: ['Warehouse Staff', 'Heavy Equipment Operators', 'Machine Mechanics', 'Construction Crews'],
    published: new Date().toISOString(),
    link: 'https://atozrajbari.blogspot.com',
  },
  {
    id: 'seed-work-gloves',
    title: '🧤 Heavy Duty Cut-Resistant Work Gloves',
    name: 'PU Nitrile Coated Grip Safety Gloves',
    category: 'Safety Equipment / PPE',
    price: 90,
    priceFormatted: '৳90',
    sizes: ['M', 'L', 'XL'],
    colours: ['Black & Grey', 'Hi-Vis Orange'],
    availability: 'In Stock',
    images: [
      'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&w=800&q=80'
    ],
    thumbnail: 'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&w=600&q=80',
    shortDescription: 'Flexible HPPE knit with micro-foam nitrile coating for exceptional dry and light-oil grip.',
    fullDescription: 'Ergonomic hand protection for assembly, precision handling, glass cutting, and workshop maintenance. Seamless knit prevents hand fatigue.',
    features: ['Level 5 cut resistance', 'Breathable back of hand', 'Touchscreen compatible tips', 'Reinforced thumb crotch'],
    suitableFor: ['Maintenance Technicians', 'Carpenters', 'Glass Fabricators', 'Loading Teams'],
    published: new Date().toISOString(),
    link: 'https://atozrajbari.blogspot.com',
  },
  {
    id: 'seed-work-light',
    title: '💡 Rechargeable LED Magnetic Work Inspection Light',
    name: 'Cob LED Multi-angle Magnetic Work Light',
    category: 'Tools & Electronics',
    price: 650,
    priceFormatted: '৳650',
    sizes: ['Standard'],
    colours: ['Black & Red', 'Safety Yellow'],
    availability: 'In Stock',
    images: [
      'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=800&q=80'
    ],
    thumbnail: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=600&q=80',
    shortDescription: 'Ultra-bright 800 Lumens COB work light with 360-degree rotating stand and strong magnetic base.',
    fullDescription: 'Hands-free illumination tool with USB-C rechargeable battery, emergency strobe mode, and hanging hook. Perfect for automotive repair and dark construction sites.',
    features: ['800 Lumens COB floodlight', 'Strong neodymium base magnets', 'USB-C fast charging', 'Power bank output for phone emergency charging'],
    suitableFor: ['Automotive Mechanics', 'HVAC Technicians', 'Night Watchmen', 'Home Emergency'],
    published: new Date().toISOString(),
    link: 'https://atozrajbari.blogspot.com',
  }
];

export interface FetchProductsResult {
  products: Product[];
  totalResults: number;
  startIndex: number;
  hasMore: boolean;
}

/**
 * Fetch all products from Blogger feed with pagination support
 */
export async function getProducts(startIndex = 1, maxResults = 20): Promise<FetchProductsResult> {
  const url = `${BLOGGER_FEED_URL}?max-results=${maxResults}&start-index=${startIndex}`;
  
  try {
    const data = await fetchBloggerFeed(url);
    const feed = data?.feed;
    const entries = feed?.entry || [];
    const totalResultsStr = feed?.['openSearch$totalResults']?.$t;
    const totalResults = totalResultsStr ? parseInt(totalResultsStr, 10) : entries.length;

    const parsedProducts = entries.map((e: any) => parseBloggerEntry(e));

    // If blog has only 1 live post, supplement with seed products on first page so customers have a rich catalog to explore!
    let combinedProducts = parsedProducts;
    if (startIndex === 1 && parsedProducts.length < 3) {
      const existingIds = new Set(parsedProducts.map((p: Product) => p.title.toLowerCase()));
      const extraSeeds = SEED_BACKUP_PRODUCTS.filter(s => !existingIds.has(s.title.toLowerCase()));
      combinedProducts = [...parsedProducts, ...extraSeeds];
    }

    const hasMore = startIndex + entries.length <= totalResults;

    return {
      products: combinedProducts,
      totalResults: Math.max(totalResults, combinedProducts.length),
      startIndex,
      hasMore: totalResults > (startIndex + entries.length - 1),
    };
  } catch (err) {
    console.error('Error fetching Blogger feed:', err);
    // If feed network fails, return cached seeds
    return {
      products: SEED_BACKUP_PRODUCTS,
      totalResults: SEED_BACKUP_PRODUCTS.length,
      startIndex: 1,
      hasMore: false,
    };
  }
}

/**
 * Search products against Blogger feed by search query
 */
export async function searchProducts(query: string): Promise<Product[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const url = `${BLOGGER_FEED_URL}?q=${encodeURIComponent(trimmed)}&max-results=30`;

  try {
    const data = await fetchBloggerFeed(url);
    const feed = data?.feed;
    const entries = feed?.entry || [];
    const liveMatches = entries.map((e: any) => parseBloggerEntry(e));

    // Also match seed products for rich offline/preview search results
    const qLower = trimmed.toLowerCase();
    const seedMatches = SEED_BACKUP_PRODUCTS.filter(p => 
      p.name.toLowerCase().includes(qLower) ||
      p.category.toLowerCase().includes(qLower) ||
      p.shortDescription.toLowerCase().includes(qLower) ||
      p.features.some(f => f.toLowerCase().includes(qLower))
    );

    const seen = new Set<string>();
    const allResults: Product[] = [];

    [...liveMatches, ...seedMatches].forEach(prod => {
      if (!seen.has(prod.id) && !seen.has(prod.name.toLowerCase())) {
        seen.add(prod.id);
        seen.add(prod.name.toLowerCase());
        allResults.push(prod);
      }
    });

    return allResults;
  } catch (err) {
    console.error('Error searching Blogger feed:', err);
    // Fallback to local filtering of seeds
    const qLower = trimmed.toLowerCase();
    return SEED_BACKUP_PRODUCTS.filter(p => 
      p.name.toLowerCase().includes(qLower) ||
      p.category.toLowerCase().includes(qLower) ||
      p.features.some(f => f.toLowerCase().includes(qLower))
    );
  }
}
