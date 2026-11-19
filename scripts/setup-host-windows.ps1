[CmdletBinding()]
param(
  [Parameter(Mandatory = $true, Position = 0)]
  [ValidatePattern('^[a-p]{32}$')]
  [string]$ExtensionId
)

$ErrorActionPreference = 'Stop'

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$hostExe = Join-Path $scriptDir 'yanxu-native-host.exe'
if (-not (Test-Path -LiteralPath $hostExe)) {
  throw '找不到 yanxu-native-host.exe。请将本脚本与它放在同一目录。'
}

$nativeHostName = 'com.yanxu.upload_host'
$localAppData = [Environment]::GetFolderPath('LocalApplicationData')
$manifestDir = Join-Path $localAppData 'Yanxu\NativeMessagingHosts'
$manifestPath = Join-Path $manifestDir "$nativeHostName.json"
New-Item -ItemType Directory -Path $manifestDir -Force | Out-Null

$manifest = [ordered]@{
  name            = $nativeHostName
  description     = 'Yanxu multi-platform creator submission native host'
  path            = $hostExe
  type            = 'stdio'
  allowed_origins = @("chrome-extension://$ExtensionId/")
}
$json = $manifest | ConvertTo-Json -Depth 4
[System.IO.File]::WriteAllText(
  $manifestPath,
  $json,
  (New-Object System.Text.UTF8Encoding($false))
)

$registryRoots = @(
  'Software\Google\Chrome\NativeMessagingHosts',
  'Software\Chromium\NativeMessagingHosts',
  'Software\Microsoft\Edge\NativeMessagingHosts',
  'Software\BraveSoftware\Brave-Browser\NativeMessagingHosts',
  'Software\Vivaldi\NativeMessagingHosts'
)
foreach ($root in $registryRoots) {
  $key = "HKCU:\$root\$nativeHostName"
  New-Item -Path $key -Force | Out-Null
  Set-ItemProperty -Path $key -Name '(Default)' -Value $manifestPath
}

Write-Host "已安装本机程序：$hostExe"
Write-Host "已写入清单：$manifestPath"
Write-Host '请完全退出并重新启动 Chrome / Edge。'
