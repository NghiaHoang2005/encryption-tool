# PROJECT PLAN - Encryption Tool (Manual RSA/AES/DES)

## 1) Project Goals
Build a data encryption application with these features:
- Enter plaintext or choose a local file
- Enter/select a key
- Choose an algorithm: RSA, AES, DES
- Encrypt and display the result on screen
- Allow downloading the encrypted result to a file

> Mandatory requirement: implement algorithms manually, without prebuilt encryption libraries (CryptoJS, WebCrypto, OpenSSL wrappers, etc.).

---

## 2) MVP Scope
### Input
- Text input (UTF-8)
- File input (txt, json, csv, basic binary)

### Key
- AES: 128/192/256-bit key (hex/base64/text -> normalize)
- DES: 64-bit key (including DES parity bits if fully implemented)
- RSA:
  - MVP: enter small/medium p, q + e or directly enter n, e
  - Compute n, phi, d (if p, q are provided)
  - Support block processing for long data

### Output
- Display ciphertext as Hex/Base64
- Copy output button
- Download result file button (`.enc.txt` or `.bin`)

### Non-Functional
- Do not send data to a server (local processing preferred)
- Validate input and provide clear error messages
- Keep architecture clearly separated: UI / Application / Crypto Core

---

## 3) Technology Choices (Proposed)
## Recommended Direction: Local-First Web App
- Frontend: React + TypeScript + Vite
- Styling: CSS Modules or Tailwind (for UI only, not crypto)
- State: React hooks (Redux is unnecessary for MVP)
- Testing: Vitest + Playwright (main UI E2E)
- Build/Tooling: ESLint + Prettier

### Why This Direction?
- Easy to build text/file input UI and file download with browser APIs
- No backend needed for MVP (reduces data exposure risk)
- TypeScript helps control algorithm implementation quality
- Cross-platform compatibility (Windows/macOS/Linux)

### Constraint: "No Encryption Libraries"
- Prebuilt encryption libs/SDKs are prohibited
- Only general support libraries are allowed (UI/test/build)
- Bit operations, key schedules, and round functions must be self-implemented in source code

---

## 4) Logical Architecture
- `ui`: interface components
- `application`: coordinates input/output, format, and validation
- `domain/crypto`: pure AES/DES/RSA implementations
- `infrastructure`: file reader/writer, encoder/decoder

Main flow:
1. User enters text or selects a file
2. Choose algorithm + enter key
3. Normalize data (bytes) + validate
4. Invoke the corresponding encryption engine
5. Return byte output -> encode to Hex/Base64
6. Render output + allow file download

---

## 5) Proposed Folder Structure
```txt
encryption-tool/
|- public/
|- src/
|  |- app/
|  |  |- App.tsx
|  |  |- routes.tsx
|  |  `- providers.tsx
|  |- pages/
|  |  `- EncryptPage.tsx
|  |- components/
|  |  |- InputPanel.tsx
|  |  |- KeyPanel.tsx
|  |  |- AlgorithmSelector.tsx
|  |  |- OutputPanel.tsx
|  |  `- FileActions.tsx
|  |- application/
|  |  |- encrypt.usecase.ts
|  |  |- validate.usecase.ts
|  |  `- dto.ts
|  |- domain/
|  |  `- crypto/
|  |     |- aes/
|  |     |  |- aes.core.ts
|  |     |  |- aes.keySchedule.ts
|  |     |  |- aes.sbox.ts
|  |     |  `- aes.modes.ts
|  |     |- des/
|  |     |  |- des.core.ts
|  |     |  |- des.permutation.ts
|  |     |  |- des.sbox.ts
|  |     |  `- des.keySchedule.ts
|  |     |- rsa/
|  |     |  |- rsa.core.ts
|  |     |  |- rsa.math.ts
|  |     |  `- rsa.keygen.ts
|  |     `- common/
|  |        |- bytes.ts
|  |        |- padding.ts
|  |        `- encoding.ts
|  |- infrastructure/
|  |  |- file/
|  |  |  |- readFile.ts
|  |  |  `- saveFile.ts
|  |  `- logger/
|  |- tests/
|  |  |- unit/
|  |  |  |- aes.spec.ts
|  |  |  |- des.spec.ts
|  |  |  `- rsa.spec.ts
|  |  |- vectors/
|  |  |  |- aes.vectors.json
|  |  |  |- des.vectors.json
|  |  |  `- rsa.vectors.json
|  |  `- e2e/
|  |     `- encrypt-flow.spec.ts
|  |- main.tsx
|  `- styles/
|- docs/
|  |- ALGORITHM_NOTES.md
|  `- SECURITY_LIMITATIONS.md
|- package.json
`- README.md
```

---

## 6) Phased Implementation Plan
### Phase 1 - Foundation
- Initialize React + TS + lint/test project
- Build Encrypt page layout
- Complete text/file input + output panel

### Phase 2 - Crypto Core (manual)
- AES: SubBytes, ShiftRows, MixColumns, AddRoundKey, KeyExpansion
- DES: Initial/Final Permutation, 16-round Feistel, S-boxes, key schedule
- RSA: BigInt math (gcd, modPow, modInverse), key construction, block encryption

### Phase 3 - Application Wiring
- Map UI -> use case -> crypto engine
- Normalize key/input/output formats (Hex/Base64/UTF-8)
- Consistent error handling

### Phase 4 - Test & Hardening
- Unit tests with standard test vectors
- E2E flow: text + file + output download
- Test invalid input, wrong key size, and large data

### Phase 5 - Docs & Release
- Write README usage guide
- Document security limitations (especially DES and RSA without standard padding in MVP)

---

## 7) Testing Strategy
- Compare output against standard test vectors (NIST/public vectors)
- Deterministic tests for same input/key
- Edge cases: empty string, Unicode, large files, incorrect key length
- Basic performance tests with 1MB/5MB files

---

## 8) Risks And Security Notes
- DES is weak and should be used only for learning
- "Manual" RSA is error-prone without standard padding (OAEP/PKCS#1)
- If only Encrypt MVP is delivered, clearly state that it is not production-ready
- Do not log plaintext/key to console in release builds

---

## 9) Definition Of Done
- Encrypt text + file successfully with AES/DES/RSA
- Results are displayed in correct format, and copy/download works
- Unit tests for core algorithms pass
- Documentation includes limitations and run instructions
