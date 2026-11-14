import { mkdtemp, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { PublishMode, SubmitPolicy } from "@yanxu/domain";
import { validateBatchJobAssetsFromFileJson } from "../src/router/validate-batch-job-assets-from-file.js";

describe("validateBatchJobAssetsFromFileJson", () => {
	let tempDir = "";

	beforeEach(async () => {
		tempDir = await mkdtemp(join(tmpdir(), "auto-upload-batch-assets-"));
	});

	it("passes when all required files exist", async () => {
		await writeFile(join(tempDir, "clip-a.mp4"), "video");
		await writeFile(join(tempDir, "clip-a.png"), "cover");
		await writeFile(join(tempDir, "clip-b.mp4"), "video");

		const result = await validateBatchJobAssetsFromFileJson({
			jobVersion: 3,
			assetsParentFolder: tempDir,
			publish: { mode: PublishMode.Semi, submit: SubmitPolicy.Manual },
			items: [
				{ targets: ["bilibili"], name: "clip-a" },
				{ targets: ["douyin"], name: "clip-b", includeCover: false },
			],
		});

		expect(result).toEqual({ ok: true });
	});

	it("allows a missing cover and blank description and tags", async () => {
		await writeFile(join(tempDir, "clip-a.mp4"), "video");

		const result = await validateBatchJobAssetsFromFileJson({
			jobVersion: 3,
			assetsParentFolder: tempDir,
			publish: { mode: PublishMode.Semi, submit: SubmitPolicy.Manual },
			items: [{ targets: ["bilibili"], name: "clip-a", description: "", tags: [""] }],
		});

		expect(result).toEqual({ ok: true });
	});

	it("accepts jpg cover files", async () => {
		await writeFile(join(tempDir, "clip-a.mp4"), "video");
		await writeFile(join(tempDir, "clip-a.jpg"), "cover");
		await writeFile(join(tempDir, "clip-b.mp4"), "video");

		const result = await validateBatchJobAssetsFromFileJson({
			jobVersion: 3,
			assetsParentFolder: tempDir,
			publish: { mode: PublishMode.Semi, submit: SubmitPolicy.Manual },
			items: [
				{ targets: ["bilibili"], name: "clip-a" },
				{ targets: ["douyin"], name: "clip-b", includeCover: false },
			],
		});

		expect(result).toEqual({ ok: true });
	});

	it("reports explicitly required covers and missing videos before upload", async () => {
		await writeFile(join(tempDir, "clip-a.mp4"), "video");

		const result = await validateBatchJobAssetsFromFileJson({
			jobVersion: 3,
			assetsParentFolder: tempDir,
			publish: { mode: PublishMode.Semi, submit: SubmitPolicy.Manual },
			items: [
				{ targets: ["bilibili"], name: "clip-a", includeCover: true },
				{ targets: ["douyin"], name: "clip-b" },
			],
		});

		expect(result.ok).toBe(false);
		if (result.ok) return;
		expect(result.code).toBe("batch_assets_missing");
		expect(result.message).toContain("missing cover file");
		expect(result.message).toContain("clip-a.png");
		expect(result.message).toContain("missing video file");
		expect(result.message).toContain("clip-b.mp4");
	});

	it("requires videos but allows both covers to be absent by default", async () => {
		const result = await validateBatchJobAssetsFromFileJson({
			jobVersion: 3,
			assetsParentFolder: tempDir,
			publish: { mode: PublishMode.Semi, submit: SubmitPolicy.Manual },
			items: [
				{ targets: ["bilibili", "douyin"], name: "clip-a" },
				{ targets: ["douyin", "channels"], name: "clip-b" },
			],
		});

		expect(result.ok).toBe(false);
		if (result.ok) return;
		expect(result.message).toContain("clip-a.mp4");
		expect(result.message).toContain("clip-b.mp4");
		expect(result.message).not.toContain("cover file");
	});
});
