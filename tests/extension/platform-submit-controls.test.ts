import { readFileSync } from "node:fs";
import { resolveChannelsSubmitBatchConfig } from "../../extension/src/shared/channels-submit-batch-config";
import {
  allPlatformsSubmitBusyLabel,
  allPlatformsSubmitSuccessLabel,
  SUBMIT_ALL_PLATFORMS_BUTTON_ID,
} from "../../extension/src/popup/platform-submit-controls";

const POPUP_HTML_PATH = "extension/popup.html";

describe("platform submit labels", () => {
  const channelsBatch = resolveChannelsSubmitBatchConfig({
    batchSize: 5,
    batchIntervalMin: 5,
  });

  it("describes bilibili, douyin, then batched 视频号 in busy label", () => {
    expect(allPlatformsSubmitBusyLabel(channelsBatch)).toContain("bilibili、douyin");
    expect(allPlatformsSubmitBusyLabel(channelsBatch)).toContain("每批 5 个");
    expect(allPlatformsSubmitBusyLabel(channelsBatch)).toContain("间隔 5 分钟");
  });

  it("mentions all platforms and 视频号 batch size in success label", () => {
    expect(allPlatformsSubmitSuccessLabel(channelsBatch)).toContain("全部平台");
    expect(allPlatformsSubmitSuccessLabel(channelsBatch)).toContain("每批 5 个");
  });
});

describe("platform submit popup markup", () => {
  const popupHtml = readFileSync(POPUP_HTML_PATH, "utf8");

  it("declares the submit-all button id used by popup bootstrap", () => {
    expect(popupHtml).toContain(`id="${SUBMIT_ALL_PLATFORMS_BUTTON_ID}"`);
    expect(popupHtml).not.toContain('id="submitBilibiliButton"');
    expect(popupHtml).not.toContain('id="reviewedBilibiliCheckbox"');
  });
});
