# 忆伴 MemoryMate 接手入口

这是忆伴 0.3.0 Demo 的可编辑工程。克隆仓库或解压源码后，用支持项目文件和终端的 AI 编程工具打开整个目录。应用源码位于 `mobile/`。

## 立即开始

```powershell
cd mobile
npm ci
npm run check
npm run dev:h5
```

打开 `http://127.0.0.1:5173/`。第一次依赖安装需要访问npm；运行当前Demo不需要后端账号或API密钥。Node至少22，本次交接验证使用的版本记录在 `handoff/environment.json`。

## 换电脑或在线开发

任何人都可以浏览或下载[公开源码仓库](https://github.com/dh202667-netizen/memorymate)。使用 AI 编程工具时，打开克隆后的工程，或通过该工具的 GitHub 集成选择 `dh202667-netizen/memorymate`。

- **在另一台电脑开发**。安装 Git 和 Node.js 22 或更新版本。执行 `git clone https://github.com/dh202667-netizen/memorymate.git`。用编程工具打开 `memorymate` 目录，执行上面的安装和运行命令。也可以在 GitHub 点击 **Code → Download ZIP**，解压后打开工程。
- **在浏览器开发**。登录自己的 GitHub 账号，在仓库点击 **Code → Codespaces → Create codespace on main**。依赖安装完成后，在终端运行 `cd mobile && npm run dev:h5`，从 **Ports** 面板打开 `5173` 的预览。
- **交回修改**。登录自己的 GitHub 账号，在原仓库点击 **Fork**。在自己的副本新建分支、提交并推送改动，然后向原仓库的 `main` 分支提交 Pull Request。给接手的 AI 提供 `NEXT_AI_PROMPT.md` 和本次任务说明。

GitHub Actions 在主分支提交或 PR 上检查路由和类型，构建 H5 和 App 资源，每次成功运行提供用于审核的网页压缩包。正式发行沿用[现有公网 Demo](https://dh202667-netizen.github.io/memorymate/)和[已签名 APK 发布页](https://github.com/dh202667-netizen/dh202667-netizen.github.io/releases/tag/v0.3.0)，新版发布方式见[开发交接说明](docs/10-开发交接说明.md)。

## 按这个顺序阅读

1. `AGENTS.md`：用户已经明确的范围与约束。
2. `README.md`：完整运行说明、功能与当前边界。
3. `docs/10-开发交接说明.md`：架构、修改入口、发布权限、风险和下一步。
4. `NEXT_AI_PROMPT.md`：可直接复制给下一位AI的接手提示词。
5. `handoff/STATE.json`：当前版本、网址、账号相关公开标识、APK校验与验证结果。

## 两种交接包

| 包 | 内容 | 适用场景 |
| --- | --- | --- |
| Handoff-Source | 全部应用源码、锁文件、素材、配置、QA、交接说明及发布元数据 | 上传给AI，或在IDE中继续修改 |
| Handoff-Full | Source全部内容，另加独立APK和已发布网页的文件快照 | 完整留档、装机体验、网页复核 |

没有包含 `node_modules`、HBuilderX安装程序、账号凭据和签名私钥。依赖由 `npm ci` 恢复；云端发布仍需用户授权自己的账号。

包内 `PACKAGE-MANIFEST.json` 记录每个交付文件的SHA-256。Windows PowerShell可以运行 `scripts/verify-handoff.ps1` 检查解压是否完整。

网页版主地址：https://dh202667-netizen.github.io/memorymate/

原始 Vue 和 TypeScript 文件位于当前工程的 `mobile/`。正式网页的构建产物位于 [GitHub Pages 发布仓库](https://github.com/dh202667-netizen/dh202667-netizen.github.io)。
