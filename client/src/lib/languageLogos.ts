/**
 * languageLogos.ts — Centralized dictionary for programming language logos.
 *
 * All components must import logos from this module instead of using
 * direct asset imports or hardcoded paths. Provides a type-safe getter
 * with a built-in fallback for unknown or missing slugs.
 */

import pythonLogo from '@/assets/logos/python.png';
import javascriptLogo from '@/assets/logos/javascript.png';
import cppLogo from '@/assets/logos/cpp.png';
import cLogo from '@/assets/logos/c.png';
import htmlCssLogo from '@/assets/logos/html-css.png';

/** Canonical slug → logo mapping. */
const logoMap: Record<string, string> = {
  python: pythonLogo,
  javascript: javascriptLogo,
  cpp: cppLogo,
  c: cLogo,
  'html-css': htmlCssLogo,
};

/**
 * Resolve a language slug (or common alias) to its logo URL.
 * Returns `undefined` when no logo is available so callers can render
 * a fallback (e.g. a colored div with an icon class).
 */
export function getLanguageLogo(slug: string): string | undefined {
  // Direct match
  if (logoMap[slug]) return logoMap[slug];

  // Common aliases
  const normalized = slug.toLowerCase().trim();
  if (normalized === 'c++' || normalized === 'cplusplus') return logoMap.cpp;
  if (normalized === 'js') return logoMap.javascript;
  if (normalized === 'html' || normalized === 'css') return logoMap['html-css'];
  if (normalized === 'py') return logoMap.python;

  return undefined;
}

/** All registered slugs (useful for iteration / validation). */
export const supportedLanguageSlugs = Object.keys(logoMap);
