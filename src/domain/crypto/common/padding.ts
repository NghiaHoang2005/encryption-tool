import { concatBytes } from "./bytes";

export function pkcs7Pad(input: Uint8Array, blockSize: number): Uint8Array {
  const missing = blockSize - (input.length % blockSize || blockSize);
  const padValue = missing === 0 ? blockSize : missing;
  const padding = new Uint8Array(padValue).fill(padValue);
  return concatBytes(input, padding);
}

export function zeroPad(input: Uint8Array, blockSize: number): Uint8Array {
  const remainder = input.length % blockSize;
  if (remainder === 0) {
    return input;
  }
  return concatBytes(input, new Uint8Array(blockSize - remainder));
}

export function pkcs7Unpad(input: Uint8Array, blockSize: number): Uint8Array {
  if (input.length === 0 || input.length % blockSize !== 0) {
    throw new Error("Invalid PKCS7 payload length.");
  }
  const padValue = input[input.length - 1];
  if (padValue < 1 || padValue > blockSize) {
    throw new Error("Invalid PKCS7 padding value.");
  }
  for (let i = input.length - padValue; i < input.length; i += 1) {
    if (input[i] !== padValue) {
      throw new Error("Invalid PKCS7 padding bytes.");
    }
  }
  return input.slice(0, input.length - padValue);
}

export function zeroUnpad(input: Uint8Array): Uint8Array {
  let end = input.length;
  while (end > 0 && input[end - 1] === 0) {
    end -= 1;
  }
  return input.slice(0, end);
}
