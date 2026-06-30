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
  return `Submitting bilibili and douyin tabs, then 视频号 in batches of ${String(channelsBatch.batchSize)} (${intervalMin} min between batches)…`;
}

export function allPlatformsSubmitSuccessLabel(
  channelsBatch: ChannelsSubmitBatchConfig,
): string {
  return `Submit clicked on bilibili, douyin, and 视频号 tabs. 视频号 runs in batches of ${String(channelsBatch.batchSize)}. Confirm any dialogs manually.`;
}
