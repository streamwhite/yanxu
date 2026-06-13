import { Platform, PLATFORM_IDS } from "@auto-upload/domain";
import { resolveBatchPlatformIds } from "../../extension/src/shared/batch-platform-scope";

describe("resolveBatchPlatformIds", () => {
	it("returns all platforms by default", () => {
		expect(resolveBatchPlatformIds(false)).toEqual(PLATFORM_IDS);
	});

	it("returns channels only when channelsOnly is true", () => {
		expect(resolveBatchPlatformIds(true)).toEqual([Platform.Channels]);
	});
});
