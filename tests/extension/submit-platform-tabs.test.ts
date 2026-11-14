import { Platform } from "@yanxu/domain";
import * as waitMsModule from "../../extension/src/content/wait-ms";
import * as activateSubmitModule from "../../extension/src/sw/activate-tab-for-submit";
import * as queryModule from "../../extension/src/sw/query-platform-upload-tabs";
import * as sendSubmitModule from "../../extension/src/sw/send-submit-to-tab";
import { submitPlatformTabs } from "../../extension/src/sw/submit-platform-tabs";
import * as staggerModule from "../../extension/src/sw/wait-random-stagger-ms";

describe("submitPlatformTabs", () => {
  beforeEach(() => {
    jest
      .spyOn(staggerModule, "waitRandomStaggerMs")
      .mockResolvedValue(undefined);
    jest
      .spyOn(activateSubmitModule, "activateTabForSubmit")
      .mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("activates and clicks submit on every bilibili tab", async () => {
    jest.spyOn(queryModule, "queryPlatformUploadTabs").mockResolvedValue([
      {
        platform: Platform.Bilibili,
        tabId: 20,
        url: "https://member.bilibili.com/platform/upload/video/frame",
      },
      {
        platform: Platform.Bilibili,
        tabId: 21,
        url: "https://member.bilibili.com/platform/upload/video/frame",
      },
    ]);
    const activate = jest
      .spyOn(activateSubmitModule, "activateTabForSubmit")
      .mockResolvedValue(undefined);
    const sendSubmit = jest
      .spyOn(sendSubmitModule, "sendSubmitToTab")
      .mockResolvedValue(undefined);

    const result = await submitPlatformTabs(Platform.Bilibili);

    expect(result).toEqual({ ok: true });
    expect(activate).toHaveBeenCalledTimes(2);
    expect(activate).toHaveBeenNthCalledWith(1, 20, Platform.Bilibili);
    expect(activate).toHaveBeenNthCalledWith(2, 21, Platform.Bilibili);
    expect(sendSubmit).toHaveBeenCalledTimes(2);
    expect(sendSubmit).toHaveBeenNthCalledWith(1, 20, Platform.Bilibili);
    expect(sendSubmit).toHaveBeenNthCalledWith(2, 21, Platform.Bilibili);
  });

  it("activates and clicks submit on every douyin tab", async () => {
    jest.spyOn(queryModule, "queryPlatformUploadTabs").mockResolvedValue([
      {
        platform: Platform.Douyin,
        tabId: 10,
        url: "https://creator.douyin.com/creator-micro/content/post/video",
      },
      {
        platform: Platform.Douyin,
        tabId: 11,
        url: "https://creator.douyin.com/creator-micro/content/post/video",
      },
    ]);
    const activate = jest
      .spyOn(activateSubmitModule, "activateTabForSubmit")
      .mockResolvedValue(undefined);
    const sendSubmit = jest
      .spyOn(sendSubmitModule, "sendSubmitToTab")
      .mockResolvedValue(undefined);

    const result = await submitPlatformTabs(Platform.Douyin);

    expect(result).toEqual({ ok: true });
    expect(activate).toHaveBeenCalledTimes(2);
    expect(activate).toHaveBeenNthCalledWith(1, 10, Platform.Douyin);
    expect(activate).toHaveBeenNthCalledWith(2, 11, Platform.Douyin);
    expect(sendSubmit).toHaveBeenCalledTimes(2);
    expect(sendSubmit).toHaveBeenNthCalledWith(1, 10, Platform.Douyin);
    expect(sendSubmit).toHaveBeenNthCalledWith(2, 11, Platform.Douyin);
  });

  it("submits channels tabs in batches with interval between batches", async () => {
    jest.spyOn(queryModule, "queryPlatformUploadTabs").mockResolvedValue([
      {
        platform: Platform.Channels,
        tabId: 30,
        url: "https://channels.weixin.qq.com/platform/post/create",
      },
      {
        platform: Platform.Channels,
        tabId: 31,
        url: "https://channels.weixin.qq.com/platform/post/create",
      },
      {
        platform: Platform.Channels,
        tabId: 32,
        url: "https://channels.weixin.qq.com/platform/post/create",
      },
    ]);
    const waitMs = jest.spyOn(waitMsModule, "waitMs").mockResolvedValue(undefined);
    const sendSubmit = jest
      .spyOn(sendSubmitModule, "sendSubmitToTab")
      .mockResolvedValue(undefined);

    const result = await submitPlatformTabs(Platform.Channels, {
      channelsBatch: { batchSize: 2, batchIntervalMs: 60_000 },
    });

    expect(result).toEqual({ ok: true });
    expect(sendSubmit).toHaveBeenCalledTimes(3);
    expect(waitMs).toHaveBeenCalledTimes(1);
    expect(waitMs).toHaveBeenCalledWith(60_000);
  });

  it("returns error when no tabs exist for platform", async () => {
    jest.spyOn(queryModule, "queryPlatformUploadTabs").mockResolvedValue([]);

    const result = await submitPlatformTabs(Platform.Bilibili);

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe("no_platform_tabs");
  });
});
