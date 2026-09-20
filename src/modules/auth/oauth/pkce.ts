function base64UrlEncode(bytes: Uint8Array) {
  let binary = ''

  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }

  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')
}

export interface OAuthPkcePair {
  verifier: string
  challenge: string
}

export async function createOAuthPkcePair(): Promise<OAuthPkcePair> {
  if (
    typeof window === 'undefined'
    || !window.crypto?.getRandomValues
    || !window.crypto?.subtle
  ) {
    throw new Error('Secure browser cryptography is unavailable.')
  }

  const randomBytes = new Uint8Array(64)
  window.crypto.getRandomValues(randomBytes)

  const verifier = base64UrlEncode(randomBytes)
  const digest = await window.crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(verifier),
  )

  return {
    verifier,
    challenge: base64UrlEncode(new Uint8Array(digest)),
  }
}
