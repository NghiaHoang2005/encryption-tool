export function saveBytesToFile(bytes: Uint8Array, filename: string): void {
  const normalized = new Uint8Array(bytes.length);
  normalized.set(bytes);
  const blob = new Blob([normalized], { type: "application/octet-stream" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
