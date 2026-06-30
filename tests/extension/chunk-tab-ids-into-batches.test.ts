import { chunkTabIdsIntoBatches } from "../../extension/src/sw/chunk-tab-ids-into-batches";

describe("chunkTabIdsIntoBatches", () => {
	it("splits items into fixed-size batches", () => {
		expect(chunkTabIdsIntoBatches([1, 2, 3, 4, 5, 6, 7], 3)).toEqual([[1, 2, 3], [4, 5, 6], [7]]);
	});

	it("returns one batch when size exceeds item count", () => {
		expect(chunkTabIdsIntoBatches([10, 11], 5)).toEqual([[10, 11]]);
	});
});
