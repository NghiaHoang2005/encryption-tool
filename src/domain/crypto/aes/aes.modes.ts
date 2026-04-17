import { aesDecryptEcb, aesEncryptEcb } from "./aes.core";

export function encryptAes(input: Uint8Array, key: Uint8Array): Uint8Array {
  return aesEncryptEcb(input, key);
}

export function decryptAes(input: Uint8Array, key: Uint8Array): Uint8Array {
  return aesDecryptEcb(input, key);
}
