/**
 * @jest-environment jsdom
 */
import { ApplyPhase } from "@auto-upload/domain";
import type { AppliedJobPayload } from "@auto-upload/domain";

const applyPageFieldsCalls: unknown[] = [];
const applyCoverCalls: unknown[] = [];

jest.mock("../../extension/src/content/page-fields.js", () => ({
	applyPageFields: async (...args: unknown[]) => {
		applyPageFieldsCalls.push(args);
		return [];
	},
}));

jest.mock("../../extension/src/content/wait-for-page-fields-ready.js", () => ({
	waitForPageFieldsReady: async () => {},
}));

jest.mock("../../extension/src/content/wait-for-fields-ready-before-cover.js", () => ({
	waitForFieldsReadyBeforeCover: async () => {},
}));

jest.mock("../../extension/src/content/apply-cover-attachment.js", () => ({
	applyCoverAttachment: async (...args: unknown[]) => {
		applyCoverCalls.push(args);
	},
}));

jest.mock("../../extension/src/platforms/resolve-page-fields-for-job.js", () => ({
	resolvePageFieldsForJob: () => [],
}));

import { applyFieldsPhase } from "../../extension/src/content/apply-fields-phase";

describe("applyFieldsPhase", () => {
	beforeEach(() => {
		applyPageFieldsCalls.length = 0;
		applyCoverCalls.length = 0;
	});

	it("applies page fields before cover on bilibili", async () => {
		const payload: AppliedJobPayload = {
			applyPhase: ApplyPhase.FieldsOnly,
			jobJson: "{}",
			batch: { itemIndex: 0, targetPlatform: "bilibili" },
			attachments: {
				video: { kind: "skipped", reasonCode: "fields_only_phase" },
				cover: { kind: "inlineBase64", mimeType: "image/png", base64: "YQ==" },
			},
		};

		await applyFieldsPhase(
			{
				jobVersion: 2,
				platform: "bilibili",
				targets: ["bilibili"],
				publish: { mode: "semi", submit: "manual" },
				assets: { localVideoPath: "/tmp/v.mp4" },
			},
			payload,
		);

		expect(applyPageFieldsCalls.length).toBe(1);
		expect(applyCoverCalls.length).toBe(1);
	});

	it("skips cover upload on platforms without cover UI", async () => {
		const payload: AppliedJobPayload = {
			applyPhase: ApplyPhase.FieldsOnly,
			jobJson: "{}",
			batch: { itemIndex: 1, targetPlatform: "douyin" },
			attachments: {
				video: { kind: "skipped", reasonCode: "fields_only_phase" },
				cover: { kind: "skipped", reasonCode: "no_cover_path" },
			},
		};

		await applyFieldsPhase(
			{
				jobVersion: 2,
				platform: "douyin",
				targets: ["douyin"],
				publish: { mode: "semi", submit: "manual" },
				douyin: { title: "T" },
				assets: { localVideoPath: "/tmp/v.mp4" },
			},
			payload,
		);

		expect(applyPageFieldsCalls.length).toBe(1);
		expect(applyCoverCalls.length).toBe(0);
	});
});
