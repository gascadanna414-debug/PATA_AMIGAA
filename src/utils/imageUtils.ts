import React from 'react';

/**
 * High-definition, permanent CDN Unsplash photos curated specifically for Pata Amiga Purificación.
 * These guaranteed fallbacks ensure images NEVER fail on Vercel, Netlify, or local dev.
 */
export const FALLBACK_IMAGES = {
  hero: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=1200&q=80',
  puppy: 'https://images.unsplash.com/photo-1591160690555-5debfba289f0?auto=format&fit=crop&w=800&q=80',
  dog: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80',
  cat: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80',
  catTabby: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&w=800&q=80',
  catBlack: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=800&q=80',
  catWhite: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=800&q=80',
  dogLabrador: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=800&q=80',
  dogGolden: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=80',
  dogNoble: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=800&q=80',
  dogPlayful: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=80',
  before: 'https://images.unsplash.com/photo-1534361960057-19889db98a1e?auto=format&fit=crop&w=800&q=80',
  after: 'https://images.unsplash.com/photo-1544568100-847a948585b9?auto=format&fit=crop&w=800&q=80',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
  volunteer: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'
};

/**
 * Direct file-to-CDN map for known assets in case local files are missing on Vercel.
 */
export const ASSET_FALLBACK_MAP: Record<string, string> = {
  'hero_banner_puppy_1788225942236.jpg': 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=1200&q=80',
  'mona_dog_1788225963408.jpg': 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=80',
  'mateo_rescue_story_1788226480262.jpg': 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80',
  'kiara_cat_rescue_1788226493062.jpg': 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80',
  'bruno_dog_rescue_1788226506971.jpg': 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=80',
  'nala_puppy_rescue_1788226520622.jpg': 'https://images.unsplash.com/photo-1591160690555-5debfba289f0?auto=format&fit=crop&w=800&q=80',
  'hades_rescue_1788225379594.jpg': 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=800&q=80',
  'chopper_rescue_1788225394304.jpg': 'https://images.unsplash.com/photo-1561037404-61cd46aa615b?auto=format&fit=crop&w=800&q=80',
  'luna_cat_1788225408084.jpg': 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&w=800&q=80',
  'onix_cat_1788225421317.jpg': 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=800&q=80',
  'simba_dog_1788225435727.jpg': 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=800&q=80',
  'maya_cat_1788225449558.jpg': 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=800&q=80',
  'rocky_labrador_1788225471339.jpg': 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=800&q=80',
  'canela_before_1787104655599.jpg': 'https://images.unsplash.com/photo-1534361960057-19889db98a1e?auto=format&fit=crop&w=800&q=80',
  'canela_after_1787104667779.jpg': 'https://images.unsplash.com/photo-1544568100-847a948585b9?auto=format&fit=crop&w=800&q=80',
  'milo_before_1787104677033.jpg': 'https://images.unsplash.com/photo-1561948955-570b270e7c36?auto=format&fit=crop&w=800&q=80',
  'milo_after_1787104685898.jpg': 'https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&w=800&q=80',
  'rocky_before_1787104697477.jpg': 'https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&w=800&q=80',
  'rocky_after_1787104708249.jpg': 'https://images.unsplash.com/photo-1558788353-f76d92427f16?auto=format&fit=crop&w=800&q=80'
};

/**
 * Utility to reliably resolve image paths for local dev, Vite build, and Vercel hosting.
 */
export function resolveImageUrl(path?: string, defaultCategory: keyof typeof FALLBACK_IMAGES = 'dog'): string {
  if (!path || path.trim() === '') {
    return FALLBACK_IMAGES[defaultCategory] || FALLBACK_IMAGES.dog;
  }

  const trimmed = path.trim();

  // If it's already a full HTTP/HTTPS URL or data URL, return as is
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:')) {
    return trimmed;
  }

  // Extract base filename if it matches any pattern
  const cleanPath = trimmed.replace(/^\/?(src\/assets\/images|images)\//, '');
  
  if (ASSET_FALLBACK_MAP[cleanPath]) {
    // If running in production or standard Vite, try local first
    return `/images/${cleanPath}`;
  }

  if (trimmed.startsWith('/src/assets/images/')) {
    const filename = trimmed.replace('/src/assets/images/', '');
    return `/images/${filename}`;
  }

  if (trimmed.startsWith('src/assets/images/')) {
    const filename = trimmed.replace('src/assets/images/', '');
    return `/images/${filename}`;
  }

  if (trimmed.startsWith('/images/')) {
    return trimmed;
  }

  if (trimmed.startsWith('images/')) {
    return `/${trimmed}`;
  }

  return trimmed;
}

/**
 * React onError handler that automatically falls back to high-res Unsplash images
 * when local files 404 on Vercel or any network error occurs.
 */
export function handleImageError(
  event: React.SyntheticEvent<HTMLImageElement, Event>,
  fallbackType: keyof typeof FALLBACK_IMAGES | string = 'dog'
) {
  const target = event.currentTarget;
  const currentSrc = target.src || '';

  // Extract filename from currentSrc to check asset map
  const match = currentSrc.match(/([a-zA-Z0-9_-]+\.(jpg|jpeg|png|webp))/i);
  if (match && match[1] && ASSET_FALLBACK_MAP[match[1]]) {
    const mappedFallback = ASSET_FALLBACK_MAP[match[1]];
    if (target.src !== mappedFallback) {
      target.src = mappedFallback;
      return;
    }
  }

  // Determine appropriate fallback URL
  let fallbackUrl = FALLBACK_IMAGES.dog;
  if (fallbackType in FALLBACK_IMAGES) {
    fallbackUrl = FALLBACK_IMAGES[fallbackType as keyof typeof FALLBACK_IMAGES];
  } else if (typeof fallbackType === 'string' && fallbackType.startsWith('http')) {
    fallbackUrl = fallbackType;
  } else if (currentSrc.toLowerCase().includes('cat') || currentSrc.toLowerCase().includes('gato')) {
    fallbackUrl = FALLBACK_IMAGES.cat;
  } else if (currentSrc.toLowerCase().includes('hero') || currentSrc.toLowerCase().includes('banner')) {
    fallbackUrl = FALLBACK_IMAGES.hero;
  } else if (currentSrc.toLowerCase().includes('before') || currentSrc.toLowerCase().includes('antes')) {
    fallbackUrl = FALLBACK_IMAGES.before;
  } else if (currentSrc.toLowerCase().includes('after') || currentSrc.toLowerCase().includes('despues')) {
    fallbackUrl = FALLBACK_IMAGES.after;
  }

  // Prevent infinite loop if fallback itself has an issue
  if (target.src !== fallbackUrl) {
    target.src = fallbackUrl;
  }
}
