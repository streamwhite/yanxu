import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
	DEFAULT_MAX_DIRECT_ATTACH_BYTES,
	MAX_NATIVE_INLINE_VIDEO_BYTES,
} from "@auto-upload/domain";
import { resolveVideoAttachment } from "../src/attachments/resolve-video-attachment";

describe("resolveVideoAttachment", () => {
	let tempDir = "";

	beforeEach(async () => {
		tempDir = await mkdtemp(join(tmpdir(), "auto-upload-video-"));
	});

	afterEach(async () => {
		if (tempDir) await rm(tempDir, { recursive: true, force: true });
	});

	it("returns inline payload for small files", async () => {
		const path = join(tempDir, "small.bin");
		await writeFile(path, Buffer.alloc(64));

		const result = await resolveVideoAttachment({
			absolutePath: path,
			maxDirectAttachBytes: DEFAULT_MAX_DIRECT_ATTACH_BYTES,
			transferChunkBytes: 256,
		});

		expect(result.mode).toBe("payload");
		if (result.mode !== "payload") return;
		expect(result.payload.kind).toBe("inlineBase64Chunks");
	});

	it("returns stream batch for files above inline threshold", async () => {
		const path = join(tempDir, "medium.bin");
		const size = MAX_NATIVE_INLINE_VIDEO_BYTES + 1024;
		await writeFile(path, Buffer.alloc(size));

		const result = await resolveVideoAttachment({
			absolutePath: path,
			maxDirectAttachBytes: DEFAULT_MAX_DIRECT_ATTACH_BYTES,
			transferChunkBytes: 256 * 1024,
		});

		expect(result.mode).toBe("stream");
		if (result.mode !== "stream") return;
		expect(result.streamBatch[0]?.type).toBe("videoStreamStart");
		expect(result.streamBatch.some((m) => m.type === "videoStreamChunk")).toBe(true);
	});

	it("returns manualLargeFile when over max direct attach", async () => {
		const path = join(tempDir, "huge.bin");
		await writeFile(path, Buffer.alloc(DEFAULT_MAX_DIRECT_ATTACH_BYTES + 1));

		const result = await resolveVideoAttachment({
			absolutePath: path,
			maxDirectAttachBytes: DEFAULT_MAX_DIRECT_ATTACH_BYTES,
			transferChunkBytes: 256 * 1024,
		});

		expect(result.mode).toBe("payload");
		if (result.mode !== "payload") return;
		expect(result.payload.kind).toBe("manualLargeFile");
	});
});
