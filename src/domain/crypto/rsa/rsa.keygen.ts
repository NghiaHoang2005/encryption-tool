import { gcd, modInverse } from "./rsa.math";

export interface RsaPublicKey {
  n: bigint;
  e: bigint;
}

export interface RsaPrivateKey {
  n: bigint;
  d: bigint;
}

export interface RsaKeyPair {
  publicKey: RsaPublicKey;
  privateKey: RsaPrivateKey;
}

export function createRsaKeysFromPrimes(p: bigint, q: bigint, e: bigint): RsaKeyPair {
  if (p <= 1n || q <= 1n || e <= 1n) {
    throw new Error("RSA parameters must be greater than 1.");
  }
  const n = p * q;
  const phi = (p - 1n) * (q - 1n);
  if (gcd(e, phi) !== 1n) {
    throw new Error("e must be coprime with phi(n).");
  }
  const d = modInverse(e, phi);
  return {
    publicKey: { n, e },
    privateKey: { n, d },
  };
}
