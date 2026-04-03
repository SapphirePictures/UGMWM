import * as kv from './kv_store.tsx';

const PASSWORD_HASH_KEY = 'admin_password_hash';
const LEGACY_PASSWORD_KEY = 'admin_password';
const SESSION_PREFIX = 'admin_session:';
const SESSION_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours
const PBKDF2_ITERATIONS = 120000;

const encoder = new TextEncoder();

const toBase64 = (bytes: Uint8Array): string => btoa(String.fromCharCode(...bytes));

const fromBase64 = (base64: string): Uint8Array => {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
};

const randomBase64Url = (byteLength: number): string => {
  const bytes = crypto.getRandomValues(new Uint8Array(byteLength));
  return toBase64(bytes).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
};

const derivePasswordHash = async (password: string, salt: Uint8Array, iterations: number): Promise<Uint8Array> => {
  const keyMaterial = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt: salt as BufferSource,
      iterations,
    },
    keyMaterial,
    256,
  );
  return new Uint8Array(bits);
};

export const hashPassword = async (password: string): Promise<string> => {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await derivePasswordHash(password, salt, PBKDF2_ITERATIONS);
  return `pbkdf2$${PBKDF2_ITERATIONS}$${toBase64(salt)}$${toBase64(hash)}`;
};

export const verifyPassword = async (password: string, storedHash: string): Promise<boolean> => {
  const [algorithm, iterationText, saltText, hashText] = storedHash.split('$');
  if (algorithm !== 'pbkdf2' || !iterationText || !saltText || !hashText) {
    return false;
  }

  const iterations = Number(iterationText);
  if (!Number.isFinite(iterations) || iterations <= 0) {
    return false;
  }

  const salt = fromBase64(saltText);
  const expected = fromBase64(hashText);
  const actual = await derivePasswordHash(password, salt, iterations);

  if (actual.length !== expected.length) {
    return false;
  }

  let mismatch = 0;
  for (let index = 0; index < actual.length; index += 1) {
    mismatch |= actual[index] ^ expected[index];
  }

  return mismatch === 0;
};

export const ensurePasswordHash = async (): Promise<string> => {
  const storedHash = await kv.get(PASSWORD_HASH_KEY);
  if (typeof storedHash === 'string' && storedHash.startsWith('pbkdf2$')) {
    return storedHash;
  }

  const legacyPassword = await kv.get(LEGACY_PASSWORD_KEY);
  const fallbackPassword = 'ugm-admin-2024';
  const plaintextPassword =
    typeof legacyPassword === 'string' && legacyPassword.trim().length > 0
      ? legacyPassword
      : fallbackPassword;

  const passwordHash = await hashPassword(plaintextPassword);
  await kv.set(PASSWORD_HASH_KEY, passwordHash);

  if (typeof legacyPassword === 'string') {
    await kv.del(LEGACY_PASSWORD_KEY);
  }

  return passwordHash;
};

const hashSessionToken = async (token: string): Promise<string> => {
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(token));
  const bytes = Array.from(new Uint8Array(digest));
  return bytes.map((byte) => byte.toString(16).padStart(2, '0')).join('');
};

export const createAdminSession = async (): Promise<{ token: string; expiresAt: string }> => {
  const token = randomBase64Url(48);
  const tokenHash = await hashSessionToken(token);
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();

  await kv.set(`${SESSION_PREFIX}${tokenHash}`, {
    expiresAt,
    createdAt: new Date().toISOString(),
  });

  return { token, expiresAt };
};

export const validateAdminSession = async (token: string | null | undefined): Promise<boolean> => {
  if (!token) {
    return false;
  }

  const tokenHash = await hashSessionToken(token);
  const session = await kv.get(`${SESSION_PREFIX}${tokenHash}`);

  if (!session || typeof session !== 'object' || !session.expiresAt) {
    return false;
  }

  const expiryTime = new Date(session.expiresAt).getTime();
  if (Number.isNaN(expiryTime) || expiryTime <= Date.now()) {
    await kv.del(`${SESSION_PREFIX}${tokenHash}`);
    return false;
  }

  return true;
};

export const deleteAdminSession = async (token: string | null | undefined): Promise<void> => {
  if (!token) {
    return;
  }

  const tokenHash = await hashSessionToken(token);
  await kv.del(`${SESSION_PREFIX}${tokenHash}`);
};
