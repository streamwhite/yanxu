import { partitionLabelsMatch } from "../../extension/src/platforms/bilibili/partition-label-matches";

describe("partitionLabelsMatch", () => {
	it("matches exact and compact labels", () => {
		expect(partitionLabelsMatch("科技数码", "科技数码")).toBe(true);
		expect(partitionLabelsMatch("科技 · 数码", "科技数码")).toBe(true);
	});

	it("does not match unrelated labels", () => {
		expect(partitionLabelsMatch("知识", "科技数码")).toBe(false);
	});
});
