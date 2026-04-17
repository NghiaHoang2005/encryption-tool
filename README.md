# Encryption Tool

A local-first web application for encrypting data with AES, DES, and RSA using manually implemented algorithms.

## Features
- Enter plaintext or choose a local file
- Select AES, DES, or RSA
- Enter a key
- Encrypt and display output in Hex/Base64
- Copy output and save the result file

## Requirements
- Node.js 18+

## Run The Project
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
```

## Test
```bash
npm run test
```

## Security Notes
- This project is intended for learning and algorithm exploration.
- DES is not secure for production use.
- RSA is currently implemented in a basic mode without OAEP/PKCS#1 padding for production scenarios.
