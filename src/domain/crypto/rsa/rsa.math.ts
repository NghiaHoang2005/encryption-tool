export function gcd(a: bigint, b: bigint): bigint {
  let x = a < 0n ? -a : a;
  let y = b < 0n ? -b : b;
  while (y !== 0n) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x;
}

export function modPow(base: bigint, exponent: bigint, modulus: bigint): bigint {
  if (modulus <= 0n) {
    throw new Error("Modulus must be positive.");
  }
  let result = 1n;
  let b = ((base % modulus) + modulus) % modulus;
  let e = exponent;
  while (e > 0n) {
    if (e & 1n) {
      result = (result * b) % modulus;
    }
    b = (b * b) % modulus;
    e >>= 1n;
  }
  return result;
}

export function modInverse(a: bigint, m: bigint): bigint {
  let t = 0n;
  let newT = 1n;
  let r = m;
  let newR = ((a % m) + m) % m;

  while (newR !== 0n) {
    const q = r / newR;
    [t, newT] = [newT, t - q * newT];
    [r, newR] = [newR, r - q * newR];
  }

  if (r > 1n) {
    throw new Error("Value is not invertible under modulus.");
  }
  if (t < 0n) {
    t += m;
  }
  return t;
}

export function bytesToBigInt(bytes: Uint8Array): bigint {
  let value = 0n;
  for (const byte of bytes) {
    value = (value << 8n) | BigInt(byte);
  }
  return value;
}

export function bigIntToBytes(value: bigint, minLength = 1): Uint8Array {
  if (value < 0n) {
    throw new Error("Cannot encode negative bigint to bytes.");
  }
  let v = value;
  const bytes: number[] = [];
  while (v > 0n) {
    bytes.unshift(Number(v & 0xffn));
    v >>= 8n;
  }
  if (bytes.length === 0) {
    bytes.push(0);
  }
  while (bytes.length < minLength) {
    bytes.unshift(0);
  }
  return new Uint8Array(bytes);
}
