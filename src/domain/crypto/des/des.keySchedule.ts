import { leftRotate, permute, PC1, PC2, SHIFTS } from "./des.permutation";

export function generateSubKeys(keyBits: number[]): number[][] {
  const key56 = permute(keyBits, PC1);
  let c = key56.slice(0, 28);
  let d = key56.slice(28);
  const keys: number[][] = [];

  for (const shift of SHIFTS) {
    c = leftRotate(c, shift);
    d = leftRotate(d, shift);
    keys.push(permute([...c, ...d], PC2));
  }

  return keys;
}
