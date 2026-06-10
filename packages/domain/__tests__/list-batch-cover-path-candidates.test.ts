import { listBatchCoverPathCandidates } from "../src/assets/list-batch-cover-path-candidates";

describe("listBatchCoverPathCandidates", () => {
	it("lists png, jpg, and jpeg variants for the same stem", () => {
		expect(listBatchCoverPathCandidates("/tmp/uploads/clip-a.png")).toEqual([
			"/tmp/uploads/clip-a.png",
			"/tmp/uploads/clip-a.jpg",
			"/tmp/uploads/clip-a.jpeg",
		]);
	});

	it("works when the hint path already uses jpg", () => {
		expect(listBatchCoverPathCandidates("C:\\media\\clip-b.jpg")).toEqual([
			"C:\\media\\clip-b.png",
			"C:\\media\\clip-b.jpg",
			"C:\\media\\clip-b.jpeg",
		]);
	});
});
