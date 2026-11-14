import { resolveBatchItemDescription } from "@yanxu/domain";

describe("resolveBatchItemDescription", () => {
	it("uses description when non-empty", () => {
		expect(
			resolveBatchItemDescription({
				name: "title stem",
				description: "custom body",
			}),
		).toBe("custom body");
	});

	it("uses the name only when description is omitted", () => {
		expect(resolveBatchItemDescription({ name: "title stem" })).toBe("title stem");
		expect(
			resolveBatchItemDescription({
				name: "title stem",
				description: "",
			}),
		).toBe("");
		expect(
			resolveBatchItemDescription({
				name: "title stem",
				description: "   ",
			}),
		).toBe("");
	});
});
