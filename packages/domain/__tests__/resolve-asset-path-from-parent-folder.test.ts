import { resolveAssetPathFromParentFolder } from "@auto-upload/domain";

describe("resolveAssetPathFromParentFolder", () => {
	it("joins parent folder and file name", () => {
		expect(resolveAssetPathFromParentFolder("/tmp/uploads", "clip.mp4")).toBe(
			"/tmp/uploads/clip.mp4",
		);
	});

	it("rejects path separators in file name", () => {
		expect(() => resolveAssetPathFromParentFolder("/tmp", "a/b.mp4")).toThrow(
			"asset_file_name_must_be_basename",
		);
	});
});
