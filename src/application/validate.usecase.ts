import { AlgorithmType } from "./dto";

export function validateEncryptionInput(
  algorithm: AlgorithmType,
  inputBytes: Uint8Array,
  keyText: string,
): void {
  if (inputBytes.length === 0) {
    throw new Error("Input data is empty.");
  }
  if (!keyText.trim()) {
    throw new Error("Key is required.");
  }
  if (!["AES", "DES", "RSA"].includes(algorithm)) {
    throw new Error("Unsupported algorithm.");
  }
}
