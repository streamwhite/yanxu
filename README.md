# 雁序

用于 Bilibili、抖音和视频号创作中心的半自动上传 Chromium 扩展：从本地批量任务读取视频并填充发布字段；发布前由用户检查并手动提交。

## 安装

扩展由两部分组成：

- `extension/`：浏览器扩展，负责操作投稿页面。
- `packages/native-host/`：本机 Native Messaging Host，负责读取任务 JSON、视频和封面文件。

扩展支持两种读取本地文件的方式：

- **浏览器文件模式（推荐）**：只需加载扩展，在设置页选择任务文件和素材目录。不需要本机程序。
- **路径模式**：通过本机 Native Messaging Host 读取绝对路径。未安装本机程序时会报 `native_port_closed` 或 `Specified native messaging host not found`。

### 准备

1. 浏览器文件模式：三个平台都只需要加载扩展，不需要 Node.js 或本机程序。
2. 路径模式：Linux / macOS 需要 Node.js 20 或更高版本及 pnpm；Windows 使用发布包里的独立本机程序。
3. 在 `chrome://extensions`（Edge 为 `edge://extensions`）开启开发者模式，选择“加载已解压的扩展程序”，加载扩展目录。
4. 复制扩展卡片上的扩展 ID（32 位小写字母）。
5. 按下面推荐方式或可选的本机程序方式继续。

Linux / macOS 源码安装时，安装脚本会把 Node 的绝对路径写入 `packages/native-host/.runtime/` 下的启动器，因此不依赖浏览器进程的 `PATH`。如果之后移动了仓库、切换了 Node 版本，或重新加载扩展后 ID 变了，需要重新运行一次安装命令。

### 推荐：浏览器文件模式（无需本机程序）

加载扩展后即可使用，不需要 Node.js、Native Messaging 清单、注册表或本机程序：

1. 打开扩展设置页（弹窗里的“选择文件”，或在 `chrome://extensions` 里打开“扩展程序选项”）。
2. 在“本地任务文件”中点击“选择任务文件”，选择 `job.json`。
3. 点击“选择素材目录”，选择视频和封面所在目录。
4. 重新打开弹窗，直接点击“开始”。

浏览器重启后如果权限失效，设置页会显示“恢复访问”，点一次即可。

浏览器文件模式依赖 File System Access API：Chrome、Edge 支持；Brave 默认关闭，需要在 `brave://flags` 启用 `File System Access API`。

### 可选：安装本机程序（Native Messaging）

只有在需要继续使用“绝对路径”模式时，才需要执行下面的步骤。

#### Ubuntu / Linux

一键安装（安装依赖、构建并写入清单）：

```bash
./scripts/setup-host.sh <扩展ID>
```

或者手动执行：

```bash
pnpm install
pnpm build
pnpm install:native-host -- --extension-id=<扩展ID>
```

安装脚本会自动检测并写入所有已存在的 Chromium 系浏览器配置目录：

| 浏览器              | 清单目录                                                                 |
| ------------------- | ------------------------------------------------------------------------ |
| Google Chrome       | `~/.config/google-chrome/NativeMessagingHosts/`                          |
| Chrome Beta / Dev   | `~/.config/google-chrome-beta/`、`~/.config/google-chrome-unstable/`     |
| Chromium（apt/deb） | `~/.config/chromium/NativeMessagingHosts/`                               |
| Chromium（Snap）    | `~/snap/chromium/common/chromium/NativeMessagingHosts/`                  |
| Chromium（Flatpak） | `~/.var/app/org.chromium.Chromium/config/chromium/NativeMessagingHosts/` |
| Microsoft Edge      | `~/.config/microsoft-edge/NativeMessagingHosts/`                         |
| Brave               | `~/.config/BraveSoftware/Brave-Browser/NativeMessagingHosts/`            |
| Vivaldi             | `~/.config/vivaldi/NativeMessagingHosts/`                                |

Flatpak 版 Chrome / Edge / Brave 的目录位于 `~/.var/app/<应用 ID>/config/...`，安装脚本也会自动检测。

