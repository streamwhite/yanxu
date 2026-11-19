# 雁序

用于 Bilibili、抖音和视频号创作中心的半自动上传 Chromium 扩展：从本地批量任务读取视频并填充发布字段；发布前由用户检查并手动提交。

扩展直接通过浏览器读取本地任务文件和素材，不需要安装任何本机程序。

## 安装

1. 在 `chrome://extensions`（Edge 为 `edge://extensions`）开启开发者模式，选择“加载已解压的扩展程序”，加载仓库的 `extension/` 目录。
2. 打开扩展设置页：弹窗里的“选择任务与素材”，或在 `chrome://extensions` 里打开“扩展程序选项”。
3. 在“本地任务文件”中点击“选择任务文件”，选择任务 JSON。
4. 点击“选择素材目录”，选择视频和封面所在目录。

浏览器重启后如果访问权限失效，设置页会显示“恢复访问”，点一次即可。

支持 Chrome 和 Edge。Brave 默认关闭该能力，需要在 `brave://flags` 启用 `File System Access API`。

## 使用

在设置页选择任务文件和素材目录后，打开弹窗点击“开始”。扩展会读取 JSON、视频和封面并填充发布字段；检查各平台页面后手动提交。

视频和封面放在所选素材目录下：

- 视频：`{name}.mp4`
- 封面：`{name}.png` / `{name}.jpg` / `{name}.jpeg`
- 横向封面：`{name}-4x3.png` 等

上传之后会停留在封面位置,确认封面后可以提交.

字段格式、平台范围及其他选项见 [`docs/API.md`](docs/API.md)。

## 故障排查

1. **提示尚未选择任务文件。** 打开设置页，分别选择任务文件和素材目录。
2. **提示需要恢复访问。** 在设置页点击“恢复访问”。
3. **找不到视频或封面。** 确认文件名与任务 JSON 中的 `name` 一致，并且文件直接位于所选素材目录下。
4. **浏览器不支持。** Chrome / Edge 支持；Brave 需要在 `brave://flags` 启用 `File System Access API`。
5. **扩展没有更新。** 在 `chrome://extensions` 重新加载扩展。

## 开发与打包

```bash
pnpm dev       # 监听并构建
pnpm test      # 测试
pnpm package   # 构建并生成 Chrome / Edge 商店 zip
```

`pnpm package` 输出到 `packages-out/`，两个商店使用同一份扩展包。

## 许可证

[Apache License 2.0](LICENSE)，版权归 Yanxu contributors 所有；分发时请一并保留 [NOTICE](NOTICE)。
