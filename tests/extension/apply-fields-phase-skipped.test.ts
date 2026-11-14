/**
 * @jest-environment jsdom
 */
import { ApplyPhase } from "@yanxu/domain";
import type { AppliedJobPayload } from "@yanxu/domain";

const progressReports: unknown[] = [];

jest.mock("../../extension/src/content/page-fields.js", () => ({
	applyPageFields: async () => ["分区 → 科技数码"],
}));

jest.mock("../../extension/src/content/wait-for-page-fields-ready.js", () => ({
	waitForPageFieldsReady: async () => {},
}));

jest.mock("../../extension/src/content/wait-for-fields-ready-before-cover.js", () => ({
	waitForFieldsReadyBeforeCover: async () => {},
}));

jest.mock("../../extension/src/content/apply-cover-attachment.js", () => ({
	applyCoverAttachment: async () => {},
}));

jest.mock("../../extension/src/content/report-apply-progress.js", () => ({
	reportApplyProgress: (entry: unknown) => {
		progressReports.push(entry);
	},
}));

jest.mock("../../extension/src/platforms/resolve-page-fields-for-job.js", () => ({
	resolvePageFieldsForJob: () => [],
}));

import { applyFieldsPhase } from "../../extension/src/content/apply-fields-phase";
import { BatchProgressKind } from "../../extension/src/shared/batch-progress";

describe("applyFieldsPhase skipped fields", () => {
	beforeEach(() => {
		progressReports.length = 0;
	});

	it("does not throw when a field is missing and still runs cover", async () => {
		const payload: AppliedJobPayload = {
			applyPhase: ApplyPhase.FieldsOnly,
			jobJson: "{}",
			batch: { itemIndex: 0, targetPlatform: "bilibili" },
			attachments: {
				video: { kind: "skipped", reasonCode: "fields_only_phase" },
				cover: { kind: "inlineBase64", mimeType: "image/png", base64: "YQ==" },
			},
		};

		await expect(
			applyFieldsPhase(
				{
					jobVersion: 2,
					platform: "bilibili",
					targets: ["bilibili"],
					publish: { mode: "semi", submit: "manual" },
					assets: { localVideoPath: "/tmp/v.mp4" },
				},
				payload,
			),
		).resolves.toBeUndefined();

		const warnings = progressReports.filter(
			(entry) => (entry as { kind?: string }).kind === BatchProgressKind.Warning,
		);
		expect(warnings.some((entry) => String((entry as { label?: string }).label).includes("科技数码"))).toBe(
			true,
		);
	});
});
