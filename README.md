# VoiceReader 网页朗读器

一款免费、无需下载的在线文字转语音（TTS）工具。基于浏览器原生的 Web Speech API，粘贴文字即可朗读，支持中英双语界面、多发音人切换、语速与音调调节。

**在线体验：** https://read.ft07.com

## 特性

- 即贴即读，无需注册，无需安装
- 使用浏览器本地语音引擎，文字不经过任何服务器
- 支持切换系统提供的多种发音人（中文、英文等）
- 语速（0.5x – 2x）与音调（0 – 2）实时调节
- 中英文界面一键切换
- 自动跟随系统深色 / 浅色主题
- 播放 / 暂停 / 继续 / 停止完整控制

## 浏览器兼容

推荐使用最新版的 **Edge** 或 **Chrome**，发音人最丰富、中文发音最自然。Safari 也可用，但可选发音人较少。

## 本地开发

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # 产物输出到 dist/
npm run lint     # TypeScript 类型检查
```

技术栈：React 19 + Vite 6 + TypeScript + Tailwind CSS 4 + lucide-react 图标。

## 部署

主分支推送后由 `.github/workflows/deploy.yml` 自动构建并发布到 GitHub Pages，自定义域名通过 `public/CNAME` 配置。
