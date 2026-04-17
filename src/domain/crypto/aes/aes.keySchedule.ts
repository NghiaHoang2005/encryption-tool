import { RCON, S_BOX } from "./aes.sbox";

function rotWord(word: number[]): number[] {
  return [word[1], word[2], word[3], word[0]];
}

function subWord(word: number[]): number[] {
  return word.map((b) => S_BOX[b]);
}

export interface AesRoundKeys {
  roundKeys: Uint8Array[];
  nr: number;
}

export function expandKey(key: Uint8Array): AesRoundKeys {
  const nk = key.length / 4;
  if (![4, 6, 8].includes(nk)) {
    throw new Error("AES key must be 16, 24, or 32 bytes.");
  }
  const nr = nk + 6;
  const totalWords = 4 * (nr + 1);
  const words: number[][] = new Array(totalWords);

  for (let i = 0; i < nk; i += 1) {
    words[i] = [key[i * 4], key[i * 4 + 1], key[i * 4 + 2], key[i * 4 + 3]];
  }

  for (let i = nk; i < totalWords; i += 1) {
    let temp = [...words[i - 1]];
    if (i % nk === 0) {
      temp = subWord(rotWord(temp));
      temp[0] ^= RCON[i / nk];
    } else if (nk > 6 && i % nk === 4) {
      temp = subWord(temp);
    }
    words[i] = [
      words[i - nk][0] ^ temp[0],
      words[i - nk][1] ^ temp[1],
      words[i - nk][2] ^ temp[2],
      words[i - nk][3] ^ temp[3],
    ];
  }

  const roundKeys: Uint8Array[] = [];
  for (let r = 0; r <= nr; r += 1) {
    const rk = new Uint8Array(16);
    for (let c = 0; c < 4; c += 1) {
      const word = words[r * 4 + c];
      rk[c * 4] = word[0];
      rk[c * 4 + 1] = word[1];
      rk[c * 4 + 2] = word[2];
      rk[c * 4 + 3] = word[3];
    }
    roundKeys.push(rk);
  }

  return { roundKeys, nr };
}
