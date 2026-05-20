/**
 * @jest-environment jsdom
 */
import { ApplyPhase } from "@auto-upload/domain";
import type { AppliedJobPayload } from "@auto-upload/domain";

const applyPageFieldsCalls: unknown[] = [];
const applyCoverCalls: unknown[] = [];

jest.mock("../../extension/src/content/page-fields.js", () => ({
	applyPageFields: (...args: unknown[]) => {
		applyPageFieldsCalls.push(args);
		return [];
	},
}));

jest.mock("../../extension/src/content/apply-cover-attachment.js", () => ({
	applyCoverAttachment: async (...args: unknown[]) => {
		applyCoverCalls.push(args);
	},
}));

jest.mock("../../extension/src/content/bilibili-default-fields.js", () => ({
	resolvePageFieldsForJob: () => [],
}));

import { applyFieldsPhase } from "../../extension/src/content/apply-fields-phase";

describe("applyFieldsPhase", () => {
	beforeEach(() => {
		applyPageFieldsCalls.length = 0;
		applyCoverCalls.length = 0;
	});

	it("applies page fields before cover", async () => {
		const payload: AppliedJobPayload = {
			applyPhase: ApplyPhase.FieldsOnly,
			jobJson: "{}",
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
});
