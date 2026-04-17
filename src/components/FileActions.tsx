interface Props {
  mode: "encrypt" | "decrypt";
  onRun: () => void;
  onCopy: () => void;
  onDownload: () => void;
  disabled?: boolean;
}

export function FileActions({ mode, onRun, onCopy, onDownload, disabled = false }: Props) {
  return (
    <div className="actions">
      <button type="button" className="button primary" onClick={onRun} disabled={disabled}>
        {mode === "encrypt" ? "Encrypt" : "Decrypt"}
      </button>
      <button type="button" className="button" onClick={onCopy} disabled={disabled}>
        Copy output
      </button>
      <button type="button" className="button" onClick={onDownload} disabled={disabled}>
        Save file
      </button>
    </div>
  );
}
