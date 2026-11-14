import { Platform } from "@yanxu/domain";
import { listPlatformOutlineItems } from "../../extension/src/shared/list-platform-outline-items";

describe("listPlatformOutlineItems", () => {
	it("returns items targeting the requested platform", () => {
		expect(
			listPlatformOutlineItems(
				{
					jobVersion: 3,
					items: [
						{ itemIndex: 0, targets: ["bilibili", "channels"], name: "first" },
						{ itemIndex: 1, targets: ["douyin"], name: "second" },
						{ itemIndex: 2, targets: ["channels"], name: "third" },
					],
				},
				Platform.Bilibili,
			),
		).toEqual([{ itemIndex: 0, name: "first" }]);

		expect(
			listPlatformOutlineItems(
				{
					jobVersion: 3,
					items: [
						{ itemIndex: 0, targets: ["bilibili", "channels"], name: "first" },
						{ itemIndex: 1, targets: ["douyin"], name: "second" },
					],
				},
				Platform.Douyin,
			),
		).toEqual([{ itemIndex: 1, name: "second" }]);
	});
});
