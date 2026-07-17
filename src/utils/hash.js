/**
 * Hashes a plain text password using SHA-256 via the native Web Crypto API.
 * @param {string} password
 * @returns {Promise<string>} The hex-encoded SHA-256 hash
 */
export async function hashPassword(password) {
  if (!password) return '';
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}
