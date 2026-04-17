import { bytesToUtf8, fromBase64, fromHex, toBase64, toHex, utf8ToBytes } from "./bytes";

export function parseKeyText(keyText: string): Uint8Array {
  const input = keyText.trim();
  if (!input) {
    throw new Error("Key is required.");
  }

  if (input.startsWith("hex:")) {
    return fromHex(input.slice(4));
  }
  if (input.startsWith("b64:")) {
    return fromBase64(input.slice(4));
  }
  return utf8ToBytes(input);
}

export function formatOutput(bytes: Uint8Array, type: "hex" | "base64"): string {
  return type === "hex" ? toHex(bytes) : toBase64(bytes);
}

export function parseInputByFormat(input: string, type: "hex" | "base64" | "utf8"): Uint8Array {
  if (type === "hex") {
    return fromHex(input);
  }
  if (type === "base64") {
    return fromBase64(input);
  }
  return utf8ToBytes(input);
}

export function formatByType(bytes: Uint8Array, type: "hex" | "base64" | "utf8"): string {
  if (type === "hex") {
    return toHex(bytes);
  }
  if (type === "base64") {
    return toBase64(bytes);
  }
  return bytesToUtf8(bytes);
}
