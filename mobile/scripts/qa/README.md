# 场景验收脚本

这些文件是 Playwright CLI 接受的原始函数表达式，通过 `playwright-cli run-code --filename <文件>` 使用，不是Node入口或@playwright/test套件。格式化工具应跳过这些cjs文件，避免插入开头分号。

先启动 `npm run dev:h5`，在独立的Playwright测试浏览器会话中打开 `http://127.0.0.1:5173/`。按顺序运行 module-memory / module-training / module-daily / module-family / module-integrity。记忆场景会重置测试会话的本地Mock数据，完整性场景会删除测试资料并恢复示例；不要用于个人正在使用的会话。

文件选择使用CLI的 click → upload → snapshot 流程逐步执行。video-fixture只生成无声音的小型Canvas测试视频，不读取相册或录音。文件选择对话框出现时需使用CLI的upload处理，不能在同一个run-code回调中长时间等待该对话框。

Android场景连接官方调试基座的WebView。android-flows从活动中心开始；android-family从AI陪伴页开始；android-persistence要求已经手动在手机添加“真机测试家人 / 亲友”，并从重启后的家属首页开始。它们不会恢复或清空手机资料，答题场景会新增一条实际活动记录。原生输入通过手机手动操作验收，系统按键注入权限未开放的设备需人工测试系统返回。

实际执行结果与覆盖边界见仓库docs/06-v0.2-实现与验收.md。

UI更新另有 `ui-audit.cjs` 检查38页在三种屏幕/字号组合下的实际渲染、文字大小、对比度与按钮高度；`ui-interactions.cjs` 检查故事配图、旧图片兼容、点选时长、提示延时与H5触摸误触。后者需要已经有完整的演示家庭本地数据，可先运行上述模块场景。请始终在独立测试会话运行。当前UI结果与真机覆盖限制见 `docs/07-适老化UI改版.md`。
