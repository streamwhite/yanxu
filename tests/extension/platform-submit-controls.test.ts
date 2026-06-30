import { resolveChannelsSubmitBatchConfig } from "../../extension/src/shared/channels-submit-batch-config";
import {
  allPlatformsSubmitBusyLabel,
  allPlatformsSubmitSuccessLabel,
} from "../../extension/src/popup/platform-submit-controls";

describe("platform submit labels", () => {
  const channelsBatch = resolveChannelsSubmitBatchConfig({
    batchSize: 5,
    batchIntervalMin: 5,
  });

  it("describes bilibili, douyin, then batched 视频号 in busy label", () => {
    expect(allPlatformsSubmitBusyLabel(channelsBatch)).toContain("bilibili and douyin");
    expect(allPlatformsSubmitBusyLabel(channelsBatch)).toContain("batches of 5");
    expect(allPlatformsSubmitBusyLabel(channelsBatch)).toContain("5 min between batches");
  });

  it("mentions all platforms and 视频号 batch size in success label", () => {
    expect(allPlatformsSubmitSuccessLabel(channelsBatch)).toContain("bilibili, douyin, and 视频号");
    expect(allPlatformsSubmitSuccessLabel(channelsBatch)).toContain("batches of 5");
  });
});
