import type { BrowserFileSource } from "../../extension/src/shared/browser-file-source";
import {
	basenameOfPath,
	handleBrowserHostInboundMessage,
} from "../../extension/src/sw/browser-host";

const JOB_PATH = "browser://selected-job";

type FakeFile = {
	name: string;
	size: number;
	text: () => Promise<string>;
	arrayBuffer: () => Promise<ArrayBuffer>;
};

function fakeFile(name: string, content: string): FakeFile {
	const bytes = new TextEncoder().encode(content);
	return {
		name,
		size: bytes.byteLength,
		text: async () => content,
		arrayBuffer: async () => bytes.buffer.slice(0) as ArrayBuffer,
	};
}

function fakeFileHandle(name: string, content: string): FileSystemFileHandle {
	const file = fakeFile(name, content);
	return {
		kind: "file",
		name,
		getFile: async () => file,
	} as unknown as FileSystemFileHandle;
}

function fakeDirectory(files: Record<string, FileSystemFileHandle>): FileSystemDirectoryHandle {
	return {
		kind: "directory",
		name: "assets",
		getFileHandle: async (name: string) => {
			const handle = files[name];
			if (!handle) throw new Error("NotFoundError");
			return handle;
		},
	} as unknown as FileSystemDirectoryHandle;
}

function createSource(
	job: Record<string, unknown>,
	files: Record<string, FileSystemFileHandle>,
): BrowserFileSource {
	return {
		jobFile: fakeFileHandle("batch.job.json", JSON.stringify(job)),
		assetsDir: fakeDirectory(files),
	};
}

const batchJob = {
	jobVersion: 3,
	assetsParentFolder: "/tmp/yanxu-assets",
	items: [
		{
			name: "one",
			targets: ["bilibili"],
			description: "desc",
		},
	],
};

describe("browser file source host", () => {
	it("extracts basenames from POSIX and Windows paths", () => {
		expect(basenameOfPath("/tmp/assets/one.mp4")).toBe("one.mp4");
		expect(basenameOfPath("C:\\assets\\one.mp4")).toBe("one.mp4");
	});

	it("returns the batch outline without a native host", async () => {
		const batch = await handleBrowserHostInboundMessage(
			{ type: "inspectJobFromFile", jobFilePath: JOB_PATH },
			createSource(batchJob, {}),
		);

		expect(batch).toHaveLength(1);
		expect(batch[0]).toMatchObject({
			type: "jobFileOutline",
			outline: {
				items: [{ itemIndex: 0, targets: ["bilibili"], name: "one" }],
			},
		});
	});

	it("reports missing videos from the selected directory", async () => {
		const batch = await handleBrowserHostInboundMessage(
			{ type: "checkBatchJobAssetsFromFile", jobFilePath: JOB_PATH },
			createSource(batchJob, {}),
		);

		expect(batch[0]).toMatchObject({ type: "error", code: "batch_assets_missing" });
	});

	it("builds an apply payload from browser files", async () => {
		const source = createSource(batchJob, {
			"one.mp4": fakeFileHandle("one.mp4", "video-bytes"),
		});

		const batch = await handleBrowserHostInboundMessage(
			{
				type: "applyBatchItemFromFile",
				jobFilePath: JOB_PATH,
				applyPhase: "videoOnly",
				itemIndex: 0,
				platform: "bilibili",
			},
			source,
		);

		expect(batch.at(-1)).toMatchObject({
			type: "applyJobReady",
			payload: {
				applyPhase: "videoOnly",
				attachments: {
					video: { kind: "inlineBase64Chunks", mimeType: "video/mp4" },
				},
			},
		});
	});

	it("reads a CSV job file", async () => {
		const source: BrowserFileSource = {
			jobFile: fakeFileHandle("batch.csv", ["名称,目标平台", "one,bilibili"].join("\n")),
			assetsDir: fakeDirectory({}),
		};

		const batch = await handleBrowserHostInboundMessage(
			{ type: "inspectJobFromFile", jobFilePath: JOB_PATH },
			source,
		);

		expect(batch[0]).toMatchObject({
			type: "jobFileOutline",
			outline: { items: [{ itemIndex: 0, targets: ["bilibili"], name: "one" }] },
		});
	});
});
