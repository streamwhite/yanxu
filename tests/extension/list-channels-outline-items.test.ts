import { listChannelsOutlineItems } from "../../extension/src/shared/list-channels-outline-items";

describe("listChannelsOutlineItems", () => {
	it("returns channels items with names", () => {
		expect(
			listChannelsOutlineItems({
				jobVersion: 3,
				items: [
					{ itemIndex: 0, targets: ["bilibili", "channels"], name: "first" },
					{ itemIndex: 1, targets: ["douyin"], name: "second" },
					{ itemIndex: 2, targets: ["channels"], name: "third" },
				],
			}),
		).toEqual([
			{ itemIndex: 0, name: "first" },
			{ itemIndex: 2, name: "third" },
		]);
	});

	it("falls back when name is missing", () => {
		expect(
			listChannelsOutlineItems({
				jobVersion: 3,
				items: [{ itemIndex: 4, targets: ["channels"] }],
			}),
		).toEqual([{ itemIndex: 4, name: "Item 5" }]);
	});
});
