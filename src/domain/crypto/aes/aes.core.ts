import { splitBlocks, xorBytes } from "../common/bytes";
import { pkcs7Pad, pkcs7Unpad } from "../common/padding";
import { expandKey } from "./aes.keySchedule";
import { INV_S_BOX, S_BOX } from "./aes.sbox";

function subBytes(state: Uint8Array): Uint8Array {
  const out = new Uint8Array(16);
  for (let i = 0; i < 16; i += 1) {
    out[i] = S_BOX[state[i]];
  }
  return out;
}

function shiftRows(state: Uint8Array): Uint8Array {
  const out = new Uint8Array(16);
  for (let r = 0; r < 4; r += 1) {
    for (let c = 0; c < 4; c += 1) {
      out[c * 4 + r] = state[((c + r) % 4) * 4 + r];
    }
  }
  return out;
}

function invSubBytes(state: Uint8Array): Uint8Array {
  const out = new Uint8Array(16);
  for (let i = 0; i < 16; i += 1) {
    out[i] = INV_S_BOX[state[i]];
  }
  return out;
}

function invShiftRows(state: Uint8Array): Uint8Array {
  const out = new Uint8Array(16);
  for (let r = 0; r < 4; r += 1) {
    for (let c = 0; c < 4; c += 1) {
      out[c * 4 + r] = state[((c - r + 4) % 4) * 4 + r];
    }
  }
  return out;
}

function xtime(a: number): number {
  return ((a << 1) ^ ((a & 0x80) !== 0 ? 0x1b : 0)) & 0xff;
}

function mul(a: number, b: number): number {
  let aa = a;
  let bb = b;
  let res = 0;
  while (bb > 0) {
    if (bb & 1) {
      res ^= aa;
    }
    aa = xtime(aa);
    bb >>= 1;
  }
  return res;
}

function mixColumns(state: Uint8Array): Uint8Array {
  const out = new Uint8Array(16);
  for (let c = 0; c < 4; c += 1) {
    const i = c * 4;
    const s0 = state[i];
    const s1 = state[i + 1];
    const s2 = state[i + 2];
    const s3 = state[i + 3];
    out[i] = mul(2, s0) ^ mul(3, s1) ^ s2 ^ s3;
    out[i + 1] = s0 ^ mul(2, s1) ^ mul(3, s2) ^ s3;
    out[i + 2] = s0 ^ s1 ^ mul(2, s2) ^ mul(3, s3);
    out[i + 3] = mul(3, s0) ^ s1 ^ s2 ^ mul(2, s3);
  }
  return out;
}

function invMixColumns(state: Uint8Array): Uint8Array {
  const out = new Uint8Array(16);
  for (let c = 0; c < 4; c += 1) {
    const i = c * 4;
    const s0 = state[i];
    const s1 = state[i + 1];
    const s2 = state[i + 2];
    const s3 = state[i + 3];
    out[i] = mul(14, s0) ^ mul(11, s1) ^ mul(13, s2) ^ mul(9, s3);
    out[i + 1] = mul(9, s0) ^ mul(14, s1) ^ mul(11, s2) ^ mul(13, s3);
    out[i + 2] = mul(13, s0) ^ mul(9, s1) ^ mul(14, s2) ^ mul(11, s3);
    out[i + 3] = mul(11, s0) ^ mul(13, s1) ^ mul(9, s2) ^ mul(14, s3);
  }
  return out;
}

function addRoundKey(state: Uint8Array, roundKey: Uint8Array): Uint8Array {
  return xorBytes(state, roundKey);
}

export function aesEncryptBlock(block: Uint8Array, key: Uint8Array): Uint8Array {
  if (block.length !== 16) {
    throw new Error("AES block must be 16 bytes.");
  }
  const { roundKeys, nr } = expandKey(key);
  let state = addRoundKey(block, roundKeys[0]);

  for (let r = 1; r < nr; r += 1) {
    state = subBytes(state);
    state = shiftRows(state);
    state = mixColumns(state);
    state = addRoundKey(state, roundKeys[r]);
  }

  state = subBytes(state);
  state = shiftRows(state);
  state = addRoundKey(state, roundKeys[nr]);
  return state;
}

export function aesDecryptBlock(block: Uint8Array, key: Uint8Array): Uint8Array {
  if (block.length !== 16) {
    throw new Error("AES block must be 16 bytes.");
  }
  const { roundKeys, nr } = expandKey(key);
  let state = addRoundKey(block, roundKeys[nr]);

  for (let r = nr - 1; r >= 1; r -= 1) {
    state = invShiftRows(state);
    state = invSubBytes(state);
    state = addRoundKey(state, roundKeys[r]);
    state = invMixColumns(state);
  }

  state = invShiftRows(state);
  state = invSubBytes(state);
  state = addRoundKey(state, roundKeys[0]);
  return state;
}

export function aesEncryptEcb(input: Uint8Array, key: Uint8Array): Uint8Array {
  const padded = pkcs7Pad(input, 16);
  const blocks = splitBlocks(padded, 16);
  const out = new Uint8Array(padded.length);
  for (let i = 0; i < blocks.length; i += 1) {
    out.set(aesEncryptBlock(blocks[i], key), i * 16);
  }
  return out;
}

export function aesDecryptEcb(input: Uint8Array, key: Uint8Array): Uint8Array {
  if (input.length % 16 !== 0) {
    throw new Error("AES ciphertext length must be multiple of 16 bytes.");
  }
  const blocks = splitBlocks(input, 16);
  const out = new Uint8Array(input.length);
  for (let i = 0; i < blocks.length; i += 1) {
    out.set(aesDecryptBlock(blocks[i], key), i * 16);
  }
  return pkcs7Unpad(out, 16);
}
