# 忆伴 Demo 发布与 Android 打包记录

2026年11月17日，版本0.3.0。技术栈保持 uni-app、Vue 3、TypeScript；所有家庭资料与演示注册仍保存在设备本地，没有建立云端用户数据库、真实认证服务或大模型调用。

## 当前公网地址

**https://dh202667-netizen.github.io/memorymate/**

- 使用当前已登录的GitHub账号创建了新的用户站点仓库，仅上传H5构建产物与虚构示例素材，没有覆盖已有项目。
- GitHub Pages构建状态为built，HTTPS启用，公开地址返回HTTP 200。
- 用户已在微信内实际打开并确认可正常访问。
- 公开仓库：`https://github.com/dh202667-netizen/dh202667-netizen.github.io`。
- 部署副本位于 `publish/github-pages/`，其中根目录与 `/memorymate/` 提供相同Demo，静态资源统一从根路径加载。

先前创建的Sites地址为 `https://memorymate.dh2026-6-792150.chatgpt.site`，用户报告微信内拦截。它不再作为主要对外地址，也不应将其第1版页面当成新的注册入口版本。

## Demo注册

启动页新增“注册体验家庭”按钮，连接38页结构中已有的注册页面。填写长辈姓名与家庭名称，提交后选择长辈或家属模式。空姓名有温和校验，成功后刷新页面仍保留本地资料。

注册流程不收集密码或手机号，不创建真实用户账号，不进行跨设备同步。更换浏览器、网站域名或安装APK时，本地数据分别保存，不会自动迁移。

## Android安装包

- 已使用HBuilderX官方项目创建流程取得当前账号下的 AppID：`__UNI__5CEFF0E`，写入原工程 `mobile/src/manifest.json`；未替换原uni-app项目。
- App版本为0.3.0，versionCode为300，预定包名为 `com.memorymate.demo`。
- 已生成48、72、96、144、192、512、1024像素图标，配置原生打包资源路径 `mobile/resources/android/`。
- 用户已完成DCloud开发者账号手机号绑定。安心打包在本地生成阶段失败，改用官方常规云打包与云端证书，已生成独立APK。
- 安装包：`releases/MemoryMate-v0.3.0-android.apk`，24,680,643字节，约24.7MB。
- 下载地址：`https://app.liuyingyong.cn/build/download/ee016780-e27c-11f1-baf7-d3381d339147`。
- 实际包名 `com.memorymate.demo`，版本0.3.0，versionCode 300，应用名“忆伴 MemoryMate”，架构arm64-v8a，minSdk 21，targetSdk 28。
- 已补入 Camera 模块，支持Demo使用的相册选择功能；没有加入真实录音或扫码功能。
- 官方apksigner验证通过，v1与v2签名有效。SHA-256：`d218546788e7059751d5db44c29c93f568c4706397724e4f7ff0fa7bd1547dc0`。
- 验证摘要在 `releases/MemoryMate-v0.3.0-verification.json`；本轮ADB未检测到设备，因此未进行这份APK的实际安装和真机交互验收。

该APK由DCloud为忆伴工程独立打包，未将官方调试基座重新命名。开发者平台的手机号验证不改变忆伴的设备本地数据模式。它是内部体验Demo，尚未进行应用商店发行配置或上架验收。

## 可重复构建

在 `mobile` 中执行：

```powershell
npm run check
npm run release:web
```

第二条会构建正式H5文件，并同步到 `publish/web/dist`，可用于其他静态网站托管。GitHub当前副本使用同一批正式构建文件。生成图标使用 `scripts/generate-app-icons.ps1`，同时输出浏览器静态图标与原生资源。

注册验收脚本为 `mobile/scripts/qa/release-register.cjs`，通过独立Playwright浏览器会话执行，测试资料不会上传为云端账号。原始结果在本机 `output/release/`。
