# 本次交接验证

本次在与原项目分离的交接副本中，未复制node_modules或本地环境文件，实际运行了以下操作：

- npm ci --no-audit --no-fund：通过，重新安装489个锁定依赖。
- npm run check：通过，38页路由与TypeScript检查通过。
- npm run build:h5：通过。
- node scripts/prepare-web.mjs：通过，只生成本地部署副本。
- npm run prepare:github：通过，只生成本地GitHub Pages副本，没有推送或发布。
- npm run build:app：通过，产物是App资源，不是新的APK。
- Android打包脚本Check模式与PowerShell语法检查：通过，没有提交云打包。

最终应用输入与验证副本逐文件匹配：174 个文件。重新构建的H5与冻结的已发布网页快照逐文件匹配：129 个文件。

每个压缩包另有PACKAGE-MANIFEST.json，记录包内各文件SHA-256，解压后可执行scripts/verify-handoff.ps1。

npm安装提示vue-i18n 9的维护弃用信息，构建仍通过；此交接没有擅自升级依赖，后续应结合DCloud版本验证整体兼容。

历史114项UI检查、33组业务场景、4组UI交互及4项线上注册结果仅作为历史证据，本轮没有重跑全部浏览器场景。0.3.0独立APK的构建、签名与资源已核验，但尚未完成这份APK真机安装验收。账号凭据、签名私钥及用户设备本地数据不在交接包内。
