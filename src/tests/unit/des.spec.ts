import { describe, expect, test } from "vitest";
import { desDecryptBlock, desEncryptBlock, desDecryptEcb, desEncryptEcb } from "../../domain/crypto/des/des.core";
import { fromHex, toHex } from "../../domain/crypto/common/bytes";

describe("DES block encryption", () => {
  test("matches known test vector", () => {
    const key = fromHex("133457799BBCDFF1");
    const plaintext = fromHex("0123456789ABCDEF");
    const expected = "85e813540f0ab405";

    const actual = desEncryptBlock(plaintext, key);
    expect(toHex(actual)).toBe(expected);
  });

  test("decrypt block returns original plaintext", () => {
    const key = fromHex("133457799BBCDFF1");
    const plaintext = fromHex("0123456789ABCDEF");
    const cipher = desEncryptBlock(plaintext, key);

    const actual = desDecryptBlock(cipher, key);
    expect(toHex(actual)).toBe(toHex(plaintext));
  });

  test("ECB encrypt/decrypt roundtrip", () => {
    const key = fromHex("133457799BBCDFF1");
    const plaintext = fromHex("0123456789ABCDEF112233445566");
    const cipher = desEncryptEcb(plaintext, key);
    const restored = desDecryptEcb(cipher, key);
    expect(toHex(restored)).toBe(toHex(plaintext));
  });
});
