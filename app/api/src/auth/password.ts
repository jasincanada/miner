import { hash, verify } from '@node-rs/argon2';

// argon2id with OWASP-recommended parameters for a low-traffic
// single-user service. @node-rs/argon2 ships prebuilt musl binaries,
// so this works in the node:22-alpine production image with no
// node-gyp toolchain.
const ARGON2ID_OPTIONS = {
  memoryCost: 19456, // KiB (~19 MiB)
  timeCost: 2,
  parallelism: 1,
  outputLen: 32,
} as const;

export async function hashPassword(password: string): Promise<string> {
  return hash(password, ARGON2ID_OPTIONS);
}

export async function verifyPassword(
  passwordHash: string,
  password: string,
): Promise<boolean> {
  try {
    return await verify(passwordHash, password);
  } catch {
    // A malformed stored hash must read as "no match", never as a 500.
    return false;
  }
}
