import { Platform } from "@auto-upload/domain";
import { validatePlatformItemSelection } from "../../extension/src/shared/validate-platform-item-selection";

const outline = {
	items: [
		{ itemIndex: 0, targets: ["bilibili", "channels"] },
		{ itemIndex: 1, targets: ["douyin"] },
		{ itemIndex: 2, targets: ["channels"] },
	],
};

describe("validatePlatformItemSelection", () => {
	it("accepts undefined selection", () => {
		expect(validatePlatformItemSelection(outline, Platform.Bilibili, undefined)).toBeNull();
	});

	it("rejects empty selection", () => {
		expect(validatePlatformItemSelection(outline, Platform.Douyin, [])).toEqual({
			ok: false,
			code: "no_items_selected",
			message: "Select at least one douyin job item to upload.",
		});
	});

	it("rejects indices that do not target the platform", () => {
		expect(validatePlatformItemSelection(outline, Platform.Bilibili, [1])).toEqual({
			ok: false,
			code: "invalid_item_selection",
			message: "Job item 1 does not target bilibili.",
		});
	});

	it("accepts valid platform indices", () => {
		expect(validatePlatformItemSelection(outline, Platform.Channels, [0, 2])).toBeNull();
	});
});
