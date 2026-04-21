# VoiceReader 网页朗读器

[English](./README.md)

一款免费、无需下载的在线文字转语音（TTS）工具。粘贴文字即可朗读，完全运行在浏览器中，文字不会离开你的设备。

**在线体验：** https://read.ft07.com

## 特性

- 即贴即读，无需注册，无需安装
- 全程运行在浏览器本地，文字不经过任何服务器
- 支持切换系统 / 浏览器提供的所有发音人（中文、英文及更多）
- 语速（0.5x – 2x）与音调（0 – 2）实时调节
- 中英双语界面，默认跟随系统语言
- 浅色 / 深色主题默认跟随系统 `prefers-color-scheme`
- 播放、暂停、继续、停止完整控制

## 浏览器兼容

推荐最新版的 **Edge** 或 **Chrome**，发音人最丰富，中文质量最好。Safari 也可用，但可选发音人较少。

## 本地开发

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # 产物输出到 dist/
npm run lint     # TypeScript 类型检查
```

技术栈：React 19 · Vite 6 · TypeScript · Tailwind CSS 4 · lucide-react。

## 部署

推送到 `main` 分支后由 `.github/workflows/deploy.yml` 自动构建并发布到 GitHub Pages，自定义域名通过 `public/CNAME` 配置。