使用自定义 `--user-data-dir`，或上面的目录没有被自动识别时，可以手动指定配置目录：

```bash
YANXU_CHROME_CONFIG_DIR="$HOME/.config/google-chrome" \
  pnpm install:native-host -- --extension-id=<扩展ID>
```

验证清单和启动器：

```bash
cat ~/.config/google-chrome/NativeMessagingHosts/com.yanxu.upload_host.json
test -x packages/native-host/.runtime/run-native-host.sh && echo launcher-ok
```

最后**完全退出浏览器**（关闭所有窗口，并确认没有后台进程），再重新打开。仅刷新扩展页面不够。

#### macOS

在“终端”中执行：

```bash
./scripts/setup-host.sh <扩展ID>
```

或手动执行：

```bash
pnpm install
pnpm build
pnpm install:native-host -- --extension-id=<扩展ID>
```

清单会写入 `~/Library/Application Support/` 下已存在的浏览器目录，例如：

- Chrome：`~/Library/Application Support/Google/Chrome/NativeMessagingHosts/`
- Chrome Beta / Dev / Canary：对应的 `Google/Chrome Beta`、`Google/Chrome Dev`、`Google/Chrome Canary`
- Chromium：`~/Library/Application Support/Chromium/NativeMessagingHosts/`
- Edge：`~/Library/Application Support/Microsoft Edge/NativeMessagingHosts/`
- Brave：`~/Library/Application Support/BraveSoftware/Brave-Browser/NativeMessagingHosts/`
- Vivaldi：`~/Library/Application Support/Vivaldi/NativeMessagingHosts/`

自定义目录同样可以用 `YANXU_CHROME_CONFIG_DIR` 指定：

```bash
YANXU_CHROME_CONFIG_DIR="$HOME/Library/Application Support/Google/Chrome" \
  pnpm install:native-host -- --extension-id=<扩展ID>
```

验证：

```bash
cat "$HOME/Library/Application Support/Google/Chrome/NativeMessagingHosts/com.yanxu.upload_host.json"
```

然后在 Chrome 菜单中“退出 Google Chrome”（`Cmd+Q`），确认活动监视器里没有残留进程后再启动。

#### Windows

Windows 使用预构建发布包 `yanxu-windows-<version>.zip`，由维护者执行 `pnpm package:windows` 生成。压缩包内包含：

- `extension/`：已构建好的扩展
- `yanxu-native-host.exe`：独立本机程序，内置运行时，不需要安装 Node.js
- `install-windows.ps1`：PowerShell 安装脚本

使用步骤：

1. 解压到任意目录。
2. 在 Chrome / Edge 打开 `chrome://extensions` 或 `edge://extensions`，开启开发者模式，选择“加载已解压的扩展程序”，加载压缩包里的 `extension` 文件夹。
3. 复制扩展 ID。
4. 在解压目录打开 PowerShell，执行：

```powershell
powershell -ExecutionPolicy Bypass -File .\install-windows.ps1 <扩展ID>
```

5. 完全退出并重新启动浏览器。

安装脚本只使用 PowerShell，不需要 Node.js、npm 或 pnpm。它会：

1. 写入清单 `%LOCALAPPDATA%\Yanxu\NativeMessagingHosts\com.yanxu.upload_host.json`；
2. 写入当前用户的注册表项：

```text
HKCU\Software\Google\Chrome\NativeMessagingHosts\com.yanxu.upload_host
HKCU\Software\Chromium\NativeMessagingHosts\com.yanxu.upload_host
HKCU\Software\Microsoft\Edge\NativeMessagingHosts\com.yanxu.upload_host
HKCU\Software\BraveSoftware\Brave-Browser\NativeMessagingHosts\com.yanxu.upload_host
HKCU\Software\Vivaldi\NativeMessagingHosts\com.yanxu.upload_host
```

验证：

```powershell
reg query "HKCU\Software\Google\Chrome\NativeMessagingHosts\com.yanxu.upload_host"
type "%LOCALAPPDATA%\Yanxu\NativeMessagingHosts\com.yanxu.upload_host.json"
```

