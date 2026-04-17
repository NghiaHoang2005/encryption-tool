import { useMemo, useRef, useState } from "react";
import type { DragEvent } from "react";
import { runEncryption } from "../application/encrypt.usecase";
import { AlgorithmType, CryptoMode, InputType, OutputFormat } from "../application/dto";
import { toBase64, utf8ToBytes } from "../domain/crypto/common/bytes";
import { parseInputByFormat } from "../domain/crypto/common/encoding";
import { AlgorithmSelector } from "../components/AlgorithmSelector";
import { FileActions } from "../components/FileActions";
import { KeyPanel } from "../components/KeyPanel";
import { readFileAsBytes } from "../infrastructure/file/readFile";
import { saveTextToFile } from "../infrastructure/file/saveFile";

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
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const subtitle = useMemo(() => {
    if (mode === "decrypt") {
      return "Text input in decrypt mode must be Hex or Base64.";
    }
    if (algorithm === "RSA") {
      return "Enter RSA public key n,e for block-based encryption.";
    }
    return "Supports AES, DES, RSA encryption and decryption. Enter key and plaintext to see the result.";
  }, [algorithm, mode]);

  const handleRun = async () => {
    try {
      setBusy(true);
      setError("");
      let inputBytes =
        inputType === "text"
          ? mode === "encrypt"
            ? utf8ToBytes(textValue)
            : parseInputByFormat(textValue.trim(), cipherInputFormat)
          : selectedFile
            ? await readFileAsBytes(selectedFile)
            : new Uint8Array(0);

      if (mode === "decrypt" && inputType === "file") {
        const fileAsText = new TextDecoder().decode(inputBytes);
        inputBytes = parseInputByFormat(fileAsText, "base64");
      }

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
    const base64Content = toBase64(outputBytes);
    const ext = mode === "encrypt" ? "enc.b64.txt" : "dec.b64.txt";
    const prefix = mode === "encrypt" ? "encrypted" : "decrypted";
    saveTextToFile(base64Content, `${prefix}.${ext}`);
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleFileDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files?.[0] ?? null;
    setSelectedFile(droppedFile);
  };

  return (
    <main className="layout app-shell">
      <header className="hero hero-grid">
        <div className="hero-copy">
          <p className="badge">Encryption Tool</p>
          <h1>Manual AES, DES, RSA Playground</h1>
          <p className="muted">{subtitle}</p>
        </div>
      </header>

      <section className="workspace-grid" aria-label="Encryption workspace">
        <section className="stack controls-stack">
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
                <p className="muted" style={{ marginTop: 10 }}>
                  File input in decrypt mode is treated as Base64 and converted to binary before decrypt.
                </p>
              </>
            ) : null}
          </section>
          <div className="config-grid">
            <AlgorithmSelector value={algorithm} onChange={setAlgorithm} />
            <KeyPanel
              mode={mode}
              algorithm={algorithm}
              keyText={keyText}
              outputFormat={outputFormat}
              onKeyChange={setKeyText}
              onOutputFormatChange={setOutputFormat}
            />
          </div>
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

        <section className="preview-column">
          <section className="panel preview-panel">
            <div className="segment-row">
              <button
                type="button"
                className={inputType === "text" ? "segment active" : "segment"}
                onClick={() => setInputType("text")}
              >
                Text
              </button>
              <button
                type="button"
                className={inputType === "file" ? "segment active" : "segment"}
                onClick={() => setInputType("file")}
              >
                File
              </button>
            </div>

            {inputType === "text" ? (
              <>
                <label className="label" htmlFor="preview-plaintext">
                  {mode === "encrypt" ? "Plaintext" : "Ciphertext"}
                </label>
                <textarea
                  id="preview-plaintext"
                  className="textarea preview-textarea"
                  rows={8}
                  value={textValue}
                  onChange={(event) => setTextValue(event.target.value)}
                  placeholder={mode === "encrypt" ? "Enter content to encrypt" : "Enter ciphertext to decrypt"}
                />
              </>
            ) : (
              <div
                className="file-dropzone"
                role="button"
                tabIndex={0}
                onClick={openFilePicker}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    openFilePicker();
                  }
                }}
                onDragOver={(event) => event.preventDefault()}
                onDrop={handleFileDrop}
              >
                <input
                  ref={fileInputRef}
                  id="file-input"
                  className="file-input"
                  type="file"
                  onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
                />
                <div className="file-dropzone-icon" aria-hidden="true">⇪</div>
                <p className="file-dropzone-title">Drag & drop or click to browse</p>
                <p className="file-dropzone-subtitle">
                  {selectedFile ? selectedFile.name : "Choose a file for encryption or decryption"}
                </p>
                <p className="muted file-meta">
                  {selectedFile
                    ? `Ready to process ${selectedFile.size} bytes.`
                    : "Supports a single file. Drop it here or click anywhere in this area."}
                </p>
              </div>
            )}
          </section>
          <section className="panel preview-panel">
            <label className="label" htmlFor="preview-ciphertext">
              {mode === "encrypt" ? "Ciphertext" : "Plaintext"}
            </label>
            <textarea
              id="preview-ciphertext"
              className="textarea mono preview-textarea"
              rows={8}
              value={mode === "encrypt" ? outputText : outputText}
              readOnly
              placeholder={mode === "encrypt" ? "Ciphertext preview" : "Decrypted output preview"}
            />
          </section>
        </section>
      </section>
    </main>
  );
}
