interface Props {
  title: string;
  value: string;
}

export function OutputPanel({ title, value }: Props) {
  return (
    <section className="panel">
      <label className="label" htmlFor="ciphertext">{title}</label>
      <textarea
        id="ciphertext"
        className="textarea mono"
        rows={8}
        value={value}
        readOnly
        placeholder="Encrypted result will appear here"
      />
    </section>
  );
}
