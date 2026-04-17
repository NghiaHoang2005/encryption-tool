import { AlgorithmType } from "../application/dto";

interface Props {
  value: AlgorithmType;
  onChange: (next: AlgorithmType) => void;
}

export function AlgorithmSelector({ value, onChange }: Props) {
  return (
    <div className="panel">
      <label className="label" htmlFor="algorithm">Algorithm</label>
      <select
        id="algorithm"
        className="control"
        value={value}
        onChange={(event) => onChange(event.target.value as AlgorithmType)}
      >
        <option value="AES">AES (manual)</option>
        <option value="DES">DES (manual)</option>
        <option value="RSA">RSA (manual)</option>
      </select>
    </div>
  );
}
