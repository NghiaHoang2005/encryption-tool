import { useMemo, useState } from "react";
import { runEncryption } from "../application/encrypt.usecase";
import { AlgorithmType, CryptoMode, InputType, OutputFormat } from "../application/dto";
import { utf8ToBytes } from "../domain/crypto/common/bytes";
import { parseInputByFormat } from "../domain/crypto/common/encoding";
import { AlgorithmSelector } from "../components/AlgorithmSelector";
import { FileActions } from "../components/FileActions";
import { InputPanel } from "../components/InputPanel";
import { KeyPanel } from "../components/KeyPanel";
import { OutputPanel } from "../components/OutputPanel";
import { readFileAsBytes } from "../infrastructure/file/readFile";
import { saveBytesToFile } from "../infrastructure/file/saveFile";

export function EncryptPage() {
  const [mode, setMode] = useState<CryptoMode>("encrypt");
  const [algorithm, setAlgorithm] = useState<AlgorithmType>("AES");
  const [inputType, setInputType] = useState<InputType>("text");
  const [cipherInputFormat, setCipherInputFormat] = useState<OutputFormat>("hex");
  const [textValue, setTextValue] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [keyText, setKeyText] = useState("");
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("hex");
  const [outputText, setOutputText] = useState("");
  const [outputBytes, setOutputBytes] = useState<Uint8Array | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const subtitle = useMemo(() => {
    if (mode === "decrypt") {
      return "Text input in decrypt mode must be Hex or Base64.";
    }
    if (algorithm === "RSA") {
      return "Enter RSA public key n,e for block-based encryption.";
    }
    return "All algorithms are implemented manually, without encryption libraries.";
  }, [algorithm, mode]);

  const handleRun = async () => {
    try {
      setBusy(true);
      setError("");
      const inputBytes =
        inputType === "text"
          ? mode === "encrypt"
            ? utf8ToBytes(textValue)
            : parseInputByFormat(textValue.trim(), cipherInputFormat)
          : selectedFile
            ? await readFileAsBytes(selectedFile)
            : new Uint8Array(0);

      const result = runEncryption({
        mode,
        algorithm,
        keyText,
        inputBytes,
        outputFormat,
      });

      setOutputText(result.outputText);
      setOutputBytes(result.outputBytes);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Processing failed.");
      setOutputText("");
      setOutputBytes(null);
    } finally {
      setBusy(false);
    }
  };

  const handleCopy = async () => {
    if (!outputText) {
      return;
    }
    await navigator.clipboard.writeText(outputText);
  };

  const handleDownload = () => {
    if (!outputBytes) {
      return;
    }
    const ext = mode === "encrypt" ? (outputFormat === "hex" ? "enc.txt" : "enc.b64.txt") : "dec.bin";
    const prefix = mode === "encrypt" ? "encrypted" : "decrypted";
    saveBytesToFile(outputBytes, `${prefix}.${ext}`);
  };

  return (
    <main className="layout">
      <header className="hero">
        <p className="badge">Encryption Tool</p>
        <h1>Manual AES, DES, RSA Playground</h1>
        <p className="muted">{subtitle}</p>
      </header>

      <div className="grid">
        <section className="stack">
          <section className="panel">
            <div className="segment-row">
              <button
                type="button"
                className={mode === "encrypt" ? "segment active" : "segment"}
                onClick={() => setMode("encrypt")}
              >
                Encrypt
              </button>
              <button
                type="button"
                className={mode === "decrypt" ? "segment active" : "segment"}
                onClick={() => setMode("decrypt")}
              >
                Decrypt
              </button>
            </div>
            {mode === "decrypt" ? (
              <>
                <label className="label" htmlFor="cipher-format">Ciphertext format (text input)</label>
                <select
                  id="cipher-format"
                  className="control"
                  value={cipherInputFormat}
                  onChange={(event) => setCipherInputFormat(event.target.value as OutputFormat)}
                >
                  <option value="hex">Hex</option>
                  <option value="base64">Base64</option>
                </select>
              </>
            ) : null}
          </section>
          <AlgorithmSelector value={algorithm} onChange={setAlgorithm} />
          <InputPanel
            mode={mode}
            inputType={inputType}
            textValue={textValue}
            onInputTypeChange={setInputType}
            onTextChange={setTextValue}
            onFileChange={setSelectedFile}
          />
          <KeyPanel
            mode={mode}
            algorithm={algorithm}
            keyText={keyText}
            outputFormat={outputFormat}
            onKeyChange={setKeyText}
            onOutputFormatChange={setOutputFormat}
          />
          <FileActions
            mode={mode}
            onRun={() => {
              void handleRun();
            }}
            onCopy={() => {
              void handleCopy();
            }}
            onDownload={handleDownload}
            disabled={busy}
          />
          {error ? <p className="error">{error}</p> : null}
        </section>
        <section>
          <OutputPanel title={mode === "encrypt" ? "Ciphertext" : "Decrypted output"} value={outputText} />
        </section>
      </div>
    </main>
  );
}
