import { AlgorithmType, CryptoMode, OutputFormat } from "../application/dto";

interface Props {
  mode: CryptoMode;
  algorithm: AlgorithmType;
  keyText: string;
  outputFormat: OutputFormat;
  onKeyChange: (value: string) => void;
  onOutputFormatChange: (value: OutputFormat) => void;
}

function keyHint(algorithm: AlgorithmType, mode: CryptoMode): string {
  if (algorithm === "AES") {
    return "AES key: text or hex:001122... (16/24/32 bytes)";
  }
  if (algorithm === "DES") {
    return "DES key: 8 bytes. Recommended hex:133457799BBCDFF1";
  }
  return mode === "encrypt" ? "RSA public key: n,e (example: 3233,17)" : "RSA private key: n,d (example: 3233,2753)";
}

export function KeyPanel({
  mode,
  algorithm,
  keyText,
  outputFormat,
  onKeyChange,
  onOutputFormatChange,
}: Props) {
  return (
    <section className="panel">
      <label className="label" htmlFor="key">Key</label>
      <input
        id="key"
        className="control"
        type="text"
        value={keyText}
        onChange={(event) => onKeyChange(event.target.value)}
        placeholder={keyHint(algorithm, mode)}
      />

      {mode === "encrypt" ? (
        <>
          <label className="label" htmlFor="format">Output format</label>
          <select
            id="format"
            className="control"
            value={outputFormat}
            onChange={(event) => onOutputFormatChange(event.target.value as OutputFormat)}
          >
            <option value="hex">Hex</option>
            <option value="base64">Base64</option>
          </select>
        </>
      ) : null}
    </section>
  );
}
