import {
	BATCH_HORIZONTAL_COVER_SUFFIX,
	listBatchCoverPathCandidates,
	listHorizontalCoverPathCandidates,
} from "@auto-upload/domain";

describe("listHorizontalCoverPathCandidates", () => {
	it("derives -4x3 suffixed candidates in the same folder", () => {
		expect(listHorizontalCoverPathCandidates("/tmp/assets/cover.png")).toEqual([
			`/tmp/assets/cover${BATCH_HORIZONTAL_COVER_SUFFIX}.png`,
			`/tmp/assets/cover${BATCH_HORIZONTAL_COVER_SUFFIX}.jpg`,
			`/tmp/assets/cover${BATCH_HORIZONTAL_COVER_SUFFIX}.jpeg`,
		]);
	});

	it("replaces any existing cover extension with the horizontal ones", () => {
		for (const candidate of listHorizontalCoverPathCandidates("/tmp/cover.jpeg")) {
			expect(candidate.endsWith(".png") || candidate.endsWith(".jpg") || candidate.endsWith(".jpeg")).toBe(
				true,
			);
		}
		expect(listHorizontalCoverPathCandidates("/tmp/cover.jpeg")[0]).toBe(
			`/tmp/cover${BATCH_HORIZONTAL_COVER_SUFFIX}.png`,
		);
	});

	it("stays consistent with the vertical candidates folder", () => {
		const vertical = listBatchCoverPathCandidates("/tmp/assets/cover.png");
		const horizontal = listHorizontalCoverPathCandidates("/tmp/assets/cover.png");
		expect(horizontal).toHaveLength(vertical.length);
	});
});
