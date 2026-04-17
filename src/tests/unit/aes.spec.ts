import { describe, expect, test } from "vitest";
import { aesDecryptBlock, aesEncryptBlock, aesEncryptEcb, aesDecryptEcb } from "../../domain/crypto/aes/aes.core";
import { fromHex, toHex } from "../../domain/crypto/common/bytes";

describe("AES-128 block encryption", () => {
  test("matches known test vector", () => {
    const key = fromHex("000102030405060708090a0b0c0d0e0f");
    const plaintext = fromHex("00112233445566778899aabbccddeeff");
    const expected = "69c4e0d86a7b0430d8cdb78070b4c55a";

    const actual = aesEncryptBlock(plaintext, key);
    expect(toHex(actual)).toBe(expected);
  });

  test("decrypt block returns original plaintext", () => {
    const key = fromHex("000102030405060708090a0b0c0d0e0f");
    const plaintext = fromHex("00112233445566778899aabbccddeeff");
    const cipher = aesEncryptBlock(plaintext, key);

    const actual = aesDecryptBlock(cipher, key);
    expect(toHex(actual)).toBe(toHex(plaintext));
  });

  test("ECB encrypt/decrypt roundtrip", () => {
    const key = fromHex("000102030405060708090a0b0c0d0e0f");
    const plaintext = fromHex("00112233445566778899aabbccddeeff1122334455667788");
    const cipher = aesEncryptEcb(plaintext, key);
    const restored = aesDecryptEcb(cipher, key);
    expect(toHex(restored)).toBe(toHex(plaintext));
  });
});
