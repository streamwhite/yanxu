import { resolveBatchItemDescription } from "@auto-upload/domain";

describe("resolveBatchItemDescription", () => {
	it("uses description when non-empty", () => {
		expect(
			resolveBatchItemDescription({
				name: "title stem",
				description: "custom body",
			}),
		).toBe("custom body");
	});

	it("falls back to name when description is omitted, empty, or whitespace", () => {
		expect(resolveBatchItemDescription({ name: "title stem" })).toBe("title stem");
		expect(
			resolveBatchItemDescription({
				name: "title stem",
				description: "",
			}),
		).toBe("title stem");
		expect(
			resolveBatchItemDescription({
				name: "title stem",
				description: "   ",
			}),
		).toBe("title stem");
	});
});
