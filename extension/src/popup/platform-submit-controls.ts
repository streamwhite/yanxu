import { MS_PER_MINUTE, type ChannelsSubmitBatchConfig } from "../shared/channels-submit-batch-config.js";

export const SUBMIT_ALL_PLATFORMS_BUTTON_ID = "submitAllPlatformsButton" as const;

function byId(elementId: string): HTMLElement | null {
  return document.getElementById(elementId);
}

export function collectSubmitAllPlatformsButton(): HTMLButtonElement | null {
  const button = byId(SUBMIT_ALL_PLATFORMS_BUTTON_ID);
  return button instanceof HTMLButtonElement ? button : null;
}

export function bindSubmitAllPlatformsButton(
  button: HTMLButtonElement,
  onSubmit: () => void,
): void {
  button.addEventListener("click", onSubmit);
}

export function allPlatformsSubmitBusyLabel(
  channelsBatch: ChannelsSubmitBatchConfig,
): string {
  const intervalMin = String(Math.round(channelsBatch.batchIntervalMs / MS_PER_MINUTE));
  return `正在提交 bilibili 和 douyin 标签页，随后按每批 ${String(channelsBatch.batchSize)} 个分批提交视频号（每批间隔 ${intervalMin} 分钟）…`;
}

export function allPlatformsSubmitSuccessLabel(
  channelsBatch: ChannelsSubmitBatchConfig,
): string {
  return `已在 bilibili、douyin 和视频号标签页点击提交。视频号按每批 ${String(channelsBatch.batchSize)} 个执行。请手动确认任何弹窗。`;
}
