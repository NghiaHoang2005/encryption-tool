import { splitBlocks } from "../common/bytes";
import { zeroPad, zeroUnpad } from "../common/padding";
import { generateSubKeys } from "./des.keySchedule";
import {
  bitsToBytes,
  bytesToBits,
  E,
  FP,
  IP,
  P,
  permute,
  xorBits,
} from "./des.permutation";
import { S_BOXES } from "./des.sbox";

function sBoxTransform(bits48: number[]): number[] {
  const out: number[] = [];
  for (let box = 0; box < 8; box += 1) {
    const chunk = bits48.slice(box * 6, box * 6 + 6);
    const row = (chunk[0] << 1) | chunk[5];
    const col = (chunk[1] << 3) | (chunk[2] << 2) | (chunk[3] << 1) | chunk[4];
    const value = S_BOXES[box][row][col];
    out.push((value >> 3) & 1, (value >> 2) & 1, (value >> 1) & 1, value & 1);
  }
  return out;
}

function feistel(r: number[], key: number[]): number[] {
  const expanded = permute(r, E);
  const mixed = xorBits(expanded, key);
  const transformed = sBoxTransform(mixed);
  return permute(transformed, P);
}

export function desEncryptBlock(block: Uint8Array, keyBytes: Uint8Array): Uint8Array {
  return desCryptBlock(block, keyBytes, false);
}

export function desDecryptBlock(block: Uint8Array, keyBytes: Uint8Array): Uint8Array {
  return desCryptBlock(block, keyBytes, true);
}

function desCryptBlock(block: Uint8Array, keyBytes: Uint8Array, decrypt: boolean): Uint8Array {
  if (block.length !== 8 || keyBytes.length !== 8) {
    throw new Error("DES block and key must be 8 bytes.");
  }

  const blockBits = bytesToBits(block);
  const keyBits = bytesToBits(keyBytes);
  const subKeys = generateSubKeys(keyBits);
  const roundKeys = decrypt ? [...subKeys].reverse() : subKeys;

  const ip = permute(blockBits, IP);
  let l = ip.slice(0, 32);
  let r = ip.slice(32, 64);

  for (let round = 0; round < 16; round += 1) {
    const nextL = r;
    const nextR = xorBits(l, feistel(r, roundKeys[round]));
    l = nextL;
    r = nextR;
  }

  const preOutput = [...r, ...l];
  const finalBits = permute(preOutput, FP);
  return bitsToBytes(finalBits);
}

export function desEncryptEcb(input: Uint8Array, keyBytes: Uint8Array): Uint8Array {
  const padded = zeroPad(input, 8);
  const blocks = splitBlocks(padded, 8);
  const out = new Uint8Array(padded.length);
  for (let i = 0; i < blocks.length; i += 1) {
    out.set(desEncryptBlock(blocks[i], keyBytes), i * 8);
  }
  return out;
}

export function desDecryptEcb(input: Uint8Array, keyBytes: Uint8Array): Uint8Array {
  if (input.length % 8 !== 0) {
    throw new Error("DES ciphertext length must be multiple of 8 bytes.");
  }
  const blocks = splitBlocks(input, 8);
  const out = new Uint8Array(input.length);
  for (let i = 0; i < blocks.length; i += 1) {
    out.set(desDecryptBlock(blocks[i], keyBytes), i * 8);
  }
  return zeroUnpad(out);
}
