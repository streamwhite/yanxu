# 雁序

用于 Bilibili、抖音和视频号创作中心的半自动上传 Chromium 扩展：从本地批量任务读取视频并填充发布字段；发布前由用户检查并手动提交。

## 安装

下载

1. 在 `chrome://extensions` 开启开发者模式，选择“加载已解压的扩展程序”，加载仓库的 `extension/` 目录。
2. 复制扩展 ID，运行 `./scripts/setup-host.sh <扩展ID>`。
3. 完全重启浏览器。

## 使用

准备一个批量任务 JSON（可参考 [`examples/batch.job.example.json`](examples/batch.job.example.json)），在扩展控制窗口中填写其绝对路径，然后点击“开始”：扩展会自动打开上传页面、上传视频并填充字段。检查各平台页面后，再手动提交。

每个条目需要有 `{name}.mp4` 视频，放在 `assetsParentFolder` 指定目录。封面可选；字段格式、平台范围及其他选项见 [`docs/API.md`](docs/API.md)。

## 开发与打包

```bash
pnpm dev       # 监听并构建
pnpm test      # 测试
pnpm package   # 构建并生成 Chrome / Edge 商店 zip
```

`pnpm package` 输出到 `packages-out/`，两个商店使用同一份扩展包。
