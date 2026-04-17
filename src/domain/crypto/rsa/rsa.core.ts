import { concatBytes } from "../common/bytes";
import { bigIntToBytes, bytesToBigInt, modPow } from "./rsa.math";

export interface RsaPublicKey {
  n: bigint;
  e: bigint;
}

export interface RsaPrivateKey {
  n: bigint;
  d: bigint;
}

function chunkBytes(input: Uint8Array, chunkSize: number): Uint8Array[] {
  const chunks: Uint8Array[] = [];
  for (let i = 0; i < input.length; i += chunkSize) {
    chunks.push(input.slice(i, i + chunkSize));
  }
  return chunks;
}

export function rsaEncrypt(input: Uint8Array, key: RsaPublicKey): Uint8Array {
  if (key.n <= 0n || key.e <= 0n) {
    throw new Error("Invalid RSA public key.");
  }

  const modulusBytes = Math.ceil(key.n.toString(2).length / 8);
  const maxPlainBlock = modulusBytes - 1;
  if (maxPlainBlock <= 0) {
    throw new Error("RSA modulus is too small.");
  }

  const chunks = chunkBytes(input, maxPlainBlock);
  const encryptedChunks: Uint8Array[] = [];

  for (const chunk of chunks) {
    const m = bytesToBigInt(chunk);
    if (m >= key.n) {
      throw new Error("Plaintext block must be smaller than modulus.");
    }
    const c = modPow(m, key.e, key.n);
    encryptedChunks.push(bigIntToBytes(c, modulusBytes));
  }

  return concatBytes(...encryptedChunks);
}

export function rsaDecrypt(input: Uint8Array, key: RsaPrivateKey): Uint8Array {
  if (key.n <= 0n || key.d <= 0n) {
    throw new Error("Invalid RSA private key.");
  }
  const modulusBytes = Math.ceil(key.n.toString(2).length / 8);
  if (input.length % modulusBytes !== 0) {
    throw new Error("RSA ciphertext length must align to modulus size.");
  }

  const chunks = chunkBytes(input, modulusBytes);
  const plainChunks: Uint8Array[] = [];
  for (const chunk of chunks) {
    const c = bytesToBigInt(chunk);
    if (c >= key.n) {
      throw new Error("Ciphertext block must be smaller than modulus.");
    }
    const m = modPow(c, key.d, key.n);
    let plain = bigIntToBytes(m);
    const isLast = chunk === chunks[chunks.length - 1];
    if (!isLast) {
      const target = modulusBytes - 1;
      if (plain.length < target) {
        const padded = new Uint8Array(target);
        padded.set(plain, target - plain.length);
        plain = padded;
      }
    }
    plainChunks.push(plain);
  }
  return concatBytes(...plainChunks);
}
