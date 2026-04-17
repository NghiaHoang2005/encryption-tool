import { describe, expect, test } from "vitest";
import { rsaDecrypt, rsaEncrypt } from "../../domain/crypto/rsa/rsa.core";
import { fromHex, toHex } from "../../domain/crypto/common/bytes";

describe("RSA encryption", () => {
  test("encrypts single-byte message for n=3233,e=17", () => {
    const plaintext = fromHex("41");
    const cipher = rsaEncrypt(plaintext, { n: 3233n, e: 17n });
    expect(toHex(cipher)).toBe("0ae6");
  });

  test("decrypts cipher with n=3233,d=2753", () => {
    const cipher = fromHex("0ae6");
    const plain = rsaDecrypt(cipher, { n: 3233n, d: 2753n });
    expect(toHex(plain)).toBe("41");
  });
});
