# VoiceReader

[中文](./README.zh-CN.md)

A free, install-free online Text-to-Speech (TTS) tool. Paste your text and start listening — VoiceReader runs entirely in your browser using the native Web Speech API, so the text never leaves your device.

**Live demo:** https://read.ft07.com

## Features

- Paste and play — no account, no install
- Runs fully in the browser; text is never sent to any server
- Switch between every voice your OS / browser exposes (English, Chinese, and more)
- Adjustable speed (0.5x – 2x) and pitch (0 – 2) in real time
- Bilingual UI (English / Chinese) — follows your system language by default
- Automatic light / dark theme — follows `prefers-color-scheme` by default
- Play, pause, resume, and stop controls

## Browser compatibility

Best experience on the latest **Edge** or **Chrome** — they ship the widest set of voices, including high-quality Chinese ones. Safari works too but offers a smaller voice catalog.

## Local development

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # outputs to dist/
npm run lint     # TypeScript type check
```

Stack: React 19 · Vite 6 · TypeScript · Tailwind CSS 4 · lucide-react.

## Deployment

Pushes to `main` are built and published to GitHub Pages by `.github/workflows/deploy.yml`. The custom domain is wired up via `public/CNAME`.

## License

[MIT](./LICENSE) © Easy Chen
