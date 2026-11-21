import { MS_PER_SECOND, type ChannelsSubmitBatchConfig } from "../shared/channels-submit-batch-config.js";

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
  const intervalSeconds = String(Math.round(channelsBatch.batchIntervalMs / MS_PER_SECOND));
  return `正在提交 bilibili、douyin；视频号每批 ${String(channelsBatch.batchSize)} 个，间隔 ${intervalSeconds} 秒…`;
}

export function allPlatformsSubmitSuccessLabel(
  channelsBatch: ChannelsSubmitBatchConfig,
): string {
  return `已提交全部平台（视频号每批 ${String(channelsBatch.batchSize)} 个），请确认弹窗。`;
}
