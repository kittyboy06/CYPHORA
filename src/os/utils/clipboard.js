/**
 * CYPHORA Workstation Clipboard Utility
 * Robust multi-tier clipboard helper supporting:
 * 1. Modern Async Clipboard API (navigator.clipboard)
 * 2. Fallback legacy execCommand('copy') for non-secure / HTTP / restricted iframe contexts
 * 3. Session & LocalStorage persistence (cyphora_last_copied_value) for guaranteed intra-OS pasting
 */

export async function copyToClipboard(text) {
  if (text === undefined || text === null) return false;
  const str = String(text);
  if (!str) return false;

  let copied = false;

  // Tier 1: Try modern navigator.clipboard API if available & secure
  if (typeof navigator !== 'undefined' && navigator?.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(str);
      copied = true;
    } catch (err) {
      console.warn('[CYPHORA Clipboard] navigator.clipboard.writeText failed, falling back:', err);
    }
  }

  // Tier 2: Fallback to textarea + document.execCommand('copy')
  if (!copied && typeof document !== 'undefined') {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = str;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.top = '0';
      textarea.style.left = '0';
      textarea.style.width = '2em';
      textarea.style.height = '2em';
      textarea.style.padding = '0';
      textarea.style.border = 'none';
      textarea.style.outline = 'none';
      textarea.style.boxShadow = 'none';
      textarea.style.background = 'transparent';
      textarea.style.opacity = '0';
      textarea.style.pointerEvents = 'none';
      textarea.style.zIndex = '-9999';

      document.body.appendChild(textarea);
      textarea.focus({ preventScroll: true });
      textarea.select();
      textarea.setSelectionRange(0, str.length);

      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      if (success) {
        copied = true;
      }
    } catch (err) {
      console.warn('[CYPHORA Clipboard] execCommand fallback failed:', err);
    }
  }

  // Tier 3: Always cache in browser storage as guaranteed intra-app fallback
  try {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('cyphora_last_copied_value', str);
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('cyphora_last_copied_value', str);
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cyphora_clipboard_updated', { detail: { text: str } }));
    }
  } catch (_) {}

  return copied || true;
}

export async function readFromClipboard() {
  // Tier 1: Try system clipboard read
  if (typeof navigator !== 'undefined' && navigator?.clipboard?.readText) {
    try {
      const text = await navigator.clipboard.readText();
      if (text) return text;
    } catch (err) {
      // Browser permission prompt denied or blocked
    }
  }

  // Tier 2: Storage cache fallback
  try {
    if (typeof sessionStorage !== 'undefined') {
      const val = sessionStorage.getItem('cyphora_last_copied_value');
      if (val) return val;
    }
    if (typeof localStorage !== 'undefined') {
      const val = localStorage.getItem('cyphora_last_copied_value');
      if (val) return val;
    }
  } catch (_) {}

  return '';
}
