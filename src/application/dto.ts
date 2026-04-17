export type AlgorithmType = "AES" | "DES" | "RSA";
export type InputType = "text" | "file";
export type OutputFormat = "hex" | "base64";
export type CryptoMode = "encrypt" | "decrypt";
export type DataFormat = "utf8" | "hex" | "base64";

export interface EncryptRequest {
  mode: CryptoMode;
  algorithm: AlgorithmType;
  keyText: string;
  inputBytes: Uint8Array;
  outputFormat: OutputFormat;
}

export interface EncryptResult {
  outputBytes: Uint8Array;
  outputText: string;
  outputFormat: DataFormat;
  algorithm: AlgorithmType;
  mode: CryptoMode;
}
