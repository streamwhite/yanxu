import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DEFAULT_MAX_COVER_INLINE_BYTES, MAX_NATIVE_INLINE_COVER_BYTES } from "@auto-upload/domain";
import { resolveCoverAttachment } from "../src/attachments/resolve-cover-attachment";

describe("resolveCoverAttachment", () => {
	let tempDir = "";

	beforeEach(async () => {
		tempDir = await mkdtemp(join(tmpdir(), "auto-upload-cover-"));
	});

	afterEach(async () => {
		if (tempDir) await rm(tempDir, { recursive: true, force: true });
	});

	it("returns stream batch for covers above native inline threshold", async () => {
		const path = join(tempDir, "cover.bin");
		const size = MAX_NATIVE_INLINE_COVER_BYTES + 512;
		await writeFile(path, Buffer.alloc(size));

		const result = await resolveCoverAttachment({
			absolutePath: path,
			maxCoverInlineBytes: DEFAULT_MAX_COVER_INLINE_BYTES,
			transferChunkBytes: 256 * 1024,
		});

		expect(result.mode).toBe("stream");
		if (result.mode !== "stream") return;
		expect(result.streamBatch[0]?.type).toBe("coverStreamStart");
	});
});
