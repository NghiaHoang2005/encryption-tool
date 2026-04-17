import { InputType } from "../application/dto";

interface Props {
  mode: "encrypt" | "decrypt";
  inputType: InputType;
  textValue: string;
  onInputTypeChange: (type: InputType) => void;
  onTextChange: (value: string) => void;
  onFileChange: (file: File | null) => void;
}

export function InputPanel({
  mode,
  inputType,
  textValue,
  onInputTypeChange,
  onTextChange,
  onFileChange,
}: Props) {
  return (
    <section className="panel">
      <div className="segment-row">
        <button
          type="button"
          className={inputType === "text" ? "segment active" : "segment"}
          onClick={() => onInputTypeChange("text")}
        >
          Plaintext
        </button>
        <button
          type="button"
          className={inputType === "file" ? "segment active" : "segment"}
          onClick={() => onInputTypeChange("file")}
        >
          File
        </button>
      </div>

      {inputType === "text" ? (
        <>
          <label className="label" htmlFor="plaintext">{mode === "encrypt" ? "Plaintext" : "Ciphertext"}</label>
          <textarea
            id="plaintext"
            className="textarea"
            rows={7}
            value={textValue}
            onChange={(event) => onTextChange(event.target.value)}
            placeholder={mode === "encrypt" ? "Enter content to encrypt" : "Enter ciphertext to decrypt"}
          />
        </>
      ) : (
        <>
          <label className="label" htmlFor="file-input">Select file</label>
          <input
            id="file-input"
            className="control"
            type="file"
            onChange={(event) => onFileChange(event.target.files?.[0] ?? null)}
          />
        </>
      )}
    </section>
  );
}