> 不要使用 WSL 里的路径给 Windows 版浏览器安装。请在 Windows 的 PowerShell 中解压并运行脚本。

维护者构建 Windows 发布包：

```bash
pnpm package:windows
```

构建脚本会生成独立的 `yanxu-native-host.exe`，并打包出 `packages-out/yanxu-windows-<version>.zip`。在 Linux / macOS 上构建时，会自动下载相同 Node 版本的 Windows 运行时。

## 使用

### 浏览器文件模式（推荐）

在扩展设置页选择任务文件和素材目录后，弹窗里直接点击“开始”。扩展会读取 JSON、视频和封面并填充发布字段，检查各平台页面后手动提交。

视频和封面放在所选素材目录下：

- 视频：`{name}.mp4`
- 封面：`{name}.png` / `{name}.jpg` / `{name}.jpeg`
- 横向封面：`{name}-4x3.png` 等

### 路径模式（需要本机程序）

在扩展控制窗口中填写批量任务 JSON 的绝对路径，然后点击“开始”。每个条目需要有 `{name}.mp4` 视频，放在 `assetsParentFolder` 指定目录。封面可选；字段格式、平台范围及其他选项见 [`docs/API.md`](docs/API.md)。

上传之后会停留在封面位置,确认封面后可以提交.

## 故障排查：`native_port_closed`

`native_port_closed` 表示扩展已经尝试启动本机程序，但本机程序立即退出或连接被关闭。按下面顺序检查：

1. **清单是否装在当前浏览器下。** Chrome 和 Chromium、Snap Chromium、Flatpak Chromium 是不同目录；用哪个浏览器就检查哪个目录里的 `com.yanxu.upload_host.json`。
2. **扩展 ID 是否匹配。** 清单里的 `allowed_origins` 必须是当前 `chrome://extensions` 显示的 ID。重新加载解压扩展或移动扩展目录后 ID 可能变化，需重新运行安装命令。
3. **是否完成构建。** Linux/macOS 源码安装需存在 `packages/native-host/dist/main.js`；缺失时运行 `pnpm build`。Windows 发布包已内置 `yanxu-native-host.exe`，重新运行 `install-windows.ps1` 即可。
4. **启动器/可执行文件是否有效。** Linux/macOS 清单的 `path` 应指向 `.runtime/run-native-host.sh`，Windows 应指向发布包里的 `yanxu-native-host.exe`，不要直接指向 `dist/main.js`。如果切换过 Node 版本，重新运行 Linux/macOS 安装命令。
5. **手动测试本机程序。** Linux/macOS：

   ```bash
   node -e 'const m=Buffer.from(JSON.stringify({type:"ping"}));process.stdout.write(Buffer.concat([Buffer.from(Uint32Array.of(m.length).buffer),m]))' \
     | packages/native-host/.runtime/run-native-host.sh | xxd
   ```

   正常应输出包含 `{"type":"pong"}` 的二进制帧。没有任何输出或立即退出，说明启动器、Node 路径或构建有问题。

6. **查看浏览器日志（Linux）。** 从终端启动浏览器可以看到本机程序的 stderr：

   ```bash
   google-chrome --enable-logging=stderr --v=1 2>&1 | grep -i "native messaging"
   # Snap Chromium：
   snap run chromium --enable-logging=stderr --v=1 2>&1 | grep -i "native messaging"
   ```

7. **Windows 注册表。** 用上面的 `reg query` 检查默认值是否指向实际存在的 `com.yanxu.upload_host.json`。
8. **最后彻底重启浏览器。** 修改清单、启动器或扩展后，先重新加载扩展，再完全退出并重启浏览器。

## 开发与打包

```bash
pnpm dev             # 监听并构建
pnpm test            # 测试
pnpm package         # 构建并生成 Chrome / Edge 商店 zip
pnpm package:windows # 生成 Windows 发布包（含独立本机程序）
```

`pnpm package` 和 `pnpm package:windows` 输出到 `packages-out/`。

## 许可证

[Apache License 2.0](LICENSE)，版权归 Yanxu contributors 所有；分发时请一并保留 [NOTICE](NOTICE)。
