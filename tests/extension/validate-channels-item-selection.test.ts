import { validateChannelsItemSelection } from "../../extension/src/shared/validate-channels-item-selection";

const outline = {
	items: [
		{ itemIndex: 0, targets: ["bilibili", "channels"] },
		{ itemIndex: 1, targets: ["douyin"] },
		{ itemIndex: 2, targets: ["channels"] },
	],
};

describe("validateChannelsItemSelection", () => {
	it("accepts undefined selection", () => {
		expect(validateChannelsItemSelection(outline, undefined)).toBeNull();
	});

	it("rejects empty selection", () => {
		expect(validateChannelsItemSelection(outline, [])).toEqual({
			ok: false,
			code: "no_items_selected",
			message: "Select at least one 视频号 job item to upload.",
		});
	});

	it("rejects indices that do not target channels", () => {
		expect(validateChannelsItemSelection(outline, [1])).toEqual({
			ok: false,
			code: "invalid_item_selection",
			message: "Job item 1 does not target 视频号.",
		});
	});

	it("accepts valid channels indices", () => {
		expect(validateChannelsItemSelection(outline, [0, 2])).toBeNull();
	});
});
