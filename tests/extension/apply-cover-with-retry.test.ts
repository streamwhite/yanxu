/**
 * @jest-environment jsdom
 */
import { Platform } from "@yanxu/domain";
import { applyCoverWithRetry } from "../../extension/src/content/apply-cover-with-retry";

const modalAttempts = { value: 0 };

jest.mock("../../extension/src/content/apply-cover-via-modal.js", () => ({
	applyCoverViaModal: async () => {
		modalAttempts.value += 1;
		return modalAttempts.value >= 2;
	},
}));

jest.mock("../../extension/src/content/dismiss-ui-before-cover.js", () => ({
	dismissUiBeforeCover: () => {},
}));

describe("applyCoverWithRetry", () => {
	it("retries until cover modal upload succeeds", async () => {
		modalAttempts.value = 0;
		const file = new File(["x"], "cover.png", { type: "image/png" });
		await expect(applyCoverWithRetry(file, Platform.Bilibili)).resolves.toBe(true);
		expect(modalAttempts.value).toBeGreaterThanOrEqual(2);
	});
});
