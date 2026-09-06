import { Platform, PLATFORM_IDS } from "@auto-upload/domain";
import {
	BATCH_PLATFORM_SCOPE_ALL,
	isSinglePlatformScope,
	parseBatchPlatformScope,
	resolveBatchPlatformIds,
} from "../../extension/src/shared/batch-platform-scope";

describe("resolveBatchPlatformIds", () => {
	it("returns all platforms for all scope", () => {
		expect(resolveBatchPlatformIds(BATCH_PLATFORM_SCOPE_ALL)).toEqual(PLATFORM_IDS);
	});

	it("returns one platform for single-platform scopes", () => {
		expect(resolveBatchPlatformIds(Platform.Bilibili)).toEqual([Platform.Bilibili]);
		expect(resolveBatchPlatformIds(Platform.Douyin)).toEqual([Platform.Douyin]);
		expect(resolveBatchPlatformIds(Platform.Channels)).toEqual([Platform.Channels]);
	});
});

describe("parseBatchPlatformScope", () => {
	it("parses known scope values", () => {
		expect(parseBatchPlatformScope(BATCH_PLATFORM_SCOPE_ALL)).toBe(BATCH_PLATFORM_SCOPE_ALL);
		expect(parseBatchPlatformScope(Platform.Bilibili)).toBe(Platform.Bilibili);
	});

	it("falls back to all for unknown values", () => {
		expect(parseBatchPlatformScope("unknown")).toBe(BATCH_PLATFORM_SCOPE_ALL);
	});
});

describe("isSinglePlatformScope", () => {
	it("detects single-platform scopes", () => {
		expect(isSinglePlatformScope(Platform.Douyin)).toBe(true);
		expect(isSinglePlatformScope(BATCH_PLATFORM_SCOPE_ALL)).toBe(false);
	});
});
