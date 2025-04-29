import { Platform } from 'react-native';

// Custom HTML entity map for encoding
const htmlEntities: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;'
};

// Regex patterns for sanitization
const UNSAFE_CHARS = /[&<>"'`=\/]/g;
const SCRIPT_TAGS = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
const EVENT_HANDLERS = /\bon\w+\s*=/gi;
const DATA_ATTRS = /\bdata-\w+\s*=/gi;
const UNSAFE_PROTOCOLS = /^(?!https?:).+:/i;

// Sanitize HTML content
export function sanitizeHTML(content: string): string {
  if (typeof content !== 'string') return '';
  
  return content
    .replace(SCRIPT_TAGS, '') // Remove script tags
    .replace(EVENT_HANDLERS, '') // Remove event handlers
    .replace(DATA_ATTRS, '') // Remove data attributes
    .replace(UNSAFE_CHARS, char => htmlEntities[char] || char); // Encode special characters
}

// Encode special characters to prevent XSS
export function encodeHTML(str: string): string {
  if (typeof str !== 'string') return '';
  return str.replace(UNSAFE_CHARS, char => htmlEntities[char] || char);
}

// Sanitize user input for safe display
export function sanitizeUserInput(input: string): string {
  if (typeof input !== 'string') return '';
  
  // First remove any HTML content
  const noHTML = sanitizeHTML(input);
  
  // Then encode special characters
  return encodeHTML(noHTML)
    .trim() // Remove leading/trailing whitespace
    .replace(/\s+/g, ' '); // Normalize whitespace
}

// Validate and sanitize URLs
export function sanitizeURL(url: string): string {
  try {
    const parsed = new URL(url);
    
    // Only allow specific protocols
    if (UNSAFE_PROTOCOLS.test(parsed.protocol)) {
      throw new Error('Invalid protocol');
    }

    // Validate hostname
    if (!parsed.hostname) {
      throw new Error('Invalid hostname');
    }

    // Remove fragments
    parsed.hash = '';

    // Remove any potential dangerous characters
    return encodeHTML(parsed.toString());
  } catch {
    return '';
  }
}

// Content Security Policy for web platform
export const CSP_POLICY = {
  'default-src': ["'self'"],
  'script-src': ["'self'"],
  'style-src': ["'self'", "'unsafe-inline'"],
  'img-src': [
    "'self'",
    'data:',
    'https:',
    'https://*.unsplash.com',
    'https://api.edamam.com',
  ],
  'connect-src': [
    "'self'",
    'https://api.edamam.com',
    'https://api.api-ninjas.com',
    'https://api.openai.com',
    process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    process.env.EXPO_PUBLIC_FIREBASE_FUNCTIONS_URL,
  ],
};