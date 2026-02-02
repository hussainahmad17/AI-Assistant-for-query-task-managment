
// Utility functions for Assistant context

// Clean text for speech synthesis (remove markdown symbols)
export function cleanTextForSpeech(text: string) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`(.*?)`/g, '$1')
    .replace(/#{1,6}\s+/g, '')
    .replace(/\[(.*?)\]\((.*?)\)/g, '$1')
    .replace(/\n\n/g, '. ')
    .replace(/\n/g, ' ');
}

// Calculate reading time for text (in seconds)
export function calculateReadingTime(text: string): number {
  // Average reading speed is 200 words per minute
  const words = text.split(/\s+/).length;
  const minutesToRead = words / 200;
  return Math.ceil(minutesToRead * 60); // Convert to seconds
}

// Generate accessible IDs for elements
export function generateAccessibleId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).substring(2, 9)}`;
}

// Truncate text with ellipsis for display
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

// Format date in an accessible, human-readable format
export function formatAccessibleDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
}

// Check for high contrast mode preference
export function prefersHighContrast(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-contrast: high)').matches;
}

// Check for reduced motion preference
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
