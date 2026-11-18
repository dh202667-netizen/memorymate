# MemoryMate 开发约定

先阅读 `START_HERE.md`、`README.md`、`docs/10-开发交接说明.md`，再检查实际代码。当前交付版本为0.3.0 Demo。

- 保留 uni-app、Vue 3 Composition API 和 TypeScript，不重建为其他框架。
- 当前用户仅要求完善Demo、Android APK与公网网页。保持Mock及设备本地存储；未经新需求授权，不接真实账号、数据库、云存储、模型、支付或医疗评估。
- `mobile/src/` 是应用源码。`publish/github-pages/` 和 `publish/web/dist/` 是生成的网页文件，不能代替源码；不要直接修改其编译JS来完成业务功能。
- 页面路由以 `mobile/src/config/routes.json` 为准；实体页存在后再运行 `npm run pages:generate`。不要用标题空页冒充模块。
- 页面读写经store与repository进行，Mock集中在 `mock/`。保留 `memorymate.v1.*` 存储命名空间；修改数据结构时制定迁移，避免清除用户数据。
- 沿用至少16px文字、三档字号、暖色、高对比度、48px以上操作目标与明确的按钮文案。不同故事使用相应照片，保留AI示例标识与原始上传图片来源。
- 不声称预防、治疗或逆转阿尔茨海默病；不生成医学诊断、处方或未经验证的风险评分。
- DCloud依赖锁定 `3.0.0-5020620260917001`，匹配HBuilderX 5.26。未经兼容验证不整套升级依赖。
- 常规检查：`npm run check`、`npm run build:h5`、`npm run build:app`。App构建资源不等于签名APK。QA脚本会修改测试会话数据，只用于独立测试浏览器。
- 0.3.0独立APK已完成包名、版本、签名及资源核验，未完成本轮真机安装验收；历史基座测试不能冒充该APK测试。
- 网站主要发布目标是GitHub Pages，仓库及提交见 `publish/deployment.json`。用户报告旧Sites域名在微信内被拦截，不要自行切回旧地址。
- 继续更新现有APK需保留包名与签名。账号登录与发布授权由用户控制；不得把密码、验证码、访问令牌或私钥写进项目、日志和交接包。
- 不自动发布或重新云打包来验证本地交接脚本。只有用户要求发布/打包时才执行这些外部动作。
