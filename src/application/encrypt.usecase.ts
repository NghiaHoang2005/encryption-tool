import { DataFormat, EncryptRequest, EncryptResult } from "./dto";
import { validateEncryptionInput } from "./validate.usecase";
import { decryptAes, encryptAes } from "../domain/crypto/aes/aes.modes";
import { formatByType, parseKeyText } from "../domain/crypto/common/encoding";
import { desDecryptEcb, desEncryptEcb } from "../domain/crypto/des/des.core";
import { rsaDecrypt, rsaEncrypt } from "../domain/crypto/rsa/rsa.core";

function encryptWithAes(plaintext: Uint8Array, keyText: string): Uint8Array {
  const keyBytes = parseKeyText(keyText);
  return encryptAes(plaintext, keyBytes);
}

function decryptWithAes(ciphertext: Uint8Array, keyText: string): Uint8Array {
  const keyBytes = parseKeyText(keyText);
  return decryptAes(ciphertext, keyBytes);
}

function encryptWithDes(plaintext: Uint8Array, keyText: string): Uint8Array {
  const keyBytes = parseKeyText(keyText);
  if (keyBytes.length !== 8) {
    throw new Error("DES key must be exactly 8 bytes (use hex: for precision).");
  }
  return desEncryptEcb(plaintext, keyBytes);
}

function decryptWithDes(ciphertext: Uint8Array, keyText: string): Uint8Array {
  const keyBytes = parseKeyText(keyText);
  if (keyBytes.length !== 8) {
    throw new Error("DES key must be exactly 8 bytes (use hex: for precision).");
  }
  return desDecryptEcb(ciphertext, keyBytes);
}

function encryptWithRsa(plaintext: Uint8Array, keyText: string): Uint8Array {
  const [nRaw, eRaw] = keyText.split(",").map((v) => v.trim());
  if (!nRaw || !eRaw) {
    throw new Error("RSA key format: n,e (decimal bigint).");
  }
  const n = BigInt(nRaw);
  const e = BigInt(eRaw);
  return rsaEncrypt(plaintext, { n, e });
}

function decryptWithRsa(ciphertext: Uint8Array, keyText: string): Uint8Array {
  const [nRaw, dRaw] = keyText.split(",").map((v) => v.trim());
  if (!nRaw || !dRaw) {
    throw new Error("RSA private key format: n,d (decimal bigint).");
  }
  const n = BigInt(nRaw);
  const d = BigInt(dRaw);
  return rsaDecrypt(ciphertext, { n, d });
}

export function runEncryption(request: EncryptRequest): EncryptResult {
  validateEncryptionInput(request.algorithm, request.inputBytes, request.keyText);

  let outputBytes: Uint8Array;
  if (request.mode === "encrypt") {
    if (request.algorithm === "AES") {
      outputBytes = encryptWithAes(request.inputBytes, request.keyText);
    } else if (request.algorithm === "DES") {
      outputBytes = encryptWithDes(request.inputBytes, request.keyText);
    } else {
      outputBytes = encryptWithRsa(request.inputBytes, request.keyText);
    }
  } else {
    if (request.algorithm === "AES") {
      outputBytes = decryptWithAes(request.inputBytes, request.keyText);
    } else if (request.algorithm === "DES") {
      outputBytes = decryptWithDes(request.inputBytes, request.keyText);
    } else {
      outputBytes = decryptWithRsa(request.inputBytes, request.keyText);
    }
  }

  const resolvedFormat: DataFormat =
    request.mode === "encrypt" ? request.outputFormat : "utf8";

  return {
    mode: request.mode,
    algorithm: request.algorithm,
    outputFormat: resolvedFormat,
    outputBytes,
    outputText: formatByType(outputBytes, resolvedFormat),
  };
}
