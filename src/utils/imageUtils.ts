/**
 * Utility to reliably resolve image paths for local dev, Vite build, and Vercel hosting.
 */
export function resolveImageUrl(path?: string): string {
  if (!path) {
    return 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=600&q=80';
  }

  // If it's already a full HTTP/HTTPS URL or data URL, return as is
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }

  // Convert /src/assets/images/... to /images/... for Vite / Vercel public directory serving
  if (path.startsWith('/src/assets/images/')) {
    const filename = path.replace('/src/assets/images/', '');
    return `/images/${filename}`;
  }

  if (path.startsWith('src/assets/images/')) {
    const filename = path.replace('src/assets/images/', '');
    return `/images/${filename}`;
  }

  // If it's already /images/...
  if (path.startsWith('/images/')) {
    return path;
  }

  // Fallback default
  return path;
}
