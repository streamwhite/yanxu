import { Platform } from "@auto-upload/domain";
import { listOutlineItemIndicesForPlatform } from "../../extension/src/sw/list-outline-item-indices-for-platform";

describe("listOutlineItemIndicesForPlatform", () => {
	it("returns sorted item indices per platform", () => {
		const outline = {
			items: [
				{ itemIndex: 1, targets: ["douyin", "channels"] },
				{ itemIndex: 0, targets: ["bilibili", "douyin"] },
			],
		};

		expect(listOutlineItemIndicesForPlatform(outline, Platform.Douyin)).toEqual([0, 1]);
		expect(listOutlineItemIndicesForPlatform(outline, Platform.Channels)).toEqual([1]);
	});
});
